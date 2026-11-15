import type { BearVariant } from "@/types/memory";

export type BearPalette = {
  fur: string;
  innerEar: string;
  ears?: string; // defaults to fur
  /** rim around dark ears so they stay visible against the night sky */
  earRim?: string;
  body?: string; // defaults to fur
  belly?: string;
  arms?: string;
  muzzle?: string;
  patches?: string; // panda eye patches
  eye: string;
  /** colour of the little shine in each eye */
  shine: string;
  nose: string;
  blush: string;
  blushOpacity: number;
};

export const BEAR_VARIANTS: Record<BearVariant, { label: string; palette: BearPalette }> = {
  honey: {
    label: "Honey",
    palette: {
      fur: "#dfc4af",
      innerEar: "#d2b19a",
      eye: "#6f5646",
      shine: "#ffffff",
      nose: "#6f5646",
      blush: "#f0a9a9",
      blushOpacity: 0.4,
    },
  },
  cocoa: {
    label: "Cocoa",
    palette: {
      fur: "#b98d6a",
      innerEar: "#9f7352",
      muzzle: "#dcc1a6",
      eye: "#3a2619",
      shine: "#ffffff",
      nose: "#3a2619",
      blush: "#ec8f8f",
      blushOpacity: 0.5,
    },
  },
  chocolate: {
    label: "Chocolate",
    palette: {
      fur: "#7b543b",
      innerEar: "#5f3f2a",
      muzzle: "#bd987a",
      eye: "#1e130c",
      shine: "#fff4e6",
      nose: "#1e130c",
      blush: "#f28a8a",
      blushOpacity: 0.55,
    },
  },
  panda: {
    label: "Panda",
    palette: {
      fur: "#f6f5f0",
      ears: "#26262c",
      earRim: "#c9d6ff",
      innerEar: "#3b3b43",
      body: "#f6f5f0",
      arms: "#26262c",
      patches: "#26262c",
      eye: "#f6f5f0",
      shine: "#26262c",
      nose: "#26262c",
      blush: "#f5a3b5",
      blushOpacity: 0.6,
    },
  },
  polar: {
    label: "Polar",
    palette: {
      fur: "#f8f7f2",
      innerEar: "#e9dfd6",
      eye: "#2c2f45",
      shine: "#ffffff",
      nose: "#2c2f45",
      blush: "#f7a8b8",
      blushOpacity: 0.6,
    },
  },
};

export const BEAR_VARIANT_KEYS = Object.keys(BEAR_VARIANTS) as BearVariant[];
export const DEFAULT_BEAR: BearVariant = "honey";

export function isBearVariant(value: unknown): value is BearVariant {
  return typeof value === "string" && value in BEAR_VARIANTS;
}

// ---------------------------------------------------------------------------
// Expressions
// ---------------------------------------------------------------------------
import type { EyeKind, ExtraKind, MouthKind } from "@/components/face/face-parts";

/** A face for any character (bear or animal). */
export type BearExpression = {
  eyes: EyeKind;
  mouth: MouthKind;
  extra?: ExtraKind;
};

export const NEUTRAL: BearExpression = { eyes: "dot", mouth: "none" };

export type ScaleStep = { value: 1 | 2 | 3 | 4 | 5; label: string; expression: BearExpression };

/** 1 = barely there, 5 = like it happened yesterday. */
export const VIVIDNESS_SCALE: ScaleStep[] = [
  { value: 1, label: "Foggy", expression: { eyes: "closed", mouth: "flat", extra: "fog" } },
  { value: 2, label: "Hazy", expression: { eyes: "sleepy", mouth: "flat" } },
  { value: 3, label: "Patchy", expression: { eyes: "dot", mouth: "flat" } },
  { value: 4, label: "Clear", expression: { eyes: "wide", mouth: "smile" } },
  { value: 5, label: "Crystal clear", expression: { eyes: "sparkle", mouth: "o", extra: "sparkles" } },
];

/** 1 = painful, 5 = warm. */
export const FEELING_SCALE: ScaleStep[] = [
  { value: 1, label: "Painful", expression: { eyes: "sad", mouth: "wobble", extra: "tears" } },
  { value: 2, label: "Heavy", expression: { eyes: "sad", mouth: "frown", extra: "tear" } },
  { value: 3, label: "Mixed", expression: { eyes: "dot", mouth: "flat" } },
  { value: 4, label: "Warm", expression: { eyes: "dot", mouth: "smile" } },
  { value: 5, label: "Glowing", expression: { eyes: "happy", mouth: "grin", extra: "sparkles" } },
];

export type ScaleKind = "vividness" | "feeling";
export const SCALES: Record<ScaleKind, ScaleStep[]> = {
  vividness: VIVIDNESS_SCALE,
  feeling: FEELING_SCALE,
};

export function scaleStep(kind: ScaleKind, value: number | null | undefined): ScaleStep | null {
  if (!value) return null;
  return SCALES[kind].find((s) => s.value === value) ?? null;
}
