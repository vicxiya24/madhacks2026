import Link from "next/link";
import { Settings } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

/** The gear in the corner of the sketch. A tiny no-JS dropdown. */
export function SettingsMenu({ email, className }: { email?: string | null; className?: string }) {
  return (
    <details className={cn("group relative z-50", className)}>
      <summary
        className="grid size-11 cursor-pointer list-none place-items-center rounded-full text-[#dfe6ff] transition hover:rotate-45 hover:bg-white/10 [&::-webkit-details-marker]:hidden"
        aria-label="Settings"
      >
        <Settings className="size-7" strokeWidth={2.5} />
      </summary>
      <div className="bg-popover absolute right-0 mt-2 w-60 rounded-2xl border p-2 text-sm shadow-xl backdrop-blur">
        {email ? (
          <>
            <p className="text-muted-foreground truncate px-3 py-2 text-xs">{email}</p>
            <Link href="/dig" className="block rounded-xl px-3 py-2 hover:bg-white/10">
              Your dig site
            </Link>
            <Link href="/settings" className="block rounded-xl px-3 py-2 hover:bg-white/10">
              Customize your bear
            </Link>
            <Link href="/settings?tab=account" className="block rounded-xl px-3 py-2 hover:bg-white/10">
              Account
            </Link>
            <form action={signOut}>
              <button type="submit" className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/10">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="block rounded-xl px-3 py-2 hover:bg-white/10">
            Sign in
          </Link>
        )}
      </div>
    </details>
  );
}
