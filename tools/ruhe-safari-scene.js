(() => {
  const ground = [0.04, 0.38, 0.96, 0.96];
  const sky = [0.08, 0.08, 0.92, 0.44];
  const pond = [0.62, 0.73, 0.97, 0.94];
  const sea = [0.35, 0.26, 0.77, 0.45];
  const profiles = {
    rooted: { horizontal: 0, vertical: 0, tilt: 0, duration: 16, speed: 0 },
    gentle: { horizontal: 0.015, vertical: 0.005, tilt: 0.7, duration: 14, speed: 0 },
    roaming: { horizontal: 0.02, vertical: 0.007, tilt: 0.8, duration: 12, speed: 0.008 },
    swimming: { horizontal: 0.025, vertical: 0.012, tilt: 1.2, duration: 14, speed: 0.01 },
    fluttering: { horizontal: 0.035, vertical: 0.025, tilt: 2, duration: 10, speed: 0.012 },
    drifting: { horizontal: 0.015, vertical: 0.01, tilt: 1, duration: 16, speed: 0.006 },
    crawling: { horizontal: 0.005, vertical: 0, tilt: 0.3, duration: 16, speed: 0.003 }
  };

  const baseSizes = {
    safari: [0.22, 0.25, 0.115, 0.105, 0.082, 0.055, 0.18, 0.145, 0.095, 0.16, 0.085, 0.08],
    unterwasser: [0.055, 0.105, 0.16, 0.05, 0.105, 0.065, 0.14, 0.075, 0.055, 0.055, 0.28, 0.14],
    weltraumstation: [0.23, 0.21, 0.22, 0.23, 0.10, 0.25, 0.06, 0.10, 0.13, 0.12, 0.18, 0.075],
    zaubergarten: [0.06, 0.09, 0.125, 0.055, 0.165, 0.22, 0.055, 0.05, 0.08, 0.095, 0.145, 0.15],
    zukunftsstadt: [0.22, 0.16, 0.25, 0.23, 0.18, 0.12, 0.22, 0.14, 0.26, 0.17, 0.055, 0.23],
    dinosaurier: [0.17, 0.24, 0.16, 0.08, 0.145, 0.055, 0.14, 0.085, 0.20, 0.15, 0.165, 0.08],
    forschungsinsel: [0.17, 0.13, 0.14, 0.06, 0.11, 0.13, 0.14, 0.11, 0.055, 0.27, 0.16, 0.06],
    sternenhimmel: [0.06, 0.065, 0.17, 0.105, 0.10, 0.22, 0.20, 0.09, 0.23, 0.19, 0.055, 0.085],
    murmelbahn: [0.16, 0.17, 0.19, 0.11, 0.14, 0.055, 0.14, 0.18, 0.16, 0.16, 0.21, 0.075],
    winterdorf: [0.48, 0.60, 0.25, 0.12, 0.22, 0.18, 0.12, 0.22, 0.13, 0.075, 0.05, 0.07],
    kunstwerk: [0.14, 0.22, 0.11, 0.18, 0.16, 0.21, 0.095, 0.055, 0.09, 0.15, 0.24, 0.055]
  };

  const artworkBounds = {
    safari: [[0.055,0.14,0.965,0.915],[0.21,0.01,0.78,0.965],[0.065,0.12,0.895,0.935],[0.05,0.085,0.985,0.95],[0.165,0.025,0.825,0.95],[0.165,0.11,0.655,0.935],[0.055,0.105,0.945,0.89],[0.05,0.21,0.98,0.87],[0.25,0.055,0.885,0.945],[0.035,0.11,0.96,0.9],[0.085,0.09,0.96,0.89],[0.255,0.045,0.825,0.945]],
    unterwasser: [[0.05,0.23,0.935,0.85],[0.01,0.23,0.905,0.895],[0.04,0.205,0.95,0.81],[0.27,0.07,0.8,0.9],[0.015,0.075,0.895,0.9],[0.06,0.195,0.915,0.755],[0.195,0.24,0.965,0.845],[0.225,0.185,0.765,0.885],[0.13,0.26,0.73,0.805],[0.24,0.17,0.85,0.735],[0.06,0.235,0.89,0.695],[0.12,0.17,0.78,0.725]],
    weltraumstation: [[0.085,0.25,0.94,0.865],[0.055,0.32,0.9,0.83],[0.055,0.25,0.915,0.88],[0.09,0.21,0.94,0.775],[0.215,0.175,0.74,0.82],[0.065,0.24,0.915,0.755],[0.285,0.16,0.785,0.91],[0.115,0.305,0.85,0.705],[0.12,0.25,0.865,0.78],[0.16,0.17,0.855,0.84],[0.145,0.185,0.85,0.79],[0.125,0.26,0.82,0.74]],
    zaubergarten: [[0.245,0.465,0.755,0.885],[0.23,0.14,0.75,0.905],[0.185,0.095,0.75,0.92],[0.125,0.205,0.91,0.8],[0.065,0.125,0.875,0.855],[0.05,0.06,0.88,0.895],[0.255,0.335,0.805,0.755],[0.175,0.255,0.775,0.805],[0.125,0.255,0.75,0.805],[0.155,0.23,0.895,0.79],[0.21,0.075,0.735,0.825],[0.085,0.15,0.815,0.825]],
    zukunftsstadt: [[0.19,0.24,0.82,0.815],[0.185,0.23,0.815,0.82],[0.12,0.31,0.825,0.795],[0.175,0.285,0.84,0.72],[0.16,0.25,0.83,0.725],[0.14,0.25,0.82,0.76],[0.285,0.235,0.72,0.845],[0.105,0.235,0.855,0.845],[0.095,0.32,0.85,0.82],[0.14,0.37,0.87,0.725],[0.135,0.285,0.815,0.74],[0.095,0.26,0.865,0.745]],
    dinosaurier: [[0.03,0.165,0.92,0.88],[0.095,0.09,0.905,0.9],[0,0.185,0.965,0.89],[0.04,0.08,0.94,0.885],[0.02,0.21,0.975,0.79],[0.125,0.1,0.77,0.915],[0.17,0.25,0.815,0.78],[0.195,0.255,0.79,0.785],[0.09,0.265,0.83,0.785],[0.18,0.265,0.815,0.72],[0.18,0.17,0.8,0.76],[0.19,0.3,0.75,0.695]],
    forschungsinsel: [[0.07,0.225,1,0.905],[0.175,0.265,0.85,0.905],[0.255,0.095,0.795,0.95],[0.14,0.175,0.915,0.92],[0.055,0.14,0.925,0.9],[0.16,0.05,0.865,0.885],[0.175,0.365,0.9,0.81],[0.225,0.17,0.805,0.9],[0.265,0.18,0.69,0.885],[0.175,0.095,0.875,0.875],[0.15,0.28,0.855,0.76],[0.26,0.1,0.72,0.875]],
    sternenhimmel: [[0.255,0.265,0.765,0.785],[0.205,0.255,0.79,0.785],[0.22,0.225,0.745,0.815],[0.12,0.295,0.88,0.64],[0.1,0.295,0.905,0.65],[0.16,0.21,0.845,0.79],[0.215,0.27,0.855,0.835],[0.15,0.28,0.87,0.82],[0.095,0.255,0.795,0.82],[0.215,0.195,0.86,0.82],[0.095,0.2,0.84,0.81],[0.115,0.19,0.755,0.81]],
    murmelbahn: [[0.065,0.325,0.93,0.73],[0.135,0.27,0.86,0.84],[0.075,0.165,0.915,0.895],[0.255,0.08,0.795,0.875],[0.155,0.235,0.84,0.77],[0.245,0.225,0.755,0.745],[0.175,0.275,0.885,0.79],[0.11,0.315,0.885,0.735],[0.13,0.23,0.795,0.785],[0.25,0.13,0.815,0.805],[0.195,0.12,0.795,0.805],[0.23,0.145,0.75,0.79]],
    winterdorf: [[0.215,0.285,0.85,0.825],[0.245,0.155,0.79,0.835],[0.23,0.19,0.72,0.85],[0.27,0.185,0.8,0.79],[0.345,0.155,0.655,0.8],[0.125,0.29,0.82,0.72],[0.23,0.36,0.905,0.795],[0.09,0.31,0.895,0.79],[0.085,0.3,0.77,0.785],[0.26,0.175,0.825,0.79],[0.24,0.14,0.7,0.79],[0.115,0.14,0.76,0.73]],
    kunstwerk: [[0.14,0.12,0.915,0.915],[0.025,0.215,0.965,0.825],[0.04,0.23,0.93,0.845],[0.125,0.07,0.935,0.91],[0.1,0.14,0.885,0.88],[0.06,0.2,0.915,0.87],[0.22,0.22,0.825,0.9],[0.145,0.225,0.86,0.835],[0.16,0.215,0.76,0.9],[0.18,0.31,0.86,0.735],[0.095,0.26,0.89,0.73],[0.105,0.24,0.82,0.75]]
  };

  function artworkFor(world, item) {
    const source = world.mode === 'meerkats' ? 'safari' : world.id;
    const index = world.mode === 'meerkats' ? 5 : item.index;
    const [left, top, right, bottom] = artworkBounds[source]?.[index] || [0, 0, 1, 1];
    return { left, top, right, bottom, offsetX: 0.5 - (left + right) / 2, offsetY: 0.5 - (top + bottom) / 2 };
  }

  function sizeProfileFor(world, item) {
    if (world.mode === 'meerkats') return { base: 0.078, variation: 0.08 };
    return { base: baseSizes[world.id]?.[item.index] || 0.09,
      variation: world.id === 'forschungsinsel' && item.name === 'Forschungsboot' ? 0.08 : 0.1 };
  }

  function withSpecialWorlds(worlds) {
    if (worlds.some((world) => world.id === 'erdmaennchensafari')) return [...worlds];
    const safari = worlds.find((world) => world.id === 'safari');
    const meerkat = safari?.items.find((item) => item.name === 'Erdmännchen');
    if (!meerkat) return [...worlds];
    return [...worlds, { id: 'erdmaennchensafari', name: 'Erdmännchensafari', mode: 'meerkats', atmosphere: 'safari',
      background: safari.background, items: Array.from({ length: 30 }, (_, index) => ({ ...meerkat, index, name: `Erdmännchen ${index + 1}` })) }];
  }

  function shuffleOrder(selected, random = Math.random) {
    const order = [...selected];
    for (let index = order.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
    return order;
  }

  function motionFor(world, item) {
    if (world.mode === 'meerkats') return 'roaming';
    if (['Schmetterling', 'Biene', 'Mosaikvogel'].includes(item.name)) return 'fluttering';
    if (['Einsiedlerkrebs', 'Seestern'].includes(item.name)) return 'crawling';
    if ((world.id === 'unterwasser' && item.name !== 'Korallengruppe') || item.name === 'Mosaikfisch') return 'swimming';
    if (world.id === 'safari' || (world.id === 'dinosaurier' && item.name !== 'Dinosauriernest')
      || ['Marienkäfer', 'Winterfuchs', 'Schneehase', 'Straßenbahn', 'Lastenrad'].includes(item.name)) return 'roaming';
    if (['Astronaut', 'Versorgungsraumschiff', 'Satellit', 'Kleiner Satellit', 'Forschungsboot'].includes(item.name)) return 'drifting';
    if (/Pflanze|Keimling|strauch|baum|blume|Tanne|Polarlicht|Schneeflocke|Koralle|Messboje|Wolke|Windrad/i.test(item.name)) return 'gentle';
    return 'rooted';
  }

  function habitatFor(world, item) {
    const name = item.name;
    if (world.mode === 'meerkats') return { zones: [ground], blocked: [pond] };
    if (world.id === 'safari') {
      if (name === 'Nilpferd') return { zones: [[0.61, 0.69, 0.98, 0.95]], blocked: [] };
      if (name === 'Giraffe') return { zones: [[0.04, 0.18, 0.96, 0.96]], blocked: [pond] };
      return name === 'Flamingo' ? { zones: [pond], blocked: [] }
        : { zones: [['Elefant', 'Nashorn', 'Büffel'].includes(name) ? [0.04, 0.3, 0.96, 0.96] : ground], blocked: [pond] };
    }
    if (world.id === 'unterwasser') return { zones: [
      ['Einsiedlerkrebs', 'Seestern', 'Korallengruppe'].includes(name)
        ? [0.2, 0.77, 0.8, 0.97] : [0.2, 0.09, 0.8, 0.77]
    ], blocked: [] };
    if (world.id === 'weltraumstation') return { zones: [[0.12, 0.08, 0.94, 0.86]], blocked: [[0, 0.73, 0.23, 1]] };
    if (world.id === 'sternenhimmel') return { zones: [[0.07, 0.07, 0.93, 0.85]], blocked: [] };
    if (world.id === 'zaubergarten' && name === 'Apfelbaum') return { zones: [[0.02, 0.24, 0.34, 0.64], [0.66, 0.24, 0.98, 0.64]], blocked: [] };
    if (world.id === 'zaubergarten') return { zones: motionFor(world, item) === 'fluttering' ? [sky]
      : [[0.02, 0.58, 0.11, 0.92], [0.24, 0.55, 0.78, 0.95], [0.9, 0.58, 0.98, 0.92]], blocked: [] };
    if (world.id === 'zukunftsstadt') return { zones: [/Wohnhaus|Bibliothek|Gemeinschaftshaus|Schule|gewächshaus|Windrad/.test(name)
      ? [0.05, 0.23, 0.95, 0.96] : [0.05, 0.38, 0.95, 0.96]], blocked: [] };
    if (world.id === 'dinosaurier') return { zones: [[0.04, 0.38, 0.96, 0.98]], blocked: [[0.04, 0.38, 0.15, 0.57], [0.88, 0.38, 0.96, 0.55]] };
    if (world.id === 'forschungsinsel') return ['Forschungsboot', 'Messboje'].includes(name)
      ? { zones: [sea], blocked: [] } : { zones: [[0.12, 0.52, 0.9, 0.95]], blocked: [] };
    if (world.id === 'winterdorf') return { zones: [['Polarlicht', 'Schneeflockengruppe'].includes(name)
      ? sky : name.endsWith('Winterhaus') ? [0.04, 0.02, 0.96, 0.75] : [0.04, 0.44, 0.96, 0.99]], blocked: [] };
    if (world.id === 'murmelbahn') return { zones: [[0.08, 0.1, 0.92, 0.87]], blocked: [] };
    if (world.id === 'kunstwerk') return { zones: [
      ['Mosaiksonne', 'Mosaikwolke', 'Mosaikvogel', 'Mosaikregenbogen'].includes(name)
        ? [0.08, 0.1, 0.92, 0.45] : [0.08, 0.4, 0.92, 0.92]
    ], blocked: [] };
    return { zones: [ground], blocked: [] };
  }

  function motionProfileFor(world, item) {
    return profiles[motionFor(world, item)];
  }

  function overlaps(first, second) {
    return first[0] < second[2] && first[2] > second[0] && first[1] < second[3] && first[3] > second[1];
  }

  function aspectFor(world) {
    return ['safari', 'erdmaennchensafari', 'zaubergarten', 'zukunftsstadt', 'dinosaurier', 'forschungsinsel', 'winterdorf'].includes(world.id) ? 4 / 3 : 1672 / 941;
  }

  const perspectives = {
    safari: { reference: 0.68, slope: 0.35, minimum: 0.9, maximum: 1.1, contact: true },
    erdmaennchensafari: { reference: 0.68, slope: 0.3, minimum: 0.94, maximum: 1.06, contact: true },
    unterwasser: { reference: 0.45, slope: 0.16, minimum: 0.94, maximum: 1.06, contact: false },
    zaubergarten: { reference: 0.78, slope: 0.35, minimum: 0.92, maximum: 1.06, contact: true },
    zukunftsstadt: { reference: 0.68, slope: 0.3, minimum: 0.9, maximum: 1.08, contact: true },
    dinosaurier: { reference: 0.68, slope: 0.32, minimum: 0.9, maximum: 1.08, contact: true },
    forschungsinsel: { reference: 0.72, slope: 0.3, minimum: 0.92, maximum: 1.08, contact: true },
    winterdorf: { reference: 0.65, slope: 0.3, minimum: 0.92, maximum: 1.1, contact: true }
  };
  const bankPerspective = { ...perspectives.safari, maximum: 1.04 };
  const waterPerspective = { reference: 0.36, slope: 0.12, minimum: 0.97, maximum: 1.04, contact: false };

  function perspectiveProfileFor(world, item) {
    if (world.id === 'winterdorf' && (item.name.endsWith('Winterhaus')
      || ['Polarlicht', 'Schneeflockengruppe'].includes(item.name))) return null;
    if (world.id === 'zaubergarten' && motionFor(world, item) === 'fluttering') return null;
    if (world.id === 'safari' && ['Nilpferd', 'Flamingo'].includes(item.name)) return bankPerspective;
    if (world.id === 'forschungsinsel' && ['Forschungsboot', 'Messboje'].includes(item.name)) return waterPerspective;
    return perspectives[world.id] || null;
  }

  function visualSizeFor(world, item, actor) {
    const perspective = perspectiveProfileFor(world, item);
    if (!perspective) return actor.size;
    const art = artworkFor(world, item);
    const contact = perspective.contact ? (art.bottom - art.top) * aspectFor(world) / 2 : 0;
    const scale = (1 + perspective.slope * (actor.y - perspective.reference))
      / (1 - actor.size * perspective.slope * contact);
    return actor.size * Math.max(perspective.minimum, Math.min(perspective.maximum, scale));
  }

  function placeWinterHouses(entries, aspect, random) {
    const houses = shuffleOrder(entries.filter((entry) => entry.item.name.endsWith('Winterhaus')), random);
    if (!houses.length) return [];
    const gap = 0.004 + random() * 0.006;
    const width = houses.reduce((sum, entry) => sum + entry.halfWidth * 2, 0) + gap * (houses.length - 1);
    const baseline = 0.645 + random() * 0.005;
    let left = 0.5 + (random() - 0.5) * 0.04 - width / 2;
    return houses.map((entry) => {
      const actor = { index: entry.item.index, x: left + entry.halfWidth,
        y: baseline - entry.size * entry.artHeight * aspect / 2,
        size: entry.size, baseSize: entry.baseSize, sizeFactor: entry.sizeFactor,
        halfWidth: entry.halfWidth, halfHeight: entry.halfHeight };
      actor.bounds = boundsAt(actor, actor);
      left += entry.halfWidth * 2 + gap;
      return actor;
    });
  }

  function createLayout(world, selected, random = Math.random) {
    const aspect = aspectFor(world);
    const height = 1000 / aspect;
    const items = world.items.filter((item) => selected.includes(item.index)).map((item) => {
      const habitat = habitatFor(world, item);
      const area = habitat.zones.reduce((sum, zone) => sum + (zone[2] - zone[0]) * (zone[3] - zone[1]), 0);
      const sizing = sizeProfileFor(world, item);
      const sizeFactor = 1 + (random() * 2 - 1) * sizing.variation;
      const size = sizing.base * sizeFactor;
      const motion = motionProfileFor(world, item);
      const art = artworkFor(world, item);
      const padding = !motion.speed ? (world.id === 'winterdorf' && item.name.endsWith('Winterhaus') ? 0.025 : 0.04) : 0.07;
      const reservationScale = perspectiveProfileFor(world, item)?.maximum || 1;
      return { item, habitat, area, priority: random(),
        baseSize: sizing.base, sizeFactor, size, artHeight: art.bottom - art.top,
        halfWidth: size * reservationScale * ((art.right - art.left) / 2 + motion.horizontal + padding) + 0.003,
        halfHeight: (size * reservationScale * ((art.bottom - art.top) / 2 + motion.vertical + padding) + 0.003) * aspect };
    }).sort((first, second) => first.area - second.area || second.size - first.size || first.priority - second.priority);
    if (!items.length) return { aspect, placements: [] };
    for (let attemptLayout = 0; attemptLayout < 64; attemptLayout++) {
      const placements = world.id === 'winterdorf' ? placeWinterHouses(items, aspect, random) : [];
      const packingOrder = Math.floor((attemptLayout - 16) / 4) % 4;
      const measure = (entry) => [entry.halfHeight, entry.halfWidth, entry.halfWidth * entry.halfHeight, entry.size][packingOrder];
      const ordered = attemptLayout < 16 ? items : [...items].sort((first, second) => (attemptLayout < 32 ? Math.min(0.3, first.area) - Math.min(0.3, second.area) : 0)
        || measure(second) - measure(first));
      for (const entry of ordered) {
        if (placements.some((actor) => actor.index === entry.item.index)) continue;
        const { item, habitat } = entry;
        const size = entry.size * 1000;
        const halfWidth = entry.halfWidth * 1000;
        const halfHeight = entry.halfHeight * height;
        const zones = habitat.zones.map((zone) => [zone[0] * 1000 + halfWidth, zone[1] * height + halfHeight,
          zone[2] * 1000 - halfWidth, zone[3] * height - halfHeight]).filter((zone) => zone[0] <= zone[2] && zone[1] <= zone[3]);
        if (!zones.length) break;
        let candidate = null;
        let bestDistance = -Infinity;
        const grid = [];
        const compact = attemptLayout >= 16;
        if (compact) for (const zone of zones) {
          const occupied = [...habitat.blocked.map((bounds) => [bounds[0] * 1000, bounds[1] * height, bounds[2] * 1000, bounds[3] * height]),
            ...placements.map((placed) => [placed.bounds[0] * 1000, placed.bounds[1] * height, placed.bounds[2] * 1000, placed.bounds[3] * height])];
          const horizontal = [zone[0], zone[2], ...occupied.flatMap((bounds) => [bounds[0] - halfWidth - 0.001, bounds[2] + halfWidth + 0.001])];
          const vertical = [zone[1], zone[3], ...occupied.flatMap((bounds) => [bounds[1] - halfHeight - 0.001, bounds[3] + halfHeight + 0.001])];
          for (const left of horizontal) for (const top of vertical) grid.push({ left, top });
        }
        for (let attempt = 0; attempt < (grid.length || 320); attempt++) {
          const zone = zones[Math.floor(random() * zones.length)];
          const left = grid.length ? grid[attempt].left : zone[0] + random() * (zone[2] - zone[0]);
          const top = grid.length ? grid[attempt].top : zone[1] + random() * (zone[3] - zone[1]);
          if (!zones.some((allowed) => left >= allowed[0] && left <= allowed[2] && top >= allowed[1] && top <= allowed[3])) continue;
          const bounds = [(left - halfWidth) / 1000, (top - halfHeight) / height,
            (left + halfWidth) / 1000, (top + halfHeight) / height];
          if (habitat.blocked.some((blocked) => overlaps(bounds, blocked)) || placements.some((placed) => overlaps(bounds, placed.bounds))) continue;
          const orientation = attemptLayout % 4;
          const distance = compact ? (orientation < 2 ? -top : top) * 10000 + (orientation % 2 ? left : -left)
            : placements.length ? Math.min(...placements.map((placed) => Math.hypot(left - placed.x * 1000, top - placed.y * height))) : random();
          if (distance > bestDistance) {
            bestDistance = distance;
            candidate = { index: item.index, x: left / 1000, y: top / height, size: size / 1000, baseSize: entry.baseSize, sizeFactor: entry.sizeFactor,
              halfWidth: halfWidth / 1000, halfHeight: halfHeight / height, bounds };
          }
        }
        if (!candidate) break;
        placements.push(candidate);
      }
      if (placements.length === items.length) {
        if (world.mode === 'meerkats') {
          for (let pass = 0; pass < 10; pass++) for (const actor of shuffleOrder(placements, random)) {
            const item = world.items.find((item) => item.index === actor.index);
            const habitat = habitatFor(world, item);
            for (let attempt = 0; attempt < 20; attempt++) {
              const zone = habitat.zones[Math.floor(random() * habitat.zones.length)];
              const point = { x: zone[0] + actor.halfWidth + random() * (zone[2] - zone[0] - actor.halfWidth * 2),
                y: zone[1] + actor.halfHeight + random() * (zone[3] - zone[1] - actor.halfHeight * 2) };
              if (!clearSegment(world, actor, point, point, placements)) continue;
              actor.x = point.x; actor.y = point.y; actor.bounds = boundsAt(actor, actor); break;
            }
          }
        }
        return { aspect, placements };
      }
    }
    throw new Error(`Für die Auswahl in „${world.name || world.id}“ konnten keine freien Plätze gefunden werden.`);
  }

  function boundsAt(actor, point) {
    return [point.x - actor.halfWidth, point.y - actor.halfHeight,
      point.x + actor.halfWidth, point.y + actor.halfHeight];
  }

  function segmentHits(from, to, rectangle) {
    let entry = 0;
    let exit = 1;
    for (const [start, end, minimum, maximum] of [[from.x, to.x, rectangle[0], rectangle[2]], [from.y, to.y, rectangle[1], rectangle[3]]]) {
      const change = end - start;
      if (Math.abs(change) < 1e-12) {
        if (start <= minimum || start >= maximum) return false;
      } else {
        const first = (minimum - start) / change;
        const second = (maximum - start) / change;
        entry = Math.max(entry, Math.min(first, second));
        exit = Math.min(exit, Math.max(first, second));
        if (entry >= exit) return false;
      }
    }
    return entry < exit;
  }

  function clearSegment(world, actor, from, to, actors) {
    const item = world.items.find((item) => item.index === actor.index);
    const habitat = habitatFor(world, item);
    const start = boundsAt(actor, from);
    const finish = boundsAt(actor, to);
    if (!habitat.zones.some((zone) => start[0] >= zone[0] - 1e-10 && start[1] >= zone[1] - 1e-10 && start[2] <= zone[2] + 1e-10 && start[3] <= zone[3] + 1e-10
      && finish[0] >= zone[0] - 1e-10 && finish[1] >= zone[1] - 1e-10 && finish[2] <= zone[2] + 1e-10 && finish[3] <= zone[3] + 1e-10)) return false;
    const obstacles = [...habitat.blocked, ...actors.filter((other) => other.index !== actor.index).map((other) => other.bounds)];
    return obstacles.every((bounds) => !segmentHits(from, to, [bounds[0] - actor.halfWidth, bounds[1] - actor.halfHeight,
      bounds[2] + actor.halfWidth, bounds[3] + actor.halfHeight]));
  }

  function findRoute(world, actor, actors, random = Math.random) {
    const item = world.items.find((item) => item.index === actor.index);
    const habitat = habitatFor(world, item);
    const obstacles = [...habitat.blocked, ...actors.filter((other) => other.index !== actor.index).map((other) => other.bounds)];
    const unique = (values) => [...new Set(values.filter((value) => value >= 0 && value <= 1))].sort((first, second) => first - second);
    const horizontal = unique([actor.x, ...Array.from({ length: 21 }, (_, index) => index / 20),
      ...habitat.zones.flatMap((zone) => [zone[0] + actor.halfWidth + 0.0001, zone[2] - actor.halfWidth - 0.0001]),
      ...obstacles.flatMap((bounds) => [bounds[0] - actor.halfWidth - 0.0001, bounds[2] + actor.halfWidth + 0.0001])]);
    const vertical = unique([actor.y, ...Array.from({ length: 15 }, (_, index) => index / 14),
      ...habitat.zones.flatMap((zone) => [zone[1] + actor.halfHeight + 0.0001, zone[3] - actor.halfHeight - 0.0001]),
      ...obstacles.flatMap((bounds) => [bounds[1] - actor.halfHeight - 0.0001, bounds[3] + actor.halfHeight + 0.0001])]);
    const columns = horizontal.length - 1;
    const rows = vertical.length - 1;
    const pointAt = (index) => ({ x: horizontal[index % (columns + 1)], y: vertical[Math.floor(index / (columns + 1))] });
    const parents = new Map();
    const queue = [];
    const nearestColumn = horizontal.indexOf(actor.x);
    const nearestRow = vertical.indexOf(actor.y);
    for (let row = nearestRow - 1; row <= nearestRow + 1; row++) for (let column = nearestColumn - 1; column <= nearestColumn + 1; column++) {
      if (column < 0 || column > columns || row < 0 || row > rows) continue;
      const index = row * (columns + 1) + column;
      if (clearSegment(world, actor, actor, pointAt(index), actors)) { parents.set(index, -1); queue.push(index); }
    }
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const index = queue[cursor];
      const column = index % (columns + 1);
      const row = Math.floor(index / (columns + 1));
      for (const [horizontal, vertical] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const nextColumn = column + horizontal;
        const nextRow = row + vertical;
        if (nextColumn < 0 || nextColumn > columns || nextRow < 0 || nextRow > rows) continue;
        const next = nextRow * (columns + 1) + nextColumn;
        if (parents.has(next) || !clearSegment(world, actor, pointAt(index), pointAt(next), actors)) continue;
        parents.set(next, index); queue.push(next);
      }
    }
    if (!queue.length) return [];
    const distanceTo = (index) => Math.hypot(pointAt(index).x - actor.x, (pointAt(index).y - actor.y) / aspectFor(world));
    const furthest = Math.max(...queue.map(distanceTo));
    if (furthest < actor.size * 0.5) return [];
    const destinations = queue.filter((index) => distanceTo(index) >= furthest * 0.9);
    let target = destinations[Math.floor(random() * destinations.length)];
    const path = [];
    while (target !== -1) { path.unshift(pointAt(target)); target = parents.get(target); }
    const simplified = [];
    let start = actor;
    while (path.length) {
      let end = path.length - 1;
      while (end > 0 && !clearSegment(world, actor, start, path[end], actors)) end--;
      const point = path[end]; simplified.push(point); start = point; path.splice(0, end + 1);
    }
    return simplified;
  }

  function syncVisible(world, layout, visible, random = Math.random) {
    const requested = new Set(visible);
    const present = new Set((layout.present || []).filter((index) => requested.has(index)));
    for (const actor of layout.placements) {
      if (!requested.has(actor.index) || present.has(actor.index)) continue;
      const obstacles = layout.placements.filter((other) => present.has(other.index)
        || !motionProfileFor(world, world.items.find((item) => item.index === other.index)).speed);
      let position = clearSegment(world, actor, actor, actor, obstacles) ? actor : null;
      const item = world.items.find((item) => item.index === actor.index);
      const zones = habitatFor(world, item).zones;
      for (let attempt = 0; !position && attempt < 400; attempt++) {
        const zone = zones[Math.floor(random() * zones.length)];
        const point = { x: zone[0] + actor.halfWidth + random() * (zone[2] - zone[0] - actor.halfWidth * 2),
          y: zone[1] + actor.halfHeight + random() * (zone[3] - zone[1] - actor.halfHeight * 2) };
        if (clearSegment(world, actor, point, point, obstacles)) position = point;
      }
      if (!position) continue;
      if (position !== actor) { actor.x = position.x; actor.y = position.y; actor.bounds = boundsAt(actor, actor); }
      if (layout.travel) delete layout.travel[actor.index];
      present.add(actor.index);
    }
    layout.present = [...present];
    return layout.present;
  }

  function stepMotion(world, layout, visible, seconds, random = Math.random) {
    const elapsed = Math.max(0, Math.min(0.1, seconds));
    if (!elapsed) return [];
    const active = new Set(syncVisible(world, layout, visible, random));
    const obstacles = layout.placements.filter((actor) => active.has(actor.index)
      || !motionProfileFor(world, world.items.find((item) => item.index === actor.index)).speed);
    const moved = [];
    layout.travel ||= {};
    let planned = false;
    for (const actor of layout.placements) {
      const item = world.items.find((item) => item.index === actor.index);
      const speed = motionProfileFor(world, item).speed;
      if (!active.has(actor.index) || !speed) continue;
      const travel = layout.travel[actor.index] ||= { path: [], wait: 1 + random() * 4 };
      if (travel.wait > 0) { travel.wait -= elapsed; continue; }
      if (!travel.path.length) {
        if (planned || Object.entries(layout.travel).filter(([index, entry]) => active.has(Number(index)) && entry.path.length).length >= 3) continue;
        travel.path = findRoute(world, actor, obstacles, random); planned = true;
        if (!travel.path.length) { travel.wait = 3 + random() * 4; continue; }
      }
      const target = travel.path[0];
      const distance = Math.hypot(target.x - actor.x, (target.y - actor.y) / layout.aspect);
      const stride = Math.min(distance, speed * elapsed * Math.min(1, 0.25 + distance / 0.015));
      const portion = distance ? stride / distance : 1;
      const next = { x: actor.x + (target.x - actor.x) * portion, y: actor.y + (target.y - actor.y) * portion };
      if (!clearSegment(world, actor, actor, next, obstacles)) {
        travel.path = []; travel.wait = 2 + random() * 3; continue;
      }
      actor.x = next.x; actor.y = next.y; actor.bounds = boundsAt(actor, actor); moved.push(actor);
      if (distance <= stride + 1e-8) travel.path.shift();
      if (!travel.path.length) travel.wait = 2 + random() * 5;
    }
    return moved;
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
    safari: [['sunshine', 1, [0.847, 0.1, 0.847, 0.1]], ['sunbeam', 3, [0.847, 0.1, 0.847, 0.1]]],
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
    return moods[world.atmosphere || world.id] || moods.safari;
  }

  const effectProfiles = {
    cloud: { rotation: 4, skew: 6, stretchX: 0.24, stretchY: 0.18, sway: 1.5, morph: 16 },
    ripple: { rotation: 4, skew: 4, stretchX: 0.25, stretchY: 0.14, sway: 1, morph: 3 },
    grass: { rotation: 7, skew: 3, stretchX: 0.18, stretchY: 0.22, sway: 5, morph: 0 },
    bubble: { rotation: 6, skew: 1, stretchX: 0.1, stretchY: 0.07, sway: 2, morph: 3 },
    ray: { rotation: 7, skew: 2, stretchX: 0.2, stretchY: 0.15, sway: 3, morph: 0 },
    star: { rotation: 0, skew: 0, stretchX: 0.18, stretchY: 0.18, sway: 0, morph: 0 },
    glint: { rotation: 0, skew: 0, stretchX: 0.2, stretchY: 0.2, sway: 0, morph: 0 },
    pollen: { rotation: 20, skew: 2, stretchX: 0.16, stretchY: 0.12, sway: 4, morph: 8 },
    leaf: { rotation: 35, skew: 8, stretchX: 0.2, stretchY: 0.25, sway: 14, morph: 15 },
    snow: { rotation: 0, skew: 0, stretchX: 0.2, stretchY: 0.15, sway: 0, morph: 3 },
    aurora: { rotation: 5, skew: 8, stretchX: 0.12, stretchY: 0.2, sway: 3, morph: 17 },
    sunshine: { rotation: 0, skew: 0, stretchX: 0.07, stretchY: 0.07, sway: 0, morph: 0 },
    sunbeam: { rotation: 4, skew: 2, stretchX: 0.18, stretchY: 0.14, sway: 2, morph: 0 },
    caustic: { rotation: 5, skew: 6, stretchX: 0.15, stretchY: 0.16, sway: 2, morph: 14 },
    nebula: { rotation: 14, skew: 8, stretchX: 0.2, stretchY: 0.2, sway: 3, morph: 18 },
    meteor: { rotation: 7, skew: 0, stretchX: 0.2, stretchY: 0.1, sway: 0, morph: 0 },
    rainbow: { rotation: 2, skew: 1, stretchX: 0.08, stretchY: 0.05, sway: 0.5, morph: 0 },
    firefly: { rotation: 0, skew: 0, stretchX: 0.18, stretchY: 0.15, sway: 0, morph: 0 },
    prism: { rotation: 8, skew: 6, stretchX: 0.15, stretchY: 0.12, sway: 2, morph: 10 },
    mist: { rotation: 3, skew: 5, stretchX: 0.22, stretchY: 0.18, sway: 1, morph: 18 },
    'sea-sparkle': { rotation: 25, skew: 2, stretchX: 0.18, stretchY: 0.12, sway: 1, morph: 0 },
    frost: { rotation: 35, skew: 2, stretchX: 0.12, stretchY: 0.12, sway: 1, morph: 0 },
    confetti: { rotation: 35, skew: 8, stretchX: 0.2, stretchY: 0.2, sway: 12, morph: 18 }
  };

  function effectVariationFor(kind, random = Math.random) {
    const profile = effectProfiles[kind] || effectProfiles.pollen;
    const signed = (limit) => (random() * 2 - 1) * limit;
    const radius = () => Array.from({ length: 4 }, () => (50 + signed(profile.morph)).toFixed(1) + '%').join(' ')
      + ' / ' + Array.from({ length: 4 }, () => (50 + signed(profile.morph)).toFixed(1) + '%').join(' ');
    const rotation = (kind === 'meteor' ? 25 : 0) + signed(profile.rotation);
    const driftX = 1.5 + random() * 2.5;
    const fallX = kind === 'meteor' ? 18 + random() * 10 : 2 + random() * 4;
    return {
      rotation, skew: signed(profile.skew), scaleX: 1 + signed(profile.stretchX), scaleY: 1 + signed(profile.stretchY),
      sway: profile.sway * (0.65 + random() * 0.35), driftX, driftY: 0.4 + random() * 1.2,
      fallX, fallY: kind === 'meteor' ? fallX * (1672 / 941) * Math.tan(rotation * Math.PI / 180) : 18 + random() * 12,
      radiusStart: radius(), radiusEnd: radius(), puffLeft: 23 + random() * 12, puffTop: 32 + random() * 16,
      opacity: 0.8 + random() * 0.2
    };
  }

  function createAmbiance(world, random = Math.random) {
    const layer = document.createElement('div');
    layer.className = 'ambient-layer';
    layer.setAttribute('aria-hidden', 'true');
    const environment = world.atmosphere || world.id;
    const effects = [...(ambiance[environment] || []), ...(atmosphere[environment] || [])];
    const colors = palettes[environment] || ['#fff2b0'];
    for (const [kind, count, zone] of effects) {
      for (let index = 0; index < count; index++) {
        const detail = document.createElement('span');
        detail.className = `ambient-detail ambient-${kind}`;
        const placement = kind === 'ripple' ? [zone[0] + 0.03, zone[1] + 0.025, zone[2] - 0.12, zone[3] - 0.05]
          : kind === 'sea-sparkle' ? [zone[0] + 0.01, zone[1] + 0.015, zone[2] - 0.01, zone[3] - 0.015] : zone;
        detail.style.left = (placement[0] + random() * (placement[2] - placement[0])) * 100 + '%';
        detail.style.top = (placement[1] + random() * (placement[3] - placement[1])) * 100 + '%';
        const duration = kind === 'meteor' ? 18 : ['star', 'glint', 'ripple', 'grass', 'sea-sparkle', 'frost'].includes(kind) ? 5 : 9;
        detail.style.setProperty('--ambient-duration', (duration + random() * 4) + 's');
        detail.style.setProperty('--ambient-delay', (-random() * 30) + 's');
        detail.style.setProperty('--atmosphere-color', colors[index % colors.length]);
        detail.style.setProperty('--beam-angle', ((index - (count - 1) / 2) * 18) + 'deg');
        const shape = effectVariationFor(kind, random);
        for (const key of ['rotation', 'skew', 'sway']) detail.style.setProperty('--effect-' + key, shape[key].toFixed(3) + 'deg');
        for (const key of ['scaleX', 'scaleY', 'opacity']) detail.style.setProperty('--effect-' + key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase()), shape[key].toFixed(3));
        for (const [key, unit] of [['driftX', 'cqw'], ['driftY', 'cqh'], ['fallX', 'cqw'], ['fallY', 'cqh']]) {
          detail.style.setProperty('--effect-' + key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase()), shape[key].toFixed(3) + unit);
        }
        detail.style.setProperty('--effect-radius-start', shape.radiusStart);
        detail.style.setProperty('--effect-radius-end', shape.radiusEnd);
        detail.style.setProperty('--cloud-puff-left', shape.puffLeft.toFixed(2) + '%');
        detail.style.setProperty('--cloud-puff-top', shape.puffTop.toFixed(2) + '%');
        layer.append(detail);
      }
    }
    return layer;
  }

  globalThis.RuheSafariScene = { withSpecialWorlds, artworkFor, motionFor, motionProfileFor, sizeProfileFor, perspectiveProfileFor, visualSizeFor, shuffleOrder, moodFor, effectVariationFor, habitatFor, overlaps, createLayout, findRoute, syncVisible, stepMotion, createAmbiance };
})();
