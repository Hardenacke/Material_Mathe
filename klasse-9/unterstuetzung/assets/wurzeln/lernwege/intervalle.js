"use strict";
(function () {
  var h = window.WurzelWerkzeug;
  var a = 20;
  var stufe = 0;
  var intervalle = [
    { unten: 4, oben: 5, sicht: [3.8, 5.2], text: "Sicheres Intervall [4; 5], Breite 1." },
    { unten: 4.4, oben: 4.5, sicht: [4.38, 4.52], text: "Zoom auf [4,4; 4,5], Breite 0,1. Die zweite Skala ist vergrößert." },
    { unten: 4.47, oben: 4.48, sicht: [4.468, 4.482], text: "Zoom auf [4,47; 4,48], Breite 0,01. Der mögliche Fehler von 4,47 ist kleiner als 0,01." }
  ];
  var slider = h.element("zahl-test");

  function zeigeGraph() {
    var g = h.element("parabel");
    var px = function (x) { return 55 + x / 6 * 570; };
    var py = function (y) { return 255 - y / 36 * 205; };
    var punkte = [];
    for (var i = 0; i <= 120; i++) {
      var x = i / 20;
      punkte.push((i === 0 ? "M" : "L") + px(x).toFixed(2) + " " + py(x * x).toFixed(2));
    }
    var cent = Math.round(Number(slider.value) * 100);
    var test = cent / 100;
    var quadrat = cent * cent / 10000;
    var vergleich = quadrat < a ? " < 20: untere Grenze" :
      quadrat > a ? " > 20: obere Grenze" : " = 20: genau getroffen";
    g.replaceChildren(
      h.svg("line", { x1: 55, y1: 255, x2: 625, y2: 255, stroke: "#172b4d", "stroke-width": 3 }),
      h.svg("line", { x1: 55, y1: 255, x2: 55, y2: 45, stroke: "#172b4d", "stroke-width": 3 }),
      h.svg("path", { d: punkte.join(" "), fill: "none", stroke: "#7048a8", "stroke-width": 4 }),
      h.svg("line", { x1: 55, y1: py(20), x2: 625, y2: py(20), stroke: "#ba5b11", "stroke-width": 3 }),
      h.svg("circle", { cx: px(test), cy: py(quadrat), r: 9, fill: "#2166f3" }),
      h.svg("text", { x: 10, y: py(20) + 5, fill: "#ba5b11" }, "20"),
      h.svg("text", { x: 548, y: 282 }, "x"),
      h.svg("text", { x: 67, y: 50 }, "y = x²")
    );
    h.element("test-zahl").textContent = test.toFixed(2).replace(".", ",");
    h.element("test-rechnung").textContent = "(" + h.deutsch(test, 2) + ")² = " +
      h.deutsch(quadrat, 4) + vergleich + ".";
  }

  function zeigeIntervall() {
    var objekt = intervalle[stufe];
    var z = h.element("zahlengerade");
    var xp = function (wert) {
      return 55 + (wert - objekt.sicht[0]) / (objekt.sicht[1] - objekt.sicht[0]) * 590;
    };
    var links = xp(objekt.unten);
    var rechts = xp(objekt.oben);
    z.replaceChildren(
      h.svg("text", { x: 350, y: 27, "text-anchor": "middle", class: "accent" }, "√20 liegt im blauen Bereich"),
      h.svg("line", { x1: 55, y1: 98, x2: 645, y2: 98, stroke: "#172b4d", "stroke-width": 3 }),
      h.svg("line", { x1: links, y1: 72, x2: rechts, y2: 72, stroke: "#2166f3", "stroke-width": 13 }),
      h.svg("circle", { cx: links, cy: 72, r: 9, fill: "#008b8b" }),
      h.svg("circle", { cx: rechts, cy: 72, r: 9, fill: "#ba5b11" }),
      h.svg("text", { x: links, y: 145, "text-anchor": "middle", fill: "#008b8b" }, h.deutsch(objekt.unten, 2)),
      h.svg("text", { x: rechts, y: 145, "text-anchor": "middle", fill: "#ba5b11" }, h.deutsch(objekt.oben, 2))
    );
    h.element("zoom-hinweis").textContent = objekt.text + " √20 bleibt unbekannt, liegt aber sicher im blauen Abschnitt.";
    z.setAttribute("aria-label", "Vergrößerte Zahlengerade: " + objekt.text);
  }
  slider.addEventListener("input", zeigeGraph);
  zeigeGraph();
  zeigeIntervall();

  function pruefe(idUntere, idObere, schritt, feedback, neueStufe) {
    var u = h.zahl(h.element(idUntere).value);
    var o = h.zahl(h.element(idObere).value);
    if (!Number.isFinite(u) || !Number.isFinite(o)) {
      h.meldung(feedback, null, "Wähle beide Grenzen aus.");
      return;
    }
    var schachtelt = u * u < a && a < o * o;
    var direkt = Math.abs(o - u - schritt) < 1e-8;
    if (!schachtelt || !direkt) {
      h.meldung(feedback, false, "Vergleiche die Quadrate beider Zahlen mit 20. Die Grenzen sollen benachbart und möglichst eng sein.");
      return;
    }
    var neu = intervalle[neueStufe];
    if (Math.abs(u - neu.unten) > 1e-8 || Math.abs(o - neu.oben) > 1e-8) {
      h.meldung(feedback, false, "Du hast eine Eingrenzung gefunden, aber suche die engsten benachbarten Grenzen für diesen Schritt.");
      return;
    }
    stufe = Math.max(stufe, neueStufe);
    zeigeIntervall();
    h.meldung(feedback, true, "Richtig: (" + h.deutsch(u, 2) + ")² = " +
      h.deutsch(u * u, 4) + " < 20 < " + h.deutsch(o * o, 4) +
      " = (" + h.deutsch(o, 2) + ")². Das Intervall wird enger.");
    if (neueStufe === 1) h.element("hundertstel-aufgabe").hidden = false;
    if (neueStufe === 2) h.element("ergebnis").hidden = false;
  }
  h.element("zehntel-pruefen").addEventListener("click", function () {
    pruefe("zehntel-unten", "zehntel-oben", 0.1, "zehntel-feedback", 1);
  });
  h.element("hundertstel-pruefen").addEventListener("click", function () {
    pruefe("hundertstel-unten", "hundertstel-oben", 0.01, "hundertstel-feedback", 2);
  });
  h.element("fuenfzig-pruefen").addEventListener("click", function () {
    var u = h.zahl(h.element("fuenfzig-unten").value);
    var o = h.zahl(h.element("fuenfzig-oben").value);
    var korrekt = u === 7 && o === 8;
    h.meldung("fuenfzig-feedback", korrekt,
      korrekt ? "Richtig: 7² = 49 < 50 < 64 = 8², also 7 < √50 < 8."
        : "Prüfe Quadratzahlen in der Nähe von 50. Wähle benachbarte ganze Grenzen.");
  });
})();
