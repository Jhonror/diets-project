// Copia a supabase-config.js para probar en local sin Netlify.
// O ejecuta: npm run build (lee .env y regenera supabase-config.js).

window.__ENV = {
  SUPABASE_URL: "https://rsqqebyfpxppytybualz.supabase.co",
  // Publishable (sb_publishable_...) o legacy anon (eyJ...)
  SUPABASE_ANON_KEY: "PEGA_AQUI_LA_CLAVE_PUBLICA_COMPLETA",
};
