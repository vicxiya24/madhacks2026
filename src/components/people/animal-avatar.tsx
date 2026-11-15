import type { AnimalKey } from "@/lib/people";
import { ANIMALS } from "@/lib/people";
import type { BearExpression } from "@/lib/bears";
import { FaceEyes, FaceExtra, FaceMouth } from "@/components/face/face-parts";
import { cn } from "@/lib/utils";

type Palette = { fur: string; eye: string; shine: string; nose: string; blush: string; belly?: string };

const PALETTES: Record<AnimalKey, Palette> = {
  bunny: { fur: "#f4eee8", eye: "#4a3a48", shine: "#ffffff", nose: "#e98aa0", blush: "#f3a3b5", belly: "#fbf7f2" },
  fox: { fur: "#e8935a", eye: "#3a2619", shine: "#ffffff", nose: "#3a2619", blush: "#f28a8a", belly: "#fff4ea" },
  cat: { fur: "#b8b2c9", eye: "#2f2b3d", shine: "#ffffff", nose: "#e98aa0", blush: "#f3a3b5" },
  pup: { fur: "#d9b38c", eye: "#3a2619", shine: "#ffffff", nose: "#3a2619", blush: "#ec8f8f", belly: "#f1dcc3" },
  frog: { fur: "#9fd39b", eye: "#24331f", shine: "#ffffff", nose: "#3f6b3a", blush: "#f3a3b5", belly: "#d6efc9" },
  owl: { fur: "#8f7fb3", eye: "#2b2540", shine: "#ffffff", nose: "#f2b65a", blush: "#f3a3b5", belly: "#ece5f7" },
  mouse: { fur: "#cfc7d2", eye: "#2f2a36", shine: "#ffffff", nose: "#e98aa0", blush: "#f3a3b5" },
  piglet: { fur: "#f4b8c3", eye: "#4a2b36", shine: "#ffffff", nose: "#b8607a", blush: "#ee8ea2" },
  penguin: { fur: "#2f3550", eye: "#2f3550", shine: "#ffffff", nose: "#f2a65a", blush: "#f5a3b5", belly: "#f6f5f0" },
  koala: { fur: "#a9adbb", eye: "#2a2933", shine: "#ffffff", nose: "#3b3a48", blush: "#f3a3b5", belly: "#d9dbe3" },
};

/**
 * Where each animal's face features sit, so shared expressions land correctly.
 * eyes: [left x, right x, y, size]; mouth: [y, size] (null = beak, no mouth).
 */
type FaceLayout = { eyes: [number, number, number, number]; mouth: [number, number] | null; head: { cx: number; cy: number; rx: number; ry: number } };
const DEFAULT_HEAD = { cx: 100, cy: 105, rx: 60, ry: 54 };
const FACE: Record<AnimalKey, FaceLayout> = {
  bunny: { eyes: [80, 120, 100, 1], mouth: [128, 0.6], head: DEFAULT_HEAD },
  fox: { eyes: [80, 120, 98, 1], mouth: [137, 0.6], head: DEFAULT_HEAD },
  cat: { eyes: [80, 120, 100, 1], mouth: [127, 0.6], head: DEFAULT_HEAD },
  pup: { eyes: [80, 120, 98, 1], mouth: [131, 0.7], head: DEFAULT_HEAD },
  frog: { eyes: [69, 133, 68, 1.25], mouth: [130, 1.6], head: { cx: 100, cy: 110, rx: 66, ry: 50 } },
  owl: { eyes: [78, 122, 100, 1.6], mouth: null, head: DEFAULT_HEAD },
  mouse: { eyes: [80, 120, 100, 1], mouth: [128, 0.6], head: { cx: 100, cy: 108, rx: 60, ry: 50 } },
  piglet: { eyes: [80, 120, 94, 1], mouth: [144, 0.6], head: DEFAULT_HEAD },
  penguin: { eyes: [80, 120, 104, 1], mouth: null, head: DEFAULT_HEAD },
  koala: { eyes: [80, 120, 96, 0.9], mouth: [141, 0.6], head: DEFAULT_HEAD },
};

function Cheeks({ p, y = 120 }: { p: Palette; y?: number }) {
  return (
    <g fill={p.blush} opacity={0.55}>
      <ellipse cx="62" cy={y} rx="10" ry="6" />
      <ellipse cx="138" cy={y} rx="10" ry="6" />
    </g>
  );
}

/** The original resting smile, kept when no expression is asked for. */
function Smile({ color, y = 128, w = 8 }: { color: string; y?: number; w?: number }) {
  return <path d={`M${100 - w} ${y} Q100 ${y + 7} ${100 + w} ${y}`} stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
}

function Whiskers({ color, y = 120 }: { color: string; y?: number }) {
  return (
    <g stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.5}>
      <path d={`M68 ${y - 4} L38 ${y - 10}`} />
      <path d={`M68 ${y + 3} L38 ${y + 7}`} />
      <path d={`M132 ${y - 4} L162 ${y - 10}`} />
      <path d={`M132 ${y + 3} L162 ${y + 7}`} />
    </g>
  );
}

const Head = ({ fill, rx = 60, ry = 54, cy = 105, rim }: { fill: string; rx?: number; ry?: number; cy?: number; rim?: boolean }) => (
  <ellipse cx="100" cy={cy} rx={rx} ry={ry} fill={fill} stroke={rim ? "#c9d6ff" : undefined} strokeOpacity={rim ? 0.4 : undefined} strokeWidth={rim ? 3 : undefined} />
);

/** Sitting body under the head, the same shape as the bear's (shifted to meet the lower head). */
function Body({ animal, p }: { animal: AnimalKey; p: Palette }) {
  return (
    <g transform="translate(0 10)">
      <path
        d="M58 150 C40 190 38 240 52 250 L148 250 C162 240 160 190 142 150 C128 128 72 128 58 150 Z"
        fill={p.fur}
        stroke={animal === "penguin" ? "#c9d6ff" : undefined}
        strokeOpacity={animal === "penguin" ? 0.4 : undefined}
        strokeWidth={animal === "penguin" ? 3 : undefined}
      />
      {p.belly && <ellipse cx="100" cy="205" rx="32" ry="40" fill={p.belly} />}
      {animal === "owl" && (
        <g stroke="#b9acd6" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M88 190 q6 6 12 0 q6 6 12 0" />
          <path d="M88 210 q6 6 12 0 q6 6 12 0" />
        </g>
      )}
      {(animal === "penguin" || animal === "owl") && (
        <g fill={p.fur}>
          <path d="M60 165 C42 190 44 215 58 220 C66 205 68 185 66 168 Z" />
          <path d="M140 165 C158 190 156 215 142 220 C134 205 132 185 134 168 Z" />
        </g>
      )}
      {(animal === "penguin" || animal === "frog" || animal === "owl") && (
        <g fill={animal === "frog" ? "#7fbf7b" : p.nose}>
          <ellipse cx="74" cy="248" rx="20" ry="9" />
          <ellipse cx="126" cy="248" rx="20" ry="9" />
        </g>
      )}
    </g>
  );
}

/** Ears, head shape and fixed markings: everything except eyes and mouth. */
function Features({ animal, p }: { animal: AnimalKey; p: Palette }) {
  switch (animal) {
    case "bunny":
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s} transform={`rotate(${s * 12} ${100 + s * 22} 40)`}>
              <ellipse cx={100 + s * 22} cy="34" rx="15" ry="40" fill={p.fur} />
              <ellipse cx={100 + s * 22} cy="38" rx="7.5" ry="29" fill="#f3b6c4" />
            </g>
          ))}
          <Head fill={p.fur} />
          <Cheeks p={p} />
          <path d="M95 112 L105 112 L100 118 Z" fill={p.nose} stroke={p.nose} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "fox":
      return (
        <g>
          <path d="M46 84 L54 24 L96 60 Z" fill={p.fur} stroke={p.fur} strokeWidth={6} strokeLinejoin="round" />
          <path d="M154 84 L146 24 L104 60 Z" fill={p.fur} stroke={p.fur} strokeWidth={6} strokeLinejoin="round" />
          <path d="M58 68 L61 40 L84 58 Z" fill="#fbe3cf" />
          <path d="M142 68 L139 40 L116 58 Z" fill="#fbe3cf" />
          <Head fill={p.fur} />
          <path d="M41 112 Q72 106 100 128 Q128 106 159 112 Q150 157 100 159 Q50 157 41 112 Z" fill="#fff4ea" />
          <Cheeks p={p} y={124} />
          <ellipse cx="100" cy="124" rx="7.5" ry="5.5" fill={p.nose} />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M44 88 L50 34 L92 62 Z" fill={p.fur} stroke={p.fur} strokeWidth={6} strokeLinejoin="round" />
          <path d="M156 88 L150 34 L108 62 Z" fill={p.fur} stroke={p.fur} strokeWidth={6} strokeLinejoin="round" />
          <path d="M55 72 L58 48 L80 63 Z" fill="#f1c1cf" />
          <path d="M145 72 L142 48 L120 63 Z" fill="#f1c1cf" />
          <Head fill={p.fur} />
          <Cheeks p={p} />
          <Whiskers color={p.eye} y={120} />
          <path d="M96 112 L104 112 L100 117 Z" fill={p.nose} stroke={p.nose} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "pup":
      return (
        <g>
          <Head fill={p.fur} />
          <path d="M48 64 C24 68 16 120 32 136 C46 144 56 112 62 78 Z" fill="#8a5e3c" />
          <path d="M152 64 C176 68 184 120 168 136 C154 144 144 112 138 78 Z" fill="#8a5e3c" />
          <ellipse cx="100" cy="124" rx="27" ry="19" fill="#f1dcc3" />
          <Cheeks p={p} y={118} />
          <ellipse cx="100" cy="115" rx="9" ry="6.5" fill={p.nose} />
        </g>
      );
    case "frog":
      return (
        <g>
          <Head fill={p.fur} rx={66} ry={50} cy={110} />
          {[68, 132].map((x) => (
            <g key={x}>
              <circle cx={x} cy="66" r="23" fill={p.fur} />
              <circle cx={x} cy="66" r="15" fill="#ffffff" />
            </g>
          ))}
          <Cheeks p={p} y={118} />
          <circle cx="94" cy="108" r="2.5" fill={p.nose} />
          <circle cx="106" cy="108" r="2.5" fill={p.nose} />
        </g>
      );
    case "owl":
      return (
        <g>
          <path d="M46 76 L44 30 L84 58 Z" fill={p.fur} stroke={p.fur} strokeWidth={6} strokeLinejoin="round" />
          <path d="M154 76 L156 30 L116 58 Z" fill={p.fur} stroke={p.fur} strokeWidth={6} strokeLinejoin="round" />
          <Head fill={p.fur} />
          <circle cx="78" cy="100" r="24" fill="#ece5f7" />
          <circle cx="122" cy="100" r="24" fill="#ece5f7" />
          <Cheeks p={p} y={128} />
          <path d="M93 116 L107 116 L100 130 Z" fill={p.nose} stroke={p.nose} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "mouse":
      return (
        <g>
          <circle cx="48" cy="58" r="33" fill={p.fur} />
          <circle cx="152" cy="58" r="33" fill={p.fur} />
          <circle cx="48" cy="58" r="20" fill="#f2b7c6" />
          <circle cx="152" cy="58" r="20" fill="#f2b7c6" />
          <Head fill={p.fur} ry={50} cy={108} />
          <Cheeks p={p} />
          <Whiskers color={p.eye} y={118} />
          <circle cx="100" cy="115" r="5.5" fill={p.nose} />
        </g>
      );
    case "piglet":
      return (
        <g>
          <path d="M50 76 L48 36 L88 58 Z" fill="#e69aa8" stroke="#e69aa8" strokeWidth={6} strokeLinejoin="round" />
          <path d="M150 76 L152 36 L112 58 Z" fill="#e69aa8" stroke="#e69aa8" strokeWidth={6} strokeLinejoin="round" />
          <Head fill={p.fur} />
          <Cheeks p={p} y={118} />
          <ellipse cx="100" cy="120" rx="21" ry="14" fill="#ec9aab" />
          <ellipse cx="93" cy="120" rx="3.5" ry="5.5" fill={p.nose} />
          <ellipse cx="107" cy="120" rx="3.5" ry="5.5" fill={p.nose} />
        </g>
      );
    case "penguin":
      return (
        <g>
          <Head fill={p.fur} rim />
          <ellipse cx="82" cy="110" rx="27" ry="33" fill="#f6f5f0" />
          <ellipse cx="118" cy="110" rx="27" ry="33" fill="#f6f5f0" />
          <Cheeks p={p} y={124} />
          <path d="M91 116 L109 116 L100 128 Z" fill={p.nose} stroke={p.nose} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "koala":
      return (
        <g>
          <circle cx="44" cy="66" r="33" fill={p.fur} />
          <circle cx="156" cy="66" r="33" fill={p.fur} />
          <circle cx="46" cy="68" r="20" fill="#e8e4ee" />
          <circle cx="154" cy="68" r="20" fill="#e8e4ee" />
          <Head fill={p.fur} />
          <Cheeks p={p} y={124} />
          <ellipse cx="100" cy="116" rx="12" ry="16" fill={p.nose} />
        </g>
      );
  }
}

/** Resting face (no expression asked for): the original look of each animal. */
function RestingFace({ animal, p }: { animal: AnimalKey; p: Palette }) {
  const [l, r, y, size] = FACE[animal].eyes;
  const eyes = <FaceEyes kind="dot" left={l} right={r} y={y} size={size} color={p.eye} shine={p.shine} />;
  switch (animal) {
    case "bunny":
    case "mouse":
      return <>{eyes}<Smile color={p.eye} y={125} w={6} /></>;
    case "fox":
      return <>{eyes}<Smile color={p.nose} y={134} w={6} /></>;
    case "cat":
      return <>{eyes}<path d="M92 124 Q96 130 100 124 Q104 130 108 124" stroke={p.eye} strokeWidth={3} strokeLinecap="round" fill="none" /></>;
    case "pup":
      return <>{eyes}<Smile color={p.nose} y={128} w={7} /></>;
    case "frog":
      return <>{eyes}<path d="M74 124 Q100 144 126 124" stroke={p.nose} strokeWidth={3.5} strokeLinecap="round" fill="none" /></>;
    case "piglet":
      return <>{eyes}<Smile color={p.nose} y={141} w={6} /></>;
    case "koala":
      return <>{eyes}<Smile color={p.nose} y={138} w={6} /></>;
    default: // owl, penguin: beaks, no mouth
      return eyes;
  }
}

/** An animal for a person in your life: just the head, or (`mode="full"`) sitting with a body. */
export function AnimalAvatar({
  animal,
  expression,
  mode = "head",
  className,
  title,
}: {
  animal: AnimalKey;
  /** omit for the animal's resting face */
  expression?: BearExpression;
  mode?: "head" | "full";
  className?: string;
  /** Accessible name. Omit when a visible label sits right next to the avatar. */
  title?: string;
}) {
  const p = PALETTES[animal];
  const face = FACE[animal];
  const [l, r, y, size] = face.eyes;

  return (
    <svg
      viewBox={mode === "full" ? "10 -12 180 280" : "10 -12 180 176"}
      className={cn("overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-animal={animal}
    >
      {title && <title>{title}</title>}
      {mode === "full" && <Body animal={animal} p={p} />}
      <Features animal={animal} p={p} />
      {expression ? (
        <g>
          <FaceEyes kind={expression.eyes} left={l} right={r} y={y} size={size} color={p.eye} shine={p.shine} brow={p.eye} />
          {face.mouth && <FaceMouth kind={expression.mouth} cx={100} y={face.mouth[0]} size={face.mouth[1]} color={animal === "fox" || animal === "pup" || animal === "piglet" || animal === "koala" || animal === "frog" ? p.nose : p.eye} />}
          <FaceExtra kind={expression.extra} left={l} right={r} y={y} size={size} head={face.head} blush={p.blush} />
        </g>
      ) : (
        <RestingFace animal={animal} p={p} />
      )}
    </svg>
  );
}

export { ANIMALS };
