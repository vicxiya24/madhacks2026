import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  children: React.ReactNode;
  /** which way the little trailing dots point (toward the bear) */
  tail: "left" | "right" | "down";
  disabled?: boolean;
  className?: string;
  label?: string;
  size?: "lg" | "md" | "sm";
  /** "short" keeps only the first trailing dot (when another bubble sits below, continuing the chain). */
  tailLength?: "full" | "short";
};

/** Cloud-like thought bubble with trailing dots, as in the sketch. */
export function ThoughtBubble({ href, children, tail, disabled, className, label, size = "md", tailLength = "full" }: Props) {
  const bubble = (
    <span
      className={cn(
        "relative grid place-items-center rounded-[50%] border-[3px] text-center font-hand leading-none font-bold",
        size === "lg"
          ? "min-h-32 min-w-44 px-8 py-7 text-3xl sm:min-h-36 sm:min-w-52 sm:px-10 sm:py-8 sm:text-4xl"
          : size === "md"
          ? "min-h-24 min-w-36 px-6 py-5 text-2xl sm:min-h-28 sm:min-w-44 sm:px-8 sm:py-6 sm:text-3xl"
          : "min-h-20 min-w-32 px-5 py-4 text-xl sm:min-h-24 sm:min-w-40 sm:px-6 sm:py-5 sm:text-2xl",
        "border-[#c9d6ff] bg-white/8 text-[#eef1ff] backdrop-blur-sm",
        "shadow-[0_0_40px_-8px_rgb(160_185_230_/_0.55)] transition duration-300",
        !disabled &&
          "group-hover:scale-105 group-hover:bg-white/14 group-hover:shadow-[0_0_60px_-4px_rgb(160_185_230_/_0.8)]",
        disabled && "opacity-45",
      )}
    >
      {children}
    </span>
  );

  const dots = tail === "down" ? (
    <span
      className={cn(
        "pointer-events-none absolute flex -translate-x-1/2 flex-col items-center gap-14",
        // short: a single dot just below, leading into the bubble underneath
        tailLength === "short" ? "-bottom-9 left-[62%]" : "-bottom-32 left-[82%]",
      )}
      aria-hidden
    >
      <span className="size-6 rounded-full border-[3px] border-[#c9d6ff]" />
      {tailLength === "full" && <span className="size-4 rounded-full border-[3px] border-[#c9d6ff] -translate-x-3" />}
    </span>
  ) : (
    <span
      className={cn(
        "pointer-events-none absolute -bottom-24 flex flex-col gap-5",
        tail === "left" ? "right-[65%] items-end" : "left-[65%] items-start",
      )}
      aria-hidden
    >
      <span className={cn("size-5 rounded-full border-[3px] border-[#c9d6ff]", tail === "left" ? "-mr-2" : "-ml-2")} />
      <span className={cn("size-3 rounded-full border-[3px] border-[#c9d6ff]", tail === "left" ? "mr-9" : "ml-9")} />
    </span>
  );

  const classes = cn("group animate-drift relative inline-block", className);

  if (!href || disabled) {
    return (
      <span className={classes} aria-disabled={disabled} aria-label={label}>
        {bubble}
        {dots}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(classes, "rounded-[50%] outline-none focus-visible:ring-4 focus-visible:ring-ring/60")}
    >
      {bubble}
      {dots}
    </Link>
  );
}
