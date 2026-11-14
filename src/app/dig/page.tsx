import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StrataTimeline } from "@/components/memory/strata-timeline";
import { listMemories } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "Dig site" };

export default async function DigSitePage() {
  const memories = await listMemories();

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Your dig site</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Recent memories sit near the surface. Scroll down to dig into older strata.
          </p>
        </div>
        <Button asChild>
          <Link href="/dig/new">
            <Plus aria-hidden /> Log a memory
          </Link>
        </Button>
      </div>

      {memories.length === 0 ? (
        <div className="soil-texture bg-card grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-20 text-center">
          <p className="font-serif text-xl">Undisturbed ground</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Start with a memory that keeps resurfacing: a childhood scene, an old argument, a
            moment you tell differently every time.
          </p>
          <Button asChild className="mt-2">
            <Link href="/dig/new">Log your first memory</Link>
          </Button>
        </div>
      ) : (
        <StrataTimeline memories={memories} />
      )}
    </div>
  );
}
