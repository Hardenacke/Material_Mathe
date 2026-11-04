# Scheitelpunkt-Trainer – Klasse 9

Der Trainer aus `Formenwechsel_Klasse_9_Materialpaket.zip` ist unter
**Klasse 9 → Funktionen → Lernpfade** als **Scheitelpunkt-Trainer** eingebunden. Die fachliche Zuordnung ist
`klasse-9/02-funktionen/01-quadratische-funktionen`.

- [Trainer öffnen](../klasse-9/02-funktionen/01-quadratische-funktionen/scheitelpunkt-trainer.html)
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

Der von der Lehrkraft vorgegebene fobizz-Assistent ist weiterhin über
**fobizz-Lernhilfe** im Seitenfuß erreichbar.
Der Link öffnet den freigegebenen Assistenten in einem neuen Tab.
Der vorgegebene Zugang wurde aufgerufen und lieferte HTTP 200 mit dem Titel
**Adaptiver Mathematik-Tutor Klasse 9**. Es wurde keine Chatnachricht versendet.
Seine Adresse steht unter `assistantUrl` in
`werkzeuge/formenwechsel/config.public.json` und wird beim Build übernommen.
Aufgaben, Eingaben und Lernstand werden beim Öffnen nicht an den Chat übergeben;
Lernende beschreiben ihre Frage dort selbst. Es wird kein externer Inhalt beim
Starten des Trainers geladen.

Die automatische Lernbegleitung nutzt jetzt **Cloudflare Workers AI** über den
bereitgestellten Worker `https://formenwechsel-tutor.physik-wettkampf-api.workers.dev`.
Das Modell `@cf/meta/llama-3.3-70b-instruct-fp8-fast` wählt konkrete Folgeaufgaben
aus einem vom Worker geprüften Pool und gibt kurze Hinweise. Der Worker prüft
die Antwort; der Browser übernimmt Richtung, Stufe und Zahlenwerte der Auswahl.
Die Oberfläche zeigt die Rückmeldungen in der schwebenden Box **Charles**.

Charles lobt richtige Schritte, gibt konkrete Hinweise und motiviert zum
Weiterrechnen. Über **Frag Charles** können Lernende direkt in der HTML-Datei
Fragen stellen. Der Worker erhält die sichtbare Aufgabe mit Eingaben und
Rechenschritt oder das eingestellte Beispiel aus dem Parabel-Labor. Er berechnet
die dazugehörigen Rechenfakten selbst als Grundlage der generierten Erklärung.
Die Fragefunktion ändert keine Aufgabenwerte und bewertet die Lösung nicht;
die unabhängige mathematische Prüfung bleibt beim Knopf **Prüfen**.

Eine Frage zu einer offenen Aufgabe zählt als Hilfe. Reines Lob zählt nicht als
Unterstützung. Der Verlauf umfasst höchstens drei Frage-Antwort-Paare im
Tab-Arbeitsspeicher und wird bei einem neuen Beispiel, Rechenschritt, Seitenwechsel
oder Neuladen geleert. Verspätete Antworten erscheinen nicht im neuen Kontext.
Das Fragenfeld bleibt unter dem scrollbaren Verlauf sichtbar. Persönliche Angaben
werden nicht benötigt; ein kurzer Hinweis steht direkt am Fragenfeld.
Freitext und Verlauf werden an Workers AI übermittelt. Der Worker speichert
begrenzt Anfrageergebnisse für die Wiederholungssicherung bis zum Sitzungsablauf
nach sechs Stunden. Einzelheiten: `werkzeuge/formenwechsel/WORKERS_AI.md`.

Die öffentliche Worker-Adresse und der erwartete Provider `workers-ai` stehen in
`werkzeuge/formenwechsel/config.public.json`. Das Sitzungssecret liegt ausschließlich
in Cloudflare. Bei einem KI-Ausfall oder einer Kontingentgrenze übernimmt die
integrierte Aufgabensteuerung. Die bereits vorbereitete fobizz-API-Anbindung bleibt
inaktiv; der fobizz-Chat ist eine zusätzliche Lernhilfe und steuert diese KI nicht.
Technische Einrichtung, Rollenauftrag und Grenzen: `werkzeuge/formenwechsel/WORKERS_AI.md`.
Die mitgelieferten Workerquellen, technischen Einrichtungsunterlagen, Tests und
Assistententexte liegen ausschließlich unter `werkzeuge/formenwechsel/` und werden
nicht auf Schülerseiten veröffentlicht. Der Worker ist live; die aktualisierte
GitHub-Pages-Ausgabe wird erst nach einem Commit und Push veröffentlicht.

## Erzeugung und Prüfung

Die Oberfläche passt Breite und Höhe an iPad, Handy, Hoch-/Querformat und Split View
an. Die Lernbegleitung bleibt unabhängig vom Seiteninhalt am Bildschirmrand sichtbar.
Über den Pfeil wird sie zu einem kleinen Punkt eingeklappt; die berührbare Fläche
bleibt mindestens 44 Pixel groß. Ein Tipp öffnet die Box wieder. Neue Rückmeldungen
werden auch im eingeklappten Zustand am Punkt angezeigt, ohne die Box aufzudrängen.
Die gewählte Ansicht bleibt nach Neuladen erhalten und verändert keine Lernergebnisse.

Die Box berücksichtigt den sichtbaren `VisualViewport`, Bildschirmränder und
Tastaturänderungen. Bei wenig Platz erhält der Text einen eigenen Scrollbereich.
Aktive Eingabefelder werden bei Bedarf oberhalb der Box sichtbar gehalten.
Die Bedienung mit Tab, Enter und Escape sowie reduzierte Bewegung werden unterstützt.

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
.local\manim-venv\Scripts\python.exe tests/run_formenwechsel_ai_browser.py
.local\manim-venv\Scripts\python.exe tests/run_formenwechsel_mobile_browser.py
.local\manim-venv\Scripts\python.exe tests/run_charles_browser.py
.local\manim-venv\Scripts\python.exe tests/run_charles_browser.py --live
node werkzeuge/formenwechsel/scripts/check-live.mjs
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
- 21 Fach-/Verlaufsprüfgruppen sowie 65 ergänzende Client-, Rückmeldungs-,
  Provider- und Worker-Tests bestanden. Die Fachtests rechnen 858 Aufgabenvarianten und
  5.150 Kombinationen des optionalen Aufgabenvertrags unabhängig nach.
- Vollständige Browserprüfung in Edge und WebKit bestanden, einschließlich
  der drei Bildschirmbreiten und ohne externe Ressourcenaufrufe.
- Der fobizz-Link wurde in beiden Browsern mit abgefangenem Zielaufruf geprüft:
  Der neue Tab verwendet genau den konfigurierten Freigabelink und der lokale
  Lernstand bleibt erhalten. Das ist kein Test einer automatischen Chat-Anbindung.
- Ein Fehler des Materialpakets beim Neuladen der Auswertung oder einer
  Einführung mit bereits laufender Aufgabe wurde behoben: Die Lernbegleitung
  aktualisiert Eingabefelder nur in der Trainingsansicht.
- Von 32 allgemeinen Repositorytests bestehen 31. Der bereits zuvor dokumentierte
  Test `test_repetition_presentations` schlägt fehl, weil unter
  `klasse-9/01-arithmetik-algebra/` die Datei `wiederholung.pptx` fehlt;
  dort liegt `M 9 Irrationale Zahlen & Wurzeln.pptx`. Sie wurde nicht umbenannt.

Die tatsächliche Cloudflare-KI wurde mit synthetischen Antworten live geprüft:
Aufgabenwahl, Fehlerhinweis, Lob und unveränderte Übernahme der KI-Folgeaufgabe.
Im Edge-Browser wurden alle zwölf Aufgaben mit beiden Abschlussrichtungen und
24 echten KI-Antworten bearbeitet. WebKit prüfte zusätzlich die konkrete
Aufgabenauswahl und Folgewahl. Die Tests beachten das Sitzungskontingent.
Falsche Rechenschritte erhalten zusätzlich einen vom Worker vorgegebenen,
fachlich geprüften Hinweis; eine abweichende Modellantwort wird verworfen.
Der optionale externe fobizz-API-Betrieb und ein physisches iPad sind damit nicht geprüft.

Die mobile Browserprüfung testet in Edge und WebKit acht Touch-Ansichten von
320 bis 1194 Pixel Breite, darunter iPad-Hoch-/Querformat und Split View.
Geprüft werden dynamische Abmessungen, feste Position beim Scrollen, Ein-/Ausklappen,
gespeicherte Ansicht, neue Rückmeldungen am Punkt und die Anpassung an eine
simulierte Bildschirmtastatur. Dies ersetzt keinen Test auf einem physischen iPad.

Charles wurde zusätzlich in Edge und WebKit mit direkten Fragen zum Beispiel
und zur Aufgabe live geprüft, einschließlich einer freien Erklärung zu beiden
Funktionsformen. Die Gesprächsprüfung deckt Kontextwechsel, Rückfragen,
veraltete Antworten, Netzfehler, sichere Textausgabe, neue Antworten am
eingeklappten Punkt und das Leeren beim Neustart ab. Fünf Touch-Ansichten prüfen,
dass Fragenfeld und Sendeknopf auch bei wenig Platz erreichbar bleiben.
Bei häufigen Rechenfragen verhindern feste, nachgerechnete Erklärungen unter
anderem eine Verwechslung der Verschiebungsrichtungen.
