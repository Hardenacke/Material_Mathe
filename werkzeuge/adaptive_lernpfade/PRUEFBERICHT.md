# Prüfbericht · Version 3.0

Prüfstand: 3. November 2026. Lokal geprüft, nicht veröffentlicht.

## Erfolgreiche Prüfungen

- 49 Node-Tests für Fachlogik, Rollen, Codes, Persistenz, additive v2-Migration, Moduswahl, Kontexttrennung, Chatlimits, Wiederholungsschutz, verworfene asynchrone Antworten, Löschwege und geprüfte Folgeaufgaben.
- Der aus dem Starter dokumentierte `increase`-Randfall wurde korrigiert: Fehlende jüngere Erfolgsbelege führen bei einer Empfehlung zum Erhöhen nicht zu einer Absenkung der bestehenden Anforderung.
- Worker-Bundle mit Wrangler 4.153.0 und `deploy --dry-run` erfolgreich gebaut, ohne Upload.
- Echter lokaler Worker mit SQLite-basiertem Durable Object, eigener Test-Schulkennung und ausschließlich lokalen Testgeheimnissen gestartet.
- Browserprüfung in Edge/Chromium und WebKit mit Touch und Ansichten 390, 768 und 1024 Pixel: Demo, lokale Dateiöffnung, Lehrkraftanmeldung, Erstellung zweier Lernplätze, zwei Aufgaben, Moduswechsel, manueller Feedbacktransfer, Wiederanmeldung, getrennte Lernstände, widerrufene alte Konfiguration und anschließendes Löschen der Testräume.
- Feedback mit HTML wurde als Text dargestellt. Keine JavaScript-Fehler, keine externen Netzwerkanfragen und keine Anmeldedaten in Cookie oder Local Storage.
- Website-Build, Siteprüfung und Strukturprüfung erfolgreich: 9 Bereiche, 33 Inhaltsfelder, 105 Themen, 363 Materialien.

Lokal erzeugte Browserbilder: `.local/adaptive-lernpfade/browser/`. Keine Lerncodes oder Schlössel werden durch das Testskript ausgegeben. Der verwendete fobizz-Link war eine lokale Testreferenz und wurde nicht geöffnet.

## Bestehende Repositoryprüfung

`python -m unittest discover -s tests`: 31 von 32 Tests erfolgreich. Der bestehende Test `test_repetition_presentations` scheitert an fehlender `klasse-9/01-arithmetik-algebra/wiederholung.pptx`. Zusätzlich fehlt nach Bestandsprüfung `ef/03-stochastik/wiederholung.pptx`. Beide Dateien fehlen bereits im bisherigen Git-Stand; vorhandene anders benannte Materialien wurden nicht verschoben oder umbenannt.

Die Katalogprüfung der quadratischen Lernpfade zählt ihre 14 Materialien nun anhand des Quellverzeichnisses, statt weitere zulössige Materialzuordnungen anderer Themen auszuschließen. Die Prüfung aller Zuordnungen auf richtige Ablage und eindeutiges Vorkommen bleibt erhalten.

## Verifikationsgrenzen

Kein Deployment auf GitHub Pages oder Cloudflare, keine echten fobizz-Aufrufe, kein fobizz-Login und kein physischer iPad-Test. WebKit-Emulation ersetzt nicht jede schulische Safari-Version. Der Chatablauf einschließlich asynchroner Rückmeldungen ist mit einem injizierten Testadapter geprüft; der produktive Adapter bleibt gesperrt. Keine bestätigte externe API oder Providerlöschung wird behauptet. Unterrichtliche Wirksamkeit und Lastverhalten sind noch nicht erprobt.
