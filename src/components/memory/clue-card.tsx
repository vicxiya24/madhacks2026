import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

/** The context clue the user left for themselves. */
export function ClueCard({ clue, className }: { clue: string | null; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#c9d6ff]/30 bg-[#c9d6ff]/8 px-6 py-5 shadow-[0_0_40px_-12px_rgb(160_185_230_/_0.5)]",
        className,
      )}
    >
      <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
        <KeyRound className="size-3.5" aria-hidden /> The clue you left yourself
      </p>
      <p className="font-hand mt-2 text-3xl leading-snug font-bold text-[#eef1ff]">
        {clue ?? "You didn't leave a clue for this one. Trust whatever surfaces first."}
      </p>
    </div>
  );
}
