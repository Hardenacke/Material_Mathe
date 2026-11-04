# Adaptive Lernpfade · Quellen und Backend

Version 3.0, 3. November 2026. In das vorhandene Material_Mathe-Repository integriert.

Die öffentliche Oberfläche wird aus `src/` nach `gemeinsam/adaptive-lernpfade/` gebaut. `python werkzeuge/build_site.py` im Repository-Stamm übernimmt diesen Schritt automatisch und erzeugt anschließend `_site`. Dieser Ordner mit Backend, Dokumentation und Tests wird nicht veröffentlicht.

- [Überblick im Repository](../../dokumentation/ADAPTIVE_LERNPFADE.md)
- [Einrichtung](EINRICHTUNG.md)
- [Architektur](ARCHITEKTUR.md)
- [API-Vertrag](api/VERTRAG.md)
- [Prüfbericht](PRUEFBERICHT.md)
- [fobizz-Klärungsfragen](FOBIZZ_API_KLAERUNG.md)

Mit Node.js 24 im vorliegenden Ordner:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run deploy:check
```

Build und Tests haben keine npm-Abhängigkeiten. Wrangler wird bei den Workerbefehlen in der festgelegten Version 4.153.0 geladen. Unter PowerShell `npm.cmd` und `npx.cmd` verwenden, falls die Ausführungsrichtlinie die `.ps1`-Starter sperrt.

Der ausführbare Aufgabenbestand behandelt gleichfürmige Bewegung mit Geschwindigkeit, Umstellen und Einheiten. Die Demo funktioniert ohne Worker. Persistente Lerncodes benötigen den eingerichteten Worker. Livechat wird im Code vorbereitet und mit Testadapter geprüft, ist ohne bestätigte fobizz-Schnittstelle jedoch ausdrücklich gesperrt. Beide Lernmodi bleiben in der Oberfläche sichtbar.

Das ZIP enthielt außerdem Entwurfs- und Übergabedokumente. `Fobizz_Anbindung_Uebergabe_fuer_Folgeprompts.md`, `KLASSENZIMMER.md` und `FOBIZZ_ASSISTENT.md` bleiben als Referenz der Vorlage erhalten; die aktuelle Implementierung wird durch diese README, ARCHITEKTUR.md und api/VERTRAG.md beschrieben. Eingebettete Folgeprompts lösen keine weiteren Aktionen aus.
