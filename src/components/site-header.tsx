import Link from "next/link";
import { Moon } from "lucide-react";
import { SettingsMenu } from "@/components/dream/settings-menu";

export function SiteHeader({ email }: { email?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#12142f]/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-hand flex items-center gap-2 text-2xl font-bold text-[#eef1ff]">
          <Moon className="size-5 fill-[#f3ead2] text-[#f3ead2]" aria-hidden />
          memory archaeologist
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {email && (
            <>
              <Link href="/dig" className="rounded-full px-3 py-2 text-[#c9d6ff] hover:bg-white/10">
                Dig site
              </Link>
              <Link href="/dig/new" className="hidden rounded-full px-3 py-2 text-[#c9d6ff] hover:bg-white/10 sm:block">
                New entry
              </Link>
            </>
          )}
          <SettingsMenu email={email} />
        </nav>
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
