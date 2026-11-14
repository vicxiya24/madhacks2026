import { z } from "zod";
import { SESSION_DURATIONS, TAG_CATEGORY_KEYS } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const tagInputSchema = z.object({
  category: z.enum(TAG_CATEGORY_KEYS as [string, ...string[]]),
  label: z.string().trim().min(1).max(60),
});

export const memoryIntakeSchema = z
  .object({
    title: z.string().trim().min(1, "Give this dig site a name").max(160),
    occurredOn: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date")
      .refine((v) => !v || new Date(v) <= new Date(), "Memories can't come from the future"),
    eraLabel: optionalText(120),
    coreEvent: z
      .string()
      .trim()
      .min(10, "Describe the core event in at least a sentence")
      .max(20000),
    retelling: optionalText(20000),
    currentWeight: optionalText(20000),
    emotionalWeight: z.coerce.number().int().min(1).max(10),
    emotionalValence: z.coerce.number().int().min(-5).max(5),
    tags: z
      .string()
      .optional()
      .transform((raw, ctx) => {
        if (!raw) return [];
        try {
          return z.array(tagInputSchema).max(40).parse(JSON.parse(raw));
        } catch {
          ctx.addIssue({ code: "custom", message: "Invalid tags" });
          return z.NEVER;
        }
      }),
  })
  .refine((d) => d.occurredOn || d.eraLabel, {
    message: "Add an approximate date or an era so we know how deep to bury it",
    path: ["occurredOn"],
  });

export type MemoryIntakeInput = z.infer<typeof memoryIntakeSchema>;
export type MemoryIntakeField = keyof z.input<typeof memoryIntakeSchema>;

const allowedDurations = SESSION_DURATIONS.map((d) => d.seconds) as number[];

export const startExcavationSchema = z.object({
  durationSeconds: z.coerce
    .number()
    .int()
    .refine((v) => allowedDurations.includes(v), "Pick a session length"),
});

export const reflectionSchema = z.object({
  reflection: z
    .string()
    .trim()
    .min(20, "Write at least a couple of sentences before re-burying")
    .max(20000),
  emotionalWeight: z.coerce.number().int().min(1).max(10),
  emotionalValence: z.coerce.number().int().min(-5).max(5),
});

export type ReflectionField = keyof z.input<typeof reflectionSchema>;
