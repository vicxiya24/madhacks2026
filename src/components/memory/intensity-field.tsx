"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function intensityWord(value: number): string {
  if (value <= 2) return "a whisper";
  if (value <= 4) return "a soft hum";
  if (value <= 6) return "steady";
  if (value <= 8) return "loud";
  return "overwhelming";
}

/** One slider: how intense does this memory feel right now? */
export function IntensityField({
  defaultValue = 5,
  label = "How loud is this memory right now?",
  className,
}: {
  defaultValue?: number;
  label?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id} className="text-base">
          {label}
        </Label>
        <span className="font-hand text-xl text-[#c9d6ff]">
          {intensityWord(value)} <span className="font-mono text-xs opacity-70">{value}/10</span>
        </span>
      </div>
      <input
        id={id}
        name="emotionalWeight"
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-[#a0b9e6]"
        aria-valuetext={`${intensityWord(value)}, ${value} out of 10`}
      />
    </div>
  );
}
