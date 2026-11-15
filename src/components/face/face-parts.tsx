/**
 * Shared face pieces for every character (the bear and all the animals).
 * Each part is drawn around the origin at "bear scale" and placed with a
 * translate + scale, so one set of expressions works on any face.
 */

export type EyeKind =
  | "dot" | "closed" | "happy" | "squint" | "sleepy" | "wide" | "sparkle" | "sad" | "angry" | "heart";
export type MouthKind = "flat" | "smile" | "grin" | "frown" | "wobble" | "o" | "none";
export type ExtraKind = "tears" | "tear" | "fog" | "sparkles" | "sweat" | "blush";

const round = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

function Eye({ kind, side, color, shine, brow }: { kind: EyeKind; side: -1 | 1; color: string; shine: string; brow: string }) {
  const stroke = { ...round, stroke: color, strokeWidth: 4.5 };
  switch (kind) {
    case "closed": // content, eyes shut (downward arcs)
      return <path d="M-8 1 Q0 7 8 1" {...stroke} />;
    case "happy": // ^ ^
      return <path d="M-8 3 Q0 -7 8 3" {...stroke} />;
    case "squint": // > <  (laughing hard)
      return <path d={side < 0 ? "M-7 -6 L5 0 L-7 6" : "M7 -6 L-5 0 L7 6"} {...stroke} />;
    case "sleepy":
      return (
        <g>
          <path d="M-7 0 A7 6 0 0 0 7 0 Z" fill={color} />
          <path d="M-9 0 L9 0" {...stroke} strokeWidth={3.5} />
        </g>
      );
    case "wide":
      return (
        <g>
          <circle r={8} fill={color} />
          <circle cx={2.5} cy={-3} r={2.8} fill={shine} />
        </g>
      );
    case "sparkle":
      return (
        <g>
          <circle r={9} fill={color} />
          <path d="M2 -7 L3.5 -3.5 L7 -2 L3.5 -0.5 L2 3 L0.5 -0.5 L-3 -2 L0.5 -3.5 Z" fill={shine} />
          <circle cx={-3} cy={3} r={1.6} fill={shine} />
        </g>
      );
    case "sad":
      return (
        <g>
          <circle cy={1} r={5.5} fill={color} />
          <path d={side < 0 ? "M-10 -9 L6 -14" : "M-6 -14 L10 -9"} {...stroke} stroke={brow} strokeWidth={3.5} />
        </g>
      );
    case "angry":
      return (
        <g>
          <circle cy={1} r={5.5} fill={color} />
          <path d={side < 0 ? "M-10 -14 L6 -8" : "M-6 -8 L10 -14"} {...stroke} stroke={brow} strokeWidth={4} />
        </g>
      );
    case "heart":
      return <path d="M0 8 C-12 0 -10 -10 -4 -10 C-1 -10 0 -7 0 -6 C0 -7 1 -10 4 -10 C10 -10 12 0 0 8 Z" fill="#f0607a" />;
    default:
      return (
        <g>
          <circle r={6} fill={color} />
          <circle cx={2} cy={-2} r={1.8} fill={shine} />
        </g>
      );
  }
}

export function FaceEyes({
  kind,
  left,
  right,
  y,
  size = 1,
  color,
  shine,
  brow,
}: {
  kind: EyeKind;
  left: number;
  right: number;
  y: number;
  size?: number;
  color: string;
  shine: string;
  brow?: string;
}) {
  return (
    <g>
      {([[left, -1], [right, 1]] as const).map(([x, side]) => (
        <g key={side} transform={`translate(${x} ${y}) scale(${size})`}>
          <Eye kind={kind} side={side} color={color} shine={shine} brow={brow ?? color} />
        </g>
      ))}
    </g>
  );
}

/** `y` is the mouth's resting line. */
export function FaceMouth({ kind, cx, y, size = 1, color }: { kind: MouthKind; cx: number; y: number; size?: number; color: string }) {
  const stroke = { ...round, stroke: color, strokeWidth: 3.5 };
  let shape: React.ReactNode = null;
  switch (kind) {
    case "flat":
      shape = <path d="M-7 0 L7 0" {...stroke} />;
      break;
    case "smile":
      shape = <path d="M-10 -3 Q0 6 10 -3" {...stroke} />;
      break;
    case "grin":
      shape = (
        <g>
          <path d="M-13 -4 Q0 15 13 -4 Z" fill={color} />
          <path d="M-6 6 Q0 2 6 6 Q0 11 -6 6 Z" fill="#f08b9a" />
        </g>
      );
      break;
    case "frown":
      shape = <path d="M-9 4 Q0 -4 9 4" {...stroke} />;
      break;
    case "wobble":
      shape = <path d="M-12 4 Q-7 -2 -2 3 Q3 -2 7 3 Q10 0 12 2" {...stroke} />;
      break;
    case "o":
      shape = <ellipse cy={1} rx={4.5} ry={5.5} fill={color} />;
      break;
  }
  if (!shape) return null;
  return <g transform={`translate(${cx} ${y}) scale(${size})`}>{shape}</g>;
}

const star = (x: number, y: number, s: number) =>
  `M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`;

/** Extras around the face. `head` is the head ellipse, for placing sparkles and sweat. */
export function FaceExtra({
  kind,
  left,
  right,
  y,
  size = 1,
  head,
  blush = "#f08b9a",
}: {
  kind?: ExtraKind;
  left: number;
  right: number;
  y: number;
  size?: number;
  head: { cx: number; cy: number; rx: number; ry: number };
  blush?: string;
}) {
  const s = size;
  switch (kind) {
    case "tears":
      return (
        <g fill="#8fd0ff" opacity="0.9">
          {[left - 3 * s, right + 4 * s].map((x) => (
            <path key={x} d={`M${x - 2 * s} ${y + 7 * s} C${x - 4 * s} ${y + 19 * s} ${x - 6 * s} ${y + 32 * s} ${x - 2 * s} ${y + 42 * s} C${x + 2 * s} ${y + 32 * s} ${x + 2 * s} ${y + 19 * s} ${x + 2 * s} ${y + 7 * s} Z`} />
          ))}
        </g>
      );
    case "tear": {
      const x = right + 7 * s;
      return <path d={`M${x} ${y + 8 * s} C${x - 5 * s} ${y + 16 * s} ${x - 5 * s} ${y + 22 * s} ${x} ${y + 23 * s} C${x + 5 * s} ${y + 22 * s} ${x + 5 * s} ${y + 16 * s} ${x} ${y + 8 * s} Z`} fill="#8fd0ff" />;
    }
    case "fog":
      return (
        <g stroke="#9fb0e6" strokeLinecap="round" fill="none" opacity="0.8">
          <path d={`M${head.cx - head.rx * 1.1} ${y - 14} Q${head.cx - 40} ${y - 24} ${head.cx - 10} ${y - 12} T${head.cx + 50} ${y - 16} T${head.cx + head.rx * 1.25} ${y - 10}`} strokeWidth="7" />
          <path d={`M${head.cx - head.rx * 0.95} ${y + 12} Q${head.cx - 28} ${y + 2} ${head.cx + 4} ${y + 14} T${head.cx + head.rx * 1.2} ${y + 8}`} strokeWidth="6" opacity="0.8" />
        </g>
      );
    case "sparkles":
      return (
        <g fill="#f6d38b">
          <path d={star(head.cx - head.rx * 1.15, head.cy - head.ry * 0.95, 9)} />
          <path d={star(head.cx + head.rx * 1.2, head.cy - head.ry * 1.15, 7)} />
          <path d={star(head.cx + head.rx * 1.25, head.cy + head.ry * 0.55, 6)} />
        </g>
      );
    case "sweat": {
      const x = head.cx + head.rx * 0.78;
      const top = head.cy - head.ry * 0.62;
      return <path d={`M${x} ${top} C${x - 7} ${top + 11} ${x - 7} ${top + 18} ${x} ${top + 19} C${x + 7} ${top + 18} ${x + 7} ${top + 11} ${x} ${top} Z`} fill="#a8dcff" stroke="#6fb6e6" strokeWidth="1.5" />;
    }
    case "blush":
      return (
        <g fill={blush} opacity="0.75">
          <ellipse cx={left - 16 * s} cy={y + 20 * s} rx={13 * s} ry={7.5 * s} />
          <ellipse cx={right + 16 * s} cy={y + 20 * s} rx={13 * s} ry={7.5 * s} />
          <path d={`M${left - 24 * s} ${y + 18 * s} l4 -4 M${left - 16 * s} ${y + 18 * s} l4 -4 M${right + 10 * s} ${y + 18 * s} l4 -4 M${right + 18 * s} ${y + 18 * s} l4 -4`} stroke="#d4607a" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}
