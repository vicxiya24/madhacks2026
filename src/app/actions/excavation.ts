"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMemory } from "@/lib/memory/queries";
import { generatePredictionError } from "@/lib/ai/prediction-error";
import {
  reflectionSchema,
  startExcavationSchema,
  type ReflectionField,
} from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";

/** Opens a time-boxed reconsolidation window with a fresh prediction-error prompt. */
export async function startExcavation(
  memoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = startExcavationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Pick how long you want the window open." };
  }

  const memory = await getMemory(memoryId);
  if (!memory) return { ok: false, message: "That dig site no longer exists." };

  if (memory.activeSession) {
    redirect(`/dig/${memoryId}/excavate/${memory.activeSession.id}`);
  }

  // Generate the prompt *before* opening the window so latency doesn't eat into it.
  const { prompt } = await generatePredictionError({
    title: memory.title,
    layers: memory.layers,
    tags: memory.tags,
  });

  const supabase = await createClient();
  const { data: sessionId, error } = await supabase.rpc("start_excavation", {
    p_memory_id: memoryId,
    p_duration_seconds: parsed.data.durationSeconds,
    p_prompt: prompt,
  });

  if (error || !sessionId) {
    console.error("[startExcavation]", error);
    return { ok: false, message: "Couldn't open an excavation window. Please try again." };
  }

  revalidatePath(`/dig/${memoryId}`);
  redirect(`/dig/${memoryId}/excavate/${sessionId}`);
}

/** The Reframing Crucible's final step: deposit a new reframe layer and close the window. */
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
    p_emotional_valence: parsed.data.emotionalValence,
  });

  if (error || !layerId) {
    console.error("[completeExcavation]", error);
    const closed = error?.message?.includes("labile window") || error?.message?.includes("no longer active");
    return {
      ok: false,
      message: closed
        ? "The labile window has closed and the trace has restabilised. Copy your reflection and open a new excavation."
        : "Couldn't save your reflection. Please try again.",
    };
  }

  revalidatePath(`/dig/${memoryId}`);
  revalidatePath("/dig");
  redirect(`/dig/${memoryId}/delta?justReframed=1`);
}

/** Walk away from a dig without depositing a layer. */
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
