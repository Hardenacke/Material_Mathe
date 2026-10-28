# 24 Mathematik-Quizze für die Sekundarstufe I

Die Quizze aus `Mathematik_SekI_24_Interaktive_Quizze(2).zip` sind für die Klassen 5 bis 10 in den vier vorhandenen Inhaltsfeldern abgelegt. Der Einstieg in der Materialsammlung lautet **Klasse → Themenbereich → Quiz**. Da jedes Quiz mehrere Aufgabentypen und Themen umfasst, erfolgt die Zuordnung auf Inhaltsfeldebene. Die fachliche Sollstruktur bleibt unverändert.

Jedes Quiz hat eine eigene Kennung, Wettbewerbsrunde und Rangliste. Ein gemeinsamer Cloudflare-Worker stellt die 24 Verbindungen bereit. SQLite-basierte Durable Objects speichern aktive Runden und Fristen; D1 speichert die Bestwerte je Quiz, Browserprofil und Wertungsversion. Die öffentliche Rangliste enthält ausschließlich Pseudonym, Klasse, Punkte, Datum und Rang. Training, Profile und Lernstand bleiben lokal im Browser.

## Zugänge

- [Alle 24 Quizze bei Cloudflare](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/)
- [Verbindungsprüfung](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/api/v1/status)
- [QuizÜbersicht in der lokalen Materialsammlung](../gemeinsam/quiz-seki/assets/index.html)
- [Alle Zuordnungen und Kennungen als JSON](QUIZ_SEKI_ZUORDNUNG.json)

| Klasse | Arithmetik/Algebra | Funktionen | Geometrie | Stochastik |
|---|---|---|---|---|
| 5 | [5-arithmetik-algebra](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-5/01-arithmetik-algebra/quiz/mathe-quest/index.html) | [5-funktionen](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-5/02-funktionen/quiz/mathe-quest/index.html) | [5-geometrie](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-5/03-geometrie/quiz/mathe-quest/index.html) | [5-stochastik](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-5/04-stochastik/quiz/mathe-quest/index.html) |
| 6 | [6-arithmetik-algebra](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-6/01-arithmetik-algebra/quiz/mathe-quest/index.html) | [6-funktionen](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-6/02-funktionen/quiz/mathe-quest/index.html) | [6-geometrie](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-6/03-geometrie/quiz/mathe-quest/index.html) | [6-stochastik](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-6/04-stochastik/quiz/mathe-quest/index.html) |
| 7 | [7-arithmetik-algebra](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-7/01-arithmetik-algebra/quiz/mathe-quest/index.html) | [7-funktionen](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-7/02-funktionen/quiz/mathe-quest/index.html) | [7-geometrie](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-7/03-geometrie/quiz/mathe-quest/index.html) | [7-stochastik](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-7/04-stochastik/quiz/mathe-quest/index.html) |
| 8 | [8-arithmetik-algebra](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-8/01-arithmetik-algebra/quiz/mathe-quest/index.html) | [8-funktionen](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-8/02-funktionen/quiz/mathe-quest/index.html) | [8-geometrie](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-8/03-geometrie/quiz/mathe-quest/index.html) | [8-stochastik](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-8/04-stochastik/quiz/mathe-quest/index.html) |
| 9 | [9-arithmetik-algebra](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-9/01-arithmetik-algebra/quiz/mathe-quest/index.html) | [9-funktionen](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-9/02-funktionen/quiz/mathe-quest/index.html) | [9-geometrie](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-9/03-geometrie/quiz/mathe-quest/index.html) | [9-stochastik](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-9/04-stochastik/quiz/mathe-quest/index.html) |
| 10 | [10-arithmetik-algebra](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-10/01-arithmetik-algebra/quiz/mathe-quest/index.html) | [10-funktionen](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-10/02-funktionen/quiz/mathe-quest/index.html) | [10-geometrie](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-10/03-geometrie/quiz/mathe-quest/index.html) | [10-stochastik](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev/klasse-10/04-stochastik/quiz/mathe-quest/index.html) |

Die jeweilige Seite `rangliste.html` im Quizordner zeigt getrennt die Trainingsbestwerte dieses Geräts und die Online-Wettbewerbsrangliste. Aufrufe der Online-Rangliste enthalten immer `quizId` und die passende Klassenstufe.

Pro Browserkennung, Quiz und Wertungsversion wird der persönliche Bestwert gespeichert. Jede abgeschlossene Wettbewerbsrunde wird dafür ausgewertet: Ein besseres Ergebnis ersetzt den bisherigen Bestwert; ein niedrigeres Ergebnis lässt ihn erhalten. Die Rangliste führt damit einen Bestwerteintrag je Teilnahmeprofil und Quiz. Eine vollständige Historie sämtlicher Einzelrunden wird aktuell nicht geführt.

## Quelldateien

- `klasse-N/0N-inhaltsfeld/quiz/mathe-quest/`: Quiz, Rangliste, eigenes PWA-Manifest und auf diesen Quizordner begrenzter Service Worker.
- `gemeinsam/quiz-seki/assets/`: Übersicht, Lernstand, zentrale Cloudflare-Konfiguration, Offline-Logik, Layoutkorrekturen und ein gemeinsamer lokaler KaTeX-Satz mit Lizenz.
- `dokumentation/MATERIAL_ZUORDNUNG.json`: Registrierung aller 24 Quizze als Materialart `Quiz`.
- `werkzeuge/seki_quiz_backend/`: Worker, D1-Schema, Konfiguration sowie Regel- und Integrationstests. Dieser Ordner wird nicht nach `_site/` kopiert.
- `werkzeuge/seki_quiz_vorbereiten.py`: reproduzierbare Zusammenstellung des Workers und seiner öffentlichen Quizdateien unter `.local/seki-quiz/worker/`.

## Aktualisieren und prüfen

Nach Änderungen an den Materialquellen im Repository-Stamm ausführen:

```text
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
python werkzeuge/seki_quiz_vorbereiten.py
```

Der vorbereitete Worker benötigt Node.js ab Version 24. Im Ordner `.local/seki-quiz/worker/`:

```text
npm ci
npm test
npm run test:integration
npm run deploy:check
```

Für die lokale Vorschau zunächst `npx wrangler d1 migrations apply mathematik-seki-leaderboard --local`, anschließend `npm run dev` ausführen. Der Dienst verwendet Port 8788; die Quizkonfiguration erkennt ihn und spricht seine lokale API an. Eine lokale Datenbank und lokale Runden verändern keine Online-Ergebnisse.

```text
python tests/run_quiz_seki_browser.py
```

Die Browserprüfung benötigt Playwright und Edge. Sie prüft alle 24 Verbindungen, drei Trainingsstufen, schmale Bildschirmbreiten, eine Trainingsrunde, lokale Rangliste, Lernstand, Offline-Training und eine vollständige lokale Wettbewerbsrunde mit Wiederaufnahme. Mit `--url https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev --smoke` werden die veröffentlichten Startseiten und Ranglisten gelesen, ohne Online-Testergebnisse zu erzeugen.

Für eine autorisierte Aktualisierung bei Cloudflare wird im vorbereiteten Worker `npm run deploy` ausgeführt. Falls eine neue D1-Migration hinzukommt, ist sie zuvor mit `npx wrangler d1 migrations apply mathematik-seki-leaderboard --remote` anzuwenden. Zugangsdaten bleiben in der vorhandenen Wrangler-Anmeldung; sie gehören weder in den Quellcode noch in öffentliche Assets.

Die Materialsammlung auf GitHub Pages erhält die neuen Karten nach einem ausdrücklich autorisierten Push. Die Cloudflare-Quizoberflächen können unabhängig davon bereitgestellt werden.

## Korrekturen gegenüber der ZIP-Vorlage

- Koordinateneingabe zum Setzen von Konstruktionspunkten repariert.
- Antworttext und Rückmeldung umbrechen auf schmalen Bildschirmen.
- Die Lernstandsübersicht hängt die gespeicherten Kompetenzen und Runden korrekt in ihre Tabellen ein.
- Serverbewertung lehnt leere oder ungeeignete Antwortwerte ab; der Zeitbonus ist auf 50 Punkte begrenzt.
- Bruchauswahl im Wettbewerb enthält genau eine mathematisch richtige Option; Zielwerte am Zahlenstrahl liegen im vorgesehenen Intervall.
- Ein Funktionsterm wird auch in der wiederholten Funktionswertaufgabe angezeigt.
- Parallele Anfragen werden im Rundenobjekt serialisiert. Wiederholte Antworten und wiederholtes Laden der nächsten Aufgabe vergeben keine zusätzlichen Punkte und überspringen keine Aufgaben.
- Bereits laufende Runden übernehmen beim erneuten Start Position und Punktestand vom Server. Fehlgeschlagene Bestwertspeicherung wird über einen dauerhaften Alarm erneut versucht.
- Ranglisten verschiedener Wertungsversionen bleiben getrennt; API-Antworten werden nicht zwischengespeichert.
- Offline-Caches und Service-Worker-Geltungsbereiche bleiben auf die Quizangebote begrenzt.

Die Durable-Object- und D1-Konfiguration folgt der [Cloudflare-Wrangler-Dokumentation](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Prüfstand vom 28. Oktober 2026

- Cloudflare-Worker bereitgestellt, Version `d367e353-4bcb-4196-9c9d-0a193879be70`.
- Alle 24 Online-Starts, Wiederaufnahmen und getrennten Ranglisten geprüft; Zugriffe von GitHub Pages sind erlaubt. Diese Verbindungsproben erzeugen keine Ranglistenergebnisse.
- 24 vollständige Wettbewerbe mit insgesamt 288 Aufgaben gegen eine echte lokale Cloudflare-Laufzeit geprüft, einschließlich paralleler Wiederholungen, Neustart des Rundenobjekts und getrennter D1-Wertungsversionen.
- 360 generierte Aufgaben, vier zusätzliche Regel- und Eingabeprüfungen sowie vier Python-Prüfungen für Ablage, Links und Veröffentlichung erfolgreich.
- Im Browser 72 Kombinationen aus Quiz und Trainingsstufe bei 320 und 768 Pixeln, eine vollständige Trainingsrunde, Lernstand, Offline-Training und ein vollständiger Wettbewerb mit Wiederaufnahme erfolgreich. Alle 24 veröffentlichten Oberflächen und Ranglisten zusätzlich online geprüft.
- Website- und Strukturprüfung erfolgreich: 9 Bereiche, 33 Inhaltsfelder, 105 Themen und 347 Materialien. Gesamte Materialnavigation: 1.020 Prüfungen erfolgreich.
- Von 25 Python-Repository-Tests bestehen 24. Der bestehende Präsentationstest schlägt fehl, weil `klasse-9/01-arithmetik-algebra/wiederholung.pptx` fehlt. Ebenfalls bereits nicht vorhanden ist `ef/03-stochastik/wiederholung.pptx`; die Quizintegration verändert keine Präsentationen.
- Die lokalen Änderungen einschließlich des erzeugten Website-Builds sind nicht committed oder gepusht. GitHub Pages wird erst nach einem ausdrücklich beauftragten Push aktualisiert.

## Zusätzliche Prüfung der Ranglistentrennung

Am 28. Oktober 2026 wurden alle 24 Wettbewerbe zusätzlich gegen den veröffentlichten Cloudflare-Dienst vollständig abgeschlossen. Eine eigens erzeugte zufällige Browserkennung nahm an allen Quizzen teil; jedes Quiz verwendete einen eindeutig zugeordneten Testnamen. Für diese Speicherprüfung wurden jeweils zwölf leere Antworten mit null Punkten bewertet.

- Alle 24 Ergebnisse erschienen ausschließlich auf der Rangliste ihres Quiz und der passenden Klasse. Direkte D1-Abfragen bestätigten genau einen gespeicherten Testeintrag je Quizkennung unter Wertungsversion `v1`.
- Antwortanfragen mit der Kennung eines anderen Quiz wurden bei allen 24 Wettbewerben abgewiesen. Doppelte Antworten erzeugten keine zusätzlichen Wertungen.
- Abgeschlossene Runden ließen sich mit unverändertem Ergebnis wieder abrufen.
- Die 24 Testeinträge wurden anschließend anhand der ausschließlich für diese Prüfung verwendeten Browserkennung und der Testnamen entfernt. Danach wurden alle Ranglisten erneut mit ihrem Ausgangszustand verglichen.
- Zusätzliche lokale Integrationstests prüfen mit positiven, unterschiedlichen Punktständen, dass ein niedrigerer Wiederholungsversuch den Bestwert erhält und ein höherer Versuch ausschließlich den Bestwert desselben Quiz verbessert. Andere Quizze, Teilnehmende und Wertungsversionen bleiben dabei unverändert.
- Ein zusätzlicher Python-Test prüft die Quiz- und Klassenkennung sowie die getrennten lokalen Trainingsspeicher aller 24 Ranglistenseiten.

Die Prüfung erforderte keine Änderung an der produktiven Speicherlogik. Die ausführlichen lokalen Prüfbelege liegen unter `.local/seki-quiz/leaderboard-verification/`; sie werden nicht veröffentlicht.
