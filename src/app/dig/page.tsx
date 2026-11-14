import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FossilStrata } from "@/components/dig/fossil-strata";
import { listMemories } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "Your dig site" };

export default async function DigSitePage({
  searchParams,
}: {
  searchParams: Promise<{ buried?: string }>;
}) {
  await connection();
  const [{ buried }, memories] = await Promise.all([searchParams, listMemories()]);

  return (
    <div className="pt-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-6 pb-6">
        <div>
          <h1 className="font-hand text-5xl font-bold">your dig site</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {memories.length === 0
              ? "Nothing's buried yet. Write your first entry and it'll settle into the layers below."
              : buried
                ? "Your memory is buried. Tap any fossil to revisit it."
                : "The deeper the layer, the further back the memory. Tap a fossil to revisit it."}
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/dig/new">
            <Plus aria-hidden /> New entry
          </Link>
        </Button>
      </div>

      <FossilStrata memories={memories} now={Date.now()} highlightId={buried} />
    </div>
  );
}
