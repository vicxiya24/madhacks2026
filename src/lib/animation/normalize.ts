import { INDOOR_SETTINGS, type Artifact, type ArtifactProp } from "./artifact";
import { CHARACTER_ANCHORS, PROP_ITEMS, type Anchor } from "./props";
import type { CastMember } from "./cast";

/** How many props each spot can hold before it looks cluttered. */
const SCENE_CAPACITY: Partial<Record<Anchor, number>> = { wall: 3, table: 3, floor: 2, sky: 3 };
/** Per character: one thing on the head, face and body, a paw each side, one thing beside them. */
const CHARACTER_CAPACITY: Partial<Record<Anchor, number>> = { head: 1, face: 1, body: 1, hand: 2, beside: 1 };

/** Settings with a wall to hang things on (indoors, or a building facade outside). */
function hasWall(setting: Artifact["setting"]) {
  return INDOOR_SETTINGS.includes(setting) || setting === "campus" || setting === "street";
}

/**
 * Makes an artifact safe to draw, whatever the model returned:
 * - every cast member appears exactly once, in cast order
 * - each prop sits on an anchor its item allows, that exists in this setting,
 *   on a real character, without overloading any spot
 */
export function normalizeArtifact(artifact: Artifact, cast: CastMember[]): Artifact {
  const castKeys = new Set(cast.map((c) => c.key));
  const byKey = new Map(artifact.characters.map((c) => [c.key, c]));
  const characters = cast.map((c) => byKey.get(c.key) ?? { key: c.key, action: "", expression: "calm" as const });

  const sceneUse = new Map<Anchor, number>();
  const charUse = new Map<string, number>();
  const props: ArtifactProp[] = [];

  for (const prop of artifact.props) {
    const info = PROP_ITEMS[prop.item];
    if (!info) continue;
    if (prop.item === "other" && !prop.emoji) continue;

    const character = prop.character && castKeys.has(prop.character) ? prop.character : (cast[0]?.key ?? "you");
    const fits = (anchor: Anchor) => {
      if (!(info.anchors as readonly Anchor[]).includes(anchor)) return false;
      if (anchor === "wall" && !hasWall(artifact.setting)) return false;
      if (CHARACTER_ANCHORS.includes(anchor)) {
        return (charUse.get(`${character}:${anchor}`) ?? 0) < (CHARACTER_CAPACITY[anchor] ?? 1);
      }
      return (sceneUse.get(anchor) ?? 0) < (SCENE_CAPACITY[anchor] ?? 2);
    };

    // The model's choice if it's valid, otherwise the item's next best spot.
    const anchor = fits(prop.anchor) ? prop.anchor : (info.anchors as readonly Anchor[]).find(fits);
    if (!anchor) continue;

    if (CHARACTER_ANCHORS.includes(anchor)) {
      const k = `${character}:${anchor}`;
      charUse.set(k, (charUse.get(k) ?? 0) + 1);
      props.push({ ...prop, anchor, character });
    } else {
      sceneUse.set(anchor, (sceneUse.get(anchor) ?? 0) + 1);
      props.push({ ...prop, anchor, character: undefined });
    }
    if (props.length >= 5) break;
  }

  return { ...artifact, characters, props };
}
