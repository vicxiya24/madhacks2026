import { InfoTip } from "@/components/ui/info-tip";
import { SETTLED_LABELS } from "./consolidation-meter";

/** "How settled is it?" heading with a hover/tap explanation. */
export function SettledHeading() {
  return (
    <h2 className="font-hand flex items-center gap-2 text-2xl font-bold">
      How settled is it?
      <InfoTip label="What does 'how settled' mean?">
        <span className="block">
          Every time you recall a memory, your brain briefly reopens it, and it can change a
          little before it settles back down. This meter is a rough guide to where this memory
          is in that cycle.
        </span>
        <span className="mt-3 grid gap-1.5">
          {Object.values(SETTLED_LABELS).map((s) => (
            <span key={s.label} className="block">
              <span className={`font-semibold ${s.text}`}>{s.label}:</span> {s.blurb}
            </span>
          ))}
        </span>
        <span className="text-muted-foreground mt-3 block">
          The % goes down when your latest retelling uses different words or a different feeling
          from your first one, and dips for a few hours right after you revisit.
        </span>
      </InfoTip>
    </h2>
  );
}
