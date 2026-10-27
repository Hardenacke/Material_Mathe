# Mathematik-Wettbewerbe: Cloudflare-Backend

Diese Dateien ergänzen das Mathematikpaket aus `Wettkampf_Architekturen_Mathe_Physik.zip`
um HTTP-Anbindung, dauerhaften Spielzustand, Zugangsverwaltung, Archivschreiber und
Integrationstests. Sie enthalten selbst keine privaten Fragenpools und keine Zugänge.

Im Materialrepository werden sie durch `werkzeuge/wettkampf_vorbereiten.py` mit dem
Mathematikteil des ZIPs unter `.local/wettkaempfe/Material_Mathe_Wettkampf_API/`
zusammengeführt. Dieser Ordner ist die vollständige Arbeitskopie für ein **privates**,
separates Backend-Repository. Der Physikteil wird nicht importiert.

Der Einrichtungsleitfaden im Materialrepository steht unter
`dokumentation/WETTBEWERBE.md`. Die ursprünglichen Architekturtexte sind im
fertigen Backend unter `vorlage/` erhalten; deren Hinweise auf noch fehlende Adapter
beschreiben den ursprünglichen Lieferstand. Diese Adapter sind hier ergänzt.

Voraussetzungen: Node.js 24 oder neuer, für die Bereitstellung ein Cloudflare-Konto.

```text
npm ci
npm run check
npm test
npm run test:integration
npm run deploy:check
```

`deploy:check` bündelt den Worker lokal, ohne ihn zu veröffentlichen. Die drei
Beispielwettbewerbe bleiben `draft`. Für den Produktivbetrieb eine passende Gruppe,
fachlich geprüfte Aufgaben, einen Termin beziehungsweise Wertungsmodus und den
Status `published` in der betreffenden Wettbewerbsdatei festlegen.

Für eine isolierte lokale Vorschau im vorbereiteten Ordner:

```text
npm run vorschau -- --site ../../../_site
```

Die Vorschau nutzt drei temporär freigegebene Proberunden und zwei generierte
Testzugänge in `verwaltung/vorschau-codes.csv`. Sie ändert weder die Entwürfe noch
die öffentliche `config.js`, verwendet keine Cloud-Zugänge und verliert ihre
Spielstände beim Beenden. Portwahl bei Bedarf mit `--port 8001` ändern.

Für den echten Dienst:

```text
npx wrangler login
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put GITHUB_TOKEN
npm run deploy
```

`ADMIN_TOKEN` ist ein zufälliger Base64url-Wert mit mindestens 32 Zeichen, getrennt
von den Schülercodes. Das GitHub-Token darf ausschließlich das private Ergebnisrepository
beschreiben. `wrangler.jsonc` enthält dessen Namen, Zweig und erlaubte Portal-Ursprünge.
Keine Tokens, Klartextcodes, personenbezogenen Listen oder `.dev.vars` einchecken.

Neue Themen über `npm run neu -- ...` anlegen; die Anleitung aus dem ZIP steht in
`vorlage/NEUES_THEMA.md`. Nach Veröffentlichung Änderungen an Regeln, Gruppe oder
Aufgaben immer durch eine neue Version einführen. Statusänderungen sind separat möglich.

Die Integrationstests verwenden die zu Wrangler passende, exakt gebundene Miniflare-Version.
Ein Test startet einen echten lokalen `workerd`-Prozess mit SQLite, simuliert HTTP-Aufrufe
und ersetzt GitHub durch einen lokalen Testdienst. Dabei werden keine echten Archive geschrieben.
