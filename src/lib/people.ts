import { hashString } from "@/lib/utils";

/** Avatars for the people in your life. Every one of them is an animal. */
export const ANIMALS = {
  bunny: { label: "Bunny" },
  fox: { label: "Fox" },
  cat: { label: "Cat" },
  pup: { label: "Pup" },
  frog: { label: "Frog" },
  owl: { label: "Owl" },
  mouse: { label: "Mouse" },
  piglet: { label: "Piglet" },
  penguin: { label: "Penguin" },
  koala: { label: "Koala" },
} as const;

export type AnimalKey = keyof typeof ANIMALS;
export const ANIMAL_KEYS = Object.keys(ANIMALS) as AnimalKey[];

export function isAnimal(value: unknown): value is AnimalKey {
  return typeof value === "string" && value in ANIMALS;
}

export function randomAnimal(): AnimalKey {
  return ANIMAL_KEYS[Math.floor(Math.random() * ANIMAL_KEYS.length)];
}

/**
 * The avatar to show for a person: the one they picked, or (for people added
 * before avatars existed) a stable pick based on their name.
 */
export function animalFor(person: { label: string; avatar?: string | null }): AnimalKey {
  if (isAnimal(person.avatar)) return person.avatar;
  return ANIMAL_KEYS[hashString(person.label.toLowerCase()) % ANIMAL_KEYS.length];
}

export type PersonSummary = { id: string; label: string; avatar: string | null };
