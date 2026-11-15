import { useId } from "react";
import { FaceEyes, FaceExtra, FaceMouth } from "@/components/face/face-parts";
import { BEAR_VARIANTS, NEUTRAL, type BearExpression } from "@/lib/bears";
import type { BearVariant } from "@/types/memory";
import { cn } from "@/lib/utils";

const EYE_L = 78;
const EYE_R = 124;
const EYE_Y = 96;
const HEAD = { cx: 100, cy: 95, rx: 62, ry: 56 };

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

      {/* brows sit on fur, not on panda patches, so they use the nose colour */}
      <FaceEyes kind={expression.eyes} left={EYE_L} right={EYE_R} y={EYE_Y} color={p.eye} shine={p.shine} brow={p.nose} />

      {/* nose */}
      <path
        d="M93 110 C93 105 100 104 101 108 C102 104 109 105 109 110 C109 115 101 118 101 118 C101 118 93 115 93 110 Z"
        fill={p.nose}
      />
      <FaceMouth kind={expression.mouth} cx={101} y={127} color={p.nose} />
      <FaceExtra kind={expression.extra} left={EYE_L} right={EYE_R} y={EYE_Y} head={HEAD} blush={p.blush} />
    </svg>
  );
}
