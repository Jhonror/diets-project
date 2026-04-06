import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function getSupabase() {
  const env = window.__ENV;
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    throw new Error(
      "Falta configuración de Supabase. En Netlify define SUPABASE_URL y SUPABASE_ANON_KEY; en local copia js/supabase-config.example.js a js/supabase-config.js."
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
