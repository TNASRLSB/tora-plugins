/**
 * Minimal USTAR tar writer + gzip compression.
 * Uses ONLY Node built-ins: node:zlib, node:fs, node:path, node:crypto.
 * No npm dependencies.
 *
 * Produces archives that round-trip byte-identically with deploy-core's extractTarGz.
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { join, relative } from 'node:path';

const BLOCK = 512;

/**
 * Encode a string into a fixed-length ASCII byte field, null-padded.
 * @param {string} str
 * @param {number} len
 * @returns {Uint8Array}
 */
function encodeField(str, len) {
  const buf = new Uint8Array(len);
  for (let i = 0; i < str.length && i < len; i++) {
    buf[i] = str.charCodeAt(i) & 0xff;
  }
  return buf;
}

/**
 * Encode a number as an octal ASCII string, right-padded with a space and null,
 * fitting into `len` bytes total.
 * Standard USTAR convention: "0000755 \0" style.
 * @param {number} value
 * @param {number} len
 * @returns {Uint8Array}
 */
function encodeOctal(value, len) {
  const buf = new Uint8Array(len);
  // Format: octal digits, then space (0x20), then null (0x00)
  // e.g. len=8: "0000644 \0" → 7 chars + 1 null
  const octal = value.toString(8);
  // Pad to (len - 2) digits, then append space + null
  const padded = octal.padStart(len - 2, '0');
  const str = padded + ' ';
  for (let i = 0; i < str.length && i < len - 1; i++) {
    buf[i] = str.charCodeAt(i);
  }
  // last byte stays 0x00 (already zero-initialized)
  return buf;
}

/**
 * Build a single USTAR 512-byte header block for a regular file.
 * @param {string} path  - relative path for the tar name field
 * @param {number} size  - byte count of the file data
 * @returns {Uint8Array} 512-byte header block
 */
function buildHeader(path, size) {
  const header = new Uint8Array(BLOCK);

  // name (offset 0, length 100)
  header.set(encodeField(path, 100), 0);

  // mode (offset 100, length 8) — "0000644 \0"
  header.set(encodeOctal(0o644, 8), 100);

  // uid (offset 108, length 8)
  header.set(encodeOctal(0, 8), 108);

  // gid (offset 116, length 8)
  header.set(encodeOctal(0, 8), 116);

  // size (offset 124, length 12)
  header.set(encodeOctal(size, 12), 124);

  // mtime (offset 136, length 12) — use 0
  header.set(encodeOctal(0, 12), 136);

  // checksum placeholder (offset 148, length 8) — filled with spaces before computing
  for (let i = 148; i < 156; i++) header[i] = 0x20;

  // typeflag (offset 156, length 1) — '0' = regular file
  header[156] = 0x30; // ASCII '0'

  // linkname (offset 157, length 100) — all zeros (already)

  // magic (offset 257, length 6) — "ustar\0"
  header.set(encodeField('ustar', 6), 257);

  // version (offset 263, length 2) — "00"
  header[263] = 0x30;
  header[264] = 0x30;

  // uname (offset 265, length 32) — empty
  // gname (offset 297, length 32) — empty
  // devmajor (offset 329, length 8)
  header.set(encodeOctal(0, 8), 329);
  // devminor (offset 337, length 8)
  header.set(encodeOctal(0, 8), 337);
  // prefix (offset 345, length 155) — empty

  // Compute checksum: sum of all 512 bytes (with checksum field treated as spaces)
  let checksum = 0;
  for (let i = 0; i < BLOCK; i++) {
    checksum += header[i];
  }

  // Write checksum (offset 148, length 8): 6 octal digits + null + space
  const csOctal = checksum.toString(8).padStart(6, '0');
  const csField = encodeField(csOctal + '\0 ', 8);
  header.set(csField, 148);

  return header;
}

/**
 * Pack an array of entries into a gzipped USTAR tar archive.
 *
 * @param {{ path: string, bytes: Uint8Array }[]} entries
 * @returns {Uint8Array} gzipped tar bytes
 */
export function createTarGz(entries) {
  const parts = [];

  for (const entry of entries) {
    const { path, bytes } = entry;
    const size = bytes.byteLength;

    // Header block
    parts.push(buildHeader(path, size));

    // Data blocks — raw bytes, no text encoding
    if (size > 0) {
      parts.push(new Uint8Array(bytes)); // defensive copy; caller's buffer is NOT altered
      // Padding to next 512-byte boundary
      const remainder = size % BLOCK;
      if (remainder !== 0) {
        parts.push(new Uint8Array(BLOCK - remainder));
      }
    }
  }

  // Two zero end-of-archive blocks
  parts.push(new Uint8Array(BLOCK));
  parts.push(new Uint8Array(BLOCK));

  // Concatenate all parts into one buffer
  const totalLen = parts.reduce((acc, p) => acc + p.byteLength, 0);
  const tar = new Uint8Array(totalLen);
  let offset = 0;
  for (const part of parts) {
    tar.set(part, offset);
    offset += part.byteLength;
  }

  return gzipSync(tar);
}

/**
 * Recursively list all files under `dir`, returning entries with relative
 * forward-slash paths and raw bytes (Buffer coerced to Uint8Array, never utf8-decoded).
 *
 * @param {string} dir  - absolute or relative directory path
 * @returns {{ path: string, bytes: Uint8Array }[]}
 */
export function readDirRecursive(dir) {
  const entries = [];

  function walk(current) {
    const items = readdirSync(current);
    for (const item of items) {
      const full = join(current, item);
      const st = lstatSync(full); // lstatSync does NOT follow symlinks
      if (st.isSymbolicLink()) {
        continue; // Symlinks silently skipped — never follow into target
      } else if (st.isDirectory()) {
        walk(full);
      } else if (st.isFile()) {
        const rel = relative(dir, full).replace(/\\/g, '/');
        const buf = readFileSync(full); // Buffer — never pass 'utf8' encoding
        entries.push({ path: rel, bytes: new Uint8Array(buf) });
      }
      // Other special files (devices, sockets) are silently skipped
    }
  }

  walk(dir);
  return entries;
}
