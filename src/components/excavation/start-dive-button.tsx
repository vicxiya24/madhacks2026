"use client";

import { useActionState } from "react";
import { Waves } from "lucide-react";
import { startExcavation } from "@/app/actions/excavation";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/types/memory";

const initialState: ActionState = { ok: false };

export function StartDiveButton({ memoryId }: { memoryId: string }) {
  const [state, formAction] = useActionState(startExcavation.bind(null, memoryId), initialState);

  return (
    <form action={formAction} className="grid gap-2">
      <SubmitButton size="xl" className="w-full" pendingLabel="Sinking down...">
        <Waves aria-hidden />
        Dive back in
      </SubmitButton>
      {state.message && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}
    </form>
  );
}
