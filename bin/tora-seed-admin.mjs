#!/usr/bin/env node

// src/cli-seed-admin.ts
import process from "node:process";

// src/seed-admin.ts
import { randomUUID } from "node:crypto";

// src/templates/auth.js
var PBKDF2_ITERATIONS = 1e5;
var PBKDF2_VERSION = 1;
var SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
var enc = new TextEncoder();
function toHex(buf) {
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function randomHex(bytes) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return toHex(value);
}
async function pbkdf2(password, saltHex, iterations) {
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = Uint8Array.from(saltHex.match(/../g).map((hex) => parseInt(hex, 16)));
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toHex(bits);
}
async function hashPassword(password) {
  const salt = randomHex(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return { hash, salt, iterations: PBKDF2_ITERATIONS, version: PBKDF2_VERSION };
}

// src/seed-admin.ts
function sqlStr(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}
function randomPassword(len = 16) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
async function buildAdminSeedSql(email, password, role) {
  const stored = await hashPassword(password);
  const id = randomUUID();
  return `INSERT OR IGNORE INTO "users" ("id", "email", "password_hash", "salt", "iterations", "version", "role") VALUES (${sqlStr(id)}, ${sqlStr(email)}, ${sqlStr(stored.hash)}, ${sqlStr(stored.salt)}, ${stored.iterations}, ${stored.version}, ${sqlStr(role)});`;
}

// src/cli-seed-admin.ts
async function runSeedAdminCli(argv) {
  const [email, role, pwArg] = argv;
  if (!email || !role) {
    process.stderr.write("Usage: tora-seed-admin <email> <role> [password]\n");
    return { ok: false, error: "missing arguments: email and role are required" };
  }
  const password = pwArg && pwArg.length >= 10 ? pwArg : randomPassword();
  const sql = await buildAdminSeedSql(email, password, role);
  return { ok: true, password, sql };
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("tora-seed-admin.mjs")) {
  runSeedAdminCli(process.argv.slice(2)).then((r) => {
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.ok ? 0 : 1);
  });
}
export {
  runSeedAdminCli
};
