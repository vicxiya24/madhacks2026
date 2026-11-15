import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { updateMemory } from "@/app/actions/memories";
import { MemoryEntryForm } from "@/components/memory/memory-entry-form";
import { PageContainer } from "@/components/page-container";
import { getMemory, isEditable, listPeople } from "@/lib/memory/queries";
import { EDIT_WINDOW_HOURS } from "@/lib/memory/constants";

export const metadata: Metadata = { title: "Edit entry" };

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [memory, people] = await Promise.all([getMemory(id), listPeople()]);
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
        <h1 className="font-hand text-5xl font-bold">Edit entry</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          About {hoursLeft} {hoursLeft === 1 ? "hour" : "hours"} left before this memory settles
          for good.
        </p>
      </div>
      <MemoryEntryForm
        action={updateMemory.bind(null, memory.id)}
        people={people}
        cancelHref={`/dig/${memory.id}`}
        submitLabel="Save changes"
        pendingLabel="Saving..."
        defaults={{
          title: memory.title,
          occurredOn: memory.occurred_on,
          eraLabel: memory.era_label,
          content: first?.content,
          contextCue: memory.context_cue,
          vividness: first?.vividness ?? memory.vividness,
          feeling: first?.feeling ?? memory.feeling,
          cues: memory.tags
            .filter((t) => t.category !== "emotion" && t.category !== "person")
            .map((t) => ({ category: t.category, label: t.label })),
          people: memory.tags
            .filter((t) => t.category === "person")
            .map((t) => ({ label: t.label, avatar: t.avatar })),
        }}
      />
    </PageContainer>
  );
}
