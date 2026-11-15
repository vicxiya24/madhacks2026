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
    const latest = m.layers.at(-1);
    const drift =
      first && latest && first.id !== latest.id
        ? Math.round((1 - lexicalOverlap(first.content, latest.content)) * 100)
        : 0;
    const consolidation = readConsolidation(m, m.layers, m.activeSession);
    return {
      id: m.id,
      title: m.title,
      drift,
      state: consolidation.state,
      strength: consolidation.strength,
      excavations: m.layers.filter((l) => l.layer_type === "reframe").length,
    };
  });

  // Edges between memories that share a tag label
  const edges: { source: string; target: string }[] = [];
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const labelsA = new Set(memories[i].tags.map((t) => t.label));
      const shared = memories[j].tags.some((t) => labelsA.has(t.label));
      if (shared) edges.push({ source: memories[i].id, target: memories[j].id });
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0d0e1f]">
      <div className="absolute inset-0">
        <MemoryGraph nodes={nodes} edges={edges} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="font-hand text-2xl font-bold text-[#eef1ff]">memory map</h1>
          <p className="font-hand text-sm text-[#aab3dc]">
            {nodes.length} {nodes.length === 1 ? "memory" : "memories"} · click to explore
          </p>
        </div>
        <a
          href="/dig"
          className="font-hand rounded-full border border-[#c9d6ff]/30 px-4 py-1.5 text-sm text-[#c9d6ff]/80 transition hover:border-[#c9d6ff]/60 hover:text-[#c9d6ff]"
        >
          ← dig site
        </a>
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 flex gap-4 text-xs text-[#aab3dc] font-hand">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#7ecfb3] inline-block" />stable</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#f4c97a] inline-block" />contested</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#e07ea0] inline-block" />labile</span>
      </div>
    </main>
  );
}
