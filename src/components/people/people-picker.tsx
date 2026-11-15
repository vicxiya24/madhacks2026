"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimalAvatar } from "./animal-avatar";
import { animalFor, randomAnimal, type PersonSummary } from "@/lib/people";
import { cn } from "@/lib/utils";

export type DraftPerson = { label: string; avatar: string | null; isNew?: boolean };

const MAX_SUGGESTIONS = 8;

/**
 * Pick who was there from "People in my life", or add someone new on the spot
 * (they get a random animal, which can be changed on the People page later).
 * Serialises into a hidden `people` input as JSON for the server action.
 */
export function PeoplePicker({
  name = "people",
  people,
  defaultSelected = [],
}: {
  name?: string;
  people: PersonSummary[];
  defaultSelected?: DraftPerson[];
}) {
  const [selected, setSelected] = useState<DraftPerson[]>(defaultSelected);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const isSelected = (label: string) => selected.some((s) => s.label.toLowerCase() === label.toLowerCase());
  const q = query.trim();

  const suggestions = useMemo(() => {
    const lower = q.toLowerCase();
    return people
      .filter((p) => !isSelected(p.label) && (!lower || p.label.toLowerCase().includes(lower)))
      .slice(0, MAX_SUGGESTIONS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, q, selected]);

  const exact = people.find((p) => p.label.toLowerCase() === q.toLowerCase());
  const canAddNew = !!q && !exact && !isSelected(q);
  const options: ({ kind: "person"; person: PersonSummary } | { kind: "new"; label: string })[] = [
    ...suggestions.map((person) => ({ kind: "person" as const, person })),
    ...(canAddNew ? [{ kind: "new" as const, label: q }] : []),
  ];

  const choose = (option: (typeof options)[number]) => {
    const next =
      option.kind === "person"
        ? { label: option.person.label, avatar: option.person.avatar }
        : { label: option.label.slice(0, 60), avatar: randomAnimal(), isNew: true };
    setSelected((prev) => [...prev, next]);
    setQuery("");
    setActive(0);
  };

  return (
    <div className="grid gap-3">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(selected.map(({ label, avatar }) => ({ label, avatar })))}
      />

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="People in this memory">
          {selected.map((p) => (
            <li
              key={p.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-1 pl-1.5 text-sm"
            >
              <AnimalAvatar animal={animalFor(p)} className="h-6 w-auto" />
              {p.label}
              {p.isNew && <span className="text-muted-foreground text-[11px]">new</span>}
              <button
                type="button"
                onClick={() => setSelected((prev) => prev.filter((s) => s.label !== p.label))}
                className="rounded-full p-0.5 hover:bg-white/15"
                aria-label={`Remove ${p.label}`}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
        <Input
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          aria-label="Search your people or add someone new"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, options.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const option = options[active];
              if (option) choose(option);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={people.length > 0 ? "Search your people, or type a new name" : "Type a name"}
          maxLength={60}
          className="rounded-xl bg-white/5 pl-9"
        />

        {open && options.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="bg-popover absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-auto rounded-2xl border p-1 shadow-xl"
          >
            {options.map((option, i) => (
              <li
                key={option.kind === "person" ? option.person.id : "new"}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown, not click, so the input doesn't blur and close the list first
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(option);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm",
                  i === active && "bg-white/10",
                )}
              >
                {option.kind === "person" ? (
                  <>
                    <AnimalAvatar animal={animalFor(option.person)} className="h-7 w-auto" />
                    {option.person.label}
                  </>
                ) : (
                  <>
                    <span className="grid size-7 place-items-center rounded-full border border-dashed border-white/30">
                      <Plus className="size-3.5" aria-hidden />
                    </span>
                    Add &ldquo;{option.label}&rdquo; as someone new
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        New people get a random animal. You can change it in{" "}
        <Link href="/people" target="_blank" className="underline underline-offset-2 hover:text-foreground">
          People in my life
        </Link>
        .
      </p>
    </div>
  );
}
