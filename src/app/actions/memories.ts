"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { memoryIntakeSchema, type MemoryIntakeField } from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";
import type { Json } from "@/types/database";

/** Stratigraphic Memory Intake: validates the form and buries the memory atomically. */
export async function createMemory(
  _prev: ActionState<MemoryIntakeField>,
  formData: FormData,
): Promise<ActionState<MemoryIntakeField>> {
  const parsed = memoryIntakeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "A few fields need attention before we can bury this memory.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as ActionState<MemoryIntakeField>["fieldErrors"],
    };
  }

  const input = parsed.data;
  const layers = [
    { layer_type: "core_event", content: input.coreEvent },
    input.retelling && { layer_type: "retelling", content: input.retelling },
    input.currentWeight && { layer_type: "current_weight", content: input.currentWeight },
  ].filter(Boolean) as Json;

  const supabase = await createClient();
  const { data: memoryId, error } = await supabase.rpc("create_memory", {
    p_title: input.title,
    p_occurred_on: input.occurredOn ?? null,
    p_era_label: input.eraLabel ?? null,
    p_emotional_weight: input.emotionalWeight,
    p_emotional_valence: input.emotionalValence,
    p_layers: layers,
    p_tags: input.tags as unknown as Json,
  });

  if (error || !memoryId) {
    console.error("[createMemory]", error);
    return {
      ok: false,
      message:
        error?.code === "28000"
          ? "Your session expired. Please sign in again."
          : "We couldn't save this memory. Please try again.",
    };
  }

  revalidatePath("/dig");
  redirect(`/dig/${memoryId}`);
}

export async function deleteMemory(memoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("memories").delete().eq("id", memoryId);
  if (error) throw new Error(`Failed to delete memory: ${error.message}`);
  revalidatePath("/dig");
  redirect("/dig");
}
