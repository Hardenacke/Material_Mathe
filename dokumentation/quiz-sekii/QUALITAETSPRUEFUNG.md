# Qualitätsanalyse · Mathematik Sekundarstufe II

Prüfdatum: 28.10.2026  
Curriculare Grundlage: Kernlehrplan Mathematik NRW Sek II, Fassung 2023, Kapitel 2.3 und 2.4.

## Gesamturteil

Die Quizwelten sind nun stärker auf die Abiturvorbereitung ausgerichtet. In Q1 und Q2 enthält jedes der sechs Quizpaare aus Themenfeld und Kurs eigene, neu formulierte Abitur-Transferaufgaben. Sie greifen Aufgabentypen und Arbeitsweisen aus veröffentlichten NRW-Abituraufgaben auf; die Zahlenwerte werden variiert und Musterlösungen passend dazu berechnet. Die Transferaufgaben sind im Training sichtbar markiert und in der Wettbewerbsrunde gekennzeichnet. Vier von zehn Trainingsaufgaben und fünf von zwölf Wettbewerbsaufgaben sind Transfers.

Das Paket bleibt ein ergänzendes Übungsangebot, keine vollständige Abiturprüfung und keine vollständige KLP-Abdeckung. Es deckt ausgewählte Teilaufgaben, Formate und Darstellungswechsel ab. Die Kompetenzmatrix und die Q1/Q2-Verteilung müssen weiterhin mit dem schulinternen Lehrplan abgeglichen werden. Cloudflare-Wettbewerb bleibt bis zur eigenen Konfiguration deaktiviert.

## Motivations- und Feedbackgestaltung

Die Quiz-Startseite zeigt jetzt eine kleine, quizbezogene Lernmission. Sie erklärt den Ablauf, den Zeitrahmen und – bei Q1/Q2 – die Abiturtransfers der gemischten Runde. Bei einem erneuten Besuch knüpft sie an die letzte lokal gespeicherte Runde an, ohne daraus eine Note oder Rangfolge abzuleiten. Lernende wählen selbst Level und Fokus; Tipps und ein zweiter Versuch werden ausdrücklich als Lernwege unterstützt. Erfolgsmeldungen würdigen außerdem Zwischenziele von drei, fünf und zehn richtigen Aufgaben in Folge. Das Abschlussfeedback priorisiert weiterhin nächste konkrete Übungsschritte.

## Befunde nach Priorität

| Priorität | Bereich | Befund und Nachweis | Maßnahme / Status |
|---|---|---|---|
| Behoben · ehemals hoch | Wettbewerb / Antwortsicherheit | Sortieraufgaben dürfen im öffentlichen Aufgaben-Payload keine Lösung verraten. Die Elementreihenfolge wird pro Runde einmal gemischt und bei Wiederaufnahme erhalten; eine zufällig bereits richtige Reihenfolge wird vermieden. | Regressionstests prüfen fehlenden Lösungsschlüssel, falsche aber vollständige Elementreihenfolge und stabile Darstellung beim Wiederaufnehmen. |
| Behoben · ehemals hoch | Fachliche Richtigkeit | Die Schritte zur Berechnung des Rotationsvolumens in Q2 Analysis LK waren zuvor falsch geordnet. | Training und Wettbewerb nennen jetzt Querschnittsfläche und Intervall, Integration, Grenzauswertung und Deutung mit Einheit in korrekter Reihenfolge. Ein Regressionstest sichert beide Versionen. |
| Behoben · hoch | Abiturtransfer / Zahlenvariation | Zwei Q1-Analysis-LK-Aufgaben im Wettbewerb hatten feste Zahlen, obwohl die Transferaufgaben als variiert ausgewiesen werden. | Beide Aufgaben verwenden jetzt denselben variablen Parameteransatz wie das Training. Tests prüfen unterschiedliche Aufgabenwerte in allen 24 Q1/Q2-Kurs-/Themenkombinationen für beide Transferplätze. |
| Behoben · hoch | Antwortbarkeit / Reglerbereich | Bei höheren Übungsstufen konnte der zufällig generierte Gerade-Ebene-Schnittparameter in Q1 Geometrie LK über dem Reglermaximum liegen. | Der sichtbare Wertebereich deckt jetzt alle generierten Werte ab. Der Generator-Test erzeugt pro Aufgabe viele Varianten und prüft, dass jede Musterlösung im Reglerbereich liegt. |
| Mittel | KLP-Zuordnung GK/LK | Die Lehrkraftmatrix kann gemeinsame GK/LK-Grundlagen und LK-Vertiefungen noch klarer trennen. Im KLP sind beispielsweise bestimmte Kettenregel- und Parameterbezüge, Winkel zwischen Vektoren sowie Gegenereignisse bereits in GK-Erwartungen enthalten. | Als gemeinsames Fundament mit sichtbarer LK-Vertiefung ausweisen; nicht als LK-exklusive Kompetenz kennzeichnen. |
| Mittel | KLP-Abdeckung | Fünf Aufgabenfamilien je Quiz sind eine Lernstichprobe, keine vollständige Prüfung der Kompetenzerwartungen. Im Paket bislang kaum oder nicht abgebildet sind unter anderem logarithmische und trigonometrische Funktionsfamilien, uneigentliche Integrale, Abstände in mehreren räumlichen Konstellationen und die numerische Bestimmung eines Konfidenzintervalls. | Im Kompetenzraster Abdeckung und Lücken noch genauer markieren; fehlende Aufgabenfamilien priorisiert ergänzen. Aussagen zu den Grenzen der Diagnose beibehalten. |
| Vor Aktivierung | Cloudflare-Betrieb | Die Online-Wertung ist nicht produktiv geprüft. `wrangler.toml` enthält eine Platzhalter-Datenbank-ID und `https://example.org` als Beispielursprung. | Vor Live-Schaltung Datenbank-ID und Domain setzen sowie Hosting, Missbrauchsschutz, Aufbewahrung, Zugriffsrechte und Datenschutzfreigabe mit der Schule klären. |

## Abiturtransfer

| Stufe/Kurs | Themenfeld | Eingebaute analoge Aufgabentypen |
|---|---|---|
| Q1 GK/LK | Analysis | Ableitungen, Extremstellen und Optimierung; Koeffizienten und Randbedingungen wechseln. |
| Q1 GK/LK | Analytische Geometrie | Skalarprodukt bzw. Winkel und variierte Gerade-Ebene-Schnittparameter. |
| Q1 GK/LK | Stochastik | Binomialmodelle mit neuen Versuchszahlen und Trefferwahrscheinlichkeiten; im LK kumulative Ereignisse und Varianz. |
| Q2 GK | Analysis | Nullstellen und eingeschlossene Fläche einer kubischen Funktion mit variiertem Faktor. |
| Q2 LK | Analysis | Rotationsvolumen und Integration einer zeitabhängigen Zuflussrate mit variierten Parametern. |
| Q2 GK/LK | Analytische Geometrie | GK: Dachfläche aus 3D-Koordinaten; LK: Punkt-Ebene-Abstand und Gerade-Ebene-Winkel mit neuen Koordinaten. |
| Q2 GK | Stochastik | Kumulative Binomialwahrscheinlichkeit und Vergleich von Stichprobenmittelwert und Streuung. |
| Q2 LK | Stochastik | Näherungsweises 95%-Konfidenzintervall aus neuen Stichproben sowie Normalverteilungsbereiche mit variierten Parametern. |

Die zugrunde liegenden Aufgabenformulierungen wurden nicht wortgleich übernommen. Die Aufgabentypen und Kontexte stammen aus veröffentlichten amtlichen Beispielaufgaben; Details, Werte und Quizdarstellung wurden neu formuliert. Quellen, Aufgabenbezüge und Kompetenzschwerpunkte sind in `ABITURTRANSFER.md` im Paket dokumentiert. Das umfasst unter anderem NRW-Beispiele zu Symmetrie, Flächen und Optimierung, räumlichen Dachmodellen sowie Konfidenzintervallen und Normalverteilungen.

## Automatisierte Prüfergebnisse

- 15 Quizseiten mit 15 eindeutigen Quiz-IDs und 15 quiz-eigenen Ranglistenseiten.
- 5.400 Trainingsaufgaben dynamisch erzeugt und geprüft; gültige Antwortschlüssel, Sliderbereiche, Geometriepunkte, Auswahloptionen und Aufgabenformate.
- 12.312 KaTeX-Ausdrücke aus Aufgaben, Auswahloptionen und Lösungen ohne Parsefehler.
- Alle acht eingebauten Formate vertreten: Zahleneingabe, Mehrfachauswahl, Zahlenstrahl-Regler, Sortieren, Zuordnen, Rasterkonstruktion, dreikomponentige Vektoreingabe und Bruchfeld.
- Q1/Q2-Transferkennzeichnung im Training und Wettbewerb geprüft. Wechselnde Werte und neu berechnete Antworten für alle sechs Themen-/Kurskombinationen in beiden QP-Stufen geprüft.
- Worker-Tests für alle 15 Quiz-IDs und je zwölf Wettbewerbsaufgaben bestanden. Tests prüfen auch GK/LK-Unterschiede, Transferlabels, dynamische Werte, fehlende Antwortschlüssel und die Reihenfolge der Rotationsvolumen-Schritte.
- 32 ausgelieferte HTML-Seiten: Quiz-Auswahl, Lernstand, 15 Quizseiten und 15 Ranglistenseiten. Keine zusätzlichen KaTeX-Entpackdateien im Paket.
- Die 15 Akzentfarben erreichen gegen Weiß mindestens 5,35:1. Das prüft nur diese Palette, nicht alle Komponenten und Zustände nach WCAG.
- Fortschrittsdaten und lokale Bestenlisten sind quizspezifisch. Cloudflare ist in der ausgelieferten Konfiguration deaktiviert.

## Curriculare Einordnung

Der NRW-Kernlehrplan Mathematik Sek II, Fassung 2023, formuliert Erwartungen bis zum Ende der EF und bis zum Ende der Qualifikationsphase; für die QP unterscheidet er GK und LK. Er schreibt keine landesweit verbindliche Einzelzuordnung auf Q1 und Q2 vor. Die Stufenzuordnung ist deshalb ein Progressionsvorschlag, der schulintern abgeglichen werden muss.

Amtliche Grundlage: [Kernlehrplan Mathematik NRW Sek II (PDF)](https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_m_2023_06_07.pdf).

## Nicht geprüft

- Kein visueller Browserlauf, kein Touchgerät und kein Screenreader-Test; die Prüfungen waren automatisiert und überwiegend statisch.
- Kein Live-Deployment, keine echte D1-Datenbank, keine Produktionslast und keine Datenschutzfreigabe.
- Keine vollständige Abiturklausur, keine Benotung nach offiziellen Bewertungseinheiten und keine vollständige Kompetenzdiagnose.

## Wiederholung der automatisierten Prüfung

Im Projektverzeichnis `node check_quizzes_sek2.js` ausführen. Für den Worker `node --check Quizformate_Mathematik_SekII_15/worker/src/index.js` und `npm --prefix Quizformate_Mathematik_SekII_15/worker test` verwenden.
