const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const baseUrl = process.env.MCL_TEST_URL || "http://127.0.0.1:8765/games/function-graph-matching.html";

async function matchEveryExpression(page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-expr-id]").forEach(expression => {
      expression.click();
      document.querySelector(`[data-graph-id="${expression.dataset.exprId}"]`)?.click();
    });
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MCL_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: "window.MCLAuth={initialize:async()=>({status:'anonymous',user:null}),getState:()=>({status:'anonymous',user:null}),subscribe:()=>()=>{},pageUrl:value=>value};"
  }));
  await page.route(/cdn\.jsdelivr\.net/, route => route.fulfill({
    contentType: route.request().resourceType() === "stylesheet" ? "text/css" : "application/javascript",
    body: ""
  }));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator("#toolMode").waitFor();
  assert.deepEqual(await page.locator("#toolMode option").evaluateAll(options => options.map(option => option.value)), ["practice", "learn", "exam"]);
  assert.deepEqual(await page.locator("#timerLevel option").evaluateAll(options => options.map(option => option.value)), ["timer_easy", "timer_medium", "timer_hard", "timer_expert"]);

  await page.evaluate(() => window.MCLToolModes.setMode("practice"));
  await page.fill("#questionCount", "1");
  await page.selectOption("#difficulty", "easy");
  await page.click("#startBtn");
  await matchEveryExpression(page);
  await page.click("#submitBtn");
  await page.locator("#resultCard").waitFor({ state: "visible", timeout: 4000 });
  assert.equal((await page.locator("#resultTitle").textContent()).trim(), "Practice Results");
  assert.equal((await page.locator("#scoreNum").textContent()).trim(), "1/1");

  await page.click("#restartBtn");
  await page.evaluate(() => window.MCLToolModes.setMode("learn"));
  await page.fill("#questionCount", "1");
  await page.click("#startBtn");
  await matchEveryExpression(page);
  await page.click("#submitBtn");
  assert.equal(await page.locator("#feedback").isVisible(), true);
  assert.equal(await page.locator("#solutionBox").isVisible(), true);
  assert.equal(await page.locator("#resultCard").isVisible(), false);
  await page.click("#nextBtn");
  assert.equal((await page.locator("#resultTitle").textContent()).trim(), "Learning Results");

  await page.click("#restartBtn");
  await page.evaluate(() => window.MCLToolModes.setMode("exam"));
  await page.fill("#questionCount", "2");
  await page.click("#startBtn");
  await matchEveryExpression(page);
  await page.click("#submitBtn");
  assert.equal(await page.locator("#feedback").isVisible(), false);
  assert.equal(await page.locator("#solutionBox").isVisible(), false);
  assert.equal(await page.locator(".expression-card.correct, .expression-card.wrong, .graph-card.correct, .graph-card.wrong").count(), 0);
  await page.click("#nextBtn");
  await matchEveryExpression(page);
  await page.click("#submitBtn");
  await page.click("#nextBtn");
  await page.locator("#resultCard").waitFor({ state: "visible" });
  assert.equal((await page.locator("#resultTitle").textContent()).trim(), "Exam Results");

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true);

  console.log("Function Graph Matching mode e2e passed.");
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
