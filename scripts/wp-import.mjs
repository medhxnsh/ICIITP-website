/**
 * IC IITP → WordPress import script
 * Seeds all static JSON content into the local WordPress instance.
 *
 * Usage:
 *   node scripts/wp-import.mjs
 *
 * Requires env vars (or edit the constants below):
 *   WP_URL      e.g. http://iciitp.local
 *   WP_USER     WordPress username
 *   WP_PASS     Application Password (from WP Admin → Users → Profile)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "../content/en");

const WP_URL  = process.env.WP_URL  || "http://iciitp.local";
const WP_USER = process.env.WP_USER || "";
const WP_PASS = process.env.WP_PASS || "";

if (!WP_USER || !WP_PASS) {
  console.error("❌  Set WP_USER and WP_PASS env vars before running.");
  process.exit(1);
}

const AUTH = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

async function wpPost(postType, body) {
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/${postType}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${AUTH}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(json)}`);
  return json;
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, relPath), "utf-8"));
}

// Only include a field if it has a non-empty value
function opt(val) { return (val && String(val).trim()) ? val : undefined; }
// Lowercase and validate select values against allowed list
function sel(val, allowed) {
  const v = (val || "").toLowerCase().trim();
  return allowed.includes(v) ? v : undefined;
}

function readDir(dir) {
  return fs.readdirSync(path.join(CONTENT, dir))
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(CONTENT, dir, f), "utf-8")));
}

// ── Programs ──────────────────────────────────────────────────────────────────
async function importPrograms() {
  console.log("\n📦 Importing Programs…");
  const programs = readDir("programs");
  for (const p of programs) {
    try {
      const post = await wpPost("ic_program", {
        title:  p.title,
        content: p.about || "",
        status: "publish",
        acf: {
          slug:                 p.slug,
          badge:                opt(p.badge),
          tagline:              opt(p.tagline),
          funder:               opt(p.funder),
          status:               sel(p.status, ["open","closed","upcoming","ongoing"]),
          status_note:          opt(p.statusNote),
          grant:                opt(p.grant),
          duration:             opt(p.duration),
          stipend:              opt(p.stipend),
          apply_url:            opt(p.applyUrl),
          contact_email:        opt(p.contactEmail),
          application_deadline: opt(p.applicationDeadline),
          custom_badge:         opt(p.customBadge),
          eligibility:          opt((p.eligibility || []).join("\n")),
          sectors:              opt((p.sectors || []).join(", ")),
          last_updated:         opt(p.lastUpdated),
        },
      });
      console.log(`  ✅ ${p.title} (id: ${post.id})`);
    } catch (e) {
      console.error(`  ❌ ${p.title}: ${e.message}`);
    }
  }
}

// ── Events ────────────────────────────────────────────────────────────────────
async function importEvents() {
  console.log("\n📅 Importing Events…");
  const events = readDir("events");
  for (const e of events) {
    try {
      const post = await wpPost("ic_event", {
        title:   e.title,
        content: e.description || "",
        status:  "publish",
        acf: {
          slug:                e.slug,
          short_title:         opt(e.shortTitle),
          tagline:             opt(e.tagline),
          category:            opt(e.category),
          status:              sel(e.status, ["upcoming","ongoing","completed"]),
          organiser:           opt(e.organiser),
          start_date:          opt(e.startDate),
          valid_from:          opt(e.validFrom),
          valid_to:            opt(e.validTo),
          mode:                sel(e.mode, ["online","offline","hybrid"]),
          venue:               opt(e.venue),
          apply_url:           opt(e.applyUrl),
          submission_deadline: opt(e.submissionDeadline),
          custom_badge:        opt(e.customBadge),
          contact_email:       opt(typeof e.contact === "object" ? e.contact?.email : null),
          contact_phone:       opt(typeof e.contact === "object" ? e.contact?.phone : null),
        },
      });
      console.log(`  ✅ ${e.title} (id: ${post.id})`);
    } catch (err) {
      console.error(`  ❌ ${e.title}: ${err.message}`);
    }
  }
}

// ── Notifications ─────────────────────────────────────────────────────────────
async function importNotifications() {
  console.log("\n🔔 Importing Notifications…");
  const notifications = readDir("notifications");
  const typeMap = {
    "careers":            "careers",
    "call-for-proposals": "proposal",
    "niq-tender":         "tender",
  };
  for (const n of notifications) {
    try {
      const post = await wpPost("ic_notification", {
        title:   n.title,
        content: n.body || "",
        status:  "publish",
        acf: {
          notification_type: sel(typeMap[n.slug], ["careers","proposal","tender"]),
          deadline:          opt(n.validTo),
          valid_from:        opt(n.validFrom),
          external_url:      opt(n.externalUrl),
          contact_email:     opt(n.contactEmail),
          custom_badge:      opt(n.customBadge),
        },
      });
      console.log(`  ✅ ${n.title} (id: ${post.id})`);
    } catch (e) {
      console.error(`  ❌ ${n.title}: ${e.message}`);
    }
  }
}

// ── Startups ──────────────────────────────────────────────────────────────────
async function importStartups() {
  console.log("\n🚀 Importing Startups…");
  const startups = readJson("startups/index.json");
  for (const s of startups) {
    try {
      const post = await wpPost("ic_startup", {
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
      console.log(`  ✅ ${s.name} (id: ${post.id})`);
    } catch (e) {
      console.error(`  ❌ ${s.name}: ${e.message}`);
    }
  }
}

// ── Team ──────────────────────────────────────────────────────────────────────
async function importTeam() {
  console.log("\n👥 Importing Team…");
  const roles = [
    { file: "team/governance.json", role: "governance" },
    { file: "team/evaluation.json", role: "evaluation" },
    { file: "team/staff.json",      role: "staff" },
  ];
  let order = 1;
  for (const { file, role } of roles) {
    const members = readJson(file);
    for (const m of members) {
      try {
        const post = await wpPost("ic_team", {
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
        console.log(`  ✅ ${m.name} [${role}] (id: ${post.id})`);
      } catch (e) {
        console.error(`  ❌ ${m.name}: ${e.message}`);
      }
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌐 Connecting to ${WP_URL} as "${WP_USER}"…`);

  // Verify connection
  const ping = await fetch(`${WP_URL}/wp-json/wp/v2/users/me`, {
    headers: { "Authorization": `Basic ${AUTH}` },
  });
  if (!ping.ok) {
    console.error("❌  Authentication failed. Check WP_USER and WP_PASS.");
    process.exit(1);
  }
  const me = await ping.json();
  console.log(`✅  Authenticated as: ${me.name} (${me.roles?.join(", ")})`);

  await importPrograms();
  await importEvents();
  await importNotifications();
  await importStartups();
  await importTeam();

  console.log("\n🎉 Import complete!\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
