# Scheitelpunkt-Trainer – adaptiver Lernpfad, Version 3.2

Mathematik, Klasse 9 · etwa 20 Minuten · eigenständige HTML-Datei.

## Starten

Im Material-Repository liegt der Trainer unter
`klasse-9/02-funktionen/01-quadratische-funktionen/scheitelpunkt-trainer.html`.
Er erscheint unter **Klasse 9 → Funktionen → Lernpfade** als
**Scheitelpunkt-Trainer**.
`python werkzeuge/build_site.py` erzeugt diese Datei aus den hier abgelegten Quellen
und übernimmt sie in die Website. Die Datei lässt sich auch direkt im Browser öffnen.
Installation oder KI-Zugang sind für die Nutzung nicht nötig.
Ein separater Aufruf von `python werkzeuge/formenwechsel/build.py` erzeugt
eine zusätzliche, nicht veröffentlichte Ausgabe unter `dist/index.html`.

Die aktuelle Einbindung und der hier durchgeführte Prüfstand stehen in
[`dokumentation/FORMENWECHSEL.md`](../../dokumentation/FORMENWECHSEL.md).
Die folgenden Versionshinweise und `QUALITAETSPRUEFUNG.md` stammen aus dem
Materialpaket. Für diese Repositoryintegration wurde zusätzlich ein Fehler beim
Neuladen außerhalb der Trainingsansicht behoben und der vollständige Lernweg in
Edge und WebKit geprüft.

Auf dem iPad empfiehlt sich ein normaler HTTPS-Aufruf, beispielsweise über GitHub Pages. Die Dateien-App-Vorschau kann JavaScript einschränken. Die HTML-Datei enthält KaTeX und alle Mathematikschriften; das lokale Training benötigt keine externen Laufzeitressourcen. Charles benötigt für automatische Rückmeldungen und direkte Fragen den eingerichteten Cloudflare Worker mit Workers AI. Ein realer iPad-/Safari- und Offline-Gerätetest bleibt offen.

## Charles direkt fragen

Die schwebende Box heißt **Charles**. Sie gibt kurze Rückmeldungen zu Lösungen,
ermutigt zum Weiterrechnen und enthält ein eigenes Fragenfeld. Mit **Senden**
oder Enter wird die Frage abgeschickt; Umschalt+Enter fügt eine neue Zeile ein.
Charles kennt die sichtbare Aufgabe, den Rechenschritt und die eingegebenen Zahlen.
In der Einführung bezieht er sich auf das veränderte Beispiel im Parabel-Labor.

Bis zu drei Frage-Antwort-Paare stehen für Rückfragen zur Verfügung. Bei einem
neuen Beispiel, Rechenschritt, Ansichtswechsel oder Neuladen wird das Gespräch
geleert. Der Gesprächsverlauf wird nicht im lokalen Lernstand gespeichert.
Eine Frage zu einer offenen Trainingsaufgabe zählt als Hilfe; reines Lob nicht.
Das Fragenfeld bleibt am unteren Rand der Box erreichbar, der Verlauf scrollt.
Charles kann weiterhin zu einem kleinen Punkt eingeklappt werden.

## Regler und Rückmeldungen in Version 3.2

Die beiden Parameterregler sind jetzt größer und stehen untereinander. Sie besitzen einen sichtbaren Füllstand, große Griffe, mathematisch gesetzte Skalen und Plus-/Minus-Tasten für einzelne Schritte. An den jeweiligen Grenzen sind die passenden Tasten deaktiviert. Regler, Knöpfe, Zahlenwerte, Graph und Formvergleich bleiben synchron.

Nach dem Prüfen werden richtige Teilwerte grün und falsche rot markiert. Symbole und kurze Texte ergänzen die Farben. Die Gesamtrückmeldung und die Lernbegleitung verwenden dieselbe Unterscheidung. Sobald ein Feld geändert wird, wird seine alte Markierung gelöscht; erst die nächste Prüfung bewertet es neu. Leere oder ungültige Zahlen erhalten einen gesonderten Hinweis und zählen nicht als Fehlversuch. Ein nur angesehener Rechenweg wird nicht als richtige eigene Lösung grün markiert.

Die Regler im Parabel-Labor dienen dem Erkunden eines Beispiels und werden nicht als richtig oder falsch bewertet. Die Antwortprüfung gehört weiterhin zu den Trainingsaufgaben.

## Neue Gestaltung in Version 3.1

Ein neues Farbsystem aus Dunkelblau, Grün und Lavendel, größere Formelbereiche und ruhiger gegliederte Karten führen durch den Lernpfad. Die drei Phasen Entdecken, Trainieren und Sichern sind sichtbar. Der Aufgabenbereich trennt Aufgabenstellung, Zielform, Rechenschritte und eigene Eingaben.

Das Parabel-Labor zeigt die Normalform und die Scheitelpunktform desselben veränderbaren Beispiels gleichzeitig. Scheitelpunkt, Hilfslinien und ein feineres Koordinatengitter unterstützen die Zuordnung. Der Achsenausschnitt bleibt beim Verändern gleich, damit die Bewegung der Parabel vergleichbar bleibt. Die Darstellung enthält keine Vorschau der Lösung einer aktiven Trainingsaufgabe.

Die Rückmeldung bleibt jetzt als schwebende Box am Bildschirmrand erreichbar.
Sie lässt sich zu einem kleinen Punkt einklappen und wieder öffnen. Neue
Rückmeldungen werden am Punkt angezeigt; die gewählte Ansicht wird gespeichert.
Breite und Höhe passen sich auch bei Drehung, Split View und veränderter sichtbarer
Bildschirmhöhe an. Die Touch-Gestaltung wurde in Edge und WebKit geprüft.
Ein physischer iPad-/Safari-Test ist damit nicht ersetzt.

## Ziel und Ablauf

Die Lernenden wandeln Scheitelpunktform und Normalform ineinander um und üben die wertneutrale quadratische Ergänzung. Voraussetzung: binomische Formeln und Zusammenfassen von Termen. Arbeitsannahme: Beide Formen wurden bereits kurz eingeführt.

1. **Entdecken:** Rechenschritte aufdecken, Parameter verändern und den Scheitelpunkt im Graphen betrachten. Ein zusätzliches Beispiel zeigt das Ausklammern eines Vorfaktors.
2. **Trainieren:** zehn Aufgaben, fünf je Richtung. Bei der quadratischen Ergänzung werden nacheinander der lineare Koeffizient nach dem Ausklammern und seine Hälfte, die Ergänzungszahl und ihr äußerer Ausgleich sowie die Scheitelkoordinaten geprüft.
3. **Abschlusscheck:** je eine neue Aufgabe pro Richtung, ohne vorgegebene Zwischenfelder. Der Anspruch liegt höchstens auf einer zuvor im Training selbstständig gelösten Stufe. Er wird auch durch externe Empfehlungen nicht darüber angehoben.
4. **Sichern:** differenzierte Auswertung und eine kurze Erklärung auf Papier. Freiwilliges Weiterüben bleibt möglich.

Etwa 20 Minuten sind ein Richtwert. Es gibt keinen Zeitdruck. Zwischenschritte auf Papier helfen.

## Anpassung und Motivation

Die Oberfläche zeigt Lernetappen, bearbeitete Aufgaben, aktive Rechenschritte und konkrete Rückmeldungen. Erfolge werden an beobachteten Lösungen festgemacht. Es gibt keine Noten, Leben, Rangliste oder pauschalen Kompetenzurteile.

Die Stufen gelten pro Richtung getrennt: ganze Klammerzahlen; halbe Klammerzahlen; andere Vorfaktoren einschließlich negativer und halber Faktoren. Zwei neue aufeinanderfolgende Lösungen ohne Fehler und Zusatzhinweis öffnen die nächste Stufe. Unterstützte Lösungen senken den Anspruch höchstens um eine Stufe und setzen die Aufstiegsserie zurück. Langfristige Erfolgszahlen bleiben für die Auswertung erhalten.

„Selbstständig“ bedeutet hier: alle verlangten Eingaben ohne Fehlversuch und ohne zusätzlichen Hinweis. Eine geplante Aufgabe mit Zwischenfeldern ist dabei ein Aufgabenformat. Sie ist nicht gleichbedeutend mit einem Nachweis ohne vorgegebenen Rechenweg. Der Abschlusscheck wird deshalb gesondert ausgewiesen.

Ohne Onlineauswahl werden bei fehlerfreiem Standardverlauf Vorfaktoren bereits im Training bearbeitet. Der Tutor darf zur Festigung eine leichtere Aufgabe wählen. Die erste solche Aufgabe hat einen nicht verschwindenden linearen Term. Der Aufgabenpool enthält auch Fälle mit Klammerzahl null und Scheitelhöhe null. Wiederholungen der letzten fünf Aufgaben derselben Richtung werden vermieden, soweit der Pool dies zulässt.

## Eingaben und Hilfen

Zahlen mit Dezimalkomma oder -punkt, gewöhnliche Brüche und gemischte Zahlen werden unterstützt. `1 1/2` bedeutet anderthalb und `-1 1/2` minus anderthalb; `1 / 2` ist ein halber. Getrennte Zahlblöcke wie `1 2` werden abgewiesen. Native Zahlenfelder haben ein mathematisch gesetztes Eingabeecho und einen Vorzeichenknopf.

Ungültige Eingaben zählen nicht als Fehlversuch. Zwei gestufte Hinweise sind erreichbar. Nach zwei Fehlversuchen oder zwei genutzten Hinweisen kann der vollständige Rechenweg angesehen werden; dies erzeugt keinen selbstständigen Erfolg. Der einklappbare Werkzeugkasten bleibt auch in schmaler Ansicht erreichbar.

## Speicherung und Migration

Der Fortschritt bleibt lokal im Browser unter `formenwechsel-k9-v1`. Trotz des historischen Schlüsselnamens enthält Version 2 das erweiterte Schema. Es gibt keine Namen-, Klassen- oder Code-Anmeldung und keine geräteübergreifende Synchronisation. Auf gemeinsam genutzten Geräten vor einem Personenwechsel **Neu beginnen** verwenden.

Gültige ältere Stände werden migriert. Fertige alte Durchgänge behalten ihren Abschluss und ihren bisherigen Umfang; ein Neustart verwendet das neue Modell. Bei beschädigter aktueller Aufgabe bleiben gültige frühere Ergebnisse erhalten. Ist der Gesamtzustand unbrauchbar, wird vor einem Neustart eine lokale Sicherung versucht und ein Hinweis angezeigt. Blockiertes Speichern wird ausdrücklich gemeldet.

## Automatische Lernbegleitung

Nach einer gültigen Antwort kann der Lernpfad automatisch einen Cloudflare Worker aufrufen. Dieser rechnet die verlangten Zahlen nach, fordert kurzes Feedback an und lässt Charles die nächste passende Aufgabe aus einem geprüften Kandidatenkatalog auswählen. Ein richtiger Schritt erhält kurzes Lob; eine falsche Rechnung einen Denkanstoß. Die laufende Aufgabe wird nicht ausgetauscht. Direkte Fragen sind ohne Kopier-/Einfügeschritt in derselben Box möglich.

Die Rückmeldung erscheint in einer bildschirmfesten, einklappbaren Box rechts.
Gültige Modellwahlen werden für die nächste Runde übernommen. Hinweise zur laufenden
Bearbeitung zählen als Hilfe, bestätigendes Lob nicht. Die unabhängige Aufgabenprüfung,
beide Umwandlungsrichtungen und die Abschlussgrenzen bleiben erhalten.

**Aktueller Betriebsstand:** Die automatische Aufgabenauswahl läuft über den
bereitgestellten Cloudflare-Worker mit **Workers AI / Llama 3.3 70B**. Echte
KI-Antworten bestimmen die Folgeaufgabe aus dem geprüften Pool. Die Oberfläche
zeigt sie in der Box **Charles** an. Bei Fehlern und
Zeitüberschreitungen bleibt die lokale Steuerung verfügbar. Der Worker wurde
mit synthetischen Antworten live geprüft. Einrichtung: [WORKERS_AI.md](WORKERS_AI.md).

Der vorgegebene freigegebene fobizz-Assistent ist zusätzlich über
**fobizz-Lernhilfe** im Seitenfuß erreichbar.
Die Adresse steht als `assistantUrl` in `config.public.json`. Der Chat öffnet in
einem neuen Tab; Aufgaben und Antworten werden nicht automatisch übertragen.
Der Link wird erst beim Anklicken aufgerufen und benötigt keinen Cloudflare-Worker.

Die aktive Verbindung ist in `config.public.json` und `wrangler.jsonc` eingerichtet.
Secrets gehören ausschließlich auf den Server. `Einrichtung_Cloudflare_fobizz.md`
beschreibt die frühere, optionale fobizz-API-Vorbereitung. Der öffentliche
Freigabelink ist kein API-Schlüssel.

Bei Netzwerkfehlern oder nach dem Zeitlimit übernimmt die lokale Steuerung. Verspätete Rückmeldungen werden nicht auf geänderte Eingaben angewendet. Der Browser speichert keine serverseitigen Provider-Schlüssel. Es werden keine Namen oder Klassenlisten verlangt. Die eigene technische Sitzung ist keine überprüfte schulische Identität und die lokal veränderbare Übungshistorie kein Notenbuch.

## Quellen und Weiterentwicklung

- `app.js`: Fachmodell, Lernverlauf, Eingaben, Speicherung und automatische Rückmeldungen.
- `automatic.js`: Browsertransport und Sitzung.
- `charles-chat.js`: direktes Fragenfeld, begrenzter Gesprächsverlauf und Kontextwechsel.
- `coach-dock.js`: schwebende Lernbegleitung, Touch-Bedienung, Ansichtsspeicherung
  und Anpassung an den sichtbaren Bildschirmbereich.
- `worker/`: Cloudflare Gateway, Fachvertrag und Connector-Anschluss.
- `template.html`: Struktur der Oberfläche.
- `design.css`: vollständiges responsives Design; wird beim Build in die HTML-Datei eingebettet.
- `vendor/`: KaTeX 0.16.11 mit Schriften und Lizenztexten.
- `build.py`: eigenständige HTML-Ausgabe mit eingebetteten Ressourcen.
- `test.cjs`: fachliche, funktionale und gezielte Regressionstests mit DOM-Nachbildung.
- `QUALITAETSPRUEFUNG.md`: aktualisierte Befunde und tatsächliche Prüfgrenzen.

Zum Ändern und Prüfen: `python3 build.py`, `npm ci` und `npm test`. Zum Nutzen der fertigen Datei werden Python und Node nicht benötigt. Die Beispiele wurden für diesen Lernpfad erstellt; eine amtliche KLP-Zuordnung wird nicht behauptet.
