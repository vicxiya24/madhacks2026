import "server-only";
import OpenAI from "openai";
import type { MemoryLayer, TagSummary } from "@/types/memory";
import { LAYER_META } from "@/lib/memory/constants";

/**
 * Cognitive Friction Prompt generator.
 *
 * Reconsolidation research suggests a reactivated memory becomes modifiable
 * mainly when retrieval includes a *prediction error*: a mismatch between
 * what the brain expects and what it meets. We generate one gentle, grounded
 * mismatch per session from the user's own strata.
 */

const SYSTEM_INSTRUCTIONS = `You are the "prediction error" engine inside Memory Archaeologist, a reflective journaling app.
The user has reopened an old memory. Write ONE short prompt (max 70 words) that introduces a gentle, plausible mismatch with how they currently tell the story, so they can look at it from a new angle.

Good techniques:
- Point out a tension between their layers (e.g. the sensory core vs. how it's retold).
- Invite another person's vantage point (someone present in the memory).
- Ask what a detail they mentioned might mean if it were read differently.
- Contrast the age they were then with the knowledge they have now.

Rules:
- Ground everything in details the user actually wrote. Never invent events, injuries, abuse, or facts.
- Be warm and curious, never clinical, diagnostic, or prescriptive. Don't tell them what to feel.
- Address the user as "you". Output only the prompt text, with no preamble or quotation marks.`;

type PromptInput = {
  title: string;
  layers: MemoryLayer[];
  tags: TagSummary[];
};

function buildUserMessage({ title, layers, tags }: PromptInput): string {
  const strata = layers
    .map((l) => `[${LAYER_META[l.layer_type].label}, v${l.version}]\n${l.content.slice(0, 2500)}`)
    .join("\n\n");
  const cues = tags.map((t) => `${t.category}: ${t.label}`).join(", ") || "none";
  return `Memory title: ${title}\nRetrieval cues: ${cues}\n\nStrata (oldest first):\n${strata}`;
}

function fallbackPrompt({ layers, tags }: PromptInput): string {
  const person = tags.find((t) => t.category === "person")?.label;
  const sensory = tags.find((t) =>
    ["smell", "sound", "taste", "touch", "sight"].includes(t.category),
  )?.label;
  const hasRetelling = layers.some((l) => l.layer_type === "retelling");
  const hasReframe = layers.some((l) => l.layer_type === "reframe");

  const candidates = [
    person &&
      `Imagine ${person} journaling about this same day. What would their first sentence be, and what might they have noticed that you couldn't at the time?`,
    sensory &&
      `You remember "${sensory}". If that detail were the only thing you trusted, with no story attached, what would this memory actually be about?`,
    hasRetelling &&
      "Your core recollection and the way it gets retold don't quite match. Which details only appear in the retelling, and who added them?",
    hasReframe &&
      "Your last reframe settled on one interpretation. What would someone who loves you, and wasn't there, push back on?",
    "You were younger then and knew less about the people involved. What do you understand now that the younger you couldn't?",
    "If this memory were evidence rather than a verdict, what's one other conclusion it could support?",
  ].filter((p): p is string => Boolean(p));

  return candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];
}

export async function generatePredictionError(input: PromptInput): Promise<{
  prompt: string;
  source: "ai" | "fallback";
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { prompt: fallbackPrompt(input), source: "fallback" };

  try {
    const client = new OpenAI({ apiKey, timeout: 8000, maxRetries: 1 });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: SYSTEM_INSTRUCTIONS,
      input: buildUserMessage(input),
      max_output_tokens: 200,
    });
    const text = response.output_text?.trim();
    if (!text) throw new Error("empty completion");
    return { prompt: text.replace(/^["“]|["”]$/g, ""), source: "ai" };
  } catch (err) {
    console.error("[prediction-error] falling back to template:", err);
    return { prompt: fallbackPrompt(input), source: "fallback" };
  }
}
