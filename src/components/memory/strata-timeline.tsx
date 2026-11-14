import Link from "next/link";
import { Activity } from "lucide-react";
import { ConsolidationMeter } from "./consolidation-meter";
import { readConsolidation } from "@/lib/memory/consolidation";
import type { MemoryWithStrata } from "@/types/memory";
import { cn, formatDate } from "@/lib/utils";

const STRATA = ["bg-stratum-1", "bg-stratum-2", "bg-stratum-3", "bg-stratum-4", "bg-stratum-5"];

/** Buckets a memory into one of five depth bands by how long ago it happened. */
function depthBand(memory: MemoryWithStrata, now: number): number {
  if (!memory.occurred_on) return 2;
  const years = (now - new Date(memory.occurred_on).getTime()) / (365.25 * 864e5);
  if (years < 1) return 0;
  if (years < 5) return 1;
  if (years < 12) return 2;
  if (years < 25) return 3;
  return 4;
}

/**
 * The Stratigraphic Timeline: recent memories near the surface, older ones
 * deeper down. Scroll to dig.
 */
export function StrataTimeline({ memories }: { memories: MemoryWithStrata[] }) {
  const now = Date.now();

  return (
    <ol className="relative grid" aria-label="Memories by depth">
      <li className="text-muted-foreground mb-2 font-mono text-[11px] tracking-[0.2em] uppercase">
        Surface: today
      </li>
      {memories.map((memory) => {
        const band = depthBand(memory, now);
        const reading = readConsolidation(memory, memory.layers, memory.activeSession, now);
        const when = formatDate(memory.occurred_on) ?? memory.era_label ?? "Undated";

        return (
          <li key={memory.id} className="group relative">
            <Link
              href={`/dig/${memory.id}`}
              className="focus-visible:ring-ring/50 grid grid-cols-[1.25rem_1fr] gap-4 rounded-sm outline-none focus-visible:ring-[3px] sm:grid-cols-[1.25rem_1fr_12rem]"
            >
              <div className={cn("w-full", STRATA[band])} aria-hidden />
              <div className="border-b py-5 transition-transform group-hover:translate-x-1">
                <div className="text-muted-foreground font-mono text-[11px]">{when}</div>
                <h3 className="mt-1 font-serif text-lg leading-snug">{memory.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  {memory.layers.length} {memory.layers.length === 1 ? "layer" : "layers"} ·{" "}
                  {memory.excavation_count}{" "}
                  {memory.excavation_count === 1 ? "excavation" : "excavations"}
                  {memory.activeSession && (
                    <span className="text-labile ml-2 inline-flex items-center gap-1">
                      <Activity className="size-3" aria-hidden /> dig in progress
                    </span>
                  )}
                </p>
              </div>
              <div className="col-start-2 border-b pb-5 sm:col-start-auto sm:py-5">
                <ConsolidationMeter reading={reading} compact />
              </div>
            </Link>
          </li>
        );
      })}
      <li className="text-muted-foreground mt-2 font-mono text-[11px] tracking-[0.2em] uppercase">
        Bedrock
      </li>
    </ol>
  );
}
