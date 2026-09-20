"use strict";
window.WurzelWerkzeug = {
  element: function (id) { return document.getElementById(id); },
  zahl: function (text) {
    var roh = String(text).trim().replace(/\s+/g, "").replace(",", ".");
    if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(roh)) return NaN;
    return Number(roh);
  },
  deutsch: function (wert, stellen) {
    var fest = Number(wert).toFixed(stellen);
    if (stellen > 0) fest = fest.replace(/0+$/, "").replace(/\.$/, "");
    return fest.replace(".", ",");
  },
  meldung: function (id, ok, text) {
    var ausgabe = document.getElementById(id);
    ausgabe.textContent = text;
    ausgabe.dataset.state = ok === true ? "success" : ok === false ? "error" : "neutral";
  },
  svg: function (tag, attribute, inhalt) {
    var knoten = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attribute || {}).forEach(function (name) {
      knoten.setAttribute(name, String(attribute[name]));
    });
    if (inhalt !== undefined) knoten.textContent = String(inhalt);
    return knoten;
  }
};
