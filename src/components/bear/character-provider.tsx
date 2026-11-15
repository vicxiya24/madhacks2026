"use client";

import { createContext, useContext } from "react";
import { DEFAULT_BEAR } from "@/lib/bears";
import type { BearVariant } from "@/types/memory";

const CharacterContext = createContext<BearVariant>(DEFAULT_BEAR);

/** Makes the user's chosen bear available to every client component below it. */
export function CharacterProvider({
  variant,
  children,
}: {
  variant: BearVariant;
  children: React.ReactNode;
}) {
  return <CharacterContext.Provider value={variant}>{children}</CharacterContext.Provider>;
}

export function useCharacter(): BearVariant {
  return useContext(CharacterContext);
}
