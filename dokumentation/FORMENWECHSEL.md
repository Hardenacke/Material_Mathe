# Formenwechsel – Klasse 9

Der Trainer aus `Formenwechsel_Klasse_9_Materialpaket.zip` ist unter
**Klasse 9 → Funktionen → Lernpfade** als **Formenwechsel – Trainer für Normal-
und Scheitelpunktform** eingebunden. Die fachliche Zuordnung ist
`klasse-9/02-funktionen/01-quadratische-funktionen`.

- [Trainer öffnen](../klasse-9/02-funktionen/01-quadratische-funktionen/formenwechsel-trainer.html)
- Quellen: `werkzeuge/formenwechsel/`
- Katalogeintrag: `dokumentation/MATERIAL_ZUORDNUNG.json`

## Unterricht und Betrieb

Das Material umfasst ein veränderbares Parabel-Labor mit schrittweisen
Beispielrechnungen, zehn adaptive Aufgaben, einen Abschlusscheck in beiden
Umformungsrichtungen und eine Auswertung. Ganze Zahlen, halbe Zahlen und
weitere Vorfaktoren werden entsprechend dem beobachteten Lernverlauf angeboten.
Hilfen und vollständige Rechenwege bleiben erreichbar. Eingaben mit Dezimalkomma,
Brüchen und gemischten Zahlen werden unterstützt.

KaTeX, Mathematikschriften und Lizenzhinweise sind vollständig in der HTML-Datei
enthalten. Das Training benötigt keine externen Dienste und lässt sich auch als
einzelne HTML-Datei öffnen. Fortschritt wird unter `formenwechsel-k9-v1` im
jeweiligen Browser gespeichert. Auf gemeinsam genutzten Geräten vor dem Wechsel
der Lernenden **Neu beginnen** verwenden.

Die optionale Cloudflare-/fobizz-Lernbegleitung ist nicht eingerichtet.
`werkzeuge/formenwechsel/config.public.json` enthält eine leere Worker-Adresse;
die integrierten Aufgaben und Hilfen funktionieren ohne diese Verbindung.
Die mitgelieferten Workerquellen, technischen Einrichtungsunterlagen, Tests und
Assistententexte liegen ausschließlich unter `werkzeuge/formenwechsel/` und werden
nicht auf Schülerseiten veröffentlicht. Es wurden keine externen Dienste angelegt.

## Erzeugung und Prüfung

`python werkzeuge/build_site.py` baut den Trainer vor der Katalogerzeugung aus
den Quellen neu. Anschließend übernimmt der reguläre Website-Build die HTML-Datei
nach `_site/` und ergänzt die Rücknavigation zur Materialauswahl. Änderungen am
Trainer werden in `template.html`, `app.js` und `design.css` vorgenommen.

```text
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
node werkzeuge/formenwechsel/test.cjs
node --test --test-isolation=none werkzeuge/formenwechsel/tests/client.test.mjs werkzeuge/formenwechsel/tests/feedback.test.mjs werkzeuge/formenwechsel/tests/adapter.test.mjs
.local\manim-venv\Scripts\python.exe tests/run_formenwechsel_browser.py
python -m unittest discover -s tests
```

Die Browserprüfung nutzt vorhandenes Playwright, Edge und WebKit. Sie prüft den
Katalogaufruf unter einem GitHub-Pages-Unterpfad, Rücknavigation, Parametergrenzen,
Eingabemarkierungen, Hilfen, den vollständigen Durchgang mit beiden Richtungen,
Fortsetzen nach Neuladen, Auswertung, Zusatzrunde und Neustart. Zusätzlich werden
390, 768 und 1024 Pixel breite Ansichten auf seitlichen Überlauf geprüft.
Vorschauen liegen lokal unter `.local/formenwechsel/browser/`.

Prüfstand vom 4. November 2026:

- Website-Build, Websiteprüfung und Strukturprüfung bestanden: 9 Bereiche,
  33 Inhaltsfelder, 105 Themen und 364 Materialien.
- 21 Fach-/Verlaufsprüfgruppen sowie 23 ergänzende Client-, Rückmeldungs- und
  Adaptertests bestanden. Die Fachtests rechnen 858 Aufgabenvarianten und
  5.150 Kombinationen des optionalen Aufgabenvertrags unabhängig nach.
- Vollständige Browserprüfung in Edge und WebKit bestanden, einschließlich
  der drei Bildschirmbreiten und ohne externe Ressourcenaufrufe.
- Ein Fehler des Materialpakets beim Neuladen der Auswertung oder einer
  Einführung mit bereits laufender Aufgabe wurde behoben: Die Lernbegleitung
  aktualisiert Eingabefelder nur in der Trainingsansicht.
- Von 32 allgemeinen Repositorytests bestehen 31. Der bereits zuvor dokumentierte
  Test `test_repetition_presentations` schlägt fehl, weil unter
  `klasse-9/01-arithmetik-algebra/` die Datei `wiederholung.pptx` fehlt;
  dort liegt `M 9 Irrationale Zahlen & Wurzeln.pptx`. Sie wurde nicht umbenannt.

Der optionale externe fobizz-Betrieb und ein physisches iPad sind damit nicht geprüft.
