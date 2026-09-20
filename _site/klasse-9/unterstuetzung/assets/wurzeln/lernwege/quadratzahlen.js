"use strict";
(function () {
  var h = window.WurzelWerkzeug;
  var slider = h.element("seiten-slider");
  var gitter = h.element("quadrat-gitter");
  var gewaehlt = null;
  var geloest = { zeichen: false, radikand: false, wert: false };
  var namen = { zeichen: "Wurzelzeichen", radikand: "Radikand", wert: "Wurzelwert" };

  function zeichneQuadrat() {
    var n = Number(slider.value);
    var fragmente = document.createDocumentFragment();
    for (var i = 0; i < n * n; i++) fragmente.appendChild(document.createElement("span"));
    gitter.replaceChildren(fragmente);
    gitter.style.setProperty("--side", n);
    gitter.setAttribute("aria-label", "Quadrat mit " + n + " Reihen und " + n + " Spalten, also " + (n * n) + " Feldern");
    h.element("seiten-wert").textContent = n;
    h.element("flaechen-wert").textContent = n + " · " + n + " = " + (n * n);
  }
  slider.addEventListener("input", zeichneQuadrat);
  zeichneQuadrat();
  h.element("flaechen-pruefen").addEventListener("click", function () {
    var richtig = Number(slider.value) === 5;
    h.meldung("flaechen-feedback", richtig,
      richtig ? "Richtig: 5 Reihen mit je 5 Feldern sind 25. Deshalb ist √25 = 5."
        : "Noch nicht 25 Felder. Vergleiche Reihen · Felder pro Reihe mit 25.");
  });

  var teile = document.querySelectorAll(".term-button");
  teile.forEach(function (knopf) {
    knopf.addEventListener("click", function () {
      gewaehlt = knopf.dataset.role;
      teile.forEach(function (teil) { teil.setAttribute("aria-pressed", teil === knopf ? "true" : "false"); });
    });
  });
  h.element("begriff-pruefen").addEventListener("click", function () {
    var begriff = h.element("begriff-auswahl").value;
    if (!gewaehlt || !begriff) {
      h.meldung("begriffe-feedback", null, "Wähle zuerst einen Teil des Ausdrucks und einen Fachbegriff.");
      return;
    }
    var richtig = gewaehlt === begriff;
    if (richtig) {
      geloest[begriff] = true;
      h.element("geloest-" + begriff).classList.add("done");
    }
    h.meldung("begriffe-feedback", richtig,
      richtig ? namen[begriff] + " richtig zugeordnet. " + (
        begriff === "radikand" ? "25 steht unter der Wurzel." :
        begriff === "zeichen" ? "Das Zeichen fragt nach der Quadratwurzel." :
        "5 steht rechts vom Gleichheitszeichen.")
        : "Diese Zuordnung passt noch nicht. Schau, wo die 25 und wo die Ergebnis-5 stehen.");
  });

  h.element("probe-pruefen").addEventListener("click", function () {
    var wert = h.zahl(h.element("probe-ergebnis").value);
    h.meldung("probe-feedback", wert === 25,
      wert === 25 ? "Richtig: 5 · 5 = 25. Die Probe liefert den Radikanden."
        : "Multipliziere 5 mit sich selbst. Das Ergebnis muss der Radikand sein.");
  });
  h.element("gleichung-pruefen").addEventListener("click", function () {
    var markiert = document.querySelector('input[name="gleichung"]:checked');
    var wert = markiert && markiert.value;
    h.meldung("gleichung-feedback", wert === "beide",
      wert === "beide" ? "Richtig: (−5)² = 25 und 5² = 25. √25 bezeichnet nur den nichtnegativen Wert 5."
        : "Prüfe zusätzlich (−5) · (−5). Die Wurzel und die Gleichung fragen Unterschiedliches.");
  });
  h.element("transfer-pruefen").addEventListener("click", function () {
    var wurzel = h.zahl(h.element("wurzel81").value);
    var probe = h.zahl(h.element("probe81").value);
    var richtig = wurzel === 9 && probe === 81;
    h.meldung("transfer-feedback", richtig,
      richtig ? "Richtig: √81 = 9 und die Probe lautet 9 · 9 = 81."
        : wurzel === 9 ? "Der Wurzelwert stimmt. Quadriere jetzt genau diesen Wert für die Probe."
          : "Suche die nichtnegative Zahl, deren Quadrat 81 ist. Prüfe danach dein Ergebnis.");
  });
})();
