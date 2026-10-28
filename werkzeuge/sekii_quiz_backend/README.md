# Cloudflare-Verbindungen der 15 Sek-II-Quizwelten

Der Worker bewertet die Wettbewerbsaufgaben serverseitig und hält aktive Runden
in SQLite-basierten Durable Objects. D1 speichert die Bestwerte getrennt nach
Quizkennung, Browserprofil und Wertungsversion. EF, Q1, Q2, GK, LK und die drei
Inhaltsfelder haben voneinander getrennte Quizkennungen und Ranglisten.

`src/aufgaben-varianten.js` erzeugt die Zahlenvarianten mit passenden Lösungen
und Zeitbudgets. Die Vorbereitung kopiert dieselben Regeln für das Offline-Training
in die öffentlichen Assets. Sie muss nach Regeländerungen vor dem Website-Build
ausgeführt werden. Neue Runden verwenden `sek2-v2` mit 1 bis 5 Minuten je Aufgabe;
laufende `sek2-v1`-Runden und deren Ranglisten bleiben erhalten.

Vorbereitung im Repository-Stamm:

```text
python werkzeuge/sekii_quiz_vorbereiten.py
```

Danach unter `.local/sekii-quiz/worker/` mit Node.js 24 oder neuer:

```text
npm ci
npm test
npm run test:integration
npm run deploy:check
```

Für die lokale Vorschau zunächst
`npx wrangler d1 migrations apply mathematik-sekii-leaderboard --local`, danach
`npm run dev` ausführen. Die Vorschau verwendet Port 8789 und eine lokale Datenbank.

Der öffentliche Zugang benötigt kein Benutzerkonto und keinen persönlichen Code.
Die vorhandene Wrangler-Anmeldung verwaltet den Dienst; Zugangsdaten gehören
nicht in die Konfiguration oder in öffentliche Assets.

Die produktive Datenbank und der Worker sind eigenständig und verändern den
Sek-I-Dienst nicht. Zugänge und Prüfung stehen in
[QUIZ_SEKII.md](../../dokumentation/QUIZ_SEKII.md).
