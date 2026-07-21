"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const context = {
  window: {},
  localStorage: { getItem: () => "en" },
  console,
  Math
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", "unit-circle-trigonometry.js"), "utf8"), context, { filename: "unit-circle-trigonometry.js" });

const api = context.window.MCLUnitCircleMath;
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
      const target = randInt(0, index);
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function rationalValue(value) {
  return value.n / value.d;
}

function exactValue(value) {
  if (value?.undefined) return NaN;
  return rationalValue(value.r) + rationalValue(value.sqrt2) * Math.sqrt(2) + rationalValue(value.sqrt3) * Math.sqrt(3) + rationalValue(value.sqrt6) * Math.sqrt(6);
}

function checkRational(value, label) {
  assert(Number.isInteger(value.n) && Number.isInteger(value.d), `${label}: non-integer rational`);
  assert(value.d > 0, `${label}: non-positive denominator`);
  assert(gcd(value.n, value.d) === 1, `${label}: fraction not reduced`);
}

function checkExact(value, label) {
  if (value?.undefined) return;
  for (const key of ["r", "sqrt2", "sqrt3", "sqrt6"]) checkRational(value[key], `${label} ${key}`);
}

function approximately(a, b, epsilon = 1e-10) {
  return Math.abs(a - b) <= epsilon;
}

for (const angle of api.STANDARD_ANGLES) {
  const prefix = `${angle.degrees} degrees`;
  checkRational(angle.normalizedRadians, `${prefix} radians`);
  checkRational(angle.referenceAngle, `${prefix} reference angle`);
  assert(angle.degrees >= 0 && angle.degrees < 360, `${prefix}: not normalized`);
  const expectedQuadrant = angle.degrees % 90 === 0 ? null : angle.degrees < 90 ? 1 : angle.degrees < 180 ? 2 : angle.degrees < 270 ? 3 : 4;
  assert(angle.quadrant === expectedQuadrant, `${prefix}: incorrect quadrant`);
  const values = api.trigValues(angle);
  checkExact(values.sin, `${prefix} sine`);
  checkExact(values.cos, `${prefix} cosine`);
  checkExact(values.tan, `${prefix} tangent`);
  const radians = angle.degrees * Math.PI / 180;
  assert(approximately(exactValue(values.sin), Math.sin(radians)), `${prefix}: incorrect sine`);
  assert(approximately(exactValue(values.cos), Math.cos(radians)), `${prefix}: incorrect cosine`);
  if (Math.abs(Math.cos(radians)) < 1e-10) assert(values.tan.undefined, `${prefix}: tangent should be undefined`);
  else assert(approximately(exactValue(values.tan), Math.tan(radians)), `${prefix}: incorrect tangent`);

  const svg = api.unitCircleSvg({ type: "unit-circle", degrees: angle.degrees, alt: prefix });
  const point = svg.match(/class="uc-point" cx="([\d.]+)" cy="([\d.]+)"/);
  assert(point, `${prefix}: SVG point missing`);
  const expectedX = 160 + 112 * exactValue(values.cos);
  const expectedY = 160 - 112 * exactValue(values.sin);
  assert(approximately(Number(point[1]), expectedX, 0.011), `${prefix}: SVG x-coordinate mismatch`);
  assert(approximately(Number(point[2]), expectedY, 0.011), `${prefix}: SVG y-coordinate mismatch`);
}

const allowed = {
  easy: ["trig-degree-radian", "trig-reference-angle", "trig-quadrant", "trig-angle-from-value", "trig-exact-sine"],
  medium: ["trig-degree-radian", "trig-exact-sine", "trig-exact-cosine", "trig-exact-tangent", "trig-unit-circle-coordinate"],
  hard: ["trig-reference-angle", "trig-exact-tangent", "trig-unit-circle-coordinate", "trig-angle-set", "trig-angle-from-value"],
  expert: ["trig-exact-expression", "trig-angle-from-value", "trig-angle-set"]
};

function checkQuestion(question, difficulty, index) {
  const prefix = `${difficulty} #${index + 1} (${question.type})`;
  assert(question && question.answer && question.answer.key, `${prefix}: missing answer`);
  assert(allowed[difficulty].includes(question.type), `${prefix}: invalid type`);
  assert(question.distractors.length >= 5, `${prefix}: only ${question.distractors.length} distractors`);
  const keys = question.distractors.map(item => item.key);
  assert(new Set(keys).size === keys.length, `${prefix}: duplicate distractors`);
  assert(!keys.includes(question.answer.key), `${prefix}: answer repeated among distractors`);
  [...question.distractors, question.answer].forEach((option, optionIndex) => {
    assert(!option.latex.includes("+-") && !option.latex.includes("--"), `${prefix} option ${optionIndex + 1}: malformed signs`);
  });
  assert(question.audit?.kind, `${prefix}: missing audit model`);

  if (question.visual) {
    assert(question.visual.type === "unit-circle", `${prefix}: invalid visual type`);
    assert(api.STANDARD_ANGLES.some(angle => angle.degrees === question.visual.degrees), `${prefix}: non-standard visual angle`);
    assert(typeof question.visual.alt === "string" && question.visual.alt, `${prefix}: visual alt text missing`);
  }

  const audit = question.audit;
  if (audit.kind === "conversion") {
    assert(audit.angle.degrees * audit.angle.piDenominator === audit.angle.piNumerator * 180, `${prefix}: conversion mismatch`);
  } else if (audit.kind === "reference-angle") {
    assert(audit.reference.degrees === audit.angle.referenceDegrees, `${prefix}: reference angle mismatch`);
  } else if (audit.kind === "quadrant") {
    assert(audit.angle.quadrant === null || audit.location === `q${audit.angle.quadrant}`, `${prefix}: quadrant answer mismatch`);
  } else if (audit.kind === "coordinate") {
    const expected = api.trigValues(audit.angle);
    assert(api.exactKey(expected.cos) === api.exactKey(audit.coordinate.x), `${prefix}: coordinate x mismatch`);
    assert(api.exactKey(expected.sin) === api.exactKey(audit.coordinate.y), `${prefix}: coordinate y mismatch`);
  } else if (audit.kind === "exact-trig") {
    assert(api.exactKey(api.trigValues(audit.angle)[audit.fn]) === api.exactKey(audit.value), `${prefix}: exact value mismatch`);
  } else if (audit.kind === "angle-set") {
    const expected = api.STANDARD_ANGLES.filter(angle => api.exactKey(api.trigValues(angle)[audit.fn]) === api.exactKey(audit.target));
    assert(expected.map(api.angleKey).join("|") === audit.matches.map(api.angleKey).join("|"), `${prefix}: angle set mismatch`);
  } else if (audit.kind === "exact-expression") {
    const expected = audit.terms.reduce((sum, item) => api.addExact(sum, api.scaleExact(item.value, item.coefficient)), api.exact(0));
    assert(api.exactKey(expected) === api.exactKey(audit.result), `${prefix}: expression result mismatch`);
    assert(audit.terms.length >= 2, `${prefix}: expert expression has fewer than two terms`);
  } else if (audit.kind === "condition-angle") {
    assert(audit.angle.quadrant !== null, `${prefix}: condition angle lies on an axis`);
  }
}

const perDifficulty = Number(process.argv[2] || 2000);
for (const difficulty of ["easy", "medium", "hard", "expert"]) {
  let visualCount = 0;
  const seenTypes = new Set();
  for (let index = 0; index < perDifficulty; index++) {
    const question = helpers.choice(builders[difficulty])(helpers);
    checkQuestion(question, difficulty, index);
    if (question.visual) visualCount++;
    seenTypes.add(question.type);
  }
  const visualRatio = visualCount / perDifficulty;
  assert(visualRatio >= 0.3 && visualRatio <= 0.5, `${difficulty}: visual ratio ${visualRatio.toFixed(3)} is outside 30%-50%`);
  assert(seenTypes.size === new Set(builders[difficulty].map(builder => builder.__type)).size, `${difficulty}: not every builder type was exercised`);
}

const catalogContext = { window: {}, localStorage: { getItem: () => "en" } };
vm.createContext(catalogContext);
vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", "tool-catalog.js"), "utf8"), catalogContext);
vm.runInContext(fs.readFileSync(path.join(root, "assets", "js", "math-visuals.js"), "utf8"), catalogContext);
const tool = catalogContext.window.MCLToolCatalog.byId("unit-circle-trigonometry");
assert(tool, "catalog: unit-circle-trigonometry missing");
assert(tool.primaryCourse === "precalculus" && tool.courses.join("|") === "precalculus", "catalog: incorrect course placement");
assert(tool.topics.precalculus === "trigonometry", "catalog: incorrect topic");
assert(catalogContext.window.MCLMathVisuals.toolIds.includes("unit-circle-trigonometry"), "visual: dedicated card visual missing");

const page = fs.readFileSync(path.join(root, "games", "unit-circle-trigonometry.html"), "utf8");
for (const required of ["unit-circle-trigonometry.js", "unit-circle-trigonometry.css", "questionVisual", "quiz-tool-engine.js", "report-export.js"]) {
  assert(page.includes(required), `page: missing ${required}`);
}

console.log(`Unit-circle audit passed: ${perDifficulty * 4} generated questions.`);
