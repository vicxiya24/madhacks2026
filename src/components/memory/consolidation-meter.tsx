import { Activity, Lock, Swords } from "lucide-react";
import type { ConsolidationReading, ConsolidationState } from "@/types/memory";
import { cn } from "@/lib/utils";

const STATE_META: Record<
  ConsolidationState,
  { label: string; bar: string; text: string; Icon: typeof Lock }
> = {
  stable: { label: "Stable", bar: "bg-stable", text: "text-stable", Icon: Lock },
  labile: { label: "Labile", bar: "bg-labile", text: "text-labile", Icon: Activity },
  contested: { label: "Contested", bar: "bg-contested", text: "text-contested", Icon: Swords },
};

/** Consolidation Strength Meter: is this trace stable, labile, or contested? */
export function ConsolidationMeter({
  reading,
  compact = false,
  className,
}: {
  reading: ConsolidationReading;
  compact?: boolean;
  className?: string;
}) {
  const meta = STATE_META[reading.state];
  const { Icon } = meta;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={cn("inline-flex items-center gap-1 font-medium", meta.text)}>
          <Icon className="size-3.5" aria-hidden />
          {meta.label}
        </span>
        <span className="text-muted-foreground font-mono tabular-nums">{reading.strength}%</span>
      </div>
      <div
        className="bg-muted h-1.5 overflow-hidden rounded-full"
        role="meter"
        aria-label="Consolidation strength"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={reading.strength}
        aria-valuetext={`${meta.label}, ${reading.strength}% consolidated`}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", meta.bar)}
          style={{ width: `${reading.strength}%` }}
        />
      </div>
      {!compact && <p className="text-muted-foreground text-xs">{reading.rationale}</p>}
    </div>
  );
}
