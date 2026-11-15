import type { PropItem } from "@/lib/animation/props";
import { cn } from "@/lib/utils";

/**
 * Flat, pastel prop drawings in the same style as the characters, each in a
 * 100x100 box. "other" falls back to an emoji, softened to sit in the scene.
 */

const INK = "#3a2c1c";
const GOLD = "#f6c453";
const GOLD_DARK = "#e0a43a";

function Art({ item }: { item: Exclude<PropItem, "other"> }) {
  switch (item) {
    case "crown":
      return (
        <g>
          <path d="M14 72 L18 30 L36 52 L50 20 L64 52 L82 30 L86 72 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth="3" strokeLinejoin="round" />
          <rect x="14" y="66" width="72" height="12" rx="4" fill={GOLD_DARK} />
          <circle cx="50" cy="20" r="5" fill="#f37a8a" />
          <circle cx="18" cy="30" r="4" fill="#8fd0ff" />
          <circle cx="82" cy="30" r="4" fill="#8fd0ff" />
          <circle cx="50" cy="72" r="4" fill="#f37a8a" />
          <circle cx="32" cy="72" r="3" fill="#ffffff" />
          <circle cx="68" cy="72" r="3" fill="#ffffff" />
        </g>
      );
    case "party-hat":
      return (
        <g>
          <path d="M50 10 L80 90 L20 90 Z" fill="#f39ab4" />
          <path d="M40 37 L60 37 M33 56 L67 56 M26 75 L74 75" stroke="#fff3a8" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="10" r="8" fill="#fff3a8" />
          <ellipse cx="50" cy="90" rx="31" ry="5" fill="#e07c9a" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M16 66 Q18 22 54 22 Q86 24 84 66 Z" fill="#6aa0d8" />
          <path d="M50 22 L50 66" stroke="#5585bd" strokeWidth="3" />
          <path d="M54 62 Q86 58 98 70 Q80 78 54 72 Z" fill="#5585bd" />
          <circle cx="51" cy="22" r="4" fill="#5585bd" />
        </g>
      );
    case "grad-cap":
      return (
        <g>
          <path d="M28 52 L28 70 Q50 82 72 70 L72 52 Z" fill="#2f3550" />
          <path d="M50 22 L94 40 L50 58 L6 40 Z" fill="#3b4266" />
          <path d="M50 40 L84 50 L84 76" stroke={GOLD} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="84" cy="80" r="5" fill={GOLD} />
          <circle cx="50" cy="40" r="4" fill={GOLD} />
        </g>
      );
    case "glasses":
      return (
        <g fill="rgb(255 255 255 / 0.25)" stroke={INK} strokeWidth="5">
          <circle cx="28" cy="50" r="17" />
          <circle cx="72" cy="50" r="17" />
          <path d="M45 48 Q50 43 55 48" fill="none" />
        </g>
      );
    case "sash":
      return (
        <g>
          <path d="M22 4 L40 4 L84 96 L66 96 Z" fill="#f4a3c0" />
          <path d="M26 4 L30 4 L74 96 L70 96 Z M36 4 L38 4 L82 96 L80 96 Z" fill="#fbd3e2" />
          <path d="M60 52 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill={GOLD} />
        </g>
      );
    case "medal":
      return (
        <g>
          <path d="M30 4 L46 50 L54 50 L38 4 Z" fill="#6aa0d8" />
          <path d="M70 4 L54 50 L46 50 L62 4 Z" fill="#f37a8a" />
          <circle cx="50" cy="66" r="24" fill={GOLD} stroke={GOLD_DARK} strokeWidth="4" />
          <path d="M50 54 l4 8 9 1 -7 6 2 9 -8 -4 -8 4 2 -9 -7 -6 9 -1 Z" fill={GOLD_DARK} />
        </g>
      );
    case "camera":
      return (
        <g>
          <rect x="34" y="20" width="22" height="12" rx="3" fill="#4a556e" />
          <rect x="10" y="28" width="80" height="54" rx="10" fill="#5d6a86" />
          <rect x="10" y="40" width="80" height="8" fill="#4a556e" />
          <circle cx="50" cy="56" r="20" fill="#e9e4f2" />
          <circle cx="50" cy="56" r="13" fill="#2b3048" />
          <circle cx="45" cy="51" r="4" fill="#ffffff" opacity="0.8" />
          <rect x="70" y="32" width="12" height="6" rx="2" fill="#fff3a8" />
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x="30" y="8" width="40" height="84" rx="9" fill="#3b3f5c" />
          <rect x="35" y="16" width="30" height="62" rx="4" fill="#9fd0f2" />
          <circle cx="50" cy="85" r="3.5" fill="#6b7090" />
          <path d="M41 32 h18 M41 42 h12" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case "book":
      return (
        <g>
          <path d="M8 26 Q30 18 50 28 Q70 18 92 26 L92 82 Q70 74 50 84 Q30 74 8 82 Z" fill="#c65f5f" />
          <path d="M13 26 Q30 20 48 29 L48 78 Q30 70 13 76 Z" fill="#f6efe0" />
          <path d="M87 26 Q70 20 52 29 L52 78 Q70 70 87 76 Z" fill="#fbf7ee" />
          <path d="M20 38 h20 M20 48 h22 M20 58 h18 M60 38 h20 M60 48 h18 M60 58 h20" stroke="#c9bfa8" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "mug":
      return (
        <g>
          <path d="M40 8 q-6 8 0 14 M54 4 q-6 8 0 16" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M70 42 q20 0 20 16 q0 16 -20 16" stroke="#e98aa0" strokeWidth="8" fill="none" />
          <rect x="18" y="30" width="56" height="60" rx="10" fill="#f3a3b5" />
          <ellipse cx="46" cy="32" rx="28" ry="6" fill="#8a5e3c" />
          <path d="M36 60 c0 -6 10 -6 10 0 c0 -6 10 -6 10 0 c0 8 -10 12 -10 14 c0 -2 -10 -6 -10 -14 Z" fill="#ffffff" opacity="0.8" />
        </g>
      );
    case "cake":
      return (
        <g>
          <rect x="48" y="6" width="5" height="18" rx="2" fill="#8fd0ff" />
          <path d="M50 0 q6 6 0 10 q-6 -4 0 -10 Z" fill="#ffb84d" />
          <rect x="26" y="26" width="48" height="26" rx="6" fill="#f7d6e0" />
          <rect x="12" y="50" width="76" height="36" rx="8" fill="#f1b6c8" />
          <path d="M12 58 q8 10 16 0 q8 10 16 0 q8 10 16 0 q8 10 16 0 q6 8 12 0 L88 52 L12 52 Z" fill="#fff6f8" />
          <path d="M26 32 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 L74 28 L26 28 Z" fill="#fff6f8" />
          {[22, 40, 58, 76].map((x) => <circle key={x} cx={x} cy="74" r="3" fill="#f37a8a" />)}
          <ellipse cx="50" cy="88" rx="44" ry="6" fill="#e9e4f2" />
        </g>
      );
    case "gift":
      return (
        <g>
          <rect x="14" y="38" width="72" height="54" rx="6" fill="#8fb8e8" />
          <rect x="10" y="28" width="80" height="16" rx="4" fill="#a7c8ef" />
          <rect x="44" y="28" width="12" height="64" fill="#f39ab4" />
          <path d="M50 28 C34 6 18 18 30 28 Z M50 28 C66 6 82 18 70 28 Z" fill="#f39ab4" />
        </g>
      );
    case "balloon":
      return (
        <g>
          <path d="M50 62 Q44 76 52 86 Q58 94 50 100" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.85" />
          <ellipse cx="50" cy="32" rx="24" ry="30" fill="#f37a8a" />
          <path d="M46 62 L54 62 L50 68 Z" fill="#e05f72" />
          <ellipse cx="41" cy="20" rx="6" ry="9" fill="#ffffff" opacity="0.45" />
        </g>
      );
    case "flowers":
      return (
        <g>
          <path d="M50 96 L42 50 M50 96 L50 46 M50 96 L60 50" stroke="#6aa97c" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 62 L68 62 L58 98 L42 98 Z" fill="#f6efe0" />
          {[[36, 34, "#f39ab4"], [50, 24, "#fff3a8"], [64, 36, "#c9b6e4"], [44, 46, "#f37a8a"], [58, 48, "#f6c453"]].map(([x, y, c]) => (
            <g key={`${x}-${y}`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={(x as number) + 7 * Math.cos(((a as number) * Math.PI) / 180)} cy={(y as number) + 7 * Math.sin(((a as number) * Math.PI) / 180)} r="5.5" fill={c as string} />
              ))}
              <circle cx={x as number} cy={y as number} r="4" fill="#f6c453" />
            </g>
          ))}
        </g>
      );
    case "ball":
      return (
        <g>
          <circle cx="50" cy="50" r="38" fill="#f3a35a" />
          <path d="M12 50 h76 M50 12 v76 M23 23 q27 27 0 54 M77 23 q-27 27 0 54" stroke="#c9733a" strokeWidth="3.5" fill="none" />
          <ellipse cx="36" cy="32" rx="8" ry="5" fill="#ffffff" opacity="0.35" />
        </g>
      );
    case "guitar":
      return (
        <g transform="rotate(-30 50 50)">
          <rect x="45" y="0" width="10" height="50" rx="2" fill="#8a5e3c" />
          <rect x="42" y="0" width="16" height="10" rx="3" fill="#5f3f2a" />
          <circle cx="50" cy="62" r="16" fill="#e09a5a" />
          <circle cx="50" cy="82" r="20" fill="#e09a5a" />
          <circle cx="50" cy="68" r="6" fill="#5f3f2a" />
          <rect x="42" y="84" width="16" height="4" rx="2" fill="#5f3f2a" />
        </g>
      );
    case "microphone":
      return (
        <g>
          <rect x="44" y="34" width="12" height="62" rx="5" fill="#3b3f5c" />
          <circle cx="50" cy="24" r="18" fill="#b8bccb" />
          <path d="M36 18 h28 M34 26 h32 M38 34 h24" stroke="#8d92a6" strokeWidth="2.5" />
          <rect x="40" y="40" width="20" height="6" rx="3" fill={GOLD} />
        </g>
      );
    case "trophy":
      return (
        <g>
          <path d="M28 14 h44 v20 q0 26 -22 30 q-22 -4 -22 -30 Z" fill={GOLD} />
          <path d="M28 20 q-18 0 -16 14 q2 12 18 12 M72 20 q18 0 16 14 q-2 12 -18 12" stroke={GOLD_DARK} strokeWidth="5" fill="none" />
          <rect x="44" y="62" width="12" height="14" fill={GOLD_DARK} />
          <rect x="30" y="76" width="40" height="14" rx="3" fill="#8a5e3c" />
          <path d="M50 24 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 Z" fill="#fff3a8" />
        </g>
      );
    case "fire-alarm":
      return (
        <g>
          <path d="M14 30 l-10 -6 M14 50 h-12 M14 70 l-10 6 M86 30 l10 -6 M86 50 h12 M86 70 l10 6" stroke="#ffd36b" strokeWidth="4" strokeLinecap="round" />
          <rect x="22" y="12" width="56" height="76" rx="8" fill="#e45757" />
          <rect x="30" y="20" width="40" height="14" rx="3" fill="#ffffff" />
          <path d="M37 27 h4 M45 27 h4 M53 27 h4 M61 27 h2" stroke="#e45757" strokeWidth="4" strokeLinecap="round" />
          <rect x="32" y="44" width="36" height="22" rx="4" fill="#c43e3e" />
          <rect x="38" y="52" width="24" height="8" rx="3" fill="#ffffff" />
          <circle cx="50" cy="77" r="5" fill="#ffd36b" />
        </g>
      );
    case "clock":
      return (
        <g>
          <circle cx="50" cy="50" r="40" fill="#fbf7ee" stroke="#8a5e3c" strokeWidth="7" />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="48" y="16" width="4" height="8" rx="2" fill={INK} transform={`rotate(${a} 50 50)`} />
          ))}
          <path d="M50 50 L50 28 M50 50 L66 58" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="4" fill="#e45757" />
        </g>
      );
    case "picture":
      return (
        <g>
          <rect x="10" y="16" width="80" height="66" rx="3" fill="#a9774a" />
          <rect x="18" y="24" width="64" height="50" fill="#bfe0f5" />
          <path d="M18 74 L40 48 L54 62 L66 52 L82 70 L82 74 Z" fill="#7fbf7b" />
          <circle cx="68" cy="36" r="6" fill="#fff3a8" />
        </g>
      );
    case "lamp":
      return (
        <g>
          <ellipse cx="50" cy="44" rx="34" ry="14" fill="#fff3a8" opacity="0.35" />
          <path d="M30 10 h40 l12 34 h-64 Z" fill="#f6c9a8" />
          <rect x="47" y="44" width="6" height="40" fill="#8a5e3c" />
          <ellipse cx="50" cy="88" rx="20" ry="6" fill="#8a5e3c" />
        </g>
      );
    case "candle":
      return (
        <g>
          <circle cx="50" cy="26" r="22" fill="#ffd36b" opacity="0.3" />
          <path d="M50 10 q10 12 0 22 q-10 -10 0 -22 Z" fill="#ffb84d" />
          <path d="M50 18 q4 6 0 11 q-4 -5 0 -11 Z" fill="#fff3a8" />
          <rect x="38" y="34" width="24" height="52" rx="4" fill="#fbf2e2" />
          <path d="M38 40 q6 6 12 0 q6 8 12 0" fill="#f1e2c8" />
          <ellipse cx="50" cy="88" rx="22" ry="6" fill="#c9a26a" />
        </g>
      );
    case "backpack":
      return (
        <g>
          <path d="M34 22 q16 -20 32 0" stroke="#5e9670" strokeWidth="6" fill="none" />
          <rect x="18" y="20" width="64" height="74" rx="18" fill="#7fb38f" />
          <rect x="28" y="56" width="44" height="28" rx="8" fill="#6aa07c" />
          <rect x="42" y="62" width="16" height="5" rx="2.5" fill={GOLD} />
        </g>
      );
    case "umbrella":
      return (
        <g>
          <path d="M50 42 L50 86 q0 10 -10 10 q-8 0 -8 -8" stroke="#5f3f2a" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M6 44 Q10 6 50 6 Q90 6 94 44 Q84 36 72 44 Q62 36 50 44 Q38 36 28 44 Q16 36 6 44 Z" fill="#8f7fb3" />
          <path d="M50 6 Q36 20 28 44 M50 6 Q64 20 72 44" stroke="#7a6a9e" strokeWidth="2.5" fill="none" />
        </g>
      );
    case "laptop":
      return (
        <g>
          <rect x="18" y="20" width="64" height="44" rx="5" fill="#5d6a86" />
          <rect x="23" y="25" width="54" height="34" rx="2" fill="#c9e0f7" />
          <path d="M6 66 h88 l-6 12 h-76 Z" fill="#b8bccb" />
          <path d="M30 34 h28 M30 42 h18" stroke="#6aa0d8" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "plate":
      return (
        <g>
          <ellipse cx="50" cy="66" rx="44" ry="16" fill="#fbf7ee" stroke="#e1d8c6" strokeWidth="3" />
          <ellipse cx="50" cy="64" rx="30" ry="9" fill="#efe6d4" />
          <path d="M30 60 q20 -30 40 0 Z" fill="#f3a35a" />
          <circle cx="40" cy="56" r="4" fill="#e45757" />
          <circle cx="56" cy="52" r="4" fill="#7fbf7b" />
        </g>
      );
    case "letter":
      return (
        <g>
          <rect x="8" y="24" width="84" height="56" rx="5" fill="#fbf2e2" />
          <path d="M8 28 L50 58 L92 28" stroke="#e1cfae" strokeWidth="4" fill="none" />
          <path d="M44 56 c0 -6 6 -8 6 -3 c0 -5 6 -3 6 3 c0 5 -6 8 -6 9 c0 -1 -6 -4 -6 -9 Z" fill="#e45757" />
        </g>
      );
    case "heart":
      return <path d="M50 88 C10 62 8 30 28 22 C40 17 48 26 50 32 C52 26 60 17 72 22 C92 30 90 62 50 88 Z" fill="#f37a8a" />;
    case "star":
      return <path d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36 Z" fill="#f6d38b" stroke={GOLD_DARK} strokeWidth="3" strokeLinejoin="round" />;
    case "music":
      return (
        <g fill="#b9acd6">
          <path d="M30 70 L30 22 L72 12 L72 60" stroke="#b9acd6" strokeWidth="6" fill="none" />
          <ellipse cx="22" cy="72" rx="11" ry="8" />
          <ellipse cx="64" cy="62" rx="11" ry="8" />
          <path d="M30 30 L72 20" stroke="#b9acd6" strokeWidth="8" />
        </g>
      );
    case "fireworks":
      return (
        <g strokeLinecap="round" strokeWidth="4">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            const c = ["#f37a8a", "#f6d38b", "#8fd0ff", "#c9b6e4"][i % 4];
            return (
              <g key={i}>
                <path d={`M${50 + 14 * Math.cos(a)} ${50 + 14 * Math.sin(a)} L${50 + 36 * Math.cos(a)} ${50 + 36 * Math.sin(a)}`} stroke={c} />
                <circle cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="3.5" fill={c} />
              </g>
            );
          })}
        </g>
      );
  }
}

export function PropArt({
  item,
  emoji,
  className,
  title,
}: {
  item: PropItem;
  emoji?: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={cn("overflow-visible", className)} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {item === "other" ? (
        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fontSize="78" style={{ filter: "saturate(0.75)" }}>
          {emoji ?? "✨"}
        </text>
      ) : (
        <Art item={item} />
      )}
    </svg>
  );
}
