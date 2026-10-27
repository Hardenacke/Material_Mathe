# Quadratische Ergänzung – Quellen und fertige Videos

Übernommen aus `Materialpaket_Quadratische_Funktionen_Klasse_9_NRW.zip`.
Der Manim-Quelltext und das Storyboard bleiben hier erhalten. Die fertigen MP4s
werden unter `klasse-9/02-funktionen/01-quadratische-funktionen/assets/quadratische-ergaenzung/`
veröffentlicht. Die Videoseite liegt im gleichen Themenordner als
`quadratische-ergaenzung-videos.html`.

## H5P erneut erzeugen

Ausgehend vom Repository-Stamm:

```text
python werkzeuge/manim/quadratische-ergaenzung/h5p/build_hypervideo.py
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
```

Das mitgelieferte Erzeugungsskript wurde nur bei den Eingabe- und Ausgabepfaden
an diese Ablage angepasst. Es liest die veröffentlichte Beispiel-MP4 und schreibt
das H5P-Paket ebenfalls in den technischen Medienordner. Die Inhalts-JSONs bleiben
hier unter `h5p/source/`. H5P-Bibliotheken sind im Zielsystem erforderlich.

## Szenen erneut rendern

Die mitgelieferte `requirements.txt` bindet die verwendete Manim-Version.
Zusätzlich sind LaTeX, dvisvgm und FFmpeg erforderlich. Mit einer passenden
Manim-Umgebung kann aus dem Repository-Stamm gerendert werden:

```text
python -m manim render werkzeuge/manim/quadratische-ergaenzung/quadratische_ergaenzung.py SquareAreaIdea WorkedExample PracticeAndRule --resolution 1280,720 --fps 30 --disable_caching --media_dir .local/manim-media/quadratische-ergaenzung
```

Die Szenen `SquareAreaIdea`, `WorkedExample` und `PracticeAndRule` entsprechen den
Dateien `01_Flaechenidee.mp4`, `02_Beispiel_x2_4x_3.mp4` und `03_Uebung_x2_8x_5.mp4`.
Neue Render erst nach Prüfung in den veröffentlichten Medienordner übernehmen
und dann das Hypervideo erneut erzeugen. Die zeitgebundenen Interaktionen müssen
zu den Lösungsschritten des neuen Videos passen.

Beim Import wurden die bereits gerenderten Videos verwendet. Ein normales
GitHub-Pages-Build benötigt weder Manim noch LaTeX.
