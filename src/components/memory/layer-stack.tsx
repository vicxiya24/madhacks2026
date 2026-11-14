import { LAYER_META } from "@/lib/memory/constants";
import type { MemoryLayer } from "@/types/memory";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * A memory's strata, newest deposit on top (like real stratigraphy).
 * The deepest layer is always the original core event.
 */
export function LayerStack({
  layers,
  className,
  clampLines = false,
}: {
  layers: MemoryLayer[];
  className?: string;
  clampLines?: boolean;
}) {
  const topDown = [...layers].sort((a, b) => b.version - a.version);

  return (
    <ol className={cn("overflow-hidden rounded-xl border", className)} aria-label="Memory strata">
      {topDown.map((layer, i) => {
        const meta = LAYER_META[layer.layer_type];
        return (
          <li key={layer.id} className={cn("relative", i > 0 && "border-t")}>
            <div className={cn("absolute inset-y-0 left-0 w-1.5", meta.stratum)} aria-hidden />
            <div className="grid gap-1.5 py-4 pr-5 pl-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  v{layer.version} · {formatDateTime(layer.created_at)}
                </span>
              </div>
              <p
                className={cn(
                  "text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap",
                  clampLines && "line-clamp-4",
                )}
              >
                {layer.content}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
