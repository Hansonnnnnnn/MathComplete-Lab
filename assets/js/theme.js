(function () {
  const STORAGE_KEY = "mcl_theme";
  const MEDIA_QUERY = "(prefers-color-scheme: dark)";
  const root = document.documentElement;

  function storedTheme() {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  }

  function systemTheme() {
    return window.matchMedia?.(MEDIA_QUERY).matches ? "dark" : "light";
  }

  function get() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function apply(theme, persist) {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;
    root.style.colorScheme = next;
    if (persist) localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent("mcl:themechange", { detail: { theme: next } }));
    return next;
  }

  function set(theme) {
    return apply(theme, true);
  }

  function toggle() {
    return set(get() === "dark" ? "light" : "dark");
  }

  function resetToSystem() {
    localStorage.removeItem(STORAGE_KEY);
    return apply(systemTheme(), false);
  }

  apply(storedTheme() || systemTheme(), false);

  const media = window.matchMedia?.(MEDIA_QUERY);
  media?.addEventListener?.("change", event => {
    if (!storedTheme()) apply(event.matches ? "dark" : "light", false);
  });

  window.MCLTheme = { get, set, toggle, resetToSystem };
})();
