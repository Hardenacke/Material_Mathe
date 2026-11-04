# fobizz im Hintergrund – Version 3.0

Der aktive automatische Tutor verwendet jetzt **Cloudflare Workers AI**;
siehe [WORKERS_AI.md](WORKERS_AI.md). Der fobizz-Freigabelink bleibt eine
zusätzliche Chat-Lernhilfe. Die folgende API-Vorbereitung ist inaktiv.

## Freigegebener Assistent im Scheitelpunkt-Trainer

Der von der Lehrkraft vorgegebene Assistent ist als `assistantUrl` in
`config.public.json` hinterlegt. Der Build ergänzt einen Link in der Trainingskarte
und im Seitenfuß. Er öffnet den Assistenten in einem neuen Tab, ohne Aufgaben,
Eingaben oder Lernstand zu übermitteln. Die Lernenden stellen ihre Frage selbst.
Diese direkte Nutzung benötigt keinen Worker; die automatische Verbindung bleibt
bis zur bestätigten API-Anbindung deaktiviert.

## Vorbereitete automatische Verbindung

Der aktuelle Auftrag verwendet eine automatische Hintergrundsteuerung über einen Cloudflare Worker. Ein eigener Chat, ein Klassenraum und der manuelle JSON-Transfer wurden aus der Lernendenoberfläche entfernt.

Die vollständige aktuelle Anleitung, der interne Connector-Vertrag, die Einrichtungsschritte und die Grenzen stehen in **[Einrichtung_Cloudflare_fobizz.md](Einrichtung_Cloudflare_fobizz.md)**.

Die Programme für Sitzungen, Anfragen, Fachprüfung, Aufgabenwahl und Randfeedback sind implementiert. Die konkrete externe fobizz-Protokollabbildung bleibt offen, bis ein dokumentierter API-Zugang für den vorhandenen Tutor vorliegt. Ohne diese Einrichtung ist der Worker nicht betriebsbereit; die ausgelieferte HTML-Datei nutzt die örtliche Aufgabensteuerung. Es wurde kein stiller Anbieterwechsel eingerichtet.

Die Dateien unter `fixtures/` dokumentieren ältere manuelle Chat-Tests mit synthetischen Daten. Sie gehören nicht zum automatischen Laufzeitprotokoll der Version 3.
