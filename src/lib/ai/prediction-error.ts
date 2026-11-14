import "server-only";
import OpenAI from "openai";

/**
 * Cognitive Friction Prompt generator.
 *
 * When revisiting, the user must NOT see their earlier entry: they should
 * reconstruct it from memory. So this prompt is generated only from the
 * title and the clue they left themselves, never from the entry text.
 */

const SYSTEM_INSTRUCTIONS = `You are a gentle, dreamy guide inside Memory Archaeologist, a night-time journaling app.
The user is about to recall an old memory from scratch. You only know its title and a short clue they left for themselves.
Write ONE short question (max 45 words) that nudges them to recall it from a fresh angle: another person's point of view, a sense (sound, smell, light), what came just before or after, or what their younger self didn't know yet.

Rules:
- Never guess or invent what happened. Don't add details that aren't in the title or clue.
- Warm and curious, never clinical or prescriptive. Don't tell them how to feel.
- Address the user as "you". Output only the question, with no preamble or quotes.`;

type PromptInput = { title: string; contextCue: string | null };

const FALLBACKS = [
  "Before you write anything, where were you standing? Start with the light, the sounds, the temperature, and let the rest follow.",
  "Who else was there? Try telling it the way they would have seen it.",
  "What happened just before this moment? Start a few minutes earlier than you usually do.",
  "What did you not know back then that you know now?",
  "If this memory had a smell or a song, what would it be? Start there.",
];

function fallbackPrompt(): string {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

export async function generatePredictionError({ title, contextCue }: PromptInput): Promise<{
  prompt: string;
  source: "ai" | "fallback";
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { prompt: fallbackPrompt(), source: "fallback" };

  try {
    const client = new OpenAI({ apiKey, timeout: 8000, maxRetries: 1 });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: SYSTEM_INSTRUCTIONS,
      input: `Memory title: ${title}\nClue they left themselves: ${contextCue ?? "(none)"}`,
      max_output_tokens: 150,
    });
    const text = response.output_text?.trim();
    if (!text) throw new Error("empty completion");
    return { prompt: text.replace(/^["“]|["”]$/g, ""), source: "ai" };
  } catch (err) {
    console.error("[prediction-error] falling back to template:", err);
    return { prompt: fallbackPrompt(), source: "fallback" };
  }
}
