---
description: Use when there is a valid spec.json for a CRUD admin app and the user wants to generate, customize, and deploy it on TORA Cloud. Reached after tora-deployer:start.
---

# TORA — deploy-crud (generate, customize UI, deploy)

## When this applies
A valid `./spec.json` exists (from `tora-deployer:start`) and the user wants the working
app. The generator produces a Cloudflare Worker with email+password auth, roles/permissions,
CRUD for every entity, and a built-in admin area (change password at `/account/password`;
user management at `/admin/users` for the admin role). You customize only the look, then deploy.

## The motore / UI boundary (read first)
The generator splits the app into two zones:

- **MOTORE — never edit.** `src/index.js`, `src/lib/auth.js`, `src/lib/db.js`,
  `src/lib/ui-kit.js`, `src/lib/shell.js`, `src/config.js`, `migrations/0000_init.sql`.
  These are the router, auth, permissions, DB access — the source of truth for behavior.
- **UI — yours to rewrite.** `src/views.js` ONLY. CSS in `renderStyles()`, markup in the
  `render*` functions.

A deploy-time guard (step 4) re-generates the base and compares hashes: if any motore file
changed, the deploy is blocked.

## Process

### 1. Generate the base (deterministic)
```
node ${CLAUDE_PLUGIN_ROOT}/bin/tora-codegen.mjs <path/to/spec.json> <slug>-dist/
```
Read ONLY the stdout JSON `{ ok, files }`. If `ok` is `false`, show the error and stop.

### 2. Customize the UI — `src/views.js` ONLY
- Change CSS (`renderStyles()`) and markup (`render*`) freely.
- For form fields, ALWAYS use the `fieldInput()` / `formAction()` helpers from
  `src/lib/ui-kit.js`: they emit the `name`/URLs the router expects. Around them, any
  markup/style you like.
- Do NOT edit any motore file (see boundary) to "fix" behavior or shared helpers. Behavior
  lives in the motore and is verified at step 4.

### 3. Local preview (recommended)
Run `tora-deployer:preview`. Login is already bypassed locally — you are admin with no
sign-in. Do NOT debug auth locally; real login only exists in production.

### 4. Integrity guard (MANDATORY, before upload)
```
node ${CLAUDE_PLUGIN_ROOT}/bin/tora-integrity.mjs <path/to/spec.json> <slug>-dist/
```
Read the stdout JSON `{ ok, mismatches, bypassFound }`. Proceed ONLY if `ok` is true AND
`bypassFound` is empty. Otherwise STOP: list the changed motore files / bypass location,
restore them by regenerating the base (step 1) into a clean dir and re-applying only your
`views.js` changes, then re-run the guard. Never deploy on a failed guard.

### 5. Prepare the upload session
Call MCP tool `prepare_upload` with `{ projectName: <slug> }` → `{ uploadId, uploadToken }`.
Never show the uploadToken to the user; pass it only to the uploader.

### 6. Upload the output (do NOT read files into context)
```
node ${CLAUDE_PLUGIN_ROOT}/bin/tora-upload.mjs <slug>-dist/ --project <slug> --upload-token <uploadToken>
```
Read ONLY the stdout JSON `{ uploadId, ok }`. The archive includes `wrangler.toml`, but
deploy-core ignores it and builds its own Worker metadata (only the D1 binding) — so the
local-only `DEV_AUTH_BYPASS` in `wrangler.toml` can never reach production. (The guard at
step 4 is what guarantees no bypass logic is baked into the shipped JS modules.)

### 7. Seed the administrator account
Production login is real email+password, and the admin must already exist. Ask the user for
the administrator email, then create the admin seed using the role marked `is_admin` in
`spec.json` (call it `<ADMIN_ROLE>`):
```
node ${CLAUDE_PLUGIN_ROOT}/bin/tora-seed-admin.mjs <admin-email> <ADMIN_ROLE>
```
Read the stdout JSON `{ ok, password, sql }`. Keep `sql` for step 8 (it is the admin
`INSERT`). Give the `password` (and email) to the user — it is the admin's first login;
they can change it at `/account/password` once inside.

### 8. Deploy
The schema and the admin seed travel in SEPARATE fields — do NOT concatenate them.
`migrationSql` accepts only `CREATE TABLE`/`CREATE INDEX` (additive DDL); the admin `INSERT`
goes in its own `seedSql` field (deploy-core applies it to the D1 right after the schema).
Concatenating the `INSERT` into `migrationSql` is rejected with HTTP 400.

Call MCP tool `deploy_to_tora_cloud`:
```
{
  projectName: <slug>,
  uploadId,
  options: {
    needsDb: true,
    migrationSql: <contents of <slug>-dist/migrations/0000_init.sql>,
    seedSql: <admin seed `sql` from step 7>,
    specJson: <serialized spec.json>
  }
}
```
Show the returned public URL, plus the admin email + password from step 7.

## Red flags — STOP
- About to edit `index.js`/`auth.js`/`db.js`/`ui-kit.js`/`shell.js`/`config.js`/migration → don't; only `views.js`.
- Tempted to skip the integrity guard "because it's probably fine" → run it; it is mandatory.
- Writing the admin seed INTO `migrations/0000_init.sql` on disk → don't; pass it as the separate `seedSql` option at step 8.
- Concatenating the admin `INSERT` into `migrationSql` → don't; it is rejected (HTTP 400). Use the `seedSql` field.
- Debugging the login during local preview → stop; it is bypassed by design.

## Constraints
- The base is generated by the library; you only customize `src/views.js`.
- Do not build a `files` map or read output files into context — the uploader moves the bytes.
- The integrity guard (step 4) runs before every upload, no exceptions.
- The deployed app already includes change-password and admin user management — do not build them.
