const fs = require("fs");
const path = require("path");

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

console.log(`Report PDF audit passed: ${reportPages.length} tools share the exporter.`);
