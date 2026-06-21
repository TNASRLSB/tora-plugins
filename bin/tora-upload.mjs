#!/usr/bin/env node
/**
 * tora-upload.mjs — pack a built site directory and upload it to TORA.
 *
 * Usage:
 *   node tora-upload.mjs <dir> --project <slug> [--issuer https://mcp.toranoai.com]
 *
 * stdout: ONLY the final JSON { uploadId, ok }
 * stderr: all diagnostics, progress, errors (NEVER bytes, URLs, or tokens)
 *
 * Uses ONLY Node built-ins. No npm dependencies.
 */

import process from 'node:process';

import { getAccessToken } from './lib/oauth.mjs';
import { createTarGz, readDirRecursive } from './lib/tar.mjs';

/* ------------------------------------------------------------------ */
/* Argument parsing                                                     */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  // argv = process.argv.slice(2)
  // Expected: <dir> --project <slug> [--issuer <url>]
  let dir = null;
  let project = null;
  let issuer = 'https://mcp.toranoai.com';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--project') {
      project = argv[++i] ?? null;
    } else if (arg === '--issuer') {
      issuer = argv[++i] ?? issuer;
    } else if (!arg.startsWith('--')) {
      dir = arg;
    }
  }

  return { dir, project, issuer };
}

/* ------------------------------------------------------------------ */
/* Upload grant                                                         */
/* ------------------------------------------------------------------ */

/**
 * Request a presigned upload URL from the gateway.
 * @param {string} issuer
 * @param {string} accessToken
 * @param {string} projectName
 * @returns {Promise<{uploadId: string, presignedPutUrl: string}>}
 */
async function requestUploadGrant(issuer, accessToken, projectName) {
  const url = `${issuer}/upload/grant`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ projectName }),
  });

  if (!res.ok) {
    // Do NOT include the response body in stdout — only stderr
    const text = await res.text().catch(() => '');
    process.stderr.write(`[tora-deployer] /upload/grant failed ${res.status}: ${text.slice(0, 300)}\n`);
    throw new Error(`upload/grant ${res.status}`);
  }

  const { uploadId, presignedPutUrl } = await res.json();
  if (!uploadId || !presignedPutUrl) {
    throw new Error('upload/grant response missing uploadId or presignedPutUrl');
  }
  return { uploadId, presignedPutUrl };
}

/* ------------------------------------------------------------------ */
/* PUT to presigned URL                                                 */
/* ------------------------------------------------------------------ */

/**
 * PUT the gzipped tar bytes to the presigned R2 URL.
 * The URL itself is NEVER written to stdout.
 * @param {string} presignedPutUrl
 * @param {Uint8Array} data
 * @returns {Promise<void>}
 */
async function putToR2(presignedPutUrl, data) {
  process.stderr.write(`[tora-deployer] Uploading ${data.byteLength} bytes…\n`);
  const res = await fetch(presignedPutUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Length': String(data.byteLength),
    },
    body: data,
  });

  if (!res.ok) {
    // Do NOT include the presigned URL in any output — only a status code
    const text = await res.text().catch(() => '');
    process.stderr.write(`[tora-deployer] PUT failed ${res.status}: ${text.slice(0, 200)}\n`);
    throw new Error(`R2 PUT ${res.status}`);
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  const { dir, project, issuer } = parseArgs(process.argv.slice(2));

  if (!dir || !project) {
    process.stderr.write('Usage: node tora-upload.mjs <dir> --project <slug> [--issuer <url>]\n');
    process.stdout.write(JSON.stringify({ ok: false, error: 'missing arguments' }) + '\n');
    process.exit(1);
  }

  try {
    // 1. Authenticate
    process.stderr.write(`[tora-deployer] Authenticating against ${issuer}…\n`);
    const accessToken = await getAccessToken(issuer);

    // 2. Request upload grant (presigned URL + uploadId)
    process.stderr.write(`[tora-deployer] Requesting upload grant for project "${project}"…\n`);
    const { uploadId, presignedPutUrl } = await requestUploadGrant(issuer, accessToken, project);
    // Do NOT log uploadId or presignedPutUrl to stderr — keep them opaque

    // 3. Pack directory into tar.gz
    process.stderr.write(`[tora-deployer] Packing directory "${dir}"…\n`);
    const entries = readDirRecursive(dir);
    process.stderr.write(`[tora-deployer] ${entries.length} file(s) found.\n`);
    const tarGz = createTarGz(entries);
    process.stderr.write(`[tora-deployer] Archive size: ${tarGz.byteLength} bytes.\n`);

    // 4. PUT to R2
    await putToR2(presignedPutUrl, tarGz);
    process.stderr.write('[tora-deployer] Upload complete.\n');

    // 5. Print ONLY the result to stdout — no URL, no token
    process.stdout.write(JSON.stringify({ uploadId, ok: true }) + '\n');
  } catch (err) {
    process.stderr.write(`[tora-deployer] Error: ${err.message}\n`);
    // Short, non-sensitive error summary to stdout
    const short = err.message
      .replace(/https?:\/\/\S+/g, '[url]')
      .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
      .replace(/[A-Za-z0-9_-]{40,}/g, '[redacted]')
      .slice(0, 120);
    process.stdout.write(JSON.stringify({ ok: false, error: short }) + '\n');
    process.exit(1);
  }
}

main();
