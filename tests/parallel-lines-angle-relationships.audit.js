"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const storage = { value: "en", getItem() { return this.value; } };
const context = { window: { localStorage: storage }, console, Math, Set, Map };
vm.createContext(context);
for (const file of ["question-template-registry.js", "parallel-lines-angle-relationships.js", "parallel-lines-angle-relationships-bank.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", file), "utf8"), context, { filename: file });
}

const registry = context.window.MCLQuestionTemplates;
const model = context.window.MCLLineAngleModel;
const tool = registry.getTool("parallel-lines-angle-relationships");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(tool, "parallel-lines-angle-relationships was not registered");
assert(tool.templates.length === 105, `expected 105 templates, found ${tool.templates.length}`);
assert(tool.concepts.length === 5, `expected five concepts, found ${tool.concepts.length}`);

const audit = registry.auditTool("parallel-lines-angle-relationships");
assert(audit.valid, `registry audit failed: ${audit.errors.join("; ")}`);
assert(JSON.stringify(audit.counts) === JSON.stringify({ easy:25, medium:30, hard:25, expert:25 }), `difficulty quotas are incorrect: ${JSON.stringify(audit.counts)}`);
assert(audit.familyCount === 25 && audit.semanticFamilyCount === 25, "expected 25 semantic families");

const interactionCounts = { choice:0, target:0, numeric:0, matching:0, order:0 };
const perConcept = new Map();
const schemas = new Set();
const topologySet = new Set();
for (const template of tool.templates) {
  const question = registry.build(tool.toolId, template.id, { seed:`metadata:${template.id}` });
  const params = question.parameters;
  interactionCounts[params.interactionKind] += 1;
  perConcept.set(template.conceptId, (perConcept.get(template.conceptId) || 0) + 1);
  schemas.add(params.geometrySchemaId);
  topologySet.add(params.topology);
  assert(question.visual?.viewBox?.length === 4, `${template.id}: missing geometry scene`);
  assert(new Set(question.distractors.map(registry.answerKey)).size >= 5, `${template.id}: fewer than five unique distractors`);
  if (question.interaction) assert(question.interaction.correctKey, `${template.id}: missing interaction answer key`);
  if (params.markedParallel === false) assert(!(question.visual.marks || []).some(mark => mark.type === "parallel"), `${template.id}: unmarked converse leaked parallel arrows`);
}
assert([...perConcept.values()].every(count => count === 21), `concept counts are incorrect: ${JSON.stringify([...perConcept])}`);
assert(schemas.size === 105, `expected 105 geometry schema ids, found ${schemas.size}`);
assert(topologySet.size === 7, `expected seven topology families, found ${[...topologySet].join(", ")}`);
assert(JSON.stringify(interactionCounts) === JSON.stringify({ choice:45, target:20, numeric:15, matching:15, order:10 }), `interaction distribution is incorrect: ${JSON.stringify(interactionCounts)}`);

for (let theta = 25; theta <= 155; theta += 5) {
  for (const [relation, pairs] of Object.entries(model.relationPairs)) {
    const supplementary = relation === "sameSideInterior" || relation === "sameSideExterior";
    for (const [first, second] of pairs) {
      const firstMeasure = model.angleMeasure(theta, first);
      const secondMeasure = model.angleMeasure(theta, second);
      assert(supplementary ? model.areSupplementary(firstMeasure, secondMeasure) : model.areCongruent(firstMeasure, secondMeasure), `${relation}: invalid exact angle relationship at ${theta} degrees`);
    }
  }
}

const samplesByDifficulty = { easy:80, medium:67, hard:80, expert:80 };
let generated = 0;
for (const [difficulty, samples] of Object.entries(samplesByDifficulty)) {
  const templates = registry.templatesFor(tool.toolId, difficulty);
  assert(templates.length === audit.counts[difficulty], `${difficulty}: template lookup mismatch`);
  for (const template of templates) {
    for (let sample = 0; sample < samples; sample += 1) {
      storage.value = sample % 2 ? "zh" : "en";
      const seed = `${difficulty}:${template.id}:${sample}`;
      const first = registry.build(tool.toolId, template.id, { seed, lang:storage.value });
      const second = registry.build(tool.toolId, template.id, { seed, lang:storage.value });
      generated += 1;
      assert(registry.stableString({ main:first.main, answer:first.answer, parameters:first.parameters }) === registry.stableString({ main:second.main, answer:second.answer, parameters:second.parameters }), `${template.id}: same seed was not deterministic`);
      assert(first.parameters.theta >= 25 && first.parameters.theta <= 155, `${template.id}: theta escaped the valid range`);
      assert(Math.abs(first.parameters.theta - 90) >= 5, `${template.id}: accidental near-right angle`);
      if (first.parameters.equationRule === "congruent") {
        const [a,b,c,d] = first.parameters.coefficients;
        assert(a !== c, `${template.id}: congruent equation does not have a unique solution`);
        assert(a * first.parameters.x + b === c * first.parameters.x + d, `${template.id}: congruent equation answer is inconsistent`);
      }
      if (first.parameters.equationRule === "supplementary") {
        const [a,b,c,d] = first.parameters.coefficients;
        assert((a+c) * first.parameters.x + b + d === 180, `${template.id}: supplementary equation answer is inconsistent`);
      }
      if (first.interaction?.kind === "numeric") assert(Number.isFinite(Number(first.interaction.correctKey)), `${template.id}: numeric interaction has no exact numeric answer`);
      if (first.interaction?.kind === "target" || first.interaction?.kind === "target-set") {
        const available = new Set(first.interaction.targets.map(target => target.key));
        assert(model.canonicalSet(first.interaction.correctKey).split("|").every(key => available.has(key)), `${template.id}: target answer is not present in the diagram`);
      }
    }
  }
}

const page = fs.readFileSync(path.join(root, "games", "parallel-lines-angle-relationships.html"), "utf8");
for (const required of ["geometry-core.js", "parallel-lines-angle-relationships.css", "parallel-lines-angle-relationships.js", "parallel-lines-angle-relationships-bank.js", "quiz-tool-engine.js", "report-export.js"]) {
  assert(page.includes(required), `page is missing ${required}`);
}

console.log(`Parallel-lines audit passed: 105 templates and ${generated} generated questions.`);
