const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = { globalThis: {} };
context.window = context.globalThis;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "assets", "js", "question-bank-specs.js"), "utf8"), context);

const specs = context.globalThis.MCLQuestionBankSpecs;
const catalogSource = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "tool-catalog.js"), "utf8");
const catalogIds = [...catalogSource.matchAll(/"id"\s*:\s*"([^"]+)"/g)].map(match => match[1]).slice(7);
const specIds = specs.all().map(item => item.toolId);
const missing = catalogIds.filter(id => !specIds.includes(id));
const extra = specIds.filter(id => !catalogIds.includes(id));

if (missing.length || extra.length) throw new Error(`Specification mismatch. Missing: ${missing.join(", ")}; extra: ${extra.join(", ")}`);
specs.all().forEach(spec => {
  if (spec.concepts.length !== 5) throw new Error(`${spec.toolId} does not have five concepts.`);
  if (new Set(spec.concepts.map(item => item.id)).size !== 5) throw new Error(`${spec.toolId} repeats concepts.`);
  if (spec.requiredSemanticFamilies !== 25 || spec.requiredCoreTemplates !== 105) throw new Error(`${spec.toolId} has incorrect requirements.`);
});

console.log(`question-bank-specs audit passed for ${specIds.length} tools`);
