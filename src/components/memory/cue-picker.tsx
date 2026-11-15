"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CUE_CATEGORIES, PICKER_CATEGORIES } from "@/lib/memory/constants";
import type { TagCategory } from "@/types/memory";
import { cn } from "@/lib/utils";

export type DraftCue = { category: TagCategory; label: string };

/**
 * People, places, objects and senses attached to a memory.
 * Serialises into a hidden `tags` input as JSON for the server action.
 */
export function CuePicker({ name = "tags", defaultCues = [] }: { name?: string; defaultCues?: DraftCue[] }) {
  const [cues, setCues] = useState<DraftCue[]>(defaultCues);
  const [category, setCategory] = useState<TagCategory>("person");
  const [label, setLabel] = useState("");

  const add = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const exists = cues.some(
      (c) => c.category === category && c.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) setCues((prev) => [...prev, { category, label: trimmed }]);
    setLabel("");
  };

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(cues)} />

      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cue type">
        {PICKER_CATEGORIES.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={category === key}
            onClick={() => setCategory(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              category === key
                ? "border-[#c9d6ff] bg-[#c9d6ff] text-[#1a1c42]"
                : "border-white/15 hover:bg-white/10",
            )}
          >
            {CUE_CATEGORIES[key].label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={`e.g. ${CUE_CATEGORIES[category].hint}`}
          maxLength={60}
          className="rounded-xl bg-white/5"
          aria-label={`${CUE_CATEGORIES[category].label} cue`}
        />
        <Button type="button" variant="secondary" className="rounded-xl" onClick={add} disabled={!label.trim()}>
          <Plus aria-hidden /> Add
        </Button>
      </div>

      {cues.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Added cues">
          {cues.map((c, i) => (
            <li
              key={`${c.category}-${c.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-1 pl-3 text-xs"
            >
              <span className="text-muted-foreground">{CUE_CATEGORIES[c.category].label}</span>
              {c.label}
              <button
                type="button"
                onClick={() => setCues((prev) => prev.filter((_, idx) => idx !== i))}
                className="rounded-full p-0.5 hover:bg-white/15"
                aria-label={`Remove ${c.label}`}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
