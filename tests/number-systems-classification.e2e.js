const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.MCL_TEST_URL || "http://127.0.0.1:8765/games/number-systems-classification.html";
const desktopShot = path.join(os.tmpdir(), "mcl-number-systems-desktop.png");
const mobileShot = path.join(os.tmpdir(), "mcl-number-systems-mobile.png");
const reportPath = path.join(os.tmpdir(), "mcl-number-systems-report.pdf");

async function startRound(page, { mode, difficulty, questions = 1, choices = 6 }) {
  await page.evaluate(value => window.MCLToolModes.setMode(value), mode);
  await page.locator("#difficulty").selectOption(difficulty, { force: true });
  await page.locator("#questionCount").evaluate((input, value) => { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); }, String(questions));
  await page.locator("#optionCount").selectOption(String(choices), { force: true });
  await page.click("#startBtn");
  await page.locator(".option").first().waitFor();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MCL_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: "window.MCLAuth={initialize:async()=>({status:'anonymous',user:null}),getState:()=>({status:'anonymous',user:null}),subscribe:()=>()=>{},pageUrl:value=>value};"
  }));
  await page.route(/cdn\.jsdelivr\.net/, route => {
    const isStyle = route.request().resourceType() === "stylesheet";
    const katexStub = `window.katex={
      render(value,target){
        target.replaceChildren();
        const root=document.createElement('span');
        root.className='katex';
        const visual=document.createElement('span');
        visual.className='katex-html';
        visual.textContent=String(value ?? '');
        root.append(visual);
        target.append(root);
      },
      renderToString(value){return '<span class="katex"><span class="katex-html">'+String(value ?? '')+'</span></span>';}
    };`;
    route.fulfill({
      contentType: isStyle ? "text/css" : "application/javascript",
      body: isStyle ? "" : (/katex/i.test(route.request().url()) ? katexStub : "")
    });
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.katex?.render === "function");
  await page.locator("#difficulty").waitFor();
  assert.deepEqual(await page.locator("#difficulty option").evaluateAll(options => options.map(option => option.value)), ["easy", "medium", "hard", "expert", "mixed"]);
  assert.deepEqual(await page.locator("#optionCount option").evaluateAll(options => options.map(option => option.value)), ["4", "5", "6"]);
  assert.equal(await page.locator("#questionCount").getAttribute("max"), "100");

  await startRound(page, { mode: "learn", difficulty: "expert", choices: 6 });
  assert.equal(await page.locator(".option").count(), 6, "Learn round did not render six choices");
  assert.ok(await page.locator("#questionMain .katex").count(), "The main expression was not rendered by KaTeX");
  assert.equal(await page.locator(".option .katex").count(), 6, "One or more choices were not rendered by KaTeX");
  await page.locator(".option").first().click();
  await page.locator("#solutionBox").waitFor({ state: "visible" });
  assert.equal(await page.locator("#solutionBox .chain-line").count(), 6, "Learn feedback must classify every displayed expression");
  const attempt = await page.evaluate(() => window.MCLReportExport.getAttempts()[0]);
  assert.equal(attempt.parameters.optionAnalysis.length, 6, "Report did not retain all six classifications");
  assert.equal(attempt.parameters.optionAnalysis.filter(row => row.isCorrect).length, 1, "Question does not have exactly one correct option");
  if (attempt.parameters.taskKind !== "most-specific") {
    assert.equal(new Set(attempt.parameters.optionAnalysis.map(row => row.simplifiedLatex)).size, 6, "Equivalent values appeared as duplicate choices");
  }
  assert.equal(attempt.parameters.optionAnalysis.some(row => /\\frac|\\sqrt|i\^/.test(row.explanation)), false, "Raw LaTeX leaked into prose feedback");
  await page.screenshot({ path: desktopShot, fullPage: true });
  await page.click("#nextBtn");
  await page.locator("#resultCard").waitFor({ state: "visible" });
  await page.locator("[data-report-download]").waitFor();
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.locator("[data-report-download]").click();
  const download = await downloadPromise;
  await download.saveAs(reportPath);
  assert.equal(fs.readFileSync(reportPath).subarray(0, 4).toString(), "%PDF");

  for (const choices of [4, 5]) {
    await page.click("#restartBtn");
    await startRound(page, { mode: "practice", difficulty: "medium", choices });
    assert.equal(await page.locator(".option").count(), choices, `${choices}-choice mode rendered the wrong number of options`);
    await page.locator(".option").first().click();
    await page.click("#nextBtn");
  }

  await page.click("#restartBtn");
  await startRound(page, { mode: "exam", difficulty: "hard", choices: 4 });
  await page.locator(".option").first().click();
  assert.equal(await page.locator("#feedback").isVisible(), false, "Exam mode revealed immediate feedback");
  assert.equal(await page.locator("#solutionBox").isVisible(), false, "Exam mode revealed the classification analysis");
  await page.click("#nextBtn");

  await page.evaluate(() => window.MCLTheme.set("dark"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click("#restartBtn");
  await startRound(page, { mode: "learn", difficulty: "mixed", choices: 6 });
  await page.waitForTimeout(400);
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true, "Mobile viewport has horizontal overflow");
  const contrast = await page.locator("#questionMain").evaluate(node => {
    const parse = value => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = value => {
      const channels = parse(value).map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const card = node.closest(".card");
    const color = getComputedStyle(node).color;
    const background = getComputedStyle(card).backgroundColor;
    const light = Math.max(luminance(color), luminance(background));
    const dark = Math.min(luminance(color), luminance(background));
    return { color, background, opacity: getComputedStyle(card).opacity, ratio: (light + 0.05) / (dark + 0.05) };
  });
  assert.equal(contrast.opacity, "1", "Dark-theme question surface is translucent");
  assert.ok(contrast.ratio >= 7, `Dark-theme question contrast is too low: ${contrast.ratio.toFixed(2)}:1`);
  await page.screenshot({ path: mobileShot, fullPage: true });

  await page.evaluate(() => localStorage.setItem("mathcomplete_lang", "zh"));
  await page.reload({ waitUntil: "networkidle" });
  assert.match(await page.locator("#pageTitle").textContent(), /数系分类/);
  assert.equal(errors.length, 0, `Page errors: ${errors.join(" | ")}`);

  console.log(`Number-systems browser e2e passed. Report: ${reportPath}. Screenshots: ${desktopShot}, ${mobileShot}`);
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
