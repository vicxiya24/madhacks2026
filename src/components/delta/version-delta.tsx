"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { intensityWord } from "@/components/memory/intensity-field";
import { LAYER_META } from "@/lib/memory/constants";
import type { MemoryLayer } from "@/types/memory";
import { cn, formatDateTime } from "@/lib/utils";

function versionLabel(l: MemoryLayer, index: number) {
  return index === 0 ? LAYER_META[l.layer_type].label : `${LAYER_META[l.layer_type].label} #${index}`;
}

/** Intensity bar from 1..10 with the word underneath. */
function IntensityGauge({ value }: { value: number | null }) {
  const v = value ?? 5;
  return (
    <div className="grid gap-1.5">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={cn("h-2 flex-1 rounded-full", i < v ? "bg-[#a0b9e6]" : "bg-white/10")}
          />
        ))}
      </div>
      <span className="font-hand text-xl text-[#c9d6ff]">
        {intensityWord(v)} <span className="font-mono text-xs opacity-70">{v}/10</span>
      </span>
    </div>
  );
}

/**
 * Then vs. now: two tellings side by side with the intensity shift between
 * them. No word-diffing. Each version is read as a whole.
 */
export function VersionDelta({ layers }: { layers: MemoryLayer[] }) {
  const sorted = useMemo(() => [...layers].sort((a, b) => a.version - b.version), [layers]);
  const labels = useMemo(() => {
    let revisit = 0;
    return new Map(
      sorted.map((l) => [l.id, l.layer_type === "reframe" ? versionLabel(l, ++revisit) : versionLabel(l, 0)]),
    );
  }, [sorted]);

  const original = sorted.find((l) => l.layer_type === "core_event") ?? sorted[0];
  const latest = sorted.at(-1)!;

  const [fromId, setFromId] = useState(original.id);
  const [toId, setToId] = useState(latest.id);
  const from = sorted.find((l) => l.id === fromId) ?? original;
  const to = sorted.find((l) => l.id === toId) ?? latest;

  const shift = (to.emotional_weight ?? 5) - (from.emotional_weight ?? 5);

  return (
    <div className="grid gap-6">
      {sorted.length > 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: "delta-from", label: "Earlier", value: from.id, set: setFromId, disable: (l: MemoryLayer) => l.version >= to.version },
            { id: "delta-to", label: "Later", value: to.id, set: setToId, disable: (l: MemoryLayer) => l.version <= from.version },
          ].map((s) => (
            <div key={s.id} className="grid gap-2">
              <Label htmlFor={s.id}>{s.label}</Label>
              <select
                id={s.id}
                value={s.value}
                onChange={(e) => s.set(e.target.value)}
                className="border-input h-10 rounded-xl border bg-white/5 px-3 text-sm"
              >
                {sorted.map((l) => (
                  <option key={l.id} value={l.id} disabled={s.disable(l)} className="bg-popover">
                    {labels.get(l.id)} · {formatDateTime(l.created_at)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="grid items-center gap-4 rounded-3xl border bg-white/[0.03] px-6 py-5 sm:grid-cols-[1fr_auto_1fr]">
        <IntensityGauge value={from.emotional_weight} />
        <div className="grid justify-items-center gap-1 text-center">
          <ArrowRight className="size-5 text-[#c9d6ff]" aria-hidden />
          <span
            className={cn(
              "font-mono text-xs",
              shift > 0 && "text-contested",
              shift < 0 && "text-stable",
              shift === 0 && "text-muted-foreground",
            )}
          >
            {shift === 0 ? "same intensity" : shift > 0 ? `${shift} louder` : `${-shift} quieter`}
          </span>
        </div>
        <IntensityGauge value={to.emotional_weight} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { layer: from, heading: "Then" },
          { layer: to, heading: "Now" },
        ].map(({ layer, heading }) => (
          <section
            key={heading}
            className="bg-card relative overflow-hidden rounded-3xl border"
            aria-label={`${heading}: ${labels.get(layer.id)}`}
          >
            <div className={cn("absolute inset-x-0 top-0 h-1.5", LAYER_META[layer.layer_type].stratum)} aria-hidden />
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b px-6 py-4">
              <span className="font-hand text-3xl font-bold">{heading}</span>
              <span className="text-muted-foreground text-xs">
                {labels.get(layer.id)} · {formatDateTime(layer.created_at)}
              </span>
            </header>
            <p className="px-6 py-5 text-sm leading-relaxed whitespace-pre-wrap">{layer.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
