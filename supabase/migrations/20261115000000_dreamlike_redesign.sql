-- =============================================================================
-- Memory Archaeologist — redesign
-- -----------------------------------------------------------------------------
--  * memories.context_cue : a clue the user leaves for their future self so they
--    can try to recall the memory without re-reading it
--  * create_memory()      : simplified intake (one "rant" layer + clue)
--  * update_recent_memory : entries can be edited for 24h after they're written
--  * complete_excavation  : no more countdown; a session stays open until saved
-- Safe to run on top of 20261114000000_init_memory_archaeologist.sql.
-- =============================================================================

alter table public.memories
  add column if not exists context_cue text
    check (context_cue is null or char_length(context_cue) <= 500);

-- -----------------------------------------------------------------------------
-- 24-hour edit window for the original entry
-- -----------------------------------------------------------------------------
drop policy if exists "layers: edit core within 24h" on public.memory_layers;
create policy "layers: edit core within 24h" on public.memory_layers
  for update to authenticated
  using (
    user_id = auth.uid()
    and layer_type = 'core_event'
    and created_at > now() - interval '24 hours'
  )
  with check (user_id = auth.uid() and layer_type = 'core_event');

-- -----------------------------------------------------------------------------
-- create_memory: replaces the multi-layer version
-- -----------------------------------------------------------------------------
drop function if exists public.create_memory(text, date, text, smallint, smallint, jsonb, jsonb);

create or replace function public.create_memory(
  p_title            text,
  p_occurred_on      date,
  p_era_label        text,
  p_context_cue      text,
  p_content          text,
  p_emotional_weight smallint
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

  insert into memories (title, occurred_on, era_label, context_cue, emotional_weight)
  values (p_title, p_occurred_on, nullif(p_era_label, ''), nullif(p_context_cue, ''), p_emotional_weight)
  returning id into v_memory_id;

  insert into memory_layers (memory_id, layer_type, content, emotional_weight, emotional_valence)
  values (v_memory_id, 'core_event', p_content, p_emotional_weight, 0);

  return v_memory_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- update_recent_memory: edit an entry within 24h of writing it
-- -----------------------------------------------------------------------------
create or replace function public.update_recent_memory(
  p_memory_id        uuid,
  p_title            text,
  p_occurred_on      date,
  p_era_label        text,
  p_context_cue      text,
  p_content          text,
  p_emotional_weight smallint
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
     set title            = p_title,
         occurred_on      = p_occurred_on,
         era_label        = nullif(p_era_label, ''),
         context_cue      = nullif(p_context_cue, ''),
         emotional_weight = p_emotional_weight
   where id = p_memory_id;

  update memory_layers
     set content          = p_content,
         emotional_weight = p_emotional_weight
   where memory_id = p_memory_id
     and layer_type = 'core_event';
end;
$$;

-- -----------------------------------------------------------------------------
-- complete_excavation: no time limit any more
-- -----------------------------------------------------------------------------
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
         excavation_count  = excavation_count + 1,
         last_excavated_at = now()
   where id = v_session.memory_id;

  return v_layer_id;
end;
$$;

grant execute on function public.create_memory(text, date, text, text, text, smallint) to authenticated;
grant execute on function public.update_recent_memory(uuid, text, date, text, text, text, smallint) to authenticated;
