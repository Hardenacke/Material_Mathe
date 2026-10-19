/* Wird beim Build in die verlinkten HTML-Materialien eingebunden. */
(() => {
  const returnRoute = new URLSearchParams(window.location.search).get("sammlung");
  if (!returnRoute || !returnRoute.startsWith("#/")) return;
  const source = document.currentScript;
  if (!source || document.getElementById("sammlung-navigation")) return;
  const home = new URL("index.html", source.src);
  const back = new URL(home);
  back.hash = returnRoute;
  home.hash = "#/";

  // Das Shadow DOM hält die Navigation unabhängig vom Design des Materials.
  const host = document.createElement("div");
  host.id = "sammlung-navigation";
  host.style.cssText = "display:block;position:relative;z-index:10000;flex-shrink:0;width:100%;grid-column:1 / -1;";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host { color-scheme: light; }
    nav { display:flex; flex-wrap:wrap; align-items:center; gap:10px;
      padding:10px max(16px, env(safe-area-inset-left)); border-bottom:1px solid #d8d6de;
      background:#fff; color:#3b176e; font:600 14px/1.4 system-ui,sans-serif; }
    a { display:inline-flex; align-items:center; min-height:44px; box-sizing:border-box;
      padding:9px 14px; border:1px solid #d8d6de; border-radius:8px; color:#3b176e;
      background:#f0e8ff; text-decoration:none; transition:background 150ms,transform 150ms; }
    a:last-child { background:#fff; }
    a:hover { background:#e3d5fb; }
    a:active { background:#dac8f7; transform:scale(.98); }
    a:focus-visible { outline:3px solid #6d28d9; outline-offset:3px; }
    @media print { nav { display:none; } }
    @media (prefers-reduced-motion:reduce) { a { transition:none; transform:none; } }
  `;
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Zurück zur Materialsammlung");
  const backLink = document.createElement("a");
  backLink.href = back.href;
  backLink.textContent = "← Zurück zur Materialauswahl";
  const homeLink = document.createElement("a");
  homeLink.href = home.href;
  homeLink.textContent = "Klassen und Kurse";
  nav.append(backLink, homeLink);
  shadow.append(style, nav);
  document.body.prepend(host);

  // Den Rückweg auch beim Wechsel zu einer Aufgabe oder Folgeseite behalten.
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download")) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== home.origin || !destination.pathname.startsWith(new URL(".", home).pathname)
      || destination.pathname === home.pathname || !/\.html?$/i.test(destination.pathname)) return;
    destination.searchParams.set("sammlung", returnRoute);
    link.href = destination.href;
  }, true);
})();
