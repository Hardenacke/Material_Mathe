# Wurzelwerk: Quiz für Klasse 9

Die Vorlage `Wurzelwerk_Quiz_Klasse_9 (1).html` wurde in das Themenfeld
**Klasse 9 → Arithmetik/Algebra → Reelle Zahlen, Quadratwurzeln und Irrationalität**
übernommen. Die Materialart lautet **Quiz**. Auf der Klassenübersicht gibt es
zusätzlich einen direkten Einstieg **Quiz**; die fachliche Sollstruktur bleibt unverändert.

Quelle im Repository:
`klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk/index.html`.

## Online-Wettbewerb

[Wurzelwerk auf Cloudflare öffnen](https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev/klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk/)

Auf der Startseite **Wettbewerb spielen** und anschließend **Wettbewerb starten** auswählen. Ein Pseudonym kann
optional eingetragen werden; sonst wird automatisch eines vergeben. Die Verbindung
zu Cloudflare entsteht automatisch. Lernende benötigen weder einen Zugangscode
noch ein Benutzerkonto.

Eine zufällige Browserkennung wird automatisch lokal gespeichert. So bleiben
Wiederaufnahme und persönliche Bestwerte im selben Browser zugeordnet. Ein anderer
Browser oder das Löschen der Browserdaten erzeugt eine neue Zuordnung. Auf gemeinsam
genutzten Geräten legt **Andere Person** eine neue Zuordnung an und erhält die
bisherigen Ergebnisse. Bestehende, früher eingerichtete Zugänge bleiben im Backend nutzbar.
Wettbewerbskennung: `wurzelwerk-klasse-9`.

Die neue Zeitwertung (Version 2) umfasst zwölf mittelschwere Aufgaben: je vier zum
Ziehen von Quadratwurzeln, zu Wurzelgesetzen und zum Zahlenstrahl. Wurzeln stammen
aus Quadratzahlen von 25 bis 400; beim Vereinfachen liegen die Faktoren zwischen
2 und 6. Produkte verwenden Radikanden bis 80, Quotienten bis 180. Beim Zahlenstrahl
liegen die Radikanden zwischen 5 und 60. Die Werte sind gezielt kleiner als im früheren Challenge-Modus.

Jede Aufgabe hat **60 Sekunden**. Eine vollständig richtige Antwort gibt
**100 Grundpunkte + bis zu 50 Zeitbonuspunkte**. Der Bonus sinkt linear mit der
verstrichenen Serverzeit; nach 30 Sekunden gibt es noch 25 Bonuspunkte.
Annäherungen am Zahlenstrahl geben 70 oder 40 Grundpunkte ohne Zeitbonus.
Nach Ablauf der Frist zählt die Aufgabe null Punkte. Maximal sind 1.800 Punkte
erreichbar. Die Erklärung kann zwischen den Aufgaben ohne Zeitdruck gelesen werden;
die nächste Frist beginnt erst beim Öffnen der nächsten Aufgabe.

Ein Countdown zeigt die Aufgabenzeit, eine zweite Uhr die gesamte Rundenzeit.
Neuladen, Tabwechsel und eine unterbrochene Verbindung setzen die Serverfrist nicht
zurück. Durable-Object-Alarme bewerten abgelaufene Aufgaben auch ohne Browseranfrage.
Es zählt der persönliche Bestwert; die Rangliste wird zwischen Geräten geteilt.
Die bisherige unbefristete Wertung bleibt separat unter Version 1 erhalten.

Cloudflare erzeugt und speichert jede Aufgabe. Der Browser erhält die aktuelle
Aufgabe ohne Lösungsfelder; Auswertung und Erklärung kommen nach der Antwort vom
Server. Manipulierte Punktestände werden nicht angenommen. Automatisch eingerichtete
Browserprofile, ein aktiver Versuch je Profil, transaktionale Speicherung und
Idempotenzbelege schützen vor fremden Zugriffen und doppelten Wertungen.

Der SQLite-Durable-Object-Raum `QuizRoom` wird mit Migration `v2-wurzelwerk` ergänzt.
Bestehende Wettbewerbsräume bleiben eigenständig. Der vorhandene `ArchiveWriter`
schreibt die Bestwertliste nach
`ergebnisse/snapshots/wurzelwerk-klasse-9/v2/gesamt/latest.json` im Repository
`Hardenacke/Material_Mathe`. Die Speicherung eines echten Testlaufs wurde bestätigt.
Der Archivauftrag bleibt bei einem Ausfall dauerhaft vorgemerkt; der Spielbetrieb
verwendet den Cloudflare-Speicher.

## Training und Veröffentlichung

Die Oberfläche hat eigene, verlinkbare Ansichten für Start, Trainings-Thema,
Trainings-Stufe, Wettbewerbsvorbereitung, Aufgabe, Ergebnis und Rangliste. Während
einer Aufgabe ist keine Rangliste sichtbar. Große Zahlentasten und eine sichtbare
Löschtaste vereinfachen die Eingabe; eine echte Tastatur und Enter bleiben nutzbar.
Beim Vereinfachen sind Faktor und Rest getrennt beschriftet. Für Schätzungen gibt
es einen Regler und ein Zahlenfeld. Eingaben bleiben bei automatischen Abfragen,
Wiederaufnahme und Neuladen erhalten.

Das Training behält alle drei Themen und Schwierigkeitsstufen bei und bleibt ohne
Timer. Jede Trainingsrunde hat zehn Aufgaben. Trainingsergebnisse gehen nicht
in die Wettbewerbsrangliste ein. KaTeX und Fonts kommen aus dem lokalen Materialpaket;
eine CDN-Verbindung ist nicht erforderlich.

Der Website-Build erzeugt die Quiz-Kategorie und Links für GitHub Pages. Der Einstieg
ist `index.html#/klasse-9/kursmaterial/quiz`, zusätzlich ist das Material unter
`index.html#/klasse-9/01-arithmetik-algebra/quiz` erreichbar. Der Pages-Stand wird
erst nach einem ausdrücklich autorisierten Git-Push veröffentlicht.

Der Cloudflare-Worker liefert bereits dieselbe Quizoberfläche aus. Seine öffentlichen
Assets werden durch `werkzeuge/wettkampf_vorbereiten.py` aus den Materialquellen
vorbereitet. Private Codes und Serverzustände gehören nicht in diese Assets.

Die erneute Übernahme der ursprünglichen Vorlage erfolgt mit
`python werkzeuge/wurzelwerk_importieren.py PFAD-ZUR-VORLAGE`. Die Oberfläche stammt
aus `werkzeuge/wurzelwerk_vorlage.html`, `werkzeuge/wurzelwerk_ui.css` und
`werkzeuge/wurzelwerk_app.mjs`. Die mittelschweren Wettbewerbsaufgaben und die
Bonusregeln stehen in `werkzeuge/wettkampf_backend/src/wurzelwerk-competition.mjs`.
Den Import vor erneuten eigenen Änderungen an der generierten Quizdatei bewusst ausführen.

## Prüfung am 27. Oktober 2026

- 40 Regeltests und 18 Integrationstests bestanden, einschließlich Zeitbonus, dauerhaften Fristen, codefreier Teilnahme, Serverbewertung,
  fremder Versuche, manipulierter Nutzdaten und idempotenter Antworten.
- Training in allen neun Kombinationen aus Thema und Schwierigkeitsstufe geprüft.
- Vollständiger Wettbewerb mit zwölf richtigen Antworten, 1.200 Grundpunkten und zusätzlichem Zeitbonus,
  Wiederaufnahme und Offline/Online-Wechsel im Edge-Browser geprüft.
- Codefreie Teilnahme mit optionalem Pseudonym, automatischer Wiederverbindung,
  Start ohne Namenseingabe und Wechsel über **Andere Person** im Browser geprüft.
- 320, 390, 768 und 1024 Pixel ohne horizontalen Überlauf; kein JavaScript-Fehler.
- Pages-Vorschau: Klasse 9 → Quiz → Wurzelwerk, getrennte Ansichten, Materiallabel und lokale Formeln geprüft.
- Gesamte Materialnavigation: 974 Prüfungen bestanden.
- Website- und Strukturprüfung: 9 Bereiche, 33 Inhaltsfelder, 105 Themen, 323 Materialien.

Die aktuelle Browserprüfung lautet `tests/run_wurzelwerk_browser.py`; mit
`--timeout-test` wird zusätzlich ein echter 60-Sekunden-Zeitablauf geprüft.
Screenshots der neuen Ansichten liegen unter `.local/wurzelwerk-ui/`.
