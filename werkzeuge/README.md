# Werkzeuge

- `python ordner_anlegen.py` – fehlende Themenordner und `.gitkeep` anlegen.
- `python struktur_pruefen.py` – Sollstruktur prüfen.
- `python katalog.py` – `data.json` aus vorhandenen Materialien erzeugen.
- `python build_site.py` – komplette GitHub-Pages-Ausgabe nach `_site/` bauen.
- `python site_pruefen.py` – gebaute Seite und Materialpfade prüfen.
- `python lokal.py` – lokale Vorschau mit automatischem Neubau unter `http://127.0.0.1:8000/`.

Der Website-Build behält den Ordner `_site` und bereinigt seinen Inhalt vor dem
Neubau. Schreibgeschützte Dateien werden freigegeben; bei vorübergehenden
Windows-Dateisperren wird das Löschen bis zu fünfmal erneut versucht. Bleibt
eine Sperre bestehen, bricht der Build mit dem betroffenen Pfad und einem Hinweis
zum Schließen von Dateien beziehungsweise zur OneDrive-Synchronisierung ab.
Die lokale Vorschau liefert `_site` direkt aus, ohne den Ordner als
Arbeitsverzeichnis festzuhalten.
