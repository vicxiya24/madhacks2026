import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, GitCompareArrows } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsolidationMeter } from "@/components/memory/consolidation-meter";
import { LayerStack } from "@/components/memory/layer-stack";
import { StartExcavationForm } from "@/components/excavation/start-excavation-form";
import { getMemory } from "@/lib/memory/queries";
import { readConsolidation } from "@/lib/memory/consolidation";
import { TAG_CATEGORIES } from "@/lib/memory/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const memory = await getMemory((await params).id);
  return { title: memory?.title ?? "Memory" };
}

export default async function MemoryPage({ params }: Props) {
  const { id } = await params;
  const memory = await getMemory(id);
  if (!memory) notFound();

  const reading = readConsolidation(memory, memory.layers, memory.activeSession);
  const when = formatDate(memory.occurred_on) ?? memory.era_label ?? "Undated";

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/dig" className="text-muted-foreground hover:text-foreground text-sm">
          &larr; Dig site
        </Link>
        <p className="text-muted-foreground mt-4 font-mono text-xs">{when}</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">{memory.title}</h1>
        {memory.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Retrieval cues">
            {memory.tags.map((t) => (
              <li key={t.id}>
                <Badge variant="outline" className="font-normal">
                  <span className="text-muted-foreground">{TAG_CATEGORIES[t.category].label}</span>
                  {t.label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="grid content-start gap-3" aria-labelledby="strata-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="strata-heading" className="text-muted-foreground text-sm font-medium">
              Strata (newest deposit on top)
            </h2>
            {memory.layers.length > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dig/${memory.id}/delta`}>
                  <GitCompareArrows aria-hidden /> Version delta
                </Link>
              </Button>
            )}
          </div>
          <LayerStack layers={memory.layers} />
        </section>

        <aside className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Consolidation strength</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ConsolidationMeter reading={reading} />
              <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                <dt>Intensity</dt>
                <dd className="text-foreground text-right font-mono">{memory.emotional_weight}/10</dd>
                <dt>Tone</dt>
                <dd className="text-foreground text-right font-mono">
                  {memory.emotional_valence > 0 ? "+" : ""}
                  {memory.emotional_valence}
                </dd>
                <dt>Excavations</dt>
                <dd className="text-foreground text-right font-mono">{memory.excavation_count}</dd>
                {memory.last_excavated_at && (
                  <>
                    <dt>Last dug</dt>
                    <dd className="text-foreground text-right">{formatDateTime(memory.last_excavated_at)}</dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card className={memory.activeSession ? "border-labile/60" : undefined}>
            <CardHeader>
              <CardTitle className="font-serif text-lg">
                {memory.activeSession ? "Excavation in progress" : "Open an excavation"}
              </CardTitle>
              <CardDescription>
                {memory.activeSession
                  ? "A reconsolidation window is open for this memory."
                  : "Reactivate this memory inside a short, time-boxed window and add a reframe layer."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memory.activeSession ? (
                <Button asChild size="lg" className="w-full">
                  <Link href={`/dig/${memory.id}/excavate/${memory.activeSession.id}`}>
                    <Activity aria-hidden /> Return to the trench
                  </Link>
                </Button>
              ) : (
                <StartExcavationForm memoryId={memory.id} />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
