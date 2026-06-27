---
description: Stop a local preview started by /tora-deployer:preview. Finds the generated project, reads /tmp PID files, stops the background npm run dev process, and removes stale state.
---

# Tora-Deployer — stop local preview

## Goal

Stop the background preview server started by `/tora-deployer:preview`.

Preview state is stored under `/tmp`:

- `/tmp/tora-build-preview-<sha1>.pid`
- `/tmp/tora-build-preview-<sha1>.log`
- `/tmp/tora-build-preview-<sha1>.project`

## Process

### 1. Identify which preview to stop

Use the Bash tool to locate PID files.

Detection order:

1. If the current working directory is inside a generated project containing `package.json` and `wrangler.toml`, compute its `/tmp/tora-build-preview-<sha1>.pid` path and stop that preview.
2. Otherwise inspect `/tmp/tora-build-preview-*.project` markers:
   - If exactly one running preview exists, stop it.
   - If multiple running previews exist, list project paths and ask the user which one to stop.
   - If no running previews exist but stale PID files exist, clean stale PID files and report that no preview is running.

Suggested project hash command, run from the selected project directory:

```bash
python3 - <<'PY'
import hashlib
from pathlib import Path
project = str(Path.cwd().resolve())
h = hashlib.sha1(project.encode()).hexdigest()[:12]
print(f'/tmp/tora-build-preview-{h}.pid')
PY
```

Suggested global discovery command:

```bash
python3 - <<'PY'
from pathlib import Path
for pid_file in sorted(Path('/tmp').glob('tora-build-preview-*.pid')):
    stem = pid_file.name[:-4]
    project_file = Path('/tmp') / f'{stem}.project'
    log_file = Path('/tmp') / f'{stem}.log'
    pid = pid_file.read_text(errors='replace').strip() if pid_file.exists() else ''
    project = project_file.read_text(errors='replace').strip() if project_file.exists() else '(unknown project)'
    print(f'{pid_file}\tpid={pid}\tproject={project}\tlog={log_file}')
PY
```

### 2. Stop process safely

For each selected PID file:

1. Read the PID.
2. If no PID is present, remove the stale PID file and continue.
3. If `kill -0 <pid>` fails, remove the stale PID file and report it was already stopped.
4. If the PID is running, terminate the process group first, then the PID as fallback.

Use this sequence:

```bash
kill -- -"$PID_VALUE" 2>/dev/null || kill "$PID_VALUE" 2>/dev/null || true
sleep 1
if kill -0 "$PID_VALUE" 2>/dev/null; then
  kill -9 -- -"$PID_VALUE" 2>/dev/null || kill -9 "$PID_VALUE" 2>/dev/null || true
fi
```

This is process-group-safe for previews started with `setsid bash -lc 'npm run dev'` by `/tora-deployer:preview`.

### 3. Clean state

After the process is stopped or confirmed stale, remove:

- PID file
- project marker file

Keep the log file by default so the user can inspect prior failures. Only delete the log if the user explicitly asks for cleanup.

### 4. Final response

Report:

- stopped project path, if known
- PID that was stopped or cleaned as stale
- log file path, if it still exists

Example:

```text
Preview locale fermata.
Progetto: /path/to/app
PID fermato: 12345
Log conservato: /tmp/tora-build-preview-abc123def456.log
```

If no preview is running:

```text
Nessuna preview locale Tora-Deployer in esecuzione. Ho rimosso eventuali PID file stale.
```

## Constraints

- Stop only processes associated with `/tmp/tora-build-preview-*.pid` unless the user explicitly provides another PID.
- Do not delete project source files.
- Do not delete logs unless explicitly requested.
- Do not assume a fixed Vite port; stopping is PID-based, not port-based.
