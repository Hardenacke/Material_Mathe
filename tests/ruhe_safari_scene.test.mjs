import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import '../tools/ruhe-safari-scene.js';

const source = readFileSync(new URL('../tools/ruhe-safari.html', import.meta.url), 'utf8');
const worlds = JSON.parse(source.match(/world-data[^>]*>(.*?)<\/script>/s)[1]);
const scene = globalThis.RuheSafariScene;

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

for (const world of worlds) {
  test(`${world.id}: alle Motive samt Bewegungsraum passen kollisionsfrei in ihre Lebensräume`, () => {
    for (let seed = 1; seed <= 40; seed++) {
      const layout = scene.createLayout(world, world.items.map((item) => item.index), seededRandom(seed));
      assert.equal(layout.placements.length, world.items.length);
      assert.equal(new Set(layout.placements.map((placed) => placed.index)).size, world.items.length);
      for (const [index, placed] of layout.placements.entries()) {
        const item = world.items.find((entry) => entry.index === placed.index);
        const habitat = scene.habitatFor(world, item);
        assert.ok(placed.size > 0.02, `${item.name} ist zu klein`);
        assert.ok(habitat.zones.some((zone) => placed.bounds[0] >= zone[0] - 1e-10 && placed.bounds[1] >= zone[1] - 1e-10
          && placed.bounds[2] <= zone[2] + 1e-10 && placed.bounds[3] <= zone[3] + 1e-10), `${item.name} verlässt seine Zone`);
        assert.ok(habitat.blocked.every((blocked) => !scene.overlaps(placed.bounds, blocked)));
        for (const other of layout.placements.slice(index + 1)) assert.ok(!scene.overlaps(placed.bounds, other.bounds));
      }
    }
  });
}

test('Neue Runden erhalten neue Plätze; eine kleine Auswahl bleibt vollständig', () => {
  const world = worlds[0];
  const selected = [0, 3, 7];
  const first = scene.createLayout(world, selected, seededRandom(12));
  const second = scene.createLayout(world, selected, seededRandom(13));
  assert.notDeepEqual(first.placements, second.placements);
  assert.deepEqual(first.placements.map((placed) => placed.index).sort((first, second) => first - second), selected);
  assert.deepEqual(scene.createLayout(world, [], seededRandom(1)).placements, []);
});

test('Wassertiere bleiben im Wasser und Landtiere meiden den Teich', () => {
  const world = worlds.find((entry) => entry.id === 'safari');
  const layout = scene.createLayout(world, world.items.map((item) => item.index), seededRandom(42));
  for (const placed of layout.placements) {
    const name = world.items.find((item) => item.index === placed.index).name;
    if (['Nilpferd', 'Flamingo'].includes(name)) {
      assert.ok(placed.bounds[0] >= 0.59 && placed.bounds[1] >= 0.73);
    } else assert.ok(!scene.overlaps(placed.bounds, [0.59, 0.73, 0.94, 0.94]));
  }
});
