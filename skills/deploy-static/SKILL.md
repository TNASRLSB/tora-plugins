---
description: Ramo statico di tora:start-deploy. Rileva un progetto sito statico (Astro/Vite/HTML), lo builda localmente, raccoglie l'output e prepara la mappa di file (wrapper Worker servi-asset + asset) per il deploy su TORA Cloud.
---

# TORA — ramo statico (sito esistente)

## Quando si attiva
Da `tora-deployer:start-deploy`, quando la cartella contiene un sito statico esistente
(astro.config, package.json con build, o solo file .html).

## Processo

### 1. Rileva il tipo
- `astro.config.*` → Astro. Verifica che l'output sia statico (output 'static' o assente).
  Se 'server' (SSR) → avvisa: l'MVP supporta solo statico, fermati.
- `package.json` con script `build` (Vite/altri) → build statica.
- Solo `.html`/`.css`/asset, nessun package.json → sito grezzo, nessuna build.

### 2. Build (client-side)
- Se serve build e manca `node_modules` → `npm install`.
- `npm run build`. Output tipico: `dist/` (Astro/Vite). Se diverso, leggi la config.
- Salta se l'utente ha già una cartella di output pronta.
- Se la build fallisce → mostra l'errore npm e fermati (non inviare nulla).

### 3. Raccogli l'output → mappa `files`
- Leggi ricorsivamente la cartella di output. Ogni file → voce in `files` con il path RELATIVO
  alla cartella di output (es. `index.html`, `assets/app.css`).
- Aggiungi il **wrapper Worker** come `src/index.js`:
  ```js
  export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };
  ```
- Risultato: `files` = { "src/index.js": <wrapper>, "index.html": ..., "<asset>": ..., ... }.
  Il deploy-core distingue automaticamente i moduli (`src/*.js`) dagli asset statici (tutto il resto)
  e carica gli asset via Workers for Platforms.

### 4. Consegna alla coda comune
- `projectName` = nome sito (kebab-case; da package.json `name` o chiesto all'utente).
- `options` = { needsDb: false }.
- Prosegui con la coda comune di `tora-deployer:start-deploy` (scelta locale/produzione, invio).

## Vincoli
- Solo output statico (no SSR nell'MVP).
- Non modificare i file sorgente dell'utente.
- File binari grandi vengono caricati come asset (gestiti dal deploy-core via static assets WfP).
