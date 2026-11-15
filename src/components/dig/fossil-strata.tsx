import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { FossilImage } from "./fossil";
import { ROUGH_TIMES, STRATA, type StratumKey } from "@/lib/memory/constants";
import type { MemoryWithStrata } from "@/types/memory";
import { cn, formatDate, hashString, seededRandom } from "@/lib/utils";

const BAND_STYLE: Record<StratumKey, { bg: string; text: string; sub: string; dots: string }> = {
  week: { bg: "var(--stratum-1)", text: "text-[#26364f]", sub: "text-[#26364f]/70", dots: "bg-white" },
  month: { bg: "var(--stratum-2)", text: "text-[#26364f]", sub: "text-[#26364f]/70", dots: "bg-white" },
  year: { bg: "var(--stratum-3)", text: "text-white", sub: "text-white/75", dots: "bg-white/90" },
  years: { bg: "var(--stratum-4)", text: "text-white", sub: "text-white/70", dots: "bg-white/80" },
  deep: { bg: "var(--stratum-5)", text: "text-white", sub: "text-white/65", dots: "bg-white/70" },
};

// Each band's top edge is a different gentle wave.
const WAVES = [
  "M0 60 C 200 20, 420 70, 640 40 S 1040 10, 1200 45 L1200 61 L0 61 Z",
  "M0 40 C 260 0, 500 60, 760 30 S 1080 50, 1200 20 L1200 61 L0 61 Z",
  "M0 30 C 180 60, 420 0, 700 35 S 1050 60, 1200 25 L1200 61 L0 61 Z",
  "M0 45 C 240 10, 520 55, 780 25 S 1100 45, 1200 30 L1200 61 L0 61 Z",
  "M0 25 C 300 55, 560 5, 820 40 S 1100 20, 1200 45 L1200 61 L0 61 Z",
];

/**
 * How many days ago a memory happened: from its exact date if it has one,
 * otherwise from the rough choice, counted back from when it was written.
 * Undated memories (and old free-text rough dates) sink deepest.
 */
export function daysAgo(
  memory: Pick<MemoryWithStrata, "occurred_on" | "era_label" | "created_at">,
  now: number,
): number {
  if (memory.occurred_on) return (now - new Date(`${memory.occurred_on}T00:00:00Z`).getTime()) / 864e5;
  const rough = ROUGH_TIMES.find((t) => t.label.toLowerCase() === memory.era_label?.trim().toLowerCase());
  if (!rough) return Infinity;
  return (now - new Date(memory.created_at).getTime()) / 864e5 + rough.daysAgo;
}

/** Which stratum a memory belongs to, by how long ago it happened. */
export function stratumFor(
  memory: Pick<MemoryWithStrata, "occurred_on" | "era_label" | "created_at">,
  now: number,
): StratumKey {
  const days = daysAgo(memory, now);
  return STRATA.find((s) => days < s.maxDays)?.key ?? "deep";
}

function Bubbles({ seed, className }: { seed: number; className: string }) {
  const rand = seededRandom(seed);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={cn("absolute rounded-full", className)}
          style={{
            left: `${rand() * 96 + 2}%`,
            top: `${rand() * 85 + 8}%`,
            width: 8 + rand() * 10,
            height: 6 + rand() * 6,
            opacity: 0.55 + rand() * 0.4,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The dig site: horizontal strata that darken with depth. Each memory is a
 * fossil buried in the band that matches how long ago it happened.
 */
export function FossilStrata({
  memories,
  now,
  highlightId,
}: {
  memories: MemoryWithStrata[];
  now: number;
  highlightId?: string;
}) {
  const byBand = new Map<StratumKey, MemoryWithStrata[]>(STRATA.map((s) => [s.key, []]));
  for (const m of [...memories].sort((a, b) => daysAgo(a, now) - daysAgo(b, now))) {
    byBand.get(stratumFor(m, now))!.push(m);
  }

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 pb-16 text-[#c9d6ff]">
        <ArrowDown className="size-8 animate-bounce" strokeWidth={3} aria-hidden />
        <span className="font-hand text-xl">Scroll down to dig deeper into the past</span>
      </div>

      {STRATA.map((band, i) => {
        const style = BAND_STYLE[band.key];
        const fossils = byBand.get(band.key)!;

        return (
          <section
            key={band.key}
            aria-label={`${band.label}: ${fossils.length} ${fossils.length === 1 ? "memory" : "memories"}`}
            className="relative"
            style={{ background: style.bg }}
          >
            <svg
              viewBox="0 0 1200 61"
              preserveAspectRatio="none"
              className="absolute -top-[60px] left-0 h-[61px] w-full"
              aria-hidden
            >
              <path d={WAVES[i]} fill={style.bg} />
            </svg>

            <Bubbles seed={i * 101 + 3} className={style.dots} />

            <div className="relative mx-auto max-w-5xl px-6 pt-4 pb-16">
              <h2 className={cn("font-hand text-3xl font-bold", style.text)}>{band.label}</h2>

              {fossils.length === 0 ? (
                <p className={cn("font-hand py-8 text-lg", style.sub)}>
                  Nothing buried here yet...
                </p>
              ) : (
                <ul className="mt-4 flex flex-wrap justify-around gap-x-6 gap-y-4">
                  {fossils.map((m) => {
                    const r = seededRandom(hashString(m.id));
                    const jitter = Math.round(r() * 40);
                    const size = 64 + (m.vividness ?? 3) * 9; // more vivid memories, bigger fossils
                    const when = formatDate(m.occurred_on) ?? m.era_label ?? "sometime";
                    const isNew = m.id === highlightId;
                    const digging = !!m.activeSession;

                    return (
                      <li key={m.id} style={{ marginTop: jitter }}>
                        <Link
                          href={`/dig/${m.id}`}
                          className="group grid w-36 justify-items-center gap-1 rounded-2xl p-2 text-center outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                        >
                          <span
                            className={cn(
                              "relative grid place-items-center rounded-full transition duration-300 group-hover:-translate-y-1 group-hover:scale-110",
                              "drop-shadow-[0_8px_10px_rgb(20_20_50_/_0.35)] group-hover:drop-shadow-[0_0_18px_rgb(255_255_255_/_0.55)]",
                              isNew && "drop-shadow-[0_0_22px_rgb(255_255_255_/_0.9)]",
                              digging && "drop-shadow-[0_0_20px_rgb(246_211_139_/_0.9)]",
                            )}
                          >
                            <FossilImage seed={m.id} size={size} priority={isNew} />
                          </span>
                          <span className={cn("font-hand line-clamp-2 text-lg leading-tight font-bold", style.text)}>
                            {m.title}
                          </span>
                          <span className={cn("text-[11px]", style.sub)}>
                            {when}
                            {digging && " · mid-dive"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        );
      })}
      <div className="h-10" style={{ background: "var(--stratum-5)" }} />
    </div>
  );
}
