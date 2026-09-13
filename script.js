const page = document.body.dataset.page || 'home';

const esc = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

const norm = (value = '') => String(value)
  .toLocaleLowerCase('de')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const fieldKind = title => {
  const text = norm(title);
  if (text.includes('stochastik') || text.includes('wahrscheinlichkeit') || text.includes('daten')) return 'statistics';
  if (text.includes('geometrie') || text.includes('vektor') || text.includes('lineare algebra')) return 'geometry';
  if (text.includes('funktion') || text.includes('analysis')) return 'functions';
  return 'algebra';
};

const materialCount = area => area.inhaltsfelder.reduce((sum, field) => (
  sum + field.materialien.length + field.themen.reduce((topicSum, topic) => topicSum + topic.materialien.length, 0)
), 0);

const materialHtml = (material, accentContext = '') => `
  <a class="material-link" href="${encodeURI(material.url)}" ${accentContext}>
    <span>${esc(material.titel)}</span><span class="file-type">${esc(material.typ)}</span>
  </a>`;

const statChips = items => items.map((item, index) => (
  `<span class="stat-chip">${index === items.length - 1 ? `<strong>${esc(item)}</strong>` : esc(item)}</span>`
)).join('');

function courseGroup(area) {
  const stage = norm(area.stufe);
  if (stage.includes('sekundarstufe ii')) return 'Sekundarstufe II';
  if (stage.includes('erprobungsstufe')) return 'Sekundarstufe I · Erprobungsstufe';
  return 'Sekundarstufe I';
}

function renderHome(data) {
  const content = document.querySelector('#content');
  const status = document.querySelector('#status');
  const stats = document.querySelector('#heroStats');

  stats.innerHTML = statChips([
    `${data.statistik.bereiche} Klassen & Kurse`,
    `${data.statistik.inhaltsfelder} Inhaltsfelder`,
    `${data.statistik.materialien} Materialien`
  ]);

  const groups = new Map();
  data.bereiche.forEach(area => {
    const group = courseGroup(area);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(area);
  });

  content.innerHTML = [...groups.entries()].map(([group, areas]) => `
    <section class="course-group" aria-labelledby="${esc(norm(group).replace(/\s+/g, '-'))}">
      <div class="group-heading">
        <div>
          <p class="eyebrow">Kursauswahl</p>
          <h2 id="${esc(norm(group).replace(/\s+/g, '-'))}">${esc(group)}</h2>
          <p>${areas.length} ${areas.length === 1 ? 'Kurs' : 'Klassen / Kurse'}</p>
        </div>
      </div>
      <div class="course-grid">
        ${areas.map(area => `
          <a class="course-card" href="kurs.html?kurs=${encodeURIComponent(area.id)}" data-course-link>
            <div>
              <span class="course-label">${esc(area.stufe)}</span>
              <h3>${esc(area.kurztitel || area.titel)}</h3>
              <p class="course-meta">${area.inhaltsfelder.length} Inhaltsfelder mit klarer Themenstruktur</p>
            </div>
            <div class="course-bottom">
              <div class="course-counts">
                <span class="mini-chip">${area.inhaltsfelder.length} Bereiche</span>
                <span class="mini-chip">${materialCount(area)} Materialien</span>
              </div>
              <span class="course-arrow" aria-hidden="true">→</span>
            </div>
          </a>`).join('')}
      </div>
    </section>`).join('');

  status.textContent = `Stand ${data.stand} · Bitte Klasse oder Kurs auswählen.`;
  content.hidden = false;

  document.querySelectorAll('[data-course-link]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.querySelectorAll('.course-card.is-selected').forEach(card => card.classList.remove('is-selected'));
      link.classList.add('is-selected');
      const target = link.href;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => { window.location.href = target; }, reduced ? 0 : 210);
    });
  });
}

function renderCourse(data) {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('kurs');
  const area = data.bereiche.find(item => item.id === courseId);
  const content = document.querySelector('#content');
  const status = document.querySelector('#status');

  if (!area) {
    document.querySelector('#courseTitle').textContent = 'Kurs nicht gefunden';
    document.querySelector('#courseSubtitle').textContent = 'Bitte wähle einen gültigen Kurs aus.';
    document.querySelector('#fieldNav').innerHTML = '';
    content.innerHTML = '<div class="error-panel"><strong>Dieser Kurs ist nicht vorhanden.</strong><br><a href="index.html">Zur Klassen- und Kursauswahl</a></div>';
    content.hidden = false;
    status.textContent = '';
    return;
  }

  document.title = `${area.titel} – Mathematik NRW`;
  document.querySelector('#courseStage').textContent = area.stufe;
  document.querySelector('#courseTitle').textContent = area.titel;
  document.querySelector('#courseSubtitle').textContent = 'Inhaltsfelder, Themen und Materialien';
  document.querySelector('#heroStats').innerHTML = statChips([
    `${area.inhaltsfelder.length} Inhaltsfelder`,
    `${area.inhaltsfelder.reduce((sum, field) => sum + field.themen.length, 0)} Themen`,
    `${materialCount(area)} Materialien`
  ]);

  const fieldNav = document.querySelector('#fieldNav');
  fieldNav.innerHTML = area.inhaltsfelder.map(field => `
    <button class="field-jump" type="button" data-field-target="field-${esc(field.id)}" data-kind="${fieldKind(field.titel)}">
      ${esc(field.titel)}
    </button>`).join('');

  content.innerHTML = area.inhaltsfelder.map(field => {
    const kind = fieldKind(field.titel);
    const topicMaterials = field.themen.reduce((sum, topic) => sum + topic.materialien.length, 0);
    const totalFieldMaterials = field.materialien.length + topicMaterials;
    const searchText = norm([
      field.titel,
      ...field.materialien.map(item => item.titel),
      ...field.themen.map(topic => topic.titel),
      ...field.themen.flatMap(topic => topic.materialien.map(item => item.titel))
    ].join(' '));

    return `
      <details class="field-card" id="field-${esc(field.id)}" data-kind="${kind}" data-search="${esc(searchText)}">
        <summary class="field-summary">
          <span class="field-accent" aria-hidden="true"></span>
          <span>
            <h2>${esc(field.titel)}</h2>
            <p>${field.themen.length} Themen · ${totalFieldMaterials} ${totalFieldMaterials === 1 ? 'Material' : 'Materialien'}</p>
          </span>
          <span class="count-badge">${field.themen.length} Themen</span>
          <span class="field-chevron" aria-hidden="true">›</span>
        </summary>
        <div class="field-body">
          ${field.materialien.length ? `
            <section class="field-materials" aria-label="Materialien zu ${esc(field.titel)}">
              <p class="field-materials-title">Übergreifendes Material</p>
              <div class="material-list">${field.materialien.map(item => materialHtml(item)).join('')}</div>
            </section>` : ''}
          <ol class="topic-list">
            ${field.themen.map((topic, index) => `
              <li class="topic" data-search="${esc(norm([topic.titel, ...topic.materialien.map(item => item.titel)].join(' ')))}">
                <span class="topic-num">${String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p class="topic-title">${esc(topic.titel)}</p>
                  ${topic.materialien.length
                    ? `<div class="material-list">${topic.materialien.map(item => materialHtml(item)).join('')}</div>`
                    : '<p class="empty-note">Noch kein Material zu diesem Thema abgelegt.</p>'}
                </div>
              </li>`).join('')}
          </ol>
        </div>
      </details>`;
  }).join('');

  status.textContent = `Stand ${data.stand} · ${materialCount(area)} Materialien in ${area.titel}.`;
  status.dataset.default = status.textContent;
  content.hidden = false;

  setupFieldNavigation();
  setupSearch();
}

function setupFieldNavigation() {
  const buttons = [...document.querySelectorAll('[data-field-target]')];
  const cards = [...document.querySelectorAll('.field-card')];

  const select = (button, card) => {
    buttons.forEach(item => item.classList.toggle('is-selected', item === button));
    cards.forEach(item => item.classList.remove('is-selected'));
    card.open = true;
    card.classList.add('is-selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => card.classList.remove('is-selected'), 650);
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const card = document.getElementById(button.dataset.fieldTarget);
      if (card) select(button, card);
    });
  });

  cards.forEach(card => {
    card.addEventListener('toggle', () => {
      if (!card.open) return;
      const button = buttons.find(item => item.dataset.fieldTarget === card.id);
      buttons.forEach(item => item.classList.toggle('is-selected', item === button));
      card.classList.remove('is-selected');
      void card.offsetWidth;
      card.classList.add('is-selected');
      window.setTimeout(() => card.classList.remove('is-selected'), 650);
    });
  });
}

function setupSearch() {
  const search = document.querySelector('#searchInput');
  const reset = document.querySelector('#resetSearch');
  const status = document.querySelector('#status');

  const apply = () => {
    const query = norm(search.value.trim());
    let visibleFields = 0;
    let visibleTopics = 0;

    document.querySelectorAll('.field-card').forEach(card => {
      const cardMatches = !query || (card.dataset.search || '').includes(query);
      card.classList.toggle('search-hidden', !cardMatches);
      if (!cardMatches) return;
      visibleFields++;

      const topics = [...card.querySelectorAll('.topic')];
      topics.forEach(topic => {
        const topicMatches = !query || (topic.dataset.search || '').includes(query);
        topic.classList.toggle('search-hidden', !topicMatches);
        if (topicMatches) visibleTopics++;
      });

      if (query) card.open = true;
    });

    document.querySelectorAll('.field-jump').forEach(button => {
      const card = document.getElementById(button.dataset.fieldTarget);
      button.classList.toggle('search-hidden', !!card?.classList.contains('search-hidden'));
    });

    status.textContent = query
      ? `${visibleFields} Inhaltsfelder · ${visibleTopics} passende Themen für „${search.value.trim()}“.`
      : status.dataset.default;
  };

  search.addEventListener('input', apply);
  reset.addEventListener('click', () => {
    search.value = '';
    apply();
    search.focus();
  });
}

async function init() {
  const status = document.querySelector('#status');
  try {
    const response = await fetch('data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (page === 'course') renderCourse(data);
    else renderHome(data);
  } catch (error) {
    if (status) {
      status.innerHTML = '<strong>Die Materialliste konnte nicht geladen werden.</strong><br>Starte die Seite über einen Webserver; direktes Öffnen per <code>file://</code> wird von Browsern häufig blockiert.';
    }
    console.error(error);
  }
}

init();
