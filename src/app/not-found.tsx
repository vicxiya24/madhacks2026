import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-32 text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.25em] uppercase">404</p>
      <h1 className="font-hand text-5xl font-bold">Nothing buried here</h1>
      <p className="text-muted-foreground text-sm">
        This dig site doesn&apos;t exist, or it belongs to someone else.
      </p>
      <Button asChild>
        <Link href="/dig">Back to your dig site</Link>
      </Button>
    </main>
  );
}
