import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VersionDelta } from "@/components/delta/version-delta";
import { getMemory } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "Version delta" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ justReframed?: string }>;
};

export default async function DeltaPage({ params, searchParams }: Props) {
  const [{ id }, { justReframed }] = await Promise.all([params, searchParams]);
  const memory = await getMemory(id);
  if (!memory) notFound();

  return (
    <div className="grid gap-8">
      <div>
        <Link href={`/dig/${memory.id}`} className="text-muted-foreground hover:text-foreground text-sm">
          &larr; {memory.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl">Version delta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          How your telling of this memory has shifted between layers.
        </p>
      </div>

      {justReframed && (
        <div
          role="status"
          className="border-stable/40 bg-stable/10 flex items-start gap-3 rounded-xl border px-5 py-4 text-sm"
        >
          <CheckCircle2 className="text-stable mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            New layer deposited. The trace will restabilise over the next few hours. Here&apos;s
            how your reframe compares with the original.
          </p>
        </div>
      )}

      {memory.layers.length < 2 ? (
        <div className="bg-card grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="font-serif text-xl">Only one layer so far</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Run an excavation to deposit a reframe, then come back to compare.
          </p>
          <Button asChild className="mt-2">
            <Link href={`/dig/${memory.id}`}>Back to the memory</Link>
          </Button>
        </div>
      ) : (
        <VersionDelta layers={memory.layers} />
      )}
    </div>
  );
}
