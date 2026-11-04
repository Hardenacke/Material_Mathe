# Einrichtung im vorhandenen Repository

Version 3.0 · Windows / PowerShell. Es wurde nichts veröffentlicht.

## 1. Lokal ausprobieren

Node.js 24 und Python verwenden. Im Repository-Stamm:

```powershell
npm.cmd --prefix werkzeuge/adaptive_lernpfade test
python werkzeuge/build_site.py
python werkzeuge/site_pruefen.py
python werkzeuge/struktur_pruefen.py
```

`gemeinsam/adaptive-lernpfade/index.html` direkt öffnen und „Ohne Code ausprobieren“ wählen. Keine externen Abhängigkeiten oder KI-Aufrufe. Die Demo hält Fortschritt ausschließlich im Arbeitsspeicher. Die Anmeldung bleibt bei leerer `workerBase` deaktiviert.

## 2. Cloudflare vorbereiten

Die folgenden Workerbefehle in `werkzeuge/adaptive_lernpfade` ausführen:

```powershell
npx.cmd wrangler@4.153.0 login
npm.cmd run deploy:check
```

`wrangler.toml` verwendet den eigenständigen Worker `mathematik-adaptive-lernpfade`, die Origin `https://hardenacke.github.io` und die stabile Schulkennung aus dem Starter. Die Origin enthält keinen Repositorypfad. Bei eigener Domain bewusst ändern. `SCHOOL_ID` nach dem ersten Einsatz stabil halten: Eine andere Kennung öffnet einen anderen Schulbereich.

Zwei unabhängige, zufällige Geheimnisse mit mindestens 32 Zeichen im eigenen Passwortmanager erzeugen und dort aufbewahren. `TEACHER_KEY` dient der Lehrkraftanmeldung. `CODE_PEPPER` schützt die Lerncodes und darf später nicht unüberlegt ausgetauscht werden. Die Werte werden interaktiv eingegeben und gehören niemals in öffentliche Dateien, Git oder eine Chatnachricht:

```powershell
npx.cmd wrangler@4.153.0 secret put TEACHER_KEY
npx.cmd wrangler@4.153.0 secret put CODE_PEPPER
npm.cmd run deploy:worker
```

Die tatsächliche Workeradresse aus dem Deployment übernehmen. Produktive Secrets wurden durch die lokale Einrichtung nicht angelegt. Vorhandene andere Worker und ihre Datenbanken werden nicht verwendet.

## 3. öffentliche Adresse eintragen

Im Repository `werkzeuge/adaptive_lernpfade/config.public.json` bearbeiten:

```json
{"workerBase":"https://TATSAECHLICHER-WORKER.workers.dev","title":"Bewegung verstehen","allowLocalDemo":true}
```

Nur die echte öffentliche Workeradresse eintragen. Keine Lerncodes, Klassenraumlinks oder Secrets. Anschließend im Repository-Stamm erneut bauen und prüfen. Die beiden HTML-Dateien werden automatisch erzeugt.

Der vorhandene `.github/workflows/pages.yml` bleibt zustündig. Weder Pages auf `/docs` umstellen noch ein neues Repository anlegen. Eine Veröffentlichung der statischen Seiten erfolgt erst durch einen ausdrücklich beauftragten Push auf `main`. Diese Einrichtung enthält keinen Commit und keinen Push.

## 4. Lerngruppe einrichten

1. `gemeinsam/adaptive-lernpfade/admin.html` auf der veröffentlichten Website öffnen.
2. Workeradresse prüfen und mit `TEACHER_KEY` anmelden.
3. Lerngruppe mit 1–40 Lernplätzen und 7–365 Tagen Speicherdauer anlegen.
4. Erlaubte Modi und Standardmodus wählen. Der Einzelchat setzt keinen fobizz-Klassenraum voraus.
5. Für Klassenraumtransfer einen tatsächlich freigegebenen fobizz-Link hinterlegen; Übertragungsweg „Bewusster Transfer“ verwenden.
6. Codeliste einmalig herunterladen und geschützt außerhalb des öffentlichen Repositorys aufbewahren. Pro Person einen Code verteilen.

Der Code öffnet einen Lernplatz und beweist keine Identität. Codes nicht teilen. Zwei Codes testen: Aufgaben bearbeiten, abmelden, neu anmelden, Gerätewechsel und getrennte Lernstände prüfen. Codeersatz erhält den Lernstand; Zurücksetzen löscht Lernstand und lokale Chatkontexte.

## 5. fobizz-Livechat ergänzen

Die Moduswahl, persönliche Chatkontexte, Nachrichtenverarbeitung und validierten Folgeaufgaben sind implementiert. `worker/fobizz-adapter.mjs` ist trotzdem gesperrt (`ready: false`), da keine unterstützte Schnittstelle mit Authentifizierung und Antwortvertrag vorliegt. Das Einschalten eines Raummodus allein schaltet die API nicht frei.

Die [Klärungsfragen](FOBIZZ_API_KLAERUNG.md) dienen der eigenen Anfrage bei fobizz. Es wurde keine Nachricht versendet. Nach bestätigter Dokumentation den Provideradapter implementieren, Antwortformate auf den internen Vertrag abbilden und Integrationstests ausführen. Keine internen Browserendpunkte oder Login-Cookies als Ersatz verwenden. Ein Klassenraumlink erlaubt keine automatische Auswertung der dortigen Chats.

## 6. Lokaler Worker und Browserprüfung

`.dev.vars.example` nach `.dev.vars` kopieren und ausschließlich eigene lokale Testwerte einsetzen. `.dev.vars` wird von Git ignoriert und von Wrangler nicht als produktives Secret hochgeladen. Bei dieser Einrichtung wurde eine solche Datei mit zufälligen lokalen Testwerten erzeugt.

```powershell
npm.cmd run dev:worker
```

Workerport 8790, Zustand unter `.local/adaptive-lernpfade/state`, getrennter lokaler Schulbereich. Ein lokales Deployment ist kein Upload auf Cloudflare.

In einem zweiten Terminal im Repository-Stamm mit installiertem Playwright sowie Edge und WebKit:

```powershell
python tests/run_adaptive_lernpfade_browser.py
```

Das Skript startet die Website auf Port 8000, überschreibt die leere Workeradresse nur in seiner HTTP-Testausgabe, erzeugt Testräume und löscht diese anschließend. In der vorhandenen Umgebung kann `.local\manim-venv\Scripts\python.exe` verwendet werden. Keine produktiven Codes oder Daten einsetzen.

## Betrieb

Fortschritt wird bei Abmeldung erhalten; eine neue Anmeldung ersetzt die vorherige Sitzung. Ablauf wird bei jedem Zugriff geprüft. Ein stündlicher Alarm bereinigt abgelaufene Räume. Raumkonfiguration und Links liegen geschützt im Worker. Es gibt im Pilot einen gemeinsamen schulischen Lehrkraftzugang, keine getrennte Mehrlehrkraftverwaltung. Die Plattform ist für 20 Räume mit je bis zu 40 Lernplätzen vorbereitet; dies ist keine Lasttestzusage.

Weitere Aufgabenbestände sind eigene geprüfte Erweiterungen. Der aktuelle `uniform-motion-v1`-Bestand wird nicht automatisch zu beliebigen Mathematikthemen umgeschrieben.
