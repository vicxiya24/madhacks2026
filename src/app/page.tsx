import { BearSvg } from "@/components/bear/bear-svg";
import { DiveLink, FloatIn } from "@/components/dream/scene-transitions";
import { NightSky } from "@/components/dream/night-sky";
import { SettingsMenu } from "@/components/dream/settings-menu";
import { ThoughtBubble } from "@/components/dream/thought-bubble";
import { TodayDate } from "@/components/dream/today-date";
import { Waves } from "@/components/dream/waves";
import { getCurrentUser } from "@/lib/supabase/server";
import { getEditableMemory } from "@/lib/memory/queries";
import { EDIT_WINDOW_HOURS } from "@/lib/memory/constants";
import { getBearVariant } from "@/lib/profile";
import { DEFAULT_BEAR } from "@/lib/bears";

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);
  const [editable, variant] = user
    ? await Promise.all([
        getEditableMemory().catch(() => null),
        getBearVariant().catch(() => DEFAULT_BEAR),
      ])
    : [null, DEFAULT_BEAR];

  const hoursLeft = editable
    ? Math.max(
        1,
        Math.ceil(EDIT_WINDOW_HOURS - (Date.now() - new Date(editable.created_at).getTime()) / 36e5),
      )
    : null;

  const gate = (path: string) => (user ? path : `/login?next=${encodeURIComponent(path)}`);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* FloatIn (arrival animation) wraps dive-scene (exit transition) so the two never fight over transform. */}
      <FloatIn>
      <div className="dive-scene relative flex min-h-dvh flex-col">
      <NightSky count={80} />
      <SettingsMenu email={user?.email} className="absolute top-4 right-4" />

      <header className="relative z-10 px-6 pt-14 text-center sm:pt-6">
        <TodayDate className="font-hand text-5xl leading-none font-bold text-[#eef1ff] drop-shadow-[0_0_24px_rgb(160_185_230_/_0.45)] sm:text-7xl" />
        <p className="font-hand mt-2 text-lg text-[#aab3dc] sm:text-xl">What&apos;s drifting through your mind tonight?</p>
      </header>

      {/* The dream: two thought bubbles rising from the bear */}
      <section className="relative z-10 mx-auto mt-6 grid w-full max-w-2xl flex-1 grid-cols-2 items-start gap-2 px-3 sm:mt-6 sm:max-w-4xl sm:grid-cols-[3fr_2fr] sm:gap-4 sm:px-4">
        {/* Phones: People sits under New entry. Wider screens: beside it, a little lower. */}
        <div className="flex flex-col items-center gap-16 pt-2 sm:flex-row-reverse sm:items-start sm:justify-start sm:gap-6">
          <ThoughtBubble href={gate("/dig/new")} tail="right" label="Write a new entry">
            New
            <br />
            entry
          </ThoughtBubble>
          <ThoughtBubble href={gate("/people")} tail="right" size="sm" label="People in my life" className="sm:mt-28">
            People
            <br />
            in my life
          </ThoughtBubble>
        </div>

        <div className="flex flex-col items-center pt-12 sm:items-start sm:pt-10">
          <span className="font-hand mb-1 text-xl font-bold text-[#c9d6ff] sm:ml-6 sm:text-2xl" aria-hidden>
            24hr <span className="inline-block translate-y-1">&#8628;</span>
          </span>
          <ThoughtBubble
            href={editable ? `/dig/${editable.id}/edit` : undefined}
            disabled={!editable}
            tail="left"
            label={
              editable
                ? `Edit "${editable.title}", ${hoursLeft} hours left`
                : "Nothing to edit. Entries can be edited for 24 hours after writing."
            }
          >
            Edit
            <br />
            entry
          </ThoughtBubble>
          <p className="font-hand mt-14 max-w-44 text-center text-sm leading-tight text-[#aab3dc] sm:mt-12 sm:ml-2 sm:text-base">
            {editable
              ? `"${editable.title}" · ${hoursLeft}h left`
              : "You can edit an entry for a day after writing it"}
          </p>
        </div>
      </section>

      <div className="relative z-10 -mb-16 flex justify-center sm:-mb-20">
        <BearSvg variant={variant} className="animate-breathe h-auto w-32 drop-shadow-[0_10px_30px_rgb(223_196_175_/_0.25)] sm:w-40" title="Your bear, daydreaming" />
      </div>

      <Waves className="z-0 h-56 sm:h-52">
        <div className="flex h-56 items-end justify-center pb-8 sm:h-52 sm:pb-8">
          <DiveLink
            href={gate("/dig")}
            className="font-hand rounded-[50%] border-[3px] border-[#e7eafb] bg-[#2b2d5e] px-12 py-3 text-4xl font-bold text-[#eef1ff] transition hover:scale-105 hover:bg-[#33366e] focus-visible:ring-4 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            Dive
          </DiveLink>
        </div>
      </Waves>
      </div>
      </FloatIn>
    </main>
  );
}
