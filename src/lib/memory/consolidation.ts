import type {
  ConsolidationReading,
  ExcavationSession,
  Memory,
  MemoryLayer,
} from "@/types/memory";
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

export function isSessionLive(session: ExcavationSession | null, now = Date.now()): boolean {
  return !!session && session.status === "active" && new Date(session.expires_at).getTime() > now;
}

/**
 * Heuristic Consolidation Strength Meter.
 *
 * - labile:    an excavation window is open right now
 * - contested: the latest reframe has drifted far from the core event
 *              (emotional valence swing and/or low lexical overlap)
 * - stable:    otherwise; strength dips while a recent reframe restabilises
 */
export function readConsolidation(
  memory: Pick<Memory, "last_excavated_at">,
  layers: MemoryLayer[],
  activeSession: ExcavationSession | null,
  now = Date.now(),
): ConsolidationReading {
  if (isSessionLive(activeSession, now) && activeSession) {
    const total = activeSession.duration_seconds * 1000;
    const remaining = new Date(activeSession.expires_at).getTime() - now;
    const openness = clamp(remaining / total, 0, 1);
    return {
      state: "labile",
      strength: Math.round(10 + (1 - openness) * 25),
      rationale: "Excavation in progress. The trace is open to revision.",
    };
  }

  const sorted = [...layers].sort((a, b) => a.version - b.version);
  const core = sorted.find((l) => l.layer_type === "core_event") ?? sorted[0];
  const reframes = sorted.filter((l) => l.layer_type === "reframe");
  const latest = reframes.at(-1);

  let strength = 92;
  let state: ConsolidationReading["state"] = "stable";
  let rationale = reframes.length
    ? "Interpretation has settled around the latest reframe."
    : "Untouched since intake. The original trace hasn't been reopened yet.";

  if (core && latest) {
    const valenceShift = Math.abs((latest.emotional_valence ?? 0) - (core.emotional_valence ?? 0));
    const overlap = lexicalOverlap(core.content, latest.content);
    const drift = clamp(valenceShift / 10, 0, 1) * 0.55 + (1 - overlap) * 0.45;

    strength -= Math.round(drift * 45);

    if (valenceShift >= 4 || (drift > 0.6 && reframes.length < 2)) {
      state = "contested";
      rationale =
        "The newest layer pulls hard against the original. Competing versions are still settling.";
    }
  }

  if (memory.last_excavated_at) {
    const hours = (now - new Date(memory.last_excavated_at).getTime()) / 36e5;
    if (hours < RESTABILISATION_HOURS) {
      strength -= Math.round((1 - hours / RESTABILISATION_HOURS) * 30);
      if (state === "stable") {
        rationale = "Recently reframed. The updated trace is still restabilising.";
      }
    }
  }

  return { state, strength: clamp(strength, 5, 100), rationale };
}
