"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConsolidationState } from "@/types/memory";

type GraphNode = {
  id: string;
  title: string;
  drift: number;
  driftHistory: number[];
  state: ConsolidationState;
  strength: number;
  excavations: number;
};

type GraphEdge = { source: string; target: string; sharedTags?: string[] };

const STATE_COLOR: Record<ConsolidationState, string> = {
  stable: "#7ecfb3",
  contested: "#f4c97a",
  labile: "#e07ea0",
};

const STATE_LABEL: Record<ConsolidationState, string> = {
  stable: "Stable",
  contested: "Contested",
  labile: "Labile",
};

const DEMO_NODES: GraphNode[] = [
  { id: "d1", title: "First day of college", drift: 72, driftHistory: [30, 55, 72], state: "contested", strength: 48, excavations: 3 },
  { id: "d2", title: "Grandma's kitchen", drift: 18, driftHistory: [18], state: "stable", strength: 90, excavations: 1 },
  { id: "d3", title: "The argument on the stairs", drift: 85, driftHistory: [40, 60, 70, 78, 85], state: "labile", strength: 22, excavations: 5 },
  { id: "d4", title: "Learning to ride a bike", drift: 31, driftHistory: [20, 31], state: "stable", strength: 85, excavations: 2 },
  { id: "d5", title: "Night before the interview", drift: 54, driftHistory: [25, 54], state: "contested", strength: 60, excavations: 2 },
  { id: "d6", title: "The last summer together", drift: 91, driftHistory: [22, 45, 61, 78, 88, 91], state: "labile", strength: 15, excavations: 6 },
  { id: "d7", title: "Moving to a new city", drift: 43, driftHistory: [43], state: "stable", strength: 75, excavations: 1 },
  { id: "d8", title: "That concert in the rain", drift: 67, driftHistory: [30, 48, 60, 67], state: "contested", strength: 52, excavations: 4 },
];

const DEMO_EDGES: GraphEdge[] = [
  { source: "d1", target: "d5" },
  { source: "d1", target: "d7" },
  { source: "d2", target: "d4" },
  { source: "d2", target: "d7" },
  { source: "d3", target: "d6" },
  { source: "d3", target: "d8" },
  { source: "d4", target: "d5" },
  { source: "d5", target: "d7" },
  { source: "d6", target: "d8" },
  { source: "d1", target: "d3" },
];

const VIEW_W = 1000;
const VIEW_H = 700;

export function MemoryGraph({
  nodes: realNodes,
  edges: realEdges,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}) {
  const nodes = realNodes.map((n) => ({ ...n, driftHistory: n.driftHistory ?? [] }));
  const edges = realEdges;

  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<{ edge: GraphEdge; mx: number; my: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => Math.min(3, Math.max(0.3, s * (e.deltaY > 0 ? 0.9 : 1.1))));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return;
      dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    },
    [pan],
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.px + e.clientX - dragRef.current.sx,
      y: dragRef.current.py + e.clientY - dragRef.current.sy,
    });
  }, []);

  const stopDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (nodes.length === 0) return map;

    const cx = VIEW_W / 2;
    const cy = VIEW_H / 2;
    const initR = Math.min(cx, cy) * 0.55;

    // Seed in a circle so the simulation starts symmetric
    const pts = nodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      return { id: n.id, x: cx + initR * Math.cos(angle), y: cy + initR * Math.sin(angle), vx: 0, vy: 0 };
    });

    const MIN_DIST = 140;

    for (let iter = 0; iter < 300; iter++) {
      const cool = 1 - iter / 300;

      // Repulsion
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[j].x - pts[i].x;
          const dy = pts[j].y - pts[i].y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const f = (12000 / (d * d)) * cool;
          pts[i].vx -= (dx / d) * f;
          pts[i].vy -= (dy / d) * f;
          pts[j].vx += (dx / d) * f;
          pts[j].vy += (dy / d) * f;
        }
      }

      // Attraction along edges (weaker so repulsion wins locally)
      edges.forEach((e) => {
        const a = pts.find((p) => p.id === e.source);
        const b = pts.find((p) => p.id === e.target);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const f = d * 0.02 * cool;
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      });

      // Weak center gravity
      pts.forEach((p) => {
        p.vx += (cx - p.x) * 0.002 * cool;
        p.vy += (cy - p.y) * 0.002 * cool;
        p.x = Math.max(100, Math.min(VIEW_W - 100, p.x + p.vx));
        p.y = Math.max(100, Math.min(VIEW_H - 100, p.y + p.vy));
        p.vx *= 0.5;
        p.vy *= 0.5;
      });
    }

    // Hard minimum-distance pass — push overlapping nodes apart
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
        if (d < MIN_DIST) {
          const push = (MIN_DIST - d) / 2;
          pts[i].x -= (dx / d) * push;
          pts[i].y -= (dy / d) * push;
          pts[j].x += (dx / d) * push;
          pts[j].y += (dy / d) * push;
        }
      }
    }

    pts.forEach((p) => map.set(p.id, { x: p.x, y: p.y }));
    return map;
  }, [nodes, edges]);

  // size = excavation depth — more revisited = physically larger
  const nodeRadius = (n: GraphNode) => 13 + n.excavations * 4;
  const pct = (v: number, max: number) => `${(v / max) * 100}%`;
  const focusId = hoveredId ?? activeNode?.id ?? null;
  const isActive = (s: string, t: string) => focusId !== null && (focusId === s || focusId === t);
  const isConnected = (id: string) => {
    if (!focusId) return false;
    if (focusId === id) return true;
    return edges.some((e) => (e.source === focusId && e.target === id) || (e.target === focusId && e.source === id));
  };

  return (
    <div className="relative h-full w-full bg-[#0d0e1f] overflow-hidden">
      <div className="relative flex h-full w-full overflow-hidden">

        {/* Zoomable / pannable graph area */}
        <div
          ref={containerRef}
          className="relative flex-1 cursor-grab overflow-hidden select-none"
          style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onClick={() => { setActiveNode(null); setActiveEdge(null); }}
        >
          {/* Transform wrapper */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <defs>
                <filter id="memGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {edges.map((e, i) => {
                const s = positions.get(e.source);
                const t = positions.get(e.target);
                if (!s || !t) return null;
                const active = isActive(e.source, e.target);
                const hasAny = focusId !== null;
                const d = `M ${s.x},${s.y} L ${t.x},${t.y}`;
                const mx = (s.x + t.x) / 2;
                const my = (s.y + t.y) / 2;
                return (
                  <g key={i}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke="#c9d6ff"
                      strokeWidth={active ? 2 : 1}
                      strokeLinecap="round"
                      animate={{ opacity: hasAny ? (active ? 0.7 : 0.05) : 0.25 }}
                      transition={{ duration: 0.25 }}
                    />
                    <motion.path
                      d={d}
                      fill="none"
                      stroke="#c9d6ff"
                      strokeWidth={active ? 3 : 1.5}
                      strokeLinecap="round"
                      filter="url(#memGlow)"
                      style={{ strokeDasharray: "10 32" }}
                      animate={{
                        opacity: active ? 1 : hasAny ? 0 : 0.3,
                        strokeDashoffset: [-80, 0],
                      }}
                      transition={{
                        opacity: { duration: 0.25 },
                        strokeDashoffset: { repeat: Infinity, ease: "linear", duration: active ? 1.2 : 3.5 },
                      }}
                    />
                    {/* Click hit area */}
                    <path
                      d={d}
                      fill="none"
                      stroke="white"
                      strokeWidth={24}
                      strokeOpacity={0.001}
                      style={{ cursor: "pointer" }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setActiveEdge((prev) =>
                          prev?.mx === mx && prev?.my === my ? null : { edge: e, mx, my }
                        );
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {nodes.map((n) => {
              const pos = positions.get(n.id);
              if (!pos) return null;
              const r = nodeRadius(n);
              const color = STATE_COLOR[n.state];
              const focused = focusId === n.id;
              const faded = focusId !== null && !isConnected(n.id);
              return (
                <motion.div
                  key={n.id}
                  data-node="true"
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: pct(pos.x, VIEW_W), top: pct(pos.y, VIEW_H) }}
                  animate={{ opacity: faded ? 0.15 : 1 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={(e) => { e.stopPropagation(); setActiveNode(n); }}
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className="rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      width: r * 2,
                      height: r * 2,
                      backgroundColor: focused ? color : color + "cc",
                      border: `2.5px solid ${focused ? "#ffffff" : color + "88"}`,
                      boxShadow: focused
                        ? `0 0 20px ${color}, 0 0 40px ${color}66`
                        : `0 0 10px ${color}55`,
                    }}
                  >
                    {r > 14 && (
                      <span className="font-hand text-[10px] font-bold text-[#0d0e1f]">{n.drift}%</span>
                    )}
                  </div>
                  <div className="pointer-events-none absolute top-full mt-1.5 w-28 left-1/2 -translate-x-1/2 text-center">
                    <span className="font-hand text-[11px] leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                      style={{ color: focused ? "#eef1ff" : "#c9d6ffaa" }}>
                      {n.title}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-hand text-lg text-[#aab3dc]">no memories yet. write your first entry.</p>
              </div>
            )}

            {/* Edge tooltip */}
            <AnimatePresence>
              {activeEdge && activeEdge.edge.sharedTags && activeEdge.edge.sharedTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
                  style={{ left: pct(activeEdge.mx, VIEW_W), top: pct(activeEdge.my, VIEW_H) }}
                >
                  <div className="rounded-lg border border-[#c9d6ff]/20 bg-[#0d0e1f]/90 backdrop-blur-sm px-3 py-2 mb-2">
                    <p className="font-hand text-[10px] uppercase tracking-widest text-[#aab3dc]/50 mb-1.5">in common</p>
                    <div className="flex flex-wrap gap-1">
                      {activeEdge.edge.sharedTags.map((tag) => (
                        <span key={tag} className="font-hand text-xs rounded-full border border-[#c9d6ff]/20 bg-[#c9d6ff]/10 px-2 py-0.5 text-[#c9d6ff]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend overlay — top left */}
        <div className="pointer-events-none absolute top-4 left-4 z-20 rounded-xl border border-[#c9d6ff]/15 bg-[#0d0e1f]/70 backdrop-blur-sm px-4 py-3 flex flex-col gap-2">
          {(["stable", "contested", "labile"] as ConsolidationState[]).map((s) => (
            <span key={s} className="font-hand flex items-center gap-2 text-sm text-[#eef1ff]">
              <span className="size-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: STATE_COLOR[s], boxShadow: `0 0 6px ${STATE_COLOR[s]}` }} />
              {s}
            </span>
          ))}
          <div className="mt-1 border-t border-[#c9d6ff]/10 pt-2">
            <span className="font-hand text-xs text-[#aab3dc]/60">size = excavations</span>
          </div>
        </div>


        {/* Detail panel */}
        <AnimatePresence>
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 z-30 w-72 border-l border-[#c9d6ff]/30 bg-[#0d0e1f]/98 p-6 backdrop-blur-md flex flex-col"
            >
              <button
                onClick={() => { setActiveNode(null); setActiveEdge(null); }}
                className="absolute right-5 top-5 text-[#c9d6ff]/70 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="mb-1 text-[10px] uppercase tracking-widest text-[#c9d6ff]/70 font-hand">memory</div>
              <p className="font-hand text-xl font-bold text-white leading-snug mb-6">
                &ldquo;{activeNode.title}&rdquo;
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-[#c9d6ff]/20 bg-[#1a1c35] p-4">
                  <span className="block text-[10px] uppercase tracking-widest text-[#c9d6ff]/80 mb-1 font-hand">drift</span>
                  <span className="font-hand text-3xl font-bold" style={{ color: STATE_COLOR[activeNode.state] }}>
                    {activeNode.drift}%
                  </span>
                  {activeNode.driftHistory.length >= 2 && (
                    <div className="mt-3">
                      <span className="block text-[9px] uppercase tracking-widest text-[#c9d6ff]/60 mb-1.5 font-hand">over time</span>
                      <svg viewBox={`0 0 100 36`} className="w-full" preserveAspectRatio="none">
                        <polyline
                          points={activeNode.driftHistory.map((v, i) =>
                            `${(i / (activeNode.driftHistory.length - 1)) * 100},${36 - (v / 100) * 32}`
                          ).join(" ")}
                          fill="none"
                          stroke={STATE_COLOR[activeNode.state]}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={0.9}
                        />
                        {activeNode.driftHistory.map((v, i) => (
                          <circle
                            key={i}
                            cx={(i / (activeNode.driftHistory.length - 1)) * 100}
                            cy={36 - (v / 100) * 32}
                            r="2.5"
                            fill={STATE_COLOR[activeNode.state]}
                          />
                        ))}
                      </svg>
                      <div className="flex justify-between mt-0.5">
                        <span className="font-hand text-[9px] text-[#c9d6ff]/60">1st</span>
                        <span className="font-hand text-[9px] text-[#c9d6ff]/60">latest</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-[#c9d6ff]/20 bg-[#1a1c35] p-4">
                  <span className="block text-[10px] uppercase tracking-widest text-[#c9d6ff]/80 mb-1 font-hand">state</span>
                  <span className="font-hand text-lg font-bold" style={{ color: STATE_COLOR[activeNode.state] }}>
                    {STATE_LABEL[activeNode.state]}
                  </span>
                </div>
                <div className="rounded-xl border border-[#c9d6ff]/20 bg-[#1a1c35] p-4">
                  <span className="block text-[10px] uppercase tracking-widest text-[#c9d6ff]/80 mb-1 font-hand">excavations</span>
                  <span className="font-hand text-lg font-bold text-white">{activeNode.excavations}</span>
                </div>
              </div>
              <a
                href={`/dig/${activeNode.id}`}
                className="font-hand mt-6 flex items-center justify-center rounded-xl border border-[#c9d6ff]/40 bg-[#1a1c35] py-3 text-sm text-white transition hover:border-[#c9d6ff]/70 hover:bg-[#c9d6ff]/15"
              >
                open memory →
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
