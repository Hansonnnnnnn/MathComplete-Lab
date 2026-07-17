(function () {
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
    if (path.includes("login.html")) return "account";
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
      login: "Sign in",
      themeLight: "Use light theme",
      themeDark: "Use dark theme",
      menu: "Open navigation",
      closeMenu: "Close navigation"
    },
    zh: {
      home: "首页",
      practice: "练习库",
      progress: "学习进度",
      mistakes: "错题",
      login: "登录",
      themeLight: "切换到浅色主题",
      themeDark: "切换到深色主题",
      menu: "打开导航菜单",
      closeMenu: "关闭导航菜单"
    }
  };

  function icon(name, fallback) {
    return `<i data-lucide="${name}" aria-hidden="true"></i><span class="mcl-icon-fallback" aria-hidden="true">${fallback}</span>`;
  }

  function navLink(key, path, secondary) {
    const active = pageKey() === key;
    return `<a class="mcl-app-nav__link" href="${href(path)}"${active ? ' aria-current="page"' : ""}${secondary ? ' data-secondary="true"' : ""}>${copy[language()][key]}</a>`;
  }

  function languageSwitch(className) {
    const lang = language();
    return `<div class="mcl-language-switch ${className || ""}" role="group" aria-label="Language">
      <button class="mcl-language-button${lang === "en" ? " active" : ""}" type="button" data-mcl-language="en" aria-pressed="${lang === "en"}">EN</button>
      <button class="mcl-language-button${lang === "zh" ? " active" : ""}" type="button" data-mcl-language="zh" aria-pressed="${lang === "zh"}">中文</button>
    </div>`;
  }

  function render() {
    document.body.classList.toggle("mcl-tool-page", isGamePage);
    document.body.dataset.mclPage = pageKey();
    const tool = currentTool();
    if (tool?.primaryCourse) document.body.dataset.courseAccent = tool.primaryCourse;
    const t = copy[language()];
    const currentNav = document.querySelector(".nav, .mc-site-shell");
    const header = document.createElement("header");
    header.className = "mcl-app-header";
    header.innerHTML = `<div class="mcl-app-header__inner">
      <a class="mcl-app-brand" href="${href("index.html")}" aria-label="MathComplete Lab">
        <span class="mcl-app-brand__mark">∑</span>
        <span class="mcl-app-brand__name">MathComplete Lab</span>
      </a>
      <nav class="mcl-app-nav" aria-label="Primary navigation">
        ${navLink("home", "index.html")}
        ${navLink("practice", "practice.html")}
        ${navLink("progress", "dashboard.html", true)}
        ${navLink("mistakes", "mistakes.html", true)}
      </nav>
      <div class="mcl-app-actions">
        ${languageSwitch()}
        <button class="mcl-icon-button" type="button" data-mcl-theme-toggle title="${window.MCLTheme?.get() === "dark" ? t.themeLight : t.themeDark}" aria-label="${window.MCLTheme?.get() === "dark" ? t.themeLight : t.themeDark}">
          ${icon(window.MCLTheme?.get() === "dark" ? "sun" : "moon", window.MCLTheme?.get() === "dark" ? "☀" : "☾")}
        </button>
        <a class="mcl-app-nav__link mcl-account-link" href="${href("login.html")}" data-auth-show="logged-out"${pageKey() === "account" ? ' aria-current="page"' : ""}>${t.login}</a>
        <button class="mcl-menu-button" type="button" aria-expanded="false" aria-controls="mclMobilePanel" aria-label="${t.menu}">${icon("menu", "☰")}</button>
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
      <div class="mcl-mobile-panel__actions">
        ${languageSwitch("mcl-language-switch--mobile")}
        <button class="mcl-icon-button" type="button" data-mcl-theme-toggle aria-label="${window.MCLTheme?.get() === "dark" ? t.themeLight : t.themeDark}">
          ${icon(window.MCLTheme?.get() === "dark" ? "sun" : "moon", window.MCLTheme?.get() === "dark" ? "☀" : "☾")}
        </button>
      </div>`;

    if (currentNav) currentNav.replaceWith(header);
    else document.body.prepend(header);
    header.after(mobile);

    function refreshIcons() {
      if (window.lucide?.createIcons) {
        window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
        document.querySelectorAll(".mcl-icon-fallback").forEach(node => node.remove());
      }
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

    document.querySelectorAll("[data-mcl-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        window.MCLTheme?.toggle();
        renderThemeButtons();
      });
    });

    function renderThemeButtons() {
      const dark = window.MCLTheme?.get() === "dark";
      document.querySelectorAll("[data-mcl-theme-toggle]").forEach(button => {
        button.title = dark ? t.themeLight : t.themeDark;
        button.setAttribute("aria-label", dark ? t.themeLight : t.themeDark);
        button.innerHTML = icon(dark ? "sun" : "moon", dark ? "☀" : "☾");
      });
      refreshIcons();
    }

    const menuButton = header.querySelector(".mcl-menu-button");
    function setMenu(open) {
      mobile.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? t.closeMenu : t.menu);
      menuButton.innerHTML = icon(open ? "x" : "menu", open ? "×" : "☰");
      refreshIcons();
    }
    menuButton.addEventListener("click", () => setMenu(!mobile.classList.contains("open")));
    document.addEventListener("keydown", event => { if (event.key === "Escape") setMenu(false); });
    document.addEventListener("click", event => {
      if (!mobile.classList.contains("open")) return;
      const clickPath = event.composedPath?.() || [];
      if (!clickPath.includes(header) && !clickPath.includes(mobile)) setMenu(false);
    });

    window.MCLAuthUI?.refresh?.();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
