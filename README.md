# Mathematik NRW – GitHub-Pages-Materialsammlung

Stand: **12. September 2026**

Dieses Repository bündelt die vorbereitete Mathematik-Ordnerstruktur, alle Wiederholungs-Präsentationen, die Sek-II-Kontrollfragen im Abiturstil, die gemeinsame PowerPoint-Designvorlage und eine automatisch erzeugte GitHub-Pages-Oberfläche.

## Enthalten

- **9 Lernbereiche/Kursstufen:** Klasse 5–10, EF, Q1/Q2 GK und Q1/Q2 LK
- **33 Inhaltsfelder** mit je einer editierbaren `wiederholung.pptx`
- **105 Themenordner** als Ablage für Lernpfade, Arbeitsblätter, Simulationen und weitere Materialien
- **Lernspiele** als auswählbare Materialkategorie, veröffentlicht aus `lernspiele/`
- `struktur.json` als fachliches Strukturregister
- `dokumentation/ABITURVORGABEN_SEKII.md` für die Sek-II-Ausrichtung
- gemeinsame PPTX/POTX-Designvorlagen unter `gemeinsam/vorlagen/`
- automatische Materialerkennung und GitHub-Pages-Deployment

## GitHub Pages in Betrieb nehmen

1. Den **Inhalt dieses Ordners** in das Stammverzeichnis des Mathematik-Repositories kopieren bzw. committen.
2. Auf GitHub unter **Settings → Pages** als Quelle **GitHub Actions** wählen.
3. Auf den Branch `main` pushen.
4. Der Workflow `.github/workflows/pages.yml` prüft die Struktur, erzeugt den Katalog, baut `_site` und veröffentlicht die Seite.
5. Die veröffentlichte URL wird im erfolgreichen Actions-Lauf unter `deploy` angezeigt.

Es ist **kein manuelles Pflegen einer `data.json`** nötig. Bei jedem Build durchsucht `werkzeuge/katalog.py` die Inhaltsfeld- und Themenordner und erzeugt die Materialliste aus den tatsächlich vorhandenen Dateien.

## Lokal testen

Unter Windows genügt ein Doppelklick auf:

```text
START_LOKAL.bat
```

Alternativ:

```bash
python werkzeuge/lokal.py
```

Die Vorschau öffnet `http://127.0.0.1:8000/`. Der lokale Watcher baut die Seite nach Dateiänderungen neu.

## Material hinzufügen

Neue Materialien möglichst direkt im passenden Themenordner ablegen, zum Beispiel:

```text
klasse-8/
└── 02-funktionen/
    ├── wiederholung.pptx
    └── 01-lineare-funktionen/
        ├── lernpfad.html
        ├── arbeitsblatt.pdf
        └── assets/
```

`assets`, `css`, `js`, `images`, `fonts` und ähnliche technische Unterordner werden mit veröffentlicht, aber nicht als eigenständige Materialkarten angezeigt.

Unterstützte sichtbare Materialtypen sind u. a. HTML, PDF, PowerPoint, Word, Excel, CSV, Markdown, LaTeX, ZIP, Bilder, Audio und Video.

Lernspiele liegen gesammelt unter `lernspiele/`, damit ihre gemeinsame JavaScript-/CSS-Basis und Offline-Dateien erhalten bleiben. `werkzeuge/katalog.py` ordnet sie anhand von `lernspiele/data.json` fachlich den passenden vorhandenen Inhaltsfeldern und Themen zu und markiert sie auf der Website als Kategorie `Lernspiel`.

## Fachliche Grundlage

- **Sekundarstufe I (Gymnasium G9):** Kernlehrplan Mathematik 2019; Inhaltsfelder Arithmetik/Algebra, Funktionen, Geometrie, Stochastik.
- **Sekundarstufe II:** Kernlehrplan Mathematik 2023; Inhaltsfelder Funktionen und Analysis, Analytische Geometrie und Lineare Algebra, Stochastik.

Die konkrete Verteilung der Sek-I-Themen auf Klasse 5 bis 10 ist eine vorbereitende Organisationsstruktur und sollte mit dem schulinternen Lehrplan/Fachkonferenzbeschluss abgeglichen werden. Für Q1/Q2 ist ebenfalls keine landesweit starre Halbjahresfolge vorgegeben.

## Wiederholungs-Präsentationen

Für jedes der 33 Inhaltsfelder liegt direkt im Inhaltsfeldordner eine `wiederholung.pptx`. Die Sek-II-Präsentationen enthalten auf Folie 8 einfache Kontrollfragen mit offiziellen Operatoren und Orientierung an den analysierten NRW-Abiturvorgaben. Lösungshinweise befinden sich in den Referentennotizen.

Gemeinsames Design:

- `gemeinsam/vorlagen/Mathematik_Wiederholung_Designvorlage.potx`
- `gemeinsam/vorlagen/Mathematik_Wiederholung_Designvorlage.pptx`

## Wichtige Dateien

| Datei | Zweck |
|---|---|
| `index.html`, `style.css`, `script.js` | Oberfläche der Materialseite |
| `struktur.json` | fachliche Sollstruktur |
| `data.json` | automatisch erzeugter Materialkatalog für lokale/Quellprüfung |
| `werkzeuge/katalog.py` | erkennt vorhandene Materialien |
| `werkzeuge/build_site.py` | baut die veröffentlichbare Ausgabe `_site` |
| `werkzeuge/lokal.py` | lokale Vorschau mit Watcher |
| `werkzeuge/struktur_pruefen.py` | prüft 105 Themenordner |
| `werkzeuge/site_pruefen.py` | prüft Website/Katalog |
| `.github/workflows/pages.yml` | GitHub-Pages-Build und Deployment |
| `AGENTS.md` | Arbeitsregeln für Codex |

## Veröffentlichung und Sicherheit

Die Verzeichnisse `gemeinsam/privat` und `gemeinsam/entwuerfe` werden beim Website-Build ausgeschlossen. Das ist **kein Zugriffsschutz**: Vertrauliche bzw. personenbezogene Dateien gehören grundsätzlich nicht in ein öffentliches GitHub-Repository.

Codex soll keine Commits oder Pushes ausführen, sofern dies nicht ausdrücklich beauftragt wurde.
