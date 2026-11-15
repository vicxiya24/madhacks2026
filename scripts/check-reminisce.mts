// Dev check for the "Let's reminisce about..." schedule and picks.
// Run: npx tsx scripts/check-reminisce.mts
import { COOLDOWN_HOURS, READY_WINDOW_HOURS, eligibleMemories, pickReminisce, reminisceWindow } from "@/lib/reminisce";

const H = 36e5;
const D = 24 * H;
const now0 = Date.parse("2026-11-15T12:00:00Z");
let failures = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
};

// 1. Someone who takes every suggestion as soon as it shines, for 60 days.
{
  let anchor: number | null = null;
  const quiet: number[] = [];
  let quietSince: number | null = null;
  for (let t = now0; t < now0 + 60 * D; t += 0.25 * H) {
    const w = reminisceWindow(anchor, "user-a", t);
    if (w.ready) {
      if (quietSince !== null) quiet.push((t - quietSince) / H);
      anchor = t; // takes it
      quietSince = t;
    }
  }
  const min = Math.min(...quiet), max = Math.max(...quiet);
  check(quiet.length > 10, `suggestions keep coming (${quiet.length} in 60 days)`);
  check(min >= COOLDOWN_HOURS.min - 0.25 && max <= COOLDOWN_HOURS.max + 0.25, `quiet stretches between ${min.toFixed(1)}h and ${max.toFixed(1)}h (allowed ${COOLDOWN_HOURS.min}-${COOLDOWN_HOURS.max}h)`);
  check(new Set(quiet.map((q) => Math.round(q))).size > 5, "quiet stretches vary (random times)");
}

// 2. Someone who never clicks: it must not stay lit forever.
{
  const anchor = now0;
  let lit = 0, total = 0, longest = 0, run = 0;
  for (let t = now0; t < now0 + 30 * D; t += 0.25 * H) {
    const ready = reminisceWindow(anchor, "user-b", t).ready;
    total++;
    if (ready) { lit++; run++; longest = Math.max(longest, run); } else run = 0;
  }
  check(lit / total < 0.35, `ignored suggestions go quiet again (${Math.round((100 * lit) / total)}% of the time lit)`);
  check(longest * 0.25 <= READY_WINDOW_HOURS + 0.25, `each shine lasts at most ${READY_WINDOW_HOURS}h (longest ${longest * 0.25}h)`);
}

// 3. Same moment, same answer (no reshuffling on refresh); first-ever visit is ready.
{
  const a = reminisceWindow(now0 - 50 * H, "user-c", now0);
  const b = reminisceWindow(now0 - 50 * H, "user-c", now0);
  check(JSON.stringify(a) === JSON.stringify(b), "schedule is stable for the same inputs");
  check(reminisceWindow(null, "user-c", now0).ready, "a brand-new user gets their first suggestion straight away");
}

// 4. Eligibility and weighting.
const mem = (id: string, daysOld: number, revisits: number, extra: Record<string, unknown> = {}) =>
  ({
    id,
    title: id,
    occurred_on: new Date(now0 - daysOld * D).toISOString().slice(0, 10),
    era_label: null,
    created_at: new Date(now0 - Math.min(daysOld, 400) * D).toISOString(),
    last_excavated_at: null,
    excavation_count: revisits,
    activeSession: null,
    ...extra,
  }) as never;

{
  const memories = [
    mem("written-an-hour-ago", 0, 0, { created_at: new Date(now0 - 1 * H).toISOString() }),
    mem("revisited-this-morning", 30, 1, { last_excavated_at: new Date(now0 - 5 * H).toISOString() }),
    mem("mid-dive", 30, 0, { activeSession: { id: "s" } }),
    mem("a-day-old", 1.5, 0),
  ];
  const ok = eligibleMemories(memories, now0).map((m: { id: string }) => m.id);
  check(JSON.stringify(ok) === JSON.stringify(["a-day-old"]), `only rested memories are eligible (got ${ok.join(", ")})`);
}

{
  const memories = [
    mem("day-old", 1.5, 0),
    mem("week-old", 7, 0),
    mem("month-old", 30, 0),
    mem("year-old-never-revisited", 365, 0),
    mem("year-old-revisited-4x", 365, 4, { last_excavated_at: new Date(now0 - 3 * D).toISOString() }),
  ];
  const counts: Record<string, number> = {};
  for (let i = 0; i < 4000; i++) {
    const m = pickReminisce(memories, `seed-${i}`, now0) as unknown as { id: string };
    counts[m.id] = (counts[m.id] ?? 0) + 1;
  }
  console.log("      picks out of 4000:", counts);
  check(counts["year-old-never-revisited"] > counts["month-old"] && counts["month-old"] > counts["day-old"], "older memories are suggested more often");
  check(counts["year-old-never-revisited"] > 3 * counts["year-old-revisited-4x"], "often-revisited memories are suggested less");
  check(Object.keys(counts).length === 5 && counts["day-old"] > 0, "every memory still gets a turn sometimes (day, week and month old too)");
}

console.log(`\n${failures === 0 ? "all checks passed" : `${failures} failed`}`);
process.exit(failures ? 1 : 0);
