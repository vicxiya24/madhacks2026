import Link from "next/link";
import { GitCompareArrows, Layers, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/supabase/server";

const PILLARS = [
  {
    Icon: Layers,
    title: "Stratigraphic intake",
    body: "Log what happened, how it's been retold, and how it feels now as separate sedimentary layers.",
  },
  {
    Icon: Timer,
    title: "Reconsolidation window",
    body: "Reopen a memory inside a time-boxed excavation. A prediction-error prompt loosens the old story.",
  },
  {
    Icon: GitCompareArrows,
    title: "Version delta",
    body: "Every reframe is layered on top, never overwritten. Compare how your interpretation has shifted.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <>
      <SiteHeader email={user?.email} />
      <main className="mx-auto max-w-5xl px-4">
        <section className="py-20 sm:py-28">
          <p className="text-primary font-mono text-xs tracking-[0.25em] uppercase">
            Memory is reconstructive
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] sm:text-6xl">
            Every time you remember something, you rebuild it.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            Memory Archaeologist treats your past like a dig site. Brush away the sediment, find the
            original artifact, and consciously decide what story to bury it with this time.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={user ? "/dig" : "/login"}>{user ? "Go to your dig site" : "Start digging"}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-3">
          {PILLARS.map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className="bg-card relative p-6"
              style={{ borderTop: `4px solid var(--stratum-${i + 2})` }}
            >
              <Icon className="text-primary size-5" aria-hidden />
              <h2 className="mt-4 font-serif text-lg">{title}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{body}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
