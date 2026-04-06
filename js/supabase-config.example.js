// Copia a supabase-config.js para probar en local sin Netlify.
// O: npm run build (lee .env y genera supabase-config.js; ese archivo está en .gitignore).

window.__ENV = {
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "PEGA_AQUI_LA_CLAVE_PUBLICA_COMPLETA",
};
