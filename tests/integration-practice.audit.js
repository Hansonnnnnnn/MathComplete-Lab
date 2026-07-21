"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "assets", "js", "integration-practice.js"), "utf8");
const context = {
  window: {},
  localStorage: { getItem: () => "en" },
  console,
  Math
};
vm.createContext(context);
vm.runInContext(source, context, { filename: "integration-practice.js" });

const api = context.window.MCLIntegrationMath;
const builders = context.window.MCLQuizTool.builders;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const helpers = {
  randInt,
  choice(items) { return items[randInt(0, items.length - 1)]; },
  shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const swap = randInt(0, index);
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }
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

function rationalKey(value) {
  return `${value.numerator}/${value.denominator}`;
}

function checkRational(value, label) {
  assert(value && Number.isInteger(value.numerator), `${label}: invalid numerator`);
  assert(Number.isInteger(value.denominator), `${label}: invalid denominator`);
  assert(value.denominator > 0, `${label}: denominator is not positive`);
  assert(gcd(value.numerator, value.denominator) === 1, `${label}: fraction is not reduced`);
}

function subtract(a, b) {
  return api.rational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
}

function checkQuestion(question, difficulty, index) {
  const prefix = `${difficulty} #${index + 1}`;
  assert(question && question.answer, `${prefix}: missing answer`);
  assert(typeof question.answer.key === "string" && question.answer.key, `${prefix}: missing canonical answer key`);
  assert(Array.isArray(question.distractors) && question.distractors.length >= 5, `${prefix} (${question.type}): fewer than five distractors (${question.distractors && question.distractors.length})`);

  const distractorKeys = question.distractors.map(item => item.key);
  assert(new Set(distractorKeys).size === distractorKeys.length, `${prefix}: duplicate distractors`);
  assert(!distractorKeys.includes(question.answer.key), `${prefix}: answer repeated among distractors`);
  [...question.distractors, question.answer].forEach((item, optionIndex) => {
    assert(!item.latex.includes("+-"), `${prefix} option ${optionIndex + 1}: displays +-`);
    assert(!item.latex.includes("--"), `${prefix} option ${optionIndex + 1}: displays --`);
    if (item.model && item.model.kind === "rational") checkRational(item.model.value, `${prefix} option ${optionIndex + 1}`);
  });

  const audit = question.audit;
  assert(audit && audit.kind, `${prefix}: missing audit model`);

  if (audit.kind === "polynomial-indefinite") {
    const derivative = api.differentiatePolynomial(audit.antiderivative);
    assert(api.polynomialKey(derivative) === api.polynomialKey(audit.integrand), `${prefix}: antiderivative does not differentiate to the integrand`);
    assert(/\+C$/.test(question.answer.latex), `${prefix}: indefinite answer is missing +C`);
  }

  if (audit.kind === "polynomial-definite") {
    const expected = subtract(api.evaluatePolynomial(audit.antiderivative, audit.upper), api.evaluatePolynomial(audit.antiderivative, audit.lower));
    assert(rationalKey(expected) === rationalKey(audit.result), `${prefix}: definite integral result is incorrect`);
    checkRational(audit.result, `${prefix} definite result`);
    assert(!question.answer.latex.includes("C"), `${prefix}: definite answer includes C`);
  }

  if (audit.kind === "definite-substitution") {
    const lowU = audit.a * audit.lower + audit.b;
    const highU = audit.a * audit.upper + audit.b;
    const expected = api.rational(highU ** (audit.n + 1) - lowU ** (audit.n + 1));
    assert(rationalKey(expected) === rationalKey(audit.result), `${prefix}: substitution result is incorrect`);
    checkRational(audit.result, `${prefix} substitution result`);
  }

  if (["common", "substitution", "combined"].includes(audit.kind)) {
    assert(/\+C$/.test(question.answer.latex), `${prefix}: indefinite symbolic answer is missing +C`);
  }

  if (audit.kind === "ftc") {
    assert(!question.answer.latex.includes("+C"), `${prefix}: FTC derivative includes +C`);
  }

  const allowed = {
    easy: ["integral-power-rule", "integral-polynomial"],
    medium: ["integral-polynomial", "integral-exponential", "integral-trigonometric", "integral-logarithmic", "integral-definite"],
    hard: ["integral-u-substitution", "integral-ftc", "integral-definite-substitution"],
    expert: ["integral-ftc-chain", "integral-definite", "integral-definite-substitution", "integral-mixed"]
  };
  assert(allowed[difficulty].includes(question.type), `${prefix}: invalid type ${question.type}`);
}

const perDifficulty = Number(process.argv[2] || 2000);
for (const difficulty of ["easy", "medium", "hard", "expert"]) {
  const counts = new Map();
  for (let index = 0; index < perDifficulty; index++) {
    const question = helpers.choice(builders[difficulty])(helpers);
    checkQuestion(question, difficulty, index);
    counts.set(question.type, (counts.get(question.type) || 0) + 1);
  }
  assert(counts.size === new Set(builders[difficulty].map(builder => builder.__type)).size, `${difficulty}: one or more builders were never exercised`);
}

const integrationContext = { window: {}, localStorage: { getItem: () => "en" } };
vm.createContext(integrationContext);
vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", "tool-catalog.js"), "utf8"), integrationContext);
vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", "math-visuals.js"), "utf8"), integrationContext);
const catalogTool = integrationContext.window.MCLToolCatalog.byId("integration-practice");
assert(catalogTool, "catalog: integration-practice is missing");
assert(catalogTool.primaryCourse === "single-variable-calculus", "catalog: incorrect primary course");
assert(catalogTool.topics["single-variable-calculus"] === "calculus", "catalog: incorrect topic mapping");
assert(integrationContext.window.MCLMathVisuals.toolIds.includes("integration-practice"), "visual: dedicated integration visual is missing");

const page = fs.readFileSync(path.join(root, "games", "integration-practice.html"), "utf8");
for (const required of ["integration-practice.js", "quiz-tool-engine.js", "tool-modes.js", "report-export.js", "tool-ux.js"]) {
  assert(page.includes(required), `page: missing ${required}`);
}

console.log(`Integration audit passed: ${perDifficulty * 4} generated questions.`);
