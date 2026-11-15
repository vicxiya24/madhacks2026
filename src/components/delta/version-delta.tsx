"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BearSvg } from "@/components/bear/bear-svg";
import { useCharacter } from "@/components/bear/character-provider";
import { scaleStep, type ScaleKind } from "@/lib/bears";
import { LAYER_META } from "@/lib/memory/constants";
import type { BearVariant, MemoryLayer } from "@/types/memory";
import { cn, formatDateTime } from "@/lib/utils";

function versionLabel(l: MemoryLayer, index: number) {
  return index === 0 ? LAYER_META[l.layer_type].label : `${LAYER_META[l.layer_type].label} #${index}`;
}

function ScaleFace({ kind, value, variant }: { kind: ScaleKind; value: number | null; variant: BearVariant }) {
  const step = scaleStep(kind, value);
  if (!step) {
    return (
      <div className="grid justify-items-center gap-1 text-center">
        <div className="grid size-16 place-items-center rounded-full border border-dashed border-white/20 text-xs text-white/40">
          ?
        </div>
        <span className="text-muted-foreground text-xs">not recorded</span>
      </div>
    );
  }
  return (
    <div className="grid justify-items-center gap-1 text-center">
      <BearSvg variant={variant} expression={step.expression} mode="head" className="h-auto w-16" title={step.label} />
      <span className="font-hand text-lg leading-none font-bold">{step.label}</span>
    </div>
  );
}

function ShiftRow({
  kind,
  title,
  from,
  to,
  variant,
  describe,
}: {
  kind: ScaleKind;
  title: string;
  from: number | null;
  to: number | null;
  variant: BearVariant;
  describe: (delta: number) => string;
}) {
  const delta = from && to ? to - from : null;
  return (
    <div className="grid gap-3 rounded-3xl border bg-white/[0.03] px-5 py-4">
      <h3 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">{title}</h3>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <ScaleFace kind={kind} value={from} variant={variant} />
        <div className="grid justify-items-center gap-1 text-center">
          <ArrowRight className="size-5 text-[#c9d6ff]" aria-hidden />
          {delta !== null && (
            <span className="text-muted-foreground max-w-24 text-[11px] leading-tight">{describe(delta)}</span>
          )}
        </div>
        <ScaleFace kind={kind} value={to} variant={variant} />
      </div>
    </div>
  );
}

/**
 * Then vs. now: two tellings side by side, with how vivid the memory is and
 * how it feels shown as bear faces so the change is visible at a glance.
 */
export function VersionDelta({ layers }: { layers: MemoryLayer[] }) {
  const variant = useCharacter();
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

      <div className="grid gap-4 md:grid-cols-2">
        <ShiftRow
          kind="vividness"
          title="How vivid"
          from={from.vividness}
          to={to.vividness}
          variant={variant}
          describe={(d) => (d === 0 ? "just as vivid" : d > 0 ? "clearer now" : "fading")}
        />
        <ShiftRow
          kind="feeling"
          title="How it feels"
          from={from.feeling}
          to={to.feeling}
          variant={variant}
          describe={(d) => (d === 0 ? "feels the same" : d > 0 ? "warmer now" : "heavier now")}
        />
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
