---
description: Procedura guidata per deployare un progetto su TORA Cloud. Rileva il tipo di progetto, fa un check leggero, builda, e pubblica (o avvia un'anteprima locale). Punto d'ingresso unico per i canali statico e CRUD.
---

# TORA — start-deploy (procedura guidata)

## Scopo
Guidare l'utente dal progetto al deploy su `<slug>.toranoai.com`, con un check a basso consumo,
build client-side, e scelta tra anteprima locale (gratis) e deploy in produzione.

## Flusso

### 1. Check leggero (basso consumo)
- Leggi i file `.md` del progetto (README, ecc.) per capire di cosa si tratta.
- Fai 1-2 domande mirate all'utente. L'utente può rispondere "non so, fai tu".
- NON leggere tutto il codice ora: solo quanto serve a smistare.

### 2. Smistamento
- Se la cartella contiene un progetto esistente (package.json / sito / astro.config) →
  **ramo statico** (skill `tora-deployer:deploy-static`).
- Se l'utente vuole costruire un'app gestionale da zero → **ramo CRUD**
  (skill `tora-deployer:start` per lo spec, poi `tora-deployer:deploy-crud`).
- Se incerto, fai un'analisi più profonda (leggi config, chiedi conferma) prima di procedere.

### 3. (Ramo specifico)
Il ramo gestisce build, caricamento e deploy in autonomia. Dettagli nelle skill dei canali.

### 4. Coda comune
1. **Requisiti**: se serve build e mancano dipendenze → `npm install`. Salta se l'output è già pronto.
2. **Scelta ambiente** — chiedi all'utente:
   - **Anteprima locale** (gratis, non pubblica): avvia l'anteprima locale (skill `tora-deployer:preview`).
     NON chiama il backend, NON consuma deploy.
   - **Produzione** (pubblica il sito): procedi al deploy reale.
3. **Deploy** (solo produzione): il ramo specifico esegue l'uploader
   (`tora-upload.mjs <output-dir> --project <slug>`) e chiama il tool MCP
   `deploy_to_tora_cloud` con `{ projectName, uploadId, options }`.
   Questa skill non costruisce né raccoglie file: delega interamente al ramo.

### 5. Esito
- Produzione: mostra l'URL live `https://<slug>.toranoai.com`.
- Anteprima: mostra l'URL locale e ricorda come fermarla.
- Errore: riporta in chiaro il messaggio (vedi sotto).

## Errori comuni
- L'uploader non ha prodotto un `uploadId` / la build non ha generato output deployabile → "verifica che la build sia completata correttamente prima del deploy".
- 429 (quota) → "troppi deploy, riprova più tardi".
- 502 → "deploy non riuscito lato server, riprova".
- backend `not_configured` → "il MCP è raggiungibile ma il deploy backend non è ancora attivo".

## Vincoli
- Non pubblicare nulla in modalità anteprima locale (non consuma deploy).
- Non leggere l'intero codice nel check iniziale (basso consumo).
- I rami statico/CRUD sono definiti nelle rispettive skill; questa skill li orchestra.
