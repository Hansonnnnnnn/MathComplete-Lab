const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "assets", "js", "report-export.js");
const source = fs.readFileSync(sourcePath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const vendors = [
  {
    script: path.join(root, "assets", "vendor", "html2canvas", "1.4.1", "html2canvas.min.js"),
    license: path.join(root, "assets", "vendor", "html2canvas", "1.4.1", "LICENSE"),
    marker: "html2canvas/1.4.1/html2canvas.min.js"
  },
  {
    script: path.join(root, "assets", "vendor", "jspdf", "4.2.1", "jspdf.umd.min.js"),
    license: path.join(root, "assets", "vendor", "jspdf", "4.2.1", "LICENSE"),
    marker: "jspdf/4.2.1/jspdf.umd.min.js"
  }
];

for (const vendor of vendors) {
  assert(fs.existsSync(vendor.script), `Missing vendored script: ${vendor.script}`);
  assert(fs.statSync(vendor.script).size > 100000, `Vendored script looks incomplete: ${vendor.script}`);
  assert(fs.existsSync(vendor.license), `Missing vendor license: ${vendor.license}`);
  assert(fs.readFileSync(vendor.license, "utf8").includes("Permission is hereby granted"), `License is not MIT-style: ${vendor.license}`);
  assert(source.includes(vendor.marker), `Exporter does not reference ${vendor.marker}`);
}

for (const api of [
  "buildReportModel",
  "buildPdfPages",
  "renderPdfPages",
  "downloadPdfReport",
  "downloadHtmlReport",
  "downloadReport",
  "getAttempts",
  "resetRound",
  "addButton"
]) {
  assert(new RegExp(`\\b${api}\\b`).test(source), `Missing report API: ${api}`);
}

assert(source.includes('blob.type !== "application/pdf"'), "PDF MIME validation is missing");
assert(source.includes('signature !== "%PDF"'), "PDF signature validation is missing");
assert(source.includes('canvas.toDataURL("image/jpeg", 0.94)'), "High-quality JPEG rendering is missing");
assert(source.includes("scale: 2"), "Two-times canvas rendering is missing");
assert(source.includes("mcl-pdf-page"), "Fixed A4 page DOM is missing");
assert(source.includes("annotation[encoding='application/x-tex']"), "KaTeX source extraction is missing");
assert(source.includes("mcl-report-info-table") && source.includes("mcl-report-performance"), "Formal report summary is missing");
assert(source.includes("mcl-report-review-list"), "Review priorities are missing");
assert(source.includes("reviewRecommendationsFor(items, t)"), "Review priorities must reference question numbers.");
assert(source.includes("hasExplicitOptions ? [] : domOptions"), "Explicitly empty options must not fall back to DOM buttons.");
assert(source.includes("booleanFlag(option.isCorrect)") && source.includes("booleanFlag(option.isSelected)"), "Serialized boolean option flags are not normalized safely.");
assert(source.includes("learnerDisplayName") && source.includes("reportIdentifier"), "Learner or report identity is missing");
assert(source.includes("pdf.setProperties"), "PDF document metadata is missing");
for (const forbidden of ['class="stat"', 'class="item"', 'class="choice"', 'class="summary"']) {
  assert(!source.includes(forbidden), `Unscoped report class remains: ${forbidden}`);
}
assert(source.includes("PDF_PAGE_WIDTH = 794") && source.includes("PDF_PAGE_HEIGHT = 1123"), "A4 CSS dimensions are not fixed");
assert(source.includes("pdfTask"), "Concurrent PDF generation guard is missing");
assert(source.includes("mcl-report-error"), "Visible PDF failure fallback is missing");
assert(!source.includes("html2pdf"), "html2pdf.js must not be used");

const gamesDir = path.join(root, "games");
const gamePages = fs.readdirSync(gamesDir).filter(file => file.endsWith(".html"));
const reportPages = gamePages.filter(file => fs.readFileSync(path.join(gamesDir, file), "utf8").includes("report-export.js"));
assert(reportPages.length >= 30, `Expected shared exporter on at least 30 tools, found ${reportPages.length}`);

const documentStub = {
  currentScript: { src: "http://localhost/assets/js/report-export.js" },
  baseURI: "http://localhost/",
  readyState: "loading",
  documentElement: { lang: "en" },
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
const context = {
  console,
  URL,
  Date,
  Blob,
  document: documentStub,
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  location: { pathname: "/games/report-audit.html" },
  MutationObserver: function MutationObserver() { this.observe = () => {}; },
  setTimeout,
  clearTimeout
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const helpers = context.MCLReportExport.__test;
const numericAttempt = helpers.normalizeAttempt({
  questionText: "Enter the measure.",
  options: [],
  selectedAnswer: "39",
  correctAnswer: "39",
  isCorrect: true
});
assert(numericAttempt.options.length === 0, "A free-response attempt must not inherit button text as choices.");

const targetAttempt = helpers.normalizeAttempt({
  questionText: "Select the first trisection point from A.",
  options: [
    { label: "A", latex: "P", key: "P", isCorrect: "true", isSelected: "true" },
    { label: "B", latex: "Q", key: "Q", isCorrect: "false", isSelected: "false" }
  ],
  selectedAnswer: "P",
  correctAnswer: "P",
  selectedOptionLabel: "B",
  correctOptionLabel: "B",
  isCorrect: true
});
assert(targetAttempt.options.filter(option => option.isCorrect).length === 1, "Exactly one geometry target may be marked correct.");
assert(targetAttempt.options.filter(option => option.isSelected).length === 1, "Exactly one geometry target may be marked selected.");
assert(targetAttempt.options[0].isCorrect && targetAttempt.options[0].isSelected, "P must remain the sole correct and selected target.");
assert(!targetAttempt.options[1].isCorrect && !targetAttempt.options[1].isSelected, "Serialized false flags must not mark Q.");
assert(targetAttempt.correctOptionLabel === "A" && targetAttempt.selectedOptionLabel === "A", "Explicit option truth must repair stale stored labels.");

const priorities = helpers.reviewRecommendationsFor([
  { index: 1, isCorrect: true },
  { index: 3, isCorrect: false },
  { index: 7, isCorrect: false }
], { reviewQuestion: number => `Question ${number}` });
assert(JSON.stringify(priorities) === JSON.stringify(["Question 3", "Question 7"]), "Review priorities must list only wrong question numbers.");

console.log(`Report PDF audit passed: ${reportPages.length} tools share the exporter.`);
