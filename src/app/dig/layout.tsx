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
      {/* Pages own their width: the dig site is full-bleed, everything else is centred. */}
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
