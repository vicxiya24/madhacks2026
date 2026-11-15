"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const DURATION = 950;

type SceneFlag = "diving" | "surfacing";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Starts a full-screen scene change: sets a flag on <html> so CSS can animate
 * the current scene out, then navigates once the animation has played.
 */
function useSceneChange(href: string, flag: SceneFlag) {
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

type LinkProps = { href: string; className?: string; children: React.ReactNode };

/** "Dive": home lifts up and away, then the dig site rises into place. */
export function DiveLink({ href, className, children }: LinkProps) {
  const onClick = useSceneChange(href, "diving");
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

/** "Back to the surface": the dig site drops away and home floats in. */
export function SurfaceLink({ href = "/", className, children }: Partial<LinkProps> & { children: React.ReactNode }) {
  const onClick = useSceneChange(href, "surfacing");
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

/**
 * Mounted once in the root layout. Clears the transition flags after each
 * navigation so the new scene renders normally. Page-level effects (SceneIn)
 * run before this one, so they can still read the flags.
 */
export function SceneArrival() {
  const pathname = usePathname();
  useEffect(() => {
    const ds = document.documentElement.dataset;
    delete ds.diving;
    delete ds.surfacing;
  }, [pathname]);
  return null;
}

/**
 * Wraps a scene that animates in when you arrive via a scene change:
 * `from="surfacing"` floats down from above, `from="diving"` rises up from below.
 */
export function SceneIn({
  from,
  className,
  children,
}: {
  from: SceneFlag;
  className?: string;
  children: React.ReactNode;
}) {
  const [arriving, setArriving] = useState(false);
  useEffect(() => {
    if (document.documentElement.dataset[from]) setArriving(true);
  }, [from]);
  return (
    <div className={cn(arriving && (from === "diving" ? "animate-rise-in" : "animate-float-in"), className)}>
      {children}
    </div>
  );
}

/** Home page: floats in when arriving from the dig site. */
export function FloatIn(props: { className?: string; children: React.ReactNode }) {
  return <SceneIn from="surfacing" {...props} />;
}
