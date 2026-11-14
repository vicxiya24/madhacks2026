"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMemory } from "@/lib/memory/queries";
import { generatePredictionError } from "@/lib/ai/prediction-error";
import { reflectionSchema, type ReflectionField } from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";

/** Kept for DB compatibility; there's no visible timer any more. */
const SESSION_SECONDS = 3600;

/** Start a revisit: user recalls the memory from scratch, guided only by their clue. */
export async function startExcavation(memoryId: string): Promise<ActionState> {
  const memory = await getMemory(memoryId);
  if (!memory) return { ok: false, message: "That memory no longer exists." };

  if (memory.activeSession) {
    redirect(`/dig/${memoryId}/excavate/${memory.activeSession.id}`);
  }

  const { prompt } = await generatePredictionError({
    title: memory.title,
    contextCue: memory.context_cue,
  });

  const supabase = await createClient();
  const { data: sessionId, error } = await supabase.rpc("start_excavation", {
    p_memory_id: memoryId,
    p_duration_seconds: SESSION_SECONDS,
    p_prompt: prompt,
  });

  if (error || !sessionId) {
    console.error("[startExcavation]", error);
    return { ok: false, message: "Couldn't start the dive. Please try again." };
  }

  revalidatePath(`/dig/${memoryId}`);
  redirect(`/dig/${memoryId}/excavate/${sessionId}`);
}

/** Save the recalled version as a new layer, then show how it compares. */
export async function completeExcavation(
  memoryId: string,
  sessionId: string,
  _prev: ActionState<ReflectionField>,
  formData: FormData,
): Promise<ActionState<ReflectionField>> {
  const parsed = reflectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors as ActionState<ReflectionField>["fieldErrors"],
    };
  }

  const supabase = await createClient();
  const { data: layerId, error } = await supabase.rpc("complete_excavation", {
    p_session_id: sessionId,
    p_reflection: parsed.data.reflection,
    p_emotional_weight: parsed.data.emotionalWeight,
    p_emotional_valence: 0,
  });

  if (error || !layerId) {
    console.error("[completeExcavation]", error);
    return {
      ok: false,
      message: error?.message?.includes("no longer active")
        ? "This dive already ended. Copy your writing and start a new one."
        : "Couldn't save your recollection. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/dig/${memoryId}/delta?justRevisited=1`);
}

/** Surface without saving. */
export async function abandonExcavation(memoryId: string, sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("excavation_sessions")
    .update({ status: "abandoned", ended_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("status", "active");

  if (error) console.error("[abandonExcavation]", error);
  revalidatePath(`/dig/${memoryId}`);
  redirect(`/dig/${memoryId}`);
}
