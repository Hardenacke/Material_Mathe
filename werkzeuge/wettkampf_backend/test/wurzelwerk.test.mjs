import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeTask,build,linePoints} from '../src/wurzelwerk-rules.mjs';
import {competitionTask,timedPoints} from '../src/wurzelwerk-competition.mjs';
test('Wurzelwerk-Challenge enthält vier Aufgaben jeder Disziplin; Training zehn',()=>{
  const game=build('competition','mix',3);
  assert.equal(game.types.length,12);
  for(const type of ['roots','laws','line'])assert.equal(game.types.filter(value=>value===type).length,4);
  assert.equal(build('training','mix',1).types.length,10);
});
test('Generierte Wurzelaufgaben haben mathematisch passende Lösungen und vollständig vereinfachte Wurzeln',()=>{
  for(let i=0;i<200;i++)for(const level of [1,2,3]){
    const root=makeTask('roots',level);assert.equal(root.expression,`\\sqrt{${root.answer**2}}`);
    const law=makeTask('laws',level);
    if(law.kind==='extract'){
      assert.equal(law.expression,`\\sqrt{${law.a**2*law.b}}`);
      for(let factor=2;factor**2<=law.b;factor++)assert.notEqual(law.b%(factor**2),0);
    }
    const line=makeTask('line',level);assert.equal(line.answer,Math.sqrt(line.n));assert.ok(line.answer<line.max);assert.equal(Number.isInteger(line.answer),false);
  }
});
test('Zahlenstrahl bewertet Genauigkeit mit 100, 70, 40 oder null Punkten',()=>{
  assert.deepEqual([0.19,0.3,0.7,0.8].map(error=>linePoints(error,0.19)),[100,70,40,0]);
});
test('Mittelschwere Wettbewerbsterme bleiben handlich und mathematisch korrekt',()=>{
  for(let i=0;i<200;i++){
    const root=competitionTask('roots');assert.ok(root.answer>=5&&root.answer<=20);
    const line=competitionTask('line');assert.ok(line.n>=5&&line.n<=60);assert.equal(line.answer,Math.sqrt(line.n));
    for(let ordinal=0;ordinal<4;ordinal++){
      const task=competitionTask('laws',ordinal),values=task.expression.match(/\d+/g).map(Number);
      assert.ok(Math.max(...values)<=252);
      if(task.kind==='extract')assert.equal(task.a**2*task.b,values[0]);
      else assert.equal(task.answer,Math.sqrt(task.kind==='product'?values[0]*values[1]:values[0]/values[1]));
    }
  }
});
test('Zeitbonus belohnt nur sichere Antworten innerhalb der Serverfrist',()=>{
  assert.deepEqual([0,15000,30000,60000].map(now=>timedPoints(100,0,now).points),[150,137,125,0]);
  assert.equal(timedPoints(70,0,1000).points,70);assert.equal(timedPoints(40,0,1000).timeBonus,0);
  assert.equal(timedPoints(0,0,0).points,0);assert.equal(timedPoints(100,0,61000).timedOut,true);
});
