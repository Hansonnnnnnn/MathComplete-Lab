const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const baseUrl = process.env.MCL_TEST_BASE || "http://127.0.0.1:8765";
const tools = fs.readdirSync(path.join(root, "games"), { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => entry.name)
  .sort();

const authStub = `
  (() => {
    const state={status:'anonymous',user:null,session:null};
    window.MCLAuth={
      initialize:async()=>state,
      getState:()=>state,
      isConfigured:()=>false,
      subscribe:callback=>{callback(state);return()=>{};},
      onAuthStateChange:callback=>{callback('INITIAL_SESSION',null);return()=>{};},
      pageUrl:value=>value,
      getSession:async()=>null,
      getCachedSession:()=>null,
      signOut:async()=>state
    };
  })();
`;

const katexStub = `
  window.katex={
    render(value,target,options={}){
      target.replaceChildren();
      const root=document.createElement('span');root.className='katex';
      const visual=document.createElement('span');visual.className='katex-html';visual.textContent=String(value??'');
      root.append(visual);
      if(options.displayMode){
        const display=document.createElement('span');display.className='katex-display';display.append(root);target.append(display);
      }else target.append(root);
    },
    renderToString(value){return '<span class="katex"><span class="katex-html">'+String(value??'')+'</span></span>';}
  };
`;

async function installRoutes(page) {
  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({ contentType: "application/javascript", body: authStub }));
  await page.route(/cdn\.jsdelivr\.net/, route => {
    const isStyle = route.request().resourceType() === "stylesheet";
    const url = route.request().url();
    let body = "";
    if (!isStyle && /katex/i.test(url)) body = katexStub;
    if (!isStyle && /lucide/i.test(url)) body = "window.lucide={createIcons(){}};";
    if (!isStyle && /supabase/i.test(url)) body = "window.supabase={createClient(){return null;}};";
    route.fulfill({ contentType: isStyle ? "text/css" : "application/javascript", body });
  });
}

async function startAndAudit(page, file, mode) {
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on("pageerror", onError);
  const response = await page.goto(`${baseUrl}/games/${file}?active-visual-audit=${mode.theme}`, {
    waitUntil: "domcontentloaded",
    timeout: 15000
  });
  await page.waitForTimeout(230);

  const count = page.locator("#questionCount");
  if (await count.count()) {
    await count.evaluate(input => {
      input.value = "1";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  const start = page.locator("#startBtn");
  assert.equal(await start.count(), 1, `${file}: start button missing`);
  await start.click({ timeout: 5000 });
  await page.waitForTimeout(260);

  const state = await page.evaluate(() => {
    const visible = element => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const intruders = Array.from(document.querySelectorAll("body *"))
      .filter(element => !element.closest(".katex-mathml") && visible(element))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName.toLowerCase(), id: element.id, className: typeof element.className === "string" ? element.className : "", left: Math.round(rect.left), right: Math.round(rect.right) };
      })
      .filter(item => item.left < -2 || item.right > innerWidth + 2)
      .slice(0, 5);
    const activeSurface = document.querySelector("#quizCard, #gameCard, .proof-workspace, .matching-workspace");
    const activeContent = document.querySelector(".question-main, .expression, .equation, .expression-card, .question-visual, .mcl-geometry-scene, svg, canvas");
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      bodyOverflow: document.body.scrollWidth - innerWidth,
      intruders,
      activeSurface: visible(activeSurface),
      activeContent: visible(activeContent),
      theme: document.documentElement.dataset.theme
    };
  });

  page.off("pageerror", onError);
  assert.ok(response && response.ok(), `${file}: HTTP ${response && response.status()}`);
  assert.equal(state.theme, mode.theme, `${file}: incorrect theme`);
  assert.equal(state.activeSurface, true, `${file}: active practice surface is not visible`);
  assert.equal(state.activeContent, true, `${file}: generated question content is not visible`);
  assert.ok(state.overflow <= 1 && state.bodyOverflow <= 1, `${file}: active layout overflow; ${JSON.stringify(state.intruders)}`);
  assert.deepEqual(errors, [], `${file}: page errors ${errors.join(" | ")}`);
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
      for (const file of tools) {
        await startAndAudit(page, file, mode);
        total += 1;
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Active tool smoke passed: ${total} tool/viewport combinations across ${tools.length} tools.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
