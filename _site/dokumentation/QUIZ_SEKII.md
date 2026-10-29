# 15 Mathematik-Quizwelten für die Sekundarstufe II

Die Quizze aus `Mathematik_SekII_15_Interaktive_Quizwelten.zip` sind als Materialart **Quiz** den bestehenden Inhaltsfeldern zugeordnet. Drei gemeinsame EF-Quizze und jeweils sechs Q1- und Q2-Quizze decken Analysis, analytische Geometrie und Stochastik ab. In der Qualifikationsphase sind GK und LK getrennt.

In der Materialsammlung führt der Weg über **Kurs → Themenbereich → Quiz**. Q1 und Q2 besitzen eigenständige Karten innerhalb des bestehenden Q1/Q2-Grundkurs- beziehungsweise Leistungskursbereichs. Die Sollstruktur mit 9 Bereichen, 33 Inhaltsfeldern und 105 Themen bleibt erhalten.

## Zugänge

Die aktuelle Überarbeitung von Textfeldern, Navigation und Formelschreibweise ist
in [Gemeinsame Quizdarstellung](QUIZ_DARSTELLUNG.md) dokumentiert.

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

SQLite-basierte Durable Objects halten Aufgaben, Fristen und laufende Runden dauerhaft. Lösungen werden vor der Bewertung nicht an den Browser gesendet. Doppelte Antworten und wiederholtes Laden der nächsten Aufgabe sind abgesichert. Der Wettbewerb hat zwölf Aufgaben mit aufgabenabhängigen Fristen von einer bis fünf Minuten. Die aktuelle Wertungsversion lautet `sek2-v2`; die frühere 60-Sekunden-Wertung `sek2-v1` bleibt auf den Ranglistenseiten auswählbar.

Training, Lernprofile, Lernstand und Trainingsranglisten bleiben lokal im Browser. Drei Trainingsstufen, Fokusrunden, Missionskarten, Vektoreingabe, Rasterkonstruktionen und die gekennzeichneten Abiturtransferaufgaben aus dem Paket bleiben verfügbar. KaTeX und Schriftdateien kommen aus der lokalen Materialsammlung.

## Dateien und Aktualisierung

- `ef/INHALTSFELD/quiz/mathe-quest/`: drei EF-Quizze.
- `q1-q2-grundkurs/INHALTSFELD/quiz/mathe-quest-q1/` und `mathe-quest-q2/`: sechs GK-Quizze.
- `q1-q2-leistungskurs/INHALTSFELD/quiz/mathe-quest-q1/` und `mathe-quest-q2/`: sechs LK-Quizze.
- `gemeinsam/quiz-sekii/assets/`: gemeinsame Übersicht, Lernstand, Cloudflare-Konfiguration, lokale Formelressourcen und Offline-Logik.
- `werkzeuge/sekii_quiz_backend/`: Worker, D1-Schema und Tests; wird nicht in die Website-Ausgabe kopiert.
- `werkzeuge/sekii_quiz_backend/src/aufgaben-varianten.js`: gemeinsame Regeln für Zahlenvarianten in Training und Wettbewerb. Die Vorbereitung synchronisiert die öffentliche Kopie unter `gemeinsam/quiz-sekii/assets/`.
- `werkzeuge/sekii_quiz_vorbereiten.py`: stellt Worker und öffentliche Assets unter `.local/sekii-quiz/worker/` zusammen.

Nach Materialänderungen im Repository-Stamm:

```text
python werkzeuge/sekii_quiz_vorbereiten.py
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
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

## Zahlenvarianten und Bearbeitungszeiten

Training und Wettbewerb verwenden dieselben Regeln für neu gewählte Zahlenwerte. Dazu gehören Funktionskoeffizienten, Auswertungsstellen, Verschiebungen von Extrempunkten und Nullstellen, Vektorkomponenten, Geraden- und Ebenenparameter, Stichprobenumfänge und Wahrscheinlichkeiten. Lösungen und Lösungshinweise werden jeweils passend berechnet; Konstruktionen bleiben im sichtbaren Raster. Die drei Trainingsstufen bleiben erhalten und haben weiterhin kein Zeitlimit.

| Aufgabenart im Wettbewerb | Zeit pro Aufgabe |
|---|---:|
| Kurze Begriffs- und Auswahlfragen | 1 Minute |
| Rein begriffliches Sortieren und Zuordnen | 1:30 Minuten |
| Grundlegende Rechnungen, Ableitungswerte, Vektorsummen und einfache Parameter | 2 Minuten |
| Mehrere Rechenschritte, etwa Produktregel, Skalarprodukt oder einfache Schnittparameter | 3 Minuten |
| Flächen, Integrale, Rotationsvolumina, Winkel, Abstände und umfangreichere Stochastik | 4 Minuten |
| Extremstellen, Extrempunkte und Optimierung | 5 Minuten |

Die konkrete Frist und ihr Zeitbudget kommen vom Server und werden auf der Aufgabenseite angezeigt. Neuladen oder Wiederverbinden erzeugt weder neue Zahlenwerte noch zusätzliche Zeit für die laufende Aufgabe. Richtige Antworten bringen 100 Grundpunkte und bis zu 50 Bonuspunkte. Der Bonus richtet sich nach dem verbleibenden Anteil des jeweiligen Zeitbudgets, sodass längere Aufgaben nicht allein wegen ihrer längeren Frist mehr Bonus erhalten. Höchstwert einer Runde: 1.800 Punkte.

Neue Runden verwenden `sek2-v2` und eine eigene Bestwertliste je Quiz. Bereits laufende `sek2-v1`-Runden behalten ihre bisherigen Aufgaben und 60-Sekunden-Fristen und speichern ihr Ergebnis weiter in der früheren Wertung. Bestehende Ergebnisse werden erhalten. Die Auswahl auf jeder Ranglistenseite wechselt zwischen aktueller und früherer Wertung.

Die Regeln werden mit unabhängigen mathematischen Prüfungen validiert: numerische Ableitungen, Vorzeichenvergleich an Extremstellen, numerische Integration und eine separate Bernoulli-Faltung für Binomialwahrscheinlichkeiten. Die Laufzeitprüfung kontrolliert zusätzlich die weiterhin beantwortbare Fünf-Minuten-Aufgabe nach 65 Sekunden, unveränderte Fristen nach Neustart und die getrennte Speicherung alter Runden.

## Aufgabenbezogene CAS-Hinweise

Training und Wettbewerb zeigen direkt unter der Aufgabenstellung einen CAS-Hinweis. Die Empfehlung richtet sich nach dem Rechenschritt und der Lernabsicht:

| Hinweis | Beispiele und Vorgehen |
|---|---|
| **CAS sinnvoll** | Aufwendige Extremwertrechnungen, bestimmte Integrale, Rotationsvolumina, numerische Winkel, Binomialwahrscheinlichkeiten und Konfidenzintervalle. Zuerst Modell, Formel, Gleichung oder Ereignis selbst festlegen; danach den CAS zur Berechnung verwenden. |
| **CAS zur Kontrolle** | Produktregel, einfache Optimierung, konstruierte Extrempunkte, Schnittparameter und Abstands- oder Flächenrechnungen. Den eigenen Rechenweg aufstellen und das Ergebnis anschließend prüfen. |
| **CAS nicht nötig** | Grundlegende Ableitungen, Vektorsummen, Skalarprodukte, einfache Projektionen und Erwartungswerte sowie Begriffs- und Reihenfolgeaufgaben. Hier steht das eigenständige Anwenden der Grundmethode im Vordergrund. |

Die Hinweise nennen passende Arbeitsschritte ohne gerätespezifische Befehle oder vorweggenommene Zahlenlösungen. Bei Extremwertaufgaben wird auf Definitionsbereich und Prüfung der Extremumart hingewiesen, bei Winkeln auf das Gradmaß, bei Verteilungen auf Einzel- beziehungsweise kumulierte Wahrscheinlichkeit und bei numerischen Ergebnissen auf das Runden am Ende. Das sind Lernempfehlungen für die Quizaufgabe.

Die gemeinsame Regeldatei liefert die Hinweise sowohl für das Offline-Training als auch für die öffentliche Wettbewerbsaufgabe. Ältere laufende Runden erhalten ebenfalls einen Hinweis, auch wenn ihnen noch die Aufgabenfamilien-Metadaten fehlen. Zeitlimits, Bewertung und Ranglistenversion bleiben bei dieser Ergänzung unverändert.

Die CAS-Ergänzung wurde mit zwölf Regelprüfungen, fünf Worker-Integrationstests sowie allen 45 Trainingskombinationen im Browser geprüft. Ein vollständiger Extremwertwettbewerb bestätigt zusätzlich, dass der CAS-Hinweis im Wettbewerb und nach dem Neuladen sichtbar bleibt. Die öffentlichen Hinweise enthalten ausschließlich Empfehlung, Überschrift und Vorgehensbeschreibung.

Die Fassung mit CAS-Hinweisen ist unter Cloudflare-Worker-Version `dd6168b9-8f0a-4319-bd93-dbbe7827f327` bereitgestellt. Die Wettbewerbsaufgaben aller 15 Quizze wurden online auf ihre CAS-Metadaten geprüft; dafür wurden keine Runden abgeschlossen oder Ranglistenergebnisse erzeugt.

Eine autorisierte Cloudflare-Aktualisierung erfolgt mit `npm run deploy`. Neue D1-Migrationen zuvor mit `npx wrangler d1 migrations apply mathematik-sekii-leaderboard --remote` anwenden. Zugangsdaten bleiben in der vorhandenen Wrangler-Anmeldung. GitHub Pages erhält die lokalen Quizkarten erst nach einem ausdrücklich beauftragten Push.

## Koordinatensysteme auf dem iPad

Alle 15 Sek-II-Quizseiten verwenden denselben lokalen Koordinateneditor unter
`gemeinsam/quiz-sekii/assets/koordinatensystem.js`. Aktuell enthalten sechs Quizze
Konstruktionsaufgaben: Analysis und Geometrie in EF sowie Q1 im Grund- und Leistungskurs.

- Das Raster nutzt bis zu 600 Pixel Breite. „Raster vergrößern“ öffnet eine 720 Pixel
  breite Ansicht mit eigenem Scrollbereich; „Raster einpassen“ stellt die passende Breite wieder her.
- Ein Antippen wählt Koordinaten aus und zeigt eine Vorschau. Erst „Punkt setzen“
  übernimmt den Punkt. Auswahl und Bestätigung bleiben beim Scrollen am Raster sichtbar.
  Wischen, abgebrochene Gesten und mehrere Finger setzen keine Punkte.
  Seiten- und Raster-Scrollen sowie die native Vergrößerung bleiben verfügbar.
- Die Plus-/Minus-Tasten ermöglichen auch negative Koordinaten ohne Bildschirmtastatur.
  Schaltflächen sind mindestens 48 × 48 CSS-Pixel groß, Eingabeschrift mindestens 16 Pixel.
- Bereits gesetzte Punkte lassen sich über die Punktliste auswählen und bearbeiten.
  Entfernen des letzten Punkts und vollständiges Leeren bleiben möglich. Duplikate und zusätzliche
  Punkte über die geforderte Anzahl hinaus werden verhindert.
- Pfeiltasten wählen Koordinaten; Enter oder Leertaste setzt einen Punkt. Bei direkter
  Eingabe wechselt Enter vom x- zum y-Feld und bestätigt anschließend den Punkt.
- Die Achsenbeschriftungen zeigen auch Minuszeichen korrekt; Punktnummern erleichtern
  die Zuordnung zur Bearbeitungsliste. Nach der Bewertung sind Eingaben gesperrt,
  die Ansicht kann weiterhin vergrößert werden. Im Training ist der Editor offline verfügbar.

Die Browserprüfung `tests/run_quiz_sekii_ipad.py` verwendet Touch-Eingabe in Edge/Chromium
und WebKit mit iPad-Emulation. Sie prüft alle sechs Quizze mit Konstruktionen sowie Ansichten
zwischen 320 und 1180 Pixel Breite, Hoch-/Querformat und erhöhte Schriftgröße.
Native vertikale und horizontale Scrollgesten werden zusätzlich in Chromium geprüft;
WebKit prüft Tap-Eingaben und das Abbrechen von Pointer-Gesten. Offline-Konstruktionen
werden in Chromium geprüft; WebKit kontrolliert die Cache-Ressourcen, da seine
[Playwright-Offline-Emulation einen bekannten Fehler hat](https://github.com/microsoft/playwright/issues/42775).
Ein physisches iPad
wurde nicht verwendet. Zusätzlich bestehen die 45 Trainingskombinationen und die
vollständigen lokalen Analysis- und Geometriewettbewerbe.

Die iPad-Überarbeitung ist unter Cloudflare-Worker-Version
`6edb6dbf-0cfe-4559-9b98-7e91d1b1d979` veröffentlicht. Auch online bestehen die
Touch-Prüfungen aller sechs Quizze in Chromium und WebKit sowie die lesende Prüfung
aller 15 Quiz- und Ranglistenseiten. Dabei wurden keine Wettbewerbe abgeschlossen
oder Ranglistenergebnisse erzeugt. Die GitHub-Pages-Ausgabe wird lokal neu gebaut;
ein Commit oder Push wurde nicht durchgeführt.

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

## Prüfstand der ersten Integration am 28. Oktober 2026

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

## Aktueller Prüfstand der Varianten- und Zeitüberarbeitung

Die überarbeitete Fassung ist auf Cloudflare unter Worker-Version `b722ef69-9dc7-41e1-bf21-60786506ef67` bereitgestellt. Neue Wettbewerbe verwenden `sek2-v2`.

- Elf Regelprüfungen bestehen, darunter mehrere Tausend erzeugte Zahlenvarianten sowie unabhängige Prüfungen von Ableitungen, Extremstellen, Extrempunkten, Flächen und Binomialwahrscheinlichkeiten. Konstruktionen und Reglerwerte bleiben innerhalb ihrer Eingabebereiche.
- Fünf Integrationstests bestehen: vollständige Runden aller 15 Quizze, gültige Extremwertantwort nach simulierten 65 Sekunden, unveränderte Fristen nach Neustart, Fortsetzung alter 60-Sekunden-Runden und getrennte Bestwerte je Quiz und Wertung.
- Alle 45 Trainingskombinationen im Browser mit variierenden Zahlenwerten und fehlerfreier Formeldarstellung geprüft. Vollständige Analysis-, Vektor-/Geometrie- und Extremwertrunden, Neuladen, angezeigte Zeitbudgets und Offline-Training erfolgreich.
- Auf Cloudflare alle 15 Wettbewerbe unter `sek2-v2` vollständig mit jeweils zwölf leeren Antworten abgeschlossen. Die neuen Aufgabenbudgets, Wiederaufnahme und Ranglistentrennung sind bestätigt. Die 15 erzeugten Null-Punkte-Testeinträge wurden gezielt entfernt; bestehende `sek2-v1`-Ergebnisse blieben erhalten.
- Alle 15 veröffentlichten Quiz- und Ranglistenseiten einschließlich des Wechsels zur früheren Wertung im Browser geprüft. Lokale Online-Prüfbelege: `.local/sekii-quiz/variant-update-verification/`.
- Alle sechs Python-Prüfungen für Sek-II-Zuordnung, Ressourcen, Ranglisten und identische Trainings-/Serverregeln bestehen. Von 32 allgemeinen Repository-Tests bestehen 31; der bereits dokumentierte Präsentationstest scheitert weiterhin an der fehlenden Wiederholungsdatei.
- Keine Commits oder Pushes durchgeführt. Die aktualisierte GitHub-Pages-Ausgabe liegt lokal zur Kontrolle bereit.
