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
import { LayerStack } from "@/components/memory/layer-stack";
import { StartDiveButton } from "@/components/excavation/start-dive-button";
import { getMemory, isEditable } from "@/lib/memory/queries";
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
  const memory = await getMemory(id);
  if (!memory) notFound();

  const reading = readConsolidation(memory, memory.layers, memory.activeSession);
  const when = formatDate(memory.occurred_on) ?? memory.era_label ?? "sometime";
  const editable = isEditable(memory);
  const hoursLeft = Math.ceil(
    EDIT_WINDOW_HOURS - (Date.now() - new Date(memory.created_at).getTime()) / 36e5,
  );
  const revisits = memory.layers.filter((l) => l.layer_type === "reframe").length;

  return (
    <PageContainer className="grid gap-8">
      <Link href="/dig" className="text-muted-foreground hover:text-foreground text-sm">
        &larr; back to the dig site
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

      <ClueCard clue={memory.context_cue} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="grid gap-4">
              <div>
                <h2 className="font-hand text-3xl font-bold">
                  {memory.activeSession ? "You're mid-dive" : "Try to remember it first"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Dive back in and write it down again from memory, using only the clue. Then
                  see how your memory has shifted since you first buried it.
                </p>
              </div>
              {memory.activeSession ? (
                <Button asChild size="lg" className="rounded-full">
                  <Link href={`/dig/${memory.id}/excavate/${memory.activeSession.id}`}>
                    <Activity aria-hidden /> Return to your dive
                  </Link>
                </Button>
              ) : (
                <StartDiveButton memoryId={memory.id} />
              )}
            </CardContent>
          </Card>

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
        </div>

        <aside className="grid content-start gap-4">
          <Card>
            <CardContent className="grid gap-3">
              <h2 className="text-sm font-medium">How settled is it?</h2>
              <ConsolidationMeter reading={reading} />
            </CardContent>
          </Card>

          {memory.layers.length > 1 && (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/dig/${memory.id}/delta`}>
                <GitCompareArrows aria-hidden /> See how it&apos;s changed
              </Link>
            </Button>
          )}

          {editable && (
            <Button asChild variant="ghost" className="rounded-full">
              <Link href={`/dig/${memory.id}/edit`}>
                <Pencil aria-hidden /> Edit entry ({Math.max(1, hoursLeft)}h left)
              </Link>
            </Button>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
