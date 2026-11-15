import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Activity, BookOpen, GitCompareArrows, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { FossilImage } from "@/components/dig/fossil";
import { ClueCard } from "@/components/memory/clue-card";
import { ConsolidationMeter } from "@/components/memory/consolidation-meter";
import { SettledHeading } from "@/components/memory/settled-explainer";
import { CueList } from "@/components/memory/cue-list";
import { DeleteMemoryButton } from "@/components/memory/delete-memory-button";
import { BearSvg } from "@/components/bear/bear-svg";
import { scaleStep } from "@/lib/bears";
import { getBearVariant } from "@/lib/profile";
import { LayerStack } from "@/components/memory/layer-stack";
import { StartDiveButton } from "@/components/excavation/start-dive-button";
import { getMemory, isEditable } from "@/lib/memory/queries";
import { MemoryAnimator } from "@/components/animation/MemoryAnimator";
import { buildCast } from "@/lib/animation/cast";
import { getLatestArtifact } from "@/lib/animation/queries";
import { isGeminiConfigured } from "@/lib/animation/gemini-artifact";
import { readConsolidation } from "@/lib/memory/consolidation";
import { EDIT_WINDOW_HOURS } from "@/lib/memory/constants";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const memory = await getMemory((await params).id);
  return { title: memory?.title ?? "Memory" };
}

export default async function FossilPage({ params }: Props) {
  await connection();
  const { id } = await params;
  const [memory, variant] = await Promise.all([getMemory(id), getBearVariant()]);
  if (!memory) notFound();
  const artifact = await getLatestArtifact(memory.id);
  const cast = buildCast(variant, memory.tags);

  const vivid = scaleStep("vividness", memory.vividness);
  const feeling = scaleStep("feeling", memory.feeling);
  const reading = readConsolidation(memory, memory.layers, memory.activeSession);
  const when = formatDate(memory.occurred_on) ?? memory.era_label ?? "sometime";
  const editable = isEditable(memory);
  const hoursLeft = Math.ceil(
    EDIT_WINDOW_HOURS - (Date.now() - new Date(memory.created_at).getTime()) / 36e5,
  );
  const revisits = memory.layers.filter((l) => l.layer_type === "reframe").length;
  const canCompare = memory.layers.length > 1;

  return (
    <PageContainer className="grid gap-8">
      <Link href="/dig" className="text-muted-foreground hover:text-foreground text-sm">
        &larr; Back to the dig site
      </Link>

      <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="mx-auto grid size-52 place-items-center rounded-full bg-[radial-gradient(circle,rgb(160_185_230_/_0.25),transparent_70%)]">
          <FossilImage seed={memory.id} size={170} priority />
        </div>
        <div>
          <p className="text-muted-foreground font-mono text-xs">{when}</p>
          <h1 className="font-hand mt-1 text-5xl leading-none font-bold">{memory.title}</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            {revisits === 0
              ? "You haven't revisited this one yet."
              : `Revisited ${revisits} ${revisits === 1 ? "time" : "times"}.`}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <ClueCard clue={memory.context_cue} />
        <CueList cues={memory.tags} />
      </div>

      {/* The two things this page is for: remember it again, then compare. */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#c9d6ff]/30">
          <CardContent className="grid h-full content-between gap-5">
            <div>
              <h2 className="font-hand text-3xl font-bold">
                {memory.activeSession ? "You're mid-dive" : "Try to remember it first"}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Dive back in and write it down again from memory, using only the clue.
              </p>
            </div>
            {memory.activeSession ? (
              <Button asChild size="xl" className="w-full">
                <Link href={`/dig/${memory.id}/excavate/${memory.activeSession.id}`}>
                  <Activity aria-hidden /> Return to your dive
                </Link>
              </Button>
            ) : (
              <StartDiveButton memoryId={memory.id} />
            )}
          </CardContent>
        </Card>

        <Card className="border-[#f6d38b]/30">
          <CardContent className="grid h-full content-between gap-5">
            <div>
              <h2 className="font-hand text-3xl font-bold">See how it&apos;s changed</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {canCompare
                  ? "Put your first telling next to your latest one, and see how vivid it is and how it feels now compared with then."
                  : "Once you've dived back in, you can put your retelling next to what you first wrote."}
              </p>
            </div>
            {canCompare ? (
              <Button asChild size="xl" className="w-full bg-[#f6d38b] text-[#2a2140] hover:bg-[#f8dea6]">
                <Link href={`/dig/${memory.id}/delta`}>
                  <GitCompareArrows aria-hidden /> See how it&apos;s changed
                </Link>
              </Button>
            ) : (
              <Button size="xl" disabled className="w-full bg-[#f6d38b] text-[#2a2140]">
                <GitCompareArrows aria-hidden /> Dive in first to compare
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <MemoryAnimator memoryId={memory.id} cast={cast} initial={artifact} aiEnabled={isGeminiConfigured()} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="grid gap-3">
            <SettledHeading />
            <ConsolidationMeter reading={reading} />
          </CardContent>
        </Card>

        {(vivid || feeling) && (
          <Card>
            <CardContent className="grid gap-3">
              <h2 className="font-hand text-2xl font-bold">Last time you checked</h2>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { step: vivid, caption: "Vividness" },
                  { step: feeling, caption: "Feeling" },
                ].map(({ step, caption }) =>
                  step ? (
                    <div key={caption} className="grid justify-items-center gap-1">
                      <BearSvg variant={variant} expression={step.expression} mode="head" className="h-auto w-16" title={step.label} />
                      <span className="font-hand text-lg leading-none font-bold">{step.label}</span>
                      <span className="text-muted-foreground text-xs">{caption}</span>
                    </div>
                  ) : (
                    <div key={caption} />
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <details className="group rounded-3xl border bg-white/[0.03]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-6 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <BookOpen className="size-4" aria-hidden />
          Just read what you wrote
          <span className="text-muted-foreground ml-auto text-xs group-open:hidden">
            (tip: try remembering first)
          </span>
        </summary>
        <div className="px-4 pb-4">
          <LayerStack layers={memory.layers} />
        </div>
      </details>

      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-white/10 pt-6">
        {editable ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/dig/${memory.id}/edit`}>
              <Pencil aria-hidden /> Edit entry ({Math.max(1, hoursLeft)}h left)
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <DeleteMemoryButton memoryId={memory.id} title={memory.title} />
      </div>
    </PageContainer>
  );
}
