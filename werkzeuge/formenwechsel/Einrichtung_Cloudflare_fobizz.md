# Automatischer Hintergrundtutor: Einrichtung

Version 3.0 · Stand 4. November 2026

Der Lernpfad besitzt jetzt einen automatischen Ablauf über einen Cloudflare Worker. Die frühere Chat-Einbettung und das manuelle Kopieren von Anfragen wurden entfernt. Die KI wählt die folgende Aufgabe und liefert kurze Rückmeldungen; die Lernenden bedienen nur den Lernpfad.

**Noch nicht live verbunden:** Für den vorhandenen öffentlichen fobizz-Tutor wurde keine unterstützte externe API dokumentiert oder bereitgestellt. In dieser Arbeitsumgebung fehlen außerdem die Cloudflare-Zugangsdaten. Deshalb wurde kein Produktions-Worker eingerichtet. Der konkrete fobizz-Protokolladapter muss nach einer bestätigten API-Dokumentation ergänzt werden. Die mitgelieferte HTML-Datei enthält zunächst eine leere Worker-Adresse und funktioniert mit der lokalen Aufgabensteuerung. Die automatischen Abläufe wurden mit einem ausdrücklich als Testanschluss implementierten Connector geprüft.

## Ablauf nach der Aktivierung

| Auslöser | Automatische Verarbeitung | Sichtbares Ergebnis |
|---|---|---|
| Trainingsbeginn | Worker erzeugt geeignete Kandidaten; Tutor wählt eine Aufgabe. | Die ausgewählte Aufgabe erscheint, bevor die Eingabe freigegeben wird. |
| Richtige Zwischenrechnung | Worker rechnet den aktiven Abschnitt nach und fordert kurzes Lob an. | Eine kurze Randnotiz bestätigt den gelungenen Schritt. |
| Falsche Zahlen | Worker rechnet nach und fordert einen passenden Denkanstoß an. | Hinweis in der Feedbackkarte; dieselbe Aufgabe bleibt bestehen. |
| Aufgabe abgeschlossen | Tutor wählt aus Kandidaten für die nächste zulässige Runde. | Die folgende Runde verwendet automatisch diese Auswahl. |
| Dienst gestört oder Zeitlimit | Keine Modellantwort wird als Erfolg ausgegeben; lokale Steuerung übernimmt. | Weiterarbeiten bleibt möglich; die Herkunft ist sichtbar. |

Es werden keine Texteingaben während des Tippens übertragen. Nur gültig geprüfte Zahlen, abgeschlossene Aufgaben und die Auswahl einer neuen Runde lösen Anfragen aus. Die Modellwahl verändert keine bereits bearbeitete Aufgabenstellung. Am Computer steht die kleine Feedbackkarte rechts, in schmaler Ansicht oberhalb der Aufgabe und beim Scrollen erreichbar. Es gibt weder einen fobizz-Klassenraum noch eine Chatoberfläche für Lernende.

## Dateien und eigene Endpunkte

| Datei | Zweck |
|---|---|
| `automatic.js` | Hintergrundtransport, Sitzung, Zeitlimit und Antwortzuordnung im Browser. |
| `design.css` | Responsives Design, beim HTML-Build vollständig eingebettet. |
| `app.js` | Lernstand, unabhängige Fachprüfung, Aufgabenwechsel und Feedbackkarte. |
| `worker/index.mjs` | Eigene HTTP-Endpunkte, signierte Sitzungen, persistente Anfragezuordnung und Kontingente. |
| `worker/domain.mjs` | Nachrechnung, Kandidatenkatalog und Prüfung der Modellwahl. |
| `worker/fobizz-adapter.mjs` | Aufruf eines noch anzuschließenden, dokumentierten fobizz-Connectors. |
| `wrangler.jsonc` | Cloudflare-Konfiguration mit zwei SQLite-Durable-Object-Klassen. |
| `config.public.json` | Öffentliche Worker-Adresse und Browserzeitlimit; keine Geheimnisse. |
| `package.json`, `package-lock.json` | Festgelegte Entwicklungsabhängigkeiten für `npm ci`. |

Die folgenden URLs gehören zum eigenen Worker, **nicht zu fobizz**:

- `GET /api/status`: tatsächliche Einrichtung verfügbar oder nicht verfügbar.
- `POST /api/session`: zeitlich begrenzte Sitzung ohne Namen anlegen.
- `POST /api/coach/automatic`: Rechenschritt analysieren und gegebenenfalls Folgeaufgabe auswählen.

Eine erteilte Sitzung läuft nach sechs Stunden aus. Sie gehört zu diesem Browser-Tab und dem konfigurierten Ursprung. Der Browser sendet sie als Bearer-Token. Das ist eine technische Sitzung, keine überprüfte schulische Identität. CORS ist keine Benutzeranmeldung. Eine öffentliche Installation kann ihre begrenzten Kontingente durch fremde Anfragen verbrauchen; sie ist nicht als öffentlicher unbegrenzter KI-Zugang ausgelegt.

## Zuerst den fobizz-Zugriff klären

Benötigt werden die von fobizz bestätigte Dokumentation und Berechtigung für einen serverseitigen Zugriff auf **den bestehenden Tutor**: Authentifizierung, zulässiger Endpunkt, Assistentenkennung, Anfrage- und Antwortformat, Grenzen und Gesprächszuordnung. Der Freigabelink ersetzt diese Angaben nicht. Eine fobizz-interne Verbindung zu Sprachmodellanbietern belegt keinen Kundenzugang zu einer externen Assistenten-API.

Der Übergang ist als Cloudflare-Service-Binding `FOBIZZ_CONNECTOR` vorbereitet. Dessen Request ist ein **eigener interner Vertrag**:

```text
POST https://fobizz-connector.internal/coach
Content-Type: application/json
```

Dieser Host ist nur die interne Adresse eines Service-Binding-Aufrufs. Er wird nicht öffentlich aufgelöst und ist keine erfundene fobizz-URL. Das aufzurufende Connector-Programm muss anhand der bestätigten Providerdokumentation implementiert werden. Es muss den vorhandenen fobizz-Tutor ansprechen, nicht stillschweigend einen anderen Anbieter verwenden. Zugangsdaten und etwaige Gesprächskennungen bleiben dort serverseitig.

Der Worker sendet eine klare Anweisung, das nachgerechnete Ergebnis, den aktuellen Rechenschritt, höchstens die letzten zwölf Beobachtungen und einen begrenzten Aufgabenkatalog. Die Connector-Antwort muss auf dieses eigene Format abgebildet werden:

```json
{"feedback":"Gut gemacht – du hast den äußeren Vorfaktor berücksichtigt.","nextTaskId":"C4"}
```

`nextTaskId` muss genau eine angebotene Kandidatenkennung sein. Wenn keine Folgeauswahl verlangt wurde, ist sie `null`. `feedback` darf höchstens 220 Zeichen enthalten. Fremde Aufgaben, Code, Lösungsfelder und Zusatzbefehle werden nicht übernommen. Die Anfrage enthält keine Namen und keinen öffentlichen Tutor-Link. Die Test-Connectoren unter `tests/` bilden nur diesen internen Vertrag nach; sie sind keine produktive fobizz-Anbindung.

## Einrichtung in VS Code / PowerShell

Den Ordner `Quellen` aus dem Materialpaket öffnen. Die folgenden Befehle aus genau diesem Ordner ausführen. Eine aktuelle Node.js-Installation ist erforderlich; geprüft wurde mit Node.js 24.22.1.

```powershell
npm ci
npm test
npx wrangler login
```

In `wrangler.jsonc` bei `ALLOWED_ORIGINS` den tatsächlichen Ursprung der GitHub-Pages-Seite eintragen. Vorbelegt ist `https://hardenacke.github.io`; ein Repository-Unterpfad gehört nicht in den Ursprung.

Eine eigene zufällige Sitzungsgeheimzahl lokal erzeugen und anschließend als Worker-Secret speichern:

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
npx wrangler secret put SESSION_SECRET
```

Den selbst erzeugten Wert in die Secret-Abfrage einfügen. Er gehört nicht in das HTML oder ins Git-Repository. Die fobizz-Zugangsdaten gehören ebenfalls als Secrets in den bestätigten Connector, niemals in `config.public.json`.

**Erst nachdem der fobizz-Connector tatsächlich implementiert und geprüft ist:** In `wrangler.jsonc` dessen Service-Binding ergänzen. Beispiel mit zu ersetzendem Namen:

```json
"services": [
  {"binding":"FOBIZZ_CONNECTOR","service":"NAME_DES_BESTAETIGTEN_CONNECTORS"}
]
```

Anschließend `FOBIZZ_API_CONFIRMED` auf den String `"true"` setzen. Das bloße Umschalten dieses Wertes erzeugt keine API. Ohne gebundenen Connector und Sitzungssecret bleibt der Worker geschlossen.

```powershell
npx wrangler deploy --dry-run
npx wrangler deploy
```

Die von Cloudflare tatsächlich ausgegebene HTTPS-Adresse in `config.public.json` als `workerUrl` eintragen. Die URL darf nur den Ursprung enthalten, keine Zugangstokens oder beliebigen Unterpfade. `timeoutMs` ist auf 9000 eingestellt.

```powershell
python build.py
```

Alternativ die tatsächlich ausgegebene Worker-URL beim Bauen übergeben:

```powershell
python build.py --worker-url https://DEIN-WORKER.DEINE-SUBDOMAIN.workers.dev
```

`dist/index.html` anschließend über GitHub Pages bereitstellen. Die Datei ist eigenständig; alle Mathematikschriften sind enthalten. Für die Hintergrundanbindung ist eine Netzwerkverbindung erforderlich. Ohne konfigurierte Worker-Adresse findet keine automatische Übertragung statt. Ein lokaler `file://`-Aufruf mit konfigurierter API ist kein freigegebener Webursprung; hierfür die HTTPS-Seite verwenden.

Zum Prüfen von `GET /api/status` muss der erlaubte `Origin` mitgesendet werden. Eine erfolgreiche Konfiguration meldet `ready:true`. Danach einen richtigen und einen falschen Rechenschritt sowie einen vollständigen Aufgabenwechsel in der echten Seite prüfen. Erst das belegt den Live-Betrieb mit fobizz.

## Grenzen und Ausfallsicherheit

Browser und Worker berechnen die verlangten Zahlen unabhängig. Das Modell wählt lediglich aus Kandidaten innerhalb der freigegebenen Richtungen, Stufen und Zahlenräume. Bei zehn Trainingsaufgaben bleiben fünf pro Richtung und anschließend beide Abschlussrichtungen erhalten. Der Abschlusscheck führt keine ungeübte Stufe ein. Hinweise zur laufenden Bearbeitung zählen als Unterstützung; bloßes Lob nach einer richtigen Rechnung nicht.

Die Browserhistorie dient als begrenzter Übungskontext. Sie ist lokal veränderbar und damit kein manipulationssicherer Leistungsnachweis. Der Worker ist kein Notenbuch und ersetzt keine serverseitig geprüfte Schulidentität. Der mathematische Wahrheitswert eines neu übergebenen Rechenschritts wird serverseitig erneut berechnet.

Anfragekennung, Sequenz, Revision, Aufgabenkennung und Eingaben verhindern eine Übernahme veralteter Antworten. Wiederholungen derselben gespeicherten Anfrage lösen keinen zweiten Modellaufruf aus. Unklare oder zu alte Anfragen werden nicht erneut ausgeführt. Aufrufe liegen außerhalb der Speichertransaktion. Nach sechs Stunden werden Sitzungsdaten zur Löschung eingeplant; Cloudflare-Backups und Daten beim Provider sind davon getrennt.

Ein gemeinsames Durable Object begrenzt Provideraufrufe auf standardmäßig 500 Reservierungen pro UTC-Tag und neue Sitzungen auf 200 pro Stunde. Pro Sitzung gelten 15 Reservierungen pro Minute und insgesamt 120. Fehlerhafte Provideraufrufe verbrauchen ebenfalls eine Reservierung. Diese Zahlen sind Schutzgrenzen des eigenen Workers, keine zugesagten fobizz-Kontingente. Eine Sitzung erneuern oder den Browser wechseln umgeht die gemeinsame Tagesgrenze nicht. Der eigene Worker und der Connector können unabhängig davon Cloudflare-Nutzung verursachen.

## Tatsächlicher Prüfstand

Frontendlogik, realer HTTP-Transport und der Worker wurden zusammen in der lokalen `workerd`-Laufzeit getestet. Für den Provider wurde eine Test-Service-Bindung verwendet. Ein echtes fobizz-API-Gespräch und ein produktives Cloudflare-Deployment sind damit ausdrücklich nicht belegt. Die alten manuellen Chat-Tests aus Version 2 sind kein Nachweis für die neue Hintergrundschnittstelle.

Die automatische Folgeauswahl, kurze richtige und falsche Rückmeldungen, alte Antworten, doppelte Anfragen, manipulierte Kandidaten, Größenlimits, Sitzungstoken, Zeitlimits, Tageskontingente und ein unkonfiguriertes Produktionssystem sind abgedeckt. Genauere Ergebnisse und Browsergrenzen stehen in `QUALITAETSPRUEFUNG.md`.

Offizielle technische Grundlagen, am 4. November 2026 geprüft:

- [Cloudflare: Wrangler-Konfiguration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Cloudflare: Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare: Regeln für Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
- [fobizz: Datenschutz und eigene Modellanbieter-Anbindung](https://app.fobizz.com/data_protections)
