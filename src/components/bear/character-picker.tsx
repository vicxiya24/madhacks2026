"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateBearVariant } from "@/app/actions/profile";
import { Card, CardContent } from "@/components/ui/card";
import { BearSvg } from "./bear-svg";
import { BEAR_VARIANTS, BEAR_VARIANT_KEYS, FEELING_SCALE, VIVIDNESS_SCALE } from "@/lib/bears";
import type { BearVariant } from "@/types/memory";
import { cn } from "@/lib/utils";

/** Character customisation: pick your bear. Saves immediately. */
export function CharacterPicker({ initial }: { initial: BearVariant }) {
  const [saved, setSaved] = useState(initial);
  const [selected, setOptimistic] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const choose = (variant: BearVariant) => {
    if (variant === selected) return;
    setError(null);
    startTransition(async () => {
      setOptimistic(variant);
      const res = await updateBearVariant(variant);
      if (res.ok) setSaved(variant);
      else setError(res.message ?? "Couldn't save.");
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-hand text-3xl font-bold">choose your bear</h2>
              <p className="text-muted-foreground text-sm">
                Your bear sits on the home screen, shows up on your rating scales, and will star in
                the digging and burying animations.
              </p>
            </div>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs" aria-live="polite">
              {pending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden /> saving...
                </>
              ) : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                <>
                  <Check className="size-3.5" aria-hidden /> saved
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" role="radiogroup" aria-label="Bear">
            {BEAR_VARIANT_KEYS.map((key) => {
              const checked = selected === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => choose(key)}
                  className={cn(
                    "group grid justify-items-center gap-2 rounded-3xl border px-3 pt-4 pb-3 transition",
                    "focus-visible:ring-ring/60 outline-none focus-visible:ring-[3px]",
                    checked
                      ? "border-[#c9d6ff]/70 bg-[#c9d6ff]/12 shadow-[0_0_30px_-8px_rgb(160_185_230_/_0.8)]"
                      : "border-white/10 hover:bg-white/5",
                  )}
                >
                  <BearSvg
                    variant={key}
                    className={cn("h-28 w-auto transition", checked ? "animate-breathe" : "group-hover:-translate-y-1")}
                  />
                  <span className="font-hand text-xl font-bold">{BEAR_VARIANTS[key].label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5">
          <div>
            <h2 className="font-hand text-3xl font-bold">your scales</h2>
            <p className="text-muted-foreground text-sm">How your bear will look when you rate a memory.</p>
          </div>
          {[
            { title: "How vivid", steps: VIVIDNESS_SCALE },
            { title: "How it feels", steps: FEELING_SCALE },
          ].map(({ title, steps }) => (
            <div key={title} className="grid gap-2">
              <h3 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">{title}</h3>
              <div className="grid grid-cols-5 gap-2">
                {steps.map((s) => (
                  <div key={s.value} className="grid justify-items-center gap-1 text-center">
                    <BearSvg variant={selected} expression={s.expression} mode="head" className="h-auto w-full max-w-20" />
                    <span className="font-hand text-base leading-none font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
