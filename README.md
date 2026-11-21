# Mathematik NRW – GitHub-Pages-Materialsammlung

Stand: **12. September 2026**

Dieses Repository bündelt die vorbereitete Mathematik-Ordnerstruktur, alle Wiederholungs-Präsentationen, die Sek-II-Kontrollfragen im Abiturstil, die gemeinsame PowerPoint-Designvorlage und eine automatisch erzeugte GitHub-Pages-Oberfläche.

## Enthalten

- **9 Lernbereiche/Kursstufen:** Klasse 5–10, EF, Q1/Q2 GK und Q1/Q2 LK
- **33 Inhaltsfelder** mit je einer editierbaren `wiederholung.pptx`
- **105 Themenordner** als Ablage für Lernpfade, Arbeitsblätter, Simulationen und weitere Materialien
- **Lernspiele** als auswählbare Materialkategorie, veröffentlicht aus `lernspiele/`
- **24 interaktive Sek-I-Quizze:** je vier Themenbereiche für Klasse 5 bis 10, mit drei Trainingsstufen, lokalem Lernstand und einer eigenen Cloudflare-Wettbewerbsrangliste pro Quiz; [Zugänge und Einrichtung](dokumentation/QUIZ_SEKI.md).
- **15 interaktive Sek-II-Quizwelten:** Analysis, analytische Geometrie und Stochastik für EF sowie Q1/Q2 mit getrennten GK- und LK-Angeboten, drei Trainingsstufen und einer eigenen Cloudflare-Rangliste je Quiz; [Zugänge und Einrichtung](dokumentation/QUIZ_SEKII.md).
- **Quadratische Funktionen für Klasse 9:** zwölf interaktive Lernpfade mit direkt spielbaren Lernchecks, H5P-Downloads und drei eingebetteten Erklärvideos mit Kontrollfragen zur quadratischen Ergänzung; [Ablage und Prüfung](dokumentation/QUADRATISCHE_FUNKTIONEN.md)
- **Scheitelpunkt-Trainer für Klasse 9:** Trainer für Normal- und Scheitelpunktform mit Parabel-Labor, KI-gestützter Aufgabenauswahl über Cloudflare Workers AI, Abschlusscheck und lokalem Fortschritt; [Ablage und Prüfung](dokumentation/FORMENWECHSEL.md).
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

Fachübergreifende Tools liegen unter `tools/` und erscheinen im eigenen Einstieg **Werkzeuge** auf der Startseite. Weitere Dateien werden beim Build automatisch in diesen Katalog aufgenommen; technische Asset-Ordner bleiben ausgeblendet. Die **Ruhe-Safari** (`tools/ruhe-safari.html`) lässt bei ruhiger Arbeit eine Themenwelt wachsen. Mikrofonzugriff benötigt HTTPS (GitHub Pages) oder localhost und die Freigabe im Browser; zum Ausprobieren gibt es einen Testmodus ohne Mikrofon. `werkzeuge/` bleibt die technische, unveröffentlichte Ablage für Build-Skripte und Backends. Die fachliche Sollstruktur bleibt unverändert.

Die Ruhe-Safari ergänzt jede Welt um bewegte Hintergrunddetails wie Wolken, Wasserkringel, Luftblasen, Sterne oder Schnee. Neue Runden verteilen die Motive zufällig auf zur Landschaft passende Boden-, Wasser- und Himmelszonen. Die Platzierung reserviert auch den Bewegungsraum aller ausgewählten Motive. Beim Pausieren und Fortsetzen bleiben die Plätze im selben Bildformat erhalten. Bewegungsschalter und reduzierte Bewegung gelten auch für den Hintergrund. Die Platzierungslogik liegt in `tools/ruhe-safari-scene.js`. Mit `node --test tests/ruhe_safari_scene.test.mjs` lassen sich alle Welten mit verschiedenen Zufallsfolgen prüfen.

Zusätzliche Farbstimmungen passen zur jeweiligen Welt: goldener Sonnenschein in der Savanne, türkisfarbene Wasserreflexe, bunte Nebel und Sternschnuppen im All, Regenbogen und Leuchtpunkte im Garten, tropisches Meeresfunkeln, Polarlichter und Schneeglitzern sowie farbige Lichtreflexe in Murmelbahn und Kunstwerk. Die Effekte bleiben hinter den Motiven und folgen ebenfalls dem Bewegungsschalter.

Atmosphärische Details erhalten individuelle, leicht verformte oder geneigte Formen und unterschiedliche Bewegungsbahnen. Wolken verändern weich ihre Konturen, Wasserkringel bleiben flach, Sonnenstrahlen schwenken an ihrer Lichtquelle und Sternschnuppen sind entlang ihrer geraden Flugbahn ausgerichtet. Die zusätzlichen Form- und Bewegungsstile liegen in `tools/ruhe-safari-atmosphere.css`; die gemütliche Geschwindigkeit und reduzierte Bewegung bleiben erhalten.

Die gemütliche Gestaltung verwendet Creme- und Salbeitöne, weiche Bildrahmen, pastelliges Licht und ruhigeres Funkeln. Jede Welt hat eine eigene Rahmenfarbe, auch mit dunklen Nachtfarben im All. Tiere behalten ihre gut sichtbaren Bewegungswege bei sanfteren Bewegungszyklen. Die zusätzlichen Stile liegen lokal in `tools/ruhe-safari-cozy.css`.

Motive haben feste Mindestgrößen und werden für lange Wege nicht verkleinert. Tiere, Fische, Insekten und geeignete Fahrzeuge erkunden langsam die erreichbaren Bereiche ihrer Landschaft; Pflanzen und Gebäude bleiben verankert. Die Wegsuche berücksichtigt Boden und Wasser, Hindernisse und andere Figuren. Bei wenig Platz warten Motive. Neue Entdeckungen erhalten einen freien Erscheinungsplatz; Pause, Bewegungsschalter und reduzierte Bewegung halten auch das Wandern an.

Jede neue Runde mischt die Erscheinungsreihenfolge der ausgewählten Motive. Jedes Motiv besitzt eine eigene Basisgröße relativ zur Bildbreite. Daraus wird pro Runde eine Motivgröße mit bis zu ±10 Prozent Abweichung ausgelost (beim Forschungsboot ±8 Prozent, bei den Stilwelten ±6 Prozent). In Landschaften kann ein zur Szene passender Faktor für die Bildtiefe hinzukommen. Die Platzierung sucht freie Plätze in der passenden Bildkomposition.

Die Basisgrößen bilden deutlich unterschiedliche Größenklassen ab: Elefant und Giraffe sind wesentlich größer als ein Erdmännchen, Walhaie größer als Seepferdchen, Gebäude größer als Fahrräder und große Dinosaurier größer als Jungtiere. Die sichtbaren Bildflächen werden anhand ihrer transparenten Ränder zentriert und für die Abstandsprüfung berücksichtigt. Die zugehörigen Bildgrenzen stehen als `artworkBounds` in `tools/ruhe-safari-scene.js` und müssen bei einem Austausch der Motivbilder neu erfasst werden.

Alle weiteren Szenarien sind ebenfalls auf ihre sichtbaren Proportionen abgestimmt: Savannen- und Dinosauriertiere unterscheiden sich stärker nach ihrer Größenklasse, der Walhai ist größer als Delfin und kleine Fische. Stationsmodule und Versorgungsschiff sind deutlich größer als Astronaut und Container. Im Garten wachsen Baum, Sträucher und ausgewachsene Pflanzen über Keimlinge und Insekten hinaus; der Apfelbaum steht am Beetrand. Stadtgebäude und Forschungsstation sind größer als Fahrzeuge, Geräte und Kisten. Am Sternenhimmel bilden Planeten, Mond und Galaxie größere Motive als Sternpunkte und Satellit. Bei der Murmelbahn passen die größeren Rinnen und Aufbauten besser zur Murmel; im Mosaikbild sind Berg, Baum und Fluss größer als Boot, Blume und Fisch.

`perspectiveProfileFor` beschreibt die Bildtiefe je Landschaft. Auf dem Boden richtet sie sich nach dem Fußpunkt, im Wasser nach der Bildposition mit schwächerer Skalierung. Für Teichtiere, Boote und die Erdmännchenkolonie gelten engere Grenzen; die Abstandsprüfung reserviert stets die maximale sichtbare Größe. Weltraumstation, Sternenhimmel, Murmelbahn und Mosaikbild behalten bei vertikaler Bewegung ihre Größen, da ihre Darstellungen keine gemeinsame Bodenperspektive haben. Landschaften mit hohen Motiven nutzen 4:3; die Hintergrundbilder bleiben unverzerrt und Teich sowie Beete werden im veränderten Ausschnitt berücksichtigt. Die Bilder bleiben illustrative Welten mit lesbaren kleinen Motiven, keine maßstäblichen Modelle in Metern. Gebäude, Pflanzen und feste Gegenstände bleiben auch bei der Lautstärkewarnung an ihrem Platz.

Im Winterdorf bleiben die großen Häuser mit Basisgrößen von 48 und 60 Prozent der Bildbreite der gemeinsame Bezugspunkt. Tanne (25 Prozent), Laterne (22 Prozent), Schneemann und Schlitten (je 12 Prozent), Winterbrücke (22 Prozent), Bank (13 Prozent), Fuchs (7,5 Prozent) und Hase (5 Prozent) sind anhand ihrer sichtbaren Bildanteile aufeinander abgestimmt. Alle Motivgrößen streuen weiterhin um ±10 Prozent. Bodenmotive erscheinen je nach Bodenkontakt im Bild mit 92 bis 110 Prozent ihrer ausgelosten Größe; beim Wandern wird dieser Faktor kontinuierlich nachgeführt. Der maximal benötigte Platz bleibt für die Abstandsprüfung reserviert. Die Häuser entstehen als nahe Gruppe mit gemeinsamer Bodenlinie; Lage und Links-rechts-Reihenfolge variieren pro Runde. Das Bildformat 4:3 und der unverzerrte Hintergrund bleiben erhalten. Häuser, Gegenstände und Tanne schütteln sich bei der Lautstärkewarnung nicht; Tiere können weiterhin erschrecken.

Bei zu hoher Lautstärke erscheint ein großer Hinweis „Zu laut – Bitte wieder leiser arbeiten.“ mit Ausrufezeichen. Ein kräftiger Rahmen und die farblich hervorgehobene Lautstärkeskala unterstützen die Warnung auch bei ausgeschalteter oder reduzierter Bewegung. Nach ausreichend ruhiger Arbeit verschwindet sie automatisch.

Unter **Welche Welt soll wachsen? → Erdmännchensafari** gibt es einen zusätzlichen Modus mit bis zu **30 Erdmännchen**. Die Kolonie nutzt das vorhandene Savannenbild und ausschließlich das Erdmännchenmotiv; weitere Bilddateien werden nicht benötigt. Die Tiere erscheinen nach und nach in zufälliger Reihenfolge, haben individuelle Größen mit ±8 Prozent Abweichung und bewegen sich langsam auf dem Boden mit Abstand zum Teich und zueinander. Die schmale sichtbare Form wird bei den Abständen berücksichtigt. Mikrofon, Demo, Pause, Warnung und Bewegungsschalter funktionieren wie in den anderen Welten.

**Zauberwald – Lichtung und Bach** ergänzt 36 Waldtiere, Vögel, Bachbewohner und kleine Entdecker. Große Säugetiere bewegen sich auf der Lichtung, Vögel und fliegende Insekten darüber; Ente und Schwan bleiben im Bach neben dem Holzsteg. Weitere Bachbewohner nutzen die Ufer. **Otterwelt – Am ruhigen Fluss** enthält zwölf Motive mit Einzelottern, Jungtier, Paar, Familie und Baumstamm. Schwimmende Otter paddeln langsam im Wasser; der schlafende Otter ruht am Ufer und der Baumstamm schaukelt sanft. Beide Welten unterstützen dieselben Mikrofon-, Demo-, Auswahl-, Pausen- und Warnfunktionen wie die übrigen Szenen. Blätter, Lichtstrahlen, Glühwürmchen, Wasserkringel und Lichtreflexe ergänzen die Atmosphäre.

Die neuen Bildsätze liegen als 50 unveränderte WebP-Dateien unter `tools/assets/ruhe-safari/zauberwald/` und `tools/assets/ruhe-safari/otterwelt/`. `tools/ruhe-safari-worlds.js` enthält ihre Namen, lokalen Bildpfade, Basisgrößen, Bewegungsarten und vermessenen sichtbaren Bildgrenzen. Das Applet lädt diesen lokalen Katalog ohne Netzwerkdienste oder zusätzliche Bibliotheken. Die ZIP-Pakete, PNG-Duplikate, Bildprompts und mitgelieferten Beispiel-Applets werden nicht veröffentlicht; im Materialkatalog erscheinen weiterhin nur die eigentlichen Werkzeuge.

Die Stilwelten ergänzen Tropischen Regenwald, Bauernhof, Almwiese, Nächtlichen Garten, Gezeitenküste, Wüstenoase, Kirschblütengarten und Schwebende Märcheninseln. Der Jahreszeitenwald lässt sich in vier eigenen Fassungen auswählen. Im Querformat ist die ganze Landschaft sichtbar. Im Hochformat zeigt die Szene einen mittigen 5:4-Ausschnitt mit größeren kleinen Motiven und eigenen Positionen. Eine Drehung des Bildschirms ordnet die Tiere für den neuen Ausschnitt an und erhält alle bereits entdeckten Motive. Die Stilwelten nutzen positionsbezogene Effekte wie fallende Blüten, Brandung, Wasserfälle, Sandstaub und Schneefall. Wiederkehrende Waldtiere nutzen dieselben lokalen WebP-Dateien wie im Zauberwald.

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

Der Pilot für adaptive Lernpfade mit persönlichen Lerncodes, Cloudflare-Speicherung
und optionaler fobizz-Lernbegleitung ist unter [ADAPTIVE_LERNPFADE.md](dokumentation/ADAPTIVE_LERNPFADE.md)
beschrieben. Der Website-Build benötigt dafür zusätzlich Node.js 24.

Die Verzeichnisse `gemeinsam/privat` und `gemeinsam/entwuerfe` werden beim Website-Build ausgeschlossen. Das ist **kein Zugriffsschutz**: Vertrauliche bzw. personenbezogene Dateien gehören grundsätzlich nicht in ein öffentliches GitHub-Repository.

Codex soll keine Commits oder Pushes ausführen, sofern dies nicht ausdrücklich beauftragt wurde.
