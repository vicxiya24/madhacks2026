"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Take the bear's suggestion: start the cooldown (the bubble goes quiet for a
 * random stretch) and head to that memory's fossil page to dive back in.
 */
export async function takeReminisce(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memoryId = z.string().uuid().safeParse(formData.get("memoryId"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, reminisce_anchor_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) console.error("[takeReminisce]", error.message); // still take them to the memory

  revalidatePath("/");
  redirect(memoryId.success ? `/dig/${memoryId.data}?reminisce=1` : "/dig");
}
