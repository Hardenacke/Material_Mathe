# Quadratische Funktionen – Materialpaket für Klasse 9

Importiert am 27. Oktober 2026 aus
`Materialpaket_Quadratische_Funktionen_Klasse_9_NRW.zip`.

## Einstieg in der Materialsammlung

- **Klasse 9 → Funktionen → Lernpfade:** Reihenübersicht und elf Lernpfade zu
  Funktionen, Nullstellen und Modellierung.
- **Klasse 9 → Arithmetik/Algebra → Lernpfade:** Lernpfad 8 zu quadratischen Gleichungen.
- **Klasse 9 → Funktionen → Erklärvideos:** drei Videos zur quadratischen Ergänzung.
- Lernpfad 6 verlinkt zusätzlich direkt auf die Erklärvideos.

Die Lernreihe startet unter
`klasse-9/02-funktionen/01-quadratische-funktionen/lernpfad-quadratische-funktionen/index.html`.
Die Videoseite liegt daneben als `quadratische-ergaenzung-videos.html`.

## Übernommene Materialien

| Material | Umfang und Ablage |
| --- | --- |
| Interaktive Lernreihe | Übersicht und zwölf eigenständige HTML-Lernpfade im gemeinsamen Reihenordner |
| H5P-Quizze | Zwölf `.h5p`-Dateien unter `lernpfad-quadratische-funktionen/h5p/`; zusätzlich unverändert in den Lernpfaden als Downloads eingebettet |
| Erklärvideos | Drei unverändert übernommene MP4s unter `assets/quadratische-ergaenzung/videos/` |
| Videovorschauen | Drei aus den MP4s erzeugte JPG-Vorschaubilder unter `assets/quadratische-ergaenzung/poster/` |
| H5P-Hypervideo | Beispielrechnung mit drei pausierenden Lückentextfragen unter `assets/quadratische-ergaenzung/h5p/` |
| Manim- und H5P-Quellen | `werkzeuge/manim/quadratische-ergaenzung/`; werden nicht nach `_site/` kopiert |
| Lehrkraftpaket | Vollständig und unverändert unter `.local/quadratische-funktionen/lehrkraftpaket/`, zusätzlich als `Lehrkraftpaket_Quadratische_Funktionen.zip` im übergeordneten Ordner |

Lehrkraftstart, Reihenplanung, Musterlösungen und ursprüngliche Qualitätsberichte
werden nicht in die öffentliche Schüleransicht übernommen. Die lokale ZIP enthält
den vollständigen Lehrkraftordner mit allen benötigten relativen Dateien.

Die Einzeldateien der Reihe bleiben zusammen, damit Übersicht, Vor-/Zurück-Links,
eingebettete Downloads und Bearbeitungsmarkierungen erhalten bleiben. Ihre
fachliche Katalogzuordnung wird über `MATERIAL_ZUORDNUNG.json` festgelegt:

| Inhaltsfeld / Thema | Materialien |
| --- | --- |
| Funktionen / Quadratische Funktionen | Übersicht, Lernpfade 1–6 und Videoseite |
| Funktionen / Nullstellen und Modellierung | Lernpfade 7 und 9–12 |
| Arithmetik/Algebra / Quadratische Gleichungen | Lernpfad 8 |

Der Katalog prüft Zielthemen, Dateipfade und doppelte Zuordnungen. Jede der 14
neuen Materialkarten erscheint genau einmal. Die technische Ablage von Videos,
Postern, H5P-Dateien und Lizenz erzeugt keine zusätzlichen Materialkarten.
`data.json` und `_site/` werden weiterhin ausschließlich durch den Build erzeugt.

## Anpassungen beim Import

- Lernpfad 6 erhält einen Link zur ergänzten Videoseite.
- Kopfzeile und Fortschrittsanzeige können auf kleinen Displays umbrechen.
- Schmale Rasterspalten dürfen schrumpfen; Tabellen scrollen innerhalb ihres
  eigenen Containers. Lange Überschriften und H5P-Downloadtexte laufen nicht über.
- Die Layoutkorrekturen stehen in `assets/integration.css` und sind zusätzlich
  in allen 13 HTML-Dateien eingebettet. Die Lernpfade bleiben dadurch eigenständig
  und ohne externe Laufzeitabhängigkeiten verwendbar.
- Aufgaben, mathematische Rückmeldungen, Bearbeitungskennungen und eingebettete
  H5P-Quizze wurden beibehalten. Bestehende Repository-Materialien wurden nicht verschoben.

Die drei Videos wurden vollständig mit FFmpeg decodiert und unverändert übernommen.
Auflösung: 1280 × 720, H.264, 30 Bilder pro Sekunde, ohne Tonspur. Text und Formeln
stehen im Bild. Laufzeiten: 17,70 s, 23,60 s und etwa 16,17 s.
SHA-256-Prüfsummen und Videodaten stehen in `assets/quadratische-ergaenzung/render-info.json`.

## Erneuter Import und Bearbeitung

Aus dem Repository-Stamm:

```powershell
python werkzeuge/quadratische_funktionen_importieren.py "C:\Users\johar\Downloads\Materialpaket_Quadratische_Funktionen_Klasse_9_NRW.zip"
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
```

Der Import aktualisiert die zugehörigen neuen Materialdateien aus dem ZIP und
wird nicht automatisch beim Website-Build ausgeführt. Vorhandene Änderungen an
diesen importierten Lernpfaden vorher sichern. Die CSS-Anpassung und die separate
Videoseite bleiben erhalten; andere Einträge in `MATERIAL_ZUORDNUNG.json` bleiben bestehen.
Die bereits erzeugten Poster und Videoprüfdaten werden beim erneuten Import nicht verändert.
Bei Austausch der Videos deshalb auch diese Dateien neu erzeugen und prüfen.

## Prüfung

- Website-Build sowie Website- und Strukturprüfung erfolgreich: **322 Materialien,
  9 Bereiche, 33 Inhaltsfelder, 105 Themen**.
- Fünf neue Unittests prüfen eindeutige Zuordnung, fehlerhafte und doppelte
  Definitionen, eingebettete H5P-Downloads, Hypervideo und Veröffentlichungstrennung.
- Alle zwölf Lernpfade in Edge/Chromium geprüft: passende Eingaben und Rückmeldungen,
  negative Rückmeldung, Regler einschließlich `a = 0`, drei Lösungsverfahren,
  Bearbeitungsmarkierung nach Neuladen und Navigation.
- Lernpfade und Videoseite bei **320, 390, 768 und 1024 Pixeln** ohne horizontalen
  Seitenüberlauf geprüft. Die direkte lokale Dateinutzung wurde ebenfalls geprüft.
- Alle drei Videos laden und spielen ab. Keine JavaScript-Fehler und keine
  externen Netzwerkanfragen im Browserablauf.
- Bestehender Navigationstest: **972 Prüfungen bestanden**, 295 unterschiedliche
  Mathematikmaterialien erreichbar, einschließlich Rückwegen und Methoden.
- Allgemeiner Repository-Testlauf: **16 von 17 Tests bestanden**. Der bereits
  vorhandene Test für `klasse-9/01-arithmetik-algebra/wiederholung.pptx` schlägt
  weiterhin fehl, weil im vorhandenen Git-Stand dort
  `M 9 Irrationale Zahlen & Wurzeln.pptx` liegt. Diese Datei blieb unverändert.

Die Browserprüfung lässt sich mit einer vorhandenen Playwright-/Edge-Umgebung
wiederholen:

```text
python tests/run_quadratische_funktionen_browser.py
python -m unittest discover -s tests
python tests/run_navigation_browser.py
```

Vorschauen liegen lokal unter `.local/quadratische-funktionen/`.
H5P-Dateien sind Importpakete für ein H5P-fähiges System; ein tatsächlicher
LMS-Import und Tests auf einem physischen iPad mit Safari/VoiceOver wurden nicht durchgeführt.
