---
description: Use when the user wants an introduction to the Tora Deployer plugin — its workflow and available commands.
---

# Tora Deployer — getting started

Respond with this guide. Adapt the language to the user (reply in their language).

---

**Welcome to Tora Deployer**

Tora Deployer takes a project all the way to deploy on TORA Cloud, straight from Claude Code.
Two paths:
- **Existing site** (Astro, Vite, static HTML) → builds and publishes it.
- **New admin/CRUD app from scratch** → generates it from a plain-language description
  (database, email+password auth, roles/permissions, CRUD, and an admin area) and publishes it.

In both cases you can first see a **free local preview**, then decide whether to publish.

---

**To start: one command**

```
/tora-deployer:start-deploy
```

It does a lightweight check of the project, figures out which path it is, and guides you to
preview or deploy. From there you don't need to remember the other commands — the procedure
orchestrates them for you.

---

**Available commands**

`/tora-deployer:start-deploy`
Single entry point. Detects the project type, does a low-cost check, and takes you to local
preview or production deploy.

`/tora-deployer:start`
New admin apps only: a guided interview to define the app. It writes `spec.json`. Normally
invoked by `start-deploy` for you.

`/tora-deployer:preview`
Starts the local preview (free, not public) and returns the URL.

`/tora-deployer:preview-stop`
Stops the local preview server started by `/tora-deployer:preview`.

(The CRUD branch — generating and deploying the app — is handled by `deploy-crud`, which
`start-deploy` runs for you.)

---

**Authentication**

Production deploy requires a TORA account. You log in **once**, when Claude Code connects to
the TORA server (OAuth in the browser; in headless environments you paste the callback URL in
chat). After that, further deploys need no extra login. Local preview is free and needs no account.

---

**To start now:**

```
/tora-deployer:start-deploy
```
