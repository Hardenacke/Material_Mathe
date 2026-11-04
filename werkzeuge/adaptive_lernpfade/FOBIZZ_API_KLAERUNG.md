# Fragen an fobizz zur automatischen Anbindung

Vorbereitet zur eigenen Kontaktaufnahme. Es wurde keine Nachricht versendet.

Wir möchten einen selbst entwickelten HTML-Lernpfad auf GitHub Pages einsetzen. Ein Cloudflare Worker soll ausgewählte, minimierte Bearbeitungsbeobachtungen an einen fobizz-Lernassistenten übertragen. Dieser soll kurze Rückmeldungen und begrenzte Empfehlungen für den nächsten Aufgabenschwerpunkt zurückliefern.

Bitte bestätigen Sie:

1. Gibt es eine offiziell unterstützte API für externe kundeneigene Lernpfade? Bitte nennen Sie Dokumentation, freigegebene Endpunkte und zulässige Nutzung.
2. Ist diese Nutzung in unserer Schul-/Landeslizenz enthalten oder gesondert zu vereinbaren? Wie werden Nutzung und Kosten begrenzt?
3. Welche serverseitige Authentifizierung ist vorgesehen? Gibt es getrennte Berechtigungen für Assistenten und Lerngruppen?
4. Kann ein vorhandener fobizz-Assistent einschließlich seiner Rolleninstruktionen über diese API verwendet werden? Welche Kennung ist dafür vorgesehen?
5. Unterstützt die API kurze strukturierte JSON-Antworten, Zeitlimits, Größenlimits, Fehlercodes und eine Kennung zur Zuordnung von Anfrage und Antwort?
6. Wie werden getrennte Lernendensitzungen, Verlaufslöschung und Aufbewahrungsfristen behandelt? Können Anfragen ohne dauerhaften Gesprächsverlauf verarbeitet werden?
7. Welche Vertragsgrundlage und Auftragsverarbeitung gelten für die Erweiterung um GitHub Pages und Cloudflare? Welche Datenregionen, Unterauftragnehmer und Übermittlungen sind betroffen?
8. Ist bei Nutzung einer schulischen Bereitstellung die Übertragung minimierter Kompetenzbeobachtungen vorgesehen? Welche zusätzlichen schulischen Voraussetzungen gelten?
9. Falls keine API existiert: Gibt es einen dokumentierten Embed- oder `postMessage`-Vertrag für einen automatischen, wechselseitigen Datenaustausch? Ein bloßer Freigabelink reicht für unsere Steuerungsfunktion nicht aus.

Ohne diese Bestätigung bleibt die Verbindung im Starterprojekt manuell. Logindaten, Sitzungs-Cookies und interne Web-Endpunkte werden nicht als Ersatz eingesetzt.

## Ergänzende Klärung für Einzelchat und Klassenraummodus

Beide Modi sind vorgesehen. Bitte ausdrücklich getrennt bestätigen:

- Kann ein Cloudflare Worker persönliche Einzelchats mit einem fobizz-Assistenten führen, ohne dass dafür ein fobizz-Klassenraum angelegt werden muss? Welche Berechtigung und Gesprächszuordnung sind vorgesehen?
- Wie werden individuelle Gesprächsverläufe getrennt, fortgesetzt und gelöscht? Gibt es einen dokumentierten Vertrag für strukturierte Empfehlungen beziehungsweise Aufgabenpläne?
- Welche Funktionen bestehen zusätzlich für Klassenräume: Linkzugang, erlaubte Einbettung, personenbezogen getrennte API-Synchronisation oder dokumentiertes postMessage?
- Welche Unterschiede gelten bei Authentifizierung, Budget und Datenverarbeitung zwischen beiden Modi?

Ein Klassenraumlink darf nicht als Ersatz für eine fehlende Einzelchat-API ausgegeben werden. Diese Fragen wurden nur vorbereitet und nicht versendet.
