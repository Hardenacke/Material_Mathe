# GitHub Pages – Einrichtung

## Einmalig
1. Repository auf GitHub öffnen.
2. **Settings → Pages** öffnen.
3. Unter **Build and deployment → Source** die Option **GitHub Actions** wählen.
4. Den vollständigen Projektstand auf `main` pushen.

## Automatischer Ablauf
`.github/workflows/pages.yml` führt bei jedem Push auf `main` aus:

1. Ordnerstruktur prüfen.
2. Materialkatalog automatisch aus den Dateien erzeugen.
3. `_site` neu bauen.
4. interne Site-Prüfung ausführen.
5. `_site` als GitHub Pages veröffentlichen.

## Neue Materialien
Eine Datei wird automatisch erkannt, wenn sie in einem Inhaltsfeld- oder Themenordner liegt und eine unterstützte Endung besitzt. HTML-Lernpfade können lokale Unterordner wie `assets`, `css`, `js`, `images` oder `fonts` verwenden; diese werden mitkopiert, aber nicht als eigenständiges Material gelistet.

## Lokal
`START_LOKAL.bat` starten. Der Browser öffnet die lokale Seite und der Watcher baut nach Änderungen automatisch neu.
