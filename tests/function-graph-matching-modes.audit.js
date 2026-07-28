const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "games", "function-graph-matching.html"), "utf8");
const source = fs.readFileSync(path.join(root, "assets", "js", "function-graph-matching.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const id of ["difficulty", "questionCount", "timedMode", "timerLevel"]) {
  assert(new RegExp(`id=["']${id}["']`).test(html), `Missing assignment setting #${id}.`);
}
assert(html.includes("tool-modes.js"), "Shared Learn/Practice/Exam modes are not loaded.");
assert(html.includes("report-export.js"), "Score report export is not loaded.");
assert(source.includes("timer_easy: 120") && source.includes("timer_expert: 15"), "Assignment timer levels do not match the catalog.");
assert(source.includes('roundMode !== "exam"'), "Exam mode can reveal matching feedback before submission ends.");
assert(source.includes('roundMode === "practice" && isCorrect'), "Practice mode does not use the expected correct-answer flow.");
assert(source.includes("mode: roundMode"), "Attempt records do not retain the assigned mode.");
assert(source.includes("Math.min(30"), "Native 30-set limit is not enforced.");

console.log("Function Graph Matching assignment-mode audit passed.");
