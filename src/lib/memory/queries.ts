import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  ExcavationSession,
  MemoryLayer,
  MemoryWithStrata,
  TagSummary,
} from "@/types/memory";
import type { Memory } from "@/types/memory";

const MEMORY_SELECT = `
  *,
  memory_layers (*),
  memory_tags ( tags ( id, category, label ) ),
  excavation_sessions ( * )
` as const;

type RawMemoryRow = Memory & {
  memory_layers: MemoryLayer[] | null;
  memory_tags: { tags: TagSummary | null }[] | null;
  excavation_sessions: ExcavationSession[] | null;
};

function normalise(row: RawMemoryRow): MemoryWithStrata {
  const { memory_layers, memory_tags, excavation_sessions, ...memory } = row;
  const now = Date.now();
  const activeSession =
    (excavation_sessions ?? [])
      .filter((s) => s.status === "active" && new Date(s.expires_at).getTime() > now)
      .sort((a, b) => b.started_at.localeCompare(a.started_at))[0] ?? null;

  return {
    ...memory,
    layers: [...(memory_layers ?? [])].sort((a, b) => a.version - b.version),
    tags: (memory_tags ?? [])
      .map((mt) => mt.tags)
      .filter((t): t is TagSummary => t !== null),
    activeSession,
  };
}

/** All of the user's dig sites, ordered surface (recent) to bedrock (oldest). */
export const listMemories = cache(async (): Promise<MemoryWithStrata[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .order("occurred_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load memories: ${error.message}`);
  return (data as unknown as RawMemoryRow[]).map(normalise);
});

export const getMemory = cache(async (id: string): Promise<MemoryWithStrata | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    // invalid uuid -> treat as not found
    if (error.code === "22P02") return null;
    throw new Error(`Failed to load memory: ${error.message}`);
  }
  return data ? normalise(data as unknown as RawMemoryRow) : null;
});

export const getSession = cache(async (id: string): Promise<ExcavationSession | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("excavation_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(`Failed to load session: ${error.message}`);
  }
  return data;
});
