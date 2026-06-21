---
description: Ramo statico di tora:start-deploy. Rileva un progetto sito statico (Astro/Vite/HTML), lo builda localmente, carica l'output tramite l'uploader e avvia il deploy su TORA Cloud.
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

### 3. Carica l'output (NON leggere i file nel contesto)
Esegui l'uploader, che impacchetta e carica i byte senza farli passare per la chat:
`node ${CLAUDE_PLUGIN_ROOT}/bin/tora-upload.mjs <output-dir> --project <slug>`
Leggi SOLO il JSON su stdout: `{ uploadId, ok }`. NON leggere i file di output uno per uno.

### 4. Deploy
- `projectName` = nome sito (kebab-case; da package.json `name` o chiesto all'utente).
- Chiama il tool MCP `deploy_to_tora_cloud` con `{ projectName: <slug>, uploadId, options: { needsDb: false } }`.
- Mostra l'URL pubblico restituito.

## Vincoli
- Solo output statico (no SSR nell'MVP).
- Non modificare i file sorgente dell'utente.
- NON costruire una mappa `files` né leggere i file di output nel contesto: l'uploader gestisce il trasferimento dei byte.
