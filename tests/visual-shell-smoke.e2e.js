const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const baseUrl = process.env.MCL_TEST_BASE || "http://127.0.0.1:8765";

function htmlFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
    .map(entry => `${prefix}${entry.name}`)
    .sort();
}

const pages = [
  ...htmlFiles(root),
  ...htmlFiles(path.join(root, "games"), "games/")
];

const authStub = `
  (() => {
    const state = { status: "anonymous", user: null, session: null };
    window.MCLAuth = {
      initialize: async () => state,
      getState: () => state,
      isConfigured: () => false,
      subscribe: callback => { callback(state); return () => {}; },
      onAuthStateChange: callback => { callback("INITIAL_SESSION", null); return () => {}; },
      pageUrl: value => value,
      safeReturnTo: value => typeof value === "string" && value.startsWith("/") ? value : "index.html",
      rememberReturnTo() {},
      consumeReturnTo: () => "index.html",
      getSession: async () => null,
      getCachedSession: () => null,
      getConsent: async () => null,
      formatError: error => error && error.message ? error.message : "Authentication unavailable in visual test.",
      completeAuthCallback: async () => state,
      acceptConsents: async () => ({}),
      requestPasswordReset: async () => ({}),
      resendConfirmation: async () => ({}),
      signInWithGoogle: async () => ({}),
      signInWithPassword: async () => state,
      signUp: async () => ({}),
      verifyMfaChallenge: async () => state,
      updatePassword: async () => ({}),
      signOut: async () => state
    };
  })();
`;

const katexStub = `
  window.katex = {
    render(value, target) {
      if (!target) return;
      target.textContent = String(value == null ? "" : value)
        .replace(/\\\\text\\{([^}]*)\\}/g, "$1")
        .replace(/\\\\(?:left|right)/g, "");
    },
    renderToString(value) { return String(value == null ? "" : value); }
  };
`;

async function installRoutes(page) {
  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: authStub
  }));
  await page.route(/cdn\.jsdelivr\.net/, route => {
    const url = route.request().url();
    const isStyle = route.request().resourceType() === "stylesheet";
    let body = "";
    if (!isStyle && /katex/i.test(url)) body = katexStub;
    if (!isStyle && /lucide/i.test(url)) body = "window.lucide={createIcons(){}};";
    if (!isStyle && /supabase/i.test(url)) body = "window.supabase={createClient(){return null;}};";
    return route.fulfill({ contentType: isStyle ? "text/css" : "application/javascript", body });
  });
}

async function auditPage(page, relativePath, viewport, theme) {
  const errors = [];
  const onPageError = error => errors.push(error.message);
  page.on("pageerror", onPageError);

  const response = await page.goto(`${baseUrl}/${relativePath}?visual-shell-audit=${theme}`, {
    waitUntil: "domcontentloaded",
    timeout: 15000
  });
  await page.waitForTimeout(260);

  const result = await page.evaluate(() => {
    const parseColor = value => {
      const numbers = (value.match(/[\d.]+/g) || []).map(Number);
      return { r: numbers[0] || 0, g: numbers[1] || 0, b: numbers[2] || 0, a: numbers.length > 3 ? numbers[3] : 1 };
    };
    const luminance = color => {
      const channels = [color.r, color.g, color.b].map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const contrastRatio = (foreground, background) => {
      const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };
    const effectiveBackground = element => {
      let current = element;
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor);
        if (color.a >= 0.96) return color;
        current = current.parentElement;
      }
      return parseColor(getComputedStyle(document.body).backgroundColor);
    };
    const visible = element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const intruders = Array.from(document.querySelectorAll("body *"))
      .filter(element => !element.closest(".katex-mathml") && visible(element))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right)
        };
      })
      .filter(item => item.left < -2 || item.right > innerWidth + 2)
      .slice(0, 5);
    const textTargets = Array.from(document.querySelectorAll("h1, h2, .question-title, .question-extra, .question-main, .option, .feedback, .solution-box, .stat, .progress-item-title"))
      .filter(visible)
      .slice(0, 30)
      .map(element => {
        const style = getComputedStyle(element);
        const color = parseColor(style.color);
        const background = effectiveBackground(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = Number(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
        const minimum = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
        return {
          tag: element.tagName.toLowerCase(),
          color: style.color,
          ratio: contrastRatio(color, background),
          minimum,
          text: (element.textContent || "").trim().slice(0, 60)
        };
      });
    return {
      documentOverflow: document.documentElement.scrollWidth - innerWidth,
      bodyOverflow: document.body.scrollWidth - innerWidth,
      intruders,
      textTargets,
      hasMain: Boolean(document.querySelector("main")),
      hasHeader: Boolean(document.querySelector(".mcl-app-header")),
      theme: document.documentElement.dataset.theme,
      bodyColor: getComputedStyle(document.body).color,
      bodyBackground: getComputedStyle(document.body).backgroundColor
    };
  });

  page.off("pageerror", onPageError);
  assert.ok(response && response.ok(), `${relativePath}: HTTP ${response && response.status()}`);
  assert.ok(result.documentOverflow <= 1, `${relativePath}: document overflow ${result.documentOverflow}px; ${JSON.stringify(result.intruders)}`);
  assert.ok(result.bodyOverflow <= 1, `${relativePath}: body overflow ${result.bodyOverflow}px; ${JSON.stringify(result.intruders)}`);
  assert.equal(result.hasHeader, true, `${relativePath}: shared header missing`);
  assert.equal(result.theme, theme, `${relativePath}: expected ${theme} theme, got ${result.theme}`);
  assert.ok(!/rgba\([^)]*,\s*0\)/.test(result.bodyColor), `${relativePath}: transparent body text`);
  assert.ok(result.textTargets.every(item => !/rgba\([^)]*,\s*0\)/.test(item.color)), `${relativePath}: transparent visible text`);
  const contrastFailures = result.textTargets.filter(item => item.ratio + 0.01 < item.minimum);
  assert.deepEqual(contrastFailures, [], `${relativePath}: low text contrast ${JSON.stringify(contrastFailures)}`);
  assert.deepEqual(errors, [], `${relativePath}: page errors ${errors.join(" | ")}`);

  return { relativePath, viewport, theme };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MCL_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });

  const modes = [
    { width: 1440, height: 900, theme: "light" },
    { width: 390, height: 844, theme: "dark" }
  ];

  let total = 0;
  try {
    for (const mode of modes) {
      const context = await browser.newContext({ viewport: { width: mode.width, height: mode.height } });
      await context.addInitScript(theme => localStorage.setItem("mcl_theme", theme), mode.theme);
      const page = await context.newPage();
      await installRoutes(page);

      for (const relativePath of pages) {
        await auditPage(page, relativePath, `${mode.width}x${mode.height}`, mode.theme);
        total += 1;
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Visual shell smoke passed: ${total} page/viewport combinations across ${pages.length} pages.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
