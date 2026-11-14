import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  children: React.ReactNode;
  /** which way the little trailing dots point (toward the bear) */
  tail: "left" | "right";
  disabled?: boolean;
  className?: string;
  label?: string;
};

/** Cloud-like thought bubble with trailing dots, as in the sketch. */
export function ThoughtBubble({ href, children, tail, disabled, className, label }: Props) {
  const bubble = (
    <span
      className={cn(
        "relative grid min-h-24 min-w-36 place-items-center rounded-[50%] border-[3px] px-6 py-5 text-center sm:min-h-28 sm:min-w-44 sm:px-8 sm:py-6",
        "font-hand text-2xl leading-none font-bold sm:text-3xl",
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

  const dots = (
    <span
      className={cn(
        "pointer-events-none absolute -bottom-12 flex flex-col gap-3",
        tail === "left" ? "right-1/2 items-end" : "left-1/2 items-start",
      )}
      aria-hidden
    >
      <span className={cn("size-5 rounded-full border-[3px] border-[#c9d6ff]", tail === "left" ? "-mr-2" : "-ml-2")} />
      <span className={cn("size-3 rounded-full border-[3px] border-[#c9d6ff]", tail === "left" ? "mr-6" : "ml-6")} />
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
