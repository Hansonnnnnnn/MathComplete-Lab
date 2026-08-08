"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const storage = { value: "en", getItem() { return this.value; } };
const context = { window: { localStorage: storage }, console, Math, Set, Map, Object };
vm.createContext(context);
for (const file of ["number-systems-classification.js", "question-template-registry.js", "number-systems-classification-bank.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", file), "utf8"), context, { filename: file });
}

const registry = context.window.MCLQuestionTemplates;
const numbers = context.window.MCLNumberSystems;
const tool = registry.getTool("number-systems-classification");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(tool, "number-systems-classification was not registered");
assert(tool.templates.length === 105, `expected 105 templates, found ${tool.templates.length}`);
assert(tool.concepts.length === 5, `expected five concepts, found ${tool.concepts.length}`);

const audit = registry.auditTool("number-systems-classification");
assert(audit.valid, `registry audit failed: ${audit.errors.join("; ")}`);
assert(JSON.stringify(audit.counts) === JSON.stringify({ easy: 25, medium: 30, hard: 25, expert: 25 }), `difficulty quotas are incorrect: ${JSON.stringify(audit.counts)}`);
assert(audit.familyCount === 25 && audit.semanticFamilyCount === 25, "expected 25 semantic families");

const perConcept = new Map();
tool.templates.forEach(template => perConcept.set(template.conceptId, (perConcept.get(template.conceptId) || 0) + 1));
assert([...perConcept.values()].every(count => count === 21), `each concept must have 21 templates: ${JSON.stringify([...perConcept])}`);

function inspect(question, templateId) {
  const auditData = question.audit;
  assert(auditData?.optionValues?.length === 6, `${templateId}: expected six audited values`);
  const correct = auditData.optionValues.filter(option => option.isCorrect);
  assert(correct.length === 1, `${templateId}: expected exactly one correct option, found ${correct.length}`);
  assert(correct[0].key === auditData.correctKey, `${templateId}: correct key mismatch`);
  assert(new Set(auditData.optionValues.map(option => option.key)).size === 6, `${templateId}: duplicate exact values`);
  if (auditData.taskKind !== "most-specific") {
    assert(new Set(auditData.optionValues.map(option => option.surface)).size >= 3, `${templateId}: fewer than three expression surfaces`);
  }
  assert(!question.main.includes("\\ldots") && !question.main.includes("..."), `${templateId}: ambiguous ellipsis`);
  assert(!question.audit.optionValues.some(option => option.key.includes("nan") || option.key.includes("infinity")), `${templateId}: undefined value`);
}

const samplesByDifficulty = { easy: 80, medium: 67, hard: 80, expert: 80 };
const targetCounts = Object.fromEntries(numbers.SYSTEMS.map(id => [id, 0]));
const taskCounts = { "find-member": 0, "find-outsider": 0, "most-specific": 0 };
const promptStyles = new Set();
let generated = 0;
for (const difficulty of Object.keys(samplesByDifficulty)) {
  const templates = registry.templatesFor("number-systems-classification", difficulty);
  assert(templates.length === audit.counts[difficulty], `${difficulty}: template lookup mismatch`);
  for (const template of templates) {
    for (let sample = 0; sample < samplesByDifficulty[difficulty]; sample += 1) {
      const language = sample % 2 ? "zh" : "en";
      storage.value = language;
      const seed = `${difficulty}:${template.id}:${sample}`;
      let first;
      let second;
      try {
        first = registry.build("number-systems-classification", template.id, { seed, lang: language });
        second = registry.build("number-systems-classification", template.id, { seed, lang: language });
      } catch (error) {
        throw new Error(`${template.id} seed ${seed}: ${error.message}`);
      }
      generated += 1;
      inspect(first, template.id);
      targetCounts[first.audit.target] += 1;
      taskCounts[first.audit.taskKind] += 1;
      promptStyles.add(first.parameters.promptStyle);
      assert(registry.stableString({ main: first.main, answer: first.answer, distractors: first.distractors, parameters: first.parameters }) === registry.stableString({ main: second.main, answer: second.answer, distractors: second.distractors, parameters: second.parameters }), `${template.id}: same seed was not deterministic`);
      const answerKey = registry.answerKey(first.answer);
      const distractorKeys = first.distractors.map(registry.answerKey).filter(key => key !== answerKey);
      assert(new Set(distractorKeys).size === 5, `${template.id}: expected five unique distractors`);
      assert(first.lines?.length >= 1, `${template.id}: missing explanation`);
      if (first.audit.target === "natural") {
        const zero = first.audit.optionValues.find(option => option.key === "q:0/1");
        assert(!zero, `${template.id}: zero appeared in a natural-number classification question`);
      }
    }
  }
}

assert(Object.values(taskCounts).every(count => count > 0), `all three task contracts must be generated: ${JSON.stringify(taskCounts)}`);
assert(promptStyles.size === 5, `all five prompt styles must be generated: ${JSON.stringify([...promptStyles])}`);

const page = fs.readFileSync(path.join(root, "games", "number-systems-classification.html"), "utf8");
for (const required of ["number-systems-classification.css", "number-systems-classification.js", "number-systems-classification-bank.js", "quiz-tool-engine.js", "report-export.js"]) {
  assert(page.includes(required), `page is missing ${required}`);
}

console.log(`Number-systems audit passed: 105 templates and ${generated} generated questions.`);
console.log(`Target distribution: ${JSON.stringify(targetCounts)}`);
console.log(`Task distribution: ${JSON.stringify(taskCounts)}`);
