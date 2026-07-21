(function () {
  "use strict";

  function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function rational(numerator, denominator = 1) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) throw new Error("Invalid rational");
    let n = Math.trunc(numerator);
    let d = Math.trunc(denominator);
    if (d < 0) { n = -n; d = -d; }
    const factor = gcd(n, d);
    return { n: n / factor, d: d / factor };
  }

  const addRational = (a, b) => rational(a.n * b.d + b.n * a.d, a.d * b.d);
  const multiplyRational = (a, b) => rational(a.n * b.n, a.d * b.d);
  const negateRational = value => rational(-value.n, value.d);
  const rationalKey = value => `${value.n}/${value.d}`;
  const isZeroRational = value => value.n === 0;

  function exact(r = 0, sqrt2 = 0, sqrt3 = 0, sqrt6 = 0) {
    const clean = value => typeof value === "number" ? rational(value) : rational(value.n, value.d);
    return { r: clean(r), sqrt2: clean(sqrt2), sqrt3: clean(sqrt3), sqrt6: clean(sqrt6) };
  }

  const ZERO = exact(0);
  const ONE = exact(1);

  function addExact(a, b) {
    return exact(
      addRational(a.r, b.r),
      addRational(a.sqrt2, b.sqrt2),
      addRational(a.sqrt3, b.sqrt3),
      addRational(a.sqrt6, b.sqrt6)
    );
  }

  function scaleExact(value, factor) {
    const scalar = typeof factor === "number" ? rational(factor) : factor;
    return exact(
      multiplyRational(value.r, scalar),
      multiplyRational(value.sqrt2, scalar),
      multiplyRational(value.sqrt3, scalar),
      multiplyRational(value.sqrt6, scalar)
    );
  }

  function negateExact(value) {
    return scaleExact(value, -1);
  }

  function multiplyExact(a, b) {
    const result = { r: rational(0), sqrt2: rational(0), sqrt3: rational(0), sqrt6: rational(0) };
    const parts = [["r", 1], ["sqrt2", 2], ["sqrt3", 3], ["sqrt6", 6]];
    function addComponent(name, coefficient, multiplier = 1) {
      result[name] = addRational(result[name], multiplyRational(coefficient, rational(multiplier)));
    }
    parts.forEach(([leftName, leftRadical]) => parts.forEach(([rightName, rightRadical]) => {
      const coefficient = multiplyRational(a[leftName], b[rightName]);
      if (isZeroRational(coefficient)) return;
      const product = leftRadical * rightRadical;
      if (product === 1) addComponent("r", coefficient);
      else if (product === 2) addComponent("sqrt2", coefficient);
      else if (product === 3) addComponent("sqrt3", coefficient);
      else if (product === 6) addComponent("sqrt6", coefficient);
      else if (product === 4) addComponent("r", coefficient, 2);
      else if (product === 9) addComponent("r", coefficient, 3);
      else if (product === 12) addComponent("sqrt3", coefficient, 2);
      else if (product === 18) addComponent("sqrt2", coefficient, 3);
      else if (product === 36) addComponent("r", coefficient, 6);
    }));
    return exact(result.r, result.sqrt2, result.sqrt3, result.sqrt6);
  }

  function exactKey(value) {
    if (value?.undefined) return "undefined";
    return [value.r, value.sqrt2, value.sqrt3, value.sqrt6].map(rationalKey).join("|");
  }

  function rationalAbsLatex(value) {
    const n = Math.abs(value.n);
    if (value.d === 1) return String(n);
    return `\\frac{${n}}{${value.d}}`;
  }

  function radicalTermLatex(coefficient, radical) {
    const n = Math.abs(coefficient.n);
    if (coefficient.d === 1) return `${n === 1 ? "" : n}\\sqrt{${radical}}`;
    return `\\frac{${n === 1 ? "" : n}\\sqrt{${radical}}}{${coefficient.d}}`;
  }

  function exactLatex(value, undefinedText = "undefined") {
    if (value?.undefined) return `\\text{${undefinedText}}`;
    const parts = [
      [value.r, null],
      [value.sqrt2, 2],
      [value.sqrt3, 3],
      [value.sqrt6, 6]
    ].filter(([coefficient]) => !isZeroRational(coefficient));
    if (!parts.length) return "0";
    return parts.map(([coefficient, radical], index) => {
      const body = radical ? radicalTermLatex(coefficient, radical) : rationalAbsLatex(coefficient);
      if (index === 0) return coefficient.n < 0 ? `-${body}` : body;
      return coefficient.n < 0 ? `-${body}` : `+${body}`;
    }).join("");
  }

  function normalizeDegrees(degrees) {
    return ((Math.round(degrees) % 360) + 360) % 360;
  }

  function angleFromDegrees(degrees) {
    const normalized = normalizeDegrees(degrees);
    const coefficient = rational(normalized, 180);
    const axis = normalized === 0 ? "positive-x" : normalized === 90 ? "positive-y" : normalized === 180 ? "negative-x" : normalized === 270 ? "negative-y" : null;
    const quadrant = axis ? null : normalized < 90 ? 1 : normalized < 180 ? 2 : normalized < 270 ? 3 : 4;
    const referenceDegrees = axis
      ? (normalized === 90 || normalized === 270 ? 90 : 0)
      : quadrant === 1 ? normalized : quadrant === 2 ? 180 - normalized : quadrant === 3 ? normalized - 180 : 360 - normalized;
    return {
      piNumerator: coefficient.n,
      piDenominator: coefficient.d,
      normalizedRadians: coefficient,
      degrees: normalized,
      quadrant,
      axis,
      referenceAngle: rational(referenceDegrees, 180),
      referenceDegrees
    };
  }

  const STANDARD_DEGREES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const STANDARD_ANGLES = STANDARD_DEGREES.map(angleFromDegrees);
  const FIRST_QUADRANT = [30, 45, 60].map(angleFromDegrees);
  const AXIS_ANGLES = [0, 90, 180, 270].map(angleFromDegrees);

  function angleKey(angle) {
    return `angle:${angle.piNumerator}/${angle.piDenominator}`;
  }

  function angleLatex(angle) {
    const n = angle.piNumerator;
    const d = angle.piDenominator;
    if (n === 0) return "0";
    if (d === 1) return n === 1 ? "\\pi" : `${n}\\pi`;
    return `\\frac{${n === 1 ? "" : n}\\pi}{${d}}`;
  }

  function degreesLatex(degrees) {
    return `${degrees}^{\\circ}`;
  }

  function trigValues(angle) {
    const reference = angle.referenceDegrees;
    const base = {
      0: { sin: ZERO, cos: ONE, tan: ZERO },
      30: { sin: exact(rational(1, 2)), cos: exact(0, 0, rational(1, 2)), tan: exact(0, 0, rational(1, 3)) },
      45: { sin: exact(0, rational(1, 2)), cos: exact(0, rational(1, 2)), tan: ONE },
      60: { sin: exact(0, 0, rational(1, 2)), cos: exact(rational(1, 2)), tan: exact(0, 0, 1) },
      90: { sin: ONE, cos: ZERO, tan: { undefined: true } }
    }[reference];
    const sinNegative = angle.degrees > 180;
    const cosNegative = angle.degrees > 90 && angle.degrees < 270;
    const sin = sinNegative ? negateExact(base.sin) : base.sin;
    const cos = cosNegative ? negateExact(base.cos) : base.cos;
    let tan = base.tan;
    if (!tan.undefined && ((angle.quadrant === 2) || (angle.quadrant === 4))) tan = negateExact(tan);
    return { sin, cos, tan };
  }

  function answer(latex, key, value = null) {
    return { latex, key, value };
  }

  function exactAnswer(value, t) {
    return answer(exactLatex(value, t.undefined), `exact:${exactKey(value)}`, value);
  }

  function angleAnswer(angle) {
    return answer(angleLatex(angle), angleKey(angle), angle);
  }

  function degreeAnswer(degrees) {
    return answer(degreesLatex(degrees), `degree:${degrees}`, degrees);
  }

  function coordinateAnswer(angle, t) {
    const values = trigValues(angle);
    return answer(`\\left(${exactLatex(values.cos, t.undefined)},${exactLatex(values.sin, t.undefined)}\\right)`, `coordinate:${exactKey(values.cos)}:${exactKey(values.sin)}`, { x: values.cos, y: values.sin });
  }

  function textAnswer(key, label) {
    return answer(`\\text{${label}}`, `text:${key}`, key);
  }

  function angleSetAnswer(angles) {
    const clean = [...angles].sort((a, b) => a.degrees - b.degrees);
    return answer(`\\left\\{${clean.map(angleLatex).join(",")}\\right\\}`, `angle-set:${clean.map(angleKey).join("|")}`, clean);
  }

  function uniqueAnswers(values, correct) {
    const seen = new Map();
    values.filter(Boolean).forEach(item => {
      if (item.key !== correct.key && !seen.has(item.key)) seen.set(item.key, item);
    });
    return [...seen.values()];
  }

  function fillFromPool(correct, preferred, pool) {
    return uniqueAnswers([...preferred, ...pool], correct).slice(0, 6);
  }

  function exactPool(t) {
    return [
      { undefined: true }, ZERO, ONE, negateExact(ONE),
      exact(rational(1, 2)), exact(rational(-1, 2)),
      exact(0, rational(1, 2)), exact(0, rational(-1, 2)),
      exact(0, 0, rational(1, 2)), exact(0, 0, rational(-1, 2)),
      exact(0, 0, rational(1, 3)), exact(0, 0, rational(-1, 3)),
      exact(0, 0, 1), exact(0, 0, -1)
    ].map(value => exactAnswer(value, t));
  }

  function exactDistractors(correctValue, preferred, t) {
    const correct = exactAnswer(correctValue, t);
    const shifts = [1, -1, 2, -2].map(offset => exactAnswer(addExact(correctValue.undefined ? ZERO : correctValue, exact(offset)), t));
    return fillFromPool(correct, [...preferred.map(value => exactAnswer(value, t)), ...shifts, exactAnswer(correctValue.undefined ? ZERO : negateExact(correctValue), t)], exactPool(t));
  }

  function angleDistractors(correct, preferred = []) {
    return fillFromPool(correct, preferred.map(angleAnswer), STANDARD_ANGLES.map(angleAnswer));
  }

  function degreeDistractors(correct, preferred = []) {
    const pool = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].map(degreeAnswer);
    return fillFromPool(correct, preferred.map(degreeAnswer), pool);
  }

  function coordinateDistractors(correct, preferred, t) {
    return fillFromPool(correct, preferred.map(angle => coordinateAnswer(angle, t)), STANDARD_ANGLES.map(angle => coordinateAnswer(angle, t)));
  }

  function tag(type, builder) {
    builder.__type = type;
    return builder;
  }

  const copy = {
    en: {
      toolBadge: "Precalculus",
      title: "Unit Circle & Trigonometric Values Practice",
      subtitle: "Connect angles, unit-circle coordinates, reference angles, and exact sine, cosine, and tangent values.",
      note: "All answers use exact values. Undefined tangent values are never replaced by decimal approximations.",
      questionTitle: "Use the unit circle and choose the exact answer.",
      promptConvert: "Convert between degrees and radians.",
      promptReference: "Find the reference angle.",
      promptQuadrant: "Identify the angle's location.",
      promptVisualAngle: "Identify the angle represented by the highlighted radius.",
      promptCoordinate: "Find the unit-circle coordinate.",
      promptExact: "Evaluate the trigonometric function exactly.",
      promptAngleSet: "Find every angle in the stated interval.",
      promptExpression: "Evaluate the expression exactly.",
      difficultyOptions: {
        easy: "Easy: conversions, axes, quadrants, and reference angles",
        medium: "Medium: first-quadrant coordinates and exact values",
        hard: "Hard: all quadrants, reverse lookup, and undefined tangent",
        expert: "Expert: exact expressions and multi-condition reasoning",
        mixed: "Mixed: balanced unit-circle practice"
      },
      undefined: "undefined",
      quadrantLabels: { q1: "Quadrant I", q2: "Quadrant II", q3: "Quadrant III", q4: "Quadrant IV", px: "positive x-axis", py: "positive y-axis", nx: "negative x-axis", ny: "negative y-axis", axis: "on an axis", none: "no quadrant" },
      suggestions: {
        convert: "Use 180° = π radians, then reduce the fraction.",
        reference: "Find the quadrant first, then measure the acute angle to the x-axis.",
        coordinate: "A unit-circle point has coordinates (cos θ, sin θ).",
        exact: "Use the reference angle for the magnitude and the quadrant for the sign.",
        tangent: "Compute tan θ = sin θ / cos θ and check whether cos θ is zero.",
        reverse: "Match the exact value to a reference angle, then use its sign to find every valid quadrant.",
        expression: "Evaluate each unit-circle value exactly before combining the terms."
      },
      notes: { conversion: "use 180° = π radians", reduce: "reduce", quadrant: "identify the quadrant", reference: "find the reference angle", coordinate: "use (cos θ, sin θ)", sign: "apply the quadrant sign", tangent: "divide sine by cosine", combine: "combine exact values", final: "exact result" },
      visualAlt: degrees => `Unit circle with the radius at ${degrees} degrees highlighted.`
    },
    zh: {
      toolBadge: "预备微积分",
      title: "单位圆与三角函数专项练习",
      subtitle: "建立角度、单位圆坐标、参考角以及正弦、余弦和正切精确值之间的联系。",
      note: "所有答案均使用精确形式；正切未定义时不会使用小数或近似值代替。",
      questionTitle: "使用单位圆并选择精确答案。",
      promptConvert: "在角度制与弧度制之间转换。",
      promptReference: "求参考角。",
      promptQuadrant: "判断角所在的位置。",
      promptVisualAngle: "判断高亮半径所表示的角。",
      promptCoordinate: "求单位圆上的坐标。",
      promptExact: "精确计算三角函数值。",
      promptAngleSet: "找出给定区间内的所有角。",
      promptExpression: "精确计算表达式。",
      difficultyOptions: {
        easy: "简单：角度换算、坐标轴、象限与参考角",
        medium: "中等：第一象限坐标与精确值",
        hard: "困难：四象限、反向辨认与正切未定义",
        expert: "专家：精确表达式与多条件推理",
        mixed: "混合：均衡单位圆练习"
      },
      undefined: "未定义",
      quadrantLabels: { q1: "第一象限", q2: "第二象限", q3: "第三象限", q4: "第四象限", px: "x 轴正半轴", py: "y 轴正半轴", nx: "x 轴负半轴", ny: "y 轴负半轴", axis: "位于坐标轴上", none: "不属于任何象限" },
      suggestions: {
        convert: "使用 180° = π 弧度，再把分数约到最简。",
        reference: "先判断象限，再求角与 x 轴之间的锐角。",
        coordinate: "单位圆上的点坐标为 (cos θ, sin θ)。",
        exact: "先用参考角确定绝对值，再根据象限确定符号。",
        tangent: "计算 tan θ = sin θ / cos θ，并检查 cos θ 是否为零。",
        reverse: "先由精确值确定参考角，再根据符号找出所有符合的象限。",
        expression: "先分别求出每个单位圆精确值，再进行合并。"
      },
      notes: { conversion: "使用 180° = π 弧度", reduce: "约分", quadrant: "判断象限", reference: "求参考角", coordinate: "使用 (cos θ, sin θ)", sign: "根据象限确定符号", tangent: "用正弦除以余弦", combine: "合并精确值", final: "精确结果" },
      visualAlt: degrees => `单位圆中高亮了 ${degrees}° 方向的半径。`
    }
  };

  function lang() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function tr() {
    return copy[lang()];
  }

  function locationKey(angle) {
    if (angle.quadrant) return `q${angle.quadrant}`;
    return { "positive-x": "px", "positive-y": "py", "negative-x": "nx", "negative-y": "ny" }[angle.axis];
  }

  function makeVisual(angle, extras = {}) {
    const t = tr();
    return { type: "unit-circle", degrees: angle.degrees, alt: t.visualAlt(angle.degrees), showReference: Boolean(extras.showReference), showCoordinateLabel: Boolean(extras.showCoordinateLabel) };
  }

  function makeQuestion(type, promptKey, main, correct, distractors, lines, suggestion, audit, visual = null) {
    return { type, promptKey, main, plain: main, answer: correct, distractors: uniqueAnswers(distractors, correct), lines, suggestion, audit, visual };
  }

  function degreeRadianQuestion(h) {
    const t = tr();
    const angle = h.choice(STANDARD_ANGLES.filter(item => item.degrees !== 0));
    const toRadians = h.choice([true, false]);
    if (toRadians) {
      const correct = angleAnswer(angle);
      const preferred = [angleFromDegrees(180 - angle.degrees), angleFromDegrees(360 - angle.degrees), angleFromDegrees(angle.degrees / 2)];
      return makeQuestion("trig-degree-radian", "promptConvert", `${degreesLatex(angle.degrees)}\\longrightarrow ?`, correct, angleDistractors(correct, preferred), [
        { line: `${angle.degrees}^{\\circ}\\cdot\\frac{\\pi}{180^{\\circ}}`, note: t.notes.conversion },
        { line: angleLatex(angle), note: t.notes.reduce }
      ], t.suggestions.convert, { kind: "conversion", direction: "degree-to-radian", angle });
    }
    const correct = degreeAnswer(angle.degrees);
    return makeQuestion("trig-degree-radian", "promptConvert", `${angleLatex(angle)}\\longrightarrow ?`, correct, degreeDistractors(correct, [180 - angle.degrees, 360 - angle.degrees, angle.degrees / 2]), [
      { line: `${angleLatex(angle)}\\cdot\\frac{180^{\\circ}}{\\pi}`, note: t.notes.conversion },
      { line: degreesLatex(angle.degrees), note: t.notes.reduce }
    ], t.suggestions.convert, { kind: "conversion", direction: "radian-to-degree", angle });
  }

  function referenceAngleQuestion(h, visual = false) {
    const t = tr();
    const angle = h.choice(STANDARD_ANGLES.filter(item => !item.axis));
    const reference = angleFromDegrees(angle.referenceDegrees);
    const correct = angleAnswer(reference);
    const preferred = [angle, angleFromDegrees(180 - angle.referenceDegrees), angleFromDegrees(360 - angle.referenceDegrees)];
    return makeQuestion("trig-reference-angle", "promptReference", `\\theta=${angleLatex(angle)},\\quad\\theta_{\\mathrm{ref}}=?`, correct, angleDistractors(correct, preferred), [
      { line: `\\theta=${angleLatex(angle)}\\in\\mathrm{Q${angle.quadrant}}`, note: t.notes.quadrant },
      { line: `\\theta_{\\mathrm{ref}}=${angleLatex(reference)}`, note: t.notes.reference }
    ], t.suggestions.reference, { kind: "reference-angle", angle, reference }, visual ? makeVisual(angle, { showReference: true }) : null);
  }

  function quadrantQuestion(h) {
    const t = tr();
    const angle = h.choice(STANDARD_ANGLES);
    const key = locationKey(angle);
    const correct = textAnswer(key, t.quadrantLabels[key]);
    const poolKeys = ["q1", "q2", "q3", "q4", "px", "py", "nx", "ny", "axis", "none"];
    const pool = poolKeys.map(item => textAnswer(item, t.quadrantLabels[item]));
    return makeQuestion("trig-quadrant", "promptQuadrant", `\\theta=${angleLatex(angle)}`, correct, fillFromPool(correct, [], pool), [
      { line: `${angle.degrees}^{\\circ}`, note: t.notes.conversion },
      { line: correct.latex, note: t.notes.quadrant }
    ], t.suggestions.reference, { kind: "quadrant", angle, location: key });
  }

  function visualAngleQuestion(h, pool = AXIS_ANGLES) {
    const t = tr();
    const angle = h.choice(pool);
    const correct = angleAnswer(angle);
    return makeQuestion("trig-angle-from-value", "promptVisualAngle", `0\\leq\\theta<2\\pi`, correct, angleDistractors(correct), [
      { line: `${degreesLatex(angle.degrees)}=${angleLatex(angle)}`, note: t.notes.conversion },
      { line: angleLatex(angle), note: t.notes.final }
    ], t.suggestions.reverse, { kind: "visual-angle", angle }, makeVisual(angle));
  }

  function exactTrigQuestion(h, anglePool, visual = false, forcedFunction = null) {
    const t = tr();
    const angle = h.choice(anglePool);
    const fn = forcedFunction || h.choice(["sin", "cos", "tan"]);
    const values = trigValues(angle);
    const value = values[fn];
    const correct = exactAnswer(value, t);
    const preferred = [values.sin, values.cos, values.tan, value.undefined ? ZERO : negateExact(value)];
    const functionLatex = `\\${fn}\\left(${angleLatex(angle)}\\right)`;
    const lines = [
      { line: `\\theta_{\\mathrm{ref}}=${angleLatex(angleFromDegrees(angle.referenceDegrees))}`, note: t.notes.reference },
      { line: `\\left(\\cos\\theta,\\sin\\theta\\right)=${coordinateAnswer(angle, t).latex}`, note: t.notes.coordinate }
    ];
    if (fn === "tan") lines.push({ line: `\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}=${correct.latex}`, note: t.notes.tangent });
    else lines.push({ line: `${functionLatex}=${correct.latex}`, note: t.notes.sign });
    return makeQuestion(`trig-exact-${fn === "sin" ? "sine" : fn === "cos" ? "cosine" : "tangent"}`, "promptExact", functionLatex, correct, exactDistractors(value, preferred, t), lines, fn === "tan" ? t.suggestions.tangent : t.suggestions.exact, { kind: "exact-trig", angle, fn, value }, visual ? makeVisual(angle, { showReference: true }) : null);
  }

  function coordinateQuestion(h, anglePool, visual = false) {
    const t = tr();
    const angle = h.choice(anglePool);
    const correct = coordinateAnswer(angle, t);
    const oppositeX = angleFromDegrees(180 - angle.degrees);
    const oppositeY = angleFromDegrees(360 - angle.degrees);
    const swapped = angleFromDegrees(90 - angle.degrees);
    return makeQuestion("trig-unit-circle-coordinate", "promptCoordinate", `\\theta=${angleLatex(angle)},\\quad P(\\theta)=?`, correct, coordinateDistractors(correct, [oppositeX, oppositeY, swapped], t), [
      { line: `P(\\theta)=\\left(\\cos\\theta,\\sin\\theta\\right)`, note: t.notes.coordinate },
      { line: correct.latex, note: t.notes.sign }
    ], t.suggestions.coordinate, { kind: "coordinate", angle, coordinate: correct.value }, visual ? makeVisual(angle, { showReference: true }) : null);
  }

  function angleSetQuestion(h, expert = false) {
    const t = tr();
    const fn = h.choice(expert ? ["sin", "cos", "tan"] : ["sin", "cos"]);
    const sourceAngle = h.choice(STANDARD_ANGLES.filter(angle => !angle.axis || fn !== "tan"));
    const target = trigValues(sourceAngle)[fn];
    const matches = STANDARD_ANGLES.filter(angle => exactKey(trigValues(angle)[fn]) === exactKey(target));
    const correct = angleSetAnswer(matches);
    const alternatives = [
      angleSetAnswer([sourceAngle]),
      angleSetAnswer(STANDARD_ANGLES.filter(angle => exactKey(trigValues(angle)[fn]) === exactKey(target.undefined ? ZERO : negateExact(target)))),
      angleSetAnswer(matches.map(angle => angleFromDegrees(360 - angle.degrees))),
      angleSetAnswer(matches.map(angle => angleFromDegrees(180 - angle.degrees))),
      angleSetAnswer([...matches, angleFromDegrees(sourceAngle.degrees + 90)]),
      angleSetAnswer(matches.slice(0, 1))
    ];
    const main = `\\${fn}\\theta=${exactLatex(target, t.undefined)},\\quad 0\\leq\\theta<2\\pi`;
    return makeQuestion("trig-angle-set", "promptAngleSet", main, correct, fillFromPool(correct, alternatives, STANDARD_ANGLES.map(angle => angleSetAnswer([angle]))), [
      { line: `\\theta_{\\mathrm{ref}}=${angleLatex(angleFromDegrees(sourceAngle.referenceDegrees))}`, note: t.notes.reference },
      { line: correct.latex, note: t.notes.sign }
    ], t.suggestions.reverse, { kind: "angle-set", fn, target, matches });
  }

  function conditionAngleQuestion(h, visual = false) {
    const t = tr();
    const angle = h.choice(STANDARD_ANGLES.filter(item => !item.axis));
    const values = trigValues(angle);
    const sinSign = values.sin.r.n < 0 || values.sin.sqrt2.n < 0 || values.sin.sqrt3.n < 0 ? "<0" : ">0";
    const cosSign = values.cos.r.n < 0 || values.cos.sqrt2.n < 0 || values.cos.sqrt3.n < 0 ? "<0" : ">0";
    const reference = angleFromDegrees(angle.referenceDegrees);
    const correct = angleAnswer(angle);
    const preferred = [angleFromDegrees(180 - angle.degrees), angleFromDegrees(360 - angle.degrees), angleFromDegrees(angle.degrees + 180)];
    const main = `\\theta_{\\mathrm{ref}}=${angleLatex(reference)},\\quad\\sin\\theta${sinSign},\\quad\\cos\\theta${cosSign}`;
    return makeQuestion("trig-angle-from-value", "promptAngleSet", main, correct, angleDistractors(correct, preferred), [
      { line: `\\sin\\theta${sinSign},\\quad\\cos\\theta${cosSign}`, note: t.notes.quadrant },
      { line: `\\theta=${angleLatex(angle)}`, note: t.notes.reference }
    ], t.suggestions.reverse, { kind: "condition-angle", angle, reference, sinSign, cosSign }, visual ? makeVisual(angle, { showReference: true }) : null);
  }

  function exactExpressionQuestion(h, visual = false, threeTerms = false) {
    const t = tr();
    const angle = h.choice(STANDARD_ANGLES.filter(item => !item.axis));
    const functions = h.shuffle(["sin", "cos", "tan"]);
    const terms = functions.slice(0, threeTerms ? 3 : 2).map((fn, index) => ({ fn, coefficient: index === 0 ? h.choice([1, 2, -2]) : h.choice([1, -1, 2]), value: trigValues(angle)[fn] }));
    if (terms.some(term => term.value.undefined)) return exactExpressionQuestion(h, visual, threeTerms);
    const result = terms.reduce((sum, item) => addExact(sum, scaleExact(item.value, item.coefficient)), ZERO);
    const termLatex = item => `${item.coefficient === 1 ? "" : item.coefficient === -1 ? "-" : item.coefficient}\\${item.fn}\\left(${angleLatex(angle)}\\right)`;
    const main = terms.map((item, index) => `${index && item.coefficient > 0 ? "+" : ""}${termLatex(item)}`).join("");
    const preferred = [
      terms.reduce((sum, item) => addExact(sum, item.value), ZERO),
      terms.reduce((sum, item) => addExact(sum, scaleExact(item.value, -item.coefficient)), ZERO),
      addExact(scaleExact(terms[0].value, terms[0].coefficient), scaleExact(terms[1].value, -terms[1].coefficient))
    ];
    const correct = exactAnswer(result, t);
    return makeQuestion("trig-exact-expression", "promptExpression", main, correct, exactDistractors(result, preferred, t), [
      ...terms.map(item => ({ line: `\\${item.fn}\\left(${angleLatex(angle)}\\right)=${exactLatex(item.value, t.undefined)}`, note: t.notes.coordinate })),
      { line: `${main}=${correct.latex}`, note: t.notes.combine }
    ], t.suggestions.expression, { kind: "exact-expression", angle, terms, result }, visual ? makeVisual(angle, { showReference: true }) : null);
  }

  function unitCircleSvg(visual, report = false) {
    const degrees = normalizeDegrees(visual.degrees);
    const radians = degrees * Math.PI / 180;
    const cx = 160 + 112 * Math.cos(radians);
    const cy = 160 - 112 * Math.sin(radians);
    const pointX = cx.toFixed(2);
    const pointY = cy.toFixed(2);
    const alt = String(visual.alt || "Unit circle").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    return `<svg class="mcl-unit-circle${report ? " mcl-unit-circle--report" : ""}" viewBox="0 0 320 320" role="img" aria-label="${alt}">
      <style>
        .mcl-unit-circle .uc-axis{stroke:var(--mcl-text-soft,#5b6b7f);stroke-width:1.7}.mcl-unit-circle .uc-circle{fill:var(--mcl-surface,#fff);stroke:var(--mcl-border,#cbd5e1);stroke-width:2.5}.mcl-unit-circle .uc-guide{stroke:var(--mcl-teal,#0f8f88);stroke-width:1.7;stroke-dasharray:6 6;opacity:.82}.mcl-unit-circle .uc-radius{stroke:var(--mcl-accent,#2f67d8);stroke-width:4;stroke-linecap:round}.mcl-unit-circle .uc-point{fill:var(--mcl-teal,#0f8f88);stroke:var(--mcl-surface,#fff);stroke-width:4}.mcl-unit-circle .uc-origin{fill:var(--mcl-text,#10233f)}.mcl-unit-circle text{fill:var(--mcl-text-soft,#5b6b7f);font:600 15px Inter,system-ui,sans-serif}
      </style>
      <circle class="uc-circle" cx="160" cy="160" r="112" />
      <path class="uc-axis" d="M28 160H292M160 28V292" />
      <path class="uc-axis" d="M286 154l8 6-8 6M154 34l6-8 6 8" />
      <path class="uc-guide" d="M${pointX} ${pointY}V160M${pointX} ${pointY}H160" />
      <path class="uc-radius" d="M160 160L${pointX} ${pointY}" />
      <circle class="uc-origin" cx="160" cy="160" r="3.5" />
      <circle class="uc-point" cx="${pointX}" cy="${pointY}" r="7" />
      <text x="292" y="151">x</text><text x="169" y="29">y</text>
    </svg>`;
  }

  function renderVisual(container, visual) {
    if (!container || visual?.type !== "unit-circle") return;
    container.innerHTML = unitCircleSvg(visual, false);
  }

  function renderReportVisual(visual) {
    return visual?.type === "unit-circle" ? unitCircleSvg(visual, true) : "";
  }

  const builders = {
    easy: [
      tag("trig-degree-radian", degreeRadianQuestion),
      tag("trig-reference-angle", h => referenceAngleQuestion(h, false)),
      tag("trig-quadrant", quadrantQuestion),
      tag("trig-angle-from-value", h => visualAngleQuestion(h, AXIS_ANGLES)),
      tag("trig-exact-sine", h => exactTrigQuestion(h, AXIS_ANGLES, true, "sin"))
    ],
    medium: [
      tag("trig-degree-radian", degreeRadianQuestion),
      tag("trig-exact-sine", h => exactTrigQuestion(h, FIRST_QUADRANT, false, "sin")),
      tag("trig-exact-cosine", h => exactTrigQuestion(h, FIRST_QUADRANT, false, "cos")),
      tag("trig-exact-tangent", h => exactTrigQuestion(h, FIRST_QUADRANT, true, "tan")),
      tag("trig-unit-circle-coordinate", h => coordinateQuestion(h, FIRST_QUADRANT, true)),
      tag("trig-unit-circle-coordinate", h => coordinateQuestion(h, FIRST_QUADRANT, false))
    ],
    hard: [
      tag("trig-reference-angle", h => referenceAngleQuestion(h, false)),
      tag("trig-exact-tangent", h => exactTrigQuestion(h, STANDARD_ANGLES, false, "tan")),
      tag("trig-unit-circle-coordinate", h => coordinateQuestion(h, STANDARD_ANGLES, true)),
      tag("trig-angle-set", h => angleSetQuestion(h, false)),
      tag("trig-angle-from-value", h => visualAngleQuestion(h, STANDARD_ANGLES))
    ],
    expert: [
      tag("trig-exact-expression", h => exactExpressionQuestion(h, false, false)),
      tag("trig-exact-expression", h => exactExpressionQuestion(h, true, false)),
      tag("trig-angle-from-value", h => conditionAngleQuestion(h, false)),
      tag("trig-angle-set", h => angleSetQuestion(h, true)),
      tag("trig-exact-expression", h => exactExpressionQuestion(h, true, true))
    ]
  };

  window.MCLUnitCircleMath = {
    rational,
    exact,
    addExact,
    scaleExact,
    multiplyExact,
    exactKey,
    exactLatex,
    angleFromDegrees,
    angleKey,
    angleLatex,
    trigValues,
    unitCircleSvg,
    STANDARD_ANGLES,
    builders
  };

  window.MCLQuizTool = {
    gameId: "unit-circle-trigonometry",
    course: "precalculus",
    text: copy,
    builders,
    balancedMixed: true,
    avoidConsecutiveTypes: true,
    renderVisual,
    renderReportVisual
  };
})();
