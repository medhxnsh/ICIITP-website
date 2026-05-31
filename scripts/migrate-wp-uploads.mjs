#!/usr/bin/env node
/**
 * migrate-wp-uploads.mjs
 *
 * One-shot migration for all 49 iciitp.com/wp-content/uploads/* URLs embedded
 * in the static content JSON files under content/en/.
 *
 * What it does:
 *   1. Finds every wp-content URL across all content/en/**\/*.json files.
 *   2. Downloads each file into data/uploads/.
 *   3. Rewrites every JSON file in place — old URLs → /uploads/<filename>.
 *   4. Writes scripts/media-inserts.sql with INSERT statements for the media
 *      table so the files appear in the admin media library.
 *
 * Usage:
 *   node scripts/migrate-wp-uploads.mjs
 *
 * Requirements:
 *   - Internet access to iciitp.com (or the old server).
 *   - data/uploads/ writable (created automatically).
 *   - Run from the project root.
 *
 * After running:
 *   psql $DATABASE_URL -f scripts/media-inserts.sql
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { readdirSync, statSync } from "fs";
import { join, basename, extname } from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import https from "https";
import http from "http";

const ROOT        = process.cwd();
const UPLOADS_DIR = join(ROOT, "data", "uploads");
const CONTENT_DIR = join(ROOT, "content", "en");
const SQL_OUT     = join(ROOT, "scripts", "media-inserts.sql");
const WP_RE       = /http:\/\/iciitp\.com\/wp-content\/uploads\/[^\s"'<>)]+/g;

mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Collect all JSON file paths recursively ──────────────────────────────────

function walkJson(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkJson(full));
    } else if (entry.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

const jsonFiles = walkJson(CONTENT_DIR);

// ── Extract every unique wp-content URL ──────────────────────────────────────

const urlSet = new Set();
for (const file of jsonFiles) {
  const text = readFileSync(file, "utf-8");
  for (const match of text.matchAll(WP_RE)) urlSet.add(match[0]);
}

const urls = [...urlSet];
console.log(`Found ${urls.length} unique WordPress upload URLs.\n`);

// ── Build a safe local filename (deduplicate if needed) ───────────────────────

const filenameMap = new Map(); // url → local filename
const usedNames   = new Map(); // basename → count

for (const url of urls) {
  const raw  = basename(url);
  const name = raw.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!usedNames.has(name)) {
    usedNames.set(name, 1);
    filenameMap.set(url, name);
  } else {
    const count = usedNames.get(name) + 1;
    usedNames.set(name, count);
    const ext   = extname(name);
    const stem  = name.slice(0, -ext.length);
    filenameMap.set(url, `${stem}_${count}${ext}`);
  }
}

// ── Download helper ───────────────────────────────────────────────────────────

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith("https") ? https.get : http.get;
    get(url, { timeout: 20000 }, (res) => {
      // Follow one redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const redirected = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return download(redirected, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const out = createWriteStream(dest);
      pipeline(res, out).then(() => resolve(res.headers["content-length"])).catch(reject);
    }).on("error", reject).on("timeout", () => reject(new Error("timeout")));
  });
}

// ── Detect MIME from extension ────────────────────────────────────────────────

function mimeFor(filename) {
  const ext = extname(filename).toLowerCase();
  return (
    ext === ".pdf"  ? "application/pdf" :
    ext === ".docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
    ext === ".doc"  ? "application/msword" :
    ext === ".xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
    "application/octet-stream"
  );
}

// ── Download every file ───────────────────────────────────────────────────────

const results = []; // { url, localName, sizeBytes, ok, error }

for (const url of urls) {
  const localName = filenameMap.get(url);
  const destPath  = join(UPLOADS_DIR, localName);

  if (existsSync(destPath)) {
    const size = statSync(destPath).size;
    console.log(`  SKIP  ${localName}  (already exists, ${size} bytes)`);
    results.push({ url, localName, sizeBytes: size, ok: true });
    continue;
  }

  process.stdout.write(`  GET   ${url.replace("http://iciitp.com/wp-content/uploads/", "")}  →  ${localName} ... `);
  try {
    // Try http first, then https if needed
    let size;
    try {
      size = await download(url, destPath);
    } catch {
      // Retry with https
      const httpsUrl = url.replace("http://", "https://");
      size = await download(httpsUrl, destPath);
    }
    const actual = statSync(destPath).size;
    console.log(`OK (${actual} bytes)`);
    results.push({ url, localName, sizeBytes: actual, ok: true });
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
    // Remove partial file if it was created
    try { if (existsSync(destPath)) { const { unlinkSync } = await import("fs"); unlinkSync(destPath); } } catch {}
    results.push({ url, localName, sizeBytes: 0, ok: false, error: err.message });
  }
}

// ── Rewrite JSON files ────────────────────────────────────────────────────────

// Build replacement map: only for successfully downloaded files
const replaceMap = new Map();
for (const r of results) {
  if (r.ok) replaceMap.set(r.url, `/uploads/${r.localName}`);
}

let jsonUpdated = 0;
for (const file of jsonFiles) {
  let text = readFileSync(file, "utf-8");
  let changed = false;
  for (const [oldUrl, newPath] of replaceMap) {
    if (text.includes(oldUrl)) {
      text = text.split(oldUrl).join(newPath);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(file, text, "utf-8");
    jsonUpdated++;
    console.log(`  Updated  ${file.replace(ROOT + "/", "")}`);
  }
}

// ── Generate SQL for media table ──────────────────────────────────────────────

const lines = [
  "-- Media records for migrated WordPress uploads",
  "-- Run: psql $DATABASE_URL -f scripts/media-inserts.sql",
  "",
];

for (const r of results) {
  if (!r.ok) continue;
  const id       = crypto.randomUUID();
  const mime     = mimeFor(r.localName);
  const diskPath = `./data/uploads/${r.localName}`;
  const url      = `/uploads/${r.localName}`;
  const esc      = (s) => s.replace(/'/g, "''");

  lines.push(
    `INSERT INTO media (id, filename, original_name, mime_type, size_bytes, disk_path, url, uploaded_by, created_at)` +
    ` VALUES ('${id}', '${esc(r.localName)}', '${esc(r.localName)}', '${mime}', ${r.sizeBytes}, '${esc(diskPath)}', '${esc(url)}', 'migration', NOW())` +
    ` ON CONFLICT DO NOTHING;`
  );
}

writeFileSync(SQL_OUT, lines.join("\n") + "\n", "utf-8");

// ── Summary ───────────────────────────────────────────────────────────────────

const succeeded = results.filter((r) => r.ok).length;
const failed    = results.filter((r) => !r.ok);

console.log(`
────────────────────────────────────────────
  Downloaded : ${succeeded} / ${urls.length} files
  JSON files : ${jsonUpdated} updated
  SQL output : scripts/media-inserts.sql
────────────────────────────────────────────`);

if (failed.length) {
  console.log("\n  FAILED downloads (update these URLs manually):");
  for (const f of failed) console.log(`    ${f.url}  —  ${f.error}`);
}

console.log(`
Next step:
  psql $DATABASE_URL -f scripts/media-inserts.sql
`);
