# Lernspiele Mathematik NRW – Gesamtkonzept, Spielformate und technische Umsetzung

**Stand:** September 2026 – erweitert um konkrete Kompetenzerwartungen, Altersdifferenzierung, Abiturfokus, Belohnungssysteme und Repository-Analyse  
**Ziel:** Entwicklung eines modularen, kompetenzorientierten Systems für digitale Mathematik-Lernspiele am Gymnasium NRW  
**Zielgeräte:** insbesondere iPad, außerdem Laptop/Desktop  
**Technische Zielumgebung:** GitHub Pages, optional Google Sites, möglichst offline-nah und wartbar

---

# 1. Grundidee

Die Lernspiele sollen fachlich gehaltvoll, technisch möglichst einfach und langfristig wiederverwendbar sein.

Im Mittelpunkt steht **nicht** eine aufwendige Story oder möglichst spektakuläre Grafik, sondern ein stabiler Lernspiel-Kern:

1. Aufgabe erscheint.
2. Lernende müssen mathematisch handeln.
3. Das System prüft die Antwort.
4. Es folgt unmittelbares fachliches Feedback.
5. Der Fortschritt wird sichtbar.
6. Die nächste Aufgabe wird passend ausgewählt.
7. Fehlerhafte Kompetenzen werden später erneut aufgegriffen.
8. Die Schwierigkeit steigt langsam.

Die Lernspiele sollen insbesondere Kompetenzen vertiefen, die häufig wiederholt, automatisiert, verglichen, diagnostiziert oder in unterschiedlichen Darstellungen angewendet werden müssen.

---

# 2. Curriculare Grundlage

Die Auswahl der Lernspiele orientiert sich an den Kompetenzen des Kernlehrplans Mathematik NRW.

Besonders gut für digitale Lernspiele eignen sich Kompetenzen aus den Bereichen:

- Arithmetik und Algebra
- Funktionen
- Geometrie
- Stochastik
- Analysis
- Analytische Geometrie und Lineare Algebra

Zusätzlich sollen die prozessbezogenen Kompetenzen berücksichtigt werden:

- Operieren
- Modellieren
- Problemlösen
- Argumentieren
- Kommunizieren

Ein Spiel sollte daher nicht nur richtige Ergebnisse abfragen, sondern immer wieder auch:

- Darstellungen vergleichen,
- Verfahren auswählen,
- Fehler finden,
- mathematische Aussagen beurteilen,
- kurze Begründungen geben,
- Zusammenhänge erkennen,
- Ergebnisse interpretieren.

---

# 3. Didaktische Leitidee

## 3.1 Der Lernspiel-Loop

Ein sinnvoller fachlicher Kernloop lautet:

**Erkennen → Anwenden → Darstellungswechsel → Fehlerdiagnose → Transfer**

Beispiel Bruchrechnung:

1. Welcher Bruch ist größer?
2. Kürze einen Bruch.
3. Färbe einen angegebenen Anteil.
4. Ordne Bild, Bruch und Dezimalzahl einander zu.
5. Finde einen Fehler in einer Rechnung.
6. Löse eine kleine Sachaufgabe.

Dadurch bleibt der Spielaufbau einfach, obwohl mehrere Kompetenzen trainiert werden.

---

## 3.2 Spielmechanik ist kein Selbstzweck

Gamification sollte die fachliche Lernhandlung unterstützen.

Geeignete Elemente:

- Fortschrittsbalken
- erreichbare Zwischenziele
- Streaks
- Leben
- optionale Timer
- Level
- Missionen
- Bonusaufgaben
- adaptive Wiederholung
- Kompetenzrückmeldung

Weniger wichtig sind:

- permanente Ranglisten
- rein dekorative Animationen
- zufällige Belohnungen ohne Lernbezug
- übermäßiger Zeitdruck

---

# 4. Erkenntnisse aus der Online-Recherche

## 4.1 HTML/CSS/JavaScript als Hauptplattform

Für das Gesamtprojekt ist eine eigene HTML-/JavaScript-Lösung besonders geeignet.

Vorteile:

- läuft direkt im Browser,
- funktioniert auf GitHub Pages,
- kann in Google Sites eingebettet werden,
- sehr gut an iPads anpassbar,
- vollständige Kontrolle über Layout und Aufgabenlogik,
- Aufgaben können dynamisch erzeugt werden,
- keine Abhängigkeit von externen Plattformen,
- langfristig wartbar.

Empfohlene technische Basis:

- Vanilla JavaScript
- HTML5
- CSS Grid / Flexbox
- SVG
- Canvas nur dort, wo nötig
- Pointer Events
- localStorage
- optional Service Worker
- optionale Web Components

---

## 4.2 Pointer Events für iPads

Für Touchgeräte sollten möglichst keine Interaktionen entwickelt werden, die ausschließlich auf klassischem Drag-and-Drop beruhen.

Besser geeignet:

- Tap-to-Pair
- Tap-to-Select
- Pointer Events
- große Touchflächen
- alternative Buttons zum Verschieben

Pointer Events können:

- Maus
- Finger
- Stift

über eine gemeinsame Logik verarbeiten.

---

## 4.3 localStorage

`localStorage` eignet sich für:

- Spielstände
- Fortschritt
- Einstellungen
- lokale Highscores
- letzte Schwierigkeit
- Bearbeitungsstatus

Damit können Lernende nach dem Schließen des Browsers ihren lokalen Fortschritt behalten.

Ein klassenweites gemeinsames Leaderboard lässt sich damit jedoch nicht zuverlässig umsetzen. Dafür wäre eine gemeinsame Datenbank oder z. B. Google Apps Script nötig.

---

## 4.4 Progressive Web App / Offline-Funktion

Ein Service Worker kann dafür sorgen, dass:

- HTML
- CSS
- JavaScript
- Bilder
- Aufgabenbanken
- SVGs

nach dem ersten Laden lokal gespeichert werden.

Dadurch kann ein Lernspiel weitgehend offline genutzt werden.

Für den schulischen iPad-Einsatz ist dies besonders interessant.

---

## 4.5 Web Components

Web Components eignen sich zur Wiederverwendung einzelner Lernbausteine.

Beispiele:

```html
<math-question></math-question>
<game-progress></game-progress>
<fraction-painter></fraction-painter>
<error-check></error-check>
<graph-match></graph-match>
<game-hints></game-hints>
```

Vorteile:

- einzelne Funktionen können unabhängig entwickelt werden,
- gleiche Komponenten lassen sich in vielen Spielen verwenden,
- CSS und JavaScript können gekapselt werden,
- langfristig entsteht eine eigene Lernspiel-Bibliothek.

---

# 5. Vergleich möglicher Plattformen

| Plattform | Stärken | Schwächen | Empfehlung |
|---|---|---|---|
| HTML/CSS/JavaScript | maximale Kontrolle, GitHub Pages, iPad, Aufgaben generierbar | initial mehr Entwicklungsarbeit | **Hauptplattform** |
| Phaser | Bewegung, Animation, Kollisionen, Touch | für normale Matheaufgaben überdimensioniert | für echte 2D-Spiele |
| GeoGebra | Graphen, Funktionen, Geometrie | separates UI, Integration nötig | für dynamische Mathematik |
| H5P | viele fertige Aufgabentypen | weniger flexibel | Prototypen / Inspiration |
| GDevelop | visuelle Spielentwicklung | eigene zusätzliche Plattform | Sonderprojekte |
| Construct 3 | komfortable HTML5-Spiele | proprietär | eher nicht als Hauptsystem |
| Twine | Entscheidungsbäume, Story | ungeeignet für große Aufgabengeneratoren | Story-/Entscheidungsspiele |

---

# 6. Phaser

Phaser eignet sich für Lernspiele, bei denen Bewegung selbst Bestandteil der Spielmechanik ist.

Geeignete Beispiele:

- Teiler-Scanner mit bewegten Zahlen
- Koordinaten-Navigator
- Vektor-Spiel
- Pythagoras-Route
- Zugspiel zum Dreisatz
- Spielfigur im Baumdiagramm
- Sammelspiele mit mathematischen Entscheidungen

Empfehlung:

**Phaser nicht als zentrale Mathematik-Engine verwenden.**

Stattdessen:

**HTML-Spielmotor = Mathematik und Aufgabenlogik**  
**Phaser = optionale Spielszene**

---

# 7. H5P

H5P bietet viele interessante Aufgabentypen:

- Arithmetic Quiz
- Memory
- Image Pairing
- Branching Scenario
- Game Map
- Interactive Video
- Multiple Choice
- Drag & Drop

Besonders interessant als Inspiration:

## Game Map

Eine Karte mit Stationen:

```text
Start
 ↓
Brüche vergleichen
 ↓
Kürzen
 ↓
Brüche darstellen
 ↓
Fehlerdiagnose
 ↓
Boss-Level
```

## Branching Scenario

Unterschiedliche Entscheidungen führen zu unterschiedlichen Aufgabenwegen.

H5P eignet sich gut zum schnellen Erproben von Spielformen, aber weniger als gemeinsame technische Hauptplattform für die eigene GitHub-Struktur.

---

# 8. GDevelop und Construct

Diese Systeme eignen sich für Spiele mit:

- Bewegung
- Physik
- Animation
- Leveldesign
- Touchsteuerung
- Spielfiguren

Denkbare Beispiele:

- geometrisches Labyrinth
- Bruchteilchen sammeln
- Koordinatenspiel
- physikalisches Bewegungsspiel

Nachteile:

- Aufgabenlogik würde außerhalb des gemeinsamen HTML-Systems entstehen,
- Wartung wird komplizierter,
- mathematische Komponenten müssten eventuell mehrfach umgesetzt werden.

Daher eher für einzelne besondere Projekte.

---

# 9. Twine

Twine eignet sich hervorragend für:

- Entscheidungsbäume
- verzweigte Geschichten
- mathematische Ermittlungsfälle
- Modellierungsentscheidungen

Beispiel:

```text
Eine Zeitung veröffentlicht ein Diagramm.

A: Veröffentlichung freigeben
B: Achsenskalierung prüfen
C: weitere Daten verlangen
```

Je nach Entscheidung folgt ein anderer Aufgabenpfad.

Geeignet für:

- Statistik-Manipulationsdetektor
- Modellierungsaufgaben
- Entscheidungsmissionen
- Story-basierte Lernspiele

Nicht geeignet für hunderte automatisch erzeugte Bruch- oder Termaufgaben.

---

# 10. GeoGebra

GeoGebra kann gezielt in den eigenen HTML-Spielmotor eingebettet werden.

Besonders geeignet für:

- Funktionsgraphen
- Transformationen
- Geometrie
- Vektoren
- Geraden
- Tangenten
- Ableitungen
- Parameterexperimente

Empfohlene Architektur:

- HTML verwaltet Aufgabe, Punkte und Fortschritt.
- GeoGebra stellt das dynamische mathematische Objekt bereit.
- JavaScript liest oder verändert GeoGebra-Werte.

---

# 11. Erkenntnisse zur Gamification

Gamification kann Motivation fördern, aber einfache Mechanismen wie Punkte und Ranglisten reichen nicht aus.

Besonders sinnvoll:

- sichtbarer individueller Fortschritt
- unmittelbares Feedback
- Wahlmöglichkeiten
- kleine erreichbare Ziele
- adaptive Aufgaben
- Wiederholung bei Fehlern
- freiwillige Herausforderung

Leaderboard:

- nur optional,
- möglichst nicht für Leistungsbewertung,
- keine öffentliche Bloßstellung schwächerer Lernender,
- eher Top-Leistungen oder persönliche Bestwerte darstellen.

Empfehlung:

**Individuelle Kompetenzentwicklung ist wichtiger als Rangposition.**

---

# 12. Retrieval Practice

Für die geplanten Spiele ist Retrieval Practice besonders geeignet.

Prinzip:

1. Aufgabe wird gelöst.
2. Bei Fehler erfolgt Feedback.
3. Die Kompetenz taucht einige Aufgaben später erneut auf.
4. Die Zahlen oder Darstellungen sind verändert.
5. Wird erneut falsch geantwortet, erscheint eine stärkere Hilfe.
6. Danach folgt eine weitere ähnliche Aufgabe.

Dies ist deutlich lernwirksamer als:

- dieselbe Aufgabe sofort noch einmal,
- nur die richtige Lösung anzuzeigen,
- den Fehler einfach zu ignorieren.

---

# 13. Worked Examples

Bei neuen oder schwierigen Verfahren sollte das System vollständige Beispiele zeigen können.

Beispiel:

```text
2/3 + 1/4

1. gemeinsamer Nenner: 12
2. 2/3 = 8/12
3. 1/4 = 3/12
4. 8/12 + 3/12 = 11/12
```

Danach kann die Unterstützung schrittweise reduziert werden.

Mögliche Stufen:

1. vollständiges Beispiel
2. ein Schritt fehlt
3. mehrere Schritte fehlen
4. selbstständige Aufgabe

---

# 14. Adaptive Wiederholung

Jede Aufgabe sollte einer Kompetenz zugeordnet sein.

Beispiel:

```text
Brüche
├── vergleichen
├── kürzen
├── erweitern
├── Bruchteil bestimmen
├── darstellen
└── Sachaufgaben
```

Das Spiel speichert z. B.:

```text
vergleichen: 80 %
kürzen: 55 %
erweitern: 90 %
darstellen: 60 %
```

Anschließend werden bevorzugt Aufgaben aus schwächeren Bereichen erzeugt.

---

# 15. Die sechs wichtigsten Grundspieltypen

## 15.1 Skill Rush

**Ablauf:**

```text
Aufgabe
↓
Antwort
↓
Feedback
↓
Punkte
↓
nächste Aufgabe
```

Geeignet für:

- Brüche
- Kopfrechnen
- Potenzen
- Gleichungen
- Ableitungen
- Einheiten

---

## 15.2 Construct & Paint

Lernende verändern direkt ein mathematisches Objekt.

Geeignet für:

- Brüche färben
- Symmetrie
- Würfel
- Koordinaten
- Flächen
- Körper

---

## 15.3 Match & Sort

Objekte werden verbunden oder sortiert.

Geeignet für:

- Graph ↔ Term
- Bruch ↔ Bild
- Einheit ↔ Größe
- Figur ↔ Eigenschaft
- Satz ↔ Begründung
- Funktion ↔ Tabelle

---

## 15.4 Error Hunter

Ein Lösungsweg enthält einen Fehler.

Ablauf:

1. Fehlerstelle anklicken.
2. Fehlerart auswählen.
3. richtige Lösung eingeben.

Geeignet für:

- Gleichungen
- Termumformungen
- Bruchrechnung
- Potenzen
- Funktionen
- Statistik

---

## 15.5 Explore & Predict

Ablauf:

```text
Vorhersagen
↓
Parameter verändern
↓
Beobachten
↓
Erklären
```

Geeignet für:

- Funktionen
- Geometrie
- Stochastik
- Analysis

---

## 15.6 Journey / Mission

Mehrere Aufgaben bilden einen Weg.

Beispiele:

- Karte
- Raumstation
- Zugstrecke
- Forschungsreise
- Tempel
- Expedition

Die Story bleibt bewusst einfach. Die Mathematik bleibt im Mittelpunkt.

---

# 16. Lernspielideen nach Klassenstufe

# Klasse 5/6

## Bruch-Arena

Kompetenzen:

- Brüche vergleichen
- kürzen
- erweitern
- Anteile darstellen
- Bruchteile bestimmen
- Darstellungen wechseln

Aufgabentypen:

- Vergleich
- Färben
- Zahlenstrahl
- Bildzuordnung
- Fehlerdiagnose
- Anteil berechnen

---

## Teiler-Scanner

Kompetenzen:

- Primzahlen
- Teiler
- Teilbarkeit
- Primfaktorzerlegung

---

## Rechenstrategie-Rush

Kompetenzen:

- Rechengesetze
- vorteilhaft rechnen
- Überschlag
- Strategieauswahl

---

## Größen-Blitz

Kompetenzen:

- Einheiten
- Größen
- Umrechnen
- Schätzen
- Plausibilität

---

## Dreisatz-Express

Kompetenzen:

- proportionale Zusammenhänge
- Tabellen
- Maßstab
- Dreisatz

---

## Figuren-Sortierer

Kompetenzen:

- geometrische Figuren
- Eigenschaften
- Lagebeziehungen
- Klassifikation

---

## Symmetrie-Painter

Kompetenzen:

- Achsensymmetrie
- Punktsymmetrie
- Koordinaten

---

## Würfelwerkstatt

Kompetenzen:

- Volumen
- Oberfläche
- Würfelnetze
- Einheitswürfel
- Quader

---

## Daten-Detektiv

Kompetenzen:

- Diagramme
- Häufigkeiten
- Mittelwert
- Median
- Spannweite

---

# Klasse 7/8

## Vorzeichen-Duell

- rationale Zahlen
- Betrag
- Vorzeichen
- Zahlengerade

## Term-Labor

- Terme
- Variablen
- Einsetzen
- Umformen

## Gleichungs-Fehlerjäger

- Gleichungen
- Äquivalenzumformungen
- Fehlerdiagnose

## Graphen-Schaltzentrale

- proportionale Funktionen
- lineare Funktionen
- Graph
- Tabelle
- Term
- Sachsituation

## Prozent-Markt

- Prozentrechnung
- Rabatt
- Preisänderung
- Zinsen
- Wachstumsfaktor

## Winkel-Detektiv

- Winkelbeziehungen
- Innenwinkelsumme
- Kongruenz
- Satz des Thales

## Zufalls-Pfade

- Baumdiagramm
- Wahrscheinlichkeit
- Pfadregeln

---

# Klasse 9/10

## Potenzen- und Wurzel-Run

- Potenzen
- Potenzgesetze
- Wurzeln
- irrationale Zahlen

## Quadratische Gleichungswerkstatt

- Lösungsverfahren
- Nullprodukt
- quadratische Ergänzung
- p-q-Formel
- Vieta

## Funktionsfamilien-Scanner

- linear
- quadratisch
- exponentiell
- trigonometrisch

## Pythagoras-Route

- Pythagoras
- Trigonometrie
- Höhen und Entfernungen

## Kreis- und Körperwerkstatt

- Kreis
- Kreisbogen
- Kreissektor
- Volumen
- Oberfläche

## Statistik-Manipulationsdetektor

- Diagramme analysieren
- Manipulation erkennen
- Skalierung beurteilen

## Vierfeldertafel-Challenge

- bedingte Wahrscheinlichkeit
- Baumdiagramm
- Vierfeldertafel
- Unabhängigkeit

---

# Sekundarstufe II

## Transformations-Labor

- Funktionstransformationen
- Parameter
- Graphen

## Ableitungs-Graphenmatch

- Ableitung
- Steigung
- Funktion ↔ Ableitung

## Vektor-Navigator

- Vektoren
- Länge
- Addition
- Geraden

## Geraden-Lagecheck

- Lagebeziehungen
- Schnittpunkte
- LGS

## Stochastik-Generator

- Urnenmodelle
- Baumdiagramme
- Zufallsgrößen
- Binomialverteilung

## Produktregel-Sprint

- Produktregel
- Zuordnung von `u`, `v`, `u'`, `v'`
- Fehlerdiagnose
- Ableitungen

---

# 17. Gemeinsame Spielmodi

## Trainingsmodus

- kein Zeitdruck
- keine Leben
- gestufte Hilfen
- ausführliches Feedback
- falsche Kompetenzen werden wiederholt

## Missionsmodus

- feste Aufgabenanzahl
- z. B. 15–20 Aufgaben
- 3 bis 5 Leben
- optional Timer
- Abschlussauswertung

## Individueller Modus

Auswahl durch Lernende:

- Thema
- Schwierigkeitsgrad
- Aufgabenzahl
- Timer
- Leben
- Aufgabentypen

---

# 18. Langsame Schwierigkeitssteigerung

Die Schwierigkeit sollte kontinuierlich und nicht abrupt steigen.

Beispiel Brüche:

```text
gleiche Nenner
↓
gleiche Zähler
↓
einfaches Kürzen
↓
einfaches Erweitern
↓
unterschiedliche Nenner
↓
gemischte Darstellungen
↓
Fehlerdiagnose
↓
Sachaufgaben
```

Beispiel Gleichungen:

```text
x + a = b
↓
ax = b
↓
ax + b = c
↓
Klammern
↓
Brüche
↓
Variable auf beiden Seiten
↓
Fehlerdiagnose
```

---

# 19. Technische Kernarchitektur

Statt jedes Spiel komplett neu zu programmieren, sollte ein universeller Spielmotor entstehen.

## Beispiel einer Aufgabe

```js
{
  id: "bruch-vergleich-001",
  topic: "brueche",
  skill: "vergleichen",
  type: "fraction_compare",
  difficulty: 0.25,
  prompt: "Welcher Bruch ist größer?",
  data: {
    a: [2, 3],
    b: [3, 4]
  },
  answer: "b",
  feedback: {
    wrong: "Bringe die Brüche auf einen gemeinsamen Nenner."
  }
}
```

---

# 20. Wiederverwendbare Aufgabentypen

```text
multiple_choice
numeric_input
fraction_compare
fraction_reduce
fraction_painter
pair_match
sort_cards
sequence
color_grid
coordinate_select
graph_match
hotspot
error_diagnosis
short_reason
simulation
```

Mit diesen wenigen Grundtypen können sehr viele Spiele umgesetzt werden.

---

# 21. Empfohlene Komponenten

```html
<game-shell></game-shell>
<game-progress></game-progress>
<game-lives></game-lives>
<game-timer></game-timer>
<math-question></math-question>
<fraction-painter></fraction-painter>
<pair-match></pair-match>
<sort-task></sort-task>
<error-hunter></error-hunter>
<graph-match></graph-match>
<game-feedback></game-feedback>
<game-hints></game-hints>
```

---

# 22. Feedbacksystem

Das Feedback sollte fachlich sein.

Nicht:

> Falsch.

Besser:

> Prüfe, ob beide Brüche bereits denselben Nenner besitzen. Falls nicht, erweitere sie zunächst auf einen gemeinsamen Nenner.

Oder:

> Deine Steigung stimmt. Prüfe aber noch den Schnittpunkt mit der y-Achse.

---

# 23. Gestufte Hilfen

Empfehlung:

## Tipp 1

Begriff oder Erinnerung.

## Tipp 2

Strategie.

## Tipp 3

konkreter erster Rechenschritt.

## Lösung

erst nach mehreren Versuchen oder im Lehrkraftmodus.

Optional:

- 30 Sekunden Cooldown zwischen Tipps.

---

# 24. Kompetenzanalyse statt nur Punktestand

Am Ende sollte nicht nur stehen:

```text
1340 Punkte
```

Sondern beispielsweise:

```text
Brüche vergleichen     9/10
Brüche kürzen           6/10
Brüche erweitern        8/10
Brüche darstellen       5/10
```

Empfehlung:

> Übe als Nächstes besonders „Brüche darstellen“.

---

# 25. Priorität für die erste Entwicklungsphase

Zunächst sollten Spiele programmiert werden, die möglichst viele technische Komponenten abdecken.

## 1. Bruch-Arena

Benötigt:

- Auswahl
- Brüche rendern
- Färben
- Zahlenstrahl
- Zuordnung
- Fehlerdiagnose

## 2. Würfelwerkstatt

Benötigt:

- SVG
- räumliche Visualisierung
- Auswahl
- Volumenberechnung

## 3. Term-/Gleichungs-Fehlerjäger

Benötigt:

- KaTeX
- Rechenschritte
- Fehlerdiagnose
- mathematische Eingaben

## 4. Graphen-Schaltzentrale

Benötigt:

- Koordinatensystem
- Graphen
- Tabellen
- Zuordnung

## 5. Winkel-Detektiv

Benötigt:

- SVG
- Hotspots
- geometrische Aufgaben

## 6. Zufalls-Pfade

Benötigt:

- Baumdiagramm
- Zufallssimulation
- Wahrscheinlichkeitsrechnung

Nach diesen sechs Spielen wären die meisten benötigten Komponenten vorhanden.

---

# 26. Empfohlene Ordnerstruktur

```text
lernspiele/
│
├── engine/
│   ├── game-engine.js
│   ├── task-manager.js
│   ├── scoring.js
│   ├── progress.js
│   └── storage.js
│
├── components/
│   ├── fraction-painter.js
│   ├── pair-match.js
│   ├── graph-match.js
│   ├── error-hunter.js
│   ├── hotspot.js
│   └── game-feedback.js
│
├── styles/
│   └── game.css
│
├── klasse-5/
│   ├── bruch-arena/
│   └── wuerfelwerkstatt/
│
├── klasse-7/
│   └── terme/
│
├── klasse-8/
│   └── funktionen/
│
├── klasse-10/
│   └── stochastik/
│
└── ef/
    └── transformationen/
```

---

# 27. Qualitätskriterien

Ein Lernspiel sollte nur übernommen werden, wenn möglichst viele der folgenden Kriterien erfüllt sind:

- klare KLP-Kompetenz
- mathematische Denkhandlung erforderlich
- mehrere Aufgabentypen
- Darstellungswechsel
- Fehlerdiagnose
- lernförderliches Feedback
- langsame Progression
- adaptive Wiederholung
- Touch-Bedienung
- iPad-Optimierung
- keine unnötigen Animationen
- keine unnötigen Metaangaben
- lokale Speicherung
- Kompetenzrückmeldung am Ende

---

# 28. Empfohlene Gesamtstrategie

Die beste langfristige Lösung ist ein **Hybridmodell**.

## Ca. 80 % der Spiele

Vanilla HTML/CSS/JavaScript + SVG

## Ergänzend

### Phaser
für Bewegung und echte 2D-Spielmechanik.

### GeoGebra
für dynamische mathematische Objekte.

### Twine
für verzweigte Entscheidungs- und Storyspiele.

### H5P / GDevelop / Construct
hauptsächlich als Inspirations- oder Prototyping-Werkzeuge.

---

# 29. Wichtigste Schlussfolgerung

Das Ziel sollte nicht sein, möglichst viele voneinander unabhängige Spiele zu programmieren.

Sinnvoller ist:

> **ein gemeinsamer modularer Mathematik-Spielmotor mit vielen austauschbaren Aufgabentypen und Aufgabengeneratoren.**

Dadurch können später zahlreiche Lernspiele entstehen, ohne jedes Mal Navigation, Punkte, Timer, Feedback, Speicherung und Fortschritt neu programmieren zu müssen.

Die eigentliche Entwicklungsarbeit verlagert sich dann von

> „Wie programmiere ich ein neues Spiel?“

zu

> „Welche mathematische Kompetenz und welcher Aufgabentyp sollen ergänzt werden?“

Das macht das Projekt langfristig deutlich besser wartbar und skalierbar.

---

# 30. Online-Quellen und weiterführende Dokumentation

## Webtechnologien

- MDN – localStorage  
  https://developer.mozilla.org/de/docs/Web/API/Window/localStorage

- MDN – Pointer Events  
  https://developer.mozilla.org/de/docs/Web/API/Pointer_events

- MDN – Progressive Web Apps / Caching  
  https://developer.mozilla.org/de/docs/Web/Progressive_web_apps/Guides/Caching

- MDN – Web Components / Shadow DOM  
  https://developer.mozilla.org/de/docs/Web/API/Web_components/Using_shadow_DOM

## Spielentwicklung

- Phaser Documentation  
  https://docs.phaser.io/

- Phaser Learn / Examples  
  https://phaser.io/learn

- GDevelop  
  https://gdevelop.io/

- Construct 3  
  https://www.construct.net/

- Twine  
  https://twinery.org/

## Mathematik

- GeoGebra  
  https://www.geogebra.org/

- GeoGebra Hilfe  
  https://help.geogebra.org/

## Interaktive Lerninhalte

- H5P  
  https://h5p.org/

- H5P Content Types  
  https://h5p.org/content-types-and-applications

- H5P Game Map  
  https://h5p.org/content-types/game-map

- H5P Branching Scenario  
  https://h5p.org/branching-scenario

---

# 31. Nächster sinnvoller Entwicklungsschritt

Als nächstes sollte aus diesem Konzept eine **technische Spezifikation für den gemeinsamen Lernspielmotor** entstehen.

Diese sollte definieren:

1. gemeinsames Datenformat für Aufgaben,
2. Schwierigkeitsparameter,
3. Kompetenzmodell,
4. Scoring,
5. Wiederholungslogik,
6. Feedbacktypen,
7. Timer,
8. Lebenssystem,
9. lokale Speicherung,
10. Komponentenschnittstellen,
11. iPad-Touchlogik,
12. gemeinsame CSS-Gestaltung,
13. Einbindung in die bestehende GitHub-Materialstruktur.

Anschließend kann die **Bruch-Arena** als erstes vollständiges Referenzspiel umgesetzt werden.

---

# 32. Konkretisierte Kompetenzerwartungen für die Lernspiele

## 32.1 Grundprinzip der Konkretisierung

Die folgenden Kompetenzerwartungen sind **spielbezogene Operationalisierungen** der Kompetenzen des Kernlehrplans Mathematik NRW. Sie ersetzen den Wortlaut des Kernlehrplans nicht, sondern übersetzen ihn in **beobachtbare Handlungen**, die innerhalb eines digitalen Lernspiels tatsächlich ausgelöst und ausgewertet werden können.

Der Kernlehrplan betont, dass Kompetenzerwartungen auf beobachtbare Handlungen bezogen und in Aufgabenstellungen überprüfbar sein sollen. Für die Lernspiele bedeutet das:

> Nicht: „Die Lernenden verstehen Brüche.“

Sondern beispielsweise:

> „Die Lernenden vergleichen zwei Brüche, wählen eine passende Vergleichsstrategie und begründen ihre Entscheidung durch eine Darstellung oder einen rechnerischen Zwischenschritt.“

Jede Lernspielkompetenz sollte daher vier Ebenen besitzen:

1. **KLP-Anker:** Welche verbindliche Kompetenz wird aufgegriffen?
2. **Beobachtbare Teilkompetenz:** Was soll die lernende Person konkret tun können?
3. **Spielhandlung:** Welche Interaktion zwingt zu dieser mathematischen Handlung?
4. **Kompetenznachweis:** Woran erkennt das Spiel, dass die Kompetenz hinreichend sicher verfügbar ist?

Die im Folgenden genannten Schwellenwerte, etwa „80 % in mehreren Darstellungen“, sind **didaktische Vorschläge für das Lernspiel** und keine Vorgaben des Kernlehrplans.

---

# 33. Klasse 5/6 – Erprobungsstufe

Grundlage sind insbesondere die konkretisierten Kompetenzerwartungen des KLP Sekundarstufe I auf den Seiten 23–27.

## 33.1 Bruch-Arena

### KLP-Anker

Der Kernlehrplan fordert unter anderem, dass Schülerinnen und Schüler

- Zahlen in unterschiedlichen Darstellungen darstellen, vergleichen und zwischen ihnen wechseln,
- Brüche als Anteile, Operatoren, Quotienten, Zahlen und Verhältnisse deuten,
- Brüche kürzen und erweitern,
- Bruchteil, Anteil und Ganzes im Kontext berechnen und deuten,
- Grundrechenarten in unterschiedlichen Darstellungen durchführen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. zwei einfache Brüche anhand ihrer Größe vergleichen;
2. bei gleichem Nenner die Zähler und bei gleichem Zähler die Nenner sinnvoll zum Vergleich nutzen;
3. zwei Brüche durch geeignetes Erweitern auf einen gemeinsamen Nenner bringen;
4. einen Bruch vollständig kürzen und dabei den Wert des Bruches erhalten;
5. zu einem gegebenen Bruch eine passende Flächen-, Strecken- oder Mengendarstellung auswählen;
6. einen vorgegebenen Bruch auf einer unterteilten Fläche selbst darstellen;
7. einen Bruch auf einem Zahlenstrahl näherungsweise oder exakt positionieren;
8. zwischen Bruch, Dezimalzahl und Prozentdarstellung bei geeigneten einfachen Zahlen wechseln;
9. in einer Sachsituation unterscheiden, welche Größe das Ganze, der Anteil und der Bruchteil ist;
10. typische Fehler beim Kürzen, Erweitern oder Vergleichen erkennen und korrigieren.

### Umsetzung im Lernspiel

Der Spielmotor mischt bewusst verschiedene Aufgabentypen:

- **Vergleich:** `2/3 ? 3/4`
- **Kürzen:** `18/24 → ?`
- **Erweitern:** `3/5 = ?/20`
- **Painter:** Färbe `5/8` einer Fläche.
- **Zahlenstrahl:** Setze `3/4` an die passende Stelle.
- **Matching:** Verbinde `1/2`, `0,5`, `50 %` und eine passende Bilddarstellung.
- **Fehlerjäger:** „Lena kürzt `6/8` zu `3/5`. Wo liegt der Fehler?“
- **Kontext:** „12 von 20 Feldern sind blau. Welcher Anteil ist blau?“

### Kompetenznachweis im Spiel

Eine Teilkompetenz gilt erst als stabil, wenn sie

- in mindestens zwei unterschiedlichen Darstellungsformen,
- in mehreren Aufgaben mit veränderten Zahlen
- und nach zeitlich versetzter Wiederholung

sicher gezeigt wurde.

Ein hoher Highscore allein reicht nicht. Die Auswertung sollte getrennt anzeigen:

```text
Brüche vergleichen     sicher
Kürzen                  noch unsicher
Erweitern               sicher
Brüche darstellen       noch unsicher
Anteil/Ganzes           sicher
```

---

## 33.2 Teiler-Scanner

### KLP-Anker

Der KLP fordert das Erkennen von Primzahlen, die Zerlegung natürlicher Zahlen in Primfaktoren sowie das Anwenden und Kombinieren von Teilbarkeitsregeln.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Primzahlen und zusammengesetzte Zahlen unterscheiden;
2. Teiler einer natürlichen Zahl systematisch bestimmen;
3. Teilbarkeit durch 2, 3, 4, 5 und 10 ohne Division prüfen;
4. mehrere Teilbarkeitsregeln kombinieren;
5. eine natürliche Zahl in Primfaktoren zerlegen;
6. eine Primfaktorzerlegung auf Korrektheit überprüfen.

### Umsetzung im Lernspiel

- Zahlenkarten erscheinen, passende Zahlen müssen markiert werden.
- „Tippe alle Zahlen an, die durch 3 teilbar sind.“
- „Welche Zahl ist prim?“
- „Welche Zerlegung gehört zu 84?“
- Fehlerdiagnose zu falschen Primfaktorzerlegungen.
- Später: mehrere Bedingungen gleichzeitig, z. B. „durch 2 und 3, aber nicht durch 5“.

### Kompetenznachweis

Das Spiel unterscheidet mindestens:

```text
Primzahlen erkennen
Teiler bestimmen
Teilbarkeitsregeln
Regeln kombinieren
Primfaktorzerlegung
```

Bei Fehlern wird nicht sofort dieselbe Zahl erneut gezeigt, sondern eine strukturell ähnliche Aufgabe.

---

## 33.3 Rechenstrategie-Rush

### KLP-Anker

Der KLP verlangt, Rechengesetze zur Begründung vorteilhafter Strategien zu nutzen sowie Überschlag und Probe als Kontrollstrategien einzusetzen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. bei einer Rechnung eine günstige Zerlegung oder Umordnung erkennen;
2. Kommutativ-, Assoziativ- und Distributivgesetz gezielt nutzen;
3. zwischen mehreren Lösungswegen den effizienteren auswählen;
4. eine Rechnung durch Überschlag auf Plausibilität prüfen;
5. einen falschen, aber zunächst plausibel wirkenden Rechenweg diagnostizieren.

### Umsetzung im Lernspiel

Nicht nur „Berechne `25 · 16`“, sondern auch:

- „Welcher Rechenweg ist am günstigsten?“
- `25 · 16 = 100 · 4`
- `25 · 8 · 2`
- `20 · 16 + 5 · 16`

Anschließend wird gelegentlich verlangt:

> „Welche Eigenschaft hast du genutzt?“

Damit wird Strategieeinsatz statt bloßer Geschwindigkeit trainiert.

---

## 33.4 Größen-Blitz

### KLP-Anker

Der KLP fordert das Schätzen von Größen, die situationsgerechte Wahl von Einheiten, das Umwandeln von Einheiten sowie sinnvolles Runden und Kontrollieren.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. für Länge, Fläche, Volumen, Zeit, Geld und Masse eine sinnvolle Einheit auswählen;
2. gebräuchliche Größenangaben ineinander umwandeln;
3. realistische Größenordnungen einschätzen;
4. offensichtlich unplausible Messangaben erkennen;
5. Zahlen im Sachkontext sinnvoll runden;
6. einen Rechenwert durch Überschlag überprüfen.

### Umsetzung im Lernspiel

- „Ein Bleistift ist etwa 18 …?“
- „2,4 m = ? cm“
- „Welche Angabe ist realistisch?“
- „Ein Klassenzimmer ist 60 cm² groß – was stimmt nicht?“
- Aufgaben mit Einheitenfallen.

Der Fokus sollte nicht ausschließlich auf Umrechnungsalgorithmen liegen, sondern auf **Größenvorstellungen**.

---

## 33.5 Dreisatz-Express

### KLP-Anker

Der KLP fordert, Zusammenhänge zwischen zwei Größen in Worten, Tabellen und Diagrammen zu beschreiben, das Dreisatzverfahren in Sachproblemen anzuwenden, Muster zu erkennen und mit Maßstäben zu rechnen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. aus einer Sachsituation zwei zusammenhängende Größen identifizieren;
2. einen Größen-Zusammenhang in einer Wertetabelle darstellen;
3. fehlende Tabellenwerte mit einem passenden Dreisatz bestimmen;
4. Tabellen, Diagramme und verbale Beschreibungen demselben Zusammenhang zuordnen;
5. einfache Zahlenfolgen fortsetzen und ihre Regel beschreiben;
6. Maßstabsangaben zur Bestimmung realer oder gezeichneter Längen nutzen.

### Umsetzung im Lernspiel

Eine Strecke oder Zugfahrt dient als Fortschrittsanzeige. Jede Station verwendet eine andere Darstellung:

1. Wortproblem,
2. Tabelle,
3. Diagramm,
4. Maßstab,
5. Fehlerdiagnose.

Damit wird der KLP-geforderte Darstellungswechsel unmittelbar trainiert.

---

## 33.6 Figuren-Sortierer

### KLP-Anker

Der KLP fordert das Beschreiben und Klassifizieren ebener Figuren und Körper sowie das fachsprachlich korrekte Verwenden geometrischer Grundbegriffe.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Dreiecke und Vierecke anhand ihrer Eigenschaften klassifizieren;
2. Eigenschaften wie parallel, senkrecht, gleich lang oder rechter Winkel erkennen;
3. Ober- und Unterbegriffe korrekt zuordnen;
4. Figuren anhand einer Beschreibung identifizieren;
5. Körper in bildlichen Darstellungen und in Alltagssituationen erkennen.

### Umsetzung im Lernspiel

Nicht nur „Wie heißt die Figur?“, sondern:

- Sortiere Figuren nach Eigenschaften.
- Wähle alle Figuren mit mindestens einem Paar paralleler Seiten.
- Entscheide, ob eine Aussage „immer“, „manchmal“ oder „nie“ gilt.
- Ordne Begriff und Eigenschaft zu.

Dadurch wird ein Begriffsnetz statt reiner Namenskenntnis aufgebaut.

---

## 33.7 Symmetrie-Painter

### KLP-Anker

Der KLP fordert das Erzeugen symmetrischer Figuren, das Bestimmen von Symmetrieachsen und -punkten sowie das Verschieben und Spiegeln von Figuren, auch im Koordinatensystem.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Achsen- und Punktsymmetrie unterscheiden;
2. zu einer Figur mögliche Symmetrieachsen bestimmen;
3. ein unvollständiges achsensymmetrisches Muster ergänzen;
4. Punkte und Figuren an einer Achse spiegeln;
5. Verschiebungen und Spiegelungen im Koordinatensystem ausführen;
6. Fehler in einer Abbildung erkennen.

### Umsetzung im Lernspiel

- Pixel-/Gitter-Painter
- Punkte per Tap spiegeln
- „Welche der vier Figuren ist das korrekte Spiegelbild?“
- Fehlerdiagnose bei falsch gespiegelten Punkten
- später Kombination mehrerer Abbildungen

---

## 33.8 Würfelwerkstatt

### KLP-Anker

Der KLP fordert das Grundprinzip des Messens, die Berechnung von Oberfläche und Volumen bei Quadern sowie das Darstellen und Erkennen von Würfeln und Quadern als Netz, Schrägbild und Modell.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Volumen als Anzahl von Einheitswürfeln deuten;
2. auch bei teilweise verdeckten Würfelbauten die Gesamtzahl der Einheitswürfel bestimmen;
3. das Volumen eines Quaders aus seinen Kantenlängen berechnen;
4. Oberfläche und Volumen voneinander unterscheiden;
5. den Oberflächeninhalt eines Quaders bestimmen;
6. Würfelnetze als gültig oder ungültig beurteilen;
7. zwischen Körper, Netz und Schrägbild wechseln;
8. Drehungen eines Quaders gedanklich nachvollziehen.

### Umsetzung im Lernspiel

Die Würfelaufgaben sollten explizit die Vorstellung aufbauen:

- zunächst sichtbare Würfel zählen,
- dann verdeckte Schichten erschließen,
- dann Maße nutzen,
- anschließend Volumenformel,
- Netz-Körper-Matching,
- Fehlerdiagnose.

So wird die Formel nicht isoliert trainiert.

---

## 33.9 Daten-Detektiv

### KLP-Anker

Der KLP fordert das Darstellen und Interpretieren statistischer Daten, das Bestimmen und Deuten von Häufigkeiten und Kenngrößen sowie das Diskutieren grafischer Darstellungen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. absolute und relative Häufigkeiten aus Tabellen bestimmen;
2. Säulen-, Kreis- und Boxplot-Darstellungen lesen;
3. aus Daten arithmetisches Mittel, Median und Spannweite bestimmen;
4. Kenngrößen inhaltlich deuten;
5. Veränderungen einer Kenngröße auf einzelne Datenwerte zurückführen;
6. zwei Darstellungen derselben Daten miteinander vergleichen;
7. Vor- und Nachteile einer Darstellung begründet auswählen.

### Umsetzung im Lernspiel

Ein „Fall“ besteht nicht nur aus einer Rechnung:

1. Diagramm lesen,
2. Kenngröße berechnen,
3. Aussage beurteilen,
4. Datenwert verändern,
5. vorhersagen, wie sich Mittelwert oder Median verändert.

Damit wird Interpretation mit Berechnung verknüpft.

---

# 34. Klasse 7/8 – erste Stufe der Sekundarstufe I

Grundlage sind insbesondere die konkretisierten Kompetenzerwartungen des KLP auf den Seiten 28–31.

## 34.1 Vorzeichen-Duell

### KLP-Anker

Rationale Zahlen sollen auf der Zahlengeraden dargestellt und geordnet sowie Vorzeichenregeln hergeleitet und angewendet werden.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. rationale Zahlen auf einer Zahlengeraden positionieren;
2. rationale Zahlen der Größe nach ordnen;
3. Betrag und Vorzeichen unterscheiden;
4. Addition und Multiplikation rationaler Zahlen sicher durchführen;
5. Vorzeichenfehler erkennen und begründen.

### Spielhandlung

- Zahlen per Tap sortieren,
- Position auf Zahlenstrahl wählen,
- „größer/kleiner“,
- Rechenaufgaben,
- Fehlerjäger.

Der Schwierigkeitsanstieg erfolgt über Nähe zu Null, Brüche, Dezimalzahlen und verschachtelte Vorzeichen.

---

## 34.2 Term-Labor

### KLP-Anker

Variablen sollen als Veränderliche, Platzhalter und Unbekannte gedeutet werden. Terme sollen aufgestellt und zielgerichtet umgeformt werden.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. die Rolle einer Variablen in verschiedenen Situationen deuten;
2. aus Wort- und Sachsituationen passende Terme bilden;
3. Termwerte durch Einsetzen berechnen;
4. gleichartige Terme zusammenfassen;
5. Klammern korrekt auflösen;
6. Terme mit Flächen- oder Volumenmodellen verbinden;
7. äquivalente Terme erkennen;
8. Bruchterme unter Beachtung zulässiger Werte umformen.

### Spielhandlung

Das Spiel wechselt zwischen:

- „Term bauen“,
- „Term berechnen“,
- „Term ↔ Bild“,
- „zwei Terme gleichwertig?“,
- Fehlerdiagnose.

---

## 34.3 Gleichungs-Fehlerjäger

### KLP-Anker

Der KLP fordert das Aufstellen von Gleichungen aus Sachsituationen, das Lösen linearer Gleichungen, LGS und elementarer Bruchgleichungen sowie das zielgerichtete Auswählen und Vergleichen von Lösungsverfahren.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. aus einer Bedingung eine Gleichung aufstellen;
2. Gleichungen durch Äquivalenzumformungen lösen;
3. jeden Umformungsschritt auf beiden Seiten korrekt ausführen;
4. Lösungen durch Einsetzen prüfen;
5. elementare Bruchgleichungen lösen und unzulässige Werte beachten;
6. typische Fehler in Musterlösungen lokalisieren;
7. bei einfachen LGS ein geeignetes Verfahren auswählen;
8. eine Lösungsmenge im Kontext interpretieren.

### Spielhandlung

Das zentrale Format ist:

```text
Rechenweg anzeigen
→ fehlerhafte Zeile antippen
→ Fehlerart auswählen
→ korrekte Zeile einsetzen
```

Der Fehlerjäger erfüllt die Kompetenz besser als ein reiner Ergebnisvergleich, weil die Lernenden die Struktur der Rechnung analysieren müssen.

---

## 34.4 Graphen-Schaltzentrale

### KLP-Anker

Der KLP fordert die Charakterisierung von Zuordnungen, die Darstellung von Funktionen in Wort, Tabelle, Graph und Term sowie die Interpretation der Parameter linearer Funktionen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. proportionale, antiproportionale und lineare Zusammenhänge unterscheiden;
2. zwischen Wortbeschreibung, Tabelle, Graph und Term wechseln;
3. Steigung und y-Achsenabschnitt an einem linearen Graphen bestimmen;
4. Parameter eines linearen Terms im Sachkontext deuten;
5. aus zwei geeigneten Punkten die Steigung bestimmen;
6. einen passenden Term zu einem Graphen oder Kontext auswählen;
7. ungeeignete Modelle anhand ihrer Eigenschaften ausschließen.

### Spielhandlung

Vier Kartenbereiche:

```text
Kontext | Tabelle | Graph | Term
```

Die Lernenden müssen passende Repräsentationen verbinden. Später fehlen einzelne Darstellungen und müssen selbst ergänzt werden.

---

## 34.5 Prozent-Markt

### KLP-Anker

Der KLP fordert die Anwendung von Prozent- und Zinsrechnung auf Konsumsituationen sowie das Beschreiben und Kombinieren prozentualer Veränderungen mit Wachstumsfaktoren.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Grundwert, Prozentwert und Prozentsatz unterscheiden;
2. eine unbekannte Größe bestimmen;
3. Rabatt und Preissteigerung berechnen;
4. prozentuale Änderungen als Wachstumsfaktor schreiben;
5. mehrere prozentuale Veränderungen korrekt nacheinander anwenden;
6. erkennen, dass gleiche prozentuale Zu- und Abnahmen sich nicht aufheben müssen;
7. Ergebnisse in Konsumsituationen beurteilen.

### Spielhandlung

Der „Markt“ zeigt echte Entscheidungssituationen:

- Welches Angebot ist günstiger?
- Was kostet der Artikel nach zwei Änderungen?
- Welche Werbeaussage ist irreführend?
- Welche Rechnung ist falsch?

Punkte sollten nicht für „möglichst viel Kaufen“ vergeben werden, sondern für mathematisch begründete Entscheidungen.

---

## 34.6 Winkel-Detektiv

### KLP-Anker

Der KLP fordert die Nutzung geometrischer Sätze zur Winkelbestimmung sowie Begründungen zur Innenwinkelsumme und zum Satz des Thales.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Neben-, Scheitel-, Stufen- und Wechselwinkel erkennen;
2. fehlende Winkelgrößen unter Angabe des verwendeten Satzes bestimmen;
3. Innen- und Außenwinkelsumme nutzen;
4. Eigenschaften gleichschenkliger Dreiecke anwenden;
5. den Satz des Thales erkennen und anwenden;
6. zwischen bloßem Ablesen und einer mathematischen Begründung unterscheiden;
7. eine kurze Begründungskette aus gegebenen Bausteinen zusammensetzen.

### Spielhandlung

Jede Winkelaufgabe sollte zwei Schritte besitzen:

1. Winkel bestimmen;
2. **Begründung auswählen oder zusammensetzen.**

Dadurch wird Argumentieren mittrainiert und nicht nur Rechnen.

---

## 34.7 Zufalls-Pfade

### KLP-Anker

Der KLP fordert das Schätzen von Wahrscheinlichkeiten, das Darstellen ein- und zweistufiger Zufallsversuche in Baumdiagrammen, das Anwenden stochastischer Regeln und das Simulieren von Zufallserscheinungen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Ergebnis, Ereignis und Wahrscheinlichkeit unterscheiden;
2. einen Zufallsversuch durch ein Baumdiagramm darstellen;
3. Pfadwahrscheinlichkeiten berechnen;
4. Wahrscheinlichkeiten mehrerer günstiger Pfade addieren;
5. Laplace-Situationen von Nicht-Laplace-Situationen unterscheiden;
6. eine theoretische Wahrscheinlichkeit mit Simulationsergebnissen vergleichen;
7. erklären, warum sich relative Häufigkeiten bei vielen Wiederholungen stabilisieren.

### Spielhandlung

- Baumdiagramm ergänzen,
- Pfade antippen,
- Wahrscheinlichkeiten einsetzen,
- Simulation starten,
- vor der Simulation eine Vermutung abgeben,
- danach Abweichung erklären.

---

# 35. Klasse 9/10 – zweite Stufe der Sekundarstufe I

Grundlage sind insbesondere die konkretisierten Kompetenzerwartungen des KLP auf den Seiten 32–35.

## 35.1 Potenzen- und Wurzel-Run

### KLP-Anker

Der KLP fordert Zehnerpotenzschreibweise, Darstellungswechsel zwischen Bruch, Potenz und Wurzel sowie die Anwendung von Potenz- und Wurzelgesetzen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. große und kleine Zahlen in Zehnerpotenzschreibweise angeben;
2. rationale und irrationale Zahlen unterscheiden;
3. einfache Potenzterme mit Potenzgesetzen vereinfachen;
4. negative Exponenten als Bruchdarstellung deuten;
5. zwischen Wurzel- und Potenzschreibweise wechseln;
6. Quadratwurzeln näherungsweise bestimmen;
7. Wurzelgesetze sinnvoll anwenden;
8. typische unzulässige Umformungen erkennen.

### Spielhandlung

Skill-Rush mit regelmäßigen Darstellungswechseln. Alle fünf bis sechs Aufgaben sollte eine Fehlerdiagnose oder Begründungsaufgabe erscheinen.

---

## 35.2 Quadratische Gleichungswerkstatt

### KLP-Anker

Der KLP fordert, geeignete Lösungsverfahren für quadratische Gleichungen begründet auszuwählen, ihre Effizienz zu vergleichen und Lösungen zu bestimmen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. die Struktur einer quadratischen Gleichung erkennen;
2. prüfen, ob Ausklammern bzw. das Nullprodukt direkt nutzbar ist;
3. Wurzelziehen bei geeigneter Form verwenden;
4. quadratische Ergänzung bzw. p-q-Formel korrekt anwenden;
5. den Satz von Vieta bei passenden Gleichungen nutzen;
6. vor der Rechnung eine geeignete Methode auswählen;
7. unterschiedliche Lösungswege hinsichtlich Aufwand vergleichen;
8. Lösungen auf Plausibilität prüfen.

### Spielhandlung

**Wichtig:** Zuerst wird das Verfahren gewählt, erst danach gerechnet.

Punkte können getrennt vergeben werden:

```text
Methodenwahl     +1
korrekte Rechnung +2
Kontrolle         +1
```

Damit wird die KLP-Forderung nach begründeter Verfahrenswahl direkt abgebildet.

---

## 35.3 Funktionsfamilien-Scanner

### KLP-Anker

Der KLP fordert das Darstellen von Funktionen in verschiedenen Repräsentationen, das Charakterisieren von Funktionsklassen, das Bestimmen und Deuten von Parametern sowie das Anwenden linearer, quadratischer, exponentieller und trigonometrischer Modelle.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. lineare, quadratische und exponentielle Funktionen anhand typischer Eigenschaften unterscheiden;
2. Graph, Wertetabelle und Term derselben Funktion zuordnen;
3. Parameter aus einem Graphen bestimmen;
4. Parameterwirkungen auf Graphen vorhersagen;
5. quadratische Funktionsterme zwischen geeigneten Formen umformen;
6. Nullstellen quadratischer Funktionen bestimmen;
7. Wachstumsfaktor und Anfangswert exponentieller Funktionen deuten;
8. Verdopplungs- und Halbwertszeiten interpretieren;
9. langfristige Entwicklungen aus Modellen abschätzen;
10. periodische Vorgänge durch Sinusfunktionen beschreiben;
11. für Messdaten ein geeignetes Modell auswählen und ungeeignete Modelle begründet verwerfen.

### Spielhandlung

Der Scanner zeigt nacheinander:

- Graph,
- Tabelle,
- Term,
- Messreihe,
- Sachkontext.

Die Aufgabe lautet nicht immer „berechne“, sondern häufig:

> „Welches Modell passt und welches Merkmal war entscheidend?“

---

## 35.4 Pythagoras-Route

### KLP-Anker

Der KLP fordert den Beweis und die Anwendung des Satzes von Pythagoras sowie die Nutzung von Ähnlichkeit, Sinus, Kosinus und Tangens zur Berechnung von Größen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. prüfen, ob ein Dreieck rechtwinklig ist;
2. entscheiden, wann der Satz des Pythagoras anwendbar ist;
3. fehlende Seiten in rechtwinkligen Dreiecken bestimmen;
4. Gegenkathete, Ankathete und Hypotenuse bezogen auf einen Winkel identifizieren;
5. Sinus, Kosinus oder Tangens passend auswählen;
6. Winkel oder Strecken berechnen;
7. Messergebnisse in einer Sachsituation auf Plausibilität prüfen;
8. bei nicht rechtwinkligen Situationen erkennen, dass ein anderes Verfahren nötig ist.

### Spielhandlung

Eine Route wird nicht durch Geschwindigkeit, sondern durch **korrekte Verfahrenswahl** geöffnet.

Vor jeder Rechnung:

> „Welches mathematische Werkzeug brauchst du?“

---

## 35.5 Kreis- und Körperwerkstatt

### KLP-Anker

Der KLP fordert Berechnungen an Kreisen und Kreissektoren sowie Schätzung und Berechnung von Oberfläche und Volumen von Körpern, Teilkörpern und zusammengesetzten Körpern.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Radius, Durchmesser und Umfang in Beziehung setzen;
2. Kreisumfang und Kreisfläche berechnen;
3. Kreisbögen und Kreissektoren anteilig bestimmen;
4. zusammengesetzte Körper sinnvoll in Teilkörper zerlegen;
5. Volumen und Oberfläche voneinander unterscheiden;
6. Oberfläche und Volumen typischer Körper bestimmen;
7. vor einer exakten Rechnung die Größenordnung schätzen;
8. Einheiten korrekt verwenden.

### Spielhandlung

Ein sinnvoller Ablauf ist:

```text
Körper analysieren
→ Zerlegung markieren
→ benötigte Maße auswählen
→ rechnen
→ Schätzung mit Ergebnis vergleichen
```

---

## 35.6 Statistik-Manipulationsdetektor

### KLP-Anker

Der KLP fordert die kritische Analyse statistischer Darstellungen und das Erkennen von Manipulationen sowie die Interpretation statistischer Aussagen in authentischen Texten.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. abgeschnittene Achsen erkennen;
2. ungleichmäßige oder irreführende Skalierungen identifizieren;
3. Diagramm und zugehörige Textaussage auf Übereinstimmung prüfen;
4. absolute und relative Veränderungen unterscheiden;
5. erkennen, welche Informationen für eine Aussage fehlen;
6. eine sachgerechtere Darstellung auswählen;
7. eine statistische Behauptung als plausibel, irreführend oder nicht entscheidbar klassifizieren und kurz begründen.

### Spielhandlung

Jeder „Fall“ enthält:

- Diagramm,
- Aussage,
- Entscheidung,
- Begründung.

So wird aus Statistik eine Urteilsaufgabe statt bloßer Berechnung.

---

## 35.7 Vierfeldertafel-Challenge

### KLP-Anker

Der KLP nennt bedingte Wahrscheinlichkeit, stochastische Unabhängigkeit, Vierfeldertafel, Baumdiagramm und Pfadregeln als verbindliche Inhalte und fordert Wahrscheinlichkeitsberechnungen und Deutungen im Sachzusammenhang.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. eine unvollständige Vierfeldertafel ergänzen;
2. absolute und relative Häufigkeiten unterscheiden;
3. Informationen zwischen Vierfeldertafel und Baumdiagramm übertragen;
4. Wahrscheinlichkeiten unter einer gegebenen Bedingung bestimmen;
5. stochastische Unabhängigkeit in einfachen Situationen untersuchen;
6. eine berechnete Wahrscheinlichkeit im Kontext formulieren;
7. typische Verwechslungen zwischen Schnitt- und bedingter Wahrscheinlichkeit erkennen.

### Spielhandlung

Der Spielmodus sollte Darstellungen koppeln:

```text
Vierfeldertafel
↕
Baumdiagramm
↕
sprachliche Aussage
```

Nicht nur Werte einsetzen, sondern regelmäßig eine Wahrscheinlichkeit in Worten deuten lassen.

---

# 36. Sekundarstufe II – Einführungsphase

Grundlage sind die konkretisierten Kompetenzerwartungen des KLP Sekundarstufe II, insbesondere Seiten 22–23.

## 36.1 Transformations-Labor

### KLP-Anker

Der KLP fordert das Erkunden und Systematisieren von Parametereinfluss sowie das Anwenden und Deuten von Transformationen bei Funktionen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Verschiebung, Streckung und Spiegelung eines Graphen erkennen;
2. aus einer Transformation einen passenden Funktionsterm erzeugen;
3. aus einem Term die Wirkung der Parameter auf den Graphen vorhersagen;
4. mehrere Transformationen unterscheiden;
5. Parameter zielgerichtet so verändern, dass ein vorgegebenes Zielbild entsteht;
6. funktionale Eigenschaften wie Nullstellen, Symmetrie und Extrempunkte mit Transformationen in Beziehung setzen.

### Spielhandlung

**Predict–Observe–Explain:**

1. Lernende sagen die Veränderung voraus.
2. Regler wird verändert.
3. Graph reagiert.
4. Lernende wählen oder formulieren die Erklärung.

Das bloße Verschieben eines Reglers zählt noch nicht als Kompetenznachweis.

---

## 36.2 Ableitungs-Graphenmatch

### KLP-Anker

Der KLP fordert das Deuten der Ableitung als lokale Änderungsrate und Tangentensteigung, das graphische Ableiten sowie das Beschreiben von Monotonie und Krümmung mit Ableitungen.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. mittlere und lokale Änderungsrate unterscheiden;
2. die Tangentensteigung an einem Graphen qualitativ bestimmen;
3. Vorzeichen von `f'` aus dem Verlauf von `f` ablesen;
4. Nullstellen von `f'` mit möglichen Extremstellen von `f` verknüpfen;
5. aus einem Funktionsgraphen einen plausiblen Ableitungsgraphen auswählen;
6. zu einem Ableitungsgraphen einen möglichen Funktionsgraphen auswählen;
7. Monotonieintervalle mithilfe der Ableitung begründen;
8. Informationen aus `f`, `f'` und `f''` miteinander verknüpfen.

### Spielhandlung

Match-Aufgaben sollten nicht nur zwei fertige Graphen verbinden. Spätere Stufen verlangen:

- markiere Intervalle mit `f' > 0`,
- markiere Extremstellen,
- wähle eine Begründung,
- korrigiere einen falschen Ableitungsgraphen.

---

## 36.3 Vektor-Navigator

### KLP-Anker

Der KLP fordert die geometrische Deutung von Vektoren, Vektoroperationen, Kollinearität, Geraden in Parameterform und deren Interpretation in Sachkontexten.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. einen Vektor als Verschiebung deuten;
2. den Verbindungsvektor zweier Punkte bestimmen;
3. die Länge eines Vektors berechnen;
4. Vektoren addieren und mit Skalaren multiplizieren;
5. Kollinearität prüfen;
6. Geraden und Strecken in Parameterform aufstellen;
7. Punkte auf Zugehörigkeit zu einer Geraden prüfen;
8. den Parameter einer Geradengleichung in einem Bewegungskontext deuten.

### Spielhandlung

Ein Navigator eignet sich besonders gut:

- Startpunkt gegeben,
- Bewegungsvektor wählen,
- Ziel erreichen,
- rechnerische und geometrische Darstellung koppeln.

Die Spielfigur darf aber nur Visualisierung sein; die Bewegung muss durch die mathematische Entscheidung ausgelöst werden.

---

## 36.4 Geraden-Lagecheck

### KLP-Anker

Der KLP fordert die Untersuchung von Lagebeziehungen von Geraden, das Lösen zugehöriger LGS und die Interpretation der Lösungsmenge.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. Richtungsvektoren auf Vielfachheit prüfen;
2. bei Bedarf eine Punktprobe durchführen;
3. zwei Geraden als identisch, parallel, windschief oder sich schneidend klassifizieren;
4. ein geeignetes Gleichungssystem zur Schnittpunktbestimmung aufstellen;
5. die Lösungsmenge eines LGS geometrisch interpretieren;
6. einen berechneten Schnittpunkt überprüfen;
7. einen fehlerhaften Lagecheck diagnostizieren.

### Spielhandlung

Zuerst:

> „Welche Prüfung ist als Nächstes sinnvoll?“

Dann:

> Rechnung / Entscheidung / Kontrolle.

So wird strategiegeleitetes Vorgehen trainiert.

---

# 37. Sekundarstufe II – Qualifikationsphase

## 37.1 Stochastik-Generator

### KLP-Anker

Für den Grundkurs fordert der KLP unter anderem Simulationen, Urnenmodelle, mehrstufige Zufallsexperimente, bedingte Wahrscheinlichkeiten, Zufallsgrößen, Erwartungswert, Varianz, Standardabweichung und Binomialverteilung.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. einen Zufallsprozess durch ein geeignetes Urnenmodell beschreiben;
2. Ziehen mit und ohne Zurücklegen unterscheiden;
3. Ereignisse sinnvoll formulieren und verknüpfen;
4. Baumdiagramme und Vierfeldertafeln zur Berechnung einsetzen;
5. bedingte Wahrscheinlichkeiten interpretieren;
6. stochastische Unabhängigkeit prüfen;
7. eine diskrete Zufallsgröße und ihre Verteilung angeben;
8. Erwartungswert und Streuungsmaße bestimmen und deuten;
9. erkennen, wann ein Binomialmodell gerechtfertigt ist;
10. Parameter `n` und `p` in Histogrammen und Wahrscheinlichkeiten interpretieren;
11. Simulation und theoretisches Modell vergleichen.

### Spielhandlung

Der Generator erzeugt nicht nur Rechenaufgaben, sondern wechselt zwischen:

```text
Situation
→ Modell wählen
→ Zufallsgröße definieren
→ Wahrscheinlichkeit berechnen
→ Ergebnis deuten
```

---

## 37.2 Produktregel-Sprint

### KLP-Anker

Der KLP Grundkurs fordert das Ableiten entsprechender Funktionen ohne Hilfsmittel und ausdrücklich die Anwendung der Produktregel.

### Konkretisierte Kompetenzerwartungen

Die Lernenden können:

1. erkennen, ob eine Funktion tatsächlich als Produkt zweier nichttrivialer Faktoren vorliegt;
2. geeignete Faktoren `u` und `v` festlegen;
3. `u'` und `v'` korrekt bestimmen;
4. die Produktregel vollständig anwenden;
5. das Ergebnis sinnvoll vereinfachen;
6. typische Fehlformen wie `(u·v)' = u'·v'` erkennen;
7. zwischen Produkt-, Summen- und Kettenstruktur unterscheiden;
8. die Produktregel innerhalb einer komplexeren Ableitungsaufgabe gezielt einsetzen.

### Spielhandlung

Progression:

```text
Struktur erkennen
→ u/v zuordnen
→ u'/v' bestimmen
→ Regel zusammensetzen
→ vollständige Ableitung
→ Fehlerdiagnose
→ Mischaufgaben
```

Ein Timer sollte erst in einer späteren Automatisierungsstufe eingesetzt werden. Für die Begriffs- und Regelstruktur ist ein ungetakteter Trainingsmodus sinnvoller.

---

# 38. Prozessbezogene Kompetenzen systematisch in die Spiele integrieren

Ein häufiger Schwachpunkt digitaler Lernspiele besteht darin, dass hauptsächlich **Operieren** geprüft wird. Der KLP verlangt jedoch ebenso Modellieren, Problemlösen, Argumentieren und Kommunizieren.

Deshalb sollte jede größere Spielrunde verschiedene Aufgabenkategorien enthalten.

## 38.1 Operieren

Geeignete Spielhandlungen:

- rechnen,
- Term umformen,
- Gleichung lösen,
- Graphwerte ablesen,
- Koordinaten bestimmen,
- geometrische Größen berechnen.

### Nachweis

Automatisch gut prüfbar.

---

## 38.2 Modellieren

Geeignete Spielhandlungen:

- aus einer Sachsituation relevante Größen auswählen,
- eine passende Gleichung oder Funktion auswählen,
- zwischen verschiedenen Modellen entscheiden,
- Ergebnis in den Sachkontext zurückübersetzen,
- Plausibilität bewerten.

### Beispiel

Nicht:

> „Berechne 20 % von 80 €.“

Sondern:

> „Ein Pullover kostet 80 €. Das Geschäft wirbt mit 20 % Rabatt. Welche Rechnung beschreibt den neuen Preis?“

Später:

> „Ist das erhaltene Ergebnis im Kontext plausibel?“

---

## 38.3 Problemlösen

Geeignete Spielhandlungen:

- Verfahren auswählen,
- mehrere Wege vergleichen,
- Zwischenschritte planen,
- unbekannte Aufgaben auf bekannte Strukturen zurückführen,
- eine Sackgasse erkennen und Strategie wechseln.

### Beispiel

Quadratische Gleichungswerkstatt:

> „Welche Methode ist hier am effizientesten?“

Erst danach wird gerechnet.

---

## 38.4 Argumentieren

Geeignete Spielhandlungen:

- Begründung auswählen,
- Begründungsbausteine ordnen,
- Gegenbeispiel finden,
- Aussage als immer/manchmal/nie klassifizieren,
- Fehler begründen,
- einen verwendeten Satz benennen.

### Beispiel

Winkel-Detektiv:

```text
∠β = 65°
Warum?

[ ] Scheitelwinkel
[ ] Wechselwinkel
[ ] Innenwinkelsumme
```

Auf höherem Niveau:

> Ordne drei Begründungsbausteine zu einer Argumentationskette.

---

## 38.5 Kommunizieren

Eine vollständig offene mathematische Kommunikation lässt sich nur begrenzt automatisch bewerten. Dennoch können Spiele Teilkompetenzen fördern:

- Fachbegriffe gezielt auswählen,
- Rechenwege vervollständigen,
- mathematische und natürliche Sprache zuordnen,
- kurze Satzbausteine auswählen,
- Lösungen vergleichen,
- im Partner-/Teammodus eine gemeinsame Entscheidung treffen.

### Konsequenz

Für anspruchsvolle kommunikative Kompetenzen sollte das Spiel bewusst mit Unterricht kombiniert werden, z. B.:

> „Erklärt euch gegenseitig, warum ihr unterschiedliche Strategien gewählt habt.“

Das Lernspiel kann diese Kompetenz **anbahnen**, aber nicht jede kommunikative Leistung valide automatisch erfassen.

---

# 39. Kompetenzbasierte Aufgabenverteilung im Spielmotor

Jede Aufgabe sollte nicht nur ein Thema, sondern auch eine **konkrete Kompetenz-ID** besitzen.

Beispiel:

```js
{
  id: "bruch_vergleich_042",
  stage: "56",
  topic: "brueche",
  klpReference: "Erprobungsstufe AA-8/11/12",
  skill: "bruch_vergleichen",
  process: ["operieren", "argumentieren"],
  representation: "symbolisch",
  difficulty: 0.42,
  taskType: "fraction_compare"
}
```

Weitere mögliche Metadaten:

```js
{
  requiresReasoning: true,
  representationChange: false,
  errorDiagnosis: false,
  calculatorAllowed: false,
  timePressureSuitable: true
}
```

Dadurch kann der Spielmotor verhindern, dass eine Runde zufällig nur aus einem Kompetenztyp besteht.

---

# 40. Kompetenz-Mastery statt bloßer Punktzahl

## 40.1 Problem eines reinen Highscores

Ein Lernender könnte sehr viele einfache Aufgaben lösen und dadurch einen hohen Punktestand erreichen, obwohl zentrale Teilkompetenzen fehlen.

Darum sollten Punkte und Kompetenzauswertung getrennt werden.

Beispiel:

```text
Punktestand: 2.450

Kompetenzprofil:
Brüche vergleichen       91 %
Kürzen                    84 %
Erweitern                 78 %
Darstellungswechsel       62 %
Fehlerdiagnose            55 %
Sachkontexte              70 %
```

---

## 40.2 Vorschlag für Mastery

Eine Kompetenz wird nicht nach einer einzigen richtigen Aufgabe als „beherrscht“ markiert.

Beispielregel:

- mindestens 5 relevante Aufgaben,
- mindestens 80 % korrekt,
- mindestens zwei verschiedene Darstellungsformen,
- mindestens eine zeitlich versetzte Wiederholungsaufgabe,
- bei komplexeren Kompetenzen mindestens eine Transfer- oder Fehlerdiagnoseaufgabe.

Dies ist eine **technische und didaktische Designentscheidung**, keine KLP-Vorgabe.

---

## 40.3 Fehlergewichtung

Nicht jeder Fehler sollte gleich behandelt werden.

Beispiel Bruchvergleich:

### Flüchtigkeitsfehler

Lernender wählt versehentlich falsches Symbol, korrigiert direkt.

→ geringe Gewichtung.

### stabiler Fehlertyp

Lernender entscheidet mehrfach: „größerer Nenner bedeutet größerer Bruch“.

→ gezielte Intervention:

1. grafische Darstellung,
2. Gegenbeispiel,
3. neue Vergleichsaufgabe.

Das Spiel benötigt daher langfristig nicht nur `correct/incorrect`, sondern möglichst **Fehlerkategorien**.

---

# 41. Konkrete Struktur einer kompetenzorientierten Spielrunde

Eine gute Runde mit 15 Aufgaben könnte z. B. so aufgebaut sein:

| Position | Funktion | Beispiel |
|---|---|---|
| 1–3 | leichter Abruf | bekannte Grundaufgaben |
| 4 | Darstellungswechsel | Bild ↔ Term |
| 5–6 | Routine | etwas höhere Zahlen |
| 7 | Fehlerdiagnose | falscher Lösungsweg |
| 8 | Wiederholung eines früheren Fehlers | neue Zahlen, gleiche Kompetenz |
| 9–10 | neue Variation | leicht höhere Schwierigkeit |
| 11 | Begründung | Satz/Strategie auswählen |
| 12 | Modellierung | kurzer Sachkontext |
| 13 | gezielte Wiederholung | schwächste Kompetenz |
| 14 | Transfer | ungewohnte Darstellung |
| 15 | Boss-Aufgabe | mehrere Teilkompetenzen |

Damit wird „möglichst viele Aufgaben lösen“ nicht zu bloßem Drill, sondern zu **systematischer Kompetenzfestigung**.

---

# 42. Welche Kompetenzen eignen sich für Zeitdruck?

## Gut geeignet

Zeitdruck kann sinnvoll sein, wenn eine Kompetenz bereits verstanden wurde und automatisiert werden soll:

- einfache Grundrechenfertigkeiten,
- Teilbarkeitsregeln,
- bekannte Potenzregeln,
- einfache Bruchvergleiche,
- Zuordnung von Standarddarstellungen,
- Ableitungsgrundregeln nach abgeschlossener Erarbeitung.

## Nur eingeschränkt geeignet

- Fehlerdiagnose,
- Modellierung,
- Begründungen,
- Verfahren auswählen,
- komplexe Graphenanalyse,
- geometrische Beweise,
- Interpretation statistischer Aussagen.

Hier sollte der Fokus auf Qualität des Denkens statt Geschwindigkeit liegen.

---

# 43. Mindestanforderungen an jedes neue Lernspiel

Bei der Entwicklung eines neuen Spiels müssen vor der Programmierung mindestens folgende Punkte definiert sein:

1. **KLP-Kompetenz:** Welche konkrete Kompetenzerwartung wird aufgegriffen?
2. **Operationalisierung:** Welche beobachtbare Handlung zeigt diese Kompetenz?
3. **Aufgabentyp:** Welche Interaktion fordert genau diese Handlung?
4. **Fehlvorstellungen:** Welche typischen Fehler sollen diagnostiziert werden?
5. **Progression:** Wie wird die Aufgabe fachlich schwieriger?
6. **Feedback:** Was erhält der Lernende bei einer falschen Lösung?
7. **Wiederholung:** Wie und wann erscheint die Kompetenz erneut?
8. **Mastery:** Wann gilt die Kompetenz innerhalb des Spiels als hinreichend sicher?
9. **Darstellungswechsel:** Welche Repräsentationen werden verknüpft?
10. **Prozesskompetenz:** Wird nur operiert oder auch modelliert, argumentiert bzw. problemlösend gearbeitet?

Erst anschließend sollte die konkrete Game-Mechanik festgelegt werden.

---

# 44. Quellenbezug der Kompetenzkonkretisierung

## Kernlehrplan Sekundarstufe I

**Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen (2019): Kernlehrplan für die Sekundarstufe I – Gymnasium – Mathematik.**

Verwendete Abschnitte:

- S. 18–22: prozessbezogene Kompetenzen,
- S. 23–27: Erprobungsstufe,
- S. 28–31: erste Stufe der Sekundarstufe I,
- S. 32–35: zweite Stufe der Sekundarstufe I.

## Kernlehrplan Sekundarstufe II

**Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen (2023): Kernlehrplan für die Sekundarstufe II – Gymnasium/Gesamtschule – Mathematik.**

Verwendete Abschnitte:

- S. 17–21: prozessbezogene Kompetenzen,
- S. 22–23: Einführungsphase,
- S. 24–26: Qualifikationsphase Grundkurs,
- ergänzend S. 27–30 für weiterführende mögliche Lernspielideen im Leistungskurs.

## Didaktische Einordnung

Die spielbezogenen Formulierungen und Mastery-Kriterien in diesem Dokument sind **didaktische Operationalisierungen**. Die fachlichen Zielrichtungen sind aus den Kernlehrplänen abgeleitet; konkrete Schwellenwerte, Wiederholungsregeln, Spielmechaniken und Diagnosemodelle sind Gestaltungsvorschläge für die geplante Lernspiel-Engine.

---

# 45. Altersgerechte Gestaltung nach Jahrgangsstufen

Die Lernspiele sollen nicht über alle Jahrgangsstufen hinweg gleich aufgebaut sein. Die fachlichen Anforderungen, die Länge einzelner Aufgaben, die Menge an Text, die Zahl gleichzeitig sichtbarer Informationen und auch die Art der Belohnung müssen systematisch an das Alter und den Lernstand angepasst werden.

Die Grundidee lautet:

> **Klasse 5/6: sehr einfach spielen und sehr viel üben.**  
> **Klasse 7–10: zunehmend komplex denken, erklären und zwischen Darstellungen wechseln.**  
> **EF/Q1/Q2: abiturorientiert, fachlich dicht und mit komplexen Aufgabenformaten arbeiten.**

Dabei soll der technische Spielmotor zwar möglichst gleich bleiben, aber die Oberfläche und die didaktische Tiefe müssen sich deutlich unterscheiden.

---

## 45.1 Klasse 5/6 – sehr einfache, stark übungsorientierte Lernspiele

### Leitidee

Für die Klassen 5 und 6 sollen die Lernspiele bewusst **sehr einfach, übersichtlich und schnell verständlich** sein.

Die Lernenden sollen möglichst wenig Zeit damit verbringen, das Spiel selbst zu verstehen. Stattdessen sollen sie schnell in eine Übungsroutine gelangen.

Die zentrale Frage lautet:

> **Wie können Lernende in kurzer Zeit viele sinnvolle mathematische Aufgaben bearbeiten, ohne durch eine komplizierte Spielmechanik überfordert zu werden?**

### Gestaltungsprinzipien

- maximal eine zentrale Spielhandlung gleichzeitig,
- sehr kurze Aufgabenstellungen,
- große Buttons und Karten,
- wenige Elemente auf dem Bildschirm,
- klare Symbole,
- sofortiges Feedback,
- kaum verschachtelte Menüs,
- keine langen Erklärtexte während des Spiels,
- höchstens wenige Auswahlmöglichkeiten,
- häufige Erfolgserlebnisse,
- langsame Schwierigkeitssteigerung,
- regelmäßige Wiederholung fehlerhafter Aufgaben,
- kindgerechte, ruhige Gestaltung,
- kurze Spielrunden von etwa 5–15 Minuten.

### Typische Spielhandlungen

Besonders geeignet:

- antippen,
- auswählen,
- zwei Karten verbinden,
- Fläche färben,
- Zahl auf Zahlenstrahl setzen,
- richtig/falsch,
- größer/kleiner,
- eine Zahl eingeben,
- einfache Reihenfolge bestimmen.

Weniger geeignet:

- lange offene Texte,
- mehrstufige Modellierungsaufgaben,
- komplizierte Menüs,
- komplexe Regelwerke,
- starke Zeitbegrenzung bei neuen Inhalten.

### Beispiel: Bruch-Arena Klasse 5/6

Eine typische Runde könnte nur aus vier gut erkennbaren Aufgabentypen bestehen:

1. Welcher Bruch ist größer?
2. Kürze den Bruch.
3. Färbe den angegebenen Anteil.
4. Finde den passenden Bruch zum Bild.

Erst wenn diese sicher funktionieren, kommen später:

- Zahlenstrahl,
- Anteil und Ganzes,
- einfache Fehlerdiagnose.

### Belohnung

Belohnungen spielen in Klasse 5/6 eine größere Rolle und sollten positiv, aber nicht überladen sein.

Geeignet:

- Sterne,
- kleine Abzeichen,
- sichtbare Fortschrittsleiste,
- Streaks,
- Abschlussmedaille,
- freigeschaltete Spielkarten,
- kleine Avatar-Elemente,
- Urkunde nach Abschluss.

Die Belohnung soll nie fachliche Rückmeldung ersetzen.

---

# 46. Klasse 7–10 – zunehmende fachliche Komplexität

## Leitidee

Ab Klasse 7 kann der Anspruch deutlich erhöht werden. Die Lernenden sollen nicht nur rechnen, sondern zunehmend:

- Strategien auswählen,
- Fehler diagnostizieren,
- Darstellungen wechseln,
- mathematische Zusammenhänge erklären,
- Verfahren vergleichen,
- kurze Modellierungsaufgaben lösen.

Der Spielcharakter bleibt erhalten, aber die Mathematik rückt stärker in den Vordergrund.

---

## 46.1 Klasse 7/8

### Schwerpunkt

- sichere Grundlagen,
- erste bewusste Strategieauswahl,
- Fehlerdiagnose,
- einfache Begründungen,
- Wechsel zwischen Term, Tabelle, Graph und Kontext.

### Geeignete Aufgabenstruktur

Eine Runde darf mehrere Aufgabentypen enthalten:

```text
Rechnen
→ Zuordnung
→ Fehler finden
→ kurze Begründung
→ neue Rechnung
```

### Beispiel Term-Labor

1. Termwert berechnen,
2. äquivalenten Term auswählen,
3. Fehler in einer Umformung markieren,
4. Term zu einer Fläche zuordnen,
5. fehlenden Rechenschritt ergänzen.

---

## 46.2 Klasse 9/10

### Schwerpunkt

- Verfahrenswahl,
- mehrschrittige Aufgaben,
- Modellierung,
- Transfer,
- komplexere Darstellungswechsel,
- fachsprachliche Begründung.

### Geeignete Aufgaben

Beispiel quadratische Gleichungen:

1. Gleichung klassifizieren,
2. geeignetes Lösungsverfahren auswählen,
3. Gleichung lösen,
4. Lösung prüfen,
5. Fehler in einem alternativen Lösungsweg finden.

Beispiel Trigonometrie:

1. Situation analysieren,
2. Skizze ergänzen,
3. passende Beziehung wählen,
4. rechnen,
5. Ergebnis im Kontext beurteilen.

### Belohnungssystem

Belohnungen sollten in dieser Altersgruppe stärker fachlich ausgerichtet werden.

Geeignet:

- Kompetenz-Badges,
- persönliche Bestwerte,
- Level-Freischaltungen,
- Themen-Mastery,
- Bonusmissionen,
- Challenge-Modus,
- optionale Urkunde nach Abschluss eines größeren Themenbereichs.

Weniger sinnvoll:

- zu kindliche Avatare,
- übermäßige Animationen,
- dauernde Konfetti-Effekte.

---

# 47. EF, Q1 und Q2 – abiturorientierte Lernspiele

## 47.1 Grundprinzip

In der gymnasialen Oberstufe sollen die Lernspiele deutlich stärker als **digitale Prüfungsvorbereitung** gestaltet werden.

Im Mittelpunkt stehen:

- abiturrelevante Fachkompetenzen,
- sichere Standardverfahren,
- vernetztes Wissen,
- Operatoren,
- mehrschrittige Aufgaben,
- Transfer,
- Interpretation,
- Modellierung,
- Begründung,
- Arbeit mit verschiedenen Darstellungen.

Die Lernspiele dürfen technisch und fachlich deutlich komplexer sein.

Die Inhalte sollen sich an

1. dem aktuellen Kernlehrplan Mathematik Sekundarstufe II NRW und
2. den jeweils aktuellen Abiturvorgaben des betreffenden Abiturjahrgangs

orientieren.

Da sich jährliche Schwerpunktsetzungen ändern können, soll die Aufgabenbank für EF/Q1/Q2 so aufgebaut sein, dass Abitur-Schwerpunkte jährlich angepasst oder aktiviert/deaktiviert werden können.

---

## 47.2 Abiturrelevante Inhaltsfelder

Die Oberstufen-Lernspiele sollten mindestens die drei zentralen Inhaltsfelder systematisch abdecken:

### Funktionen und Analysis

- Funktionsuntersuchung,
- Ableitungen,
- Änderungsraten,
- Extrem- und Wendestellen,
- Funktionseigenschaften,
- Funktionstransformationen,
- Integralrechnung,
- Flächeninhalte,
- Bestands- und Änderungsfunktionen,
- Modellierung,
- Interpretation von Parametern.

### Analytische Geometrie und Lineare Algebra

- Vektoren,
- Geraden,
- Ebenen,
- Lagebeziehungen,
- Schnittpunkte,
- lineare Gleichungssysteme,
- Abstände,
- Winkel,
- geometrische Interpretation algebraischer Ergebnisse,
- Modellierung räumlicher Situationen.

### Stochastik

- Baumdiagramme,
- bedingte Wahrscheinlichkeit,
- Vierfeldertafeln,
- Zufallsgrößen,
- Erwartungswert,
- Varianz und Standardabweichung,
- Binomialverteilung,
- Hypothesentests bzw. weitere verbindliche Inhalte gemäß aktuellem Abiturjahrgang,
- Interpretation statistischer Aussagen.

---

# 48. Abiturorientierte Kompetenzstufen

Für EF/Q1/Q2 sollte jede Kompetenz in drei Stufen trainiert werden.

## Stufe A – Standardverfahren sicher beherrschen

Beispiele:

- Ableitung berechnen,
- Schnittpunkt bestimmen,
- Binomialwahrscheinlichkeit berechnen,
- Gleichung lösen.

Diese Aufgaben können auch als kurze Skill-Runs vorkommen.

---

## Stufe B – Verfahren auswählen und begründen

Beispiele:

> Welche Methode ist zur Bestimmung des Extrempunkts geeignet?

> Welche Lageprüfung ist bei diesen beiden Geraden zuerst sinnvoll?

> Warum eignet sich hier ein Binomialmodell?

---

## Stufe C – Abiturähnlicher Transfer

Mehrere Teilkompetenzen werden verbunden.

Beispiel Analysis:

```text
Sachkontext
→ Funktion interpretieren
→ Ableitung nutzen
→ Extremstelle bestimmen
→ Ergebnis im Kontext deuten
→ Modell kritisch beurteilen
```

Beispiel Analytische Geometrie:

```text
räumliche Situation
→ Punkte/Vektoren bestimmen
→ Gerade/Ebene aufstellen
→ Lage untersuchen
→ Schnittpunkt interpretieren
→ geometrische Aussage begründen
```

Beispiel Stochastik:

```text
Experiment
→ Modell festlegen
→ Wahrscheinlichkeit berechnen
→ Parameter deuten
→ Aussage beurteilen
```

---

# 49. Abiturorientierte Spielmodi

## 49.1 Grundlagen-Sprint

Ziel:

- Standardverfahren automatisieren,
- Rechenfehler reduzieren,
- zentrale Begriffe abrufen.

Geeignet für:

- Ableitungsregeln,
- Vektoroperationen,
- Binomialwahrscheinlichkeiten,
- Funktionsparameter.

---

## 49.2 Operatoren-Training

Die Lernenden erhalten Aufgaben mit typischen mathematischen Operatoren.

Beispiele:

- bestimmen,
- berechnen,
- untersuchen,
- erläutern,
- begründen,
- interpretieren,
- beurteilen,
- vergleichen.

Der Spielmotor soll nicht nur nach Themen, sondern auch nach Operator filtern können.

Beispiel:

```text
Thema: Analysis
Operator: begründen
```

Das Spiel erzeugt dann gezielt Begründungsaufgaben.

---

## 49.3 Abitur-Mission

Eine längere Runde bildet eine kleine Abituraufgabe nach.

Beispiel:

```text
Teil A: Verständnis
Teil B: Rechnung
Teil C: Interpretation
Teil D: Transfer
```

Der Fortschrittsbalken zeigt nicht „Level 1–4“, sondern die fachlichen Phasen.

---

## 49.4 Fehleranalyse Oberstufe

Gezeigt wird eine Schülerlösung.

Auftrag:

1. Fehlerstelle markieren,
2. Fehlerart identifizieren,
3. korrekten Lösungsweg ergänzen,
4. Auswirkungen auf Folgeergebnisse beurteilen.

Dies eignet sich besonders für:

- Ableitungen,
- Integralrechnung,
- Lagebeziehungen,
- LGS,
- Wahrscheinlichkeitsrechnung.

---

## 49.5 Prüfungsmodus

Der Prüfungsmodus kann deutlich weniger Hilfen enthalten.

Mögliche Eigenschaften:

- feste Aufgabenanzahl,
- keine sofortige Lösung,
- Hinweise deaktiviert,
- Bearbeitungszeit sichtbar,
- Ergebnisübersicht erst am Ende,
- Kompetenzanalyse nach Abschluss.

Dieser Modus dient zur Selbstdiagnose und nicht zur Leistungsbewertung.

---

# 50. Differenzierung innerhalb der Oberstufe

## EF

### Ziel

Übergang von Sekundarstufe I zu oberstufentypischem mathematischem Arbeiten.

Schwerpunkt:

- Funktionsverständnis,
- Ableitungsbegriff,
- Vektoren und Geraden,
- grundlegende Stochastik,
- Darstellungswechsel.

Die Lernspiele dürfen noch stärker führen.

---

## Q1

### Ziel

Aufbau abiturrelevanter Verfahren und Vernetzung.

Schwerpunkt:

- komplexere Analysis,
- Analytische Geometrie,
- mehrstufige Stochastik,
- Operatorentraining,
- längere Aufgabenketten.

---

## Q2

### Ziel

gezielte Abiturvorbereitung.

Schwerpunkt:

- kumulative Wiederholung,
- gemischte Inhaltsfelder,
- Transfer,
- komplexe Aufgaben,
- typische Prüfungsfehler,
- abiturähnliche Zeit- und Aufgabenstrukturen,
- individuelle Diagnose der noch unsicheren Kompetenzbereiche.

---

# 51. Belohnungssysteme

Belohnungssysteme sollen altersgerecht eingesetzt werden.

---

## 51.1 Klasse 5/6

### Besonders geeignet

- Sterne,
- Medaillen,
- Sammelkarten,
- Fortschrittsbalken,
- kleine Level-Abzeichen,
- persönliche Rekorde,
- Abschlussurkunden.

### Beispiel

Nach einer Mission:

```text
Mission geschafft!

Brüche vergleichen: 8/10
Brüche kürzen:       9/10
Brüche darstellen:   7/10

Du hast die Bruch-Mission abgeschlossen.
```

Anschließend:

> **Teilnehmerurkunde erstellen**

---

# 52. Digitale Teilnehmerurkunde

Für Klasse 5/6 und optional auch für höhere Klassen sollte nach Abschluss einer größeren Mission eine Urkunde generiert werden können.

## Inhalte

Die Urkunde kann enthalten:

- Vorname oder Nickname,
- Titel des Lernspiels,
- Datum,
- abgeschlossene Mission,
- optional erreichte Kompetenz-Badges,
- optional Punktzahl,
- optional persönliche Bestleistung.

Beispiel:

```text
TEILNEHMERURKUNDE

für

_________________________

hat die Mission

„Bruch-Arena“

erfolgreich abgeschlossen.

Trainiert wurden:
✓ Brüche vergleichen
✓ Brüche kürzen
✓ Brüche darstellen

Datum: __________
```

---

## 52.1 Technische Umsetzung

Die Urkunde kann direkt aus dem Browser erzeugt werden.

Möglichkeiten:

### HTML-Druckansicht

- separate Urkundenseite,
- `window.print()`,
- als PDF über den Browser speicherbar.

Vorteil:

- sehr einfach,
- offline nutzbar,
- keine Serververbindung notwendig.

### Canvas/SVG

Die Urkunde wird grafisch als Canvas oder SVG erzeugt.

Vorteil:

- schöneres Design,
- automatischer Name,
- Sterne oder Badges einblendbar.

### PDF-Erzeugung

Optional kann später eine clientseitige PDF-Lösung ergänzt werden.

Für die erste Version ist eine druckoptimierte HTML-Urkunde ausreichend.

---

# 53. Datenschutz bei Urkunden

Die Urkunde sollte möglichst lokal erzeugt werden.

Empfehlung:

- Name wird nur lokal eingegeben,
- keine Übertragung an Server,
- keine Speicherung im gemeinsamen System,
- alternativ Nickname verwenden.

So bleibt die Funktion auch offline und datensparsam.

---

# 54. Belohnungen für Klasse 7–10

Hier sollte die Belohnung weniger kindlich und stärker leistungsbezogen gestaltet sein.

Beispiele:

```text
Badge: Term-Profi
Badge: Fehlerjäger
Badge: Graphen-Experte
Badge: Stochastik-Level 3
```

Zusätzlich:

- neue Challenge freischalten,
- persönliche Bestleistung,
- Kompetenzfortschritt,
- „3 Kompetenzen verbessert“.

Eine Urkunde kann weiterhin angeboten werden, sollte aber sachlicher gestaltet sein.

---

# 55. Belohnungen für EF/Q1/Q2

In der Oberstufe steht nicht die spielerische Belohnung im Vordergrund, sondern **sichtbarer Lernfortschritt**.

Geeignet:

- Kompetenzprofil,
- Abitur-Readiness-Anzeige,
- Themen-Mastery,
- Operatorenprofil,
- persönliche Fehlerstatistik,
- abgeschlossene Abitur-Missionen.

Beispiel:

```text
Analysis                  82 %
Analytische Geometrie     74 %
Stochastik                88 %

Operatoren:
berechnen                 sicher
untersuchen               sicher
begründen                 noch üben
beurteilen                noch üben
```

Optional:

> „Abitur-Mission Analysis bestanden“

---

# 56. Altersabhängige Oberfläche

Der gleiche technische Motor kann drei unterschiedliche UI-Varianten besitzen.

## UI 5/6

- große Karten,
- größere Icons,
- wenige Informationen,
- freundliche Visualisierung,
- Sterne / Medaillen,
- sehr deutliche Buttons.

## UI 7–10

- sachlicher,
- kompakter,
- mehr Informationen gleichzeitig,
- Kompetenz-Badges,
- stärkere Diagramm- und Formelarbeit.

## UI EF/Q

- reduzierte, erwachsene Oberfläche,
- Prüfungscharakter,
- Formeln und Graphen im Zentrum,
- wenig dekorative Gamification,
- detaillierte Kompetenzanalyse.

---

# 57. Neue Anforderung an die gemeinsame Engine

Der Spielmotor sollte deshalb künftig einen Alters-/Stufenparameter besitzen.

Beispiel:

```js
gameConfig = {
  stage: "klasse5",
  uiMode: "junior",
  feedbackDepth: "simple",
  maxTaskSteps: 1,
  rewards: ["stars", "certificate"],
  timerMode: "optional"
}
```

Klasse 9:

```js
gameConfig = {
  stage: "klasse9",
  uiMode: "standard",
  feedbackDepth: "detailed",
  maxTaskSteps: 3,
  rewards: ["badges", "mastery"],
  timerMode: "selective"
}
```

Q2:

```js
gameConfig = {
  stage: "q2",
  uiMode: "exam",
  feedbackDepth: "exam",
  maxTaskSteps: 6,
  rewards: ["mastery", "examMission"],
  timerMode: "exam"
}
```

---

# 58. Zentrale Entwicklungsregel

Für jedes neue Lernspiel müssen künftig nicht nur Fachkompetenz und Aufgabentyp definiert werden, sondern zusätzlich:

1. **Jahrgangsstufe**
2. **altersgerechte maximale Aufgabenkomplexität**
3. **geeignete Interaktionsform**
4. **geeignete Textlänge**
5. **Grad der Hilfestellung**
6. **Art der Belohnung**
7. **Eignung für Zeitdruck**
8. **bei EF/Q1/Q2: Abiturrelevanz**
9. **bei EF/Q1/Q2: Operator**
10. **bei Q1/Q2: mögliche Einbettung in eine abiturähnliche Aufgabenfolge**

Damit wird verhindert, dass dieselbe Spielstruktur lediglich mit schwierigeren Zahlen für alle Altersstufen verwendet wird.

---

# 59. Zusammenfassende Altersmatrix

| Stufe | Hauptziel | Aufgabenkomplexität | Spielstruktur | Belohnung |
|---|---|---:|---|---|
| Klasse 5/6 | viel üben, Sicherheit gewinnen | sehr niedrig bis niedrig | kurze Einzelschritte | Sterne, Medaillen, Urkunde |
| Klasse 7/8 | Strategien und Darstellungen verknüpfen | mittel | gemischte Aufgaben | Badges, Level, Fortschritt |
| Klasse 9/10 | Verfahren auswählen und transferieren | mittel bis hoch | mehrschrittige Aufgaben | Mastery, Challenges |
| EF | oberstufengerechtes Arbeiten aufbauen | hoch | fachlich vernetzt | Kompetenzprofil |
| Q1 | Abiturkompetenzen aufbauen | hoch | komplexe Aufgabenketten | Themen-Mastery |
| Q2 | Abitur vorbereiten und diagnostizieren | sehr hoch | abiturähnliche Missionen | Abitur-Readiness |

---

# 60. Repository-Analyse: bestehende Lernspiele und wiederverwendbare Muster aus `Hardenacke/Mathe`

Für diese Erweiterung wurde das bestehende Repository

`https://github.com/Hardenacke/Mathe`

gezielt nach bereits vorhandenen Lernspielen, spielerischen Lernpfaden, Fortschrittslogiken, Belohnungssystemen, Touch-Interaktionen, Aufgaben-Generatoren und Diagnoseelementen durchsucht.

Wichtig ist die Unterscheidung:

- **Quellbestand:** Funktionen und Ideen, die bereits im Repository vorhanden sind.
- **Übernahmeempfehlung:** daraus abgeleitete Vereinheitlichungen für die geplante gemeinsame Lernspiel-Engine.

Die folgenden Abschnitte übernehmen daher nicht ungeprüft komplette Dateien, sondern extrahieren **bewährte Architektur- und Codestrukturen**, die sich sinnvoll generalisieren lassen.

---

# 61. Gefundene besonders relevante Lernspiel- und Lernpfadideen

## 61.1 Mathe-Quest Klasse 5

**Quelldatei:**

`klasse-5/klasse5_lernspiele_github_bilder/klasse5-lernspiele.html`

Diese Datei ist für die künftige Lernspiel-Engine besonders wertvoll, weil darin bereits viele Elemente enthalten sind, die für die geplanten Spiele der Klassen 5/6 sinnvoll sind.

### Bereits vorhandene Ideen

Die Datei arbeitet mit:

- mehreren thematisch unterschiedlichen Missionen,
- einem gemeinsamen Spiel-Hub,
- XP,
- Münzen,
- Themenpokalen,
- freischaltbaren Figuren/Avataren,
- Herzen,
- Streaks,
- steigender Schwierigkeit,
- Sofort-Feedback,
- gestuften Tipps,
- 30-Sekunden-Cooldown zwischen weiteren Tipps,
- lokaler Speicherung,
- Statistik je Mission,
- gemeinsamen Aufgabengeneratoren.

### Besonders wichtige Erkenntnis

Die einzelnen Spiele sind nicht vollständig separat programmiert. Stattdessen werden sie über Konfigurationsobjekte beschrieben und nutzen einen gemeinsamen Spielablauf.

Genau dieses Prinzip sollte die Grundlage der neuen Engine werden.

---

## 61.2 Fluglotsen-Akademie – Geraden im Raum

**Quelldatei:**

`ef/geraden-und-ebenen/geraden-im-raum/lernpfad-geraden-im-raum-flugzeug.html`

Dieser Lernpfad enthält mehrere Interaktionsformen, die besonders für EF/Q1/Q2 geeignet sind.

### Bereits vorhandene Ideen

- Mission als fachlicher Rahmen,
- Fortschrittsbalken,
- Pflichtfortschritt,
- Predict–Observe–Explain,
- Regler zur Parameterveränderung,
- Canvas-Visualisierung,
- Formel-Puzzle,
- Fehlerdiagnose,
- Zuordnungsaufgaben,
- unmittelbares fachliches Feedback,
- Lehrkraftmodus,
- Vollbildmodus,
- Zurücksetzen,
- iPad-taugliche Größen und responsive Darstellung.

### Besonders wertvoll: Formel-Puzzle

Die Geradengleichung wird nicht einfach abgefragt. Die Lernenden setzen ihre Bestandteile in sinnvoller Reihenfolge zusammen:

```text
x
→ Stützvektor
→ +
→ t
→ Richtungsvektor
```

Dieses Prinzip lässt sich stark verallgemeinern.

Mögliche weitere Anwendungen:

- Produktregel zusammensetzen,
- quadratische Lösungsformel,
- Binomialformel,
- Geraden-/Ebenengleichung,
- Baumdiagramm-Pfadregel,
- Termumformungen,
- Beweis- oder Argumentationsketten.

---

## 61.3 Lagebeziehungs-Test EF

**Quelldatei:**

`ef/geraden-und-ebenen/Lagebeziehung_Test.html`

Diese Datei ist für die geplante Oberstufen- und Abiturarchitektur besonders interessant.

### Bereits vorhandene Ideen

- mehrere Test-/Trainingsbereiche,
- lokale Ergebnisspeicherung,
- Ergebnis-Historie,
- unterschiedliche Aufgabenpools,
- zufällige Reihenfolge,
- Fobizz-Export,
- klare Trennung von Übung und Test,
- themenbezogene Rückmeldungen.

### Nützliche Struktur

Ein Aufgabenpool wird nicht rein zufällig zusammengestellt. Stattdessen werden verschiedene fachliche Fälle bewusst gleichmäßig berücksichtigt und danach gemischt.

Das ist für Abiturtraining deutlich besser als unkontrollierter Zufall.

Beispiel:

```text
identisch
parallel
schneidend
windschief
```

werden gezielt in den Pool aufgenommen.

**Übernahmeempfehlung:**  
Für Oberstufen-Lernspiele soll die Engine einen **balancierten Kompetenz-Pool** erzeugen, bevor die Aufgaben zufällig angeordnet werden.

---

## 61.4 Brüche kürzen und erweitern – Pflichtfortschritt

**Quelldatei:**

`klasse-5/arithmetik-algebra/brueche-und-anteile/erweitern-und-kuerzen/lernpfad-brueche-kuerzen-erweitern.html`

Hier finden sich bereits zwei wichtige Konstanten:

```js
const TOTAL_REQUIRED = 9;
const HINT_COOLDOWN_MS = 30000;
```

Der Fortschritt wird anhand der tatsächlich erledigten Pflichtstationen berechnet.

### Übernahmeempfehlung

Die neue Engine soll unterscheiden können zwischen:

- Pflichtaufgaben,
- optionalen Aufgaben,
- Sprinteraufgaben,
- Bonusmissionen.

Nur Pflichtaufgaben bestimmen den regulären Fortschrittsbalken.

---

## 61.5 Interaktive Innenwinkelsumme

**Quelldatei:**

`klasse-7/geometrie/innenwinkelsumme/lernpfad-innenwinkel.html`

Dort wird eine geometrische Figur per Pointer Events verändert.

Die vorhandene Struktur nutzt:

- `pointerdown`,
- `pointermove`,
- `pointerup`,
- `pointercancel`,
- `setPointerCapture()`.

Damit funktioniert die Interaktion über:

- Maus,
- Touch,
- Apple Pencil bzw. Stift.

### Übernahmeempfehlung

Diese Pointer-Logik sollte zu einem gemeinsamen Modul werden:

`components/pointer-drag.js`

Damit können später genutzt werden:

- Punkte im Koordinatensystem,
- Dreiecksecken,
- Funktionsparameter,
- Vektoren,
- Bruchstücke,
- Sortierkarten,
- geometrische Konstruktionen.

---

## 61.6 Zufallsversuche Klasse 6

Im Repository befinden sich mehrere Lernpfade zu Zufall und relativer Häufigkeit, beispielsweise:

`klasse-6/daten-und-zufall/zufall-und-wahrscheinlichkeit/lernpfad-zufallsversuche-durchfuehren.html`

und

`klasse-6/daten-und-zufall/zufall-und-wahrscheinlichkeit/lernpfad-relative-haeufigkeiten-vergleichen.html`

Bereits vorhandene Ideen umfassen:

- Würfel-/Zufallslabor,
- Simulation,
- absolute und relative Häufigkeit,
- Vergleich von Erwartung und Beobachtung,
- gestufte Hinweise.

### Übernahmeempfehlung

Daraus sollte ein allgemeiner Spieltyp entstehen:

**Predict → Simulate → Compare → Explain**

Geeignet für:

- Würfel,
- Münzen,
- Glücksräder,
- Urnen,
- Binomialexperimente,
- Gesetz der großen Zahlen.

---

# 62. Besonders wertvolle Codestrukturen aus dem Repository

Die folgenden Muster sind bewusst vereinfacht und für die neue gemeinsame Engine generalisiert.

---

## 62.1 Gemeinsame Mission-Konfiguration statt einzelner Spiele

Das Mathe-Quest-System arbeitet bereits mit einem zentralen Konfigurationsarray.

### Generalisierte Form

```js
const missions = [
  {
    id: "bruch-vergleich",
    title: "Bruch-Arena",
    icon: "🍕",
    generator: generateFractionCompare,
    reward: "bruch-pokal",
    questions: 10
  },
  {
    id: "volumen",
    title: "Quader-Quest",
    icon: "🧊",
    generator: generateVolumeTask,
    reward: "quader-pokal",
    questions: 10
  }
];
```

### Nutzen

Eine neue Mission benötigt dann hauptsächlich:

- Metadaten,
- Kompetenzzuordnung,
- Aufgabengenerator,
- Belohnung.

Navigation, Herzen, Punkte, Fortschritt und Feedback bleiben identisch.

---

# 63. Einheitliches Aufgabenobjekt

Die vorhandenen Generatoren der Mathe-Quest liefern bereits strukturell ähnliche Aufgaben zurück.

Dieses Muster sollte verbindlich werden.

```js
return {
  text: "Welcher Bruch ist größer?",
  choices: ["2/3", "3/4", "gleich groß"],
  correct: 1,
  explain: "Erweitere beide Brüche auf einen gemeinsamen Nenner.",
  hints: [
    "Vergleiche die Brüche nicht nur über die Nenner.",
    "Ein gemeinsamer Nenner kann helfen.",
    "Erweitere auf Zwölftel."
  ]
};
```

## Erweiterte künftige Form

```js
return {
  id: "fraction_compare_001",
  topic: "brueche",
  skill: "bruch_vergleichen",
  process: ["operieren"],
  difficulty: 0.35,
  type: "multiple_choice",

  prompt: "Welcher Bruch ist größer?",
  data: {
    a: [2,3],
    b: [3,4]
  },

  answer: "b",

  feedback: {
    success: "Richtig.",
    retry: "Nutze einen gemeinsamen Nenner."
  },

  hints: [
    "Vergleiche systematisch.",
    "Erweitere beide Brüche.",
    "Nutze den Nenner 12."
  ]
};
```

Damit kann dieselbe Engine Aufgaben aus Klasse 5 bis Q2 darstellen.

---

# 64. Lokale Speicherung – bestehendes Muster übernehmen

Die Mathe-Quest verwendet bereits eine sinnvolle lokale Zustandsstruktur.

Eine generalisierte Version:

```js
const STORAGE_KEY = "mathe_game_state_v1";

function freshState(){
  return {
    xp: 0,
    coins: 0,
    trophies: {},
    completed: {},
    stats: {},
    settings: {}
  };
}

function loadState(){
  try{
    return {
      ...freshState(),
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    };
  }catch{
    return freshState();
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
```

## Empfehlung

Das Speichermodul sollte später zentral unter

`engine/storage.js`

liegen.

Gespeichert werden können:

- Fortschritt,
- Themenpokale,
- Badges,
- XP,
- Einstellungen,
- Kompetenzstände,
- Aufgabenhistorie,
- persönliche Bestwerte.

---

# 65. Adaptive Schwierigkeit aus der Mathe-Quest

Das bestehende Klasse-5-Spiel erhöht die Schwierigkeit bereits automatisch anhand erfolgreich bearbeiteter Aufgaben.

Das Prinzip lässt sich verallgemeinern:

```js
function getDifficulty(correct){
  if(correct < 4) return 1;
  if(correct < 8) return 2;
  return 3;
}
```

## Verbesserung für die gemeinsame Engine

Später sollte nicht nur die Gesamtzahl richtiger Aufgaben zählen, sondern die jeweilige Kompetenz:

```js
function getSkillDifficulty(skill){
  const mastery = skillStats[skill]?.mastery ?? 0;

  if(mastery < 0.45) return 1;
  if(mastery < 0.75) return 2;
  return 3;
}
```

Damit kann ein Lernender beispielsweise bei

- Kürzen auf Level 3,
- Bruchvergleich auf Level 2,
- Darstellen von Brüchen auf Level 1

arbeiten.

---

# 66. Streaks, Herzen und Belohnungen

In der Mathe-Quest werden bereits mehrere einfache Gamification-Elemente kombiniert:

- Herzen,
- richtige Antworten,
- Streak,
- XP,
- Münzen,
- Pokale,
- freischaltbare Charaktere.

Ein Themenpokal wird dort nach genügend richtigen Antworten vergeben.

## Übernahme nach Altersstufe

### Klasse 5/6

voll nutzen:

```text
Herzen
+ Sterne/XP
+ Pokal
+ Figuren freischalten
+ Urkunde
```

### Klasse 7/8

reduzieren auf:

```text
Streak
+ Badge
+ Themenfortschritt
```

### Klasse 9/10

eher:

```text
Mastery
+ Challenge
+ persönliche Bestleistung
```

### EF/Q1/Q2

nur noch sachlich:

```text
Kompetenzprofil
+ abgeschlossene Prüfungsmodule
+ Abitur-Readiness
```

---

# 67. 30-Sekunden-Tippcooldown vereinheitlichen

Der 30-Sekunden-Cooldown tritt im Repository bereits mehrfach auf und sollte daher als projektweiter Standard behandelt werden.

Beispiel:

```js
const HINT_COOLDOWN_MS = 30000;

function unlockNextHint(){
  state.nextHintAt = Date.now() + HINT_COOLDOWN_MS;
}
```

Die bestehende Mathe-Quest zeigt dabei sogar die verbleibende Zeit bis zur nächsten Tippkarte.

## Empfehlung

Ein gemeinsames Modul:

`components/game-hints.js`

mit:

- Tipp 1 sofort,
- 30 Sekunden bis Tipp 2,
- 30 Sekunden bis Tipp 3,
- Lösung erst anschließend,
- Lehrkraftmodus überspringt Cooldown.

---

# 68. Balancierte Aufgabenpools statt reinem Zufall

Im EF-Lagebeziehungs-Test wird ein Pool aus verschiedenen Fällen erzeugt und anschließend gemischt.

Generalisierte Form:

```js
function buildBalancedPool(count){
  const types = [
    "identical",
    "parallel",
    "intersect",
    "skew"
  ];

  const tasks = [];

  for(let i = 0; i < count; i++){
    const type = types[i % types.length];
    tasks.push(generateTask(type));
  }

  return shuffle(tasks);
}
```

## Übernahmeempfehlung

Dieses Prinzip ist besonders wichtig für:

- Klassenarbeiten-Vorbereitung,
- Missionen,
- Diagnose,
- Oberstufe,
- Abiturtraining.

So kann garantiert werden, dass nicht zufällig fünf nahezu identische Aufgaben hintereinander erscheinen.

---

# 69. Pflichtaufgaben und Bonusaufgaben

Das im Repository vorhandene `TOTAL_REQUIRED`-Prinzip sollte generalisiert werden.

```html
<section class="station" data-required="1"></section>
<section class="station" data-required="1"></section>
<section class="station" data-required="0"></section>
```

```js
const required = [
  ...document.querySelectorAll(
    ".station[data-required='1']"
  )
];

const completed = required.filter(
  station => state.completed[station.dataset.id]
);

const progress =
  completed.length / required.length;
```

## Verwendung

### Pflicht

entscheidet über:

- Abschluss,
- Zertifikat,
- regulären Fortschritt.

### Bonus

entscheidet über:

- Bonussterne,
- Extra-XP,
- besondere Badges.

Dadurch werden leistungsstärkere Lernende gefordert, ohne langsamere Lernende zu blockieren.

---

# 70. Formel- und Argumentationspuzzles

Die Fluglotsen-Akademie nutzt bereits ein einfaches, aber sehr effektives Puzzleprinzip:

```js
function pickPuzzle(key){
  puzzle.push(key);
}

function checkPuzzle(){
  const target = ["x","p","plus","t","u"];
  return JSON.stringify(puzzle) === JSON.stringify(target);
}
```

## Generalisierung

Der Aufgabenmotor erhält einen neuen Typ:

```text
sequence_builder
```

Anwendungen:

### Klasse 5/6

- Rechenschritte ordnen,
- Einheitenkette,
- Bruchdarstellung.

### Klasse 7/8

- Termumformung,
- Äquivalenzumformungen,
- Konstruktionsschritte.

### Klasse 9/10

- Lösungsverfahren,
- Argumentationsketten,
- trigonometrische Vorgehensweise.

### Oberstufe

- Produktregel,
- Ableitungskette,
- Geraden-/Ebenengleichung,
- vollständige Untersuchung einer Funktion,
- Hypothesentest,
- Beweisschritte.

---

# 71. Touchfähige geometrische Interaktion

Das vorhandene Innenwinkel-Material nutzt Pointer Events korrekt.

Vereinfachtes Muster:

```js
let dragIndex = null;

svg.addEventListener("pointerdown", event => {
  const point = event.target.closest(".dragpoint");
  if(!point) return;

  dragIndex = Number(point.dataset.i);
  svg.setPointerCapture(event.pointerId);
});

svg.addEventListener("pointermove", event => {
  if(dragIndex === null) return;

  const p = localPoint(event);

  points[dragIndex].x = p.x;
  points[dragIndex].y = p.y;

  redraw();
});

svg.addEventListener("pointerup", () => {
  dragIndex = null;
});

svg.addEventListener("pointercancel", () => {
  dragIndex = null;
});
```

## Empfehlung

Diese Struktur soll nicht in jeder HTML-Datei neu geschrieben werden.

Stattdessen:

`components/pointer-drag.js`

mit konfigurierbaren:

- Grenzen,
- Snap-Punkten,
- Dropzonen,
- Raster,
- Callback nach Bewegung.

---

# 72. Predict–Observe–Explain als Oberstufen-Spieltyp

Die Fluglotsen-Akademie enthält bereits eine klare Struktur:

1. Vorhersage,
2. Parameter verändern,
3. beobachten,
4. fachlich erklären.

Beispiel aus dem Geradenkontext:

> Was passiert für negative Parameterwerte?

Danach wird der Parameterregler verändert.

## Übertragung

### Funktionen

> Was passiert mit dem Graphen, wenn `a` größer wird?

### Analysis

> Wie verändert sich die Ableitung, wenn die Funktion steiler wird?

### Stochastik

> Wie verändert sich ein Histogramm bei größerem `n`?

### Analytische Geometrie

> Was passiert, wenn der Richtungsvektor mit 2 multipliziert wird?

Dieses Format ist deutlich wertvoller als bloßes „Regler bewegen“.

---

# 73. Ergebnis-Historie und individuelle Empfehlungen

Der EF-Lagebeziehungs-Test speichert Ergebnisse lokal und besitzt eine Ergebnis-Historie.

Dieses Muster sollte für höhere Klassen übernommen werden.

## Neue gemeinsame Datenstruktur

```js
history.push({
  date: Date.now(),
  game: "lagebeziehungen",
  topic: "analytische-geometrie",
  score: 14,
  maxScore: 18,
  skills: {
    parallel: 1.0,
    schnitt: 0.75,
    windschief: 0.5
  }
});
```

Danach kann die Engine Empfehlungen erzeugen:

```text
Lage paralleler Geraden: sicher
Schnittpunkte: überwiegend sicher
Windschiefe Geraden: noch üben
```

## Alterszuordnung

Besonders geeignet für:

- Klasse 9/10,
- EF,
- Q1,
- Q2.

---

# 74. Neue Spielideen, die direkt aus den vorhandenen Repository-Mustern entstehen

## 74.1 Formel-Puzzle

**Basis:** Fluglotsen-Akademie

Neue Varianten:

- Produktregel-Puzzle,
- Ebenengleichungs-Puzzle,
- Binomialformel-Puzzle,
- Pythagoras-Puzzle,
- Bruchrechen-Puzzle.

---

## 74.2 Kompetenz-Missionskarte

**Basis:** Mathe-Quest + Pflichtstationen

Auf einer Übersicht werden Missionen angezeigt.

Beispiel Klasse 5:

```text
Brüche vergleichen
      ↓
Brüche kürzen
      ↓
Anteile darstellen
      ↓
Boss-Mission
```

Bonusmissionen liegen seitlich und zählen nicht zum Pflichtfortschritt.

---

## 74.3 Fehlerjäger-Serie

**Basis:** vorhandene Fehlerdiagnosen in Fluglotsen- und Algebraformaten

Ablauf:

```text
Lösung ansehen
→ falsche Stelle antippen
→ Fehlerart wählen
→ korrigieren
```

Geeignet für praktisch alle Klassenstufen.

---

## 74.4 Abitur-Kompetenztrainer

**Basis:** EF-Lagebeziehungs-Test

Pool wird nicht zufällig, sondern kompetenzbalanciert erzeugt.

Beispiel Analysis:

```text
Ableitung berechnen
Extremstelle bestimmen
Wendestelle untersuchen
Integral interpretieren
Modell beurteilen
```

Danach persönliche Auswertung.

---

## 74.5 Simulations-Labor

**Basis:** Zufallsversuche Klasse 6 + Predict–Observe–Explain

Struktur:

```text
Vermutung
→ Simulation
→ Messwerte sammeln
→ vergleichen
→ erklären
```

Dieses Format kann von Klasse 6 bis Q2 verwendet werden, wobei nur die mathematische Tiefe steigt.

---

# 75. Bereits vorhandenes Belohnungssystem weiterverwenden

Die Klasse-5-Mathe-Quest besitzt bereits eine gute Basis:

- XP,
- Münzen,
- Themenpokale,
- freischaltbare Figuren,
- globalen Fortschritt.

Das sollte nicht durch ein zweites völlig unabhängiges Belohnungssystem ersetzt werden.

## Empfohlene Erweiterung

Nach Abschluss einer Mission:

```text
Themenpokal
      +
Teilnehmerurkunde
```

Nach Abschluss mehrerer Missionen:

```text
neue Figur
      +
Sammelbadge
```

Nach Abschluss des Themenbereichs:

```text
große Themenurkunde
```

---

# 76. Urkunde und Druck/PDF

Im Repository wird `window.print()` bereits für Druck-/PDF-Funktionen genutzt, beispielsweise in vorhandenen Lernpfaden.

Diese bestehende Technik eignet sich hervorragend für die geplante Teilnehmerurkunde.

## Gemeinsames Muster

```js
function printCertificate(){
  document.body.classList.add("certificate-mode");
  window.print();
  document.body.classList.remove("certificate-mode");
}
```

Dazu eine Druckansicht:

```css
@media print {
  body > * {
    display: none !important;
  }

  #certificate {
    display: block !important;
  }
}
```

## Vorteil

- keine externe Bibliothek,
- kein Server,
- funktioniert offline,
- auf iPads als PDF sicherbar,
- datensparsam.

---

# 77. Empfohlene gemeinsame Module nach der Repository-Analyse

Die Analyse zeigt, dass viele benötigte Funktionen bereits mehrfach im Repository vorkommen. Diese sollten langfristig ausgelagert werden.

```text
engine/
├── game-engine.js
├── mission-registry.js
├── task-pool.js
├── adaptive-difficulty.js
├── mastery.js
├── scoring.js
├── storage.js
├── history.js
└── recommendations.js

components/
├── game-progress.js
├── game-hints.js
├── game-lives.js
├── game-streak.js
├── reward-profile.js
├── sequence-builder.js
├── pair-match.js
├── error-hunter.js
├── pointer-drag.js
├── simulation-lab.js
└── certificate.js
```

Ziel ist nicht, vorhandene Dateien sofort komplett umzubauen. Neue Spiele sollten jedoch schrittweise diese gemeinsame Struktur verwenden.

---

# 78. Welche bestehenden Ideen nach Altersstufe besonders geeignet sind

| Repository-Idee | 5/6 | 7/8 | 9/10 | EF/Q |
|---|:---:|:---:|:---:|:---:|
| XP / Münzen / Figuren | ★★★ | ★ | – | – |
| Themenpokale | ★★★ | ★★ | ★ | – |
| Herzen | ★★★ | ★★ | ★ | – |
| Streak | ★★ | ★★★ | ★★★ | ★ |
| automatische Schwierigkeit | ★★★ | ★★★ | ★★★ | ★★★ |
| Pflicht-/Bonusstationen | ★★ | ★★★ | ★★★ | ★★★ |
| Formel-/Reihenfolgepuzzle | ★ | ★★★ | ★★★ | ★★★ |
| Fehlerdiagnose | ★ | ★★★ | ★★★ | ★★★ |
| Predict–Observe–Explain | ★ | ★★ | ★★★ | ★★★ |
| Pointer-/Drag-Interaktion | ★★ | ★★★ | ★★★ | ★★★ |
| lokale Ergebnis-Historie | – | ★ | ★★★ | ★★★ |
| balancierter Aufgabenpool | ★ | ★★ | ★★★ | ★★★ |
| Kompetenzempfehlung | ★ | ★★ | ★★★ | ★★★ |
| Druck/PDF-Urkunde | ★★★ | ★★ | ★ | – |
| Prüfungsmodus | – | – | ★ | ★★★ |

---

# 79. Repository-Muster, die ausdrücklich standardisiert werden sollten

Aus der Analyse ergeben sich zehn Muster, die bereits funktionieren und deshalb nicht immer neu erfunden werden sollten:

1. **Konfigurationsbasierte Missionen**
2. **einheitliches Aufgabenobjekt**
3. **lokale Speicherung mit `localStorage`**
4. **adaptive Schwierigkeit**
5. **Herzen, Streak und Belohnungen**
6. **30-Sekunden-Tippcooldown**
7. **Pflicht- und Bonusfortschritt**
8. **balancierte Aufgabenpools**
9. **Pointer Events für Touch**
10. **Druck-/PDF-Ausgabe**

Diese Funktionen sollten zu einer gemeinsamen Bibliothek zusammengeführt werden.

---

# 80. Quellübersicht der übernommenen Repository-Ideen

| Idee | Quelle im Repository |
|---|---|
| Missionen, XP, Münzen, Pokale, Figuren | `klasse-5/klasse5_lernspiele_github_bilder/klasse5-lernspiele.html` |
| gemeinsame Aufgabengeneratoren | `klasse-5/klasse5_lernspiele_github_bilder/klasse5-lernspiele.html` |
| adaptive Schwierigkeit | `klasse-5/klasse5_lernspiele_github_bilder/klasse5-lernspiele.html` |
| Tippcooldown | Mathe-Quest sowie mehrere Lernpfade |
| Pflichtfortschritt | `klasse-5/arithmetik-algebra/brueche-und-anteile/erweitern-und-kuerzen/lernpfad-brueche-kuerzen-erweitern.html` |
| Formel-Puzzle | `ef/geraden-und-ebenen/geraden-im-raum/lernpfad-geraden-im-raum-flugzeug.html` |
| Predict–Observe–Explain | `ef/geraden-und-ebenen/geraden-im-raum/lernpfad-geraden-im-raum-flugzeug.html` |
| Fehlerdiagnose | `ef/geraden-und-ebenen/geraden-im-raum/lernpfad-geraden-im-raum-flugzeug.html` |
| lokale Testhistorie | `ef/geraden-und-ebenen/Lagebeziehung_Test.html` |
| balancierter Aufgabenpool | `ef/geraden-und-ebenen/Lagebeziehung_Test.html` |
| Pointer-Drag | `klasse-7/geometrie/innenwinkelsumme/lernpfad-innenwinkel.html` |
| Zufallslabor | `klasse-6/daten-und-zufall/zufall-und-wahrscheinlichkeit/` |
| Druck/PDF | verschiedene Lernpfade, u. a. Excel-Lernpfad Klasse 7 |

---

# 81. Schlussfolgerung aus der Repository-Analyse

Das Repository enthält bereits einen erheblichen Teil der technischen Bausteine, die für die neue Lernspielarchitektur benötigt werden.

Daher sollte die weitere Entwicklung nicht primär darin bestehen, völlig neue Mechaniken von Grund auf zu schreiben.

Sinnvoller ist:

> **Vorhandene, bewährte Mechaniken identifizieren → vereinheitlichen → als gemeinsame Module auslagern → anschließend für neue Kompetenzen wiederverwenden.**

Besonders wertvoll sind dabei zwei bereits vorhandene Entwicklungsrichtungen:

### Für Klasse 5/6

die **Mathe-Quest-Architektur** mit

- kurzen Aufgaben,
- Themenmissionen,
- Pokalen,
- Figuren,
- Herzen,
- adaptiver Schwierigkeit.

### Für Klasse 7 bis Q2

die **Lernpfad-/Trainer-Architektur** mit

- Pflichtstationen,
- Fehlerdiagnosen,
- Formel- und Reihenfolgepuzzles,
- Simulation,
- Predict–Observe–Explain,
- Ergebnis-Historie,
- balancierten Aufgabenpools.

Die gemeinsame Engine sollte beide Ansätze unter einer technischen Basis verbinden.


---

# 82. Implementierte Referenzsammlung (September 2026)

Auf Grundlage dieses Gesamtkonzepts wurden 60 unterschiedliche Lernspiele als lauffähige HTML-Dateien umgesetzt. Die Zuordnung zu einzelnen Klassen ist ein schulinterner Planungsvorschlag, weil der NRW-Kernlehrplan zahlreiche Inhalte für Erprobungsstufe, erste/zweite Stufe und Qualifikationsphase bündelt. Die fachlichen Anker wurden mit dem KLP Mathematik Sekundarstufe I 2019 (insbesondere S. 23–35) und dem KLP Mathematik Sekundarstufe II 2023 (insbesondere S. 22–30) abgeglichen.

Die Abiturorientierung berücksichtigt die veröffentlichten Vorgaben des Zentralabiturs Mathematik: In Teil 1 werden im Grundkurs je ein Pflichtbereich aus Analysis, vektorieller Geometrie und Stochastik verlangt; in Teil 2 sind diese drei Sachgebiete ebenfalls vertreten. Für 2027–2029 werden daher Aufgaben zu Funktionen und Analysis, vektorieller Geometrie sowie Stochastik getrennt und zusätzlich vernetzt angeboten. LK-Spiele zu Normalverteilung, Konfidenzintervallen und Abständen sind ausdrücklich gekennzeichnet. Abiturvorgaben werden jährlich überprüft und nicht als unveränderliche Jahresdaten in die Aufgabenbank eingebrannt.

## 82.1 Spielverzeichnis

Die ausführliche Detailplanung mit Lernauftrag, KLP-Anker, beobachtbaren Teilkompetenzen, typischen Fehlvorstellungen, Spielhandlung, Progression, Hilfen, Wiederholungslogik und Kompetenznachweis folgt im Anschluss. Die technische Materialübersicht wird von `data.json` erzeugt.

# Detailplanung der 60 Lernspiele

Die Zuordnung einzelner Inhalte zu Klassen ist ein schulinterner Planungsvorschlag. Die KLP-Anker sind paraphrasierte Arbeitszuordnungen, keine Zitate. Die EF-Stochastik ist freiwillige Wiederholung. LK-Ergänzungen sind gekennzeichnet.

## 5 · Rechenwege-Werkstatt

**Themenfeld:** Arithmetik und Algebra – Natürliche Zahlen und Rechengesetze.  
**KLP-Anker:** SI Erprobung AA (3,4,10,14), S.24.  
**Voraussetzungen:** Grundrechenarten.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Wähle und nutze einen passenden Rechenweg für eine Vorratskiste.

Beobachtbare Teilkompetenzen:

- Geschickt zerlegen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Rechenreihenfolge: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Überschlag: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Rechenfehler erklären: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** 25er-Pakete und Rechenkarten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Punkt-vor-Strich missachtet, Ausgleich nur an einem Summanden.
**Progression:** Zehnerergänzung → Distributivgesetz → Sachterm. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/arithmetik-algebra/rechenstrategien.html`

## 5 · Maßband-Mission

**Themenfeld:** Arithmetik und Algebra – Größen und Einheiten.  
**KLP-Anker:** SI Erprobung AA (9,10), S.24.  
**Voraussetzungen:** Zahlen bis 1000.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Prüfe Maße für einen Klassenraum.

Beobachtbare Teilkompetenzen:

- Längen umrechnen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Einheiten wählen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zeit berechnen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Flächeneinheiten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Maßkarten und Messraster. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Flächen werden nur mit Faktor 10 umgerechnet.
**Progression:** Ganze Meter → gemischte Maße → Quadratmaß. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/arithmetik-algebra/messen.html`

## 5 · Bruch-Atelier

**Themenfeld:** Arithmetik und Algebra – Brüche als Anteile.  
**KLP-Anker:** SI Erprobung AA (8,11–13), S.24.  
**Voraussetzungen:** Gleich große Teile zählen.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Teile Vorräte fair und begründe den Anteil.

Beobachtbare Teilkompetenzen:

- Anteile färben: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Brüche vergleichen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Gleichwertige Brüche: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bruchteile bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Antippbare Bruchstreifen. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Großer Nenner wird als großer Anteil gedeutet.
**Progression:** Gleicher Nenner → gleicher Zähler → Kontext. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/arithmetik-algebra/bruchbild.html`

## 5 · Muster-Express

**Themenfeld:** Funktionen – Muster, Tabellen und Maßstab.  
**KLP-Anker:** SI Erprobung F (1–4), S.25.  
**Voraussetzungen:** Multiplikation.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Entschlüssle Baupläne für die nächste Station.

Beobachtbare Teilkompetenzen:

- Muster fortsetzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Tabellen ergänzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Maßstab anwenden: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Regel erklären: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Bilderfolge und Tabelle. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Additive und multiplikative Veränderung verwechselt.
**Progression:** Schrittweite → Regel → Maßstab mit Einheit. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/funktionen/muster.html`

## 5 · Figuren-Finder

**Themenfeld:** Geometrie – Grundbegriffe und Vierecke.  
**KLP-Anker:** SI Erprobung G (1–4,9), S.25–26.  
**Voraussetzungen:** Strecke und Punkt.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Sortiere Bauteile nach Eigenschaften.

Beobachtbare Teilkompetenzen:

- Figuren klassifizieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Parallel und senkrecht: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Winkelarten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Begriffe begründen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Figurenkarten und Eigenschaftswahl. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Gedrehtes Quadrat wird nicht als Quadrat erkannt.
**Progression:** Einzeleigenschaft → Oberbegriffe → Gegenbeispiel. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/geometrie/figuren.html`

## 5 · Spiegel-Werkstatt

**Themenfeld:** Geometrie – Achsensymmetrie.  
**KLP-Anker:** SI Erprobung G (5–7), S.26.  
**Voraussetzungen:** Kästchen zählen.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Ergänze ein symmetrisches Mosaik.

Beobachtbare Teilkompetenzen:

- Muster spiegeln: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Spiegelpunkt finden: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Achsenabstand: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fehler erkennen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Tippgitter und Koordinatenfeld. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Gleiche statt gegenüberliegende Seite der Achse.
**Progression:** Ein Kästchen → mehrere Kästchen → Koordinaten. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/geometrie/spiegel.html`

## 5 · Würfel-Werft

**Themenfeld:** Geometrie – Volumen und Oberfläche von Quadern.  
**KLP-Anker:** SI Erprobung G (11,12,15), S.26.  
**Voraussetzungen:** Multiplikation und Rechteckfläche.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Plane Verpackungen aus Einheitswürfeln.

Beobachtbare Teilkompetenzen:

- Schichten zählen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Volumen bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Oberfläche bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Volumen vergleichen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Maßhaltiges Schrägbild und Schichten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Nur sichtbare Würfel gezählt, Oberfläche mit Volumen verwechselt.
**Progression:** Würfelschichten → Kantenprodukt → Verpackung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/geometrie/wuerfel.html`

## 5 · Daten-Detektive

**Themenfeld:** Stochastik – Erheben und Darstellen von Daten.  
**KLP-Anker:** SI Erprobung S (1–4), S.26–27.  
**Voraussetzungen:** Addieren.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Prüfe eine Umfrage für die Klasse.

Beobachtbare Teilkompetenzen:

- Diagramme lesen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Häufigkeiten zählen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Spannweite: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Aussagen prüfen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Säulendiagramm und Strichliste. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Häufigkeit und Merkmalswert verwechselt.
**Progression:** Einzelwert → Gesamtzahl → Aussage. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-5/stochastik/daten5.html`

## 6 · Teiler-Scanner

**Themenfeld:** Arithmetik und Algebra – Teilbarkeit und Primfaktoren.  
**KLP-Anker:** SI Erprobung AA (1,2), S.23.  
**Voraussetzungen:** Division mit Rest.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Packe gleiche Gruppen ohne Rest.

Beobachtbare Teilkompetenzen:

- Teilbarkeitsregeln: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Primzahlen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Primfaktoren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Teiler im Kontext: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Zahlenkarten und Faktor-Kette. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** 1 wird als Primzahl behandelt, Primfaktor fehlt.
**Progression:** Kleine Zahlen → kombinierte Regeln → Gruppenproblem. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/arithmetik-algebra/teiler.html`

## 6 · Bruch-Küche

**Themenfeld:** Arithmetik und Algebra – Grundrechenarten mit Brüchen.  
**KLP-Anker:** SI Erprobung AA (8,12–14), S.24.  
**Voraussetzungen:** Bruchbegriff, Erweitern.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Passe Rezepte an und kontrolliere Portionsgrößen.

Beobachtbare Teilkompetenzen:

- Addieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Multiplizieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Dividieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fehler und Kontext: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Bruchstreifen und Rechenentscheidung. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Nenner werden addiert, falscher Kehrwert.
**Progression:** Gemeinsamer Nenner → verschiedene Nenner → gemischte Rechnung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/arithmetik-algebra/bruchrechnen.html`

## 6 · Komma-Kasse

**Themenfeld:** Arithmetik und Algebra – Dezimalzahlen und Darstellungswechsel.  
**KLP-Anker:** SI Erprobung AA (8–10,14), S.24.  
**Voraussetzungen:** Stellenwerttafel.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Kontrolliere eine Einkaufskasse.

Beobachtbare Teilkompetenzen:

- Dezimalzahlen addieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Multiplizieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bruch und Dezimalzahl: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Größenordnung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Preisbelege und Zahlenstrahl. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Komma nach Zahl der Ziffern statt Stellenwert.
**Progression:** Zehntel → Hundertstel → Einkauf. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/arithmetik-algebra/komma.html`

## 6 · Dreisatz-Express

**Themenfeld:** Funktionen – Zusammenhänge zwischen Größen.  
**KLP-Anker:** SI Erprobung F (1,2,4), S.25.  
**Voraussetzungen:** Multiplikation, Division.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Plane Material für einen Ausflug.

Beobachtbare Teilkompetenzen:

- Einheitspreis: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Dreisatz: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Maßstab: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modellgrenzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Wertetabelle und Kontextkarten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Grundgebühr wird proportional behandelt.
**Progression:** Einheitsschritt → nicht ganzzahliges Vielfaches → Modellwahl. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/funktionen/dreisatz.html`

## 6 · Koordinaten-Navigator

**Themenfeld:** Geometrie – Verschiebung, Drehung und Punktsymmetrie.  
**KLP-Anker:** SI Erprobung G (5–8), S.26.  
**Voraussetzungen:** Koordinatensystem.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Steuere Markierungen auf einem Koordinatenplan.

Beobachtbare Teilkompetenzen:

- Verschieben: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Punktspiegeln: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Drehen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Abbildungen unterscheiden: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Antippbares Koordinatenfeld. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Koordinaten vertauscht, Drehzentrum ignoriert.
**Progression:** Positive Koordinaten → negative → Verkettung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/geometrie/abbildung.html`

## 6 · Flächen-und-Netze-Werkstatt

**Themenfeld:** Geometrie – Flächen, Zerlegung und Quadernetze.  
**KLP-Anker:** SI Erprobung G (11–15), S.26.  
**Voraussetzungen:** Rechteckfläche.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Finde passende Zuschnitte und Packungen.

Beobachtbare Teilkompetenzen:

- Dreiecksfläche: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zerlegen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Netze lesen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Umfang und Fläche: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Zerlegungsbild und echtes Würfelnetz. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Dreiecksfläche nicht halbiert, gleiche Fläche bedeutet gleichen Umfang.
**Progression:** Rechteckzerlegung → Dreieck → Netz. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/geometrie/flaechen.html`

## 6 · Daten-Labor

**Themenfeld:** Stochastik – Mittelwert, Median, Quartile und Boxplot.  
**KLP-Anker:** SI Erprobung S (3–6), S.27.  
**Voraussetzungen:** Addieren und Dividieren.  
**Zeit:** 8–12 Minuten.  
**Lernauftrag:** Vergleiche Messreihen und wähle passende Kenngrößen.

Beobachtbare Teilkompetenzen:

- Mittelwert: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Median: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Boxplot lesen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ausreißer beurteilen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Datenreihe und Boxplot. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Median unsortiert bestimmt, Ausreißer als bedeutungslos betrachtet.
**Progression:** Ungerade kleine Reihe → Quartile → Ausreißer. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-6/stochastik/statistik6.html`

## 7 · Vorzeichen-Navigator

**Themenfeld:** Arithmetik und Algebra – Rationale Zahlen.  
**KLP-Anker:** SI erste Stufe AA (1–3), S.28.  
**Voraussetzungen:** Negative Zahlen darstellen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Navigiere zwischen Temperaturen und Kontoständen.

Beobachtbare Teilkompetenzen:

- Zahlen ordnen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Addieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Multiplizieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Vorzeichen begründen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Zahlenstrahl und Temperaturkontext. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Betrag mit Zahl verwechselt, Minus mal Minus falsch.
**Progression:** Ganze Zahlen → Dezimalwerte → verschachtelte Vorzeichen. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/arithmetik-algebra/vorzeichen.html`

## 7 · Term-Labor

**Themenfeld:** Arithmetik und Algebra – Variablen, Termwerte und Umformung.  
**KLP-Anker:** SI erste Stufe AA (4,5,7), S.29.  
**Voraussetzungen:** Rechengesetze.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Baue und vergleiche Rechteckmodelle.

Beobachtbare Teilkompetenzen:

- Einsetzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zusammenfassen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ausmultiplizieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Term modellieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Flächenmodell und Termkarten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Ungleichartige Terme zusammengefasst, Klammer nur teilweise multipliziert.
**Progression:** Ein Termwert → Klammer → äquivalenter Sachterm. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/arithmetik-algebra/terme.html`

## 7 · Waagen-Werkstatt

**Themenfeld:** Arithmetik und Algebra – Lineare Gleichungen.  
**KLP-Anker:** SI erste Stufe AA (6,9), S.29.  
**Voraussetzungen:** Terme.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Halte beide Seiten der Gleichung im Gleichgewicht.

Beobachtbare Teilkompetenzen:

- Lösung bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Umformung planen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fehler lokalisieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Gleichung modellieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Äquivalenzschritte und Fehlerzeilen. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Operation nur auf einer Seite, falsches Vorzeichen.
**Progression:** x+a → ax+b → Klammern. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/arithmetik-algebra/gleichung.html`

## 7 · Zuordnungs-Zentrale

**Themenfeld:** Funktionen – Proportionale und antiproportionale Zuordnungen.  
**KLP-Anker:** SI erste Stufe F (1–4,7), S.29–30.  
**Voraussetzungen:** Dreisatz.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane Arbeitszeit und Material mit passenden Tabellen.

Beobachtbare Teilkompetenzen:

- Proportionalität: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Antiproportionalität: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Konstante bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modell begründen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Tabellen und Modellwahl. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Alle sinkenden Werte als antiproportional gedeutet.
**Progression:** Quotient → Produkt → Modellgrenze. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/funktionen/zuordnung.html`

## 7 · Prozent-Markt

**Themenfeld:** Funktionen – Prozent- und Zinsrechnung.  
**KLP-Anker:** SI erste Stufe F (8,9), S.30.  
**Voraussetzungen:** Brüche, Dezimalzahlen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Angebote und begründe Preisänderungen.

Beobachtbare Teilkompetenzen:

- Prozentwert: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Grundwert: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Änderungsfaktoren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Rabatte beurteilen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Preiskarten und Faktoren. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Prozentpunkte und relative Änderung verwechselt.
**Progression:** Ein Rabatt → Grundwert → aufeinanderfolgende Änderung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/funktionen/prozent.html`

## 7 · Winkel-Detektiv

**Themenfeld:** Geometrie – Winkelsätze und Innenwinkelsumme.  
**KLP-Anker:** SI erste Stufe G (1,2,7), S.30–31.  
**Voraussetzungen:** Winkelarten.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Öffne Baupläne mit begründeten Winkelwerten.

Beobachtbare Teilkompetenzen:

- Nebenwinkel: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Innenwinkelsumme: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Winkelsätze: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Beweiskette: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Winkelgrafik und geordnete Beweiskarten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Wechselwinkelsatz ohne Parallelität, Summe 360° im Dreieck.
**Progression:** Nebenwinkel → Dreieck → Begründung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/geometrie/winkel.html`

## 7 · Zufalls-Labor

**Themenfeld:** Stochastik – Laplace und relative Häufigkeit.  
**KLP-Anker:** SI erste Stufe S (1,3–5), S.31.  
**Voraussetzungen:** Brüche und Anteile.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Sage Zufallsergebnisse voraus und prüfe Versuchsreihen.

Beobachtbare Teilkompetenzen:

- Laplace-Modell: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Relative Häufigkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Simulation deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Gegenereignis: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vorhersage, Münzsimulation, Erklärung. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Lange Serie erzwingt Ausgleich im nächsten Versuch.
**Progression:** Gleichwahrscheinlich → Versuchsreihe → Modellkritik. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-7/stochastik/zufall7.html`

## 8 · Binomische Baupläne

**Themenfeld:** Arithmetik und Algebra – Binomische Formeln.  
**KLP-Anker:** SI erste Stufe AA (5,7), S.28–29.  
**Voraussetzungen:** Distributivgesetz.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Setze quadratische Flächen aus Teilflächen zusammen.

Beobachtbare Teilkompetenzen:

- Quadrat ausmultiplizieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Differenz von Quadraten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Flächen deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fehler korrigieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Algebraisches Flächenmodell. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Mittlerer Term fehlt, Minuszeichen falsch.
**Progression:** Positive Summe → Differenz → Rückwärtslesen. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-8/arithmetik-algebra/binomisch.html`

## 8 · Bruchterm-Wächter

**Themenfeld:** Arithmetik und Algebra – Definitionsmenge und Bruchgleichungen.  
**KLP-Anker:** SI erste Stufe AA (7,9), S.29.  
**Voraussetzungen:** Lineare Gleichungen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Öffne Formelschlösser nur mit zulässigen Werten.

Beobachtbare Teilkompetenzen:

- Verbotene Werte: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bruchgleichung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kürzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Probe: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Brüche und Fehlerdiagnose. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Über Summen kürzen, Nennernull übersehen.
**Progression:** x im Nenner → x−a → Definitionsprüfung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-8/arithmetik-algebra/bruchterm.html`

## 8 · Gleichungs-Duo

**Themenfeld:** Arithmetik und Algebra – Lineare Gleichungssysteme.  
**KLP-Anker:** SI erste Stufe AA (9,10), S.29.  
**Voraussetzungen:** Lineare Gleichungen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Entschlüssle Preise mit zwei Bedingungen.

Beobachtbare Teilkompetenzen:

- LGS lösen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Verfahren wählen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Lösungsanzahl: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modellieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Geradenbild und Einsetzungsverfahren. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Nur eine Gleichung erfüllt, parallel und identisch verwechselt.
**Progression:** Günstige Addition → Graph → Kontext. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-8/arithmetik-algebra/lgs.html`

## 8 · Graphen-Schaltzentrale

**Themenfeld:** Funktionen – Lineare Funktionen.  
**KLP-Anker:** SI erste Stufe F (4–7), S.30.  
**Voraussetzungen:** Koordinaten und Zuordnungen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Stelle die richtige Tarifgerade ein.

Beobachtbare Teilkompetenzen:

- Steigung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Achsenabschnitt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zielgraph einstellen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Parameter im Kontext: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Interaktive Regler und Graphvergleich. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Steigung mit Achsenabschnitt verwechselt.
**Progression:** Ganzzahlige Steigung → Zielgraph → Tarifvergleich. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-8/funktionen/linear.html`

## 8 · Konstruktions-Atelier

**Themenfeld:** Geometrie – Kongruenz, Thales und Flächen.  
**KLP-Anker:** SI erste Stufe G (2–8), S.30–31.  
**Voraussetzungen:** Winkel, Dreiecke.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane Dreiecke und begründe eindeutige Konstruktionen.

Beobachtbare Teilkompetenzen:

- Thales anwenden: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kongruenz: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Konstruktionsfolge: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fläche und Höhe: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Halbkreis, Konstruktionskarten und Dreieck. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** SSW ungeprüft eindeutig, schräge Seite als Höhe.
**Progression:** Rechtwinkligkeit → SSS/SWS → Konstruktionsbegründung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-8/geometrie/thales.html`

## 8 · Zufalls-Pfade

**Themenfeld:** Stochastik – Baumdiagramme und Pfadregeln.  
**KLP-Anker:** SI erste Stufe S (2,3,5), S.31.  
**Voraussetzungen:** Wahrscheinlichkeit.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Finde passende Gewinnpfade im Urnenbaum.

Beobachtbare Teilkompetenzen:

- Pfadprodukt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Pfadsumme: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ohne Zurücklegen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fehlerdiagnose: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Baumdiagramm und Ereignisauswahl. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Addieren entlang eines Pfades, Nenner nach Ziehung unverändert.
**Progression:** Mit Zurücklegen → genau einmal → ohne Zurücklegen. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-8/stochastik/baum.html`

## 9 · Potenzen-und-Wurzeln-Werkstatt

**Themenfeld:** Arithmetik und Algebra – Reelle Zahlen und Potenzgesetze.  
**KLP-Anker:** SI zweite Stufe AA (1–7,9), S.32.  
**Voraussetzungen:** Quadratzahlen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Ordne Zahlen sicher ein und prüfe Rechenregeln.

Beobachtbare Teilkompetenzen:

- Potenzgesetze: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Wurzeln vereinfachen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Wurzeln eingrenzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zahlbereiche: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Wurzelintervall und Termkarten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Wurzel einer Summe aufgeteilt, Exponenten multipliziert statt addiert.
**Progression:** Gleiche Basis → Wurzelzerlegung → Näherung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-9/arithmetik-algebra/potenz.html`

## 9 · Quadratische Werkstatt

**Themenfeld:** Arithmetik und Algebra – Quadratische Gleichungen.  
**KLP-Anker:** SI zweite Stufe AA (8,11), S.32.  
**Voraussetzungen:** Lineare Gleichungen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Wähle erst das Werkzeug und löse dann die Gleichung.

Beobachtbare Teilkompetenzen:

- Verfahrenswahl: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Lösungsmenge: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Quadratische Ergänzung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kontext und Probe: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Methodenwahl und mehrere Zahlenfelder. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Durch x dividiert und Null verloren, negative Wurzel vergessen.
**Progression:** Nullprodukt → Quadratgleichung → Ergänzung → Sachkontext. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-9/arithmetik-algebra/quadratisch.html`

## 9 · Parabel-Werkstatt

**Themenfeld:** Funktionen – Quadratische Funktionen.  
**KLP-Anker:** SI zweite Stufe F (1–9,12), S.33–34.  
**Voraussetzungen:** Quadratische Gleichungen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Passe eine Parabel an Zielpunkte an.

Beobachtbare Teilkompetenzen:

- Scheitelpunkt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Parameter steuern: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Nullstellen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Darstellungen verbinden: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Graphregler und Scheitelform. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Vorzeichen der horizontalen Verschiebung falsch.
**Progression:** Verschiebung → Streckung → Nullstellen. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-9/funktionen/parabel.html`

## 9 · Pythagoras-Route

**Themenfeld:** Geometrie – Pythagoras und Ähnlichkeit.  
**KLP-Anker:** SI zweite Stufe G (1,2,8–10), S.34–35.  
**Voraussetzungen:** Quadrat und Wurzel.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane sichere Strecken mit rechtwinkligen Dreiecken.

Beobachtbare Teilkompetenzen:

- Hypotenuse: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kathete: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ähnlichkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Anwendbarkeit begründen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Maßhaltige Dreiecke und Routenwahl. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Längste Seite falsch, Pythagoras ohne rechten Winkel.
**Progression:** 3-4-5 → fehlende Kathete → Streckung und Beweis. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-9/geometrie/pythagoras.html`

## 9 · Kreis-Werkstatt

**Themenfeld:** Geometrie – Kreis, Kreissektor und Zylinder.  
**KLP-Anker:** SI zweite Stufe G (3–5), S.34.  
**Voraussetzungen:** Flächen, Einheiten.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane Rundbeete und Behälter.

Beobachtbare Teilkompetenzen:

- Umfang: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kreisfläche: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Sektoren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zylindervolumen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Kreis und markierter Sektor. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Radius und Durchmesser verwechselt, Anteil fehlt.
**Progression:** Umfang → Fläche → Winkelanteil → Körper. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-9/geometrie/kreis.html`

## 9 · Diagramm-Redaktion

**Themenfeld:** Stochastik – Statistische Aussagen und Manipulation.  
**KLP-Anker:** SI zweite Stufe S (1,2,6), S.35.  
**Voraussetzungen:** Häufigkeiten und Prozent.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Meldungen vor ihrer Veröffentlichung.

Beobachtbare Teilkompetenzen:

- Skalierung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Relative Änderung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Stichprobe: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Darstellung beurteilen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Zwei Diagramme derselben Werte. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Doppelte Säulenhöhe bedeutet doppelte Zahl, Umfrage verzerrt.
**Progression:** Achse → Prozentvergleich → Stichprobenkritik. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-9/stochastik/kritik.html`

## 10 · Exponenten-Detektiv

**Themenfeld:** Arithmetik und Algebra – Exponentialgleichungen und Logarithmen.  
**KLP-Anker:** SI zweite Stufe AA (10,11), S.32.  
**Voraussetzungen:** Potenzgesetze.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Bestimme, wann ein Wachstumsziel erreicht wird.

Beobachtbare Teilkompetenzen:

- Exponenten finden: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Logarithmus nutzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zehnerpotenzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Grenzen prüfen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Wertetabelle und Exponentengleichung. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Logarithmus als Division durch Basis, negative Argumente.
**Progression:** Ganzzahlig → Näherung → Zeit im Kontext. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-10/arithmetik-algebra/logarithmus.html`

## 10 · Wachstums-Scanner

**Themenfeld:** Funktionen – Exponentielle Modelle.  
**KLP-Anker:** SI zweite Stufe F (1–7,10–12), S.33–34.  
**Voraussetzungen:** Prozentfaktoren.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Vergleiche Wachstumsmodelle an Messreihen.

Beobachtbare Teilkompetenzen:

- Wachstumsfaktor: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modell erkennen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Verdopplungszeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modellgrenze: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Tabelle, Graph und Prognose. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Additives Wachstum als exponentiell gedeutet.
**Progression:** Faktor → Modellvergleich → Prognose. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-10/funktionen/wachstum.html`

## 10 · Wellen-Werkstatt

**Themenfeld:** Funktionen – Sinusfunktion und Einheitskreis.  
**KLP-Anker:** SI zweite Stufe F (13,14), S.34.  
**Voraussetzungen:** Winkel und Funktionen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Passe eine periodische Bewegung an.

Beobachtbare Teilkompetenzen:

- Amplitude: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Periode: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Einheitskreis: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modell einstellen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Sinusregler und Einheitskreis. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Periode mit Faktor b verwechselt, Grad und Bogenmaß gemischt.
**Progression:** Amplitude → Periode → kombinierte Parameter. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-10/funktionen/sinus.html`

## 10 · Höhen-Expedition

**Themenfeld:** Geometrie – Trigonometrie und Kosinussatz.  
**KLP-Anker:** SI zweite Stufe G (7–10), S.34–35.  
**Voraussetzungen:** Pythagoras.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane eine Höhenmessung und prüfe die Methode.

Beobachtbare Teilkompetenzen:

- Verhältnis wählen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Höhe berechnen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Winkel bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kosinussatz: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Dreiecksskizze und Verfahrenswahl. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Gegenkathete winkelunabhängig, Kosinussatz nur rechtwinklig.
**Progression:** Rechtwinklig → Messhöhe → nicht rechtwinklig. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-10/geometrie/trigo.html`

## 10 · Körper-Manufaktur

**Themenfeld:** Geometrie – Kegel, Pyramide, Kugel und zusammengesetzte Körper.  
**KLP-Anker:** SI zweite Stufe G (5,6), S.34.  
**Voraussetzungen:** Kreisfläche, Volumen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Bestimme Materialmengen zusammengesetzter Körper.

Beobachtbare Teilkompetenzen:

- Pyramidenvolumen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kegelvolumen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kugelvolumen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zerlegung und Cavalieri: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Körpermodelle und Zerlegung. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Drittelfaktor fehlt, schiefe Länge statt Höhe.
**Progression:** Ein Körper → Teilkörper → Querschnittsbegründung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-10/geometrie/koerper.html`

## 10 · Vierfelder-Ermittlung

**Themenfeld:** Stochastik – Bedingte Wahrscheinlichkeit und Unabhängigkeit.  
**KLP-Anker:** SI zweite Stufe S (3–6), S.35.  
**Voraussetzungen:** Prozent und Baumdiagramm.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Zusammenhänge in einer Schulumfrage.

Beobachtbare Teilkompetenzen:

- Tafel ergänzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bedingte Wahrscheinlichkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Schnittwahrscheinlichkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Unabhängigkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vierfeldertafel und Bezugsgruppen. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Gesamtzahl statt Bedingungsgruppe, umgekehrte Bedingung.
**Progression:** Absolute Zahlen → Bezug ändern → Unabhängigkeit. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `klasse-10/stochastik/vierfelder.html`

## EF · Transformations-Labor

**Themenfeld:** Funktionen und Analysis – Funktionen und Parameter.  
**KLP-Anker:** SII EF A (1–4,18), S.22–23.  
**Voraussetzungen:** Funktionsklassen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Sage eine Parameterwirkung voraus und erreiche einen Zielgraphen.

Beobachtbare Teilkompetenzen:

- Verschiebung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Streckung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Symmetrie: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Definitionsbereich: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vorhersage und Parabelregler. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Innenfaktor wie Außenfaktor gedeutet, Definitionslücke ignoriert.
**Progression:** Ein Parameter → mehrere → Potenzfunktionen. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `ef/analysis/transform.html`

## EF · Tangenten-Labor

**Themenfeld:** Funktionen und Analysis – Mittlere und lokale Änderungsrate.  
**KLP-Anker:** SII EF A (5–14), S.22–23.  
**Voraussetzungen:** Funktionswerte.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Untersuche, wie eine Sekante zur Tangente wird.

Beobachtbare Teilkompetenzen:

- Sekantensteigung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Tangentensteigung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ableitungsgraph: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Grenzprozess: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Sekantenregler und Graphen. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Funktionswert als Steigung, f′(x)=0 als sichere Extremstelle.
**Progression:** Differenz → Quotient → Grenzwert und Interpretation. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `ef/analysis/ableitung.html`

## EF · Kurven-Detektiv

**Themenfeld:** Funktionen und Analysis – Extrema, Monotonie und Krümmung.  
**KLP-Anker:** SII EF A (15–19), S.23.  
**Voraussetzungen:** Ableitungsregeln.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Aussagen zu einer Funktion mit Ableitungsinformationen.

Beobachtbare Teilkompetenzen:

- Extremstellen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Monotonie: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Wendestellen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Randwerte: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Graph und begründete Entscheidung. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Notwendige Bedingung als hinreichend, Randwerte vergessen.
**Progression:** Stationäre Stelle → Vorzeichen → globales Extremum. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `ef/analysis/kurven.html`

## EF · Vektor-Navigator

**Themenfeld:** Analytische Geometrie und lineare Algebra – Vektoren und Strecken im Raum.  
**KLP-Anker:** SII EF G (1–8,11), S.23.  
**Voraussetzungen:** Koordinaten, Pythagoras.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane die Bewegung einer Drohne rechnerisch.

Beobachtbare Teilkompetenzen:

- Verbindungsvektor: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Länge: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Kollinearität: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Parameter deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vektorspalten und räumlicher Flugplan. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Punkt und Vektor verwechselt, Parameterbereich der Strecke fehlt.
**Progression:** Komponenten → Betrag → Strecke im Kontext. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `ef/analytische-geometrie/vektor.html`

## EF · Geraden-Lagecheck

**Themenfeld:** Analytische Geometrie und lineare Algebra – Lagebeziehungen und LGS.  
**KLP-Anker:** SII EF G (9–12), S.23.  
**Voraussetzungen:** Vektoren und LGS.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Flugrouten auf gemeinsame Punkte.

Beobachtbare Teilkompetenzen:

- Richtungen prüfen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Lage bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Schnittpunkt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- LGS deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Zwei Parametergeraden und LGS. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Nicht parallel bedeutet Schnitt, dritte Gleichung ignoriert.
**Progression:** Parallelität → Punktprobe → windschief. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `ef/analytische-geometrie/geraden.html`

## EF · Stochastik-Brücke

**Themenfeld:** Stochastik – Wiederholung vor der Qualifikationsphase.  
**KLP-Anker:** Wiederholung SI S, kein eigenes Pflichtinhaltsfeld EF 2023.  
**Voraussetzungen:** Stochastik Klasse 10.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Sichere die Grundlagen für spätere Zufallsmodelle.

Beobachtbare Teilkompetenzen:

- Pfadregel wiederholen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bedingung deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Unabhängigkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modellgrenze: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Urnenmodell und kleine Vierfeldertafel. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Bedingung und Schnitt verwechselt.
**Progression:** Baum → Tafel → Modellbegründung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `ef/stochastik/bruecke.html`

## Q1 · Produktregel-Puzzle

**Themenfeld:** Funktionen und Analysis – Produktregel und Ableitungsstruktur.  
**KLP-Anker:** SII GK A (5,7,8), S.24.  
**Voraussetzungen:** Potenzregel und e-Funktion.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Repariere Ableitungen aus zwei veränderlichen Faktoren.

Beobachtbare Teilkompetenzen:

- Faktoren erkennen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Regel aufbauen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ableitung auswerten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fehler korrigieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Reihenfolgepuzzle und Fehlerzeilen. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Nur u′v′, ein Summand fehlt.
**Progression:** Faktoren → Regel → Polynom mal Exponentialfunktion. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/analysis/produkt.html`

## Q1 · Exponential-Labor

**Themenfeld:** Funktionen und Analysis – Kettenregel und Wachstumsmodelle.  
**KLP-Anker:** SII GK A (6,9,10,20), S.24–25.  
**Voraussetzungen:** Exponentialfunktionen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Untersuche Zu- und Abnahme in einem Modell.

Beobachtbare Teilkompetenzen:

- Innere Ableitung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Rate deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Wachstumszeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Grenzwert: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Graph und Kontextdaten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Innere Ableitung fehlt, negativer Exponent als negativer Bestand.
**Progression:** e^(kx) → Zerfall → begrenztes Wachstum. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/analysis/exp.html`

## Q1 · Integral-Werkstatt

**Themenfeld:** Funktionen und Analysis – Integral und Bestandsrekonstruktion.  
**KLP-Anker:** SII GK A (11–19), S.25.  
**Voraussetzungen:** Ableitung.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Rekonstruiere aus einer Zu- und Abflussrate den Tankinhalt.

Beobachtbare Teilkompetenzen:

- Produktsumme: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Stammfunktion: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Orientierte Fläche: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bestand: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Flächen unter Graphen und Rechtecksumme. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Anfangsbestand fehlt, Integral stets positiv.
**Progression:** Konstante Rate → Polynom → Vorzeichenwechsel. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/analysis/integral.html`

## Q1 · Winkel-Scanner

**Themenfeld:** Analytische Geometrie und lineare Algebra – Skalarprodukt und Schnittwinkel.  
**KLP-Anker:** SII GK G (1,5,9), S.25–26.  
**Voraussetzungen:** Vektorbetrag.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe räumliche Winkel einer Konstruktion.

Beobachtbare Teilkompetenzen:

- Skalarprodukt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Orthogonalität: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Vektorwinkel: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Gerade-Ebene-Winkel: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vektoren und Normalenvektor. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Skalarprodukt als Vektor, Ergänzungswinkel vergessen.
**Progression:** Komponenten → Orthogonalität → Objektwinkel. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/analytische-geometrie/skalar.html`

## Q1 · Ebenen-Werkstatt

**Themenfeld:** Analytische Geometrie und lineare Algebra – Ebenen und lineare Gleichungssysteme.  
**KLP-Anker:** SII GK G (2–4,7–9), S.25–26.  
**Voraussetzungen:** Geradengleichung.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Finde Durchstoßpunkte in einer Raumplanung.

Beobachtbare Teilkompetenzen:

- Punktprobe: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Normalenvektor: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Schnittparameter: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ebenenform: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Koordinaten- und Parameterform. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Richtungsvektor mit Normalenvektor verwechselt.
**Progression:** Punktprobe → Parameter → Schnittpunkt. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/analytische-geometrie/ebenen.html`

## Q1 · Binomial-Labor

**Themenfeld:** Stochastik – Bernoulli-Kette und Binomialverteilung.  
**KLP-Anker:** SII GK S (3,11–14), S.26.  
**Voraussetzungen:** Pfadregeln, Potenzen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Vergleiche theoretische Trefferzahlen mit Simulationen.

Beobachtbare Teilkompetenzen:

- Modell prüfen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Einzelwahrscheinlichkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Erwartung und Streuung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Histogramm deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Histogramm und Bernoulli-Simulation. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Ohne Zurücklegen als unabhängig, Erwartungswert als Garantie.
**Progression:** n,p → genau k → Verteilung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/stochastik/binomial.html`

## Q1 · Faire-Spiele-Werkstatt

**Themenfeld:** Stochastik – Zufallsgrößen und Kenngrößen.  
**KLP-Anker:** SII GK S (9,10), S.26.  
**Voraussetzungen:** Häufigkeiten, Mittelwert.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Gestalte ein faires Spiel und prüfe das Risiko.

Beobachtbare Teilkompetenzen:

- Erwartungswert: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Fairer Einsatz: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Varianz: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Gewinn interpretieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Wahrscheinlichkeitstabelle. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Auszahlung und Gewinn verwechselt, Erwartung muss möglich sein.
**Progression:** Gewichtetes Mittel → Einsatz → Varianz. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q1/grundkurs/stochastik/erwartung.html`

## Q2 · Analysis-Mission: Wassertank

**Themenfeld:** Funktionen und Analysis – Vernetzte Analysis im Kontext.  
**KLP-Anker:** SII GK A (7,10,15,18–20), S.24–25.  
**Voraussetzungen:** Differential- und Integralrechnung.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe einen vollständigen Füllplan mit Vorhersage und Rechnung.

Beobachtbare Teilkompetenzen:

- Rate analysieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Bestand rekonstruieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Extremum deuten: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Modell beurteilen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Zusammenhängende Aufgabenfolge mit Rate und Bestand. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Rate und Bestand verwechselt, Modell über Intervall extrapoliert.
**Progression:** Verstehen → Rechnen → Deuten → Transfer. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/grundkurs/analysis/abi_analysis.html`

## Q2 · Modell-Baumeister

**Themenfeld:** Funktionen und Analysis – Rekonstruktion und Optimierung.  
**KLP-Anker:** SII GK A (1,3,20), S.24–25.  
**Voraussetzungen:** Analysis und LGS.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Entwirf einen Bogen und optimiere eine Fläche.

Beobachtbare Teilkompetenzen:

- Bedingungen übersetzen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Parameter bestimmen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Zielfunktion: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Optimum prüfen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Bedingungskarten und Funktionsgraph. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Steigung mit Höhe verwechselt, Nebenbedingung fehlt.
**Progression:** Bedingung → LGS → Randkontrolle. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/grundkurs/analysis/steckbrief.html`

## Q2 · Raum-Mission: Landebahn

**Themenfeld:** Analytische Geometrie und lineare Algebra – Räumliche Modellierung.  
**KLP-Anker:** SII GK G (2–9), S.25–26.  
**Voraussetzungen:** Geraden und Ebenen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Anflug, Durchstoßpunkt und Landefläche.

Beobachtbare Teilkompetenzen:

- Modell aufstellen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Durchstoßpunkt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Schnittwinkel: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ergebnis beurteilen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vernetzte Geraden-Ebenen-Aufgabe. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Unendliche Gerade mit Flugabschnitt verwechselt.
**Progression:** Modell → Parameter → Winkel → zulässiger Bereich. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/grundkurs/analytische-geometrie/abi_raum.html`

## Q2 · Stochastik-Mission: Qualitätscheck

**Themenfeld:** Stochastik – Bedingung, Binomialmodell und Interpretation.  
**KLP-Anker:** SII GK S (4–14), S.26.  
**Voraussetzungen:** Binomialverteilung.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Untersuche eine fehleranfällige automatische Sortierung.

Beobachtbare Teilkompetenzen:

- Bedingte Wahrscheinlichkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Binomialmodell: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Ereignis berechnen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Aussage beurteilen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Vierfeldertafel, Modell und Verteilung. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Umgekehrte Bedingung, genau und mindestens verwechselt.
**Progression:** Kontext → Modell → Rechnung → Urteil. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/grundkurs/stochastik/abi_sto.html`

## Q2 · Normalverteilungs-Labor · LK

**Themenfeld:** Stochastik – Normalverteilung.  
**KLP-Anker:** SII LK S (19–21), S.30.  
**Voraussetzungen:** Binomialverteilung und Integralbegriff.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Prüfe Toleranzen normalverteilter Messwerte.

Beobachtbare Teilkompetenzen:

- Standardisieren: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Sigma-Intervall: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Dichte und Wahrscheinlichkeit: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Parameterwirkung: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Glockenkurve mit Intervall. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Dichtehöhe als Wahrscheinlichkeit, P(X=x)>0.
**Progression:** μ,σ → z → Fläche. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/leistungskurs/stochastik/normal.html`

## Q2 · Intervall-Detektiv · LK

**Themenfeld:** Stochastik – Prognose- und Konfidenzintervalle.  
**KLP-Anker:** SII LK S (16–18), S.30.  
**Voraussetzungen:** Binomialverteilung, Sigma-Regeln.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Plane eine Stichprobe und prüfe ihre Aussagekraft.

Beobachtbare Teilkompetenzen:

- Prognoseintervall: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Konfidenzintervall: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Stichprobenumfang: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Interpretation: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Intervallbalken und Stichprobendaten. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** 95 % der Werte im Konfidenzintervall, Stichprobe macht p zufällig.
**Progression:** Prognose → Schätzung → Umfang. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/leistungskurs/stochastik/konfidenz.html`

## Q2 · Abstands-Werkstatt · LK

**Themenfeld:** Analytische Geometrie und lineare Algebra – Abstände, Lot und Spiegelung.  
**KLP-Anker:** SII LK G (3,4,10–12), S.28–29.  
**Voraussetzungen:** Skalarprodukt und Ebenen.  
**Zeit:** 15–25 Minuten.  
**Lernauftrag:** Bestimme den kürzesten Weg zu einer Ebene.

Beobachtbare Teilkompetenzen:

- Punkt-Ebene-Abstand: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Lotfußpunkt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Spiegelpunkt: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.
- Abstand begründen: eine passende mathematische Entscheidung treffen und durch Ergebnis, Darstellung oder Begründung überprüfen.

**Spielhandlung:** Lotgerade und Normalenvektor. Jede dieser Teilkompetenzen erhält eine eigene Aufgabenfamilie; die Runde wechselt zwischen den Familien.
**Diagnoseziel:** Normalenvektor nicht normiert, Spiegelpunkt gleich Lotpunkt.
**Progression:** Abstand → Lot → Spiegelung. Der Zahlenraum steigt nach vier selbstständig richtigen Erstlösungen je Teilkompetenz; Hilfen und Korrekturen lösen keine Steigerung aus.
**Niveaus:** Einstieg/Basis (d=0) nutzt kleine Zahlen und einzelne Schritte; Aufbau (d=1) erweitert Zahlenraum und Darstellungen; Transfer/Knobel (d=2) verlangt mehrere Schritte und Begründungen; Challenge/Profi (d=3) verbindet komplexe Zahlen, Fehlerdiagnose und Modellierung. Zusätzlich kann die lernende Person „Diagnose“ wählen, dann passt das Spiel d an selbstständige Lösungen an.
**Lernhilfe:** Drei fachbezogene Hinweise: Begriff, Strategie, erster Schritt; danach ein vollständiger Lösungsweg. Der erste Tipp ist sofort verfügbar, weitere Tipps nach 30 Sekunden. Nach zwei Fehlversuchen ist die Musterlösung freiwillig abrufbar.
**Wiederholung:** Fehler und Lösungen mit Hilfen werden nach mindestens zwei anderen Aufgaben mit veränderten Werten wieder aufgegriffen. Bei erneutem Fehler bleibt die Anforderung niedrig.
**Kompetenznachweis:** Erstlösungen ohne Hilfen werden getrennt von Korrekturen gezählt. „Im Spiel gefestigt“ erfordert mindestens fünf Aufgaben, mindestens 80 % selbstständig korrekt in den letzten zehn, zwei tatsächlich vorkommende Darstellungsarten und eine versetzte richtige Wiederholung. Bei zu wenig Evidenz erscheint keine Beherrschungsbehauptung.
**Unterrichtlicher Anschluss:** Eine Lösung einem Partner erklären; anschließend eine ähnliche Aufgabe mit veränderter Darstellung schriftlich bearbeiten. Freie Erklärungen werden gespeichert, aber nicht automatisch bewertet.
**Datei:** `q2/leistungskurs/analytische-geometrie/abstand.html`


## 83. Technischer Referenzmotor

Jedes Spiel nutzt `shared/game-engine.js` und die Aufgabenmodule. Ein Aufgabenobjekt enthält mindestens Aufgabentyp, Prompt, Antwort, Lösungsweg und gestufte Hinweise. Die sechs integrierten Interaktionsfamilien sind numerische Eingabe, Auswahl, Reihenfolgepuzzle, Färben/Markieren, Fehlerdiagnose und Labor mit Reglern bzw. Simulation.

Der Spielmotor zählt selbstständige Erstlösungen getrennt von Antworten nach einem Hinweis. Nach einem Fehler wird die Aufgabenfamilie mit neuen Parametern später erneut eingestreut. Ein Kompetenzprofil wird nur als Prozentwert der vorhandenen Versuche angezeigt; die Formulierung „im Spiel gefestigt“ wird nicht behauptet, solange fünf Aufgaben, 80 % selbstständige Treffer, zwei Darstellungen und eine versetzte Wiederholung nicht vorliegen.

Die technische Umsetzung bleibt datensparsam: Es werden keine Namen, Klassenlisten oder Ergebnisse an einen Server gesendet. `localStorage` speichert nur den Fortschritt auf dem jeweiligen Gerät. Die Teilnehmerurkunde wird als lokale Druckansicht erzeugt.

## 84. Qualitätskontrolle der Implementierung

- Die 60 generischen Katalogeinträge besitzen jeweils einen Generator und eine HTML-Datei; drei ergänzende Algebra-Plättchen-Spiele nutzen den eigenen Offline-Motor `shared/algebra-tiles.js`.
- Alle HTML-Dateien verwenden relative Pfade ohne Leerzeichen/Umlaute.
- Die gemeinsame Basis hat keine externen Abhängigkeiten.
- Aufgabenmodule und Spielmotor wurden mit `node --check` syntaktisch geprüft.
- Die HTML-Dateien enthalten responsive Viewport-Einstellungen, große Touchflächen und Pointer-kompatible Interaktion.
- Die Aufgabenbank wird über viele zufällige Parameterkombinationen auf vollständige, endliche Aufgabenobjekte geprüft; gemeinsame JavaScript-Dateien bestehen den Syntaxcheck.
- Ein statischer Pfad- und Ressourcencheck prüft alle HTML-Dateien; ein lokaler HTTP-Aufruf stellt sicher, dass die relativen GitHub-Pages-Pfade auslieferbar sind. Die visuelle Browserprüfung bleibt eine Aufgabe für die Zielgeräte (iPad/Safari).

## 85. Grenzen der automatischen Diagnose

Offene Begründungen und mündliche Kommunikation werden durch die Spiele angebahnt, aber nicht valide automatisch bewertet. Die abschließende Kompetenzfeststellung bleibt deshalb eine Kombination aus digitaler Spielhistorie, schriftlicher Bearbeitung und Unterrichtsgespräch.


## 86. Wählbare Schwierigkeitsstufen – umgesetzter Stand

Alle 74 Spielseiten (63 Lernspiele, davon 60 Aufgabenfamilien plus drei Algebra-Plättchen-Spiele) bieten vor jeder Runde **Leicht, Mittel, Schwer und Automatisch steigern**. Die Auswahl wird auf dem Gerät gespeichert. Feste Stufen bleiben während einer Runde unverändert. Über „Zur Auswahl“ kann eine neue Runde auf einer anderen Stufe begonnen werden; die aktuelle Runde wird dabei beendet. Üben, Mission und Prüfungsmodus bleiben davon unabhängige Entscheidungen.

| Auswahl | Umsetzung |
| --- | --- |
| Leicht | Generatorstufe 0; erster Tipp im Üben und in der Mission automatisch sichtbar. Diese Antworten gelten als mit Hilfe bearbeitet. |
| Mittel | Generatorstufe 1; Tipps freiwillig, weitere Tipps mit 30 Sekunden Abstand. |
| Schwer | Generatorstufe 3; Tipps weiterhin freiwillig. |
| Automatisch steigern | Stufen 0–3 anhand bisheriger selbstständiger Lösungen im Automatikprofil (Schwellen: 3, 7, 12). |

Im Prüfungsmodus werden auf keiner Stufe Tipps eingeblendet. Zahlenänderungen erfolgen nur dort, wo der vorhandene Generator die Stufe fachlich nutzt. Begriffsfragen, Konstruktionen und Entdeckungsaufgaben erhalten nicht künstlich schwierigere Inhalte: Hier unterscheidet sich insbesondere der leichte Einstieg durch die sichtbare Unterstützung. Mittel und Schwer können bei solchen Aufgaben inhaltlich gleich sein. Es wird insbesondere keine pauschale Abitur-Transferstufe behauptet.

### 86.1 Äquivalenzumformungen – Waagen-Werkstatt, Klasse 7

| Stufe | Lückenaufgabe |
| --- | --- |
| Leicht | Gleichung ax+b=c; Subtraktion und Division sowie das Zwischenergebnis stehen bereits da; x fehlt. |
| Mittel | Gleichung ax+b=c; Zwischenergebnis, Divisor und Lösung fehlen. |
| Schwer | Variablen auf beiden Seiten; sechs Lücken für den subtrahierten x-Koeffizienten, Summanden, verbleibenden Koeffizienten, das Zwischenergebnis, den Divisor und x. Auch negative Lösungen und null sind möglich. |

Beispiel schwer: 5x+3=2x+15 → beidseitig −2x → 3x+3=15 → beidseitig −3 → 3x=12 → beidseitig :3 → x=4. Gleichheitszeichen und Umformungsstriche sind spaltenweise ausgerichtet. In die Lücken gehören Zahlen; die Operatoren stehen davor. Freitextoperationen oder Klammergleichungen sind in dieser Fassung nicht implementiert. Fehlerdiagnose und Kontextaufgaben bleiben zusätzlich erhalten. Der vollständige Lösungsweg erscheint nach der Antwort.

### 86.2 Auswertung und Belohnungen

Kompetenzprofile werden nach der gewählten Schwierigkeit getrennt gespeichert. Frühere undifferenzierte Statistiken werden nicht in eine neue Stufe umgedeutet. Auf Aufgabenanzeige, Auswertung und Teilnehmerurkunde steht die gewählte Schwierigkeit. Die Urkunde ist ein Teilnahmebeleg; aus einer schweren Runde wird nicht automatisch Abiturreife abgeleitet. Die bestehenden Regeln der Spielmodi bleiben erhalten.

### 86.3 Prüfung und Grenzen

JavaScript-Syntax geprüft; alle 60 Generatoren mit je vier Aufgabenvarianten auf vier internen Stufen, jeweils 20 Ziehungen (19.200 Aufgabenobjekte), auf vollständige Grundfelder geprüft. Bei Lückengleichungen zusätzlich eindeutige, lückenlose Zuordnung der Eingabefelder zu endlichen Lösungseinträgen geprüft. Dies ist keine vollständige fachliche Prüfung aller Zufallsvarianten. Ein Browserlauf und ein realer iPad-Test waren mangels installiertem Browser nicht möglich. Der Offline-Cache wurde versioniert und alte spielbezogene Cacheversionen werden beim Aktivieren entfernt.

### 86.4 Übersicht der Abstufung pro Aufgabenfamilie

„Zahlenstufe“ bedeutet, dass mindestens eine Variante den bisherigen Parameter d nutzt; nicht jede Teilaufgabe ändert sich. „Unterstützung“ bedeutet gleicher fachlicher Kern, auf Leicht erster Tipp sichtbar, sonst freiwillige Tipps.

| Aufgabenfamilie | Umgesetzte Abstufung |
| --- | --- |
| `rechenstrategien` | Zahlenstufe und Unterstützung |
| `messen` | Zahlenstufe und Unterstützung |
| `bruchbild` | Zahlenstufe und Unterstützung |
| `muster` | Zahlenstufe und Unterstützung |
| `figuren` | Unterstützung |
| `spiegel` | Unterstützung |
| `wuerfel` | Zahlenstufe und Unterstützung |
| `daten5` | Zahlenstufe und Unterstützung |
| `teiler` | Zahlenstufe und Unterstützung |
| `bruchrechnen` | Zahlenstufe und Unterstützung |
| `komma` | Zahlenstufe und Unterstützung |
| `dreisatz` | Zahlenstufe und Unterstützung |
| `abbildung` | Unterstützung |
| `flaechen` | Zahlenstufe und Unterstützung |
| `statistik6` | Zahlenstufe und Unterstützung |
| `vorzeichen` | Zahlenstufe und Unterstützung |
| `terme` | Zahlenstufe und Unterstützung |
| `gleichung` | Lücken und Umformungsschritte; zusätzlich Zahlenstufe |
| `zuordnung` | Unterstützung |
| `prozent` | Unterstützung |
| `winkel` | Unterstützung |
| `zufall7` | Unterstützung |
| `binomisch` | Zahlenstufe und Unterstützung |
| `bruchterm` | Zahlenstufe und Unterstützung |
| `lgs` | Zahlenstufe und Unterstützung |
| `linear` | Unterstützung |
| `thales` | Zahlenstufe und Unterstützung |
| `baum` | Unterstützung |
| `potenz` | Zahlenstufe und Unterstützung |
| `quadratisch` | Zahlenstufe und Unterstützung |
| `parabel` | Unterstützung |
| `pythagoras` | Zahlenstufe und Unterstützung |
| `kreis` | Zahlenstufe und Unterstützung |
| `kritik` | Unterstützung |
| `logarithmus` | Zahlenstufe und Unterstützung |
| `wachstum` | Unterstützung |
| `sinus` | Unterstützung |
| `trigo` | Unterstützung |
| `koerper` | Zahlenstufe und Unterstützung |
| `vierfelder` | Unterstützung |
| `transform` | Unterstützung |
| `ableitung` | Zahlenstufe und Unterstützung |
| `kurven` | Unterstützung |
| `vektor` | Unterstützung |
| `geraden` | Unterstützung |
| `bruecke` | Unterstützung |
| `produkt` | Unterstützung |
| `exp` | Unterstützung |
| `integral` | Unterstützung |
| `skalar` | Unterstützung |
| `ebenen` | Unterstützung |
| `binomial` | Unterstützung |
| `erwartung` | Unterstützung |
| `abi_analysis` | Unterstützung |
| `steckbrief` | Unterstützung |
| `abi_raum` | Unterstützung |
| `abi_sto` | Unterstützung |
| `normal` | Unterstützung |
| `konfidenz` | Unterstützung |
| `abstand` | Unterstützung |


## 87. iPad-Anpassung – responsive Oberfläche

Alle 74 Spielseiten sowie die Materialübersicht verwenden einen Geräte-Viewport ohne Zoomsperre. Die gemeinsame Oberfläche reagiert ohne Neuladen auf Hoch-/Querformat und Split View. Flexible Raster, schrumpfbare Inhaltscontainer, umbruchfähige Texte und skalierende SVG-Darstellungen passen die Seitenbreite an. Die maximale Lesebreite bleibt auf großen Bildschirmen begrenzt; die Seite darf vertikal scrollen.

Bedienelemente sind mindestens 44 CSS-Pixel hoch; Rasterkästchen mindestens 44 × 44 Pixel. Gleichungen, breite Tabellen und große Kästchenfelder werden bei Platzmangel innerhalb ihres eigenen Bereichs horizontal gescrollt. So bleiben die fachliche Ausrichtung und die Touch-Ziele erhalten, ohne die gesamte Seite zu verbreitern. Die Schrift in Eingabefeldern bleibt mindestens 16 Pixel groß. Die Bildschirmtastatur öffnet sich erst nach Antippen eines Eingabefeldes. Hilfe-Dialoge sind scrollbar, Safe-Area-Abstände werden berücksichtigt. Zoom bleibt möglich; reduzierte Bewegung wird respektiert.

Qualitätssicherung: Viewport und gemeinsame Ressourcen für sämtliche HTML-Seiten statisch geprüft, JavaScript-Syntax kontrolliert. CSS-Regeln berücksichtigen insbesondere 320/375 Pixel Split View, 768/820 Pixel Hochformat und 1024/1180 Pixel Querformat. Dies ist keine dokumentierte Browsermessung dieser Größen: Ein Browser-Binary sowie ein physisches iPad stehen in dieser Umgebung nicht zur Verfügung. Sichtprüfung und Bedienprüfung in iPadOS Safari bleiben erforderlich.


## 88. Visuelle Spielwelten – vier wählbare Looks

Die 74 Spielseiten und die Materialübersicht besitzen eine gemeinsame Look-Auswahl. Über **„Look“** in der oberen Leiste lassen sich vier eigenständig gestaltete Oberflächen wählen. Der Wechsel passt Farben, Flächen, Überschriften, Rahmen, Schaltflächen und die dekorative Illustration an. Er erzeugt keine neue Aufgabe und verändert weder die gewählte Schwierigkeit noch den Lernfortschritt. Eine laufende Rundenzeit läuft beim Auswählen weiter.

| Look | Gestaltung | Beispiele für die Spielzuordnung |
| --- | --- | --- |
| Retro 64 | Facettierte, räumlich wirkende Insel, Portal und geometrische Formen; Indigo, Salbei und Apricot; plastische Schaltflächen. Die Gestaltung ist von frühen 3D-Konsolenspielen inspiriert, kein eigener 64-Bit-Spielmotor. | Würfel-Werft, Höhen-Expedition, Raum-Mission |
| Pixel-Werkstatt | Pixel-Landschaft mit kleiner Blockfigur; eckige Rahmen, feste Schatten und grüne Papierfarben; Monospace nur für dekorative Überschriften. | Rechenwege-Werkstatt, Spiegel-Werkstatt, Komma-Kasse |
| Papierwelt | Notizzettel, Bleistift, ausgeschnittene Formen, warme Papierfarben und zurückhaltende Linien. | Waagen-Werkstatt, Bruch-Küche, Konstruktions-Atelier |
| Mathe-Studio | Ruhiges Dunkelblau, klare geometrische Formen, dezente Bahnen und reduzierte Schaltflächen. | Graphen-Schaltzentrale, Integral-Werkstatt, Binomial-Labor |

Jedes Spiel enthält eine inhaltlich begründete Vorgabe (`defaultLook`) und eine Begründung (`lookReason`). Eine manuelle Auswahl wird nur für diese Spielseite gespeichert. Die frühere globale Look-Einstellung wird nicht mehr ausgewertet. „Zugeordneten Look verwenden“ entfernt die persönliche Abweichung und stellt den zugeordneten Look wieder her. Der Fortschritt wird dabei nicht gelöscht. Die vollständige Zuordnung folgt in Kapitel 89.

### 88.1 Übersichtliche Aufgabenoberfläche

- Die Startansicht gruppiert Schwierigkeitswahl und Spielmodus. Kompetenzen und bisheriger Fortschritt bleiben in einem aufklappbaren Bereich erreichbar.
- Der Kopfbereich enthält eine eigene, vektorbasierte Illustration und ein Symbol des Themenfelds. Themenfarben bleiben an Aufgabenkarten und Materialkarten sichtbar.
- Während einer Runde wird die Illustration ausgeblendet und der Kopfbereich verkleinert. Die mathematische Aufgabe erhält dadurch mehr Platz.
- Eine kleine Fortschrittsleiste zeigt die Position in der Runde. Auswahl und korrekte Rückmeldung besitzen kurze, dezente Reaktionen; es gibt keine dauerhaft laufenden dekorativen Animationen. Die Einstellung für reduzierte Bewegung wird berücksichtigt.
- Formeln, Eingabefelder und Lösungswege behalten eine gut lesbare Standardschrift auf ruhigen Flächen. Mathematische SVG-Darstellungen werden nicht durch Spielgrafiken ersetzt.

### 88.2 iPad und Offline-Betrieb

Alle vier Looks verwenden dieselbe responsive Grundlage für Hochformat, Querformat und Split View. Die Look-Auswahl passt sich ebenfalls an schmale Fenster an. Bedienelemente bleiben mindestens 44 CSS-Pixel hoch; Eingabefelder bleiben mindestens 16 Pixel groß. Zoom bleibt erlaubt. Breite mathematische Inhalte können weiterhin innerhalb ihres eigenen Bereichs horizontal gescrollt werden.

Die neuen Dateien `shared/themes.js` und `shared/themes.css` enthalten alle Illustrationen und Stile ohne externe Schrift-, Bild- oder Skriptdienste. Beide sind im aktualisierten Offline-Cache enthalten. `Stiluebersicht.png` zeigt die tatsächlich verwendeten Illustrationen; sie ist eine Stilübersicht, kein Browser-Screenshot.

### 88.3 Qualitätskontrolle dieser Überarbeitung

- Alle 75 HTML-Seiten (Materialübersicht plus 74 Spiele): Viewport, erlaubtes Zoomen, Einbindung der Stilmodule sowie Existenz aller statischen lokalen Ressourcen geprüft.
- Alle eingebetteten Skripte der 75 HTML-Seiten und sämtliche gemeinsamen JavaScript-Dateien syntaktisch geprüft.
- Alle Einträge des Offline-Caches auf vorhandene Dateien und doppelte Einträge geprüft.
- Vier Look-Wechsel, lokale Auswahl-Speicherung, unveränderte Spielmetadaten und das Ignorieren ungültiger Look-IDs in einer JavaScript-VM geprüft. Dies ersetzt keinen Browser-Integrationstest.
- Vier Illustrationen als SVG geparst, die daraus gerenderte Stilübersicht visuell kontrolliert.
- Elf zentrale Text-/Hintergrundfarbpaare rechnerisch geprüft: Kontrast mindestens 5,28:1. Dies ist keine vollständige Barrierefreiheitsprüfung aller Zustände.
- In der Materialübersicht eine fehlerhafte Neuzuweisung einer konstanten Variablen korrigiert, die die Auswahl von Klassen ohne GK/LK-Unterteilung unterbrechen konnte.

**Offene Prüfung:** Ein vollständiger Browserlauf, reale Layoutmessungen und die Bedienung auf einem iPad bleiben offen. Es ist kein Browser-Binary installiert; der Nachladeversuch scheiterte an Netzwerk-Zeitüberschreitungen. Die Stile sind implementiert und statisch geprüft, aber nicht als in iPadOS Safari praktisch getestet zu verstehen.


## 89. Individuelle Look-Zuordnung für alle Spiele

Die Zuweisung orientiert sich an konkreter Spielhandlung, mathematischem Inhalt und Übersichtlichkeit. Es gibt keine pauschale Zuweisung allein nach Jahrgang mehr. Alle 63 Lernspiele und sämtliche 74 HTML-Spielseiten besitzen eine ausdrückliche Zuordnung. GK- und LK-Versionen desselben Spiels erhalten denselben passenden Standard-Look.

- **Papierwelt:** 26 Spielseiten mit Rechenwegen, Konstruktionsplänen, Flächenzerlegungen oder Entwurfsaufgaben; darunter die drei Algebra-Plättchen-Spiele.
- **Pixel-Werkstatt:** 6 Spielseiten mit Rasterbildern, Gruppierungen, Mustern oder kurzen Markt- und Kassenaufgaben.
- **Retro 64:** 16 Spielseiten mit räumlichen Körpern, Navigation, Wegen, Portalen oder Expeditionen.
- **Mathe-Studio:** 26 Spielseiten mit Graphen, Messreihen, Tabellen, Modellvergleichen oder statistischen Untersuchungen.

Die Materialübersicht startet im Mathe-Studio und zeigt den Standard-Look auf jeder Materialkarte. Alle vier Darstellungen bleiben auf jeder Spielseite erreichbar. Die Auswahl im einen Spiel verändert kein anderes Spiel. Auch GK- und LK-Seiten speichern persönliche Abweichungen getrennt.

### 89.1 Vollständige Zuordnung

| Jahrgang / Kurs | Lernspiel | Zugeordneter Look | Grund der Auswahl |
| --- | --- | --- | --- |
| 5 | Bruch-Atelier | Papierwelt | Bruchstreifen und gefärbte Anteile wirken wie ausgeschnittene Papierflächen. |
| 5 | Daten-Detektive | Papierwelt | Die Umfrage und das Prüfen von Daten passen zu einer übersichtlichen Ermittlungsnotiz. |
| 5 | Figuren-Finder | Papierwelt | Geometrische Figuren lassen sich als ausgeschnittene Formen anschaulich sortieren. |
| 5 | Maßband-Mission | Papierwelt | Maßband, Maße und Raumskizzen passen zur gezeichneten Papierwelt. |
| 5 | Muster-Express | Pixel-Werkstatt | Wiederkehrende Blöcke unterstützen die Idee von Mustern und nächsten Bauteilen. |
| 5 | Rechenwege-Werkstatt | Pixel-Werkstatt | Bausteine passen zum Zerlegen von Zahlen und zum übersichtlichen Üben. |
| 5 | Spiegel-Werkstatt | Pixel-Werkstatt | Das Ergänzen eines Mosaiks passt unmittelbar zur Raster- und Pixelgestaltung. |
| 5 | Würfel-Werft | Retro 64 | Räumliche Würfel und Quader passen zu den facettierten Körpern der Spielwelt. |
| 6 | Bruch-Küche | Papierwelt | Rezepte und Portionsrechnungen passen zu einer warmen Papier- und Küchenwerkstatt. |
| 6 | Daten-Labor | Mathe-Studio | Messreihen, Boxplots und Kenngrößen profitieren von einer ruhigen Datenansicht. |
| 6 | Dreisatz-Express | Retro 64 | Die Materialplanung für einen Ausflug bekommt den Rahmen einer kleinen Reise. |
| 6 | Flächen-und-Netze-Werkstatt | Papierwelt | Zuschnitte, Netze und Flächenzerlegungen passen zu Papier und Bastelvorlagen. |
| 6 | Komma-Kasse | Pixel-Werkstatt | Die kleine Einkaufskasse erhält eine einfache, spielerische Oberfläche für kurze Übungen. |
| 6 | Koordinaten-Navigator | Retro 64 | Navigation und das Verschieben von Markierungen passen zu einer räumlichen Spielwelt. |
| 6 | Teiler-Scanner | Pixel-Werkstatt | Gleiche Gruppen und restloses Aufteilen werden durch die Blockgestaltung aufgegriffen. |
| 7 | Prozent-Markt | Pixel-Werkstatt | Der Markt- und Kassenkontext passt zur kompakten, spielerischen Blockgestaltung. |
| 7 | Term-Labor | Papierwelt | Rechteckmodelle und das Zusammensetzen von Termen passen zu gezeichneten Bauteilen. |
| 7 | Algebra-Bauplatz | Papierwelt | x-, Gegen- und Einheitsplättchen werden wie beschriftete Papierbausteine zu einem Term gelegt. |
| 7 | Gleichungswaage | Papierwelt | Die beiden Seiten der Gleichung bleiben als ausgerichtete Plättchenflächen übersichtlich. |
| 7 | Vorzeichen-Navigator | Retro 64 | Die Bewegung zwischen positiven und negativen Werten greift das Navigationsmotiv auf. |
| 7 | Waagen-Werkstatt | Papierwelt | Ausgerichtete Gleichungszeilen und Umformungslücken wirken wie ein klarer Rechenbogen. |
| 7 | Winkel-Detektiv | Papierwelt | Baupläne, Hilfslinien und Winkelbegründungen passen zu einer Zeichenwerkstatt. |
| 7 | Zufalls-Labor | Mathe-Studio | Vorhersage, Versuchsreihe und Häufigkeit werden als zusammenhängende Laboraufgabe präsentiert. |
| 7 | Zuordnungs-Zentrale | Mathe-Studio | Tabellen und der Vergleich von Zuordnungen stehen in einer ruhigen Planungsansicht im Vordergrund. |
| 8 | Binomische Baupläne | Papierwelt | Quadratische Flächen und ihre Teilflächen entsprechen ausgeschnittenen Bauplänen. |
| 8 | Quadrat-Atelier | Papierwelt | x²-Quadrat, x-Streifen und Einheitsfläche machen Ergänzen, Faktorisieren und Nullstellen sichtbar. |
| 8 | Bruchterm-Wächter | Retro 64 | Formelschlösser und zulässige Werte passen zur Portal- und Wächteridee. |
| 8 | Gleichungs-Duo | Papierwelt | Zwei Bedingungen und parallele Rechenwege sind auf einer ruhigen Papierfläche gut vergleichbar. |
| 8 | Graphen-Schaltzentrale | Mathe-Studio | Regler, Geraden und Tarife passen zu einer übersichtlichen Schaltzentrale. |
| 8 | Konstruktions-Atelier | Papierwelt | Zirkel, Dreiecke und Konstruktionsschritte greifen das Ateliermotiv direkt auf. |
| 8 | Zufalls-Pfade | Retro 64 | Verzweigte Zufallspfade passen zum Erkunden verschiedener Wege durch eine Spielwelt. |
| 9 | Diagramm-Redaktion | Mathe-Studio | Das sachliche Prüfen von Diagrammen und Meldungen passt zu einer klaren Redaktionsansicht. |
| 9 | Kreis-Werkstatt | Papierwelt | Rundbeete, Kreissektoren und Behälter werden im Stil einer Entwurfszeichnung gerahmt. |
| 9 | Parabel-Werkstatt | Mathe-Studio | Zielpunkte, Funktionsgraphen und Parameter benötigen eine ruhige Vergleichsfläche. |
| 9 | Potenzen-und-Wurzeln-Werkstatt | Papierwelt | Rechenregeln, Wurzeln und symbolische Umformungen passen zu einer klaren Rechenwerkstatt. |
| 9 | Pythagoras-Route | Retro 64 | Die Planung sicherer Strecken greift das räumliche Routen- und Abenteuergefühl auf. |
| 9 | Quadratische Werkstatt | Papierwelt | Die Wahl eines Lösungsverfahrens und die einzelnen Schritte passen zum Werkstattbogen. |
| 10 | Exponenten-Detektiv | Papierwelt | Das schrittweise Ermitteln unbekannter Exponenten passt zu einem nachvollziehbaren Rechenbogen. |
| 10 | Höhen-Expedition | Retro 64 | Die Höhen-Expedition und räumliche Messsituation passen zur facettierten Abenteuerwelt. |
| 10 | Körper-Manufaktur | Retro 64 | Zusammengesetzte Körper und Materialmengen greifen die räumlichen Bauformen auf. |
| 10 | Vierfelder-Ermittlung | Mathe-Studio | Vierfeldertafeln und bedingte Wahrscheinlichkeiten profitieren von der klaren Datenansicht. |
| 10 | Wachstums-Scanner | Mathe-Studio | Messreihen und Wachstumsmodelle lassen sich in einer reduzierten Laboransicht vergleichen. |
| 10 | Wellen-Werkstatt | Mathe-Studio | Wellen, periodische Bewegung und Parameter passen zum ruhigen Funktionslabor. |
| EF | Geraden-Lagecheck | Retro 64 | Das Prüfen von Flugrouten auf Schnittpunkte greift die räumliche Spielwelt auf. |
| EF | Kurven-Detektiv | Papierwelt | Das Prüfen und Begründen von Kurveneigenschaften passt zum kommentierten Analysebogen. |
| EF | Stochastik-Brücke | Mathe-Studio | Die Wiederholung von Wahrscheinlichkeitsmodellen erhält eine ruhige Oberstufenansicht. |
| EF | Tangenten-Labor | Mathe-Studio | Sekante, Tangente und Grenzprozess benötigen eine klare und wenig ablenkende Graphenfläche. |
| EF | Transformations-Labor | Mathe-Studio | Das Vergleichen von Zielgraphen und Parameterwirkungen steht in einer ruhigen Laboransicht im Fokus. |
| EF | Vektor-Navigator | Retro 64 | Die Bewegung einer Drohne im Raum passt zum räumlichen Navigationsmotiv. |
| Q1 · Grundkurs | Binomial-Labor | Mathe-Studio | Theoretische Verteilungen und Trefferzahlen stehen in der Daten- und Laboransicht im Mittelpunkt. |
| Q1 · Grundkurs | Ebenen-Werkstatt | Retro 64 | Ebenen und Durchstoßpunkte greifen das Modellieren und Planen im Raum auf. |
| Q1 · Grundkurs | Exponential-Labor | Mathe-Studio | Die Untersuchung von Wachstumsmodellen passt zum sachlichen Funktionslabor. |
| Q1 · Grundkurs | Faire-Spiele-Werkstatt | Papierwelt | Spielregeln, Einsätze und Erwartungswert passen zum Entwerfen und Prüfen eines Spiels auf Papier. |
| Q1 · Grundkurs | Integral-Werkstatt | Mathe-Studio | Rate, Bestand und orientierte Fläche brauchen eine gut vergleichbare Analyseansicht. |
| Q1 · Grundkurs | Produktregel-Puzzle | Papierwelt | Faktoren, Teilableitungen und die Reparatur von Rechenwegen passen zum Papierpuzzle. |
| Q1 · Grundkurs | Winkel-Scanner | Mathe-Studio | Winkelmessung, Skalarprodukt und Orthogonalität passen zu einem ruhigen Scanner-Labor. |
| Q1 · Leistungskurs | Binomial-Labor · LK-Basis | Mathe-Studio | Theoretische Verteilungen und Trefferzahlen stehen in der Daten- und Laboransicht im Mittelpunkt. |
| Q1 · Leistungskurs | Ebenen-Werkstatt · LK-Basis | Retro 64 | Ebenen und Durchstoßpunkte greifen das Modellieren und Planen im Raum auf. |
| Q1 · Leistungskurs | Exponential-Labor · LK-Basis | Mathe-Studio | Die Untersuchung von Wachstumsmodellen passt zum sachlichen Funktionslabor. |
| Q1 · Leistungskurs | Faire-Spiele-Werkstatt · LK-Basis | Papierwelt | Spielregeln, Einsätze und Erwartungswert passen zum Entwerfen und Prüfen eines Spiels auf Papier. |
| Q1 · Leistungskurs | Integral-Werkstatt · LK-Basis | Mathe-Studio | Rate, Bestand und orientierte Fläche brauchen eine gut vergleichbare Analyseansicht. |
| Q1 · Leistungskurs | Produktregel-Puzzle · LK-Basis | Papierwelt | Faktoren, Teilableitungen und die Reparatur von Rechenwegen passen zum Papierpuzzle. |
| Q1 · Leistungskurs | Winkel-Scanner · LK-Basis | Mathe-Studio | Winkelmessung, Skalarprodukt und Orthogonalität passen zu einem ruhigen Scanner-Labor. |
| Q2 · Grundkurs | Analysis-Mission: Wassertank | Mathe-Studio | Die vernetzte Untersuchung des Füllplans erhält eine ruhige, prüfungsnahe Analyseansicht. |
| Q2 · Grundkurs | Modell-Baumeister | Papierwelt | Bogenentwurf und Optimierung passen zur gestalterischen Planungs- und Papierwerkstatt. |
| Q2 · Grundkurs | Raum-Mission: Landebahn | Retro 64 | Anflug, Landefläche und Durchstoßpunkt passen zum räumlichen Missionsrahmen. |
| Q2 · Grundkurs | Stochastik-Mission: Qualitätscheck | Mathe-Studio | Der Qualitätscheck und die Bewertung statistischer Aussagen passen zur sachlichen Laboransicht. |
| Q2 · Leistungskurs | Abstands-Werkstatt · LK | Retro 64 | Lot, Spiegelpunkt und kürzester Weg zu einer Ebene greifen räumliche Beziehungen auf. |
| Q2 · Leistungskurs | Analysis-Mission: Wassertank · LK-Basis | Mathe-Studio | Die vernetzte Untersuchung des Füllplans erhält eine ruhige, prüfungsnahe Analyseansicht. |
| Q2 · Leistungskurs | Intervall-Detektiv · LK | Mathe-Studio | Stichproben und die Interpretation von Intervallen profitieren von einer ruhigen Datenansicht. |
| Q2 · Leistungskurs | Modell-Baumeister · LK-Basis | Papierwelt | Bogenentwurf und Optimierung passen zur gestalterischen Planungs- und Papierwerkstatt. |
| Q2 · Leistungskurs | Normalverteilungs-Labor · LK | Mathe-Studio | Dichtekurve, Toleranzen und Intervalle benötigen eine klare statistische Darstellung. |
| Q2 · Leistungskurs | Raum-Mission: Landebahn · LK-Basis | Retro 64 | Anflug, Landefläche und Durchstoßpunkt passen zum räumlichen Missionsrahmen. |
| Q2 · Leistungskurs | Stochastik-Mission: Qualitätscheck · LK-Basis | Mathe-Studio | Der Qualitätscheck und die Bewertung statistischer Aussagen passen zur sachlichen Laboransicht. |

### 89.2 Umsetzung und Kontrolle

Die Angaben stehen in den HTML-Spielmetadaten sowie den Spieleinträgen von `data.json` und der Materialübersicht. Der neue lokale Schlüssel beginnt mit `mathe_lernspiele_look_v2_` und enthält Jahrgang, Kurs und Spiel-ID. Ein früherer globaler Look aus Version 1 überschreibt die Zuweisungen nicht. Der Offline-Cache wurde auf die neue Fassung gesetzt.

Für alle 74 Spielseiten per JavaScript-VM geprüft: Übereinstimmung zwischen HTML und Katalog, Start mit zugeordnetem Look, Ignorieren der alten globalen Auswahl, Speichern und Wiederladen einer persönlichen Abweichung, Rückkehr zur Zuordnung, unveränderte fremde Speichereinträge und Start bei blockiertem Speicher. Die Trennung von GK- und LK-Auswahl wurde zusätzlich geprüft. Ein Browser- oder iPad-Test wurde dadurch nicht ersetzt; die zuvor dokumentierte Einschränkung bleibt bestehen.

## 90. Algebra-Plättchen als eigene Lernspiel-Familie (Klasse 7/8)

Die Fortsetzung ergänzt den generischen Aufgabenmotor um drei eigenständige, offlinefähige Lernspiele. Sie greifen die Idee virtueller Algebra-Plättchen auf, sind aber vollständig lokal als HTML/CSS/JavaScript umgesetzt. Die fachliche Darstellung wird dadurch nicht zur Dekoration: Jede Aktion verändert ein algebraisches Modell, und die Rückmeldung benennt die zugrunde liegende Struktur.

### 90.1 Gemeinsames Modell

| Plättchen | Algebraische Bedeutung | Flächenbedeutung | Farbe im Modell |
| --- | --- | --- | --- |
| x² | ein Term zweiten Grades | Quadrat mit Seitenlänge x | Violett |
| x | ein x-Summand | Rechteck x · 1 | Blau |
| +1 | eine positive Einheit | Einheitsquadrat | Grün |
| −x | ein negatives x | Gegenrechteck | Rot |
| −1 | eine negative Einheit | negatives Einheitsquadrat | Dunkelrot |

Ein positives und ein negatives Plättchen gleicher Art bilden ein Nullpaar. In der Gleichungswaage werden Nullpaare nicht automatisch versteckt: Die lernende Person fordert ihre Entfernung ausdrücklich an und sieht dadurch, warum sich der Wert nicht ändert. Die Darstellung unterstützt den Wechsel zwischen symbolischer Schreibweise und Fläche; sie ersetzt keine verbale oder schriftliche Begründung.

Als Leitbeispiel kann `x² + 2x + 4` gelegt werden: ein x²-Quadrat, zwei x-Rechtecke und vier Einheitsquadrate. Die beiden x-Rechtecke dürfen getrennt liegen; zusammen repräsentieren sie den Koeffizienten 2. Im Quadrat-Atelier werden dieselben Streifen zusätzlich an zwei Seiten des x²-Quadrats angeordnet, damit die quadratische Ergänzung als Flächenzerlegung sichtbar wird.

### 90.2 Algebra-Bauplatz (Klasse 7)

**Datei:** `klasse-7/arithmetik-algebra/terme-legen.html`  
**Lernauftrag:** Baue einen vorgegebenen linearen Term aus x- und Einheitsplättchen und lies Koeffizient und Vorzeichen aus der Anordnung ab.  
**Spielhandlung:** Palette antippen oder ein Plättchen per Finger/Stift/Maus auf den Bauplatz ziehen; gelegte Plättchen antippen, um sie zurückzunehmen; anschließend Term prüfen.  
**Progression:** Leicht erzeugt positive Koeffizienten in kleinem Zahlenraum. Mittel und Schwer enthalten negative Koeffizienten und Gegenplättchen; die Zahlen werden schrittweise größer.  
**Diagnoseziel:** x-Plättchen mit Einheiten verwechseln, negatives Vorzeichen nur am gesamten Term statt am Summanden markieren, Koeffizient nicht als Anzahl deuten.  
**Rückmeldung:** Bei Fehlern werden x²/x/1 getrennt verglichen. Ein Hinweis erklärt die Flächenbedeutung, statt nur die Zielzahl zu verraten.

Die Auswahl **Automatisch** startet mit Leicht und wechselt erst nach mehreren selbstständig richtigen Antworten zu Mittel bzw. Schwer. So wächst der Zahlenraum aus der beobachteten Sicherheit heraus.

### 90.3 Gleichungswaage (Klasse 7)

**Datei:** `klasse-7/arithmetik-algebra/gleichungen-legen.html`  
**Lernauftrag:** Löse eine lineare Gleichung durch äquivalente Operationen auf beiden Seiten.  
**Spielhandlung:** Auf der linken und rechten Seite liegen signierte Plättchen. Die Operationspalette fügt `+1`, `−1`, `+x` oder `−x` auf beiden Seiten hinzu; `Nullpaare entfernen` macht die Gegenplättchen sichtbar rückgängig; `:2` bis `:5` teilt gleich große Gruppen. Der Lösungsweg bleibt als Liste erhalten.  
**Progression:** Leicht: `x+b=c`; Mittel: `a·x+b=c`; Schwer: `a·x+b=d·x+e` mit x-Plättchen auf beiden Seiten. Die zur Aufgabe passende Division wird nur dann erfolgreich, wenn beide Seiten in gleich große Gruppen zerfallen.  
**Beispiel:** `5x+3=2x+15` wird über `−2x`, Nullpaare, `−3`, Nullpaare und `:3` zu `x=4`.  
**Diagnoseziel:** Operation nur auf einer Seite ausführen, Nullpaare nicht als 0 erkennen, vor dem Teilen nicht vollständig vereinfachen. Die Prüfung akzeptiert keine nicht entfernten Nullpaare, auch wenn der Nettowert zufällig stimmt.

Die Auswahl **Automatisch** beginnt mit einfachen Gleichungen und erhöht die Anforderung nur bei ausreichender Trefferquote. Eine Division durch 1 wird als bereits isolierte Variable verbal erklärt und benötigt keinen künstlichen Klick.

### 90.4 Quadrat-Atelier (Klasse 8)

**Datei:** `klasse-8/arithmetik-algebra/quadratische-legen.html`  
**Spielbereiche:**

1. **Term bauen:** x²-, x- und 1-Plättchen zu einem quadratischen Term legen. Mittel und Schwer erlauben zusätzlich negative x- und Einheitsplättchen.
2. **Quadrat ergänzen:** Bei `x²+2kx+c=0` werden x-Streifen an zwei Seiten eines Quadrats ergänzt. Die fehlende Eckfläche wird als Raster sichtbar; korrekt ist ein vollständiges `(x+k)²`.
3. **Faktorisieren:** Faktorpaare werden nach Summe und Produkt geprüft und als Rechteck mit x²-, x- und 1-Flächen gezeichnet.
4. **Nullstellen lösen:** Das Rechteckmodell zeigt `(x+p)(x+q)=0`. Die lernende Person wählt beide negativen Nullstellen und begründet sie mit der Nullproduktregel.

**Progression:** Leicht nutzt kleine positive Faktorpaare und vollständige Quadrate. Mittel erhöht die Koeffizienten und lässt beim Ergänzen eine kleine Eckfläche offen. Schwer nutzt größere Werte und verlangt den Transfer vom Flächenmodell zur Nullproduktregel.  
**Diagnoseziel:** `2x` als ein doppelt großes x-Rechteck missdeuten, beim Ergänzen die x-Streifen nicht gleichmäßig verteilen, Summe und Produkt der Faktorpaare verwechseln, bei `x+p=0` die Nullstelle als `p` statt `−p` angeben.

Auch hier passt **Automatisch** den Spielbereich an die selbstständige Trefferquote an; beim Wechsel zwischen Term bauen, Ergänzen, Faktorisieren und Nullstellen lösen bleibt die gewählte Darstellung erhalten.

### 90.5 iPad- und Offline-Umsetzung

`shared/algebra-tiles.css` verwendet flexible Raster, `clamp()`-Schriftgrößen, `minmax()`-Spalten und Umbruchregeln für Hochformat, Querformat und Split View. Palette, Operationsknöpfe und Faktoren besitzen mindestens 44 CSS-Pixel hohe Touchziele; Eingabefelder werden nicht benötigt. `touch-action`, Pointer Events und `user-select` verhindern störendes Scrollen während des Ziehens. Bei schmalen Ansichten werden Bauplatz und Werkzeugpalette untereinander angeordnet; große Modelle bleiben innerhalb ihres Bereichs scrollbar.

`shared/algebra-tiles.js` enthält keine Netzwerkaufrufe und keine externe Bibliothek. Die drei Seiten sind im Service Worker enthalten. Der sichtbare Standard-Look ist Papierwelt, weil beschriftete Plättchen, Flächenzerlegungen und Rechenwege damit am ruhigsten lesbar bleiben; die gemeinsame Look-Auswahl lässt weiterhin Retro 64, Pixel-Werkstatt und Mathe-Studio zu.

### 90.6 Prüfung

- `node --check` für `shared/algebra-tiles.js` sowie alle vorhandenen gemeinsamen JavaScript-Dateien.
- VM-Prüfung der Term-, Gleichungs-, Quadrat-, Faktor- und Nullstellen-Generatoren über alle drei Stufen; Lösungen und Faktorpaare bleiben endlich und fachlich konsistent.
- Statischer Pfadcheck für die drei neuen HTML-Seiten, ihre CSS-/JS-Ressourcen, die Katalogeinträge und den Offline-Cache.
- Interaktionscode verwendet sowohl Tipp als auch Pointer-Drag; ein Browserlauf in iPadOS Safari bleibt vor dem realen Unterrichtseinsatz als praktische Prüfung erforderlich.

Die Inspiration durch virtuelle Manipulative ist dokumentiert in `QUELLEN.md`; als Referenz dient die öffentliche Plattform [Polypad – Virtual Manipulatives](https://polypad.amplify.com/). Die ausgelieferte Implementierung ist eigenständig und offline nutzbar.
