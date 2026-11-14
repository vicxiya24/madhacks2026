import { seededRandom } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Twinkling star field. Deterministic so server and client markup match. */
export function NightSky({
  count = 60,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const rand = seededRandom(seed);
  const stars = Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 2.5,
    delay: rand() * 4,
    duration: 2.5 + rand() * 3,
  }));

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.size > 2.5 ? "0 0 6px 1px rgb(201 224 247 / 0.7)" : undefined,
          }}
        />
      ))}
      {/* crescent moon */}
      <div className="absolute top-3 left-3 size-9 rounded-full shadow-[inset_-7px_-3px_0_0_#f3ead2] opacity-90 sm:top-8 sm:left-12 sm:size-14 sm:shadow-[inset_-10px_-4px_0_0_#f3ead2]" />
    </div>
  );
}
