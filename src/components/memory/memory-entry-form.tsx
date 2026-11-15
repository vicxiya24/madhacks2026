"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/submit-button";
import { BearScale } from "@/components/bear/bear-scale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PeoplePicker, type DraftPerson } from "@/components/people/people-picker";
import { CuePicker, type DraftCue } from "./cue-picker";
import { ROUGH_TIMES } from "@/lib/memory/constants";
import type { PersonSummary } from "@/lib/people";
import { usePreservingAction } from "@/hooks/use-preserving-action";
import type { MemoryEntryField } from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";

type EntryState = ActionState<MemoryEntryField>;

export type MemoryEntryDefaults = {
  title?: string;
  occurredOn?: string | null;
  eraLabel?: string | null;
  content?: string;
  contextCue?: string | null;
  vividness?: number | null;
  feeling?: number | null;
  cues?: DraftCue[];
  people?: DraftPerson[];
};

const initialState: EntryState = { ok: false };

/** Journal entry form, used for both new entries and 24h edits. */
export function MemoryEntryForm({
  action,
  defaults = {},
  submitLabel,
  pendingLabel,
  people,
  cancelHref,
}: {
  action: (state: EntryState, formData: FormData) => Promise<EntryState>;
  defaults?: MemoryEntryDefaults;
  submitLabel: string;
  pendingLabel: string;
  /** Everyone in "People in my life", to pick from. */
  people: PersonSummary[];
  /** Shows a Cancel button that goes here without saving. */
  cancelHref?: string;
}) {
  const { state, onSubmit, isPending } = usePreservingAction(action, initialState);
  const errors = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {state.message && !state.ok && (
        <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {state.message}
        </p>
      )}

      <Card>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="content" className="font-hand text-3xl font-bold">
              Rant to me about this event.
            </Label>
            <p className="text-muted-foreground text-sm">
              don&apos;t tidy it up. just what you remember.
            </p>
            <Textarea
              id="content"
              name="content"
              rows={12}
              defaultValue={defaults.content}
              placeholder="So there I was..."
              className="min-h-64 rounded-2xl bg-white/5 text-base leading-relaxed"
              aria-invalid={!!errors.content}
              aria-describedby="content-error"
              required
            />
            <FieldError id="content-error" errors={errors.content} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title" className="text-base">What should we call it?</Label>
            <Input
              id="title"
              name="title"
              defaultValue={defaults.title}
              placeholder="The night the power went out"
              maxLength={160}
              className="rounded-xl bg-white/5"
              aria-invalid={!!errors.title}
              aria-describedby="title-error"
              required
            />
            <FieldError id="title-error" errors={errors.title} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="occurredOn">When did it happen?</Label>
              <Input
                id="occurredOn"
                name="occurredOn"
                type="date"
                max={today}
                defaultValue={defaults.occurredOn ?? undefined}
                className="rounded-xl bg-white/5"
                aria-invalid={!!errors.occurredOn}
                aria-describedby="occurredOn-error"
              />
              <FieldError id="occurredOn-error" errors={errors.occurredOn} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eraLabel">...or roughly when</Label>
              <select
                id="eraLabel"
                name="eraLabel"
                defaultValue={ROUGH_TIMES.some((t) => t.label === defaults.eraLabel) ? defaults.eraLabel! : ""}
                className="border-input h-9 w-full rounded-xl border bg-white/5 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-[#1d1f4a]"
                aria-invalid={!!errors.eraLabel}
                aria-describedby="eraLabel-error"
              >
                <option value="">Not sure / I know the date</option>
                {ROUGH_TIMES.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
              <FieldError id="eraLabel-error" errors={errors.eraLabel} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-10">
          <div className="grid gap-1">
            <BearScale
              kind="vividness"
              name="vividness"
              question="How vivid is this memory?"
              hint="Foggy and half-gone, or so clear you could walk around in it?"
              defaultValue={defaults.vividness ?? 3}
            />
            <FieldError errors={errors.vividness} />
          </div>
          <div className="grid gap-3">
            <BearScale
              kind="feeling"
              name="feeling"
              question="How did it feel back then?"
              hint="From painful to warm. You'll be asked again each time you revisit."
              defaultValue={defaults.feeling ?? 3}
            />
            <FieldError errors={errors.feeling} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <h2 className="font-hand text-3xl font-bold">Who was there?</h2>
            <p className="text-muted-foreground text-sm">
              people who were there. or not.
            </p>
            <PeoplePicker people={people} defaultSelected={defaults.people} />
            <FieldError errors={errors.people} />
          </div>
          <div className="grid gap-2 border-t border-white/10 pt-6">
            <h2 className="font-hand text-3xl font-bold">What else was there?</h2>
            <p className="text-muted-foreground text-sm">
              smells. objects. sounds. whatever sticks.
            </p>
            <CuePicker defaultCues={defaults.cues} />
            <FieldError errors={errors.tags} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#d4c9f0]/30">
        <CardContent className="grid gap-2">
          <Label htmlFor="contextCue" className="font-hand text-3xl font-bold">
            Leave a clue for future you.
          </Label>
          <p className="text-muted-foreground text-sm">
            you won&apos;t see any of that up there. just this. enough to find it, not retell it.
          </p>
          <Input
            id="contextCue"
            name="contextCue"
            defaultValue={defaults.contextCue ?? undefined}
            placeholder="lake house · candles · dad's radio"
            maxLength={500}
            className="rounded-xl bg-white/5"
            aria-invalid={!!errors.contextCue}
            aria-describedby="contextCue-error"
            required
          />
          <FieldError id="contextCue-error" errors={errors.contextCue} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {cancelHref && (
          <Button asChild variant="ghost" size="lg" className="rounded-full px-6">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        )}
        <SubmitButton size="lg" pending={isPending} pendingLabel={pendingLabel} className="rounded-full pl-9 pr-7">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
