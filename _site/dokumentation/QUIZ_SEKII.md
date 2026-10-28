# 15 Mathematik-Quizwelten für die Sekundarstufe II

Die Quizze aus `Mathematik_SekII_15_Interaktive_Quizwelten.zip` sind als Materialart **Quiz** den bestehenden Inhaltsfeldern zugeordnet. Drei gemeinsame EF-Quizze und jeweils sechs Q1- und Q2-Quizze decken Analysis, analytische Geometrie und Stochastik ab. In der Qualifikationsphase sind GK und LK getrennt.

In der Materialsammlung führt der Weg über **Kurs → Themenbereich → Quiz**. Q1 und Q2 besitzen eigenständige Karten innerhalb des bestehenden Q1/Q2-Grundkurs- beziehungsweise Leistungskursbereichs. Die Sollstruktur mit 9 Bereichen, 33 Inhaltsfeldern und 105 Themen bleibt erhalten.

## Zugänge

- [Alle 15 Quizwelten auf Cloudflare](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/)
- [Verbindungsprüfung](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/api/v1/status)
- [Lokale Quizübersicht](../gemeinsam/quiz-sekii/assets/index.html)
- [Alle Zuordnungen und Quizkennungen](QUIZ_SEKII_ZUORDNUNG.json)

| Kurs | Funktionen und Analysis | Analytische Geometrie | Stochastik |
|---|---|---|---|
| EF | [ef-analysis](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/ef/01-funktionen-und-analysis/quiz/mathe-quest/index.html) | [ef-geometrie](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/ef/02-analytische-geometrie-und-lineare-algebra/quiz/mathe-quest/index.html) | [ef-stochastik](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/ef/03-stochastik/quiz/mathe-quest/index.html) |
| Q1 GK | [q1-analysis-gk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-grundkurs/01-funktionen-und-analysis/quiz/mathe-quest-q1/index.html) | [q1-geometrie-gk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-grundkurs/02-analytische-geometrie-und-lineare-algebra/quiz/mathe-quest-q1/index.html) | [q1-stochastik-gk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-grundkurs/03-stochastik/quiz/mathe-quest-q1/index.html) |
| Q1 LK | [q1-analysis-lk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-leistungskurs/01-funktionen-und-analysis/quiz/mathe-quest-q1/index.html) | [q1-geometrie-lk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-leistungskurs/02-analytische-geometrie-und-lineare-algebra/quiz/mathe-quest-q1/index.html) | [q1-stochastik-lk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-leistungskurs/03-stochastik/quiz/mathe-quest-q1/index.html) |
| Q2 GK | [q2-analysis-gk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-grundkurs/01-funktionen-und-analysis/quiz/mathe-quest-q2/index.html) | [q2-geometrie-gk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-grundkurs/02-analytische-geometrie-und-lineare-algebra/quiz/mathe-quest-q2/index.html) | [q2-stochastik-gk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-grundkurs/03-stochastik/quiz/mathe-quest-q2/index.html) |
| Q2 LK | [q2-analysis-lk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-leistungskurs/01-funktionen-und-analysis/quiz/mathe-quest-q2/index.html) | [q2-geometrie-lk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-leistungskurs/02-analytische-geometrie-und-lineare-algebra/quiz/mathe-quest-q2/index.html) | [q2-stochastik-lk](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev/q1-q2-leistungskurs/03-stochastik/quiz/mathe-quest-q2/index.html) |

Jeder Quizordner enthält eine eigene `rangliste.html`. Die Teilnahme benötigt kein Benutzerkonto und keinen Zugangscode; ein Pseudonym ist freiwillig.

## Getrennte Wertungen und Speicherung

Der eigene Worker `mathematik-sekii-quiz` und die eigene D1-Datenbank `mathematik-sekii-leaderboard` halten die Sek-II-Wettbewerbe getrennt vom Sek-I-Dienst. Die 15 eindeutigen Quizkennungen trennen außerdem EF, Q1, Q2, GK, LK und die Inhaltsfelder voneinander.

Jede abgeschlossene Runde wird serverseitig bewertet. Der Bestwert wird über den Schlüssel `(quiz_id, browser_id, score_version)` gespeichert. Ranglistenabfragen filtern zusätzlich die zum Quiz gehörende Kursbezeichnung. Ein Ergebnis kann dadurch ausschließlich die Rangliste seines Quiz verändern. Niedrigere Wiederholungsversuche erhalten den bisherigen Bestwert. Eine vollständige Historie aller Einzelrunden wird nicht geführt.

SQLite-basierte Durable Objects halten Aufgaben, Fristen und laufende Runden dauerhaft. Lösungen werden vor der Bewertung nicht an den Browser gesendet. Doppelte Antworten und wiederholtes Laden der nächsten Aufgabe sind abgesichert. Der Wettbewerb hat zwölf Aufgaben mit je 60 Sekunden; die Wertungsversion lautet `sek2-v1`.

Training, Lernprofile, Lernstand und Trainingsranglisten bleiben lokal im Browser. Drei Trainingsstufen, Fokusrunden, Missionskarten, Vektoreingabe, Rasterkonstruktionen und die gekennzeichneten Abiturtransferaufgaben aus dem Paket bleiben verfügbar. KaTeX und Schriftdateien kommen aus der lokalen Materialsammlung.

## Dateien und Aktualisierung

- `ef/INHALTSFELD/quiz/mathe-quest/`: drei EF-Quizze.
- `q1-q2-grundkurs/INHALTSFELD/quiz/mathe-quest-q1/` und `mathe-quest-q2/`: sechs GK-Quizze.
- `q1-q2-leistungskurs/INHALTSFELD/quiz/mathe-quest-q1/` und `mathe-quest-q2/`: sechs LK-Quizze.
- `gemeinsam/quiz-sekii/assets/`: gemeinsame Übersicht, Lernstand, Cloudflare-Konfiguration, lokale Formelressourcen und Offline-Logik.
- `werkzeuge/sekii_quiz_backend/`: Worker, D1-Schema und Tests; wird nicht in die Website-Ausgabe kopiert.
- `werkzeuge/sekii_quiz_vorbereiten.py`: stellt Worker und öffentliche Assets unter `.local/sekii-quiz/worker/` zusammen.

Nach Materialänderungen im Repository-Stamm:

```text
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
python werkzeuge/sekii_quiz_vorbereiten.py
```

Im vorbereiteten Worker mit Node.js ab Version 24:

```text
npm ci
npm test
npm run test:integration
npm run deploy:check
```

Für die lokale Vorschau die Migration mit `npx wrangler d1 migrations apply mathematik-sekii-leaderboard --local` anwenden, danach `npm run dev` ausführen. Port 8789 wird von der Quizkonfiguration als lokale API erkannt. Lokale Tests verändern keine Online-Ergebnisse.

```text
python tests/run_quiz_sekii_browser.py
python tests/run_quiz_sekii_browser.py --flows-only --geometry-flow
```

Die Browserprüfung benötigt Playwright und Edge. Mit `--url https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev --smoke` werden die veröffentlichten Seiten und Ranglisten ohne Testergebnisse geprüft.

Eine autorisierte Cloudflare-Aktualisierung erfolgt mit `npm run deploy`. Neue D1-Migrationen zuvor mit `npx wrangler d1 migrations apply mathematik-sekii-leaderboard --remote` anwenden. Zugangsdaten bleiben in der vorhandenen Wrangler-Anmeldung. GitHub Pages erhält die lokalen Quizkarten erst nach einem ausdrücklich beauftragten Push.

## Übernommene Begleitdokumente

- [Kompetenzmatrix und Lehrkrafthinweise aus dem ZIP](quiz-sekii/HINWEISE_FUER_LEHRKRAEFTE.md)
- [Abiturtransfer und Quellenzuordnung aus dem ZIP](quiz-sekii/ABITURTRANSFER.md)
- [Qualitätsprüfung des ursprünglichen Lieferstands](quiz-sekii/QUALITAETSPRUEFUNG.md)

Diese Begleitdokumente beschreiben die Vorlage. Die aktuelle Integration wird hier dokumentiert; Entwicklungstexte werden nicht auf Quizseiten eingeblendet.

## Ergänzungen bei der Integration

- Dateiverweise und gemeinsame Ressourcen an die fachliche Ablage angepasst; Ranglisten bleiben Folgeseiten des jeweiligen Quiz.
- Eigene Offline-Geltungsbereiche je Quiz sowie gemeinsame lokale Formeln und Fonts eingerichtet. Wettbewerbsantworten und Ranglisten werden nicht im Offline-Cache gespeichert.
- Koordinateneingabe zum Setzen von Konstruktionspunkten repariert und schmale Bildschirmbreiten berücksichtigt.
- Vektorrückmeldungen im Wettbewerb verwenden die Serverbewertung, ohne auf verdeckte Lösungskomponenten zuzugreifen.
- Die Übersicht blendet gefilterte Karten zuverlässig aus; die Inhaltsfeldauswahl passt auf schmale Bildschirme. Lehrkrafthinweise liegen in der Dokumentation.
- Die geprüfte Sek-I-Speicher- und HTTP-Logik übernommen: Eingabeprüfung, feste Fristen, begrenzter Zeitbonus, transaktionale Verarbeitung und Wiederholung fehlgeschlagener Bestwertspeicherung.
- EF/Q1/Q2- und GK/LK-spezifische Aufgabenregeln aus der Sek-II-Vorlage erhalten; eigene Quiz- und Wertungskennungen eingerichtet.

## Prüfstand vom 28. Oktober 2026

- Cloudflare-Worker bereitgestellt, Version `8985ca77-ebec-4b2b-8e8c-bd5d8ac53a44`.
- Alle 15 Quizwelten in der Cloudflare-Laufzeit vollständig mit zwölf Aufgaben je Wettbewerb geprüft; Wiederaufnahme, parallele Wiederholungen, dauerhaft gespeicherter Zustand und getrennte Wertungsversionen erfolgreich.
- Zusätzliche lokale Wiederholungsrunden mit unterschiedlichen positiven Punktständen bestätigen, dass ausschließlich der Bestwert des jeweiligen Quiz aktualisiert wird. Andere Quizze, Profile und Wertungsversionen bleiben unverändert.
- Die Aufgabenprüfung aus der Vorlage sowie vier zusätzliche Prüfungen für Zahlen, Vektoren, Fristen, fremde Ursprünge und ungültige Quizkennungen bestehen.
- Im Browser alle 45 Trainingskombinationen bei 320 und 768 Pixeln geprüft. Vollständige Analysis- und Geometriewettbewerbe, Vektoreingaben, Konstruktionen, Wiederaufnahme, lokale Trainingsrangliste, Lernstand und Offline-Training erfolgreich.
- Alle 15 veröffentlichten Quiz- und Ranglistenseiten zusätzlich im Browser geprüft.
- Die zentrale Übersicht mit allen 15 Zugängen bei 320, 768 und 1024 Pixeln sowie sämtliche EF/Q1/Q2- und GK/LK-Filter geprüft.
- Auf Cloudflare 15 vollständige Testrunden mit 180 leeren Antworten abgeschlossen. Die dadurch erzeugten Null-Punkte-Testresultate waren ausschließlich auf ihrer jeweiligen Rangliste sichtbar. Direkte D1-Abfragen bestätigten genau einen Eintrag je Quiz und passender Kursbezeichnung unter `sek2-v1`; fremde Quizkennungen wurden abgewiesen.
- Anschließend alle 15 Testeinträge anhand der eigenen Testkennung und Testnamen entfernt. Sämtliche Ranglisten entsprechen wieder ihrem Ausgangszustand. Lokale Prüfbelege stehen unter `.local/sekii-quiz/leaderboard-verification/`.
- Website- und Strukturprüfung erfolgreich: 9 Bereiche, 33 Inhaltsfelder, 105 Themen, 362 Materialien. Gesamte Materialnavigation: 1.038 Prüfungen erfolgreich. Alle fünf Sek-II-Zuordnungs- und Ressourcenprüfungen bestehen.
- Von 31 allgemeinen Python-Repository-Tests bestehen 30. Der bestehende Präsentationstest scheitert weiterhin an der bereits fehlenden Datei `klasse-9/01-arithmetik-algebra/wiederholung.pptx`. Ebenfalls bereits nicht vorhanden ist `ef/03-stochastik/wiederholung.pptx`; diese Integration verändert keine Präsentationen.
- Cloudflare ist live. Lokale Material- und Website-Änderungen sind nicht committed oder gepusht; GitHub Pages wird erst nach einem ausdrücklich beauftragten Push aktualisiert.
