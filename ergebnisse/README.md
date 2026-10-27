# Ergebnisse der Mathematik-Wettbewerbe

Der Cloudflare-Worker `mathe-wettkampf-api` speichert die Ranglisten automatisch
in `Hardenacke/Material_Mathe` unter diesem Ordner. Die
Dateien sind auf GitHub öffentlich. Veröffentlicht werden ausschließlich
Wettbewerbs- und Raumkennungen sowie Platz, Pseudonym, Bestwert, Maximalpunkte und
Abschlusszeit. Zugangscodes, Codehashes, Personen-IDs, Fragen und Lösungen fehlen.
Als Pseudonyme keine Klarnamen verwenden.

```text
ergebnisse/
  snapshots/WETTBEWERB/vVERSION/ZEITRAUM/latest.json
  perioden/WETTBEWERB/vVERSION/ZEITRAUM/final.json
```

`latest.json` enthält die zuletzt gesicherte Rangliste, `final.json` den Stand nach
Abschluss eines Wertungszeitraums. Der Zeitraum ist `gesamt` oder ein Monat wie
`2026-10`. Eine unbefristete Gesamtwertung erhält ohne Enddatum keinen automatischen
Abschluss. Frühere Revisionen bleiben in der GitHub-Dateihistorie erhalten.
Die `instanceId` kennzeichnet den Cloudflare-Spielraum, keine Person.

Vorgesehene Worker-Konfiguration:

```json
"ARCHIVE_REPOSITORY": "Hardenacke/Material_Mathe",
"ARCHIVE_ALLOW_PUBLIC": "true",
"ARCHIVE_BRANCH": "main",
"ARCHIVE_PREFIX": "ergebnisse"
```

Der GitHub-Token benötigt ausschließlich für **Material_Mathe** die Berechtigung
**Contents: Read and write**. Er gehört als Secret `GITHUB_TOKEN` in den Worker.
Die aktualisierte Implementierung muss anschließend aus der vorbereiteten privaten
Backend-Arbeitskopie bereitgestellt werden. Einrichtung und Prüfung stehen im
[Wettbewerbsleitfaden](../dokumentation/WETTBEWERBE.md).

Cloudflare bleibt der maßgebliche Live-Speicher. Ein Archivausfall unterbricht das
Spiel nicht; offene Schreibaufträge werden erneut versucht. Die Ergebnisdateien
stellen weder aktive Spiele noch Zugänge wieder her. Auch bereits vorgemerkte
Aufträge mit älteren Archivpfaden verwenden künftig diesen Ergebnisordner.

Cloudflare schreibt auf GitHub; die lokale Arbeitskopie erhält die Dateien beim
nächsten Git-Abruf. Der Website-Build kopiert diesen Ordner nicht nach `_site/`.
Nach Übernahme der Workflowänderung lösen reine Ergebnis-Commits keinen Pages-Build aus.
