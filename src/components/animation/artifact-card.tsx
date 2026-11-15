import { BearSvg } from "@/components/bear/bear-svg";
import { AnimalAvatar } from "@/components/people/animal-avatar";
import { PropArt } from "./prop-art";
import { INDOOR_SETTINGS, type Artifact, type ArtifactProp } from "@/lib/animation/artifact";
import type { CastMember } from "@/lib/animation/cast";
import { normalizeArtifact } from "@/lib/animation/normalize";
import { BODY_ANCHORS, HELD_FROM_BOTTOM, type Anchor } from "@/lib/animation/props";
import { FACES } from "@/lib/expressions";
import { cn, hashString, seededRandom } from "@/lib/utils";

type Time = Artifact["timeOfDay"];

const SKY: Record<Time, string> = {
  dawn: "linear-gradient(180deg, #8f8ad0 0%, #e7b3c8 55%, #f8d2b0 100%)",
  day: "linear-gradient(180deg, #8ec7ef 0%, #c4e2f7 60%, #eef6fc 100%)",
  dusk: "linear-gradient(180deg, #2f2f6e 0%, #8c5f9e 50%, #f39a7b 100%)",
  night: "linear-gradient(180deg, #0d1033 0%, #1d2058 55%, #36397a 100%)",
};
const MOOD_TINT: Record<Artifact["mood"], string> = {
  warm: "rgb(255 190 120 / 0.14)",
  tender: "rgb(255 182 205 / 0.12)",
  bittersweet: "rgb(150 140 210 / 0.16)",
  heavy: "rgb(20 20 50 / 0.28)",
  joyful: "rgb(255 230 120 / 0.14)",
  eerie: "rgb(80 200 170 / 0.14)",
};
const GROUND: Record<Time, [string, string]> = {
  dawn: ["#9a86b8", "#6f5f93"],
  day: ["#8fc49a", "#6aa97c"],
  dusk: ["#5d4a7c", "#3f3360"],
  night: ["#2d2f63", "#1d1f47"],
};
const WATER: Record<Time, [string, string]> = {
  dawn: ["#8fa6d6", "#6b84c0"],
  day: ["#6fb3d9", "#4b93c4"],
  dusk: ["#6a5b9a", "#43397a"],
  night: ["#2a3f7a", "#1a2a5a"],
};
const dark = (t: Time) => t === "night" || t === "dusk";

// ---------------------------------------------------------------------------
// Sky pieces (shared by outdoor scenes and indoor windows). All static.
// ---------------------------------------------------------------------------
function SkyFill({ time, weather, seed, celestial = true }: { time: Time; weather: Artifact["weather"]; seed: number; celestial?: boolean }) {
  const rand = seededRandom(seed);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: SKY[time] }} aria-hidden>
      {celestial && (
        <span
          className={cn(
            "absolute top-[9%] right-[11%] aspect-square w-[9%] rounded-full",
            dark(time) ? "bg-[#f3ead2] shadow-[0_0_40px_10px_rgb(243_234_210_/_0.3)]" : "bg-[#fff3c4] shadow-[0_0_50px_16px_rgb(255_236_170_/_0.55)]",
          )}
        />
      )}
      {weather === "stars" &&
        Array.from({ length: 34 }, (_, i) => {
          const s = 1.5 + rand() * 2.2;
          return <span key={i} className="absolute rounded-full bg-white" style={{ left: `${rand() * 100}%`, top: `${rand() * 55}%`, width: s, height: s, opacity: 0.5 + rand() * 0.5 }} />;
        })}
      {weather === "rain" &&
        Array.from({ length: 46 }, (_, i) => (
          <span key={i} className="absolute h-[7%] w-px rotate-12 bg-white/55" style={{ left: `${rand() * 100}%`, top: `${rand() * 90}%` }} />
        ))}
      {weather === "snow" &&
        Array.from({ length: 40 }, (_, i) => {
          const s = 3 + rand() * 4;
          return <span key={i} className="absolute rounded-full bg-white/90" style={{ left: `${rand() * 100}%`, top: `${rand() * 90}%`, width: s, height: s }} />;
        })}
      {weather === "fog" &&
        [30, 55].map((top, i) => <span key={top} className="absolute h-[18%] w-[70%] rounded-full bg-white/30 blur-xl" style={{ top: `${top}%`, left: `${i * 25 - 5}%` }} />)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Backdrops
// ---------------------------------------------------------------------------
const WALL: Record<"room" | "classroom" | "hall", { day: string; night: string }> = {
  room: { day: "#efe1cc", night: "#4b4470" },
  classroom: { day: "#d9e6d2", night: "#3d4b58" },
  hall: { day: "#5a4a7a", night: "#2a2150" },
};

function Window({ time, weather, seed, className }: { time: Time; weather: Artifact["weather"]; seed: number; className: string }) {
  return (
    <div className={cn("absolute overflow-hidden rounded-md border-[0.9cqw] border-[#f6efe0] shadow-[0_6px_16px_rgb(0_0_0_/_0.2)]", className)} aria-hidden>
      <SkyFill time={time} weather={weather} seed={seed} />
      <span className="absolute inset-y-0 left-1/2 w-[0.8cqw] -translate-x-1/2 bg-[#f6efe0]" />
      <span className="absolute inset-x-0 top-1/2 h-[0.8cqw] -translate-y-1/2 bg-[#f6efe0]" />
    </div>
  );
}

function Indoor({ setting, time, weather, seed }: { setting: "room" | "classroom" | "hall"; time: Time; weather: Artifact["weather"]; seed: number }) {
  const night = dark(time);
  const wall = night ? WALL[setting].night : WALL[setting].day;
  const floor = setting === "hall" ? (night ? "#3a2d5c" : "#6b5a8e") : night ? "#6b5040" : "#c99a6b";
  return (
    <div className="absolute inset-0" style={{ background: wall }} aria-hidden>
      {/* subtle wallpaper stripes */}
      {setting !== "hall" && <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 6cqw)" }} />}
      {setting === "room" && (
        <>
          <Window time={time} weather={weather} seed={seed} className="top-[10%] left-[8%] h-[40%] w-[22%]" />
          <span className="absolute top-[7%] left-[5%] h-[50%] w-[5%] rounded-b-lg bg-[#e7a6b3]/80" />
          <span className="absolute top-[7%] left-[28%] h-[50%] w-[5%] rounded-b-lg bg-[#e7a6b3]/80" />
          <span className="absolute top-[6%] left-[4%] h-[1.2cqh] w-[30%] rounded-full bg-[#8a5e3c]" />
        </>
      )}
      {setting === "classroom" && (
        <>
          <div className="absolute top-[9%] left-[30%] h-[34%] w-[40%] rounded-md border-[1cqw] border-[#a9774a] bg-[#2f5546]">
            <svg viewBox="0 0 100 50" className="h-full w-full opacity-70" preserveAspectRatio="none">
              <path d="M8 14 h30 M8 24 h22 M50 12 q6 -6 12 0 t12 0 M52 30 l10 -10 M62 30 l-10 -10 M10 38 h40" stroke="#eef1ff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <Window time={time} weather={weather} seed={seed} className="top-[12%] right-[5%] h-[30%] w-[15%]" />
        </>
      )}
      {setting === "hall" && (
        <>
          {/* curtains */}
          <span className="absolute inset-y-0 left-0 w-[9%] rounded-br-[3cqw] bg-[#a3375a]" />
          <span className="absolute inset-y-0 right-0 w-[9%] rounded-bl-[3cqw] bg-[#a3375a]" />
          <span className="absolute inset-x-0 top-0 h-[9%] bg-[#8a2c4c]" style={{ clipPath: "polygon(0 0,100% 0,100% 60%,95% 100%,90% 60%,85% 100%,80% 60%,75% 100%,70% 60%,65% 100%,60% 60%,55% 100%,50% 60%,45% 100%,40% 60%,35% 100%,30% 60%,25% 100%,20% 60%,15% 100%,10% 60%,5% 100%,0 60%)" }} />
          {/* string lights */}
          <svg viewBox="0 0 1600 300" className="absolute inset-x-0 top-[8%] h-[30%] w-full" preserveAspectRatio="none">
            <path d="M0 40 Q400 180 800 60 T1600 50" stroke="#2a1d3d" strokeWidth="4" fill="none" />
            {Array.from({ length: 16 }, (_, i) => {
              const t = (i + 0.5) / 16;
              const x = t * 1600;
              const y = t < 0.5 ? 40 + 140 * Math.sin(t * 2 * Math.PI) * 0.6 : 60 + 50 * Math.sin((t - 0.5) * 2 * Math.PI);
              const c = ["#ffd36b", "#f39ab4", "#8fd0ff", "#c9f2a8"][i % 4];
              return <circle key={i} cx={x.toFixed(1)} cy={(y + 14).toFixed(1)} r="13" fill={c} style={{ filter: `drop-shadow(0 0 10px ${c})` }} />;
            })}
          </svg>
          {/* spotlight on the floor */}
          <span className="absolute bottom-[4%] left-1/2 h-[22%] w-[60%] -translate-x-1/2 rounded-[50%] bg-[#fff3c4]/20 blur-md" />
        </>
      )}
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[24%]" style={{ background: floor }}>
        <div className="absolute inset-x-0 top-0 h-[0.9cqh] bg-black/15" />
        {setting !== "hall" && <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 12cqw)" }} />}
      </div>
      {setting === "room" && <span className="absolute bottom-[4%] left-1/2 h-[13%] w-[56%] -translate-x-1/2 rounded-[50%] bg-[#d98a8a]/55" />}
    </div>
  );
}

function Outdoor({ setting, time, weather, seed }: { setting: "outdoors" | "campus" | "street" | "water" | "woods"; time: Time; weather: Artifact["weather"]; seed: number }) {
  const [back, front] = setting === "water" ? WATER[time] : GROUND[time];
  const lit = dark(time) ? "#ffd98a" : "#f4efe2";
  const stone = dark(time) ? "#4a4a78" : "#e9e2d2";
  const stoneShade = dark(time) ? "#3a3a66" : "#d4ccb8";
  return (
    <div className="absolute inset-0" aria-hidden>
      <SkyFill time={time} weather={weather} seed={seed} />
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        {setting === "water" && (
          <g>
            <path d="M0 610 C 200 580, 400 640, 600 610 S 1000 580, 1200 610 S 1500 640, 1600 610 L1600 900 L0 900 Z" fill={back} />
            <path d="M0 700 C 200 670, 400 730, 600 700 S 1000 670, 1200 700 S 1500 730, 1600 700 L1600 900 L0 900 Z" fill={front} />
            <path d="M0 790 C 300 770, 600 810, 900 790 S 1400 770, 1600 790 L1600 900 L0 900 Z" fill="#f2deb0" opacity="0.9" />
          </g>
        )}
        {setting === "street" && (
          <g>
            {[[40, 330], [190, 250], [330, 390], [480, 220], [1000, 300], [1150, 210], [1300, 360], [1450, 270]].map(([x, top]) => (
              <g key={x}>
                <rect x={x} y={top} width="130" height={900 - top} fill={back} />
                {Array.from({ length: Math.floor((600 - top) / 60) }, (_, r) =>
                  [0, 1].map((c) => <rect key={`${r}-${c}`} x={x + 24 + c * 50} y={top + 30 + r * 60} width="28" height="30" rx="3" fill={lit} opacity={(x + r + c) % 3 === 0 ? 0.25 : 0.8} />),
                )}
              </g>
            ))}
            <rect x="0" y="660" width="1600" height="240" fill="#8d8aa6" />
            <rect x="0" y="660" width="1600" height="16" fill="#a9a6c0" />
          </g>
        )}
        {setting === "campus" && (
          <g>
            <path d="M0 600 C 300 540, 600 610, 900 570 S 1400 540, 1600 590 L1600 900 L0 900 Z" fill={back} />
            {/* domed hall with columns */}
            <g>
              <rect x="1060" y="380" width="460" height="260" fill={stone} />
              <path d="M1040 380 L1290 300 L1540 380 Z" fill={stoneShade} />
              <rect x="1240" y="210" width="100" height="95" fill={stone} />
              <path d="M1225 215 Q1290 120 1355 215 Z" fill={stoneShade} />
              {[1090, 1160, 1230, 1300, 1370, 1440].map((x) => <rect key={x} x={x} y="400" width="26" height="220" fill={stoneShade} />)}
              <rect x="1060" y="620" width="460" height="20" fill={stoneShade} />
            </g>
            {[120, 330].map((x) => (
              <g key={x}>
                <rect x={x - 10} y="520" width="20" height="90" fill="#6b4b33" />
                <circle cx={x} cy="490" r="70" fill={front} />
              </g>
            ))}
            <path d="M0 690 C 300 650, 700 720, 1000 680 S 1450 660, 1600 690 L1600 900 L0 900 Z" fill={front} />
            <path d="M560 900 L740 690 L900 690 L1120 900 Z" fill={stone} opacity="0.85" />
          </g>
        )}
        {(setting === "outdoors" || setting === "woods") && (
          <g>
            <path d="M0 600 C 250 520, 520 620, 800 560 S 1350 500, 1600 580 L1600 900 L0 900 Z" fill={back} />
            {setting === "woods" &&
              [90, 230, 380, 1250, 1400, 1530].map((x, i) => (
                <g key={x} fill={front}>
                  <path d={`M${x} ${440 - (i % 2) * 50} L${x - 80} 670 L${x + 80} 670 Z`} />
                  <rect x={x - 12} y="660" width="24" height="40" />
                </g>
              ))}
            <path d="M0 690 C 300 650, 700 720, 1000 680 S 1450 660, 1600 690 L1600 900 L0 900 Z" fill={front} />
          </g>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prop placement
// ---------------------------------------------------------------------------
type Spot = { left: string; top?: string; bottom?: string; size: string; transform?: string };

const WALL_SPOTS: Partial<Record<Artifact["setting"], Spot[]>> = {
  room: [
    { left: "46%", top: "22%", size: "18cqh" },
    { left: "78%", top: "18%", size: "18cqh" },
    { left: "62%", top: "34%", size: "13cqh" },
  ],
  classroom: [
    { left: "16%", top: "26%", size: "19cqh" },
    { left: "22%", top: "48%", size: "13cqh" },
    { left: "88%", top: "56%", size: "13cqh" },
  ],
  hall: [
    { left: "17%", top: "44%", size: "14cqh" },
    { left: "83%", top: "44%", size: "14cqh" },
  ],
  campus: [
    { left: "74%", top: "58%", size: "11cqh" },
    { left: "90%", top: "58%", size: "11cqh" },
  ],
  street: [
    { left: "12%", top: "52%", size: "11cqh" },
    { left: "84%", top: "50%", size: "11cqh" },
  ],
};
const SKY_SPOTS: Spot[] = [
  { left: "24%", top: "18%", size: "15cqh" },
  { left: "50%", top: "12%", size: "14cqh" },
  { left: "68%", top: "22%", size: "13cqh" },
];
/** Front corners, clear of the cast. The left one is skipped when the table stands there. */
const FLOOR_SPOTS: Spot[] = [
  { left: "93%", bottom: "4%", size: "12cqh", transform: "translateX(-50%)" },
  { left: "7%", bottom: "4%", size: "12cqh", transform: "translateX(-50%)" },
];

function ScenePropAt({ prop, spot }: { prop: ArtifactProp; spot: Spot }) {
  return (
    <span
      className="absolute drop-shadow-[0_6px_8px_rgb(0_0_0_/_0.25)]"
      style={{ left: spot.left, top: spot.top, bottom: spot.bottom, height: spot.size, transform: spot.transform ?? "translate(-50%, -50%)" }}
    >
      <PropArt item={prop.item} emoji={prop.emoji} title={prop.label} className="h-full w-auto" />
    </span>
  );
}

function Table({ props }: { props: ArtifactProp[] }) {
  return (
    <div className="absolute bottom-[5%] left-[5%] h-[19cqh] w-[24cqw]">
      {/* items stand on the tabletop */}
      <div className="absolute inset-x-[6%] bottom-[86%] flex items-end justify-around">
        {props.map((p, i) => (
          <span key={i} className="block h-[11cqh] drop-shadow-[0_4px_6px_rgb(0_0_0_/_0.25)]">
            <PropArt item={p.item} emoji={p.emoji} title={p.label} className="h-full w-auto" />
          </span>
        ))}
      </div>
      <svg viewBox="0 0 240 190" className="h-full w-full" aria-hidden>
        <ellipse cx="120" cy="30" rx="118" ry="26" fill="#b98258" />
        <ellipse cx="120" cy="24" rx="118" ry="24" fill="#d6a274" />
        <rect x="30" y="40" width="16" height="150" rx="6" fill="#a87048" />
        <rect x="194" y="40" width="16" height="150" rx="6" fill="#a87048" />
        <rect x="112" y="48" width="16" height="142" rx="6" fill="#986440" />
      </svg>
    </div>
  );
}

/** Where a worn or held prop sits on a character, as a position inside their box. */
function characterSpot(prop: ArtifactProp, kind: "bear" | "animal", handIndex: number, outerLeft: boolean): React.CSSProperties {
  const a = BODY_ANCHORS[kind];
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  switch (prop.anchor) {
    case "head":
      return { left: "50%", top: pct(a.headTop), height: prop.item === "party-hat" ? "40%" : prop.item === "grad-cap" ? "30%" : "30%", transform: `translate(-50%, ${prop.item === "party-hat" ? "-86%" : "-72%"}) rotate(-6deg)` };
    case "face":
      // the glasses art fills the middle band of its box, so it needs a tall box to span the face
      return { left: "50%", top: pct(a.eyes), height: kind === "bear" ? "40%" : "36%", transform: "translate(-50%, -50%)" };
    case "body":
      return { left: "50%", top: pct(a.chest), height: prop.item === "sash" ? "34%" : "20%", transform: "translate(-50%, -50%)" };
    case "hand": {
      const right = handIndex % 2 === 0;
      const fromBottom = HELD_FROM_BOTTOM.includes(prop.item);
      return {
        left: pct(right ? a.handR + 0.08 : a.handL - 0.08),
        top: pct(a.handY),
        height: prop.item === "balloon" ? "56%" : fromBottom ? "40%" : "28%",
        transform: `translate(-50%, ${fromBottom ? "-88%" : "-50%"}) rotate(${right ? 8 : -8}deg)`,
      };
    }
    case "beside":
      // on the character's outer side, so it never lands on a neighbour
      return outerLeft
        ? { right: "100%", bottom: "0%", height: "34%", transform: "translateX(10%)" }
        : { left: "100%", bottom: "0%", height: "34%", transform: "translateX(-10%)" };
    default:
      return {};
  }
}

function Character({
  member,
  expression,
  action,
  props,
  height,
  index,
  count,
}: {
  member: CastMember;
  expression: Artifact["characters"][number]["expression"];
  action: string;
  props: ArtifactProp[];
  height: number;
  index: number;
  count: number;
}) {
  const kind = member.avatar.kind === "bear" ? "bear" : "animal";
  const face = FACES[expression];
  const label = action ? `${member.name}, ${action}` : member.name;
  // Things on the body are drawn first, worn/held things over the top.
  const order: Anchor[] = ["beside", "body", "hand", "face", "head"];
  const sorted = [...props].sort((a, b) => order.indexOf(a.anchor) - order.indexOf(b.anchor));
  let hands = 0;

  return (
    <li className="relative grid justify-items-center">
      {/* The whole character (with what they wear and hold) hovers gently. */}
      <div className="animate-bob relative" style={{ height: `${height}cqh`, animationDelay: `${index * 0.35}s`, animationDuration: "2.8s" }}>
        {member.avatar.kind === "bear" ? (
          <BearSvg variant={member.avatar.variant} expression={face} className="h-full w-auto drop-shadow-[0_10px_14px_rgb(0_0_0_/_0.3)]" title={label} />
        ) : (
          <AnimalAvatar animal={member.avatar.animal} expression={face} mode="full" className="h-full w-auto drop-shadow-[0_10px_14px_rgb(0_0_0_/_0.3)]" title={label} />
        )}
        {sorted.map((p, i) => (
          <span key={i} className="absolute block drop-shadow-[0_4px_6px_rgb(0_0_0_/_0.25)]" style={characterSpot(p, kind, p.anchor === "hand" ? hands++ : 0, index === 0 && count > 1)}>
            <PropArt item={p.item} emoji={p.emoji} title={p.label} className="h-full w-auto" />
          </span>
        ))}
      </div>
      <span className="mt-[0.6cqh] rounded-full bg-black/35 px-[1.2cqw] py-[0.3cqh] text-[max(10px,1.7cqw)] font-medium whitespace-nowrap text-white backdrop-blur-sm">
        {member.name}
      </span>
    </li>
  );
}

/**
 * The memory artifact: a still storybook illustration (setting, sky, props
 * placed where they belong, and the cast as their characters) plus a placard.
 */
export function ArtifactCard({
  artifact: raw,
  cast,
  number,
  className,
}: {
  artifact: Artifact;
  cast: CastMember[];
  /** catalogue number shown on the stamp */
  number: string;
  className?: string;
}) {
  const artifact = normalizeArtifact(raw, cast);
  const seed = hashString(artifact.name + number);
  const indoor = INDOOR_SETTINGS.includes(artifact.setting);

  const members = artifact.characters
    .map((c) => ({ ...c, member: cast.find((m) => m.key === c.key) }))
    .filter((c): c is typeof c & { member: CastMember } => !!c.member)
    .slice(0, 5);

  const byAnchor = (anchor: Anchor) => artifact.props.filter((p) => p.anchor === anchor);
  const tableProps = byAnchor("table");
  const wallSpots = WALL_SPOTS[artifact.setting] ?? [];

  // Size the cast to fit: the scene is 16:9, so 1cqh = 0.5625cqw; a character is ~0.75 as wide as tall.
  const floorCount = artifact.props.filter((p) => p.anchor === "floor").length;
  const available = (tableProps.length ? 65 : floorCount > 1 ? 74 : 90) - (floorCount ? 8 : 0);
  const n = Math.max(1, members.length);
  const height = Math.min(50, (available - 3 * (n - 1)) / (n * 0.75 * 0.5625));

  return (
    <figure className={cn("grid gap-0 overflow-hidden rounded-[1.4rem] border-[6px] border-[#e9dcc3] bg-[#f6efe0] shadow-[0_20px_60px_-20px_rgb(0_0_0_/_0.7)]", className)}>
      <div className="relative aspect-video overflow-hidden" style={{ containerType: "size" }}>
        {indoor ? (
          <Indoor setting={artifact.setting as "room" | "classroom" | "hall"} time={artifact.timeOfDay} weather={artifact.weather} seed={seed} />
        ) : (
          <Outdoor setting={artifact.setting as "outdoors" | "campus" | "street" | "water" | "woods"} time={artifact.timeOfDay} weather={artifact.weather} seed={seed} />
        )}

        {byAnchor("wall").map((p, i) => wallSpots[i] && <ScenePropAt key={`w${i}`} prop={p} spot={wallSpots[i]} />)}
        {byAnchor("sky").map((p, i) => SKY_SPOTS[i] && <ScenePropAt key={`s${i}`} prop={p} spot={SKY_SPOTS[i]} />)}
        {tableProps.length > 0 && <Table props={tableProps} />}
        {byAnchor("floor").map((p, i) => {
          const spot = (tableProps.length ? FLOOR_SPOTS.slice(0, 1) : FLOOR_SPOTS)[i];
          return spot && <ScenePropAt key={`f${i}`} prop={p} spot={spot} />;
        })}

        <ul
          className="absolute bottom-[5%] flex items-end justify-center gap-[3cqw]"
          style={{ left: tableProps.length ? "30%" : byAnchor("floor").length > 1 ? "13%" : "5%", right: byAnchor("floor").length ? "13%" : "5%" }}
          aria-label="Characters"
        >
          {members.map(({ key, member, expression, action }, i) => (
            <Character
              key={key}
              member={member}
              expression={expression}
              action={action}
              props={artifact.props.filter((p) => p.character === key)}
              height={height}
              index={i}
              count={members.length}
            />
          ))}
        </ul>

        <div className="pointer-events-none absolute inset-0" style={{ background: MOOD_TINT[artifact.mood] }} aria-hidden />
        {/* printed-illustration finish: soft vignette and paper grain */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgb(40_25_10_/_0.35)]" aria-hidden />
        <div className="artifact-grain pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay" aria-hidden />

        <span className="absolute top-3 left-3 -rotate-3 rounded-sm border border-[#7a5a32]/60 bg-[#f6efe0]/85 px-2 py-0.5 font-mono text-[10px] tracking-widest text-[#7a5a32] uppercase sm:text-xs">
          Artifact No. {number}
        </span>
      </div>

      <figcaption className="grid gap-3 px-5 py-4 text-[#3a2c1c] sm:px-6 sm:py-5">
        <div>
          <p className="font-hand text-3xl leading-tight font-bold">{artifact.name}</p>
          {artifact.caption && <p className="mt-1 text-sm italic opacity-80">{artifact.caption}</p>}
        </div>
        {members.some((m) => m.action) && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {members
              .filter((m) => m.action)
              .map((m) => (
                <li key={m.key}>
                  <span className="font-semibold">{m.member.name}</span> <span className="opacity-75">{m.action}</span>
                </li>
              ))}
          </ul>
        )}
        {artifact.fieldNote && (
          <div className="rounded-xl border border-dashed border-[#7a5a32]/40 bg-[#efe3cc] px-4 py-3">
            <p className="font-mono text-[10px] tracking-widest text-[#7a5a32] uppercase">Field note</p>
            <p className="font-hand mt-1 text-lg leading-snug">{artifact.fieldNote}</p>
          </div>
        )}
      </figcaption>
    </figure>
  );
}
