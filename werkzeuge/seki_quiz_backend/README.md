# Cloudflare-Verbindungen der 24 Sek-I-Quizze

Dieser Worker bewertet die Wettbewerbsaufgaben serverseitig. Ein Durable Object
pro Quiz und zufälliger Browserkennung hält den Rundenstand. D1 speichert getrennte
Bestwerte je Quiz und Wertungsversion. Die öffentlichen Abfragen geben keine
Browserkennungen, Antwortschlüssel oder Antwortprotokolle aus.

Vorbereitung im Repository-Stamm:

```text
python werkzeuge/seki_quiz_vorbereiten.py
```

Danach unter `.local/seki-quiz/worker/` mit Node.js 24 oder neuer:

```text
npm ci
npm test
npm run test:integration
npm run deploy:check
```

Die Konfiguration enthält die öffentliche D1-Kennung und erlaubte Ursprünge,
keine Zugangsdaten. Wrangler verwendet die vorhandene Anmeldung.

Alle Zugänge, lokale Vorschau und Aktualisierung stehen in
[QUIZ_SEKI.md](../../dokumentation/QUIZ_SEKI.md). Der Website-Build veröffentlicht
diesen Backend-Ordner nicht.
