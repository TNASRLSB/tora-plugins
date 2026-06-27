# Tora-Deployer plugin for Claude Code

Porta un progetto al deploy su TORA Cloud direttamente da Claude Code. Due percorsi:
**sito statico esistente** (Astro/Vite/HTML) e **app gestionale CRUD da zero** (generata da una
descrizione in linguaggio naturale). La build è client-side; il deploy avviene via un tool MCP
che pubblica un Worker su TORA Cloud e restituisce l'URL pubblico.

## Status

MVP completo: generazione locale, anteprima locale, e **deploy in produzione live**.
Backend di deploy attivo su `https://mcp.toranoai.com/mcp`. Pubblicato sul marketplace
pubblico `TNASRLSB/tora-plugins` (installazione via `/plugin marketplace add`).

Skill implementate: `hello`, `start`, `start-deploy`, `deploy-crud`, `deploy-static`,
`preview`, `preview-stop`.

## Install: utente (marketplace pubblico)

Dentro Claude Code:

```
/plugin marketplace add TNASRLSB/tora-plugins
/plugin install tora-deployer@tora-plugins
/reload-plugins
```

Poi verifica con `/tora-deployer:hello`.

## Install: sviluppo locale

Aggiungi a `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "tora-plugins-local": {
      "source": {
        "source": "directory",
        "path": "/path/to/tora-mcp-pro/plugins/claude-code/tora-deployer"
      }
    }
  },
  "enabledPlugins": {
    "tora-deployer@tora-plugins-local": true
  }
}
```

Poi apri Claude Code in qualsiasi cartella e usa le skill qui sotto.

## Autenticazione

Il deploy in produzione richiede un account TORA. Il server MCP usa **OAuth 2.0 PKCE**:
al primo deploy Claude Code apre il login nel browser, senza token da incollare a mano.
Solo le email dei domini TORA (`@acmsolution.it`, `@toranoai.com`) sono ammesse.

L'**anteprima locale** è gratuita e non richiede login.

## Skills

| Skill | Descrizione |
|---|---|
| `/tora-deployer:hello` | Guida introduttiva — conferma che il plugin è caricato |
| `/tora-deployer:start-deploy` | **Punto d'ingresso unico**: check → smistamento → anteprima o deploy |
| `/tora-deployer:start` | Intervista → scrive `./spec.json` (app CRUD nuove) |
| `/tora-deployer:deploy-static` | Ramo statico: builda un sito esistente e prepara i file |
| `/tora-deployer:deploy-crud` | Ramo CRUD: genera un Worker da spec, Claude cura solo `src/views.js`, guardia di integrità, deploy |
| `/tora-deployer:preview` | Avvia il server di sviluppo locale, restituisce l'URL |
| `/tora-deployer:preview-stop` | Ferma il server di sviluppo |

## Flusso tipico

```text
/tora-deployer:start-deploy   ← descrivi/punta il progetto, la procedura ti guida
                              → ramo statico o CRUD
                              → anteprima locale (gratis) oppure deploy in produzione
```

In produzione l'output viene caricato dall'uploader (`tora-upload.mjs`) e il tool MCP
`deploy_to_tora_cloud` riceve `{ projectName, uploadId, options }`, pubblica un User Worker e
restituisce `https://<slug>.toranoai.com`.

## App CRUD generata

Il ramo CRUD genera, in modo deterministico (`bin/tora-codegen.mjs`), un Cloudflare Worker
**senza build né dipendenze npm** (solo API Web standard + binding D1):

- auth **email + password** con sessioni in D1 (token random, in DB solo lo SHA-256; nessun segreto)
- ruoli/permessi dallo spec (`canAccess()`), con ruoli `is_admin`/`is_default` espliciti
- rotte CRUD (lista, nuovo, dettaglio/modifica, elimina) per ogni entità
- area amministrazione integrata: cambio password (`/account/password`) e gestione utenti (`/admin/users`)
- migration SQL in `migrations/0000_init.sql` (tabelle `users`/`sessions` + entità)

**Confine motore/UI**: i file motore (`src/index.js`, `src/lib/*.js`, `src/config.js`, migration)
sono la fonte di verità del comportamento e non vanno toccati; Claude personalizza SOLO `src/views.js`.
Una guardia (`bin/tora-integrity.mjs`) confronta gli hash dei file motore prima dell'upload e blocca
il deploy se sono stati modificati. In anteprima locale il login è aggirato (`DEV_AUTH_BYPASS`);
in produzione deploy-core ignora il `wrangler.toml` caricato, quindi il bypass non può arrivare online.
L'admin di produzione è seedato al deploy da `bin/tora-seed-admin.mjs`.

## Requirements spec

`/tora-deployer:start` scrive `./spec.json`. Schema:

```text
plugins/claude-code/tora-deployer/skills/start/schema.json
```

Esempi fixture:

```text
plugins/claude-code/tora-deployer/tests/fixtures/spec.valid.json
plugins/claude-code/tora-deployer/tests/fixtures/spec.invalid.json
```

Tipi di campo: `text`, `integer`, `boolean`, `datetime`, `reference`. I ruoli marcano
esattamente un `is_admin` e un `is_default`; `auth.admin_email` è opzionale. `auth.type`
vale `"password"` (unica modalità): login email+password.

## Binari del generatore

Il ramo CRUD usa i bin bundlati in `bin/` (generati da `packages/codegen` con
`npm run build:plugin-bin`):

```text
bin/tora-codegen.mjs      genera il Worker dallo spec
bin/tora-integrity.mjs    guardia: hash dei file motore + scan bypass
bin/tora-seed-admin.mjs   crea l'INSERT dell'admin (hash compatibile con auth.js)
bin/tora-upload.mjs       impacchetta e carica l'output su R2
```

## Integrazione MCP

Il `.mcp.json` nella directory del plugin punta a `https://mcp.toranoai.com/mcp`, il server
di deploy live. Il tool esposto è `deploy_to_tora_cloud`.

## Layout repository

```text
plugins/claude-code/tora-deployer/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   ├── hello/SKILL.md
│   ├── start/SKILL.md + schema.json
│   ├── preview/SKILL.md
│   ├── preview-stop/SKILL.md
│   ├── start-deploy/SKILL.md
│   ├── deploy-static/SKILL.md
│   └── deploy-crud/SKILL.md
├── bin/
│   ├── tora-codegen.mjs
│   ├── tora-integrity.mjs
│   ├── tora-seed-admin.mjs
│   └── tora-upload.mjs
├── tests/fixtures/
└── README.md
```
