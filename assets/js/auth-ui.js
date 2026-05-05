/*
  MathComplete Lab - Auth UI Bridge
*/

(function () {
  const UI_CACHE_KEY = "mcl_auth_ui_v1";

  function hide(el, shouldHide) {
    el.classList.toggle("mcl-hidden", shouldHide);
    el.toggleAttribute("hidden", shouldHide);
  }

  function currentLang() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function fallbackName(user) {
    return user?.email?.split("@")[0] || "";
  }

  function displayNameFor(user, profile) {
    return (
      profile?.display_name ||
      user?.user_metadata?.display_name ||
      fallbackName(user)
    );
  }

  function greetingFor(name) {
    if (!name) return "";
    return currentLang() === "zh" ? `你好，${name}` : `Hi, ${name}`;
  }

  function readUICache() {
    try {
      const raw = localStorage.getItem(UI_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeUICache(session, profile = null) {
    const user = session?.user;
    if (!user) return;

    localStorage.setItem(UI_CACHE_KEY, JSON.stringify({
      email: user.email || "",
      name: displayNameFor(user, profile),
      plan: profile?.plan || "free"
    }));
  }

  function clearUICache() {
    localStorage.removeItem(UI_CACHE_KEY);
  }

  function applyLoggedOutUI() {
    document.querySelectorAll('[data-auth-show="logged-out"]').forEach(el => hide(el, false));
    document.querySelectorAll('[data-auth-show="logged-in"]').forEach(el => hide(el, true));
    document.querySelectorAll("[data-auth-email]").forEach(el => el.textContent = "");
    document.querySelectorAll("[data-auth-greeting]").forEach(el => el.textContent = "");
    document.querySelectorAll("[data-auth-plan]").forEach(el => el.textContent = "free");
  }

  function applyLoggedInUI(session, profile = null) {
    const user = session?.user;
    const name = displayNameFor(user, profile);

    document.querySelectorAll('[data-auth-show="logged-out"]').forEach(el => hide(el, true));
    document.querySelectorAll('[data-auth-show="logged-in"]').forEach(el => hide(el, false));
    document.querySelectorAll("[data-auth-email]").forEach(el => el.textContent = user?.email || "");
    document.querySelectorAll("[data-auth-greeting]").forEach(el => el.textContent = greetingFor(name));
    document.querySelectorAll("[data-auth-plan]").forEach(el => el.textContent = profile?.plan || "free");
  }

  function applyCachedUI() {
    const session = window.MCLAuth?.getCachedSession?.();
    const cache = readUICache();

    if (!session?.user) return false;

    applyLoggedInUI(session, {
      display_name: cache?.name || displayNameFor(session.user),
      plan: cache?.plan || "free"
    });
    return true;
  }

  async function refreshAuthUI() {
    if (!window.MCLAuth?.isConfigured?.()) {
      applyLoggedOutUI();
      return;
    }

    let session = null;

    try {
      const result = await window.MCLAuth.getSession();
      session = result?.session || null;
    } catch (err) {
      console.warn("[MathComplete Lab] Could not read session.", err);
    }

    const isLoggedIn = Boolean(session?.user);

    if (!isLoggedIn) {
      applyLoggedOutUI();
      return;
    }

    applyLoggedInUI(session);
    writeUICache(session);

    try {
      const { profile } = await window.MCLAuth.getOwnProfile();
      applyLoggedInUI(session, profile);
      writeUICache(session, profile);
    } catch (err) {
      console.warn("[MathComplete Lab] Could not load profile.", err);
    }
  }

  function setupLogoutDelegation() {
    document.addEventListener("click", async event => {
      const btn = event.target.closest("[data-auth-logout]");
      if (!btn) return;

      event.preventDefault();
      if (btn.dataset.authBusy === "true") return;

      btn.dataset.authBusy = "true";
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = btn.dataset.loadingText || "Logging out...";
      const redirectValue = btn.dataset.redirectAfterLogout;

      applyLoggedOutUI();
      clearUICache();

      try {
        await window.MCLAuth.signOut();
      } catch (err) {
        console.warn("[MathComplete Lab] Sign out did not finish cleanly.", err);
      } finally {
        delete btn.dataset.authBusy;
        btn.disabled = false;
        btn.textContent = originalText;
      }

      if (redirectValue && redirectValue !== "false") {
        window.location.href = redirectValue;
      }
    });
  }

  function initAuthUI() {
    setupLogoutDelegation();
    applyCachedUI();
    refreshAuthUI();
    window.MCLAuth?.onAuthStateChange?.(() => refreshAuthUI());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthUI);
  } else {
    initAuthUI();
  }

  window.MCLAuthUI = {
    refresh: refreshAuthUI,
    showCached: applyCachedUI,
    showLoggedOut: applyLoggedOutUI
  };
})();
