"use client";

import { cn, formatCountdown } from "@/lib/utils";
import type { WindowPhase } from "@/hooks/use-labile-window";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PHASE_COPY: Record<WindowPhase, { label: string; sub: string }> = {
  open: { label: "Excavation active", sub: "Trace is labile" },
  closing: { label: "Window closing", sub: "Finish your thought" },
  closed: { label: "Window closed", sub: "Trace restabilised" },
};

/** The Reconsolidation Timer: a draining ring that time-boxes the labile window. */
export function ReconsolidationTimer({
  phase,
  remainingSeconds,
  graceRemainingSeconds,
  durationSeconds,
  className,
}: {
  phase: WindowPhase;
  remainingSeconds: number;
  graceRemainingSeconds: number;
  durationSeconds: number;
  className?: string;
}) {
  const fraction = phase === "open" ? remainingSeconds / durationSeconds : 0;
  const display = phase === "closing" ? graceRemainingSeconds : remainingSeconds;
  const copy = PHASE_COPY[phase];
  const minuteMark = Math.ceil(remainingSeconds / 60);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "relative grid size-32 shrink-0 place-items-center rounded-full",
          phase === "open" && "labile-pulse",
        )}
      >
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
            className={cn(
              "transition-[stroke-dashoffset] duration-300 ease-linear",
              phase === "open" && fraction > 0.25 && "stroke-labile",
              phase === "open" && fraction <= 0.25 && "stroke-contested",
              phase !== "open" && "stroke-transparent",
            )}
          />
        </svg>
        <div className="text-center">
          <div
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums",
              phase === "closing" && "text-contested",
              phase === "closed" && "text-muted-foreground",
            )}
          >
            {formatCountdown(display)}
          </div>
          <div className="text-muted-foreground text-[10px] tracking-widest uppercase">
            {phase === "closing" ? "grace" : "remaining"}
          </div>
        </div>
      </div>

      <div>
        <p className="font-serif text-lg leading-tight">{copy.label}</p>
        <p className="text-muted-foreground text-sm">{copy.sub}</p>
      </div>

      {/* Coarse, minute-level announcements so screen readers aren't spammed every second. */}
      <p className="sr-only" aria-live="polite">
        {phase === "open"
          ? `${minuteMark} minute${minuteMark === 1 ? "" : "s"} left in the excavation window`
          : copy.label}
      </p>
    </div>
  );
}
