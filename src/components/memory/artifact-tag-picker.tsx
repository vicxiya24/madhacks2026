"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TAG_CATEGORIES, TAG_CATEGORY_KEYS } from "@/lib/memory/constants";
import type { TagCategory } from "@/types/memory";
import { cn } from "@/lib/utils";

type DraftTag = { category: TagCategory; label: string };

/**
 * Artifact Tagging: sensory and contextual retrieval cues.
 * Serialises into a hidden `tags` input as JSON for the server action.
 */
export function ArtifactTagPicker({ name = "tags" }: { name?: string }) {
  const [tags, setTags] = useState<DraftTag[]>([]);
  const [category, setCategory] = useState<TagCategory>("smell");
  const [label, setLabel] = useState("");

  const add = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const exists = tags.some(
      (t) => t.category === category && t.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) setTags((prev) => [...prev, { category, label: trimmed }]);
    setLabel("");
  };

  const remove = (i: number) => setTags((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(tags)} />

      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cue type">
        {TAG_CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={category === key}
            onClick={() => setCategory(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              category === key
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            {TAG_CATEGORIES[key].label}
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
          placeholder={`e.g. ${TAG_CATEGORIES[category].hint}`}
          maxLength={60}
          aria-label={`${TAG_CATEGORIES[category].label} cue`}
        />
        <Button type="button" variant="secondary" onClick={add} disabled={!label.trim()}>
          <Plus aria-hidden /> Add
        </Button>
      </div>

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Added cues">
          {tags.map((t, i) => (
            <li
              key={`${t.category}-${t.label}`}
              className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-md py-1 pr-1 pl-2 text-xs"
            >
              <span className="text-muted-foreground">{TAG_CATEGORIES[t.category].label}:</span>
              {t.label}
              <button
                type="button"
                onClick={() => remove(i)}
                className="hover:bg-background/60 rounded p-0.5"
                aria-label={`Remove ${t.label}`}
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
