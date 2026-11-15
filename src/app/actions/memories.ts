"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { memoryEntrySchema, type MemoryEntryField } from "@/lib/memory/schemas";
import type { ActionState } from "@/types/memory";
import type { Json } from "@/types/database";

type EntryState = ActionState<MemoryEntryField>;

function invalid(error: z.ZodError): EntryState {
  return {
    ok: false,
    message: "A couple of things need a look before we bury this.",
    fieldErrors: z.flattenError(error).fieldErrors as EntryState["fieldErrors"],
  };
}

/** New entry: one "rant" layer plus a clue for your future self. */
export async function createMemory(_prev: EntryState, formData: FormData): Promise<EntryState> {
  const parsed = memoryEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const input = parsed.data;
  const supabase = await createClient();
  const { data: memoryId, error } = await supabase.rpc("create_memory", {
    p_title: input.title,
    p_occurred_on: input.occurredOn ?? null,
    p_era_label: input.eraLabel ?? null,
    p_context_cue: input.contextCue,
    p_content: input.content,
    p_vividness: input.vividness,
    p_feeling: input.feeling,
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

  revalidatePath("/", "layout");
  redirect(`/dig?buried=${memoryId}`);
}

/** Edit an entry within 24 hours of writing it. */
export async function updateMemory(
  memoryId: string,
  _prev: EntryState,
  formData: FormData,
): Promise<EntryState> {
  const parsed = memoryEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const input = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_recent_memory", {
    p_memory_id: memoryId,
    p_title: input.title,
    p_occurred_on: input.occurredOn ?? null,
    p_era_label: input.eraLabel ?? null,
    p_context_cue: input.contextCue,
    p_content: input.content,
    p_vividness: input.vividness,
    p_feeling: input.feeling,
    p_tags: input.tags as unknown as Json,
  });

  if (error) {
    console.error("[updateMemory]", error);
    return {
      ok: false,
      message: error.message.includes("24 hour")
        ? "The 24 hour edit window has closed. This memory is buried now."
        : "We couldn't save your changes. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/dig/${memoryId}`);
}

/** Permanently delete an entry and everything layered on it. */
export async function deleteMemory(memoryId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("memories")
    .delete({ count: "exact" })
    .eq("id", memoryId);

  if (error || count === 0) {
    console.error("[deleteMemory]", error);
    return { ok: false, message: "Couldn't delete this entry. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dig");
}
