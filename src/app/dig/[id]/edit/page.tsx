import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { updateMemory } from "@/app/actions/memories";
import { MemoryEntryForm } from "@/components/memory/memory-entry-form";
import { PageContainer } from "@/components/page-container";
import { getMemory, isEditable } from "@/lib/memory/queries";
import { EDIT_WINDOW_HOURS } from "@/lib/memory/constants";

export const metadata: Metadata = { title: "Edit entry" };

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const memory = await getMemory(id);
  if (!memory) notFound();
  if (!isEditable(memory)) redirect(`/dig/${id}`);

  const first = memory.layers.find((l) => l.layer_type === "core_event") ?? memory.layers[0];
  const hoursLeft = Math.max(
    1,
    Math.ceil(EDIT_WINDOW_HOURS - (Date.now() - new Date(memory.created_at).getTime()) / 36e5),
  );

  return (
    <PageContainer narrow className="grid gap-6">
      <div>
        <h1 className="font-hand text-5xl font-bold">edit entry</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          About {hoursLeft} {hoursLeft === 1 ? "hour" : "hours"} left before this memory settles
          for good.
        </p>
      </div>
      <MemoryEntryForm
        action={updateMemory.bind(null, memory.id)}
        submitLabel="Save changes"
        pendingLabel="Saving..."
        defaults={{
          title: memory.title,
          occurredOn: memory.occurred_on,
          eraLabel: memory.era_label,
          content: first?.content,
          contextCue: memory.context_cue,
          emotionalWeight: first?.emotional_weight ?? memory.emotional_weight,
        }}
      />
    </PageContainer>
  );
}
