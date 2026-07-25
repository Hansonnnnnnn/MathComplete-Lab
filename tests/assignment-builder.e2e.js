const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.MCL_TEST_URL || "http://127.0.0.1:8765/assignment-builder.html";
const outputPath = path.join(os.tmpdir(), "mcl-assignment-builder-e2e.pdf");
const maxOutputPath = path.join(os.tmpdir(), "mcl-assignment-builder-20-tasks-e2e.pdf");
const chineseOutputPath = path.join(os.tmpdir(), "mcl-assignment-builder-zh-e2e.pdf");
const desktopPreviewPath = path.join(os.tmpdir(), "mcl-assignment-builder-desktop.png");
const mobilePreviewPath = path.join(os.tmpdir(), "mcl-assignment-builder-mobile.png");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MCL_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: `window.MCLAuth={
      initialize:async()=>({status:"authenticated",user:{email:"teacher@example.com",user_metadata:{display_name:"Ms. Rivera"}},profile:{display_name:"Ms. Rivera"}}),
      getState:()=>({status:"authenticated",user:{email:"teacher@example.com"},profile:{display_name:"Ms. Rivera"}}),
      subscribe:(callback)=>{callback(window.MCLAuth.getState());return()=>{};},
      pageUrl:(value)=>value,
      signOut:async()=>{}
    };`
  }));
  await page.route(/cdn\.jsdelivr\.net/, route => route.fulfill({ contentType: "application/javascript", body: "" }));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator("#assignmentForm").waitFor({ state: "visible" });
  assert.equal(await page.locator("#assignmentTitle").inputValue(), "Math Practice Assignment");
  await page.fill("#studentName", "Jordan Lee");
  await page.fill("#assignmentTitle", "Algebra review");
  await page.fill("#dueDate", "2026-07-30");
  await page.click("#addTaskButton");

  assert.equal(await page.locator(".mcl-task-card").count(), 1);
  assert.equal(await page.locator('[data-task-field="mode"]').inputValue(), "practice");
  assert.equal(await page.locator("#teacherName").inputValue(), "Ms. Rivera");
  await page.fill("#teacherName", "");
  await page.check("#dueNextClass");
  assert.equal(await page.locator("#dueDate").isDisabled(), true);
  assert.equal(await page.locator("#dueDate").inputValue(), "");
  assert.equal((await page.evaluate(() => window.MCLAssignmentBuilder.getDraft())).dueNextClass, true);

  const countInput = page.locator('[data-task-field="questionCount"]');
  await countInput.fill("250");
  await countInput.dispatchEvent("change");
  assert.equal(await countInput.inputValue(), "100");
  await page.screenshot({ path: desktopPreviewPath, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true);
  await page.screenshot({ path: mobilePreviewPath, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });

  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.click("#downloadAssignmentButton");
  const download = await downloadPromise;
  await download.saveAs(outputPath);
  const pdf = fs.readFileSync(outputPath);
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.ok(pdf.length > 10000, "PDF should contain rendered assignment pages");

  for (let index = 1; index < 20; index += 1) {
    await page.locator('[data-task-action="duplicate"]').last().click();
  }
  assert.equal(await page.locator(".mcl-task-card").count(), 20);
  assert.equal(await page.locator("#addTaskButton").isDisabled(), true);

  const maxDownloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.click("#downloadAssignmentButton");
  const maxDownload = await maxDownloadPromise;
  await maxDownload.saveAs(maxOutputPath);
  assert.equal(fs.readFileSync(maxOutputPath).subarray(0, 4).toString(), "%PDF");

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator("body").evaluate(node => node.scrollWidth <= node.clientWidth), true);
  assert.equal((await page.evaluate(() => window.MCLAssignmentBuilder.validate())).valid, true);

  await page.evaluate(() => localStorage.setItem("mathcomplete_lang", "zh"));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#assignmentForm").waitFor({ state: "visible" });
  assert.equal(await page.locator("h1").textContent(), "\u4f5c\u4e1a\u7f16\u6392\u5668");
  await page.fill("#studentName", "\u674e\u5b66\u751f");
  await page.fill("#assignmentTitle", "\u4ee3\u6570\u590d\u4e60");
  await page.click("#addTaskButton");
  const chineseDownloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.click("#downloadAssignmentButton");
  const chineseDownload = await chineseDownloadPromise;
  await chineseDownload.saveAs(chineseOutputPath);
  assert.equal(fs.readFileSync(chineseOutputPath).subarray(0, 4).toString(), "%PDF");

  const anonymousPage = await context.newPage();
  await anonymousPage.route(/\/assets\/js\/auth\.js(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: `window.MCLAuth={initialize:async()=>({status:"anonymous",user:null}),getState:()=>({status:"anonymous",user:null}),subscribe:()=>()=>{},pageUrl:value=>value};`
  }));
  await anonymousPage.route(/cdn\.jsdelivr\.net/, route => route.fulfill({ contentType: "application/javascript", body: "" }));
  await anonymousPage.goto(baseUrl, { waitUntil: "networkidle" });
  await anonymousPage.locator("#assignmentForm").waitFor({ state: "visible" });
  assert.match(anonymousPage.url(), /assignment-builder\.html/);
  assert.equal(await anonymousPage.locator("#teacherName").inputValue(), "");
  assert.equal(await anonymousPage.locator("#assignmentTitle").inputValue(), "\u6570\u5b66\u7ec3\u4e60\u4f5c\u4e1a");

  console.log(`Assignment builder e2e passed. PDFs: ${outputPath}, ${maxOutputPath}, ${chineseOutputPath}. Screenshots: ${desktopPreviewPath}, ${mobilePreviewPath}`);
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
