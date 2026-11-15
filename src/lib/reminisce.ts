import { daysAgo } from "@/components/dig/fossil-strata";
import { hashString, seededRandom } from "@/lib/utils";
import type { MemoryWithStrata } from "@/types/memory";

/**
 * "Let's reminisce about...": every so often, the bear suggests an old memory
 * to revisit. It is not always on. After you take a suggestion (or ignore one
 * for a while) it goes quiet for a random stretch, then shines again.
 *
 * The schedule is a pseudo-random chain derived from one stored timestamp
 * (when you last took a suggestion), so nothing needs writing while pages
 * render and every device sees the same schedule.
 */

const HOUR = 36e5;
/** Quiet stretch between suggestions: somewhere between these, at random. */
export const COOLDOWN_HOURS = { min: 18, max: 72 } as const;
/** How long a suggestion shines before quietly moving on if it's ignored. */
export const READY_WINDOW_HOURS = 10;
/** A memory must be at least this old, and this long since its last revisit, to be suggested. */
export const MIN_REST_HOURS = 24;

export type ReminisceWindow =
  | { ready: true; windowStart: number; expiresAt: number | null }
  | { ready: false; nextReadyAt: number };

/**
 * Where we are in the schedule. `anchor` is when the user last took a
 * suggestion (null if never: the first suggestion is ready straight away).
 */
export function reminisceWindow(anchor: number | null, userId: string, now: number): ReminisceWindow {
  if (anchor === null) {
    // First time: ready now. Seed by day so the pick is stable across refreshes.
    return { ready: true, windowStart: Math.floor(now / (24 * HOUR)) * 24 * HOUR, expiresAt: null };
  }
  let t = anchor;
  for (let i = 0; i < 1000; i++) {
    const rand = seededRandom(hashString(`${userId}:${anchor}:${i}`));
    const readyAt = t + (COOLDOWN_HOURS.min + rand() * (COOLDOWN_HOURS.max - COOLDOWN_HOURS.min)) * HOUR;
    const expiresAt = readyAt + READY_WINDOW_HOURS * HOUR;
    if (now < readyAt) return { ready: false, nextReadyAt: readyAt };
    if (now < expiresAt) return { ready: true, windowStart: readyAt, expiresAt };
    t = expiresAt; // ignored: quietly roll on to the next one
  }
  return { ready: false, nextReadyAt: now + COOLDOWN_HOURS.min * HOUR };
}

/** Memories that have rested long enough to be worth revisiting. */
export function eligibleMemories(memories: MemoryWithStrata[], now: number): MemoryWithStrata[] {
  const rest = MIN_REST_HOURS * HOUR;
  return memories.filter(
    (m) =>
      now - new Date(m.created_at).getTime() >= rest &&
      (!m.last_excavated_at || now - new Date(m.last_excavated_at).getTime() >= rest) &&
      !m.activeSession,
  );
}

/**
 * How strongly to suggest a memory: older memories and ones you've revisited
 * less get more weight, but nothing is ruled out, so a day-old, week-old or
 * month-old memory can still come up.
 */
export function reminisceWeight(memory: MemoryWithStrata, now: number): number {
  const age = Math.min(daysAgo(memory, now), 3650); // undated memories count as very old
  const sinceVisit = memory.last_excavated_at ? (now - new Date(memory.last_excavated_at).getTime()) / (24 * HOUR) : age;
  const revisits = memory.excavation_count ?? 0;
  // log-scaled age: a year-old memory beats a month-old one, but not by so much that newer ones never surface
  return ((1 + Math.log2(1 + age)) * (1 + Math.min(sinceVisit, 60) / 60)) / Math.pow(1 + revisits, 1.5);
}

/** Weighted random pick, stable for a given window so refreshing doesn't reshuffle it. */
export function pickReminisce(memories: MemoryWithStrata[], seed: string, now: number): MemoryWithStrata | null {
  if (memories.length === 0) return null;
  const sorted = [...memories].sort((a, b) => a.id.localeCompare(b.id));
  const weights = sorted.map((m) => reminisceWeight(m, now));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = seededRandom(hashString(seed))() * total;
  for (let i = 0; i < sorted.length; i++) {
    r -= weights[i];
    if (r <= 0) return sorted[i];
  }
  return sorted[sorted.length - 1];
}
