import type { ConsolidationReading, ExcavationSession, Memory, MemoryLayer } from "@/types/memory";
import { RESTABILISATION_HOURS } from "./constants";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function tokenSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s']/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

/** Jaccard similarity of two texts' vocabularies, 0..1. */
export function lexicalOverlap(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 && B.size === 0) return 1;
  let intersection = 0;
  for (const w of A) if (B.has(w)) intersection++;
  return intersection / (A.size + B.size - intersection);
}

/**
 * Heuristic Consolidation Strength Meter.
 *
 * - labile:    a revisit is in progress right now
 * - contested: the latest revisit has drifted far from the first telling
 *              (big change in feeling and/or very different wording)
 * - stable:    otherwise; strength dips while a recent revisit settles
 */
export function readConsolidation(
  memory: Pick<Memory, "last_excavated_at">,
  layers: MemoryLayer[],
  activeSession: ExcavationSession | null,
  now = Date.now(),
): ConsolidationReading {
  if (activeSession?.status === "active") {
    return {
      state: "labile",
      strength: 25,
      rationale: "You're revisiting this right now. It's open to change.",
    };
  }

  const sorted = [...layers].sort((a, b) => a.version - b.version);
  const first = sorted.find((l) => l.layer_type === "core_event") ?? sorted[0];
  const revisits = sorted.filter((l) => l.layer_type === "reframe");
  const latest = revisits.at(-1);

  let strength = 92;
  let state: ConsolidationReading["state"] = "stable";
  let rationale = revisits.length
    ? "It has settled around your latest revisit."
    : "Untouched since you first wrote it down.";

  if (first && latest) {
    // feeling is 1 (painful) .. 5 (warm); missing on entries from older versions
    const feelingShift =
      first.feeling && latest.feeling ? Math.abs(latest.feeling - first.feeling) : 0;
    const overlap = lexicalOverlap(first.content, latest.content);
    const drift = clamp(feelingShift / 4, 0, 1) * 0.5 + (1 - overlap) * 0.5;

    strength -= Math.round(drift * 45);

    if (feelingShift >= 2 || (drift > 0.65 && revisits.length < 2)) {
      state = "contested";
      rationale = "Your latest revisit pulls hard against the first telling. It's still settling.";
    }
  }

  if (memory.last_excavated_at) {
    const hours = (now - new Date(memory.last_excavated_at).getTime()) / 36e5;
    if (hours < RESTABILISATION_HOURS) {
      strength -= Math.round((1 - hours / RESTABILISATION_HOURS) * 30);
      if (state === "stable") rationale = "Recently revisited. It's still settling back down.";
    }
  }

  return { state, strength: clamp(strength, 5, 100), rationale };
}
