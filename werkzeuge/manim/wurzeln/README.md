# Wurzeln verstehen – Manim-Quellen für Klasse 9

Drei stumme Erklärvideos aus dem bereitgestellten Paket
`wurzel-erklaervideos-klasse-9.zip`: Quadratzahlen, Intervallschachtelung und
Heron-Verfahren. Alle Erklärungen stehen im Bild. Die veröffentlichten Videos
werden aus diesen Manim-Szenen gerendert; die Vorschau-MP4s des ZIPs werden
nicht verwendet.

## Erneut rendern

Python 3.12 und eine LaTeX-Installation mit `latex` und `dvisvgm` werden benötigt.
Siehe die [offizielle Manim-Installation](https://docs.manim.community/en/stable/installation/uv.html).
Aus dem Repository-Stamm:

```sh
python -m pip install -r werkzeuge/manim/wurzeln/requirements-manim.txt
python werkzeuge/manim/wurzeln/rendern.py
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
```

`--only quadratzahlen`, `--only intervallschachtelung` oder `--only heron`
rendert nur ein Video. `--package-only` übernimmt bereits vorhandene Render.
Temporäre Render und Logs landen in `.local/`, die veröffentlichbaren
1080p-MP4s (H.264, 30 fps, schneller Wiedergabestart) und Vorschaubilder unter
`klasse-9/unterstuetzung/assets/wurzeln/`. `render-info.json` dokumentiert
Version, Laufzeit und SHA-256-Prüfsummen (Quelltexte mit LF-Zeilenenden). Das Skript decodiert jedes Video
vollständig, bevor es als geprüft dokumentiert wird.

Die Website ist `klasse-9/unterstuetzung/wurzeln-erklaervideos.html`.
Die Quellen liegen außerhalb der veröffentlichten Schülerseiten.
GitHub Pages benötigt beim normalen Build keine Manim-Installation.

## Anpassungen gegenüber dem ZIP

- Dunkle Standardfarbe für Formeln auf hellem Hintergrund.
- Verfügbare Schrift automatisch wählen: DejaVu Sans, Arial oder Liberation Sans.
- Zweizeilige Heron-Beschriftung links an der senkrechten Rechteckseite,
  damit lange Dezimalwerte nicht über den linken Bildrand ragen.
- Mathematische Indizes mit LaTeX statt fehlender Schriftzeichen darstellen.
- Beim MP4-Export Zeitstempel auf gleichmäßige 30 fps vereinheitlichen.
- Videoseite mit Rücknavigation, Downloads und Übungen mit aufklappbaren Lösungen.

Fachliche Metadaten und Lernziele stehen in `inhalt_*.json`, die Zuordnung
von Dateien zu Szenen in `video_manifest.json`.
