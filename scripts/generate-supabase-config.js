const fs = require("fs");
const path = require("path");

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.warn(
    "[build] SUPABASE_URL or SUPABASE_ANON_KEY missing — js/supabase-config.js will be empty. Set them in Netlify (Site settings → Environment variables)."
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
