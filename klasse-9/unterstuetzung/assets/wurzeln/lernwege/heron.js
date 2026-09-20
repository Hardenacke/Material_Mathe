"use strict";
(function () {
  var h = window.WurzelWerkzeug;
  var a = 20;
  var x0 = 5;
  var x1 = (x0 + a / x0) / 2;
  var x2 = (x1 + a / x1) / 2;
  var x3 = (x2 + a / x2) / 2;
  var aktuellesX = x0;
  var experimentX = 6;
  var experimentSchritt = 0;
  var laeuft = false;

  function naechsterWert(x) {
    if (!Number.isFinite(x) || x <= 0) throw new Error("Der Startwert muss positiv sein.");
    return (x + a / x) / 2;
  }
  function zeichneRechteck(id, x, schritt) {
    var svg = h.element(id);
    var cx = 320;
    var cy = 181;
    var skala = 42;
    var seite2 = a / x;
    var breite = skala * x;
    var hoehe = skala * seite2;
    var lx = cx - breite / 2;
    var oben = cy - hoehe / 2;
    svg.replaceChildren(
      h.svg("rect", { x: lx, y: oben, width: breite, height: hoehe,
        rx: 5, fill: "#d9f3f0", stroke: "#008b8b", "stroke-width": 3 }),
      h.svg("line", { x1: lx - 16, y1: oben + 2, x2: lx - 16, y2: oben + hoehe - 2,
        stroke: "#ba5b11", "stroke-width": 4 }),
      h.svg("text", { x: cx, y: cy + 6, "text-anchor": "middle", class: "accent" }, "A = 20"),
      h.svg("text", { x: cx, y: oben - 14, "text-anchor": "middle" }, "y" + schritt + " = 20 / x" + schritt + " ≈ " + h.deutsch(seite2, 5)),
      h.svg("text", { x: cx, y: oben + hoehe + 26, "text-anchor": "middle" }, "x" + schritt + " ≈ " + h.deutsch(x, 5))
    );
    svg.setAttribute("aria-label", "Rechteck der Fläche 20 mit Seiten " +
      h.deutsch(x, 5) + " und " + h.deutsch(seite2, 5) + ".");
  }
  function animateRechteck(id, start, ende, schritt, fertig) {
    if (laeuft || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      zeichneRechteck(id, ende, schritt);
      fertig();
      return;
    }
    laeuft = true;
    var beginn;
    function tick(zeit) {
      if (beginn === undefined) beginn = zeit;
      var t = Math.min(1, (zeit - beginn) / 1050);
      var eased = t * t * (3 - 2 * t);
      zeichneRechteck(id, start + (ende - start) * eased, schritt);
      if (t < 1) window.requestAnimationFrame(tick);
      else { laeuft = false; fertig(); }
    }
    window.requestAnimationFrame(tick);
  }
  function fast(wert, ziel, tol) {
    return Number.isFinite(wert) && Math.abs(wert - ziel) <= tol;
  }
  function zeigeSeiten(n, x) {
    var y = a / x;
    var abstand = Math.abs(x - y);
    h.element("seiten-anzeige").textContent = "x" + n + " ≈ " +
      h.deutsch(x, 5) + "; y" + n + " ≈ " + h.deutsch(y, 5) +
      ". Die Fläche ist genau 20; Seitenabstand " +
      (abstand < 1e-8 ? "< 0,00000001" : "≈ " + h.deutsch(abstand, 9)) + ".";
  }
  zeichneRechteck("heron-rechteck", x0, 0);

  h.element("y0-pruefen").addEventListener("click", function () {
    var wert = h.zahl(h.element("y0").value);
    var richtig = fast(wert, 4, 1e-10);
    h.meldung("y0-feedback", richtig,
      richtig ? "Richtig: y₀ = 4 und 5 · 4 = 20. Jetzt bilde das Mittel."
        : "Die Fläche soll 20 sein: 5 · y₀ = 20. Teile 20 durch 5.");
    if (richtig) h.element("mittelwert-aufgabe").hidden = false;
  });
  h.element("x1-pruefen").addEventListener("click", function () {
    var wert = h.zahl(h.element("x1").value);
    var richtig = fast(wert, x1, 1e-10);
    h.meldung("x1-feedback", richtig,
      richtig ? "Richtig: Der Mittelwert ist 4,5. Die andere Seite wird nun 20 / 4,5."
        : "Addiere 5 und 4 und teile die Summe durch 2.");
    if (richtig && aktuellesX < x1 + 1e-12 && aktuellesX > x1 - 1e-12) return;
    if (richtig) {
      var vorher = aktuellesX;
      aktuellesX = x1;
      animateRechteck("heron-rechteck", vorher, x1, 1, function () {
        zeigeSeiten(1, x1);
        h.element("zweiter-schritt").hidden = false;
      });
    }
  });
  h.element("zweiter-pruefen").addEventListener("click", function () {
    var y = h.zahl(h.element("y1").value);
    var x = h.zahl(h.element("x2").value);
    var yRichtig = fast(y, a / x1, 0.0001);
    var xRichtig = fast(x, x2, 0.0001);
    h.meldung("zweiter-feedback", yRichtig && xRichtig,
      yRichtig && xRichtig ? "Richtig: y₁ ≈ 4,44444 und x₂ ≈ 4,47222. Die Seiten sind jetzt fast gleich."
        : !yRichtig ? "Berechne zuerst 20 / 4,5. Vier Dezimalstellen reichen."
          : "Deine zweite Seite stimmt. Berechne (4,5 + y₁) / 2; ein gerundeter Wert genügt.");
    if (yRichtig && xRichtig && Math.abs(aktuellesX - x2) > 1e-10) {
      var vorher = aktuellesX;
      aktuellesX = x2;
      animateRechteck("heron-rechteck", vorher, x2, 2, function () {
        zeigeSeiten(2, x2);
        h.element("naechster-schritt").hidden = false;
      });
    }
  });
  h.element("iterieren").addEventListener("click", function () {
    if (h.element("ergebnis").hidden) {
      aktuellesX = x3;
      animateRechteck("heron-rechteck", x2, x3, 3, function () {
        zeigeSeiten(3, x3);
        h.element("ergebnis").hidden = false;
        h.meldung("iteration-feedback", true,
          "x₃ ≈ 4,47214. Die Seiten sind jetzt bis auf weniger als 0,000001 gleich.");
      });
    } else {
      h.meldung("iteration-feedback", null, "Der dritte Schritt ist bereits zu sehen. Probiere unten einen anderen Startwert.");
    }
  });
  h.element("fuenfzig-pruefen").addEventListener("click", function () {
    var y = h.zahl(h.element("y50").value);
    var x = h.zahl(h.element("x50").value);
    var korrekt = fast(y, 6.25, 1e-8) && fast(x, 7.125, 1e-8);
    h.meldung("fuenfzig-feedback", korrekt,
      korrekt ? "Richtig: y₀ = 50 / 8 = 6,25 und x₁ = (8 + 6,25) / 2 = 7,125."
        : "Die Fläche ist diesmal 50: erst 50 / 8, danach den Mittelwert mit 8 bilden.");
  });

  var slider = h.element("start-experiment");
  function startNeu() {
    experimentSchritt = 0;
    experimentX = Number(slider.value);
    h.element("start-wert").textContent = h.deutsch(experimentX, 2);
    zeichneRechteck("experiment-rechteck", experimentX, 0);
    h.element("experiment-anzeige").textContent =
      "Start x₀ = " + h.deutsch(experimentX, 2) +
      "; zweite Seite y₀ = 20 / x₀ ≈ " + h.deutsch(a / experimentX, 5) +
      ". Fläche = 20.";
    h.element("experiment-feedback").textContent = "";
  }
  slider.addEventListener("input", startNeu);
  startNeu();
  h.element("experiment-iterieren").addEventListener("click", function () {
    if (laeuft) return;
    var alt = experimentX;
    var neu = naechsterWert(alt);
    experimentX = neu;
    experimentSchritt++;
    animateRechteck("experiment-rechteck", alt, neu, experimentSchritt, function () {
      var abstand = Math.abs(experimentX - a / experimentX);
      h.element("experiment-anzeige").textContent =
        "Schritt " + experimentSchritt + ": x ≈ " + h.deutsch(experimentX, 7) +
        ", y ≈ " + h.deutsch(a / experimentX, 7) +
        ". Seitenabstand " +
        (abstand < 1e-8 ? "< 0,00000001" : "≈ " + h.deutsch(abstand, 9)) +
        "; Fläche = 20.";
      h.meldung("experiment-feedback", null, "Neuer Wert = Mittelwert der beiden vorherigen Seiten.");
    });
  });
})();
