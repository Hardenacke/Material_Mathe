# Qualitätsprüfung Formenwechsel – Version 3.2

Stand 4. November 2026. Gegenstand: automatischer Hintergrundtutor, Aufgabenwahl und kurze Rückmeldungen.

## Ergebnis und Betriebsstand

Die Lernendenoberfläche verwendet die Aufgabenbearbeitung und eine kleine Feedbackkarte. Der frühere fobizz-Chat, die Klassenzimmerwahl und das Kopieren von JSON wurden entfernt. Der Browser ruft nach gültigen Antwortprüfungen automatisch den Worker auf. Ein Tutor kann die Folgeaufgabe aus geeigneten Kandidaten auswählen. Richtigkeitsprüfung, Referenzrechnung und Fortschrittsnachweise bleiben unter Kontrolle der Fachlogik.

Der Ablauf ist implementiert und lokal geprüft. **Nicht umgesetzt ist die konkrete externe Protokollabbildung auf eine bestätigte fobizz-API:** Für den bereitgestellten öffentlichen Tutor-Link liegt kein entsprechender API-Vertrag vor. In dieser Umgebung stehen keine fobizz-API- oder Cloudflare-Zugangsdaten zur Verfügung. Es wurde kein Produktions-Worker bereitgestellt und kein automatischer realer fobizz-API-Aufruf durchgeführt. Die ausgelieferte HTML-Datei hat eine leere Worker-Adresse und nutzt die lokale Steuerung. Eine produktive KI-Anbindung wird nicht behauptet.

## Tatsächliche Prüfungen

| Bereich | Prüfung und Ergebnis |
|---|---|
| Lokale Mathematik und Lernverlauf | 21 Prüfgruppen mit echter KaTeX-Bibliothek bestanden. Der vollständige lokale Katalog mit 858 Kombinationen sowie der erweiterte Parameterraum mit 5.150 Kombinationen wurden unabhängig nachgerechnet. 9.447 KaTeX-Renderaufrufe ohne Parsefehler in diesem Testlauf. |
| Automatischer Browserablauf | 14 Tests: erste Tutorwahl verändert die Aufgabe; Lob und Fehlertipp nach gültiger Prüfung; keine Aufrufe auf bloßen Tastendruck oder leere Eingaben; Folgeplan tatsächlich in nächster Runde; veraltete Antworten, Neustart, falsche Parameter, Ausfall und Browserzeitlimit. DOM-Nachbildung, kein physisches Gerät. |
| Worker und Gesamtkette | 18 Tests in der tatsächlichen lokalen `workerd`-Laufzeit über Miniflare, einschließlich SQLite-Durable-Objects, Sitzungen, CORS, HTTP, eigener Fachprüfung, Kandidatenwahl, Größenlimits, Quoten, Idempotenz und konkurrierenden Anfragen. |
| Connector-Grenzen | 3 Tests: fehlende Konfiguration, Antwortgröße ohne Content-Length und Zeitlimit eines nicht antwortenden Dienstes. |
| Gesamtkette im Detail | Die reale Frontendlogik wurde an den realen Browsertransport und den lokalen Worker gekoppelt. Ein ausdrücklich simulierter Provider wählte eine andere als die erste angebotene Aufgabe. Diese Auswahl gelangte automatisch ins aktuelle Aufgabenmodell. Eine falsche Lösung erzeugte den Randhinweis; nach Korrektur wurde ein gewählter Folgeplan automatisch verwendet. |
| Cloudflare-Build | `wrangler deploy --dry-run` erzeugt das Worker-Bundle und erkennt beide Durable-Object-Bindungen. Das ist kein produktives Deployment. |
| Browseroberfläche Version 3.0 | Oberfläche in Chromium mit Prüfrahmen von 390 und 768 Pixeln bedient. Ein falscher linearer Koeffizient erzeugte den örtlichen Denkanstoß; eine richtige Umwandlung wurde abgeschlossen. Die Breiten des inneren Dokuments und seine Scrollbreiten betrugen jeweils 375 beziehungsweise 753 Pixel: kein horizontaler Seitenüberlauf in den geprüften Ansichten. Keine KaTeX-Fehler. |
| Sichtbarkeit des Feedbacks Version 3.0 | Die schmale Karte wurde nach einer Layoutkorrektur oberhalb der Aufgabe angeordnet und bleibt beim Scrollen erreichbar. Die korrigierte Karte war im 390-Pixel-Rahmen etwa 175 Pixel hoch; es handelt sich um eine CSS-Prüfansicht, nicht um eine Geräteemulation. |

Insgesamt 62 Prüfgruppen beziehungsweise Tests: 21 fachliche und lokale Prüfgruppen, 14 Client-, 6 Regler-/Feedback-, 18 Worker- und 3 Adaptertests. Die tatsächliche KI-Rückmeldung im Browser war bei dieser Oberflächenprüfung nicht verbunden. Der automatische Netzablauf wurde in der separat beschriebenen lokalen Gesamtkette geprüft. Test-Connectoren sind ausschließlich unter `tests/` enthalten und nicht in der Produktion gebunden.

## Fachliche und didaktische Sicherungen

Der Aufgabenplan beschreibt intern $a(x+p)^2+k$. Beide Programme berechnen den linearen Koeffizienten $b=2ap$, die Konstante $c=ap^2+k$ und den Scheitelpunkt $S(-p\mid k)$. Die drei Abschnitte der quadratischen Ergänzung prüfen die Hälfte, die Ergänzungszahl sowie den äußeren Ausgleich und zuletzt die Scheitelkoordinaten. Für den Ausgleich gilt $r=-ap^2$; ein negativer äußerer Faktor wird berücksichtigt.

Der Tutor wählt eine Kandidatenkennung. Er darf keine beliebigen Formeln, HTML-Inhalte, Skripte, Musterlösungen oder Erfolgszähler ausliefern. Bei einer richtigen Rechnung bestimmt der Worker die Rückmeldungsart „Lob“, bei einer falschen „Hinweis“. Der Modelltext kann trotzdem fachlich unpassend sein; eine Typ- und Strukturprüfung garantiert keine fehlerfreie KI-Formulierung. Deshalb bleiben lokale Hinweise und die unabhängig berechnete Bewertung erhalten.

Die Standardrunde umfasst zehn Trainingsaufgaben, fünf je Richtung, und anschließend eine Aufgabe je Richtung im Abschlusscheck. Die folgende Auswahl berücksichtigt die bisherige Stufe und kann zur Festigung leichter ausfallen. Sie darf kein ungeübtes Abschlussniveau einführen. Die erste Vorfaktorübung enthält einen linearen Term. Die bereits behobenen Vorzeichen-, Eingabe- und Aufstiegsfehler bleiben durch Regressionstests abgesichert.

Eine gelieferte KI-Hilfe zur laufenden Bearbeitung setzt `aiAssisted`. Die Aufgabe zählt dann nicht als selbstständig gelöst. Bloßes Lob nach einer richtigen Rechnung erzeugt keinen Hilfemalus. Der Tutor erzeugt keine Punkte, Noten oder pauschalen Kompetenzdiagnosen. Geführte Eingaben und freie Abschlussaufgaben bleiben in der Auswertung unterscheidbar.

## Technische Prüfung des automatischen Ablaufs

Eine Aufgabe wird nur vor Beginn der Eingabe ausgewählt oder nach Abschluss für die nächste passende Runde vorgemerkt. Ein laufender Rechenweg bleibt erhalten. Während der anfänglichen Auswahl ist die Eingabe kurz gesperrt; nach dem Browserzeitlimit wird sie mit lokaler Auswahl wieder freigegeben. Eine abgeschlossene Aufgabe wartet begrenzt auf ihren Folgeplan. Ein verspäteter Antworttext darf keine inzwischen geänderten Eingaben erläutern.

Der Worker prüft die Zahlen erneut. Die vom Browser übergebene Historie ist jedoch lokal veränderbarer Übungskontext. Sie ist keine serverseitig gesicherte Schulleistung. Diese Version besitzt weder eine Lernendenidentitätsprüfung noch eine manipulationssichere Leistungsdatenbank oder Geräte-Synchronisation.

Jede Anfrage besitzt eine zufällige Kennung und eine monotone Sitzungssequenz. Die letzten vierzig Anfragezustände werden im zugehörigen Durable Object gespeichert. Eine gespeicherte Wiederholung verwendet die Antwort erneut; eine gleichzeitig noch laufende Anfrage liefert „pending“. Eine wiederverwendete Kennung mit geändertem Inhalt oder eine alte Sequenz wird abgelehnt. Ein nach einem neueren Auftrag eintreffendes Ergebnis wird verworfen. Ein unklar gebliebener externer Aufruf wird nicht automatisch wiederholt. Die externe Dienstanfrage findet außerhalb einer Speichertransaktion statt.

Der Browser verwendet kurzlebige signierte Sitzungen im Tab-Speicher. Die Gültigkeit ist auf sechs Stunden und den Webursprung begrenzt. Server-Secrets gehören nicht ins HTML. CORS prüft den Ursprung, ist aber keine Schulidentitätsprüfung. Ein gemeinsames Durable Object schützt das Tageskontingent sitzungsübergreifend. Das kann fremden Verbrauch nicht vollständig verhindern, begrenzt jedoch Reservierungen für externe Modellaufrufe. Reservierungen werden auch bei Ausfällen gezählt.

Die automatischen Aufträge enthalten Aufgabenparameter, numerische Antworten und begrenzte Lernbeobachtungen, keine Namen und keinen öffentlichen Tutor-Link. Tastatureingaben werden nicht einzeln übertragen. Sitzungscaches werden nach Ablauf zur Löschung eingeplant. Aufbewahrung beim Provider und Cloudflare-Backups sind davon getrennte Fragen; eine dortige Löschung wird nicht durch den lokalen Alarm zugesagt.

## Bekannte Grenzen und nächste Freischaltung

1. Bestätigter externer fobizz-API-Zugang einschließlich Berechtigung, Authentifizierung, Tutorzuordnung und Protokollabbildung fehlt. Ein Freigabelink ersetzt dies nicht. Es wird keine generelle Nichtexistenz einer solchen API behauptet.
2. Der fobizz-Connector und sein Cloudflare-Service-Binding müssen anhand dieser Dokumentation eingerichtet werden. Der interne Host `fobizz-connector.internal` ist ausschließlich ein eigener Service-Vertrag, kein fobizz-Endpunkt.
3. Cloudflare muss unter dem tatsächlichen Konto eingerichtet und seine URL im HTML-Build hinterlegt werden. Geprüft wurde nur der lokale Lauf und ein Build ohne Deployment.
4. Physisches iPad/Safari, Bildschirmtastatur, eine reale Offline-Geräteprüfung und Unterrichtserprobung wurden nicht durchgeführt. Die neue Oberfläche wurde in Chromium-Breitenrahmen bedient.
5. Vor produktiver Freigabe ist ein echter Durchlauf mit richtiger und falscher Antwort sowie automatischer Folgeaufgabe gegen den tatsächlich gebundenen fobizz-Tutor erforderlich.

Die Einrichtung steht in `Einrichtung_Cloudflare_fobizz.md`. Die früheren manuellen fobizz-Chat-Tests sind historische Nachweise und gelten nicht als Prüfung der neuen Hintergrundschnittstelle.

## Visuelle Überarbeitung, Version 3.1

Die Gestaltung wurde vollständig neu aufgebaut und als eingebettetes `design.css` vereinheitlicht. Ein ruhiger Einstieg, eine klare Gliederung der drei Lernphasen, größere Aufgabenformeln, gruppierte Eingaben und zurückhaltend farbige Hilfekarten bilden das neue Erscheinungsbild. Die Parabeldarstellung besitzt nun ein feineres Gitter, eine hervorgehobene Kurve, einen Scheitelpunkt mit Hilfslinien und die beiden gleichzeitig gerenderten Funktionsformen. Die Achsengrenzen bleiben unverändert.

Die bestehende Prüfung aller Beispielparameter stellt weiterhin sicher, dass der Scheitelpunkt im Diagramm sichtbar bleibt. Die neuen Funktionsformen und der Schrittzähler rendern während der vorhandenen Parameter- und Ablaufprüfungen mit striktem KaTeX. Alle 56 bisherigen Prüfgruppen und Tests bestehen. Der Fachtestlauf enthält nun 9.447 KaTeX-Renderaufrufe ohne Parsefehler. Die spätere kleine CSS-Korrektur betraf den kompakteren Einstieg und größere Vorzeichenknöpfe; die mathematische Logik wurde dadurch nicht verändert.

In Chromium wurden Einstieg, Rechenschritte, Regler und Aufgabenbereich kontrolliert. Die Regler wurden bis zum Randfall mit Hälfte 4 und Konstante -5 bedient; angezeigt wurden korrekt die Normalform $x^2+8x-5$, die Scheitelpunktform $(x+4)^2-21$ und der Scheitelpunkt $S(-4\mid -21)$. Eine falsche Eingabe im geführten Training erzeugte die sichtbare Rückmeldung.

| Prüfansicht | Feststellung |
|---|---|
| Desktop | 1348 Pixel Dokumentbreite und Scrollbreite; keine KaTeX-Fehler und keine ungerenderten Mathematikcontainer im geprüften Einstieg. |
| Schmaler Rahmen | 390 Pixel Rahmenbreite, 375 Pixel innere Dokument- und Scrollbreite; kein seitlicher Seitenüberlauf. Vorzeichenknöpfe gemessen 44 Pixel breit. Die Rückmeldung war nach einer falschen Antwort weiterhin im sichtbaren Bereich. |
| Tabletbreite | 768 Pixel Rahmenbreite, 753 Pixel innere Dokument- und Scrollbreite; kein seitlicher Seitenüberlauf und keine KaTeX-Fehler in den geprüften Ansichten. |

Die neue Gestaltung wurde anhand von Screenshots geprüft und für die schmale Ansicht nachgebessert. Die verbleibenden Grenzen der echten fobizz-Anbindung sowie der ausstehende Test auf einem physischen iPad bleiben bestehen. Das Design fügt keine simulierte KI-Verbindung hinzu.

## Schieberegler und Antwortfarben, Version 3.2

Die Parameterregler sind untereinander mit durchgehender farbiger Skala angeordnet. Ihre native Eingabefläche ist 44 Pixel hoch. Die Plus-/Minus-Tasten sind jeweils 44 Pixel breit und hoch. Einzelne Schritte und Tastaturbedienung werden unterstützt; Grenzwerte werden eingehalten und die zugehörigen Tasten deaktiviert. Die sichtbaren Skalen und Werte werden mit KaTeX gerendert. Die Parameterbereiche bleiben unverändert.

Die lokalen mathematischen Prüfungen steuern die Farben: richtige Zahl grün, falsche Zahl rot. Statussymbole und Wörter stehen zusätzlich unter den jeweiligen Eingaben. Gemischte Ergebnisse werden pro Feld unterschieden. Eine Änderung oder ein Vorzeichenwechsel löscht die alte Feldmarkierung, bis erneut geprüft wird. Neue Zwischenfelder sind ungeprüft und erhalten deshalb keine Erfolgsfarbe des vorherigen Schritts. Leere oder ungültige Zahlen werden separat als Schreibweisenproblem angezeigt; es entsteht kein zusätzlicher Fehlversuch. Angesehene Rechenwege werden neutral markiert.

Sechs zusätzliche Tests prüfen die Parametergrenzen und die Synchronität der Schritttasten, unterschiedliche Feldbewertungen, das Zurücksetzen einer alten Bewertung nach einer Eingabeänderung, ungültige Zahlen ohne Fehlversuch, den Übergang zum nächsten geführten Schritt und die neutrale Darstellung eines angesehenen Rechenwegs. Zusammen mit den bestehenden Prüfungen bestehen 62 Prüfgruppen und Tests.

Die Browserprüfung in Chromium verwendete erneut 390 und 768 Pixel breite Rahmen. Im schmalen Rahmen wurden 375 Pixel Dokument- und Scrollbreite gemessen; in Tabletbreite jeweils 753 Pixel. Es gab keinen seitlichen Seitenüberlauf und keine KaTeX-Fehler in den geprüften Ansichten. Die 44 Pixel hohe Reglerfläche und die 44 Pixel breiten Schritttasten wurden im DOM gemessen. Schritttasten und Tastatur wurden bedient, darunter die beiden Reglergrenzen. Eine Fingerbedienung auf einem physischen iPad ist damit nicht geprüft.

Im Training wurde ein gemischtes Ergebnis zur Normalform $x^2-2x-1$ geprüft: der korrekte lineare Koeffizient $-2$ erschien grün und die falsch eingegebene Hälfte $1$ rot. Nach vollständiger richtiger Bearbeitung im zweiten Rahmen erschienen die Scheitelkoordinaten $1$ und $-2$ samt Rückmeldung grün. Die tatsächlich berechneten Randfarben waren Grün `rgb(44, 154, 96)` und Rot `rgb(195, 77, 92)`. Die Zeichen und Bewertungstexte waren zusätzlich sichtbar. Die Online-KI war für diese Browserprüfung nicht verbunden; die Rückmeldungen stammten aus der lokalen Fachprüfung.
