import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMemory } from "@/lib/memory/queries";
import { getBearVariant } from "@/lib/profile";
import { buildCast, type CastMember } from "./cast";
import { artifactSchema, type ArtifactView } from "./artifact";
import type { MemoryWithStrata } from "@/types/memory";

/** A memory with its strata and the cast (you + tagged people) to draw it with. */
export type MemoryForArtifact = { memory: MemoryWithStrata; cast: CastMember[] };

export const getMemoryForArtifact = cache(async (memoryId: string): Promise<MemoryForArtifact | null> => {
  const [memory, bear] = await Promise.all([getMemory(memoryId), getBearVariant()]);
  if (!memory) return null;
  return { memory, cast: buildCast(bear, memory.tags) };
});

/** The most recent artifact card for a memory, if one has been made. */
export async function getLatestArtifact(memoryId: string): Promise<ArtifactView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memory_artifacts")
    .select("id, artifact, source, created_at")
    .eq("memory_id", memoryId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // e.g. the artifacts migration hasn't been run yet: the rest of the page still works
    console.error("[getLatestArtifact]", error.message);
    return null;
  }
  if (!data) return null;
  const parsed = artifactSchema.safeParse(data.artifact);
  if (!parsed.success) return null;
  return { id: data.id, artifact: parsed.data, source: data.source, createdAt: data.created_at, notice: null };
}
