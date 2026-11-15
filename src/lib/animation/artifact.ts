import { z } from "zod";
import { EXPRESSIONS, EXPRESSION_GUIDE } from "@/lib/expressions";
import { ANCHORS, PROP_ITEMS, PROP_ITEM_KEYS, type PropItem } from "./props";

/**
 * A "memory artifact": a structured description of one illustrated scene.
 * Gemini (free text model) or the offline fallback fills it in; the app draws
 * it as a storybook illustration starring your bear and your people's animals.
 */

export const TIMES_OF_DAY = ["dawn", "day", "dusk", "night"] as const;
export const SETTINGS = ["room", "classroom", "hall", "outdoors", "campus", "street", "water", "woods"] as const;
export const INDOOR_SETTINGS: Setting[] = ["room", "classroom", "hall"];
export const WEATHER = ["clear", "rain", "snow", "stars", "fog"] as const;
export const MOODS = ["warm", "tender", "bittersweet", "heavy", "joyful", "eerie"] as const;

export type Setting = (typeof SETTINGS)[number];
export type { Expression } from "@/lib/expressions";

/** Settings from the first version of cards, mapped onto the current ones. */
const LEGACY_SETTINGS: Record<string, Setting> = { home: "room", school: "classroom", city: "street" };

const text = (max: number, fallback: string) =>
  z
    .string()
    .transform((s) => s.replace(/\s+/g, " ").trim().slice(0, max))
    .catch(fallback);

/** A single emoji (only used for "other" props), so the model can't inject markup. */
const emoji = z
  .string()
  .trim()
  .refine((s) => s.length <= 16 && /^\p{Extended_Pictographic}/u.test(s) && !/[A-Za-z0-9<>&"']/.test(s));

const propSchema = z.preprocess(
  // First-version props were just { emoji, label }: treat them as "other" props in the sky.
  (raw) => (raw && typeof raw === "object" && !("item" in raw) ? { item: "other", anchor: "sky", ...raw } : raw),
  z.object({
    item: z.enum(PROP_ITEM_KEYS as [PropItem, ...PropItem[]]),
    emoji: emoji.optional().catch(undefined),
    label: text(40, ""),
    anchor: z.enum(ANCHORS).catch("hand"),
    character: z.string().max(80).optional().catch(undefined),
  }),
);

// Every field tolerates a bad value from the model by falling back, rather than failing the whole card.
export const artifactSchema = z.object({
  name: text(60, "An unearthed memory"),
  caption: text(180, ""),
  fieldNote: text(320, ""),
  timeOfDay: z.enum(TIMES_OF_DAY).catch("night"),
  setting: z.preprocess((v) => (typeof v === "string" && v in LEGACY_SETTINGS ? LEGACY_SETTINGS[v] : v), z.enum(SETTINGS)).catch("outdoors"),
  weather: z.enum(WEATHER).catch("clear"),
  mood: z.enum(MOODS).catch("tender"),
  props: z
    .array(propSchema.nullable().catch(null))
    .catch([])
    .transform((ps) => ps.filter((p) => p !== null).slice(0, 5)),
  characters: z
    .array(
      z.object({
        key: z.string().max(80),
        action: text(60, ""),
        expression: z.enum(EXPRESSIONS).catch("calm"),
      }),
    )
    .catch([])
    .transform((cs) => cs.slice(0, 6)),
});

export type Artifact = z.infer<typeof artifactSchema>;
export type ArtifactProp = Artifact["props"][number];
export type ArtifactSource = "gemini" | "local";

/** What the page and the client component get. */
export type ArtifactView = {
  id: string | null;
  artifact: Artifact;
  source: ArtifactSource;
  createdAt: string;
  /** e.g. why the offline version was used */
  notice: string | null;
};

const propCatalogue = Object.entries(PROP_ITEMS)
  .map(([key, p]) => `${key} (${p.anchors.join("/")}): ${p.hint}`)
  .join("; ");

/** JSON Schema handed to Gemini's structured output, mirroring artifactSchema. */
export const ARTIFACT_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Evocative museum-label name for this artifact, max 6 words, e.g. 'The Candlelit Radio'." },
    caption: { type: "string", description: "One sentence describing the illustrated moment, max 25 words." },
    fieldNote: {
      type: "string",
      description:
        "A gentle archaeologist's field note (max 45 words) on what this memory holds, and how it shifted between the first telling and the latest one if there are several.",
    },
    timeOfDay: { type: "string", enum: [...TIMES_OF_DAY] },
    setting: {
      type: "string",
      enum: [...SETTINGS],
      description:
        "Where the moment happens. room = inside a home or any small indoor room; classroom = school class, lab, lecture; hall = prom, dance, party venue, gym, auditorium; campus = university grounds, quad, sidewalks between buildings; street = city, town, roads; outdoors = park, field, backyard, hills; water = beach, lake, pool; woods = forest, camping.",
    },
    weather: { type: "string", enum: [...WEATHER], description: "Use 'stars' for a clear night. Indoors, weather shows through the window." },
    mood: { type: "string", enum: [...MOODS] },
    props: {
      type: "array",
      description: `0 to 4 objects that matter to this memory, each placed where it really is in the scene. Catalogue, as item (allowed anchors): hint. ${propCatalogue}`,
      items: {
        type: "object",
        properties: {
          item: { type: "string", enum: [...PROP_ITEM_KEYS] },
          emoji: { type: "string", description: "Only for item 'other': one emoji for the object." },
          label: { type: "string", description: "What it is, in a few words, e.g. 'prom queen crown'." },
          anchor: { type: "string", enum: [...ANCHORS], description: "Must be one of the item's allowed anchors." },
          character: { type: "string", description: "For head/face/body/hand/beside: the key of the character wearing, holding or standing by it." },
        },
        required: ["item", "label", "anchor"],
      },
    },
    characters: {
      type: "array",
      description: "One entry per cast member, using their exact key.",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          action: { type: "string", description: "What they're doing in this moment, max 6 words." },
          expression: {
            type: "string",
            enum: [...EXPRESSIONS],
            description: Object.entries(EXPRESSION_GUIDE).map(([k, v]) => `${k}: ${v}`).join("; "),
          },
        },
        required: ["key", "action", "expression"],
      },
    },
  },
  required: ["name", "caption", "fieldNote", "timeOfDay", "setting", "weather", "mood", "props", "characters"],
} as const;
