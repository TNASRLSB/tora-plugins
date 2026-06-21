/**
 * OAuth 2.0 PKCE loopback flow.
 *
 * getAccessToken(issuer): tries refresh first; falls back to browser login.
 * client_id = 'tora-uploader'
 * redirect_uri = http://127.0.0.1:<ephemeral-port>/callback
 *
 * Uses ONLY Node built-ins: node:http, node:crypto, node:child_process, node:process.
 */

import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import process from 'node:process';

import { loadRefreshToken, saveRefreshToken } from './vault.mjs';

const CLIENT_ID = 'tora-uploader';

/* ------------------------------------------------------------------ */
/* PKCE helpers                                                         */
/* ------------------------------------------------------------------ */

/**
 * Generate a cryptographically random PKCE code_verifier (43-128 chars, URL-safe).
 * @returns {string}
 */
function generateVerifier() {
  return randomBytes(48).toString('base64url');
}

/**
 * Derive the PKCE code_challenge (S256) from a verifier.
 * @param {string} verifier
 * @returns {string}
 */
function deriveChallenge(verifier) {
  return createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

/* ------------------------------------------------------------------ */
/* Browser opener                                                       */
/* ------------------------------------------------------------------ */

/**
 * Open a URL in the default browser, cross-platform.
 * @param {string} url
 */
function openBrowser(url) {
  const p = process.platform;
  let cmd, args;
  if (p === 'darwin') {
    cmd = 'open';
    args = [url];
  } else if (p === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    cmd = 'xdg-open';
    args = [url];
  }
  execFile(cmd, args, { stdio: 'ignore' }, (err) => {
    if (err) {
      process.stderr.write(`[tora-deployer] Could not open browser: ${err.message}\n`);
      process.stderr.write(`[tora-deployer] Please open this URL manually:\n  ${url}\n`);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Ephemeral loopback server for OAuth callback                        */
/* ------------------------------------------------------------------ */

/**
 * Start an ephemeral HTTP server on 127.0.0.1, port 0 (OS-assigned).
 * Waits for a GET /callback?code=...&state=... request, responds with a
 * human-readable success/error page, then closes.
 *
 * Resolves with { code, state } or rejects on timeout / error param.
 *
 * @param {string} expectedState
 * @param {number} [timeoutMs=300000]  5 minutes
 * @returns {Promise<{code: string, state: string}>}
 */
function waitForCallback(expectedState, timeoutMs = 300_000) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const raw = req.url ?? '/';
      // Only handle /callback
      if (!raw.startsWith('/callback')) {
        res.writeHead(404).end('Not found');
        return;
      }

      const url = new URL(raw, 'http://127.0.0.1');
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' }).end(
          `<h1>Login failed</h1><p>${error}: ${url.searchParams.get('error_description') ?? ''}</p>`,
        );
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' }).end(
          '<h1>Missing code parameter</h1>',
        );
        return;
      }

      if (state !== expectedState) {
        res.writeHead(400, { 'Content-Type': 'text/html' }).end(
          '<h1>State mismatch</h1>',
        );
        server.close();
        reject(new Error('OAuth state mismatch'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' }).end(
        '<h1>Login successful</h1><p>You can close this tab and return to your terminal.</p>',
      );
      server.close();
      resolve({ code, state });
    });

    // Bind to port 0 — the OS assigns an available ephemeral port
    server.listen(0, '127.0.0.1', () => {
      // Caller reads the actual port from here
    });

    const timer = setTimeout(() => {
      server.close();
      reject(new Error('OAuth login timed out after 5 minutes'));
    }, timeoutMs);

    server.on('close', () => clearTimeout(timer));
    server.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    // Expose the server so the caller can read the port
    resolve._server = server; // set immediately before promise resolves
  });
}

/**
 * Variant that returns { server, promise } so the port is available before waiting.
 * @param {string} expectedState
 * @returns {{ server: import('node:http').Server, promise: Promise<{code:string,state:string}> }}
 */
function createCallbackServer(expectedState) {
  let _resolve, _reject;
  const promise = new Promise((res, rej) => {
    _resolve = res;
    _reject = rej;
  });

  const server = createServer((req, res) => {
    const raw = req.url ?? '/';
    if (!raw.startsWith('/callback')) {
      res.writeHead(404).end('Not found');
      return;
    }

    const url = new URL(raw, 'http://127.0.0.1');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' }).end(
        `<h1>Login failed</h1><p>${error}: ${url.searchParams.get('error_description') ?? ''}</p>`,
      );
      server.close();
      _reject(new Error(`OAuth error: ${error}`));
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' }).end(
        '<h1>Missing code parameter</h1>',
      );
      return;
    }

    if (state !== expectedState) {
      res.writeHead(400, { 'Content-Type': 'text/html' }).end(
        '<h1>State mismatch</h1>',
      );
      server.close();
      _reject(new Error('OAuth state mismatch'));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' }).end(
      '<h1>Login successful</h1><p>You can close this tab and return to your terminal.</p>',
    );
    server.close();
    _resolve({ code, state });
  });

  server.on('error', (err) => _reject(err));

  return { server, promise };
}

/* ------------------------------------------------------------------ */
/* Token exchange helpers                                               */
/* ------------------------------------------------------------------ */

/**
 * POST to issuer/oauth/token with application/x-www-form-urlencoded body.
 * Throws on non-2xx or network error.
 * @param {string} issuer
 * @param {Record<string,string>} params
 * @returns {Promise<{access_token:string, refresh_token?:string, [k:string]:unknown}>}
 */
async function postToken(issuer, params) {
  const url = `${issuer}/oauth/token`;
  const body = new URLSearchParams(params).toString();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token endpoint ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

/* ------------------------------------------------------------------ */
/* Main export                                                          */
/* ------------------------------------------------------------------ */

/**
 * Get a valid access token, using cached refresh token when possible.
 *
 * Flow:
 * 1. If a refresh token is stored in the vault, attempt to exchange it for
 *    a new access + rotated refresh token.
 * 2. If refresh fails (revoked/expired) or no refresh is stored, run the
 *    PKCE loopback browser flow.
 *
 * @param {string} issuer  Base URL of the auth server, e.g. https://mcp.toranoai.com
 * @returns {Promise<string>} access token
 */
export async function getAccessToken(issuer) {
  // --- (a) Try refresh ---
  const stored = loadRefreshToken();
  if (stored) {
    try {
      process.stderr.write('[tora-deployer] Refreshing access token…\n');
      const tokens = await postToken(issuer, {
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: stored,
      });
      if (tokens.refresh_token) {
        saveRefreshToken(tokens.refresh_token);
      }
      process.stderr.write('[tora-deployer] Token refreshed.\n');
      return tokens.access_token;
    } catch (err) {
      process.stderr.write(
        `[tora-deployer] Refresh failed (${err.message}); falling back to browser login.\n`,
      );
    }
  }

  // --- (b) PKCE browser login ---
  const verifier = generateVerifier();
  const challenge = deriveChallenge(verifier);
  const state = randomBytes(16).toString('base64url');

  const { server, promise } = createCallbackServer(state);

  // Bind to ephemeral port
  await new Promise((res, rej) => {
    server.listen(0, '127.0.0.1', res);
    server.once('error', rej);
  });

  const port = server.address().port;
  const redirectUri = `http://127.0.0.1:${port}/callback`;

  const authUrl = new URL(`${issuer}/oauth/authorize`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  process.stderr.write(`[tora-deployer] Opening browser for login…\n`);
  process.stderr.write(`[tora-deployer] If the browser does not open, visit:\n  ${authUrl.toString()}\n`);

  openBrowser(authUrl.toString());

  // Wait for the callback (5-minute timeout)
  const { code } = await promise;

  // Exchange code for tokens
  const tokens = await postToken(issuer, {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  if (tokens.refresh_token) {
    saveRefreshToken(tokens.refresh_token);
  }

  process.stderr.write('[tora-deployer] Login successful.\n');
  return tokens.access_token;
}
