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
  const AUTH_PERSISTENCE_KEY = "mcl_auth_persistence";

  function isPlaceholder(value) {
    return !value || value.includes("PASTE_YOUR_");
  }

  window.MCL.supabaseConfig = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    storageKey: SUPABASE_STORAGE_KEY,
    persistenceKey: AUTH_PERSISTENCE_KEY,
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

  function authPersistenceMode() {
    return localStorage.getItem(AUTH_PERSISTENCE_KEY) === "local" ? "local" : "session";
  }

  function authStorage() {
    const preferred = () => authPersistenceMode() === "local" ? localStorage : sessionStorage;
    const secondary = () => authPersistenceMode() === "local" ? sessionStorage : localStorage;

    return {
      getItem(key) {
        return preferred().getItem(key);
      },
      setItem(key, value) {
        preferred().setItem(key, value);
        secondary().removeItem(key);
      },
      removeItem(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    };
  }

  window.MCL.setAuthPersistence = function (mode) {
    const next = mode === "local" ? "local" : "session";
    localStorage.setItem(AUTH_PERSISTENCE_KEY, next);
    if (next === "session") localStorage.removeItem(SUPABASE_STORAGE_KEY);
    else sessionStorage.removeItem(SUPABASE_STORAGE_KEY);
  };

  window.MCL.getAuthPersistence = authPersistenceMode;

  window.MCL.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: SUPABASE_STORAGE_KEY,
      storage: authStorage()
    }
  });
})();
