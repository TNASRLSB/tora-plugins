---
description: Generate a full SvelteKit + Cloudflare D1 app from ./spec.json using the TORA Build starter template. Produces Drizzle schema, SQL migration, CRUD routes, auth (magic-link), and RBAC from spec roles. Use after /tora-deployer:start.
---

# TORA Build — code generation

## Goal

Generate a local, buildable SvelteKit app from `./spec.json`. The app must include:

- Drizzle schema (auth tables + spec entities)
- SQL migration for local D1 setup
- Magic-link auth (scaffold ready for Resend or console-log fallback)
- RBAC guard based on spec roles/permissions
- CRUD routes (list, create, detail/edit) for every entity in spec
- Dashboard page linking to all entities

Do not deploy. Do not call any MCP server. This skill is local generation only.

## Required inputs

- `./spec.json` in the current working directory
- Schema: `skills/start/schema.json` from this plugin
- Starter template: `templates/svelte-starter` from this plugin
- Skill catalog: `skills/CATALOG.md` from this plugin

If `spec.json` is missing, stop and reply:

```
Non trovo ./spec.json. Esegui prima /tora-deployer:start.
```

## Step 0 — Consult the skill catalog

Before generating, read `skills/CATALOG.md` from the plugin directory and check for active skill packs:

- If the spec has pages of type `list`, `detail`, or `form`, check for skills with `when: ui`
- If any external skill is relevant and the user has already confirmed they want it (from the `/tora-deployer:start` session), fetch the skill from its `source` URL and incorporate its instructions into the generation steps below
- If the user has not been asked yet, ask one short question before proceeding:

```text
Vuoi applicare uno stile visivo all'app? Posso usare ui-ux-pro-max per uno stile più curato.
Rispondi sì/no — oppure dimmi uno stile specifico (es. "minimal", "glassmorphism", "dark").
```

If the user declines or the spec has no UI pages, skip and proceed to Step 1.

---

## Step 1 — Read and validate `spec.json`

Read `./spec.json` and validate it against `skills/start/schema.json`.

Try:

```bash
npx --yes ajv-cli validate --spec=draft2020 -s <plugin-root>/skills/start/schema.json -d ./spec.json
```

If no validator is available, check manually:

- `version` = `"0.1"`
- `name` matches `^[a-z][a-z0-9-]{2,}$`
- `description` ≥ 10 characters
- At least one entity, each with ≥ 2 fields
- Entity names: PascalCase; field names: snake_case
- Field types: `text`, `integer`, `boolean`, `datetime`, `reference`
- `reference` fields have `references`; others do not
- At least one role; role permissions reference existing entity names
- At least one page; page entities reference existing entity names
- `auth.type` = `"magic-link"`

If validation fails, stop and explain errors in Italian.

---

## Step 2 — Prepare the output directory

Set `APP_DIR=./<spec.name>`.

If `APP_DIR` already exists, inspect it. If it looks like a previously generated app, update in place. Otherwise ask for confirmation before overwriting.

---

## Step 3 — Copy the starter template

Locate `templates/svelte-starter` in the plugin directory. Common paths:

```
plugins/claude-code/tora-deployer/templates/svelte-starter
./plugins/claude-code/tora-deployer/templates/svelte-starter
../plugins/claude-code/tora-deployer/templates/svelte-starter
```

Copy everything into `APP_DIR`, excluding `node_modules`, `.svelte-kit`, `build`, `.wrangler`, `.git`.

---

## Step 4 — Generate app-specific files

Generate or overwrite the following files in `APP_DIR`. Do not modify any other files.

### 4.1 — `package.json`: set app name

Update `package.json`:
- Set `"name"` to `spec.name`
- Keep all scripts and dependencies unchanged

### 4.2 — `wrangler.toml`: set app name and database name

Update `wrangler.toml`:
- Replace `name = "tora-svelte-starter"` with `name = "<spec.name>"`
- Replace `database_name = "tora-svelte-starter-db"` with `database_name = "<spec.name>-db"`
- Keep `migrations_dir = "migrations"` and all `[vars]` intact

### 4.3 — `src/lib/db/schema.ts`: full Drizzle schema

Generate a complete schema with:

1. Auth tables (always included, copy from template):

```ts
import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('<first-role-name-from-spec>'),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: integer('expires_at').notNull(),
  lastSeenAt: integer('last_seen_at').notNull(),
});

export const magicLinkTokens = sqliteTable('magic_link_tokens', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: integer('expires_at').notNull(),
  usedAt: integer('used_at'),
});
```

2. Entity tables — one per `spec.entities` entry:

- Table name: `<EntityName>` → `<entity_name>` (PascalCase → snake_case, no plural suffix, e.g. `Ticket` → `ticket`, `Cliente` → `cliente`). SQL table names must not be pluralized to avoid broken forms with non-English entity names.
- Always include `id text PRIMARY KEY` and `created_at integer NOT NULL`
- Field type mapping from spec:
  - `text` → `text('col').notNull()` (add `.notNull()` only if `required: true`)
  - `integer` → `integer('col')` (`.notNull()` if required)
  - `boolean` → `integer('col', { mode: 'boolean' })` (`.notNull()` if required)
  - `datetime` → `integer('col')` (stores ms timestamp) (`.notNull()` if required)
  - `reference` → `text('col')` pointing to referenced entity id (`.notNull()` if required)

Example for `Ticket` entity with fields `title: text (required)`, `created_at: datetime (required)`, `customer: reference→Customer (required)`:

```ts
export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: integer('created_at').notNull(),
  customerId: text('customer_id').notNull(),
});
```

3. Relations for ALL tables (required for `db.query.*` with `with:`):

```ts
// Auth relations — always include
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  magicLinkTokens: many(magicLinkTokens),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
export const magicLinkTokensRelations = relations(magicLinkTokens, ({ one }) => ({
  user: one(users, { fields: [magicLinkTokens.userId], references: [users.id] }),
}));

// Entity relations — one per entity; add `many` back-relations for referenced entities
export const ticketsRelations = relations(tickets, ({ one }) => ({
  customer: one(customers, { fields: [tickets.customerId], references: [customers.id] }),
}));
export const customersRelations = relations(customers, ({ many }) => ({
  tickets: many(tickets),
}));
```

### 4.4 — `migrations/0001_init.sql`: SQL DDL

Generate a single SQL file that creates all tables in the correct order (referenced tables first).

Template for auth tables:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT '<first-role-name>',
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON magic_link_tokens(expires_at);
```

Then one `CREATE TABLE` per entity. For each field:

- `text` → `TEXT`
- `integer` → `INTEGER`
- `boolean` → `INTEGER` (0/1)
- `datetime` → `INTEGER` (ms)
- `reference` → `TEXT` (no FK constraint needed for D1 compatibility)

Always add `id TEXT PRIMARY KEY` and `created_at INTEGER NOT NULL`. Add `updated_at INTEGER` for entities with update operations.

Example for `Ticket`:

```sql
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  customer_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
```

### 4.5 — `src/lib/auth/permissions.ts`: RBAC from spec roles

Generate a static permissions map and a `canAccess` function:

```ts
// Generated from spec.json roles — do not edit manually.
const PERMISSIONS: Record<string, Record<string, string[]>> = {
  admin: { Customer: ['create', 'read', 'update', 'delete'], Ticket: ['create', 'read', 'update', 'delete'] },
  operator: { Customer: ['read'], Ticket: ['create', 'read', 'update'] },
};

export function canAccess(
  role: string,
  entity: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  return PERMISSIONS[role]?.[entity]?.includes(action) ?? false;
}
```

Use the exact role names and entity names from spec. Entity names in the map must match the PascalCase names from spec (e.g., `"Ticket"`, not `"tickets"`).

### 4.6 — Entity CRUD routes

For each entity in `spec.entities`, generate these six files.

Use the route path `src/routes/<entity-slug>/` where `<entity-slug>` is the entity name lowercased **without pluralization** (e.g., `Ticket` → `ticket`, `Cliente` → `cliente`, `Istruttore` → `istruttore`). Do not append `-s` or any plural suffix — this avoids broken plurals with non-English words.

#### 4.6.1 — List page

`src/routes/<entity-slug>/+page.server.ts`:

```ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createDb } from '$lib/db/client';
import { canAccess } from '$lib/auth/permissions';
import { <entity-table> } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (!locals.user) throw error(401);
  if (!canAccess(locals.user.role, '<EntityName>', 'read')) throw error(403);
  const db = createDb(platform!.env.DB);
  const items = await db.select().from(<entity-table>).orderBy(<entity-table>.createdAt);
  return { items };
};

export const actions: Actions = {
  delete: async ({ request, locals, platform }) => {
    if (!locals.user || !canAccess(locals.user.role, '<EntityName>', 'delete')) throw error(403);
    const data = await request.formData();
    const id = String(data.get('id') ?? '');
    if (!id) throw error(400);
    const db = createDb(platform!.env.DB);
    await db.delete(<entity-table>).where(eq(<entity-table>.id, id));
    return { ok: true };
  },
};
```

`src/routes/<entity-slug>/+page.svelte` — renders a table with one column per field, plus a delete button for each row (only shown if `canAccess` for delete, checked via `data.user.role` passed from load). Add a "Nuovo" link to `/entity-slug/new`.

#### 4.6.2 — Create page

`src/routes/<entity-slug>/new/+page.server.ts`:

```ts
import { error, redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createDb } from '$lib/db/client';
import { canAccess } from '$lib/auth/permissions';
import { <entity-table>, <reference-tables-if-any> } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (!locals.user || !canAccess(locals.user.role, '<EntityName>', 'create')) throw error(403);
  const db = createDb(platform!.env.DB);
  // Load reference options for any reference fields
  // e.g.: const customers = await db.select({ id: customers.id, name: customers.name }).from(customers);
  return { /* reference options */ };
};

export const actions: Actions = {
  default: async ({ request, locals, platform }) => {
    if (!locals.user || !canAccess(locals.user.role, '<EntityName>', 'create')) throw error(403);
    const data = await request.formData();
    // Extract and validate fields from formData
    // Insert into DB with a random UUID id
    // redirect(303, '/<entity-slug>');
  },
};
```

`src/routes/<entity-slug>/new/+page.svelte` — a form with one input per field. `reference` fields use `<select>` populated from load data. On submit POST to default action.

#### 4.6.3 — Detail/Edit page

`src/routes/<entity-slug>/[id]/+page.server.ts`:

```ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createDb } from '$lib/db/client';
import { canAccess } from '$lib/auth/permissions';
import { <entity-table> } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
  if (!locals.user || !canAccess(locals.user.role, '<EntityName>', 'read')) throw error(403);
  const db = createDb(platform!.env.DB);
  const item = await db.select().from(<entity-table>).where(eq(<entity-table>.id, params.id)).get();
  if (!item) throw error(404);
  // Load reference options as in new page
  return { item };
};

export const actions: Actions = {
  update: async ({ request, params, locals, platform }) => {
    if (!locals.user || !canAccess(locals.user.role, '<EntityName>', 'update')) throw error(403);
    // Extract fields, update in DB
    // redirect(303, '/<entity-slug>/<id>');
  },
  delete: async ({ params, locals, platform }) => {
    if (!locals.user || !canAccess(locals.user.role, '<EntityName>', 'delete')) throw error(403);
    const db = createDb(platform!.env.DB);
    await db.delete(<entity-table>).where(eq(<entity-table>.id, params.id));
    throw redirect(303, '/<entity-slug>');
  },
};
```

`src/routes/<entity-slug>/[id]/+page.svelte` — detail view + pre-filled edit form. Show update and delete buttons only if role allows (check `canAccess` using `data.user.role` which comes from `data.user` in layout data).

**UUIDs:** For all `id` generation on create, use `crypto.randomUUID()` from the Web Crypto API (available in Workers):

```ts
const id = crypto.randomUUID();
```

Do not import `uuid` or `crypto` from Node.js. `crypto.randomUUID()` is globally available in Workers.

### 4.7 — `src/routes/+page.svelte`: dashboard

Replace the existing dashboard with:

- App name (`spec.name`) and description
- List of entities with links to their list pages (use the correct slug: entity name lowercased, no plural)
- Current user email and role
- Link to logout

Pass `data.user` (from layout) to show the current user's role and email.

### 4.7b — Self-signup login: assign least-privileged role

When `spec.auth.self_signup === true`, the login page must create new users automatically on first login. Use the **last role** in `spec.roles` as the default (it is conventionally the least-privileged role). Never hardcode a role name.

Example: if `spec.roles` is `[admin, istruttore, cliente]`, new self-signup users get `cliente`.

```ts
// In login +page.server.ts, when self_signup is true:
const defaultRole = spec.roles[spec.roles.length - 1].name; // last = least privileged
await db.insert(users).values({ id, email, role: defaultRole, status: 'active', createdAt: Date.now() });
```

Import spec at the top of the file to read the roles list:

```ts
import { spec } from '$lib/generated/spec';
```

### 4.7c — Dev login bypass route

Always generate `src/routes/dev/login/+page.server.ts`. This route auto-logs in as the first admin role — only active in dev mode (`import.meta.env.DEV`). In production it returns 404.

```ts
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/db/client';
import { createSession, SESSION_COOKIE } from '$lib/auth/sessions';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform, cookies, url }) => {
  if (!import.meta.env.DEV) throw error(404);

  const db = createDb(platform!.env.DB);
  const email = url.searchParams.get('email') ?? 'dev@localhost';
  const adminRole = '<first-role-from-spec>'; // e.g. 'admin'

  let user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(users).values({ id, email, role: adminRole, status: 'active', createdAt: Date.now() });
    user = (await db.query.users.findFirst({ where: eq(users.email, email) }))!;
  }

  const secret = platform?.env?.HMAC_SECRET ?? 'dev-secret-change-in-production';
  const sessionCookie = await createSession(db, user.id, secret);
  cookies.set(SESSION_COOKIE, sessionCookie, { path: '/', httpOnly: true, secure: false, sameSite: 'lax', maxAge: 86400 });
  throw redirect(302, '/');
};
```

This lets a developer log in instantly at `http://localhost:<port>/dev/login` without needing magic links. Mention this URL in the final response.

### 4.8 — `src/lib/generated/spec.ts` and `src/lib/generated/sample-data.ts`

Generate these exactly as before:

`spec.ts` — export the parsed spec as a typed constant.

`sample-data.ts` — 3 sample rows per entity, using field names and types to generate realistic values:

- `text`: readable text with field/entity name (e.g., `"Customer name 1"`)
- `integer`: small number
- `boolean`: alternating `true`/`false`
- `datetime`: `Date.now()` minus a few days (integer ms)
- `reference`: a hardcoded string id matching the sample rows of the referenced entity (e.g., `"customer-1"`)

---

## Step 5 — Install and validate

From inside `APP_DIR`, run:

```bash
npm install
npm run check
npm run build
```

If `npm run check` or `npm run build` fails, fix the generated files and rerun until both pass.

Common issues to fix:
- Missing `$types` imports in Svelte pages (run `npm run check` once to generate them)
- Drizzle column name mismatch (camelCase in schema vs snake_case in SQL)
- Missing `crypto.randomUUID` — it is globally available, no import needed

---

## Step 6 — Final response

Reply in Italian with:

```
Progetto generato in ./<spec.name>.
```

Then include:
- Entities generated with route paths (lowercased slug, no plural)
- Migration: `cd <spec.name> && npm run db:migrate:local` to apply locally
- Next step: `/tora-deployer:preview`
- Dev login: `http://localhost:<port>/dev/login` — instant admin login without magic link (dev only)
- Auth note: if `RESEND_API_KEY` is not set, magic links are printed to the dev server console

---

## Constraints

- Generate only under `./<spec.name>`
- Do not modify `spec.json`
- Do not deploy
- Do not create MCP config
- Do not add external UI libraries (Tailwind, shadcn, etc.) — keep plain HTML/CSS
- Keep generated code readable; prefer explicit over clever
