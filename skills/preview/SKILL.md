---
description: Use when the user wants to preview a generated TORA CRUD app locally before deploying — running it on their machine to click through it. The app is a Cloudflare Worker with D1; login is bypassed locally.
---

# TORA — preview (local Worker preview)

## When this applies
A generated CRUD project directory — it contains `wrangler.toml` and `src/index.js`
(and `src/views.js`, `migrations/`). NOT the plugin repo itself. The generated app has
no `package.json` and no npm dependencies.

## Read first — two facts that save hours
- It is a **Cloudflare Worker with a D1 binding**, so it runs with **`wrangler dev`**,
  NOT `vite` / `npm run dev`. There is nothing to `npm install`.
- **Login is already bypassed locally.** `wrangler.toml` sets `[vars] DEV_AUTH_BYPASS = "1"`,
  so every request is authenticated as admin and the login page never appears. This is by
  design. Do NOT debug authentication during local preview.

## Process

### 1. Find the project directory
Use the dir containing both `wrangler.toml` and `src/index.js`. If run from a parent,
search immediate children, then depth 2; if multiple match, ask which one.

### 2. Compute stable /tmp paths
From the resolved project path, derive a sha1 and use:
`/tmp/tora-preview-<sha1>.pid`, `.log`, `.project`. Stable paths keep one server per project.

### 3. Reuse a running server if present
If the PID file exists and `kill -0 <pid>` succeeds, the server is already up: read the URL
from the log and return it. `wrangler dev` watches files and reloads on save, so edits to
`src/views.js` are picked up automatically — do NOT restart for a UI change. Restarting
also tends to pick a new port, breaking any SSH tunnel/bookmark.

### 4. Apply local D1 migrations
```bash
npx wrangler d1 execute DB --local --file=./migrations/0000_init.sql
```
`DB` is the binding name. Always `--local`. Never run remote migrations from preview.

### 5. Start wrangler dev in the background (robust launch)
```bash
: > "$LOG"
printf '%s\n' "$PWD" > "$PROJECT"
nohup npx wrangler dev --port 8787 >> "$LOG" 2>&1 < /dev/null &
printf '%s\n' "$!" > "$PID"
```
Why this exact shape (lessons from a real session that lost hours):
- `nohup … < /dev/null &` — `wrangler dev` exits immediately if it inherits an interactive
  stdin; redirect stdin from `/dev/null` and detach with `nohup`.
- Do NOT pass flags that don't exist (e.g. `--no-open`).
- `--port 8787` keeps the port stable so an SSH tunnel set up once keeps working. If 8787
  is taken, pick ONE fixed alternative and tell the user the port once — don't let it drift.

### 6. Wait for and parse the URL
Poll the log up to ~40s for `Ready on http://localhost:<port>` (or any
`http://localhost:<port>` / `127.0.0.1:<port>`). If none appears: show the last ~80 log
lines and whether the PID is alive.

### 7. Final response
Report, in the user's language:
- project dir, preview URL, PID file, log file
- **"Login is already bypassed: you are admin, no sign-in needed."**
- If remote (e.g. over SSH), the tunnel hint:
  `ssh -N -L 8787:localhost:8787 user@host` → open `http://localhost:8787/`
- Stop it with `/tora-deployer:preview-stop`.

## Red flags — STOP
- About to debug the login / "fix" auth because you see (or expect) a login page locally
  → STOP. It is bypassed by design; real login only exists in production.
- About to run `vite` / `npm run dev` / `npm install` → wrong: this is a Worker, use `wrangler dev`.
- About to restart a healthy server to apply a `views.js` edit → don't; wrangler reloads on save.
- `wrangler dev` died instantly → you forgot `nohup … < /dev/null`; relaunch as in step 5.

## Constraints
- Do not edit project source files from this skill (preview only).
- Do not deploy, and never run remote D1 migrations.
- One dev server per project; use `/tmp` for PID/log.
