import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listMemories } from "@/lib/memory/queries";
import { eligibleMemories, pickReminisce, reminisceWindow } from "@/lib/reminisce";

export type ReminisceState =
  /** Shining: here's a memory worth revisiting. */
  | { kind: "ready"; memory: { id: string; title: string } }
  /** Resting between suggestions. */
  | { kind: "cooldown" }
  /** Nothing has rested long enough yet (or there are no memories). */
  | { kind: "empty" };

/** The home page's "Let's reminisce about..." bubble for the signed-in user. */
export async function getReminisceState(userId: string, now = Date.now()): Promise<ReminisceState> {
  const supabase = await createClient();
  const { data: profile, error } = await supabase.from("profiles").select("reminisce_anchor_at").maybeSingle();
  if (error) {
    // e.g. the reminisce migration hasn't been run yet: keep the bubble quiet rather than break home
    console.error("[getReminisceState]", error.message);
    return { kind: "cooldown" };
  }

  const anchor = profile?.reminisce_anchor_at ? new Date(profile.reminisce_anchor_at).getTime() : null;
  const window = reminisceWindow(anchor, userId, now);
  if (!window.ready) return { kind: "cooldown" };

  const candidates = eligibleMemories(await listMemories(), now);
  const memory = pickReminisce(candidates, `${userId}:${window.windowStart}`, now);
  return memory ? { kind: "ready", memory: { id: memory.id, title: memory.title } } : { kind: "empty" };
}
