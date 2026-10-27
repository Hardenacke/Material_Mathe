# Mathematik NRW – GitHub-Pages-Materialsammlung

Stand: **12. September 2026**

Dieses Repository bündelt die vorbereitete Mathematik-Ordnerstruktur, alle Wiederholungs-Präsentationen, die Sek-II-Kontrollfragen im Abiturstil, die gemeinsame PowerPoint-Designvorlage und eine automatisch erzeugte GitHub-Pages-Oberfläche.

## Enthalten

- **9 Lernbereiche/Kursstufen:** Klasse 5–10, EF, Q1/Q2 GK und Q1/Q2 LK
- **33 Inhaltsfelder** mit je einer editierbaren `wiederholung.pptx`
- **105 Themenordner** als Ablage für Lernpfade, Arbeitsblätter, Simulationen und weitere Materialien
- **Lernspiele** als auswählbare Materialkategorie, veröffentlicht aus `lernspiele/`
- **Quadratische Funktionen für Klasse 9:** zwölf interaktive Lernpfade, zwölf H5P-Quizze und drei Erklärvideos zur quadratischen Ergänzung; [Ablage und Prüfung](dokumentation/QUADRATISCHE_FUNKTIONEN.md)
- **Mathe-Wettbewerbe** mit Portal unter `wettkaempfe/`, [gehostetem Beispielquiz](https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev/?wettkampf=beispiel-quadratische-funktionen) auf Cloudflare und Ranglistenarchivierung in [`ergebnisse/`](ergebnisse/README.md) dieses Repositories; Einrichtung: [WETTBEWERBE.md](dokumentation/WETTBEWERBE.md)
- **Wurzelwerk für Klasse 9** als Kategorie **Quiz**: klare Ansichten, große Zahlentasten, Training ohne Zeitdruck sowie mittelschwerer Cloudflare-Wettbewerb mit Timer, Zeitbonus und eigener Rangliste; [Einrichtung und Prüfung](dokumentation/WURZELWERK.md).
- **Question Shells** als bereichsweite Unterstützung unter `*/unterstuetzung/`
- **Fächerübergreifende Methoden** unter `methoden/`, getrennt von der fachlichen Mathematik-Sollstruktur
- **Drei Erklärvideos zu Wurzeln** für Klasse 9 unter Unterstützung: Quadratzahlen, Intervallschachtelung und Heron-Verfahren; mit Manim gerendert und mit Übungen ergänzt
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

Die Website führt über vier eigene Ansichten zum Material: **Klasse/Kurs → Themenbereich → Materialart → Materialauswahl**. Jede Ansicht hat eine verlinkbare Adresse; Navigationspfad, Schrittanzeige und Zurück-Buttons führen zu den vorherigen Ebenen. Suchbegriffe bleiben bei Seitenwechseln und Browser-Zurück erhalten. Auswahlkarten bestätigen einen Klick kurz mit ihrer Themenfarbe und einer kleinen Bewegung; die Einstellung für reduzierte Bewegung wird berücksichtigt.

Fächerübergreifende Methodenmaterialien liegen unter `methoden/sek-i/` oder `methoden/sek-ii/`. Der Methoden-Einstieg auf der Startseite führt über Schulstufe und Methodenthema zu den Materialien. Die Ablage zählt nicht zu den 9 Mathematik-Bereichen, 33 Inhaltsfeldern und 105 Themen der fachlichen Sollstruktur.

Lernspiele liegen gesammelt unter `lernspiele/`, damit ihre gemeinsame JavaScript-/CSS-Basis und Offline-Dateien erhalten bleiben. `werkzeuge/katalog.py` ordnet sie anhand von `lernspiele/data.json` fachlich den passenden vorhandenen Inhaltsfeldern und Themen zu und markiert sie auf der Website als Kategorie `Lernspiel`.

Jahrgangsbezogene Question-Shell-Dateien liegen im jeweiligen Bereichsordner unter `unterstuetzung/`. Sie sind über die eigene Kategorie **Unterstützung** für den ganzen Kurs erreichbar. Unter **Zusatzaufgaben** eines Themenbereichs erscheinen ausschließlich die diesem Inhaltsfeld zugeordneten Fermi-Aufgaben. Eine zusätzliche kursweite Übersicht bietet alle Zusatzaufgaben des Jahrgangs an.

Der Build ergänzt HTML-Materialien und ihre Folgeseiten um `material-navigation.js`. Bei Aufrufen aus der Sammlung zeigt es **Zurück zur Materialauswahl** und **Klassen und Kurse**; direkt geöffnete Materialien behalten ihre eigene Ansicht. Die ursprünglichen Materialdateien werden dabei nicht verändert.

Zusatzaufgaben liegen im jeweiligen Bereichsordner unter `zusatzaufgaben/` und erscheinen unter **Zusatzaufgaben** mit dem Label **Fermi-Aufgabe**. Die 104 Aufgaben aus dem erweiterten ZIP sind auch im Dateisystem nach Themenbereichen abgelegt, zum Beispiel unter `klasse-5/zusatzaufgaben/fermi-aufgaben/03-geometrie/`. Q1/Q2-Aufgaben erhalten zusätzlich Jahrgangsordner `q1/` und `q2/`. Die 32 zuvor eingebundenen Aufgaben sind darin bereits enthalten; es werden nur 72 Aufgaben ergänzt. Alle JPEG- und SVG-Bildimpulse sind direkt in den HTML-Dateien eingebettet. [FERMI_ZUORDNUNG.json](dokumentation/FERMI_ZUORDNUNG.json) ordnet alle Aufgaben den Inhaltsfeldern der unveränderten Sollstruktur zu. [FERMI_BILDIMPULSE.md](dokumentation/FERMI_BILDIMPULSE.md) dokumentiert die Aufgaben, Ablage und Herkunft.

Alle 160 Fermi-Aufgaben besitzen eindeutige, aussagekräftige Namen. Der Name steht einheitlich im Katalog, in den direkten Übersichten, als Seitenüberschrift und im Browser-Tab. Jahrgang und Themenbereich werden davon getrennt angezeigt. Die Namen sind in `FERMI_ZUORDNUNG.json` unter `titel` dokumentiert; der Katalog-Build prüft die Übereinstimmung mit der HTML-Überschrift. Dateipfade, Aufgabenstellungen, Bildimpulse und Notizkennungen bleiben bei der Titelüberarbeitung erhalten.

Klasse 5 bis 9 erhalten je 21 Aufgaben, Klasse 10 erhält 20, die EF acht. 27 gemeinsame Q1/Q2-Aufgaben liegen einmalig unter `gemeinsam/zusatzaufgaben/fermi-aufgaben/q1-q2/` und werden sowohl im Grundkurs als auch im Leistungskurs verlinkt. Damit enthält die Sammlung 160 unterschiedliche HTML-Aufgaben und 187 Zuordnungen zu Klassen und Kursen. `statistik.fermi_aufgaben` zählt unterschiedliche Aufgaben, `statistik.zusatzaufgaben` und die Materialzahlen zählen die Zuordnungen. Die älteren 56 Aufgaben behalten ihre Dateipfade und Browsernotiz-Kennungen. Die direkten Aufgabenübersichten sind nach Themenbereich und für Q1/Q2 zusätzlich nach Jahrgang gegliedert. Ein Klick auf eine Aufgabe öffnet ihre eigene HTML-Seite mit einem Rückweg zur Materialauswahl.

Die [Fachprompt-Vorlage für weitere Fermi-Aufgaben](gemeinsam/vorlagen/Prompt_Fermi-Aufgaben_Mathematik.md) ist für Lehrkräfte unter `gemeinsam/vorlagen/` abgelegt und um Hinweise aus der [ergänzenden Markdown-Sammlung mit 30 Aufgabenbeispielen](gemeinsam/vorlagen/fermi-aufgaben/Fermi-Aufgaben_Mathematik.md) erweitert. Beide Dokumente werden nicht als Schüleraufgaben im Katalog angezeigt.

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
| `material-navigation.js` | Rücknavigation auf erzeugten HTML-Materialseiten |
| `struktur.json` | fachliche Sollstruktur |
| `dokumentation/MATERIAL_ZUORDNUNG.json` | gezielte Themenzuordnung zusammengehöriger Materialien ohne Dateikopien |
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
