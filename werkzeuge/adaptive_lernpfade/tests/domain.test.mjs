import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILLS, createState, makeTask, parseNumber, publicState, submitAnswer, useHint, nextTask, coachPacket, applyCoach} from '../src/domain.mjs';

test('Dezimalzahlen, leere Werte und Codeeingaben', () => {
  assert.equal(parseNumber(' 12,5 '),12.5);
  for (const value of ['', '1e9', 'NaN', 'Infinity', '2+3', '<script>', '1.000,2']) assert.throws(() => parseNumber(value));
});
test('Aufgaben sind lösbar; Musterlösungen verlassen den Server nicht', () => {
  for (const skill of Object.keys(SKILLS)) for (let level=1;level<=4;level++) for (let j=0;j<25;j++) {
    const s=createState(); s.task=makeTask(skill,level);
    assert.ok(Number.isFinite(s.task.answer) && s.task.answer > 0);
    assert.equal(publicState(s).task.answer,undefined); assert.equal(publicState(s).task.hint,undefined);
    assert.equal(submitAnswer(s,s.task.answer,s.task.unit).correct,true);
  }
});
test('Gegebene Werte stimmen mit dem angezeigten Text überein', () => {
  for (let i=0;i<100;i++) {
    const t=makeTask('speed',3);
    const match=t.prompt.match(/gleichförmig ([\d.,]+) m in ([\d.,]+) min/);
    const n=x=>Number(x.replaceAll('.','').replace(',','.'));
    assert.ok(Math.abs(n(match[1])/(n(match[2])*60)-t.answer)<1e-9);
  }
});
test('Falsche Einheit und zweiter Versuch zählen nicht als selbstständiger Erfolg', () => {
  const s=createState(); assert.equal(submitAnswer(s,s.task.answer,'km/h').correct,false);
  assert.equal(submitAnswer(s,s.task.answer,'m/s').correct,true);
  assert.equal(s.skills.speed.independent,0); assert.equal(s.completed,1);
  assert.throws(()=>submitAnswer(s,s.task.answer,'m/s'));
});
test('Hinweise verhindern einen vorschnellen Aufstieg', () => {
  const s=createState(); useHint(s); submitAnswer(s,s.task.answer,s.task.unit);
  assert.equal(s.skills.speed.independent,0); assert.equal(s.skills.speed.level,1);
});

test('increase senkt ohne aktuelle Erfolgsbelege niemals die bestehende Anforderung',()=>{
  const s=createState();s.completed=4;s.skills.speed.level=3;s.skills.speed.independent=3;
  s.history=[{skill:'units',level:1,independent:true}];const packet=coachPacket(s);
  applyCoach(s,{schemaVersion:1,packetId:packet.packetId,feedback:'Weiter üben.',nextFocus:'speed',challenge:'increase'});
  assert.equal(s.skills.speed.level,3);
});
test('Aufstieg braucht mehrere unabhängige Erfolge und bleibt begrenzt', () => {
  const s=createState();
  for (let i=0;i<12;i++) {s.task=makeTask('speed',s.skills.speed.level); submitAnswer(s,s.task.answer,s.task.unit);}
  assert.equal(s.skills.speed.level,4);
  assert.equal(submitAnswer({...s,task:makeTask('speed',4)},0,'m/s').correct,false);
});
test('Nächste Aufgabe erst nach Erfolg; unterschiedliche Kompetenzen', () => {
  const s=createState(); assert.throws(()=>nextTask(s));
  const seen=new Set(); for(let i=0;i<9;i++){seen.add(s.task.skill);submitAnswer(s,s.task.answer,s.task.unit);nextTask(s);}
  assert.equal(seen.size,3);
});
function prepared(){const s=createState();for(let i=0;i<3;i++){submitAnswer(s,s.task.answer,s.task.unit);nextTask(s);}return s;}
test('KI-Transfer ist belegt, einmalig, begrenzt und schützt vor veralteten Antworten', () => {
  assert.throws(()=>coachPacket(createState()));
  const s=prepared(), packet=coachPacket(s);
  assert.ok(!packet.prompt.includes('token')); assert.ok(!packet.prompt.includes('sessionId'));
  const rec={schemaVersion:1,packetId:packet.packetId,feedback:'Du hast drei Aufgaben selbstständig gelöst.',nextFocus:'speed',challenge:'increase'};
  const before=s.skills.speed.level; applyCoach(s,rec);
  assert.equal(s.skills.speed.level,before); // Ein Erfolg genügt nicht.
  assert.throws(()=>applyCoach(s,rec));
  const p=coachPacket(s);useHint(s); assert.throws(()=>applyCoach(s,{...rec,packetId:p.packetId}));
});
test('KI kann keine fremden Kompetenzen oder beliebige Schwierigkeitswerte setzen', () => {
  const s=prepared(), packet=coachPacket(s), base={schemaVersion:1,packetId:packet.packetId,feedback:'Weiter üben.',nextFocus:'speed',challenge:'maintain'};
  for(const patch of [{nextFocus:'__proto__'},{challenge:999},{feedback:'x'.repeat(501)},{feedback:''},{schemaVersion:2}]) assert.throws(()=>applyCoach(s,{...base,...patch}));
});
