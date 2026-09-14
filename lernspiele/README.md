# Mathe-Lernspiele NRW

## Inhalt

Dieses Paket enthält **63 fachlich geplante Lernspiele** und eine gemeinsame HTML-/CSS-/JavaScript-Basis. Q1-Grundlagen werden zusätzlich im Kursordner `q1/leistungskurs/` gespiegelt; Q2-Grundlagen sind ebenfalls im LK-Ordner verfügbar. Dadurch gibt es **74 verlinkte HTML-Dateien** (plus Materialübersicht), ohne die Aufgabenbank doppelt pflegen zu müssen.

Die Navigation läuft über `index.html`:

`Jahrgangsstufe/Kurs → Themenfeld → Lernspiel`

Alle Links sind relative, case-sensitive GitHub-Pages-Pfade ohne Leerzeichen oder Umlaute. Lernspiele werden in einem neuen Tab geöffnet.

## Pädagogischer Spielmotor

- Üben, Mission und Prüfungsmodus
- fachliche Aufgabenfamilien statt reiner Klick-Aufgaben
- Darstellungswechsel: Symbol, Bild, Tabelle, Graph, Kontext
- Fehlerdiagnose mit Fehlerstelle, Fehlerart und Korrektur
- fachbezogene Rückmeldung und drei gestufte Hinweise
- 30-Sekunden-Cooldown zwischen den Hinweisen
- versetzte Wiederholung fehlerhafter Kompetenzen mit veränderten Werten
- langsame, kompetenzbezogene Schwierigkeitserhöhung
- lokale Kompetenzstatistik statt öffentlicher Rangliste
- druckbare Teilnehmerurkunde (lokal, ohne Namensübertragung)
- responsive Touchflächen, Pointer-freundliche Interaktionen, SVG und keine externen Laufzeitbibliotheken
- Service Worker für die Nutzung nach dem ersten Laden auf GitHub Pages

## Ordner

```text
index.html
data.json
manifest.webmanifest
sw.js
shared/
  math.js
  tasks-56.js
  tasks-78.js
  tasks-910.js
  tasks-efq.js
  game-engine.js
  game.css
  themes.js / themes.css
  algebra-tiles.js / algebra-tiles.css
klasse-5/ … klasse-10/
ef/
q1/grundkurs/ … q1/leistungskurs/
q2/grundkurs/ … q2/leistungskurs/
```

## Fachliche Einordnung

Die KLP-Anker und die detaillierte Planung stehen in `Lernspiele_Mathematik_Gesamtkonzept_aktualisiert.md`. Die Planung operationalisiert Kompetenzen des KLP Mathematik NRW (Sek I 2019, Sek II 2023) und orientiert die Oberstufenspiele an den veröffentlichten Abiturvorgaben. Eine Spielauswertung ersetzt keine Unterrichtsdiagnose: Freie mathematische Erklärungen müssen im Unterricht zusätzlich besprochen werden.

## Anpassung

Neue Aufgaben werden in der passenden Funktion in `shared/tasks-56.js`, `tasks-78.js`, `tasks-910.js` oder `tasks-efq.js` ergänzt. Die Navigation wird anschließend durch erneutes Ausführen des Build-Skripts aktualisiert. Die HTML-Dateien bleiben bewusst klein und laden die gemeinsame Basis relativ.

Stand: September 2026.


## Schwierigkeitswahl
Vor jeder Runde Leicht, Mittel, Schwer oder Automatisch wählen, danach den Spielmodus. Auf Leicht erscheint außerhalb des Prüfungsmodus der erste Tipp automatisch. Bei skalierbaren Aufgaben ändern sich Zahlen, bei der Waagen-Werkstatt zusätzlich die Lücken und Umformungsschritte. Die drei Algebra-Plättchen-Spiele führen die Stufen direkt in der eigenen Oberfläche. Bei Begriffsaufgaben bleibt der fachliche Kern gleich. Details und Prüfgrenzen: Kapitel 86 und 90 der Konzeptdatei.

## iPad und Split View
Die Oberfläche passt sich dynamisch an die verfügbare Breite an. Bei breiten Gleichungen, Tabellen oder Kästchenfeldern innerhalb des jeweiligen Bereichs seitlich wischen. Hoch- und Querformat sind vorgesehen; die Eingabetastatur erscheint beim Antippen. Vollständige Ordnerstruktur entpacken und index.html öffnen. Ein physischer iPad-Test steht noch aus.


## Passender Look für jedes Spiel

Alle 74 Spielseiten starten mit einem bewusst zum Inhalt passenden Look: Papierwelt für viele Rechen- und Konstruktionsaufgaben, Pixel-Werkstatt für Raster und Gruppierungen, Retro 64 für räumliche Missionen und Mathe-Studio für Graphen und Datenlabore. Die genaue Einzelzuordnung mit Begründung steht in Kapitel 89 der Konzeptdatei. Die Materialübersicht zeigt den Standard-Look jeder Spielkarte.

Über **Look** kannst du die Darstellung ändern. Eine Änderung gilt nur für dieses Spiel; Aufgabe und Fortschritt bleiben erhalten. **Zugeordneten Look verwenden** stellt die Vorgabe wieder her. Eine laufende Rundenzeit läuft während der Auswahl weiter. Früher gespeicherte globale Look-Einstellungen überschreiben die neuen Zuweisungen nicht.

Alle Stile und Illustrationen sind lokal enthalten. `Stiluebersicht.png` zeigt die vier Darstellungen. Ein praktischer Browser- und iPad-Test steht weiterhin aus.

## Algebra-Plättchen: legen, umformen, begründen

Die drei zusätzlichen Spiele liegen in den Themenfeldern der Klassen 7 und 8:

- `klasse-7/arithmetik-algebra/terme-legen.html` · **Algebra-Bauplatz**: Terme wie `x² + 2x + 4` aus x²-, x- und Einheitsplättchen legen; negative Gegenplättchen stehen in Mittel/Schwer zur Verfügung.
- `klasse-7/arithmetik-algebra/gleichungen-legen.html` · **Gleichungswaage**: lineare Gleichungen auf beiden Seiten äquivalent umformen. Operationen werden als Plättchen auf beide Seiten angewendet; Nullpaare werden ausdrücklich entfernt.
- `klasse-8/arithmetik-algebra/quadratische-legen.html` · **Quadrat-Atelier**: Term bauen, quadratisch ergänzen, in Faktoren zerlegen und über die Nullproduktregel einfache quadratische Gleichungen lösen.

`shared/algebra-tiles.js` und `shared/algebra-tiles.css` sind eine eigenständige, offlinefähige SVG-/HTML-Umsetzung mit Pointer Events. Tippen und Ziehen funktionieren mit Maus, Stift und Finger. Die Flächenbedeutung bleibt sichtbar: x² ist ein Quadrat mit Seitenlänge x, ein x-Plättchen ist ein Rechteck x · 1, ein Einheitsplättchen steht für 1. Die Schaltflächen sind für iPad-Touchziele ausgelegt; bei schmaler Breite stapeln sich Palette, Modell und Rückmeldung.

Die Spiele sind von virtuellen Algebra-Plättchen inspiriert, benötigen aber keine Verbindung zu einem externen Dienst. Als fachlicher Hintergrund dienen die bereitgestellten didaktischen Materialien und der NRW-Kernlehrplan. Die genaue Aufgabenprogression, typische Fehlvorstellungen und die Prüfungen stehen in Kapitel 90 der Konzeptdatei.
