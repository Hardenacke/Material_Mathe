const catalogRoot = document.getElementById("catalog");
const summaryRoot = document.getElementById("summary");
const searchInput = document.getElementById("search");

let catalogData = null;
let route = [];
let navigationTimer = null;

const methodTheme = { accent: "#0f766e", accentDark: "#115e59", accentSoft: "#ccfbf1" };
const materialKinds = [
  { id: "lernpfade", title: "Lernpfade", icon: "↗", description: "Schritt für Schritt neue Zusammenhänge entdecken." },
  { id: "simulationen", title: "Simulationen", icon: "◉", description: "Ausprobieren, verändern und Zusammenhänge beobachten." },
  { id: "pruefungsvorbereitung", title: "Prüfungsvorbereitung", icon: "✓", description: "Gezielt für Klassenarbeiten und Prüfungen üben." },
  { id: "lernspiele", title: "Lernspiele", icon: "◆", description: "Mathematik spielerisch erkunden und üben." },
  { id: "wiederholung", title: "Wiederholung", icon: "↻", description: "Wichtiges Wissen auffrischen und festigen." },
  { id: "zusatzaufgaben", title: "Zusatzaufgaben", icon: "+", description: "Knobeln, schätzen, modellieren und weiterdenken." },
  { id: "videos", title: "Erklärvideos", icon: "▷", description: "Erklärungen ansehen und in eigenem Tempo lernen." },
  { id: "unterstuetzung", title: "Unterstützung", icon: "?", description: "Erklärungen und Vorlagen für deinen Lernweg." },
  { id: "interaktiv", title: "Interaktive Materialien", icon: "◇", description: "Digitale Aufgaben und Entdeckungen zum Mitmachen." },
  { id: "dateien", title: "Weitere Materialien", icon: "≡", description: "Arbeitsblätter, Präsentationen und weitere Dateien." }
];

function normalize(value) {
  return String(value || "").toLocaleLowerCase("de-DE").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function fieldTheme(field) {
  const text = normalize(field.titel);
  if (/stochastik|wahrscheinlichkeit|daten/.test(text)) return { accent: "#eab308", accentDark: "#634d00", accentSoft: "#fff7cc" };
  if (/geometrie|vektor|lineare algebra/.test(text)) return { accent: "#a855f7", accentDark: "#5b1b92", accentSoft: "#f4e8ff" };
  return { accent: "#6d28d9", accentDark: "#3b176e", accentSoft: "#f0e8ff" };
}

function applyTheme(element, theme) {
  if (!theme) return element;
  element.style.setProperty("--topic-accent", theme.accent);
  element.style.setProperty("--card-accent", theme.accent);
  element.style.setProperty("--topic-accent-dark", theme.accentDark);
  element.style.setProperty("--topic-accent-soft", theme.accentSoft);
  return element;
}

function materialText(material) {
  return `${material.titel} ${material.typ} ${material.kategorie || ""} ${material.datei} ${material.beschreibung || ""} ${(material.kompetenzen || []).join(" ")}`;
}

function matches(text, query) {
  return !query || normalize(text).includes(normalize(query));
}

function fieldEntries(field) {
  return [
    ...(field.materialien || []).map((material) => ({ material, context: "Zum gesamten Themenbereich" })),
    ...(field.themen || []).flatMap((topic) => (topic.materialien || []).map((material) => ({ material, context: topic.titel })))
  ];
}

function sharedEntries(area, key) {
  return (area[key] || []).map((material) => ({ material, context: `Für den ganzen Kurs · ${area.kurztitel || area.titel}`, shared: true }));
}

function fieldExtraEntries(area, field) {
  return (area.zusatzaufgaben || [])
    .filter((material) => (material.inhaltsfelder || []).includes(field.id))
    .map((material) => ({ material, context: `Fermi-Aufgaben · ${material.jahrgang || area.kurztitel || area.titel} · ${field.titel}` }));
}

function materialKind(material) {
  const category = normalize(`${material.kategorie || ""} ${material.typ || ""}`);
  const name = normalize(`${material.titel} ${material.datei}`);
  if (/prufung|abitur|klausur/.test(category) || /abi_|abitur|prufungsvorbereitung/.test(name)) return "pruefungsvorbereitung";
  if (/lernpfad/.test(category)) return "lernpfade";
  if (/simulation/.test(`${category} ${name}`)) return "simulationen";
  if (/lernspiel/.test(category)) return "lernspiele";
  if (/wiederholung/.test(`${category} ${name}`)) return "wiederholung";
  if (/zusatz|fermi/.test(category)) return "zusatzaufgaben";
  if (/video/.test(category)) return "videos";
  if (/unterstutzung/.test(category)) return "unterstuetzung";
  if (/html|interaktiv/.test(category)) return "interaktiv";
  return "dateien";
}

function fieldText(field, area) {
  const entries = [...fieldEntries(field), ...(area ? fieldExtraEntries(area, field) : [])];
  return `${field.titel} ${(field.themen || []).map((topic) => topic.titel).join(" ")} ${entries.map(({ material }) => materialText(material)).join(" ")}`;
}

function areaOwnText(area) {
  return `${area.titel} ${area.kurztitel || ""} ${area.stufe || ""}`;
}

function areaText(area) {
  return `${areaOwnText(area)} ${area.inhaltsfelder.map((field) => fieldText(field, area)).join(" ")} ${[...sharedEntries(area, "unterstuetzung"), ...sharedEntries(area, "zusatzaufgaben")].map(({ material }) => materialText(material)).join(" ")}`;
}

function methodEntries(stage, topic = null) {
  if (topic) return (topic.materialien || []).map((material) => ({ material, context: topic.titel }));
  return [
    ...(stage.materialien || []).map((material) => ({ material, context: stage.titel })),
    ...(stage.themen || []).flatMap((item) => methodEntries(stage, item))
  ];
}

function methodStageText(stage) {
  return `${stage.titel} ${(stage.themen || []).map((topic) => topic.titel).join(" ")} ${methodEntries(stage).map(({ material }) => materialText(material)).join(" ")}`;
}

function hashFor(parts, query = searchInput.value.trim()) {
  return `#/${parts.map(encodeURIComponent).join("/")}${query ? `?q=${encodeURIComponent(query)}` : ""}`;
}

function parseHash() {
  const [path, ...queryParts] = window.location.hash.replace(/^#\/?/, "").split("?");
  try {
    route = path.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    route = ["unbekannt"];
  }
  searchInput.value = new URLSearchParams(queryParts.join("?")).get("q") || "";
}

function createNavLink(className, label, parts, theme) {
  const link = createText("a", `${className} nav-link`, label);
  link.href = hashFor(parts);
  link.dataset.feedback = "true";
  return applyTheme(link, theme);
}

function createCard({ title, description, meta, parts, theme, icon, kicker }) {
  const card = createNavLink("topic-button", "", parts, theme);
  if (icon) {
    const symbol = createText("span", "category-icon", icon);
    symbol.setAttribute("aria-hidden", "true");
    card.appendChild(symbol);
  }
  if (kicker) card.appendChild(createText("span", "card-kicker", kicker));
  card.appendChild(createText("span", "topic-title", title));
  if (description) card.appendChild(createText("span", "topic-description", description));
  if (meta) card.appendChild(createText("span", "card-meta", meta));
  card.appendChild(createText("span", "card-action", "Öffnen →"));
  return card;
}

function renderHeader(step, title, description, theme) {
  const header = document.createElement("section");
  header.className = "view-header";
  applyTheme(header, theme);
  header.appendChild(createText("p", "step-label", `Schritt ${step} von 4`));
  const heading = createText("h2", "", title);
  heading.id = "view-title";
  heading.tabIndex = -1;
  header.appendChild(heading);
  header.appendChild(createText("p", "view-copy", description));
  catalogRoot.appendChild(header);
  document.title = `${title} · Mathematiksammlung`;
}

function renderNavigation(crumbs, step) {
  const panel = document.createElement("div");
  panel.className = "navigation-panel";
  const top = document.createElement("div");
  top.className = "navigation-top";
  const parent = crumbs[crumbs.length - 2];
  if (parent) top.appendChild(createNavLink("back-button", "← Zurück", parent.parts));
  const breadcrumb = document.createElement("nav");
  breadcrumb.className = "breadcrumb";
  breadcrumb.setAttribute("aria-label", "Navigationspfad");
  crumbs.forEach((crumb, index) => {
    if (index) {
      const separator = createText("span", "crumb-separator", "/");
      separator.setAttribute("aria-hidden", "true");
      breadcrumb.appendChild(separator);
    }
    if (index === crumbs.length - 1) {
      const current = createText("span", "crumb-current", crumb.title);
      current.setAttribute("aria-current", "page");
      breadcrumb.appendChild(current);
    } else {
      breadcrumb.appendChild(createNavLink("crumb-button", crumb.title, crumb.parts));
    }
  });
  top.appendChild(breadcrumb);
  panel.appendChild(top);
  const journey = document.createElement("ol");
  journey.className = "journey";
  journey.setAttribute("aria-label", "Dein Weg zum Material");
  const labels = route[0] === "methoden"
    ? ["Kurswahl", "Methoden", "Methodenthema", "Material"]
    : ["Kurswahl", "Themenbereich", "Materialart", "Material"];
  labels.forEach((label, index) => {
    const item = document.createElement("li");
    item.className = index + 1 === step ? "is-current" : index + 1 < step ? "is-complete" : "";
    if (index + 1 === step) item.setAttribute("aria-current", "step");
    const content = index + 1 < step && crumbs[index]
      ? createNavLink("journey-link", "", crumbs[index].parts)
      : document.createElement("span");
    const number = createText("span", "journey-number", String(index + 1));
    number.setAttribute("aria-hidden", "true");
    content.append(number, document.createTextNode(label));
    item.appendChild(content);
    journey.appendChild(item);
  });
  panel.appendChild(journey);
  catalogRoot.appendChild(panel);
}

function renderEmpty(message) {
  const empty = createText("p", "empty-state", message);
  if (searchInput.value) {
    const clear = createText("button", "clear-search", "Suche zurücksetzen");
    clear.type = "button";
    clear.addEventListener("click", () => {
      searchInput.value = "";
      updateSearch();
      searchInput.focus();
    });
    empty.appendChild(clear);
  }
  catalogRoot.appendChild(empty);
}

function appendGrid(cards) {
  const grid = document.createElement("div");
  grid.className = "topic-grid";
  cards.forEach((card) => grid.appendChild(createCard(card)));
  catalogRoot.appendChild(grid);
}

function renderHome(query) {
  renderNavigation([{ title: "Klassen und Kurse", parts: [] }], 1);
  renderHeader(1, "Klasse oder Kurs auswählen", "Dein Weg zum Material: Wähle einen Kurs, dann einen Themenbereich und anschließend eine Materialart.");
  const areas = catalogData.bereiche.filter((area) => matches(areaText(area), query));
  const grid = document.createElement("div");
  grid.className = "class-grid";
  for (const area of areas) {
    const card = createNavLink("class-card", "", [area.id]);
    card.appendChild(createText("span", "card-kicker", area.stufe || "Bereich"));
    card.appendChild(createText("span", "class-title", area.kurztitel || area.titel));
    card.appendChild(createText("span", "card-description", area.titel));
    card.appendChild(createText("span", "card-meta", plural(area.inhaltsfelder.length, "Themenbereich", "Themenbereiche")));
    card.appendChild(createText("span", "card-action", "Themen entdecken →"));
    grid.appendChild(card);
  }
  catalogRoot.appendChild(grid);
  const methods = catalogData.methoden;
  const hasMethods = methods && (methods.stufen || []).some((stage) => methodEntries(stage).length)
    && matches(`${methods.titel} ${methods.beschreibung} ${(methods.stufen || []).map(methodStageText).join(" ")}`, query);
  if (hasMethods) {
    const section = document.createElement("section");
    section.className = "method-section";
    section.appendChild(createText("h3", "", "Fächerübergreifend lernen"));
    section.appendChild(createCard({ title: methods.titel || "Methoden", description: methods.beschreibung, parts: ["methoden"], theme: methodTheme, icon: "↗" }));
    catalogRoot.appendChild(section);
  }
  if (!areas.length && !hasMethods) renderEmpty("Keine passenden Kurse oder Methoden gefunden.");
  summaryRoot.textContent = query
    ? `${plural(areas.length, "passender Kurs", "passende Kurse")}${hasMethods ? " · Methoden" : ""}`
    : `${catalogData.statistik.bereiche} Bereiche · ${catalogData.statistik.inhaltsfelder} Themenbereiche · ${catalogData.statistik.themen} Themen`;
}

function baseCrumbs(area, field) {
  const crumbs = [{ title: "Klassen und Kurse", parts: [] }, { title: area.kurztitel || area.titel, parts: [area.id] }];
  if (field) crumbs.push({ title: field.titel, parts: [area.id, field.id] });
  return crumbs;
}

function areaGroups(area) {
  return ["zusatzaufgaben", "unterstuetzung"].map((id) => ({
    ...materialKinds.find((kind) => kind.id === id), entries: sharedEntries(area, id)
  })).filter((group) => group.entries.length);
}

function groupMatches(group, query) {
  return matches(`${group.title} ${group.description} ${group.entries.map(({ material, context }) => `${context} ${materialText(material)}`).join(" ")}`, query);
}

function renderArea(area, query) {
  renderNavigation(baseCrumbs(area), 2);
  renderHeader(2, area.titel, "Welchen Themenbereich möchtest du erkunden? Auf der nächsten Seite wählst du die passende Materialart.");
  const localQuery = matches(areaOwnText(area), query) ? "" : query;
  const fields = area.inhaltsfelder.filter((field) => matches(fieldText(field, area), localQuery));
  appendGrid(fields.map((field) => ({
    title: field.titel, description: plural(field.themen.length, "Thema", "Themen"),
    meta: plural(fieldEntries(field).length, "Material", "Materialien"), parts: [area.id, field.id], theme: fieldTheme(field)
  })));
  const shared = areaGroups(area).filter((group) => groupMatches(group, localQuery));
  if (shared.length) {
    catalogRoot.appendChild(createText("h3", "section-heading", "Für den ganzen Kurs"));
    appendGrid(shared.map((group) => ({
      title: group.title, description: group.description, icon: group.icon,
      meta: plural(group.entries.length, "Material", "Materialien"), parts: [area.id, "kursmaterial", group.id]
    })));
  }
  if (!fields.length && !shared.length) renderEmpty("Keine passenden Themenbereiche oder Kursmaterialien gefunden.");
  summaryRoot.textContent = `${area.kurztitel || area.titel} · ${plural(fields.length, "Themenbereich", "Themenbereiche")}`;
}

function fieldGroups(area, field) {
  const entries = [...fieldEntries(field), ...fieldExtraEntries(area, field)];
  const shared = areaGroups(area).filter((group) => group.id !== "zusatzaufgaben");
  return materialKinds.map((kind) => ({
    ...kind,
    entries: [...entries.filter(({ material }) => materialKind(material) === kind.id), ...(shared.find((group) => group.id === kind.id)?.entries || [])]
  })).filter((group) => group.entries.length);
}

function renderField(area, field, query) {
  const theme = fieldTheme(field);
  const localQuery = matches(`${areaOwnText(area)} ${field.titel}`, query) ? "" : query;
  const visible = fieldGroups(area, field).filter((group) => groupMatches(group, localQuery));
  renderNavigation(baseCrumbs(area, field), 3);
  renderHeader(3, field.titel, "Wie möchtest du lernen? Wähle eine Materialart aus, um die zugehörigen Materialien zu sehen.", theme);
  appendGrid(visible.map((group) => ({
    title: group.title, description: group.description, icon: group.icon, theme,
    meta: plural(group.entries.length, "Material", "Materialien"),
    kicker: group.entries.every((entry) => entry.shared) ? "Für den ganzen Kurs" : "",
    parts: [area.id, field.id, group.id]
  })));
  if (!visible.length) renderEmpty("Keine passenden Materialarten gefunden.");
  const topics = field.themen.filter((topic) => matches(`${topic.titel} ${(topic.materialien || []).map(materialText).join(" ")}`, localQuery));
  if (topics.length) {
    const overview = document.createElement("details");
    overview.className = "topic-overview";
    overview.appendChild(createText("summary", "", `Themen in diesem Bereich (${topics.length})`));
    const list = document.createElement("ul");
    topics.forEach((topic) => list.appendChild(createText("li", "", topic.titel)));
    overview.appendChild(list);
    catalogRoot.appendChild(overview);
  }
  summaryRoot.textContent = `${area.kurztitel || area.titel} · ${field.titel} · ${plural(visible.length, "Materialart", "Materialarten")}`;
}

function renderMaterialLink(material, theme) {
  const link = document.createElement("a");
  link.className = "file-link";
  applyTheme(link, theme);
  const destination = new URL(material.url, window.location.href);
  if (/\.html?$/i.test(destination.pathname)) destination.searchParams.set("sammlung", hashFor(route));
  link.href = destination.href;
  link.dataset.feedback = "true";
  const copy = document.createElement("span");
  copy.className = "file-copy";
  copy.appendChild(createText("span", "file-title", material.titel));
  if (material.beschreibung) copy.appendChild(createText("span", "file-description", material.beschreibung));
  const meta = document.createElement("span");
  meta.className = "file-meta";
  meta.appendChild(createText("span", "badge", material.typ || "Datei"));
  if (material.bildimpuls) meta.appendChild(createText("span", "badge soft", "Mit Bildimpuls"));
  meta.appendChild(createText("span", "material-action", /\.html?$/i.test(destination.pathname) ? "Öffnen →" : "Datei öffnen ↗"));
  link.append(copy, meta);
  return link;
}

function renderEntryList(entries, query, theme) {
  const visible = entries.filter(({ material, context }) => matches(`${context} ${materialText(material)}`, query));
  const groups = new Map();
  visible.forEach((entry) => {
    if (!groups.has(entry.context)) groups.set(entry.context, []);
    groups.get(entry.context).push(entry.material);
  });
  for (const [context, materials] of groups) {
    const section = document.createElement("section");
    section.className = "material-group";
    applyTheme(section, theme);
    section.appendChild(createText("h3", "", context));
    const list = document.createElement("div");
    list.className = "file-list";
    materials.forEach((material) => list.appendChild(renderMaterialLink(material, theme)));
    section.appendChild(list);
    catalogRoot.appendChild(section);
  }
  if (!visible.length) renderEmpty("Keine passenden Materialien gefunden.");
  return visible.length;
}

function renderCategory(area, field, group, query) {
  const crumbs = baseCrumbs(area, field);
  if (!field) crumbs.push({ title: "Kursmaterialien", parts: [area.id, "kursmaterial"] });
  crumbs.push({ title: group.title, parts: route });
  const theme = field ? fieldTheme(field) : null;
  renderNavigation(crumbs, 4);
  renderHeader(4, group.title, `${field ? `${field.titel} · ` : ""}${group.description} Wähle ein Material, um es zu öffnen.`, theme);
  const localQuery = matches(`${areaOwnText(area)} ${field?.titel || ""} ${group.title} ${group.description}`, query) ? "" : query;
  const count = renderEntryList(group.entries, localQuery, theme);
  summaryRoot.textContent = `${area.kurztitel || area.titel} · ${group.title} · ${plural(count, "Material", "Materialien")}`;
}

function renderMethods(query) {
  const methods = catalogData.methoden;
  const stage = (methods?.stufen || []).find((item) => item.id === route[1]);
  const crumbs = [{ title: "Klassen und Kurse", parts: [] }, { title: methods?.titel || "Methoden", parts: ["methoden"] }];
  if (route.length > 1 && !stage) return renderNotFound(crumbs);
  const methodQuery = matches(`${methods?.titel} ${methods?.beschreibung}`, query) ? "" : query;
  if (!stage) {
    renderNavigation(crumbs, 2);
    renderHeader(2, methods?.titel || "Methoden", "Wähle deine Schulstufe, um die passenden Methodenthemen zu entdecken.", methodTheme);
    const stages = (methods?.stufen || []).filter((item) => methodEntries(item).length && matches(methodStageText(item), methodQuery));
    appendGrid(stages.map((item) => ({ title: item.titel, description: "Methodenthemen entdecken", meta: plural(methodEntries(item).length, "Material", "Materialien"), parts: ["methoden", item.id], theme: methodTheme })));
    if (!stages.length) renderEmpty("Keine passenden Methodenmaterialien gefunden.");
    summaryRoot.textContent = "Fächerübergreifende Methoden";
    return;
  }
  crumbs.push({ title: stage.titel, parts: ["methoden", stage.id] });
  const localQuery = matches(stage.titel, methodQuery) ? "" : methodQuery;
  const topic = (stage.themen || []).find((item) => item.id === route[2]);
  if (route.length > 2 && !topic && route[2] !== "allgemein") return renderNotFound(crumbs);
  if (route.length === 2) {
    renderNavigation(crumbs, 3);
    renderHeader(3, stage.titel, "Wähle ein Methodenthema. Die zugehörigen Lernpfade und Materialien erscheinen auf der nächsten Seite.", methodTheme);
    const topics = (stage.themen || []).filter((item) => methodEntries(stage, item).length && matches(`${item.titel} ${methodEntries(stage, item).map(({ material }) => materialText(material)).join(" ")}`, localQuery));
    const cards = topics.map((item) => ({ title: item.titel, meta: plural(methodEntries(stage, item).length, "Material", "Materialien"), parts: ["methoden", stage.id, item.id], theme: methodTheme }));
    if ((stage.materialien || []).length && matches(stage.materialien.map(materialText).join(" "), localQuery)) cards.push({ title: "Allgemeine Methodenmaterialien", parts: ["methoden", stage.id, "allgemein"], theme: methodTheme });
    appendGrid(cards);
    if (!cards.length) renderEmpty("Keine passenden Methodenthemen gefunden.");
    summaryRoot.textContent = `${stage.titel} · ${plural(cards.length, "Methodenthema", "Methodenthemen")}`;
    return;
  }
  if (route.length > 3) return renderNotFound(crumbs);
  const title = topic?.titel || "Allgemeine Methodenmaterialien";
  crumbs.push({ title, parts: route });
  renderNavigation(crumbs, 4);
  renderHeader(4, title, "Wähle einen Lernpfad oder ein Material, um es zu öffnen.", methodTheme);
  const entries = topic ? methodEntries(stage, topic) : (stage.materialien || []).map((material) => ({ material, context: stage.titel }));
  const count = renderEntryList(entries, matches(title, localQuery) ? "" : localQuery, methodTheme);
  summaryRoot.textContent = `${stage.titel} · ${plural(count, "Material", "Materialien")}`;
}

function renderNotFound(crumbs = [{ title: "Klassen und Kurse", parts: [] }]) {
  const parent = crumbs[crumbs.length - 1];
  renderNavigation([...crumbs, { title: "Seite nicht gefunden", parts: route }], Math.min(4, crumbs.length + 1));
  renderHeader(Math.min(4, crumbs.length + 1), "Seite nicht gefunden", "Diese Auswahl ist nicht mehr verfügbar. Über den Navigationspfad kommst du zur Übersicht zurück.");
  catalogRoot.appendChild(createNavLink("back-button", `← Zu ${parent.title}`, parent.parts));
  summaryRoot.textContent = "";
}

function render({ focus = false } = {}) {
  if (!catalogData) return;
  const query = searchInput.value.trim();
  catalogRoot.replaceChildren();
  if (!route.length) renderHome(query);
  else if (route[0] === "methoden") renderMethods(query);
  else {
    const area = catalogData.bereiche.find((item) => item.id === route[0]);
    const field = area?.inhaltsfelder.find((item) => item.id === route[1]);
    if (!area) renderNotFound();
    else if (route.length === 1) renderArea(area, query);
    else if (route[1] === "kursmaterial") {
      if (route.length === 2) {
        renderNavigation([...baseCrumbs(area), { title: "Kursmaterialien", parts: route }], 3);
        renderHeader(3, "Für den ganzen Kurs", "Wähle eine Materialart aus.");
        const groups = areaGroups(area).filter((group) => groupMatches(group, matches(areaOwnText(area), query) ? "" : query));
        appendGrid(groups.map((group) => ({ title: group.title, description: group.description, icon: group.icon, parts: [area.id, "kursmaterial", group.id] })));
        if (!groups.length) renderEmpty("Keine passenden Kursmaterialien gefunden.");
        summaryRoot.textContent = area.kurztitel || area.titel;
      } else {
        const group = areaGroups(area).find((item) => item.id === route[2]);
        if (group && route.length === 3) renderCategory(area, null, group, query);
        else renderNotFound(baseCrumbs(area));
      }
    } else if (!field) renderNotFound(baseCrumbs(area));
    else if (route.length === 2) renderField(area, field, query);
    else {
      const group = fieldGroups(area, field).find((item) => item.id === route[2]);
      if (group && route.length === 3) renderCategory(area, field, group, query);
      else renderNotFound(baseCrumbs(area, field));
    }
  }
  if (focus) {
    document.getElementById("view-title")?.focus({ preventScroll: true });
    document.querySelector(".page-shell").scrollIntoView({ behavior: "instant", block: "start" });
  }
}

function updateSearch() {
  window.history.replaceState(null, "", hashFor(route));
  render();
}

async function start() {
  try {
    parseHash();
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    catalogData = await response.json();
    render();
  } catch (error) {
    summaryRoot.textContent = "";
    catalogRoot.replaceChildren(createText("p", "error", "Die Materialübersicht konnte nicht geladen werden. Bitte lade die Seite erneut oder starte die lokale Vorschau über START_LOKAL.bat."));
    console.error(error);
  }
}

window.addEventListener("hashchange", () => {
  window.clearTimeout(navigationTimer);
  navigationTimer = null;
  parseHash();
  render({ focus: true });
});
searchInput.addEventListener("input", updateSearch);
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  catalogRoot.focus();
  catalogRoot.scrollIntoView();
});
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-feedback]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.hasAttribute("download")) return;
  event.preventDefault();
  window.clearTimeout(navigationTimer);
  document.querySelectorAll(".is-activated").forEach((item) => item.classList.remove("is-activated"));
  link.classList.add("is-activated");
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
  navigationTimer = window.setTimeout(() => {
    navigationTimer = null;
    link.classList.remove("is-activated");
    window.location.assign(link.href);
  }, delay);
});

start();
