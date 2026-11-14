import type { LayerType, SessionStatus, TagCategory, Tables } from "./database";

export type { LayerType, SessionStatus, TagCategory };

export type Memory = Tables<"memories">;
export type MemoryLayer = Tables<"memory_layers">;
export type ExcavationSession = Tables<"excavation_sessions">;
export type Tag = Tables<"tags">;

export type TagSummary = Pick<Tag, "id" | "category" | "label">;

/** A memory joined with its strata and retrieval cues. */
export type MemoryWithStrata = Memory & {
  layers: MemoryLayer[];
  tags: TagSummary[];
  activeSession: ExcavationSession | null;
};

export type ConsolidationState = "stable" | "labile" | "contested";

export type ConsolidationReading = {
  state: ConsolidationState;
  /** 0 (fully labile) .. 100 (fully consolidated) */
  strength: number;
  rationale: string;
};

/** Shape returned by server actions consumed with useActionState. */
export type ActionState<TFields extends string = string> = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<TFields, string[]>>;
};
