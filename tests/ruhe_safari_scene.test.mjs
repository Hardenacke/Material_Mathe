import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import '../tools/ruhe-safari-scene.js';

const source = readFileSync(new URL('../tools/ruhe-safari.html', import.meta.url), 'utf8');
const scene = globalThis.RuheSafariScene;
const baseWorlds = JSON.parse(source.match(/world-data[^>]*>(.*?)<\/script>/s)[1]);
const worlds = scene.withSpecialWorlds(baseWorlds);

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

for (const world of worlds) {
  test(`${world.id}: alle Motive samt Bewegungsraum passen kollisionsfrei in ihre Lebensräume`, () => {
    for (let seed = 1; seed <= 80; seed++) {
      const layout = scene.createLayout(world, world.items.map((item) => item.index), seededRandom(seed));
      assert.equal(layout.placements.length, world.items.length);
      assert.equal(new Set(layout.placements.map((placed) => placed.index)).size, world.items.length);
      for (const [index, placed] of layout.placements.entries()) {
        const item = world.items.find((entry) => entry.index === placed.index);
        const habitat = scene.habitatFor(world, item);
        const sizing = scene.sizeProfileFor(world, item);
        assert.equal(placed.baseSize, sizing.base);
        assert.ok(placed.sizeFactor >= 1 - sizing.variation && placed.sizeFactor <= 1 + sizing.variation);
        assert.ok(Math.abs(placed.size - sizing.base * placed.sizeFactor) < 1e-12);
        const art = scene.artworkFor(world, item);
        assert.ok(placed.size >= 0.045, `${item.name} ist zu klein`);
        assert.ok(placed.size * Math.max(art.right - art.left, art.bottom - art.top) >= 0.025, item.name);
        assert.ok(habitat.zones.some((zone) => placed.bounds[0] >= zone[0] - 1e-10 && placed.bounds[1] >= zone[1] - 1e-10
          && placed.bounds[2] <= zone[2] + 1e-10 && placed.bounds[3] <= zone[3] + 1e-10), `${item.name} verlässt seine Zone`);
        assert.ok(habitat.blocked.every((blocked) => !scene.overlaps(placed.bounds, blocked)));
        for (const other of layout.placements.slice(index + 1)) assert.ok(!scene.overlaps(placed.bounds, other.bounds));
      }
    }
  });
}

test('Erscheinungsreihenfolge wird gemischt, ohne die Auswahl zu verändern', () => {
  const selected = Array.from({ length: 12 }, (_, index) => index);
  const first = scene.shuffleOrder(selected, seededRandom(12));
  const second = scene.shuffleOrder(selected, seededRandom(13));
  assert.notDeepEqual(first, second);
  assert.deepEqual([...first].sort((first, second) => first - second), selected);
  assert.deepEqual(selected, Array.from({ length: 12 }, (_, index) => index));
  assert.deepEqual(scene.shuffleOrder(selected, seededRandom(12)), first);
  assert.deepEqual(scene.shuffleOrder([], seededRandom(1)), []);
  assert.deepEqual(scene.shuffleOrder([7], seededRandom(1)), [7]);
});

test('Größen streuen je Motiv um eine feste Basis und bleiben in einer Runde unverändert', () => {
  const world = worlds[0];
  const selected = world.items.map((item) => item.index);
  const first = scene.createLayout(world, selected, seededRandom(12));
  const second = scene.createLayout(world, selected, seededRandom(13));
  assert.ok(new Set(first.placements.map((actor) => actor.sizeFactor.toFixed(6))).size > 1);
  assert.ok(first.placements.some((actor) => actor.size !== second.placements.find((other) => other.index === actor.index).size));
  const sizes = new Map(first.placements.map((actor) => [actor.index, actor.size]));
  const random = seededRandom(15);
  for (let frame = 0; frame < 100; frame++) scene.stepMotion(world, first, selected, 0.1, random);
  for (const actor of first.placements) assert.equal(actor.size, sizes.get(actor.index));
});

test('Neue Runden erhalten neue Plätze; eine kleine Auswahl bleibt vollständig', () => {
  const world = worlds[0];
  const selected = [0, 3, 7];
  const first = scene.createLayout(world, selected, seededRandom(12));
  const second = scene.createLayout(world, selected, seededRandom(13));
  assert.notDeepEqual(first.placements, second.placements);
  assert.deepEqual(first.placements.map((placed) => placed.index).sort((first, second) => first - second), selected);
  assert.deepEqual(scene.createLayout(world, [], seededRandom(1)).placements, []);
});

test('Winterhäuser bilden ein großes, enges Dorf mit gemeinsamer Bodenlinie und freiem Vordergrund', () => {
  const world = worlds.find((entry) => entry.id === 'winterdorf');
  const centers = new Set();
  for (let seed = 1; seed <= 80; seed++) {
    const layout = scene.createLayout(world, world.items.map((item) => item.index), seededRandom(seed));
    const houses = layout.placements.filter((actor) => world.items[actor.index].name.endsWith('Winterhaus'))
      .sort((first, second) => first.x - second.x);
    assert.equal(houses.length, 2);
    const feet = houses.map((house) => {
      const art = scene.artworkFor(world, world.items[house.index]);
      assert.ok(house.size >= (house.index === 0 ? 0.48 : 0.60) * 0.9 - 1e-12);
      return house.y + house.size * (art.bottom - art.top) * layout.aspect / 2;
    });
    assert.ok(Math.abs(feet[0] - feet[1]) < 1e-12);
    const gap = houses[1].bounds[0] - houses[0].bounds[2];
    assert.ok(gap >= 0.004 - 1e-12 && gap <= 0.01 + 1e-12);
    const fox = layout.placements.find((actor) => world.items[actor.index].name === 'Winterfuchs');
    const ground = scene.habitatFor(world, world.items[fox.index]).zones[0];
    assert.ok(ground[3] - Math.max(...houses.map((house) => house.bounds[3])) > fox.halfHeight * 2);
    centers.add(houses.map((house) => house.x.toFixed(4)).join(','));
  }
  assert.ok(centers.size > 60);
  for (const selected of [[], [0], [1], [0, 1], [3, 9, 10]]) {
    const layout = scene.createLayout(world, selected, seededRandom(42));
    assert.deepEqual(layout.placements.map((actor) => actor.index).sort((first, second) => first - second), selected);
  }
});

test('Winterhäuser, Laterne, Winterbrücke und Schneebank sind gegenüber der vorigen Version doppelt so groß', () => {
  const world = worlds.find((entry) => entry.id === 'winterdorf');
  const previousSizes = new Map([[0, 0.24], [1, 0.30], [4, 0.06], [7, 0.135], [8, 0.115]]);
  for (const [index, previous] of previousSizes) {
    const sizing = scene.sizeProfileFor(world, world.items[index]);
    assert.equal(sizing.base, previous * 2);
    assert.equal(sizing.variation, 0.1);
  }
  const selected = world.items.map((item) => item.index);
  for (const value of [0, 0.999999]) {
    const layout = scene.createLayout(world, selected, () => value);
    assert.equal(layout.aspect, 4 / 3);
    assert.equal(layout.placements.length, selected.length);
    for (const actor of layout.placements) {
      assert.ok(actor.bounds.every((coordinate) => coordinate >= 0 && coordinate <= 1));
      assert.ok(!layout.placements.some((other) => other !== actor && scene.overlaps(actor.bounds, other.bounds)));
    }
  }
});

test('Wassertiere bleiben am Gewässer und Landtiere meiden den Teich', () => {
  const world = worlds.find((entry) => entry.id === 'safari');
  const layout = scene.createLayout(world, world.items.map((item) => item.index), seededRandom(42));
  for (const placed of layout.placements) {
    const name = world.items.find((item) => item.index === placed.index).name;
    if (name === 'Nilpferd') {
      assert.ok(placed.bounds[0] >= 0.58 && placed.bounds[1] >= 0.69);
    } else if (name === 'Flamingo') {
      assert.ok(placed.bounds[0] >= 0.59 && placed.bounds[1] >= 0.73);
    } else assert.ok(!scene.overlaps(placed.bounds, [0.59, 0.73, 0.94, 0.94]));
  }
});

test('Große Tiere und Objekte sind auch bei maximaler Zufallsstreuung sichtbar mindestens doppelt so groß', () => {
  const pairs = [
    ['safari', 'Elefant', 'Erdmännchen'], ['unterwasser', 'Walhai', 'Seepferdchen'],
    ['weltraumstation', 'Versorgungsraumschiff', 'Astronaut'], ['zaubergarten', 'Apfelbaum', 'Marienkäfer'],
    ['zukunftsstadt', 'Schule', 'Lastenrad'], ['dinosaurier', 'Langhalssaurier', 'Schlüpfender Dinosaurier'],
    ['forschungsinsel', 'Forschungsstation', 'Mikroskop'], ['sternenhimmel', 'Dekorative Galaxie', 'Warmer Stern'],
    ['murmelbahn', 'Loopingelement', 'Blaue Murmel'], ['winterdorf', 'Hohes Winterhaus', 'Schneehase'],
    ['kunstwerk', 'Mosaikberge', 'Mosaikfisch']
  ];
  for (const [worldId, largeName, smallName] of pairs) {
    const world = worlds.find((world) => world.id === worldId);
    const extent = (name, direction) => {
      const item = world.items.find((item) => item.name === name);
      const sizing = scene.sizeProfileFor(world, item);
      const art = scene.artworkFor(world, item);
      return sizing.base * (1 + direction * sizing.variation) * Math.max(art.right - art.left, art.bottom - art.top);
    };
    assert.ok(extent(largeName, -1) >= extent(smallName, 1) * 2, worldId);
  }
});

test('Aktive Motive bewegen sich langsam; Gebäude bleiben an ihrem Platz', () => {
  const examples = [['safari', 'Elefant'], ['unterwasser', 'Clownfisch'], ['zaubergarten', 'Schmetterling']];
  for (const [worldId, name] of examples) {
    const world = worlds.find((entry) => entry.id === worldId);
    const profile = scene.motionProfileFor(world, world.items.find((item) => item.name === name));
    assert.ok(profile.speed > 0 && profile.speed <= 0.012, name);
    assert.ok(profile.duration >= 10, name);
  }
  const city = worlds.find((world) => world.id === 'zukunftsstadt');
  assert.equal(scene.motionProfileFor(city, city.items.find((item) => item.name === 'Wohnhaus')).speed, 0);
});

test('Einzelne Tiere finden Wege durch ihre ganze Landschaft und meiden den Teich', () => {
  const world = worlds.find((world) => world.id === 'safari');
  const layout = scene.createLayout(world, [0], seededRandom(2));
  const actor = layout.placements[0];
  const route = scene.findRoute(world, actor, layout.placements, seededRandom(3));
  assert.ok(route.length > 0);
  const destination = route.at(-1);
  assert.ok(Math.hypot(destination.x - actor.x, (destination.y - actor.y) / layout.aspect) > 0.3);
  const start = { x: actor.x, y: actor.y };
  const random = seededRandom(5);
  let furthest = 0;
  for (let frame = 0; frame < 1000; frame++) {
    scene.stepMotion(world, layout, [actor.index], 0.1, random);
    furthest = Math.max(furthest, Math.hypot(actor.x - start.x, (actor.y - start.y) / layout.aspect));
  }
  assert.ok(furthest > 0.3, `Zurückgelegter Bereich: ${furthest}`);
});

test('Neue Entdeckungen erscheinen auch während des Wanderns ohne Zusammenstoß', () => {
  for (const world of worlds) {
    const random = seededRandom(23);
    const layout = scene.createLayout(world, world.items.map((item) => item.index), random);
    let travelled = 0;
    for (let frame = 0; frame < 1200; frame++) {
      const requested = world.items.slice(0, 1 + Math.floor(frame / 100)).map((item) => item.index);
      scene.syncVisible(world, layout, requested, random);
      const before = new Map(layout.placements.map((actor) => [actor.index, { x: actor.x, y: actor.y }]));
      for (const actor of scene.stepMotion(world, layout, requested, 0.1, random)) {
        const previous = before.get(actor.index);
        travelled += Math.hypot(actor.x - previous.x, (actor.y - previous.y) / layout.aspect);
      }
      const actors = layout.placements.filter((actor) => layout.present.includes(actor.index));
      for (const [index, actor] of actors.entries()) for (const other of actors.slice(index + 1)) assert.ok(!scene.overlaps(actor.bounds, other.bounds), world.id);
    }
    if (world.items.some((item) => scene.motionProfileFor(world, item).speed)) assert.ok(travelled > 0.03, world.id);
  }
});

test('Große Motive bleiben beim langsamen Wandern in allen Welten kollisionsfrei', () => {
  for (const world of worlds) {
    const random = seededRandom(19);
    const layout = scene.createLayout(world, world.items.map((item) => item.index), random);
    const starts = structuredClone(layout.placements);
    const visible = world.items.map((item) => item.index);
    for (let frame = 0; frame < 1200; frame++) {
      const previous = structuredClone(layout.placements);
      scene.stepMotion(world, layout, visible, 0.1, random);
      for (const [index, actor] of layout.placements.entries()) {
        const item = world.items.find((item) => item.index === actor.index);
        const profile = scene.motionProfileFor(world, item);
        const before = previous[index];
        assert.ok(Math.hypot(actor.x - before.x, (actor.y - before.y) / layout.aspect) <= profile.speed * 0.1 + 1e-10);
        const habitat = scene.habitatFor(world, item);
        assert.ok(habitat.zones.some((zone) => actor.bounds[0] >= zone[0] - 1e-10 && actor.bounds[1] >= zone[1] - 1e-10
          && actor.bounds[2] <= zone[2] + 1e-10 && actor.bounds[3] <= zone[3] + 1e-10));
        assert.ok(habitat.blocked.every((blocked) => !scene.overlaps(actor.bounds, blocked)));
        for (const other of layout.placements.slice(index + 1)) assert.ok(!scene.overlaps(actor.bounds, other.bounds));
        if (!profile.speed) assert.deepEqual(actor, starts[index]);
      }
    }
  }
});

test('Jede Welt hat eine passende Farbstimmung mit lesbarer Skala', () => {
  const luminance = (color) => {
    const channels = color.slice(1).match(/../g).map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const backdrops = new Set();
  for (const world of worlds) {
    const mood = scene.moodFor(world);
    for (const color of Object.values(mood)) assert.match(color, /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i);
    backdrops.add(mood.backdrop);
    const brightness = [luminance(mood.ink), luminance(mood.frame)].sort((first, second) => first - second);
    const contrast = (brightness[1] + 0.05) / (brightness[0] + 0.05);
    assert.ok(contrast >= 4.5, `${world.id}: Skalenkontrast ${contrast.toFixed(2)}`);
  }
  assert.equal(backdrops.size, new Set(worlds.map((world) => world.atmosphere || world.id)).size);
});

test('Erdmännchensafari ergänzt ausschließlich 30 Erdmännchen mit dem vorhandenen Bild', () => {
  const colony = worlds.find((world) => world.id === 'erdmaennchensafari');
  const safari = baseWorlds.find((world) => world.id === 'safari');
  const meerkat = safari.items.find((item) => item.name === 'Erdmännchen');
  assert.equal(colony.items.length, 30);
  assert.equal(new Set(colony.items.map((item) => item.index)).size, 30);
  assert.ok(colony.items.every((item) => /^Erdmännchen \d+$/.test(item.name) && item.image === meerkat.image));
  assert.equal(colony.background, safari.background);
  assert.equal(baseWorlds.length, 11);
  assert.equal(scene.withSpecialWorlds(worlds).length, worlds.length);
  assert.deepEqual(scene.moodFor(colony), scene.moodFor(safari));
});

test('Alle atmosphärischen Details haben lokale Stile und bleiben dekorativ', () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement() {
      return {
        children: [], attributes: {}, properties: {},
        style: { setProperty(name, value) { this[name] = value; } },
        setAttribute(name, value) { this.attributes[name] = value; },
        append(child) { this.children.push(child); }
      };
    }
  };
  try {
    for (const world of worlds) {
      const layer = scene.createAmbiance(world, seededRandom(1));
      assert.equal(layer.attributes['aria-hidden'], 'true');
      assert.ok(layer.children.length > 0 && layer.children.length <= 60);
      for (const detail of layer.children) {
        const kind = detail.className.split(' ')[1];
        assert.ok(source.includes(`.${kind}{`) || source.includes(`.${kind},`), `${world.id}: Stil für ${kind} fehlt`);
        assert.match(detail.style['--atmosphere-color'], /^#[0-9a-f]{6}$/i);
        assert.match(detail.style['--effect-rotation'], /^-?[\d.]+deg$/);
        assert.ok(Number(detail.style['--effect-scale-x']) > 0.7);
        assert.ok(Number(detail.style['--effect-scale-y']) > 0.7);
        assert.ok(detail.style['--effect-radius-start'].includes(' / '));
      }
      if (world.id === 'safari') assert.ok(layer.children.some((detail) => detail.className.includes('ambient-sunshine')));
    }
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('Atmosphärische Formen variieren reproduzierbar und nur leicht', () => {
  const kinds = ['cloud', 'ripple', 'grass', 'bubble', 'ray', 'star', 'glint', 'pollen', 'leaf', 'snow',
    'aurora', 'sunshine', 'sunbeam', 'caustic', 'nebula', 'meteor', 'rainbow', 'firefly', 'prism', 'mist', 'sea-sparkle', 'frost', 'confetti'];
  for (const kind of kinds) {
    const first = scene.effectVariationFor(kind, seededRandom(12));
    const second = scene.effectVariationFor(kind, seededRandom(13));
    assert.notDeepEqual(first, second, kind);
    assert.deepEqual(scene.effectVariationFor(kind, seededRandom(12)), first);
    for (const shape of [first, second]) {
      assert.ok(shape.scaleX >= 0.75 && shape.scaleX <= 1.25, kind);
      assert.ok(shape.scaleY >= 0.75 && shape.scaleY <= 1.25, kind);
      assert.ok(Math.abs(shape.rotation) <= 35 && Math.abs(shape.skew) <= 8, kind);
      assert.ok(shape.opacity >= 0.8 && shape.opacity <= 1, kind);
    }
  }
});

test('Sonnenlicht dreht nicht und Sternschnuppen bleiben entlang ihrer Flugbahn ausgerichtet', () => {
  for (let seed = 1; seed <= 80; seed++) {
    const sun = scene.effectVariationFor('sunshine', seededRandom(seed));
    assert.equal(Math.abs(sun.rotation), 0);
    assert.equal(Math.abs(sun.skew), 0);
    const ripple = scene.effectVariationFor('ripple', seededRandom(seed));
    assert.ok(Math.abs(ripple.rotation) <= 4);
    const meteor = scene.effectVariationFor('meteor', seededRandom(seed));
    const heading = Math.atan2(meteor.fallY / (1672 / 941), meteor.fallX) * 180 / Math.PI;
    assert.ok(Math.abs(heading - meteor.rotation) < 1e-10);
  }
});
