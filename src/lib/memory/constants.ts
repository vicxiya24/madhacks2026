import type { LayerType, TagCategory } from "@/types/memory";

export const LAYER_META: Record<LayerType, { label: string; stratum: string }> = {
  core_event: { label: "First telling", stratum: "bg-stratum-2" },
  // legacy layer types from the first schema, still readable
  retelling: { label: "Retelling", stratum: "bg-stratum-3" },
  current_weight: { label: "How it felt", stratum: "bg-stratum-4" },
  reframe: { label: "Revisit", stratum: "bg-stratum-1" },
};

/** Entries can be edited for this long after they're written. */
export const EDIT_WINDOW_HOURS = 24;

/** Hours a freshly revisited memory needs to restabilise. */
export const RESTABILISATION_HOURS = 6;

/**
 * Dig-site strata: the further back a memory happened, the deeper it's buried.
 * `maxDays` is the upper bound (exclusive) for the band.
 */
export const STRATA = [
  { key: "week", label: "this week", maxDays: 7 },
  { key: "month", label: "this month", maxDays: 31 },
  { key: "year", label: "this year", maxDays: 365 },
  { key: "years", label: "a few years ago", maxDays: 365 * 5 },
  { key: "deep", label: "long, long ago", maxDays: Infinity },
] as const;

export type StratumKey = (typeof STRATA)[number]["key"];

/** Retrieval cues ("artifacts") a memory can be tagged with, grouped for the picker. */
export const CUE_CATEGORIES: Record<
  TagCategory,
  { label: string; group: "people & places" | "things" | "senses"; hint: string }
> = {
  person: { label: "Person", group: "people & places", hint: "Uncle Ray" },
  location: { label: "Place", group: "people & places", hint: "grandma's porch" },
  object: { label: "Object", group: "things", hint: "red bicycle" },
  sight: { label: "Sight", group: "senses", hint: "orange streetlight" },
  sound: { label: "Sound", group: "senses", hint: "cicadas" },
  smell: { label: "Smell", group: "senses", hint: "chlorine" },
  taste: { label: "Taste", group: "senses", hint: "burnt toast" },
  touch: { label: "Touch", group: "senses", hint: "scratchy wool" },
  emotion: { label: "Emotion", group: "things", hint: "embarrassment" },
};

/** Categories offered in the picker (emotion is covered by the feeling scale). */
export const PICKER_CATEGORIES: TagCategory[] = [
  "person",
  "location",
  "object",
  "sight",
  "sound",
  "smell",
  "taste",
  "touch",
];
