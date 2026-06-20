---
description: Start a local preview for a generated TORA Build project. Detects package.json and wrangler.toml, installs dependencies when needed, can apply local D1 migrations, launches npm run dev in the background, and reports the Vite Local URL.
---

# TORA Build — local preview

## Goal

Start a generated TORA Build project locally and return the preview URL. This skill is for generated projects, not for this plugin repository itself.

A valid generated project is a directory containing both:

- `package.json`
- `wrangler.toml`

## Process

### 1. Find the generated project directory

Use the Bash tool to detect the project directory before running any install, migration, or server command.

Detection order:

1. If the current working directory contains both `package.json` and `wrangler.toml`, use it.
2. Otherwise search immediate child directories, then depth 2, for directories containing both files.
3. If exactly one match exists, use it.
4. If multiple matches exist, ask the user which directory to preview.
5. If no match exists, stop and say that `/tora-deployer:preview` must be run from a generated project directory or its parent.

Suggested discovery command:

```bash
python3 - <<'PY'
from pathlib import Path
root = Path.cwd()
matches = []
for depth in (0, 1, 2):
    candidates = [root] if depth == 0 else [p for p in root.glob('/'.join(['*'] * depth)) if p.is_dir()]
    for p in candidates:
        if (p / 'package.json').is_file() and (p / 'wrangler.toml').is_file():
            matches.append(p.resolve())
    if matches:
        break
print('\n'.join(str(p) for p in sorted(set(matches))))
PY
```

### 1b. Astro projects (static sites)

A project is an **Astro** project when it has an `astro.config.*` file
(`astro.config.mjs` / `.ts` / `.js`) and `astro` in `package.json` dependencies.
Astro static sites typically do **not** have a `wrangler.toml` — so for Astro,
relax the step-1 detection: accept a directory with `package.json` +
`astro.config.*` even without `wrangler.toml`. There is no local D1 for a static
Astro site, so **skip step 5 (migrations) entirely**.

Astro specifics that matter here:

- **Default dev port is `4321`** (not Vite's 5173). The dev server line looks like
  `🚀  astro  v... ready` followed by a `Local    http://localhost:4321/` line.
  The step-7 parser already accepts any port — just don't assume 5173.
- **Keep the port stable.** When (re)starting the server, force a fixed port and
  fail instead of sliding to a new one, so an SSH tunnel set up once keeps working.
  Start with an explicit strict port:

  ```bash
  setsid bash -lc 'npm run dev -- --port 4321 --strict-port' >> "$LOG" 2>&1 &
  ```

  If `4321` is taken by an unrelated process, pick one fixed alternative and tell
  the user the chosen port once — do not let it drift on every restart.
- **Graphical edits do NOT need a restart.** Astro HMR live-reloads the browser on
  every save. After editing `.astro` / CSS / component files, the existing preview
  at the same URL already reflects the change — see step 3, reuse the running server.

### 2. Prepare stable temp paths

Use the resolved absolute project path to compute stable PID and log paths under `/tmp`:

- PID file: `/tmp/tora-build-preview-<sha1>.pid`
- Log file: `/tmp/tora-build-preview-<sha1>.log`
- Project marker: `/tmp/tora-build-preview-<sha1>.project`

Suggested command, run from the selected project directory:

```bash
python3 - <<'PY'
import hashlib
from pathlib import Path
project = str(Path.cwd().resolve())
h = hashlib.sha1(project.encode()).hexdigest()[:12]
print(f'PID=/tmp/tora-build-preview-{h}.pid')
print(f'LOG=/tmp/tora-build-preview-{h}.log')
print(f'PROJECT=/tmp/tora-build-preview-{h}.project')
PY
```

### 3. Reuse the running server if one already exists

Dev servers (Vite, SvelteKit, Astro) all have hot module reload: once a server
is running, editing project files updates the browser automatically — there is
NO need to restart. Restarting also tends to pick a NEW port (the old one is
briefly in TIME_WAIT), which breaks any SSH tunnel / bookmarked URL the user set up.

So, before starting anything, check the PID file:

- **If the PID exists and `kill -0 <pid>` succeeds → the server is already up.
  Do NOT restart it.** Read the URL from the existing log file (step 7 parser
  works on the existing log) and return it. If the user asked for a graphical
  change, the change is already live via HMR — just tell them to refresh.
- If the PID file exists but the process is gone, remove the stale PID file and
  proceed to start a fresh server (steps 4–7).
- If no PID file exists, proceed to start a fresh server.

Only restart explicitly when the user asks to restart, or when the server died.
Never start a second dev server for the same project.

### 4. Install dependencies if needed

Run `npm install` only when needed:

- `node_modules/` is missing, or
- `package-lock.json` is missing while `package.json` exists.

If `node_modules/` and the lockfile are already present, skip install.

Use:

```bash
npm install
```

If install fails, stop and show the relevant npm error.

### 5. Optionally apply local D1 migrations

Detect local D1 support by checking for both:

- `migrations/` directory with migration files
- `wrangler.toml` containing a D1 database declaration (`[[d1_databases]]` or `d1_databases`)

If D1 migrations are detected:

- If the user explicitly asked to apply migrations, run them.
- If the user explicitly asked to skip migrations, skip them.
- Otherwise ask one short confirmation question before applying migrations locally.

When applying migrations, prefer the database name from `wrangler.toml` (`database_name = "..."`). If no database name can be detected, use the first D1 binding name. Run with `--local` only.

Suggested migration command shape:

```bash
npx wrangler d1 migrations apply <database-name-or-binding> --local
```

Do not run remote migrations from this skill. Never omit `--local`.

### 6. Start the dev server in the background

Start the server with `npm run dev` in the selected project directory.

Requirements:

- Run it in the background.
- Redirect stdout/stderr to the `/tmp` log file.
- Write the process PID to the `/tmp` PID file.
- Write the resolved project path to the `/tmp` project marker.
- Do not block the Claude Code session with a foreground Vite/Wrangler process.

Preferred command pattern:

```bash
: > "$LOG"
printf '%s\n' "$PWD" > "$PROJECT"
setsid bash -lc 'npm run dev' >> "$LOG" 2>&1 &
printf '%s\n' "$!" > "$PID"
```

Pitfall: Vite may choose a different port if the default port is busy. Do not assume `5173`; parse the actual URL from the log.

### 7. Wait for and parse the Vite Local URL

Poll the log for up to 30 seconds. Parse the first local URL printed by Vite, typically from a line like:

```text
Local:   http://localhost:5173/
```

Accept either `localhost` or `127.0.0.1`, and accept any port.

Suggested parser:

```bash
python3 - "$LOG" <<'PY'
import re, sys, time
from pathlib import Path

ANSI = re.compile(r'\x1b\[[0-9;]*[mGKHF]')

log = Path(sys.argv[1])
# Match "Local:   http://localhost:5173/" after stripping ANSI codes
patterns = [
    re.compile(r'Local:\s*(https?://[^\s]+)'),
    re.compile(r'(https?://(?:localhost|127\.0\.0\.1):\d+/?)'),
]
deadline = time.time() + 30
while time.time() < deadline:
    raw = log.read_text(errors='replace') if log.exists() else ''
    text = ANSI.sub('', raw)
    for pattern in patterns:
        m = pattern.search(text)
        if m:
            print(m.group(1))
            raise SystemExit(0)
    time.sleep(1)
raise SystemExit(1)
PY
```

If no URL is found after 30 seconds:

1. Check whether the PID is still running.
2. Show the last 80 lines of the log.
3. Explain that the server may still be starting or may have failed.
4. Tell the user where the log and PID files are.

### 8. Final response

When successful, reply in Italian or the user's language with:

- project directory
- preview URL
- PID file path
- log file path
- reminder to stop it with `/tora-deployer:preview-stop`

Example:

```text
Preview locale avviata.
Progetto: /path/to/app
URL: http://localhost:5174/
PID: /tmp/tora-build-preview-abc123def456.pid
Log: /tmp/tora-build-preview-abc123def456.log
Per fermarla: /tora-deployer:preview-stop
```

## Constraints

- Do not edit project source files.
- Do not deploy anything.
- Do not run remote D1 migrations.
- Do not assume a fixed Vite port (Vite 5173, Astro 4321) — but keep it stable across restarts.
- Do not leave duplicate preview processes for the same project.
- Do not restart a healthy running server just to apply a file edit — HMR handles it.
- Use `/tmp` for PID and log files.
