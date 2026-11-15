"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ANIMAL_KEYS, randomAnimal, type PersonSummary } from "@/lib/people";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; message: string };

const nameSchema = z.string().trim().min(1, "Give them a name").max(60, "Keep names under 60 characters");
const animalSchema = z.enum(ANIMAL_KEYS as [string, ...string[]]);

function done() {
  revalidatePath("/people");
  revalidatePath("/dig", "layout");
}

/** Add someone to "People in my life" with a random animal avatar. */
export async function addPerson(name: string): Promise<Result<PersonSummary>> {
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({ category: "person", label: parsed.data, avatar: randomAnimal() })
    .select("id, label, avatar")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, message: `${parsed.data} is already in your list.` };
    console.error("[addPerson]", error);
    return { ok: false, message: "Couldn't add them. Please try again." };
  }
  done();
  return { ok: true, data };
}

/** Rename someone or change their avatar. */
export async function updatePerson(
  id: string,
  changes: { label?: string; avatar?: string },
): Promise<Result> {
  const update: { label?: string; avatar?: string } = {};
  if (changes.label !== undefined) {
    const parsed = nameSchema.safeParse(changes.label);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
    update.label = parsed.data;
  }
  if (changes.avatar !== undefined) {
    const parsed = animalSchema.safeParse(changes.avatar);
    if (!parsed.success) return { ok: false, message: "That avatar isn't available." };
    update.avatar = parsed.data;
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("tags")
    .update(update, { count: "exact" })
    .eq("id", id)
    .eq("category", "person");

  if (error || count === 0) {
    if (error?.code === "23505") return { ok: false, message: "Someone with that name is already in your list." };
    console.error("[updatePerson]", error);
    return { ok: false, message: "Couldn't save. Please try again." };
  }
  done();
  return { ok: true, data: undefined };
}

/** Remove someone from the list. Their memories stay; they're just untagged. */
export async function deletePerson(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("tags")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("category", "person");

  if (error || count === 0) {
    console.error("[deletePerson]", error);
    return { ok: false, message: "Couldn't remove them. Please try again." };
  }
  done();
  return { ok: true, data: undefined };
}
