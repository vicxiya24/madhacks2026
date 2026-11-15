"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A small "i" that reveals an explanation on hover, keyboard focus, or tap.
 * The bubble is linked with aria-describedby so screen readers read it too.
 */
export function InfoTip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 grid size-5 place-items-center rounded-full outline-none focus-visible:ring-2"
      >
        <Info className="size-4" aria-hidden />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "bg-popover absolute top-7 right-0 z-50 w-72 rounded-2xl border p-4 text-left text-xs leading-relaxed font-normal shadow-xl transition",
          "sm:right-auto sm:left-1/2 sm:-translate-x-1/2",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
