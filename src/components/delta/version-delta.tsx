"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { computeDelta, type DeltaSegment } from "@/lib/memory/delta";
import { LAYER_META } from "@/lib/memory/constants";
import type { MemoryLayer } from "@/types/memory";
import { cn, formatDateTime } from "@/lib/utils";

function versionLabel(l: MemoryLayer) {
  return `v${l.version} · ${LAYER_META[l.layer_type].label}`;
}

function Segments({ segments }: { segments: DeltaSegment[] }) {
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((s, i) =>
        s.kind === "same" ? (
          <span key={i}>{s.text}</span>
        ) : s.kind === "removed" ? (
          <del
            key={i}
            className="bg-contested/15 text-contested decoration-contested/60 rounded-sm px-0.5"
          >
            {s.text}
          </del>
        ) : (
          <ins key={i} className="bg-stable/15 text-stable rounded-sm px-0.5 no-underline">
            {s.text}
          </ins>
        ),
      )}
    </p>
  );
}

function Shift({ label, from, to }: { label: string; from: number | null; to: number | null }) {
  if (from === null || to === null) return null;
  const delta = to - from;
  return (
    <div className="bg-muted/60 rounded-lg px-4 py-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 flex items-center gap-2 font-mono text-sm tabular-nums">
        {from} <ArrowRight className="size-3" aria-label="to" /> {to}
        <span
          className={cn(
            "text-xs",
            delta > 0 && "text-stable",
            delta < 0 && "text-contested",
            delta === 0 && "text-muted-foreground",
          )}
        >
          ({delta > 0 ? `+${delta}` : delta})
        </span>
      </div>
    </div>
  );
}

/**
 * Version Delta Visualizer: side-by-side word diff of any two strata.
 * Defaults to the original core event vs. the most recent deposit.
 */
export function VersionDelta({ layers }: { layers: MemoryLayer[] }) {
  const sorted = useMemo(() => [...layers].sort((a, b) => a.version - b.version), [layers]);
  const original = sorted.find((l) => l.layer_type === "core_event") ?? sorted[0];
  const latest = sorted.at(-1)!;

  const [fromId, setFromId] = useState(original.id);
  const [toId, setToId] = useState(latest.id);

  const from = sorted.find((l) => l.id === fromId) ?? original;
  const to = sorted.find((l) => l.id === toId) ?? latest;
  const delta = useMemo(() => computeDelta(from.content, to.content), [from, to]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="delta-from">Earlier version</Label>
          <select
            id="delta-from"
            value={from.id}
            onChange={(e) => setFromId(e.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            {sorted.map((l) => (
              <option key={l.id} value={l.id} disabled={l.version >= to.version}>
                {versionLabel(l)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="delta-to">Later version</Label>
          <select
            id="delta-to"
            value={to.id}
            onChange={(e) => setToId(e.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            {sorted.map((l) => (
              <option key={l.id} value={l.id} disabled={l.version <= from.version}>
                {versionLabel(l)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-muted/60 rounded-lg px-4 py-3">
          <div className="text-muted-foreground text-xs">Original retained</div>
          <div className="mt-1 font-mono text-sm tabular-nums">{delta.stats.retentionPct}%</div>
        </div>
        <div className="bg-muted/60 rounded-lg px-4 py-3">
          <div className="text-muted-foreground text-xs">Words added / removed</div>
          <div className="mt-1 font-mono text-sm tabular-nums">
            <span className="text-stable">+{delta.stats.addedWords}</span>{" "}
            <span className="text-contested">-{delta.stats.removedWords}</span>
          </div>
        </div>
        <Shift label="Intensity" from={from.emotional_weight} to={to.emotional_weight} />
        <Shift label="Tone" from={from.emotional_valence} to={to.emotional_valence} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { layer: from, segments: delta.before, heading: "Before" },
          { layer: to, segments: delta.after, heading: "After" },
        ].map(({ layer, segments, heading }) => (
          <section
            key={heading}
            className="bg-card relative overflow-hidden rounded-xl border"
            aria-label={`${heading}: ${versionLabel(layer)}`}
          >
            <div
              className={cn("absolute inset-x-0 top-0 h-1", LAYER_META[layer.layer_type].stratum)}
              aria-hidden
            />
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-3">
              <span className="text-sm font-medium">
                {heading}: {versionLabel(layer)}
              </span>
              <span className="text-muted-foreground font-mono text-[11px]">
                {formatDateTime(layer.created_at)}
              </span>
            </header>
            <div className="px-5 py-4">
              <Segments segments={segments} />
            </div>
          </section>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        <del className="bg-contested/15 text-contested rounded-sm px-1">Struck</del> words faded
        from the narrative; <ins className="bg-stable/15 text-stable rounded-sm px-1 no-underline">highlighted</ins>{" "}
        words are new sediment. Neither version is the &ldquo;true&rdquo; one. Both are
        reconstructions.
      </p>
    </div>
  );
}
