import type { LayerType } from "@/types/memory";

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
