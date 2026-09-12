# Start hier: Mathematik-Seite auf GitHub veröffentlichen

Das Paket ist so vorbereitet, dass **Codex, GitHub Desktop und GitHub Pages mit demselben Repository arbeiten**.

## Schnellstart

1. Den **gesamten Inhalt** dieses Ordners in dein lokales Mathematik-Repository kopieren.
2. Lokal `START_LOKAL.bat` starten und die Seite prüfen.
3. In GitHub Desktop die Änderungen committen und auf `main` pushen.
4. Auf GitHub einmalig **Settings → Pages → Source → GitHub Actions** einstellen.
5. Der Workflow `pages.yml` baut und veröffentlicht die Seite automatisch.

## Danach im Alltag

Neue Datei nur im fachlich passenden Themenordner speichern. Beim nächsten lokalen Build bzw. GitHub-Push wird sie automatisch in der Materialübersicht angezeigt. Die `data.json` muss nicht von Hand gepflegt werden.

Beispiel:

```text
klasse-7/03-geometrie/03-innenwinkelsummen/
├── lernpfad.html
├── arbeitsblatt.pdf
└── assets/
```

Die vorhandene `wiederholung.pptx` bleibt direkt im Inhaltsfeldordner. Neue Präsentationen sollen die Vorlage in `gemeinsam/vorlagen/` verwenden.
