"use client";

import { useId, useState } from "react";
import { BearSvg } from "./bear-svg";
import { useCharacter } from "./character-provider";
import { SCALES, type ScaleKind } from "@/lib/bears";
import { cn } from "@/lib/utils";

/**
 * Five bears, five faces: pick the one that matches. Replaces sliders for
 * vividness (foggy → crystal clear) and feeling (painful → glowing).
 */
export function BearScale({
  kind,
  name,
  question,
  hint,
  defaultValue = 3,
}: {
  kind: ScaleKind;
  name: string;
  question: string;
  hint?: string;
  defaultValue?: number;
}) {
  const variant = useCharacter();
  const steps = SCALES[kind];
  const [value, setValue] = useState(defaultValue);
  const groupId = useId();

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 grid gap-1">
        <span className="text-base font-medium">{question}</span>
        {hint && <span className="text-muted-foreground text-sm font-normal">{hint}</span>}
      </legend>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-3" role="radiogroup">
        {steps.map((step) => {
          const checked = value === step.value;
          const id = `${groupId}-${step.value}`;
          return (
            <label
              key={step.value}
              htmlFor={id}
              className={cn(
                "group grid cursor-pointer justify-items-center gap-1 rounded-2xl border px-1 py-2 text-center transition sm:px-2 sm:py-3",
                "has-[:focus-visible]:ring-ring/60 has-[:focus-visible]:ring-[3px]",
                checked
                  ? "border-[#c9d6ff]/70 bg-[#c9d6ff]/12 shadow-[0_0_24px_-6px_rgb(160_185_230_/_0.7)]"
                  : "border-transparent opacity-60 hover:bg-white/5 hover:opacity-100",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={step.value}
                checked={checked}
                onChange={() => setValue(step.value)}
                className="sr-only"
              />
              <BearSvg
                variant={variant}
                expression={step.expression}
                mode="head"
                className={cn("h-auto w-full max-w-20 transition", checked ? "scale-105" : "group-hover:scale-105")}
              />
              <span className="font-hand text-base leading-none font-bold sm:text-lg">{step.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
