"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bankFiles = {
  "arithmetic-within-10": "assets/js/arithmetic-banks.js",
  "arithmetic-within-100": "assets/js/arithmetic-banks.js",
  "arithmetic-within-1000": "assets/js/arithmetic-banks.js",
  "powers-roots": "assets/js/powers-roots-bank.js",
  "gcd-lcm": "assets/js/gcd-lcm-bank.js",
  "set-theory-basics": "assets/js/set-theory-basics-bank.js",
  "fraction-percent": "assets/js/fraction-percent-bank.js",
  "exponent-laws": "assets/js/exponent-laws-bank.js",
  "algebra-expression": "assets/js/algebra-expression-bank.js",
  "algebra-simplification": "assets/js/algebra-simplification-bank.js",
  "linear-equation": "assets/js/linear-equation-bank.js",
  "linear-inequalities": "assets/js/linear-inequalities-bank.js",
  "systems-linear-equations": "assets/js/systems-linear-equations-bank.js",
  "slope-from-two-points": "assets/js/slope-from-two-points-bank.js",
  "function-evaluation": "assets/js/function-evaluation-bank.js",
  "factoring-practice": "assets/js/factoring-practice-bank.js",
  "polynomial-multiplication": "assets/js/polynomial-multiplication-bank.js",
  "completing-the-square": "assets/js/completing-the-square-bank.js",
  "quadratic-functions": "assets/js/quadratic-functions-bank.js",
  "special-products": "assets/js/special-products-bank.js",
  "exponential-functions": "assets/js/exponential-functions-bank.js",
  "logarithmic-functions": "assets/js/logarithmic-functions-bank.js",
  "radical-functions": "assets/js/radical-functions-bank.js",
  "advanced-equation-solving": "assets/js/advanced-equation-solving-bank.js",
  "quadratic-formula": "assets/js/quadratic-formula-bank.js",
  "complex-number-operations": "assets/js/complex-number-operations-bank.js",
  "function-graph-matching": "assets/js/function-graph-matching-bank.js",
  "unit-circle-trigonometry": "assets/js/unit-circle-trigonometry-bank.js",
  "geometry-formula": "assets/js/geometry-formula-bank.js",
  "midpoints-bisectors-trisectors": "assets/js/midpoints-bisectors-trisectors-bank.js",
  "triangle-congruence": "assets/js/triangle-congruence-bank.js",
  "limits-practice": "assets/js/limits-practice-bank.js",
  "derivative-practice": "assets/js/derivative-practice-bank.js",
  "integration-practice": "assets/js/integration-practice-bank.js",
  "vector-operations": "assets/js/linear-algebra-question-banks.js",
  "matrix-multiplication": "assets/js/linear-algebra-question-banks.js",
  "determinant-practice": "assets/js/linear-algebra-question-banks.js"
};

function loadScript(file) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInThisContext(source, { filename: file });
}

global.window = global;
global.MCLQuizTool = {};
loadScript("assets/js/question-bank-specs.js");
loadScript("assets/js/question-template-registry.js");
loadScript("assets/js/semantic-bank-factory.js");

const rows = [];
let failed = false;

for (const spec of MCLQuestionBankSpecs.all()) {
  const bankFile = bankFiles[spec.toolId];
  if (!bankFile || !fs.existsSync(path.join(root, bankFile))) {
    rows.push({ toolId: spec.toolId, status: "missing", templates: 0, families: 0, generated: 0 });
    failed = true;
    continue;
  }

  global.MCLQuizTool = {};
  if (spec.toolId === "complex-number-operations" && !global.MCLComplexMath) {
    loadScript("assets/js/complex-number-operations.js");
  }
  if (spec.toolId === "unit-circle-trigonometry" && !global.MCLUnitCircleMath) {
    global.localStorage = { getItem: () => null };
    global.document = { documentElement: { dataset: {} } };
    loadScript("assets/js/unit-circle-trigonometry.js");
  }
  if (!MCLQuestionTemplates.getTool(spec.toolId)) loadScript(bankFile);
  const structure = MCLQuestionTemplates.auditTool(spec.toolId);
  const generation = MCLQuestionTemplates.auditGeneration(spec.toolId, { samplesPerTemplate: 50 });
  rows.push({
    toolId: spec.toolId,
    status: structure.valid && generation.valid ? "ready" : "failed",
    templates: structure.templateCount,
    families: structure.semanticFamilyCount,
    generated: generation.generated,
    errors: [...structure.errors, ...generation.failures.slice(0, 5).map(item => `${item.templateId}: ${item.reason}`)]
  });
  if (!structure.valid || !generation.valid) failed = true;
}

const ready = rows.filter(row => row.status === "ready").length;
console.table(rows.map(({ toolId, status, templates, families, generated }) => ({ toolId, status, templates, families, generated })));
rows.filter(row => row.status === "failed").forEach(row => console.error(`\n${row.toolId}:\n- ${row.errors.join("\n- ")}`));
console.log(`\nMigration coverage: ${ready}/${rows.length} tools ready.`);

if (failed) process.exitCode = 1;
