"use client";

import { useActionState } from "react";
import { Pickaxe } from "lucide-react";
import { startExcavation } from "@/app/actions/excavation";
import { SubmitButton } from "@/components/submit-button";
import { DEFAULT_SESSION_SECONDS, SESSION_DURATIONS } from "@/lib/memory/constants";
import type { ActionState } from "@/types/memory";

const initialState: ActionState = { ok: false };

export function StartExcavationForm({ memoryId }: { memoryId: string }) {
  const [state, formAction] = useActionState(startExcavation.bind(null, memoryId), initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Window length</legend>
        <div className="grid grid-cols-3 gap-2">
          {SESSION_DURATIONS.map((d) => (
            <label
              key={d.seconds}
              className="has-[:checked]:border-primary has-[:checked]:bg-accent hover:bg-accent/50 cursor-pointer rounded-lg border p-3 text-center transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50"
            >
              <input
                type="radio"
                name="durationSeconds"
                value={d.seconds}
                defaultChecked={d.seconds === DEFAULT_SESSION_SECONDS}
                className="sr-only"
              />
              <span className="block font-mono text-sm font-semibold">{d.label}</span>
              <span className="text-muted-foreground block text-[11px]">{d.note}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.message && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}
      <SubmitButton size="lg" pendingLabel="Generating prediction error...">
        <Pickaxe aria-hidden />
        Begin excavation
      </SubmitButton>
    </form>
  );
}
