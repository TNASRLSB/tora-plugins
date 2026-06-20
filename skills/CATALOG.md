# TORA Build Skill Catalog

This catalog lists all skills available to the TORA Build orchestrator.

**How to use this catalog:**
Before starting or generating a project, read this file and activate any skills marked as relevant for the current `spec.json`. For each external skill, fetch the URL in `source` to load the full instructions, then apply them in the current task.

Relevance rules:
- `always` — activate for every project
- `ui` — activate when `spec.pages` contains list, detail, or form pages
- `on-request` — activate only if the user explicitly asks for it
- `planning` — activate before `/tora-deployer:start` when the user is unsure about the domain or architecture

---

## Core skills (built-in)

### tora-deployer:hello
```yaml
id: tora-deployer:hello
category: core
when: always
description: User onboarding guide. Shows workflow and available commands.
source: built-in
```

### tora-deployer:start
```yaml
id: tora-deployer:start
category: core
when: always
description: Requirements gathering via guided interview. Writes spec.json.
source: built-in
```

### tora-deployer:generate
```yaml
id: tora-deployer:generate
category: core
when: always
description: Generates full SvelteKit + D1 app from spec.json.
source: built-in
```

### tora-deployer:preview
```yaml
id: tora-deployer:preview
category: core
when: always
description: Starts local dev server and returns URL.
source: built-in
```

### tora-deployer:preview-stop
```yaml
id: tora-deployer:preview-stop
category: core
when: always
description: Stops the running local dev server.
source: built-in
```

### tora-deployer:start-deploy
```yaml
id: tora-deployer:start-deploy
category: core
when: always
description: >
  Punto d'ingresso unico per il deploy. Check leggero, rileva il tipo di progetto
  (sito statico esistente vs app CRUD da zero), e orchestra il ramo giusto fino
  all'anteprima locale o al deploy in produzione via il tool MCP deploy_to_tora_cloud.
source: built-in
```

### tora-deployer:deploy-static
```yaml
id: tora-deployer:deploy-static
category: core
when: always
description: >
  Ramo statico di start-deploy. Rileva un sito statico (Astro/Vite/HTML), lo builda
  localmente, raccoglie l'output e prepara la mappa di file (wrapper Worker servi-asset
  + asset) per il deploy.
source: built-in
```

### tora-deployer:deploy-crud
```yaml
id: tora-deployer:deploy-crud
category: core
when: always
description: >
  Ramo CRUD di start-deploy. Da uno spec.json valido genera la base funzionale con la
  libreria @toranoai/codegen (deterministica), poi Claude genera lo strato UI, e prepara
  la mappa di file per il deploy.
source: built-in
```

---

## Productivity skills

### grill-me
```yaml
id: grill-me
category: productivity
when: planning
description: >
  Stress-tests a plan or design by asking relentless clarifying questions one at a time.
  Use before /tora-deployer:start when the user has a vague idea and needs help thinking
  through decisions, trade-offs, and edge cases before committing to a spec.
source: https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
requires: []
```

---

## UI/UX skills

### ui-ux-pro-max
```yaml
id: ui-ux-pro-max
category: ui-ux
when: ui
description: >
  Advanced UI/UX design intelligence with 67 styles (Glassmorphism, Brutalism, Bento Grid...),
  161 color palettes, 57 font pairings, 25 chart types, and 99 UX guidelines.
  Activate when the user wants a polished, styled UI instead of the default plain HTML/CSS.
  Apply during /tora-deployer:generate to style the generated Svelte components.
source: https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/SKILL.md
requires: []
```

---

## How to add a skill pack

Add a new entry under the relevant category with this shape:

```yaml
id: your-skill-id
category: core | productivity | ui-ux | data | auth | ...
when: always | ui | planning | on-request
description: >
  One or two sentences. Explain WHEN this skill should be activated and
  what it adds to the project. Be specific enough that an orchestrator
  can decide without fetching the source.
source: built-in | https://raw.githubusercontent.com/org/repo/branch/path/SKILL.md
requires: [other-skill-id]  # optional dependencies
```

Skills with `source: built-in` are implemented as `skills/<id>/SKILL.md` in this plugin directory.
External skills are fetched at activation time via the URL in `source`.
