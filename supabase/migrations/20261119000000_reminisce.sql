-- =============================================================================
-- "Let's reminisce about..."
-- -----------------------------------------------------------------------------
-- The home page occasionally suggests an old memory to revisit. The schedule
-- (random quiet stretches, then a few hours of shining) is derived in the app
-- from one timestamp: when the user last took a suggestion.
-- =============================================================================

alter table public.profiles
  add column if not exists reminisce_anchor_at timestamptz;
