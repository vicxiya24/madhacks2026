import { takeReminisce } from "@/app/actions/reminisce";
import type { ReminisceState } from "@/lib/reminisce-state";
import { cn } from "@/lib/utils";

/**
 * "Let's reminisce about..." thought bubble, rising from the bear.
 * Shines (soft gold glow and sparkles) when the bear has a memory to suggest,
 * and rests dim between suggestions.
 */
export function ReminisceBubble({ state, className }: { state: ReminisceState; className?: string }) {
  const ready = state.kind === "ready";

  const bubble = (
    <span
      className={cn(
        "relative grid min-h-16 w-[7.25rem] place-items-center rounded-[50%] border-[3px] px-3 py-3 text-center sm:min-h-20 sm:w-60 sm:px-7",
        "font-hand leading-tight font-bold backdrop-blur-sm transition duration-300",
        ready
          ? "animate-reminisce border-[#f6d38b] bg-[#f6d38b]/12 text-[#fff6e0] group-hover:scale-105 group-hover:bg-[#f6d38b]/20"
          : "border-[#c9d6ff] bg-white/5 text-[#eef1ff] opacity-40",
      )}
    >
      <span className="text-sm sm:text-lg sm:whitespace-nowrap">Let&apos;s reminisce about&hellip;</span>
      {ready ? (
        <span className="line-clamp-2 max-w-full text-xs font-normal text-[#f6d38b] italic sm:line-clamp-1 sm:text-base">
          {state.memory.title}
        </span>
      ) : (
        <span className="text-[11px] font-normal text-[#aab3dc] sm:text-xs">
          {state.kind === "empty" ? "nothing old enough yet" : "your bear is still dreaming"}
        </span>
      )}

      {ready && (
        // a few sparkles to say "this one's ready"
        <span className="pointer-events-none absolute inset-0" aria-hidden>
          {[
            "-top-2 left-3 size-3 [animation-delay:0s]",
            "-top-3 right-6 size-2 [animation-delay:.8s]",
            "-right-2 bottom-2 size-2.5 [animation-delay:1.6s]",
          ].map((pos) => (
            <svg key={pos} viewBox="0 0 10 10" className={cn("animate-twinkle absolute fill-[#f6d38b]", pos)}>
              <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" />
            </svg>
          ))}
        </span>
      )}
    </span>
  );

  // Trailing dots down toward the bear's head, so the thought comes from the bear.
  const dots = (
    <span className="pointer-events-none absolute top-full left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 pt-1.5" aria-hidden>
      <span className={cn("size-3.5 rounded-full border-[3px]", ready ? "border-[#f6d38b]" : "border-[#c9d6ff] opacity-40")} />
      <span className={cn("size-2 translate-x-1.5 rounded-full border-2", ready ? "border-[#f6d38b]" : "border-[#c9d6ff] opacity-40")} />
    </span>
  );

  if (!ready) {
    return (
      <span
        className={cn("animate-drift relative inline-block", className)}
        aria-disabled
        aria-label={state.kind === "empty" ? "Nothing old enough to reminisce about yet" : "Reminisce: resting for now, check back later"}
      >
        {bubble}
        {dots}
      </span>
    );
  }

  return (
    <form action={takeReminisce} className={cn("animate-drift relative inline-block", className)}>
      <input type="hidden" name="memoryId" value={state.memory.id} />
      <button
        type="submit"
        aria-label={`Let's reminisce about "${state.memory.title}"`}
        className="group block cursor-pointer rounded-[50%] outline-none focus-visible:ring-4 focus-visible:ring-[#f6d38b]/60"
      >
        {bubble}
      </button>
      {dots}
    </form>
  );
}
