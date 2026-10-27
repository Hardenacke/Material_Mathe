# Prüfprotokoll: Mathematikwettbewerbe

Stand: 27. Oktober 2026. Geprüft wurde die lokale Implementierung; ein produktiver
Cloudflare-Dienst wurde nicht eingerichtet oder veröffentlicht.

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

Cloudflare-Login, eigene Secrets, Schreibrecht auf das echte private Ergebnisrepository
und die konkrete HTTPS-Workeradresse werden erst beim Einrichten verbunden.
Zwei physische Endgeräte, iPad Safari und VoiceOver sowie Verhalten im tatsächlichen
Schulnetz wurden nicht getestet. Das lokale Browserergebnis ersetzt diese Abnahme nicht.
Die zwölf Demo-Fragen benötigen vor regelmäßigem Wettbewerb eine fachliche
Erweiterung und Freigabe.

Lokale Vorschauen liegen unter `.local/wettkaempfe/portal-ipad.png`,
`.local/wettkaempfe/spiel-ipad.png` und `.local/wettkaempfe/spiel-mobil.png`.
