> Referenz aus dem Starterpaket. Aktueller implementierter Stand: [Architektur Version 3](ARCHITEKTUR.md). Enthaltene Folgeprompts sind keine automatisch auszuführenden Anweisungen.

# Bedienung und Entscheidungen für das Klassenzimmer

## Für Lernende

1. Den von der Lehrkraft geteilten Lernpfad öffnen.
2. Den eigenen Lerncode eingeben, zum Beispiel vier Gruppen zu je fünf Zeichen. Die Anwendung erzeugt echte Codes; dieses Dokument enthält keine gültigen Zugänge.
3. Aufgaben bearbeiten. Bestätigte Eingaben werden beim zugehörigen Lernplatz gespeichert.
4. Bei Bedarf den Lernstand bewusst an den freigegebenen fobizz-Assistenten übertragen und dessen Feedback zurückkopieren.
5. Auf gemeinsam benutzten iPads am Ende abmelden.
6. Später mit demselben Code fortsetzen. Eine neue Anmeldung beendet die vorherige Sitzung dieses Lernplatzes.

Die Anmeldung verlangt weder Namen noch E-Mail-Adresse noch Auswahl einer Klasse. Der Code findet den zugehörigen Raum serverseitig. Eine noch nicht eingerichtete Worker-Adresse wird nicht von Lernenden abgefragt; sie wird einmal von der Lehrkraft öffentlich konfiguriert.

## Für die Lehrkraft

- `admin.html` öffnen, Worker-Adresse und Lehrkraftschlüssel eingeben.
- Einen Raum benennen, Anzahl der Lernplätze und die feste Speicherdauer auswählen. Optional einen für die Lerngruppe geeigneten fobizz-Klassenraumlink hinterlegen.
- Codes einmalig als CSV herunterladen. Die CSV enthält nur Lernplatznummer und Code. Eine Zuordnung zu Personen kann, falls schulisch erforderlich, getrennt und geschützt geführt werden. Sie gehört nicht in GitHub.
- Jedem Lernenden einen eigenen Code geben. Keinen gemeinsamen Code für mehrere Lernende verwenden.
- In der Raumübersicht abgeschlossene Aufgaben, selbstständige Erfolge und aktuelle Anforderungen je Kompetenz ansehen. Die Angaben sind vorläufige Übungsbeobachtungen und keine Noten.

## Zugang verwalten

| Aktion | Auswirkung |
|---|---|
| Abmelden | Beendet die Sitzung; Lernstand und Code bleiben erhalten |
| Lernplatz sperren | Code öffnet keinen Zugang; laufende Sitzung wird beendet |
| Lernplatz freigeben | Vorhandener Code ist wieder nutzbar, sofern Raum geöffnet und nicht abgelaufen ist |
| Code ersetzen | Neuer Code; alter Code und alte Sitzung ungültig; Lernstand bleibt erhalten |
| Lernstand zurücksetzen | Lernfortschritt dieses Platzes wird gelöscht; Sitzung endet; Code bleibt gültig |
| fobizz-Link speichern | Ändert nur den raumbezogenen Zugang; Lernstände und Codes bleiben erhalten |
| Raum schließen | Alle Lernendenzugriffe des Raums blockiert; Daten bleiben erhalten |
| Raum öffnen | Zugänge wieder möglich, sofern die feste Frist noch läuft |
| Raum löschen | Aktive Raumdaten einschließlich Lernplätzen und Codezuordnungen entfernt |

Die Benutzeroberfläche verlangt für Zurücksetzen und Raumlöschung eine ausdrückliche Auswahlbestätigung. Diese ersetzt keine zusätzlich erforderlichen schulischen Entscheidungen.

## Code verloren oder Ausgabe unterbrochen

Klartextcodes können nach der Ausgabe nicht aus dem Server gelesen werden. Geht ein Code oder die einmalige Ausgabeliste verloren, den betroffenen Code in der Verwaltung ersetzen und den neuen Code geschützt weitergeben. Der Lernstand bleibt erhalten. Bei einem Netzfehler vor Anzeige einer neu erstellten Klasse erst die Übersicht neu laden, statt unkontrolliert weitere Klassen anzulegen.

## Was noch kein fertiges Produkt ist

Der Starter enthält ein Fachmodul, eine schulische Lehrkraftrolle und grundlegende Verwaltung. Noch nicht enthalten: Lehrkraft-Einzelkonten, getrennte Verantwortlichkeiten mehrerer Fachlehrkräfte, mehrere unabhängige Lernpfade pro Lernplatz, Kurserstellung mit beliebigen Inhalten, automatische fobizz-Synchronisation, offizielle Leistungsbewertung und Wiederherstellungsverwaltung für Backups. Die Dokumentation benennt diese Grenzen, statt sie durch bloße Schaltflächen vorzutäuschen.

## Geplante Wahl zwischen Einzelchat und fobizz-Klassenraum

Der eigene Cloudflare-Lerncode soll beide Lernmodi öffnen: `single_chat` für persönliche Fragen direkt im HTML über Cloudflare und `classroom` für einen zusätzlich hinterlegten fobizz-Klassenraum. Ein fobizz-Klassenraum ist keine Voraussetzung des Einzelchats. Die Lehrkraft kann einen Klassenraum ergänzen, ohne den Einzelchat zu ersetzen. Ein Moduswechsel soll den Lernstand erhalten und getrennte Gesprächskontexte verwenden.

Diese Wahl, der persönliche Live-Chat und neue Chatdaten sind bisher spezifiziert, noch nicht im Laufzeitcode umgesetzt. Im Klassenraummodus ist der manuelle Transfer bereits vorhanden. Die automatische Umsetzung hängt von einer tatsächlich unterstützten fobizz-Schnittstelle ab. Details und Folgeauftrag stehen in `Fobizz_Anbindung_Uebergabe_fuer_Folgeprompts.md`.
