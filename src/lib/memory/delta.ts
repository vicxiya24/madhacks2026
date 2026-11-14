import { diffWords } from "diff";

export type DeltaSegment = { text: string; kind: "same" | "added" | "removed" };

export type VersionDelta = {
  /** segments to render on the "before" side (same + removed) */
  before: DeltaSegment[];
  /** segments to render on the "after" side (same + added) */
  after: DeltaSegment[];
  stats: {
    retainedWords: number;
    addedWords: number;
    removedWords: number;
    /** share of the original's words that survive into the newer version */
    retentionPct: number;
  };
};

const countWords = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Word-level diff between two memory versions, split for side-by-side display. */
export function computeDelta(beforeText: string, afterText: string): VersionDelta {
  const changes = diffWords(beforeText, afterText);
  const before: DeltaSegment[] = [];
  const after: DeltaSegment[] = [];
  let retainedWords = 0;
  let addedWords = 0;
  let removedWords = 0;

  for (const change of changes) {
    const n = countWords(change.value);
    if (change.added) {
      after.push({ text: change.value, kind: "added" });
      addedWords += n;
    } else if (change.removed) {
      before.push({ text: change.value, kind: "removed" });
      removedWords += n;
    } else {
      before.push({ text: change.value, kind: "same" });
      after.push({ text: change.value, kind: "same" });
      retainedWords += n;
    }
  }

  const originalTotal = retainedWords + removedWords;
  return {
    before,
    after,
    stats: {
      retainedWords,
      addedWords,
      removedWords,
      retentionPct: originalTotal ? Math.round((retainedWords / originalTotal) * 100) : 100,
    },
  };
}
