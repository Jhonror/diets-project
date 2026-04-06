const fs = require("fs");
const path = require("path");

/** Carga .env local sin depender de dotenv (Netlify no instala node_modules en nuestro build). */
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    if (k in process.env) continue;
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[k] = v;
  }
}

loadEnvFile();

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.warn(
    "[build] SUPABASE_URL or SUPABASE_ANON_KEY missing — js/supabase-config.js will be empty. Netlify: Environment variables. Local: .env (Publishable o legacy anon)."
  );
}

const outDir = path.join(__dirname, "..", "js");
fs.mkdirSync(outDir, { recursive: true });
const payload = JSON.stringify(
  { SUPABASE_URL: url, SUPABASE_ANON_KEY: key },
  null,
  0
);
fs.writeFileSync(
  path.join(outDir, "supabase-config.js"),
  `window.__ENV = ${payload};\n`
);
