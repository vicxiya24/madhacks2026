"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { addPerson, deletePerson, updatePerson } from "@/app/actions/people";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimalAvatar } from "./animal-avatar";
import { ANIMALS, ANIMAL_KEYS, animalFor, type AnimalKey } from "@/lib/people";
import type { PersonWithCount } from "@/lib/memory/queries";
import { cn } from "@/lib/utils";

/** "People in my life": add people, search them, and dress them up as animals. */
export function PeopleManager({ initial }: { initial: PersonWithCount[] }) {
  const [people, setPeople] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, startAdding] = useTransition();

  const selected = people.find((p) => p.id === selectedId) ?? null;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? people.filter((p) => p.label.toLowerCase().includes(q)) : people;
  }, [people, query]);

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    startAdding(async () => {
      const res = await addPerson(name);
      if (!res.ok) return setError(res.message);
      setPeople((prev) =>
        [...prev, { ...res.data, memoryCount: 0 }].sort((a, b) => a.label.localeCompare(b.label)),
      );
      setNewName("");
      setQuery("");
      setSelectedId(res.data.id);
    });
  };

  const patch = (id: string, changes: Partial<PersonWithCount>) =>
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="grid gap-3">
          <Label htmlFor="new-person" className="font-hand text-2xl font-bold">
            Add someone
          </Label>
          <p className="text-muted-foreground -mt-1 text-sm">
            They&apos;ll get a random animal to start with. Tap them below to pick a different one.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <Input
              id="new-person"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Grandma June"
              maxLength={60}
              className="rounded-xl bg-white/5"
            />
            <Button type="submit" className="rounded-xl" disabled={!newName.trim() || adding}>
              {adding ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />} Add
            </Button>
          </form>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {selected && (
        <PersonEditor
          key={selected.id}
          person={selected}
          onClose={() => setSelectedId(null)}
          onChange={(changes) => patch(selected.id, changes)}
          onDeleted={() => {
            setPeople((prev) => prev.filter((p) => p.id !== selected.id));
            setSelectedId(null);
          }}
        />
      )}

      <section className="grid gap-4" aria-label="Your people">
        {people.length > 0 && (
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your people"
              aria-label="Search your people"
              className="rounded-full bg-white/5 pl-9"
            />
          </div>
        )}

        {people.length === 0 ? (
          <p className="text-muted-foreground rounded-3xl border border-dashed px-6 py-12 text-center text-sm">
            No one here yet. Add someone above, or tag people when you write an entry and
            they&apos;ll show up here.
          </p>
        ) : shown.length === 0 ? (
          <p className="text-muted-foreground px-2 text-sm">No one matches &ldquo;{query}&rdquo;.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shown.map((p) => {
              const active = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(active ? null : p.id)}
                    aria-pressed={active}
                    className={cn(
                      "group grid w-full justify-items-center gap-1.5 rounded-3xl border px-3 pt-4 pb-3 text-center transition",
                      "focus-visible:ring-ring/60 outline-none focus-visible:ring-[3px]",
                      active
                        ? "border-[#c9d6ff]/70 bg-[#c9d6ff]/12 shadow-[0_0_30px_-8px_rgb(160_185_230_/_0.8)]"
                        : "border-white/10 hover:bg-white/5",
                    )}
                  >
                    <AnimalAvatar animal={animalFor(p)} className="h-20 w-auto transition group-hover:-translate-y-1" />
                    <span className="font-hand line-clamp-1 text-xl font-bold">{p.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {p.memoryCount === 0
                        ? "No memories yet"
                        : `In ${p.memoryCount} ${p.memoryCount === 1 ? "memory" : "memories"}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function PersonEditor({
  person,
  onClose,
  onChange,
  onDeleted,
}: {
  person: PersonWithCount;
  onClose: () => void;
  onChange: (changes: Partial<PersonWithCount>) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(person.label);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();
  const animal = animalFor(person);

  const save = (changes: { label?: string; avatar?: AnimalKey }, rollback: Partial<PersonWithCount>) => {
    onChange(changes);
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res = await updatePerson(person.id, changes);
      if (res.ok) setStatus({ kind: "saved" });
      else {
        onChange(rollback);
        setStatus({ kind: "error", message: res.message });
      }
    });
  };

  const rename = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === person.label) return setName(person.label);
    save({ label: trimmed }, { label: person.label });
  };

  const remove = () => {
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res = await deletePerson(person.id);
      if (res.ok) onDeleted();
      else setStatus({ kind: "error", message: res.message });
    });
  };

  return (
    <Card className="border-[#c9d6ff]/30">
      <CardContent className="grid gap-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-hand text-3xl font-bold">Customise {person.label}</h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs" aria-live="polite">
              {status.kind === "saving" && (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving...
                </>
              )}
              {status.kind === "saved" && (
                <>
                  <Check className="size-3.5" aria-hidden /> Saved
                </>
              )}
              {status.kind === "error" && <span className="text-destructive">{status.message}</span>}
            </span>
            <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Close">
              <X aria-hidden />
            </Button>
          </div>
        </div>

        <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto grid size-36 place-items-center rounded-full bg-[radial-gradient(circle,rgb(160_185_230_/_0.25),transparent_70%)]">
            <AnimalAvatar animal={animal} className="animate-breathe h-28 w-auto" title={`${person.label} as a ${ANIMALS[animal].label.toLowerCase()}`} />
          </div>
          <form
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              rename();
            }}
          >
            <Label htmlFor="person-name">Name</Label>
            <div className="flex gap-2">
              <Input
                id="person-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={rename}
                maxLength={60}
                className="rounded-xl bg-white/5"
              />
              <Button type="submit" variant="secondary" className="rounded-xl" disabled={!name.trim() || name.trim() === person.label}>
                Rename
              </Button>
            </div>
          </form>
        </div>

        <div className="grid gap-2">
          <h3 className="font-hand text-2xl font-bold">Pick their animal</h3>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={`Avatar for ${person.label}`}>
            {ANIMAL_KEYS.map((key) => {
              const checked = key === animal;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => !checked && save({ avatar: key }, { avatar: person.avatar })}
                  className={cn(
                    "group grid justify-items-center gap-1 rounded-2xl border px-1 pt-3 pb-2 transition",
                    "focus-visible:ring-ring/60 outline-none focus-visible:ring-[3px]",
                    checked
                      ? "border-[#c9d6ff]/70 bg-[#c9d6ff]/12"
                      : "border-white/10 hover:bg-white/5",
                  )}
                >
                  <AnimalAvatar animal={key} className="h-12 w-auto transition group-hover:-translate-y-0.5 sm:h-14" />
                  <span className="font-hand text-base leading-none font-bold">{ANIMALS[key].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
          {confirming ? (
            <>
              <span className="text-muted-foreground mr-auto text-sm">
                Remove {person.label}? Your memories stay, they just won&apos;t be tagged.
              </span>
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setConfirming(false)}>
                Keep
              </Button>
              <Button type="button" variant="destructive" className="rounded-full" onClick={remove}>
                <Trash2 aria-hidden /> Remove
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" className="text-muted-foreground rounded-full" onClick={() => setConfirming(true)}>
              <Trash2 aria-hidden /> Remove from my people
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
