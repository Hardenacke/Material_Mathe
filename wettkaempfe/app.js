import {config} from './config.js';

const $ = id => document.getElementById(id);
const number = value => new Intl.NumberFormat('de-DE').format(value);
const date = value => new Intl.DateTimeFormat('de-DE', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin'}).format(value);
const state = {code: '', group: '', competitions: [], competition: null, period: null,
  attempt: null, busy: false, recovering: false, serverTime: Date.now(), receivedAt: performance.now(),
  signature: '', pending: null, pollTimer: null, timeoutRefresh: false, generation: 0};
let apiBase = '';
try {
  if (config.apiBaseUrl) {
    const url = new URL(config.apiBaseUrl);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) throw new Error();
    apiBase = url.origin;
  }
} catch { apiBase = ''; }

function element(tag, text, className) {
  const node = document.createElement(tag); if (text !== undefined) node.textContent = text;
  if (className) node.className = className; return node;
}
function notice(message = '', error = false) {
  $('notice').textContent = message; $('notice').hidden = !message;
  $('notice').classList.toggle('error', error);
}
function rich(container, segments) {
  for (const segment of segments || []) {
    const span = document.createElement('span');
    if (segment.type === 'math' && window.katex) {
      try { window.katex.render(segment.value, span, {trust: false, throwOnError: false, strict: 'warn', maxExpand: 1000}); }
      catch { span.textContent = segment.value; }
    } else span.textContent = segment.value;
    container.appendChild(span);
  }
}
async function request(path, {body, requestId, code = state.code} = {}) {
  const started = performance.now();
  let response;
  try {
    response = await fetch(apiBase + path, {method: body === undefined ? 'GET' : 'POST',
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000),
      headers: {'Authorization': 'Bearer ' + code, ...(body === undefined ? {} : {'Content-Type': 'application/json', 'Idempotency-Key': requestId})},
      ...(body === undefined ? {} : {body: JSON.stringify(body)})});
  } catch { throw new Error('Die Verbindung ist unterbrochen. Bitte erneut laden. Dein Spielstand bleibt gespeichert; eine geöffnete Frage läuft weiter.'); }
  let data;
  try { data = await response.json(); } catch { throw new Error('Der Wettbewerb ist gerade nicht erreichbar. Bitte erneut versuchen.'); }
  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) state.pending = null;
    const error = new Error(data.error?.message || 'Bitte erneut versuchen.'); error.status = response.status; throw error;
  }
  if (Number.isFinite(data.serverNow)) {
    state.serverTime = data.serverNow + (performance.now() - started) / 2;
    state.receivedAt = performance.now();
  }
  return data;
}
function path() {
  return `/api/v1/competitions/${state.competition.id}/versions/${state.competition.version}/periods/${state.period.id}`;
}
async function mutate(target, body = {}) {
  const signature = target + JSON.stringify(body);
  if (state.pending?.signature !== signature) state.pending = {signature, id: crypto.randomUUID()};
  const result = await request(target, {body, requestId: state.pending.id});
  state.pending = null; return result;
}
function mode(competition) {
  return competition.season.kind === 'calendar-month' ? 'Monatswertung'
    : competition.schedule.endsAt ? 'Klassenwettbewerb' : 'Dauerwertung';
}
async function perform(action) {
  if (state.busy) return;
  state.busy = true; notice(); renderGame(); $('login-button').disabled = true;
  for (const id of ['logout', 'back', 'refresh-catalog']) $(id).disabled = true;
  try { await action(); }
  catch (error) { notice(error.message, true); if (error.status === 401 && state.code) logout(false); }
  finally {
    state.busy = false; $('login-button').disabled = !apiBase;
    for (const id of ['logout', 'back', 'refresh-catalog']) $(id).disabled = false;
    renderGame();
  }
}
function renderCatalog() {
  const root = $('competitions'); root.replaceChildren();
  if (!state.competitions.length) root.append(element('p', 'Für diesen Zugang ist noch kein Wettbewerb freigegeben.', 'panel'));
  for (const competition of state.competitions) {
    const button = element('button', undefined, 'competition-card');
    button.append(element('span', mode(competition), 'eyebrow'), element('strong', competition.title),
      element('small', `Klasse ${competition.grade} · ${Object.values(competition.selection.counts).reduce((a, b) => a + b, 0)} Fragen${competition.demo ? ' · Proberunde' : ''}`),
      element('span', competition.availability === 'pending' ? 'Beginn: ' + date(Date.parse(competition.schedule.startsAt))
        : competition.availability === 'closed' ? 'Wertung ansehen →' : 'Zum Wettbewerb →', 'card-action'));
    button.addEventListener('click', () => perform(() => selectCompetition(competition)));
    root.appendChild(button);
  }
}
function addAction(root, label, action, {quiet = false, disabled = false} = {}) {
  const button = element('button', label, quiet ? 'quiet skip' : 'game-action');
  button.disabled = state.busy || state.recovering || disabled;
  button.addEventListener('click', () => perform(action)); root.appendChild(button); return button;
}
function renderGame() {
  if (!state.competition) return;
  const a = state.attempt, c = state.competition;
  const signature = JSON.stringify([a, c.availability, state.busy, state.recovering, navigator.onLine]);
  if (signature === state.signature) return; state.signature = signature;
  const root = $('game'); root.replaceChildren();
  $('score').textContent = number(a?.score || 0); $('lives').textContent = a?.lives ?? c.rules.lives;
  $('progress').textContent = `${a?.answered || 0} / ${a?.totalQuestions || Object.values(c.selection.counts).reduce((x, y) => x + y, 0)}`;
  $('timer-wrap').hidden = !a?.question;
  if (!a) {
    root.append(element('h3', 'Deine nächste Runde wartet.'), element('p', `Für jede richtige Antwort gibt es Punkte. Je schneller du richtig antwortest, desto höher ist dein Zeitbonus. Eine falsche oder zu späte Antwort kostet ein Leben.`));
    if (c.availability !== 'open') root.append(element('p', c.availability === 'pending' ? 'Beginn: ' + date(Date.parse(c.schedule.startsAt)) : 'Das Teilnahmefenster ist geschlossen.', 'muted'));
    addAction(root, 'Versuch starten', start, {disabled: c.availability !== 'open'}); return;
  }
  if (a.feedback) {
    const feedback = element('div', undefined, 'feedback' + (a.feedback.correct ? ' correct' : ''));
    feedback.append(element('strong', a.feedback.correct ? `Richtig! +${number(a.feedback.awarded)} Punkte`
      : a.feedback.timedOut ? 'Die Zeit ist abgelaufen. Ein Leben weniger.' : 'Diese Antwort war leider falsch. Ein Leben weniger.'));
    const explanation = element('p'); rich(explanation, a.feedback.explanation); feedback.appendChild(explanation); root.appendChild(feedback);
  }
  if (a.phase === 'finished') {
    root.append(element('h3', 'Versuch beendet'), element('p', number(a.score) + ' Punkte', 'finish-score'),
      element('p', `${a.correctAnswers} von ${a.totalQuestions} Fragen richtig beantwortet. Dein bester beendeter Versuch zählt für die Rangliste.`, 'muted'));
    if (c.availability === 'open' && (c.attempts.maxPerPeriod === null || c.attempts.maxPerPeriod > 1))
      addAction(root, 'Neuen Versuch starten', start);
    addAction(root, 'Spielstand neu laden', refresh, {quiet: true}); return;
  }
  if (!a.question) {
    root.append(element('p', `Du kannst zwischen den Fragen pausieren. Dein Versuch endet spätestens am ${date(a.hardEnd)}.`, 'muted'));
    addAction(root, 'Nächste Frage öffnen', async () => { await mutate(`${path()}/attempts/${a.id}/next`); await refresh(); });
    return;
  }
  const q = a.question;
  root.appendChild(element('p', `Frage ${q.number} · ${q.difficulty === 'basis' ? 'Basis' : q.difficulty === 'aufbau' ? 'Aufbau' : 'Knifflig'}`, 'eyebrow'));
  const heading = element('h3', undefined, 'question-title'); rich(heading, q.prompt); root.appendChild(heading);
  if (q.figure && /^assets\/[a-zA-Z0-9/_-]+\.svg$/.test(q.figure.src) && !q.figure.src.includes('..')) {
    const img = element('img', undefined, 'question-figure'); img.src = q.figure.src; img.alt = q.figure.alt; root.appendChild(img);
  }
  const choices = element('div', undefined, 'choices');
  for (const choice of q.choices) {
    const button = element('button', undefined, 'choice'); rich(button, choice.content);
    button.disabled = state.busy || state.recovering || !navigator.onLine;
    button.addEventListener('click', () => perform(async () => {
      await mutate(`${path()}/attempts/${a.id}/answer`, {questionId: q.id, answerId: choice.id}); await refresh();
    })); choices.appendChild(button);
  }
  root.appendChild(choices);
  addAction(root, 'Frage überspringen · ein Leben abgeben', async () => {
    await mutate(`${path()}/attempts/${a.id}/answer`, {questionId: q.id, answerId: null}); await refresh();
  }, {quiet: true});
  renderTimer();
}
function renderTimer() {
  const question = state.attempt?.question; if (!question) return;
  const now = state.serverTime + performance.now() - state.receivedAt;
  const remaining = Math.max(0, (question.deadline - now) / 1000);
  $('timer').textContent = Math.ceil(remaining) + ' s'; $('timer').classList.toggle('urgent', remaining <= 10);
  $('time-progress').max = state.competition.rules.questionTimeSeconds; $('time-progress').value = remaining;
  if (remaining === 0 && !state.timeoutRefresh && !state.busy && !document.hidden) {
    state.timeoutRefresh = true; state.recovering = true; renderGame();
    refresh().catch(error => notice(error.message, true)).finally(() => {state.recovering = false; renderGame();});
  }
}
async function refresh() {
  if (!state.competition || !state.code) return;
  const currentPath = path(), generation = state.generation;
  const results = await Promise.allSettled([request(currentPath + '/attempts/current'), request(currentPath + '/leaderboard')]);
  if (generation !== state.generation || !state.competition) return;
  if (results[0].status === 'fulfilled') {
    state.attempt = results[0].value.attempt;
    if (!state.attempt?.question) state.timeoutRefresh = false;
    renderGame();
  }
  if (results[1].status === 'fulfilled') {
    const data = results[1].value, root = $('leaderboard'); root.replaceChildren();
    for (const row of data.leaderboard) {
      const li = element('li'); li.append(element('span', row.rank + '.', 'rank'), element('span', row.alias), element('strong', number(row.score))); root.appendChild(li);
    }
    $('board-empty').hidden = data.leaderboard.length > 0;
    $('personal-best').textContent = data.ownBest ? number(data.ownBest.score) : '—';
    $('archive-notice').hidden = data.archiveState !== 'pending';
  }
  const failure = results.find(result => result.status === 'rejected');
  if (failure) throw failure.reason;
  // Nach Verbindungsproblemen den aktuellen Serverstand zur Entscheidung verwenden.
  state.pending = null;
  schedulePoll();
}
async function start() {
  // Vor einem neuen Versuch das aktuelle Teilnahmefenster und den Monat ermitteln.
  const metadata = await request(`/api/v1/competitions/${state.competition.id}/versions/${state.competition.version}`);
  state.competition = metadata; state.period = metadata.period; updateCompetitionHeading();
  await mutate(path() + '/attempts'); await refresh();
}
function updateCompetitionHeading() {
  const c = state.competition;
  $('competition-title').textContent = c.title; $('mode').textContent = mode(c) + (c.demo ? ' · Proberunde' : '');
  $('rules').textContent = `${c.rules.lives} Leben · ${c.rules.questionTimeSeconds} Sekunden pro Frage · bis zu ${number(c.rules.basePoints + c.rules.timeBonus)} Punkte je richtiger Antwort`;
  $('period').textContent = state.period.id === 'gesamt' ? 'Gesamtwertung' : new Intl.DateTimeFormat('de-DE', {month: 'long', year: 'numeric', timeZone: 'Europe/Berlin'}).format(Date.parse(state.period.id + '-15T12:00:00Z'));
}
async function selectCompetition(competition) {
  state.generation++; state.competition = competition; state.period = competition.period; state.attempt = null; state.signature = '';
  $('catalog-panel').hidden = true; $('competition-panel').hidden = false; updateCompetitionHeading(); renderGame();
  const url = new URL(location.href); url.searchParams.set('wettkampf', competition.id); history.replaceState(null, '', url);
  await refresh(); $('competition-title').focus();
}
function schedulePoll() {
  clearTimeout(state.pollTimer);
  if (state.code && state.competition) state.pollTimer = setTimeout(async () => {
    if (!document.hidden && !state.busy) {
      try { await refresh(); } catch (error) { notice(error.message, true); }
    }
    schedulePoll();
  }, Math.max(5, config.pollingSeconds) * 1000);
}
async function loadCatalog() {
  const data = await request('/api/v1/catalog?groupId=' + encodeURIComponent(state.group));
  state.competitions = data.competitions; $('alias').textContent = data.alias;
  renderCatalog(); return data;
}
function logout(showNotice = true) {
  state.generation++; state.code = ''; state.competition = null; state.attempt = null; state.pending = null;
  clearTimeout(state.pollTimer); $('code').value = '';
  $('login-panel').hidden = false; $('session').hidden = true; $('catalog-panel').hidden = true; $('competition-panel').hidden = true; $('formats').hidden = false;
  if (showNotice) notice('Du bist abgemeldet. Dein Spielstand bleibt gespeichert.');
}
$('login-form').addEventListener('submit', event => {
  event.preventDefault(); if (!apiBase) return;
  perform(async () => {
    state.group = $('group').value.trim(); state.code = $('code').value.trim();
    try { await loadCatalog(); } catch (error) { state.code = ''; throw error; }
    $('code').value = ''; $('login-panel').hidden = true; $('session').hidden = false; $('catalog-panel').hidden = false; $('formats').hidden = true;
    try { sessionStorage.setItem(config.storageNamespace + ':group', state.group); } catch { /* Speicherung ist optional. */ }
    const desired = new URL(location.href).searchParams.get('wettkampf');
    const selected = state.competitions.find(c => c.id === desired); if (selected) await selectCompetition(selected);
  });
});
$('logout').addEventListener('click', () => logout());
$('back').addEventListener('click', () => {
  state.generation++; state.competition = null; state.attempt = null; state.pending = null; clearTimeout(state.pollTimer);
  $('competition-panel').hidden = true; $('catalog-panel').hidden = false; notice();
  const url = new URL(location.href); url.searchParams.delete('wettkampf'); history.replaceState(null, '', url);
});
$('refresh-catalog').addEventListener('click', () => perform(loadCatalog));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.competition && !state.busy) {
    state.recovering = true; renderGame();
    perform(refresh).finally(() => {state.recovering = false; renderGame();});
  }
});
window.addEventListener('offline', () => {notice('Du bist offline. Eine geöffnete Frage läuft weiter. Dein gespeicherter Stand bleibt erhalten.', true); renderGame();});
window.addEventListener('online', () => { if (state.competition) perform(refresh); });
setInterval(renderTimer, 200);
try { $('group').value = sessionStorage.getItem(config.storageNamespace + ':group') || ''; } catch { /* Keine Pflichtabhängigkeit. */ }
if (!apiBase) { $('login-button').disabled = true; notice('Die Wettbewerbe werden vorbereitet. Deine Lehrkraft informiert dich, sobald du teilnehmen kannst.'); }
