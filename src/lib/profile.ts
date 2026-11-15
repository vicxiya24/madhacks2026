import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_BEAR, isBearVariant } from "@/lib/bears";
import type { BearVariant } from "@/types/memory";

/** The signed-in user's chosen bear (falls back to honey if unset or signed out). */
export const getBearVariant = cache(async (): Promise<BearVariant> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("bear_variant").maybeSingle();
  if (error) {
    // e.g. the profiles migration hasn't been run yet: don't break the app
    console.error("[getBearVariant]", error.message);
    return DEFAULT_BEAR;
  }
  return isBearVariant(data?.bear_variant) ? data.bear_variant : DEFAULT_BEAR;
});
