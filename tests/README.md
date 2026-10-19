# Tests

Nach Änderungen zuerst `python werkzeuge/build_site.py`, danach `python werkzeuge/site_pruefen.py`, `python werkzeuge/struktur_pruefen.py` und `python -m unittest discover -s tests` ausführen.

`python tests/run_navigation_browser.py` prüft die vier Navigationsstufen, alle vorhandenen Mathematik-Materialien, Methoden, Suche, Browser-Zurück/-Vorwärts, Klickfeedback und Rückwege aus Materialien und Folgeseiten. Der Test simuliert einen GitHub-Pages-Unterpfad. Er verwendet vorhandenes Edge/Chromium und benötigt keine weiteren Pakete. Mit `--browser PFAD` lässt sich der Browser auswählen; `--screenshots` legt Vorschauen unter `.local/navigation-preview/` ab.
