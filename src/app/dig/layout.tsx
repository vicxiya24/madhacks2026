import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function DigLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Middleware already guards /dig; this is defence in depth.
  if (!user) redirect("/login?next=/dig");

  return (
    <>
      <SiteHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      <SiteFooter />
    </>
  );
}
