import { cn } from "@/lib/utils";

/**
 * Layered, softly undulating bands: the "surface" you dive into.
 * Each band is a full-width SVG so it scales to any screen width.
 */
export function Waves({ className, children }: { className?: string; children?: React.ReactNode }) {
  const bands = [
    { fill: "var(--stratum-2)", d: "M0 40 C 180 10, 360 60, 600 30 S 1020 10, 1200 40 L1200 200 L0 200 Z", opacity: 0.9 },
    { fill: "var(--stratum-3)", d: "M0 80 C 220 50, 420 110, 700 75 S 1050 60, 1200 90 L1200 200 L0 200 Z", opacity: 0.95 },
    { fill: "var(--stratum-4)", d: "M0 125 C 260 100, 480 150, 760 120 S 1080 110, 1200 135 L1200 200 L0 200 Z", opacity: 1 },
    { fill: "var(--stratum-5)", d: "M0 165 C 300 145, 520 185, 820 160 S 1100 150, 1200 170 L1200 200 L0 200 Z", opacity: 1 },
  ];

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {bands.map((b, i) => (
          <path key={i} d={b.d} fill={b.fill} opacity={b.opacity} />
        ))}
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
