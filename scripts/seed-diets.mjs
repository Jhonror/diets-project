/**
 * One-time local seed: uploads diet HTML from content/diets/ linked to Auth users by email.
 *
 * Prerequisites:
 * 1. Run supabase/schema.sql in the Supabase SQL editor.
 * 2. Create users in Supabase → Authentication → Users (email + password).
 * 3. Copy .env.example to .env and fill SUPABASE_URL + SERVICE_ROLE_KEY (never commit .env).
 * 4. Edit DIETS below with the same emails you created.
 *
 * Run: npm run seed
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const DIETS = [
  {
    email: "karen@example.com",
    slug: "karen_rivera",
    title: "Plan nutricional — Karen Rivera",
    file: "karen_rivera.html",
  },
  {
    email: "jhon@example.com",
    slug: "jhon_romero",
    title: "Plan nutricional — Jhon Romero",
    file: "jhon_romero.html",
  },
];

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(email) {
  const perPage = 200;
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) return u.id;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function main() {
  for (const row of DIETS) {
    const userId = await findUserIdByEmail(row.email);
    if (!userId) {
      console.error(`No Auth user with email: ${row.email} — create the user in Supabase first.`);
      process.exit(1);
    }
    const filePath = path.join(root, "content", "diets", row.file);
    const body_html = fs.readFileSync(filePath, "utf8");

    await admin.from("diets").delete().eq("user_id", userId).eq("slug", row.slug);
    const { error } = await admin.from("diets").insert({
      user_id: userId,
      slug: row.slug,
      title: row.title,
      body_html,
    });
    if (error) {
      console.error("Insert error:", error);
      process.exit(1);
    }
    console.log("Seeded:", row.slug, "→", row.email);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
