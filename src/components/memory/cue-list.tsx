import { CUE_CATEGORIES } from "@/lib/memory/constants";
import type { TagSummary } from "@/types/memory";
import { cn } from "@/lib/utils";

/** Read-only chips for a memory's people / places / objects / senses. */
export function CueList({ cues, className }: { cues: TagSummary[]; className?: string }) {
  if (cues.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="People, places, objects and senses">
      {cues.map((c) => (
        <li key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs">
          <span className="text-muted-foreground">{CUE_CATEGORIES[c.category].label}</span>
          {c.label}
        </li>
      ))}
    </ul>
  );
}
