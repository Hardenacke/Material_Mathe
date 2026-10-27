# Wurzelwerk: Quiz für Klasse 9

Die Vorlage `Wurzelwerk_Quiz_Klasse_9 (1).html` wurde in das Themenfeld
**Klasse 9 → Arithmetik/Algebra → Reelle Zahlen, Quadratwurzeln und Irrationalität**
übernommen. Die Materialart lautet **Quiz**. Auf der Klassenübersicht gibt es
zusätzlich einen direkten Einstieg **Quiz**; die fachliche Sollstruktur bleibt unverändert.

Quelle im Repository:
`klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk/index.html`.

## Online-Wettbewerb

[Wurzelwerk auf Cloudflare öffnen](https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev/klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk/)

Im Reiter **Wettbewerb** direkt **Wettbewerb starten** auswählen. Ein Pseudonym kann
optional eingetragen werden; sonst wird automatisch eines vergeben. Die Verbindung
zu Cloudflare entsteht automatisch. Lernende benötigen weder einen Zugangscode
noch ein Benutzerkonto.

Eine zufällige Browserkennung wird automatisch lokal gespeichert. So bleiben
Wiederaufnahme und persönliche Bestwerte im selben Browser zugeordnet. Ein anderer
Browser oder das Löschen der Browserdaten erzeugt eine neue Zuordnung. Auf gemeinsam
genutzten Geräten legt **Andere Person** eine neue Zuordnung an und erhält die
bisherigen Ergebnisse. Bestehende, früher eingerichtete Zugänge bleiben im Backend nutzbar.
Wettbewerbskennung: `wurzelwerk-klasse-9`.

Die Runde umfasst zwölf Aufgaben auf Stufe 3: je vier zum Ziehen von Quadratwurzeln,
zu Wurzelgesetzen und zum Zahlenstrahl. Wie in der Vorlage gibt es kein Zeitlimit.
Richtige Ergebnisse geben 100 Punkte, beim Zahlenstrahl sind auch 70 oder 40 Punkte
für Annäherungen möglich. Maximal sind 1.200 Punkte erreichbar. Es zählt der persönliche
Bestwert; die Rangliste wird zwischen Geräten geteilt.

Cloudflare erzeugt und speichert jede Aufgabe. Der Browser erhält die aktuelle
Aufgabe ohne Lösungsfelder; Auswertung und Erklärung kommen nach der Antwort vom
Server. Manipulierte Punktestände werden nicht angenommen. Automatisch eingerichtete
Browserprofile, ein aktiver Versuch je Profil, transaktionale Speicherung und
Idempotenzbelege schützen vor fremden Zugriffen und doppelten Wertungen.

Der SQLite-Durable-Object-Raum `QuizRoom` wird mit Migration `v2-wurzelwerk` ergänzt.
Bestehende Wettbewerbsräume bleiben eigenständig. Der vorhandene `ArchiveWriter`
schreibt die Bestwertliste nach
`ergebnisse/snapshots/wurzelwerk-klasse-9/v1/gesamt/latest.json` im Repository
`Hardenacke/Material_Mathe`. Die Speicherung eines echten Testlaufs wurde bestätigt.
Der Archivauftrag bleibt bei einem Ausfall dauerhaft vorgemerkt; der Spielbetrieb
verwendet den Cloudflare-Speicher.

## Training und Veröffentlichung

Das Training behält alle drei Themen und Schwierigkeitsstufen sowie die Zahlenstrahl-
Bedienung bei. Jede Trainingsrunde hat zehn Aufgaben. Trainingsergebnisse gehen nicht
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
`python werkzeuge/wurzelwerk_importieren.py PFAD-ZUR-VORLAGE`. Die Ergänzungen zur
Cloudflare-Verbindung werden aus `werkzeuge/wurzelwerk_cloudflare.js` übernommen.
Den Import vor erneuten eigenen Änderungen an der generierten Quizdatei bewusst ausführen.

## Prüfung am 27. Oktober 2026

- 38 Regeltests und 17 Integrationstests bestanden, einschließlich codefreier Teilnahme, Serverbewertung,
  fremder Versuche, manipulierter Nutzdaten und idempotenter Antworten.
- Training in allen neun Kombinationen aus Thema und Schwierigkeitsstufe geprüft.
- Vollständiger Wettbewerb mit zwölf richtigen Antworten und 1.200 Punkten,
  Wiederaufnahme und Offline/Online-Wechsel im Edge-Browser geprüft.
- Codefreie Teilnahme mit optionalem Pseudonym, automatischer Wiederverbindung,
  Start ohne Namenseingabe und Wechsel über **Andere Person** im Browser geprüft.
- 320, 390, 768 und 1024 Pixel ohne horizontalen Überlauf; kein JavaScript-Fehler.
- Pages-Vorschau: Klasse 9 → Quiz → Wurzelwerk, Materiallabel und lokale Formeln geprüft.
- Gesamte Materialnavigation: 974 Prüfungen bestanden.
- Website- und Strukturprüfung: 9 Bereiche, 33 Inhaltsfelder, 105 Themen, 323 Materialien.

Die Online-Prüfung und Screenshots liegen unter `.local/wettkaempfe/wurzelwerk-*`;
`wurzelwerk_codefrei_browser.py` dokumentiert die Teilnahme ohne Code.
