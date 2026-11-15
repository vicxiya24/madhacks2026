import { Anchor, Waves, Zap } from "lucide-react";
import type { ConsolidationReading, ConsolidationState } from "@/types/memory";
import { cn } from "@/lib/utils";

export const SETTLED_LABELS: Record<
  ConsolidationState,
  { label: string; blurb: string; bar: string; text: string; Icon: typeof Anchor }
> = {
  stable: {
    label: "Settled",
    blurb: "Resting quietly. Your story about it isn't changing much.",
    bar: "bg-stable",
    text: "text-stable",
    Icon: Anchor,
  },
  labile: {
    label: "Shifting",
    blurb: "You're revisiting it right now, so it's open to change.",
    bar: "bg-labile",
    text: "text-labile",
    Icon: Waves,
  },
  contested: {
    label: "Conflicted",
    blurb: "Your newer telling is quite different from your first one.",
    bar: "bg-contested",
    text: "text-contested",
    Icon: Zap,
  },
};

/** How settled is this memory? (stable / shifting / conflicted) */
export function ConsolidationMeter({
  reading,
  compact = false,
  className,
}: {
  reading: ConsolidationReading;
  compact?: boolean;
  className?: string;
}) {
  const meta = SETTLED_LABELS[reading.state];
  const { Icon } = meta;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={cn("inline-flex items-center gap-1.5 font-medium", meta.text)}>
          <Icon className="size-4" aria-hidden />
          {meta.label}
        </span>
        <span className="text-muted-foreground font-mono text-xs tabular-nums">{reading.strength}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="meter"
        aria-label="How settled the memory is"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={reading.strength}
        aria-valuetext={`${meta.label}, ${reading.strength}% settled`}
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
