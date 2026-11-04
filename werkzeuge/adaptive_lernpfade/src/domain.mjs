export const SKILLS = {
  speed: 'Geschwindigkeit berechnen',
  rearrange: 'Formeln umstellen',
  units: 'Einheiten umrechnen'
};
const factors = { 'm/s': ['speed', 1], 'km/h': ['speed', 1 / 3.6], s: ['time', 1], min: ['time', 60], m: ['distance', 1], km: ['distance', 1000] };
const pick = (a, random) => a[Math.floor(random() * a.length)];
const fmt = n => new Intl.NumberFormat('de-DE', {maximumFractionDigits: 3}).format(n);
export const TASK_TEMPLATES = Object.freeze({'speed-v1':'speed','rearrange-v1':'rearrange','units-v1':'units'});
function parameterOptions(skill,level){
  if(skill==='speed')return {speed:level<3?[2,3,4,5]:[2.5,4.5,7.5,12.5],seconds:level>=3?[30,60,90,120]:[8,12,20,40]};
  if(skill==='rearrange')return {speed:[3,5,8,12],seconds:[10,15,25,40]};
  if(skill==='units')return {base:level>=3?[2.5,7.5,12.5,22.5]:[5,10,15,20]};
  throw new Error('Unbekannte Kompetenz.');
}
export function validateTaskPlan(s,plan){
  if(!plan||!Object.hasOwn(TASK_TEMPLATES,plan.templateId))throw new Error('Unbekannte Aufgabenvorlage.');
  const skill=TASK_TEMPLATES[plan.templateId],level=plan.level;
  if(!Number.isInteger(level)||level<Math.max(1,s.skills[skill].level-1)||level>s.skills[skill].level)throw new Error('Anforderungsstufe nicht belegt.');
  if(![0,1].includes(plan.wordingVariant)||!['standard','steps'].includes(plan.hintVariant))throw new Error('Unbekannte Textvariante.');
  const options=parameterOptions(skill,level),parameters=plan.parameters;
  if(!parameters||typeof parameters!=='object'||Array.isArray(parameters)||Object.keys(parameters).length!==Object.keys(options).length||Object.entries(options).some(([key,values])=>!values.includes(parameters[key])))throw new Error('Ungültige Aufgabenparameter.');
  return {templateId:plan.templateId,level,parameters:{...parameters},wordingVariant:plan.wordingVariant,hintVariant:plan.hintVariant};
}
export function newId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
export function createState(random = Math.random) {
  const s = {version: 1, revision: 0, completed: 0, history: [], pendingSkill: null, coach: null,
    skills: Object.fromEntries(Object.keys(SKILLS).map(k => [k, {level: 1, streak: 0, independent: 0, completed: 0, misses: 0}]))};
  s.task = makeTask('speed', 1, random); return s;
}
export function makeTask(skill, level, random = Math.random, plan = null) {
  const t = {id: newId(), skill, level, attempts: 0, hinted: false, solved: false};
  const options=parameterOptions(skill,level),value=key=>plan?plan.parameters[key]:pick(options[key],random);
  if (skill === 'speed') {
    const v = value('speed');
    const seconds = value('seconds'), metres = v * seconds;
    const mixed = level >= 3;
    t.prompt = `Ein Fahrzeug fährt gleichförmig ${fmt(metres)} m in ${fmt(mixed ? seconds / 60 : seconds)} ${mixed ? 'min' : 's'}. Berechne seine Geschwindigkeit in m/s.`;
    Object.assign(t, {answer: v, unit: 'm/s', dimension: 'speed', hint: mixed ? 'Rechne die Zeit zuerst in Sekunden um. Nutze dann v = s / t.' : 'Teile den zurückgelegten Weg durch die benötigte Zeit: v = s / t.'});
    if (level === 1) t.prompt += ' Nutze v = s / t.';
  } else if (skill === 'rearrange') {
    const v = value('speed'), seconds = value('seconds');
    const seekTime = level >= 2, mixed = level >= 3;
    t.prompt = seekTime ? `Ein Fahrzeug fährt gleichförmig mit ${fmt(mixed ? v * 3.6 : v)} ${mixed ? 'km/h' : 'm/s'}. Nach welcher Zeit hat es ${fmt(v * seconds)} m zurückgelegt? Gib Sekunden an.` : `Ein Fahrzeug fährt gleichförmig mit ${v} m/s. Welchen Weg legt es in ${seconds} s zurück? Gib Meter an.`;
    Object.assign(t, {answer: seekTime ? seconds : v * seconds, unit: seekTime ? 's' : 'm', dimension: seekTime ? 'time' : 'distance', hint: seekTime ? 'Stelle v = s / t nach t um: t = s / v. Achte vorher auf passende Einheiten.' : 'Stelle v = s / t nach s um: s = v · t.'});
    if (level === 4) t.prompt = `Prüfe die Aussage „Für die Fahrzeit muss ich Weg und Geschwindigkeit multiplizieren“. Begründe sie zunächst für dich. ${t.prompt}`;
  } else if (skill === 'units') {
    const toKmh = level >= 2, base = value('base');
    Object.assign(t, {prompt: `Rechne ${fmt(toKmh ? base : base * 3.6)} ${toKmh ? 'm/s' : 'km/h'} in ${toKmh ? 'km/h' : 'm/s'} um.`, answer: toKmh ? base * 3.6 : base, unit: toKmh ? 'km/h' : 'm/s', dimension: 'speed', hint: '1 m/s entspricht 3,6 km/h. Von m/s nach km/h multiplizierst du mit 3,6; zurück dividierst du durch 3,6.'});
    if (level === 4) t.prompt = `Ein Messgerät verwendet eine andere Geschwindigkeitseinheit als dein Protokoll. ${t.prompt}`;
  } else throw new Error('Unbekannte Kompetenz.');
  if(plan?.wordingVariant===1)t.prompt='Arbeite Schritt für Schritt. '+t.prompt;
  if(plan?.hintVariant==='steps')t.hint='1. Notiere die gegebenen Größen. 2. Prüfe die Einheiten. 3. '+t.hint;
  if(!Number.isFinite(t.answer)||t.answer<=0)throw new Error('Aufgabe nicht lösbar.');
  return t;
}
export function parseNumber(value) {
  const text = String(value).trim();
  if (!/^-?\d+(?:[.,]\d+)?$/.test(text)) throw new Error('Gib eine Zahl ein, zum Beispiel 12,5.');
  const n = Number(text.replace(',', '.'));
  if (!Number.isFinite(n) || Math.abs(n) > 1e9) throw new Error('Die Zahl liegt außerhalb des erlaubten Bereichs.');
  return n;
}
export function submitAnswer(s, value, unit) {
  if (s.task.solved) throw new Error('Diese Aufgabe ist bereits abgeschlossen.');
  const n = parseNumber(value), f = factors[unit];
  if (!f || f[0] !== s.task.dimension) throw new Error('Wähle eine passende Einheit.');
  const t = s.task, p = s.skills[t.skill];
  t.attempts++; s.revision++; s.coach = null;
  // Die Einheit der Aufgabe gehört zum Lernziel. Numerische Toleranz: 0,5 %.
  const correctNumber = Math.abs(n - t.answer) <= Math.max(.015, Math.abs(t.answer) * .005);
  const correct = correctNumber && unit === t.unit;
  if (!correct) {
    p.misses++; p.streak = 0;
    if (p.misses >= 2) {p.level = Math.max(1, p.level - 1); p.misses = 0;}
    return {correct: false, message: unit !== t.unit ? `Gib dein Ergebnis in ${t.unit} an. Rechne gegebenenfalls um.` : 'Prüfe deinen Ansatz und die Einheiten. Du kannst einen Hinweis öffnen und erneut versuchen.'};
  }
  const independent = t.attempts === 1 && !t.hinted;
  t.solved = true; s.completed++; p.completed++; p.misses = 0;
  if (independent) {p.independent++; p.streak++;} else p.streak = 0;
  if (p.streak >= 2) {p.level = Math.min(4, p.level + 1); p.streak = 0;}
  s.history.push({skill: t.skill, level: t.level, independent, attempts: t.attempts, hinted: t.hinted});
  s.history = s.history.slice(-12);
  return {correct: true, message: independent ? 'Geschafft! Du hast diese Aufgabe selbstständig gelöst.' : 'Geschafft! Festige den Ansatz bei der nächsten passenden Aufgabe.'};
}
export function useHint(s) {s.task.hinted = true; s.revision++; s.coach = null; return s.task.hint;}
export function nextTask(s, random = Math.random) {
  if (!s.task.solved) throw new Error('Schließe zuerst die aktuelle Aufgabe ab.');
  const keys = Object.keys(SKILLS);
  if(s.pendingTaskPlan){
    let plan;try{plan=validateTaskPlan(s,s.pendingTaskPlan);}catch{/* Inzwischen geänderte Erfolgsbelege: reguläre Auswahl. */}
    s.pendingTaskPlan=null;
    if(plan){s.task=makeTask(TASK_TEMPLATES[plan.templateId],plan.level,random,plan);s.pendingSkill=null;s.revision++;s.coach=null;return;}
  }
  const skill = s.pendingSkill || [...keys].sort((a, b) => s.skills[a].completed - s.skills[b].completed || s.skills[a].independent - s.skills[b].independent)[0];
  s.pendingSkill = null; s.task = makeTask(skill, s.skills[skill].level, random); s.revision++; s.coach = null;
}
export function publicState(s) {
  const {answer, hint, ...task} = s.task;
  return {version: s.version, revision: s.revision, completed: s.completed, skills: s.skills, history: s.history, task, summary: summary(s)};
}
export function summary(s) {
  if (!s.completed) return 'Beginne mit der ersten Aufgabe. Dein Lernstand ergibt sich Schritt für Schritt.';
  const h = s.history, n = h.filter(x => x.independent).length;
  const weak = Object.keys(SKILLS).sort((a,b) => s.skills[a].independent - s.skills[b].independent)[0];
  return `Bei den letzten ${h.length} abgeschlossenen Aufgaben hast du ${n} im ersten Versuch ohne Hinweis gelöst. Dein nächster Übungsschwerpunkt: ${SKILLS[weak]}. Das ist eine vorläufige Übungsrückmeldung.`;
}
export function coachPacket(s) {
  if (s.completed < 2) throw new Error('Bearbeite zuerst mindestens zwei Aufgaben.');
  const packetId = newId(); s.coach = {packetId, revision: s.revision};
  const evidence = {completed: s.completed, skills: s.skills, recent: s.history};
  return {packetId, prompt: `Du bist ein unterstützender Lerncoach für Physik (gleichförmige Bewegung). Die folgenden Angaben sind vorläufige Übungsbeobachtungen, keine Noten. Verwende nur diese Belege. Keine Diagnosen, Vergleiche mit anderen oder Aussagen zur Intelligenz. Nenne einen belegten Erfolg, einen konkreten Übungsschritt und motiviere sachlich. Gib keine Lösung zur aktuellen Aufgabe. Antworte ausschließlich mit einem JSON-Objekt ohne Markdown. Schema: {"schemaVersion":1,"packetId":"${packetId}","feedback":"höchstens 500 Zeichen","nextFocus":"speed|rearrange|units","challenge":"maintain|support|increase"}. Wähle jeweils genau einen erlaubten Wert; die senkrechten Striche bedeuten Alternativen. Beobachtungen: ${JSON.stringify(evidence)}`};
}
export function applyCoach(s, data) {
  if (!data || data.schemaVersion !== 1 || !s.coach || data.packetId !== s.coach.packetId || s.coach.revision !== s.revision) throw new Error('Die Rückmeldung passt nicht zum aktuellen Lernstand. Erstelle einen neuen Transfer.');
  if (typeof data.feedback !== 'string' || !data.feedback.trim() || data.feedback.length > 500 || !Object.hasOwn(SKILLS, data.nextFocus) || !['maintain', 'support', 'increase'].includes(data.challenge)) throw new Error('Die KI-Antwort hat nicht das erwartete Format.');
  const p = s.skills[data.nextFocus];
  // KI darf höchstens einen Schritt ändern; Aufstieg erfordert lokale Erfolgsbelege.
  if (data.challenge === 'support') p.level = Math.max(1, p.level - 1);
  const proven = s.history.filter(x => x.skill === data.nextFocus && x.independent).reduce((max, x) => Math.max(max, x.level), 0);
  if (data.challenge === 'increase' && p.independent >= 3) p.level = Math.max(p.level, Math.min(4, p.level + 1, proven + 1));
  s.pendingSkill = data.nextFocus; s.coach = null; s.revision++;
  return {feedback: data.feedback.trim(), nextFocus: data.nextFocus};
}
