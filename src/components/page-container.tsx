import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  narrow,
  children,
}: {
  className?: string;
  narrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto px-4 py-10", narrow ? "max-w-2xl" : "max-w-5xl", className)}>
      {children}
    </div>
  );
}
