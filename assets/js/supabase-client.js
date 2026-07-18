/* MathComplete Lab - public application and Supabase configuration. */
(function () {
  "use strict";

  window.MCL = window.MCL || {};

  const config = {
    supabaseUrl: "https://hcrxxfcvmrjahnjlbjur.supabase.co",
    supabasePublishableKey: "sb_publishable_NqpfpyfzywQpEq7JiRwxuQ_oVaTjRRU",
    productionBaseUrl: "https://hansonnnnnnn.github.io/MathComplete-Lab/",
    turnstileSiteKey: "PASTE_TURNSTILE_SITE_KEY",
    termsVersion: "2026-07-17",
    privacyVersion: "2026-07-17",
    minimumPasswordLength: 12,
    rememberedSessionDays: 30
  };

  const projectRef = (() => {
    try {
      return new URL(config.supabaseUrl).hostname.split(".")[0];
    } catch {
      return "mathcomplete-lab";
    }
  })();
  const storageKey = `sb-${projectRef}-auth-token`;
  const persistenceKey = "mcl_auth_persistence";
  const absoluteExpiryKey = "mcl_auth_absolute_expiry";
  const maxRememberedMs = config.rememberedSessionDays * 24 * 60 * 60 * 1000;

  function isPlaceholder(value) {
    return !value || String(value).includes("PASTE_");
  }

  function persistenceMode() {
    return localStorage.getItem(persistenceKey) === "local" ? "local" : "session";
  }

  function clearAuthStorage() {
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
    localStorage.removeItem(absoluteExpiryKey);
  }

  function rememberedSessionExpired() {
    if (persistenceMode() !== "local") return false;
    const raw = Number(localStorage.getItem(absoluteExpiryKey));
    if (!raw && localStorage.getItem(storageKey)) {
      localStorage.setItem(absoluteExpiryKey, String(Date.now() + maxRememberedMs));
      return false;
    }
    return Boolean(raw && Date.now() >= raw);
  }

  function preferredStorage() {
    return persistenceMode() === "local" ? localStorage : sessionStorage;
  }

  function secondaryStorage() {
    return persistenceMode() === "local" ? sessionStorage : localStorage;
  }

  const authStorage = {
    getItem(key) {
      if (rememberedSessionExpired()) {
        clearAuthStorage();
        return null;
      }
      return preferredStorage().getItem(key);
    },
    setItem(key, value) {
      preferredStorage().setItem(key, value);
      secondaryStorage().removeItem(key);
    },
    removeItem(key) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  };

  function setAuthPersistence(mode, options = {}) {
    const next = mode === "local" ? "local" : "session";
    const existing = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    localStorage.setItem(persistenceKey, next);

    if (next === "local") {
      if (existing) localStorage.setItem(storageKey, existing);
      sessionStorage.removeItem(storageKey);
      if (options.resetExpiry !== false || !localStorage.getItem(absoluteExpiryKey)) {
        localStorage.setItem(absoluteExpiryKey, String(Date.now() + maxRememberedMs));
      }
    } else {
      if (existing) sessionStorage.setItem(storageKey, existing);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(absoluteExpiryKey);
    }
  }

  function runtimeBaseUrl() {
    if (location.protocol === "file:") return config.productionBaseUrl;
    const isLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(location.hostname);
    if (!isLocal) return config.productionBaseUrl;

    const path = location.pathname;
    const rootPath = path.includes("/games/")
      ? path.slice(0, path.indexOf("/games/") + 1)
      : path.slice(0, path.lastIndexOf("/") + 1);
    return `${location.origin}${rootPath}`;
  }

  window.MCL.appConfig = Object.freeze({
    ...config,
    hasTurnstile: !isPlaceholder(config.turnstileSiteKey)
  });
  window.MCL.supabaseConfig = {
    url: config.supabaseUrl,
    key: config.supabasePublishableKey,
    storageKey,
    persistenceKey,
    absoluteExpiryKey,
    isConfigured: !isPlaceholder(config.supabaseUrl) && !isPlaceholder(config.supabasePublishableKey)
  };
  window.MCL.publicBaseUrl = runtimeBaseUrl;
  window.MCL.setAuthPersistence = setAuthPersistence;
  window.MCL.getAuthPersistence = persistenceMode;
  window.MCL.clearAuthStorage = clearAuthStorage;
  window.MCL.isRememberedSessionExpired = rememberedSessionExpired;

  if (!window.MCL.supabaseConfig.isConfigured) {
    console.warn("[MathComplete Lab] Supabase public configuration is incomplete.");
    window.MCL.supabaseClient = null;
    return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("[MathComplete Lab] Supabase JS did not load.");
    window.MCL.supabaseClient = null;
    return;
  }

  window.MCL.supabaseClient = window.supabase.createClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        storageKey,
        storage: authStorage
      }
    }
  );
})();
