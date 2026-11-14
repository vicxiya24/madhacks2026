"use client";

import { useEffect, useRef, useState } from "react";
import { SESSION_GRACE_SECONDS } from "@/lib/memory/constants";

export type WindowPhase = "open" | "closing" | "closed";

/**
 * Tracks the reconsolidation window against the *server's* clock.
 * `serverNow` is captured at render time so client clock skew can't extend
 * (or shorten) the window, and the first client render matches SSR output.
 */
export function useLabileWindow({
  expiresAt,
  serverNow,
}: {
  expiresAt: string;
  serverNow: number;
}) {
  const expiresMs = new Date(expiresAt).getTime();
  const skewRef = useRef<number | null>(null);
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    if (skewRef.current === null) skewRef.current = serverNow - Date.now();
    const tick = () => setNow(Date.now() + (skewRef.current ?? 0));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [serverNow]);

  const remainingMs = expiresMs - now;
  const graceRemainingMs = remainingMs + SESSION_GRACE_SECONDS * 1000;

  const phase: WindowPhase =
    remainingMs > 0 ? "open" : graceRemainingMs > 0 ? "closing" : "closed";

  return {
    phase,
    remainingSeconds: Math.max(0, remainingMs / 1000),
    graceRemainingSeconds: Math.max(0, graceRemainingMs / 1000),
  };
}
