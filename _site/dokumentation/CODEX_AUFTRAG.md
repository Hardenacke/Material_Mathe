# Startauftrag für Codex

Kopiere den folgenden Auftrag in Codex, nachdem der lokale Mathematik-Repository-Ordner als Workspace geöffnet wurde:

---

Lies zuerst `AGENTS.md`, `README.md`, `struktur.json` und `dokumentation/HINWEIS_JAHRGANGSVERTEILUNG.md`.

Ziel: Übernimm die vorbereitete NRW-Mathematik-Ordnerstruktur in den aktuellen lokalen Repository-Workspace, ohne bestehende Unterrichtsmaterialien ungeprüft zu verschieben.

Vorgehen:
1. Analysiere den vorhandenen Dateibestand und vergleiche ihn mit `struktur.json`.
2. Lege nur fehlende Ordner an. Bestehende Dateien bleiben zunächst an ihrem Ort.
3. Erstelle für vorhandene Materialien Vorschläge in `dokumentation/UMZUG_MAPPING_VORLAGE.csv`: alter Pfad → passender neuer Themenordner.
4. Prüfe bei jedem Umzugsvorschlag relative Links, gemeinsam genutzte Assets, HTML/CSS/JS-Abhängigkeiten und mögliche GitHub-Pages-Pfade.
5. Verschiebe erst Dateien, wenn ich die Mapping-Liste ausdrücklich freigebe.
6. Ändere die vorbereitende Jahrgangszuordnung nicht stillschweigend. Wenn sie vom schulinternen Lehrplan abweicht, liste die Abweichungen auf.
7. Führe `python werkzeuge/struktur_pruefen.py` aus.
8. Erstelle keinen Commit und führe keinen Push aus, außer ich fordere das ausdrücklich an.

Am Ende: Nenne geänderte Dateien/Ordner, Testergebnis, offene fachliche Entscheidungen und bestätige, dass kein Push erfolgt ist.

---
