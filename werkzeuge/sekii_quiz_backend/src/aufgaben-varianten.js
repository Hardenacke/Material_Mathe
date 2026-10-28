/* Shared by offline training and the server. Actual competition values stay in the round. */
(() => {
  const pick = (items, r) => items[r(0, items.length - 1)];
  const signed = n => n < 0 ? String(n) : '+' + n;
  const tex = n => String(n).replace('.', '{,}');
  const point = values => '(' + values.join('|') + ')';
  const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
  const norm = a => Math.sqrt(dot(a, a));
  const number = (prompt, answer, solution, family, seconds = 120, tol = 0.001, unit = '') =>
    ({kind: 'number', prompt, answer, solution, family, timeLimitSeconds: seconds, tol, unit});
  const slider = (prompt, min, max, answer, solution, family, seconds = 120, step = 0.01, tol = 0.02) =>
    ({kind: 'slider', prompt, min, max, answer, solution, family, timeLimitSeconds: seconds, step, tol});
  const construct = (prompt, points, solution, family, seconds = 120, connectPoints = false) =>
    ({kind: 'construct', prompt, fixed: [], points, solution, family, timeLimitSeconds: seconds,
      pointLabel: family === 'extrema' ? 'Extrempunkte' : 'Projektionspunkte', connectPoints});
  function binomial(n, p, k) {
    let c = 1;
    for (let j = 1; j <= k; j++) c = c * (n - j + 1) / j;
    return c * p ** k * (1 - p) ** (n - k);
  }
  function makeVariant(quizId, slot, options = {}) {
    const parsed = /^(ef|q1|q2)-(analysis|geometrie|stochastik)(?:-(gk|lk))?$/.exec(quizId);
    if (!parsed) return null;
    const [, phase, field, course] = parsed, lk = course === 'lk';
    const random = options.random || Math.random;
    const r = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
    const easy = options.level === 'einstieg', hard = options.level === 'challenge';
    const size = easy ? 3 : hard ? 7 : 5;
    if (field === 'analysis') {
      if (phase === 'q1' && lk && (slot === 0 || slot === 2)) {
        const power = slot === 0 ? r(2, easy ? 3 : 5) : r(1, easy ? 2 : 4);
        const a = r(1, size + 1), scale = r(1, size), h = r(-2, 3), x = h + power / a;
        const y = '(x' + signed(-h) + ')';
        const prompt = `Für \\(f(x)=${scale}${y}^{${power}}e^{-${a}${y}}\\), \\(x>${h}\\): Bestimme die Stelle des lokalen Maximums.`;
        const solution = `Mit \\(u=x${signed(-h)}\\) gilt \\(f'(x)=${scale}e^{-${a}u}u^{${power - 1}}(${power}-${a}u)\\). Für \\(x>${h}\\) wechselt die Ableitung bei \\(x=${h}+${power}/${a}\\) von positiv zu negativ; dort liegt das Maximum.`;
        return slot === 0 ? number(prompt, x, solution, 'extrema', 300, 0.01) :
          slider(prompt, h, h + power + 1, x, solution, 'extrema', 300);
      }
      if (phase === 'q1' && lk && slot === 4) {
        const a = r(1, 2), h = r(-2, 2), k = r(-1, 1), u = '(x' + signed(-h) + ')';
        const points = [[h - 1, k + 2 * a], [h + 1, k - 2 * a]];
        return construct(`Bestimme die beiden Extrempunkte von \\(f(x)=${a}(${u}^3-3${u})${signed(k)}\\) und markiere sie im Raster.`, points,
          `\\(f'(x)=${3 * a}(${u}^2-1)\\) hat die Nullstellen \\(x=${h - 1}\\) und \\(x=${h + 1}\\). Der Vorzeichenwechsel liefert den Hochpunkt \\(${point(points[0])}\\) und den Tiefpunkt \\(${point(points[1])}\\).`, 'extrema', 300);
      }
      if (phase === 'ef' && slot === 0) {
        const a = r(1, size), b = r(-size, size), c = r(-size, size), d = r(-size, size), x = r(-2, size);
        const answer = easy ? 2 * a * x + b : 3 * a * x * x + 2 * b * x + c;
        const term = easy ? `${a}x^2${signed(b)}x${signed(c)}` : `${a}x^3${signed(b)}x^2${signed(c)}x${signed(d)}`;
        const derivative = easy ? `${2 * a}x${signed(b)}` : `${3 * a}x^2${signed(2 * b)}x${signed(c)}`;
        return number(`Für \\(f(x)=${term}\\): Bestimme \\(f'(${x})\\).`, answer,
          `\\(f'(x)=${derivative}\\). Einsetzen von \\(x=${x}\\) ergibt \\(${answer}\\).`, 'derivative');
      }
      if (phase === 'ef' && slot === 2) {
        const a = r(1, size), b = r(-size, size), c = r(-size, size), x = r(-2, size), answer = 2 * a * x + b;
        return slider(`Für \\(f(x)=${a}x^2${signed(b)}x${signed(c)}\\): Bestimme die Tangentensteigung bei \\(x=${x}\\).`,
          Math.floor(answer - 10), Math.ceil(answer + 10), answer,
          `Die Ableitung lautet \\(f'(x)=${2 * a}x${signed(b)}\\). Also ist die Steigung \\(${answer}\\).`, 'slope', 120, 0.1, 0.1);
      }
      if ((phase === 'ef' || phase === 'q1') && slot === 4) {
        const a = r(1, 4), b = r(1, 4), scale = r(1, size);
        return construct(`Markiere die Nullstellen von \\(f(x)=${scale}(x-${a})(x+${b})\\) auf dem Koordinatenraster.`,
          [[a, 0], [-b, 0]], `Der erste Faktor ist bei \\(x=${a}\\), der zweite bei \\(x=-${b}\\) null. Der Faktor \\(${scale}\\) verändert die Nullstellen nicht.`, 'roots', 120);
      }
      if (phase === 'q1' && slot === 0) {
        const a = r(1, size), b = r(1, size), c = r(1, size + 2), x = r(-2, size);
        const answer = 2 * a * x * (x + b) + a * x * x + c;
        return number(`Für \\(f(x)=(${a}x^2+${c})(x+${b})\\): Bestimme \\(f'(${x})\\).`, answer,
          `Produktregel: \\(f'(x)=${2 * a}x(x+${b})+(${a}x^2+${c})\\). Einsetzen liefert \\(${answer}\\).`, 'product-rule', 180);
      }
      if (phase === 'q1' && slot === 2) {
        const halfPerimeter = r(8, hard ? 32 : 24), answer = halfPerimeter / 2;
        return slider(`Ein Rechteck hat den festen Umfang \\(${2 * halfPerimeter}\\) m. Welche Seitenlänge maximiert \\(A(x)=x(${halfPerimeter}-x)\\) für \\(0<x<${halfPerimeter}\\)?`,
          0, halfPerimeter, answer, `\\(A'(x)=${halfPerimeter}-2x=0\\) ergibt \\(x=${tex(answer)}\\). Weil \\(A''(x)=-2<0\\), ist dies das Maximum.`, 'optimization', 300, 0.1, 0.1);
      }
      if (phase === 'q2' && slot === 0 && lk) {
        const radius = r(1, size), from = r(0, 4), length = r(2, 8), coefficient = radius * radius * length;
        return number(`Ein Rotationskörper entsteht durch Rotation von \\(f(x)=${radius}\\) auf \\([${from},${from + length}]\\) um die x-Achse. Berechne sein Volumen auf zwei Dezimalstellen.`,
          Math.PI * coefficient, `\\(V=\\pi\\int_{${from}}^{${from + length}}${radius * radius}\\,dx=${coefficient}\\pi\\approx${tex((Math.PI * coefficient).toFixed(2))}\\).`, 'rotation-volume', 240, 0.02, 'm³');
      }
      if (phase === 'q2' && slot === 0) {
        const a = r(2, size + 1), scale = r(1, 3), h = r(-3, 3), u = '(x' + signed(-h) + ')', answer = scale * a ** 4 / 4;
        return number(`Berechne die Fläche zwischen \\(f(x)=${scale}(${u}^3-${a * a}${u})\\) und der x-Achse im Intervall \\([${h - a},${h}]\\).`, answer,
          `Mit \\(u=x${signed(-h)}\\) gilt \\(A=${scale}\\int_{-${a}}^0(u^3-${a * a}u)\\,du=${answer}\\). Der Graph liegt auf diesem Intervall oberhalb der x-Achse.`, 'area', 240);
      }
      if (phase === 'q2' && slot === 2) {
        const a = r(1, size), b = r(1, size + 2), t = r(2, 8);
        if (lk) return number(`Die Zuflussrate beträgt \\(r(t)=${a}t+${b}\\) Liter pro Minute. Wie viele Liter fließen in den ersten \\(${t}\\) Minuten zu?`,
          a * t * t / 2 + b * t, `\\(\\int_0^{${t}}(${a}t+${b})\\,dt=[${a}t^2/2+${b}t]_0^{${t}}=${tex(a * t * t / 2 + b * t)}\\) Liter.`, 'integral-rate', 240);
        const answer = a * t;
        return slider(`Eine Größe wächst konstant mit \\(${a}\\) Einheiten pro Stunde. Wie stark verändert sie sich in \\(${t}\\) Stunden?`,
          0, Math.ceil((answer + 10) / 10) * 10, answer, `Die gesamte Änderung beträgt \\(${a}\\cdot${t}=${answer}\\) Einheiten.`, 'constant-rate', 120, 0.1, 0.1);
      }
      if (phase === 'q2' && lk && slot === 4) {
        const a = r(1, size), t = r(2, 7), answer = a * t * t / 2;
        return {kind: 'match', family: 'integral-match', timeLimitSeconds: 180,
          prompt: 'Ordne jede Situation der passenden Integraldarstellung zu.', pairs: [
            {left: `Zuflussrate \\(f(t)=${a}t\\) von 0 bis ${t} Minuten`, options: [
              `\\(\\int_0^{${t}}${a}t\\,dt=${tex(answer)}\\) Liter`, `\\(${tex(answer + a * t + 1)}\\) Liter`], correct: 0},
            {left: 'Rotationskörper mit Radiusfunktion \\(f(x)\\)', options: ['\\(V=\\pi\\int_a^b f(x)^2\\,dx\\)', '\\(V=\\int_a^b f(x)\\,dx\\)'], correct: 0}],
          solution: `Integriere die Rate: \\(\\int_0^{${t}}${a}t\\,dt=${tex(answer)}\\). Für das Rotationsvolumen integrierst du die Querschnittsfläche \\(\\pi f(x)^2\\).`};
      }
    }
    if (field === 'geometrie') {
      if (phase === 'ef' && slot === 0) {
        const u = Array.from({length: 3}, () => r(easy ? 0 : -size, size));
        const v = Array.from({length: 3}, () => r(easy ? 0 : -size, size));
        return {kind: 'vector', family: 'vector-sum', timeLimitSeconds: 120, tol: 0.001,
          prompt: `Bilde \\(\\vec u+\\vec v\\) mit \\(\\vec u=${point(u)}\\), \\(\\vec v=${point(v)}\\).`,
          answer: u.map((x, i) => x + v[i]), solution: 'Addiere jeweils die x-, y- und z-Komponenten.'};
      }
      if (phase === 'ef' && slot === 2) {
        const p = [r(-3, 3), r(-3, 3), r(-3, 3)], d = [r(1, 3), r(1, 3), r(-2, 2)], t = r(-2, 5);
        const target = p.map((x, i) => x + t * d[i]);
        return slider(`Auf \\(g:\\vec x=${point(p)}+t${point(d)}\\) liegt \\(P=${point(target)}\\). Bestimme t.`, -3, 6, t,
          `Aus der x-Koordinate folgt \\(${p[0]}+${d[0]}t=${target[0]}\\), also \\(t=${t}\\). Prüfe auch die anderen Koordinaten.`, 'line-parameter', 120, 0.1, 0.1);
      }
      if (phase === 'q1' && !lk && slot === 0) {
        const u = Array.from({length: 3}, () => r(-size, size)), v = Array.from({length: 3}, () => r(-size, size));
        return number(`Berechne das Skalarprodukt von \\(\\vec u=${point(u)}\\) und \\(\\vec v=${point(v)}\\).`, dot(u, v),
          `Multipliziere die jeweiligen Komponenten und addiere die Produkte: \\(\\vec u\\cdot\\vec v=${dot(u, v)}\\).`, 'dot-product', 180);
      }
      if ((phase === 'q1' && lk && slot === 0) || (phase === 'q2' && slot === 2)) {
        const a = r(1, size + 1), b = r(1, size + 1), c = lk ? r(1, size) : 0, length = Math.hypot(a, b, c);
        if (phase === 'q2' && lk) {
          const angle = Math.asin(c / length) * 180 / Math.PI;
          return slider(`Eine Gerade mit \\(\\vec v=${point([a, b, c])}\\) trifft eine Ebene mit \\(\\vec n=(0|0|1)\\). Bestimme den Winkel zwischen Gerade und Ebene auf eine Nachkommastelle.`, 0, 90, angle,
            `\\(\\sin\\alpha=${c}/\\sqrt{${a * a + b * b + c * c}}\\). Damit ist \\(\\alpha\\approx${tex(angle.toFixed(1))}^\\circ\\).`, 'line-plane-angle', 240, 0.1, 0.11);
        }
        const angle = Math.acos(a / length) * 180 / Math.PI;
        return slider(`Bestimme den Winkel zwischen \\(\\vec u=(1|0|0)\\) und \\(\\vec v=${point([a, b, c])}\\) auf eine Nachkommastelle.`, 0, 180, angle,
          `\\(\\cos\\alpha=${a}/\\sqrt{${a * a + b * b + c * c}}\\), also \\(\\alpha\\approx${tex(angle.toFixed(1))}^\\circ\\).`, 'vector-angle', 240, 0.1, 0.11);
      }
      if (phase === 'q1' && slot === 2) {
        const p = [r(-2, 3), r(-2, 3), r(-2, 3)], d = [r(1, 3), r(1, 3), r(0, 2)];
        const n = [r(1, lk ? 4 : 2), r(1, lk ? 4 : 2), r(1, lk ? 4 : 2)], t = r(1, 5), rhs = dot(n, p) + t * dot(n, d);
        return slider(`Die Gerade \\(\\vec x=${point(p)}+t${point(d)}\\) trifft die Ebene \\(${n[0]}x+${n[1]}y+${n[2]}z=${rhs}\\). Bestimme den Schnittparameter t.`, 0, 6, t,
          `Einsetzen liefert \\(${dot(n, p)}+${dot(n, d)}t=${rhs}\\), also \\(t=${t}\\).`, 'line-plane-intersection', lk ? 240 : 180, 0.1, 0.1);
      }
      if (phase === 'q2' && slot === 0 && lk) {
        const p = Array.from({length: 3}, () => r(-4, 4)), n = Array.from({length: 3}, () => r(1, 4));
        const distanceNumerator = r(2, 14), rhs = dot(n, p) + distanceNumerator, answer = distanceNumerator / norm(n);
        return number(`Berechne den Abstand von \\(P=${point(p)}\\) zur Ebene \\(${n[0]}x+${n[1]}y+${n[2]}z=${rhs}\\). Runde auf zwei Dezimalstellen.`, answer,
          `Mit der Hesseschen Formel gilt \\(d(P,E)=|${dot(n, p)}-(${rhs})|/\\sqrt{${dot(n, n)}}\\approx${tex(answer.toFixed(2))}\\).`, 'point-plane-distance', 240, 0.01);
      }
      if (phase === 'q2' && slot === 0) {
        const [d, h, height] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]], r), L = r(10, 22), s = r(1, 4), area = (L - s) * height;
        return number(`Eine Dachfläche hat die Eckpunkte \\(A=(0|0|0)\\), \\(B=(0|${L}|0)\\), \\(C=(${d}|${L - s}|${h})\\), \\(D=(${d}|${s}|${h})\\). Berechne ihren Flächeninhalt.`, area,
          `Die parallelen Seiten sind \\(${L}\\) und \\(${L - 2 * s}\\) lang; die Höhe beträgt \\(\\sqrt{${d}^2+${h}^2}=${height}\\). Somit ist \\(A=(${L}-${s})\\cdot${height}=${area}\\).`, 'roof-area', 240, 0.001, 'm²');
      }
      if ((phase === 'ef' || phase === 'q1') && slot === 4) {
        const x = r(-3, 3), y = r(-3, 3), z = r(-3, 3);
        if (phase === 'q1' && lk) {
          const dx = r(1, 2), dy = r(1, 2);
          return construct(`Konstruiere die x-y-Projektion der Geraden \\(\\vec x=${point([x, y, z])}+t${point([dx, dy, r(-2, 2)])}\\) für \\(t=0\\) und \\(t=1\\). Verbinde die Punkte.`,
            [[x, y], [x + dx, y + dy]], `Die Projektionspunkte sind \\(${point([x, y])}\\) und \\(${point([x + dx, y + dy])}\\).`, 'line-projection', 180, true);
        }
        return construct(`Markiere die x-y-Projektion von \\(P=${point([x, y, z])}\\).`, [[x, y]],
          `Die ersten beiden Koordinaten ergeben den Projektionspunkt \\(${point([x, y])}\\).`, 'projection', 120);
      }
    }
    if (field === 'stochastik') {
      if (phase === 'ef' && slot === 0) {
        const start = r(-3, 4), step = r(1, size), weights = [r(1, 4), r(1, 4), r(1, 4)], total = weights.reduce((a, b) => a + b);
        const values = [start, start + step, start + 2 * step], numerator = dot(values, weights);
        return number(`Eine Zufallsgröße nimmt \\(${values.join(';')}\\) mit den Wahrscheinlichkeiten \\(${weights.map(w => w + '/' + total).join(';')}\\) an. Bestimme \\(E(X)\\). Runde bei Bedarf auf drei Dezimalstellen.`,
          numerator / total, `Multipliziere die Werte mit ihren Wahrscheinlichkeiten und addiere: \\(E(X)=${numerator}/${total}\\).`, 'expectation', 180);
      }
      if (phase === 'ef' && slot === 2) {
        const total = r(6, 24), hits = r(1, total - 1);
        const prompt = `Von \\(${total}\\) Personen mit B haben \\(${hits}\\) auch A. Bestimme \\(P(A|B)\\).`;
        if (options.extension) return {kind: 'fraction', family: 'conditional-probability', timeLimitSeconds: 120,
          prompt, answer: {num: hits, den: total}, solution: `Die Teilgruppe B ist die Bezugsmenge: \\(P(A|B)=${hits}/${total}\\).`};
        return slider(prompt, 0, 1, hits / total, `\\(P(A|B)=${hits}/${total}\\).`, 'conditional-probability', 120, 0.01, 0.02);
      }
      if ((phase === 'q1' || phase === 'q2' && !lk) && (slot === 0 || slot === 2)) {
        const n = r(8, phase === 'q2' ? 40 : hard ? 24 : 18), p = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6], r);
        const distribution = `X\\sim B(${n};${tex(p)})`;
        if (slot === 2) {
          const variance = phase === 'q1' && lk, answer = variance ? n * p * (1 - p) : n * p;
          return slider(`Für \\(${distribution}\\): Bestimme ${variance ? 'die Varianz' : 'den Erwartungswert'}.`,
            0, Math.ceil(variance ? answer * 2 : n), answer,
            variance ? `\\(Var(X)=np(1-p)=${tex(answer)}\\).` : `\\(E(X)=np=${tex(answer)}\\).`, variance ? 'variance' : 'binomial-expectation', 120, 0.01, 0.02);
        }
        const k = r(1, Math.min(5, n - 1)), cumulative = phase === 'q2' || lk;
        const answer = cumulative ? Array.from({length: k + 1}, (_, i) => binomial(n, p, i)).reduce((a, b) => a + b) : binomial(n, p, k);
        return number(`Für \\(${distribution}\\): Bestimme \\(P(X${cumulative ? '\\leq' : '='}${k})\\). Runde auf drei Dezimalstellen.`, answer,
          cumulative ? `Addiere die Binomialwahrscheinlichkeiten für \\(0\\) bis \\(${k}\\) Treffer: \\(P(X\\leq${k})\\approx${tex(answer.toFixed(3))}\\).` :
            `\\(P(X=${k})=\\binom{${n}}{${k}}${tex(p)}^{${k}}(1-${tex(p)})^{${n - k}}\\approx${tex(answer.toFixed(3))}\\).`, cumulative ? 'binomial-cumulative' : 'binomial-probability', 240, 0.001);
      }
      if (phase === 'q2' && lk && slot === 0) {
        const n = pick([80, 100, 120, 150, 200, 250], r), hits = r(Math.ceil(n * 0.15), Math.floor(n * 0.65)), p = hits / n;
        const answer = 100 * (p - 1.96 * Math.sqrt(p * (1 - p) / n));
        return number(`Bei \\(${n}\\) Geräten sind \\(${hits}\\) fehlerhaft. Berechne die untere Grenze des näherungsweisen 95%-Konfidenzintervalls mit \\(\\hat p\\pm1{,}96\\sqrt{\\hat p(1-\\hat p)/n}\\) in Prozent, auf eine Nachkommastelle.`, answer,
          `Setze \\(\\hat p=${hits}/${n}\\) ein. Die untere Grenze beträgt näherungsweise \\(${tex(answer.toFixed(1))}\\,\\%\\).`, 'confidence-interval', 240, 0.06, '%');
      }
      if (phase === 'q2' && lk && slot === 2) {
        const mu = r(20, 100), sigma = r(2, 12), answer = mu + 2 * sigma;
        return slider(`Markiere die obere Grenze des 2σ-Bereichs für \\(X\\sim\\mathcal N(\\mu=${mu};\\sigma=${sigma})\\).`,
          mu - 3 * sigma, mu + 3 * sigma, answer, `Die obere Grenze ist \\(\\mu+2\\sigma=${answer}\\).`, 'normal-interval', 120, 0.1, 0.1);
      }
      if (phase === 'q2' && lk && slot === 4 && options.extension) {
        const error = pick([0.04, 0.05, 0.08, 0.1, 0.12, 0.15], r), answer = Math.ceil(1 / error ** 2 - 1e-9);
        return number(`Für ein näherungsweises 95%-Konfidenzintervall soll die halbe Intervalllänge höchstens \\(${tex(error)}\\) sein. Nutze konservativ \\(p=0{,}5\\) und den Faktor 2. Wie groß muss n mindestens sein?`,
          answer, `\\(2\\sqrt{0{,}25/n}\\leq${tex(error)}\\) ergibt \\(n\\geq1/${tex(error)}^2\\). Aufrunden liefert \\(n=${answer}\\).`, 'sample-size', 240, 0);
      }
    }
    return null;
  }
  function timeForTask(task) {
    if (Number.isFinite(task.timeLimitSeconds)) return task.timeLimitSeconds;
    return task.kind === 'choice' ? 60 : ['order', 'match'].includes(task.kind) ? 90 : 120;
  }
  const advice = (mode, text) => ({mode, title: {
    recommended: 'CAS sinnvoll', check: 'CAS zur Kontrolle', 'not-needed': 'CAS nicht nötig',
  }[mode], text});
  function casGuidance(task) {
    switch (task.family) {
      case 'extrema':
        return task.kind === 'construct' ? advice('check',
          'Bilde zuerst selbst die Ableitung und bestimme die kritischen Stellen. Prüfe mit dem CAS Ableitung, Funktionswerte und Graph. Begründe selbst, ob ein Hoch- oder Tiefpunkt vorliegt, und markiere die Punkte im Quiz.') : advice('recommended',
          'Formuliere zuerst die Bedingung f′(x) = 0. Nutze den CAS zum Ableiten und Lösen der Gleichung. Berücksichtige den angegebenen Definitionsbereich und prüfe durch Vorzeichenwechsel oder zweite Ableitung, ob wirklich ein Maximum vorliegt.');
      case 'optimization':
        return advice('check', 'Stelle Zielfunktion und zulässigen Bereich selbst auf. Berechne die kritische Stelle zunächst selbst; prüfe Ableitung und Graph mit dem CAS. Begründe das Maximum und deute das Ergebnis im Kontext.');
      case 'product-rule':
        return advice('check', 'Wende die Produktregel zunächst selbst an. Vergleiche deine Ableitungsfunktion mit dem CAS und prüfe anschließend den gefragten Ableitungswert.');
      case 'area':
        return advice('recommended', 'Bestimme zuerst Intervallgrenzen und Vorzeichen des Graphen. Berechne das passende bestimmte Integral mit dem CAS. Unterscheide Integralwert und Flächeninhalt; bei einem Vorzeichenwechsel musst du Teilflächen getrennt behandeln.');
      case 'rotation-volume':
        return advice('recommended', 'Stelle zuerst das Integral über die Querschnittsfläche π·f(x)² mit den richtigen Grenzen auf. Lass den CAS das Integral auswerten. Runde erst am Ende und prüfe die Volumeneinheit.');
      case 'integral-rate':
        return advice('recommended', 'Lege zuerst Rate und Zeitintervall fest. Werte das bestimmte Integral mit dem CAS aus. Deute das Ergebnis als zugeflossene Menge und kontrolliere die Einheit.');
      case 'integral-match':
        return advice('check', 'Entscheide zuerst selbst, welche Integraldarstellung zur Situation gehört. Der CAS hilft anschließend beim Prüfen des Zahlenwerts; die Wahl des Modells musst du begründen.');
      case 'vector-angle':
        return advice('recommended', 'Stelle zuerst den Quotienten aus Skalarprodukt und Vektorlängen auf. Nutze den CAS für die Auswertung und den Arkuskosinus. Stelle die Winkelausgabe auf Gradmaß und runde erst am Ende.');
      case 'line-plane-angle':
        return advice('recommended', 'Verwende Richtungs- und Normalenvektor, um die Sinusbeziehung aufzustellen. Berechne den Winkel mit dem CAS über den Arkussinus im Gradmaß. Prüfe, ob du den Winkel zwischen Gerade und Ebene bestimmt hast.');
      case 'line-plane-intersection':
        return advice('check', 'Setze die Geradenkoordinaten zuerst selbst in die Ebenengleichung ein. Löse die entstehende Gleichung nach dem Parameter; bei längeren Termen hilft der CAS. Prüfe den Schnittpunkt durch Einsetzen in beide Darstellungen.');
      case 'point-plane-distance':
        return advice('check', 'Setze Punkt und Ebenenkoeffizienten selbst in die Abstandsformel ein. Nutze den CAS für Betrag, Wurzel und Zahlenwert. Achte auf die Länge des Normalenvektors im Nenner und runde erst am Ende.');
      case 'roof-area':
        return advice('check', 'Erkenne zuerst die geometrische Figur und bestimme ihre tatsächliche Höhe im Raum. Prüfe Wurzelwerte und Flächenrechnung mit dem CAS; die passende Flächenformel wählst du selbst.');
      case 'binomial-probability':
        return advice('recommended', 'Bestimme zuerst n, p und die gesuchte Trefferzahl. Nutze im CAS die Einzelwahrscheinlichkeit der Binomialverteilung für genau diese Trefferzahl. Kontrolliere, dass du keine kumulierte Wahrscheinlichkeit abfragst.');
      case 'binomial-cumulative':
        return advice('recommended', 'Übersetze das Ereignis zuerst in eine Bedingung an X. Nutze die kumulierte Binomialwahrscheinlichkeit bis zur angegebenen Grenze. Unterscheide „höchstens“ und „weniger als“ und runde erst am Ende.');
      case 'confidence-interval':
        return advice('recommended', 'Bestimme zuerst Stichprobenanteil und Stichprobenumfang. Setze sie in die vorgegebene Intervallformel ein und lass den CAS den Zahlenwert berechnen. Rechne für die Prozentangabe erst danach um und runde am Ende.');
      case 'sample-size':
        return advice('recommended', 'Stelle zuerst die Ungleichung für die geforderte Genauigkeit auf. Lass den CAS nach n auflösen. Runde einen nicht ganzzahligen Mindestumfang auf die nächste ganze Zahl auf und prüfe die ursprüngliche Ungleichung.');
      case 'derivative': case 'slope':
        return advice('not-needed', 'Übe hier die Ableitungsregeln und das Einsetzen selbst. Die Terme sind für eine Rechnung von Hand gewählt. Einen CAS kannst du anschließend zum Kontrollieren deiner Ableitung verwenden.');
      case 'roots':
        return advice('not-needed', 'Nutze die Produktdarstellung: Ein Produkt ist null, wenn mindestens ein Faktor null ist. Löse die einfachen Faktorgleichungen selbst und markiere die Nullstellen.');
      case 'vector-sum': case 'dot-product':
        return advice('not-needed', 'Rechne die Komponenten beziehungsweise Produkte zunächst selbst aus. Hier sollst du die Vektorrechnung üben; ein CAS ist für diese Zahlenwerte nicht nötig.');
      case 'line-parameter': case 'line-projection': case 'projection':
        return advice('not-needed', 'Vergleiche die Koordinaten beziehungsweise setze die gefragten Parameterwerte selbst ein. Für die Projektion übernimmst du die passenden Koordinaten; dafür ist kein CAS nötig.');
      case 'expectation': case 'conditional-probability': case 'binomial-expectation': case 'variance': case 'normal-interval': case 'constant-rate':
        return advice('not-needed', 'Wähle zuerst die passende Formel oder Bezugsmenge und rechne mit den angegebenen Werten selbst. Die Rechnung benötigt hier keine symbolischen CAS-Funktionen.');
    }
    if (['choice', 'order', 'match'].includes(task.kind)) return advice('not-needed',
      'Hier geht es um Begriffe, Zusammenhänge oder die Reihenfolge eines Lösungswegs. Entscheide und begründe selbst; eine CAS-Rechnung hilft bei dieser Aufgabe nicht weiter.');
    if (['vector', 'fraction', 'construct'].includes(task.kind)) return advice('not-needed',
      'Rechne die Komponenten beziehungsweise Anteile selbst aus oder lies die Koordinaten ab. Prüfe deinen Ansatz; ein CAS ist für diese Grundaufgabe nicht nötig.');
    return advice('check', 'Stelle zuerst den Rechenansatz selbst auf. Nutze den CAS bei längeren Rechnungen zur Kontrolle und prüfe, ob das Ergebnis zur Fragestellung passt.');
  }
  globalThis.MatheSekIIVarianten = Object.freeze({makeVariant, timeForTask, casGuidance});
})();
