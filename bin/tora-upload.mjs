#!/usr/bin/env node
/**
 * tora-upload.mjs -- pack a built site directory and upload it to TORA.
 *
 * Usage:
 *   node tora-upload.mjs <dir> --project <slug> --upload-token <token> [--issuer <url>]
 *
 * No OAuth: the upload-token is minted by the MCP tool `prepare_upload` and
 * passed in. The presigned URL never leaves this process.
 *
 * stdout: ONLY the final JSON { uploadId, ok }
 * stderr: all diagnostics (NEVER bytes, URLs, or tokens)
 */
import process from "node:process";
import { createHash } from "node:crypto";
import { createTarGz, readDirRecursive } from "./lib/tar.mjs";

export function parseArgs(argv) {
  let dir = null, project = null, uploadToken = null, issuer = "https://mcp.toranoai.com";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--project") project = argv[++i] ?? null;
    else if (arg === "--upload-token") uploadToken = argv[++i] ?? null;
    else if (arg === "--issuer") issuer = argv[++i] ?? issuer;
    else if (!arg.startsWith("--")) dir = arg;
  }
  return { dir, project, uploadToken, issuer };
}

export async function requestUploadGrant(issuer, uploadToken, archiveSha256, archiveBytes) {
  const res = await fetch(`${issuer}/upload/grant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${uploadToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ archiveSha256, archiveBytes }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    process.stderr.write(`[tora-deployer] /upload/grant failed ${res.status}: ${text.slice(0, 200)}\n`);
    throw new Error(`upload/grant ${res.status}`);
  }
  const { uploadId, presignedPutUrl, requiredHeaders } = await res.json();
  if (!uploadId || !presignedPutUrl) throw new Error("upload/grant response incomplete");
  return { uploadId, presignedPutUrl, requiredHeaders: requiredHeaders ?? {} };
}

export async function putToR2(presignedPutUrl, data, requiredHeaders) {
  process.stderr.write(`[tora-deployer] Uploading ${data.byteLength} bytes...\n`);
  const res = await fetch(presignedPutUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/gzip", ...requiredHeaders },
    body: data,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    process.stderr.write(`[tora-deployer] PUT failed ${res.status}: ${text.slice(0, 200)}\n`);
    throw new Error(`R2 PUT ${res.status}`);
  }
}

async function main() {
  const { dir, project, uploadToken, issuer } = parseArgs(process.argv.slice(2));
  if (!dir || !project || !uploadToken) {
    process.stderr.write("Usage: node tora-upload.mjs <dir> --project <slug> --upload-token <token> [--issuer <url>]\n");
    process.stdout.write(JSON.stringify({ ok: false, error: "missing arguments" }) + "\n");
    process.exit(1);
  }
  try {
    process.stderr.write(`[tora-deployer] Packing directory "${dir}"...\n`);
    const entries = readDirRecursive(dir);
    process.stderr.write(`[tora-deployer] ${entries.length} file(s) found.\n`);
    const tarGz = createTarGz(entries);
    const archiveBytes = tarGz.byteLength;
    const archiveSha256 = createHash("sha256").update(tarGz).digest("hex");
    process.stderr.write(`[tora-deployer] Archive size: ${archiveBytes} bytes.\n`);

    const { uploadId, presignedPutUrl, requiredHeaders } =
      await requestUploadGrant(issuer, uploadToken, archiveSha256, archiveBytes);
    await putToR2(presignedPutUrl, tarGz, requiredHeaders);
    process.stderr.write("[tora-deployer] Upload complete.\n");
    process.stdout.write(JSON.stringify({ uploadId, ok: true }) + "\n");
  } catch (err) {
    process.stderr.write(`[tora-deployer] Error: ${err.message}\n`);
    const short = err.message.replace(/https?:\/\/\S+/g, "[url]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 120);
    process.stdout.write(JSON.stringify({ ok: false, error: short }) + "\n");
    process.exit(1);
  }
}

// Run only when invoked directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("tora-upload.mjs")) {
  main();
}
