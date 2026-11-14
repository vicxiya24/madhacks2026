import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : undefined));

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
    eraLabel: optionalText(120),
    content: z
      .string()
      .trim()
      .min(10, "Let it out. At least a sentence or two")
      .max(20000),
    contextCue: z
      .string()
      .trim()
      .min(3, "Leave yourself a small clue")
      .max(500, "Keep the clue short, so it doesn't give everything away"),
    emotionalWeight: z.coerce.number().int().min(1).max(10),
  })
  .refine((d) => d.occurredOn || d.eraLabel, {
    message: "Add a date or a rough time so we know how deep to bury it",
    path: ["occurredOn"],
  });

export type MemoryEntryInput = z.infer<typeof memoryEntrySchema>;
export type MemoryEntryField = keyof z.input<typeof memoryEntrySchema>;

export const reflectionSchema = z.object({
  reflection: z
    .string()
    .trim()
    .min(20, "Write at least a couple of sentences")
    .max(20000),
  emotionalWeight: z.coerce.number().int().min(1).max(10),
});

export type ReflectionField = keyof z.input<typeof reflectionSchema>;
