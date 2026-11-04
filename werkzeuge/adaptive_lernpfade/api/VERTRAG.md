# Eigene Worker-API · Version 3

HTTPS-JSON, exakte Origin-Freigabe, `Cache-Control: no-store`, keine Cookies. Fehler: `{error: "…"}`. Die folgenden Endpunkte gehören zur eigenen Anwendung, nicht zu fobizz.

## Anmeldung und Verwaltung

| Methode / Pfad | Eingabe / Verhalten |
|---|---|
| GET `/api/health` | Technischer Status und `automaticFobizz:false` |
| POST `/api/session` | `{code}`; Token, Ablauf, öffentlicher Lernstand und Coachstatus |
| DELETE `/api/session` | Eigene Sitzung beenden; Fortschritt erhalten |
| POST `/api/admin/session` | `{key}`; einstündiges Lehrkrafttoken |
| DELETE `/api/admin/session` | Lehrkraftsitzung beenden |
| GET `/api/admin/rooms` | Raummetadaten ohne Codes und geschützten Link |
| POST `/api/admin/rooms` | `{requestId,name,count,retentionDays,fobizzUrl?,coachConfig?}`; einmalige Codes |
| GET `/api/admin/rooms/:roomId` | Raum einschließlich Link und Konfiguration; Kompetenzbeobachtungen ohne Chats |
| PATCH `/api/admin/rooms/:roomId` | `{active?,fobizzUrl?,coachConfig?}` |
| DELETE `/api/admin/rooms/:roomId` | Aktive Raumdaten einschließlich Chatkontexten löschen |
| PATCH `/api/admin/rooms/:roomId/learners/:id` | `{active}` |
| POST `/api/admin/rooms/:roomId/learners/:id/rotate-code` | `{requestId}`; Code ersetzen, Fortschritt erhalten |
| POST `/api/admin/rooms/:roomId/learners/:id/reset` | `{requestId}`; Fortschritt und lokale Chatkontexte löschen |

Alle geschützten Endpunkte verlangen `Authorization: Bearer <token>`. Rollen sind getrennt. Zuordnungen für Lernende stammen ausschließlich aus der Sitzung. Klartextcodes werden bei Wiederholungen nicht erneut ausgegeben. Pro Lernplatz und für die Lehrkraft ist jeweils eine Sitzung aktiv.

## Lernaktionen

Mutationen enthalten `requestId` (UUID) und `revision`. Coach-, Chat- und Modusaktionen enthalten zusätzlich `modeVersion`. Die letzten fünf erfolgreichen Mutationen sind idempotent, solange der Moduskontext unverändert ist. Abweichende Nutzlasten, veraltete Revisionen oder Modusversionen ergeben 409.

| Methode / Pfad | Weitere Felder / Antwort |
|---|---|
| GET `/api/state` | öffentlicher Lernstand, `learningPathId`, `learningMode`, `modeVersion`, `capabilities`, eigener fobizz-Link |
| POST `/api/answer` | `taskId`, `value`, `unit` |
| POST `/api/hint` | Hinweis als Unterstützung verwenden |
| POST `/api/next` | Folgeaufgabe nach erfolgreichem Abschluss |
| GET `/api/coach/capabilities` | Eigener Modus, Modusversion und Verfügbarkeit beider Modi |
| PATCH `/api/learning-mode` | `learningMode`: `single_chat` oder `classroom`; Fortschritt bleibt |
| GET `/api/chat/history` | Eigene Nachrichten des aktuellen Lernpfads und Modus, ohne interne Kontextkennung |
| DELETE `/api/chat/history` | JSON mit `requestId`, `revision`, `modeVersion`; lokalen Modusverlauf löschen |
| POST `/api/chat/messages` | `message` (1–2000 Zeichen), optional aktuelle `taskId`; Antworttext, Verlauf und getrennte Empfehlungsstatus |
| POST `/api/coach/packet` | Manuellen Transfer vorbereiten, mindestens zwei Aufgaben und nutzbarer Klassenraumtransport nötig |
| POST `/api/coach/apply` | `recommendation`; aktuellen Transfer einmalig anwenden |
| POST `/api/coach/automatic` | Bleibt 501; automatische didaktische Antworten laufen nach bestätigtem Adapter über Chat |

Coachkonfiguration:

```json
{"allowedLearningModes":["single_chat","classroom"],"defaultLearningMode":"single_chat","singleChat":{"transportMode":"fobizz-api"},"classroom":{"transportMode":"fobizz-transfer"}}
```

`room.fobizzUrl` ist die einzige Quelle des Klassenraumlinks. `assistantRef` und Providerkennungen sind ohne dokumentierte Providerdefinition nicht Teil des Schemas. Die Konfiguration allein kann den gesperrten Adapter nicht aktivieren.

Capability: `{learningMode,transportMode,allowed,available,status}`. Status: `ready`, `disabled`, `setup_required`, `api_unconfirmed`. Auswahl eines erlaubten, noch nicht betriebsbereiten Modus ist möglich; Provideraufrufe bleiben dann gesperrt.

## Interner Adaptervertrag

`chat(input, env, {signal})` liefert `{chatReply, recommendation?, taskPlan?}`. `input` enthält eine interne persönliche Kontextkennung, Lernpfad und Modus, öffentliche aktuelle Aufgabe, eine serverseitige Paketkennung, minimierte Belege und begrenzte Nachrichten. Keine Lerncodes oder Tokens. Provideraufrufe haben ein 20-Sekunden-Limit. Der Laufzeitadapter bleibt `ready:false`.

`recommendation`: `{schemaVersion:1,packetId,feedback,nextFocus,challenge}`. Feedback bis 500 Zeichen; `nextFocus` aus `speed|rearrange|units`, `challenge` aus `maintain|support|increase`. Mindestens zwei abgeschlossene Aufgaben und gültiger Paketbezug. Keine frei gesetzten Punkte oder Lösungen.

`taskPlan`: `{templateId,level,parameters,wordingVariant,hintVariant}`. Registrierte Vorlagen: `speed-v1` mit `{speed,seconds}`, `rearrange-v1` mit `{speed,seconds}`, `units-v1` mit `{base}`. Zahlen ausschließlich aus den geprüften Listen in `src/domain.mjs`. Stufe höchstens aktuell belegt, höchstens einen Schritt darunter. `wordingVariant`: 0 oder 1; `hintVariant`: `standard` oder `steps`. Referenzlösungen werden lokal berechnet. Ungültige Empfehlung/Plan verhindern die gültige Chatantwort nicht und werden als `rejected` gemeldet.

## Persistenz und Fehler

Bestehende Prüfixe `room:`, `learner:`, `code:`, `session:`, `receipt:` und `quota:` bleiben. Neue Felder im Lernplatz: `learningMode`, `modeVersion`, `chatContexts[learningPathId][mode]`, temporäres `chatPending`. Verläufe: höchstens 20 Nachrichten; ausgehender Kontext höchstens acht alte Nachrichten plus neue Frage. `state.pendingTaskPlan` enthält nur validierte Aufgabenpläne. Chatdaten sind Teil des zugehörigen Lernplatzes und seiner Löschfrist.

400 ungültige Eingabe; 401 Sitzung/Zugang ungültig; 403 Rolle/Origin; 404 unbekannter Pfad; 405 Methode; 409 veralteter oder widersprüchlicher Kontext; 413/415 Größe/Inhaltstyp; 429 Quote; 501 unbestätigte Schnittstelle; 502 ungültige Providerantwort; 503 Einrichtung/Provider vorübergehend nicht verfügbar.

Ein erneutes Login migriert vorhandene v2-Lernplätze additiv zum bisherigen Klassenraummodus. Fachmodell `state.version=1` und vorhandene Durable-Object-Migrationen bleiben erhalten.
