# Archaive

Treat memory like a dig site. Write a memory down, let it settle into the strata as a fossil,
**dive back in** later and retell it from memory using only a clue you left yourself, then
compare how your story has shifted.

> Reflective journaling tool, not therapy or medical care.

## Stack

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind v4 + shadcn/ui primitives · Supabase (Postgres, Auth, RLS) · Google Gemini (optional, "Play it out" artifact cards) · OpenAI (optional, nudge prompts, with template fallback)

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in Supabase URL + anon key (OpenAI and Gemini keys optional)
```

**Database**: run the migrations in order (Supabase dashboard → SQL Editor, or `supabase db push`):

1. `supabase/migrations/20261114000000_init_memory_archaeologist.sql`
2. `supabase/migrations/20261115000000_dreamlike_redesign.sql`
3. `supabase/migrations/20261116000000_bears_and_scales.sql`
4. `supabase/migrations/20261117000000_people_avatars.sql`
5. `supabase/migrations/20261118000000_memory_artifacts.sql`

**Auth**: Email/password is enabled by default. For quick hackathon demos, you can turn off
*Confirm email* under Authentication → Providers → Email. Otherwise, add
`http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.

```bash
npm run dev                     # http://localhost:3000
```

**Environment variables** (see `.env.example`):

| Variable | Required | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | database and auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | database and auth |
| `OPENAI_API_KEY` | no | AI nudge prompts; falls back to templates |
| `GEMINI_API_KEY` | no | AI-directed "Play it out" cards; falls back to offline drawing |
| `GEMINI_TEXT_MODEL` | no | overrides the Gemini model |

## How it works

| Feature | Where |
| --- | --- |
| Home: date, dreaming bear, "New entry" / "Edit entry" (24h) bubbles, "Dive" | `src/app/page.tsx`, `src/components/dream/` |
| New entry: "Rant to me about this event", vividness + feeling bear scales, people/places/objects/senses, a clue for future you | `src/components/memory/memory-entry-form.tsx` → `create_memory()` |
| People in my life: add people, give each an animal avatar, search and tag them in entries | `src/app/people`, `src/components/people/`, `src/lib/people.ts` |
| "Play it out": Gemini art-directs an animated artifact card starring your bear and your people (offline fallback without a key) | `src/components/animation/`, `src/app/actions/artifact.ts`, `src/lib/animation/` |
| Character customisation (5 bears) used on home + rating scales | `src/app/settings`, `src/lib/bears.ts`, `src/components/bear/` |
| Dive / surface transitions between home and the dig site | `src/components/dream/scene-transitions.tsx` |
| Delete an entry | `src/components/memory/delete-memory-button.tsx` |
| Edit entry within 24h of writing | `src/app/dig/[id]/edit`, `update_recent_memory()` RPC + RLS policy |
| Dig site: strata by time distance (exact date, or a rough "a few weeks ago" style choice), each memory a fossil | `src/components/dig/fossil-strata.tsx`, `public/fossils/` |
| Dive back in: recall from the clue only, with the earlier entry hidden; the session stays open until you save | `src/app/dig/[id]/excavate/[sessionId]`, `src/components/excavation/` |
| Nudge prompt (from title + clue only, so it can't leak the entry) | `src/lib/ai/prediction-error.ts` |
| How it's changed: then vs now + vividness and feeling shifts | `src/components/delta/version-delta.tsx` |
| "How settled is it?" meter (settled / shifting / conflicted) with explainer | `src/lib/memory/consolidation.ts` |

## Folder structure

```
supabase/
  migrations/                        five migrations, run in order (see Getting started)
public/
  fossils/                           fossil images for the dig site
scripts/
  try-artifact.mts                   local script for trying artifact generation
src/
  middleware.ts                      session refresh + /dig route guard
  app/
    page.tsx                         home (dreaming bear, entry bubbles)
    login/                           sign-in / sign-up
    auth/callback/route.ts           email-confirmation code exchange
    actions/                         server actions: auth, memories, excavation, people, profile, artifact
    dig/
      layout.tsx                     authenticated shell
      page.tsx                       stratigraphic timeline
      new/page.tsx                   memory intake
      [id]/page.tsx                  memory detail + start excavation
      [id]/edit/page.tsx             edit an entry within 24h
      [id]/excavate/[sessionId]/     live excavation session
      [id]/delta/                    version delta visualizer
    people/                          people in my life
    settings/                        bear character settings
  components/
    animation/                       "Play it out" animator and artifact cards
    bear/                            bear SVG, scales, character picker
    delta/                           version delta
    dig/                             fossil strata and fossils
    dream/                           night sky, waves, thought bubbles, scene transitions
    excavation/                      session view and start-dive button
    face/                            bear face parts
    memory/                          entry form, cue picker, layer stack, consolidation meter
    people/                          people manager, picker, animal avatars
    ui/                              shadcn-style primitives (button, card, input, ...)
  hooks/                             use-preserving-action
  lib/
    supabase/                        server / browser / middleware clients
    memory/                          constants, zod schemas, queries, consolidation, delta
    ai/                              prediction-error engine (OpenAI, with templates)
    animation/                       artifact generation (Gemini or offline), props, casting
    bears.ts, expressions.ts         bear characters and expressions
    people.ts, profile.ts            people and profile helpers
  types/                             database.ts (Supabase types), memory.ts (domain)
```

## Data model

- `memories`: one per dig site. Holds the title, date, era label, the **clue** (`context_cue`, up to 500 characters), current emotional weight, and excavation counters.
- `memory_layers`: strata with an auto-incrementing per-memory `version`. Layer types are `core_event` (the original entry), `retelling`, `current_weight`, and `reframe`. Layers are append-only, with one exception: the `core_event` can be edited for 24 hours after it's written.
- `excavation_sessions`: one recall attempt per session. There's no countdown timer; a session stays open until you save it. At most one active session per memory. Statuses are `active`, `completed`, `expired`, and `abandoned`.
- `tags` / `memory_tags`: per-user retrieval cues, deduplicated case-insensitively.
- People, bear and scale settings, and stored artifact cards each have their own tables, added in migrations 3 to 5.

Every table has RLS scoped to `auth.uid()`. Multi-step writes go through `security invoker` RPCs, so they're atomic and still subject to RLS.
