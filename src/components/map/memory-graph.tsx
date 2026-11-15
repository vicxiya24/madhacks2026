"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ConsolidationState } from "@/types/memory";

const ForceGraph2D = dynamic(() => import("react-force-graph").then((m) => m.ForceGraph2D), {
  ssr: false,
});

type GraphNode = {
  id: string;
  title: string;
  drift: number;
  state: ConsolidationState;
  strength: number;
  excavations: number;
};

type GraphEdge = {
  source: string;
  target: string;
};

const STATE_COLOR: Record<ConsolidationState, string> = {
  stable: "#7ecfb3",
  contested: "#f4c97a",
  labile: "#e07ea0",
};

export function MemoryGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hovered, setHovered] = useState<GraphNode | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    obs.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  const graphData = {
    nodes: nodes.map((n) => ({ ...n })),
    links: edges.map((e) => ({ ...e })),
  };

  const nodeCanvasObject = useCallback(
    (node: GraphNode & { x?: number; y?: number }, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const radius = 6 + node.drift * 0.14 + node.excavations * 1.5;
      const color = STATE_COLOR[node.state];

      // glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
      glow.addColorStop(0, color + "55");
      glow.addColorStop(1, color + "00");
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = glow;
      ctx.fill();

      // circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color + "cc";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // drift % label inside if big enough
      if (radius > 12) {
        ctx.font = `bold ${Math.round(radius * 0.8)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#0d0e1f";
        ctx.fillText(`${node.drift}%`, x, y);
      }
    },
    [],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      {dims.w > 0 && (
        <ForceGraph2D
          width={dims.w}
          height={dims.h}
          graphData={graphData}
          backgroundColor="#0d0e1f"
          nodeCanvasObject={nodeCanvasObject as never}
          nodeCanvasObjectMode={() => "replace"}
          nodePointerAreaPaint={(node: GraphNode & { x?: number; y?: number }, color, ctx) => {
            const r = 6 + node.drift * 0.14 + node.excavations * 1.5 + 4;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkColor={() => "#c9d6ff22"}
          linkWidth={1}
          onNodeHover={(node) => setHovered((node as GraphNode | null))}
          onNodeClick={(node) => {
            window.location.href = `/dig/${(node as GraphNode).id}`;
          }}
          nodeLabel={() => ""}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      )}

      {hovered && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 rounded-2xl border border-[#c9d6ff]/20 bg-[#0d0e1f]/90 px-5 py-3 text-center backdrop-blur-sm">
          <p className="font-hand text-lg font-bold text-[#eef1ff]">{hovered.title}</p>
          <p className="font-hand text-sm text-[#aab3dc]">
            {hovered.drift}% drift · {hovered.excavations} excavation{hovered.excavations !== 1 ? "s" : ""} ·{" "}
            <span style={{ color: STATE_COLOR[hovered.state] }}>{hovered.state}</span>
          </p>
        </div>
      )}
    </div>
  );
}
