import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeTask,build,linePoints} from '../src/wurzelwerk-rules.mjs';
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
