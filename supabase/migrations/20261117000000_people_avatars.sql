-- =============================================================================
-- People in my life
-- -----------------------------------------------------------------------------
-- People are the `person` tags you already attach to memories. This gives each
-- one an animal avatar (bunny, fox, ...) that you can change on the People page.
-- The list of animals lives in the app (src/lib/people.ts), so new ones can be
-- added without a migration.
-- =============================================================================

alter table public.tags
  add column if not exists avatar text
    check (avatar is null or avatar ~ '^[a-z]{1,32}$');

-- -----------------------------------------------------------------------------
-- set_memory_tags: same as before, but a new person can arrive with an avatar
-- (the random one the entry form showed). Existing people keep theirs.
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
    insert into tags (category, label, avatar)
    values (
      (v_tag->>'category')::tag_category,
      trim(v_tag->>'label'),
      nullif(v_tag->>'avatar', '')
    )
    on conflict (user_id, category, lower(label))
      do update set avatar = coalesce(tags.avatar, excluded.avatar)
    returning id into v_tag_id;

    insert into memory_tags (memory_id, tag_id)
    values (p_memory_id, v_tag_id)
    on conflict do nothing;
  end loop;
end;
$$;

grant execute on function public.set_memory_tags(uuid, jsonb) to authenticated;
