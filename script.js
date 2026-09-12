const els = {
  content: document.querySelector('#content'),
  status: document.querySelector('#status'),
  nav: document.querySelector('#stageNav'),
  stats: document.querySelector('#heroStats'),
  search: document.querySelector('#searchInput'),
  reset: document.querySelector('#resetSearch'),
};

const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const norm = (value='') => String(value).toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const fieldKind = title => {
  const t = norm(title);
  if (t.includes('stochastik')) return 'stochastik';
  if (t.includes('geometrie')) return 'geometrie';
  if (t.includes('funktion') || t.includes('analysis')) return 'funktionen';
  return 'algebra';
};
const materialHtml = material => `
  <a class="material-link" href="${encodeURI(material.url)}" data-material-title="${esc(material.titel)}">
    <span>${esc(material.titel)}</span><span class="file-type">${esc(material.typ)}</span>
  </a>`;

function render(data) {
  els.stats.innerHTML = [
    `${data.statistik.bereiche} Lernbereiche`,
    `${data.statistik.inhaltsfelder} Inhaltsfelder`,
    `${data.statistik.themen} Themen`,
    `${data.statistik.materialien} Materialien`,
  ].map((x,i) => `<span class="stat-chip">${i === 3 ? '<strong>' + esc(x) + '</strong>' : esc(x)}</span>`).join('');

  els.nav.innerHTML = data.bereiche.map(b => `<button class="stage-button" type="button" data-target="${esc(b.id)}">${esc(b.kurztitel || b.titel)}</button>`).join('');
  els.content.innerHTML = data.bereiche.map(b => {
    const materialCount = b.inhaltsfelder.reduce((sum,f) => sum + f.materialien.length + f.themen.reduce((s,t)=>s+t.materialien.length,0), 0);
    return `<section class="stage-section" id="${esc(b.id)}" data-search="${esc(norm([b.titel,b.stufe].join(' ')))}">
      <div class="stage-heading">
        <div><p class="eyebrow">${esc(b.stufe)}</p><h2>${esc(b.titel)}</h2><p class="stage-meta">${b.inhaltsfelder.length} Inhaltsfelder · ${materialCount} Materialien</p></div>
      </div>
      <div class="field-grid">
        ${b.inhaltsfelder.map(f => `<article class="field-card" data-kind="${fieldKind(f.titel)}" data-search="${esc(norm([b.titel,f.titel,...f.themen.map(t=>t.titel),...f.materialien.map(m=>m.titel),...f.themen.flatMap(t=>t.materialien.map(m=>m.titel))].join(' ')))}">
          <div class="field-top">
            <div class="field-title-row"><h3>${esc(f.titel)}</h3><span class="count-badge">${f.themen.length} Themen</span></div>
            ${f.materialien.length ? `<div class="material-list">${f.materialien.map(materialHtml).join('')}</div>` : ''}
          </div>
          <div class="topic-list">
            ${f.themen.map((t,idx) => `<details class="topic" data-search="${esc(norm([t.titel,...t.materialien.map(m=>m.titel)].join(' ')))}">
              <summary><span class="topic-num">${String(idx+1).padStart(2,'0')}</span><span class="topic-title">${esc(t.titel)}</span><span class="topic-chevron" aria-hidden="true">›</span></summary>
              <div class="topic-materials">${t.materialien.length ? `<div class="material-list">${t.materialien.map(materialHtml).join('')}</div>` : '<p class="empty-note">Noch kein Material abgelegt.</p>'}</div>
            </details>`).join('')}
          </div>
        </article>`).join('')}
      </div>
    </section>`;
  }).join('');
  els.status.textContent = `Stand ${data.stand} · ${data.statistik.materialien} Materialien verfügbar.`;
  els.content.hidden = false;
}

function applySearch() {
  const q = norm(els.search.value.trim());
  let visibleFields = 0;
  document.querySelectorAll('.field-card').forEach(card => {
    const own = card.dataset.search || '';
    const match = !q || own.includes(q);
    card.classList.toggle('search-hidden', !match);
    if (match) {
      visibleFields++;
      if (q) card.querySelectorAll('.topic').forEach(topic => {
        if ((topic.dataset.search || '').includes(q)) topic.open = true;
      });
    }
  });
  document.querySelectorAll('.stage-section').forEach(section => {
    const hasField = section.querySelector('.field-card:not(.search-hidden)');
    section.classList.toggle('search-hidden', !hasField);
  });
  els.status.textContent = q ? `${visibleFields} passende Inhaltsfelder für „${els.search.value.trim()}“.` : els.status.dataset.default || els.status.textContent;
}

async function init() {
  try {
    const response = await fetch('data.json', {cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    render(data);
    els.status.dataset.default = els.status.textContent;
    els.nav.addEventListener('click', e => {
      const button = e.target.closest('[data-target]');
      if (!button) return;
      document.getElementById(button.dataset.target)?.scrollIntoView({behavior:'smooth', block:'start'});
    });
    els.search.addEventListener('input', applySearch);
    els.reset.addEventListener('click', () => { els.search.value=''; applySearch(); els.search.focus(); });
  } catch (error) {
    els.status.innerHTML = '<strong>Die Materialliste konnte nicht geladen werden.</strong><br>Starte die Seite über <code>START_LOKAL.bat</code> oder einen lokalen Webserver; direktes Öffnen per <code>file://</code> wird von Browsern häufig blockiert.';
    console.error(error);
  }
}
init();
