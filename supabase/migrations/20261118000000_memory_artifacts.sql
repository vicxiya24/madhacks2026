-- =============================================================================
-- "Play it out": memory artifact cards
-- -----------------------------------------------------------------------------
-- Each press of "Play it out" designs an illustrated artifact card for a memory
-- (setting, mood, props, what each character is doing). The card is stored as
-- JSON and drawn by the app, so there are no image files to store.
-- `source` says who designed it: a free Gemini text model, or the offline fallback.
-- =============================================================================

create table public.memory_artifacts (
  id          uuid primary key default gen_random_uuid(),
  memory_id   uuid not null references public.memories (id) on delete cascade,
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  artifact    jsonb not null check (jsonb_typeof(artifact) = 'object' and pg_column_size(artifact) < 16384),
  source      text not null check (source in ('gemini', 'local')),
  created_at  timestamptz not null default now()
);

create index memory_artifacts_memory_idx on public.memory_artifacts (memory_id, created_at desc);

alter table public.memory_artifacts enable row level security;

create policy "artifacts: select own" on public.memory_artifacts
  for select to authenticated using (user_id = auth.uid());
create policy "artifacts: insert own" on public.memory_artifacts
  for insert to authenticated
  with check (user_id = auth.uid() and public.owns_memory(memory_id));
create policy "artifacts: delete own" on public.memory_artifacts
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, delete on public.memory_artifacts to authenticated;
