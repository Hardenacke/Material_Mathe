const SCORE_VERSION = "v1";
const ROUND_LENGTH = 12;
const TASK_LIMIT_MS = 60_000;
const ALLOWED_FIELDS = new Set(["arithmetik-algebra", "funktionen", "geometrie", "stochastik"]);

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
  const match = String(quizId ?? "").match(/^(5|6|7|8|9|10)-(arithmetik-algebra|funktionen|geometrie|stochastik)$/);
  if (!match || !ALLOWED_FIELDS.has(match[2])) return null;
  return { grade: Number(match[1]), field: match[2] };
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

function makeTask(quizId, index) {
  const { grade, field } = parseQuizId(quizId);
  const slot = index % 5;
  const r = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  if (field === "arithmetik-algebra") {
    if (grade <= 5) {
      const a = r(14, 45); let b = r(6, 29);
      if (a === b) b = b === 29 ? 28 : b + 1;
      if (slot === 0) return num(`Berechne \\(${a}+${b}\\).`, a + b, "Addiere Einer und Zehner.");
      if (slot === 1) return choice(`Welche Zahl ist größer?`, [`\\(${a}\\)`, `\\(${b}\\)`, "Beide sind gleich"], a > b ? 0 : a < b ? 1 : 2, `Vergleiche zuerst die Zehner, dann die Einer.`);
      if (slot === 2) return slider(`Setze \\(${a + b}\\) auf dem Zahlenstrahl.`, 0, 100, a + b, "Addiere und markiere das Ergebnis.", 1, 0);
      return num(`Runde \\(${a + b + 13}\\) auf den nächsten Zehner.`, Math.round((a + b + 13) / 10) * 10, "Die Einerstelle entscheidet über das Runden.");
    }
    if (grade === 6) {
      const a = r(1, 4), b = r(5, 9), c = r(1, 3), d = r(2, 7);
      if (slot === 0) return fraction(`Berechne \\(${a}/${b}+${c}/${d}\\).`, a * d + b * c, b * d, "Erweitere auf einen gemeinsamen Nenner.");
      if (slot === 1) return choice(`Welcher Bruch ist gleich \\(${a}/${b}\\)?`, [`\\(${a + b}/${b}\\)`, `\\(${2 * a}/${2 * b}\\)`, `\\(${a + 2 * b}/${b}\\)`], 1, "Beim Erweitern werden Zähler und Nenner mit derselben Zahl multipliziert.");
      if (slot === 2) return slider(`Markiere \\(${a}/${b}\\) auf dem Zahlenstrahl.`, 0, 1, a / b, "Teile die Strecke in gleich große Teile.", 0.01, 0.03);
      return num(`Schreibe \\(${c}/4\\) als Dezimalzahl.`, c / 4, "Teile den Zähler durch den Nenner.");
    }
    if (grade === 7) {
      const a = r(-8, 12); let b = r(-9, 12);
      if (a === b) b = b === 12 ? 11 : b + 1;
      if (slot === 0) return num(`Berechne \\(${a}\\cdot(${b})\\).`, a * b, "Bestimme das Vorzeichen und multipliziere die Beträge.");
      if (slot === 1) return choice("Welche Zahl ist kleiner?", [`\\(${a}\\)`, `\\(${b}\\)`, "Sie sind gleich"], a < b ? 0 : a > b ? 1 : 2, "Auf der Zahlengeraden liegt die kleinere Zahl weiter links.");
      if (slot === 2) return slider(`Ordne \\(${a - b}\\) auf der Zahlengeraden ein.`, -25, 25, a - b, "Berechne die Differenz und beachte die Vorzeichen.", 1, 0);
      if (slot === 3) return order("Ordne die Rechenschritte beim Multiplizieren rationaler Zahlen.", ["Beträge multiplizieren", "Vorzeichen bestimmen", "Ergebnis mit Vorzeichen notieren"], ["Vorzeichen bestimmen", "Beträge multiplizieren", "Ergebnis mit Vorzeichen notieren"], "Erst das Vorzeichen bestimmen, dann die Beträge multiplizieren.");
      return num(`Berechne \\(${-a}+${b}\\).`, -a + b, "Addiere die rationalen Zahlen mit ihren Vorzeichen.");
    }
    if (grade === 8) {
      const a = r(2, 5), x = r(2, 8), b = r(1, 9), c = a * x + b;
      if (slot === 0) return num(`Löse \\(${a}x+${b}=${c}\\).`, x, `Ziehe \\(${b}\\) ab und teile durch \\(${a}\\).`);
      if (slot === 1) return choice(`Welche Umformung löst \\(${a}x+${b}=${c}\\) zuerst?`, [`\\(${a}x=${c - b}\\)`, `\\(${a}x=${c + b}\\)`, `\\(x+${b}=${c}\\)`], 0, "Führe auf beiden Seiten dieselbe Umformung aus.");
      if (slot === 2) return slider(`Markiere die Lösung von \\(${a}x+${b}=${c}\\).`, 0, 10, x, "Isoliere x durch Äquivalenzumformungen.", 0.1, 0.1);
      if (slot === 3) return order("Ordne die Schritte zum Lösen einer linearen Gleichung.", ["Lösung durch Einsetzen prüfen", "Variable freistellen", "Gleichartige Terme zusammenfassen"], ["Gleichartige Terme zusammenfassen", "Variable freistellen", "Lösung durch Einsetzen prüfen"], "Vereinfache, stelle die Variable frei und prüfe durch Einsetzen.");
      return num(`Berechne \\(${a}x+${b}\\) für \\(x=${x}\\).`, c, "Setze x ein und rechne aus.");
    }
    if (grade === 9) {
      const a = r(4, 18), root = r(5, 14), radicand = root * root + r(1, 2);
      if (slot === 0) return num(`Berechne \\(\\sqrt{${root * root}}\\).`, root, "Die Quadratwurzel macht das Quadrieren rückgängig.");
      if (slot === 1) return choice("Welche Zahl ist irrational?", [`\\(\\sqrt{${root * root}}\\)`, `\\(\\sqrt{${root * root + 1}}\\)`, `\\(${root * root}\\)`], 1, "Die Wurzel aus einer Nicht-Quadratzahl ist irrational.");
      if (slot === 2) return slider(`Schätze \\(\\sqrt{${radicand}}\\) auf der Zahlengeraden.`, root, root + 1, Math.sqrt(radicand), "Die Wurzel liegt zwischen zwei benachbarten Quadratzahlen.", 0.01, 0.25);
      return choice(`Vereinfache \\(\\sqrt{${4 * a * a}}\\).`, [`\\(${2 * a}\\)`, `\\(${4 * a}\\)`, `\\(${a * a}\\)`], 0, "Ziehe die Wurzel aus dem Quadrat.");
    }
    const a = r(2, 5), b = r(2, 4), x = r(2, 5);
    if (slot === 0) return num(`Löse \\(2^x=2^{${x}}\\).`, x, "Bei gleicher Basis müssen die Exponenten übereinstimmen.");
    if (slot === 1) return num(`Vereinfache: \\(2^{${a}}\\cdot2^{${b}}=2^x\\).`, a + b, "Bei gleicher Basis addierst du die Exponenten.");
    if (slot === 2) return num(`Berechne \\(\\sqrt{${a * a}}\\cdot\\sqrt{${b * b}}\\).`, a * b, "Ziehe beide Quadratwurzeln einzeln.");
    return num(`Löse \\(3^x=${3 ** x}\\).`, x, "Schreibe die rechte Seite als Potenz zur Basis 3.");
  }

  if (field === "funktionen") {
    if (grade <= 5) {
      const start = r(2, 10), step = r(2, 5), n = r(3, 8);
      if (slot === 0) return num(`Folge: \\(${start}, ${start + step}, ${start + 2 * step}, \\dots\\). Welches Glied folgt?`, start + 3 * step, `Addiere jeweils \\(${step}\\).`);
      if (slot === 1) return choice("Welche Regel passt zu 3, 6, 12, 24, …?", ["Jedes Glied verdoppeln", "Immer 3 addieren", "Immer 2 abziehen"], 0, "Jedes Glied ist doppelt so groß wie das vorherige.");
      if (slot === 2) return slider(`Die Folge beginnt bei \\(${start}\\) und wächst um \\(${step}\\). Markiere das fünfte Glied.`, 0, 50, start + 4 * step, "Gehe vier Schritte vom Startwert aus.", 1, 0);
      return num(`Berechne \\(3n+2\\) für \\(n=${n}\\).`, 3 * n + 2, "Setze n in den Term ein.");
    }
    if (grade <= 7) {
      const m = r(2, 7), x = r(3, 8);
      if (slot === 0) return num(`Bei \\(y=${m}x\\): Berechne y für \\(x=${x}\\).`, m * x, "Multipliziere x mit dem Proportionalitätsfaktor.");
      if (slot === 1) return choice("Welche Aussage beschreibt eine proportionale Zuordnung?", ["Der Quotient y/x bleibt gleich.", "Die Summe x+y bleibt immer gleich.", "Der Graph ist eine Parabel."], 0, "Bei einer proportionalen Zuordnung ist der Quotient konstant.");
      if (slot === 2) return slider(`Für \\(y=${m}x\\): Markiere y bei \\(x=${x}\\).`, 0, 80, m * x, "Setze x ein und multipliziere mit dem Faktor.", 1, 0);
      return num(`Ein Stück kostet \\(${m}\\) Euro. Wie viel kosten \\(${x}\\) Stück?`, m * x, "Multipliziere Anzahl und Stückpreis.");
    }
    if (grade === 8) {
      const m = r(2, 6), b = r(-5, 8), x = r(2, 6), y = m * x + b;
      if (slot === 0) return num(`Berechne \\(y=${m}x${b >= 0 ? "+" : ""}${b}\\) für \\(x=${x}\\).`, y, "Setze x ein und beachte die Rechenreihenfolge.");
      if (slot === 1) return choice(`Welche Steigung hat \\(y=${m}x${b >= 0 ? "+" : ""}${b}\\)?`, [`\\(${m}\\)`, `\\(${b === m ? m + 1 : b}\\)`, `\\(${b === 0 ? m + 2 : m + b}\\)`], 0, "Die Steigung ist der Koeffizient vor x.");
      if (slot === 2) return slider(`Markiere den y-Achsenabschnitt von \\(y=${m}x${b >= 0 ? "+" : ""}${b}\\).`, -10, 10, b, "Setze x=0 ein.", 1, 0);
      return num(`Berechne den Funktionswert von \\(f(x)=${m}x${b >= 0 ? "+" : ""}${b}\\) für \\(x=${x}\\).`, y, "Setze x in den Funktionsterm ein.");
    }
    if (grade === 9) {
      const a = r(1, 4), v = r(-2, 4), x = r(-2, 4), val = a * (x - v) ** 2;
      const term = v >= 0 ? `x-${v}` : `x+${Math.abs(v)}`;
      if (slot === 0) return num(`Für \\(f(x)=${a}(${term})^2\\): Berechne \\(f(${x})\\).`, val, "Setze x ein und quadriere die Klammer.");
      if (slot === 1) return choice(`Der Scheitelpunkt von \\(f(x)=${a}(${term})^2+2\\) ist …`, [`\\((${v}|2)\\)`, `\\((${v + 1}|2)\\)`, `\\((${v}|1)\\)`], 0, "Lies den Scheitelpunkt aus der Scheitelpunktform ab.");
      if (slot === 2) return slider(`Markiere die Symmetrieachse von \\(f(x)=${a}(${term})^2+2\\).`, -6, 6, v, "Die Symmetrieachse geht durch die x-Koordinate des Scheitelpunkts.", 1, 0);
      return num(`Bestimme den Scheitelwert von \\(f(x)=${a}(${term})^2+2\\).`, 2, "Der Scheitelwert ist der y-Wert des Scheitelpunkts.");
    }
    const amplitude = r(1, 3), period = r(4, 10), periods = r(2, 4);
    if (slot === 0) return num(`Bestimme die Amplitude von \\(f(t)=${amplitude}\\sin(2\\pi t/${period})\\).`, amplitude, "Die Amplitude ist der Betrag des Faktors vor dem Sinus.");
    if (slot === 1) return choice(`Welche Periode hat \\(f(t)=${amplitude}\\sin(2\\pi t/${period})\\)?`, [`\\(${period}\\)`, `\\(${amplitude}\\)`, `\\(${2 * period}\\)`], 0, "Lies die Periodenlänge T aus dem Funktionsterm ab.");
    if (slot === 2) return slider(`Markiere die Amplitude \\(${amplitude}\\).`, 0, 8, amplitude, "Die Amplitude ist die maximale Auslenkung.", 0.1, 0.2);
    return num(`Wie viele volle Perioden mit \\(T=${period}\\) liegen in \\(t=${period * periods}\\)?`, periods, "Teile die Zeit durch die Periodenlänge.");
  }

  if (field === "geometrie") {
    if (slot === 0) {
      if (grade <= 5) return construct("Setze vom markierten Startpunkt aus den Endpunkt einer waagerechten Strecke, die vier Kästchen nach rechts reicht.", [[0, 0]], [[4, 0]], "Die Strecke verläuft vom Startpunkt vier Kästchen waagerecht nach rechts.");
      if (grade === 6) return construct("Ergänze die waagerechte Grundseite zu einem Rechteck: drei Kästchen breit und zwei Kästchen hoch. Setze zuerst die obere rechte, dann die obere linke Ecke.", [[0, 0], [3, 0]], [[3, 2], [0, 2]], "Die oberen Ecken liegen jeweils senkrecht über den Endpunkten der Grundseite.");
      if (grade === 7) return construct("Spiegle den markierten Punkt an der x-Achse.", [[-2, 2]], [[-2, -2]], "Bei der Spiegelung an der x-Achse bleibt x gleich; y wechselt das Vorzeichen.");
      if (grade === 8) return construct("Die Grundseite reicht von \\((-2|-1)\\) bis \\((2|-1)\\). Setze die Spitze vier Kästchen senkrecht über dem Mittelpunkt der Grundseite.", [[-2, -1], [2, -1]], [[0, 3]], "Der Mittelpunkt liegt bei (0|-1); vier Kästchen darüber liegt die Spitze bei (0|3).");
      if (grade === 9) return construct("Die waagerechte Kathete ist vier Kästchen lang. Setze vom rechten Endpunkt \\((1|-2)\\) aus die zweite Kathete drei Kästchen senkrecht nach oben.", [[-3, -2], [1, -2]], [[1, 1]], "Die Katheten stehen senkrecht aufeinander. Drei Kästchen über (1|-2) liegt (1|1).");
      return construct("Die Grundseite reicht von \\((-3|-1)\\) bis \\((3|-1)\\). Setze die Spitze vier Kästchen senkrecht über dem Mittelpunkt der Grundseite.", [[-3, -1], [3, -1]], [[0, 3]], "Der Mittelpunkt liegt bei (0|-1); vier Kästchen darüber liegt die Spitze bei (0|3).");
    }
    if (grade <= 5) {
      const a = r(3, 9), b = r(2, 6);
      if (slot === 0) return num(`Rechteck mit Länge \\(${a}\\) und Breite \\(${b}\\): Umfang?`, 2 * (a + b), "Addiere alle vier Seiten.");
      if (slot === 1) return num(`Rechteck mit Länge \\(${a}\\) und Breite \\(${b}\\): Flächeninhalt?`, a * b, "Flächeninhalt = Länge · Breite.");
      if (slot === 2) return choice("Welche Figur hat vier gleich lange Seiten und vier rechte Winkel?", ["Quadrat", "Dreieck", "Kreis"], 0, "Ein Quadrat hat vier gleich lange Seiten und vier rechte Winkel.");
      return num("Wie viele Ecken hat ein Sechseck?", 6, "Ein Sechseck hat sechs Ecken.");
    }
    if (grade === 6) {
      const a = r(3, 7), b = r(2, 6), h = r(2, 5);
      if (slot === 0) return num(`Quader mit Kanten \\(${a}\\), \\(${b}\\), \\(${h}\\): Volumen?`, a * b * h, "Multipliziere Länge, Breite und Höhe.");
      if (slot === 1) return choice("Welche Darstellung zeigt alle Flächen eines Körpers aufgeklappt?", ["Netz", "Schrägbild", "Koordinatensystem"], 0, "Ein Netz zeigt die Flächen in der Ebene.");
      if (slot === 2) return num(`Rechteck mit Länge \\(${a}\\), Breite \\(${b}\\): Flächeninhalt?`, a * b, "Multipliziere Länge und Breite.");
      return num(`Dreieck mit Grundseite \\(${a}\\) und Höhe \\(${h}\\): Flächeninhalt?`, a * h / 2, "Flächeninhalt = Grundseite · Höhe : 2.");
    }
    if (grade <= 8) {
      const a = r(35, 100), b = r(25, Math.min(70, 160 - a)), third = 180 - a - b;
      if (slot === 0) return num(`Dreieck mit Winkeln \\(${a}^\\circ\\), \\(${b}^\\circ\\) und \\(x^\\circ\\): Bestimme x.`, third, "Die Innenwinkelsumme im Dreieck ist 180 Grad.");
      if (slot === 1) return choice("Nebenwinkel ergänzen sich zu …", ["180°", "90°", "360°"], 0, "Nebenwinkel bilden eine gestreckte Linie.");
      if (slot === 2) return num(`Ein Winkel ist \\(${a}^\\circ\\). Wie groß ist sein Nebenwinkel?`, 180 - a, "Nebenwinkel ergeben zusammen 180 Grad.");
      return choice("Welche Aussage gilt für ein gleichschenkliges Dreieck?", ["Die Basiswinkel sind gleich groß.", "Alle drei Seiten sind verschieden.", "Die Winkelsumme beträgt 90°."], 0, "Gleich lange Seiten liegen gleich großen Winkeln gegenüber.");
    }
    if (grade === 9) {
      const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]], t = triples[r(0, 2)];
      if (slot === 0) return num(`Katheten \\(${t[0]}\\) und \\(${t[1]}\\): Wie lang ist die Hypotenuse?`, t[2], "Nutze den Satz des Pythagoras.");
      if (slot === 1) return choice("Bei ähnlichen Dreiecken sind …", ["entsprechende Winkel gleich groß.", "alle Seiten gleich lang.", "alle Flächeninhalte gleich."], 0, "Ähnliche Dreiecke haben gleiche Winkel und proportionale Seiten.");
      if (slot === 2) return slider(`Strecke \\(${t[0]}\\) mit Faktor 2: Wie lang ist das Bild?`, 0, 30, 2 * t[0], "Multipliziere die Ausgangslänge mit dem Streckfaktor.", 1, 0);
      return num(`Hypotenuse \\(${t[2]}\\), Kathete \\(${t[0]}\\): Bestimme die andere Kathete.`, t[1], "Nutze die Umkehrung des Satzes des Pythagoras.");
    }
    const radius = r(2, 7), a = r(3, 8);
    if (slot === 0) return num(`Kreis mit Radius \\(${radius}\\) cm: Flächeninhalt mit \\(\\pi\\approx3{,}14\\).`, Math.PI * radius * radius, "Nutze A = πr².", 0.2, "cm²");
    if (slot === 1) return choice("Sinus im rechtwinkligen Dreieck ist …", ["Gegenkathete / Hypotenuse", "Ankathete / Hypotenuse", "Gegenkathete / Ankathete"], 0, "sin(α) = Gegenkathete / Hypotenuse.");
    if (slot === 2) return num(`Gegenkathete \\(${a}\\), Hypotenuse \\(${2 * a}\\): Bestimme sin(α).`, 0.5, "Sinus = Gegenkathete geteilt durch Hypotenuse.");
    return num(`Kreis mit Radius \\(${radius}\\) cm: Umfang mit \\(\\pi\\approx3{,}14\\).`, 2 * Math.PI * radius, "Nutze U = 2πr.", 0.2, "cm");
  }

  if (grade <= 5) {
    const a = r(2, 8), b = r(2, 8);
    if (slot === 0) return num(`Strichliste: \\(${a}\\) Stimmen für Rot und \\(${b}\\) für Blau. Wie viele Stimmen insgesamt?`, a + b, "Addiere die Häufigkeiten.");
    if (slot === 1) return choice("Welche Darstellung eignet sich, um Häufigkeiten zu vergleichen?", ["Säulendiagramm", "Dreieckskonstruktion", "Zahlenfolge"], 0, "Säulen machen Häufigkeiten gut vergleichbar.");
    if (slot === 2) return slider(`Bei \\(${a + b}\\) Versuchen gab es \\(${a}\\) Treffer. Markiere die relative Häufigkeit.`, 0, 1, a / (a + b), "Relative Häufigkeit = Trefferzahl geteilt durch Versuchszahl.", 0.01, 0.04);
    return num(`Von \\(${a + b}\\) Kindern haben \\(${a}\\) ein Haustier. Wie viele keines?`, b, "Gesamtzahl minus Teilgruppe.");
  }
  if (grade === 6) {
    const data = [r(1, 4), r(3, 6), r(4, 7), r(6, 9), r(8, 12)].sort((a, b) => a - b);
    const mean = data.reduce((a, b) => a + b, 0) / data.length, median = data[2], spread = data[4] - data[0];
    if (slot === 0) return num(`Bestimme den Mittelwert von \\(${data.join(", ")}\\).`, mean, "Addiere alle Werte und teile durch ihre Anzahl.");
    if (slot === 1) {
      const alternative = data[4] === median + 1 ? median - 1 : data[4];
      return choice(`Welcher Wert ist der Median von \\(${data.join(", ")}\\)?`, [median, median + 1, alternative].map(x => `\\(${x}\\)`), 0, "Sortiere die Werte und nimm den mittleren Wert.");
    }
    if (slot === 2) return slider(`Markiere den Median \\(${median}\\).`, 0, 12, median, "Der Median ist bei fünf Werten der dritte Wert.", 1, 0);
    if (slot === 3) return match("Ordne die Kenngröße ihrer Bedeutung zu.", [
      { left: "Spannweite", options: ["größter minus kleinster Wert", "mittlerer Wert"], correct: 0 },
      { left: "Median", options: ["größter minus kleinster Wert", "mittlerer Wert"], correct: 1 },
    ], "Die Spannweite beschreibt die Randwerte; der Median ist der mittlere sortierte Wert.");
    return num(`Bestimme die Spannweite von \\(${data.join(", ")}\\).`, spread, "Größter Wert minus kleinster Wert.");
  }
  if (grade <= 7) {
    const trials = grade === 7 ? 10 : 12, hits = r(2, trials - 2);
    if (slot === 0) return num(`Bei \\(${trials}\\) Versuchen gibt es \\(${hits}\\) Treffer. Relative Häufigkeit in Prozent?`, 100 * hits / trials, "Teile die Trefferzahl durch die Versuchszahl und multipliziere mit 100.", 0.001, "%");
    if (slot === 1) return choice("Die relative Häufigkeit beschreibt …", ["den Anteil der Treffer an allen Versuchen.", "die Anzahl möglicher Ergebnisse.", "immer die sichere Wahrscheinlichkeit."], 0, "Sie setzt Trefferzahl und Gesamtzahl ins Verhältnis.");
    if (slot === 2) return slider(`Schätze die Trefferwahrscheinlichkeit aus \\(${hits}\\) von \\(${trials}\\) Versuchen.`, 0, 1, hits / trials, "Die relative Häufigkeit liefert eine Schätzung.", 0.01, 0.05);
    return num(`Wie viele Nicht-Treffer gab es bei \\(${trials}\\) Versuchen mit \\(${hits}\\) Treffern?`, trials - hits, "Ziehe die Trefferzahl von der Gesamtzahl ab.");
  }
  if (grade === 8) {
    const n = r(2, 4);
    if (slot === 0) return num(`Bei \\(${n}\\) Münzwürfen: Wie viele geordnete Ergebnisfolgen gibt es?`, 2 ** n, `Es gibt \\(2^{${n}}\\) gleich wahrscheinliche Folgen.`);
    if (slot === 1) return choice("Bei zwei fairen Münzwürfen: Wahrscheinlichkeit für genau zwei Köpfe?", ["1/4", "1/2", "3/4"], 0, "Nur Kopf-Kopf ist günstig: 1 von 4 Ergebnissen.");
    if (slot === 2) return slider("Markiere die Wahrscheinlichkeit für mindestens einen Kopf bei zwei Würfen.", 0, 1, 0.75, "Drei von vier Ergebnissen enthalten mindestens einen Kopf.", 0.01, 0.05);
    return num("Fairer Würfel: Wahrscheinlichkeit für eine gerade Zahl in Prozent?", 50, "Drei von sechs Zahlen sind gerade.", 0.001, "%");
  }
  if (grade === 9) {
    const total = r(16, 30), count = r(4, Math.floor(total / 2)), b = r(4, 8), a = r(2, b);
    if (slot === 0) return num(`Von \\(${total}\\) Personen wählen \\(${count}\\) Option A. Anteil in Prozent?`, 100 * count / total, "Teile durch die Gesamtzahl und rechne in Prozent um.", 0.001, "%");
    if (slot === 1) return choice("Eine Diagrammachse beginnt bei 90 statt bei 0. Welche Wirkung kann das haben?", ["Unterschiede wirken größer.", "Die Messwerte ändern sich.", "Das Diagramm wird automatisch unverzerrt."], 0, "Ein abgeschnittener Maßstab kann Unterschiede optisch übertreiben.");
    if (slot === 2) return slider(`Von \\(${b}\\) Personen mit B haben \\(${a}\\) auch A. Markiere P(A|B).`, 0, 1, a / b, "Bedingt auf B teilst du durch die Zahl der B-Fälle.", 0.01, 0.05);
    return num(`Eine Umfrage hat \\(${total}\\) Antworten, davon \\(${count}\\) für A. Relative Häufigkeit als Dezimalzahl?`, count / total, "Teile die Häufigkeit durch die Gesamtzahl.");
  }
  const p = r(1, 4) / 10, q = r(4, 8) / 10;
  if (slot === 0) return num(`Es gilt P(A∩B)=${p} und P(B)=${q}. Bestimme P(A|B).`, p / q, "Nutze P(A|B)=P(A∩B)/P(B).", 0.001);
  if (slot === 1) return choice("Welche Bedingung gilt für unabhängige Ereignisse?", ["P(A|B)=P(A)", "P(A∩B)=0", "P(A)=P(B)"], 0, "Bei Unabhängigkeit ändert B die Wahrscheinlichkeit von A nicht.");
  if (slot === 2) return slider(`Ordne P(A|B)=${p} auf der Wahrscheinlichkeitsskala ein.`, 0, 1, p, "Wahrscheinlichkeiten liegen zwischen null und eins.", 0.01, 0.04);
  return choice("Welche Darstellung zeigt die Kombination zweier Merkmale?", ["Vierfeldertafel", "Baumdiagramm", "Zahlengerade"], 0, "Eine Vierfeldertafel kombiniert zwei Merkmale.");
}

function publicTask(task, expiresAt) {
  const allowed = ["id", "kind", "prompt", "options", "items", "min", "max", "step", "unit", "fixed"];
  const result = {};
  for (const key of allowed) if (task[key] !== undefined) result[key] = task[key];
  if (task.pairs) result.pairs = task.pairs.map(({ left, options }) => ({ left, options }));
  if (task.kind === "construct") result.requiredPoints = task.points.length;
  result.expiresAt = expiresAt;
  return result;
}

export function evaluateAnswer(task, value) {
  const asNumber = x => typeof x === "number" ? x :
    typeof x === "string" && x.trim() ? Number(x.trim().replace(",", ".")) : NaN;
  if (task.kind === "number") {
    const n = asNumber(value);
    return Number.isFinite(n) && Math.abs(n - task.answer) <= (task.tol ?? 0.001) ? 1 : 0;
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
  const remainingSeconds = Math.min(60, Math.max(0, Math.ceil((deadline - now) / 1000)));
  const timeBonus = full ? Math.floor(50 * remainingSeconds / 60) : 0;
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
    .bind(round.quizId, round.browserId, round.name, round.className, round.totalPoints, now, SCORE_VERSION)
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
        body.className = String(parsed.grade);
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
        if (!parsed || className !== String(parsed.grade)) return json({ error: "Ungültige Ranglistenabfrage." }, 400, headers);
        // quiz_id includes the grade and field, isolating all 24 quiz leaderboards.
        const result = await env.DB.prepare(`SELECT pseudonym AS name, class_name AS className, best_points AS points, best_date AS date
          FROM leaderboard WHERE quiz_id = ? AND class_name = ? AND score_version = ? ORDER BY best_points DESC, best_date ASC LIMIT 50`)
          .bind(quizId, className, SCORE_VERSION).all();
        let priorPoints = null, priorRank = 0;
        const entries = (result.results || []).map((row, i) => {
          const rank = row.points === priorPoints ? priorRank : i + 1;
          priorPoints = row.points; priorRank = rank;
          return { name: row.name, className: row.className, points: row.points, date: row.date.slice(0, 10), rank };
        });
        return json({ entries, scoreVersion: SCORE_VERSION }, 200, headers);
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
      task.deadline = task.openedAt + TASK_LIMIT_MS;
      await this.ctx.storage.setAlarm(task.deadline);
      await this.persist();
    }
    return publicTask(task, new Date(task.deadline).toISOString());
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
      scoreVersion: SCORE_VERSION,
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
    this.round = {
      roundId: crypto.randomUUID(), quizId: body.quizId, grade: parsed.grade, field: parsed.field,
      browserId: body.browserId, name: safeName(body.name), className: String(parsed.grade),
      startedAt: Date.now(), index: 0, status: "active", totalPoints: 0,
      basePoints: 0, timeBonus: 0, correctCount: 0, scoreVersion: SCORE_VERSION,
      tasks: Array.from({ length: ROUND_LENGTH }, (_, i) => ({ ...makeTask(body.quizId, i), id: crypto.randomUUID() })),
      requests: {},
    };
    const question = await this.beginCurrentTask();
    return json({ roundId: this.round.roundId, roundStartedAt: new Date(this.round.startedAt).toISOString(), question });
  }

  async resume(body) {
    if (!this.round || this.round.quizId !== body.quizId || this.round.browserId !== body.browserId || (body.roundId && body.roundId !== this.round.roundId)) {
      return json({ error: "Keine fortsetzbare Runde gefunden." }, 404);
    }
    if (this.round.status === "completed") {
      await this.saveCompletedBest();
      return json({ roundId: this.round.roundId, roundStartedAt: new Date(this.round.startedAt).toISOString(),
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
      roundId: this.round.roundId, roundStartedAt: new Date(this.round.startedAt).toISOString(),
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

export { SCORE_VERSION, makeTask, parseQuizId, publicTask };
