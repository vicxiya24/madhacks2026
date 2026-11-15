import { useId } from "react";
import { BEAR_VARIANTS, NEUTRAL, type BearExpression } from "@/lib/bears";
import type { BearVariant } from "@/types/memory";
import { cn } from "@/lib/utils";

const EYE_L = 78;
const EYE_R = 124;
const EYE_Y = 96;

function Eyes({
  kind,
  color,
  shine,
  brow,
}: {
  kind: BearExpression["eyes"];
  color: string;
  shine: string;
  /** brows sit on fur, not on panda patches, so they use the nose colour */
  brow: string;
}) {
  const stroke = { stroke: color, strokeWidth: 4.5, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      {[EYE_L, EYE_R].map((x, i) => {
        const side = i === 0 ? -1 : 1;
        switch (kind) {
          case "closed":
            return <path key={x} d={`M${x - 8} ${EYE_Y + 1} Q${x} ${EYE_Y + 7} ${x + 8} ${EYE_Y + 1}`} {...stroke} />;
          case "happy":
            return <path key={x} d={`M${x - 8} ${EYE_Y + 3} Q${x} ${EYE_Y - 7} ${x + 8} ${EYE_Y + 3}`} {...stroke} />;
          case "sleepy":
            return (
              <g key={x}>
                <path d={`M${x - 7} ${EYE_Y} A7 6 0 0 0 ${x + 7} ${EYE_Y} Z`} fill={color} />
                <path d={`M${x - 9} ${EYE_Y} L${x + 9} ${EYE_Y}`} {...stroke} strokeWidth={3.5} />
              </g>
            );
          case "wide":
            return (
              <g key={x}>
                <circle cx={x} cy={EYE_Y} r={8} fill={color} />
                <circle cx={x + 2.5} cy={EYE_Y - 3} r={2.8} fill={shine} />
              </g>
            );
          case "sparkle":
            return (
              <g key={x}>
                <circle cx={x} cy={EYE_Y} r={9} fill={color} />
                <path
                  d={`M${x + 2} ${EYE_Y - 7} L${x + 3.5} ${EYE_Y - 3.5} L${x + 7} ${EYE_Y - 2} L${x + 3.5} ${EYE_Y - 0.5} L${x + 2} ${EYE_Y + 3} L${x + 0.5} ${EYE_Y - 0.5} L${x - 3} ${EYE_Y - 2} L${x + 0.5} ${EYE_Y - 3.5} Z`}
                  fill={shine}
                />
                <circle cx={x - 3} cy={EYE_Y + 3} r={1.6} fill={shine} />
              </g>
            );
          case "sad":
            return (
              <g key={x}>
                <circle cx={x} cy={EYE_Y + 1} r={5.5} fill={color} />
                {/* brows: inner ends raised */}
                <path
                  d={side < 0 ? `M${x - 10} ${EYE_Y - 9} L${x + 6} ${EYE_Y - 14}` : `M${x - 6} ${EYE_Y - 14} L${x + 10} ${EYE_Y - 9}`}
                  {...stroke}
                  stroke={brow}
                  strokeWidth={3.5}
                />
              </g>
            );
          default:
            return (
              <g key={x}>
                <circle cx={x} cy={EYE_Y} r={6} fill={color} />
                <circle cx={x + 2} cy={EYE_Y - 2} r={1.8} fill={shine} />
              </g>
            );
        }
      })}
    </g>
  );
}

function Mouth({ kind, color }: { kind: BearExpression["mouth"]; color: string }) {
  const stroke = { stroke: color, strokeWidth: 3.5, strokeLinecap: "round" as const, fill: "none" };
  switch (kind) {
    case "flat":
      return <path d="M94 127 L108 127" {...stroke} />;
    case "smile":
      return <path d="M91 124 Q101 133 111 124" {...stroke} />;
    case "grin":
      return (
        <g>
          <path d="M88 123 Q101 142 114 123 Z" fill={color} />
          <path d="M95 133 Q101 129 107 133 Q101 138 95 133 Z" fill="#f08b9a" />
        </g>
      );
    case "frown":
      return <path d="M92 131 Q101 123 110 131" {...stroke} />;
    case "wobble":
      return <path d="M89 131 Q94 125 99 130 Q104 125 108 130 Q111 127 113 129" {...stroke} />;
    case "o":
      return <ellipse cx="101" cy="128" rx="4.5" ry="5.5" fill={color} />;
    default:
      return null;
  }
}

function Extra({ kind }: { kind: BearExpression["extra"] }) {
  switch (kind) {
    case "tears":
      return (
        <g fill="#8fd0ff" opacity="0.9">
          <path d="M72 103 C70 115 68 128 72 138 C76 128 76 115 76 103 Z" />
          <path d="M128 103 C128 115 128 128 132 138 C136 128 134 115 132 103 Z" />
        </g>
      );
    case "tear":
      return <path d="M131 104 C126 112 126 118 131 119 C136 118 136 112 131 104 Z" fill="#8fd0ff" />;
    case "fog":
      return (
        <g stroke="#9fb0e6" strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M30 82 Q60 72 90 84 T150 80 T178 86" strokeWidth="7" />
          <path d="M40 108 Q72 98 104 110 T172 104" strokeWidth="6" opacity="0.8" />
        </g>
      );
    case "sparkles": {
      const star = (x: number, y: number, s: number) =>
        `M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`;
      return (
        <g fill="#f6d38b">
          <path d={star(28, 40, 9)} />
          <path d={star(176, 30, 7)} />
          <path d={star(178, 126, 6)} />
        </g>
      );
    }
    default:
      return null;
  }
}

/**
 * The character bear. `mode="full"` draws the whole sitting bear (home screen);
 * `mode="head"` crops to the face for the 5-bear rating scales.
 */
export function BearSvg({
  variant,
  expression = NEUTRAL,
  mode = "full",
  className,
  title,
}: {
  variant: BearVariant;
  expression?: BearExpression;
  mode?: "full" | "head";
  className?: string;
  title?: string;
}) {
  const p = BEAR_VARIANTS[variant].palette;
  const titleId = useId();
  const ears = p.ears ?? p.fur;

  return (
    <svg
      viewBox={mode === "full" ? "0 0 200 250" : "14 6 172 152"}
      className={cn("overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title id={titleId}>{title}</title>}

      {mode === "full" && (
        <g>
          <path
            d="M58 150 C40 190 38 240 52 250 L148 250 C162 240 160 190 142 150 C128 128 72 128 58 150 Z"
            fill={p.body ?? p.fur}
          />
          {p.arms && (
            <g fill={p.arms}>
              <path d="M58 160 C44 180 42 208 54 214 C64 214 70 190 72 168 Z" />
              <path d="M142 160 C156 180 158 208 146 214 C136 214 130 190 128 168 Z" />
              <ellipse cx="72" cy="246" rx="22" ry="12" />
              <ellipse cx="128" cy="246" rx="22" ry="12" />
            </g>
          )}
        </g>
      )}

      {/* ears */}
      <circle cx="52" cy="52" r="30" fill={ears} stroke={p.earRim} strokeOpacity={0.35} strokeWidth={p.earRim ? 3 : 0} />
      <circle cx="148" cy="52" r="30" fill={ears} stroke={p.earRim} strokeOpacity={0.35} strokeWidth={p.earRim ? 3 : 0} />
      <circle cx="52" cy="52" r="15" fill={p.innerEar} />
      <circle cx="148" cy="52" r="15" fill={p.innerEar} />

      {/* head */}
      <ellipse cx="100" cy="95" rx="62" ry="56" fill={p.fur} />
      {p.muzzle && <ellipse cx="101" cy="118" rx="24" ry="17" fill={p.muzzle} />}
      {p.patches && (
        <g fill={p.patches}>
          <ellipse cx={EYE_L - 1} cy={EYE_Y + 2} rx="15" ry="12" transform={`rotate(-28 ${EYE_L - 1} ${EYE_Y + 2})`} />
          <ellipse cx={EYE_R + 1} cy={EYE_Y + 2} rx="15" ry="12" transform={`rotate(28 ${EYE_R + 1} ${EYE_Y + 2})`} />
        </g>
      )}

      {/* cheeks */}
      <ellipse cx="62" cy="116" rx="11" ry="6.5" fill={p.blush} opacity={p.blushOpacity} />
      <ellipse cx="140" cy="116" rx="11" ry="6.5" fill={p.blush} opacity={p.blushOpacity} />

      <Eyes kind={expression.eyes} color={p.eye} shine={p.shine} brow={p.nose} />

      {/* nose */}
      <path
        d="M93 110 C93 105 100 104 101 108 C102 104 109 105 109 110 C109 115 101 118 101 118 C101 118 93 115 93 110 Z"
        fill={p.nose}
      />
      <Mouth kind={expression.mouth} color={p.nose} />
      <Extra kind={expression.extra} />
    </svg>
  );
}
