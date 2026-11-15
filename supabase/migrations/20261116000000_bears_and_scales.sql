-- =============================================================================
-- Memory Archaeologist — bear scales, cues & character customisation
-- -----------------------------------------------------------------------------
--  * vividness (1 foggy .. 5 crystal clear) and feeling (1 painful .. 5 warm)
--    recorded on every layer, so you can watch them change over time
--  * create_memory / update_recent_memory accept retrieval cues (tags) again
--  * complete_dive(): saves a revisit with vividness + feeling
--  * profiles: per-user character (bear) choice
-- Additive: safe to run after the two earlier migrations.
-- =============================================================================

alter table public.memories
  add column if not exists vividness smallint check (vividness between 1 and 5),
  add column if not exists feeling   smallint check (feeling between 1 and 5);

alter table public.memory_layers
  add column if not exists vividness smallint check (vividness between 1 and 5),
  add column if not exists feeling   smallint check (feeling between 1 and 5);

-- -----------------------------------------------------------------------------
-- profiles (character customisation)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id      uuid primary key default auth.uid()
                 references auth.users (id) on delete cascade,
  bear_variant text not null default 'honey'
                 check (bear_variant in ('honey', 'cocoa', 'chocolate', 'panda', 'polar')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop policy if exists "profiles: select own" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select to authenticated using (user_id = auth.uid());
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- helper: replace a memory's cues with a JSON array of {category, label}
-- -----------------------------------------------------------------------------
create or replace function public.set_memory_tags(p_memory_id uuid, p_tags jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tag    jsonb;
  v_tag_id uuid;
begin
  delete from memory_tags where memory_id = p_memory_id;

  for v_tag in select value from jsonb_array_elements(coalesce(p_tags, '[]'::jsonb))
  loop
    insert into tags (category, label)
    values ((v_tag->>'category')::tag_category, trim(v_tag->>'label'))
    on conflict (user_id, category, lower(label)) do update set label = tags.label
    returning id into v_tag_id;

    insert into memory_tags (memory_id, tag_id)
    values (p_memory_id, v_tag_id)
    on conflict do nothing;
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- create_memory (replaces the 6-arg version)
-- -----------------------------------------------------------------------------
drop function if exists public.create_memory(text, date, text, text, text, smallint);

create or replace function public.create_memory(
  p_title       text,
  p_occurred_on date,
  p_era_label   text,
  p_context_cue text,
  p_content     text,
  p_vividness   smallint,
  p_feeling     smallint,
  p_tags        jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_memory_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  insert into memories (title, occurred_on, era_label, context_cue, vividness, feeling)
  values (p_title, p_occurred_on, nullif(p_era_label, ''), nullif(p_context_cue, ''), p_vividness, p_feeling)
  returning id into v_memory_id;

  insert into memory_layers (memory_id, layer_type, content, vividness, feeling)
  values (v_memory_id, 'core_event', p_content, p_vividness, p_feeling);

  perform set_memory_tags(v_memory_id, p_tags);

  return v_memory_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- update_recent_memory (replaces the 7-arg version)
-- -----------------------------------------------------------------------------
drop function if exists public.update_recent_memory(uuid, text, date, text, text, text, smallint);

create or replace function public.update_recent_memory(
  p_memory_id   uuid,
  p_title       text,
  p_occurred_on date,
  p_era_label   text,
  p_context_cue text,
  p_content     text,
  p_vividness   smallint,
  p_feeling     smallint,
  p_tags        jsonb default '[]'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_created timestamptz;
begin
  select created_at into v_created from memories where id = p_memory_id for update;

  if not found then
    raise exception 'memory not found' using errcode = 'P0002';
  end if;

  if v_created < now() - interval '24 hours' then
    raise exception 'the 24 hour edit window has closed' using errcode = '22023';
  end if;

  update memories
     set title       = p_title,
         occurred_on = p_occurred_on,
         era_label   = nullif(p_era_label, ''),
         context_cue = nullif(p_context_cue, ''),
         vividness   = p_vividness,
         feeling     = p_feeling
   where id = p_memory_id;

  update memory_layers
     set content   = p_content,
         vividness = p_vividness,
         feeling   = p_feeling
   where memory_id = p_memory_id
     and layer_type = 'core_event';

  perform set_memory_tags(p_memory_id, p_tags);
end;
$$;

-- -----------------------------------------------------------------------------
-- complete_dive: save a revisit with vividness + feeling
-- -----------------------------------------------------------------------------
create or replace function public.complete_dive(
  p_session_id uuid,
  p_reflection text,
  p_vividness  smallint,
  p_feeling    smallint
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

  insert into memory_layers (memory_id, layer_type, content, vividness, feeling, excavation_session_id)
  values (v_session.memory_id, 'reframe', p_reflection, p_vividness, p_feeling, p_session_id)
  returning id into v_layer_id;

  update excavation_sessions
     set status = 'completed', ended_at = now()
   where id = p_session_id;

  update memories
     set vividness         = p_vividness,
         feeling           = p_feeling,
         excavation_count  = excavation_count + 1,
         last_excavated_at = now()
   where id = v_session.memory_id;

  return v_layer_id;
end;
$$;

grant execute on function public.set_memory_tags(uuid, jsonb) to authenticated;
grant execute on function public.create_memory(text, date, text, text, text, smallint, smallint, jsonb) to authenticated;
grant execute on function public.update_recent_memory(uuid, text, date, text, text, text, smallint, smallint, jsonb) to authenticated;
grant execute on function public.complete_dive(uuid, text, smallint, smallint) to authenticated;
grant select, insert, update on public.profiles to authenticated;
