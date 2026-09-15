const catalogRoot = document.getElementById("catalog");
const summaryRoot = document.getElementById("summary");
const searchInput = document.getElementById("search");

let catalogData = null;
let route = { areaId: "", fieldId: "" };
let lastMaterialRoute = "";
let selectedMaterialCategory = "all";

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function createText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createButton(className, text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function fieldTheme(field) {
  const text = normalize(field.titel);
  if (text.includes("stochastik") || text.includes("wahrscheinlichkeit") || text.includes("daten")) {
    return { accent: "#b4781d", accentDark: "#744918", accentSoft: "#fff1d8" };
  }
  if (text.includes("geometrie") || text.includes("vektor") || text.includes("lineare algebra")) {
    return { accent: "#765f9f", accentDark: "#47366b", accentSoft: "#f0ebf7" };
  }
  if (text.includes("funktion") || text.includes("analysis")) {
    return { accent: "#1e8a83", accentDark: "#23454a", accentSoft: "#e4f4ef" };
  }
  return { accent: "#276b73", accentDark: "#23454a", accentSoft: "#e7f3f0" };
}

function applyTheme(element, theme) {
  if (!theme) return element;
  element.style.setProperty("--topic-accent", theme.accent);
  element.style.setProperty("--card-accent", theme.accent);
  element.style.setProperty("--topic-accent-dark", theme.accentDark);
  element.style.setProperty("--topic-accent-soft", theme.accentSoft);
  return element;
}

function areaTotals(area) {
  return area.inhaltsfelder.reduce(
    (total, field) => ({
      topics: total.topics + field.themen.length,
      files: total.files + field.materialien.length + field.themen.reduce((sum, topic) => sum + topic.materialien.length, 0)
    }),
    { topics: 0, files: (area.unterstuetzung || []).length }
  );
}

function catalogTotals(areas) {
  return areas.reduce(
    (total, area) => {
      const areaCount = areaTotals(area);
      return {
        fields: total.fields + area.inhaltsfelder.length,
        topics: total.topics + areaCount.topics,
        files: total.files + areaCount.files
      };
    },
    { fields: 0, topics: 0, files: 0 }
  );
}

function materialText(materials) {
  return (materials || [])
    .map((material) => `${material.titel} ${material.typ} ${material.datei} ${material.beschreibung || ""} ${(material.kompetenzen || []).join(" ")}`)
    .join(" ");
}

function materialCategory(material) {
  return material.kategorie || material.typ || "Datei";
}

function fieldMaterials(field) {
  const materials = [...(field.materialien || [])];
  for (const topic of field.themen || []) {
    materials.push(...(topic.materialien || []));
  }
  return materials;
}

function fieldCategories(field) {
  return [...new Set(fieldMaterials(field).map(materialCategory))].sort((a, b) => {
    if (a === "Lernspiel") return -1;
    if (b === "Lernspiel") return 1;
    return a.localeCompare(b, "de-DE");
  });
}

function categoryForField(field) {
  const categories = fieldCategories(field);
  return categories.includes(selectedMaterialCategory) ? selectedMaterialCategory : "all";
}

function topicText(topic) {
  return `${topic.titel} ${materialText(topic.materialien)}`;
}

function fieldText(field) {
  return `${field.titel} ${materialText(field.materialien)} ${field.themen.map(topicText).join(" ")}`;
}

function areaText(area) {
  return `${area.titel} ${area.kurztitel || ""} ${area.stufe} ${materialText(area.unterstuetzung)} ${area.inhaltsfelder.map(fieldText).join(" ")}`;
}

function parseHash() {
  const parts = window.location.hash
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);

  route = {
    areaId: parts[0] || "",
    fieldId: parts[1] || ""
  };
}

function navigate(areaId, fieldId = "") {
  const nextHash = areaId
    ? `#/${encodeURIComponent(areaId)}${fieldId ? `/${encodeURIComponent(fieldId)}` : ""}`
    : "#/";

  if (window.location.hash === nextHash) {
    parseHash();
    render();
  } else {
    window.location.hash = nextHash;
  }
}

function findArea(areaId) {
  return catalogData.bereiche.find((area) => area.id === areaId) || null;
}

function findField(area, fieldId) {
  return area.inhaltsfelder.find((field) => field.id === fieldId) || null;
}

function areaOwnMatchesQuery(area, query) {
  if (!query) return true;
  return normalize(`${area.titel} ${area.kurztitel || ""} ${area.stufe}`).includes(normalize(query));
}

function fieldOwnMatchesQuery(field, query) {
  if (!query) return true;
  return normalize(field.titel).includes(normalize(query));
}

function topicMatchesQuery(topic, query) {
  if (!query) return true;
  return normalize(topicText(topic)).includes(normalize(query));
}

function fieldMatchesQuery(field, query) {
  if (!query) return true;
  if (fieldOwnMatchesQuery(field, query)) return true;
  return normalize(`${materialText(field.materialien)} ${field.themen.map(topicText).join(" ")}`).includes(normalize(query));
}

function areaMatchesQuery(area, query) {
  if (!query) return true;
  if (areaOwnMatchesQuery(area, query)) return true;
  return normalize(areaText(area)).includes(normalize(query));
}

function fieldsForArea(area, query) {
  if (!query || areaOwnMatchesQuery(area, query)) return area.inhaltsfelder;
  return area.inhaltsfelder.filter((field) => fieldMatchesQuery(field, query));
}

function filterMaterials(materials, query, category = "all") {
  const needle = normalize(query);
  return (materials || []).filter((material) => {
    if (category !== "all" && materialCategory(material) !== category) return false;
    return !query || normalize(materialText([material])).includes(needle);
  });
}

function filterTopics(field, query, category = "all") {
  const fieldMatch = fieldOwnMatchesQuery(field, query);
  const materialQuery = fieldMatch ? "" : query;
  if (category !== "all") {
    return field.themen.filter((topic) => filterMaterials(topic.materialien, materialQuery, category).length);
  }
  if (!query || fieldMatch) return field.themen;
  return field.themen.filter((topic) => topicMatchesQuery(topic, query));
}

function setSummary(text) {
  summaryRoot.textContent = text;
}

function renderBreadcrumb(area, field) {
  const breadcrumb = document.createElement("nav");
  breadcrumb.className = "breadcrumb";
  breadcrumb.setAttribute("aria-label", "Pfad");

  breadcrumb.appendChild(createButton("crumb-button", "Klassen und Kurse", () => navigate("")));

  if (area) {
    breadcrumb.appendChild(createText("span", "crumb-separator", "/"));
    breadcrumb.appendChild(createButton("crumb-button", area.kurztitel || area.titel, () => navigate(area.id)));
  }

  if (field) {
    breadcrumb.appendChild(createText("span", "crumb-separator", "/"));
    breadcrumb.appendChild(createText("span", "crumb-current", field.titel));
  }

  return breadcrumb;
}

function renderHome(query) {
  const areas = catalogData.bereiche.filter((area) => areaMatchesQuery(area, query));
  const totals = catalogTotals(areas);

  catalogRoot.replaceChildren();
  setSummary(query
    ? `${areas.length} passende Bereiche · ${plural(totals.fields, "Inhaltsfeld", "Inhaltsfelder")}`
    : `${catalogData.statistik.bereiche} Bereiche · ${catalogData.statistik.inhaltsfelder} Inhaltsfelder · ${catalogData.statistik.themen} Themen · ${catalogData.statistik.materialien} Materialien`
  );

  const header = document.createElement("section");
  header.className = "view-header";
  header.appendChild(createText("p", "step-label", "Schritt 1 von 2"));
  header.appendChild(createText("h2", "", "Klasse oder Kurs auswählen"));
  header.appendChild(createText("p", "view-copy", "Wähle zuerst den Bereich aus. Danach erscheinen die Inhaltsfelder dieses Bereichs mit Themen und Materialien."));
  catalogRoot.appendChild(header);

  if (!areas.length) {
    catalogRoot.appendChild(createText("p", "empty-state", "Keine passenden Klassen oder Kurse gefunden."));
    return;
  }

  const grid = document.createElement("div");
  grid.className = "class-grid";

  for (const area of areas) {
    const totalsForArea = areaTotals(area);
    const button = createButton("class-card", "", () => navigate(area.id));
    button.appendChild(createText("span", "card-kicker", "Bereich"));
    button.appendChild(createText("span", "class-title", area.kurztitel || area.titel));
    button.appendChild(createText("span", "card-description", area.titel === area.kurztitel ? area.stufe : `${area.titel} · ${area.stufe}`));
    button.appendChild(createText(
      "span",
      "card-meta",
      `${plural(area.inhaltsfelder.length, "Inhaltsfeld", "Inhaltsfelder")} · ${plural(totalsForArea.topics, "Thema", "Themen")} · ${plural(totalsForArea.files, "Datei", "Dateien")}`
    ));
    grid.appendChild(button);
  }

  catalogRoot.appendChild(grid);
}

function renderFieldPicker(area, fields, selectedField) {
  const section = document.createElement("section");
  section.className = "topic-picker-section";
  section.appendChild(createText("p", "step-label", "Schritt 2 von 2"));
  section.appendChild(createText("h2", "", "Inhaltsfeld auswählen"));

  const grid = document.createElement("div");
  grid.className = "topic-grid";

  for (const field of fields) {
    const theme = fieldTheme(field);
    const totals = {
      topics: field.themen.length,
      files: field.materialien.length + field.themen.reduce((sum, topic) => sum + topic.materialien.length, 0)
    };
    const button = createButton("topic-button", "", () => navigate(area.id, field.id));
    applyTheme(button, theme);
    if (selectedField && selectedField.id === field.id) {
      button.classList.add("is-selected");
      button.setAttribute("aria-current", "true");
    }
    button.appendChild(createText("span", "topic-title", field.titel));
    button.appendChild(createText("span", "topic-description", `${plural(totals.topics, "Thema", "Themen")} in diesem Inhaltsfeld`));
    button.appendChild(createText("span", "card-meta", `${plural(totals.files, "Datei", "Dateien")}`));
    grid.appendChild(button);
  }

  section.appendChild(grid);
  return section;
}

function renderAreaSupport(area, query) {
  const materialQuery = areaOwnMatchesQuery(area, query) ? "" : query;
  const materials = filterMaterials(area.unterstuetzung, materialQuery);
  if (!materials.length) return null;

  const theme = { accent: "#c85f48", accentDark: "#23454a", accentSoft: "#faebe5" };
  const section = document.createElement("section");
  section.className = "support-section";
  section.appendChild(createText("p", "step-label", "Kategorie"));
  section.appendChild(createText("h2", "", "Unterstützung"));
  section.appendChild(createText("p", "view-copy", "Erklärvideos und Vorlagen zum Lernen und Erstellen von Aufgaben."));

  const list = document.createElement("div");
  list.className = "support-list";
  for (const material of materials) {
    list.appendChild(renderMaterialLink(material, theme));
  }
  section.appendChild(list);
  return section;
}

function renderCategoryFilter(field, activeCategory) {
  const categories = fieldCategories(field);
  if (categories.length < 2) return null;

  const counts = fieldMaterials(field).reduce((acc, material) => {
    const category = materialCategory(material);
    acc.set(category, (acc.get(category) || 0) + 1);
    return acc;
  }, new Map());

  const filter = document.createElement("div");
  filter.className = "category-filter";
  filter.setAttribute("aria-label", "Materialkategorie");

  const options = ["all", ...categories];
  for (const category of options) {
    const label = category === "all" ? "Alle" : category;
    const count = category === "all" ? fieldMaterials(field).length : counts.get(category);
    const button = createButton("category-button", `${label} (${count})`, () => {
      selectedMaterialCategory = category;
      render();
    });
    if (category === activeCategory) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
    filter.appendChild(button);
  }

  return filter;
}

function renderMaterialLink(material, theme) {
  const link = document.createElement("a");
  link.className = "file-link";
  applyTheme(link, theme);
  link.href = encodeURI(material.url);

  const copy = document.createElement("span");
  copy.className = "file-copy";
  copy.appendChild(createText("span", "file-title", material.titel));
  if (material.beschreibung) {
    copy.appendChild(createText("span", "file-description", material.beschreibung));
  }
  link.appendChild(copy);

  const meta = document.createElement("span");
  meta.className = "file-meta";
  meta.appendChild(createText("span", "badge", material.typ || "Datei"));
  meta.appendChild(createText("span", "badge soft", material.datei || "Material"));
  link.appendChild(meta);
  return link;
}

function renderFieldFiles(field, query, theme, category) {
  const materialQuery = fieldOwnMatchesQuery(field, query) ? "" : query;
  const files = filterMaterials(field.materialien, materialQuery, category);
  const section = document.createElement("section");
  section.className = "resource-section";
  section.appendChild(createText("h3", "", "Dateien zum Inhaltsfeld"));

  if (!files.length) {
    section.appendChild(createText("p", "empty-topic", query ? "Keine passenden Dateien in diesem Inhaltsfeld gefunden." : "Noch keine übergreifenden Dateien vorhanden."));
    return section;
  }

  const list = document.createElement("div");
  list.className = "file-list";
  for (const material of files) {
    list.appendChild(renderMaterialLink(material, theme));
  }

  section.appendChild(list);
  return section;
}

function renderTopics(field, query, theme, category) {
  const topics = filterTopics(field, query, category);
  const materialQuery = fieldOwnMatchesQuery(field, query) ? "" : query;
  const section = document.createElement("section");
  section.className = "resource-section";
  section.appendChild(createText("h3", "", "Themen"));

  if (!topics.length) {
    section.appendChild(createText("p", "empty-topic", "Keine passenden Themen gefunden."));
    return section;
  }

  const list = document.createElement("div");
  list.className = "topic-list";

  topics.forEach((topic, index) => {
    const card = document.createElement("article");
    card.className = "topic-card";
    applyTheme(card, theme);

    const number = createText("span", "topic-num", String(index + 1).padStart(2, "0"));
    const body = document.createElement("div");
    body.appendChild(createText("h4", "topic-card-title", topic.titel));

    const topicMaterials = filterMaterials(topic.materialien, materialQuery, category);
    if (topicMaterials.length) {
      const files = document.createElement("div");
      files.className = "file-list compact";
      for (const material of topicMaterials) {
        files.appendChild(renderMaterialLink(material, theme));
      }
      body.appendChild(files);
    } else {
      body.appendChild(createText("p", "empty-topic", "Noch kein Material zu diesem Thema abgelegt."));
    }

    card.appendChild(number);
    card.appendChild(body);
    list.appendChild(card);
  });

  section.appendChild(list);
  return section;
}

function renderFieldDetail(field, query) {
  const theme = fieldTheme(field);
  const activeCategory = categoryForField(field);
  const materialQuery = fieldOwnMatchesQuery(field, query) ? "" : query;
  const visibleFieldFiles = filterMaterials(field.materialien, materialQuery, activeCategory);
  const visibleTopics = filterTopics(field, query, activeCategory);
  const visibleTopicFiles = visibleTopics.reduce((sum, topic) => {
    const files = filterMaterials(topic.materialien, materialQuery, activeCategory);
    return sum + files.length;
  }, 0);

  const detail = document.createElement("section");
  detail.className = "topic-detail";
  detail.id = "themenmaterial";
  applyTheme(detail, theme);

  const header = document.createElement("div");
  header.className = "topic-detail-header";
  header.appendChild(createText("p", "card-kicker", "Materialien zum Inhaltsfeld"));
  header.appendChild(createText("h2", "", field.titel));
  header.appendChild(createText("p", "view-copy", "Themenübersicht und direkt verlinkte Materialien aus der Mathe-Ablage."));
  header.appendChild(createText(
    "p",
    "resource-count",
    `${plural(visibleTopics.length, "Thema", "Themen")} · ${plural(visibleFieldFiles.length + visibleTopicFiles, "Datei", "Dateien")}`
  ));

  detail.appendChild(header);
  const categoryFilter = renderCategoryFilter(field, activeCategory);
  if (categoryFilter) detail.appendChild(categoryFilter);
  detail.appendChild(renderFieldFiles(field, query, theme, activeCategory));
  detail.appendChild(renderTopics(field, query, theme, activeCategory));
  return detail;
}

function renderAreaPage(area, query) {
  const fields = fieldsForArea(area, query);
  const selectedField = route.fieldId ? findField(area, route.fieldId) : null;
  const visibleSelectedField = selectedField && fieldMatchesQuery(selectedField, query) ? selectedField : null;
  const totals = areaTotals(area);

  catalogRoot.replaceChildren();
  setSummary(`${area.kurztitel || area.titel} · ${plural(area.inhaltsfelder.length, "Inhaltsfeld", "Inhaltsfelder")} · ${plural(totals.topics, "Thema", "Themen")} · ${plural(totals.files, "Datei", "Dateien")}`);

  catalogRoot.appendChild(renderBreadcrumb(area, visibleSelectedField));

  const header = document.createElement("section");
  header.className = "view-header";
  header.appendChild(createText("p", "step-label", "Ausgewählter Bereich"));
  header.appendChild(createText("h2", "", area.titel));
  header.appendChild(createText("p", "view-copy", "Wähle ein Inhaltsfeld aus. Darunter werden Themen und zugehörige Dateien angezeigt."));
  catalogRoot.appendChild(header);

  if (!fields.length) {
    catalogRoot.appendChild(createText("p", "empty-state", "Keine passenden Inhaltsfelder gefunden."));
    const supportSection = renderAreaSupport(area, query);
    if (supportSection) {
      catalogRoot.appendChild(supportSection);
    }
    return;
  }

  catalogRoot.appendChild(renderFieldPicker(area, fields, visibleSelectedField));

  const supportSection = renderAreaSupport(area, query);

  if (visibleSelectedField) {
    catalogRoot.appendChild(renderFieldDetail(visibleSelectedField, query));
    const materialRoute = `${route.areaId}/${route.fieldId}`;
    const material = document.getElementById("themenmaterial");
    if (route.fieldId && material && materialRoute !== lastMaterialRoute) {
      material.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    lastMaterialRoute = materialRoute;
  } else {
    lastMaterialRoute = `${route.areaId}/`;
    const empty = document.createElement("section");
    empty.className = "empty-panel";
    empty.appendChild(createText("h3", "", "Noch kein Inhaltsfeld ausgewählt"));
    empty.appendChild(createText("p", "", "Wähle oben ein Inhaltsfeld aus, um Themen und Dateien zu sehen."));
    catalogRoot.appendChild(empty);
  }

  if (supportSection) {
    catalogRoot.appendChild(supportSection);
  }
}

function render() {
  if (!catalogData) return;
  const query = searchInput.value.trim();

  if (!route.areaId) {
    renderHome(query);
    return;
  }

  const area = findArea(route.areaId);
  if (!area) {
    navigate("");
    return;
  }

  renderAreaPage(area, query);
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
    catalogRoot.replaceChildren();
    const message = document.createElement("div");
    message.className = "error";
    message.textContent = "Das automatische Verzeichnis konnte nicht geladen werden. Starte die Seite über einen lokalen Webserver oder prüfe den GitHub-Pages-Build.";
    catalogRoot.appendChild(message);
    console.error(error);
  }
}

window.addEventListener("hashchange", () => {
  parseHash();
  render();
});

searchInput.addEventListener("input", () => {
  render();
});

document.addEventListener("pointerdown", (event) => {
  const target = event.target.closest(".class-card, .topic-button, .file-link, .crumb-button, .category-button");
  if (!target) return;

  target.classList.remove("is-pressing");
  target.offsetWidth;
  target.classList.add("is-pressing");
  window.setTimeout(() => target.classList.remove("is-pressing"), 180);
});

start();
