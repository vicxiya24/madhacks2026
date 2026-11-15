"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const DURATION = 950;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Starts a full-screen scene change: sets a flag on <html> so CSS can animate
 * the current scene out, then navigates once the animation has played.
 */
function useSceneChange(href: string, flag: "diving" | "surfacing") {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }
    document.documentElement.dataset[flag] = "true";
    window.setTimeout(() => router.push(href), DURATION);
  };
}

/** The "Dive" button: the scene sinks into the strata before the dig site loads. */
export function DiveLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const onClick = useSceneChange(href, "diving");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
      {/* Rises from below while diving. Portalled to <body> so it isn't caught
          inside the moving scene (a transformed parent would trap position:fixed). */}
      {mounted &&
        createPortal(
          <div className="dive-curtain strata-gradient" aria-hidden>
            <Bubbles />
          </div>,
          document.body,
        )}
    </>
  );
}

/** "Back to the surface": the dig site drops away and home floats in. */
export function SurfaceLink({
  href = "/",
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const onClick = useSceneChange(href, "surfacing");
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

/**
 * Mounted once in the root layout. After each navigation it finishes whichever
 * transition brought us here (the strata curtain keeps rising after a dive) and
 * clears the flags so the new scene renders normally.
 * Page-level effects (e.g. FloatIn) run before this one, so they can still read the flags.
 */
export function SceneArrival() {
  const pathname = usePathname();
  const [curtain, setCurtain] = useState(false);

  useEffect(() => {
    const ds = document.documentElement.dataset;
    const dived = !!ds.diving;
    delete ds.diving;
    delete ds.surfacing;
    if (!dived) return;
    setCurtain(true);
    const t = window.setTimeout(() => setCurtain(false), 1000);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!curtain) return null;
  return (
    <div className="curtain-out strata-gradient" aria-hidden>
      <Bubbles />
    </div>
  );
}

/** Marks a page that should float in when arriving from the dig site. */
export function FloatIn({ className, children }: { className?: string; children: React.ReactNode }) {
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    if (document.documentElement.dataset.surfacing) setFloating(true);
  }, []);
  return <div className={cn(floating && "animate-float-in", className)}>{children}</div>;
}

function Bubbles() {
  const bubbles = [
    { left: "12%", size: 14, delay: "0s" },
    { left: "28%", size: 9, delay: ".25s" },
    { left: "47%", size: 18, delay: ".1s" },
    { left: "63%", size: 11, delay: ".4s" },
    { left: "81%", size: 15, delay: ".2s" },
    { left: "90%", size: 8, delay: ".5s" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="animate-rise absolute bottom-0 rounded-full border-2 border-white/70"
          style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: "1.6s" }}
        />
      ))}
    </div>
  );
}
