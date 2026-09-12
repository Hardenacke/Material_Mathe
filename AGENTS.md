# AGENTS.md – Arbeitsregeln für Codex

## Ziel
Dieses Repository ist die gemeinsame lokale und GitHub-basierte Materialstruktur für Mathematik. Die GitHub-Pages-Ausgabe wird automatisch aus den Quelldateien erzeugt.

## Fachliche Ablage
1. Unterrichtsmaterial liegt möglichst nah am fachlichen Thema: `Bereich/Inhaltsfeld/Thema/`.
2. Die Datei `struktur.json` ist die fachliche Sollstruktur. Titel/Ordner-IDs nur bewusst ändern.
3. Die 33 `wiederholung.pptx` liegen direkt im jeweiligen Inhaltsfeldordner.
4. Neue PowerPoints verwenden die Vorlagen unter `gemeinsam/vorlagen/`.
5. Sek-II-Wiederholungsfolien verwenden offizielle Operatoren; Kontrollfragen bleiben einfach, fachlich eindeutig und an den dokumentierten Abiturvorgaben orientiert.

## Website
1. `index.html`, `style.css` und `script.js` sind die Website-Quellen.
2. `data.json` wird durch `python werkzeuge/katalog.py` erzeugt und nicht manuell gepflegt.
3. `_site/` ist vollständig erzeugt und darf nicht von Hand bearbeitet werden.
4. Nach Änderungen an Materialien oder Website `python werkzeuge/build_site.py` ausführen.
5. Danach `python werkzeuge/site_pruefen.py` und `python werkzeuge/struktur_pruefen.py` ausführen.
6. Technische Unterordner (`assets`, `css`, `js`, `images`, `fonts`, `vendor`, `lib`) dürfen zu Lernpfaden gehören, sollen aber nicht als eigenes Material gelistet werden.
7. `gemeinsam/privat` und `gemeinsam/entwuerfe` werden nicht veröffentlicht. Vertrauliche Daten trotzdem niemals ins öffentliche Repository legen.

## Bestehende Dateien
- Vorhandene Materialien nicht ohne ausdrücklichen Auftrag verschieben oder umbenennen.
- Bei Umzügen relative Links und lokale Assets prüfen.
- PowerPoint-Dateien nicht parallel in konkurrierenden Git-Ständen bearbeiten; binäre Konflikte sind nicht sinnvoll zusammenführbar.

## Git
- Kein `push`, `force-push`, `reset --hard`, Rebase oder automatisches Konfliktlösen ohne ausdrücklichen Auftrag.
- Änderungen lokal erstellen, testen und dem Benutzer zur Kontrolle bereitstellen.
- Der Pages-Workflow veröffentlicht erst nach einem Push auf `main`.

## Qualitätskontrolle
- HTML/JS ohne externe Pflichtabhängigkeiten; iPad-tauglich und responsiv.
- Keine internen Prompt-/Metatexte auf Schülerseiten.
- Links und JSON-Syntax prüfen.
- Bei Änderungen am Katalog sicherstellen, dass 9 Bereiche, 33 Inhaltsfelder und 105 Themen erhalten bleiben, sofern `struktur.json` nicht bewusst geändert wurde.
