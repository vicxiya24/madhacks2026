import { BEAR_VARIANTS } from "@/lib/bears";
import { ANIMALS, animalFor, type AnimalKey } from "@/lib/people";
import type { BearVariant, TagSummary } from "@/types/memory";

/**
 * Everyone who appears in a memory's animation: you (as your bear) plus the
 * people tagged on the memory (as their animals). Shared by the server (which
 * describes them to Gemini) and the client (which draws them on the card).
 */
export type CastMember =
  | { key: string; name: string; role: "you"; avatar: { kind: "bear"; variant: BearVariant } }
  | { key: string; name: string; role: "person"; avatar: { kind: "animal"; animal: AnimalKey } };

export function buildCast(bear: BearVariant, tags: Pick<TagSummary, "category" | "label" | "avatar">[]): CastMember[] {
  const people: CastMember[] = tags
    .filter((t) => t.category === "person")
    .map((t) => ({
      key: `person:${t.label.toLowerCase()}`,
      name: t.label,
      role: "person",
      avatar: { kind: "animal", animal: animalFor(t) },
    }));
  return [{ key: "you", name: "You", role: "you", avatar: { kind: "bear", variant: bear } }, ...people];
}

/** "a honey-coloured bear", "a fox": how a character is described in the prompt. */
export function describeAvatar(member: CastMember): string {
  if (member.avatar.kind === "bear") {
    const label = BEAR_VARIANTS[member.avatar.variant].label.toLowerCase();
    return member.avatar.variant === "panda" ? "a panda" : member.avatar.variant === "polar" ? "a polar bear" : `a ${label}-coloured bear`;
  }
  const animal = ANIMALS[member.avatar.animal].label.toLowerCase();
  return `${/^[aeiou]/.test(animal) ? "an" : "a"} ${animal}`;
}
