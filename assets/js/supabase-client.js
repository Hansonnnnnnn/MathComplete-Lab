/*
  MathComplete Lab - Supabase Client
  Replace the two values below with your Supabase project URL and anon/publishable key.

  Supabase Dashboard:
  Project Settings → API → Project URL
  Project Settings → API → Project API keys → anon/public or publishable key
*/

(function () {
  window.MCL = window.MCL || {};

  const SUPABASE_URL = "https://hcrxxfcvmrjahnjlbjur.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_NqpfpyfzywQpEq7JiRwxuQ_oVaTjRRU";
  const SUPABASE_STORAGE_KEY = "sb-hcrxxfcvmrjahnjlbjur-auth-token";

  function isPlaceholder(value) {
    return !value || value.includes("PASTE_YOUR_");
  }

  window.MCL.supabaseConfig = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    storageKey: SUPABASE_STORAGE_KEY,
    isConfigured: !isPlaceholder(SUPABASE_URL) && !isPlaceholder(SUPABASE_ANON_KEY)
  };

  if (!window.MCL.supabaseConfig.isConfigured) {
    console.warn("[MathComplete Lab] Supabase is not configured yet. Update assets/js/supabase-client.js.");
    window.MCL.supabaseClient = null;
    return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("[MathComplete Lab] Supabase CDN client did not load.");
    window.MCL.supabaseClient = null;
    return;
  }

  window.MCL.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: SUPABASE_STORAGE_KEY
    }
  });
})();
