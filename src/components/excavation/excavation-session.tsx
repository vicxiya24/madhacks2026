"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { abandonExcavation, completeExcavation } from "@/app/actions/excavation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/submit-button";
import { BearScale } from "@/components/bear/bear-scale";
import { usePreservingAction } from "@/hooks/use-preserving-action";
import type { ReflectionField } from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";

const initialState: ActionState<ReflectionField> = { ok: false };

/**
 * The dive: recall the memory from scratch. The earlier entry is deliberately
 * not shown here (only the clue, rendered by the page), so this is a genuine
 * reconstruction rather than an edit.
 */
export function ExcavationSessionView({
  memoryId,
  sessionId,
  nudge,
}: {
  memoryId: string;
  sessionId: string;
  nudge: string | null;
}) {
  const { state, onSubmit, isPending } = usePreservingAction(
    completeExcavation.bind(null, memoryId, sessionId),
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  // Draft survives a refresh within this tab.
  const draftKey = `dive-draft:${sessionId}`;
  const [draft, setDraft] = useState("");
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) setDraft(saved);
    } catch {
      /* storage unavailable */
    }
  }, [draftKey]);
  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, draft);
    } catch {
      /* storage unavailable */
    }
  }, [draftKey, draft]);

  return (
    <div className="grid gap-6">
      {nudge && (
        <p className="flex gap-3 rounded-3xl bg-white/[0.04] px-6 py-4 text-[#dfe6ff]">
          <Sparkles className="mt-1 size-4 shrink-0 text-[#f6d38b]" aria-hidden />
          <span className="font-hand text-2xl leading-snug">{nudge}</span>
        </p>
      )}

      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6" noValidate>
            {state.message && (
              <p
                role="alert"
                className="border-destructive/40 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm"
              >
                {state.message}
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="reflection" className="font-hand text-3xl font-bold">
                What do you remember?
              </Label>
              <p className="text-muted-foreground text-sm">
                Tell it the way it comes to you tonight. No peeking. You&apos;ll compare after.
              </p>
              <Textarea
                id="reflection"
                name="reflection"
                rows={12}
                className="min-h-64 rounded-2xl bg-white/5 text-base leading-relaxed"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="I remember..."
                aria-invalid={!!errors.reflection}
                aria-describedby="reflection-error"
                autoFocus
              />
              <FieldError id="reflection-error" errors={errors.reflection} />
            </div>

            <div className="grid gap-2">
              <BearScale kind="vividness" name="vividness" question="How vivid is it now?" />
              <FieldError errors={errors.vividness} />
            </div>
            <div className="grid gap-2">
              <BearScale kind="feeling" name="feeling" question="How does it feel now?" />
              <FieldError errors={errors.feeling} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => abandonExcavation(memoryId, sessionId)}
                disabled={isPending}
              >
                Surface without saving
              </Button>
              <SubmitButton pending={isPending} pendingLabel="Resurfacing..." className="rounded-full px-6">
                Save &amp; compare
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
