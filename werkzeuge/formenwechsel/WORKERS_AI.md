# Scheitelpunkt-Trainer mit Cloudflare Workers AI

Der eigene KI-Tutor wählt konkrete Aufgaben aus dem mathematisch geprüften Pool
und gibt kurze Hinweise zu Rechenschritten. Er nutzt die pädagogischen Vorgaben
aus dem Materialpaket und ist ein eigener Tutor, keine Kopie des fobizz-Agenten.
Der fobizz-Freigabelink bleibt als zusätzliche Chat-Lernhilfe erreichbar.

## Aktiver Anschluss

- Worker: `https://formenwechsel-tutor.physik-wettkampf-api.workers.dev`
- Provider: `workers-ai`
- Modell: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Native Bindung: `AI`; kein zusätzlicher Modellanbieter-Schlüssel erforderlich.
- Erlaubter Website-Ursprung: `https://hardenacke.github.io`
- `SESSION_SECRET` liegt ausschließlich als Cloudflare-Secret vor.
- `config.public.json` enthält die öffentliche Worker-Adresse, den erwarteten
  Provider und ein Browserzeitlimit von zwölf Sekunden.

## Aufgabenwahl und Rückmeldungen

1. `worker/domain.mjs` rechnet die Schülerantwort nach und erstellt zulässige
   Folgeaufgaben anhand der bisherigen Lösungen, Fehler und Hilfen.
2. `worker/workers-ai.mjs` sendet diese Beobachtungen und die Kandidaten über
   `env.AI.run()` an das konfigurierte Modell. `modelInput()` enthält die
   pädagogischen Anweisungen. Zahlenwerte und Aufgabenkatalog bleiben unter
   Kontrolle der Fachlogik.
3. Die KI liefert `feedback` und `nextTaskId` als strukturiertes JSON.
   Bei falschen Rechnungen gibt der Worker einen geprüften Hinweis zum konkret
   betroffenen Rechenschritt vor. Abweichende Fehlerhinweise werden verworfen.
4. Der Worker prüft Antwortformat, Länge und gewählte Kennung. Er gibt den zur
   Kennung gehörenden Aufgabenplan zurück. Das Modell kann keine freie Aufgabe
   oder einen eigenen Lösungswert einschleusen.
5. Der Browser prüft Herkunft, Anfragezuordnung und Anspruch erneut. Die nächste
   Aufgabe übernimmt Richtung, Stufe und Zahlenwerte des freigegebenen Plans.

Die Oberfläche kennzeichnet echte Modellantworten als **KI-Lernbegleitung ·
Cloudflare**. Modellfehler und Zeitüberschreitungen lassen die lokale Steuerung
übernehmen. Lob erhöht den Hilfenzähler nicht; KI-Hinweise zu einer ungelösten
Aufgabe zählen als Unterstützung. Beide Abschlussrichtungen bleiben erhalten.

Die Anfragen enthalten Rechenschritte, eingegebene Zahlen, maximal zwölf
Verlaufsbeobachtungen und einen begrenzten Aufgabenkatalog. Namen, Klassenlisten
und fobizz-Zugangsdaten werden nicht übermittelt. Die Sitzung ist technisch und
stellt keine Anmeldung oder benotbare Leistungsakte dar.

Aktuelle Grenzen: 500 Modellaufrufe pro UTC-Tag für den Worker, 15 pro Minute
und 120 insgesamt je Sitzung sowie 200 neue Sitzungen pro Stunde. Zusätzlich
gelten Cloudflares Modellkontingente und Nutzungsabrechnung. Es wird kein
Cloudflare-Tarif automatisch umgestellt. Nach Ausfall oder Kontingentgrenze
bleiben die integrierten Übungen nutzbar.

## Änderungen prüfen und bereitstellen

Im Ordner `werkzeuge/formenwechsel/`:

```powershell
npm ci
npm test
npx wrangler deploy --dry-run
npx wrangler deploy
node scripts/check-live.mjs
```

`check-live.mjs` nutzt echte KI-Aufrufe mit synthetischen Antworten und prüft
Auswahl, Fehlerhinweis, Erfolg und unveränderte Übernahme einer KI-Folgeaufgabe.
Keine Sitzungstoken oder administrativen Zugangsdaten werden ausgegeben.

Danach vom Repository-Stamm aus:

```powershell
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
.local\manim-venv\Scripts\python.exe tests/run_formenwechsel_browser.py
.local\manim-venv\Scripts\python.exe tests/run_formenwechsel_ai_browser.py
```

Der erste Browsercheck prüft den Betrieb ohne KI-Netzwerk. Der zweite prüft
die vorbereitete Website unter ihrem vorgesehenen GitHub-Pages-Ursprung gegen
den echten Worker. Die noch nicht gepushten statischen Dateien werden dabei
lokal in den Browser geladen. Die Veröffentlichung auf GitHub Pages erfolgt
erst nach dem vom Benutzer ausgeführten Commit und Push.

## Offizielle Grundlagen

- [Workers-AI-Bindung](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [Strukturierte Antworten](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Aktives Modell](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)
- [Kontingente und Preise](https://developers.cloudflare.com/workers-ai/platform/pricing/)
