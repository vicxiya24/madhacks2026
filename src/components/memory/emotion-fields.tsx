"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const VALENCE_WORDS: Record<number, string> = {
  [-5]: "Searing",
  [-4]: "Painful",
  [-3]: "Heavy",
  [-2]: "Uneasy",
  [-1]: "Tinged",
  0: "Neutral",
  1: "Soft",
  2: "Warm",
  3: "Fond",
  4: "Glowing",
  5: "Radiant",
};

type Props = {
  defaultWeight?: number;
  defaultValence?: number;
  className?: string;
  /** label prefix, e.g. "Current" vs "After this dig" */
  context?: string;
};

/** Emotional weight (intensity) + valence (tone) range inputs. */
export function EmotionFields({ defaultWeight = 5, defaultValence = 0, className, context }: Props) {
  const [weight, setWeight] = useState(defaultWeight);
  const [valence, setValence] = useState(defaultValence);
  const weightId = useId();
  const valenceId = useId();

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor={weightId}>{context ? `${context} intensity` : "Emotional intensity"}</Label>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">{weight}/10</span>
        </div>
        <input
          id={weightId}
          name="emotionalWeight"
          type="range"
          min={1}
          max={10}
          step={1}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="accent-primary w-full"
          aria-valuetext={`${weight} out of 10`}
        />
        <div className="text-muted-foreground flex justify-between text-[11px]">
          <span>Faint trace</span>
          <span>Overwhelming</span>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor={valenceId}>{context ? `${context} tone` : "Emotional tone"}</Label>
          <span className="text-muted-foreground font-mono text-xs">
            {VALENCE_WORDS[valence]} ({valence > 0 ? `+${valence}` : valence})
          </span>
        </div>
        <input
          id={valenceId}
          name="emotionalValence"
          type="range"
          min={-5}
          max={5}
          step={1}
          value={valence}
          onChange={(e) => setValence(Number(e.target.value))}
          className="accent-primary w-full"
          aria-valuetext={VALENCE_WORDS[valence]}
        />
        <div className="text-muted-foreground flex justify-between text-[11px]">
          <span>Painful</span>
          <span>Warm</span>
        </div>
      </div>
    </div>
  );
}
