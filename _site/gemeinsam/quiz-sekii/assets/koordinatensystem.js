/* One touch/keyboard coordinate editor for all Sek-II quiz worlds. */
(() => {
  const controllers = new WeakMap();
  const clamp = n => Math.max(-5, Math.min(5, n));
  const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
  const required = q => Number(q.requiredPoints ?? q.points?.length ?? 0);
  function readCoordinate(input) {
    const value = input.value.trim().replace(/−/g, '-');
    if (!/^[+-]?\d+$/.test(value)) return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= -5 && number <= 5 ? number : null;
  }
  function fromClient(svg, clientX, clientY) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX; point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    // Half a grid cell around the outer points is available for finger taps.
    if (local.x < 18 || local.x > 282 || local.y < 18 || local.y > 282) return null;
    return [clamp(Math.round((local.x - 150) / 24)), clamp(Math.round((150 - local.y) / 24))];
  }
  function mount(area, q, context) {
    area.innerHTML = `<div class="construct-wrap">
      <div class="construct-toolbar"><button type="button" class="secondary" id="gridZoom" aria-pressed="false" aria-controls="gridViewport">Raster vergrößern</button><span class="construct-count" id="constructCount"></span></div>
      <p class="construct-tip" id="constructInstructions">Tippe im Raster, um Koordinaten auszuwählen. „Punkt setzen“ übernimmt die Auswahl. Zum Scrollen streichen; Pfeiltasten wählen, Enter setzt einen Punkt.</p>
      <div class="construct-interaction"><div class="construct-confirm"><div class="construct-selection" id="constructSelection" role="status" aria-live="polite"></div><button type="button" class="primary construct-add" id="addPoint">Punkt setzen</button></div>
      <div class="construct-viewport" id="gridViewport"><div class="construct-canvas">
        <svg class="construct-svg" id="grid" viewBox="0 0 300 300" role="application" tabindex="0" aria-describedby="constructInstructions constructSelection" aria-label="Koordinatensystem von minus fünf bis fünf. Antippen wählt einen Rasterpunkt; mit Punkt setzen bestätigen."></svg>
        <div class="grid-labels" id="gridLabels" aria-hidden="true"></div>
      </div></div></div>
      <div class="construct-entry">
        <div class="coordinate-axis"><label for="coordX">x-Koordinate</label><div class="coordinate-stepper"><button type="button" class="secondary" data-step-axis="x" data-step="-1" aria-label="x um eins verringern">−</button><input id="coordX" type="text" inputmode="numeric" enterkeyhint="next" autocomplete="off" value="0" aria-describedby="coordinateRange"><button type="button" class="secondary" data-step-axis="x" data-step="1" aria-label="x um eins erhöhen">+</button></div></div>
        <div class="coordinate-axis"><label for="coordY">y-Koordinate</label><div class="coordinate-stepper"><button type="button" class="secondary" data-step-axis="y" data-step="-1" aria-label="y um eins verringern">−</button><input id="coordY" type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" value="0" aria-describedby="coordinateRange"><button type="button" class="secondary" data-step-axis="y" data-step="1" aria-label="y um eins erhöhen">+</button></div></div>
      </div>
      <p class="coordinate-range" id="coordinateRange">Ganze Zahlen von −5 bis 5. Plus und Minus funktionieren ohne Bildschirmtastatur.</p>
      <p class="construct-message" id="constructMessage" role="status" aria-live="polite"></p>
      <ol class="construct-point-list" id="constructPoints" aria-label="Gesetzte Punkte bearbeiten"></ol>
      <div class="construct-actions"><button type="button" class="secondary" id="undo">Letzten Punkt entfernen</button><button type="button" class="secondary" id="clearPoints">Alle Punkte entfernen</button></div>
      <div class="construct-measure" id="constructMeasure"></div>
      <p class="sr-only" id="constructAnnouncement" role="status" aria-live="polite" aria-atomic="true">Noch keine Punkte gesetzt.</p>
    </div>`;
    const get = selector => area.querySelector(selector);
    const c = {q, context, area, get, svg: get('#grid'), editing: null, reveal: false};
    controllers.set(c.svg, c);
    const state = context.state;
    const inputs = [get('#coordX'), get('#coordY')];
    const message = text => {get('#constructMessage').textContent = text;};
    const coordinates = () => inputs.map(readCoordinate);
    function select(point) {
      if (state.locked) return;
      state.cursor = {x: point[0], y: point[1]};
      inputs.forEach((input, i) => {input.value = String(point[i]); input.removeAttribute('aria-invalid');});
      message(''); render(c);
    }
    function commit() {
      if (state.locked) return;
      const point = coordinates();
      if (point.some(value => value === null)) {
        inputs.forEach((input, i) => input.setAttribute('aria-invalid', String(point[i] === null)));
        message('Gib für beide Koordinaten eine ganze Zahl von −5 bis 5 ein.');
        return;
      }
      if (state.points.some((p, i) => i !== c.editing && equal(p, point))) {
        message('Dieser Punkt ist schon gesetzt. Wähle andere Koordinaten oder bearbeite den vorhandenen Punkt.'); return;
      }
      if (c.editing !== null) state.points[c.editing] = point;
      else {
        if (state.points.length >= required(q)) return;
        state.points.push(point);
      }
      state.cursor = {x: point[0], y: point[1]};
      c.editing = null; message('');
      // Do not open the iPad keyboard after confirming a point with a finger.
      if (inputs.includes(document.activeElement)) document.activeElement.blur();
      render(c);
    }
    get('#addPoint').onclick = commit;
    inputs.forEach(input => input.addEventListener('input', () => {
      const point = coordinates();
      if (point.every(value => value !== null)) state.cursor = {x: point[0], y: point[1]};
      message(''); render(c);
    }));
    inputs[0].onkeydown = event => {if (event.key === 'Enter') {event.preventDefault(); inputs[1].focus();}};
    inputs[1].onkeydown = event => {if (event.key === 'Enter') {event.preventDefault(); commit();}};
    area.querySelectorAll('[data-step-axis]').forEach(button => {
      button.onclick = () => {
        if (state.locked) return;
        const axis = button.dataset.stepAxis, index = axis === 'x' ? 0 : 1;
        const point = coordinates().map((value, i) => value ?? (i === 0 ? state.cursor.x : state.cursor.y));
        point[index] = clamp(point[index] + Number(button.dataset.step));
        select(point);
      };
    });
    get('#undo').onclick = () => {
      if (state.locked) return;
      state.points.pop(); c.editing = null; message(''); render(c);
    };
    get('#clearPoints').onclick = () => {
      if (state.locked) return;
      state.points = []; c.editing = null; select([0, 0]);
    };
    get('#gridZoom').onclick = () => {
      const viewport = get('#gridViewport'), zoomed = viewport.classList.toggle('is-zoomed');
      get('#gridZoom').setAttribute('aria-pressed', String(zoomed));
      get('#gridZoom').textContent = zoomed ? 'Raster einpassen' : 'Raster vergrößern';
      requestAnimationFrame(() => {
        if (!zoomed) {viewport.scrollLeft = 0; viewport.scrollTop = 0; return;}
        const matrix = c.svg.getScreenCTM();
        if (!matrix) return;
        const p = c.svg.createSVGPoint(); p.x = 150 + state.cursor.x * 24; p.y = 150 - state.cursor.y * 24;
        const screen = p.matrixTransform(matrix), rect = viewport.getBoundingClientRect();
        viewport.scrollLeft += screen.x - rect.left - viewport.clientWidth / 2;
        viewport.scrollTop += screen.y - rect.top - viewport.clientHeight / 2;
      });
    };
    c.edit = index => {
      if (state.locked) return;
      c.editing = index; select(state.points[index]);
    };
    let gesture = null;
    const activePointers = new Set();
    c.svg.addEventListener('pointerdown', event => {
      activePointers.add(event.pointerId);
      if (state.locked || event.button !== 0 || activePointers.size !== 1 || event.isPrimary === false) {gesture = null; return;}
      const viewport = get('#gridViewport');
      gesture = {id: event.pointerId, x: event.clientX, y: event.clientY,
        pageX: window.scrollX, pageY: window.scrollY, left: viewport.scrollLeft, top: viewport.scrollTop};
    });
    c.svg.addEventListener('pointermove', event => {
      if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10) gesture = null;
    });
    c.svg.addEventListener('pointerup', event => {
      const tap = gesture; gesture = null; activePointers.delete(event.pointerId);
      if (!tap || tap.id !== event.pointerId || activePointers.size || state.locked) return;
      const viewport = get('#gridViewport');
      if (Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 10 ||
          window.scrollX !== tap.pageX || window.scrollY !== tap.pageY ||
          viewport.scrollLeft !== tap.left || viewport.scrollTop !== tap.top) return;
      const point = fromClient(c.svg, event.clientX, event.clientY);
      if (point) select(point);
    });
    const cancel = () => {gesture = null; activePointers.clear();};
    c.svg.addEventListener('pointercancel', cancel);
    c.svg.addEventListener('pointerleave', cancel);
    if (!globalThis.PointerEvent) c.svg.onclick = event => {
      const point = fromClient(c.svg, event.clientX, event.clientY);
      if (point) select(point);
    };
    c.svg.onkeydown = event => {
      if (state.locked) return;
      const delta = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1]}[event.key];
      if (delta) {event.preventDefault(); select([clamp(state.cursor.x + delta[0]), clamp(state.cursor.y + delta[1])]);}
      else if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); commit();}
    };
    render(c);
  }
  function render(c) {
    const {q, context, get, svg} = c, {state, renderMath, math} = context;
    const needed = required(q), sequence = [...(q.fixed || []), ...state.points];
    get('#constructCount').textContent = `${state.points.length} von ${needed} Punkten gesetzt`;
    const selection = `${c.editing === null ? 'Auswahl' : 'Punkt ' + (c.editing + 1) + ' bearbeiten'}: x ${state.cursor.x}, y ${state.cursor.y}.`;
    if (get('#constructSelection').textContent !== selection) get('#constructSelection').textContent = selection;
    let out = '';
    for (let i = -5; i <= 5; i++) {
      const p = 150 + i * 24;
      out += `<line class="gridline" x1="${p}" y1="30" x2="${p}" y2="270"/><line class="gridline" x1="30" y1="${p}" x2="270" y2="${p}"/>`;
    }
    out += '<line class="axis" x1="30" y1="150" x2="270" y2="150"/><line class="axis" x1="150" y1="30" x2="150" y2="270"/>';
    if (q.connectPoints !== false && sequence.length > 1) {
      const xy = sequence.map(([x, y]) => `${150 + x * 24},${150 - y * 24}`);
      if (q.closeShape && state.points.length === needed) xy.push(xy[0]);
      out += `<polyline class="construct-shape${c.reveal ? ' evaluated-' + (state.feedbackStatus?.replace('feedback-', '') || 'incorrect') : ''}" points="${xy.join(' ')}"/>`;
    }
    for (const [x, y] of q.fixed || []) out += `<circle class="anchor" cx="${150 + x * 24}" cy="${150 - y * 24}" r="7"/>`;
    const targets = Array.isArray(q.points) ? q.points : [], remaining = [...targets];
    const matches = state.points.map(point => {
      const index = remaining.findIndex(target => Math.hypot(target[0] - point[0], target[1] - point[1]) <= 0.35);
      if (index < 0) return false;
      remaining.splice(index, 1); return true;
    });
    if (c.reveal) for (const [x, y] of targets) out += `<circle class="construct-target" cx="${150 + x * 24}" cy="${150 - y * 24}" r="10"/>`;
    state.points.forEach(([x, y], i) => {
      const cls = c.reveal && targets.length ? matches[i] ? ' is-correct' : ' is-incorrect' : '';
      out += `<circle class="placed${cls}" cx="${150 + x * 24}" cy="${150 - y * 24}" r="8"/><text class="placed-label" x="${159 + x * 24}" y="${140 - y * 24}">P${i + 1}</text>`;
    });
    if (!state.locked && (c.editing !== null || !state.points.some(point => equal(point, [state.cursor.x, state.cursor.y]))))
      out += `<circle class="cursor" cx="${150 + state.cursor.x * 24}" cy="${150 - state.cursor.y * 24}" r="10"/>`;
    svg.innerHTML = out;
    const labels = get('#gridLabels'); labels.replaceChildren();
    for (let i = -5; i <= 5; i++) if (i !== 0) {
      const x = document.createElement('span'); x.dataset.math = String(i); x.style.left = ((150 + i * 24) / 3) + '%'; x.style.top = '56%'; labels.append(x);
      const y = document.createElement('span'); y.dataset.math = String(i); y.style.left = '46.7%'; y.style.top = ((154 - i * 24) / 3) + '%'; labels.append(y);
    }
    for (const axis of ['x', 'y']) {const label = document.createElement('span'); label.dataset.math = axis; label.className = 'axis-label axis-' + axis; labels.append(label);}
    renderMath(labels);
    const list = get('#constructPoints'); list.replaceChildren();
    state.points.forEach(([x, y], i) => {
      const row = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.className = 'construct-point secondary'; button.dataset.editPoint = String(i);
      button.textContent = `Punkt ${i + 1}: (${x}|${y}) bearbeiten`;
      button.setAttribute('aria-pressed', String(c.editing === i)); button.disabled = state.locked;
      button.onclick = event => {c.edit(i); if (event.detail === 0) svg.focus({preventScroll: true});};
      row.append(button); list.append(row);
    });
    const coords = [readCoordinate(get('#coordX')), readCoordinate(get('#coordY'))];
    const duplicate = coords.every(value => value !== null) && state.points.some((point, i) => i !== c.editing && equal(point, coords));
    const add = get('#addPoint'); add.textContent = c.editing === null ? 'Punkt setzen' : 'Änderung übernehmen';
    add.disabled = state.locked || coords.some(value => value === null) || duplicate || (c.editing === null && state.points.length >= needed);
    get('#undo').disabled = state.locked || state.points.length === 0;
    get('#clearPoints').disabled = state.locked || state.points.length === 0;
    for (const input of [get('#coordX'), get('#coordY')]) input.disabled = state.locked;
    c.area.querySelectorAll('[data-step-axis]').forEach(button => {
      const index = button.dataset.stepAxis === 'x' ? 0 : 1, value = coords[index] ?? 0;
      button.disabled = state.locked || value + Number(button.dataset.step) < -5 || value + Number(button.dataset.step) > 5;
    });
    get('#gridZoom').disabled = false; // Changing only the view remains possible after scoring.
    const announcement = get('#constructAnnouncement'), signature = JSON.stringify(state.points);
    if (announcement.dataset.signature !== signature) {
      announcement.dataset.signature = signature;
      announcement.textContent = state.points.length ? 'Gesetzte Punkte: ' + state.points.map(([x, y], i) => `Punkt ${i + 1} bei x ${x} und y ${y}`).join('; ') : 'Noch keine Punkte gesetzt.';
    }
    const measure = get('#constructMeasure');
    if (sequence.length > 1) {
      const [a, b] = sequence.slice(-2);
      measure.innerHTML = 'Abstand der letzten zwei Punkte: ' + math(Math.hypot(b[0] - a[0], b[1] - a[1]), 2) + ' Kästchen'; renderMath(measure);
    } else measure.textContent = 'Abstand erscheint nach dem Setzen von zwei Punkten.';
  }
  function draw(q, context) {
    const svg = document.getElementById('grid'), c = svg && controllers.get(svg);
    if (!c) return;
    c.q = q; c.context = context; c.reveal = Boolean(context.revealFeedback);
    render(c);
  }
  globalThis.MatheSekIIKoordinaten = Object.freeze({mount, draw});
})();
