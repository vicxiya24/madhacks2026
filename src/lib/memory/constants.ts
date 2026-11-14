import type { LayerType, TagCategory } from "@/types/memory";

export const LAYER_META: Record<
  LayerType,
  { label: string; description: string; placeholder: string; stratum: string }
> = {
  core_event: {
    label: "Core Event",
    description: "The raw recollection. What did your senses record?",
    placeholder:
      "Stick to what you saw, heard, smelled, felt. The kitchen light was yellow, the radio was on...",
    stratum: "bg-stratum-5",
  },
  retelling: {
    label: "Subsequent Retellings",
    description: "How the story has been told since, by you or by others.",
    placeholder:
      "At family dinners it's always told as the time I... My sister remembers it as...",
    stratum: "bg-stratum-4",
  },
  current_weight: {
    label: "Current Emotional Weight",
    description: "What it feels like to hold this memory today.",
    placeholder: "When it surfaces now, I notice a tightness... It still makes me feel...",
    stratum: "bg-stratum-3",
  },
  reframe: {
    label: "Reframe",
    description: "A perspective deposited during an excavation.",
    placeholder: "",
    stratum: "bg-stratum-1",
  },
};

/** Intake layers in stratigraphic order (deepest first). */
export const INTAKE_LAYERS = ["core_event", "retelling", "current_weight"] as const satisfies
  readonly LayerType[];

export const TAG_CATEGORIES: Record<TagCategory, { label: string; hint: string }> = {
  smell: { label: "Smell", hint: "chlorine, pine needles" },
  sound: { label: "Sound", hint: "screen door, cicadas" },
  taste: { label: "Taste", hint: "burnt toast" },
  touch: { label: "Touch", hint: "scratchy wool" },
  sight: { label: "Sight", hint: "orange streetlight" },
  location: { label: "Location", hint: "grandma's porch" },
  person: { label: "Person", hint: "Uncle Ray" },
  emotion: { label: "Emotion", hint: "embarrassment" },
  object: { label: "Object", hint: "red bicycle" },
};

export const TAG_CATEGORY_KEYS = Object.keys(TAG_CATEGORIES) as TagCategory[];

/**
 * Reconsolidation window options. Short, bounded reactivation favours
 * updating the trace; long unstructured exposure risks extinction learning.
 */
export const SESSION_DURATIONS = [
  { seconds: 300, label: "5 min", note: "Light brushing" },
  { seconds: 600, label: "10 min", note: "Standard dig" },
  { seconds: 900, label: "15 min", note: "Deep trench" },
] as const;

export const DEFAULT_SESSION_SECONDS = 600;

/** Mirrors the grace period enforced by complete_excavation() in SQL. */
export const SESSION_GRACE_SECONDS = 120;

/** Hours a freshly reframed trace needs to restabilise. */
export const RESTABILISATION_HOURS = 6;
