/* =============================================================
   custom-cursor.js  —  Multimedianne Portfolio by Julianne
   Drop ONE <script src="custom-cursor.js" defer></script> in
   the <head> of every page. Theme is auto-detected from URL.
   =============================================================

   CURSOR STATES & COLORS (per theme):
     default  → theme base color
     hover    → lighter / accent tint  (over links, buttons, etc.)
     click    → vivid pop color        (on mousedown)
     text     → thin I-beam tint       (over inputs, textareas)
   A small pink heart ♥ always rides the top-right of the arrow.

   PAGE THEMES (detected from URL path):
     /              → Home       purple  #9b59b6
     /rotoscoping   → Roto       pink    #e91e8c
     /solar-system  → Space      cyan    #00b4d8
     /apps-used     → Apps       teal    #10b981
     /about         → About      rose    #f43f5e
   ============================================================= */

(function () {
  "use strict";

  /* ── 1. Detect theme ───────────────────────────────────────── */
  const path = window.location.pathname;
  let theme = "home";
  if      (path.includes("rotoscoping"))  theme = "rotoscoping";
  else if (path.includes("solar"))        theme = "solar";
  else if (path.includes("apps"))         theme = "apps";
  else if (path.includes("about"))        theme = "about";

  /* ── 2. Theme palette ──────────────────────────────────────── */
  const palettes = {
    home:        { default: "#faaaaa", hover: "#f97b7f", click: "#ff6969", text: "#ff6969" },
    rotoscoping: { default: "#f0b4db", hover: "#ee99ff", click: "#ee99ff", text: "#ee99ff" },
    solar:       { default: "#97d8e5", hover: "#7dc8eb", click: "#7dc8eb", text: "#7dc8eb" },
    apps:        { default: "#eba6db", hover: "#ffabf2c8", click: "#ffabf2c8", text: "#ffabf2c8" },
    about:       { default: "#fda4af", hover: "#ee6c81", click: "#ee6c81", text: "#ee6c81" },
  };

  const pal = palettes[theme];

  /* ── 3. Build the SVG cursor as a data URI ─────────────────
     drawCursor(bodyColor, heartColor) → data:image/svg+xml URI
     The cursor is a classic arrow (22×26px) with a pink heart
     at top-right (offset so it overlaps the tip area nicely).  */
  function buildCursorURI(bodyColor, heartColor) {
    heartColor = heartColor || "#ff69b4";
    /* Arrow path: standard pointer shape */
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 32 36">
      <!-- Arrow body -->
      <path d="M4 2 L4 28 L11.5 20 L22 20.5 Z"
            fill="${bodyColor}" stroke="#00000066" stroke-width="1.2"
            stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Pink heart top-right -->
      <g transform="translate(17, 0)">
        <path d="M7.5 2.5
                 C7.5 1.1 6.4 0 5 0
                 C3.9 0 3 0.7 2.6 1.7
                 C2.2 0.7 1.3 0 0.2 0
                 C-1.2 0 -2.3 1.1 -2.3 2.5
                 C-2.3 3.8 -1.4 4.9 2.6 7.5
                 C6.6 4.9 7.5 3.8 7.5 2.5Z"
              fill="${heartColor}" opacity="0.95"/>
      </g>
    </svg>`;
    return "data:image/svg+xml;base64," + btoa(svg);
  }

  /* ── 4. Pre-build all state URIs ───────────────────────────── */
  function darken(hex, percent = 20) {
  const num = parseInt(hex.slice(1), 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.max(0, Math.floor(r * (100 - percent) / 100));
  g = Math.max(0, Math.floor(g * (100 - percent) / 100));
  b = Math.max(0, Math.floor(b * (100 - percent) / 100));

  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b)
    .toString(16)
    .slice(1);
}
   const uris = {
   default: buildCursorURI(pal.default, darken(pal.default)),
   hover:   buildCursorURI(pal.hover,   darken(pal.hover)),
   click:   buildCursorURI(pal.click,   darken(pal.click)),
   text:    buildCursorURI(pal.text,    darken(pal.text)),
};

  /* CSS cursor values: "url(...) hotspot-x hotspot-y, fallback" */
  /* Hot spot is the tip of the arrow = top-left ~(4,2) in our SVG */
  function cur(state) {
    return `url("${uris[state]}") 4 2, auto`;
  }

  /* ── 5. Inject global CSS ──────────────────────────────────── */
  document.documentElement.style.setProperty("--cursor-default", `url("${uris.default}") 4 2`);
  document.documentElement.style.setProperty("--cursor-hover", `url("${uris.hover}") 4 2`);
  document.documentElement.style.setProperty("--cursor-click", `url("${uris.click}") 4 2`);
  document.documentElement.style.setProperty("--cursor-text", `url("${uris.text}") 4 2`);

  /* ── 6. Click burst: add class on mousedown, remove on mouseup ─ */
  document.addEventListener("mousedown", () => {
    document.documentElement.classList.add("mcursor-clicking");
  });
  document.addEventListener("mouseup", () => {
    document.documentElement.classList.remove("mcursor-clicking");
  });

  /* ── 7. Dynamic hover detection for any element ────────────── */
  /* Covers elements added after page load (JS-rendered content)  */
  const interactiveSel = [
    "a", "button", "label", "select", "summary",
    "[role='button']", "[tabindex]", "[onclick]",
    ".btn", ".card", "nav *", ".carousel-btn",
    ".copy-btn", ".download-btn", ".tab", ".arrow"
  ].join(", ");

  function attachHover(root) {
    (root.matches ? [root] : [])
      .concat(Array.from(root.querySelectorAll ? root.querySelectorAll(interactiveSel) : []))
      .forEach(el => {
        if (el.__mcursorBound) return;
        el.__mcursorBound = true;
        el.addEventListener("mouseenter", () => {
          el.style.setProperty("cursor", cur("hover"), "important");
        });
        el.addEventListener("mouseleave", () => {
          el.style.removeProperty("cursor");
        });
        el.addEventListener("mousedown", () => {
          el.style.setProperty("cursor", cur("click"), "important");
        });
        el.addEventListener("mouseup", () => {
          el.style.setProperty("cursor", cur("hover"), "important");
        });
      });
  }

  function onReady() {
    attachHover(document.body);

    /* Watch for dynamically added elements */
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1) attachHover(n);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

})();