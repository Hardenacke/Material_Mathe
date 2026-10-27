# Prüfprotokoll: Mathematikwettbewerbe

Stand: 27. Oktober 2026. Geprüft wurden die lokale Implementierung und das auf
ausdrücklichen Auftrag veröffentlichte Beispielquiz auf Cloudflare.

## Gehostetes Beispiel: Live-Prüfung

Worker-Version: `7db29286-82e0-4099-9803-153028ef47b8`.
Portal: `https://mathe-wettkampf-api.physik-wettkampf-api.workers.dev/`.
Wettbewerb: `beispiel-quadratische-funktionen`, Gruppe: `mathe-beispiel`.
Zugangscodes und Verwaltungszugang bleiben ausschließlich in der privaten lokalen Ablage.

| Prüfung | Ergebnis |
| --- | --- |
| Lokale Regeltests / Worker-Integration / Pakettests | 35 / 15 / 2 Tests bestanden |
| Deployment | Cloudflare bestätigt Worker und öffentliche Portal-Assets; vorhandene Secrets weiterverwendet |
| Zwei Testzugänge | Import und Anmeldung erfolgreich; ausschließlich die eigene Beispielrunde sichtbar |
| Browser: Edge im Hintergrund | Alle zwölf Fragen beantwortet, 12 richtige Antworten, 11.909 von 12.000 Punkten |
| Wiederaufnahme | Neuladen und erneute Anmeldung erhalten Versuch und Fragefrist |
| Gemeinsame Rangliste | Erster Zugang sieht das Ergebnis des zweiten Zugangs und ist noch startbereit |
| Bildschirmbreiten | 320, 390, 768 und 1024 Pixel ohne horizontalen Überlauf |
| JavaScript | Keine Browserfehler |
| Öffentliche Dateien | Portal, KaTeX, Abbildungen und Favicon erreichbar |
| Private Dateien | `.dev.vars`, Fragenbank, Verwaltung, Workerquelltext und generierte Definitionen liefern HTTP 404 |
| GitHub-Ergebnisarchiv | HTTP 200 auf `ergebnisse/snapshots/beispiel-quadratische-funktionen/v1/gesamt/latest.json`; Revision 1, gefilterte Rangliste |

Browserprotokoll und Screenshots liegen unter `.local/wettkaempfe/beispiel-online-*`.
Die folgenden Abschnitte dokumentieren frühere lokale Prüfstände.

## Aktualisierung: Ergebnisarchiv analog zu Material_Physik

Die lokale Physik-Architektur wurde mit der vorhandenen Mathematikimplementierung
verglichen. Das Archivziel ist nun `Hardenacke/Material_Mathe/ergebnisse/`.
Versionierte Adapter, private Backend-Arbeitskopie und Backend-ZIP wurden aktualisiert.
Eine bereits angepasste Portaladresse und bestehende private Wettbewerbsdefinitionen
wurden erhalten. Es wurde weder ein Deployment noch ein Commit oder Push ausgeführt.

| Prüfung der aktuellen Änderung | Ergebnis |
| --- | --- |
| Regelkern und Archivregeln | 35 Tests bestanden: 31 vorhandene und 4 neue Archivtests |
| `npm.cmd run test:integration` | 15 Tests mit echtem lokalem `workerd` und SQLite bestanden |
| Öffentliche Ergebnisablage | Ohne Freigabe oder bei unbekannter Sichtbarkeit keine Schreibzugriffe; mit Freigabe nur gefilterte Ranglistendaten |
| Archivgrenzen | Nur GET/PUT auf definierte Ergebnisdateien; Traversal, fremde Dateien, falsche Präfixe und Löschmethoden abgewiesen |
| Wiederaufnahme und Konflikte | SHA-Konflikt erneut gelesen; Revisionen bestätigt; alte vorgemerkte Archivpfade nach Neustart unter `ergebnisse/` geschrieben |
| `npm.cmd run deploy:check` | Erfolgreicher lokaler Dry-Run mit drei SQLite-Durable-Objects und dem neuen Archivziel |
| `python werkzeuge/build_site.py` | Erfolgreich; 322 sichtbare Materialien |
| `python werkzeuge/site_pruefen.py` | Erfolgreich; Ergebnisordner und Backend fehlen in der Pages-Ausgabe |
| `python werkzeuge/struktur_pruefen.py` | Erfolgreich; 9 Bereiche, 33 Inhaltsfelder, 105 Themen |
| `python -m unittest discover -s tests` | 16 von 17 Tests bestanden; derselbe bereits dokumentierte PPTX-Dateinamenbefund wie unten |

Integrationstests und vollständige Python-Tests benötigten wegen Windows-Sandboxrechten
eine Ausführung außerhalb der Sandbox. Alle GitHub-Aufrufe der Integrationstests
gingen ausschließlich an den lokalen Testdienst; echte Ergebnisdateien wurden nicht geschrieben.
Browser- und Endgerätetests wurden für diese Backendänderung nicht erneut ausgeführt.
Das Pages-Verhalten für reine Ergebnis-Commits ist lokal konfiguriert, jedoch noch
nicht durch einen echten GitHub-Actions-Lauf abgenommen.

## Ursprüngliche Portalabnahme

Die folgenden Ergebnisse dokumentieren den früheren Aufbau des Portals; für die
aktuelle Backendänderung gelten die Prüfungen oben.

| Prüfung | Ergebnis |
| --- | --- |
| Konfigurationen, private Poolverweise und SVG-Pfade | Drei gültige Entwürfe, zwölf Demo-Fragen |
| Übernommener Regelkern: `npm test` | 31 Tests bestanden |
| HTTP-/Speicheradapter: `npm run test:integration` | 12 Tests in echtem lokalem `workerd` mit SQLite bestanden |
| Bereitstellung: `npm run deploy:check` | Wrangler-Bundle mit drei SQLite-Durable-Objects erfolgreich; nur Dry-Run |
| Paketprüfung mit npm | Keine gemeldeten Sicherheitslücken im verwendeten Abhängigkeitsstand |
| `python werkzeuge/build_site.py` | Erfolgreich; 308 sichtbare Materialien |
| `python werkzeuge/site_pruefen.py` | Erfolgreich; Portal vollständig, Backend und Codes nicht veröffentlicht |
| `python werkzeuge/struktur_pruefen.py` | Erfolgreich; 9 Bereiche, 33 Inhaltsfelder, 105 Themen |
| Bestehende Navigation: `python tests/run_navigation_browser.py` | 966 Prüfungen bestanden; 281 unterschiedliche Mathematik-Materialien erreichbar |
| Portal gegen isolierte echte lokale API | Edge/Chromium: Anmeldung, Neuladen, unveränderte Fragefrist, zwei Zugänge, Rangliste, Gleichstand, erneuter Versuch, Offline/Online, Abmeldung bestanden |
| Portalbreite | 320, 390, 768 und 1024 Pixel ohne horizontalen Überlauf; keine JavaScript-Fehler |
| Formeln und öffentliche Assets | Lokales KaTeX geprüft; zugehörige Fonts und Abbildungen vorhanden |
| Transportables privates Backend | ZIP-Integrität und JSON geprüft; 46 Dateien, keine Zugangsliste oder Laufzeitdaten |
| Repository-Unittests | 11 von 12 bestanden; ein bereits vorhandener Dateinamenbefund, siehe unten |

## Abgedeckte Backend-Fälle

- Fehlender/falscher Code, entzogenes Wettbewerbsrecht, gesperrter Zugang und fremder
  Versuch werden abgewiesen. Verwaltungsrechte sind von Schülerzugängen getrennt.
- Unbekannte Felder, unzulässige Antwortkennungen, falscher Inhaltstyp, ungültiges JSON,
  übergroße Requests und ungültige Anfrage-UUIDs werden abgewiesen.
- Zwei gleichzeitige Starts erzeugen denselben aktiven Versuch. Wiederholte Antworten
  geben keine doppelten Punkte. Geänderter Inhalt beziehungsweise andere Operation
  mit demselben Idempotenzschlüssel ergibt 409.
- Fällige Fristwirkungen bleiben gespeichert, auch wenn die folgende Spielaktion
  fachlich ungültig ist. Ein echter zeitgesteuerter Durable-Object-Alarm beendet eine
  unbeantwortete Frage ohne weitere Browseranfrage und trägt den Bestwert ein.
- Eviction und Neustart erhalten den aktiven Versuch und seine Frist. Eine geänderte
  Definition unter derselben Version blockiert neue Starts; aktive Schnappschüsse bleiben nutzbar.
- Beendete Versuche aktualisieren den Bestwert, statt Punkte aufzuaddieren. Versuchslimits
  bleiben wirksam. Monatsräume sind getrennt; andere Monate lassen sich nicht starten.
- Ein GitHub-Testdienst simuliert Ausfall und Wiederkehr. Die dauerhafte Warteschlange
  holt gespeicherte Revisionen geordnet nach und erzeugt Snapshot und Abschlussdatei.
  Dabei wurde kein echtes GitHub-Repository beschrieben.

## Vorhandener Befund außerhalb der Wettbewerbsänderung

`tests/test_site.py::test_repetition_presentations` erwartet
`klasse-9/01-arithmetik-algebra/wiederholung.pptx`. Im bereits vorhandenen Git-Stand
liegt dort stattdessen `M 9 Irrationale Zahlen & Wurzeln.pptx`.
Diese Materialdatei wurde nicht verschoben, umbenannt, ersetzt oder dupliziert.
Der Befund bleibt deshalb im allgemeinen Testlauf sichtbar. Die verbindlichen
Website- und Strukturprüfungen bestehen.

## Noch am tatsächlichen Bereitstellungsort zu prüfen

Die aktualisierte Workerimplementierung und ein Secret `GITHUB_TOKEN` mit Schreibrecht
auf **Material_Mathe** müssen am tatsächlichen Bereitstellungsort eingerichtet werden.
Die vorhandene HTTPS-Workeradresse wurde lokal erhalten; die Live-Verbindung und
das Schreiben in das echte öffentliche Ergebnisarchiv wurden hier nicht geprüft.
Zwei physische Endgeräte, iPad Safari und VoiceOver sowie Verhalten im tatsächlichen
Schulnetz wurden nicht getestet. Das lokale Browserergebnis ersetzt diese Abnahme nicht.
Die zwölf Demo-Fragen benötigen vor regelmäßigem Wettbewerb eine fachliche
Erweiterung und Freigabe.

Lokale Vorschauen liegen unter `.local/wettkaempfe/portal-ipad.png`,
`.local/wettkaempfe/spiel-ipad.png` und `.local/wettkaempfe/spiel-mobil.png`.
