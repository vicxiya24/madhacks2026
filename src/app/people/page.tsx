import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { PageContainer } from "@/components/page-container";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PeopleManager } from "@/components/people/people-manager";
import { getCurrentUser } from "@/lib/supabase/server";
import { listPeople } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "People in my life" };

export default async function PeoplePage() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/people");
  const people = await listPeople();

  return (
    <>
      <SiteHeader email={user.email} />
      <main>
        <PageContainer narrow className="grid gap-6">
          <div>
            <h1 className="font-hand text-5xl leading-tight font-bold">People in my life</h1>
            <p className="text-muted-foreground mt-3 text-sm">
              Everyone who turns up in your memories. Give each of them an animal, then tag them
              when you write an entry.
            </p>
          </div>
          <PeopleManager initial={people} />
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
