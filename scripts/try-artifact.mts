// Dev check: designs artifacts for sample memories with the real Gemini call.
// Run: npx tsx --conditions=react-server --env-file=.env.local scripts/try-artifact.mts [--json out.json]
import { writeFileSync } from "node:fs";
import { designArtifactWithGemini } from "@/lib/animation/gemini-artifact";
import { buildCast } from "@/lib/animation/cast";
import { normalizeArtifact } from "@/lib/animation/normalize";

const person = (id: string, label: string, avatar: string) => ({ id, category: "person" as const, label, avatar });

const samples = [
  {
    title: "Prom night",
    context_cue: "crown · flashes",
    tags: [person("1", "Maya", "bunny")],
    layers: [
      { content: "At prom they called my name for prom queen. Maya screamed and kept taking pictures of me with the crown on. I couldn't stop smiling." },
      { content: "What I remember most now is just how happy I felt winning prom queen." },
    ],
  },
  {
    title: "Amanda's sidewalk spill",
    context_cue: "Bascom Hill · stomach hurt",
    tags: [person("2", "Amanda", "fox"), { id: "3", category: "location" as const, label: "UW-Madison", avatar: null }],
    layers: [{ content: "Walking to class at UW-Madison, Amanda tripped on the sidewalk and went down. I laughed so hard my stomach hurt. She was so embarrassed." }],
  },
  {
    title: "Chemistry fire alarm",
    context_cue: "goggles · the bell",
    tags: [person("4", "Sam", "pup")],
    layers: [{ content: "In the middle of chemistry the fire alarm went off right above my desk. Sam jumped out of his seat and we all had to file outside." }],
  },
  {
    title: "Learning to ride a bike",
    context_cue: "scraped knee · ice cream truck",
    tags: [person("5", "Dad", "koala")],
    layers: [{ content: "Dad ran behind me holding the seat in the park. I fell and scraped my knee and cried, but then I rode all the way to the ice cream truck by myself and he bought me a cone." }],
  },
  {
    title: "Jess's birthday sleepover",
    context_cue: "sleeping bags · pizza",
    tags: [person("6", "Jess", "cat"), person("7", "Priya", "penguin")],
    layers: [{ content: "Jess's 12th birthday sleepover at her house. We ate pizza on the living room floor, she opened her presents, and we stayed up way too late watching scary movies until Priya fell asleep." }],
  },
];

const out = [];
const only = process.argv.includes("--new") ? samples.slice(3) : samples;
for (const m of only) {
  const memory = { occurred_on: null, era_label: null, feeling: 4, ...m } as never;
  const cast = buildCast("cocoa", m.tags as never);
  const t = Date.now();
  const art = normalizeArtifact(await designArtifactWithGemini(memory, cast), cast);
  console.log(`\n== ${m.title} (${Date.now() - t}ms) setting=${art.setting} time=${art.timeOfDay}`);
  for (const p of art.props) console.log(`  prop ${p.item}${p.emoji ? ` ${p.emoji}` : ""} @ ${p.anchor}${p.character ? ` (${p.character})` : ""} - ${p.label}`);
  for (const c of art.characters) console.log(`  ${c.key}: ${c.expression}, ${c.action}`);
  out.push({ title: m.title, tags: m.tags, artifact: art });
}
const i = process.argv.indexOf("--json");
if (i > 0) writeFileSync(process.argv[i + 1], JSON.stringify(out, null, 1));
