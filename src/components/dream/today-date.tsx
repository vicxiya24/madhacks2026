"use client";

import { useEffect, useState } from "react";

/** Today's date in the viewer's own timezone (rendered after mount to avoid SSR drift). */
export function TodayDate({ className }: { className?: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setLabel(
      now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    );
  }, []);

  return (
    <h1 className={className} aria-live="polite">
      {label ?? " "}
    </h1>
  );
}
