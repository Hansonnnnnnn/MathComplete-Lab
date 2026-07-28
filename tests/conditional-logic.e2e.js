const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const baseUrl = process.env.MCL_TEST_URL || "http://127.0.0.1:8765/games/conditional-logic.html";

async function completeInteraction(page) {
  const kind = await page.locator(".mcl-logic-response").evaluate(node => {
    if (node.querySelector(".mcl-logic-sequence")) return "order";
    if (node.querySelector(".mcl-logic-truth-controls")) return "truth-table";
    return "fill";
  });
  if (kind === "order") {
    const tokens = page.locator(".mcl-logic-token");
    for (let index = 0; index < await tokens.count(); index += 1) await tokens.nth(index).click();
  } else if (kind === "truth-table") {
    const rows = page.locator(".mcl-logic-row");
    for (let index = 0; index < await rows.count(); index += 1) await rows.nth(index).locator(".mcl-logic-truth-button").first().click();
  } else {
    const selects = page.locator(".mcl-logic-select");
    for (let index = 0; index < await selects.count(); index += 1) await selects.nth(index).selectOption({ index: 1 });
  }
  await page.click(".mcl-logic-submit");
  return kind;
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
  await page.route(/cdn\.jsdelivr\.net/, route => route.fulfill({
    contentType: route.request().resourceType() === "stylesheet" ? "text/css" : "application/javascript",
    body: ""
  }));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator("#difficulty").waitFor();
  assert.deepEqual(await page.locator("#difficulty option").evaluateAll(options => options.map(option => option.value)), ["easy", "medium", "hard", "expert", "mixed"]);
  assert.deepEqual(await page.locator("#toolMode option").evaluateAll(options => options.map(option => option.value)), ["practice", "learn", "exam"]);
  assert.equal(await page.locator("#questionCount").getAttribute("max"), "100");

  await page.evaluate(() => window.MCLToolModes.setMode("practice"));
  await page.selectOption("#difficulty", "easy");
  await page.fill("#questionCount", "1");
  await page.click("#startBtn");
  await page.locator(".option").first().click();
  assert.equal(await page.locator("#nextBtn").isEnabled(), true);
  await page.click("#nextBtn");
  await page.locator("#resultCard").waitFor({ state: "visible" });
  assert.equal((await page.locator("#scoreNum").textContent()).endsWith("/1"), true);

  await page.click("#restartBtn");
  await page.evaluate(() => window.MCLToolModes.setMode("learn"));
  await page.selectOption("#difficulty", "expert");
  await page.fill("#questionCount", "1");
  await page.click("#startBtn");
  await page.locator(".mcl-logic-response").waitFor();
  const interactionKind = await completeInteraction(page);
  assert.ok(["order", "truth-table", "fill"].includes(interactionKind));
  assert.equal(await page.locator("#feedback").isVisible(), true);
  assert.equal(await page.locator("#solutionBox").isVisible(), true);
  const reportOptions = await page.evaluate(() => window.MCLReportExport.getAttempts()[0].options);
  assert.ok(reportOptions.length > 0, "interactive response was not recorded for the report");
  assert.equal(reportOptions.some(item => /Alternative structured response|其他结构化回答/.test(item.latex || "")), false, "report contains generator-only fake options");
  await page.click("#nextBtn");

  await page.click("#restartBtn");
  await page.evaluate(() => window.MCLToolModes.setMode("exam"));
  await page.selectOption("#difficulty", "expert");
  await page.fill("#questionCount", "1");
  await page.click("#startBtn");
  await completeInteraction(page);
  assert.equal(await page.locator("#feedback").isVisible(), false);
  assert.equal(await page.locator("#solutionBox").isVisible(), false);
  assert.equal(await page.locator(".mcl-logic-row.is-correct, .mcl-logic-row.is-wrong").count(), 0);
  await page.click("#nextBtn");
  await page.locator("#resultCard").waitFor({ state: "visible" });

  await page.evaluate(() => {
    localStorage.setItem("mcl_theme", "dark");
    document.documentElement.dataset.theme = "dark";
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true);

  await page.evaluate(() => localStorage.setItem("mathcomplete_lang", "zh"));
  await page.reload({ waitUntil: "networkidle" });
  assert.match(await page.locator("#pageTitle").textContent(), /逆命题/);
  assert.equal(errors.length, 0, `page errors: ${errors.join(" | ")}`);

  console.log("Conditional-logic browser e2e passed.");
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
