"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "complex-number-operations.js"), "utf8");
const context = {
  window: {},
  localStorage: { getItem: () => "en" },
  console,
  Math
};
vm.createContext(context);
vm.runInContext(source, context, { filename: "complex-number-operations.js" });

const api = context.window.MCLComplexMath;
const builders = context.window.MCLQuizTool.builders;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const helpers = {
  randInt,
  choice(items) { return items[randInt(0, items.length - 1)]; },
  shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
};

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function checkRational(value, label) {
  assert(Number.isInteger(value.numerator), `${label}: numerator is not an integer`);
  assert(Number.isInteger(value.denominator), `${label}: denominator is not an integer`);
  assert(value.denominator > 0, `${label}: denominator is not positive`);
  assert(gcd(value.numerator, value.denominator) === 1, `${label}: fraction is not reduced`);
}

function checkQuestion(question, difficulty, index) {
  const prefix = `${difficulty} #${index + 1}`;
  assert(question && question.answer && question.answer.value, `${prefix}: missing structured answer`);
  checkRational(question.answer.value.real, `${prefix} real part`);
  checkRational(question.answer.value.imaginary, `${prefix} imaginary part`);
  assert(question.distractors.length >= 5, `${prefix}: fewer than five distractors`);

  const correctKey = api.complexKey(question.answer.value);
  const keys = question.distractors.map(item => item.key);
  assert(new Set(keys).size === keys.length, `${prefix}: duplicate distractors`);
  assert(!keys.includes(correctKey), `${prefix}: correct answer duplicated among distractors`);
  assert(!/(^|[+\-])1i(?:$|[+\-])/.test(question.answer.latex), `${prefix}: displays 1i`);
  assert(!question.answer.latex.includes("+-"), `${prefix}: displays +-`);
  assert(!question.answer.latex.includes("--"), `${prefix}: displays --`);

  if (difficulty === "easy") {
    assert(["complex-add", "complex-subtract"].includes(question.type), `${prefix}: invalid easy type ${question.type}`);
    assert(!question.main.includes("\\frac"), `${prefix}: easy question contains division`);
  }
  if (difficulty === "medium") {
    assert(["complex-multiply", "complex-mixed-product"].includes(question.type), `${prefix}: invalid medium type ${question.type}`);
  }
  if (difficulty === "hard") {
    assert(question.type === "complex-divide", `${prefix}: hard question is not division`);
    const parts = [question.answer.value.real, question.answer.value.imaginary];
    assert(parts.every(part => part.denominator <= 25), `${prefix}: hard denominator exceeds 25`);
  }
  if (difficulty === "expert") {
    assert(["complex-mixed-product", "complex-mixed-quotient"].includes(question.type), `${prefix}: invalid expert type ${question.type}`);
    const parts = [question.answer.value.real, question.answer.value.imaginary];
    assert(parts.every(part => part.denominator <= 36), `${prefix}: expert denominator exceeds 36`);
    assert(parts.every(part => Math.abs(part.numerator / part.denominator) <= 50), `${prefix}: expert component exceeds 50`);
  }
}

const perDifficulty = Number(process.argv[2] || 2000);
for (const difficulty of ["easy", "medium", "hard", "expert"]) {
  const pool = builders[difficulty];
  let fractionalAnswers = 0;
  let specialAnswers = 0;
  for (let index = 0; index < perDifficulty; index++) {
    const question = helpers.choice(pool)(helpers);
    checkQuestion(question, difficulty, index);
    const value = question.answer.value;
    if (value.real.denominator > 1 || value.imaginary.denominator > 1) fractionalAnswers++;
    if (value.real.numerator === 0 || value.imaginary.numerator === 0) specialAnswers++;
  }
  if (difficulty === "easy") assert(specialAnswers / perDifficulty <= 0.2, `easy: too many pure-real, pure-imaginary, or zero-component answers (${specialAnswers}/${perDifficulty})`);
  if (difficulty === "hard") assert(fractionalAnswers / perDifficulty >= 0.5, `hard: fewer than half of answers contain fractions (${fractionalAnswers}/${perDifficulty})`);
}

const integrationContext = { window: {}, localStorage: { getItem: () => "en" } };
vm.createContext(integrationContext);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "assets", "js", "tool-catalog.js"), "utf8"), integrationContext);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "assets", "js", "math-visuals.js"), "utf8"), integrationContext);
const catalogTool = integrationContext.window.MCLToolCatalog.byId("complex-number-operations");
assert(catalogTool, "catalog: complex-number-operations is missing");
assert(catalogTool.primaryCourse === "algebra-2", "catalog: incorrect primary course");
assert(catalogTool.courses.join("|") === "algebra-2|precalculus", "catalog: incorrect course membership");
assert(catalogTool.topics["algebra-2"] === "complex-numbers" && catalogTool.topics.precalculus === "complex-numbers", "catalog: incorrect topic mapping");
assert(integrationContext.window.MCLMathVisuals.toolIds.includes("complex-number-operations"), "visual: dedicated complex-number visual is missing");

const page = fs.readFileSync(path.join(__dirname, "..", "games", "complex-number-operations.html"), "utf8");
for (const required of ["complex-number-operations.js", "quiz-tool-engine.js", "tool-modes.js", "report-export.js", "tool-ux.js"]) {
  assert(page.includes(required), `page: missing ${required}`);
}

console.log(`Complex-number audit passed: ${perDifficulty * 4} generated questions.`);
