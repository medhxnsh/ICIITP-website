/**
 * Retry import for startups and team members that failed due to image field type.
 * Run after changing logo/photo ACF fields from image to text.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "../content/en");

const WP_URL  = process.env.WP_URL  || "http://iciitp.local";
const WP_USER = process.env.WP_USER || "";
const WP_PASS = process.env.WP_PASS || "";

const AUTH = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

async function wpPost(postType, body) {
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/${postType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${AUTH}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function wpDelete(postType, id) {
  await fetch(`${WP_URL}/wp-json/wp/v2/${postType}/${id}?force=true`, {
    method: "DELETE",
    headers: { "Authorization": `Basic ${AUTH}` },
  });
}

async function getAll(postType) {
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/${postType}?per_page=100&status=publish`, {
    headers: { "Authorization": `Basic ${AUTH}` },
  });
  return res.json();
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, relPath), "utf-8"));
}

function opt(val) { return (val && String(val).trim()) ? val : undefined; }
function sel(val, allowed) {
  const v = (val || "").toLowerCase().trim();
  return allowed.includes(v) ? v : undefined;
}

async function reimportStartups() {
  console.log("\n🚀 Re-importing Startups…");

  // Delete existing startup posts first to avoid duplicates
  const existing = await getAll("ic_startup");
  console.log(`  Deleting ${existing.length} existing startup posts…`);
  for (const p of existing) await wpDelete("ic_startup", p.id);

  const startups = readJson("startups/index.json");
  let ok = 0, fail = 0;
  for (const s of startups) {
    try {
      await wpPost("ic_startup", {
        title:  s.name,
        status: "publish",
        acf: {
          scheme:   sel(s.scheme, ["meity","sisf","nidhi-prayas","nidhi-eir","bionest","genesis"]),
          tagline:  opt(s.tagline),
          sectors:  opt((s.sectors || []).join(", ")),
          founders: opt((s.founders || []).join(", ")),
          website:  opt(s.website),
          logo:     opt(s.logo),
        },
      });
      ok++;
    } catch (e) {
      console.error(`  ❌ ${s.name}: ${e.message}`);
      fail++;
    }
  }
  console.log(`  ✅ ${ok} imported, ❌ ${fail} failed`);
}

async function reimportTeam() {
  console.log("\n👥 Re-importing Team…");

  const existing = await getAll("ic_team");
  console.log(`  Deleting ${existing.length} existing team posts…`);
  for (const p of existing) await wpDelete("ic_team", p.id);

  const roles = [
    { file: "team/governance.json", role: "governance" },
    { file: "team/evaluation.json", role: "evaluation" },
    { file: "team/staff.json",      role: "staff" },
  ];
  let order = 1, ok = 0, fail = 0;
  for (const { file, role } of roles) {
    const members = readJson(file);
    for (const m of members) {
      try {
        await wpPost("ic_team", {
          title:  m.name,
          status: "publish",
          acf: {
            designation:   opt(m.designation),
            role:          sel(role, ["governance","evaluation","staff"]),
            email:         opt(m.email),
            linkedin:      opt(m.linkedin),
            photo:         opt(m.photo),
            bio:           opt(m.bio),
            display_order: order++,
          },
        });
        ok++;
      } catch (e) {
        console.error(`  ❌ ${m.name}: ${e.message}`);
        fail++;
      }
    }
  }
  console.log(`  ✅ ${ok} imported, ❌ ${fail} failed`);
}

async function main() {
  console.log(`\n🌐 Connecting to ${WP_URL}…`);
  await reimportStartups();
  await reimportTeam();
  console.log("\n🎉 Retry complete!\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
