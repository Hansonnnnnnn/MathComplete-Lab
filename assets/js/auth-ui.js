/* MathComplete Lab - authenticated/anonymous DOM bridge. */
(function () {
  "use strict";

  function hidden(element, value) {
    element.classList.toggle("mcl-hidden", value);
    element.toggleAttribute("hidden", value);
  }

  function language() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function displayName(snapshot) {
    return snapshot?.profile?.display_name || snapshot?.user?.user_metadata?.display_name || snapshot?.user?.email?.split("@")[0] || "";
  }

  function apply(snapshot = window.MCLAuth?.getState?.()) {
    const signedIn = ["authenticated", "mfa-required", "recovery"].includes(snapshot?.status) && Boolean(snapshot?.user);
    const name = displayName(snapshot);
    const greeting = language() === "zh" ? `你好，${name}` : `Hi, ${name}`;

    document.querySelectorAll('[data-auth-show="logged-out"]').forEach(node => hidden(node, signedIn));
    document.querySelectorAll('[data-auth-show="logged-in"]').forEach(node => hidden(node, !signedIn));
    document.querySelectorAll("[data-auth-email]").forEach(node => { node.textContent = signedIn ? snapshot.user.email || "" : ""; });
    document.querySelectorAll("[data-auth-name]").forEach(node => { node.textContent = signedIn ? name : ""; });
    document.querySelectorAll("[data-auth-greeting]").forEach(node => { node.textContent = signedIn ? greeting : ""; });
    document.querySelectorAll("[data-auth-plan]").forEach(node => { node.textContent = signedIn ? snapshot.entitlement?.plan || "free" : "free"; });
    document.querySelectorAll("[data-auth-initial]").forEach(node => { node.textContent = signedIn ? (name || snapshot.user.email || "A").trim().charAt(0).toUpperCase() : ""; });
    document.documentElement.dataset.authState = snapshot?.status || "loading";
  }

  function setupLogout() {
    document.addEventListener("click", async event => {
      const button = event.target.closest("[data-auth-logout]");
      if (!button || button.dataset.authBusy === "true") return;
      event.preventDefault();
      button.dataset.authBusy = "true";
      button.disabled = true;
      try {
        await window.MCLAuth?.signOut?.(button.dataset.authScope || "local");
      } catch (error) {
        console.warn("[MathComplete Lab] Sign out failed.", error);
      } finally {
        delete button.dataset.authBusy;
        button.disabled = false;
      }
      const redirect = button.dataset.redirectAfterLogout;
      if (redirect && redirect !== "false") location.href = redirect;
    });
  }

  function initialize() {
    setupLogout();
    apply();
    window.MCLAuth?.subscribe?.(apply);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();

  window.MCLAuthUI = { refresh: () => apply(), showLoggedOut: () => apply({ status: "anonymous" }) };
})();
