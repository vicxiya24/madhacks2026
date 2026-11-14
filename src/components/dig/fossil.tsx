import Image from "next/image";
import { cn, hashString } from "@/lib/utils";

const FOSSILS = ["/fossils/fossil-1.png", "/fossils/fossil-2.png", "/fossils/fossil-3.png"];

/** One of the three hand-drawn fossils, picked and rotated deterministically per memory. */
export function FossilImage({
  seed,
  size,
  className,
  priority,
}: {
  seed: string;
  size: number;
  className?: string;
  priority?: boolean;
}) {
  const h = hashString(seed);
  const src = FOSSILS[h % FOSSILS.length];
  const rotation = ((h >> 4) % 70) - 35;

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("pointer-events-none select-none", className)}
      style={{ transform: `rotate(${rotation}deg)`, width: size, height: "auto" }}
    />
  );
}
