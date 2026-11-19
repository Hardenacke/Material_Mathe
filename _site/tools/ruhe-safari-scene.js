(() => {
  const ground = [0.08, 0.48, 0.92, 0.94];
  const sky = [0.08, 0.08, 0.92, 0.44];
  const pond = [0.59, 0.73, 0.94, 0.94];
  const sea = [0.35, 0.26, 0.77, 0.45];
  const profiles = {
    gentle: { horizontal: 0.09, vertical: 0.02, tilt: 2, duration: 5.5 },
    roaming: { horizontal: 0.55, vertical: 0.08, tilt: 3, duration: 3.8 },
    swimming: { horizontal: 0.7, vertical: 0.18, tilt: 5, duration: 4.2 },
    fluttering: { horizontal: 0.65, vertical: 0.32, tilt: 7, duration: 3.4 }
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
    unterwasser: [['bubble', 12, [0.18, 0.23, 0.83, 0.88]], ['ray', 2, [0.05, 0, 0.58, 0.25]]],
    weltraumstation: [['star', 16, [0.1, 0.04, 0.94, 0.85]]],
    zaubergarten: [['cloud', 3, [0.15, 0.09, 0.76, 0.32]], ['pollen', 8, [0.09, 0.36, 0.91, 0.81]]],
    zukunftsstadt: [['cloud', 5, [0.09, 0.03, 0.84, 0.23]]],
    dinosaurier: [['cloud', 3, [0.25, 0.08, 0.74, 0.27]], ['leaf', 9, [0.03, 0.25, 0.95, 0.54]]],
    forschungsinsel: [['cloud', 3, [0.22, 0.04, 0.73, 0.19]], ['ripple', 9, sea]],
    sternenhimmel: [['star', 26, [0.08, 0.06, 0.94, 0.83]]],
    murmelbahn: [['glint', 8, [0.12, 0.15, 0.87, 0.82]]],
    winterdorf: [['snow', 14, [0.07, 0.06, 0.92, 0.74]], ['aurora', 2, [0.21, 0.13, 0.65, 0.3]]],
    kunstwerk: [['glint', 10, [0.1, 0.13, 0.89, 0.84]]]
  };

  const atmosphere = {
    safari: [['sunshine', 1, [0.76, 0.1, 0.76, 0.1]], ['sunbeam', 3, [0.76, 0.1, 0.76, 0.1]]],
    unterwasser: [['caustic', 1, [0.35, 0.35, 0.65, 0.55]], ['sea-sparkle', 8, [0.2, 0.2, 0.8, 0.75]]],
    weltraumstation: [['nebula', 2, [0.3, 0.25, 0.75, 0.6]], ['meteor', 2, [0.12, 0.12, 0.55, 0.4]]],
    zaubergarten: [['rainbow', 1, [0.5, 0.27, 0.5, 0.27]], ['firefly', 8, [0.1, 0.42, 0.9, 0.86]]],
    zukunftsstadt: [['sunshine', 1, [0.18, 0.05, 0.18, 0.05]], ['prism', 2, [0.28, 0.4, 0.75, 0.6]]],
    dinosaurier: [['sunbeam', 3, [0.58, 0.08, 0.58, 0.08]], ['mist', 2, [0.4, 0.53, 0.65, 0.58]], ['firefly', 6, [0.08, 0.4, 0.92, 0.75]]],
    forschungsinsel: [['sunshine', 1, [0.52, 0.08, 0.52, 0.08]], ['sea-sparkle', 14, sea]],
    sternenhimmel: [['nebula', 2, [0.3, 0.3, 0.78, 0.65]], ['meteor', 3, [0.12, 0.1, 0.6, 0.35]]],
    murmelbahn: [['prism', 2, [0.25, 0.5, 0.7, 0.5]], ['sea-sparkle', 8, [0.14, 0.15, 0.86, 0.8]]],
    winterdorf: [['frost', 14, [0.15, 0.56, 0.86, 0.92]]],
    kunstwerk: [['prism', 2, [0.3, 0.5, 0.7, 0.5]], ['confetti', 8, [0.12, 0.16, 0.85, 0.72]]]
  };

  const palettes = {
    safari: ['#f6d9a1', '#eac393', '#fff0c8'],
    unterwasser: ['#b1e3d3', '#aed8e3', '#cfc5e3'],
    weltraumstation: ['#c5b9dd', '#b0d4df', '#e8c1d1'],
    zaubergarten: ['#e5e8b5', '#e6c0cb', '#cec1df'],
    zukunftsstadt: ['#b5dcd6', '#c7bddc', '#e8c6cb'],
    dinosaurier: ['#d8dfb7', '#ead2a1', '#c5ddbd'],
    forschungsinsel: ['#bfe3d8', '#efdfb8', '#c5dce5'],
    sternenhimmel: ['#cec0e3', '#e3c0cf', '#bed4e3'],
    murmelbahn: ['#e7c2cd', '#bddde2', '#cec0df'],
    winterdorf: ['#c9dfe9', '#d6c9e4', '#c3e3d8'],
    kunstwerk: ['#e5b6c3', '#b4d9d4', '#f0d9a7', '#c9bbdc', '#d4dfb7']
  };

  const moods = {
    safari: { backdrop: '#ded3b6', halo: '#fff0ce', edge: '#805f3b22', frame: '#eee5cf', ink: '#6e634b' },
    unterwasser: { backdrop: '#c9ded8', halo: '#e5fff0', edge: '#285c6222', frame: '#ddebe4', ink: '#466b63' },
    weltraumstation: { backdrop: '#292b44', halo: '#4d4262', edge: '#171d3633', frame: '#34364a', ink: '#e8dfce' },
    zaubergarten: { backdrop: '#d9dfc8', halo: '#fff0d3', edge: '#62704a22', frame: '#eaeedc', ink: '#5e6d51' },
    zukunftsstadt: { backdrop: '#d9e0dd', halo: '#f9e7d6', edge: '#5d6b7222', frame: '#e8ece2', ink: '#5c6d66' },
    dinosaurier: { backdrop: '#d4dac0', halo: '#f4e7bc', edge: '#58654322', frame: '#e4e7d2', ink: '#5d684c' },
    forschungsinsel: { backdrop: '#d1e0d9', halo: '#f9ebc9', edge: '#386c6422', frame: '#e5eee1', ink: '#4f6e64' },
    sternenhimmel: { backdrop: '#303047', halo: '#5c4666', edge: '#211c3733', frame: '#3a354e', ink: '#e7dff0' },
    murmelbahn: { backdrop: '#e5d7bf', halo: '#fff0d2', edge: '#9a785522', frame: '#f1e5d1', ink: '#786246' },
    winterdorf: { backdrop: '#d6d6e3', halo: '#f5e3df', edge: '#68638322', frame: '#e8e4ed', ink: '#665e77' },
    kunstwerk: { backdrop: '#e8dacb', halo: '#fff2df', edge: '#957b6b22', frame: '#f5ebdd', ink: '#796556' }
  };

  function moodFor(world) {
    return moods[world.id] || moods.safari;
  }

  function createAmbiance(world, random = Math.random) {
    const layer = document.createElement('div');
    layer.className = 'ambient-layer';
    layer.setAttribute('aria-hidden', 'true');
    const effects = [...(ambiance[world.id] || []), ...(atmosphere[world.id] || [])];
    const colors = palettes[world.id] || ['#fff2b0'];
    for (const [kind, count, zone] of effects) {
      for (let index = 0; index < count; index++) {
        const detail = document.createElement('span');
        detail.className = `ambient-detail ambient-${kind}`;
        detail.style.left = (zone[0] + random() * (zone[2] - zone[0])) * 100 + '%';
        detail.style.top = (zone[1] + random() * (zone[3] - zone[1])) * 100 + '%';
        const duration = kind === 'meteor' ? 18 : ['star', 'glint', 'ripple', 'grass', 'sea-sparkle', 'frost'].includes(kind) ? 5 : 9;
        detail.style.setProperty('--ambient-duration', (duration + random() * 4) + 's');
        detail.style.setProperty('--ambient-delay', (-random() * 30) + 's');
        detail.style.setProperty('--atmosphere-color', colors[index % colors.length]);
        detail.style.setProperty('--beam-angle', ((index - (count - 1) / 2) * 18) + 'deg');
        layer.append(detail);
      }
    }
    return layer;
  }

  globalThis.RuheSafariScene = { motionFor, motionProfileFor, moodFor, habitatFor, overlaps, createLayout, createAmbiance };
})();
