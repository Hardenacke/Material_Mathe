# Prüfprotokoll – Wiederholungs-PowerPoints

Stand: 12. September 2026

## Umfang

- 33 Wiederholungspräsentationen (`wiederholung.pptx`)
- 8 Folien je Präsentation
- 264 Wiederholungsfolien insgesamt
- 1 editierbare Designvorlage (`.pptx`)
- 1 PowerPoint-Vorlage (`.potx`)

## Technische Prüfung

- Alle 33 PPTX-Dateien wurden als Office-ZIP geprüft: keine beschädigten Archive.
- Alle 33 Präsentationen enthalten exakt 8 Folien.
- Die Aufgabenfolien enthalten Referentennotizen mit Lösungshinweisen.
- Alle 9 Sek-II-Präsentationen enthalten auf Folie 8 fünf Kontrollfragen mit offiziellen Mathematik-Operatoren; die Operatorbezeichnungen wurden automatisiert gegen die hinterlegte Operatorenliste geprüft.
- Die Ordnerstrukturprüfung meldet 105 von 105 erwarteten Themenordnern vollständig.
- `ordner_anlegen.py --check` meldet die Struktur als vollständig.
- Die POTX-Datei besitzt den korrekten OpenXML-Content-Type für PowerPoint-Vorlagen und konnte mit LibreOffice als Präsentationsvorlage geöffnet und in PDF gerendert werden.

## Layoutprüfung

Stichproben aus allen Stufenbereichen wurden mit `slides_test.py` auf Elemente außerhalb der Folienfläche geprüft. Zusätzlich wurden alle 9 geänderten Sek-II-Präsentationen vollständig auf Überläufe geprüft. Ohne Befund waren unter anderem:

- Klasse 5 – Arithmetik/Algebra
- Klasse 8 – Funktionen
- Klasse 10 – Geometrie
- EF – Analytische Geometrie und Lineare Algebra
- Q1/Q2 Grundkurs – Stochastik
- Q1/Q2 Leistungskurs – Funktionen und Analysis
- Designvorlage

Zusätzlich wurden Klasse 5 – Arithmetik/Algebra und Q1/Q2 Leistungskurs – Funktionen und Analysis vollständig gerendert und visuell kontrolliert.

## Didaktische Struktur

Jede Präsentation folgt derselben Progression:

1. Titel und Themenübersicht
2. sehr leichter Einstieg
3. Begriffe und Grundideen
4. Basisrechnen
5. Darstellungen lesen
6. Anwenden im Kontext
7. Denkfragen und Fehleranalyse
8. 5-Minuten-Selbstcheck; in der Sekundarstufe II als operatorenbasierter Kontrollblock im Abiturstil

Die Aufgaben werden aus den Themenordnern des jeweiligen Inhaltsfelds abgeleitet. Die Lösungshinweise stehen in den Referentennotizen, sodass die Schülerfolie zunächst ohne Lösung gezeigt werden kann.

## Sek-II-Abiturcheck

Für EF, Q1/Q2 Grundkurs und Q1/Q2 Leistungskurs wurde Folie 8 auf einfache, operatorenbasierte Kontrollfragen umgestellt. Die Auswahl orientiert sich an den veröffentlichten NRW-Abiturvorgaben 2025–2029 und priorisiert für die laufenden Kurse die Vorgaben des aktuellen KLP bzw. der Abiturjahrgänge ab 2026. Details stehen in `ABITURVORGABEN_SEKII.md`.
