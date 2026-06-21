---
description: Ramo CRUD di tora:start-deploy. Da un spec.json valido genera la base funzionale con la libreria @toranoai/codegen (deterministica), poi Claude genera lo strato UI sopra le API, carica l'output tramite l'uploader e avvia il deploy su TORA Cloud.
---

# TORA — ramo CRUD (app da spec.json)

## Quando si attiva
Da `tora:start-deploy`, quando l'utente vuole costruire un'app gestionale. Richiede un `spec.json`
valido v0.1 (prodotto da `tora-deployer:start`).

## Processo

### 1. Genera la BASE (deterministica)
- Invoca la libreria `@toranoai/codegen` (`buildProjectFiles(spec)`) → file della base:
  README, wrangler.toml, migrations/0000_init.sql, src/index.js, src/lib/html.js, src/lib/db.js, src/config.js.
- Scrivi i file generati in una directory di output (es. `<slug>-dist/`).
- NON modificare a mano i moduli base (index.js/db.js/config.js): sono la fonte di verità del funzionale
  (router CRUD, auth, permessi, accesso D1).

### 2. Genera la UI (Claude)
- Sopra le API CRUD della base, genera lo strato di presentazione (pagine/markup/stile) nella stessa directory di output.
- Confine RIGIDO: la UI non tocca dati/logica/auth/permessi (quelli sono nella base).
- Per l'MVP la UI può essere funzionale e semplice.
- **NON includere** il `wrangler.toml` generato dalla libreria nella directory di output: il deploy-core
  imposta il proprio metadata.

### 3. Carica l'output (NON leggere i file nel contesto)
Esegui l'uploader, che impacchetta e carica i byte senza farli passare per la chat:
`node ${CLAUDE_PLUGIN_ROOT}/bin/tora-upload.mjs <output-dir> --project <slug>`
Leggi SOLO il JSON su stdout: `{ uploadId, ok }`. NON leggere i file di output uno per uno.

### 4. Deploy
- `projectName` = `spec.name` (già kebab-case validato).
- Chiama il tool MCP `deploy_to_tora_cloud` con:
  ```
  {
    projectName: <slug>,
    uploadId,
    options: {
      needsDb: true,
      migrationSql: <contenuto di <slug>-dist/migrations/0000_init.sql>,
      specJson: <spec.json serializzato>
    }
  }
  ```
- Mostra l'URL pubblico restituito.

## Vincoli
- La base la genera la LIBRERIA, non Claude a mano (evita il caos del vecchio flusso a due generatori).
- Claude genera SOLO la UI.
- NON costruire una mappa `files` né leggere i file di output nel contesto: l'uploader gestisce il trasferimento dei byte.
- Non includere il `wrangler.toml` dell'artefatto tra i file caricati.
