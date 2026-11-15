import type { Metadata } from "next";
import { createMemory } from "@/app/actions/memories";
import { MemoryEntryForm } from "@/components/memory/memory-entry-form";
import { PageContainer } from "@/components/page-container";
import { connection } from "next/server";
import { listPeople } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "New entry" };

export default async function NewEntryPage() {
  await connection();
  const people = await listPeople();
  return (
    <PageContainer narrow className="grid gap-6">
      <div>
        <h1 className="font-hand text-5xl font-bold">New entry</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Get it out of your head and into the ground. You can edit it for 24 hours.
        </p>
      </div>
      <MemoryEntryForm action={createMemory} people={people} cancelHref="/" submitLabel="Bury it" pendingLabel="Burying..." />
    </PageContainer>
  );
}
