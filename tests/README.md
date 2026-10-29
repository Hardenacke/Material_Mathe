# Tests

`node --test --test-isolation=none tests/quiz_anzeige.test.mjs` prüft vereinfachte
Formelschreibweisen und unveränderte mathematische Werte. `python tests/run_quiz_anzeige_browser.py`
prüft die gemeinsame Darstellung aller 39 Quizze mit 4.680 Aufgabenvarianten,
Ranglisten-Schaltflächen, Textfeldern und vollständigen Antwortvorschauen.
Mit `--engine webkit` wird WebKit mit iPad-Emulation geprüft; `--online` verwendet
die veröffentlichten Seiten, ohne Wettbewerbsresultate zu erzeugen.
Details: [QUIZ_DARSTELLUNG.md](../dokumentation/QUIZ_DARSTELLUNG.md).

`test_quiz_sekii.py` prüft die 15 Sek-II-Quizwelten samt EF/Q1/Q2- und GK/LK-Zuordnung,
lokalen Ressourcen und getrennten Ranglisten. `run_quiz_sekii_browser.py` prüft
alle 45 Trainingskombinationen und vollständige lokale Wettbewerbe; mit
`--flows-only --geometry-flow` zusätzlich den Ablauf mit serverbewerteten Vektoren.
`--flows-only --extrema-flow` prüft variable Extremwertaufgaben mit fünf Minuten,
angezeigtem Zeitbudget und unveränderter Frist nach Neuladen. Die Regeltests unter
`werkzeuge/sekii_quiz_backend/test/` prüfen Zahlenvarianten und Lösungen mit
unabhängigen numerischen Verfahren sowie den anteiligen Zeitbonus.
Der Online-Aufruf mit `--url URL --smoke` liest die veröffentlichten Seiten.
Einrichtung: [QUIZ_SEKII.md](../dokumentation/QUIZ_SEKII.md).

`python tests/run_quiz_sekii_ipad.py` prüft die sechs Sek-II-Quizze mit
Konstruktionsaufgaben per Touch in Edge/Chromium und WebKit mit iPad-Emulation.
Geprüft werden Auswahl vor Punktübernahme, Randpunkte, negative Koordinaten,
nachträgliches Bearbeiten, Duplikate, Punktbegrenzung, Tastatur, Scrollgesten,
Vergrößerung, Hoch-/Querformat und Bewertung. Offline-Konstruktionen werden in
Chromium geprüft, WebKit kontrolliert die vorhandenen Offline-Ressourcen. Die
WebKit-Offline-Emulation hat einen [bekannten Fehler](https://github.com/microsoft/playwright/issues/42775).
Der Test
verwendet ausschließlich Training und kann mit `--url URL` auch veröffentlichte
Seiten prüfen. Benötigt Playwright, Edge und `python -m playwright install webkit`;
`--engine chromium` oder `--engine webkit` begrenzt den Lauf auf einen Browser.
Lokale Bilder liegen unter `.local/sekii-quiz/ipad/`.

`test_quiz_seki.py` prüft die 24 Quizzuordnungen, gemeinsame lokale Ressourcen,
Folgeseiten, Quiz- und Klassenfilter sämtlicher Ranglisten und die Trennung vom Backend. `tests/run_quiz_seki_browser.py` prüft
die Oberflächen gegen den lokalen Cloudflare-Worker; Einrichtung und genaue
Prüfungen stehen in [QUIZ_SEKI.md](../dokumentation/QUIZ_SEKI.md).

Nach Änderungen zuerst `python werkzeuge/build_site.py`, danach `python werkzeuge/site_pruefen.py`, `python werkzeuge/struktur_pruefen.py` und `python -m unittest discover -s tests` ausführen.

`test_build_output.py` prüft die Ausgabebereinigung mit schreibgeschützten
Dateien, einem Arbeitsverzeichnis in `_site`, vorübergehenden und dauerhaften
Dateisperren sowie den Schutz der Quelldateien vor einem falschen Löschziel.

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
`python tests/run_wurzelwerk_browser.py --timeout-test` prüft mit Playwright und Edge
die getrennten Quizansichten, alle neun Trainingskombinationen, die Zifferntastatur,
einen vollständigen Zeitwettbewerb, erhaltene Eingaben nach Neuladen und einen echten
60-Sekunden-Zeitablauf. Der Test verwendet ein eigenes anonymes Browserprofil und
schreibt dessen Testbestwert in die Wettbewerbsrangliste. Mit `--url URL` lässt
sich die veröffentlichte Oberfläche prüfen; ohne URL läuft die lokale `_site`-Vorschau.
Eine Portalprüfung gegen die echte lokale API ist mit
`python tests/run_wettkampf_browser.py --url VORSCHAU-URL --codes PRIVATE-CSV`
möglich; dafür werden Playwright und ein lokal vorhandener Edge-Browser verwendet.

`test_quadratische_funktionen.py` prüft die eindeutige Themenzuordnung der neuen
Lernpfade, H5P-Downloads, das Hypervideo und die Veröffentlichungstrennung.
`python tests/run_quadratische_funktionen_browser.py` prüft mit Playwright und Edge
alle zwölf Lernpfade und ihre direkt spielbaren Lernchecks, Eingaben und
Rückmeldungen, Regler, gespeicherten Arbeitsstand, lokales Öffnen, die drei
Videos und die drei pausierenden Kontrollfragen im Beispielvideo bei
320, 390, 768 und 1024 Pixeln. In der vorhandenen lokalen Umgebung kann
`.local\manim-venv\Scripts\python.exe` als Python mit Playwright verwendet werden.
