(function () {
  "use strict";

  const isGamePage = location.pathname.includes("/games/");
  const root = isGamePage ? ".." : ".";
  const href = path => `${root}/${path}`;

  function language() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function pageKey() {
    const path = location.pathname.toLowerCase();
    if (path.includes("practice.html")) return "practice";
    if (path.includes("dashboard.html")) return "progress";
    if (path.includes("mistakes.html")) return "mistakes";
    if (path.includes("account.html")) return "account";
    if (path.includes("assignment-builder.html")) return "assignment";
    if (path.includes("login.html") || path.includes("auth-callback.html") || path.includes("reset-password.html")) return "account";
    if (path.includes("/games/")) return "tool";
    return "home";
  }

  function currentTool() {
    if (!isGamePage || !window.MCLToolCatalog?.tools) return null;
    const filename = decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();
    return window.MCLToolCatalog.tools.find(tool => String(tool.href || "").split("/").pop().split("?")[0].split("#")[0].toLowerCase() === filename) || null;
  }

  const copy = {
    en: {
      home: "Home",
      practice: "Practice Library",
      progress: "Progress",
      mistakes: "Mistakes",
      account: "Account",
      login: "Sign in",
      settings: "Account settings",
      syncReady: "Cloud sync ready",
      syncPending: count => `${count} waiting to sync`,
      logout: "Sign out",
      themeLight: "Use light theme",
      themeDark: "Use dark theme",
      menu: "Open navigation",
      closeMenu: "Close navigation",
      accountMenu: "Open account menu"
    },
    zh: {
      home: "首页",
      practice: "练习库",
      progress: "学习进度",
      mistakes: "错题",
      account: "账户",
      login: "登录",
      settings: "账户设置",
      syncReady: "云端同步正常",
      syncPending: count => `${count} 条记录等待同步`,
      logout: "退出登录",
      themeLight: "切换到浅色主题",
      themeDark: "切换到深色主题",
      menu: "打开导航菜单",
      closeMenu: "关闭导航菜单",
      accountMenu: "打开账户菜单"
    }
  };

  function icon(name, fallback) {
    return `<i data-lucide="${name}" aria-hidden="true"></i><span class="mcl-icon-fallback" aria-hidden="true">${fallback}</span>`;
  }

  function navLink(key, path) {
    const active = pageKey() === key;
    return `<a class="mcl-app-nav__link" href="${href(path)}"${active ? ' aria-current="page"' : ""}>${copy[language()][key]}</a>`;
  }

  function languageSwitch(className = "") {
    const lang = language();
    return `<div class="mcl-language-switch ${className}" role="group" aria-label="Language">
      <button class="mcl-language-button${lang === "en" ? " active" : ""}" type="button" data-mcl-language="en" aria-pressed="${lang === "en"}">EN</button>
      <button class="mcl-language-button${lang === "zh" ? " active" : ""}" type="button" data-mcl-language="zh" aria-pressed="${lang === "zh"}">中文</button>
    </div>`;
  }

  function accountMenu(t) {
    return `<div class="mcl-account" data-auth-show="logged-in" hidden>
      <button class="mcl-account__trigger" type="button" aria-expanded="false" aria-controls="mclAccountPopover" aria-label="${t.accountMenu}">
        <span class="mcl-account__avatar" data-auth-initial>A</span>
        <span class="mcl-account__trigger-name" data-auth-name></span>
        ${icon("chevron-down", "v")}
      </button>
      <div class="mcl-account__popover" id="mclAccountPopover" hidden>
        <div class="mcl-account__identity">
          <strong data-auth-name></strong>
          <span data-auth-email></span>
        </div>
        <div class="mcl-account__sync"><span class="mcl-account__sync-dot"></span><span data-auth-sync>${t.syncReady}</span></div>
        <a href="${href("account.html")}">${icon("settings", "*")}<span>${t.settings}</span></a>
        <a href="${href("dashboard.html")}">${icon("chart-no-axes-column-increasing", "#")}<span>${t.progress}</span></a>
        <a href="${href("mistakes.html")}">${icon("notebook-tabs", "!")}<span>${t.mistakes}</span></a>
        <button type="button" data-auth-logout data-redirect-after-logout="${href("index.html")}">${icon("log-out", "-")}<span>${t.logout}</span></button>
      </div>
    </div>`;
  }

  function render() {
    document.body.classList.toggle("mcl-tool-page", isGamePage);
    document.body.dataset.mclPage = pageKey();
    const tool = currentTool();
    if (tool?.primaryCourse) document.body.dataset.courseAccent = tool.primaryCourse;

    const t = copy[language()];
    const currentNav = document.querySelector(".nav, .mc-site-shell, .mcl-app-header");
    document.querySelector(".mcl-mobile-panel")?.remove();

    const header = document.createElement("header");
    header.className = "mcl-app-header";
    header.innerHTML = `<div class="mcl-app-header__inner">
      <a class="mcl-app-brand" href="${href("index.html")}" aria-label="MathComplete Lab">
        <span class="mcl-app-brand__mark">&Sigma;</span>
        <span class="mcl-app-brand__name">MathComplete Lab</span>
      </a>
      <nav class="mcl-app-nav" aria-label="Primary navigation">
        ${navLink("home", "index.html")}
        ${navLink("practice", "practice.html")}
        ${navLink("progress", "dashboard.html")}
        ${navLink("mistakes", "mistakes.html")}
      </nav>
      <div class="mcl-app-actions">
        ${languageSwitch()}
        <button class="mcl-icon-button" type="button" data-mcl-theme-toggle aria-label="${window.MCLTheme?.get() === "dark" ? t.themeLight : t.themeDark}">
          ${icon(window.MCLTheme?.get() === "dark" ? "sun" : "moon", "T")}
        </button>
        <a class="mcl-app-nav__link mcl-account-link" href="${href("login.html")}" data-auth-show="logged-out"${pageKey() === "account" ? ' aria-current="page"' : ""}>${t.login}</a>
        ${accountMenu(t)}
        <button class="mcl-menu-button" type="button" aria-expanded="false" aria-controls="mclMobilePanel" aria-label="${t.menu}">${icon("menu", "=")}</button>
      </div>
    </div>`;

    const mobile = document.createElement("div");
    mobile.className = "mcl-mobile-panel";
    mobile.id = "mclMobilePanel";
    mobile.innerHTML = `
      ${navLink("home", "index.html")}
      ${navLink("practice", "practice.html")}
      ${navLink("progress", "dashboard.html")}
      ${navLink("mistakes", "mistakes.html")}
      <a class="mcl-app-nav__link" href="${href("login.html")}" data-auth-show="logged-out">${t.login}</a>
      <div class="mcl-mobile-account" data-auth-show="logged-in" hidden>
        <div class="mcl-mobile-account__identity"><span class="mcl-account__avatar" data-auth-initial>A</span><span><strong data-auth-name></strong><small data-auth-email></small></span></div>
        <a class="mcl-app-nav__link" href="${href("account.html")}">${t.settings}</a>
        <button class="mcl-app-nav__link" type="button" data-auth-logout data-redirect-after-logout="${href("index.html")}">${t.logout}</button>
      </div>
      <div class="mcl-mobile-panel__actions">
        ${languageSwitch("mcl-language-switch--mobile")}
        <button class="mcl-icon-button" type="button" data-mcl-theme-toggle aria-label="${window.MCLTheme?.get() === "dark" ? t.themeLight : t.themeDark}">${icon(window.MCLTheme?.get() === "dark" ? "sun" : "moon", "T")}</button>
      </div>`;

    if (currentNav) currentNav.replaceWith(header);
    else document.body.prepend(header);
    header.after(mobile);

    function refreshIcons() {
      if (!window.lucide?.createIcons) return;
      window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
      document.querySelectorAll(".mcl-icon-fallback").forEach(node => node.remove());
    }
    refreshIcons();
    window.addEventListener("load", refreshIcons, { once: true });

    document.querySelectorAll("[data-mcl-language]").forEach(button => {
      button.addEventListener("click", () => {
        const next = button.dataset.mclLanguage === "zh" ? "zh" : "en";
        if (next === language()) return;
        localStorage.setItem("mathcomplete_lang", next);
        location.reload();
      });
    });

    function renderThemeButtons() {
      const dark = window.MCLTheme?.get() === "dark";
      document.querySelectorAll("[data-mcl-theme-toggle]").forEach(button => {
        button.setAttribute("aria-label", dark ? t.themeLight : t.themeDark);
        button.innerHTML = icon(dark ? "sun" : "moon", "T");
      });
      refreshIcons();
    }
    document.querySelectorAll("[data-mcl-theme-toggle]").forEach(button => button.addEventListener("click", () => {
      window.MCLTheme?.toggle();
      renderThemeButtons();
    }));

    const menuButton = header.querySelector(".mcl-menu-button");
    function setMobileMenu(open) {
      mobile.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? t.closeMenu : t.menu);
      menuButton.innerHTML = icon(open ? "x" : "menu", open ? "x" : "=");
      refreshIcons();
    }
    menuButton.addEventListener("click", () => setMobileMenu(!mobile.classList.contains("open")));

    const account = header.querySelector(".mcl-account");
    const accountTrigger = account?.querySelector(".mcl-account__trigger");
    const popover = account?.querySelector(".mcl-account__popover");
    function setAccountMenu(open) {
      if (!accountTrigger || !popover) return;
      accountTrigger.setAttribute("aria-expanded", String(open));
      popover.hidden = !open;
    }
    accountTrigger?.addEventListener("click", () => setAccountMenu(popover.hidden));

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      setMobileMenu(false);
      setAccountMenu(false);
    });
    document.addEventListener("click", event => {
      const path = event.composedPath?.() || [];
      if (mobile.classList.contains("open") && !path.includes(header) && !path.includes(mobile)) setMobileMenu(false);
      if (popover && !popover.hidden && !path.includes(account)) setAccountMenu(false);
    });

    function applyAuth(snapshot) {
      window.MCLAuthUI?.refresh?.();
      const signedIn = ["authenticated", "mfa-required", "recovery"].includes(snapshot?.status) && snapshot?.user;
      if (!signedIn) setAccountMenu(false);
      const pending = Number(window.MCLProgress?.getPendingSyncCount?.(snapshot?.user?.id) || 0);
      document.querySelectorAll("[data-auth-sync]").forEach(node => {
        node.textContent = pending ? t.syncPending(pending) : t.syncReady;
      });
    }
    applyAuth(window.MCLAuth?.getState?.());
    window.MCLAuth?.subscribe?.(applyAuth);
    window.addEventListener("mcl:syncchange", () => applyAuth(window.MCLAuth?.getState?.()));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
