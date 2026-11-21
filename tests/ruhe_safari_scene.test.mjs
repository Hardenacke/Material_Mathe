import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import '../tools/ruhe-safari-scene.js';
import '../tools/ruhe-safari-worlds.js';

const source = readFileSync(new URL('../tools/ruhe-safari.html', import.meta.url), 'utf8');
const atmosphereStyles = source + readFileSync(new URL('../tools/ruhe-safari-atmosphere.css', import.meta.url), 'utf8');
const scene = globalThis.RuheSafariScene;
const baseWorlds = JSON.parse(source.match(/world-data[^>]*>(.*?)<\/script>/s)[1]);
const worlds = scene.withSpecialWorlds([...baseWorlds, ...globalThis.RuheSafariAdditionalWorlds]);

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('Neue Welten enthalten ausschließlich die vollständigen lokalen Bildsätze mit vermessenen Bildgrenzen', () => {
  assert.equal(new Set(worlds.map((world) => world.id)).size, worlds.length);
  const expected = [['zauberwald', 36], ['otterwelt', 12], ['regenwald', 6], ['bauernhof', 8],
    ['almwiese', 6], ['nachtgarten', 6], ['kueste', 6], ['oase', 6], ['kirschblueten', 6],
    ['maercheninseln', 6], ['fruehling', 6], ['sommer', 6], ['herbst', 6], ['winter', 6]];
  for (const [worldId, count] of expected) {
    const world = worlds.find((entry) => entry.id === worldId);
    assert.equal(world.items.length, count);
    assert.equal(new Set(world.items.map((item) => item.image)).size, count);
    for (const asset of [world.background, ...world.items.map((item) => item.image)]) {
      assert.match(asset, /^assets\/ruhe-safari\/[a-z-]+\/[a-z0-9-]+\.webp$/);
      const bytes = readFileSync(new URL(`../tools/${asset}`, import.meta.url));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    }
    for (const item of world.items) {
      assert.equal(item.artworkBounds.length, 4);
      assert.ok(item.artworkBounds.every((coordinate) => coordinate >= 0 && coordinate <= 1));
      assert.ok(item.artworkBounds[0] < item.artworkBounds[2] && item.artworkBounds[1] < item.artworkBounds[3]);
      assert.ok(scene.motionProfileFor(world, item));
    }
  }
});

test('Stilwelten nutzen die Hochformatkomposition mit ausreichendem Abstand und größeren Kleinstmotiven', () => {
  const compositions = worlds.filter((world) => world.composition);
  assert.equal(compositions.length, 12);
  for (const landscape of compositions) {
    const portrait = { ...landscape, portrait: true };
    const selected = landscape.items.map((item) => item.index);
    const sources = [() => 0, () => 0.999999, ...Array.from({ length: 32 }, (_, index) => seededRandom(index + 1))];
    for (const random of sources) {
      const layout = scene.createLayout(portrait, selected, random);
      assert.equal(layout.aspect, 5 / 4);
      assert.equal(layout.placements.length, selected.length);
      for (const actor of layout.placements) {
        const item = portrait.items[actor.index];
        assert.ok(actor.bounds.every((coordinate) => coordinate > 0 && coordinate < 1));
        assert.ok(Math.abs(actor.x - item.pose.portraitX) < 0.16, item.name);
        assert.ok(actor.baseSize > scene.sizeProfileFor(landscape, item).base, item.name);
        assert.ok(!layout.placements.some((other) => other !== actor && scene.overlaps(actor.bounds, other.bounds)));
      }
    }
  }
});

test('Waldtiere bleiben auf Lichtung, am Bach oder in der Luft; Otter meiden die Ufer und ruhende Motive bleiben still', () => {
  const forest = worlds.find((world) => world.id === 'zauberwald');
  const otters = worlds.find((world) => world.id === 'otterwelt');
  for (let seed = 1; seed <= 24; seed++) {
    const layout = scene.createLayout(forest, forest.items.map((item) => item.index), seededRandom(seed));
    for (const actor of layout.placements) {
      const item = forest.items[actor.index];
      if (item.surface === 'water') {
        assert.ok(actor.bounds[2] <= 0.4 + 1e-10 || actor.bounds[0] >= 0.59 - 1e-10);
        assert.ok(actor.bounds[3] <= 0.94 + 1e-10);
        assert.equal(scene.motionFor(forest, item), 'swimming');
      } else if (item.surface !== 'air') assert.ok(actor.bounds[3] <= 0.825 + 1e-10);
    }
    const otterLayout = scene.createLayout(otters, otters.items.map((item) => item.index), seededRandom(seed));
    const resting = otterLayout.placements.find((actor) => actor.index === 3);
    assert.ok(resting.bounds[2] <= 0.28 + 1e-10 || resting.bounds[0] >= 0.75 - 1e-10);
  }
  assert.equal(scene.motionProfileFor(otters, otters.items[3]).speed, 0);
  assert.equal(scene.motionProfileFor(otters, otters.items[11]).speed, 0);
  assert.ok(scene.motionProfileFor(otters, otters.items[0]).speed <= 0.006);
  assert.ok(scene.sizeProfileFor(otters, otters.items[8]).base < scene.sizeProfileFor(otters, otters.items[0]).base);
  assert.ok(scene.sizeProfileFor(otters, otters.items[10]).base > scene.sizeProfileFor(otters, otters.items[0]).base);
  assert.ok(scene.sizeProfileFor(forest, forest.items[0]).base > scene.sizeProfileFor(forest, forest.items[16]).base * 2.5);
});

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
        const visibleSize = scene.visualSizeFor(world, item, placed);
        assert.ok(placed.size >= 0.045, `${item.name} ist zu klein`);
        assert.ok(visibleSize * Math.max(art.right - art.left, art.bottom - art.top) >= 0.025, item.name);
        assert.ok(visibleSize * (art.right - art.left) / 2 < placed.halfWidth);
        assert.ok(visibleSize * (art.bottom - art.top) * layout.aspect / 2 < placed.halfHeight);
        assert.ok(habitat.zones.some((zone) => placed.bounds[0] >= zone[0] - 1e-10 && placed.bounds[1] >= zone[1] - 1e-10
          && placed.bounds[2] <= zone[2] + 1e-10 && placed.bounds[3] <= zone[3] + 1e-10), `${item.name} verlässt seine Zone`);
        assert.ok(habitat.blocked.every((blocked) => !scene.overlaps(placed.bounds, blocked)));
        for (const other of layout.placements.slice(index + 1)) assert.ok(!scene.overlaps(placed.bounds, other.bounds));
      }
    }
  });
}

test('Alle Welten passen auch mit gleichzeitig minimaler oder maximaler Größenstreuung', () => {
  for (const world of worlds) for (const value of [0, 0.999999]) {
    const layout = scene.createLayout(world, world.items.map((item) => item.index), () => value);
    assert.equal(layout.placements.length, world.items.length);
    for (const actor of layout.placements) {
      const habitat = scene.habitatFor(world, world.items[actor.index]);
      assert.ok(habitat.zones.some((zone) => actor.bounds[0] >= zone[0] - 1e-10 && actor.bounds[1] >= zone[1] - 1e-10
        && actor.bounds[2] <= zone[2] + 1e-10 && actor.bounds[3] <= zone[3] + 1e-10), world.id);
      assert.ok(!layout.placements.some((other) => other !== actor && scene.overlaps(actor.bounds, other.bounds)), world.id);
    }
  }
});

test('Bildtiefe richtet sich nach Landschaft und Bodenkontakt; Himmelsbilder und Bauplatten bleiben maßstabsfest', () => {
  const landscapes = ['safari', 'erdmaennchensafari', 'unterwasser', 'zaubergarten', 'zukunftsstadt', 'dinosaurier', 'forschungsinsel', 'winterdorf', 'zauberwald', 'otterwelt'];
  for (const world of worlds) {
    let hasPerspective = false;
    for (const item of world.items) {
      const perspective = scene.perspectiveProfileFor(world, item);
      const size = scene.sizeProfileFor(world, item).base;
      let previous = 0;
      if (perspective) hasPerspective = true;
      for (let step = 0; step <= 100; step++) {
        const actor = { size, y: step / 100 };
        const visible = scene.visualSizeFor(world, item, actor);
        if (!perspective) assert.equal(visible, size);
        else {
          assert.ok(visible >= size * perspective.minimum && visible <= size * perspective.maximum);
          const art = scene.artworkFor(world, item);
          const layout = scene.createLayout(world, [], seededRandom(1));
          const contact = perspective.contact ? actor.y + visible * (art.bottom - art.top) * layout.aspect / 2 : actor.y;
          const expected = size * Math.max(perspective.minimum, Math.min(perspective.maximum, 1 + perspective.slope * (contact - perspective.reference)));
          assert.ok(Math.abs(visible - expected) < 1e-12);
        }
        if (previous) assert.ok(visible >= previous && visible - previous < size * 0.006);
        previous = visible;
      }
    }
    assert.equal(hasPerspective, landscapes.includes(world.id), world.id);
  }
});

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

test('Wintermotive besitzen stimmige Größenverhältnisse zu Bank, Schlitten und Tieren', () => {
  const world = worlds.find((entry) => entry.id === 'winterdorf');
  const extent = (index, axis) => {
    const item = world.items[index];
    const art = scene.artworkFor(world, item);
    return scene.sizeProfileFor(world, item).base * (axis === 'width' ? art.right - art.left : art.bottom - art.top);
  };
  assert.ok(extent(2, 'height') > extent(8, 'height') * 2.4);
  assert.ok(extent(4, 'height') > extent(8, 'height') * 2);
  assert.ok(extent(3, 'height') > extent(9, 'height') * 1.4);
  assert.ok(extent(9, 'height') > extent(10, 'height') * 1.3);
  assert.ok(extent(6, 'width') > extent(8, 'width') * 0.7);
  assert.ok(extent(6, 'width') < extent(8, 'width') * 1.1);
  assert.ok(extent(7, 'width') > extent(8, 'width') * 1.5);
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

test('Winterperspektive folgt dem Bodenkontakt und verändert sich beim Wandern gleichmäßig', () => {
  const world = worlds.find((entry) => entry.id === 'winterdorf');
  const fox = world.items[9];
  const actor = { size: scene.sizeProfileFor(world, fox).base, y: 0.6 };
  const farSize = scene.visualSizeFor(world, fox, actor);
  const nearSize = scene.visualSizeFor(world, fox, { ...actor, y: 0.92 });
  assert.ok(nearSize > farSize * 1.08);
  for (const item of world.items) {
    const nominal = scene.sizeProfileFor(world, item).base;
    let previous = 0;
    for (let step = 0; step <= 100; step++) {
      const placed = { size: nominal, y: 0.44 + step * 0.005 };
      const visibleSize = scene.visualSizeFor(world, item, placed);
      assert.ok(visibleSize >= nominal * 0.92 && visibleSize <= nominal * 1.1);
      if (previous) assert.ok(visibleSize >= previous && visibleSize - previous < nominal * 0.003);
      if (item.index < 2 || [5, 11].includes(item.index)) assert.equal(visibleSize, nominal);
      else {
        const art = scene.artworkFor(world, item);
        const feet = placed.y + visibleSize * (art.bottom - art.top) * (4 / 3) / 2;
        const expected = nominal * Math.max(0.92, Math.min(1.1, 1 + 0.3 * (feet - 0.65)));
        assert.ok(Math.abs(visibleSize - expected) < 1e-12);
      }
      previous = visibleSize;
    }
  }
  const space = worlds.find((entry) => entry.id === 'weltraumstation');
  assert.equal(scene.visualSizeFor(space, space.items[0], actor), actor.size);
  const random = seededRandom(17);
  const layout = scene.createLayout(world, world.items.map((item) => item.index), random);
  const moving = layout.placements.find((entry) => entry.index === fox.index);
  let changed = false;
  for (let frame = 0; frame < 1200; frame++) {
    const before = scene.visualSizeFor(world, fox, moving);
    scene.stepMotion(world, layout, world.items.map((item) => item.index), 0.1, random);
    const after = scene.visualSizeFor(world, fox, moving);
    assert.ok(Math.abs(after - before) < moving.size * 0.001);
    if (Math.abs(after - before) > 1e-8) changed = true;
    for (const placed of layout.placements) {
      const item = world.items[placed.index];
      const art = scene.artworkFor(world, item);
      const size = scene.visualSizeFor(world, item, placed);
      const halfWidth = size * (art.right - art.left) / 2;
      const halfHeight = size * (art.bottom - art.top) * layout.aspect / 2;
      assert.ok(halfWidth < placed.halfWidth && halfHeight < placed.halfHeight);
    }
  }
  assert.ok(changed, 'Die Perspektive muss während einer echten Wanderung nachgeführt werden');
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
    } else assert.ok(!scene.overlaps(placed.bounds, [0.62, 0.73, 0.97, 0.94]));
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

test('Szenenspezifische Proportionen berücksichtigen Tierhöhen, Gebäude und Nutzgegenstände', () => {
  const comparisons = [
    ['safari', 'Giraffe', 'Elefant', 'height', 1.35],
    ['safari', 'Elefant', 'Löwe', 'height', 1.8],
    ['unterwasser', 'Walhai', 'Delfin', 'width', 2],
    ['weltraumstation', 'Wohnmodul', 'Astronaut', 'height', 3],
    ['zaubergarten', 'Apfelbaum', 'Sonnenblume', 'height', 1.5],
    ['zukunftsstadt', 'Schule', 'Lastenrad', 'height', 4],
    ['dinosaurier', 'Langhalssaurier', 'Schlüpfender Dinosaurier', 'height', 4],
    ['forschungsinsel', 'Forschungsstation', 'Materialkiste', 'height', 4],
    ['sternenhimmel', 'Ringplanet', 'Warmer Stern', 'height', 3],
    ['murmelbahn', 'Loopingelement', 'Blaue Murmel', 'height', 4],
    ['kunstwerk', 'Mosaikbaum', 'Mosaikhaus', 'height', 1.15],
    ['kunstwerk', 'Mosaikberge', 'Mosaikhügel', 'width', 1.6]
  ];
  for (const [worldId, large, small, axis, ratio] of comparisons) {
    const world = worlds.find((entry) => entry.id === worldId);
    const extent = (name) => {
      const item = world.items.find((entry) => entry.name === name);
      const art = scene.artworkFor(world, item);
      return scene.sizeProfileFor(world, item).base * (axis === 'width' ? art.right - art.left : art.bottom - art.top);
    };
    assert.ok(extent(large) >= extent(small) * ratio, `${worldId}: ${large} zu ${small}`);
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
        assert.match(atmosphereStyles, new RegExp(`\\.${kind}(?:\\s*\\{|,)`), `${world.id}: Stil für ${kind} fehlt`);
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
