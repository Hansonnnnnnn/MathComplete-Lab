"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = path.join(__dirname, "..");
const context = {
  window: {},
  globalThis: {},
  console,
  Math,
  JSON,
  Object,
  Number,
  String,
  Array,
  Map,
  Set
};
context.globalThis = context.window;
context.window.window = context.window;
context.window.MCLQuizTool = {};
vm.createContext(context);

[
  "assets/js/question-template-registry.js",
  "assets/js/factoring-math.js",
  "assets/js/factoring-practice-bank.js"
].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file }));

const registry = context.window.MCLQuestionTemplates;
const math = context.window.MCLFactoringMath;
const bank = context.window.MCLFactoringBank;
const counts = bank.counts();

assert(bank.audit().valid, `registry audit failed: ${bank.audit().errors.join("; ")}`);
assert(JSON.stringify(counts.difficulty) === JSON.stringify({ easy:25, medium:30, hard:25, expert:25 }), `difficulty counts are wrong: ${JSON.stringify(counts.difficulty)}`);
assert(JSON.stringify(counts.interaction) === JSON.stringify({ diagnosis:15, fill:32, choice:58 }), `interaction counts are wrong: ${JSON.stringify(counts.interaction)}`);
assert(JSON.stringify(counts.content) === JSON.stringify({
  "gcf-negative-gcf":15,
  "monic-nonmonic-trinomials":25,
  "special-structures":20,
  grouping:15,
  "higher-powers-substitution":10,
  "multi-step-complete":10,
  "prime-error-structures":10
}), `content counts are wrong: ${JSON.stringify(counts.content)}`);

const forbidden = /area-product|rectangle|garden|revenue|which factoring method|identify the method|name the pattern/i;
const templates = registry.getTool("factoring-practice").templates;
assert(new Set(templates.map(template => template.constraintPattern)).size === 105, "structure signatures are not unique");

function testGenerated(question, template, label) {
  assert(!forbidden.test(JSON.stringify({
    main: question.main,
    plain: question.plain,
    prompt: question.prompt,
    parameters: question.parameters,
    metadata: template.parameterPolicy
  })), `${label}: forbidden story or method-identification content`);
  assert(question.parameters.structureId === template.id, `${label}: structure ID mismatch`);
  assert(question.parameters.targetPolynomialKey, `${label}: missing target polynomial key`);
  assert(!String(question.main).includes("+-"), `${label}: malformed +- display`);
  assert(!String(question.answer.latex || question.answer).includes("+-"), `${label}: malformed answer display`);

  if (question.parameters.isPrime) {
    assert(question.parameters.primeProof, `${label}: prime question has no proof certificate`);
    assert(question.distractors.length >= 5, `${label}: prime choice has too few distractors`);
    return;
  }

  const schema = question.parameters.factorSchema;
  const canonical = math.canonicalValues(schema);
  const expanded = math.expandFactorStructure(schema, canonical);
  assert(math.polynomialKey(expanded) === question.parameters.targetPolynomialKey, `${label}: canonical factors do not expand to target`);
  assert(math.factorStructureLatex(schema) === question.parameters.canonicalAnswerLatex, `${label}: canonical answer display mismatch`);
  (schema.factors || []).forEach((factor, index) => {
    const polynomial = math.factorPolynomial(factor, canonical);
    assert(math.isPrimitiveFactor(polynomial), `${label}: factor ${index + 1} is not primitive`);
    assert(!math.hasCommonVariableFactor(polynomial), `${label}: factor ${index + 1} retains a variable GCF`);
  });

  if (question.parameters.interactionKind === "coefficient-fill") {
    assert(question.distractors.length === 0, `${label}: coefficient fill generated fake choices`);
    const correct = math.validateCoefficientResponse(question, { values: canonical });
    assert(correct.correct, `${label}: canonical coefficient tuple was rejected (${correct.reason})`);
    const acceptedVectors = math.acceptedCanonicalVectors(schema);
    assert(acceptedVectors.every(values => math.validateCoefficientResponse(question, { values }).correct), `${label}: a valid factor permutation or even sign redistribution was rejected`);
    const oddSign = { ...canonical };
    const firstSlot = math.slotDefinitions(schema)[0];
    oddSign[firstSlot.id] *= -1;
    assert(!math.validateCoefficientResponse(question, { values: oddSign }).correct, `${label}: odd sign change was accepted`);
  } else {
    assert(question.distractors.length >= 5, `${label}: choice/diagnosis has too few distractors`);
    const keys = question.distractors.map(registry.answerKey);
    assert(new Set(keys).size === keys.length, `${label}: duplicate displayed distractors`);
    if (question.parameters.interactionKind === "complete-choice") {
      (question.parameters.choiceCandidates || []).forEach(candidate => {
        assert(!(candidate.complete && candidate.equivalent), `${label}: an equivalent complete factorization appears as a distractor`);
      });
    }
  }

  if (/cubes/.test(question.parameters.reasoning || "")) {
    assert(question.parameters.formulaReference === bank.cubeReference, `${label}: cube question is missing both formula references`);
  }
}

const perDifficulty = Number(process.argv[2] || 2000);
for (const difficulty of ["easy", "medium", "hard", "expert"]) {
  const pool = registry.templatesFor("factoring-practice", difficulty);
  for (let index = 0; index < perDifficulty; index += 1) {
    const template = pool[index % pool.length];
    const seed = `factoring-audit:${difficulty}:${index}`;
    const first = registry.build("factoring-practice", template.id, { seed, lang: index % 2 ? "zh" : "en" });
    const second = registry.build("factoring-practice", template.id, { seed, lang: index % 2 ? "zh" : "en" });
    assert(registry.stableString({ main:first.main, answer:first.answer, parameters:first.parameters }) === registry.stableString({ main:second.main, answer:second.answer, parameters:second.parameters }), `${difficulty} #${index + 1}: identical seed changed the question`);
    testGenerated(first, template, `${difficulty} #${index + 1} (${template.id})`);
  }
}

const gcfFillTemplate = templates.find(template => template.difficulty === "easy" && /gcf-negative-gcf/.test(template.id) && template.outputKind === "coefficient-tuple");
const gcfFill = registry.build("factoring-practice", gcfFillTemplate.id, { seed:"nonprimitive-test", lang:"en" });
const nonPrimitive = { ...gcfFill.parameters.canonicalAnswerCoefficients };
const schema = gcfFill.parameters.factorSchema;
if (schema.outside && Math.abs(nonPrimitive[schema.outside.terms[0].slot]) % 2 === 0) {
  nonPrimitive[schema.outside.terms[0].slot] /= 2;
  schema.factors[0].terms.forEach(term => { nonPrimitive[term.slot] *= 2; });
  const validation = math.validateCoefficientResponse(gcfFill, { values:nonPrimitive });
  assert(!validation.correct && validation.reason === "non-primitive-factor", "equivalent product with a non-primitive factor was accepted");
}

const page = fs.readFileSync(path.join(root, "games", "factoring-practice.html"), "utf8");
for (const required of ["factoring-math.js", "factoring-practice.js", "factoring-practice-bank.js", "factoring-practice.css", "quiz-tool-engine.js", "report-export.js"]) {
  assert(page.includes(required), `page is missing ${required}`);
}
assert(!page.includes("legacy-factoring-practice-script"), "legacy inline factoring bank remains in the page");
assert(!page.includes("area-product"), "legacy area-product metadata remains in the page");

console.log(`Factoring audit passed: ${perDifficulty * 4} generated questions across 105 templates.`);
