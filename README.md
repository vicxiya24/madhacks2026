# Memory Archaeologist

Treat memory like a dig site. Write a memory down, let it settle into the strata as a fossil,
**dive back in** later and retell it from memory using only a clue you left yourself, then
compare how your story has shifted.

> Reflective journaling tool, not therapy or medical care.

## Stack

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind v4 + shadcn/ui primitives ·
Supabase (Postgres, Auth, RLS) · OpenAI (optional, with template fallback)

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in Supabase URL + anon key (OpenAI key optional)
```

**Database**: run the migrations in order (Supabase dashboard → SQL Editor, or `supabase db push`):

1. `supabase/migrations/20261114000000_init_memory_archaeologist.sql`
2. `supabase/migrations/20261115000000_dreamlike_redesign.sql`
3. `supabase/migrations/20261116000000_bears_and_scales.sql`
4. `supabase/migrations/20261117000000_people_avatars.sql`

**Auth**: Email/password is enabled by default. For quick hackathon demos, you can turn off
*Confirm email* under Authentication → Providers → Email. Otherwise, add
`http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.

```bash
npm run dev                     # http://localhost:3000
```

## How it works

| Feature | Where |
| --- | --- |
| Home: date, dreaming bear, "New entry" / "Edit entry" (24h) bubbles, "Dive" | `src/app/page.tsx`, `src/components/dream/` |
| New entry: "Rant to me about this event", vividness + feeling bear scales, people/places/objects/senses, a clue for future you | `src/components/memory/memory-entry-form.tsx` → `create_memory()` |
| People in my life: add people, give each an animal avatar, search and tag them in entries | `src/app/people`, `src/components/people/`, `src/lib/people.ts` |
| Character customisation (5 bears) used on home + rating scales | `src/app/settings`, `src/lib/bears.ts`, `src/components/bear/` |
| Dive / surface transitions between home and the dig site | `src/components/dream/scene-transitions.tsx` |
| Delete an entry | `src/components/memory/delete-memory-button.tsx` |
| Edit entry within 24h of writing | `src/app/dig/[id]/edit`, `update_recent_memory()` RPC + RLS policy |
| Dig site: strata by time distance (exact date, or a rough "a few weeks ago" style choice), each memory a fossil | `src/components/dig/fossil-strata.tsx`, `public/fossils/` |
| Dive back in: recall from the clue only, with the earlier entry hidden | `src/app/dig/[id]/excavate/[sessionId]`, `src/components/excavation/` |
| Nudge prompt (from title + clue only, so it can't leak the entry) | `src/lib/ai/prediction-error.ts` |
| How it's changed: then vs now + vividness and feeling shifts | `src/components/delta/version-delta.tsx` |
| "How settled is it?" meter (settled / shifting / conflicted) with explainer | `src/lib/memory/consolidation.ts` |

## Folder structure

```
supabase/
  migrations/20261114000000_init_memory_archaeologist.sql   tables, enums, RLS, RPCs
src/
  middleware.ts                      session refresh + /dig route guard
  app/
    page.tsx                         landing
    login/                           sign-in / sign-up
    auth/callback/route.ts           email-confirmation code exchange
    actions/                         server actions: auth, memories, excavation
    dig/
      layout.tsx                     authenticated shell
      page.tsx                       stratigraphic timeline
      new/page.tsx                   memory intake
      [id]/page.tsx                  memory detail + start excavation
      [id]/excavate/[sessionId]/     live excavation session
      [id]/delta/                    version delta visualizer
  components/
    ui/                              shadcn-style primitives (button, card, input, ...)
    memory/                          intake form, tag picker, layer stack, meter, timeline
    excavation/                      timer, session view, start form
    delta/                           version delta
  hooks/                             use-labile-window, use-preserving-action
  lib/
    supabase/                        server / browser / middleware clients
    memory/                          constants, zod schemas, queries, consolidation, delta
    ai/                              prediction-error engine
  types/                             database.ts (Supabase types), memory.ts (domain)
```

## Data model

- `memories`: one per dig site; current emotional weight/valence, excavation counters.
- `memory_layers`: **append-only** strata (`core_event`, `retelling`, `current_weight`,
  `reframe`) with an auto-incrementing per-memory `version`. There's no UPDATE policy, so the
  history can't be rewritten.
- `excavation_sessions`: time-boxed windows (`active` / `completed` / `expired` / `abandoned`).
  At most one active window per memory. The prediction-error prompt is stored on the session.
- `tags` / `memory_tags`: per-user retrieval cues, deduplicated case-insensitively.

Every table has RLS scoped to `auth.uid()`. Multi-step writes go through `security invoker` RPCs,
so they're atomic and still subject to RLS.

## Roadmap (not yet built)

- External Contamination & Bias Detector (suggestibility markers in entries)
- A richer, multi-step Reframing Crucible flow
- Deeper timeline visualisation (scroll-driven depth chart)
