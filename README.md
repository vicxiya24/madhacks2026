# Memory Archaeologist

Treat memory like a dig site. Log a memory as separate **sedimentary layers**, reopen it inside a
time-boxed **reconsolidation window**, meet an AI-generated **prediction error**, and deposit a
reframe on top of the original, which is never overwritten. Then compare how your story shifted.

> Reflective journaling tool, not therapy or medical care.

## Stack

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind v4 + shadcn/ui primitives ·
Supabase (Postgres, Auth, RLS) · OpenAI (optional, with template fallback)

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in Supabase URL + anon key (OpenAI key optional)
```

**Database**: pick one:

- Supabase dashboard → SQL Editor → paste and run
  `supabase/migrations/20261114000000_init_memory_archaeologist.sql`
- or with the CLI: `supabase link --project-ref <ref> && supabase db push`

**Auth**: Email/password is enabled by default. For quick hackathon demos, you can turn off
*Confirm email* under Authentication → Providers → Email. Otherwise, add
`http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.

```bash
npm run dev                     # http://localhost:3000
```

## MVP feature map

| Feature | Where |
| --- | --- |
| Stratigraphic Memory Intake (core event / retellings / current weight + emotion + tags) | `src/components/memory/memory-intake-form.tsx` → `createMemory` action → `create_memory()` RPC |
| Artifact tagging (smell, sound, location, person, ...) | `src/components/memory/artifact-tag-picker.tsx`, `tags` + `memory_tags` |
| Reconsolidation Timer (server-clock synced, 2-min grace, enforced in SQL) | `src/hooks/use-labile-window.ts`, `src/components/excavation/reconsolidation-timer.tsx`, `complete_excavation()` RPC |
| Cognitive Friction / prediction-error prompt | `src/lib/ai/prediction-error.ts` (OpenAI Responses API, falls back to templates) |
| Reframing Crucible (reflection → new append-only layer) | `src/components/excavation/excavation-session.tsx` |
| Version Delta Visualizer (side-by-side word diff + emotional shift) | `src/components/delta/version-delta.tsx`, `src/lib/memory/delta.ts` |
| Consolidation Strength Meter (stable / labile / contested) | `src/lib/memory/consolidation.ts`, `src/components/memory/consolidation-meter.tsx` |
| Stratigraphic Timeline (recent at surface, older deeper) | `src/components/memory/strata-timeline.tsx` |

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
