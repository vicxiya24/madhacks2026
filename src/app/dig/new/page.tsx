import type { Metadata } from "next";
import { createMemory } from "@/app/actions/memories";
import { MemoryEntryForm } from "@/components/memory/memory-entry-form";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = { title: "New entry" };

export default function NewEntryPage() {
  return (
    <PageContainer narrow className="grid gap-6">
      <div>
        <h1 className="font-hand text-5xl font-bold">new entry</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Get it out of your head and into the ground. You can edit it for 24 hours.
        </p>
      </div>
      <MemoryEntryForm action={createMemory} submitLabel="Bury it" pendingLabel="Burying..." />
    </PageContainer>
  );
}
