import type { Artifact, ArtifactProp } from "./artifact";
import type { CastMember } from "./cast";
import type { Expression } from "@/lib/expressions";
import { PROP_ITEMS, type PropItem } from "./props";
import type { MemoryWithStrata } from "@/types/memory";

/**
 * The offline artifact: built from the memory's own words and tags with simple
 * keyword matching, so "Play it out" always produces a card, even with no
 * API key, no network, or an exhausted free-tier quota.
 */

/** Keyword -> catalogue prop (placed at the item's default anchor). */
const PROP_WORDS: [RegExp, PropItem][] = [
  [/crown|tiara|prom (queen|king)|homecoming (queen|king)/, "crown"],
  [/sash/, "sash"],
  [/party hat/, "party-hat"],
  [/graduat|commencement/, "grad-cap"],
  [/glasses|sunglasses/, "glasses"],
  [/medal/, "medal"],
  [/trophy|won the|championship/, "trophy"],
  [/camera|photos?|pictures?|selfie/, "camera"],
  [/phone|texted|called me/, "phone"],
  [/fire alarm|smoke alarm/, "fire-alarm"],
  [/cake|birthday/, "cake"],
  [/gift|present/, "gift"],
  [/balloon/, "balloon"],
  [/flowers?|bouquet|corsage/, "flowers"],
  [/ball|soccer|football|basketball|baseball|catch/, "ball"],
  [/guitar/, "guitar"],
  [/microphone|karaoke|speech/, "microphone"],
  [/candles?|power went out|blackout/, "candle"],
  [/book|reading|diary/, "book"],
  [/coffee|tea\b|hot chocolate|mug/, "mug"],
  [/clock|late for|countdown/, "clock"],
  [/backpack|bag\b/, "backpack"],
  [/umbrella/, "umbrella"],
  [/laptop|computer|zoom call/, "laptop"],
  [/dinner|lunch|breakfast|pizza|food/, "plate"],
  [/letter|note\b|card\b/, "letter"],
  [/fireworks|fourth of july|new year/, "fireworks"],
  [/song|music|sang|singing/, "music"],
  [/crush|in love|kissed/, "heart"],
];

/** Match at word starts only, so "car" doesn't fire on "scared" or "ball" on "baseball". */
const hasWord = (re: RegExp, text: string) => new RegExp(String.raw`\b(?:${re.source})`).test(text);

const first = <T,>(pairs: [RegExp, T][], text: string, fallback: T) =>
  pairs.find(([re]) => hasWord(re, text))?.[1] ?? fallback;

const MOOD_BY_FEELING = { 1: "heavy", 2: "bittersweet", 3: "tender", 4: "warm", 5: "joyful" } as const;
const EXPRESSION_BY_FEELING: Record<number, Expression> = { 1: "crying", 2: "sad", 3: "calm", 4: "happy", 5: "excited" };

export function localArtifact(
  memory: Pick<MemoryWithStrata, "title" | "context_cue" | "layers" | "tags" | "feeling">,
  cast: CastMember[],
): Artifact {
  const story = [memory.title, memory.context_cue ?? "", ...memory.layers.map((l) => l.content), ...memory.tags.map((t) => t.label)]
    .join(" ")
    .toLowerCase();

  const timeOfDay = first<Artifact["timeOfDay"]>(
    [[/night|midnight|dark|moon|stars|prom|late at night/, "night"], [/sunset|evening|dusk/, "dusk"], [/sunrise|dawn|early morning/, "dawn"]],
    story,
    "day",
  );
  const setting = first<Artifact["setting"]>(
    [
      [/prom|dance|party|gym|auditorium|concert|wedding|ballroom/, "hall"],
      [/class|lecture|lab\b|teacher|chemistry|homeroom/, "classroom"],
      [/campus|university|college|quad|dorm|sidewalk/, "campus"],
      [/lake house|cabin|cottage|home|house|kitchen|bedroom|living room|couch|bed\b/, "room"],
      [/beach|lake|sea|ocean|pool|river|boat|swim/, "water"],
      [/forest|woods|camp|tent|hike/, "woods"],
      [/city|street|subway|downtown|bus|mall|road/, "street"],
    ],
    story,
    "outdoors",
  );
  const weather = first<Artifact["weather"]>(
    [[/rain|storm|thunder/, "rain"], [/snow|winter|blizzard/, "snow"], [/fog|mist/, "fog"]],
    story,
    timeOfDay === "night" ? "stars" : "clear",
  );

  const you = cast[0]?.key ?? "you";
  const props: ArtifactProp[] = [];
  for (const [re, item] of PROP_WORDS) {
    if (props.length >= 3) break;
    if (!hasWord(re, story) || props.some((p) => p.item === item)) continue;
    props.push({ item, label: PROP_ITEMS[item].label, anchor: PROP_ITEMS[item].anchors[0], character: you });
  }

  const feeling = memory.feeling ?? 3;
  const yourFace: Expression = hasWord(/laugh|hilarious|cracked up/, story)
    ? "laughing"
    : hasWord(/won|crowned|proud/, story)
      ? "proud"
      : hasWord(/scared|terrified|alarm/, story)
        ? "scared"
        : (EXPRESSION_BY_FEELING[feeling] ?? "calm");
  const tellings = memory.layers.length;

  return {
    name: memory.title.slice(0, 60),
    caption: memory.context_cue ? memory.context_cue.slice(0, 180) : "A memory, carefully unearthed.",
    fieldNote:
      tellings > 1
        ? `Recovered across ${tellings} tellings. Compare the layers to see what's held firm and what has shifted.`
        : "Only one telling recovered so far. Dive back in from the clue alone to see how this one shifts.",
    timeOfDay,
    setting,
    weather,
    mood: MOOD_BY_FEELING[feeling as keyof typeof MOOD_BY_FEELING] ?? "tender",
    props,
    characters: cast.map((c, i) => ({ key: c.key, action: "", expression: i === 0 ? yourFace : "happy" })),
  };
}
