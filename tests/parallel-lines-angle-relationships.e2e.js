const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.MCL_TEST_URL || "http://127.0.0.1:8765/games/parallel-lines-angle-relationships.html";
const desktopShot = path.join(os.tmpdir(), "mcl-parallel-lines-desktop.png");
const mobileShot = path.join(os.tmpdir(), "mcl-parallel-lines-mobile.png");
const reportPath = path.join(os.tmpdir(), "mcl-parallel-lines-report.pdf");

async function answerCurrent(page) {
  if (await page.locator(".mcl-line-angle-response").count()) {
    let kind = "target";
    if (await page.locator(".mcl-line-angle-input").count()) {
      kind = "numeric";
      await page.locator(".mcl-line-angle-input").fill("45");
    } else if (await page.locator(".mcl-line-angle-select").count()) {
      kind = "matching";
      const selects = page.locator(".mcl-line-angle-select");
      for (let index = 0; index < await selects.count(); index += 1) await selects.nth(index).selectOption({ index:1 });
    } else if (await page.locator(".mcl-line-angle-token").count()) {
      kind = "order";
      const tokens = page.locator(".mcl-line-angle-token");
      for (let index = 0; index < await tokens.count(); index += 1) await tokens.nth(index).click();
    } else {
      const targets = page.locator(".mcl-line-angle-target");
      await targets.first().click();
      kind = await targets.count() > 4 ? "target-set" : "target";
    }
    await page.locator(".mcl-line-angle-submit").click();
    return kind;
  }
  await page.locator(".option").first().click();
  return "choice";
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MCL_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const context = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType:"application/javascript",
    body:"window.MCLAuth={initialize:async()=>({status:'anonymous',user:null}),getState:()=>({status:'anonymous',user:null}),subscribe:()=>()=>{},pageUrl:value=>value};"
  }));
  await page.route(/cdn\.jsdelivr\.net/, route => route.fulfill({
    contentType:route.request().resourceType() === "stylesheet" ? "text/css" : "application/javascript",
    body:""
  }));

  await page.goto(baseUrl, { waitUntil:"networkidle" });
  await page.locator("#difficulty").waitFor();
  assert.deepEqual(await page.locator("#difficulty option").evaluateAll(options => options.map(option => option.value)), ["easy","medium","hard","expert","mixed"]);
  assert.deepEqual(await page.locator("#toolMode option").evaluateAll(options => options.map(option => option.value)), ["practice","learn","exam"]);
  assert.equal(await page.locator("#questionCount").getAttribute("max"), "100");

  await page.evaluate(() => window.MCLToolModes.setMode("practice"));
  await page.evaluate(() => { let state=246813579; Math.random=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296); });
  await page.selectOption("#difficulty", "mixed");
  await page.fill("#questionCount", "20");
  await page.click("#startBtn");
  await page.locator("#questionVisual .mcl-geometry-scene").waitFor();
  assert.ok((await page.locator("#questionTitle").textContent()).trim().length > 0, "question should expose formal geometry information");
  await page.screenshot({ path:desktopShot, fullPage:true });
  await page.setViewportSize({ width:1024, height:768 });
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true, "tablet viewport has horizontal overflow");
  await page.setViewportSize({ width:1440, height:900 });

  const kinds = new Set();
  let numericAttemptChecked = false;
  for (let index = 0; index < 20; index += 1) {
    const kind = await answerCurrent(page);
    kinds.add(kind);
    assert.equal(await page.locator("#nextBtn").isEnabled(), true, `question ${index + 1}: response did not unlock Next`);
    if (kind === "numeric") {
      const options = await page.evaluate(() => window.MCLReportExport.getAttempts().at(-1)?.options || []);
      assert.equal(options.length, 0, "numeric response generated fake report choices");
      numericAttemptChecked = true;
    }
    await page.locator("#nextBtn").evaluate(button => button.click());
  }
  await page.locator("#resultCard").waitFor({ state:"visible" });
  assert.match(await page.locator("#scoreNum").textContent(), /\/20$/);
  assert.ok(kinds.has("choice"), "mixed round did not include a standard choice question");
  assert.ok([...kinds].some(kind => kind !== "choice"), "mixed round did not include a custom interaction");
  assert.equal(numericAttemptChecked || kinds.has("matching") || kinds.has("order"), true, "mixed round did not exercise a structured response");
  await page.locator("[data-report-download]").waitFor();
  const downloadPromise = page.waitForEvent("download", { timeout:60000 });
  await page.locator("[data-report-download]").click();
  const download = await downloadPromise;
  await download.saveAs(reportPath);
  assert.equal(fs.readFileSync(reportPath).subarray(0,4).toString(), "%PDF");

  await page.click("#restartBtn");
  await page.evaluate(() => window.MCLToolModes.setMode("exam"));
  await page.selectOption("#difficulty", "expert");
  await page.fill("#questionCount", "1");
  await page.click("#startBtn");
  await answerCurrent(page);
  assert.equal(await page.locator("#feedback").isVisible(), false);
  assert.equal(await page.locator("#solutionBox").isVisible(), false);
  await page.locator("#nextBtn").evaluate(button => button.click());

  await page.evaluate(() => window.MCLTheme.set("dark"));
  await page.setViewportSize({ width:390, height:844 });
  await page.click("#restartBtn");
  await page.evaluate(() => window.MCLToolModes.setMode("learn"));
  await page.selectOption("#difficulty", "hard");
  await page.fill("#questionCount", "1");
  await page.click("#startBtn");
  await page.locator("#questionVisual .mcl-geometry-scene").waitFor();
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true, "mobile viewport has horizontal overflow");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path:mobileShot, fullPage:true });

  await page.evaluate(() => localStorage.setItem("mathcomplete_lang", "zh"));
  await page.reload({ waitUntil:"networkidle" });
  assert.match(await page.locator("#pageTitle").textContent(), /平行线/);
  assert.equal(errors.length, 0, `page errors: ${errors.join(" | ")}`);

  console.log(`Parallel-lines browser e2e passed. Report: ${reportPath}. Screenshots: ${desktopShot}, ${mobileShot}`);
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
