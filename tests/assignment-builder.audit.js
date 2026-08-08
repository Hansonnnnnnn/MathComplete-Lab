const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const catalogSource = fs.readFileSync(path.join(root, "assets", "js", "tool-catalog.js"), "utf8");
const builderSource = fs.readFileSync(path.join(root, "assets", "js", "assignment-builder.js"), "utf8");
const builderHtml = fs.readFileSync(path.join(root, "assignment-builder.html"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const context = { window: {}, localStorage: { getItem() { return "en"; } } };
vm.createContext(context);
vm.runInContext(catalogSource, context);
const catalog = context.window.MCLToolCatalog;

assert(catalog.tools.length === 40, `Expected the current 40-tool catalog, found ${catalog.tools.length}.`);
const enabled = catalog.tools.filter(tool => tool.assignment?.enabled);
assert(enabled.length === 40, `Expected all 40 tools to be assignment compatible, found ${enabled.length}.`);

for (const tool of catalog.tools) {
  assert(tool.assignment && typeof tool.assignment.enabled === "boolean", `${tool.id} is missing assignment capability metadata.`);
  const pagePath = path.join(root, tool.href.split("?")[0].split("#")[0]);
  assert(fs.existsSync(pagePath), `${tool.id} points to a missing page.`);
  if (!tool.assignment.enabled) continue;

  const html = fs.readFileSync(pagePath, "utf8");
  for (const id of ["difficulty", "questionCount", "timedMode", "timerLevel"]) {
    assert(new RegExp(`id=["']${id}["']`).test(html), `${tool.id} is enabled for assignments but lacks #${id}.`);
  }
  assert(new RegExp('id=["\']toolMode["\']').test(html) || html.includes("tool-modes.js"), `${tool.id} lacks assignment practice modes.`);
  assert(html.includes("report-export.js"), `${tool.id} cannot produce the required score PDF.`);
  assert(JSON.stringify(tool.assignment.modes) === JSON.stringify(["practice", "learn", "exam"]), `${tool.id} has an unexpected mode list.`);
  assert(JSON.stringify(tool.assignment.difficulties) === JSON.stringify(["easy", "medium", "hard", "expert", "mixed"]), `${tool.id} has an unexpected difficulty list.`);
  const expectedMax = tool.id === "function-graph-matching" ? 30 : 100;
  assert(tool.assignment.questionCount.min === 1 && tool.assignment.questionCount.max === expectedMax, `${tool.id} has an unexpected question range.`);
  assert(JSON.stringify(tool.assignment.timerLevels.map(level => level.seconds)) === JSON.stringify([120, 60, 30, 15]), `${tool.id} has an unexpected timer list.`);
}

const graphTool = catalog.byId("function-graph-matching");
assert(graphTool?.assignment.enabled, "Function Graph Matching must be available in the assignment builder.");
assert(graphTool.assignment.questionCount.default === 5 && graphTool.assignment.questionCount.max === 30, "Function Graph Matching must keep its native 1-30 set range.");
const graphHtml = fs.readFileSync(path.join(root, graphTool.href), "utf8");
assert(graphHtml.includes("tool-modes.js"), "Function Graph Matching must load the shared Learn/Practice/Exam controller.");

const parallelTool = catalog.byId("parallel-lines-angle-relationships");
assert(parallelTool?.assignment.enabled, "Parallel Lines must be available in the assignment builder.");
assert(parallelTool.primaryCourse === "geometry-1" && parallelTool.courses.includes("algebra-1"), "Parallel Lines has incorrect course placement.");
assert(parallelTool.topics["geometry-1"] === "segments-angles" && parallelTool.topics["algebra-1"] === "equations", "Parallel Lines has incorrect topic placement.");

const numberSystemsTool = catalog.byId("number-systems-classification");
assert(numberSystemsTool?.assignment.enabled, "Number Systems Classification must be available in the assignment builder.");
assert(numberSystemsTool.primaryCourse === "algebra-2" && numberSystemsTool.courses.includes("precalculus"), "Number Systems Classification has incorrect course placement.");
assert(numberSystemsTool.topics["algebra-2"] === "number-systems" && numberSystemsTool.topics.precalculus === "number-systems", "Number Systems Classification has incorrect topic placement.");

for (const api of ["getDraft", "addTask", "updateTask", "removeTask", "moveTask", "validate", "downloadPdf"]) {
  assert(new RegExp(`\\b${api}\\b`).test(builderSource), `Missing assignment builder API: ${api}`);
}
assert(builderSource.includes("const MAX_TASKS = 20"), "The 20-task limit is missing.");
assert(!builderSource.includes("localStorage.setItem"), "Assignment drafts must not be saved in localStorage.");
assert(builderSource.includes("pdf.link("), "PDF URI link annotations are missing.");
assert(builderSource.includes("productionBaseUrl"), "Tool links must use the production site base URL.");
assert(builderSource.includes('signature !== "%PDF"'), "PDF signature validation is missing.");
assert(builderHtml.includes("assignment-builder.js") && builderHtml.includes("tool-catalog.js"), "Assignment builder dependencies are missing.");

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert(indexHtml.includes('class="assignment-builder-entry"'), "The subtle home-page assignment entry is missing.");
assert(!indexHtml.match(/class="assignment-builder-entry"[^>]*data-auth-show/), "The assignment entry must be visible to visitors.");

console.log(`Assignment builder audit passed: ${enabled.length}/${catalog.tools.length} tools are assignment compatible.`);
