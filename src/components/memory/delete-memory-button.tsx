"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteMemory } from "@/app/actions/memories";
import { Button } from "@/components/ui/button";

/** Two-step delete so an entry can't be lost to a stray click. */
export function DeleteMemoryButton({ memoryId, title }: { memoryId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="text-destructive hover:text-destructive rounded-full hover:bg-red-500/10"
        onClick={() => setConfirming(true)}
      >
        <Trash2 aria-hidden /> Delete entry
      </Button>
    );
  }

  return (
    <div role="alertdialog" aria-labelledby="delete-title" className="border-destructive/40 grid gap-3 rounded-2xl border bg-red-500/5 p-4">
      <p id="delete-title" className="text-sm">
        Delete <strong>&ldquo;{title}&rdquo;</strong> and every revisit of it? This can&apos;t be undone.
      </p>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteMemory(memoryId);
              if (res && !res.ok) setError(res.message ?? "Something went wrong.");
            })
          }
        >
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Yes, delete it
        </Button>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => setConfirming(false)} disabled={pending}>
          Keep it
        </Button>
      </div>
    </div>
  );
}
