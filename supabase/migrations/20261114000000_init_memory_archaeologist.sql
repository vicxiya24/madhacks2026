-- =============================================================================
-- Memory Archaeologist — initial schema
-- -----------------------------------------------------------------------------
-- Model:
--   memories            : one "dig site" per remembered life event
--   memory_layers       : append-only sedimentary strata (versions) of a memory
--   tags / memory_tags  : sensory + contextual retrieval cues ("artifacts")
--   excavation_sessions : time-boxed reconsolidation windows
--
-- Every row is owned by auth.uid(); RLS is enabled on every table.
-- Layers are append-only: there is no UPDATE policy on memory_layers, so the
-- full interpretive history is preserved for delta tracking.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.layer_type as enum (
  'core_event',      -- the original sensory recollection
  'retelling',       -- how the story has been told since
  'current_weight',  -- how it feels to hold it today
  'reframe'          -- a perspective layered on during an excavation
);

create type public.tag_category as enum (
  'smell', 'sound', 'taste', 'touch', 'sight',
  'location', 'person', 'emotion', 'object'
);

create type public.session_status as enum (
  'active', 'completed', 'expired', 'abandoned'
);

-- -----------------------------------------------------------------------------
-- Shared trigger: updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- memories
-- -----------------------------------------------------------------------------
create table public.memories (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid()
                       references auth.users (id) on delete cascade,
  title              text not null check (char_length(title) between 1 and 160),
  -- approximate date of the original event; drives stratigraphic depth
  occurred_on        date,
  -- free-text era for fuzzy memories, e.g. "summer before 3rd grade"
  era_label          text check (char_length(era_label) <= 120),
  -- current emotional intensity, 1 (faint) .. 10 (overwhelming)
  emotional_weight   smallint not null default 5 check (emotional_weight between 1 and 10),
  -- current emotional valence, -5 (painful) .. +5 (warm)
  emotional_valence  smallint not null default 0 check (emotional_valence between -5 and 5),
  excavation_count   integer not null default 0,
  last_excavated_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index memories_user_depth_idx
  on public.memories (user_id, occurred_on desc nulls last, created_at desc);

create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- excavation_sessions (declared before layers so layers can reference it)
-- -----------------------------------------------------------------------------
create table public.excavation_sessions (
  id                      uuid primary key default gen_random_uuid(),
  memory_id               uuid not null references public.memories (id) on delete cascade,
  user_id                 uuid not null default auth.uid()
                            references auth.users (id) on delete cascade,
  status                  public.session_status not null default 'active',
  duration_seconds        integer not null default 600
                            check (duration_seconds between 60 and 3600),
  started_at              timestamptz not null default now(),
  expires_at              timestamptz not null,
  ended_at                timestamptz,
  -- the AI "prediction error" offered to destabilise the trace
  prediction_error_prompt text,
  created_at              timestamptz not null default now()
);

create index excavation_sessions_memory_idx
  on public.excavation_sessions (memory_id, started_at desc);

-- Only one live window per memory at a time.
create unique index excavation_sessions_one_active_idx
  on public.excavation_sessions (memory_id)
  where status = 'active';

-- -----------------------------------------------------------------------------
-- memory_layers (append-only version history)
-- -----------------------------------------------------------------------------
create table public.memory_layers (
  id                     uuid primary key default gen_random_uuid(),
  memory_id              uuid not null references public.memories (id) on delete cascade,
  user_id                uuid not null default auth.uid()
                           references auth.users (id) on delete cascade,
  layer_type             public.layer_type not null,
  content                text not null check (char_length(content) between 1 and 20000),
  -- snapshot of emotional state at the time this layer was deposited
  emotional_weight       smallint check (emotional_weight between 1 and 10),
  emotional_valence      smallint check (emotional_valence between -5 and 5),
  -- monotonically increasing per memory; assigned by trigger
  version                integer not null,
  excavation_session_id  uuid references public.excavation_sessions (id) on delete set null,
  created_at             timestamptz not null default now(),
  unique (memory_id, version)
);

create index memory_layers_memory_idx
  on public.memory_layers (memory_id, version);

create or replace function public.assign_layer_version()
returns trigger
language plpgsql
as $$
begin
  -- serialise concurrent inserts for the same memory
  perform 1 from public.memories where id = new.memory_id for update;
  select coalesce(max(version), 0) + 1
    into new.version
    from public.memory_layers
   where memory_id = new.memory_id;
  return new;
end;
$$;

create trigger memory_layers_assign_version
  before insert on public.memory_layers
  for each row execute function public.assign_layer_version();

-- -----------------------------------------------------------------------------
-- tags + memory_tags
-- -----------------------------------------------------------------------------
create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  category    public.tag_category not null,
  label       text not null check (char_length(label) between 1 and 60),
  created_at  timestamptz not null default now()
);

create unique index tags_user_category_label_idx
  on public.tags (user_id, category, lower(label));

create table public.memory_tags (
  memory_id   uuid not null references public.memories (id) on delete cascade,
  tag_id      uuid not null references public.tags (id) on delete cascade,
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (memory_id, tag_id)
);

create index memory_tags_tag_idx on public.memory_tags (tag_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.memories            enable row level security;
alter table public.memory_layers       enable row level security;
alter table public.excavation_sessions enable row level security;
alter table public.tags                enable row level security;
alter table public.memory_tags         enable row level security;

-- Helper: does the current user own this memory? (security definer avoids
-- recursive RLS evaluation and keeps policies short)
create or replace function public.owns_memory(p_memory_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memories
     where id = p_memory_id and user_id = auth.uid()
  );
$$;

-- memories ------------------------------------------------------------------
create policy "memories: select own" on public.memories
  for select to authenticated using (user_id = auth.uid());
create policy "memories: insert own" on public.memories
  for insert to authenticated with check (user_id = auth.uid());
create policy "memories: update own" on public.memories
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "memories: delete own" on public.memories
  for delete to authenticated using (user_id = auth.uid());

-- memory_layers (append-only: no update policy) ------------------------------
create policy "layers: select own" on public.memory_layers
  for select to authenticated using (user_id = auth.uid());
create policy "layers: insert into own memory" on public.memory_layers
  for insert to authenticated
  with check (user_id = auth.uid() and public.owns_memory(memory_id));
create policy "layers: delete own" on public.memory_layers
  for delete to authenticated using (user_id = auth.uid());

-- excavation_sessions --------------------------------------------------------
create policy "sessions: select own" on public.excavation_sessions
  for select to authenticated using (user_id = auth.uid());
create policy "sessions: insert into own memory" on public.excavation_sessions
  for insert to authenticated
  with check (user_id = auth.uid() and public.owns_memory(memory_id));
create policy "sessions: update own" on public.excavation_sessions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- tags -----------------------------------------------------------------------
create policy "tags: select own" on public.tags
  for select to authenticated using (user_id = auth.uid());
create policy "tags: insert own" on public.tags
  for insert to authenticated with check (user_id = auth.uid());
create policy "tags: update own" on public.tags
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tags: delete own" on public.tags
  for delete to authenticated using (user_id = auth.uid());

-- memory_tags ------------------------------------------------------------------
create policy "memory_tags: select own" on public.memory_tags
  for select to authenticated using (user_id = auth.uid());
create policy "memory_tags: insert own" on public.memory_tags
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.owns_memory(memory_id)
    and exists (select 1 from public.tags t where t.id = tag_id and t.user_id = auth.uid())
  );
create policy "memory_tags: delete own" on public.memory_tags
  for delete to authenticated using (user_id = auth.uid());

-- =============================================================================
-- RPCs (security invoker: RLS still applies; they just make writes atomic)
-- =============================================================================

-- Create a memory + its initial strata + tags in a single transaction.
-- p_layers: [{ "layer_type": "core_event", "content": "..." }, ...]
-- p_tags:   [{ "category": "smell", "label": "cut grass" }, ...]
create or replace function public.create_memory(
  p_title             text,
  p_occurred_on       date,
  p_era_label         text,
  p_emotional_weight  smallint,
  p_emotional_valence smallint,
  p_layers            jsonb,
  p_tags              jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_memory_id uuid;
  v_layer     jsonb;
  v_tag       jsonb;
  v_tag_id    uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if jsonb_typeof(p_layers) <> 'array' or jsonb_array_length(p_layers) = 0 then
    raise exception 'at least one layer is required' using errcode = '22023';
  end if;

  insert into memories (title, occurred_on, era_label, emotional_weight, emotional_valence)
  values (p_title, p_occurred_on, nullif(p_era_label, ''), p_emotional_weight, p_emotional_valence)
  returning id into v_memory_id;

  -- insert in a stable stratigraphic order: core → retelling → current
  for v_layer in
    select value from jsonb_array_elements(p_layers)
    order by case value->>'layer_type'
               when 'core_event' then 1
               when 'retelling' then 2
               when 'current_weight' then 3
               else 4 end
  loop
    insert into memory_layers (memory_id, layer_type, content, emotional_weight, emotional_valence)
    values (
      v_memory_id,
      (v_layer->>'layer_type')::layer_type,
      v_layer->>'content',
      p_emotional_weight,
      p_emotional_valence
    );
  end loop;

  for v_tag in select value from jsonb_array_elements(coalesce(p_tags, '[]'::jsonb))
  loop
    insert into tags (category, label)
    values ((v_tag->>'category')::tag_category, trim(v_tag->>'label'))
    on conflict (user_id, category, lower(label)) do update set label = tags.label
    returning id into v_tag_id;

    insert into memory_tags (memory_id, tag_id)
    values (v_memory_id, v_tag_id)
    on conflict do nothing;
  end loop;

  return v_memory_id;
end;
$$;

-- Open a reconsolidation window. Any stale 'active' session for this memory
-- is expired first so the one-active-session index never blocks the user.
create or replace function public.start_excavation(
  p_memory_id        uuid,
  p_duration_seconds integer,
  p_prompt           text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  update excavation_sessions
     set status = case when expires_at < now() then 'expired'::session_status
                       else 'abandoned'::session_status end,
         ended_at = now()
   where memory_id = p_memory_id and status = 'active';

  insert into excavation_sessions (memory_id, duration_seconds, expires_at, prediction_error_prompt)
  values (p_memory_id, p_duration_seconds, now() + make_interval(secs => p_duration_seconds), p_prompt)
  returning id into v_session_id;

  return v_session_id;
end;
$$;

-- Close a window by depositing a reframe layer. Rejected once the labile
-- window (plus a 2-minute grace for slow typists / network) has closed.
create or replace function public.complete_excavation(
  p_session_id        uuid,
  p_reflection        text,
  p_emotional_weight  smallint,
  p_emotional_valence smallint
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session  excavation_sessions%rowtype;
  v_layer_id uuid;
begin
  select * into v_session
    from excavation_sessions
   where id = p_session_id
   for update;

  if not found then
    raise exception 'session not found' using errcode = 'P0002';
  end if;

  if v_session.status <> 'active' then
    raise exception 'session is no longer active' using errcode = '22023';
  end if;

  -- (No status update here: the exception would roll it back. Stale 'active'
  -- rows are swept by start_excavation and ignored by the app once expired.)
  if now() > v_session.expires_at + interval '2 minutes' then
    raise exception 'the labile window has closed' using errcode = '22023';
  end if;

  insert into memory_layers (
    memory_id, layer_type, content, emotional_weight, emotional_valence, excavation_session_id
  )
  values (
    v_session.memory_id, 'reframe', p_reflection, p_emotional_weight, p_emotional_valence, p_session_id
  )
  returning id into v_layer_id;

  update excavation_sessions
     set status = 'completed', ended_at = now()
   where id = p_session_id;

  update memories
     set emotional_weight  = p_emotional_weight,
         emotional_valence = p_emotional_valence,
         excavation_count  = excavation_count + 1,
         last_excavated_at = now()
   where id = v_session.memory_id;

  return v_layer_id;
end;
$$;

grant execute on function public.create_memory(text, date, text, smallint, smallint, jsonb, jsonb) to authenticated;
grant execute on function public.start_excavation(uuid, integer, text) to authenticated;
grant execute on function public.complete_excavation(uuid, text, smallint, smallint) to authenticated;
revoke execute on function public.owns_memory(uuid) from anon;
