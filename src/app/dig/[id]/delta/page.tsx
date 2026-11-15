import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/page-container";
import { ClueCard } from "@/components/memory/clue-card";
import { CueList } from "@/components/memory/cue-list";
import { VersionDelta } from "@/components/delta/version-delta";
import { getMemory } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "How it's changed" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ justRevisited?: string }>;
};

export default async function DeltaPage({ params, searchParams }: Props) {
  const [{ id }, { justRevisited }] = await Promise.all([params, searchParams]);
  const memory = await getMemory(id);
  if (!memory) notFound();

  return (
    <PageContainer className="grid gap-8">
      <div>
        <Link href={`/dig/${memory.id}`} className="text-muted-foreground hover:text-foreground text-sm">
          &larr; {memory.title}
        </Link>
        <h1 className="font-hand mt-2 text-5xl font-bold">How it&apos;s changed</h1>
      </div>

      {justRevisited && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-3xl border border-[#f6d38b]/30 bg-[#f6d38b]/10 px-6 py-4 text-sm"
        >
          <Sparkles className="mt-0.5 size-4 shrink-0 text-[#f6d38b]" aria-hidden />
          <p>
            You&apos;ve resurfaced. Here&apos;s what you remembered tonight next to what you
            first wrote.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        <ClueCard clue={memory.context_cue} />
        <CueList cues={memory.tags} />
      </div>

      {memory.layers.length < 2 ? (
        <div className="grid place-items-center gap-3 rounded-3xl border border-dashed px-6 py-16 text-center">
          <p className="font-hand text-3xl font-bold">Only one telling so far</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Dive back in and write it again from memory, then come back to compare.
          </p>
          <Button asChild className="mt-2 rounded-full">
            <Link href={`/dig/${memory.id}`}>Back to the fossil</Link>
          </Button>
        </div>
      ) : (
        <VersionDelta layers={memory.layers} />
      )}
    </PageContainer>
  );
}
