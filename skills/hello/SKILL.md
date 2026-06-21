---
description: Mostra la guida introduttiva al plugin Tora Deployer con il flusso di lavoro e i comandi disponibili
---

# Tora Deployer — guida introduttiva

Rispondi in italiano con questa guida formattata. Adatta la lingua all'utente se scrive in inglese o altra lingua.

---

**Benvenuto in Tora Deployer**

Tora Deployer porta un progetto fino al deploy su TORA Cloud direttamente da Claude Code. Due strade:
- **Sito esistente** (Astro, Vite, HTML statico) → lo builda e lo pubblica.
- **App gestionale da zero** → la genera da una descrizione in linguaggio naturale e la pubblica.

In entrambi i casi puoi prima vedere un'**anteprima locale gratuita**, poi decidere se pubblicare.

---

**Per iniziare: un solo comando**

```
/tora-deployer:start-deploy
```

Ti fa un check leggero del progetto, capisce di che tipo è, e ti guida fino all'anteprima o al deploy. Da lì in poi non devi ricordare gli altri comandi: la procedura li orchestra per te.

---

**Comandi disponibili**

`/tora-deployer:start-deploy`
Punto d'ingresso unico. Rileva il tipo di progetto, fa un check a basso consumo, e ti porta all'anteprima locale o al deploy in produzione.

`/tora-deployer:start`
Solo per app gestionali nuove: chiacchierata guidata per definire l'app. Alla fine viene scritto `spec.json`. Di norma lo invoca `start-deploy` per te.

`/tora-deployer:generate`
Legge `spec.json` e genera l'app SvelteKit completa (database, auth, pagine CRUD, permessi). Di norma usato dal ramo CRUD.

`/tora-deployer:preview`
Avvia il server di sviluppo locale (gratis, non pubblica) e restituisce l'URL.

`/tora-deployer:preview-stop`
Ferma il server di sviluppo avviato con `/tora-deployer:preview`.

---

**Autenticazione**

Il deploy in produzione richiede un account TORA. Effettui il login **una sola volta** quando Claude Code si collega al server TORA (OAuth nel browser; in ambienti senza interfaccia grafica incolli l'URL di callback in chat). Da quel momento i deploy successivi non richiedono altri login. L'anteprima locale è gratuita e non richiede account.

---

**Per iniziare subito:**

```
/tora-deployer:start-deploy
```
