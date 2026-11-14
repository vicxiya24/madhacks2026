"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Shovel } from "lucide-react";
import { abandonExcavation, completeExcavation } from "@/app/actions/excavation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/submit-button";
import { EmotionFields } from "@/components/memory/emotion-fields";
import { LayerStack } from "@/components/memory/layer-stack";
import { ReconsolidationTimer } from "./reconsolidation-timer";
import { useLabileWindow } from "@/hooks/use-labile-window";
import { usePreservingAction } from "@/hooks/use-preserving-action";
import { TAG_CATEGORIES } from "@/lib/memory/constants";
import type { ReflectionField } from "@/lib/memory/schemas";
import type { ActionState, ExcavationSession, MemoryWithStrata } from "@/types/memory";
import { cn } from "@/lib/utils";

const initialState: ActionState<ReflectionField> = { ok: false };

export function ExcavationSessionView({
  memory,
  session,
  serverNow,
}: {
  memory: MemoryWithStrata;
  session: ExcavationSession;
  serverNow: number;
}) {
  const { phase, remainingSeconds, graceRemainingSeconds } = useLabileWindow({
    expiresAt: session.expires_at,
    serverNow,
  });

  const { state, onSubmit, isPending } = usePreservingAction(
    completeExcavation.bind(null, memory.id, session.id),
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  // Draft survives refreshes within the session (but never outlives the tab).
  const draftKey = `excavation-draft:${session.id}`;
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

  const closed = phase === "closed";

  return (
    <div className="grid gap-6">
      <div
        className={cn(
          "bg-card soil-texture flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between",
          phase === "open" && "border-labile/60",
          phase === "closing" && "border-contested/60",
        )}
      >
        <ReconsolidationTimer
          phase={phase}
          remainingSeconds={remainingSeconds}
          graceRemainingSeconds={graceRemainingSeconds}
          durationSeconds={session.duration_seconds}
        />
        <div className="text-muted-foreground max-w-sm text-sm">
          Reactivated memories stay modifiable only briefly. Use this window to notice what
          doesn&apos;t fit, then lay down an updated layer before the trace settles again.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="grid content-start gap-6">
          {session.prediction_error_prompt && (
            <Card className="border-primary/40 bg-accent/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                  <Lightbulb className="text-primary size-4" aria-hidden />
                  Prediction error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-lg leading-snug">
                  {session.prediction_error_prompt}
                </p>
              </CardContent>
            </Card>
          )}

          <section className="grid gap-3" aria-labelledby="exposed-strata">
            <h2 id="exposed-strata" className="text-muted-foreground text-sm font-medium">
              Exposed strata
            </h2>
            <LayerStack layers={memory.layers} />
            {memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {memory.tags.map((t) => (
                  <Badge key={t.id} variant="outline" className="font-normal">
                    <span className="text-muted-foreground">{TAG_CATEGORIES[t.category].label}</span>
                    {t.label}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="font-serif text-xl">The Reframing Crucible</CardTitle>
            <CardDescription>
              Don&apos;t rewrite what happened. Write what you see now that you couldn&apos;t see
              before. This becomes a new layer on top; the originals stay intact underneath.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-5" noValidate>
              {state.message && (
                <p
                  role="alert"
                  className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
                >
                  {state.message}
                </p>
              )}
              {phase === "closing" && (
                <p className="border-contested/40 bg-contested/10 rounded-md border px-4 py-3 text-sm">
                  The window has closed. You have a brief grace period to save what you&apos;ve
                  written.
                </p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="reflection">Updated reflection</Label>
                <Textarea
                  id="reflection"
                  name="reflection"
                  rows={10}
                  className="min-h-48"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Looking at it now, I notice..."
                  aria-invalid={!!errors.reflection}
                  aria-describedby="reflection-error"
                  disabled={closed}
                  autoFocus
                />
                <FieldError id="reflection-error" errors={errors.reflection} />
              </div>

              <fieldset disabled={closed} className="grid gap-2">
                <legend className="mb-3 text-sm font-medium">How does it register now?</legend>
                <EmotionFields
                  context="Now"
                  defaultWeight={memory.emotional_weight}
                  defaultValence={memory.emotional_valence}
                />
              </fieldset>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => abandonExcavation(memory.id, session.id)}
                  disabled={isPending}
                >
                  Leave without saving
                </Button>
                <SubmitButton
                  pending={isPending}
                  disabled={closed}
                  pendingLabel="Depositing layer..."
                >
                  <Shovel aria-hidden />
                  Re-bury with new layer
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
