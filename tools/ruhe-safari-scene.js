(() => {
  const ground = [0.08, 0.48, 0.92, 0.94];
  const sky = [0.08, 0.08, 0.92, 0.44];
  const pond = [0.59, 0.73, 0.94, 0.94];
  const sea = [0.35, 0.26, 0.77, 0.45];
  const profiles = {
    gentle: { horizontal: 0.09, vertical: 0.02, tilt: 2, duration: 3.8 },
    roaming: { horizontal: 0.55, vertical: 0.08, tilt: 3, duration: 2.8 },
    swimming: { horizontal: 0.7, vertical: 0.18, tilt: 5, duration: 3 },
    fluttering: { horizontal: 0.65, vertical: 0.32, tilt: 7, duration: 2.2 }
  };

  function motionFor(world, item) {
    if (['Schmetterling', 'Biene', 'Mosaikvogel'].includes(item.name)) return 'fluttering';
    if ((world.id === 'unterwasser' && item.name !== 'Korallengruppe') || item.name === 'Mosaikfisch') return 'swimming';
    if (world.id === 'safari' || (world.id === 'dinosaurier' && item.name !== 'Dinosauriernest')
      || ['Marienkäfer', 'Winterfuchs', 'Schneehase', 'Astronaut'].includes(item.name)) return 'roaming';
    return 'gentle';
  }

  function habitatFor(world, item) {
    const name = item.name;
    if (world.id === 'safari') return ['Nilpferd', 'Flamingo'].includes(name)
      ? { zones: [pond], blocked: [] } : { zones: [ground], blocked: [pond] };
    if (world.id === 'unterwasser') return { zones: [
      ['Einsiedlerkrebs', 'Seestern', 'Korallengruppe'].includes(name)
        ? [0.2, 0.77, 0.8, 0.97] : [0.2, 0.09, 0.8, 0.77]
    ], blocked: [] };
    if (world.id === 'weltraumstation') return { zones: [[0.12, 0.08, 0.94, 0.86]], blocked: [[0, 0.73, 0.23, 1]] };
    if (world.id === 'sternenhimmel') return { zones: [[0.07, 0.07, 0.93, 0.85]], blocked: [] };
    if (world.id === 'zaubergarten') return { zones: motionFor(world, item) === 'fluttering' ? [sky]
      : [[0.04, 0.61, 0.21, 0.91], [0.3, 0.61, 0.71, 0.91], [0.8, 0.61, 0.96, 0.91]], blocked: [] };
    if (world.id === 'zukunftsstadt') return { zones: [[0.09, 0.4, 0.91, 0.93]], blocked: [] };
    if (world.id === 'dinosaurier') return { zones: [[0.17, 0.54, 0.86, 0.94]], blocked: [] };
    if (world.id === 'forschungsinsel') return ['Forschungsboot', 'Messboje'].includes(name)
      ? { zones: [sea], blocked: [] } : { zones: [[0.13, 0.56, 0.9, 0.94]], blocked: [] };
    if (world.id === 'winterdorf') return { zones: [['Polarlicht', 'Schneeflockengruppe'].includes(name)
      ? sky : [0.14, 0.5, 0.86, 0.94]], blocked: [] };
    if (world.id === 'murmelbahn') return { zones: [[0.08, 0.1, 0.92, 0.87]], blocked: [] };
    if (world.id === 'kunstwerk') return { zones: [
      ['Mosaiksonne', 'Mosaikwolke', 'Mosaikvogel', 'Mosaikregenbogen'].includes(name)
        ? [0.08, 0.1, 0.92, 0.45] : [0.08, 0.48, 0.92, 0.9]
    ], blocked: [] };
    return { zones: [ground], blocked: [] };
  }

  function motionProfileFor(world, item) {
    return profiles[motionFor(world, item)];
  }

  function overlaps(first, second) {
    return first[0] < second[2] && first[2] > second[0] && first[1] < second[3] && first[3] > second[1];
  }

  function createLayout(world, selected, random = Math.random) {
    const aspect = 1672 / 941;
    const height = 1000 / aspect;
    const items = world.items.filter((item) => selected.includes(item.index)).map((item) => {
      const habitat = habitatFor(world, item);
      const area = habitat.zones.reduce((sum, zone) => sum + (zone[2] - zone[0]) * (zone[3] - zone[1]), 0);
      return { item, habitat, priority: area + random() * 0.01, variation: 0.92 + random() * 0.16 };
    }).sort((first, second) => first.priority - second.priority);
    if (!items.length) return { aspect, placements: [] };
    for (let scale = 1; scale > 0.15; scale *= 0.88) {
      const placements = [];
      for (const entry of items) {
        const { item, habitat } = entry;
        const size = height * 0.22 * scale * entry.variation;
        const motion = motionProfileFor(world, item);
        const halfWidth = size * (0.5 + motion.horizontal + 0.1) + 7;
        const halfHeight = size * (0.5 + motion.vertical + 0.1) + 7;
        const zones = habitat.zones.map((zone) => [zone[0] * 1000 + halfWidth, zone[1] * height + halfHeight,
          zone[2] * 1000 - halfWidth, zone[3] * height - halfHeight]).filter((zone) => zone[0] <= zone[2] && zone[1] <= zone[3]);
        if (!zones.length) break;
        let candidate = null;
        let bestDistance = -1;
        for (let attempt = 0; attempt < 220; attempt++) {
          const zone = zones[Math.floor(random() * zones.length)];
          const left = zone[0] + random() * (zone[2] - zone[0]);
          const top = zone[1] + random() * (zone[3] - zone[1]);
          const bounds = [(left - halfWidth) / 1000, (top - halfHeight) / height,
            (left + halfWidth) / 1000, (top + halfHeight) / height];
          if (habitat.blocked.some((blocked) => overlaps(bounds, blocked)) || placements.some((placed) => overlaps(bounds, placed.bounds))) continue;
          const distance = placements.length ? Math.min(...placements.map((placed) => Math.hypot(left - placed.x * 1000, top - placed.y * height))) : random();
          if (distance > bestDistance) {
            bestDistance = distance;
            candidate = { index: item.index, x: left / 1000, y: top / height, size: size / 1000, bounds };
          }
        }
        if (!candidate) break;
        placements.push(candidate);
      }
      if (placements.length === items.length) return { aspect, placements };
    }
    throw new Error('Für diese Auswahl konnten keine freien Plätze gefunden werden.');
  }

  const ambiance = {
    safari: [['cloud', 4, [0.12, 0.05, 0.82, 0.29]], ['ripple', 4, pond], ['grass', 7, [0.02, 0.88, 0.95, 0.98]]],
    unterwasser: [['bubble', 16, [0.18, 0.23, 0.83, 0.88]], ['ray', 3, [0.05, 0, 0.58, 0.25]]],
    weltraumstation: [['star', 22, [0.1, 0.04, 0.94, 0.85]]],
    zaubergarten: [['cloud', 3, [0.15, 0.09, 0.76, 0.32]], ['pollen', 12, [0.09, 0.36, 0.91, 0.81]]],
    zukunftsstadt: [['cloud', 5, [0.09, 0.03, 0.84, 0.23]]],
    dinosaurier: [['cloud', 3, [0.25, 0.08, 0.74, 0.27]], ['leaf', 9, [0.03, 0.25, 0.95, 0.54]]],
    forschungsinsel: [['cloud', 3, [0.22, 0.04, 0.73, 0.19]], ['ripple', 9, sea]],
    sternenhimmel: [['star', 26, [0.08, 0.06, 0.94, 0.83]]],
    murmelbahn: [['glint', 8, [0.12, 0.15, 0.87, 0.82]]],
    winterdorf: [['snow', 20, [0.07, 0.06, 0.92, 0.74]], ['aurora', 2, [0.21, 0.13, 0.65, 0.3]]],
    kunstwerk: [['glint', 10, [0.1, 0.13, 0.89, 0.84]]]
  };

  function createAmbiance(world, random = Math.random) {
    const layer = document.createElement('div');
    layer.className = 'ambient-layer';
    layer.setAttribute('aria-hidden', 'true');
    for (const [kind, count, zone] of ambiance[world.id] || []) {
      for (let index = 0; index < count; index++) {
        const detail = document.createElement('span');
        detail.className = `ambient-detail ambient-${kind}`;
        detail.style.left = (zone[0] + random() * (zone[2] - zone[0])) * 100 + '%';
        detail.style.top = (zone[1] + random() * (zone[3] - zone[1])) * 100 + '%';
        const duration = ['star', 'glint', 'ripple', 'grass'].includes(kind) ? 2.5 : 5;
        detail.style.setProperty('--ambient-duration', (duration + random() * 3) + 's');
        detail.style.setProperty('--ambient-delay', (-random() * 30) + 's');
        layer.append(detail);
      }
    }
    return layer;
  }

  globalThis.RuheSafariScene = { motionFor, motionProfileFor, habitatFor, overlaps, createLayout, createAmbiance };
})();
