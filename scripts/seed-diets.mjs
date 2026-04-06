/**
 * One-time local seed: uploads diet HTML from content/diets/ linked to Auth users by email.
 *
 * Prerequisites:
 * 1. Run supabase/schema.sql in the Supabase SQL editor.
 * 2. Create users in Supabase → Authentication → Users (email + password).
 * 3. Copy .env.example to .env and fill SUPABASE_URL + SERVICE_ROLE_KEY (never commit .env).
 * 4. Mismos correos que en Supabase Auth: edita el array DIETS o define en .env:
 *    SEED_EMAIL_KAREN=... y SEED_EMAIL_JHON=...
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
    email: process.env.SEED_EMAIL_KAREN || "karen@example.com",
    slug: "karen_rivera",
    title: "Plan nutricional — Karen Rivera",
    file: "karen_rivera.html",
  },
  {
    email: process.env.SEED_EMAIL_JHON || "jhon.jromerot@gmail.com",
    slug: "jhon_romero",
    title: "Plan nutricional — Jhon Romero",
    file: "jhon_romero.html",
  },
];

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  1) Copia .env.example a .env en la raíz del proyecto.\n" +
      "  2) Supabase → Project Settings → API: pega Project URL y la key service_role (secreta).\n" +
      "  3) Vuelve a ejecutar: npm run seed"
  );
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
      console.error(
        `No existe un usuario en Supabase Auth con el correo: ${row.email}\n\n` +
          `Opciones:\n` +
          `  • Supabase → Authentication → Users → Add user → crea ese correo con contraseña.\n` +
          `  • O ajusta el correo en .env: SEED_EMAIL_KAREN / SEED_EMAIL_JHON (o edita el array DIETS en este script).\n` +
          `El correo del seed debe coincidir exactamente con el del usuario en Auth.`
      );
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
