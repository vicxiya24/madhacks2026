"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types/memory";

const credentialsSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  mode: z.enum(["sign-in", "sign-up"]),
  next: z.string().optional(),
});

type AuthField = "email" | "password";

/** Only allow same-origin relative redirects. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dig";
}

export async function authenticate(
  _prev: ActionState<AuthField>,
  formData: FormData,
): Promise<ActionState<AuthField>> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors as ActionState<AuthField>["fieldErrors"],
    };
  }

  const { email, password, mode, next } = parsed.data;
  const supabase = await createClient();

  if (mode === "sign-up") {
    const origin = (await headers()).get("origin") ?? "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
    });
    if (error) return { ok: false, message: error.message };
    if (!data.session) {
      return { ok: true, message: "Check your inbox to confirm your email, then sign in." };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
  }

  redirect(safeNext(next));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
