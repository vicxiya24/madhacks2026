import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-md gap-6 px-4 py-16">
        <div>
          <h1 className="font-hand text-5xl font-bold">Enter the dig site</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your memories are private to your account and protected by row-level security.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            That sign-in link didn&apos;t work. Please try again.
          </p>
        )}
        <LoginForm next={next} />
      </main>
    </>
  );
}
