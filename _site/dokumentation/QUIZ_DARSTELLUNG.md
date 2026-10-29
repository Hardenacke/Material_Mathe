# Gemeinsame Quizdarstellung

Die 24 Sek-I- und 15 Sek-II-Quizze verwenden für Navigation und Formelschreibweise
die gemeinsamen lokalen Dateien unter `gemeinsam/quiz/assets/`.
Beide Cloudflare-Vorbereitungsprogramme kopieren diese Dateien mit.
Die Offline-Listen der einzelnen Quizze enthalten die zusätzlichen Ressourcen.

Die Links zur Materialauswahl und zum Lernfortschritt entfallen in den Fußzeilen
der einzelnen Quizseiten. Die Lernprofile und ihre Fortschritte bleiben über die
Übersichtsseite zugänglich. Die Quiz-Rangliste hat eine eigene, deutlich sichtbare
Kachel mit einer mindestens 54 Pixel hohen Schaltfläche; die obere Schaltfläche
ist mindestens 48 Pixel hoch. Aufgaben und Hinweise stehen in Textfeldern.
Dekorative Symbole über den Einführungstexten entfallen. Verbindungsprüfungen
laufen weiterhin, technische Cloudflare-Statusmeldungen werden nicht angezeigt.
Bei fehlender Verbindung zeigt die Wettbewerbsschaltfläche eine verständliche Meldung.

Die Anzeige vereinfacht mathematisch eindeutige Schreibweisen innerhalb von
Formelabschnitten – auch in Lösungen, Rückmeldungen und bereits laufenden Runden:

| Ausgangsschreibweise | Anzeige |
|---|---|
| `f(x)=1x+0` | `f(x)=x` |
| `f(x)=-1x+0` | `f(x)=-x` |
| `f(x)=1x^3+0x^2-1x+0` | `f(x)=x^3-x` |
| `f(x)=1(x+0)^2+0` | `f(x)=x^2` |
| `f(x)=2x+-3` | `f(x)=2x-3` |

Nullen in Koordinaten, Dezimalzahlen, Gleichungsbedingungen und Produkten werden
erhalten. Funktionsargumente und Indizes wie `h_1(x)` bleiben lesbar. Es werden
keine Terme zusammengefasst oder Aufgabenschritte ausgerechnet. Die Anzeige
verändert weder die Aufgabendaten noch Antwortkennungen, Bewertung oder Fristen.

Native Auswahlmenüs zeigen lesbaren mathematischen Text statt LaTeX-Befehlen.
Nach der Auswahl erscheint der vollständige Antworttext, einschließlich gesetzter
Formeln, zusätzlich unter dem Menü. Die Bewertung verwendet weiterhin den
ursprünglichen Optionsindex beziehungsweise die ursprünglichen Sortiertexte.

`node --test --test-isolation=none tests/quiz_anzeige.test.mjs` prüft Sonderfälle,
Dezimalzahlen und unveränderte Werte von 625 Polynomen an jeweils vier Stellen.
`python tests/run_quiz_anzeige_browser.py` prüft alle 39 Quizze mit 4.680 generierten
Aufgabenvarianten, Formelgültigkeit, eindeutigen Optionen, unveränderten Aufgabendaten,
Auswahlvorschau sowie Navigation bei 320, 768 und 1024 Pixeln und großer Schrift.
Mit `--engine webkit` wird WebKit mit iPad-Emulation verwendet. `--online` prüft
die veröffentlichten Quizze ausschließlich über Training und lesende Ranglistenabfragen.
Ein physisches iPad wird durch diese Browserprüfung nicht ersetzt.

Die bestehenden Browserprüfungen für alle 117 Trainingskombinationen und
vollständige lokale Wettbewerbe sowie die gezielte iPad-Konstruktionsprüfung
ergänzen diese Kontrolle. Website-Build und Strukturprüfungen folgen den
Repository-Regeln. Ein Git-Commit oder Push erfolgt nur auf ausdrücklichen Auftrag.

Die Fassung vom 29. Oktober 2026 ist veröffentlicht:

| Angebot | Cloudflare-Worker-Version |
|---|---|
| [24 Sek-I-Quizze](https://mathematik-seki-quiz.physik-wettkampf-api.workers.dev) | `f675c1fe-05cb-4bf4-8162-d951f4c472e4` |
| [15 Sek-II-Quizze](https://mathematik-sekii-quiz.physik-wettkampf-api.workers.dev) | `afb592bf-9ab6-4392-a2b9-65fb16607d52` |

Lokal bestehen die Anzeigeprüfung in Chromium und WebKit, die 117 bisherigen
Trainingskombinationen, vollständige lokale Wettbewerbsabläufe, die gesonderte
iPad-Konstruktionsprüfung, elf Python-Prüfungen für Quizzuordnung und Ressourcen
sowie die mathematischen Regelprüfungen. Die Online-Anzeigeprüfung bestätigt
alle 39 Quiz- und Ranglistenseiten mit nochmals 4.680 generierten Varianten.
Dabei wurden keine Wettbewerbsresultate gespeichert. Die lokale Website enthält
weiterhin 9 Bereiche, 33 Inhaltsfelder, 105 Themen und 362 Materialien.
