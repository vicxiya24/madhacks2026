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
import { ReminisceBubble } from "@/components/dream/reminisce-bubble";
import { getReminisceState } from "@/lib/reminisce-state";

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);
  const [editable, variant, reminisce] = user
    ? await Promise.all([
        getEditableMemory().catch(() => null),
        getBearVariant().catch(() => DEFAULT_BEAR),
        getReminisceState(user.id).catch(() => null),
      ])
    : [null, DEFAULT_BEAR, null];

  const hoursLeft = editable
    ? Math.max(
        1,
        Math.ceil(EDIT_WINDOW_HOURS - (Date.now() - new Date(editable.created_at).getTime()) / 36e5),
      )
    : null;

  const gate = (path: string) => (user ? path : `/login?next=${encodeURIComponent(path)}`);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* FloatIn wraps dive-scene so the arrival and exit animations use separate transforms. */}
      <FloatIn>
        <div className="dive-scene relative flex min-h-dvh flex-col">
          <NightSky count={80} />
          <SettingsMenu email={user?.email} className="absolute top-4 right-4" />

          <header className="relative z-10 px-6 pt-36 text-center sm:pt-20">
            <TodayDate className="font-hand text-5xl leading-none font-bold text-[#eef1ff] drop-shadow-[0_0_24px_rgb(160_185_230_/_0.45)] sm:text-7xl" />
            <p className="font-hand mt-2 text-lg text-[#aab3dc] sm:text-xl">something on your mind?</p>
          </header>

          <section className="relative z-20 mx-auto mt-6 grid w-full max-w-2xl flex-1 grid-cols-2 items-end gap-2 px-3 sm:mt-6 sm:max-w-4xl sm:grid-cols-[3fr_2fr] sm:gap-4 sm:px-4">
            <div className="flex flex-col items-center gap-10 sm:flex-row-reverse sm:items-end sm:justify-start sm:gap-6">
              <ThoughtBubble
                href={gate("/dig/new")}
                tail="down"
                tailLength={reminisce ? "short" : "full"}
                size="lg"
                label="Write a new entry"
                className="-translate-y-32 -translate-x-10 scale-125"
              >
                New
                <br />
                entry
              </ThoughtBubble>
              <ThoughtBubble
                href={gate("/people")}
                tail="right"
                size="sm"
                label="People in my life"
                className="relative mb-4 -translate-x-10 translate-y-6 sm:left-10 sm:mb-6"
              >
                People
                <br />
                in my life
              </ThoughtBubble>
            </div>

            <div className="relative flex flex-col items-center pt-36 translate-x-6 sm:items-start sm:pt-44 sm:translate-x-10">
              <span className="font-hand mb-1 text-xl font-bold text-[#c9d6ff] sm:ml-6 sm:text-2xl" aria-hidden>
                24hr <span className="inline-block translate-y-1">&#8628;</span>
              </span>
              <ThoughtBubble
                href={editable ? `/dig/${editable.id}/edit` : undefined}
                disabled={!editable}
                tail="left"
                size="sm"
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
              <p className="font-hand order-first mb-1 max-w-36 text-center text-xs leading-tight text-[#aab3dc] sm:ml-2">
                {editable
                  ? `"${editable.title}" · ${hoursLeft}h left`
                  : "24 hours. then it's buried."}
              </p>
            </div>
          </section>

          <div className="relative z-10 -mb-16 flex flex-col items-center sm:-mb-20">
            {user && (
              <a
                href={gate("/settings")}
                className="font-hand relative mb-3 mt-16 whitespace-nowrap rounded-full border border-[#c9d6ff]/30 px-4 py-1 text-sm text-[#c9d6ff]/80 transition-colors hover:border-[#c9d6ff]/60 hover:text-[#c9d6ff] sm:top-14 sm:left-36"
                aria-label="Customise your bear"
              >
                customize avatar
              </a>
            )}
            <div className="relative">
              {/* "Let's reminisce about..." rises from the bear's head, just under New entry.
                  On phones it sits above the "customize avatar" pill; on wider screens that pill
                  moves beside the bear, so the bubble can come down closer. */}
              {reminisce && (
                <ReminisceBubble
                  state={reminisce}
                  className="absolute bottom-full left-1/2 mb-[5.25rem] -translate-x-1/2 sm:mb-16"
                />
              )}
              <BearSvg
                variant={variant}
                className="animate-breathe h-auto w-32 drop-shadow-[0_10px_30px_rgb(223_196_175_/_0.25)] sm:w-40"
                title="Your bear, daydreaming"
              />
            </div>
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
