import { cn } from "@/lib/utils";

/** The little dreaming bear from the concept sketch. */
export function Bear({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 250"
      className={cn("animate-breathe drop-shadow-[0_10px_30px_rgb(223_196_175_/_0.25)]", className)}
      role="img"
      aria-label="A small bear, daydreaming"
    >
      {/* body */}
      <path
        d="M58 150 C40 190 38 240 52 250 L148 250 C162 240 160 190 142 150 C128 128 72 128 58 150 Z"
        fill="var(--bear)"
      />
      {/* ears */}
      <circle cx="52" cy="52" r="30" fill="var(--bear)" />
      <circle cx="148" cy="52" r="30" fill="var(--bear)" />
      <circle cx="52" cy="52" r="15" fill="#d2b19a" />
      <circle cx="148" cy="52" r="15" fill="#d2b19a" />
      {/* head */}
      <ellipse cx="100" cy="95" rx="62" ry="56" fill="var(--bear)" />
      {/* cheeks */}
      <ellipse cx="66" cy="112" rx="10" ry="6" fill="#f0a9a9" opacity="0.35" />
      <ellipse cx="134" cy="112" rx="10" ry="6" fill="#f0a9a9" opacity="0.35" />
      {/* eyes */}
      <circle cx="78" cy="96" r="6" fill="var(--bear-feature)" />
      <circle cx="124" cy="96" r="6" fill="var(--bear-feature)" />
      {/* nose */}
      <path
        d="M92 112 C92 106 100 105 101 110 C102 105 110 106 110 112 C110 118 101 120 101 120 C101 120 92 118 92 112 Z"
        fill="var(--bear-feature)"
      />
    </svg>
  );
}
