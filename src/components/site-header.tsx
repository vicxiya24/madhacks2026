import Link from "next/link";
import { Layers } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SiteHeader({ email }: { email?: string | null }) {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href={email ? "/dig" : "/"} className="flex items-center gap-2 font-serif text-lg">
          <Layers className="text-primary size-5" aria-hidden />
          Memory Archaeologist
        </Link>
        {email ? (
          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dig">Dig site</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dig/new">New memory</Link>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" title={email}>
                Sign out
              </Button>
            </form>
          </nav>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="text-muted-foreground mx-auto max-w-5xl px-4 py-10 text-xs">
      Memory Archaeologist is a reflective journaling tool, not therapy or medical care. If a
      memory feels overwhelming, pause and reach out to a mental-health professional or a crisis
      line in your area.
    </footer>
  );
}
