import type { BearExpression } from "@/lib/bears";

/** Every expression a character can wear in an illustration. */
export const EXPRESSIONS = [
  "happy",
  "laughing",
  "excited",
  "proud",
  "loving",
  "calm",
  "sleepy",
  "surprised",
  "nervous",
  "embarrassed",
  "scared",
  "sad",
  "crying",
  "angry",
] as const;

export type Expression = (typeof EXPRESSIONS)[number];

export const FACES: Record<Expression, BearExpression> = {
  happy: { eyes: "happy", mouth: "smile" },
  laughing: { eyes: "squint", mouth: "grin" },
  excited: { eyes: "sparkle", mouth: "grin", extra: "sparkles" },
  proud: { eyes: "closed", mouth: "smile", extra: "sparkles" },
  loving: { eyes: "heart", mouth: "smile" },
  calm: { eyes: "dot", mouth: "smile" },
  sleepy: { eyes: "sleepy", mouth: "flat" },
  surprised: { eyes: "wide", mouth: "o" },
  nervous: { eyes: "dot", mouth: "wobble", extra: "sweat" },
  embarrassed: { eyes: "happy", mouth: "wobble", extra: "blush" },
  scared: { eyes: "wide", mouth: "wobble", extra: "sweat" },
  sad: { eyes: "sad", mouth: "frown" },
  crying: { eyes: "sad", mouth: "wobble", extra: "tears" },
  angry: { eyes: "angry", mouth: "frown" },
};

/** One-line guide for each expression, given to the model. */
export const EXPRESSION_GUIDE: Record<Expression, string> = {
  happy: "smiling, content",
  laughing: "laughing hard, eyes squeezed shut",
  excited: "thrilled, starry-eyed",
  proud: "proud, accomplished, glowing",
  loving: "adoring, full of love (heart eyes)",
  calm: "relaxed, peaceful",
  sleepy: "tired, drowsy",
  surprised: "startled, shocked, amazed",
  nervous: "anxious, unsure",
  embarrassed: "flustered, red-cheeked",
  scared: "frightened, alarmed",
  sad: "down, disappointed",
  crying: "in tears",
  angry: "annoyed, cross",
};
