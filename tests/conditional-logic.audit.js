"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const storage = { value: "en", getItem() { return this.value; } };
const context = { window: { localStorage: storage }, console, Math, Set, Map };
vm.createContext(context);
for (const file of ["question-template-registry.js", "conditional-logic.js", "conditional-logic-bank.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", file), "utf8"), context, { filename: file });
}

const registry = context.window.MCLQuestionTemplates;
const logic = context.window.MCLConditionalLogic;
const tool = registry.getTool("conditional-logic");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(tool, "conditional-logic was not registered");
assert(tool.templates.length === 105, `expected 105 templates, found ${tool.templates.length}`);
assert(tool.concepts.length === 5, `expected five concepts, found ${tool.concepts.length}`);

const audit = registry.auditTool("conditional-logic");
assert(audit.valid, `registry audit failed: ${audit.errors.join("; ")}`);
assert(JSON.stringify(audit.counts) === JSON.stringify({ easy: 25, medium: 30, hard: 25, expert: 25 }), `difficulty quotas are incorrect: ${JSON.stringify(audit.counts)}`);
assert(audit.familyCount === 25 && audit.semanticFamilyCount === 25, "expected 25 semantic families");

const interactionCounts = { choice: 0, matching: 0, order: 0, "truth-table": 0, fill: 0 };
const contextCounts = { geometry: 0, mathematics: 0, everyday: 0 };
const perConcept = new Map();
for (const template of tool.templates) {
  const question = registry.build("conditional-logic", template.id, { seed: `metadata:${template.id}`, lang: "en" });
  const kind = question.parameters.interactionKind;
  interactionCounts[kind] += 1;
  contextCounts[question.parameters.contextType] += 1;
  perConcept.set(template.conceptId, (perConcept.get(template.conceptId) || 0) + 1);
  assert(question.audit?.scenarioId, `${template.id}: missing structured scenario audit`);
  assert(new Set(question.distractors.map(registry.answerKey)).size >= 5, `${template.id}: fewer than five unique distractors`);
  if (question.interaction) {
    assert(question.interaction.correctKey, `${template.id}: missing canonical interaction key`);
    assert(!question.interaction.rows?.some(row => row.correct === undefined), `${template.id}: incomplete interaction row`);
  }
}
assert([...perConcept.values()].every(count => count === 21), `concept counts are incorrect: ${JSON.stringify([...perConcept])}`);
assert(JSON.stringify(interactionCounts) === JSON.stringify({ choice: 50, matching: 20, order: 15, "truth-table": 10, fill: 10 }), `interaction distribution is incorrect: ${JSON.stringify(interactionCounts)}`);
assert(JSON.stringify(contextCounts) === JSON.stringify({ geometry: 42, mathematics: 42, everyday: 21 }), `context distribution is incorrect: ${JSON.stringify(contextCounts)}`);

const p = logic.makeClause("arbitrary-p", { en: "p", zh: "p", notEn: "not p", notZh: "非 p" });
const q = logic.makeClause("arbitrary-q", { en: "q", zh: "q", notEn: "not q", notZh: "非 q" });
const expected = {
  conditional: (pValue, qValue) => !pValue || qValue,
  converse: (pValue, qValue) => !qValue || pValue,
  inverse: (pValue, qValue) => pValue || !qValue,
  contrapositive: (pValue, qValue) => qValue || !pValue
};
for (const form of logic.FORMS) {
  for (const pValue of [false, true]) {
    for (const qValue of [false, true]) {
      const actual = logic.evaluateConditional(logic.formOf(form, p, q), pValue, qValue);
      assert(actual === expected[form](pValue, qValue), `${form}: incorrect value for p=${pValue}, q=${qValue}`);
    }
  }
}
for (const pValue of [false, true]) {
  for (const qValue of [false, true]) {
    assert(logic.evaluateConditional(logic.conditionalOf(p, q), pValue, qValue) === logic.evaluateConditional(logic.contrapositiveOf(p, q), pValue, qValue), "conditional and contrapositive are not equivalent");
    assert(logic.evaluateConditional(logic.converseOf(p, q), pValue, qValue) === logic.evaluateConditional(logic.inverseOf(p, q), pValue, qValue), "converse and inverse are not equivalent");
  }
}

const samplesByDifficulty = { easy: 80, medium: 67, hard: 80, expert: 80 };
let generated = 0;
for (const difficulty of Object.keys(samplesByDifficulty)) {
  const templates = registry.templatesFor("conditional-logic", difficulty);
  assert(templates.length === audit.counts[difficulty], `${difficulty}: template lookup mismatch`);
  for (const template of templates) {
    for (let sample = 0; sample < samplesByDifficulty[difficulty]; sample += 1) {
      storage.value = sample % 2 ? "zh" : "en";
      const first = registry.build("conditional-logic", template.id, { seed: `${difficulty}:${template.id}:${sample}`, lang: storage.value });
      const second = registry.build("conditional-logic", template.id, { seed: `${difficulty}:${template.id}:${sample}`, lang: storage.value });
      generated += 1;
      assert(registry.stableString({ main: first.main, answer: first.answer, parameters: first.parameters }) === registry.stableString({ main: second.main, answer: second.answer, parameters: second.parameters }), `${template.id}: same seed was not deterministic`);
      const answerKey = registry.answerKey(first.answer);
      const distractorKeys = first.distractors.map(registry.answerKey).filter(key => key !== answerKey);
      assert(new Set(distractorKeys).size >= 5, `${template.id}: generated fewer than five unique distractors`);
      assert(first.lines?.length >= 2, `${template.id}: missing step-by-step explanation`);
    }
  }
}

const page = fs.readFileSync(path.join(root, "games", "conditional-logic.html"), "utf8");
for (const required of ["conditional-logic.css", "conditional-logic.js", "conditional-logic-bank.js", "quiz-tool-engine.js", "report-export.js"]) {
  assert(page.includes(required), `page is missing ${required}`);
}

console.log(`Conditional-logic audit passed: 105 templates and ${generated} generated questions.`);
