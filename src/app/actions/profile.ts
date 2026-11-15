"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isBearVariant } from "@/lib/bears";
import type { ActionState } from "@/types/memory";

export async function updateBearVariant(variant: string): Promise<ActionState> {
  if (!isBearVariant(variant)) return { ok: false, message: "Unknown bear." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, bear_variant: variant }, { onConflict: "user_id" });

  if (error) {
    console.error("[updateBearVariant]", error);
    return { ok: false, message: "Couldn't save your bear. Please try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Saved" };
}
