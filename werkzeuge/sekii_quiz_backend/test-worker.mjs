import assert from "node:assert/strict";
import { makeTask, labelAbiTask, parseQuizId, evaluateAnswer, scoreAnswer, publicTask } from "./src/index.js";

const valid = ["ef-analysis", "ef-geometrie", "ef-stochastik", ...["q1", "q2"].flatMap(p => ["analysis", "geometrie", "stochastik"].flatMap(f => [p+"-"+f+"-gk", p+"-"+f+"-lk"]))];
for (const id of valid) {
  const parsed = parseQuizId(id);
  assert.ok(parsed, "valid id " + id);
  assert.equal(parsed.className, id.startsWith("ef-") ? "EF" : `${id.split("-")[0].toUpperCase()} · ${id.split("-")[2].toUpperCase()}`);
  for (let i = 0; i < 12; i++) {
    const task = labelAbiTask(id, i, makeTask(id, i));
    const publicVersion = publicTask(task, new Date(Date.now() + 60000).toISOString());
    assert.equal(publicVersion.kind, task.kind);
    assert.ok(task.prompt);
    if (!id.startsWith("ef-") && (i % 5 === 0 || i % 5 === 2)) assert.ok(task.prompt.startsWith("Abiturtransfer · Zahlenwerte variiert."), "QP contest transfer task must be labeled");
    assert.ok(task.solution);
    const answer = task.kind === "number" || task.kind === "slider" || task.kind === "vector" ? task.answer : task.kind === "choice" ? task.correct : task.kind === "order" ? task.answer : task.kind === "match" ? Object.fromEntries(task.pairs.map((p, j) => [j, p.correct])) : task.points;
    assert.ok(evaluateAnswer(task, answer) >= 0.999);
    assert.ok(!Object.hasOwn(publicVersion, "answer"));
    assert.ok(!Object.hasOwn(publicVersion, "solution"));
    if (task.kind === "order") {
      assert.ok(Array.isArray(publicVersion.items), "order payload must contain draggable items");
      assert.deepEqual([...publicVersion.items].sort(), [...task.answer].sort(), "order payload must contain exactly the task items");
      assert.notDeepEqual(publicVersion.items, task.answer, "order payload must not reveal the solution order");
      assert.ok(!Object.hasOwn(publicVersion, "publicItems"), "internal display state must not be sent to the browser");
      const resumedVersion = publicTask(task, new Date(Date.now() + 60000).toISOString());
      assert.deepEqual(resumedVersion.items, publicVersion.items, "resuming an order task must preserve its private display order");
    }
  }
}
for (const phase of ["q1", "q2"]) for (const field of ["analysis", "geometrie", "stochastik"]) for (const course of ["gk", "lk"]) for (const slot of [0, 2]) {
  const id = phase + "-" + field + "-" + course;
  const variants = new Set(Array.from({ length: 16 }, () => {
    const task = makeTask(id, slot);
    return JSON.stringify([task.prompt, task.answer ?? task.correct ?? task.items ?? task.points]);
  }));
  assert.ok(variants.size > 1, "Abiturtransfer values must vary in contest tasks: " + id + "/slot-" + slot);
}
const volumeSteps = ["Querschnittsfläche \\(\\pi f(x)^2\\) und Integrationsintervall festlegen", "Stammfunktion bestimmen oder digitales Mathematikwerkzeug nutzen", "Obere und untere Grenze auswerten: \\(F(b)-F(a)\\)", "Volumen mit Einheit im Kontext deuten"];
assert.deepEqual(makeTask("q2-analysis-lk", 3).answer, volumeSteps, "LK rotation-volume steps must be mathematically ordered");
for (const phase of ["q1", "q2"]) for (const field of ["analysis", "geometrie", "stochastik"]) for (let slot=0;slot<5;slot++) {
  const gk=makeTask(phase+"-"+field+"-gk",slot),lk=makeTask(phase+"-"+field+"-lk",slot);
  assert.notEqual(gk.prompt,lk.prompt,"GK/LK contest task must differ: "+phase+"/"+field+"/slot-"+slot);
}
assert.equal(parseQuizId("ef-analysis-gk"),null);assert.equal(parseQuizId("q1-analysis"),null);assert.equal(parseQuizId("q2-unknown-lk"),null);
const q={kind:"vector",answer:[1,2,3],tol:0.001};assert.equal(evaluateAnswer(q,[1,2,3]),1);assert.equal(evaluateAnswer(q,[1,0,3]),2/3);
const task={kind:"number",answer:7,tol:0};assert.equal(scoreAnswer(task,7,10,60000).basePoints,100);assert.equal(scoreAnswer(task,7,30000,60000).timeBonus,25);assert.equal(scoreAnswer(task,8,10,60000).basePoints,0);
console.log("Sek II Worker-Prüfung erfolgreich:",valid.length,"Quiz-IDs geprüft.");
