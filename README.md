# TORA Build plugin for Claude Code

Porta un progetto al deploy su TORA Cloud direttamente da Claude Code. Due percorsi:
**sito statico esistente** (Astro/Vite/HTML) e **app gestionale CRUD da zero** (generata da una
descrizione in linguaggio naturale). La build è client-side; il deploy avviene via un tool MCP
che pubblica un Worker su TORA Cloud e restituisce l'URL pubblico.

## Status

MVP completo: generazione locale, anteprima locale, e **deploy in produzione live**.
Backend di deploy attivo su `https://mcp.toranoai.com/mcp`. Non ancora pubblicato su marketplace pubblici.

Skill implementate: `hello`, `start`, `generate`, `preview`, `preview-stop`,
`start-deploy`, `deploy-static`, `deploy-crud`.

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
(In alternativa, per test, è supportato un Bearer token statico `TORA_MCP_TOKEN` lato server.)

L'**anteprima locale** è gratuita e non richiede login.

## Skills

| Skill | Descrizione |
|---|---|
| `/tora-deployer:hello` | Guida introduttiva — conferma che il plugin è caricato |
| `/tora-deployer:start-deploy` | **Punto d'ingresso unico**: check → smistamento → anteprima o deploy |
| `/tora-deployer:start` | Intervista → scrive `./spec.json` (app CRUD nuove) |
| `/tora-deployer:generate` | Legge `spec.json` → genera l'app SvelteKit completa |
| `/tora-deployer:deploy-static` | Ramo statico: builda un sito esistente e prepara i file |
| `/tora-deployer:deploy-crud` | Ramo CRUD: genera la base da spec e prepara i file |
| `/tora-deployer:preview` | Avvia il server di sviluppo locale, restituisce l'URL |
| `/tora-deployer:preview-stop` | Ferma il server di sviluppo |

## Flusso tipico

```text
/tora-deployer:start-deploy   ← descrivi/punta il progetto, la procedura ti guida
                              → ramo statico o CRUD
                              → anteprima locale (gratis) oppure deploy in produzione
```

In produzione il tool MCP `deploy_to_tora_cloud` riceve `{ projectName, files, options, environment }`
(la **build è già fatta client-side**), pubblica un User Worker e restituisce
`https://<slug>.toranoai.com`.

## App CRUD generata

Il ramo CRUD include:

- SvelteKit + TypeScript + Cloudflare Workers adapter
- Drizzle ORM con D1 (SQLite)
- Magic-link auth (Resend o fallback `console.log` in dev)
- RBAC dai ruoli dello spec (`canAccess()`)
- Rotte CRUD (list, create, detail/edit) per ogni entità
- Migration SQL in `migrations/0001_init.sql`

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

Tipi di campo: `text`, `integer`, `boolean`, `datetime`, `reference`. Auth: `magic-link`.

## Starter template

`/tora-deployer:generate` copia da:

```text
plugins/claude-code/tora-deployer/templates/svelte-starter
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
│   ├── generate/SKILL.md
│   ├── preview/SKILL.md
│   ├── preview-stop/SKILL.md
│   ├── start-deploy/SKILL.md
│   ├── deploy-static/SKILL.md
│   └── deploy-crud/SKILL.md
├── templates/
│   └── svelte-starter/
├── tests/fixtures/
└── README.md
```
