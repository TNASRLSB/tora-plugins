#!/usr/bin/env node

// src/cli.ts
import process from "node:process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// src/generate.ts
var SAFE_IDENT = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
var SAFE_SLUG = /^[a-z][a-z0-9-]{0,63}$/;
var RESERVED_FIELD_NAMES = /* @__PURE__ */ new Set(["id", "created_at"]);
function assertSafe(label, value, re) {
  if (typeof value !== "string" || !re.test(value)) {
    throw new Error(`invalid ${label}: must match ${re}`);
  }
}
function kebab(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function qid(name) {
  return '"' + name.replace(/"/g, '""') + '"';
}
function sqlType(f) {
  switch (f.type) {
    case "integer":
      return "INTEGER";
    case "boolean":
      return "INTEGER";
    case "datetime":
      return "TEXT";
    case "reference":
      return "TEXT";
    default:
      return "TEXT";
  }
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function buildMigration(spec) {
  const tables = spec.entities.map((entity) => {
    const cols = [
      `  ${qid("id")} TEXT PRIMARY KEY`,
      `  ${qid("created_at")} TEXT NOT NULL DEFAULT (datetime('now'))`,
      ...entity.fields.map((f) => {
        const notNull = f.required ? " NOT NULL" : "";
        return `  ${qid(f.name)} ${sqlType(f)}${notNull}`;
      })
    ];
    return `CREATE TABLE IF NOT EXISTS ${qid(entity.name)} (
${cols.join(",\n")}
);`;
  });
  return tables.join("\n\n") + "\n";
}
function buildConfigJs(spec) {
  const entityConfigs = spec.entities.map((entity) => {
    const slug = kebab(entity.name);
    const fields = entity.fields.map(
      (f) => `    { name: ${JSON.stringify(f.name)}, type: ${JSON.stringify(f.type)}, required: ${f.required ? "true" : "false"} }`
    );
    return `  {
    name: ${JSON.stringify(entity.name)},
    slug: ${JSON.stringify(slug)},
    table: ${JSON.stringify(entity.name)},
    fields: [
${fields.join(",\n")}
    ]
  }`;
  });
  return `// Generated from spec "${spec.name}" \u2014 DO NOT EDIT.
export const APP_NAME = ${JSON.stringify(spec.name)};
export const APP_DESCRIPTION = ${JSON.stringify(spec.description)};
export const ENTITIES = [
${entityConfigs.join(",\n")}
];
`;
}
function buildHtmlJs() {
  return `// HTML render helpers \u2014 no build step required.

export function escHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "ticket-system" / "TicketItem" / "created_at" \u2192 "Ticket System" / "Ticket Item" / "Created At". */
export function humanize(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Format a datetime value for display in Italian locale (e.g. "10/06/2026, 18:30"). */
export function fmtDateTime(v) {
  if (v == null || v === "") return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

let appTitle = "App";
export function setAppTitle(t) { appTitle = t; }

let navItems = [];
export function setNavLinks(items) { navItems = items; }

export function layout(title, body, activePath) {
  const nav = navItems.map(i =>
    \`<a href="\${escHtml(i.href)}"\${i.href === activePath ? ' class="active"' : ""}>\${escHtml(i.label)}</a>\`
  ).join("");
  return \`<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>\${escHtml(title)}</title>
  <style>
    :root {
      --accent: #0f766e; --accent-strong: #0a5d56; --accent-soft: #e3efed;
      --bg: #f6f5f1; --surface: #ffffff; --line: #e7e4dd; --line-soft: #f0eee8;
      --ink: #26241f; --ink-soft: #6f6a5f;
      --danger: #a8362c; --danger-soft: #f8edec; --danger-line: #e6cdca;
      --radius: 10px;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-size: 15px; line-height: 1.5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif; }
    a { color: var(--accent); }
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .topbar { background: var(--surface); border-bottom: 1px solid var(--line); }
    .topbar-inner { max-width: 1040px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; font-weight: 650; letter-spacing: -0.01em; }
    .brand-mark { width: 10px; height: 10px; border-radius: 3px; background: var(--accent); flex: none; }
    .topbar nav { display: flex; gap: 4px; flex-wrap: wrap; }
    .topbar nav a { color: var(--ink-soft); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 10px; border-radius: 7px; }
    .topbar nav a:hover { color: var(--ink); background: var(--line-soft); }
    .topbar nav a.active { color: var(--accent-strong); background: var(--accent-soft); }
    main { max-width: 1040px; margin: 40px auto 0; padding: 0 24px; }
    .page-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    h1 { font-size: 24px; font-weight: 650; letter-spacing: -0.015em; margin: 0; }
    .page-sub { margin: 4px 0 0; color: var(--ink-soft); font-size: 14px; }
    .eyebrow { font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
    .card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: 0 1px 2px rgba(38, 36, 31, 0.05); }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; font: inherit; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-strong); }
    .btn-ghost { background: transparent; border-color: var(--line); color: var(--ink); }
    .btn-ghost:hover { background: var(--line-soft); }
    .btn-danger { background: var(--surface); border-color: var(--danger-line); color: var(--danger); }
    .btn-danger:hover { background: var(--danger-soft); }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .stat-card { padding: 20px; display: flex; flex-direction: column; }
    .stat-value { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin-top: 8px; }
    .stat-sub { color: var(--ink-soft); font-size: 13px; }
    .stat-actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--line-soft); font-size: 13px; font-weight: 600; }
    .stat-actions a { text-decoration: none; color: var(--accent-strong); }
    .stat-actions a:hover { text-decoration: underline; }
    .table-card { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink-soft); background: #fbfaf7; padding: 10px 16px; border-bottom: 1px solid var(--line); white-space: nowrap; }
    td { padding: 12px 16px; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #faf9f5; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--ink-soft); }
    .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; padding: 1px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .badge-on { background: var(--accent-soft); color: var(--accent-strong); }
    .badge-off { background: var(--line-soft); color: var(--ink-soft); }
    .row-link { font-weight: 600; font-size: 13px; text-decoration: none; color: var(--accent-strong); white-space: nowrap; }
    .row-link:hover { text-decoration: underline; }
    .empty { text-align: center; padding: 56px 24px; }
    .empty-glyph { display: block; margin: 0 auto 12px; color: var(--ink-soft); }
    .empty h2 { font-size: 17px; font-weight: 650; margin: 0 0 4px; }
    .empty p { color: var(--ink-soft); font-size: 14px; margin: 0 0 20px; }
    .form-card { max-width: 560px; padding: 24px; }
    label { display: block; margin-bottom: 16px; }
    label > span { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .req { color: var(--danger); font-style: normal; }
    input[type=text], input[type=number], input[type=date], input[type=datetime-local], textarea, select {
      width: 100%; padding: 9px 12px; border: 1px solid #d8d4cb; border-radius: 8px; font: inherit; font-size: 14px; background: var(--surface); color: var(--ink); }
    input:focus, textarea:focus, select:focus { border-color: var(--accent); outline: 2px solid var(--accent-soft); outline-offset: 0; }
    .check-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; cursor: pointer; }
    .check-row span { display: inline; margin: 0; font-size: 14px; font-weight: 600; }
    .check-row input { accent-color: var(--accent); width: 16px; height: 16px; }
    .error { background: var(--danger-soft); border: 1px solid var(--danger-line); color: var(--danger); padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
    .actions { display: flex; align-items: center; gap: 8px; margin-top: 24px; flex-wrap: wrap; }
    .page-head .actions { margin-top: 0; }
    .inline-form { display: inline; margin: 0; }
    .detail-card { padding: 8px 24px; max-width: 720px; }
    .field-row { padding: 14px 0; border-bottom: 1px solid var(--line-soft); }
    .field-row:last-child { border-bottom: none; }
    .field-label { font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
    .field-value { margin-top: 3px; font-size: 14px; overflow-wrap: anywhere; }
    .back-row { margin-top: 16px; }
    .danger-zone { margin-top: 16px; }
    footer { max-width: 1040px; margin: 48px auto 32px; padding: 16px 24px 0; border-top: 1px solid var(--line); color: var(--ink-soft); font-size: 12.5px; }
    footer strong { color: var(--ink); font-weight: 600; }
    @media (max-width: 720px) {
      main { margin-top: 24px; }
      .topbar-inner { padding: 10px 16px; gap: 12px; }
      main, footer { padding-left: 16px; padding-right: 16px; }
      .page-head { flex-direction: column; align-items: flex-start; }
      h1 { font-size: 21px; }
    }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span>\${escHtml(appTitle)}</a>
      <nav>\${nav}</nav>
    </div>
  </header>
  <main>\${body}</main>
  <footer>Creato con <strong>TORA Build</strong></footer>
  <script>
  (function () {
    var on = false, prev = null, parentOrigin = null;
    function selectorFor(el) {
      if (el.id) return "#" + el.id;
      var path = [], n = el;
      while (n && n.tagName && n !== document.body && path.length < 5) {
        var i = 1, s = n;
        while ((s = s.previousElementSibling)) if (s.tagName === n.tagName) i++;
        path.unshift(n.tagName.toLowerCase() + ":nth-of-type(" + i + ")");
        n = n.parentElement;
      }
      return path.join(" > ");
    }
    window.addEventListener("message", function (e) {
      if (e.source !== window.parent) return;
      var t = e.data && e.data.type;
      // Learn the parent's real origin from the trusted control message, so
      // replies can target it explicitly instead of broadcasting with "*".
      if (t === "enable_inspector") { on = true; parentOrigin = e.origin; }
      if (t === "disable_inspector") { on = false; if (prev) { prev.style.outline = ""; prev = null; } }
    });
    document.addEventListener("mouseover", function (e) {
      if (!on) return;
      if (prev) prev.style.outline = "";
      prev = e.target; prev.style.outline = "2px solid #0f766e";
    }, true);
    document.addEventListener("click", function (e) {
      if (!on || !parentOrigin) return;
      e.preventDefault(); e.stopPropagation();
      var el = e.target, r = el.getBoundingClientRect();
      window.parent.postMessage({
        type: "element_clicked",
        selector: selectorFor(el),
        textContent: (el.textContent || "").trim().slice(0, 120),
        tagName: el.tagName,
        boundingRect: { x: r.x, y: r.y, width: r.width, height: r.height },
      }, parentOrigin);
    }, true);
  })();
  </script>
</body>
</html>\`;
}
`;
}
function buildDbJs() {
  return `// Generic D1 CRUD helpers \u2014 no build step required.

/** Quote an SQL identifier \u2014 table/column names can collide with keywords (e.g. Order). */
function qid(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

export async function dbList(DB, table) {
  const { results } = await DB.prepare(\`SELECT * FROM \${qid(table)} ORDER BY \${qid("created_at")} DESC\`).all();
  return results ?? [];
}

export async function dbGet(DB, table, id) {
  return await DB.prepare(\`SELECT * FROM \${qid(table)} WHERE id = ?\`).bind(id).first();
}

export async function dbCount(DB, table) {
  const row = await DB.prepare(\`SELECT COUNT(*) AS n FROM \${qid(table)}\`).first();
  return row ? Number(row.n) : 0;
}

export async function dbInsert(DB, table, columns, values) {
  const quotedCols = columns.map(qid).join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  await DB.prepare(\`INSERT INTO \${qid(table)} (\${qid("id")}, \${quotedCols}) VALUES (?, \${placeholders})\`)
    .bind(crypto.randomUUID(), ...values)
    .run();
}

export async function dbUpdate(DB, table, columns, values, id) {
  const sets = columns.map(c => \`\${qid(c)} = ?\`).join(", ");
  await DB.prepare(\`UPDATE \${qid(table)} SET \${sets} WHERE id = ?\`)
    .bind(...values, id)
    .run();
}

export async function dbDelete(DB, table, id) {
  await DB.prepare(\`DELETE FROM \${qid(table)} WHERE id = ?\`).bind(id).run();
}
`;
}
function buildIndexJs() {
  return `// Worker entry \u2014 generic CRUD router driven by src/config.js.
// No build step, no npm dependencies \u2014 Web-standard APIs + D1 binding only.
import { ENTITIES, APP_NAME } from "./config.js";
import { layout, setNavLinks, setAppTitle, escHtml, humanize, fmtDateTime } from "./lib/html.js";
import { dbList, dbGet, dbInsert, dbUpdate, dbDelete, dbCount } from "./lib/db.js";

// Build nav + brand once at module load (after ENTITIES is available).
const APP_TITLE = humanize(APP_NAME);
setAppTitle(APP_TITLE);
setNavLinks([
  { href: "/", label: "Panoramica" },
  ...ENTITIES.map(e => ({ href: "/" + e.slug, label: humanize(e.name) })),
]);

// ---------------------------------------------------------------------------
// HTML page renderers
// ---------------------------------------------------------------------------

/** Render a single value for display: booleans as \u2713/\u2014 badges, datetimes it-IT, ids monospace. */
function fmtCell(field, value) {
  if (field.type === "boolean") {
    return value
      ? '<span class="badge badge-on" title="S\xEC">\u2713</span>'
      : '<span class="badge badge-off" title="No">\u2014</span>';
  }
  if (field.type === "datetime") return escHtml(fmtDateTime(value));
  if (field.type === "id") return \`<span class="mono">\${escHtml(value ?? "")}</span>\`;
  return escHtml(value ?? "");
}

function renderDashboard(counts) {
  const cards = ENTITIES.map(e => {
    const n = counts[e.slug] ?? 0;
    return \`<div class="card stat-card">
      <div class="eyebrow">\${escHtml(humanize(e.name))}</div>
      <div class="stat-value">\${escHtml(String(n))}</div>
      <div class="stat-sub">\${n === 1 ? "elemento" : "elementi"}</div>
      <div class="stat-actions">
        <a href="/\${e.slug}">Vedi tutti</a>
        <a href="/\${e.slug}/new">+ Nuovo</a>
      </div>
    </div>\`;
  }).join("");
  return layout(APP_TITLE + " \u2014 Panoramica",
    \`<div class="page-head">
       <div>
         <h1>Panoramica</h1>
         <p class="page-sub">Benvenuto in \${escHtml(APP_TITLE)}. Ecco lo stato dei tuoi dati.</p>
       </div>
     </div>
     <div class="dashboard-grid">\${cards}</div>\`, "/");
}

const EMPTY_GLYPH = '<svg class="empty-glyph" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l3-8h12l3 8"/><path d="M3 13v6h18v-6"/><path d="M3 13h5l2 3h4l2-3h5"/></svg>';

function renderList(entity, rows) {
  const cols = [
    { name: "id", type: "id" },
    { name: "created_at", type: "datetime" },
    ...entity.fields,
  ];
  let content;
  if (rows.length === 0) {
    content = \`<div class="card empty">
       \${EMPTY_GLYPH}
       <h2>Nessun elemento ancora</h2>
       <p>Quando crei un elemento lo trovi qui, pronto da consultare.</p>
       <a href="/\${entity.slug}/new" class="btn btn-primary">Crea il primo</a>
     </div>\`;
  } else {
    const ths = cols.map(c => \`<th>\${escHtml(humanize(c.name))}</th>\`).join("");
    const trs = rows.map(row => {
      const tds = cols.map(c => \`<td>\${fmtCell(c, row[c.name])}</td>\`).join("");
      return \`<tr>\${tds}<td><a href="/\${entity.slug}/\${escHtml(row.id)}" class="row-link">Apri</a></td></tr>\`;
    }).join("");
    content = \`<div class="card table-card"><table><thead><tr>\${ths}<th></th></tr></thead><tbody>\${trs}</tbody></table></div>\`;
  }
  return layout(humanize(entity.name) + " \u2014 " + APP_TITLE,
    \`<div class="page-head">
       <div>
         <div class="eyebrow">Archivio</div>
         <h1>\${escHtml(humanize(entity.name))}</h1>
       </div>
       <a href="/\${entity.slug}/new" class="btn btn-primary">+ Nuovo</a>
     </div>
     \${content}\`, "/" + entity.slug);
}

function renderForm(entity, row, error) {
  const isEdit = row && row.id;
  const action = isEdit ? \`/\${entity.slug}/\${escHtml(row.id)}\` : \`/\${entity.slug}\`;
  const inputs = entity.fields.map(f => {
    const val = row ? escHtml(row[f.name] ?? "") : "";
    const req = f.required ? " required" : "";
    const label = escHtml(humanize(f.name));
    if (f.type === "boolean") {
      const checked = row && row[f.name] ? " checked" : "";
      return \`<label class="check-row"><input type="checkbox" name="\${f.name}" value="1"\${checked} /><span>\${label}</span></label>\`;
    }
    let input;
    if (f.type === "integer") {
      input = \`<input type="number" name="\${f.name}" value="\${val}"\${req} />\`;
    } else if (f.type === "datetime") {
      input = \`<input type="datetime-local" name="\${f.name}" value="\${val}"\${req} />\`;
    } else {
      input = \`<input type="text" name="\${f.name}" value="\${val}"\${req} />\`;
    }
    return \`<label><span>\${label}\${f.required ? ' <em class="req">*</em>' : ""}</span>\${input}</label>\`;
  }).join("");
  const errorHtml = error ? \`<div class="error" role="alert">\${escHtml(error)}</div>\` : "";
  const deleteForm = isEdit
    ? \`<form method="POST" action="/\${entity.slug}/\${escHtml(row.id)}/delete" class="danger-zone">
         <button type="submit" class="btn btn-danger" onclick="return confirm('Eliminare questo elemento?')">Elimina</button>
       </form>\`
    : "";
  return layout((isEdit ? "Modifica " : "Nuovo ") + humanize(entity.name) + " \u2014 " + APP_TITLE,
    \`<div class="page-head">
       <div>
         <div class="eyebrow">\${escHtml(humanize(entity.name))}</div>
         <h1>\${isEdit ? "Modifica" : "Nuovo elemento"}</h1>
       </div>
     </div>
     <form method="POST" action="\${action}" class="card form-card">
       \${errorHtml}\${inputs}
       <div class="actions">
         <button type="submit" class="btn btn-primary">\${isEdit ? "Salva modifiche" : "Crea"}</button>
         <a href="/\${entity.slug}" class="btn btn-ghost">Annulla</a>
       </div>
     </form>
     \${deleteForm}\`, "/" + entity.slug);
}

function renderDetail(entity, row) {
  const fields = [
    { name: "id", type: "id" },
    { name: "created_at", type: "datetime" },
    ...entity.fields,
  ];
  const fieldHtml = fields.map(f =>
    \`<div class="field-row">
       <div class="field-label">\${escHtml(humanize(f.name))}</div>
       <div class="field-value">\${fmtCell(f, row[f.name])}</div>
     </div>\`
  ).join("");
  return layout(humanize(entity.name) + " \u2014 " + APP_TITLE,
    \`<div class="page-head">
       <div>
         <div class="eyebrow">\${escHtml(humanize(entity.name))}</div>
         <h1>Dettaglio</h1>
       </div>
       <div class="actions">
         <a href="/\${entity.slug}/\${escHtml(row.id)}/edit" class="btn btn-primary">Modifica</a>
         <form method="POST" action="/\${entity.slug}/\${escHtml(row.id)}/delete" class="inline-form">
           <button type="submit" class="btn btn-danger" onclick="return confirm('Eliminare questo elemento?')">Elimina</button>
         </form>
       </div>
     </div>
     <div class="card detail-card">\${fieldHtml}</div>
     <div class="actions back-row">
       <a href="/\${entity.slug}" class="btn btn-ghost">Torna alla lista</a>
     </div>\`, "/" + entity.slug);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateFormData(entity, data) {
  for (const f of entity.fields) {
    if (f.required && !data[f.name]) {
      return \`Il campo \xAB\${humanize(f.name)}\xBB \xE8 obbligatorio.\`;
    }
  }
  return null;
}

function extractFields(entity, formData) {
  const cols = [];
  const vals = [];
  for (const f of entity.fields) {
    cols.push(f.name);
    if (f.type === "boolean") {
      vals.push(formData.get(f.name) === "1" ? 1 : 0);
    } else {
      const v = formData.get(f.name);
      vals.push(v === "" ? null : v);
    }
  }
  return { cols, vals };
}

// ---------------------------------------------------------------------------
// Request router
// ---------------------------------------------------------------------------

async function handleRequest(request, DB) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Dashboard \u2014 live record count per entity
  if (path === "/" && method === "GET") {
    const counts = {};
    for (const e of ENTITIES) {
      counts[e.slug] = await dbCount(DB, e.table);
    }
    return new Response(renderDashboard(counts), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }

  for (const entity of ENTITIES) {
    const base = "/" + entity.slug;

    // GET /slug  \u2014 list
    if (path === base && method === "GET") {
      const rows = await dbList(DB, entity.table);
      return new Response(renderList(entity, rows), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // GET /slug/new  \u2014 new form
    if (path === base + "/new" && method === "GET") {
      return new Response(renderForm(entity, null, null), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // POST /slug  \u2014 create
    if (path === base && method === "POST") {
      const fd = await request.formData();
      const data = Object.fromEntries(fd.entries());
      const error = validateFormData(entity, data);
      if (error) {
        return new Response(renderForm(entity, data, error), { status: 422, headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }
      const { cols, vals } = extractFields(entity, fd);
      await dbInsert(DB, entity.table, cols, vals);
      return Response.redirect(url.origin + base, 303);
    }

    // Routes with /:id
    const idMatch = path.match(new RegExp("^" + base + "/([^/]+)$"));
    if (idMatch) {
      const id = idMatch[1];

      // GET /slug/:id  \u2014 detail
      if (method === "GET") {
        const row = await dbGet(DB, entity.table, id);
        if (!row) return new Response("Not found", { status: 404 });
        return new Response(renderDetail(entity, row), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      // POST /slug/:id  \u2014 update
      if (method === "POST") {
        const fd = await request.formData();
        const data = Object.fromEntries(fd.entries());
        const error = validateFormData(entity, data);
        if (error) {
          const row = await dbGet(DB, entity.table, id);
          return new Response(renderForm(entity, { ...row, ...data }, error), { status: 422, headers: { "Content-Type": "text/html;charset=UTF-8" } });
        }
        const { cols, vals } = extractFields(entity, fd);
        await dbUpdate(DB, entity.table, cols, vals, id);
        return Response.redirect(url.origin + base + "/" + id, 303);
      }
    }

    // POST /slug/:id/edit  \u2014 alias to update (for browsers that only support GET/POST)
    const editMatch = path.match(new RegExp("^" + base + "/([^/]+)/edit$"));
    if (editMatch && method === "GET") {
      const id = editMatch[1];
      const row = await dbGet(DB, entity.table, id);
      if (!row) return new Response("Not found", { status: 404 });
      return new Response(renderForm(entity, row, null), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // POST /slug/:id/delete  \u2014 delete
    const delMatch = path.match(new RegExp("^" + base + "/([^/]+)/delete$"));
    if (delMatch && method === "POST") {
      const id = delMatch[1];
      await dbDelete(DB, entity.table, id);
      return Response.redirect(url.origin + base, 303);
    }
  }

  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env.DB);
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
`;
}
function buildWranglerToml(spec) {
  return [
    `name = "${spec.name}-app"`,
    `main = "src/index.js"`,
    `compatibility_date = "2026-05-26"`,
    ``,
    `[[d1_databases]]`,
    `binding = "DB"`,
    `database_name = "${spec.name}-db"`,
    `database_id = "REPLACE_WITH_YOUR_D1_ID"`,
    ``
  ].join("\n");
}
function buildReadme(spec) {
  return [
    `# ${escapeHtml(spec.name)}`,
    ``,
    `${spec.description}`,
    ``,
    `## Deploy (3 commands)`,
    ``,
    `\`\`\`bash`,
    `# 1. Create the D1 database and note the database_id in the output`,
    `wrangler d1 create ${spec.name}-db`,
    ``,
    `# 2. Update wrangler.toml: replace REPLACE_WITH_YOUR_D1_ID with the id from step 1`,
    ``,
    `# 3. Apply the schema migration`,
    `wrangler d1 execute ${spec.name}-db --file=migrations/0000_init.sql`,
    ``,
    `# 4. Deploy`,
    `wrangler deploy`,
    `\`\`\``,
    ``,
    `## Entities`,
    ``,
    ...spec.entities.map(
      (e) => `- **${escapeHtml(e.name)}**: ${e.fields.map((f) => `${escapeHtml(f.name)} (${escapeHtml(f.type)})`).join(", ")}`
    ),
    ``
  ].join("\n");
}
function buildProjectFiles(spec) {
  assertSafe("spec.name", spec.name, SAFE_SLUG);
  for (const entity of spec.entities) {
    assertSafe("entity.name", entity.name, SAFE_IDENT);
    for (const f of entity.fields) {
      assertSafe("entity.field.name", f.name, SAFE_IDENT);
      if (RESERVED_FIELD_NAMES.has(f.name)) {
        throw new Error(
          `reserved field name "${f.name}" on entity "${entity.name}": this column is auto-generated, pick a different name`
        );
      }
    }
  }
  return {
    "README.md": buildReadme(spec),
    "wrangler.toml": buildWranglerToml(spec),
    "migrations/0000_init.sql": buildMigration(spec),
    "src/index.js": buildIndexJs(),
    "src/lib/html.js": buildHtmlJs(),
    "src/lib/db.js": buildDbJs(),
    "src/config.js": buildConfigJs(spec)
  };
}

// src/cli.ts
async function main(argv) {
  const [specPath, outDir] = argv;
  if (!specPath || !outDir) {
    process.stderr.write(
      "Usage: node tora-codegen.mjs <spec.json-path> <out-dir>\n"
    );
    process.stdout.write(
      JSON.stringify({ ok: false, error: "missing arguments" }) + "\n"
    );
    process.exit(1);
  }
  let spec;
  try {
    const raw = readFileSync(specPath, "utf8");
    spec = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[tora-codegen] Failed to read spec: ${msg}
`);
    process.stdout.write(
      JSON.stringify({ ok: false, error: `read spec: ${msg.slice(0, 120)}` }) + "\n"
    );
    process.exit(1);
  }
  let files;
  try {
    files = buildProjectFiles(spec);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[tora-codegen] buildProjectFiles failed: ${msg}
`);
    process.stdout.write(
      JSON.stringify({ ok: false, error: `codegen: ${msg.slice(0, 120)}` }) + "\n"
    );
    process.exit(1);
  }
  try {
    for (const [relPath, content] of Object.entries(files)) {
      const absPath = join(outDir, relPath);
      mkdirSync(dirname(absPath), { recursive: true });
      writeFileSync(absPath, content, "utf8");
      process.stderr.write(`[tora-codegen] wrote ${relPath}
`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[tora-codegen] Error writing output: ${msg}
`);
    process.stdout.write(
      JSON.stringify({ ok: false, error: `write: ${msg.slice(0, 120)}` }) + "\n"
    );
    process.exit(1);
  }
  process.stdout.write(
    JSON.stringify({ ok: true, files: Object.keys(files).length }) + "\n"
  );
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("tora-codegen.mjs")) {
  main(process.argv.slice(2));
}
export {
  main
};
