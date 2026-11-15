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
  { key: "week", label: "This week", maxDays: 7 },
  { key: "month", label: "This month", maxDays: 31 },
  { key: "year", label: "This year", maxDays: 365 },
  { key: "years", label: "A few years ago", maxDays: 365 * 5 },
  { key: "deep", label: "Long, long ago", maxDays: Infinity },
] as const;

export type StratumKey = (typeof STRATA)[number]["key"];

/**
 * "Roughly when" choices for when you don't know the exact date. `daysAgo` is a
 * rough midpoint, counted back from when the entry was written, so a memory
 * written as "a few days ago" still sinks deeper as the months go by.
 */
export const ROUGH_TIMES = [
  { label: "A few days ago", daysAgo: 3 },
  { label: "A few weeks ago", daysAgo: 14 },
  { label: "A few months ago", daysAgo: 90 },
  { label: "About a year ago", daysAgo: 365 },
  { label: "A few years ago", daysAgo: 365 * 3 },
  { label: "A long, long time ago", daysAgo: Infinity },
] as const;

export type RoughTime = (typeof ROUGH_TIMES)[number]["label"];
export const ROUGH_TIME_LABELS = ROUGH_TIMES.map((t) => t.label) as [RoughTime, ...RoughTime[]];

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

/**
 * Categories offered in the cue picker. People have their own picker
 * (with avatars), and emotion is covered by the feeling scale.
 */
export const PICKER_CATEGORIES: TagCategory[] = [
  "location",
  "object",
  "sight",
  "sound",
  "smell",
  "taste",
  "touch",
];
