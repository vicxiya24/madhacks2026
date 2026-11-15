import "server-only";
import { GoogleGenAI } from "@google/genai";
import { ARTIFACT_JSON_SCHEMA, artifactSchema, type Artifact } from "./artifact";
import { describeAvatar, type CastMember } from "./cast";
import type { MemoryWithStrata } from "@/types/memory";

/**
 * Asks a free-tier Gemini *text* model to art-direct the artifact card: it
 * returns structured JSON (setting, mood, props, what each character is doing),
 * and the app draws the picture itself. Gemini's image and video models have no
 * free tier, so no images are generated here.
 */

// Tried in order: if the first is rate-limited or unavailable, fall through to the lighter one.
const DEFAULT_MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest"];
const TIMEOUT_MS = 25_000;
const MAX_TELLING_CHARS = 1800;

export function isGeminiConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

const SYSTEM_INSTRUCTION = `You are the illustrator-director for "Memory Archaeologist", a gentle journaling app.
Design ONE still storybook illustration of the single most telling moment in the memory you're given. The app draws it: soft pastel scenery, every character a cute cartoon animal with a body, props drawn by hand. You choose the setting, the moment, each character's expression, and where every prop physically sits.

HOW TO PLACE PROPS (most important):
- A prop must sit where it really would in that moment. Never scatter objects in the air for decoration.
  - Worn: a crown or party hat goes on someone's "head", glasses on their "face", a sash or medal on their "body".
  - Held: something being used or carried goes in a character's "hand" (a camera taking photos, a microphone, a bouquet).
  - Fixed to the room: a fire alarm, a clock or a framed photo goes on the "wall" (only in room/classroom/hall/campus/street).
  - Set down: a cake, laptop or candles go on the "table"; a ball or backpack on the "floor" or "beside" someone.
  - "sky" is only for things that really are up in the air: balloons, fireworks, hearts or music notes as a feeling.
- Always set "character" for head/face/body/hand/beside, using the key of whoever wears, holds or stands by it.
- Use only objects the memory mentions or clearly implies. Fewer, well-placed props beat many. 0 to 3 is typical; zero is fine.
- Prefer a catalogue item over "other". Use "other" (with one emoji) only when nothing in the catalogue fits.

CHARACTERS:
- Include every cast member exactly once, using their exact "key".
- Give each one the expression they had in that moment, read from the memory (e.g. laughing at a friend who tripped, embarrassed for the friend who tripped, surprised when an alarm goes off, proud when winning). Don't default everyone to "happy".
- "action" is a short phrase of what they're doing right then.

SAFETY AND HONESTY:
- Only use details that are in the memory. Never invent events, names or places.
- Keep it kind: if the memory is painful, show a quiet, tender moment, never anything graphic.
- Write the caption and field note in warm second person ("you").

EXAMPLES (abridged):
1. "I got crowned prom queen and everyone kept taking pictures of me." cast: you, Maya
   setting hall, night; props: crown on head of you; sash on body of you; camera in hand of Maya.
   you: proud, "wearing the prom queen crown"; Maya: excited, "snapping photos".
2. "The fire alarm went off in the middle of chemistry and we all had to file outside." cast: you, Sam
   setting classroom, day; props: fire-alarm on wall.
   you: surprised, "covering your ears"; Sam: scared, "jumping out of his seat".
3. "Amanda tripped on the sidewalk on campus and I laughed so hard my stomach hurt." cast: you, Amanda
   setting campus, day; props: none needed (a backpack beside Amanda only if a bag is mentioned).
   you: laughing, "doubled over laughing"; Amanda: embarrassed, "picking herself up".
4. "Grandma lit candles when the power went out and we listened to the radio." cast: you, Grandma
   setting room, night; props: candle on table; other 📻 radio on table.
   you: calm, "listening by candlelight"; Grandma: happy, "lighting the candles".`;

function clip(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

export class GeminiArtifactError extends Error {
  constructor(
    message: string,
    readonly reason: "quota" | "auth" | "unavailable" | "bad-output",
  ) {
    super(message);
  }
}

export async function designArtifactWithGemini(
  memory: Pick<MemoryWithStrata, "title" | "context_cue" | "occurred_on" | "era_label" | "layers" | "tags">,
  cast: CastMember[],
): Promise<Artifact> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiArtifactError("GEMINI_API_KEY is not set", "auth");
  const ai = new GoogleGenAI({ apiKey });

  // The sedimentary layers: the first telling is the bedrock, the latest retelling sits on top.
  const layers = memory.layers.filter((l) => l.content.trim());
  const input = {
    title: memory.title,
    when: memory.occurred_on ?? memory.era_label ?? "unknown",
    clue: memory.context_cue,
    firstTelling: layers[0] ? clip(layers[0].content, MAX_TELLING_CHARS) : "",
    latestTelling: layers.length > 1 ? clip(layers[layers.length - 1].content, MAX_TELLING_CHARS) : null,
    numberOfTellings: layers.length,
    places: memory.tags.filter((t) => t.category === "location").map((t) => t.label),
    objectsAndSenses: memory.tags.filter((t) => !["person", "location", "emotion"].includes(t.category)).map((t) => t.label),
    cast: cast.map((c) => ({
      key: c.key,
      who: c.role === "you" ? "the narrator (the person remembering)" : c.name,
      drawnAs: describeAvatar(c),
    })),
  };

  const models = process.env.GEMINI_TEXT_MODEL ? [process.env.GEMINI_TEXT_MODEL] : DEFAULT_MODELS;
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: `Memory (JSON):\n${JSON.stringify(input, null, 2)}` }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseJsonSchema: ARTIFACT_JSON_SCHEMA,
          temperature: 0.6,
          httpOptions: { timeout: TIMEOUT_MS },
        },
      });
      const raw = response.text;
      if (!raw) throw new GeminiArtifactError("Gemini returned an empty response", "bad-output");
      const parsed = artifactSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) throw new GeminiArtifactError("Gemini's artifact didn't match the schema", "bad-output");
      return parsed.data;
    } catch (err) {
      lastError = err;
      const text = err instanceof Error ? err.message : String(err);
      // Bad key: no point trying another model.
      if (/API key|PERMISSION_DENIED|401|403/i.test(text)) throw new GeminiArtifactError(text, "auth");
      // Otherwise (rate limit, model missing, timeout, bad JSON) try the next model.
    }
  }

  const text = lastError instanceof Error ? lastError.message : String(lastError);
  if (/quota|RESOURCE_EXHAUSTED|429/i.test(text)) throw new GeminiArtifactError(text, "quota");
  if (lastError instanceof GeminiArtifactError) throw lastError;
  throw new GeminiArtifactError(text, "unavailable");
}
