import { z } from "zod";
import { PICKER_CATEGORIES, ROUGH_TIME_LABELS } from "./constants";

const scale = (message: string) => z.coerce.number({ message }).int().min(1, message).max(5, message);

const cueSchema = z.object({
  category: z.enum(PICKER_CATEGORIES as [string, ...string[]]),
  label: z.string().trim().min(1).max(60),
});

const cuesField = z
  .string()
  .optional()
  .transform((raw, ctx) => {
    if (!raw) return [];
    try {
      return z.array(cueSchema).max(40).parse(JSON.parse(raw));
    } catch {
      ctx.addIssue({ code: "custom", message: "Some of those cues didn't look right" });
      return z.NEVER;
    }
  });

const personSchema = z.object({
  label: z.string().trim().min(1).max(60),
  avatar: z.string().regex(/^[a-z]{1,32}$/).nullish(),
});

const peopleField = z
  .string()
  .optional()
  .transform((raw, ctx) => {
    if (!raw) return [];
    try {
      return z.array(personSchema).max(40).parse(JSON.parse(raw));
    } catch {
      ctx.addIssue({ code: "custom", message: "Some of those people didn't look right" });
      return z.NEVER;
    }
  });

export const memoryEntrySchema = z
  .object({
    title: z.string().trim().min(1, "Give this memory a name").max(160),
    occurredOn: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date")
      .refine((v) => !v || new Date(v) <= new Date(), "Memories can't come from the future"),
    eraLabel: z
      .enum(ROUGH_TIME_LABELS, { message: "Pick one of the options" })
      .or(z.literal(""))
      .optional()
      .transform((v) => (v ? v : undefined)),
    content: z.string().trim().min(10, "Let it out. At least a sentence or two").max(20000),
    contextCue: z
      .string()
      .trim()
      .min(3, "Leave yourself a small clue")
      .max(500, "Keep the clue short, so it doesn't give everything away"),
    vividness: scale("Pick the bear that matches how vivid it is"),
    feeling: scale("Pick the bear that matches how it felt"),
    tags: cuesField,
    people: peopleField,
  })
  .refine((d) => d.occurredOn || d.eraLabel, {
    message: "Add a date or pick roughly when, so we know how deep to bury it",
    path: ["occurredOn"],
  })
  // People travel to the database as `person` tags alongside the other cues.
  .transform(({ people, tags, ...rest }) => ({
    ...rest,
    tags: [
      ...tags,
      ...people.map((p) => ({ category: "person" as const, label: p.label, avatar: p.avatar ?? null })),
    ],
  }));

export type MemoryEntryInput = z.infer<typeof memoryEntrySchema>;
export type MemoryEntryField = keyof z.input<typeof memoryEntrySchema>;

export const reflectionSchema = z.object({
  reflection: z.string().trim().min(20, "Write at least a couple of sentences").max(20000),
  vividness: scale("Pick the bear that matches how vivid it is now"),
  feeling: scale("Pick the bear that matches how it feels now"),
});

export type ReflectionField = keyof z.input<typeof reflectionSchema>;
