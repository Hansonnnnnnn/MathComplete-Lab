const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.MCL_TEST_URL || "http://127.0.0.1:8765/games/factoring-practice.html";
let browser;

(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MCL_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: "window.MCLAuth={initialize:async()=>({status:'anonymous',user:null}),getState:()=>({status:'anonymous',user:null}),subscribe:()=>()=>{},pageUrl:value=>value};"
  }));
  await page.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/katex\.min\.css/, route => route.fulfill({
    contentType: "text/css",
    body: ".katex{font-family:serif;color:inherit}.katex-display{display:block}"
  }));
  await page.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/katex\.min\.js/, route => route.fulfill({
    contentType: "application/javascript",
    body: "window.katex={render:(value,node)=>{node.innerHTML='<span class=\\\"katex\\\"></span>';node.firstChild.textContent=String(value);}};"
  }));
  await page.route(/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@/, route => route.fulfill({
    contentType: "application/javascript",
    body: "window.supabase={createClient:()=>({auth:{},from:()=>({})})};"
  }));
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.locator("#difficulty").waitFor();

  const counts = await page.evaluate(() => window.MCLFactoringBank.counts());
  assert.deepEqual(counts.difficulty, { easy:25, medium:30, hard:25, expert:25 });
  assert.deepEqual(counts.interaction, { diagnosis:15, fill:32, choice:58 });
  assert.equal(await page.locator("#legacy-factoring-practice-script").count(), 0);

  for (const count of [4, 5, 6]) {
    await page.selectOption("#difficulty", "medium");
    await page.locator("#optionCount").evaluate((element, value) => {
      element.value = value;
      element.dispatchEvent(new Event("change", { bubbles:true }));
    }, String(count));
    await page.fill("#questionCount", "1");
    await page.click("#startBtn");
    if (await page.locator(".option").count()) assert.equal(await page.locator(".option").count(), count);
    if (await page.locator(".mcl-factor-fill").count()) {
      const inputs = page.locator(".mcl-factor-slot");
      for (let index = 0; index < await inputs.count(); index += 1) await inputs.nth(index).fill("1");
      await page.click(".mcl-factor-submit");
    } else await page.locator(".option").first().click();
    await page.click("#nextBtn");
    await page.locator("#resultCard").waitFor({ state:"visible" });
    await page.click("#restartBtn");
  }

  let foundFill = false;
  for (let round = 0; round < 35 && !foundFill; round += 1) {
    await page.selectOption("#difficulty", round % 2 ? "easy" : "expert");
    await page.fill("#questionCount", "1");
    await page.click("#startBtn");
    foundFill = Boolean(await page.locator(".mcl-factor-fill").count());
    if (!foundFill) {
      await page.locator(".option").first().click();
      await page.click("#nextBtn");
      await page.click("#restartBtn");
    }
  }
  assert.equal(foundFill, true, "could not exercise a coefficient-fill question");

  const slots = page.locator(".mcl-factor-slot");
  assert.ok(await slots.count() >= 3, "coefficient fill did not expose all factor coefficients");
  assert.equal(await page.locator(".mcl-factor-source, .mcl-factor-equals").count(), 0, "coefficient fill repeated the source polynomial");
  assert.equal(await page.locator("#questionMain .katex").count(), 1, "the source polynomial was rendered more than once");
  assert.equal(await page.locator(".mcl-factor-submit").isDisabled(), true);
  await slots.first().fill("1.5");
  assert.equal(await slots.first().getAttribute("class").then(value => value.includes("is-invalid")), true);
  const signedOperator = page.locator("[data-operator-for]").first();
  const signedSlotId = await signedOperator.getAttribute("data-operator-for");
  await page.locator(`[data-factor-slot="${signedSlotId}"]`).fill("-2");
  assert.equal(await signedOperator.textContent(), "", "a negative coefficient was displayed with a duplicate external minus sign");
  for (let index = 0; index < await slots.count(); index += 1) await slots.nth(index).fill(index % 2 ? "-1" : "1");
  assert.equal(await page.locator(".mcl-factor-submit").isEnabled(), true);
  assert.equal(await page.locator(".mcl-factor-preview-math .katex").count() > 0, true);
  await page.click(".mcl-factor-submit");
  assert.equal(await page.locator("#nextBtn").isEnabled(), true);
  const attempt = await page.evaluate(() => window.MCLReportExport.getAttempts().at(-1));
  assert.equal(attempt.options.length, 0, "coefficient fill leaked fake report choices");
  assert.equal(attempt.parameters.interactionKind, "coefficient-fill");
  assert.ok(attempt.parameters.studentFactorLatex);
  assert.ok(attempt.parameters.slotDefinitions.length >= 3);

  const cube = await page.evaluate(() => {
    for (const template of window.MCLQuestionTemplates.getTool("factoring-practice").templates) {
      const question = window.MCLQuestionTemplates.build("factoring-practice", template.id, { seed:`cube:${template.id}`, lang:"en" });
      if (question.parameters?.formulaReference) return question;
    }
    return null;
  });
  assert.ok(cube && /a\^3\+b\^3/.test(cube.parameters.formulaReference) && /a\^3-b\^3/.test(cube.parameters.formulaReference), "cube questions do not carry both identities");

  await page.evaluate(() => {
    localStorage.setItem("mcl_theme", "dark");
    document.documentElement.dataset.theme = "dark";
  });
  await page.setViewportSize({ width:390, height:844 });
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true, "mobile page overflows horizontally");
  const contrast = await page.locator(".mcl-factor-preview-math").evaluate(node => getComputedStyle(node).color);
  assert.notEqual(contrast, "rgba(0, 0, 0, 0)");
  assert.equal(await page.locator(".mcl-factor-equation").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(23, 37, 58)", "dark-theme coefficient editor uses a light surface");
  assert.equal(await slots.evaluateAll(nodes => nodes.every(node => Math.min(node.getBoundingClientRect().width, node.getBoundingClientRect().height) >= 44)), true, "coefficient slots are too small for touch input");

  await page.click("#nextBtn");
  await page.locator("#resultCard").waitFor({ state:"visible" });
  const reportDownload = page.waitForEvent("download", { timeout:60000 });
  await page.locator("[data-report-download]").click();
  const downloadedReport = await reportDownload;
  const reportPath = path.join(os.tmpdir(), "mcl-factoring-coefficient-fill-report.pdf");
  await downloadedReport.saveAs(reportPath);
  assert.equal(fs.readFileSync(reportPath).subarray(0, 4).toString(), "%PDF", "coefficient-fill report is not a valid PDF");

  assert.equal(errors.length, 0, `page errors: ${errors.join(" | ")}`);
  console.log("Factoring browser e2e passed.");
  await browser.close();
})().catch(error => {
  console.error(error);
  void browser?.close().finally(() => process.exit(1));
});
