(() => {
  const ground = [0.08, 0.43, 0.92, 0.95];
  const sky = [0.08, 0.08, 0.92, 0.44];
  const pond = [0.59, 0.73, 0.94, 0.94];
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
    safari: [0.1, 0.093, 0.087, 0.093, 0.084, 0.08, 0.1, 0.086, 0.085, 0.092, 0.084, 0.081],
    unterwasser: [0.084, 0.093, 0.099, 0.08, 0.091, 0.085, 0.1, 0.088, 0.08, 0.079, 0.105, 0.073],
    weltraumstation: [0.11, 0.108, 0.105, 0.11, 0.086, 0.112, 0.086, 0.091, 0.097, 0.094, 0.105, 0.089],
    zaubergarten: [0.062, 0.064, 0.067, 0.081, 0.07, 0.078, 0.079, 0.079, 0.063, 0.064, 0.068, 0.07],
    zukunftsstadt: [0.095, 0.09, 0.098, 0.093, 0.096, 0.086, 0.098, 0.091, 0.1, 0.092, 0.082, 0.096],
    dinosaurier: [0.088, 0.089, 0.082, 0.08, 0.081, 0.08, 0.083, 0.08, 0.085, 0.082, 0.082, 0.063],
    forschungsinsel: [0.088, 0.086, 0.09, 0.078, 0.084, 0.082, 0.078, 0.086, 0.077, 0.096, 0.088, 0.069],
    sternenhimmel: [0.083, 0.084, 0.099, 0.11, 0.108, 0.11, 0.105, 0.089, 0.106, 0.098, 0.085, 0.094],
    murmelbahn: [0.1, 0.098, 0.11, 0.085, 0.101, 0.08, 0.095, 0.103, 0.101, 0.1, 0.109, 0.085],
    winterdorf: [0.095, 0.101, 0.092, 0.088, 0.079, 0.102, 0.087, 0.094, 0.084, 0.086, 0.08, 0.092],
    kunstwerk: [0.088, 0.095, 0.09, 0.092, 0.089, 0.095, 0.082, 0.081, 0.079, 0.091, 0.102, 0.081]
  };

  function sizeProfileFor(world, item) {
    return { base: baseSizes[world.id]?.[item.index] || 0.09,
      variation: world.id === 'forschungsinsel' && item.name === 'Forschungsboot' ? 0.08 : 0.1 };
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
    if (world.id === 'safari') return ['Nilpferd', 'Flamingo'].includes(name)
      ? { zones: [pond], blocked: [] } : { zones: [ground], blocked: [pond] };
    if (world.id === 'unterwasser') return { zones: [
      ['Einsiedlerkrebs', 'Seestern', 'Korallengruppe'].includes(name)
        ? [0.2, 0.77, 0.8, 0.97] : [0.2, 0.09, 0.8, 0.77]
    ], blocked: [] };
    if (world.id === 'weltraumstation') return { zones: [[0.12, 0.08, 0.94, 0.86]], blocked: [[0, 0.73, 0.23, 1]] };
    if (world.id === 'sternenhimmel') return { zones: [[0.07, 0.07, 0.93, 0.85]], blocked: [] };
    if (world.id === 'zaubergarten') return { zones: motionFor(world, item) === 'fluttering' ? [sky]
      : [[0.04, 0.58, 0.21, 0.92], [0.3, 0.58, 0.71, 0.92], [0.8, 0.58, 0.96, 0.92]], blocked: [] };
    if (world.id === 'zukunftsstadt') return { zones: [[0.09, 0.4, 0.91, 0.93]], blocked: [] };
    if (world.id === 'dinosaurier') return { zones: [[0.15, 0.51, 0.88, 0.95]], blocked: [] };
    if (world.id === 'forschungsinsel') return ['Forschungsboot', 'Messboje'].includes(name)
      ? { zones: [sea], blocked: [] } : { zones: [[0.12, 0.52, 0.9, 0.95]], blocked: [] };
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
      const sizing = sizeProfileFor(world, item);
      const sizeFactor = 1 + (random() * 2 - 1) * sizing.variation;
      return { item, habitat, area, priority: random(),
        baseSize: sizing.base, sizeFactor, size: sizing.base * sizeFactor };
    }).sort((first, second) => first.area - second.area || second.size - first.size || first.priority - second.priority);
    if (!items.length) return { aspect, placements: [] };
    for (let attemptLayout = 0; attemptLayout < 64; attemptLayout++) {
      const placements = [];
      for (const entry of items) {
        const { item, habitat } = entry;
        const size = entry.size * 1000;
        const motion = motionProfileFor(world, item);
        const halfWidth = size * (0.5 + motion.horizontal + 0.08) + 3;
        const halfHeight = size * (0.5 + motion.vertical + 0.08) + 3;
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
      if (placements.length === items.length) return { aspect, placements };
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
    const distanceTo = (index) => Math.hypot(pointAt(index).x - actor.x, (pointAt(index).y - actor.y) / (1672 / 941));
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
    const effects = [...(ambiance[world.id] || []), ...(atmosphere[world.id] || [])];
    const colors = palettes[world.id] || ['#fff2b0'];
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

  globalThis.RuheSafariScene = { motionFor, motionProfileFor, sizeProfileFor, shuffleOrder, moodFor, effectVariationFor, habitatFor, overlaps, createLayout, findRoute, syncVisible, stepMotion, createAmbiance };
})();
