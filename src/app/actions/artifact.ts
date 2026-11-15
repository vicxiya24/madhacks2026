"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getMemoryForArtifact } from "@/lib/animation/queries";
import { GeminiArtifactError, designArtifactWithGemini, isGeminiConfigured } from "@/lib/animation/gemini-artifact";
import { localArtifact } from "@/lib/animation/local-artifact";
import { normalizeArtifact } from "@/lib/animation/normalize";
import type { Artifact, ArtifactSource, ArtifactView } from "@/lib/animation/artifact";
import type { Json } from "@/types/database";

type Result = { ok: true; view: ArtifactView } | { ok: false; message: string };

const OFFLINE_NOTICE: Record<GeminiArtifactError["reason"] | "no-key", string> = {
  "no-key": "Drawn offline. Add a GEMINI_API_KEY for a richer, AI-directed card.",
  quota: "Gemini's free quota is used up for now, so this one was drawn offline. Try again in a minute.",
  auth: "Gemini didn't accept the API key, so this one was drawn offline.",
  unavailable: "Gemini didn't answer in time, so this one was drawn offline.",
  "bad-output": "Gemini's design came back garbled, so this one was drawn offline.",
};

/**
 * "Play it out": design an illustrated artifact card for a memory.
 *
 * A free Gemini text model art-directs the scene from the memory's strata (first
 * telling + latest retelling), clue, tags and cast. If Gemini isn't available
 * for any reason, an offline design is built from the memory itself, so the
 * button always produces a card.
 */
export async function generateMemoryArtifact(memoryId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const found = await getMemoryForArtifact(memoryId);
  if (!found) return { ok: false, message: "We couldn't find that memory." };
  const { memory, cast } = found;

  let artifact: Artifact;
  let source: ArtifactSource = "gemini";
  let notice: string | null = null;

  if (!isGeminiConfigured()) {
    artifact = localArtifact(memory, cast);
    source = "local";
    notice = OFFLINE_NOTICE["no-key"];
  } else {
    try {
      artifact = await designArtifactWithGemini(memory, cast);
    } catch (err) {
      console.error("[generateMemoryArtifact] gemini", err);
      artifact = localArtifact(memory, cast);
      source = "local";
      notice = OFFLINE_NOTICE[err instanceof GeminiArtifactError ? err.reason : "unavailable"];
    }
  }

  // Every cast member once, every prop somewhere sensible, whatever the model returned.
  artifact = normalizeArtifact(artifact, cast);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memory_artifacts")
    .insert({ memory_id: memory.id, artifact: artifact as unknown as Json, source })
    .select("id, created_at")
    .single();

  if (error) {
    // Still show the card; it just won't be there after a refresh.
    console.error("[generateMemoryArtifact] save", error.message);
    notice = [notice, "This card couldn't be saved, so it'll be gone after a refresh."].filter(Boolean).join(" ");
  }

  return {
    ok: true,
    view: {
      id: data?.id ?? null,
      artifact,
      source,
      createdAt: data?.created_at ?? new Date().toISOString(),
      notice,
    },
  };
}
