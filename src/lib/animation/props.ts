/**
 * Props the illustration can draw, and where each is allowed to go.
 * Anchors tie a prop into the scene instead of letting it float:
 *   head / face / body  worn by a character (crown, glasses, sash)
 *   hand                held by a character
 *   beside              on the ground next to a character
 *   wall                mounted on the wall (indoor scenes, or a building outside)
 *   table               on a small table in the scene
 *   floor               on the ground in the foreground
 *   sky                 up in the air (balloons, fireworks)
 */
export const ANCHORS = ["head", "face", "body", "hand", "beside", "wall", "table", "floor", "sky"] as const;
export type Anchor = (typeof ANCHORS)[number];

/** Anchors that belong to a specific character. */
export const CHARACTER_ANCHORS: Anchor[] = ["head", "face", "body", "hand", "beside"];

type PropInfo = { label: string; anchors: Anchor[]; hint: string };

// The first anchor is each prop's natural default.
export const PROP_ITEMS = {
  crown: { label: "crown", anchors: ["head", "hand", "table"], hint: "tiara/crown, e.g. prom queen, birthday king" },
  "party-hat": { label: "party hat", anchors: ["head"], hint: "birthdays, parties, New Year" },
  cap: { label: "cap", anchors: ["head"], hint: "baseball cap, graduation-free everyday hat" },
  "grad-cap": { label: "graduation cap", anchors: ["head", "hand"], hint: "graduation, commencement" },
  glasses: { label: "glasses", anchors: ["face", "table"], hint: "glasses or sunglasses someone wore" },
  sash: { label: "sash", anchors: ["body"], hint: "pageant/prom queen/king sash, award sash" },
  medal: { label: "medal", anchors: ["body", "hand"], hint: "won a race, award, competition" },
  camera: { label: "camera", anchors: ["hand", "table"], hint: "taking pictures" },
  phone: { label: "phone", anchors: ["hand", "table"], hint: "phone call, texting, selfie" },
  book: { label: "book", anchors: ["hand", "table", "floor"], hint: "reading, studying, a diary" },
  mug: { label: "mug", anchors: ["hand", "table"], hint: "coffee, tea, hot chocolate" },
  cake: { label: "cake", anchors: ["table", "hand"], hint: "birthday or celebration cake" },
  gift: { label: "gift", anchors: ["hand", "table", "floor"], hint: "present being given or opened" },
  balloon: { label: "balloon", anchors: ["hand", "sky"], hint: "party balloons" },
  flowers: { label: "flowers", anchors: ["hand", "table"], hint: "bouquet, corsage, flowers given" },
  ball: { label: "ball", anchors: ["hand", "floor"], hint: "any sport ball, playing catch" },
  guitar: { label: "guitar", anchors: ["hand", "beside"], hint: "playing music, a concert" },
  microphone: { label: "microphone", anchors: ["hand"], hint: "singing, karaoke, giving a speech" },
  trophy: { label: "trophy", anchors: ["hand", "table"], hint: "winning a game or prize" },
  "fire-alarm": { label: "fire alarm", anchors: ["wall"], hint: "a fire alarm going off" },
  clock: { label: "clock", anchors: ["wall", "table"], hint: "waiting, being late, a countdown" },
  picture: { label: "framed picture", anchors: ["wall"], hint: "a photo or painting on the wall" },
  lamp: { label: "lamp", anchors: ["table", "floor"], hint: "a cosy lamp, reading light" },
  candle: { label: "candle", anchors: ["table", "hand"], hint: "candlelight, power outage, vigil" },
  backpack: { label: "backpack", anchors: ["beside", "hand", "floor"], hint: "school, travel, hiking" },
  umbrella: { label: "umbrella", anchors: ["hand"], hint: "rain" },
  laptop: { label: "laptop", anchors: ["table"], hint: "work, studying, a video call" },
  plate: { label: "plate of food", anchors: ["table", "hand"], hint: "a meal, dinner, snacks" },
  letter: { label: "letter", anchors: ["hand", "table"], hint: "a letter, card or note" },
  heart: { label: "heart", anchors: ["sky"], hint: "love, a crush, affection (floats above)" },
  star: { label: "star", anchors: ["sky", "hand"], hint: "a wish, a gold star" },
  music: { label: "music notes", anchors: ["sky"], hint: "a song playing, singing (floats above)" },
  fireworks: { label: "fireworks", anchors: ["sky"], hint: "fireworks, July 4th, New Year" },
  other: { label: "something else", anchors: ["hand", "table", "beside", "floor", "wall", "sky"], hint: "anything not listed; give an emoji" },
} satisfies Record<string, PropInfo>;

export type PropItem = keyof typeof PROP_ITEMS;
export const PROP_ITEM_KEYS = Object.keys(PROP_ITEMS) as PropItem[];

/** Props held from the bottom (a balloon's string, a bouquet's stems) rather than the middle. */
export const HELD_FROM_BOTTOM: PropItem[] = ["balloon", "flowers", "microphone", "umbrella", "guitar"];

/**
 * Where the head top, eyes, chest and paws sit on each character, as fractions
 * of the character's drawn box (x across, y down). Used to place worn and held props.
 */
export const BODY_ANCHORS = {
  bear: { headTop: 0.17, eyes: 0.385, chest: 0.72, handY: 0.8, handL: 0.27, handR: 0.73 },
  animal: { headTop: 0.24, eyes: 0.4, chest: 0.73, handY: 0.79, handL: 0.25, handR: 0.75 },
} as const;
