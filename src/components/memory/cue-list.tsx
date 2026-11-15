import { CUE_CATEGORIES } from "@/lib/memory/constants";
import { AnimalAvatar } from "@/components/people/animal-avatar";
import { animalFor } from "@/lib/people";
import type { TagSummary } from "@/types/memory";
import { cn } from "@/lib/utils";

/** Read-only chips for a memory's people (with their avatars), places, objects and senses. */
export function CueList({ cues, className }: { cues: TagSummary[]; className?: string }) {
  if (cues.length === 0) return null;
  const people = cues.filter((c) => c.category === "person");
  const rest = cues.filter((c) => c.category !== "person");

  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="People, places, objects and senses">
      {people.map((p) => (
        <li key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 py-1 pr-3 pl-1.5 text-sm">
          <AnimalAvatar animal={animalFor(p)} className="h-6 w-auto" />
          {p.label}
        </li>
      ))}
      {rest.map((c) => (
        <li key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs">
          <span className="text-muted-foreground">{CUE_CATEGORIES[c.category].label}</span>
          {c.label}
        </li>
      ))}
    </ul>
  );
}
