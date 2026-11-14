import type { Metadata } from "next";
import { MemoryIntakeForm } from "@/components/memory/memory-intake-form";

export const metadata: Metadata = { title: "Log a memory" };

export default function NewMemoryPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <div>
        <h1 className="font-serif text-3xl">Stratigraphic intake</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Memories aren&apos;t single recordings. They&apos;re layers of the original experience,
          every retelling, and how you feel now. Logging them separately is what lets you see
          them shift.
        </p>
      </div>
      <MemoryIntakeForm />
    </div>
  );
}
