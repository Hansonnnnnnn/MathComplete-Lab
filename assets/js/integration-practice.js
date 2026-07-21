(function () {
  "use strict";

  function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function rational(numerator, denominator = 1) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) throw new Error("Invalid rational number");
    let n = Math.trunc(numerator);
    let d = Math.trunc(denominator);
    if (d < 0) { n = -n; d = -d; }
    const factor = gcd(n, d);
    return { numerator: n / factor, denominator: d / factor };
  }

  const addRational = (a, b) => rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
  const subtractRational = (a, b) => rational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
  const multiplyRational = (a, b) => rational(a.numerator * b.numerator, a.denominator * b.denominator);
  const divideRational = (a, b) => rational(a.numerator * b.denominator, a.denominator * b.numerator);
  const negateRational = value => rational(-value.numerator, value.denominator);
  const isZero = value => value.numerator === 0;

  function rationalKey(value) {
    const item = rational(value.numerator, value.denominator);
    return `${item.numerator}/${item.denominator}`;
  }

  function rationalLatex(value) {
    const item = rational(value.numerator, value.denominator);
    if (item.denominator === 1) return String(item.numerator);
    const body = `\\frac{${Math.abs(item.numerator)}}{${item.denominator}}`;
    return item.numerator < 0 ? `-${body}` : body;
  }

  function term(coefficient, power) {
    return { coefficient: typeof coefficient === "number" ? rational(coefficient) : rational(coefficient.numerator, coefficient.denominator), power };
  }

  function normalizePolynomial(terms) {
    const map = new Map();
    terms.forEach(item => {
      if (!item || isZero(item.coefficient)) return;
      const previous = map.get(item.power) || rational(0);
      map.set(item.power, addRational(previous, item.coefficient));
    });
    return [...map.entries()]
      .map(([power, coefficient]) => term(coefficient, Number(power)))
      .filter(item => !isZero(item.coefficient))
      .sort((a, b) => b.power - a.power);
  }

  function polynomial(terms) {
    return normalizePolynomial(terms);
  }

  function polynomialKey(terms) {
    return normalizePolynomial(terms).map(item => `${item.power}:${rationalKey(item.coefficient)}`).join("|") || "zero";
  }

  function variablePower(variable, power) {
    if (power === 0) return "";
    if (power === 1) return variable;
    return `${variable}^{${power}}`;
  }

  function polynomialLatex(terms, variable = "x") {
    const clean = normalizePolynomial(terms);
    if (!clean.length) return "0";
    return clean.map((item, index) => {
      const negative = item.coefficient.numerator < 0;
      const absolute = rational(Math.abs(item.coefficient.numerator), item.coefficient.denominator);
      const variablePart = variablePower(variable, item.power);
      let body;
      if (!variablePart) body = rationalLatex(absolute);
      else if (absolute.numerator === absolute.denominator) body = variablePart;
      else body = `${rationalLatex(absolute)}${variablePart}`;
      if (index === 0) return negative ? `-${body}` : body;
      return negative ? `-${body}` : `+${body}`;
    }).join("");
  }

  function integratePolynomial(terms) {
    return normalizePolynomial(terms).map(item => {
      if (item.power === -1) throw new Error("x^-1 requires a logarithm template");
      const nextPower = item.power + 1;
      return term(divideRational(item.coefficient, rational(nextPower)), nextPower);
    });
  }

  function differentiatePolynomial(terms) {
    return normalizePolynomial(terms)
      .filter(item => item.power !== 0)
      .map(item => term(multiplyRational(item.coefficient, rational(item.power)), item.power - 1));
  }

  function integerPower(base, exponent) {
    if (exponent >= 0) return rational(base ** exponent);
    return rational(1, base ** Math.abs(exponent));
  }

  function evaluatePolynomial(terms, value) {
    return normalizePolynomial(terms).reduce((sum, item) => addRational(sum, multiplyRational(item.coefficient, integerPower(value, item.power))), rational(0));
  }

  function negatePolynomial(terms) {
    return normalizePolynomial(terms).map(item => term(negateRational(item.coefficient), item.power));
  }

  function answer(latex, key, model = null) {
    return { latex, key, model };
  }

  function polynomialAnswer(antiderivative, includeConstant = true) {
    const body = polynomialLatex(antiderivative);
    return answer(`${body}${includeConstant ? "+C" : ""}`, `poly:${polynomialKey(antiderivative)}:${includeConstant ? "C" : "no-C"}`, { kind: "polynomial", terms: antiderivative, includeConstant });
  }

  function numericAnswer(value) {
    const clean = rational(value.numerator, value.denominator);
    return answer(rationalLatex(clean), `rational:${rationalKey(clean)}`, { kind: "rational", value: clean });
  }

  function symbolicAnswer(latex, key, audit = null) {
    return answer(latex, `symbolic:${key}`, audit);
  }

  function uniqueAnswers(values, correct) {
    const seen = new Map();
    values.filter(Boolean).forEach(item => {
      if (item.key !== correct.key && !seen.has(item.key)) seen.set(item.key, item);
    });
    return [...seen.values()];
  }

  function numericDistractors(correctValue, candidateValues) {
    const correct = numericAnswer(correctValue);
    const values = [...candidateValues];
    for (let offset = 1; offset <= 8; offset++) {
      values.push(addRational(correctValue, rational(offset)));
      values.push(subtractRational(correctValue, rational(offset)));
    }
    return uniqueAnswers(values.map(numericAnswer), correct).slice(0, 6);
  }

  function tag(type, builder) {
    builder.__type = type;
    return builder;
  }

  function randomNonZero(h, min, max) {
    let value = 0;
    while (value === 0) value = h.randInt(min, max);
    return value;
  }

  function signedLinear(a, b, variable = "x") {
    const coefficient = a === 1 ? "" : a === -1 ? "-" : String(a);
    const constant = b === 0 ? "" : b < 0 ? `${b}` : `+${b}`;
    return `${coefficient}${variable}${constant}`;
  }

  function scaledBody(coefficient, body) {
    const value = rational(coefficient.numerator, coefficient.denominator);
    if (value.numerator === value.denominator) return body;
    if (value.numerator === -value.denominator) return `-${body}`;
    return `${rationalLatex(value)}${body}`;
  }

  const text = {
    en: {
      toolBadge: "Single Variable Calculus",
      title: "Integration Practice",
      subtitle: "Build fluency with antiderivatives, exact definite integrals, the Fundamental Theorem of Calculus, and one-step substitution.",
      note: "Indefinite integrals include +C. Definite integrals use exact simplified values; no decimal approximations are used.",
      questionTitle: "Evaluate the integral and choose the exact simplified answer.",
      promptIndefinite: "Find the most general antiderivative.",
      promptDefinite: "Evaluate the definite integral exactly.",
      promptSubstitution: "Use a substitution, then integrate and simplify.",
      promptFtc: "Apply the Fundamental Theorem of Calculus.",
      difficultyOptions: {
        easy: "Easy: power rule and polynomial antiderivatives",
        medium: "Medium: common functions and simple definite integrals",
        hard: "Hard: the Fundamental Theorem and one-step substitution",
        expert: "Expert: multi-step exact integration",
        mixed: "Mixed: balanced practice from all four levels"
      },
      suggestions: {
        power: "Increase the exponent by 1, divide by the new exponent, and include +C.",
        common: "Identify the function family first, then check the sign, coefficient, and +C.",
        definite: "Find an antiderivative and compute F(b) - F(a); a definite integral does not include +C.",
        substitution: "Choose the inner expression as u and account for its derivative before integrating.",
        ftc: "The derivative of an accumulation integral returns the integrand at the upper limit; apply the chain rule when that limit is a function."
      },
      notes: {
        given: "given integral",
        rule: "apply the integration rule term by term",
        constant: "include the constant of integration",
        antiderivative: "find an antiderivative",
        evaluate: "compute F(b) - F(a)",
        substitution: "choose the inner expression as u",
        replace: "rewrite and integrate in u",
        back: "substitute back and include +C",
        ftc: "apply the Fundamental Theorem of Calculus",
        chain: "multiply by the derivative of the upper limit"
      }
    },
    zh: {
      toolBadge: "一元微积分",
      title: "一元积分专项练习",
      subtitle: "练习原函数、精确定积分、微积分基本定理以及一步换元积分。",
      note: "不定积分必须包含 +C；定积分使用精确最简值，不使用小数近似。",
      questionTitle: "计算积分，并选择精确且已化简的答案。",
      promptIndefinite: "求最一般的原函数。",
      promptDefinite: "精确计算定积分。",
      promptSubstitution: "使用换元法计算并化简。",
      promptFtc: "应用微积分基本定理。",
      difficultyOptions: {
        easy: "简单：幂函数法则与多项式原函数",
        medium: "中等：常见函数与简单定积分",
        hard: "困难：微积分基本定理与一步换元",
        expert: "专家：多步骤精确积分",
        mixed: "混合：均衡覆盖四档难度"
      },
      suggestions: {
        power: "先把指数加 1，再除以新的指数，并补上 +C。",
        common: "先判断函数类型，再检查符号、系数和积分常数 +C。",
        definite: "先求原函数，再计算 F(b)-F(a)；定积分答案不含 +C。",
        substitution: "把内层表达式设为 u，并在积分前处理好它的导数系数。",
        ftc: "变上限积分求导后得到上限处的被积函数；若上限是函数，还要使用链式法则。"
      },
      notes: {
        given: "原积分",
        rule: "逐项应用积分法则",
        constant: "补上积分常数",
        antiderivative: "求一个原函数",
        evaluate: "计算 F(b)-F(a)",
        substitution: "把内层表达式设为 u",
        replace: "改写为关于 u 的积分并计算",
        back: "代回原变量并补上 +C",
        ftc: "应用微积分基本定理",
        chain: "乘以上限函数的导数"
      }
    }
  };

  function activeText() {
    return text[localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en"];
  }

  function makeQuestion(type, promptKey, main, correct, distractors, lines, suggestion, audit) {
    return { type, promptKey, main, plain: main, answer: correct, distractors: uniqueAnswers(distractors, correct), lines, suggestion, audit };
  }

  function polynomialDistractors(integrand, antiderivative) {
    const correct = polynomialAnswer(antiderivative, true);
    const noDivision = integrand.map(item => term(item.coefficient, item.power + 1));
    const unchanged = polynomialAnswer(integrand, true);
    const derivative = polynomialAnswer(differentiatePolynomial(integrand), true);
    const wrongFirst = antiderivative.map((item, index) => index === 0 ? term(addRational(item.coefficient, rational(1)), item.power) : item);
    return uniqueAnswers([
      polynomialAnswer(antiderivative, false),
      polynomialAnswer(noDivision, true),
      unchanged,
      derivative,
      polynomialAnswer(negatePolynomial(antiderivative), true),
      polynomialAnswer(wrongFirst, true),
      symbolicAnswer(`${polynomialLatex(integrand)}+C`, `unchanged:${polynomialKey(integrand)}`),
      symbolicAnswer(`${polynomialLatex(noDivision)}`, `no-division-no-c:${polynomialKey(noDivision)}`)
    ], correct);
  }

  function randomPolynomial(h, count, powers, coefficientRange = 7) {
    const selected = h.shuffle([...powers]).slice(0, count);
    return polynomial(selected.map(power => term(randomNonZero(h, -coefficientRange, coefficientRange), power)));
  }

  function indefinitePolynomialQuestion(h, type, termCount, powers) {
    const t = activeText();
    const integrand = randomPolynomial(h, termCount, powers);
    const antiderivative = integratePolynomial(integrand);
    const correct = polynomialAnswer(antiderivative, true);
    const main = `\\int \\left(${polynomialLatex(integrand)}\\right)\\,dx`;
    return makeQuestion(type, "promptIndefinite", main, correct, polynomialDistractors(integrand, antiderivative), [
      { line: main, note: t.notes.given },
      { line: polynomialLatex(antiderivative), note: t.notes.rule },
      { line: correct.latex, note: t.notes.constant }
    ], t.suggestions.power, { kind: "polynomial-indefinite", integrand, antiderivative });
  }

  function simpleDefiniteQuestion(h, reverse = false) {
    const t = activeText();
    let integrand;
    let antiderivative;
    let lower;
    let upper;
    let result;
    for (let attempt = 0; attempt < 80; attempt++) {
      integrand = randomPolynomial(h, h.randInt(2, 3), [0, 1, 2, 3], 5);
      antiderivative = integratePolynomial(integrand);
      lower = h.randInt(-3, 1);
      upper = h.randInt(lower + 1, 4);
      if (reverse) [lower, upper] = [upper, lower];
      result = subtractRational(evaluatePolynomial(antiderivative, upper), evaluatePolynomial(antiderivative, lower));
      if (!isZero(result) && result.denominator <= 36 && Math.abs(result.numerator / result.denominator) <= 100) break;
    }
    const correct = numericAnswer(result);
    const atUpper = evaluatePolynomial(antiderivative, upper);
    const atLower = evaluatePolynomial(antiderivative, lower);
    const distractors = numericDistractors(result, [
      atUpper,
      atLower,
      subtractRational(atLower, atUpper),
      addRational(atUpper, atLower),
      negateRational(result)
    ]);
    const main = `\\int_{${lower}}^{${upper}} \\left(${polynomialLatex(integrand)}\\right)\\,dx`;
    return makeQuestion("integral-definite", "promptDefinite", main, correct, distractors, [
      { line: main, note: t.notes.given },
      { line: `F(x)=${polynomialLatex(antiderivative)}`, note: t.notes.antiderivative },
      { line: `F(${upper})-F(${lower})=${rationalLatex(atUpper)}-\\left(${rationalLatex(atLower)}\\right)`, note: t.notes.evaluate },
      { line: correct.latex, note: t.notes.evaluate }
    ], t.suggestions.definite, { kind: "polynomial-definite", integrand, antiderivative, lower, upper, result });
  }

  function commonFunctionQuestion(h, family) {
    const t = activeText();
    const coefficient = randomNonZero(h, -8, 8);
    let integrand;
    let correct;
    let distractors;
    if (family === "exponential") {
      integrand = scaledBody(rational(coefficient), "e^x");
      correct = symbolicAnswer(`${integrand}+C`, `exp:${coefficient}:C`, { kind: "common", family, coefficient });
      distractors = [
        symbolicAnswer(`${integrand}`, `exp:${coefficient}:no-C`),
        symbolicAnswer(`${scaledBody(rational(-coefficient), "e^x")}+C`, `exp:${-coefficient}:C`),
        symbolicAnswer(`${scaledBody(rational(coefficient), "xe^x")}+C`, `exp-x:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(coefficient), "e^{x+1}")}+C`, `exp-shift:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(coefficient * 2), "e^x")}+C`, `exp:${coefficient * 2}:C`),
        symbolicAnswer(`${coefficient}x+C`, `linear:${coefficient}`)
      ];
    } else if (family === "logarithm") {
      integrand = `\\frac{${coefficient}}{x}`;
      correct = symbolicAnswer(`${scaledBody(rational(coefficient), "\\ln\\left|x\\right|")}+C`, `log:${coefficient}:C`, { kind: "common", family, coefficient });
      distractors = [
        symbolicAnswer(`${scaledBody(rational(coefficient), "\\ln\\left|x\\right|")}`, `log:${coefficient}:no-C`),
        symbolicAnswer(`\\frac{${coefficient}}{2}x^2+C`, `log-power:${coefficient}`),
        symbolicAnswer(`-${integrand}+C`, `negative-reciprocal:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(coefficient), "\\ln x")}+C`, `log-no-absolute:${coefficient}`),
        symbolicAnswer(`${coefficient}x^{-2}+C`, `log-derivative:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(-coefficient), "\\ln\\left|x\\right|")}+C`, `log:${-coefficient}:C`)
      ];
    } else {
      const useSine = family === "sine";
      integrand = scaledBody(rational(coefficient), useSine ? "\\sin x" : "\\cos x");
      const answerCoefficient = useSine ? -coefficient : coefficient;
      const answerBody = useSine ? "\\cos x" : "\\sin x";
      correct = symbolicAnswer(`${scaledBody(rational(answerCoefficient), answerBody)}+C`, `trig:${family}:${coefficient}:C`, { kind: "common", family, coefficient });
      distractors = [
        symbolicAnswer(`${scaledBody(rational(answerCoefficient), answerBody)}`, `trig:${family}:${coefficient}:no-C`),
        symbolicAnswer(`${scaledBody(rational(coefficient), answerBody)}+C`, `trig-wrong-sign:${family}:${coefficient}`),
        symbolicAnswer(`${integrand}+C`, `trig-unchanged:${family}:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(-answerCoefficient), useSine ? "\\sin x" : "\\cos x")}+C`, `trig-swap:${family}:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(answerCoefficient * 2), answerBody)}+C`, `trig-double:${family}:${coefficient}`),
        symbolicAnswer(`${scaledBody(rational(-answerCoefficient), answerBody)}+C`, `trig-negative:${family}:${coefficient}`)
      ];
    }
    const main = `\\int ${integrand}\\,dx`;
    const type = family === "exponential" ? "integral-exponential" : family === "logarithm" ? "integral-logarithmic" : "integral-trigonometric";
    return makeQuestion(type, "promptIndefinite", main, correct, distractors, [
      { line: main, note: t.notes.given },
      { line: correct.latex.replace(/\+C$/, ""), note: t.notes.rule },
      { line: correct.latex, note: t.notes.constant }
    ], t.suggestions.common, correct.model);
  }

  function substitutionQuestion(h, family = "power", definite = false) {
    const t = activeText();
    const a = randomNonZero(h, -4, 4);
    const b = h.randInt(-6, 6);
    const inner = signedLinear(a, b);
    let main;
    let correct;
    let distractors;
    let uAnswer;
    let audit;

    if (family === "power") {
      const n = h.randInt(1, 4);
      const multiplier = randomNonZero(h, -4, 4);
      const k = a * multiplier;
      const coefficient = rational(k, a * (n + 1));
      const answerBody = `\\left(${inner}\\right)^{${n + 1}}`;
      correct = symbolicAnswer(`${scaledBody(coefficient, answerBody)}+C`, `u-power:${a}:${b}:${n}:${rationalKey(coefficient)}:C`, { kind: "substitution", family, a, b, n, k, coefficient });
      main = `\\int ${scaledBody(rational(k), `\\left(${inner}\\right)^{${n}}`)}\\,dx`;
      uAnswer = `${scaledBody(rational(multiplier), `\\frac{u^{${n + 1}}}{${n + 1}}`)}+C`;
      distractors = [
        symbolicAnswer(`${scaledBody(rational(k, n + 1), answerBody)}+C`, `u-power-no-inner:${a}:${b}:${n}:${k}`),
        symbolicAnswer(`${scaledBody(rational(k, a), `\\left(${inner}\\right)^{${n}}`)}+C`, `u-power-same-exp:${a}:${b}:${n}:${k}`),
        symbolicAnswer(`${scaledBody(coefficient, answerBody)}`, `u-power-no-c:${a}:${b}:${n}:${k}`),
        symbolicAnswer(`${scaledBody(negateRational(coefficient), answerBody)}+C`, `u-power-sign:${a}:${b}:${n}:${k}`),
        symbolicAnswer(`${scaledBody(rational(k * n * a), `\\left(${inner}\\right)^{${n - 1}}`)}+C`, `u-power-derivative:${a}:${b}:${n}:${k}`),
        symbolicAnswer(`${scaledBody(rational(k), answerBody)}+C`, `u-power-no-divide:${a}:${b}:${n}:${k}`)
      ];
      audit = correct.model;
    } else {
      const k = randomNonZero(h, -8, 8);
      const isExp = family === "exponential";
      const isSin = family === "sine";
      const sourceBody = isExp ? `e^{${inner}}` : isSin ? `\\sin\\left(${inner}\\right)` : `\\cos\\left(${inner}\\right)`;
      const targetBody = isExp ? `e^{${inner}}` : isSin ? `\\cos\\left(${inner}\\right)` : `\\sin\\left(${inner}\\right)`;
      const coefficient = rational(isSin ? -k : k, a);
      main = `\\int ${scaledBody(rational(k), sourceBody)}\\,dx`;
      correct = symbolicAnswer(`${scaledBody(coefficient, targetBody)}+C`, `u-${family}:${a}:${b}:${k}:C`, { kind: "substitution", family, a, b, k, coefficient });
      uAnswer = `${scaledBody(rational(isSin ? -k : k, a), isExp ? "e^u" : isSin ? "\\cos u" : "\\sin u")}+C`;
      distractors = [
        symbolicAnswer(`${scaledBody(rational(isSin ? -k : k), targetBody)}+C`, `u-${family}-no-inner:${a}:${b}:${k}`),
        symbolicAnswer(`${scaledBody(negateRational(coefficient), targetBody)}+C`, `u-${family}-sign:${a}:${b}:${k}`),
        symbolicAnswer(`${scaledBody(coefficient, targetBody)}`, `u-${family}-no-c:${a}:${b}:${k}`),
        symbolicAnswer(`${scaledBody(rational(k * a), targetBody)}+C`, `u-${family}-multiply-inner:${a}:${b}:${k}`),
        symbolicAnswer(`${scaledBody(rational(k), sourceBody)}+C`, `u-${family}-unchanged:${a}:${b}:${k}`),
        symbolicAnswer(`${scaledBody(rational(k, a), sourceBody)}+C`, `u-${family}-wrong-function:${a}:${b}:${k}`)
      ];
      audit = correct.model;
    }

    return makeQuestion(definite ? "integral-definite-substitution" : "integral-u-substitution", "promptSubstitution", main, correct, distractors, [
      { line: main, note: t.notes.given },
      { line: `u=${inner},\\quad du=${a}\\,dx`, note: t.notes.substitution },
      { line: uAnswer, note: t.notes.replace },
      { line: correct.latex, note: t.notes.back }
    ], t.suggestions.substitution, audit);
  }

  function definiteSubstitutionQuestion(h) {
    const t = activeText();
    let a;
    let b;
    let n;
    let lower;
    let upper;
    let lowU;
    let highU;
    let result;
    for (let attempt = 0; attempt < 100; attempt++) {
      a = randomNonZero(h, -3, 3);
      b = h.randInt(-3, 3);
      n = h.randInt(1, 3);
      lower = h.randInt(-2, 1);
      upper = h.randInt(lower + 1, 3);
      lowU = a * lower + b;
      highU = a * upper + b;
      result = rational(highU ** (n + 1) - lowU ** (n + 1));
      if (!isZero(result) && Math.abs(result.numerator) <= 100) break;
    }
    const inner = signedLinear(a, b);
    const k = a * (n + 1);
    const main = `\\int_{${lower}}^{${upper}} ${scaledBody(rational(k), `\\left(${inner}\\right)^{${n}}`)}\\,dx`;
    const correct = numericAnswer(result);
    const highOnly = rational(highU ** (n + 1));
    const lowOnly = rational(lowU ** (n + 1));
    const distractors = numericDistractors(result, [
      highOnly,
      lowOnly,
      negateRational(result),
      addRational(highOnly, lowOnly),
      multiplyRational(result, rational(a)),
      divideRational(result, rational(n + 1))
    ]);
    return makeQuestion("integral-definite-substitution", "promptSubstitution", main, correct, distractors, [
      { line: main, note: t.notes.given },
      { line: `u=${inner},\\quad du=${a}\\,dx`, note: t.notes.substitution },
      { line: `\\left.u^{${n + 1}}\\right|_{${lowU}}^{${highU}}`, note: t.notes.replace },
      { line: `${highU}^{${n + 1}}-${lowU}^{${n + 1}}=${correct.latex}`, note: t.notes.evaluate }
    ], t.suggestions.substitution, { kind: "definite-substitution", a, b, n, k, lower, upper, result });
  }

  function ftcQuestion(h, chain = false) {
    const t = activeText();
    const c = h.randInt(1, 7);
    const lower = h.randInt(-3, 3);
    if (!chain) {
      const integrandT = polynomial([term(1, 2), term(c, 0)]);
      const answerX = polynomial([term(1, 2), term(c, 0)]);
      const main = `\\frac{d}{dx}\\left[\\int_{${lower}}^{x}\\left(t^2+${c}\\right)\\,dt\\right]`;
      const correct = symbolicAnswer(polynomialLatex(answerX), `ftc-basic:${c}`, { kind: "ftc", chain: false, c, lower });
      const antiderivative = polynomialAnswer(integratePolynomial(answerX), false);
      const distractors = [antiderivative, symbolicAnswer(`2x`, `ftc-derivative:${c}`), symbolicAnswer(`x^2`, `ftc-missing-constant:${c}`), symbolicAnswer(`x^2-${c}`, `ftc-sign:${c}`), symbolicAnswer(`x^2+${c}+C`, `ftc-extra-c:${c}`), symbolicAnswer(`${lower}^2+${c}`, `ftc-lower:${c}`)];
      return makeQuestion("integral-ftc", "promptFtc", main, correct, distractors, [
        { line: main, note: t.notes.given },
        { line: `f(t)=t^2+${c}`, note: t.notes.ftc },
        { line: correct.latex, note: t.notes.ftc }
      ], t.suggestions.ftc, { kind: "ftc", chain: false, integrand: integrandT, answer: answerX });
    }

    const m = randomNonZero(h, -4, 4);
    const b = h.randInt(-4, 4);
    const upper = signedLinear(m, b);
    const innerValue = `\\left(${upper}\\right)^2+${c}`;
    const correctLatex = scaledBody(rational(m), `\\left[${innerValue}\\right]`);
    const correct = symbolicAnswer(correctLatex, `ftc-chain:${m}:${b}:${c}`, { kind: "ftc", chain: true, m, b, c, lower });
    const main = `\\frac{d}{dx}\\left[\\int_{${lower}}^{${upper}}\\left(t^2+${c}\\right)\\,dt\\right]`;
    const distractors = [
      symbolicAnswer(innerValue, `ftc-chain-no-gprime:${m}:${b}:${c}`),
      symbolicAnswer(scaledBody(rational(2 * m), `\\left(${upper}\\right)`), `ftc-chain-derivative-integrand:${m}:${b}:${c}`),
      symbolicAnswer(scaledBody(rational(-m), `\\left[${innerValue}\\right]`), `ftc-chain-sign:${m}:${b}:${c}`),
      symbolicAnswer(`${innerValue}+C`, `ftc-chain-c:${m}:${b}:${c}`),
      symbolicAnswer(scaledBody(rational(m), `\\left(x^2+${c}\\right)`), `ftc-chain-no-substitute:${m}:${b}:${c}`),
      symbolicAnswer(scaledBody(rational(m * m), `\\left[${innerValue}\\right]`), `ftc-chain-square-gprime:${m}:${b}:${c}`)
    ];
    return makeQuestion("integral-ftc-chain", "promptFtc", main, correct, distractors, [
      { line: main, note: t.notes.given },
      { line: `f\\left(${upper}\\right)=${innerValue}`, note: t.notes.ftc },
      { line: `\\frac{d}{dx}\\left(${upper}\\right)=${m}`, note: t.notes.chain },
      { line: correct.latex, note: t.notes.chain }
    ], t.suggestions.ftc, correct.model);
  }

  function combinedExpertQuestion(h) {
    const t = activeText();
    const power = h.randInt(2, 5);
    const a = randomNonZero(h, -6, 6);
    const b = randomNonZero(h, -5, 5);
    const c = randomNonZero(h, -5, 5);
    const polynomialPart = polynomial([term(a, power)]);
    const polynomialIntegral = integratePolynomial(polynomialPart);
    const integrand = `${polynomialLatex(polynomialPart)}${b < 0 ? "" : "+"}${scaledBody(rational(b), "e^x")}${c < 0 ? "" : "+"}${scaledBody(rational(c), "\\sin x")}`;
    const answerBody = `${polynomialLatex(polynomialIntegral)}${b < 0 ? "" : "+"}${scaledBody(rational(b), "e^x")}${-c < 0 ? "" : "+"}${scaledBody(rational(-c), "\\cos x")}`;
    const correct = symbolicAnswer(`${answerBody}+C`, `combined:${power}:${a}:${b}:${c}:C`, { kind: "combined", power, a, b, c, polynomialPart, polynomialIntegral });
    const main = `\\int \\left(${integrand}\\right)\\,dx`;
    const distractors = [
      symbolicAnswer(answerBody, `combined:${power}:${a}:${b}:${c}:no-C`),
      symbolicAnswer(`${polynomialLatex(polynomialIntegral)}${b < 0 ? "" : "+"}${scaledBody(rational(b), "e^x")}${c < 0 ? "" : "+"}${scaledBody(rational(c), "\\cos x")}+C`, `combined-trig-sign:${power}:${a}:${b}:${c}`),
      symbolicAnswer(`${integrand}+C`, `combined-unchanged:${power}:${a}:${b}:${c}`),
      symbolicAnswer(`${polynomialLatex(differentiatePolynomial(polynomialPart))}${b < 0 ? "" : "+"}${scaledBody(rational(b), "e^x")}${c < 0 ? "" : "+"}${scaledBody(rational(c), "\\cos x")}+C`, `combined-derivative:${power}:${a}:${b}:${c}`),
      symbolicAnswer(`${polynomialLatex(polynomialPart)}${b < 0 ? "" : "+"}${scaledBody(rational(b), "e^x")}${-c < 0 ? "" : "+"}${scaledBody(rational(-c), "\\cos x")}+C`, `combined-no-power:${power}:${a}:${b}:${c}`),
      symbolicAnswer(`${polynomialLatex(negatePolynomial(polynomialIntegral))}${b < 0 ? "" : "+"}${scaledBody(rational(b), "e^x")}${-c < 0 ? "" : "+"}${scaledBody(rational(-c), "\\cos x")}+C`, `combined-poly-sign:${power}:${a}:${b}:${c}`)
    ];
    return makeQuestion("integral-mixed", "promptIndefinite", main, correct, distractors, [
      { line: main, note: t.notes.given },
      { line: answerBody, note: t.notes.rule },
      { line: correct.latex, note: t.notes.constant }
    ], t.suggestions.common, correct.model);
  }

  const builders = {
    easy: [
      tag("integral-power-rule", h => indefinitePolynomialQuestion(h, "integral-power-rule", 1, [-5, -4, -3, -2, 0, 1, 2, 3, 4, 5, 6])),
      tag("integral-polynomial", h => indefinitePolynomialQuestion(h, "integral-polynomial", h.randInt(2, 3), [0, 1, 2, 3, 4]))
    ],
    medium: [
      tag("integral-polynomial", h => indefinitePolynomialQuestion(h, "integral-polynomial", h.randInt(3, 4), [0, 1, 2, 3, 4, 5])),
      tag("integral-exponential", h => commonFunctionQuestion(h, "exponential")),
      tag("integral-trigonometric", h => commonFunctionQuestion(h, h.choice(["sine", "cosine"]))),
      tag("integral-logarithmic", h => commonFunctionQuestion(h, "logarithm")),
      tag("integral-definite", h => simpleDefiniteQuestion(h, false))
    ],
    hard: [
      tag("integral-u-substitution", h => substitutionQuestion(h, "power")),
      tag("integral-u-substitution", h => substitutionQuestion(h, h.choice(["exponential", "sine", "cosine"]))),
      tag("integral-ftc", h => ftcQuestion(h, false)),
      tag("integral-definite-substitution", h => definiteSubstitutionQuestion(h))
    ],
    expert: [
      tag("integral-ftc-chain", h => ftcQuestion(h, true)),
      tag("integral-definite", h => simpleDefiniteQuestion(h, true)),
      tag("integral-definite-substitution", h => definiteSubstitutionQuestion(h)),
      tag("integral-mixed", h => combinedExpertQuestion(h))
    ]
  };

  window.MCLIntegrationMath = {
    rational,
    addRational,
    subtractRational,
    multiplyRational,
    divideRational,
    rationalKey,
    polynomial,
    polynomialKey,
    polynomialLatex,
    integratePolynomial,
    differentiatePolynomial,
    evaluatePolynomial,
    builders
  };

  window.MCLQuizTool = {
    gameId: "integration-practice",
    course: "single-variable-calculus",
    text,
    builders,
    balancedMixed: true,
    avoidConsecutiveTypes: true
  };
})();
