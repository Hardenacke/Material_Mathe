import './aufgaben-varianten.js';
const {makeVariant, timeForTask, casGuidance} = globalThis.MatheSekIIVarianten;
const SCORE_VERSION = "sek2-v2";
const SCORE_VERSIONS = new Set(['sek2-v1', SCORE_VERSION]);
const ROUND_LENGTH = 12;
const ALLOWED_FIELDS = new Set(["analysis", "geometrie", "stochastik"]);

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers },
});

function safeName(value) {
  const cleaned = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .trim()
    .slice(0, 24);
  if (cleaned) return cleaned;
  const first = ["MatheFuchs", "ZahlenPilot", "WinkelProfi", "DatenDetektiv", "RechenAss"];
  const second = ["Luchs", "Komet", "Falke", "Otter", "Stern"];
  return `${first[Math.floor(Math.random() * first.length)]}-${second[Math.floor(Math.random() * second.length)]}-${10 + Math.floor(Math.random() * 90)}`;
}

function parseQuizId(quizId) {
  const match = String(quizId ?? "").match(/^(ef|q1|q2)-(analysis|geometrie|stochastik)(?:-(gk|lk))?$/);
  if (!match) return null;
  const phase = match[1], field = match[2], course = match[3] || null;
  if ((phase === "ef" && course) || (phase !== "ef" && !course)) return null;
  const grade = phase === "ef" ? 11 : phase === "q1" ? 12 : 13;
  const short = phase.toUpperCase();
  const className = phase === "ef" ? "EF" : `${short} · ${course.toUpperCase()}`;
  return { grade, phase, field, course, className };
}

const num = (prompt, answer, solution, tol = 0.001, unit = "") => ({
  kind: "number", prompt, answer, solution, tol, unit,
});
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const choice = (prompt, options, correct, solution) => {
  const randomized = shuffle(options.map((text, index) => ({ text, index })));
  return { kind: "choice", prompt, options: randomized.map(item => item.text), correct: randomized.findIndex(item => item.index === correct), solution };
};
const slider = (prompt, min, max, answer, solution, step = 1, tol = 0) => ({
  kind: "slider", prompt, min, max, answer, solution, step, tol,
});
const fraction = (prompt, n, d, solution) => {
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a) || 1;
  const g = gcd(n, d);
  return { kind: "fraction", prompt, answer: { num: n / g, den: d / g }, solution };
};
const order = (prompt, items, answer, solution) => ({ kind: "order", prompt, items, answer, solution });
const match = (prompt, pairs, solution) => ({
  kind: "match",
  prompt,
  pairs: shuffle(pairs).map(pair => {
    const options = shuffle(pair.options.map((text, index) => ({ text, index })));
    return { left: pair.left, options: options.map(item => item.text), correct: options.findIndex(item => item.index === pair.correct) };
  }),
  solution,
});
const construct = (prompt, fixed, points, solution) => ({ kind: "construct", prompt, fixed, points, solution });

function chooseN(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k); let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - k + i) / i;
  return Math.round(value);
}
function binomialProbability(n, p, k) { return chooseN(n, k) * p ** k * (1 - p) ** (n - k); }
const vector = (prompt, answer, solution, tol = 0.001) => ({ kind: "vector", prompt, answer, solution, tol });
function labelAbiTask(quizId, index, task) {
  const parsed = parseQuizId(quizId);
  if (parsed && parsed.phase !== "ef" && (index % 5 === 0 || index % 5 === 2)) task.prompt = "Abiturtransfer · Zahlenwerte variiert. " + task.prompt;
  return task;
}
function makeBaseTask(quizId, index) {
  const parsed = parseQuizId(quizId), { phase, field, course } = parsed;
  const slot = index % 5, r = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const lk = course === "lk";
  if (field === "analysis") {
    if (phase === "q1" && lk) {
      if (slot === 0) { const a = r(1, 4), answer = 2 / a; return num(`Für \\(h_a(x)=x^2e^{-${a}x}\\), \\(x>0\\): Bestimme die Stelle des lokalen Maximums.`, answer, `\\(h_a'(x)=xe^{-${a}x}(2-${a}x)\\); daraus folgt \\(x=2/${a}\\).`, 0.01); }
      if (slot === 1) return choice("Welche Ableitungsregeln werden für \\(f(x)=e^{2x}(x^2+1)\\) benötigt?", ["Produkt- und Kettenregel", "Nur Potenzregel", "Nur Summenregel"], 0, "Für das Produkt gilt die Produktregel; für \\(e^{2x}\\) kommt die Kettenregel hinzu.");
      if (slot === 2) { const a = r(1, 4), answer = 1 / a; return slider(`Für \\(f_a(x)=xe^{-${a}x}\\) mit \\(x\\geq0\\): Bei welchem x-Wert liegt das Maximum?`, 0, 2, answer, `\\(f_a'(x)=e^{-${a}x}(1-${a}x)\\); das Maximum liegt bei \\(x=1/${a}\\).`, 0.01, 0.01); }
      if (slot === 3) return order("Ordne die Schritte zur Untersuchung einer Funktionenschar.", ["Parameter zunächst festhalten", "Nach der Variablen x ableiten", "Kritische Stellen in Abhängigkeit vom Parameter bestimmen", "Lage und Art der Extrempunkte deuten"], ["Parameter zunächst festhalten", "Nach der Variablen x ableiten", "Kritische Stellen in Abhängigkeit vom Parameter bestimmen", "Lage und Art der Extrempunkte deuten"], "Bei einer Funktionenschar werden kritische Stellen und ihre Abhängigkeit vom Parameter untersucht.");
      return construct("Konstruiere die Extrempunkte von \\(f(x)=x^3-3x\\).", [], [[-1, 2], [1, -2]], "Die Extrempunkte sind \\((-1|2)\\) und \\((1|-2)\\).");
    }
    if (phase === "q2" && lk && slot === 2) { const a = r(2, 5), b = r(3, 6), answer = a * b * b / 2; return num(`Die Zuflussrate beträgt \\(r(t)=${a}t\\) Liter pro Minute. Wie viele Liter fließen in den ersten \\(${b}\\) Minuten zu?`, answer, `\\(\\int_0^{${b}}${a}t\\,dt=[${a}t^2/2]_0^{${b}}=${answer}\\) Liter.`); }
    if (phase === "q2" && lk && slot === 1) return choice("Welche Aussage zur Umkehrfunktion eines streng monotonen Graphen trifft zu?", ["Ihr Graph ist das Spiegelbild an der Geraden \\(y=x\\).", "Ihr Graph ist das Spiegelbild an der x-Achse.", "Definitions- und Wertebereich bleiben immer unverändert."], 0, "Graph und Umkehrgraph sind Spiegelbilder an der Winkelhalbierenden \\(y=x\\).");
    if (phase === "q2" && lk && slot === 3) return order("Ordne die Schritte zur Berechnung eines Rotationsvolumens.", ["Querschnittsfläche \\(\\pi f(x)^2\\) und Integrationsintervall festlegen", "Stammfunktion bestimmen oder digitales Mathematikwerkzeug nutzen", "Obere und untere Grenze auswerten: \\(F(b)-F(a)\\)", "Volumen mit Einheit im Kontext deuten"], ["Querschnittsfläche \\(\\pi f(x)^2\\) und Integrationsintervall festlegen", "Stammfunktion bestimmen oder digitales Mathematikwerkzeug nutzen", "Obere und untere Grenze auswerten: \\(F(b)-F(a)\\)", "Volumen mit Einheit im Kontext deuten"], "Stelle das Integral über die Querschnittsfläche auf. Integriere und berechne \\(F(b)-F(a)\\); deute das Ergebnis mit Einheit.");
    if (phase === "q2" && lk && slot === 4) return match("Ordne jede Situation der passenden Integraldarstellung zu.", [{ left: "Zuflussrate \\(f(t)=2t\\) von 0 bis 3 Minuten", options: ["\\(\\int_0^3 2t\\,dt=9\\) Liter", "\\(2\\cdot3=6\\) Liter"], correct: 0 }, { left: "Rotationskörper mit Radiusfunktion \\(f(x)\\)", options: ["\\(V=\\pi\\int_a^b f(x)^2\\,dx\\)", "\\(V=\\int_a^b f(x)\\,dx\\)"], correct: 0 }], "Eine veränderliche Rate wird integriert; beim Rotationskörper wird die Querschnittsfläche \\(\\pi f(x)^2\\) integriert.");
    if (phase === "ef") {
      if (slot === 0) { const a = r(1, 2), b = r(2, 5), x = r(1, 3), ans = 3 * a * x * x - b; return num(`Für \\(f(x)=${a}x^3-${b}x\\): Bestimme \\(f'(${x})\\).`, ans, `\\(f'(x)=${3*a}x^2-${b}\\); setze \\(x=${x}\\) ein.`); }
      if (slot === 1) return choice("An einer Stelle gilt \\(f'(x)>0\\). Welche Aussage passt?", ["Der Graph steigt dort.", "Der Graph fällt dort.", "Dort muss ein Hochpunkt liegen."], 0, "Eine positive Ableitung bedeutet eine positive Tangentensteigung.");
      if (slot === 2) return slider("Für \\(f(x)=x^2\\): Welche Tangentensteigung hat der Graph bei \\(x=3\\)?", 0, 12, 6, "Es gilt \\(f'(x)=2x\\).", 0.1, 0.1);
      if (slot === 3) return order("Ordne die Schritte einer Funktionsuntersuchung.", ["Ableitungsfunktion bilden", "Kritische Stellen bestimmen", "Vorzeichen von f′ prüfen", "Monotonie beschreiben"], ["Ableitungsfunktion bilden", "Kritische Stellen bestimmen", "Vorzeichen von f′ prüfen", "Monotonie beschreiben"], "Die Ableitung liefert kritische Stellen und beschreibt die Monotonie.");
      return construct("Markiere die Nullstellen von \\(f(x)=(x-2)(x+1)\\) im Koordinatenraster.", [], [[2, 0], [-1, 0]], "Setze beide Faktoren gleich null.");
    }
    if (phase === "q1") {
      if (slot === 0) {
        if (lk) { const a = r(1, 4), answer = 2 / a; return num(`Für \\(h_a(x)=x^2e^{-${a}x}\\), \\(x>0\\): Bestimme die Stelle des lokalen Maximums.`, answer, `\\(h_a'(x)=xe^{-${a}x}(2-${a}x)\\); daraus folgt \\(x=2/${a}\\).`, 0.01); }
        const a = r(1, 3), b = r(2, 5), x = r(1, 4), answer = 2 * a * x * (x + b) + (a * x * x + 2);
        return num(`Für \\(f(x)=(${a}x^2+2)(x+${b})\\): Bestimme \\(f'(${x})\\).`, answer, `Nutze die Produktregel und setze \\(x=${x}\\) ein.`, 0.001);
      }
      if (slot === 1) return choice("Welche Regel braucht \\(f(x)=e^{2x}(x^2+1)\\)?", ["Produkt- und Kettenregel", "Nur Potenzregel", "Nur Summenregel"], 0, "Ein Produkt und eine verkettete Exponentialfunktion benötigen beide Regeln.");
      if (slot === 2) {
        if (lk) { const a = r(1, 4), answer = 1 / a; return slider(`Für \\(f_a(x)=xe^{-${a}x}\\), \\(x\\geq0\\): Bei welchem x-Wert liegt das Maximum?`, 0, 2, answer, `\\(f_a'(x)=e^{-${a}x}(1-${a}x)\\), also liegt das Maximum bei \\(x=1/${a}\\).`, 0.01, 0.01); }
        const width = r(8, 14), answer = width / 2;
        return slider(`Ein Rechteck hat Umfang \\(${2 * width}\\) m. Welche Seitenlänge maximiert \\(A(x)=x(${width}-x)\\)?`, 0, width, answer, "Leite die Flächenfunktion ab, prüfe den Definitionsbereich und deute die kritische Stelle.", 0.1, 0.1);
      }
      if (slot === 3) return order("Ordne die Schritte eines Optimierungsproblems.", ["Zielfunktion aus der Nebenbedingung bilden", "Definitionsbereich festlegen", "Ableitung null setzen und Kandidaten prüfen", "Ergebnis im Kontext deuten"], ["Zielfunktion aus der Nebenbedingung bilden", "Definitionsbereich festlegen", "Ableitung null setzen und Kandidaten prüfen", "Ergebnis im Kontext deuten"], "Bilde zuerst die Zielfunktion, bestimme dann Kandidaten und deute sie.");
      return construct("Markiere die Nullstellen von \\(g(x)=(x-2)(x+1)\\).", [], [[2, 0], [-1, 0]], "Setze die Faktoren einzeln gleich null.");
    }
    if (slot === 0) {
      if (lk) { const a = r(1, 3), b = r(2, 5), volume = Math.PI * a * a * b; return num(`Ein Rotationskörper entsteht durch Rotation von \\(f(x)=${a}\\) auf \\([0,${b}]\\) um die x-Achse. Berechne sein Volumen auf zwei Dezimalstellen.`, volume, `\\(V=\\pi\\int_0^{${b}}${a * a}\\,dx=${a * a * b}\\pi\\).`, 0.02, "m³"); }
      const a = [2, 4, 6][r(0, 2)], area = a ** 4 / 4;
      return num(`Der Graph von \\(f(x)=x^3-${a * a}x\\) schließt im zweiten Quadranten mit der x-Achse eine Fläche ein. Berechne den Flächeninhalt.`, area, `\\(A=\\int_{-${a}}^0(x^3-${a * a}x)\\,dx=${area}\\) FE.`);
    }
    if (slot === 1) return choice("Was beschreibt ein bestimmtes Integral einer Änderungsrate?", ["Die aufsummierte Änderung im Intervall.", "Immer nur die größte Änderungsrate.", "Nur die Nullstellen."], 0, "Das Integral einer Änderungsrate beschreibt die Gesamtänderung.");
    if (slot === 2) { const rate = r(3, 8), time = r(3, 7), answer = rate * time; return slider(`Eine Größe wächst konstant mit \\(${rate}\\) Einheiten pro Stunde. Wie stark hat sie sich nach \\(${time}\\) Stunden verändert?`, 0, 60, answer, "Bei konstanter Rate gilt Änderung = Rate mal Zeit.", 0.1, 0.2); }
    if (slot === 3) return order("Ordne die Schritte zum bestimmten Integral.", ["Stammfunktion bestimmen", "Grenzen einsetzen", "Funktionswerte subtrahieren", "Ergebnis im Kontext deuten"], ["Stammfunktion bestimmen", "Grenzen einsetzen", "Funktionswerte subtrahieren", "Ergebnis im Kontext deuten"], "Die Differenz der Stammfunktionswerte liefert den Integralwert.");
    return match("Ordne die Begriffe passend zu.", [{ left: "Ableitung", options: ["lokale Änderungsrate", "gesamte Änderung"], correct: 0 }, { left: "Bestimmtes Integral", options: ["lokale Änderungsrate", "gesamte Änderung"], correct: 1 }], "Ableitung und Integral beschreiben lokale und aufsummierte Änderung.");
  }
  if (field === "geometrie") {
    if (phase === "q1" && lk) {
      if (slot === 0) { const [a,b,c] = r(0,1) ? [3,4,5] : [5,12,13], angle = Math.acos(a/c) * 180 / Math.PI; return slider(`Bestimme den Winkel zwischen \\(\\vec u=(${c}|0|0)\\) und \\(\\vec v=(${a}|${b}|0)\\).`, 0, 180, angle, `\\(\\cos\\alpha=${a}/${c}\\), also \\(\\alpha\\approx${angle.toFixed(1).replace('.',',')}^\\circ\\).`, 1, 0.6); }
      if (slot === 1) return choice("Welche Form nutzt einen Normalenvektor direkt zur Ebenenbeschreibung?", ["Normalenform \\(\\vec n\\cdot(\\vec x-\\vec p)=0\\)", "Nur ein einzelner Punkt ohne Richtung", "Eine Geradengleichung mit einem Parameter"], 0, "In der Normalenform steht der Normalenvektor senkrecht auf der Ebene.");
      if (slot === 2) { const a = r(-2,2), c = r(1,4), t = r(1,4), d = 2*a+c+3*t; return slider(`Eine Messsonde folgt \\(\\vec x=(${a}|0|${c})+t(1|1|0)\\) und trifft die Ebene \\(2x+y+z=${d}\\). Bestimme den Schnittparameter t.`, 0, 5, t, `Setze die Gerade in die Ebenengleichung ein: \\(2(${a}+t)+t+${c}=${d}\\), also \\(t=${t}\\).`, 0.1, 0.1); }
      if (slot === 3) return order("Ordne die Schritte zur Normalenform einer Ebene aus drei Punkten.", ["Zwei Differenzvektoren aus den Punkten bilden", "Kreuzprodukt als Normalenvektor berechnen", "Einen Punkt und den Normalenvektor einsetzen", "Normalengleichung aufschreiben und prüfen"], ["Zwei Differenzvektoren aus den Punkten bilden", "Kreuzprodukt als Normalenvektor berechnen", "Einen Punkt und den Normalenvektor einsetzen", "Normalengleichung aufschreiben und prüfen"], "Das Kreuzprodukt liefert einen Normalenvektor; mit einem Punkt entsteht die Normalenform.");
      return construct("Konstruiere die x-y-Projektion der Geraden \\(\\vec x=(1|0|1)+t(1|2|0)\\) für \\(t=0\\) und \\(t=1\\). Verbinde die Punkte.", [], [[1, 0], [2, 2]], "Die Projektionen der beiden Punkte sind \\((1|0)\\) und \\((2|2)\\).");
    }
    if (phase === "ef") {
      if (slot === 0) return vector("Bilde \\(\\vec u+\\vec v\\) mit \\(\\vec u=(2|1|0)\\), \\(\\vec v=(1|-2|1)\\).", [3, -1, 1], "Addiere x-, y- und z-Komponenten.");
      if (slot === 1) return choice("Wann sind zwei Vektoren kollinear?", ["Ein Vektor ist ein skalares Vielfaches des anderen.", "Ihr Skalarprodukt ist immer null.", "Ihre Längen sind immer verschieden."], 0, "Kollineare Vektoren haben dieselbe oder entgegengesetzte Richtung.");
      if (slot === 2) return slider("Auf \\(g: \\vec x=(1|0|2)+t(2|1|0)\\) liegt \\(P=(5|2|2)\\). Bestimme t.", -2, 4, 2, "Vergleiche die Koordinaten mit der Geradengleichung.", 0.1, 0.1);
      if (slot === 3) return order("Ordne den Schnitt zweier Geraden.", ["Geradengleichungen gleichsetzen", "Koordinatengleichungen aufstellen", "Gleichungssystem lösen", "Lösung prüfen"], ["Geradengleichungen gleichsetzen", "Koordinatengleichungen aufstellen", "Gleichungssystem lösen", "Lösung prüfen"], "Gleichsetzen erzeugt ein Gleichungssystem, dessen Lösung beide Geraden erfüllen muss.");
      return construct("Markiere den Punkt \\(P(2|1)\\) in der x-y-Projektion.", [], [[2, 1]], "Lies x waagerecht und y senkrecht ab.");
    }
    if (phase === "q1") {
      if (slot === 0) { const a=r(1,4), b=r(1,4), c=r(0,3), d=r(1,3), e=r(1,3), answer=a*d-b*e+c*a; return num(`Berechne \\(\\vec u\\cdot\\vec v\\) für \\(\\vec u=(${a}|${b}|${c})\\) und \\(\\vec v=(${d}|${-e}|${a})\\).`, answer, "Multipliziere die entsprechenden Komponenten und addiere die drei Produkte."); }
      if (slot === 1) return choice("Was gehört zur Parameterform einer Ebene?", ["Ein Stützvektor und zwei unabhängige Richtungsvektoren.", "Nur ein Normalenvektor.", "Ein einzelner Punkt."], 0, "Die Parameterform beschreibt zwei Richtungen in der Ebene und einen Punkt.");
      if (slot === 2) { const t=r(1,4), a=r(-2,2), c=r(1,4), d=a+c+3*t; return slider(`Die Gerade \\(\\vec x=(${a}|0|${c})+t(1|1|0)\\) trifft die Ebene \\(x+y+z=${d}\\). Bestimme t.`, 0, 5, t, "Setze die Geradenkoordinaten in die Ebenengleichung ein und löse nach t auf.", 0.1, 0.1); }
      if (slot === 3) return order("Ordne das Aufstellen einer Ebene durch drei Punkte.", ["Einen Punkt als Stützvektor wählen", "Zwei Verbindungsvektoren bilden", "Unabhängigkeit prüfen", "Parameterform aufschreiben"], ["Einen Punkt als Stützvektor wählen", "Zwei Verbindungsvektoren bilden", "Unabhängigkeit prüfen", "Parameterform aufschreiben"], "Zwei unabhängige Richtungsvektoren und ein Stützpunkt bestimmen eine Ebene.");
      return construct("Markiere die x-y-Projektion von \\(\\vec v=(2|3|1)\\).", [], [[2, 3]], "In der x-y-Projektion werden die ersten beiden Komponenten dargestellt.");
    }
    if (slot === 0) {
      if (lk) { const x=r(-1,2), y=r(-1,2), z=r(-1,2), d=r(3,6), numerator=Math.abs(x+y+z-d), answer=numerator/Math.sqrt(3); return num(`Berechne den Abstand von \\(P(${x}|${y}|${z})\\) zur Ebene \\(x+y+z=${d}\\).`, answer, `\\(d(P,E)=|${x}+${y}+${z}-${d}|/\\sqrt3\\).`, 0.01); }
      const L=r(8,14), s=r(1,3), [d,h]=r(0,1)?[3,4]:[5,12], height=Math.sqrt(d*d+h*h), area=(L-s)*height;
      return num(`Eine Dachfläche wird durch \\(A=(0|0|0)\\), \\(B=(0|${L}|0)\\), \\(C=(${d}|${L-s}|${h})\\) und \\(D=(${d}|${s}|${h})\\) modelliert. Berechne ihren Flächeninhalt.`, area, `Die parallelen Seiten sind \\(${L}\\) und \\(${L-2*s}\\); die Trapezhöhe ist \\(\\sqrt{${d}^2+${h}^2}=${height}\\). Fläche: \\(${area}\\,m^2\\).`, 0.01, "m²");
    }
    if (slot === 1) return lk ? choice("Wann ist eine Gerade mit Richtungsvektor \\(\\vec v\\) parallel zu einer Ebene mit Normalenvektor \\(\\vec n\\)?", ["Wenn \\(\\vec v\\cdot\\vec n=0\\).", "Wenn \\(\\vec v\\) ein Vielfaches von \\(\\vec n\\) ist.", "Wenn beide Vektoren gleich lang sind."], 0, "Ein Richtungsvektor parallel zur Ebene steht senkrecht auf ihrem Normalenvektor.") : choice("Wann stehen zwei Vektoren senkrecht aufeinander?", ["Wenn ihr Skalarprodukt null ist.", "Wenn ihre Längen gleich sind.", "Wenn sie denselben Stützpunkt haben."], 0, "Orthogonalität gilt genau dann, wenn das Skalarprodukt null ist.");
    if (slot === 2) { const [a,b,c]=r(0,1)?[3,4,5]:[5,12,13]; if(lk){const angle=Math.asin(b/c)*180/Math.PI; return slider(`Eine Gerade mit \\(\\vec v=(${a}|0|${b})\\) trifft eine Ebene mit \\(\\vec n=(0|0|1)\\). Bestimme den Winkel zwischen Gerade und Ebene.`,0,90,angle,`\\(\\sin\\alpha=${b}/${c}\\), also \\(\\alpha\\approx${angle.toFixed(1).replace('.',',')}^\\circ\\).`,1,0.6);}const angle=Math.acos(a/c)*180/Math.PI;return slider(`Bestimme den Winkel zwischen \\(\\vec u=(${c}|0|0)\\) und \\(\\vec v=(${a}|${b}|0)\\).`,0,180,angle,`\\(\\cos\\alpha=${a}/${c}\\), also \\(\\alpha\\approx${angle.toFixed(1).replace('.',',')}^\\circ\\).`,1,0.6); }
    if (slot === 3) return lk ? order("Ordne die Schritte zum Abstand zweier windschiefer Geraden.", ["Richtungsvektoren kreuzweise multiplizieren", "Verbindungsvektor zwischen den Geraden bilden", "Auf die gemeinsame Senkrechte projizieren", "Abstand als Betrag der Projektion berechnen"], ["Richtungsvektoren kreuzweise multiplizieren", "Verbindungsvektor zwischen den Geraden bilden", "Auf die gemeinsame Senkrechte projizieren", "Abstand als Betrag der Projektion berechnen"], "Das Kreuzprodukt liefert eine Richtung der gemeinsamen Senkrechten; die Projektion des Verbindungsvektors ergibt den Abstand.") : order("Ordne die Schritte beim Lösen eines geometrischen Gleichungssystems.", ["Gleichungen aufstellen", "Variablen eliminieren", "Lösungsmenge bestimmen", "Lösungsmenge geometrisch deuten"], ["Gleichungen aufstellen", "Variablen eliminieren", "Lösungsmenge bestimmen", "Lösungsmenge geometrisch deuten"], "Die Lösungsmenge beschreibt anschließend die Lage der Objekte.");
    return lk ? match("Ordne die Lagebeziehung der passenden Bedingung zu.", [{ left: "Gerade parallel zur Ebene", options: ["Richtungsvektor senkrecht zum Normalenvektor", "Richtungsvektor parallel zum Normalenvektor"], correct: 0 }, { left: "Gerade senkrecht zur Ebene", options: ["Richtungsvektor parallel zum Normalenvektor", "Richtungsvektor senkrecht zum Normalenvektor"], correct: 0 }, { left: "Parallele Ebenen", options: ["Normalenvektoren sind Vielfache", "Normalenvektoren stehen senkrecht"], correct: 0 }], "Lagebeziehungen lassen sich über Skalarprodukt und Vielfachheit der Normalenvektoren prüfen.") : match("Ordne die Darstellung der Bedeutung zu.", [{ left: "Normalenvektor", options: ["steht senkrecht auf einer Ebene", "liegt immer in einer Ebene"], correct: 0 }, { left: "Stützvektor", options: ["beschreibt einen Punkt", "beschreibt nur eine Länge"], correct: 0 }], "Ein Normalenvektor steht senkrecht auf der Ebene; ein Stützvektor beschreibt einen Punkt.");
  }
  if (phase === "ef") {
    if (slot === 0) return num("Eine Zufallsgröße nimmt \\(0,1,2\\) mit Wahrscheinlichkeit \\(1/4,1/2,1/4\\) an. Bestimme \\(E(X)\\).", 1, "Multipliziere jeden Wert mit seiner Wahrscheinlichkeit und addiere.");
    if (slot === 1) return choice("Welche Stichprobe bildet die Meinung einer Stadt am ehesten ab?", ["Zufällig ausgewählte Personen aus mehreren Stadtteilen.", "Nur die eigene Lerngruppe.", "Nur Antworten einer Fan-Seite."], 0, "Eine vielfältige Zufallsstichprobe verringert Verzerrungen.");
    if (slot === 2) return slider("Von \\(8\\) Personen mit B haben \\(3\\) auch A. Ordne \\(P(A|B)\\) ein.", 0, 1, 3 / 8, "Bei einer bedingten Wahrscheinlichkeit ist die Teilgruppe B die Bezugsmenge.", 0.01, 0.04);
    if (slot === 3) return order("Ordne eine Simulation sinnvoll.", ["Modell und Annahmen festlegen", "Wiederholungen durchführen", "Ergebnisse zusammenfassen", "Ergebnis im Kontext beurteilen"], ["Modell und Annahmen festlegen", "Wiederholungen durchführen", "Ergebnisse zusammenfassen", "Ergebnis im Kontext beurteilen"], "Erst wird das Modell festgelegt, dann simuliert, ausgewertet und beurteilt.");
    return match("Ordne den Begriff seiner Bedeutung zu.", [{ left: "Zufallsgröße", options: ["ordnet Ergebnissen Zahlen zu", "ist die Zahl aller Versuche"], correct: 0 }, { left: "Erwartungswert", options: ["langfristiger Mittelwert", "sicheres Ergebnis"], correct: 0 }], "Eine Zufallsgröße ordnet Ergebnissen Zahlenwerte zu; ihr Erwartungswert ist der langfristige Mittelwert.");
  }
  let n = phase === "q1" ? 5 : 6, p = lk ? 0.2 : 0.5;
  if (phase === "q1" && lk) {
    n = r(8, 13); p = [0.2,0.3,0.4][r(0,2)];
    if (slot === 0) { const ans = binomialProbability(n,p,0)+binomialProbability(n,p,1), pText=p.toString().replace('.', '{,}'); return num(`Für \\(X\\sim B(${n};${pText})\\): Bestimme \\(P(X\\leq1)\\).`, ans, `Addiere \\(P(X=0)\\) und \\(P(X=1)\\) für \\(n=${n}\\) und \\(p=${pText}\\).`, 0.001); }
    if (slot === 1) return choice("Wie lässt sich \\(P(X\\geq1)\\) über das Gegenereignis bestimmen?", ["\\(1-P(X=0)\\)", "\\(P(X=0)\\)", "\\(1-P(X=n)\\)"], 0, "Das Gegenereignis zu mindestens einem Treffer ist kein Treffer.");
    if (slot === 2) { const variance=n*p*(1-p), pText=p.toString().replace('.', '{,}'); return slider(`Für \\(X\\sim B(${n};${pText})\\): Markiere die Varianz.`, 0, Math.ceil(variance*1.6), variance, "Es gilt \\(Var(X)=np(1-p)\\).", 0.1, 0.05); }
    if (slot === 3) return order("Ordne die Schritte zur kumulativen Wahrscheinlichkeit \\(P(X\\leq1)\\).", ["Ereignis und Parameter festlegen", "Wahrscheinlichkeiten für 0 und 1 Treffer addieren", "Binomialterme berechnen", "Ergebnis als kumulative Wahrscheinlichkeit deuten"], ["Ereignis und Parameter festlegen", "Wahrscheinlichkeiten für 0 und 1 Treffer addieren", "Binomialterme berechnen", "Ergebnis als kumulative Wahrscheinlichkeit deuten"], "Für höchstens einen Treffer werden die Einzelwahrscheinlichkeiten bei null und einem Treffer addiert.");
    return match("Ordne das Ereignis der passenden Darstellung zu.", [{ left: "Mindestens ein Treffer", options: ["\\(1-P(X=0)\\)", "\\(P(X=0)\\)"], correct: 0 }, { left: "Höchstens ein Treffer", options: ["\\(P(X=0)+P(X=1)\\)", "\\(1-P(X=0)\\)"], correct: 0 }], "Das Gegenereignis und die Summe der Trefferzahlen 0 und 1 stellen die Ereignisse dar.");
  }
  if (phase === "q1") {
    n = r(8, 13); p = (lk ? [0.2,0.3,0.4] : [0.2,0.4,0.5])[r(0,2)];
    if (slot === 0) { const ans = binomialProbability(n,p,1), pTex = p.toString().replace('.', '{,}'); return num(`Für \\(X\\sim B(${n};${pTex})\\): Bestimme \\(P(X=1)\\).`, ans, "Nutze die Binomialformel für genau einen Treffer.", 0.001); }
    if (slot === 1) return choice("Welche Voraussetzungen passen zu einem Binomialmodell?", ["Feste Versuchszahl, zwei Ausgänge, unabhängige Versuche und gleiches p.", "p ändert sich in jedem Versuch.", "Die Zahl der Versuche ist unbegrenzt."], 0, "Ein Binomialmodell setzt eine feste Versuchszahl und konstantes p voraus.");
    if (slot === 2) return slider(`Für \\(X\\sim B(${n};${p.toString().replace('.', '{,}')})\\): Markiere den Erwartungswert.`, 0, n, n*p, "Für eine Binomialverteilung gilt \\(E(X)=np\\).", 0.1, 0.1);
    if (slot === 3) return order("Ordne die Schritte zur Binomialwahrscheinlichkeit.", ["n, p und Ereignis bestimmen", "Formel auswählen", "Werte einsetzen", "Ergebnis deuten"], ["n, p und Ereignis bestimmen", "Formel auswählen", "Werte einsetzen", "Ergebnis deuten"], "Parameter und Ereignis werden vor der Rechnung festgelegt.");
    return match("Ordne die Kennzahl zu.", [{ left: "Erwartungswert", options: ["np", "np(1−p)"], correct: 0 }, { left: "Varianz", options: ["np", "np(1−p)"], correct: 1 }], "Es gilt \\(E(X)=np\\) und \\(Var(X)=np(1-p)\\).");
  }
  if (!lk) {
    if (slot === 0) { const sampleN=r(18,24), pValue=[0.08,0.1,0.12,0.15][r(0,3)], threshold=r(2,4), pText=pValue.toString().replace('.', '{,}'), ans=Array.from({length:threshold},(_,i)=>binomialProbability(sampleN,pValue,i)).reduce((sum,value)=>sum+value,0); return num(`In einem Paketzentrum haben \\(${Math.round(pValue*100)}\\) Prozent der Sendungen Ziel B. Für \\(${sampleN}\\) Pakete gilt \\(X\\sim B(${sampleN};${pText})\\). Bestimme die Wahrscheinlichkeit, dass weniger als \\(${threshold}\\) Pakete Ziel B haben.`, ans, `Addiere die Binomialwahrscheinlichkeiten für \\(0,1,\\ldots,${threshold-1}\\) Treffer.`, 0.002); }
    if (slot === 1) { const target=[330,500,750][r(0,2)], offset=r(2,4), spreadA=(10+r(0,6))/10, spreadB=(20+r(0,8))/10; return choice(`Zwei Abfüllmaschinen sollen Flaschen mit \\(${target}\\) ml füllen. A: Mittelwert \\(${target}\\) ml, Standardabweichung \\(${spreadA}\\) ml. B: Mittelwert \\(${target+offset}\\) ml, Standardabweichung \\(${spreadB}\\) ml. Welche arbeitet nach Mittelwertnähe und Streuung besser?`, ["Maschine A", "Maschine B", "Beide gleich gut"], 0, "A liegt näher am Sollwert und hat die kleinere Streuung."); }
    if (slot === 2) { const sampleN=r(30,50), pValue=[0.08,0.1,0.12,0.15][r(0,3)], pText=pValue.toString().replace('.', '{,}'); return slider(`Für \\(X\\sim B(${sampleN};${pText})\\): Markiere den Erwartungswert.`, 0, sampleN, sampleN*pValue, "Für eine Binomialverteilung gilt \\(E(X)=np\\).", 0.1, 0.1); }
    if (slot === 3) return order("Ordne eine Modellierungsaufgabe.", ["Zufallsgröße festlegen", "Binomialannahmen prüfen", "Wahrscheinlichkeit berechnen", "Ergebnis deuten"], ["Zufallsgröße festlegen", "Binomialannahmen prüfen", "Wahrscheinlichkeit berechnen", "Ergebnis deuten"], "Prüfe die Modellannahmen vor der Rechnung.");
    return match("Ordne Ereignis und Gegenereignis.", [{ left: "Mindestens ein Treffer", options: ["Kein Treffer", "Alle Versuche treffen"], correct: 0 }, { left: "Kein Treffer", options: ["Mindestens ein Treffer", "Alle Versuche treffen"], correct: 0 }], "„Mindestens ein Treffer“ ist das Gegenereignis zu „kein Treffer“.");
  }
  if (slot === 0) { const sampleN=[80,100,120,150][r(0,3)], sampleX=Math.round(sampleN*(0.2+0.01*r(0,10))), phat=sampleX/sampleN, lower=phat-1.96*Math.sqrt(phat*(1-phat)/sampleN), ans=Math.round(lower*1000)/10; return num(`Bei \\(${sampleN}\\) geprüften Geräten sind \\(${sampleX}\\) fehlerhaft. Berechne die untere Grenze des näherungsweisen 95%-Konfidenzintervalls mit \\(\\hat p\\pm1{,}96\\sqrt{\\hat p(1-\\hat p)/n}\\), auf eine Nachkommastelle in Prozent.`, ans, `Setze \\(\\hat p=${sampleX}/${sampleN}\\) in \\(\\hat p-1{,}96\\sqrt{\\hat p(1-\\hat p)/n}\\) ein.`, 0.06, "%"); }
  if (slot === 0) { const mu=40+5*r(0,8), sigma=3+r(0,5); return num(`Bei \\(X\\sim\\mathcal{N}(\\mu=${mu};\\sigma=${sigma})\\): Bestimme die Untergrenze des 1σ-Bereichs.`, mu-sigma, `Untere Grenze: \\(\\mu-\\sigma=${mu}-${sigma}\\).`, 0.001); }
  if (slot === 1) return choice("Was bedeutet ein 95%-Konfidenzintervall?", ["Das Verfahren erfasst bei vielen Stichproben den wahren Anteil in etwa 95% der Fälle.", "Der feste wahre Anteil liegt mit 95% Wahrscheinlichkeit in diesem berechneten Intervall.", "95% aller Einzelwerte liegen immer darin."], 0, "Das Konfidenzniveau beschreibt die Trefferquote des Verfahrens über viele Stichproben.");
  if (slot === 2) { const mu=40+5*r(0,8), sigma=3+r(0,5); return slider(`Markiere die obere Grenze des zentralen 95%-Bereichs für \\(X\\sim\\mathcal{N}(\\mu=${mu};\\sigma=${sigma})\\).`, mu-2*sigma, mu+3*sigma, mu+2*sigma, "Die obere Grenze ist \\(\\mu+2\\sigma\\).", 0.1, 0.1); }
  if (slot === 3) return order("Ordne die Schritte eines approximativen Konfidenzintervalls.", ["Stichprobenanteil und Umfang bestimmen", "Standardfehler berechnen", "Intervallgrenzen bilden", "Aussage und Unsicherheit deuten"], ["Stichprobenanteil und Umfang bestimmen", "Standardfehler berechnen", "Intervallgrenzen bilden", "Aussage und Unsicherheit deuten"], "Das Intervall wird aus Stichprobenanteil, Umfang und dem gewählten Verfahren aufgebaut.");
  return match("Ordne die Verteilung zur typischen Größe.", [{ left: "Binomialverteilung", options: ["diskrete Trefferzahl", "stetige Messgröße"], correct: 0 }, { left: "Normalverteilung", options: ["diskrete Trefferzahl", "stetige Messgröße"], correct: 1 }], "Binomialverteilungen modellieren diskrete Trefferzahlen; Normalverteilungen beschreiben stetige Größen.");
}
function makeTask(quizId, index, options = {}) {
  let task = makeVariant(quizId, index % 5, options) || makeBaseTask(quizId, index);
  if (task.kind === 'match') task = {...task, ...match(task.prompt, task.pairs, task.solution)};
  task.timeLimitSeconds = timeForTask(task);
  return task;
}

function publicTask(task, expiresAt) {
  const allowed = ["id", "kind", "prompt", "options", "min", "max", "step", "unit", "fixed", "pointLabel", "connectPoints"];
  const result = {};
  for (const key of allowed) if (task[key] !== undefined) result[key] = task[key];
  if (task.kind === "order" && Array.isArray(task.items)) {
    if (!Array.isArray(task.publicItems)) {
      const items = shuffle(task.items);
      if (items.length > 1 && Array.isArray(task.answer) && items.length === task.answer.length && items.every((item, index) => item === task.answer[index])) {
        [items[0], items[1]] = [items[1], items[0]];
      }
      task.publicItems = items;
    }
    result.items = [...task.publicItems];
  }
  if (task.pairs) result.pairs = task.pairs.map(({ left, options }) => ({ left, options }));
  if (task.kind === "construct") result.requiredPoints = task.points.length;
  result.expiresAt = expiresAt;
  result.timeLimitSeconds = task.timeLimitSeconds || 60;
  result.casGuidance = casGuidance(task);
  return result;
}

export function evaluateAnswer(task, value) {
  const asNumber = x => typeof x === "number" ? x :
    typeof x === "string" && x.trim() ? Number(x.trim().replace(",", ".")) : NaN;
  if (task.kind === "number") {
    const n = asNumber(value);
    return Number.isFinite(n) && Math.abs(n - task.answer) <= (task.tol ?? 0.001) ? 1 : 0;
  }
  if (task.kind === "vector") {
    if (!Array.isArray(value) || value.length !== 3) return 0;
    return value.reduce((score, component, i) => score + Number(Number.isFinite(asNumber(component)) &&
      Math.abs(asNumber(component) - task.answer[i]) <= (task.tol ?? 0.001)), 0) / 3;
  }
  if (task.kind === "fraction") {
    const n = asNumber(value?.num), d = asNumber(value?.den);
    return Number.isFinite(n) && Number.isFinite(d) && d !== 0 && Math.abs(n / d - task.answer.num / task.answer.den) < 1e-9 ? 1 : 0;
  }
  if (task.kind === "choice") return asNumber(value) === task.correct ? 1 : 0;
  if (task.kind === "slider") {
    const n = asNumber(value);
    if (!Number.isFinite(n) || n < task.min || n > task.max) return 0;
    const error = Math.abs(n - task.answer);
    if (error <= (task.tol ?? 0)) return 1;
    const scale = Math.max((task.max - task.min) * 0.15, task.step || 0.01);
    return Math.max(0, 1 - error / scale);
  }
  if (task.kind === "order") {
    if (!Array.isArray(value) || !task.answer.length || value.length !== task.answer.length ||
        new Set(value).size !== value.length) return 0;
    return value.reduce((score, item, i) => score + Number(item === task.answer[i]), 0) / task.answer.length;
  }
  if (task.kind === "match") {
    if (!task.pairs.length) return 0;
    return task.pairs.reduce((score, pair, i) => score + Number(String(value?.[i]) === String(pair.correct)), 0) / task.pairs.length;
  }
  if (task.kind === "construct") {
    if (!Array.isArray(value) || !task.points.length || value.length > task.points.length) return 0;
    const remaining = task.points.map(point => [...point]);
    let hits = 0;
    for (const point of value) {
      if (!Array.isArray(point) || point.length !== 2) continue;
      const index = remaining.findIndex(target => Math.hypot(target[0] - asNumber(point[0]), target[1] - asNumber(point[1])) <= 0.35);
      if (index >= 0) { hits++; remaining.splice(index, 1); }
    }
    return hits / task.points.length;
  }
  return 0;
}

export function scoreAnswer(task, value, now, deadline) {
  const quality = now >= deadline ? 0 : evaluateAnswer(task, value);
  const full = quality === 1;
  const basePoints = Math.round(100 * quality);
  const budgetSeconds = task.timeLimitSeconds || 60;
  const remainingSeconds = Math.min(budgetSeconds, Math.max(0, Math.ceil((deadline - now) / 1000)));
  const timeBonus = full ? Math.floor(50 * remainingSeconds / budgetSeconds) : 0;
  return { quality, isCorrect: full, basePoints, timeBonus, remainingSeconds };
}

async function saveBestScore(env, round) {
  if (!env.DB) return;
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO leaderboard (quiz_id, browser_id, pseudonym, class_name, best_points, best_date, score_version)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(quiz_id, browser_id, score_version) DO UPDATE SET
      pseudonym = excluded.pseudonym,
      class_name = excluded.class_name,
      best_points = MAX(leaderboard.best_points, excluded.best_points),
      best_date = CASE WHEN excluded.best_points > leaderboard.best_points THEN excluded.best_date ELSE leaderboard.best_date END,
      score_version = excluded.score_version`)
    .bind(round.quizId, round.browserId, round.name, round.className, round.totalPoints, now, round.scoreVersion || 'sek2-v1')
    .run();
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  return {
    ...(origin ? {"access-control-allow-origin": origin} : {}),
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
    "vary": "Origin",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
}

function validBrowserId(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function readBody(request) {
  const raw = await request.text();
  if (raw.length > 16384) throw new RangeError('Anfrage zu groß.');
  const body = JSON.parse(raw);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new SyntaxError('Objekt erwartet.');
  return body;
}

async function proxyRound(env, body, path) {
  if (!parseQuizId(body.quizId) || !validBrowserId(body.browserId)) return json({ error: "Ungültige Runde." }, 400);
  const id = env.ROUNDS.idFromName(`${body.quizId}:${body.browserId}`);
  const stub = env.ROUNDS.get(id);
  return stub.fetch(new Request(`https://round.internal/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim());
    if (origin && origin !== new URL(request.url).origin && !allowed.includes(origin))
      return json({error: 'Herkunft nicht freigegeben.'}, 403, {'cache-control': 'no-store'});
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/v1/status" && request.method === "GET") {
        if (!env.ROUNDS || !env.DB) return json({ ok: false }, 503, headers);
        await env.DB.prepare("SELECT 1 FROM leaderboard LIMIT 1").all();
        return json({ ok: true, scoreVersion: SCORE_VERSION }, 200, headers);
      }
      if (url.pathname === "/api/v1/competition/start" && request.method === "POST") {
        const body = await readBody(request);
        const parsed = parseQuizId(body.quizId);
        if (!parsed || !validBrowserId(body.browserId)) return json({ error: "Quiz oder Browserkennung ungültig." }, 400, headers);
        body.className = parsed.className;
        body.name = safeName(body.name);
        return await proxyRound(env, body, "start").then(async r => json(await r.json(), r.status, headers));
      }
      if (url.pathname === "/api/v1/competition/resume" && request.method === "GET") {
        const body = { quizId: url.searchParams.get("quizId"), browserId: url.searchParams.get("browserId"), roundId: url.searchParams.get("roundId") };
        const r = await proxyRound(env, body, "resume");
        return json(await r.json(), r.status, headers);
      }
      if (url.pathname === "/api/v1/competition/answer" && request.method === "POST") {
        const body = await readBody(request);
        const r = await proxyRound(env, body, "answer");
        return json(await r.json(), r.status, headers);
      }
      if (url.pathname === "/api/v1/competition/next" && request.method === "POST") {
        const body = await readBody(request);
        const r = await proxyRound(env, body, "next");
        return json(await r.json(), r.status, headers);
      }
      if (url.pathname === "/api/v1/leaderboard" && request.method === "GET") {
        const quizId = url.searchParams.get("quizId");
        const parsed = parseQuizId(quizId);
        const className = url.searchParams.get("class");
        const scoreVersion = url.searchParams.get('scoreVersion') || SCORE_VERSION;
        if (!SCORE_VERSIONS.has(scoreVersion)) return json({error: 'Wertung nicht gefunden.'}, 400, headers);
        if (!parsed || className !== parsed.className) return json({ error: "Ungültige Ranglistenabfrage." }, 400, headers);
        // quiz_id includes the grade and field, isolating all 24 quiz leaderboards.
        const result = await env.DB.prepare(`SELECT pseudonym AS name, class_name AS className, best_points AS points, best_date AS date
          FROM leaderboard WHERE quiz_id = ? AND class_name = ? AND score_version = ? ORDER BY best_points DESC, best_date ASC LIMIT 50`)
          .bind(quizId, className, scoreVersion).all();
        let priorPoints = null, priorRank = 0;
        const entries = (result.results || []).map((row, i) => {
          const rank = row.points === priorPoints ? priorRank : i + 1;
          priorPoints = row.points; priorRank = rank;
          return { name: row.name, className: row.className, points: row.points, date: row.date.slice(0, 10), rank };
        });
        return json({ entries, scoreVersion }, 200, headers);
      }
      return json({ error: "Route nicht gefunden." }, 404, headers);
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof RangeError) return json({error: 'Ungültige Anfrage.'}, 400, headers);
      return json({ error: "Serverfehler." }, 500, headers);
    }
  },
};

export class CompetitionRound {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.round = null;
    this.ready = ctx.blockConcurrencyWhile(async () => {
      this.round = await ctx.storage.get("round") || null;
    });
  }

  async persist() {
    await this.ctx.storage.put("round", this.round);
  }

  currentTask() {
    return this.round?.tasks?.[this.round.index] || null;
  }

  async beginCurrentTask() {
    const task = this.currentTask();
    if (!task || this.round.status !== "active") return null;
    if (!task.deadline) {
      task.openedAt = Date.now();
      task.deadline = task.openedAt + (task.timeLimitSeconds || 60) * 1000;
      await this.ctx.storage.setAlarm(task.deadline);
      await this.persist();
    }
    const hadPublicItems = Array.isArray(task.publicItems);
    const response = publicTask(task, new Date(task.deadline).toISOString());
    if (task.kind === "order" && !hadPublicItems && Array.isArray(task.publicItems)) await this.persist();
    return response;
  }

  resultFor(task, isFinal) {
    return {
      isCorrect: !!task.isCorrect,
      basePoints: task.basePoints || 0,
      timeBonus: task.timeBonus || 0,
      totalPoints: this.round.totalPoints,
      basePointsTotal: this.round.basePoints,
      timeBonusTotal: this.round.timeBonus,
      correctCount: this.round.correctCount,
      feedback: task.feedback || "Die Wertung wurde serverseitig geprüft.",
      finished: !!isFinal,
      scoreVersion: this.round.scoreVersion || 'sek2-v1',
    };
  }

  async completeIfFinal() {
    if (this.round.index < ROUND_LENGTH - 1) return false;
    if (this.round.status !== "completed") {
      this.round.status = "completed";
      this.round.finishedAt = Date.now();
      await this.ctx.storage.deleteAlarm();
      await this.persist();
    }
    await this.saveCompletedBest();
    await this.persist();
    return true;
  }

  async saveCompletedBest() {
    if (this.round?.status !== "completed" || this.round.leaderboardSaved) return;
    try {
      await saveBestScore(this.env, this.round);
    } catch (error) {
      await this.ctx.storage.setAlarm(Date.now() + 60_000);
      throw error;
    }
    this.round.leaderboardSaved = true;
    await this.persist();
  }

  async timeoutCurrentTask() {
    const task = this.currentTask();
    if (!task || task.answered || Date.now() < task.deadline) return;
    task.answered = true;
    task.timedOut = true;
    task.isCorrect = false;
    task.basePoints = 0;
    task.timeBonus = 0;
    task.feedback = "Die Zeit für diese Aufgabe ist abgelaufen.";
    const final = await this.completeIfFinal();
    task.result = this.resultFor(task, final);
    await this.persist();
  }

  async alarm() {
    await this.ready;
    await this.ctx.blockConcurrencyWhile(async () => {
      await this.timeoutCurrentTask();
      await this.saveCompletedBest();
    });
  }

  async fetch(request) {
    await this.ready;
    return this.ctx.blockConcurrencyWhile(() => this.route(request));
  }

  async route(request) {
    const path = new URL(request.url).pathname;
    const body = await request.json().catch(() => ({}));
    if (path === "/start") return this.start(body);
    if (path === "/resume") return this.resume(body);
    if (path === "/answer") return this.answer(body);
    if (path === "/next") return this.next(body);
    return json({ error: "Interne Route nicht gefunden." }, 404);
  }

  async start(body) {
    const parsed = parseQuizId(body.quizId);
    if (!parsed || !validBrowserId(body.browserId)) return json({ error: "Ungültige Runde." }, 400);
    if (this.round?.status === "active" && this.round.quizId === body.quizId && this.round.browserId === body.browserId) {
      return this.resume(body);
    }
    await this.saveCompletedBest();
    const tasks = [], prompts = new Set();
    for (let i = 0; i < ROUND_LENGTH; i++) {
      let task;
      for (let attempt = 0; attempt < 12; attempt++) {
        task = labelAbiTask(body.quizId, i, makeTask(body.quizId, i));
        if (!prompts.has(task.prompt) || ['choice', 'order', 'match'].includes(task.kind)) break;
      }
      prompts.add(task.prompt);
      tasks.push({...task, id: crypto.randomUUID()});
    }
    this.round = {
      roundId: crypto.randomUUID(), quizId: body.quizId, grade: parsed.grade, field: parsed.field,
      browserId: body.browserId, name: safeName(body.name), className: parsed.className,
      startedAt: Date.now(), index: 0, status: "active", totalPoints: 0,
      basePoints: 0, timeBonus: 0, correctCount: 0, scoreVersion: SCORE_VERSION,
      tasks,
      requests: {},
    };
    const question = await this.beginCurrentTask();
    return json({ roundId: this.round.roundId, scoreVersion: this.round.scoreVersion, roundStartedAt: new Date(this.round.startedAt).toISOString(), question });
  }

  async resume(body) {
    if (!this.round || this.round.quizId !== body.quizId || this.round.browserId !== body.browserId || (body.roundId && body.roundId !== this.round.roundId)) {
      return json({ error: "Keine fortsetzbare Runde gefunden." }, 404);
    }
    if (this.round.status === "completed") {
      await this.saveCompletedBest();
      return json({ roundId: this.round.roundId, scoreVersion: this.round.scoreVersion || 'sek2-v1', roundStartedAt: new Date(this.round.startedAt).toISOString(),
        index: ROUND_LENGTH - 1, totalPoints: this.round.totalPoints, correctCount: this.round.correctCount,
        basePoints: this.round.basePoints, timeBonus: this.round.timeBonus, finished: true });
    }
    if (this.round.status !== "active") return json({ error: "Keine fortsetzbare Runde gefunden." }, 404);
    const current = this.currentTask();
    if (current?.answered && this.round.index < ROUND_LENGTH - 1) {
      this.round.index++;
      await this.persist();
    }
    const question = await this.beginCurrentTask();
    return json({
      roundId: this.round.roundId, scoreVersion: this.round.scoreVersion || 'sek2-v1', roundStartedAt: new Date(this.round.startedAt).toISOString(),
      index: this.round.index, totalPoints: this.round.totalPoints, correctCount: this.round.correctCount,
      basePoints: this.round.basePoints, timeBonus: this.round.timeBonus, question,
    });
  }

  async answer(body) {
    if (!this.round || body.quizId !== this.round.quizId || body.roundId !== this.round.roundId || body.browserId !== this.round.browserId) {
      return json({ error: "Diese Runde gehört nicht zu diesem Browser." }, 403);
    }
    if (typeof body.requestId !== "string" || body.requestId.length < 8 || body.requestId.length > 100) return json({ error: "Ungültige Anfragekennung." }, 400);
    if (this.round.requests[body.requestId]) return json(this.round.requests[body.requestId]);
    const task = this.currentTask();
    if (!task || task.id !== body.questionId) return json({ error: "Aufgabe stimmt nicht mit der aktiven Runde überein." }, 409);
    if (task.answered) {
      if (this.round.status === "completed") await this.saveCompletedBest();
      const result = task.result || this.resultFor(task, this.round.status === "completed");
      this.round.requests[body.requestId] = result;
      await this.persist();
      return json(result);
    }
    if (this.round.status !== "active") return json({ error: "Diese Runde ist bereits abgeschlossen." }, 409);
    if (Date.now() >= task.deadline) await this.timeoutCurrentTask();
    else {
      const score = scoreAnswer(task, body.answer, Date.now(), task.deadline);
      task.answered = true;
      task.isCorrect = score.isCorrect;
      task.basePoints = score.basePoints;
      task.timeBonus = score.timeBonus;
      task.feedback = task.solution;
      this.round.basePoints += score.basePoints;
      this.round.timeBonus += score.timeBonus;
      this.round.totalPoints += score.basePoints + score.timeBonus;
      if (score.isCorrect) this.round.correctCount++;
      const final = await this.completeIfFinal();
      task.result = this.resultFor(task, final);
      await this.persist();
    }
    const response = task.result || this.resultFor(task, this.round.status === "completed");
    this.round.requests[body.requestId] = response;
    await this.persist();
    return json(response);
  }

  async next(body) {
    if (!this.round || this.round.status !== "active" || body.quizId !== this.round.quizId || body.roundId !== this.round.roundId || body.browserId !== this.round.browserId) {
      return json({ error: "Diese Runde gehört nicht zu diesem Browser." }, 403);
    }
    const task = this.currentTask();
    if (!task) return json({ error: "Keine aktive Aufgabe." }, 409);
    // A repeated next request after a lost response returns the same task.
    if (body.questionId && body.questionId !== task.id) {
      const previous = this.round.tasks[this.round.index - 1];
      if (previous?.id !== body.questionId || !previous.answered)
        return json({error: 'Aufgabenkennung stimmt nicht überein.'}, 409);
      return json({question: await this.beginCurrentTask(), index: this.round.index});
    }
    if (!task.answered && Date.now() >= task.deadline) await this.timeoutCurrentTask();
    if (!task.answered) return json({ error: "Die aktuelle Aufgabe ist noch offen." }, 409);
    if (this.round.status === "completed") return json({ finished: true, totalPoints: this.round.totalPoints, correctCount: this.round.correctCount });
    this.round.index++;
    await this.persist();
    const question = await this.beginCurrentTask();
    return json({ question, index: this.round.index });
  }
}

export { SCORE_VERSION, makeTask, labelAbiTask, parseQuizId, publicTask };
