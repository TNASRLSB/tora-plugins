---
description: Ramo CRUD di tora:start-deploy. Da un spec.json valido genera la base funzionale con la libreria @toranoai/codegen (deterministica), poi Claude genera lo strato UI sopra le API, e prepara la mappa di file per il deploy.
---

# TORA — ramo CRUD (app da spec.json)

## Quando si attiva
Da `tora:start-deploy`, quando l'utente vuole costruire un'app gestionale. Richiede un `spec.json`
valido v0.1 (prodotto da `tora-deployer:start`).

## Processo

### 1. Genera la BASE (deterministica)
- Invoca la libreria `@toranoai/codegen` (`buildProjectFiles(spec)`) → file della base:
  README, wrangler.toml, migrations/0000_init.sql, src/index.js, src/lib/html.js, src/lib/db.js, src/config.js.
- NON modificare a mano i moduli base (index.js/db.js/config.js): sono la fonte di verità del funzionale
  (router CRUD, auth, permessi, accesso D1).

### 2. Genera la UI (Claude)
- Sopra le API CRUD della base, genera lo strato di presentazione (pagine/markup/stile).
- Confine RIGIDO: la UI non tocca dati/logica/auth/permessi (quelli sono nella base).
- Per l'MVP la UI può essere funzionale e semplice.

### 3. Prepara la mappa `files` per il deploy
- `files` = moduli runtime della base (`src/*.js`) + i file UI generati.
- `options.migrationSql` = contenuto di `migrations/0000_init.sql`.
- `options.needsDb` = true.
- `options.specJson` = lo spec.json serializzato (audit).
- **IGNORA** il `wrangler.toml` generato dalla libreria (NON metterlo in `files`): il deploy-core
  imposta il proprio metadata.

### 4. Consegna alla coda comune
- `projectName` = `spec.name` (già kebab-case validato).
- Prosegui con la coda comune di `tora-deployer:start-deploy` (scelta locale/produzione, invio via
  `deploy_to_tora_cloud`).

## Vincoli
- La base la genera la LIBRERIA, non Claude a mano (evita il caos del vecchio flusso a due generatori).
- Claude genera SOLO la UI.
- Non includere il `wrangler.toml` dell'artefatto tra i file inviati.
