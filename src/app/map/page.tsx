import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { listMemories } from "@/lib/memory/queries";
import { readConsolidation } from "@/lib/memory/consolidation";
import { lexicalOverlap } from "@/lib/memory/consolidation";
import { MemoryGraph } from "@/components/map/memory-graph";

export const metadata: Metadata = { title: "Memory map" };

export default async function MapPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/map");

  const memories = await listMemories();

  const nodes = memories.map((m) => {
    const first = m.layers.find((l) => l.layer_type === "core_event") ?? m.layers[0];
    const reframes = m.layers.filter((l) => l.layer_type === "reframe");
    const latest = reframes.at(-1);
    const drift =
      first && latest
        ? Math.round((1 - lexicalOverlap(first.content, latest.content)) * 100)
        : 0;
    const driftHistory = first
      ? reframes.map((r) => Math.round((1 - lexicalOverlap(first.content, r.content)) * 100))
      : [];
    const consolidation = readConsolidation(m, m.layers, m.activeSession);
    return {
      id: m.id,
      title: m.title,
      drift,
      driftHistory,
      state: consolidation.state,
      strength: consolidation.strength,
      excavations: reframes.length,
    };
  });

  // Edges between memories that share a tag label
  const edges: { source: string; target: string; sharedTags: string[] }[] = [];
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const labelsA = new Set(memories[i].tags.map((t) => t.label));
      const sharedTags = memories[j].tags.filter((t) => labelsA.has(t.label)).map((t) => t.label);
      if (sharedTags.length > 0) edges.push({ source: memories[i].id, target: memories[j].id, sharedTags });
    }
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#0d0e1f]">
      <div className="absolute inset-0">
        <MemoryGraph nodes={nodes} edges={edges} />
      </div>
      <a
        href="/dig"
        className="font-hand absolute top-5 right-5 z-50 rounded-full border border-[#c9d6ff]/30 bg-[#0d0e1f]/60 backdrop-blur-sm px-4 py-1.5 text-sm text-[#c9d6ff]/80 transition hover:border-[#c9d6ff]/60 hover:text-[#c9d6ff]"
      >
        ← dig site
      </a>
    </main>
  );
}
