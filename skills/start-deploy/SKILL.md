---
description: Use when the user wants to publish or put a project online on TORA Cloud, or build an app from scratch, and it is not yet clear whether it is an existing static site or a new CRUD admin app. Single entry point.
---

# TORA — start-deploy (entry point and routing)

## When this applies
The user says things like "publish this site", "put it online on TORA", "I want an
admin app for…", "build me something to manage…" and has not already started a
specific branch.

## Process

### 1. Lightweight check (low token cost)
- Read only the obvious `.md`/config files (README, package.json, astro.config) to
  understand what this is.
- Ask 1–2 targeted questions. The user may answer "I don't know, you decide."
- Do NOT read the whole codebase now: this step only exists to route.
- Ask the user in their own language.

### 2. Routing
- **Existing static site/project** (package.json with a build, astro.config, or just
  `.html` files) → static branch: skill `tora-deployer:deploy-static`.
- **CRUD admin app to build from scratch** (the user describes entities/roles and has
  no code yet) → CRUD branch: first `tora-deployer:start` (gathers requirements into
  `spec.json`), then `tora-deployer:deploy-crud` (generate, customize the UI, publish).
- If unsure, ask one clarifying question before choosing. Do not guess.

### 3. Hand off to the branch
The chosen branch handles generation/build, local preview, and deploy on its own.
This skill does not generate, build, or publish — it only routes.

## Constraints
- There are ONLY two branches: static (`deploy-static`) and CRUD
  (`start` → `deploy-crud`). No other CRUD flow exists.
- Do not read the entire codebase during the initial check (low cost).
- When in doubt between the two branches, ask — wrong routing wastes time.
