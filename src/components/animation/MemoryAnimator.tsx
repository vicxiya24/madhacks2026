"use client";

import { useEffect, useState, useTransition } from "react";
import { Clapperboard, Info, RotateCcw } from "lucide-react";
import { generateMemoryArtifact } from "@/app/actions/artifact";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BearSvg } from "@/components/bear/bear-svg";
import { AnimalAvatar } from "@/components/people/animal-avatar";
import { ArtifactCard } from "./artifact-card";
import type { ArtifactView } from "@/lib/animation/artifact";
import type { CastMember } from "@/lib/animation/cast";

/** The developing animation always plays at least this long, so the reveal feels like a moment. */
const MIN_DEVELOP_MS = 2800;
const LOADING_LINES = [
  "Unearthing visual strata...",
  "Brushing off the details...",
  "Developing artifact...",
  "Fixing the image...",
];

function Avatar({ member, className }: { member: CastMember; className?: string }) {
  return member.avatar.kind === "bear" ? (
    <BearSvg variant={member.avatar.variant} className={className} />
  ) : (
    <AnimalAvatar animal={member.avatar.animal} className={className} />
  );
}

/** A stable catalogue number for the stamp on the card. */
function catalogueNumber(id: string | null, createdAt: string) {
  const source = id ?? createdAt;
  let n = 0;
  for (const ch of source) n = (n * 31 + ch.charCodeAt(0)) % 10000;
  return String(n).padStart(4, "0");
}

/**
 * "Play it out": develops a memory into a still storybook illustration (an "artifact card"),
 * starring you as your bear and your tagged people as their animals.
 */
export function MemoryAnimator({
  memoryId,
  cast,
  initial,
  aiEnabled,
}: {
  memoryId: string;
  cast: CastMember[];
  initial: ArtifactView | null;
  /** whether a Gemini key is configured (otherwise cards are drawn offline) */
  aiEnabled: boolean;
}) {
  const [view, setView] = useState<ArtifactView | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [developing, startTransition] = useTransition();
  const [revealKey, setRevealKey] = useState(0);

  const playItOut = () => {
    setError(null);
    startTransition(async () => {
      const [res] = await Promise.all([
        generateMemoryArtifact(memoryId).catch(() => null),
        new Promise((r) => setTimeout(r, MIN_DEVELOP_MS)),
      ]);
      if (res?.ok) {
        setView(res.view);
        setRevealKey((k) => k + 1);
      } else {
        setError(res?.message ?? "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Card className="overflow-hidden border-[#c9d6ff]/30">
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-hand text-3xl font-bold">Play it out</h2>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm">
              Develop this memory into a storybook illustration, with you as your bear and everyone
              you tagged as their animal.
            </p>
          </div>
          {cast.length > 0 && (
            <ul className="flex -space-x-3" aria-label="Starring">
              {cast.slice(0, 5).map((m) => (
                <li key={m.key} className="grid size-12 place-items-center rounded-full border border-white/15 bg-[#232552]" title={m.name}>
                  <Avatar member={m} className="h-9 w-auto" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {developing ? (
          <DevelopingPlate cast={cast} />
        ) : view ? (
          <div key={revealKey} className={revealKey > 0 ? "animate-artifact-reveal" : undefined}>
            <ArtifactCard artifact={view.artifact} cast={cast} number={catalogueNumber(view.id, view.createdAt)} />
          </div>
        ) : (
          <EmptyPlate cast={cast} />
        )}

        {view?.notice && !developing && (
          <p className="text-muted-foreground inline-flex items-start gap-1.5 text-xs">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden /> {view.notice}
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="xl" onClick={playItOut} disabled={developing} className="w-full sm:w-fit">
            {view ? <RotateCcw aria-hidden /> : <Clapperboard aria-hidden />}
            {developing ? "Developing..." : view ? "Play it out again" : "Play it out"}
          </Button>
          <p className="text-muted-foreground max-w-md text-xs">
            {aiEnabled
              ? "Your entry, its retellings and your cast are sent to Google Gemini (free tier) to direct the illustration. On the free tier, Google may use what you send to improve its products."
              : "Illustrations are drawn on this device from your entry. Add a GEMINI_API_KEY for AI-directed scenes."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/** Before the first artifact: a dim, softly shimmering plate waiting to be developed. */
function EmptyPlate({ cast }: { cast: CastMember[] }) {
  return (
    <div className="artifact-plate relative grid aspect-video place-items-center overflow-hidden rounded-[1.4rem] border-[6px] border-[#e9dcc3]/40">
      <div className="flex items-end gap-3 opacity-50 grayscale" aria-hidden>
        {cast.slice(0, 4).map((m) => (
          <Avatar key={m.key} member={m} className="h-14 w-auto sm:h-20" />
        ))}
      </div>
      <div className="artifact-shimmer pointer-events-none absolute inset-0" aria-hidden />
      <p className="font-hand absolute bottom-4 text-xl text-[#e9dcc3]/80">An undeveloped plate. Press play to bring it up.</p>
    </div>
  );
}

/** Retro-archaeological loading state: a sepia plate develops while strata scroll beneath. */
function DevelopingPlate({ cast }: { cast: CastMember[] }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setLine((i) => (i + 1) % LOADING_LINES.length), 1400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-strata-scroll relative grid aspect-video place-items-center overflow-hidden rounded-[1.4rem] border-[6px] border-[#e9dcc3]"
    >
      <div className="artifact-developing absolute inset-0" aria-hidden />
      <div className="artifact-grain pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay" aria-hidden />
      <div className="artifact-shimmer artifact-shimmer-fast pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative grid justify-items-center gap-4 px-6 text-center">
        <div className="flex items-end gap-3" aria-hidden>
          {cast.slice(0, 4).map((m, i) => (
            <span key={m.key} className="animate-bob inline-block sepia" style={{ animationDelay: `${i * 0.25}s` }}>
              <Avatar member={m} className="h-14 w-auto drop-shadow-[0_6px_10px_rgb(40_25_10_/_0.5)] sm:h-20" />
            </span>
          ))}
        </div>
        <p className="font-hand text-2xl font-bold text-[#fff6e6] drop-shadow sm:text-3xl">{LOADING_LINES[line]}</p>
      </div>
    </div>
  );
}

export default MemoryAnimator;
