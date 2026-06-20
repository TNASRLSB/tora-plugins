---
description: Gather product requirements from the user through structured clarifying questions and produce a spec.json ready for code generation. Use when the user wants to start a new TORA Build project.
---

# TORA Build — requirements gathering

## Goal

Interview the user to capture enough information to generate a working SvelteKit app on TORA Cloud. Produce `spec.json` in the current working directory, valid against `skills/start/schema.json`.

This skill captures product requirements only. Do not implement code, choose libraries, ask about frameworks, or deploy anything.

## Conversation budget

Use at most 12 total user-assistant turns for requirements gathering. If the conversation reaches the limit, summarize the best available requirements, make explicit assumptions, and write `spec.json`.

## Process

### 1. Domain and purpose

Ask one question:

> Cosa vuoi costruire? Esempi: un sistema ticket per i miei clienti, un CRM per la mia palestra, un portale interno per la mia azienda.

If the user already described the project, summarize your understanding and continue instead of asking again.

### 2. Core entities

Ask one or two questions:

> Quali sono le entità principali della tua app? Es. per un sistema ticket: Ticket, Cliente, Operatore. Per un CRM palestra: Iscritto, Abbonamento, Lezione.

If the user is unsure, propose a minimal default set based on the domain and ask for confirmation.

### 3. Fields and permissions per entity

For each entity, ask only what is necessary:

- Quali campi ha l'entità `<Entity>`? Posso suggerire default ragionevoli se vuoi.
- Chi può creare, leggere, modificare o cancellare istanze di `<Entity>`?

Normalize field types to only these five base types:

- `text`
- `integer`
- `boolean`
- `datetime`
- `reference`

Do not emit refined types such as `email`, `url`, `money`, `enum`, or `file` in `spec.json`. Represent them as `text` and preserve the semantic intent in field names or descriptions if needed.

### 4. Auth model

Ask one question:

> Chi accede all'app? Solo te, un piccolo team, oppure clienti esterni con email separata?

For MVP, always output:

```json
{
  "type": "magic-link"
}
```

Set `self_signup` to `true` only when external users/customers can register themselves.

### 5. UI pages

Ask one question:

> Quali pagine principali immagini? Se vuoi, posso proporre list view, detail view, form di creazione e dashboard.

Ensure at least one page exists for each main entity unless the user explicitly says it is only background data.

### 6. Completeness check

Before writing `spec.json`, verify internally:

- at least 1 entity exists
- every entity has at least 2 fields
- at least 1 role exists
- permissions mention valid entity names
- at least 1 page exists
- `reference` fields include `references`
- non-reference fields do not include `references`
- no field is named `id` or `created_at` — these columns are auto-generated on every
  table; if the user's domain needs such a field, pick a distinct name (e.g. `opened_at`)
- names are normalized:
  - app `name`: kebab-case
  - entity names: PascalCase
  - field names: snake_case
  - role names: lowercase kebab/snake case

If a requirement is missing, ask one final focused question. If the user cannot answer, choose a safe default and record the assumption in the final summary, not in `spec.json`.

## Output file

Write `spec.json` in the current working directory using the Write tool.

Use this JSON shape:

```json
{
  "$schema": "https://schemas.toranoai.com/spec/v0.1.json",
  "version": "0.1",
  "name": "ticket-system",
  "description": "A short product description in one or two sentences.",
  "entities": [
    {
      "name": "Ticket",
      "fields": [
        { "name": "title", "type": "text", "required": true },
        { "name": "status", "type": "text", "required": true },
        { "name": "created_at", "type": "datetime", "required": true },
        { "name": "customer", "type": "reference", "required": true, "references": "Customer" }
      ]
    }
  ],
  "roles": [
    {
      "name": "admin",
      "permissions": {
        "Ticket": ["create", "read", "update", "delete"]
      }
    }
  ],
  "pages": [
    { "type": "dashboard", "name": "Dashboard" },
    { "type": "list", "entity": "Ticket" },
    { "type": "detail", "entity": "Ticket" },
    { "type": "form", "entity": "Ticket" }
  ],
  "auth": {
    "type": "magic-link",
    "self_signup": false
  }
}
```

## After writing

After `spec.json` is written:

### 1. Consult the skill catalog

Read `skills/CATALOG.md` from the plugin directory. Check for skills with:
- `when: planning` — suggest them if the user seems uncertain about the design
- `when: ui` — mention them if `spec.pages` contains list, detail, or form pages

For each relevant external skill, mention it briefly. Do not fetch or activate it yet — just inform the user it exists and ask if they want to use it during generation.

Example:

```text
Ho notato che il tuo progetto ha pagine UI. Vuoi applicare uno stile visivo durante la generazione?
Posso usare la skill **ui-ux-pro-max** (67 stili, palette colori, font) per rendere l'app più curata.
```

### 2. Final reply

Reply with:

```text
Spec pronto in ./spec.json. Esegui /tora-deployer:generate per procedere alla generazione del codice.
```

Then include a short human-readable summary:

- app name
- entities
- roles
- pages
- assumptions made, if any
- skill suggestions, if any

## Constraints

- Do not ask about implementation technologies.
- Do not create any files other than `spec.json`.
- Do not run shell commands unless the user explicitly asks you to validate the file after writing it.
- Do not continue to code generation; that belongs to `/tora-deployer:generate`.
- If the user asks for code generation in the same turn, still finish only `spec.json` and tell them to run `/tora-deployer:generate` next.
