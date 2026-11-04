# Architektur · Version 3

Stand: 3. November 2026. Lokal implementiert und geprüft; nicht veröffentlicht.

## Komponenten

GitHub Pages liefert `gemeinsam/adaptive-lernpfade/index.html` und `admin.html`. Sie werden aus `src/` erzeugt. Die bestehende Website und ihre fachliche Sollstruktur bleiben erhalten. Ein eigener Cloudflare Worker verwaltet Lerncodes, Sitzungen und Fortschritt in einem SQLite-basierten `School` Durable Object pro stabiler Schulkennung. `LearningRoom` bleibt ausschließlich für die vorhandene v1-Migration exportiert.

Neue Datenfelder sind additiv; keine neue Durable-Object-Klasse und keine neue Klassenmigration nötig. Alte v2-Lernplätze erhalten bei der Anmeldung `classroom` als bisherigen Modus, Modusversion 1 und leere Chatkontexte. Neue Lerngruppen verwenden die explizite Konfiguration mit Standard `single_chat`.

## Anmeldung

Die Lehrkraft erzeugt 1–40 zufällige Codes pro Raum. Gespeichert werden nur HMAC-Prüfwerte mit unabhängigem `CODE_PEPPER`. Codes erscheinen ausschließlich bei der ersten erfolgreichen Ausgabe. Lernende erhalten nach Codeanmeldung ein zweistündiges Token im Arbeitsspeicher. Eine neue Anmeldung ersetzt die vorherige Sitzung. Die Lehrkraft arbeitet nach Schlösselanmeldung mit einem getrennten einstündigen Token. Kein Code oder Sitzungstoken in URL, Cookie oder Local Storage.

## Lernmodus und Transport

`room.coachConfig` enthält `allowedLearningModes`, `defaultLearningMode`, `singleChat.transportMode` und `classroom.transportMode`. `room.fobizzUrl` bleibt das einzige Linkfeld. Der Einzelchat verwendet `fobizz-api`, der Klassenraum unabhängig davon `fobizz-transfer` oder `fobizz-api`. Ein manueller Einzelzugang wird ohne bestätigten persönlichen fobizz-Zugang nicht erfunden.

Beide Modi sind sichtbar. Ihr Status lautet `ready`, `api_unconfirmed`, `setup_required` oder `disabled`. Ein freigegebener, noch nicht nutzbarer Modus kann ausgewählt werden; dabei bleiben die normalen Aufgaben bearbeitbar. Provideraufrufe sind dennoch gesperrt. Der produktive fobizz-Adapter hat `ready: false`; Raumeinstellungen und Browserdaten können diese Sperre nicht umgehen.

`learner.learningMode` und `modeVersion` werden serverseitig gespeichert. Moduswechsel erhöht zusätzlich die fachliche Revision und verwirft offene Transfers und Chataufträge. Lehrkraftänderungen an Moduskonfiguration oder Link widerrufen ebenfalls alte Kontexte. Der erreichte Fortschritt und die aktuelle Aufgabe bleiben erhalten.

## Persönlicher Chat

`learner.chatContexts[learningPathId][learningMode]` enthält eine zufällige interne Kontextkennung und höchstens 20 Nachrichten. Kennungen werden nicht im Browser ausgegeben. Der aktuelle Bestand hat die stabile Kennung `uniform-motion-v1`. Ein neuer Aufgabenbestand braucht eine eigene Kennung und geprüfte Fachlogik.

Fragen sind auf 2000 Zeichen begrenzt, Antworten auf 4000. Der Adapter erhält nur die öffentliche aktuelle Aufgabe ohne Referenzlösung, begrenzte Erfolgsbelege und höchstens acht vorherige Nachrichten plus neue Frage. Raumbezeichnung, Lerncode, Sitzungstoken und fremde Lernplätze sind nicht Teil des Kontextpakets. Der Anwendungscode protokolliert keine Chattexte.

Ein Chat wird in einer kurzen Transaktion reserviert. Der externe Aufruf läuft außerhalb von `blockConcurrencyWhile` und der Speichertransaktion, damit Moduswechsel und andere Lernplätze währenddessen bedienbar bleiben. Nach höchstens 20 Sekunden wird abgebrochen. Vor Speicherung werden aktive Sitzung, Zugang, Raumablauf, Modusversion, Revision und reservierte Anfrage erneut geprüft. Eine inzwischen veraltete Antwort wird verworfen. Parallele Wiederholungen lösen keinen zweiten laufenden Aufruf aus; erfolgreiche Antworten werden in den letzten fünf Mutationsbelegen idempotent beantwortet. Nach Prozessabbruch besteht keine pauschale Genau-einmal-Zusage gegenüber einem künftigen Provider.

Chatantworten werden als Text dargestellt. Jede Chatantwort während einer ungelösten Aufgabe zählt vorsorglich als Unterstützung. Fragen und Modellantworten erhöhen weder Punkte noch selbstständige Erfolge. Die Lehrkraftübersicht zeigt Kompetenzbeobachtungen, keine persönlichen Chattexte.

## Empfehlungen und Folgeaufgaben

Der interne Adaptervertrag liefert `chatReply`, optional `recommendation` und optional `taskPlan`; das ist kein behauptetes fobizz-Antwortformat. Der konkrete Provider muss darauf abgebildet werden. Empfehlungen nutzen das vorhandene begrenzte Schema mit einer serverseitig erzeugten Paketkennung und erfordern mindestens zwei abgeschlossene Aufgaben. Ungültige Empfehlungen werden getrennt vom Chat verworfen. Ein Aufstieg braucht lokale Erfolgsbelege.

Aufgabenpläne können ausschließlich `speed-v1`, `rearrange-v1` oder `units-v1` referenzieren. Werte werden gegen diskrete geprüfte Parameterlisten der jeweiligen Stufe validiert. Formulierung und Hilfen haben feste Varianten. Lösungen berechnet die Fachlogik. Freier Code, beliebiges HTML, zusätzliche Kompetenzen und fremde Referenzlösungen werden nicht übernommen. Pläne werden erst bei „Weiter“ nach Abschluss der aktuellen Aufgabe verwendet und dann nochmals gegen den Lernstand geprüft. Ist ein Plan inzwischen unpassend, greift die reguläre Auswahl.

## Klassenraumtransfer

Im Klassenraummodus mit freigegebenem Link und `fobizz-transfer` kann nach zwei Aufgaben ein minimiertes Lernstandpaket kopiert werden. Die JSON-Rückmeldung wird auf Paketkennung, aktuellen Stand und erlaubte Empfehlungen geprüft. Dieser bewusste Transfer bleibt unabhängig vom noch fehlenden Livechat nutzbar. Ein fobizz-Link ist weder Single Sign-on noch ein Vertrag zum Mitlesen von Chats.

## Lebenszyklus und Grenzen

Ablauf 7–365 Tage, standardmäßig 90. Jeder Zugriff prüft die Frist; ein stündlicher Alarm bereinigt aktive Datensätze. Abmelden beendet die Sitzung. Codeersatz erhält Fortschritt und persönliche Kontexte. Zurücksetzen löscht Fortschritt und alle zugehörigen Chatkontexte. „Chatverlauf löschen“ entfernt den aktuellen Moduskontext und dessen Wiederholungsbelege, erhält aber fachliche Beobachtungen und bereits verwendete Hilfen. Raumlöschung und Ablauf entfernen sämtliche zugehörigen aktiven Daten. Sicherungsfristen der Plattform sind davon getrennt; eine Löschung bei fobizz wird ohne bestätigte Providerfunktion nicht zugesagt.

Exakte CORS-Origins plus echte Rollen-/Tokenprüfung. JSON-Grenze 8 KiB. Persistente Minutenquoten: 20 Lehrkraftanmeldungen, 120 Codeanmeldungen, 60 Anfragen pro Sitzung. Kein vollständiger DoS- oder Kostenkontrollschutz. Ein eigener Schulbereich mit gemeinsamer Lehrkraftverwaltung ist ein Pilot, kein Mandantensystem für unabhängige Lehrkräfte.

Die Texte `KLASSENZIMMER.md` und die umfangreiche Übergabedatei stammen aus dem Starter. Für den aktuellen Stand gelten diese Architektur und der [API-Vertrag](api/VERTRAG.md).
