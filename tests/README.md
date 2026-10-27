# Tests

Nach Änderungen zuerst `python werkzeuge/build_site.py`, danach `python werkzeuge/site_pruefen.py`, `python werkzeuge/struktur_pruefen.py` und `python -m unittest discover -s tests` ausführen.

`python tests/run_navigation_browser.py` prüft die vier Navigationsstufen, alle vorhandenen Mathematik-Materialien, Methoden, Suche, Browser-Zurück/-Vorwärts, Klickfeedback und Rückwege aus Materialien und Folgeseiten. Der Test simuliert einen GitHub-Pages-Unterpfad. Er verwendet vorhandenes Edge/Chromium und benötigt keine weiteren Pakete. Mit `--browser PFAD` lässt sich der Browser auswählen; `--screenshots` legt Vorschauen unter `.local/navigation-preview/` ab.

`test_wettkaempfe.py` prüft die Veröffentlichungstrennung und den geschützten ZIP-Import.
Der Ergebnisordner `ergebnisse/` muss vollständig außerhalb von `_site/` bleiben.
Im vorbereiteten privaten Backend prüfen `npm test` den übernommenen Regelkern und
die Archivregeln (Positivliste und Beschränkung auf Ergebnisdateien).
`npm run test:integration` prüft die HTTP-/SQLite-/Alarm-Adapter sowie öffentliche
Archive, SHA-Konflikte und alte ausstehende Archivaufträge in der Workers-Laufzeit.
`npm run deploy:check` prüft das Worker-Bundle ohne Veröffentlichung.
`test/wurzelwerk.test.mjs` und der Wurzelwerk-Fall der Worker-Integration prüfen die
Zahlenaufgaben, Teilpunkte, persönlichen Quiz-Zugänge und serverseitige Bewertung.
Die Online-Browserprüfung für Wurzelwerk ist in `dokumentation/WURZELWERK.md` dokumentiert.
Eine Portalprüfung gegen die echte lokale API ist mit
`python tests/run_wettkampf_browser.py --url VORSCHAU-URL --codes PRIVATE-CSV`
möglich; dafür werden Playwright und ein lokal vorhandener Edge-Browser verwendet.

`test_quadratische_funktionen.py` prüft die eindeutige Themenzuordnung der neuen
Lernpfade, H5P-Downloads, das Hypervideo und die Veröffentlichungstrennung.
`python tests/run_quadratische_funktionen_browser.py` prüft mit Playwright und Edge
alle zwölf Lernpfade, Eingaben und Rückmeldungen, Regler, gespeicherten Arbeitsstand,
lokales Öffnen und die drei Videos bei 320, 390, 768 und 1024 Pixeln.
