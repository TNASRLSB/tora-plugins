---
description: Use when the user wants to build a new CRUD admin app from scratch on TORA and the requirements (entities, fields, roles, permissions) are not yet captured as a spec.json. Produces ./spec.json only — no code, no deploy.
---

# TORA — start (requirements → spec.json)

## When this applies
Reached from `tora-deployer:start-deploy` (CRUD branch), or when the user directly
asks to build an admin/management app and there is no `spec.json` yet.

## Goal
Interview the user and write a valid `./spec.json` describing what to build. This
skill captures requirements ONLY. Do not write code, choose libraries, or deploy.

Ask the user in their own language. Keep it to ~12 user turns; if you hit the limit,
summarize, state explicit assumptions, and write `spec.json`.

## What to capture

1. **Domain & purpose** — one question:
   > What do you want to build? e.g. a stationery inventory for the office, a CRM for
   > my gym, an internal ticketing system.

2. **Entities & fields** — the core "things" the app stores. For each entity, capture
   its fields. Each field has a `type` from: `text`, `integer`, `boolean`, `datetime`,
   `reference` (a link to another entity). Mark fields that are mandatory as `required`.
   Suggest sensible defaults if the user is unsure.

3. **Roles & permissions** — who uses the app and what each role may do per entity
   (subset of `create`, `read`, `update`, `delete`).

4. **Admin & default role (EXPLICIT)** — you MUST mark, with no guessing:
   - exactly one role as `is_admin: true` (the administrator),
   - exactly one role as `is_default: true` (assigned to new sign-ups).
   They can be the same role only if there is a single role.

5. **Admin email (optional)** — ask who the administrator is. If given, set
   `auth.admin_email`. Explain: the app uses **email + password** login; the person who
   signs up with the admin email becomes admin, everyone else gets the default role.
   (Do not promise magic links or external email services.)

## spec.json shape

Write `./spec.json` in the current directory. Minimal valid example:

```json
{
  "version": "0.1",
  "name": "cancelleria",
  "description": "Internal app to manage office stationery",
  "entities": [
    { "name": "Articolo", "fields": [
      { "name": "nome", "type": "text", "required": true },
      { "name": "quantita", "type": "integer" },
      { "name": "fornitore", "type": "reference", "references": "Fornitore" }
    ] },
    { "name": "Fornitore", "fields": [
      { "name": "nome", "type": "text", "required": true }
    ] }
  ],
  "roles": [
    { "name": "admin", "permissions": { "Articolo": ["create","read","update","delete"], "Fornitore": ["create","read","update","delete"] }, "is_admin": true, "is_default": false },
    { "name": "dipendente", "permissions": { "Articolo": ["read"] }, "is_admin": false, "is_default": true }
  ],
  "pages": [{ "type": "dashboard" }],
  "auth": { "type": "password", "admin_email": "capo@azienda.it" }
}
```

Naming: `name` is kebab-case (`^[a-z][a-z0-9-]{2,}$`); entity names are identifiers
(letters/digits/underscore); field names are identifiers and must not be `id` or
`created_at` (reserved). The generated app auto-creates a dashboard plus list/detail/
form pages per entity, so `pages` only needs `[{ "type": "dashboard" }]`.

## After writing
Validate that exactly one role has `is_admin: true` and exactly one has
`is_default: true`. Then tell the user the spec is ready and the next step is
`tora-deployer:deploy-crud`.

## Constraints
- Output `./spec.json` only. Do not generate code, install anything, or deploy.
- Do not interview about visual design or pages — that is handled later.
- `auth.type` is `"password"` (the only supported mode): login is email + password.
