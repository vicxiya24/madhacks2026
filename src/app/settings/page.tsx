import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CharacterPicker } from "@/components/bear/character-picker";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBearVariant } from "@/lib/profile";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

const TABS = [
  { key: "character", label: "Character" },
  { key: "account", label: "Account" },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings");
  const [{ tab }, variant] = await Promise.all([searchParams, getBearVariant()]);
  const active = tab === "account" ? "account" : "character";

  return (
    <>
      <SiteHeader email={user.email} />
      <main>
        <PageContainer className="grid gap-6">
          <h1 className="font-hand text-5xl font-bold">settings</h1>

          <nav className="flex gap-1 rounded-full bg-white/5 p-1 sm:w-fit" role="tablist" aria-label="Settings sections">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={t.key === "character" ? "/settings" : `/settings?tab=${t.key}`}
                role="tab"
                aria-selected={active === t.key}
                className={cn(
                  "flex-1 rounded-full px-5 py-2 text-center text-sm transition sm:flex-none",
                  active === t.key ? "bg-[#c9d6ff] font-medium text-[#1a1c42]" : "text-[#c9d6ff] hover:bg-white/10",
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          {active === "character" ? (
            <CharacterPicker initial={variant} />
          ) : (
            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <h2 className="font-hand text-3xl font-bold">account</h2>
                  <p className="text-muted-foreground text-sm">Signed in as {user.email}</p>
                </div>
                <form action={signOut}>
                  <Button type="submit" variant="outline" className="rounded-full">
                    Sign out
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
