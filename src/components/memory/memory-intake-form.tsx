"use client";

import { usePreservingAction } from "@/hooks/use-preserving-action";
import { createMemory } from "@/app/actions/memories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/submit-button";
import { EmotionFields } from "./emotion-fields";
import { ArtifactTagPicker } from "./artifact-tag-picker";
import { INTAKE_LAYERS, LAYER_META } from "@/lib/memory/constants";
import type { MemoryIntakeField } from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";
import { cn } from "@/lib/utils";

const LAYER_FIELD: Record<(typeof INTAKE_LAYERS)[number], MemoryIntakeField> = {
  core_event: "coreEvent",
  retelling: "retelling",
  current_weight: "currentWeight",
};

const initialState: ActionState<MemoryIntakeField> = { ok: false };

/** Stratigraphic Memory Intake: one memory, deposited as distinct sedimentary layers. */
export function MemoryIntakeForm() {
  const { state, onSubmit, isPending } = usePreservingAction(createMemory, initialState);
  const errors = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  // Displayed shallow → deep so the form reads like digging down.
  const layersTopDown = [...INTAKE_LAYERS].reverse();

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {state.message && !state.ok && (
        <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.message}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Survey the site</CardTitle>
          <CardDescription>Name the memory and estimate how deep it&apos;s buried.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="The night the power went out at the lake house"
              maxLength={160}
              aria-invalid={!!errors.title}
              aria-describedby="title-error"
              required
            />
            <FieldError id="title-error" errors={errors.title} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="occurredOn">Approximate date</Label>
              <Input
                id="occurredOn"
                name="occurredOn"
                type="date"
                max={today}
                aria-invalid={!!errors.occurredOn}
                aria-describedby="occurredOn-error"
              />
              <FieldError id="occurredOn-error" errors={errors.occurredOn} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eraLabel">Or an era</Label>
              <Input
                id="eraLabel"
                name="eraLabel"
                placeholder="Summer before 3rd grade"
                maxLength={120}
                aria-invalid={!!errors.eraLabel}
              />
              <FieldError errors={errors.eraLabel} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="py-6">
          <CardTitle className="font-serif text-xl">Sedimentary layers</CardTitle>
          <CardDescription>
            Separate what happened from how it&apos;s been told and how it feels now. Only the core
            event is required.
          </CardDescription>
        </CardHeader>
        {layersTopDown.map((layer, i) => {
          const meta = LAYER_META[layer];
          const field = LAYER_FIELD[layer];
          const isCore = layer === "core_event";
          return (
            <div key={layer} className="relative border-t">
              <div className={cn("absolute inset-y-0 left-0 w-1.5", meta.stratum)} aria-hidden />
              <div className="grid gap-2 py-5 pr-6 pl-8">
                <div className="flex items-baseline justify-between gap-4">
                  <Label htmlFor={field} className="text-base">
                    {meta.label}
                    {isCore && <span className="text-destructive" aria-hidden>*</span>}
                  </Label>
                  <span className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
                    Stratum {layersTopDown.length - i}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{meta.description}</p>
                <Textarea
                  id={field}
                  name={field}
                  placeholder={meta.placeholder}
                  rows={isCore ? 6 : 4}
                  className="min-h-24"
                  aria-invalid={!!errors[field]}
                  aria-describedby={`${field}-error`}
                  required={isCore}
                />
                <FieldError id={`${field}-error`} errors={errors[field]} />
              </div>
            </div>
          );
        })}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Emotional weight</CardTitle>
          <CardDescription>How it registers in you today, before any excavation.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmotionFields context="Current" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Artifacts & retrieval cues</CardTitle>
          <CardDescription>
            Smells, places, people and objects that pull this memory up. They become retrieval
            keys for later digs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArtifactTagPicker />
          <FieldError errors={errors.tags} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton size="lg" pending={isPending} pendingLabel="Burying...">
          Bury this memory
        </SubmitButton>
      </div>
    </form>
  );
}
