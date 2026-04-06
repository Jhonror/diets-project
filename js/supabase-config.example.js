// Copia este archivo a supabase-config.js y rellena con Project URL y anon key (Supabase → Settings → API).
// En Netlify no hace falta: el build genera js/supabase-config.js desde variables de entorno.

window.__ENV = {
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
};
