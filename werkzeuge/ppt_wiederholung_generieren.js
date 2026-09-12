const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const SHAPE = (new pptxgen()).ShapeType;

const root = path.resolve(__dirname, '..');
const struktur = JSON.parse(fs.readFileSync(path.join(root, 'struktur.json'), 'utf8'));

const C = {
  navy: '17324D',
  navy2: '234A69',
  teal: '2A7F8E',
  blue: '3B6EA5',
  purple: '6F5AA8',
  orange: 'D9863D',
  amber: 'F0B44D',
  red: 'C75A5A',
  green: '4F8B67',
  ink: '1F2933',
  muted: '637282',
  line: 'D9E0E6',
  paper: 'F7F8FA',
  white: 'FFFFFF',
  paleBlue: 'EAF1F7',
  paleTeal: 'EAF5F5',
  palePurple: 'F1EDF8',
  paleOrange: 'FBF0E6',
  paleGreen: 'EDF6F0',
  paleRed: 'F9ECEC',
};

const FONT = 'Arial';
const MATH_FONT = 'Cambria Math';

function nrm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g,'ss');
}
function qa(q,a){ return {q,a}; }
function pickAccent(fieldTitle){
  const t=nrm(fieldTitle);
  if(t.includes('stochastik')) return C.orange;
  if(t.includes('geometrie')) return C.purple;
  if(t.includes('funktionen') || t.includes('analysis')) return C.teal;
  return C.blue;
}
function paleForAccent(accent){
  if(accent===C.orange) return C.paleOrange;
  if(accent===C.purple) return C.palePurple;
  if(accent===C.teal) return C.paleTeal;
  return C.paleBlue;
}
function contextLevel(ctx){
  if(ctx.bereichId.startsWith('q1')) return 'Q';
  if(ctx.bereichId==='ef') return 'EF';
  return 'SI';
}

function topicPack(title, ctx){
  const t=nrm(title); const level=contextLevel(ctx);
  const pack=(easy,concept,apply,challenge,key='')=>({easy,concept,apply,challenge,key,matched:true});

  // Sek I – Arithmetik / Algebra
  if(t.includes('naturliche zahlen') && t.includes('stellenwert')) return pack(
    qa('Welche Zahl ist größer: 405 090 oder 405 900?','405 900.'),
    qa('Welche Bedeutung hat die Ziffer 7 in 372 415?','Sie steht an der Zehntausenderstelle und bedeutet 70 000.'),
    qa('Runde 684 731 auf Tausender.','685 000.'),
    qa('Finde eine Zahl zwischen 399 990 und 400 010, die durch 5 teilbar ist.','Zum Beispiel 399 995, 400 000 oder 400 005.'),
    'Stellenwert entscheidet über den Wert einer Ziffer.'
  );
  if(t.includes('grundrechenarten') && (t.includes('rechengesetze') || t.includes('kommutativ') || t.includes('distributivgesetz'))) return pack(
    qa('Berechne: 48 + 37, 96 : 8, 7 · 14.','85; 12; 98.'),
    qa('Wie helfen Kommutativ- und Assoziativgesetz beim geschickten Rechnen?','Man darf Summanden/Faktoren vertauschen und neu gruppieren.'),
    qa('Rechne geschickt: 25 · 17 · 4.','(25·4)·17 = 100·17 = 1700.'),
    qa('Erkläre den Fehler: 6·(10+3)=60+3.','Die 6 muss mit beiden Summanden multipliziert werden: 60+18=78.'),
    'Distributivgesetz: a·(b+c)=a·b+a·c'
  );
  if((t.includes('lange') && t.includes('zeit') && t.includes('geld')) || t.includes('flachen- und volumeneinheiten')) return pack(
    qa('Wandle um: 2,4 m = ? cm.','240 cm.'),
    qa('Warum sind 1 m² nicht 100 cm²?','Weil beide Seiten mit 100 skaliert werden: 1 m² = 10 000 cm².'),
    qa('Ein Weg ist 1,75 km lang. Wie viele Meter sind das?','1750 m.'),
    qa('Ein Rechteck ist 2 m × 35 cm groß. Berechne die Fläche in cm².','200 cm · 35 cm = 7000 cm².'),
    'Vor dem Rechnen immer gleiche Einheiten herstellen.'
  );
  if(t.includes('anteile') && t.includes('bruchteile')) return pack(
    qa('Wie viel sind 3/5 von 20?','12.'),
    qa('Was bedeuten Zähler und Nenner bei 3/5?','Nenner: 5 gleich große Teile; Zähler: 3 davon.'),
    qa('Eine Pizza hat 8 Stücke. 3 sind gegessen. Welcher Bruchteil ist übrig?','5/8.'),
    qa('Welche Darstellung passt besser zu 3/4: 6/8 oder 4/6? Begründe.','6/8, denn gekürzt ergibt es 3/4.'),
    'Bruch = Anteil eines gleichmäßig eingeteilten Ganzen.'
  );
  if(t.includes('teilbarkeit') && t.includes('primzahlen')) return pack(
    qa('Ist 126 durch 3 teilbar? Begründe kurz.','Ja, Quersumme 1+2+6=9 ist durch 3 teilbar.'),
    qa('Was unterscheidet eine Primzahl von einer zusammengesetzten Zahl?','Primzahlen haben genau zwei positive Teiler: 1 und sich selbst.'),
    qa('Zerlege 84 in Primfaktoren.','84 = 2² · 3 · 7.'),
    qa('Finde die kleinste Zahl > 100, die durch 6 und 8 teilbar ist.','120.'),
    'Primfaktorzerlegung macht Teilbarkeit sichtbar.'
  );
  if(t.includes('bruche') && t.includes('dezimalzahlen') && t.includes('prozentdarstellung')) return pack(
    qa('Schreibe 0,75 als Bruch und Prozentzahl.','3/4 und 75 %.'),
    qa('Wann endet die Dezimaldarstellung eines vollständig gekürzten Bruchs?','Wenn der Nenner nur die Primfaktoren 2 und/oder 5 enthält.'),
    qa('Ordne: 2/3, 0,6, 65 %.','0,6 < 65 % < 2/3.'),
    qa('Finde einen Bruch zwischen 0,4 und 0,5.','Zum Beispiel 9/20 = 0,45.'),
    'Bruch, Dezimalzahl und Prozentzahl sind verschiedene Darstellungen derselben Zahl.'
  );
  if(t.includes('grundrechenarten mit einfachen bruchen')) return pack(
    qa('Berechne: 1/4 + 2/4.','3/4.'),
    qa('Warum braucht man bei 1/3 + 1/4 einen gemeinsamen Nenner?','Damit gleich große Teilstücke addiert werden.'),
    qa('Berechne: 3/5 · 10.','6.'),
    qa('Erkläre, warum 1/2 : 1/4 = 2.','In 1/2 passen zwei Viertel.'),
    'Beim Addieren/Subtrahieren: erst gleichnamig machen.'
  );
  if((t.includes('ganze zahlen') || t.includes('ganzer zahlen')) && t.includes('zahlbereichserweiterung')) return pack(
    qa('Ordne: −4, 2, −1, 0.','−4 < −1 < 0 < 2.'),
    qa('Was bedeutet das Vorzeichen „−“ auf der Zahlengeraden?','Die Zahl liegt links von 0; das Minus kennzeichnet negative Zahlen.'),
    qa('Morgens −3 °C, mittags +5 °C. Um wie viel steigt die Temperatur?','Um 8 °C.'),
    qa('Welche Zahl hat Abstand 7 von 0?','7 und −7.'),
    'Betrag = Abstand einer Zahl von 0.'
  );
  if(t.includes('rationale zahlen') && t.includes('vorzeichenregeln')) return pack(
    qa('Berechne: −7 + 12.','5.'),
    qa('Warum ist (−3)·(−4) positiv?','Zwei Vorzeichenwechsel heben sich auf; Ergebnis 12.'),
    qa('Berechne: −18 : 6 − 4.','−3 − 4 = −7.'),
    qa('Setze <, > oder =: −2/3 __ −0,6.','−2/3 < −0,6.'),
    'Gleiche Vorzeichen beim Multiplizieren/Dividieren → positiv; verschiedene → negativ.'
  );
  if(t.includes('variable als veranderliche')) return pack(
    qa('Vereinfache: 3x + 2x.','5x.'),
    qa('Welche Rollen kann eine Variable haben?','Zum Beispiel Veränderliche, Platzhalter oder Unbekannte.'),
    qa('Stelle einen Term auf: „Das Dreifache einer Zahl minus 5“.','3x − 5.'),
    qa('Erkläre, warum 2a + 3b nicht zu 5ab zusammengefasst werden darf.','Es sind ungleichartige Terme.'),
    'Nur gleichartige Terme dürfen addiert/subtrahiert werden.'
  );
  if(t.includes('lineare gleichungen') && !t.includes('gleichungssysteme')) return pack(
    qa('Löse: x + 7 = 19.','x = 12.'),
    qa('Was bedeutet „Äquivalenzumformung“?','Eine Umformung, die die Lösungsmenge nicht verändert.'),
    qa('Löse: 4x − 6 = 18.','x = 6.'),
    qa('Eine Taxifahrt kostet 4 € Grundpreis und 2 € je km. Bei 18 €: Wie viele km?','4 + 2x = 18 → x = 7 km.'),
    'Auf beiden Seiten immer dieselbe Operation ausführen.'
  );
  if(t.includes('termumformungen') && t.includes('binomische')) return pack(
    qa('Vereinfache: 4x − 2x + 7.','2x + 7.'),
    qa('Welche Struktur steckt in (a+b)²?','Quadrat einer Summe: a² + 2ab + b².'),
    qa('Multipliziere aus: (x+3)(x−3).','x² − 9.'),
    qa('Faktorisiere: x² + 10x + 25.','(x+5)².'),
    '(a±b)²=a²±2ab+b²; (a+b)(a−b)=a²−b²'
  );
  if(t.includes('lineare gleichungssysteme mit zwei variablen')) return pack(
    qa('Ist (2|3) Lösung von x+y=5?','Ja.'),
    qa('Was bedeutet der Schnittpunkt zweier Geraden im LGS?','Er erfüllt beide Gleichungen gleichzeitig.'),
    qa('Löse: x+y=7 und x−y=1.','x=4, y=3.'),
    qa('Wann hat ein LGS keine bzw. unendlich viele Lösungen?','Bei parallelen verschiedenen Geraden bzw. identischen Geraden.'),
    'Lösung eines LGS = gemeinsamer Punkt aller Gleichungen.'
  );
  if(t.includes('bruchterme') && t.includes('bruchgleichungen')) return pack(
    qa('Für welche x ist 3/(x−2) nicht definiert?','Für x=2.'),
    qa('Warum muss man bei Bruchtermen die Definitionsmenge beachten?','Nenner dürfen nicht 0 werden.'),
    qa('Vereinfache: 6x/(3x), x≠0.','2.'),
    qa('Löse: 2/x = 1/3.','x=6.'),
    'Nenner ≠ 0; danach sinnvoll kürzen oder Hauptnenner verwenden.'
  );
  if(t.includes('reelle zahlen') && t.includes('quadratwurzeln')) return pack(
    qa('Berechne: √81.','9.'),
    qa('Warum ist √2 irrational?','√2 lässt sich nicht als Quotient zweier ganzer Zahlen darstellen.'),
    qa('Vereinfache: √50.','5√2.'),
    qa('Zwischen welchen ganzen Zahlen liegt √70?','Zwischen 8 und 9.'),
    '√a ist die nichtnegative Zahl, deren Quadrat a ist.'
  );
  if(t.includes('potenzen, potenzgesetze') && t.includes('zahlendarstellungen')) return pack(
    qa('Berechne: 2⁵.','32.'),
    qa('Formuliere die Regel für aᵐ·aⁿ.','aᵐ·aⁿ = aᵐ⁺ⁿ.'),
    qa('Schreibe 3,2·10⁵ als normale Zahl.','320 000.'),
    qa('Vereinfache: (2x³)².','4x⁶.'),
    'Gleiche Basis: beim Multiplizieren Exponenten addieren.'
  );
  if(t.includes('quadratische gleichungen')) return pack(
    qa('Löse: x² = 49.','x = ±7.'),
    qa('Wie hängen Nullstellen einer Funktion und Lösungen einer Gleichung zusammen?','Nullstellen lösen f(x)=0.'),
    qa('Löse: x² − 5x + 6 = 0.','x=2 oder x=3.'),
    qa('Eine quadratische Gleichung hat Diskriminante < 0. Was folgt?','Keine reelle Lösung.'),
    'Quadratische Gleichungen können 0, 1 oder 2 reelle Lösungen besitzen.'
  );
  if(t.includes('potenzen mit rationalen exponenten')) return pack(
    qa('Berechne: 16^(1/2).','4.'),
    qa('Was bedeutet a^(1/n)?','Die n-te Wurzel aus a (im passenden Definitionsbereich).'),
    qa('Schreibe ∛(x²) als Potenz.','x^(2/3).'),
    qa('Vereinfache: 27^(2/3).','9.'),
    'a^(m/n) = (ⁿ√a)^m'
  );
  if(t.includes('exponentielle gleichungen') && t.includes('logarithmus')) return pack(
    qa('Löse: 2ˣ = 8.','x=3.'),
    qa('Was ist log_b(a)?','Der Exponent, mit dem b potenziert werden muss, um a zu erhalten.'),
    qa('Löse: 5·1,2ˣ = 10.','x = ln(2)/ln(1,2) ≈ 3,80.'),
    qa('Warum ist log(−3) im Reellen nicht definiert?','Exponentialfunktionen mit positiver Basis nehmen nur positive Werte an.'),
    'bˣ=a ⇔ x=log_b(a)'
  );

  // Sek I – Funktionen
  if(t.includes('tabellen und diagrammen') && t.includes('zuordnungen')) return pack(
    qa('Zu 1, 2, 3 gehören 4, 7, 10. Wie geht es weiter?','Bei konstantem Zuwachs +3: zu 4 gehört 13.'),
    qa('Woran erkennt man in einer Tabelle, dass zwei Größen zusammenhängen?','Jedem Eingabewert ist ein Ausgabewert nach einer Regel zugeordnet.'),
    qa('Ein Eintritt kostet 3 € pro Person. Erstelle Werte für 1, 2, 5 Personen.','3 €, 6 €, 15 €.'),
    qa('Welche Information zeigt ein Diagramm besser als eine lange Tabelle?','Trends, Vergleiche und Veränderungen sind schneller sichtbar.'),
    'Zuordnung: Eingabe → Regel → Ausgabe.'
  );
  if(t.includes('massstab') && t.includes('fermi')) return pack(
    qa('Maßstab 1:100. Wie lang sind 3 cm im Plan in Wirklichkeit?','3 m.'),
    qa('Was ist bei einer Fermi-Aufgabe wichtiger als exakte Daten?','Sinnvolle Annahmen, Größenordnungen und nachvollziehbare Schritte.'),
    qa('Eine Karte hat Maßstab 1:25 000. 4 cm entsprechen wie vielen km?','1 km.'),
    qa('Schätze: Wie viele Schritte gehst du an einem Schultag? Nenne 2 nötige Annahmen.','Beispiel: Wegezahl und mittlere Weglänge; Ergebnis abhängig von Annahmen.'),
    'Maßstab = Bildlänge : Originallänge.'
  );
  if(t.includes('abhangigkeiten zwischen grossen') && t.includes('termansatzen')) return pack(
    qa('Ein Heft kostet 2 €. Was kosten n Hefte?','2n €.'),
    qa('Welche vier Darstellungen können denselben Zusammenhang beschreiben?','Wort, Tabelle, Diagramm, Term.'),
    qa('Bei y=3x+2: Berechne y für x=4.','14.'),
    qa('Welche Darstellung ist für eine schnelle Prognose besonders hilfreich? Begründe.','Oft Term oder Graph; Begründung abhängig vom Kontext.'),
    'Darstellungswechsel hilft, Zusammenhänge zu verstehen.'
  );
  if(t.includes('proportionale zusammenhange') && t.includes('dreisatz') && !t.includes('antiproportionale')) return pack(
    qa('3 Hefte kosten 6 €. Was kostet 1 Heft?','2 €.'),
    qa('Woran erkennt man Proportionalität?','Quotient y/x ist konstant; Graph ist Gerade durch den Ursprung.'),
    qa('5 kg Äpfel kosten 12 €. Was kosten 8 kg?','19,20 €.'),
    qa('Ist „doppelte Zeit → doppelter Weg“ immer proportional?','Nur bei konstanter Geschwindigkeit und Start bei 0.'),
    'Proportional: y = k·x.'
  );
  if(t.includes('proportionale und antiproportionale')) return pack(
    qa('Proportional: 4 Stück kosten 10 €. Was kosten 8 Stück?','20 €.'),
    qa('Wie unterscheidet sich antiproportional von proportional?','Proportional: Quotient konstant; antiproportional: Produkt konstant.'),
    qa('6 Arbeiter brauchen 10 h. Idealisiert: Wie lange brauchen 12?','5 h.'),
    qa('Welche Zuordnung passt zu y=24/x?','Eine antiproportionale Zuordnung.'),
    'Proportional y=kx; antiproportional y=k/x.'
  );
  if(t.includes('prozentrechnung') && t.includes('zinsrechnung')) return pack(
    qa('Wie viel sind 20 % von 80 €?','16 €.'),
    qa('Unterscheide Grundwert, Prozentwert und Prozentsatz.','G: Ganzes; W: Anteil; p%: Anteil in Hundertsteln.'),
    qa('Ein Preis steigt von 50 € auf 60 €. Prozentuale Erhöhung?','20 %.'),
    qa('1000 € werden mit 3 % p.a. verzinst. Kontostand nach einem Jahr?','1030 €.'),
    'W = p/100 · G.'
  );
  if(t.includes('lineare funktionen') && t.includes('steigung')) return pack(
    qa('Bei y=2x+3: Wie groß ist die Steigung?','m=2.'),
    qa('Was bedeuten m und b in y=mx+b?','m: Steigung; b: y-Achsenabschnitt.'),
    qa('Bestimme die Gerade durch (0|−1) und (2|5).','m=3, also y=3x−1.'),
    qa('Ein Taxi: 4 € Grundpreis + 1,80 €/km. Welche Funktion passt?','K(x)=1,8x+4.'),
    'm = Δy/Δx; b = f(0).'
  );
  if(t.includes('schnittpunkte linearer funktionen')) return pack(
    qa('Was gilt am Schnittpunkt zweier Funktionsgraphen?','Beide Funktionen haben dort denselben y-Wert.'),
    qa('Warum löst f(x)=g(x) den Schnittpunkt?','Weil die Funktionswerte dort gleich sein müssen.'),
    qa('Schnittpunkt von y=2x+1 und y=−x+7?','2x+1=−x+7 → x=2, y=5.'),
    qa('Zwei Tarife schneiden sich bei x=8. Was bedeutet das im Kontext?','Bei x=8 sind die Kosten gleich; davor/danach ist jeweils ein Tarif günstiger.'),
    'Schnittpunkt: f(x)=g(x).'
  );
  if(t.includes('quadratische funktionen') && t.includes('normalparabel')) return pack(
    qa('Wie lautet die Normalparabel?','f(x)=x².'),
    qa('Was bewirkt f(x)=(x−2)²+3?','Verschiebung um 2 nach rechts und 3 nach oben.'),
    qa('Bestimme den Scheitel von f(x)=2(x+1)²−4.','S(−1|−4).'),
    qa('Wie verändert a in a(x−d)²+e den Graphen?','Vorzeichen: Öffnung; |a|: Streckung/Stauchung.'),
    'Scheitelpunktform: f(x)=a(x−d)²+e.'
  );
  if(t.includes('nullstellen') && t.includes('scheitelpunkt') && (t.includes('quadratischen funktionen') || t.includes('quadratischer funktionen'))) return pack(
    qa('Welche Nullstellen hat f(x)=x²−9?','x=−3 und x=3.'),
    qa('Welche Information liefert der Scheitelpunkt in einem Sachmodell?','Ein Extremum, z. B. maximale Höhe oder minimale Kosten.'),
    qa('Ein Ball: h(t)=−5t²+20t+1. Wann ist die maximale Höhe?','Bei t=−b/(2a)=2 s.'),
    qa('Warum ist nicht jede algebraische Nullstelle im Kontext sinnvoll?','Sie kann außerhalb des sinnvollen Definitionsbereichs liegen, z. B. negative Zeit.'),
    'Nullstellen: f(x)=0; Scheitel: Extrempunkt der Parabel.'
  );
  if(t.includes('exponentielle funktionen') && t.includes('wachstums- und zerfallsprozesse')) return pack(
    qa('Bei f(x)=3·1,2ˣ: Wachstumsfaktor?','1,2.'),
    qa('Woran erkennt man exponentielles Wachstum?','In gleichen Schritten wird mit demselben Faktor multipliziert.'),
    qa('100 Bakterien wachsen pro Stunde um 50 %. Anzahl nach 3 h?','100·1,5³=337,5 ≈ 338.'),
    qa('Halbwertszeit 4 h: Welcher Faktor gilt pro 4 h?','0,5.'),
    'Exponentiell: f(x)=a·bˣ.'
  );
  if(t.includes('sinus- und kosinusfunktion') && t.includes('periodische')) return pack(
    qa('Wie groß ist sin(90°)?','1.'),
    qa('Was bedeutet „periodisch“?','Funktionswerte wiederholen sich nach einer festen Periode.'),
    qa('Welche Periode hat sin(x) in Gradmaß?','360°.'),
    qa('Ein Riesenrad hat Radius 10 m und Mittelpunkt 12 m hoch. Gib eine passende Höhenfunktion an.','Zum Beispiel h(φ)=12−10·cos(φ), je nach Startpunkt.'),
    'sin und cos beschreiben periodische Vorgänge.'
  );
  if(t.includes('lineare, quadratische und exponentielle modelle')) return pack(
    qa('Welches Modell hat konstanten Zuwachs?','Das lineare Modell.'),
    qa('Wie unterscheidest du lineares und exponentielles Wachstum in einer Tabelle?','Linear: Differenzen konstant; exponentiell: Quotienten/Faktoren konstant.'),
    qa('Folge 10, 15, 22,5, 33,75: Welches Modell passt?','Exponentiell mit Faktor 1,5.'),
    qa('Warum kann ein Modell außerhalb des beobachteten Bereichs unbrauchbar werden?','Annahmen ändern sich; Extrapolation kann unrealistisch sein.'),
    'Modellwahl nach Struktur der Änderung, nicht nur nach „gutem Aussehen“.'
  );

  // Sek I – Geometrie
  if(t.includes('punkte, strecken, geraden') && t.includes('symmetrie')) return pack(
    qa('Wie heißen die Koordinaten des Punktes P(3|−2)?','x=3, y=−2.'),
    qa('Worin unterscheiden sich Strecke und Gerade?','Strecke hat zwei Endpunkte; Gerade ist in beide Richtungen unbegrenzt.'),
    qa('Spiegle P(2|1) an der y-Achse.','P′(−2|1).'),
    qa('Welche Figuren besitzen mindestens zwei Symmetrieachsen? Nenne zwei.','Zum Beispiel Rechteck (2), Quadrat (4), Kreis (unendlich viele).'),
    'Koordinaten: erst x-Richtung, dann y-Richtung.'
  );
  if(t.includes('lagebeziehungen') && t.includes('winkel messen')) return pack(
    qa('Wie groß ist ein rechter Winkel?','90°.'),
    qa('Was bedeutet „parallel“ und „senkrecht“?','Parallel: schneiden sich nicht; senkrecht: schneiden sich im 90°-Winkel.'),
    qa('Ein Winkel misst 127°. Ist er spitz, recht oder stumpf?','Stumpf.'),
    qa('Zeichne zu einer Geraden durch P eine Senkrechte. Welche Information brauchst du?','Gerade und Punkt; Senkrechte bildet 90°.'),
    'Winkel werden in Grad gemessen.'
  );
  if(t.includes('umfang und flacheninhalt') && t.includes('rechteck')) return pack(
    qa('Rechteck 6 cm × 4 cm: Umfang?','20 cm.'),
    qa('Warum haben Umfang und Fläche verschiedene Einheiten?','Umfang misst Länge; Fläche misst zweidimensionale Ausdehnung.'),
    qa('Rechteck 8 cm × 3,5 cm: Fläche?','28 cm².'),
    qa('Finde zwei verschiedene Rechtecke mit Fläche 24 cm². Welches hat kleineren Umfang?','Zum Beispiel 4×6 → 20 cm; 3×8 → 22 cm; 4×6 kleiner.'),
    'Rechteck: U=2a+2b, A=a·b.'
  );
  if(t.includes('quader und wurfel') && t.includes('oberflache')) return pack(
    qa('Quader 2×3×4 cm: Volumen?','24 cm³.'),
    qa('Wie hängen Netz und Oberfläche eines Körpers zusammen?','Das Netz enthält genau alle Außenflächen des Körpers.'),
    qa('Würfelkante 5 cm: Oberfläche?','6·25=150 cm².'),
    qa('Ein Quader hat Volumen 60 cm³ und Grundfläche 15 cm². Höhe?','4 cm.'),
    'Quader: V=a·b·c; O=2(ab+ac+bc).'
  );
  if(t.includes('winkel, kreis') && t.includes('konstruktionen')) return pack(
    qa('Radius 4 cm: Durchmesser?','8 cm.'),
    qa('Warum reicht bei einer Zirkelkonstruktion der Radius als Abstand?','Alle Kreispunkte haben denselben Abstand vom Mittelpunkt.'),
    qa('Konstruiere die Mittelsenkrechte einer Strecke. Welche Eigenschaft haben ihre Punkte?','Sie haben gleichen Abstand zu beiden Endpunkten.'),
    qa('Wie kannst du einen 60°-Winkel nur mit Zirkel und Lineal konstruieren?','Über ein gleichseitiges Dreieck.'),
    'Konstruktionen beruhen auf geometrischen Eigenschaften, nicht auf Messen.'
  );
  if(t.includes('achsensymmetrie') && t.includes('punktsymmetrie')) return pack(
    qa('Spiegle P(3|2) an der x-Achse.','P′(3|−2).'),
    qa('Was ist der Unterschied zwischen Achsen- und Punktsymmetrie?','Achsensymmetrie = Spiegelung an einer Geraden; Punktsymmetrie = 180°-Drehung um einen Punkt.'),
    qa('Ist ein Parallelogramm immer punktsymmetrisch?','Ja, zum Schnittpunkt der Diagonalen.'),
    qa('Welche Symmetrie besitzt ein gleichseitiges Dreieck?','Drei Symmetrieachsen, aber keine Punktsymmetrie.'),
    'Symmetrie erhält Abstände und Winkel.'
  );
  if(t.includes('neben-, scheitel-, stufen-') || (t.includes('winkelbeziehungen') && !t.includes('schnittwinkel'))) return pack(
    qa('Ein Nebenwinkel ist 68°. Wie groß ist der andere?','112°.'),
    qa('Welche Winkel sind bei zwei Parallelen und einer Transversalen gleich groß?','Stufen- und Wechselwinkel; Scheitelwinkel ebenfalls.'),
    qa('Scheitelwinkel α=47°. Bestimme den gegenüberliegenden Winkel.','47°.'),
    qa('Wie kann man Parallelität mit Winkelbeziehungen begründen?','Sind passende Stufen-/Wechselwinkel gleich, sind die Geraden parallel.'),
    'Nebenwinkel ergänzen sich zu 180°; Scheitelwinkel sind gleich.'
  );
  if(t.includes('dreiecke konstruieren') && t.includes('kongruenz')) return pack(
    qa('Was bedeutet „kongruent“?','Deckungsgleich.'),
    qa('Nenne drei Kongruenzsätze.','SSS, SWS, WSW; außerdem SSW unter Bedingungen.'),
    qa('Reichen drei Winkel zur eindeutigen Dreieckskonstruktion?','Nein, sie bestimmen nur die Form, nicht die Größe.'),
    qa('Warum ist SSW nicht immer eindeutig?','Je nach Größenlage können zwei verschiedene Dreiecke möglich sein.'),
    'Kongruenzsätze sichern eindeutige Konstruierbarkeit.'
  );
  if(t.includes('innenwinkelsumme')) return pack(
    qa('Innenwinkelsumme im Dreieck?','180°.'),
    qa('Wie lässt sich die Innenwinkelsumme eines n-Ecks bestimmen?','(n−2)·180°.'),
    qa('Regelmäßiges Fünfeck: ein Innenwinkel?','540°/5 = 108°.'),
    qa('Ein Vieleck hat Innenwinkelsumme 1260°. Wie viele Ecken?','(n−2)·180=1260 → n=9.'),
    'Innenwinkelsumme im n-Eck: (n−2)·180°.'
  );
  if(t.includes('flachenberechnungen an vielecken') || t.includes('prismen und zusammengesetzte')) return pack(
    qa('Dreieck: g=8 cm, h=5 cm. Fläche?','20 cm².'),
    qa('Warum ist Zerlegen bei zusammengesetzten Figuren nützlich?','Komplexe Flächen werden auf bekannte Grundfiguren zurückgeführt.'),
    qa('Prisma: Grundfläche 12 cm², Höhe 7 cm. Volumen?','84 cm³.'),
    qa('Wie ändert sich das Volumen eines Prismas, wenn nur die Höhe verdoppelt wird?','Es verdoppelt sich.'),
    'Prisma: V=G·h.'
  );
  if(t.includes('konstruktion, begrundung') && t.includes('digitale')) return pack(
    qa('Welche Größen bleiben bei einer geometrischen Konstruktion exakt fest?','Die konstruktiv festgelegten Beziehungen, z. B. Abstände oder Winkel.'),
    qa('Warum ist „sieht so aus“ kein Beweis?','Eine Zeichnung ist nur ein Beispiel; Begründungen müssen allgemein gelten.'),
    qa('Formuliere eine Vermutung nach dem Verschieben eines Punktes in einer DGS.','Beispiel abhängig von Konstruktion; wichtig ist invariantes Verhalten.'),
    qa('Wie nutzt man eine dynamische Geometriesoftware sinnvoll zum Beweisen?','Zum Entdecken/Testen von Vermutungen; der Beweis braucht anschließend Argumente.'),
    'DGS hilft beim Entdecken – Begründungen sichern die Aussage.'
  );
  if(t.includes('satz des pythagoras')) return pack(
    qa('Rechtwinkliges Dreieck mit Katheten 3 und 4: Hypotenuse?','5.'),
    qa('Wann darf a²+b²=c² verwendet werden?','Nur im rechtwinkligen Dreieck, c ist die Hypotenuse.'),
    qa('Leiter 5 m, Abstand zur Wand 3 m. Höhe?','4 m.'),
    qa('Prüfe, ob Seiten 6, 8, 10 ein rechtwinkliges Dreieck bilden.','Ja, 6²+8²=10².'),
    'Im rechtwinkligen Dreieck: a²+b²=c².'
  );
  if(t.includes('ahnlichkeit') && t.includes('zentrische streckung')) return pack(
    qa('Streckfaktor k=2: Aus 3 cm werden?','6 cm.'),
    qa('Was bleibt bei ähnlichen Figuren gleich?','Winkel; entsprechende Seitenverhältnisse sind gleich.'),
    qa('Ein Foto 10×15 cm wird auf 20 cm Breite vergrößert. Neue Höhe?','30 cm.'),
    qa('Was bewirkt ein negativer Streckfaktor?','Zusätzlich zur Streckung eine Punktspiegelung am Zentrum.'),
    'Ähnlichkeit: gleiche Winkel, proportionale Seiten.'
  );
  if(t.includes('strahlensatze')) return pack(
    qa('Bei parallelen Schnittgeraden entstehen welche Beziehungen?','Entsprechende Strecken stehen im gleichen Verhältnis.'),
    qa('Warum ist Parallelität für die Strahlensätze entscheidend?','Sie erzeugt ähnliche Dreiecke.'),
    qa('2/5 = x/15. Bestimme x.','x=6.'),
    qa('Wie kann man die Höhe eines Baumes mit Schattenlängen bestimmen?','Über ähnliche Dreiecke und Verhältnisgleichung.'),
    'Strahlensätze beruhen auf Ähnlichkeit.'
  );
  if(t.includes('sinus, kosinus und tangens') && t.includes('rechtwinkligen')) return pack(
    qa('In einem rechtwinkligen Dreieck: sin(α)=?','Gegenkathete/Hypotenuse.'),
    qa('Wann nutzt du tan statt sin oder cos?','Wenn Gegen- und Ankathete beteiligt sind.'),
    qa('α=30°, Hypotenuse 10 cm. Gegenkathete?','10·sin30°=5 cm.'),
    qa('Eine Rampe steigt 1,2 m auf 6 m Länge. Welcher Steigungswinkel?','α=arcsin(1,2/6)≈11,5°.'),
    'sin=Gegenkathete/Hypotenuse; cos=Ankathete/Hypotenuse; tan=Gegenkathete/Ankathete.'
  );
  if(t.includes('kosinussatz')) return pack(
    qa('Wann ist der Kosinussatz besonders nützlich?','Bei SSS oder SWS in nicht rechtwinkligen Dreiecken.'),
    qa('Wie lautet c² im Kosinussatz?','c²=a²+b²−2ab·cos(γ).'),
    qa('a=5, b=7, γ=60°. Berechne c.','c²=25+49−70·0,5=39 → c≈6,24.'),
    qa('Wie wird der Kosinussatz für γ=90° zum Satz des Pythagoras?','cos90°=0, also c²=a²+b².'),
    'c²=a²+b²−2ab·cos(γ).'
  );
  if(t.includes('kreisumfang') && t.includes('kreissektor')) return pack(
    qa('Kreisradius 3 cm: Umfang?','6π cm ≈ 18,85 cm.'),
    qa('Wie hängt ein Kreisbogen vom Mittelpunktswinkel ab?','Er ist proportional zum Winkelanteil α/360°.'),
    qa('Sektor: r=6 cm, α=90°. Fläche?','(90/360)·π·36=9π cm².'),
    qa('Warum ist die Tangente im Berührpunkt senkrecht zum Radius?','Das ist eine Grundeigenschaft der Kreistangente.'),
    'U=2πr; A=πr²; Sektoranteil α/360°.'
  );
  if(t.includes('kugel, zylinder') && t.includes('oberflache und volumen')) return pack(
    qa('Zylinder: r=2 cm, h=5 cm. Volumen?','V=π·4·5=20π cm³.'),
    qa('Welche Rolle spielt die Grundfläche bei Prisma und Zylinder?','V=G·h.'),
    qa('Kegel mit G=30 cm², h=9 cm: Volumen?','V=(1/3)·30·9=90 cm³.'),
    qa('Wie ändert sich Kugelvolumen bei doppeltem Radius?','Es wird 8-mal so groß.'),
    'Prisma/Zylinder: V=G·h; Pyramide/Kegel: V=(1/3)·G·h.'
  );

  // Sek I – Stochastik
  if(t.includes('daten erheben') && t.includes('absolute haufigkeiten')) return pack(
    qa('In einer Klasse wählen 8 von 25 „Bus“. Absolute Häufigkeit?','8.'),
    qa('Was ist der Unterschied zwischen Merkmal und Merkmalsausprägung?','Merkmal = untersuchte Eigenschaft; Ausprägung = konkreter Wert/Kategorie.'),
    qa('Stelle 3, 5, 2 Stimmen als Balkendiagramm dar. Was ist die höchste Säule?','Die Kategorie mit 5 Stimmen.'),
    qa('Warum müssen Achsen und Einheiten im Diagramm beschriftet sein?','Sonst sind Werte und Bedeutung nicht eindeutig interpretierbar.'),
    'Absolute Häufigkeit = Anzahl des Auftretens.'
  );
  if(t.includes('arithmetisches mittel') && t.includes('median')) return pack(
    qa('Mittelwert von 4, 6, 8?','6.'),
    qa('Wie unterscheidet sich Median vom arithmetischen Mittel?','Median ist der mittlere sortierte Wert; Mittelwert ist Summe/Anzahl.'),
    qa('Daten: 2, 3, 3, 4, 20. Median?','3.'),
    qa('Welcher Kennwert ist hier robuster gegen den Ausreißer 20?','Der Median.'),
    'Median: Mitte der sortierten Daten; Mittelwert: Summe durch Anzahl.'
  );
  if(t.includes('absolute und relative haufigkeiten')) return pack(
    qa('12 von 30 wählen A. Relative Häufigkeit?','12/30=0,4=40 %.'),
    qa('Warum sind relative Häufigkeiten zum Vergleich unterschiedlich großer Gruppen besser?','Sie berücksichtigen die Gruppengröße.'),
    qa('Klasse X: 15/25, Klasse Y: 18/30. Wo ist der Anteil größer?','Beide 60 %.'),
    qa('Kann eine relative Häufigkeit größer als 1 sein?','Nein.'),
    'Relative Häufigkeit = absolute Häufigkeit / Gesamtzahl.'
  );
  if(t.includes('einfache zufallsexperimente') && t.includes('empirische')) return pack(
    qa('Würfel: Nenne ein mögliches Ergebnis.','1, 2, 3, 4, 5 oder 6.'),
    qa('Was ist ein Ereignis?','Eine Menge von Ergebnissen, z. B. „gerade Zahl“.'),
    qa('50 Würfe, 9-mal eine 6. Empirische Wahrscheinlichkeit?','9/50=0,18.'),
    qa('Warum nähert sich die relative Häufigkeit bei vielen Versuchen oft einer stabilen Zahl?','Gesetz der großen Zahlen – empirische Häufigkeiten stabilisieren sich.'),
    'Ergebnis = einzelner Ausgang; Ereignis = Menge von Ergebnissen.'
  );
  if(t.includes('laplace-experimente')) return pack(
    qa('Fairer Würfel: P(gerade Zahl)?','3/6=1/2.'),
    qa('Wann ist ein Experiment ein Laplace-Experiment?','Wenn alle Elementarereignisse gleich wahrscheinlich sind.'),
    qa('Urne 3 rote, 2 blaue gleichartige Kugeln. P(rot)?','3/5.'),
    qa('Warum darf man bei einem gezinkten Würfel nicht „günstig durch möglich“ zählen?','Ergebnisse sind nicht gleich wahrscheinlich.'),
    'Laplace: P(E)=günstige Ergebnisse/mögliche Ergebnisse.'
  );
  if(t.includes('mehrstufige zufallsexperimente') && t.includes('baumdiagramme') && !t.includes('wiederholung')) return pack(
    qa('Zweimal faire Münze: P(Kopf, Kopf)?','1/2·1/2=1/4.'),
    qa('Was zeigt ein Pfad im Baumdiagramm?','Eine vollständige Folge von Ergebnissen.'),
    qa('Würfel zweimal: P(zweimal 6)?','1/36.'),
    qa('Wie berechnet man „mindestens einmal Treffer“ oft einfacher?','Über das Gegenereignis: 1−P(kein Treffer).'),
    'Entlang eines Pfades multiplizieren; passende Pfade addieren.'
  );
  if(t.includes('quartile') && t.includes('boxplots')) return pack(
    qa('Welche fünf Werte beschreibt ein Boxplot typischerweise?','Minimum, Q1, Median, Q3, Maximum.'),
    qa('Was zeigt die Box?','Den Bereich vom 1. bis 3. Quartil, also die mittleren 50 %.'),
    qa('Q1=12, Median=18, Q3=25. Interquartilsabstand?','13.'),
    qa('Zwei Boxplots haben gleichen Median, aber unterschiedliche Boxbreiten. Was bedeutet das?','Unterschiedliche Streuung der mittleren 50 %.'),
    'IQR = Q3 − Q1.'
  );
  if(t.includes('datenerhebungen') && t.includes('streuung')) return pack(
    qa('Daten: 2, 4, 6. Mittelwert?','4.'),
    qa('Was bedeutet Streuung?','Wie stark Daten um einen typischen Wert verteilt sind.'),
    qa('Vergleiche A={4,4,4,4} und B={1,3,5,7}: gleicher Mittelwert?','Ja, beide 4; B streut stärker.'),
    qa('Warum reicht ein Mittelwert allein oft nicht zur Beschreibung eines Datensatzes?','Verteilung und Streuung können trotz gleichem Mittelwert verschieden sein.'),
    'Lage + Streuung gemeinsam betrachten.'
  );
  if(t.includes('diagramme, skalierungen') && t.includes('manipulationen')) return pack(
    qa('Was kann eine abgeschnittene y-Achse bewirken?','Unterschiede erscheinen größer als sie relativ sind.'),
    qa('Welche drei Dinge prüfst du zuerst bei einem Diagramm?','Achsenstart/-skala, Einheit, Bezugsgröße/Quelle.'),
    qa('Ein Balken ist optisch doppelt so hoch, Werte sind 52 und 56. Was könnte passiert sein?','Die y-Achse startet nahe 50 statt bei 0.'),
    qa('Warum kann auch ein korrektes Diagramm irreführend sein?','Auswahl, Zeitraum, Aggregation oder fehlender Kontext können verzerren.'),
    'Diagramme kritisch lesen: Skala, Bezugsgröße, Quelle, Zeitraum.'
  );
  if(t.includes('bedingte wahrscheinlichkeit') && t.includes('vierfeldertafel')) return pack(
    qa('Was bedeutet P(A|B)?','Wahrscheinlichkeit von A unter der Bedingung B.'),
    qa('Welche Größe wird bei P(A|B) zum neuen „Ganzen“?','Die Fälle, in denen B eingetreten ist.'),
    qa('40 Personen, 20 tragen Brille; davon 8 fahren Bus. P(Bus | Brille)?','8/20=0,4.'),
    qa('Warum kann P(A|B) deutlich von P(A) abweichen?','Die Bedingung wählt eine andere Teilgruppe mit anderer Verteilung.'),
    'P(A|B)=P(A∩B)/P(B), sofern P(B)>0.'
  );
  if(t.includes('stochastische unabhangigkeit')) return pack(
    qa('Welche Bedingung gilt bei Unabhängigkeit von A und B?','P(A∩B)=P(A)·P(B).'),
    qa('Was bedeutet Unabhängigkeit in Worten?','Das Wissen über B ändert die Wahrscheinlichkeit von A nicht.'),
    qa('P(A)=0,5; P(B)=0,4; unabhängig. P(A∩B)?','0,2.'),
    qa('P(A|B)=0,7, aber P(A)=0,5. Unabhängig?','Nein.'),
    'Unabhängig ⇔ P(A|B)=P(A) (bei P(B)>0).'
  );
  if(t.includes('baumdiagramme und pfadregeln') && !t.includes('einstieg')) return pack(
    qa('Was bedeutet „entlang eines Pfades“?','Wahrscheinlichkeiten werden multipliziert.'),
    qa('Wann werden mehrere Pfade addiert?','Wenn sie gemeinsam ein Ereignis bilden und sich ausschließen.'),
    qa('P(Treffer)=0,3 pro Versuch, unabhängig. P(zwei Treffer)?','0,09.'),
    qa('P(mindestens ein Treffer in 2 Versuchen)?','1−0,7²=0,51.'),
    'Produktregel auf dem Pfad, Summenregel über passende Pfade.'
  );
  if(t.includes('statistische daten') && t.includes('kritisch beurteilen')) return pack(
    qa('Nenne eine mögliche Verzerrung bei einer Online-Umfrage.','Selbstselektion; nicht repräsentative Stichprobe.'),
    qa('Was bedeutet „repräsentativ“?','Die Stichprobe bildet relevante Merkmale der Grundgesamtheit angemessen ab.'),
    qa('Warum ist „100 % mehr“ nicht dasselbe wie „100 Prozentpunkte mehr“?','Prozent ist relativ; Prozentpunkte sind Differenz von Prozentsätzen.'),
    qa('Welche Zusatzinfos brauchst du bei einer Statistik mindestens?','Stichprobe, Erhebungsmethode, Zeitraum, Bezugsgröße/Quelle.'),
    'Gute Statistik braucht transparente Erhebung und passende Darstellung.'
  );

  // Oberstufe – Analysis
  if(t.includes('potenzfunktionen mit ganzzahligen exponenten') && t.includes('ganzrationale')) return pack(
    qa('Bestimme f(2) für f(x)=x³−2x.','4.'),
    qa('Welche typischen Symmetrien besitzen x² und x³?','x² achsensymmetrisch zur y-Achse; x³ punktsymmetrisch zum Ursprung.'),
    qa('Bestimme die Nullstellen von x³−4x.','x(x−2)(x+2)=0 → −2,0,2.'),
    qa('Wie bestimmt der höchste Exponent das Verhalten für |x|→∞?','Grad und Vorzeichen des Leitkoeffizienten bestimmen das Endverhalten.'),
    'Ganzrationale Funktion: Summe von a_k x^k.'
  );
  if(t.includes('graphenverlauf') && t.includes('definitions-/wertebereich')) return pack(
    qa('Was bewirkt f(x−3) gegenüber f(x)?','Verschiebung um 3 nach rechts.'),
    qa('Wie erkennt man y-Achsensymmetrie algebraisch?','f(−x)=f(x).'),
    qa('Beschreibe g(x)=−2·f(x)+1.','Spiegelung an x-Achse, Streckung Faktor 2, Verschiebung um 1 nach oben.'),
    qa('Warum muss der Definitionsbereich bei Modellierungen explizit eingeschränkt werden?','Mathematische Funktion kann außerhalb des realistischen Kontextbereichs Werte liefern.'),
    'Transformationen: außen wirken vertikal, innen horizontal.'
  );
  if(t.includes('mittlere und lokale anderungsrate')) return pack(
    qa('Was berechnet (f(b)−f(a))/(b−a)?','Die mittlere Änderungsrate auf [a,b].'),
    qa('Was ist geometrisch der Unterschied zwischen Sekante und Tangente?','Sekante verbindet zwei Punkte; Tangente beschreibt die lokale Richtung in einem Punkt.'),
    qa('f(x)=x²: mittlere Änderungsrate von 1 bis 3.','(9−1)/(3−1)=4.'),
    qa('Wie wird aus mittlerer Änderungsrate die lokale Änderungsrate?','Durch Grenzübergang b→a bzw. h→0.'),
    'f′(x₀)=lim_{h→0}[f(x₀+h)−f(x₀)]/h.'
  );
  if(t.includes('grundverstandnis des ableitungsbegriffs')) return pack(
    qa('Was ist f′(x₀) geometrisch?','Steigung der Tangente an f im Punkt x₀.'),
    qa('Was bedeutet f′(x)>0?','f ist dort lokal steigend.'),
    qa('Wenn f bei x=2 ein lokales Maximum hat: Welche notwendige Bedingung gilt meist?','f′(2)=0 (bei Differenzierbarkeit).'),
    qa('Kann f′(x)=0 gelten, ohne dass ein Extremum vorliegt?','Ja, z. B. bei f(x)=x³ in x=0.'),
    'Ableitung = lokale Änderungsrate = Tangentensteigung.'
  );
  if(t.includes('potenz-, summen- und faktorregel')) return pack(
    qa('Leite ab: f(x)=3x⁴−2x.','f′(x)=12x³−2.'),
    qa('Wie erkennt man Extremstellen mit der Ableitung?','Kandidaten über f′=0; Art über Vorzeichenwechsel oder f′′.'),
    qa('f(x)=x³−3x²: Bestimme kritische Stellen.','f′=3x²−6x=3x(x−2) → x=0,2.'),
    qa('Was unterscheidet Wendestelle und Extremstelle?','Extrem: Wechsel von Steigen/Fallen; Wendung: Wechsel des Krümmungsverhaltens.'),
    '(xⁿ)′=n·xⁿ⁻¹; Summen/Faktoren termweise.'
  );
  if(t.includes('ganzrationale funktionen und exponentialfunktionen') && t.includes('transformationen')) return pack(
    qa('Leite f(x)=x³+eˣ ab.','3x²+eˣ.'),
    qa('Welche Besonderheit hat die natürliche Exponentialfunktion?','Ihre Ableitung ist wieder eˣ.'),
    qa('Bestimme die Nullstellen von x²−4.','−2 und 2.'),
    qa('Vergleiche langfristig x⁵ und eˣ für x→∞.','eˣ wächst schließlich schneller als jede Potenz.'),
    'eˣ ist positiv und erfüllt (eˣ)′=eˣ.'
  );
  if((t.includes('produktregel') && t.includes('einfache verkettungen')) || (t.includes('produktregel') && t.includes('kettenregel'))) {
    const lk=t.includes('kettenregel');
    return pack(
      qa('Leite f(x)=x²·eˣ ab.','f′(x)=2x·eˣ+x²·eˣ=eˣ(x²+2x).'),
      qa(lk?'Wie lautet die Kettenregel?':'Wie lautet die Produktregel?','Produktregel: (uv)′=u′v+uv′.' + (lk?' Kettenregel: (g∘h)′=(g′∘h)·h′.':'')),
      qa(lk?'Leite f(x)=e^(3x−1) ab.':'Leite f(x)=e^(2x+1) ab.','f′(x)='+(lk?'3':'2')+'e^('+(lk?'3x−1':'2x+1')+').'),
      qa(lk?'Warum reicht „äußere Funktion ableiten“ bei Verkettungen nicht?':'Warum darf bei x·eˣ nicht nur ein Faktor abgeleitet werden?','Weil sich beide/innere Anteile mit x ändern; die vollständige Regel erfasst alle Beiträge.'),
      lk?'(g(h(x)))′=g′(h(x))·h′(x)':'(u·v)′=u′v+uv′'
    );
  }
  if(t.includes('extremwertprobleme') && t.includes('rekonstruktion')) return pack(
    qa('Welche notwendige Bedingung gilt an einer inneren Extremstelle?','f′(x)=0.'),
    qa('Was ist der Unterschied zwischen Extremwertproblem und Steckbriefaufgabe?','Extremwert: optimieren; Steckbrief: Funktion aus Bedingungen bestimmen.'),
    qa('Rechteck mit Umfang 20: A(x)=x(10−x). Wo liegt das Maximum?','A′=10−2x=0 → x=5; Quadrat 5×5.'),
    qa('Warum müssen bei Optimierung Randwerte geprüft werden?','Das globale Extremum kann am Rand des zulässigen Bereichs liegen.'),
    'Modell → Zielfunktion → Definitionsbereich → Ableiten → prüfen → deuten.'
  );
  if(t.includes('exponentialfunktionen') && t.includes('naturliche exponentialfunktion') && t.includes('wachstum')) return pack(
    qa('Bei f(t)=200·e^(0,03t): Anfangswert?','200.'),
    qa('Welche Bedeutung hat k in a·e^(kt)?','k ist die kontinuierliche Wachstums-/Zerfallsrate.'),
    qa('Verdopplungszeit bei k=0,05?','T=ln2/0,05≈13,86.'),
    qa('Wie erkennt man Zerfall in a·e^(kt)?','k<0.'),
    'Verdopplungszeit T₂=ln2/k; Halbwertszeit T₁/₂=ln2/|k|.'
  );
  if(t.includes('produktsumm') && (t.includes('orientierte flache') || t.includes('bestands'))) return pack(
    qa('Was approximiert eine Produktsumme?','Eine Fläche bzw. Bestandsänderung durch Rechteckssummen.'),
    qa('Was bedeutet „orientierte Fläche“?','Flächen oberhalb der x-Achse positiv, darunter negativ gezählt.'),
    qa('Konstante Rate 4 Einheiten/h über 3 h: Bestandsänderung?','12 Einheiten.'),
    qa('Kann ein Integral 0 sein, obwohl der Graph nicht auf der x-Achse liegt?','Ja, positive und negative orientierte Flächen können sich aufheben.'),
    'Integral = Grenzwert geeigneter Produktsummen.'
  );
  if((t.includes('stammfunktion') && t.includes('hauptsatz')) || (t.includes('stammfunktionen') && t.includes('hauptsatz'))) return pack(
    qa('Eine Stammfunktion zu f(x)=3x²?','F(x)=x³+C.'),
    qa('Was sagt der Hauptsatz grob?','Differenz einer Stammfunktion liefert das bestimmte Integral.'),
    qa('Berechne ∫₀² 2x dx.','[x²]₀²=4.'),
    qa('Warum verschwindet die Konstante C beim bestimmten Integral?','Sie kürzt sich in F(b)−F(a) heraus.'),
    '∫ₐᵇ f(x)dx = F(b)−F(a), falls F′=f.'
  );
  if(t.includes('naturliche logarithmusfunktion') && t.includes('umkehrfunktionen')) return pack(
    qa('Was ist ln(e³)?','3.'),
    qa('Welche Beziehung haben ln und eˣ?','Sie sind Umkehrfunktionen.'),
    qa('Löse e^(2x)=7.','x=(ln7)/2.'),
    qa('Warum ist der Definitionsbereich von ln(x) nur x>0?','Weil eˣ nur positive Werte annimmt.'),
    'ln(eˣ)=x und e^(ln x)=x für x>0.'
  );
  if(t.includes('ganzrationale, exponential-, sinus- und kosinusfunktionen')) return pack(
    qa('Leite f(x)=sin(x)+eˣ ab.','f′(x)=cos(x)+eˣ.'),
    qa('Welche Ableitung hat cos(x)?','−sin(x).'),
    qa('Bestimme Extremstellen von sin(x) auf [0,2π].','Maximum π/2, Minimum 3π/2.'),
    qa('Warum eignen sich Sinusfunktionen für periodische Modelle?','Sie wiederholen sich mit fester Periode und lassen Amplitude/Phase skalieren.'),
    '(sin x)′=cos x; (cos x)′=−sin x; (eˣ)′=eˣ.'
  );

  // Oberstufe – Analytische Geometrie / Lineare Algebra
  if(t.includes('punkte, ortsvektoren') && t.includes('raum')) return pack(
    qa('Ortsvektor von P(2|−1|4)?','(2,−1,4).'),
    qa('Was unterscheidet Punkt und Vektor?','Punkt beschreibt Ort; Vektor Richtung und Länge/ Verschiebung.'),
    qa('Vektor von A(1|2|0) nach B(4|1|5)?','(3,−1,5).'),
    qa('Wie prüfst du, ob M Mittelpunkt von AB ist?','M=(A+B)/2.'),
    'Verbindungsvektor AB = B − A.'
  );
  if(t.includes('addition, skalare multiplikation') && t.includes('kollinearitat')) return pack(
    qa('Berechne (1,2,−1)+(3,0,4).','(4,2,3).'),
    qa('Wann sind zwei Vektoren kollinear?','Wenn einer ein skalares Vielfaches des anderen ist.'),
    qa('Länge von v=(3,4,0)?','5.'),
    qa('Prüfe Kollinearität: (2,−1,4) und (−6,3,−12).','Ja, zweiter = −3·erster.'),
    '|v|=√(v₁²+v₂²+v₃²).'
  );
  if(t.includes('geraden und strecken in parameterform')) return pack(
    qa('Was braucht eine Geradengleichung in Parameterform?','Stützvektor und Richtungsvektor.'),
    qa('Welche Bedeutung hat der Parameter t?','Er skaliert den Richtungsvektor und erzeugt alle Punkte der Geraden.'),
    qa('Gerade durch A(1|0|2), Richtung (2|1|−1): Gib Gleichung an.','x=(1,0,2)+t(2,1,−1).'),
    qa('Wie beschreibst du nur die Strecke AB statt die ganze Gerade?','Parameter auf 0≤t≤1 beschränken.'),
    'g: x = a + t·u.'
  );
  if(t.includes('identisch, parallel, windschief')) return pack(
    qa('Welche vier Lagebeziehungen zweier Geraden im Raum gibt es?','Identisch, parallel, schneidend, windschief.'),
    qa('Wie prüfst du zuerst Parallelität?','Richtungsvektoren auf Kollinearität prüfen.'),
    qa('Zwei nicht parallele Geraden: Was prüfst du als Nächstes?','Ob das Gleichungssystem einen gemeinsamen Punkt liefert.'),
    qa('Was ist „windschief“?','Nicht parallel und ohne Schnittpunkt.'),
    'Lageprüfung: Richtungen vergleichen, dann Schnitt-LGS lösen.'
  );
  if(t.includes('skalarprodukt') && t.includes('winkel')) return pack(
    qa('u·v bei u=(1,2), v=(3,−1)?','1·3+2·(−1)=1.'),
    qa('Wann sind Vektoren orthogonal?','Wenn ihr Skalarprodukt 0 ist.'),
    qa('u=(1,0,0), v=(1,1,0): Winkel?','45°.'),
    qa('Warum braucht die Winkelberechnung die Vektorlängen?','Das Skalarprodukt enthält auch die Größen; Normierung trennt Richtung und Länge.'),
    'cos α = (u·v)/(|u||v|).'
  );
  if(t.includes('ebenen in parameter- und koordinatenform')) return pack(
    qa('Koordinatenform einer Ebene: Welche Größen stehen im Normalenvektor?','Die Koeffizienten vor x₁,x₂,x₃.'),
    qa('Wie viele unabhängige Richtungsvektoren braucht eine Ebene in Parameterform?','Zwei.'),
    qa('E: x₁+x₂+x₃=6. Liegt P(1|2|3) auf E?','Ja.'),
    qa('Wie wechselst du von Parameter- zu Koordinatenform?','Normalenvektor aus den Richtungsvektoren bestimmen und Punkt einsetzen.'),
    'E: x=a+r·u+s·v bzw. n·x=d.'
  );
  if(t.includes('ebenen in parameter-, koordinaten- und normalenform')) return pack(
    qa('Was ist ein Normalenvektor einer Ebene?','Ein Vektor senkrecht zu allen Richtungen der Ebene.'),
    qa('Wie hängen Normalen- und Koordinatenform zusammen?','Normalenkomponenten sind die Koeffizienten der Koordinatenform.'),
    qa('n=(2,−1,3), P(1|0|2): Normalenform?','(x−(1,0,2))·(2,−1,3)=0.'),
    qa('Warum sind mehrere Darstellungsformen nützlich?','Je nach Aufgabe sind Lage, Winkel oder Punktprobe unterschiedlich leicht.'),
    'Normalenform: (x−a)·n=0.'
  );
  if(t.includes('schnittwinkel') && t.includes('schnittpunkte')) return pack(
    qa('Wie findet man den Schnittpunkt einer Geraden mit einer Ebene?','Gerade in Ebenengleichung einsetzen und Parameter lösen.'),
    qa('Wodurch wird der Winkel Gerade–Ebene berechnet?','Über Richtungsvektor der Geraden und Normalenvektor der Ebene.'),
    qa('g: x=(0,0,0)+t(1,1,1), E: x₁+x₂+x₃=6. Schnittparameter?','3t=6 → t=2; S=(2,2,2).'),
    qa('Warum ist der Schnittwinkel Gerade–Ebene das Komplement zum Winkel Richtung–Normale?','Normalenvektor steht 90° zur Ebene.'),
    'Gerade–Ebene: α = 90° − Winkel(u,n).'
  );
  if(t.includes('lagebeziehungen und abstande')) return pack(
    qa('Abstand zweier Punkte A,B?','|AB|.'),
    qa('Wie misst man den Abstand eines Punktes von einer Ebene geometrisch?','Entlang der Normalenrichtung.'),
    qa('P(1|2|3), E: z=0. Abstand?','3.'),
    qa('Warum ist der kürzeste Abstand stets senkrecht?','Jede schräge Verbindung ist länger als die orthogonale Projektion.'),
    'Abstand wird entlang einer Senkrechten/Normalen gemessen.'
  );
  if(t.includes('lineare gleichungssysteme') && t.includes('gauss')) return pack(
    qa('Was ist Ziel des Gauß-Verfahrens?','Ein äquivalentes, leicht lösbares Stufensystem.'),
    qa('Welche Zeilenoperationen sind erlaubt?','Zeilen tauschen, mit ≠0 multiplizieren, Vielfache addieren.'),
    qa('Löse: x+y=5, x−y=1.','x=3, y=2.'),
    qa('Wie erkennt man keine Lösung im Stufensystem?','Widerspruchszeile, z. B. 0=1.'),
    'Gauß: systematisch eliminieren, dann rückwärts einsetzen.'
  );
  if(t.includes('lineare gleichungssysteme') && t.includes('algorithmische') && t.includes('losungsverfahren')) return pack(
    qa('Warum heißt Gauß ein algorithmisches Verfahren?','Es folgt einer wiederholbaren Folge erlaubter Zeilenoperationen.'),
    qa('Was bedeutet ein freier Parameter in der Lösung?','Es gibt unendlich viele Lösungen.'),
    qa('Interpretiere die Zeile 0x+0y+0z=5.','Widerspruch → keine Lösung.'),
    qa('Wie kann die Lösungsmenge eines LGS geometrisch gedeutet werden?','Als Schnittmenge von Geraden/Ebenen je nach Dimension.'),
    'Rang und Widerspruchszeilen entscheiden über die Lösungsanzahl.'
  );

  // Oberstufe – Stochastik
  if(t.includes('urnenmodelle') && t.includes('baumdiagramme') && !t.includes('wiederholung')) return pack(
    qa('Urne 3 rot, 2 blau; einmal ziehen. P(rot)?','3/5.'),
    qa('Was ändert Ziehen mit/ohne Zurücklegen?','Mit Zurücklegen bleiben Wahrscheinlichkeiten gleich; ohne ändern sie sich.'),
    qa('Mit Zurücklegen: P(rot, blau)?','3/5·2/5=6/25.'),
    qa('Wie berechnest du „genau ein Rot“ bei zwei Ziehungen?','Passende Pfade RB und BR berechnen und addieren.'),
    'Pfadregel: multiplizieren; Ereignis: passende Pfade addieren.'
  );
  if(t.includes('vierfeldertafeln') && t.includes('bedingte wahrscheinlichkeit')) return pack(
    qa('P(A∩B)=0,2 und P(B)=0,5. P(A|B)?','0,4.'),
    qa('Welche Information macht eine Vierfeldertafel besonders sichtbar?','Schnittmengen und Randwahrscheinlichkeiten zweier binärer Merkmale.'),
    qa('P(A)=0,6, P(B)=0,5, P(A∩B)=0,3. Unabhängig?','Ja, 0,6·0,5=0,3.'),
    qa('Warum kann eine „Trefferquote“ ohne Bezugsgruppe täuschen?','Bedingte Wahrscheinlichkeit hängt von der gewählten Grundgesamtheit ab.'),
    'P(A|B)=P(A∩B)/P(B).'
  );
  if(t.includes('mehrstufige zufallsexperimente') && t.includes('wiederholung')) return pack(
    qa('Zweimal Münze: P(genau einmal Kopf)?','2·(1/2·1/2)=1/2.'),
    qa('Wie unterscheiden sich Baumdiagramm und Vierfeldertafel?','Baum: Ablauf/Mehrstufigkeit; Vierfeldertafel: zwei binäre Merkmale und Schnittmengen.'),
    qa('P(A)=0,4, P(B|A)=0,5. P(A∩B)?','0,2.'),
    qa('Welche Darstellung ist bei vielen Stufen schnell unübersichtlich?','Baumdiagramm; dann helfen Formeln/Verteilungen.'),
    'Wiederholung: Produkt-, Summen- und Bedingungsregeln sicher verknüpfen.'
  );
  if(t.includes('diskrete zufallsgrossen') && t.includes('erwartungswert')) return pack(
    qa('X nimmt 0 mit 0,4 und 1 mit 0,6 an. E(X)?','0,6.'),
    qa('Was beschreibt der Erwartungswert?','Langfristigen durchschnittlichen Wert bei vielen Wiederholungen.'),
    qa('X: 0,1,2 mit P=0,25;0,5;0,25. E(X)?','1.'),
    qa('Warum kann E(X) ein Wert sein, der nie tatsächlich auftritt?','Er ist ein gewichteter Mittelwert, nicht zwingend ein möglicher Einzelwert.'),
    'E(X)=Σ xᵢ·P(X=xᵢ).'
  );
  if(t.includes('binomialverteilung') && !t.includes('sigma-regeln')) return pack(
    qa('Welche drei Bedingungen hat ein Binomialmodell?','Feste n, zwei Ausgänge je Versuch, konstantes p und Unabhängigkeit.'),
    qa('E(X) bei X~B(n,p)?','np.'),
    qa('X~B(10,0,3): P(X=0)?','0,7¹⁰ ≈ 0,0282.'),
    qa('Wie berechnest du P(X≥1) oft effizient?','1−P(X=0).'),
    'P(X=k)=C(n,k)p^k(1−p)^(n−k).'
  );
  if(t.includes('binomialkoeffizient') && t.includes('sigma-regeln')) return pack(
    qa('Was zählt C(n,k)?','Die Anzahl, k Treffer auf n Plätze zu verteilen.'),
    qa('Für X~B(n,p): μ und σ?','μ=np, σ=√(np(1−p)).'),
    qa('X~B(100,0,5): μ und σ?','μ=50, σ=5.'),
    qa('Was bedeutet die 2σ-Regel näherungsweise?','Bei hinreichender Approximation liegen etwa 95 % der Werte in μ±2σ.'),
    'μ=np; σ=√(np(1−p)).'
  );
  if(t.includes('prognoseintervall') && t.includes('konfidenzintervall')) return pack(
    qa('Was unterscheidet Prognose- und Konfidenzintervall?','Prognoseintervall sagt Stichprobenergebnis bei bekanntem p voraus; Konfidenzintervall schätzt p aus Daten.'),
    qa('Was passiert mit einem Konfidenzintervall bei größerem n?','Es wird typischerweise enger.'),
    qa('Warum beeinflusst das gewünschte Sicherheitsniveau die Intervallbreite?','Mehr Sicherheit erfordert größeren abgedeckten Bereich.'),
    qa('Welche Rolle spielt der Stichprobenumfang bei Genauigkeit?','Größeres n senkt zufällige Schwankungen und erhöht Präzision.'),
    'Mehr Sicherheit ↔ breiteres Intervall; mehr Daten ↔ meist engeres Intervall.'
  );
  if(t.includes('dichtefunktion') && t.includes('gausssche')) return pack(
    qa('Welche Parameter bestimmen eine Normalverteilung?','μ und σ.'),
    qa('Was beschreibt μ? Was beschreibt σ?','μ: Lage/Mittelwert; σ: Streuung/Breite.'),
    qa('Bei N(100,15): ungefährer Bereich μ±σ?','85 bis 115.'),
    qa('Warum ist P(X=x)=0 bei stetigen Verteilungen?','Wahrscheinlichkeiten entstehen als Flächen über Intervalle; einzelne Punkte haben Fläche 0.'),
    'Normalverteilung: symmetrische Glockenkurve um μ.'
  );

  // Allgemeine Fallbacks, möglichst nur selten
  return {matched:false,
    easy:qa(`Nenne einen zentralen Begriff zum Thema „${title}“.`,`Eine passende Antwort hängt vom Unterrichtsschwerpunkt ab.`),
    concept:qa(`Erkläre die Grundidee von „${title}“ in einem Satz.`,`Individuelle fachlich korrekte Erklärung.`),
    apply:qa(`Formuliere eine einfache Beispielaufgabe zu „${title}“ und löse sie.`,`Individuelle Lösung.`),
    challenge:qa(`Nenne einen typischen Fehler bei „${title}“ und korrigiere ihn.`,`Individuelle fachlich korrekte Korrektur.`),
    key:'Zentrale Begriffe, Verfahren und Darstellungen sicher verknüpfen.'};
}

function createPptBase(title='Mathematik – Wiederholung'){
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Jonathan Hardenacke / OpenAI';
  pptx.company = 'Rivius Gymnasium Attendorn';
  pptx.subject = 'Mathematik Wiederholung';
  pptx.title = title;
  pptx.lang = 'de-DE';
  pptx.theme = {
    headFontFace: FONT,
    bodyFontFace: FONT,
    lang: 'de-DE'
  };
  pptx.defineSlideMaster({
    title: 'M_TITLE',
    background: { color: C.navy },
    objects: [
      { rect: { x:0, y:0, w:13.333, h:7.5, fill:{color:C.navy}, line:{color:C.navy} } },
      { rect: { x:0, y:6.98, w:13.333, h:0.52, fill:{color:C.navy2}, line:{color:C.navy2} } },
      { text: { text:'MATHEMATIK  •  WIEDERHOLUNG', options:{x:0.72,y:0.45,w:5.4,h:0.28,fontFace:FONT,fontSize:12,bold:true,color:'BFD2E3',charSpacing:0.8,margin:0} } },
      { line: { x:0.72,y:1.06,w:2.1,h:0,line:{color:C.amber,width:4,beginArrowType:'none',endArrowType:'none'} } },
      { text: { text:'NRW · Gymnasium', options:{x:10.1,y:7.08,w:2.5,h:0.18,fontFace:FONT,fontSize:9,color:'C8D5E0',align:'right',margin:0} } },
    ],
    slideNumber: { x:12.75,y:7.05,w:0.3,h:0.2,color:'C8D5E0',fontFace:FONT,fontSize:9,align:'right' }
  });
  pptx.defineSlideMaster({
    title: 'M_CONTENT',
    background: { color: C.paper },
    objects: [
      { rect: { x:0,y:0,w:13.333,h:0.42,fill:{color:C.navy},line:{color:C.navy} } },
      { text: { text:'MATHEMATIK  •  WIEDERHOLUNG', options:{x:0.7,y:0.11,w:4.4,h:0.16,fontFace:FONT,fontSize:9,bold:true,color:'D8E6F1',charSpacing:0.6,margin:0} } },
      { line: { x:0.7,y:7.06,w:11.9,h:0,line:{color:C.line,width:1} } },
      { text: { text:'Vom leichten Einstieg zum Transfer', options:{x:0.72,y:7.12,w:4.7,h:0.16,fontFace:FONT,fontSize:8.5,color:C.muted,margin:0} } },
    ],
    slideNumber: { x:12.45,y:7.10,w:0.35,h:0.18,color:C.muted,fontFace:FONT,fontSize:8.5,align:'right' }
  });
  pptx.defineSlideMaster({
    title: 'M_EXIT',
    background: { color: C.navy },
    objects: [
      { rect: { x:0,y:0,w:13.333,h:7.5,fill:{color:C.navy},line:{color:C.navy} } },
      { text: { text:'5-MINUTEN-CHECK', options:{x:0.72,y:0.48,w:4.5,h:0.28,fontFace:FONT,fontSize:12,bold:true,color:'BFD2E3',charSpacing:1,margin:0} } },
      { line: { x:0.72,y:1.0,w:2.4,h:0,line:{color:C.amber,width:4} } },
      { text: { text:'Wiederholung · Selbstcheck', options:{x:9.2,y:7.08,w:3.3,h:0.18,fontFace:FONT,fontSize:9,color:'C8D5E0',align:'right',margin:0} } },
    ],
    slideNumber: { x:12.75,y:7.05,w:0.3,h:0.2,color:'C8D5E0',fontFace:FONT,fontSize:9,align:'right' }
  });
  return pptx;
}

function addText(slide,text,x,y,w,h,opts={}){
  slide.addText(text,{x,y,w,h,fontFace:opts.fontFace||FONT,fontSize:opts.fontSize||18,color:opts.color||C.ink,bold:opts.bold||false,italic:opts.italic||false,margin:opts.margin===undefined?0.04:opts.margin,breakLine: false,fit:'shrink',valign:opts.valign||'mid',align:opts.align||'left',bullet:opts.bullet,paraSpaceAfterPt:opts.paraSpaceAfterPt||0,transparency:opts.transparency});
}
function addTitle(slide,title,subtitle,accent){
  addText(slide,title,0.72,0.72,10.7,0.52,{fontSize:26,bold:true,color:C.ink});
  slide.addShape(SHAPE.rect,{x:11.75,y:0.76,w:0.75,h:0.12,fill:{color:accent},line:{color:accent},radius:0.05});
  if(subtitle) addText(slide,subtitle,0.74,1.26,8.5,0.28,{fontSize:11.5,color:C.muted});
}
function addBadge(slide,text,x,y,w,accent){
  slide.addShape(SHAPE.roundRect,{x,y,w,h:0.36,rectRadius:0.08,fill:{color:accent,transparency:0},line:{color:accent,transparency:100}});
  addText(slide,text,x+0.08,y+0.03,w-0.16,0.28,{fontSize:10.5,bold:true,color:C.white,align:'center'});
}
function addCard(slide, x,y,w,h, title, body, accent, opts={}){
  const fill=opts.fill || C.white;
  slide.addShape(SHAPE.roundRect,{x,y,w,h,rectRadius:0.09,fill:{color:fill},line:{color:opts.line||C.line,width:1.1},shadow:opts.shadow===false?undefined:{type:'outer',color:'C7CED6',opacity:0.16,blur:1,angle:45,distance:1}});
  slide.addShape(SHAPE.rect,{x,y,w:0.08,h,fill:{color:accent},line:{color:accent}});
  addText(slide,title,x+0.2,y+0.15,w-0.35,0.28,{fontSize:11.5,bold:true,color:accent});
  addText(slide,body,x+0.2,y+0.53,w-0.35,h-0.66,{fontSize:opts.fontSize||17,color:C.ink,valign:'top'});
}
function addQuestionTile(slide,idx,q,x,y,w,h,accent){
  slide.addShape(SHAPE.roundRect,{x,y,w,h,rectRadius:0.09,fill:{color:C.white},line:{color:C.line,width:1.1},shadow:{type:'outer',color:'CFD6DD',opacity:0.13,blur:1,angle:45,distance:1}});
  slide.addShape(SHAPE.ellipse,{x:x+0.18,y:y+0.18,w:0.48,h:0.48,fill:{color:accent},line:{color:accent}});
  addText(slide,String(idx),x+0.18,y+0.18,0.48,0.48,{fontSize:13,bold:true,color:C.white,align:'center'});
  addText(slide,q,x+0.8,y+0.17,w-0.98,h-0.28,{fontSize:16.5,color:C.ink,valign:'mid'});
}
function addFormulaBox(slide,text,accent){
  const pale=paleForAccent(accent);
  slide.addShape(SHAPE.roundRect,{x:8.9,y:5.45,w:3.6,h:0.82,rectRadius:0.08,fill:{color:pale},line:{color:accent,width:1.1}});
  addText(slide,'MERKE',9.1,5.60,0.75,0.18,{fontSize:9.5,bold:true,color:accent});
  addText(slide,text,9.1,5.83,3.15,0.28,{fontFace:MATH_FONT,fontSize:14.5,bold:true,color:C.ink});
}
function addNotes(slide, items){
  const lines = items.filter(Boolean).map((it,i)=>`${i+1}. ${it.q}\nLösung: ${it.a}`);
  slide.addNotes(lines.join('\n\n'));
}

function addVisual(slide, kind, accent, ctx, topics){
  const x=0.8,y=1.75,w=7.1,h=4.85;
  slide.addShape(SHAPE.roundRect,{x,y,w,h,rectRadius:0.08,fill:{color:C.white},line:{color:C.line,width:1.1}});
  // light grid
  for(let i=1;i<8;i++) slide.addShape(SHAPE.line,{x:x+i*w/8,y:y+0.2,w:0,h:h-0.4,line:{color:'EEF1F4',width:0.6}});
  for(let i=1;i<6;i++) slide.addShape(SHAPE.line,{x:x+0.2,y:y+i*h/6,w:w-0.4,h:0,line:{color:'EEF1F4',width:0.6}});
  if(kind==='function'){
    const x0=x+0.65, y0=y+h-0.65, gx=w-1.2, gy=h-1.2;
    slide.addShape(SHAPE.line,{x:x0,y:y0,w:gx,h:0,line:{color:C.ink,width:1.3,endArrowType:'triangle'}});
    slide.addShape(SHAPE.line,{x:x0,y:y0,w:0,h:-gy,line:{color:C.ink,width:1.3,endArrowType:'triangle'}});
    const joined = nrm(topics.join(' '));
    let fn='line'; if(joined.includes('quadratisch')) fn='parabola'; else if(joined.includes('exponential')) fn='exp'; else if(joined.includes('sinus')) fn='sin'; else if(joined.includes('ableitung')||joined.includes('ganzrational')) fn='cubic';
    const pts=[]; const N=80;
    for(let i=0;i<=N;i++){
      const sx=i/N; let xx=-3+6*sx; let yy;
      if(fn==='parabola') yy=0.45*(xx-0.5)*(xx-0.5)-1.2;
      else if(fn==='exp') yy=0.55*Math.exp(0.65*xx)-1.5;
      else if(fn==='sin') yy=1.6*Math.sin(1.25*xx);
      else if(fn==='cubic') yy=0.17*(xx*xx*xx-4*xx);
      else yy=0.75*xx+0.35;
      const px=x0+((xx+3)/6)*gx; const py=y0-((yy+2.8)/5.6)*gy;
      pts.push({x:px,y:py});
    }
    for(let i=1;i<pts.length;i++) slide.addShape(SHAPE.line,{x:pts[i-1].x,y:pts[i-1].y,w:pts[i].x-pts[i-1].x,h:pts[i].y-pts[i-1].y,line:{color:accent,width:2.4}});
    addText(slide,fn==='line'?'Gerade':fn==='parabola'?'Parabel':fn==='exp'?'Exponentialfunktion':fn==='sin'?'periodischer Graph':'Funktionsgraph',x+0.32,y+0.25,2.8,0.3,{fontSize:10.5,bold:true,color:accent});
  } else if(kind==='geometry'){
    const joined=nrm(topics.join(' '));
    if(joined.includes('pythagoras')||joined.includes('sinus')||joined.includes('kosinussatz')||joined.includes('dreieck')){
      const ax=x+1.2, ay=y+h-0.75, bx=x+5.8, by=ay, cx=x+4.6, cy=y+0.8;
      slide.addShape(SHAPE.line,{x:ax,y:ay,w:bx-ax,h:by-ay,line:{color:accent,width:3}});
      slide.addShape(SHAPE.line,{x:bx,y:by,w:cx-bx,h:cy-by,line:{color:accent,width:3}});
      slide.addShape(SHAPE.line,{x:cx,y:cy,w:ax-cx,h:ay-cy,line:{color:accent,width:3}});
      addText(slide,'A',ax-0.2,ay+0.05,0.3,0.25,{fontSize:12,bold:true}); addText(slide,'B',bx,by+0.05,0.3,0.25,{fontSize:12,bold:true}); addText(slide,'C',cx-0.1,cy-0.35,0.3,0.25,{fontSize:12,bold:true});
      if(joined.includes('pythagoras')||joined.includes('sinus')){
        slide.addShape(SHAPE.rect,{x:ax+0.08,y:ay-0.38,w:0.38,h:0.38,fill:{color:'FFFFFF',transparency:100},line:{color:C.muted,width:1.1}});
      }
    } else if(joined.includes('kreis')){
      slide.addShape(SHAPE.ellipse,{x:x+1.65,y:y+0.65,w:3.3,h:3.3,fill:{color:'FFFFFF',transparency:100},line:{color:accent,width:3}});
      slide.addShape(SHAPE.line,{x:x+3.3,y:y+2.3,w:1.65,h:0,line:{color:C.muted,width:2}});
      slide.addShape(SHAPE.line,{x:x+1.1,y:y+4.2,w:4.8,h:0,line:{color:C.ink,width:1.7}});
      addText(slide,'r',x+4.05,y+2.02,0.35,0.25,{fontSize:12,bold:true,color:accent});
    } else {
      // polygon with symmetry axis / parallel lines
      slide.addShape(SHAPE.rect,{x:x+1.1,y:y+1.0,w:4.8,h:2.9,fill:{color:'FFFFFF',transparency:100},line:{color:accent,width:3}});
      slide.addShape(SHAPE.line,{x:x+3.5,y:y+0.55,w:0,h:3.8,line:{color:C.red,width:1.7,dash:'dash'}});
      addText(slide,'Symmetrie / Konstruktion',x+1.2,y+4.15,4.5,0.35,{fontSize:12,bold:true,color:accent,align:'center'});
    }
  } else if(kind==='stoch'){
    const joined=nrm(topics.join(' '));
    if(joined.includes('baumdiagramm')||joined.includes('bedingte')||joined.includes('unabhangigkeit')){
      const sx=x+1.0, sy=y+2.45;
      slide.addShape(SHAPE.ellipse,{x:sx,y:sy,w:0.22,h:0.22,fill:{color:accent},line:{color:accent}});
      const lv1=[[x+3.0,y+1.35],[x+3.0,y+3.65]]; const lv2=[[x+5.3,y+0.65],[x+5.3,y+2.05],[x+5.3,y+3.0],[x+5.3,y+4.35]];
      for(const [nx,ny] of lv1) slide.addShape(SHAPE.line,{x:sx+0.22,y:sy+0.11,w:nx-(sx+0.22),h:ny-sy,line:{color:C.muted,width:1.5}});
      lv1.forEach(([nx,ny],i)=>{ slide.addShape(SHAPE.ellipse,{x:nx,y:ny,w:0.24,h:0.24,fill:{color:accent},line:{color:accent}}); const targets=i===0?lv2.slice(0,2):lv2.slice(2); targets.forEach(([tx,ty])=>slide.addShape(SHAPE.line,{x:nx+0.24,y:ny+0.12,w:tx-(nx+0.24),h:ty-ny,line:{color:C.muted,width:1.5}})); });
      lv2.forEach(([nx,ny])=>slide.addShape(SHAPE.ellipse,{x:nx,y:ny,w:0.22,h:0.22,fill:{color:C.amber},line:{color:C.amber}}));
    } else if(joined.includes('boxplot')||joined.includes('quartil')){
      const cy=y+2.6; slide.addShape(SHAPE.line,{x:x+1.0,y:cy,w:5.1,h:0,line:{color:C.ink,width:1.4}});
      slide.addShape(SHAPE.rect,{x:x+2.3,y:cy-0.55,w:2.5,h:1.1,fill:{color:paleForAccent(accent)},line:{color:accent,width:2}});
      slide.addShape(SHAPE.line,{x:x+3.6,y:cy-0.55,w:0,h:1.1,line:{color:C.red,width:2}});
      slide.addShape(SHAPE.line,{x:x+1.55,y:cy,w:0.75,h:0,line:{color:accent,width:2}});
      slide.addShape(SHAPE.line,{x:x+4.8,y:cy,w:0.85,h:0,line:{color:accent,width:2}});
      slide.addShape(SHAPE.line,{x:x+1.55,y:cy-0.32,w:0,h:0.64,line:{color:accent,width:2}}); slide.addShape(SHAPE.line,{x:x+5.65,y:cy-0.32,w:0,h:0.64,line:{color:accent,width:2}});
    } else {
      const vals=[1.4,2.3,3.4,2.8,4.0];
      const bx=x+1.2, by=y+h-0.7, bw=0.65, gap=0.45;
      vals.forEach((v,i)=>slide.addShape(SHAPE.rect,{x:bx+i*(bw+gap),y:by-v*0.72,w:bw,h:v*0.72,fill:{color:accent,transparency:i===3?25:0},line:{color:accent}}));
      slide.addShape(SHAPE.line,{x:bx-0.25,y:by,w:5.8,h:0,line:{color:C.ink,width:1.4}});
      slide.addShape(SHAPE.line,{x:bx-0.25,y:by,w:0,h:-3.8,line:{color:C.ink,width:1.4}});
    }
  } else if(kind==='vector'){
    const ox=x+2.0, oy=y+3.6;
    slide.addShape(SHAPE.line,{x:ox,y:oy,w:3.7,h:0,line:{color:C.ink,width:1.4,endArrowType:'triangle'}});
    slide.addShape(SHAPE.line,{x:ox,y:oy,w:0,h:-2.6,line:{color:C.ink,width:1.4,endArrowType:'triangle'}});
    slide.addShape(SHAPE.line,{x:ox,y:oy,w:-0.9,h:0.9,line:{color:C.ink,width:1.4,endArrowType:'triangle'}});
    slide.addShape(SHAPE.line,{x:ox,y:oy,w:2.6,h:-1.8,line:{color:accent,width:3,endArrowType:'triangle'}});
    addText(slide,'v',ox+1.35,oy-1.15,0.35,0.28,{fontSize:15,bold:true,color:accent});
    // plane
    slide.addShape(SHAPE.parallelogram,{x:x+3.4,y:y+2.1,w:2.8,h:1.55,fill:{color:paleForAccent(accent),transparency:18},line:{color:accent,width:1.7,transparency:20}});
  } else { // arithmetic
    const joined=nrm(topics.join(' '));
    if(joined.includes('bruch')){
      const bx=x+1.05, by=y+1.1, totalW=5.0, seg=5;
      for(let i=0;i<seg;i++) slide.addShape(SHAPE.rect,{x:bx+i*totalW/seg,y:by,w:totalW/seg,h:1.05,fill:{color:i<3?accent:C.white,transparency:i<3?0:0},line:{color:C.line,width:1.4}});
      addText(slide,'3/5',bx+1.95,by+1.3,1.1,0.4,{fontFace:MATH_FONT,fontSize:24,bold:true,color:accent,align:'center'});
      // number line
      const ly=y+3.55; slide.addShape(SHAPE.line,{x:x+1.0,y:ly,w:5.2,h:0,line:{color:C.ink,width:1.4,endArrowType:'triangle'}});
      for(let i=0;i<=5;i++){ const xx=x+1.0+i*1.0; slide.addShape(SHAPE.line,{x:xx,y:ly-0.12,w:0,h:0.24,line:{color:C.ink,width:1.0}}); }
    } else {
      const ly=y+2.7; slide.addShape(SHAPE.line,{x:x+0.9,y:ly,w:5.35,h:0,line:{color:C.ink,width:1.6,endArrowType:'triangle'}});
      for(let i=0;i<7;i++){ const xx=x+1.1+i*0.75; slide.addShape(SHAPE.line,{x:xx,y:ly-0.12,w:0,h:0.24,line:{color:C.ink,width:1.0}}); addText(slide,String(i-3),xx-0.14,ly+0.2,0.3,0.22,{fontSize:10.5,color:C.muted,align:'center'}); }
      slide.addShape(SHAPE.ellipse,{x:x+4.05,y:ly-0.16,w:0.32,h:0.32,fill:{color:accent},line:{color:accent}});
      addText(slide,'Zahlen · Terme · Strukturen',x+1.0,y+1.1,5.0,0.45,{fontSize:18,bold:true,color:accent,align:'center'});
    }
  }
}

function inferVisualKind(fieldTitle){
  const t=nrm(fieldTitle);
  if(t.includes('stochastik')) return 'stoch';
  if(t.includes('analytische geometrie')) return 'vector';
  if(t.includes('geometrie')) return 'geometry';
  if(t.includes('funktionen') || t.includes('analysis')) return 'function';
  return 'arithmetic';
}

function errorPrompt(fieldTitle, topics){
  const t=nrm(fieldTitle+' '+topics.join(' '));
  if(t.includes('bruch')) return qa('„Beim Addieren von Brüchen addiert man Zähler und Nenner.“ – Korrigiere.','Nur gleichnamige Brüche werden über die Zähler addiert; der gemeinsame Nenner bleibt erhalten.');
  if(t.includes('funktion')||t.includes('analysis')) return qa('„Ein steigender Graph hat immer positive Funktionswerte.“ – Korrigiere.','Steigend bedeutet positive Änderungsrate/Steigung; der Funktionswert kann trotzdem negativ sein.');
  if(t.includes('geometrie')) return qa('„Was in der Zeichnung gleich aussieht, ist bewiesen gleich.“ – Korrigiere.','Eine Zeichnung liefert Hinweise, aber Gleichheit muss über Voraussetzungen/Sätze begründet werden.');
  if(t.includes('stochastik')) return qa('„Wahrscheinlichkeit 0,7 bedeutet: In 10 Versuchen treten genau 7 Treffer auf.“ – Korrigiere.','0,7 ist eine langfristige relative Häufigkeit; in einzelnen Serien kann die Trefferzahl schwanken.');
  if(t.includes('vektor')||t.includes('ebene')) return qa('„Zwei Geraden im Raum, die sich nicht schneiden, sind parallel.“ – Korrigiere.','Sie können auch windschief sein.');
  return qa('„Ein Rechenergebnis ohne Einheit ist immer vollständig.“ – Korrigiere.','Bei Größen und Sachaufgaben gehört die passende Einheit bzw. Kontextdeutung zur vollständigen Antwort.');
}


function abiQuestionPack(bereichId, fieldTitle){
  const t=nrm(fieldTitle);
  const aq=(op,q,a)=>({op,q,a});

  if(bereichId==='ef' && t.includes('funktionen')) return [
    aq('berechnen','Berechnen Sie f(2) für f(x)=x³−2x.','f(2)=8−4=4.'),
    aq('bestimmen','Bestimmen Sie die Nullstellen von g(x)=x²−4.','x=−2 und x=2.'),
    aq('beschreiben','Beschreiben Sie die Verschiebung von y=x² zu h(x)=(x−2)²+1.','Der Graph wird um 2 nach rechts und um 1 nach oben verschoben.'),
    aq('begründen','Begründen Sie, dass x=0 eine Nullstelle von p(x)=x³−4x ist.','p(0)=0; daher ist x=0 eine Nullstelle.'),
    aq('skizzieren','Skizzieren Sie den Graphen von f(x)=x² und markieren Sie Scheitelpunkt und Symmetrieachse.','Nach oben geöffnete Parabel mit S(0|0) und Symmetrieachse x=0.')
  ];
  if(bereichId==='ef' && t.includes('geometrie')) return [
    aq('angeben','Geben Sie den Ortsvektor des Punktes P(2|−1|4) an.','OP=(2|−1|4).'),
    aq('berechnen','Berechnen Sie den Vektor AB für A(1|2|0) und B(4|1|5).','AB=(3|−1|5).'),
    aq('bestimmen','Bestimmen Sie eine Geradengleichung durch A(1|0|2) mit Richtungsvektor (2|1|−1).','x=(1|0|2)+t·(2|1|−1), t∈R.'),
    aq('entscheiden','Entscheiden Sie, ob u=(1|2|3) und v=(2|4|6) parallel sind.','Ja; v=2u.'),
    aq('begründen','Begründen Sie, dass M(2|1|2) Mittelpunkt von A(0|0|1) und B(4|2|3) ist.','Der Koordinatenmittelwert von A und B ist (2|1|2).')
  ];
  if(bereichId==='ef' && t.includes('stochastik')) return [
    aq('berechnen','Berechnen Sie bei zwei unabhängigen Versuchen mit p=0,3 die Wahrscheinlichkeit für zwei Treffer.','0,3²=0,09.'),
    aq('bestimmen','Bestimmen Sie P(A|B), wenn 20 Personen B erfüllen und davon 8 auch A.','P(A|B)=8/20=0,4.'),
    aq('entscheiden','Entscheiden Sie, ob A und B unabhängig sind: P(A)=0,5, P(B)=0,4, P(A∩B)=0,2.','Ja, denn 0,5·0,4=0,2.'),
    aq('beschreiben','Beschreiben Sie die Bedeutung von P(A|B)=0,6.','Unter der Bedingung B tritt A mit Wahrscheinlichkeit 0,6 auf.'),
    aq('erläutern','Erläutern Sie die Produktregel entlang eines Pfades im Baumdiagramm.','Die Wahrscheinlichkeiten auf einem Pfad werden multipliziert, weil die aufeinanderfolgenden Teilereignisse gemeinsam eintreten sollen.')
  ];

  if(bereichId==='q1-q2-grundkurs' && t.includes('funktionen')) return [
    aq('berechnen','Berechnen Sie die Ableitung von f(x)=x²·eˣ.','f′(x)=2x·eˣ+x²·eˣ=eˣ(x²+2x).'),
    aq('bestimmen','Bestimmen Sie die Extremstelle von f(x)=x²−4x.','f′(x)=2x−4=0 ⇒ x=2; dort liegt ein Minimum, f(2)=−4.'),
    aq('interpretieren','Interpretieren Sie f′(3)=2, wenn f(t) eine Füllmenge in Litern und t die Zeit in Minuten beschreibt.','Nach 3 Minuten wächst die Füllmenge momentan mit 2 Litern pro Minute.'),
    aq('berechnen','Berechnen Sie ∫₀³ 4 dt und deuten Sie das Ergebnis als Bestandsänderung.','12; der Bestand nimmt im betrachteten Zeitraum um 12 Einheiten zu.'),
    aq('beurteilen','Beurteilen Sie die Aussage: „f(x)>0 bedeutet, dass f wächst.“','Falsch. Wachstum wird durch f′(x)>0 beschrieben; ein positiver Funktionswert allein reicht nicht.')
  ];
  if(bereichId==='q1-q2-grundkurs' && t.includes('geometrie')) return [
    aq('berechnen','Berechnen Sie u·v für u=(1|2|0) und v=(3|−1|0).','u·v=1·3+2·(−1)=1.'),
    aq('entscheiden','Entscheiden Sie, ob u=(1|1|0) und v=(1|−1|0) orthogonal sind.','Ja, denn u·v=0.'),
    aq('bestimmen','Bestimmen Sie den Schnittpunkt von g: x=t·(1|1|1) mit E: x₁+x₂+x₃=6.','3t=6 ⇒ t=2; S(2|2|2).'),
    aq('beschreiben','Beschreiben Sie die Bedeutung eines Normalenvektors einer Ebene.','Ein Normalenvektor steht senkrecht auf der Ebene.'),
    aq('beurteilen','Beurteilen Sie die Aussage: „Zwei Geraden im Raum, die sich nicht schneiden, sind parallel.“','Falsch. Sie können auch windschief sein.')
  ];
  if(bereichId==='q1-q2-grundkurs' && t.includes('stochastik')) return [
    aq('berechnen','Berechnen Sie P(X=2) für X~B(4;0,5).','P(X=2)=6·0,5⁴=0,375.'),
    aq('bestimmen','Bestimmen Sie E(X) für X=0,1,2 mit P=0,25; 0,50; 0,25.','E(X)=0·0,25+1·0,50+2·0,25=1.'),
    aq('beschreiben','Beschreiben Sie, was die Standardabweichung einer Zufallsgröße angibt.','Sie beschreibt die typische Streuung der Werte um den Erwartungswert.'),
    aq('interpretieren','Interpretieren Sie P(A|B)=0,4 in Worten.','Unter der Bedingung B tritt A mit Wahrscheinlichkeit 0,4 auf.'),
    aq('beurteilen','Beurteilen Sie die Aussage: „E(X)=3 bedeutet, dass X=3 am wahrscheinlichsten ist.“','Falsch. Der Erwartungswert ist ein langfristiger Mittelwert und muss nicht der wahrscheinlichste Einzelwert sein.')
  ];

  if(bereichId==='q1-q2-leistungskurs' && t.includes('funktionen')) return [
    aq('berechnen','Berechnen Sie die Ableitung von f(x)=x·e²ˣ.','f′(x)=e²ˣ+2x·e²ˣ=e²ˣ(1+2x).'),
    aq('bestimmen','Bestimmen Sie die Periodenlänge von f(x)=2·sin(3x)+1.','T=2π/3.'),
    aq('untersuchen','Untersuchen Sie fₐ(x)=x²+a·x auf Extremstellen.','fₐ′(x)=2x+a=0 ⇒ x=−a/2; wegen fₐ′′(x)=2 liegt dort ein Minimum.'),
    aq('zeigen','Zeigen Sie für x>0, dass F(x)=x·ln(x)−x eine Stammfunktion von f(x)=ln(x) ist.','F′(x)=ln(x)+1−1=ln(x).'),
    aq('beurteilen','Beurteilen Sie die Aussage: „Bei fₐ(x)=eᵃˣ mit a>0 erfolgt die Verdopplung immer nach gleich langen Zeitabständen.“','Richtig. Die Verdopplungszeit ist konstant und beträgt ln(2)/a.')
  ];
  if(bereichId==='q1-q2-leistungskurs' && t.includes('geometrie')) return [
    aq('berechnen','Berechnen Sie den Winkel zwischen u=(1|0|0) und v=(1|1|0).','cos(α)=1/√2 ⇒ α=45°.'),
    aq('bestimmen','Bestimmen Sie eine Ebenengleichung durch P(1|2|3) mit Normalenvektor n=(0|0|1).','E: x₃=3 bzw. z=3.'),
    aq('ermitteln','Ermitteln Sie den Abstand von P(1|2|3) zur Ebene E: z=0.','Der Abstand beträgt 3.'),
    aq('nachweisen','Weisen Sie nach, dass g mit Richtungsvektor (1|1|1) senkrecht auf E: x₁+x₂+x₃=3 steht.','Der Richtungsvektor von g ist parallel zum Normalenvektor n=(1|1|1) der Ebene.'),
    aq('beurteilen','Beurteilen Sie die Aussage: „Zwei Geraden im Raum mit nicht parallelen Richtungsvektoren schneiden sich immer.“','Falsch. Nicht parallele Geraden können windschief sein.')
  ];
  if(bereichId==='q1-q2-leistungskurs' && t.includes('stochastik')) return [
    aq('berechnen','Berechnen Sie Erwartungswert und Standardabweichung für X~B(100;0,5).','μ=np=50; σ=√(np(1−p))=5.'),
    aq('bestimmen','Bestimmen Sie P(X=0) für X~B(5;0,2).','P(X=0)=0,8⁵=0,32768.'),
    aq('beschreiben','Beschreiben Sie, wie sich eine größere Standardabweichung auf die Glockenkurve einer Normalverteilung auswirkt.','Die Kurve wird breiter und flacher; die Werte streuen stärker um μ.'),
    aq('erläutern','Erläutern Sie, wie eine größere Stichprobe bei gleichem Sicherheitsniveau die Breite eines Konfidenzintervalls beeinflusst.','Mit wachsendem Stichprobenumfang wird das Intervall typischerweise schmaler.'),
    aq('beurteilen','Beurteilen Sie die Aussage: „Ein höheres Sicherheitsniveau führt bei gleicher Stichprobe zu einem schmaleren Konfidenzintervall.“','Falsch. Ein höheres Sicherheitsniveau führt bei gleicher Stichprobe zu einem breiteren Intervall.')
  ];
  return null;
}

function addOperatorCheckSlide(pptx, bereich, field, accent, questions){
  const s=pptx.addSlide('M_EXIT');
  addText(s,'Kontrollfragen im Abiturstil',0.75,1.32,8.4,0.56,{fontSize:27,bold:true,color:C.white});
  const suffix=bereich.id==='ef' ? 'Operatorensprache trainieren' : 'an wiederkehrenden Abitur-Schwerpunkten orientiert';
  addText(s,`${bereich.titel} · ${field.titel} · ${suffix}`,0.78,1.9,11.4,0.28,{fontSize:12.5,color:'C9DAE7'});
  const positions=[[0.8,2.55],[6.82,2.55],[0.8,3.75],[6.82,3.75],[0.8,4.95]];
  questions.forEach((e,i)=>{
    const [xx,yy]=positions[i]; const ww=i===4?11.77:5.72;
    s.addShape(SHAPE.roundRect,{x:xx,y:yy,w:ww,h:0.92,rectRadius:0.07,fill:{color:i===4?C.navy2:'20445F'},line:{color:'4A6C86',width:1}});
    const bw=i===4?1.35:1.28;
    s.addShape(SHAPE.roundRect,{x:xx+0.14,y:yy+0.18,w:bw,h:0.30,rectRadius:0.06,fill:{color:accent},line:{color:accent}});
    addText(s,e.op.toUpperCase(),xx+0.18,yy+0.20,bw-0.08,0.23,{fontSize:8.2,bold:true,color:C.white,align:'center'});
    addText(s,e.q,xx+bw+0.32,yy+0.11,ww-bw-0.48,0.68,{fontSize:i===4?13.0:12.3,color:C.white,valign:'mid'});
  });
  addText(s,'Operatoren gemäß Standardsicherung NRW · gültig ab Abitur 2023',0.82,6.16,6.3,0.24,{fontSize:9.4,color:'BFD2E3',italic:true});
  addText(s,'Selbstcheck',7.25,6.13,1.05,0.22,{fontSize:9.8,bold:true,color:'C9DAE7'});
  const labels=['sicher','fast','noch üben'];
  labels.forEach((lab,i)=>{ const xx=8.35+i*1.32; s.addShape(SHAPE.roundRect,{x:xx,y:6.03,w:1.15,h:0.42,rectRadius:0.07,fill:{color:i===0?C.green:i===1?C.amber:C.red},line:{color:'FFFFFF',transparency:100}}); addText(s,lab,xx+0.05,6.10,1.05,0.24,{fontSize:9.3,bold:true,color:C.white,align:'center'}); });
  addNotes(s,questions);
  return s;
}

function makeDeck(bereich, field){
  const accent=pickAccent(field.titel); const pale=paleForAccent(accent);
  const pptx=createPptBase(`${bereich.titel} – ${field.titel} – Wiederholung`);
  const ctx={bereichId:bereich.id,bereichTitle:bereich.titel,fieldTitle:field.titel};
  const packs=field.themen.map(t=>({topic:t, pack:topicPack(t.titel,ctx)}));
  const topics=field.themen.map(t=>t.titel);
  // Slide 1
  let s=pptx.addSlide('M_TITLE');
  addBadge(s,bereich.titel,0.75,1.38,1.85,accent);
  addText(s,`Wiederholung: ${field.titel}`,0.75,2.0,11.3,0.72,{fontSize:33,bold:true,color:C.white});
  addText(s,'Kurze Fragen · sichere Grundlagen · Anwendungen · Transfer',0.78,2.88,10.4,0.38,{fontSize:16,color:'D8E6F1'});
  const maxTopics=Math.min(topics.length,5); let ty=3.6;
  for(let i=0;i<maxTopics;i++){
    s.addShape(SHAPE.ellipse,{x:0.82,y:ty+0.08,w:0.14,h:0.14,fill:{color:C.amber},line:{color:C.amber}});
    addText(s,topics[i],1.08,ty,10.7,0.38,{fontSize:14.2,color:C.white}); ty+=0.47;
  }
  if(topics.length>5) addText(s,`+ ${topics.length-5} weitere Schwerpunkte`,1.08,ty,5.0,0.32,{fontSize:12,color:'C7D7E5',italic:true});
  s.addNotes(`Themengebiet: ${field.titel}\nStufe: ${bereich.titel}\nDie Präsentation ist als kurze Wiederholung vor bzw. zu Beginn einer Unterrichtsphase gedacht.`);

  // Slide 2 warmup
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Leichter Einstieg',`${bereich.titel} · ${field.titel}`,accent);
  const warm=[]; for(let i=0;i<Math.min(4,packs.length);i++) warm.push(packs[i].pack.easy);
  while(warm.length<4) warm.push(packs[warm.length%packs.length].pack.easy);
  addQuestionTile(s,1,warm[0].q,0.8,1.75,5.75,1.75,accent);
  addQuestionTile(s,2,warm[1].q,6.78,1.75,5.75,1.75,accent);
  addQuestionTile(s,3,warm[2].q,0.8,3.78,5.75,1.75,accent);
  addQuestionTile(s,4,warm[3].q,6.78,3.78,5.75,1.75,accent);
  addText(s,'Ziel: erst Sicherheit gewinnen – dann steigern.',0.82,6.05,5.2,0.3,{fontSize:11.5,color:C.muted,italic:true}); addNotes(s,warm);

  // Slide 3 concepts
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Begriffe & Grundideen',`${bereich.titel} · erkläre ohne lange Rechnung`,accent);
  const concepts=packs.slice(0,3).map(p=>p.pack.concept); while(concepts.length<3) concepts.push(packs[concepts.length%packs.length].pack.concept);
  addCard(s,0.8,1.75,7.65,1.35,'Begriff 1',concepts[0].q,accent,{fontSize:17});
  addCard(s,0.8,3.28,7.65,1.35,'Begriff 2',concepts[1].q,accent,{fontSize:17});
  addCard(s,0.8,4.81,7.65,1.35,'Begriff 3',concepts[2].q,accent,{fontSize:17});
  s.addShape(SHAPE.roundRect,{x:8.75,y:1.75,w:3.75,h:3.25,rectRadius:0.09,fill:{color:pale},line:{color:accent,width:1.2}});
  addText(s,'Kernideen',9.05,2.02,2.9,0.35,{fontSize:13,bold:true,color:accent});
  const keys=packs.slice(0,3).map(p=>p.pack.key).filter(Boolean);
  addText(s,keys.map(k=>'• '+k).join('\n'),9.05,2.48,3.0,2.15,{fontSize:14,color:C.ink,valign:'top'});
  addFormulaBox(s,packs[0].pack.key||'Begriffe und Darstellungen verbinden.',accent); addNotes(s,concepts);

  // Slide 4 base calculations
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Rechnen – sicher starten',`${bereich.titel} · Basisaufgaben`,accent);
  const base=[]; for(let i=0;i<Math.min(3,packs.length);i++) base.push(packs[i].pack.apply); while(base.length<3) base.push(packs[base.length%packs.length].pack.apply);
  addCard(s,0.8,1.75,3.75,4.75,'A',base[0].q,accent,{fontSize:19});
  addCard(s,4.8,1.75,3.75,4.75,'B',base[1].q,accent,{fontSize:19});
  addCard(s,8.8,1.75,3.75,4.75,'C',base[2].q,accent,{fontSize:19});
  addText(s,'Arbeite sauber: Ansatz → Rechnung → Ergebnis/Deutung.',0.82,6.63,6.4,0.26,{fontSize:11,color:C.muted,italic:true}); addNotes(s,base);

  // Slide 5 visual representations
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Darstellungen lesen',`${bereich.titel} · Bild, Graph oder Modell`,accent);
  const kind=inferVisualKind(field.titel); addVisual(s,kind,accent,ctx,topics);
  const visualQs=[packs[Math.min(1,packs.length-1)].pack.concept,packs[Math.min(2,packs.length-1)].pack.apply];
  addCard(s,8.2,1.75,4.3,2.15,'Beobachten',visualQs[0].q,accent,{fontSize:16.5,fill:pale});
  addCard(s,8.2,4.15,4.3,2.15,'Nutzen',visualQs[1].q,accent,{fontSize:16.5});
  addNotes(s,visualQs);

  // Slide 6 context
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Anwenden im Kontext',`${bereich.titel} · etwas mehr Denken`,accent);
  const apps=[]; packs.slice(-2).forEach(p=>apps.push(p.pack.apply)); while(apps.length<2) apps.push(packs[apps.length%packs.length].pack.challenge);
  addCard(s,0.8,1.75,5.75,4.85,'Kontext 1',apps[0].q,accent,{fontSize:19,fill:pale});
  addCard(s,6.78,1.75,5.75,4.85,'Kontext 2',apps[1].q,accent,{fontSize:19});
  addText(s,'Tipp: Welche Größe ist gesucht? Welche Darstellung oder Formel hilft?',0.82,6.62,8.2,0.27,{fontSize:11.3,color:C.muted,italic:true}); addNotes(s,apps);

  // Slide 7 challenge/errors
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Denkfragen & Fehler finden',`${bereich.titel} · Konzepte wirklich verstanden?`,accent);
  const ch1=packs[0].pack.challenge; const ch2=packs[packs.length-1].pack.challenge; const err=errorPrompt(field.titel,topics);
  addCard(s,0.8,1.75,5.75,2.05,'Denkfrage',ch1.q,accent,{fontSize:17.5});
  addCard(s,6.78,1.75,5.75,2.05,'Transfer',ch2.q,accent,{fontSize:17.5});
  s.addShape(SHAPE.roundRect,{x:0.8,y:4.15,w:11.73,h:2.0,rectRadius:0.09,fill:{color:C.paleRed},line:{color:C.red,width:1.2}});
  addText(s,'FEHLER DES TAGES',1.06,4.42,2.0,0.25,{fontSize:11,bold:true,color:C.red});
  addText(s,err.q,1.06,4.83,10.9,0.85,{fontSize:18,bold:true,color:C.ink});
  addText(s,'Korrigiere die Aussage und begründe.',1.06,5.72,5.2,0.24,{fontSize:11.5,color:C.red,italic:true}); addNotes(s,[ch1,ch2,err]);

  // Slide 8 exit / Sek-II: Kontrollfragen mit offiziellen Operatoren
  const abiQs=abiQuestionPack(bereich.id,field.titel);
  if(abiQs){
    addOperatorCheckSlide(pptx,bereich,field,accent,abiQs);
  } else {
    s=pptx.addSlide('M_EXIT');
    addText(s,'Kannst du das noch?',0.75,1.35,7.5,0.52,{fontSize:28,bold:true,color:C.white});
    addText(s,`${bereich.titel} · ${field.titel}`,0.78,1.9,8.0,0.28,{fontSize:13,color:'C9DAE7'});
    const exit=[]; packs.forEach(p=>{ if(exit.length<5) exit.push(p.pack.easy); }); while(exit.length<5) exit.push(packs[exit.length%packs.length].pack.concept);
    const positions=[[0.8,2.55],[6.82,2.55],[0.8,3.75],[6.82,3.75],[0.8,4.95]];
    exit.forEach((e,i)=>{
      const [xx,yy]=positions[i]; const ww=i===4?11.77:5.72;
      s.addShape(SHAPE.roundRect,{x:xx,y:yy,w:ww,h:0.92,rectRadius:0.07,fill:{color:i===4?C.navy2:'20445F',transparency:0},line:{color:'4A6C86',width:1}});
      addText(s,`${i+1}`,xx+0.18,yy+0.16,0.38,0.48,{fontSize:13,bold:true,color:C.amber,align:'center'});
      addText(s,e.q,xx+0.68,yy+0.13,ww-0.88,0.62,{fontSize:14.3,color:C.white});
    });
    addText(s,'Selbstcheck',6.85,5.08,1.15,0.22,{fontSize:10.5,bold:true,color:'C9DAE7'});
    const labels=['sicher','fast','noch üben'];
    labels.forEach((lab,i)=>{ const xx=8.0+i*1.32; s.addShape(SHAPE.roundRect,{x:xx,y:5.0,w:1.15,h:0.42,rectRadius:0.07,fill:{color:i===0?C.green:i===1?C.amber:C.red},line:{color:'FFFFFF',transparency:100}}); addText(s,lab,xx+0.05,5.07,1.05,0.24,{fontSize:9.5,bold:true,color:C.white,align:'center'}); });
    addNotes(s,exit);
  }

  return {pptx,packs};
}

async function createTemplate(){
  const pptx=createPptBase('Mathematik Wiederholung – Designvorlage');
  let s=pptx.addSlide('M_TITLE'); addBadge(s,'Klasse / Kurs',0.75,1.38,2.1,C.teal); addText(s,'Wiederholung: Themengebiet',0.75,2.0,11.3,0.72,{fontSize:33,bold:true,color:C.white}); addText(s,'Designvorlage · 16:9 · wiederverwendbare Masterlayouts',0.78,2.88,10.4,0.38,{fontSize:16,color:'D8E6F1'});
  addText(s,'• leichter Einstieg\n• Begriffe & Grundideen\n• Rechnen & Darstellungen\n• Kontext & Transfer\n• 5-Minuten-Check',0.85,3.6,6.2,2.15,{fontSize:17,color:C.white,valign:'top'});
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Beispiel: Inhaltsfolie','Titel, Untertitel, Akzentfarbe',C.teal); addCard(s,0.8,1.75,5.75,2.0,'Aufgabe','Hier steht eine kurze, gut lesbare Aufgabe.',C.teal,{fontSize:19}); addCard(s,6.78,1.75,5.75,2.0,'Hinweis','Karten, Akzentleiste und Weißraum bleiben konsistent.',C.teal,{fontSize:18,fill:C.paleTeal}); addFormulaBox(s,'Formel / Merksatz',C.teal);
  s=pptx.addSlide('M_CONTENT'); addTitle(s,'Beispiel: Darstellungsfolie','Grafik links · Fragen rechts',C.purple); addVisual(s,'geometry',C.purple,{},['Dreieck Konstruktion Winkel']); addCard(s,8.2,1.75,4.3,2.15,'Beobachten','Welche Beziehungen erkennst du?',C.purple,{fontSize:18,fill:C.palePurple}); addCard(s,8.2,4.15,4.3,2.15,'Begründen','Welche Aussage kannst du sicher begründen?',C.purple,{fontSize:18});
  s=pptx.addSlide('M_EXIT'); addText(s,'Kontrollfragen / Exit-Check',0.75,1.35,7.5,0.52,{fontSize:28,bold:true,color:C.white}); addText(s,'Beispiel · Exit-Layout · Operatoren geeignet',0.78,1.9,8.0,0.28,{fontSize:13,color:'C9DAE7'}); ['Kurze Frage 1','Kurze Frage 2','Kurze Frage 3','Kurze Frage 4','Kurze Frage 5'].forEach((q,i)=>{ const pos=[[0.8,2.55],[6.82,2.55],[0.8,3.75],[6.82,3.75],[0.8,4.95]][i]; const ww=i===4?11.77:5.72; s.addShape(SHAPE.roundRect,{x:pos[0],y:pos[1],w:ww,h:0.92,rectRadius:0.07,fill:{color:i===4?C.navy2:'20445F'},line:{color:'4A6C86',width:1}}); addText(s,`${i+1}`,pos[0]+0.18,pos[1]+0.16,0.38,0.48,{fontSize:13,bold:true,color:C.amber,align:'center'}); addText(s,q,pos[0]+0.68,pos[1]+0.13,ww-0.88,0.62,{fontSize:14.3,color:C.white}); });
  const outDir=path.join(root,'gemeinsam','vorlagen'); fs.mkdirSync(outDir,{recursive:true});
  const pptxPath=path.join(outDir,'Mathematik_Wiederholung_Designvorlage.pptx'); await pptx.writeFile({fileName:pptxPath});
  return pptxPath;
}

(async()=>{
  const unmatched=[]; const outputs=[];
  for(const b of struktur.bereiche){
    for(const f of b.inhaltsfelder){
      const {pptx,packs}=makeDeck(b,f);
      packs.forEach(p=>{ if(!p.pack.matched) unmatched.push(`${b.id}/${f.id}/${p.topic.id} :: ${p.topic.titel}`); });
      const outDir=path.join(root,b.id,f.id); fs.mkdirSync(outDir,{recursive:true});
      const out=path.join(outDir,'wiederholung.pptx');
      await pptx.writeFile({fileName:out}); outputs.push(out);
      console.log('WROTE',path.relative(root,out));
    }
  }
  const templatePath=await createTemplate();
  const manifest={stand:new Date().toISOString(),presentationen:outputs.map(p=>path.relative(root,p)),template:path.relative(root,templatePath),anzahl:outputs.length,folienProPraesentation:8,sek2OperatorenCheck:true,operatorenQuelle:'Standardsicherung NRW – Mathematik, gültig ab Abitur 2023',abiturAnalyse:'dokumentation/ABITURVORGABEN_SEKII.md',unmatched};
  fs.writeFileSync(path.join(root,'dokumentation','PPT_WIEDERHOLUNG_MANIFEST.json'),JSON.stringify(manifest,null,2));
  fs.writeFileSync(path.join(root,'dokumentation','PPT_WIEDERHOLUNG.md'),`# Wiederholungs-PowerPoints\n\n- Für jedes Themenfeld liegt direkt im Themenfeldordner eine Datei **wiederholung.pptx**.\n- Jede Präsentation umfasst **8 Folien**: Titel, leichter Einstieg, Begriffe/Grundideen, Basisrechnen, Darstellungen, Kontext, Denkfragen/Fehleranalyse und 5-Minuten-Check.\n- Lösungshinweise stehen in den **Referentennotizen** der jeweiligen Folie.\n- In **allen Präsentationen der Sekundarstufe II** verwendet der abschließende 5-Minuten-Check offizielle Mathematik-Operatoren der Standardsicherung NRW (gültig ab Abitur 2023). Die Kontrollfragen sind bewusst niedrigschwellig und an den wiederkehrenden Schwerpunkten der veröffentlichten Abiturvorgaben orientiert.\n- Die Auswertung der Abiturvorgaben 2025–2029 steht unter **dokumentation/ABITURVORGABEN_SEKII.md**.\n- Das gemeinsame Design liegt unter **gemeinsam/vorlagen/Mathematik_Wiederholung_Designvorlage.pptx** sowie als PowerPoint-Template **Mathematik_Wiederholung_Designvorlage.potx**.\n- Alle Präsentationen verwenden dieselben PowerPoint-Masterlayouts.\n\nDie Inhalte sind als Wiederholungsimpulse gedacht. Die konkrete Jahrgangsverteilung der Sekundarstufe I folgt der vorbereitenden Struktur in struktur.json und ist mit dem schulinternen Lehrplan abzugleichen.\n`);
  console.log('UNMATCHED',unmatched.length); if(unmatched.length) console.log(unmatched.join('\n'));
})();
