(function () {
  "use strict";

  function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function rational(numerator, denominator = 1) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      throw new Error("Invalid rational number");
    }
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
  const negateRational = a => rational(-a.numerator, a.denominator);
  const isZeroRational = a => a.numerator === 0;
  const absRational = a => rational(Math.abs(a.numerator), a.denominator);

  function complex(real, imaginary = 0) {
    return {
      real: typeof real === "number" ? rational(real) : rational(real.numerator, real.denominator),
      imaginary: typeof imaginary === "number" ? rational(imaginary) : rational(imaginary.numerator, imaginary.denominator)
    };
  }

  const addComplex = (z, w) => complex(addRational(z.real, w.real), addRational(z.imaginary, w.imaginary));
  const subtractComplex = (z, w) => complex(subtractRational(z.real, w.real), subtractRational(z.imaginary, w.imaginary));
  const negateComplex = z => complex(negateRational(z.real), negateRational(z.imaginary));
  const conjugateComplex = z => complex(z.real, negateRational(z.imaginary));

  function multiplyComplex(z, w) {
    return complex(
      subtractRational(multiplyRational(z.real, w.real), multiplyRational(z.imaginary, w.imaginary)),
      addRational(multiplyRational(z.real, w.imaginary), multiplyRational(z.imaginary, w.real))
    );
  }

  function divideComplex(z, w) {
    const denominator = addRational(multiplyRational(w.real, w.real), multiplyRational(w.imaginary, w.imaginary));
    if (isZeroRational(denominator)) throw new Error("Cannot divide by zero");
    const numerator = multiplyComplex(z, conjugateComplex(w));
    return complex(divideRational(numerator.real, denominator), divideRational(numerator.imaginary, denominator));
  }

  function rationalKey(value) {
    const item = rational(value.numerator, value.denominator);
    return `${item.numerator}/${item.denominator}`;
  }

  function complexKey(value) {
    return `${rationalKey(value.real)}|${rationalKey(value.imaginary)}`;
  }

  function rationalLatex(value) {
    const item = rational(value.numerator, value.denominator);
    if (item.denominator === 1) return String(item.numerator);
    const fraction = `\\frac{${Math.abs(item.numerator)}}{${item.denominator}}`;
    return item.numerator < 0 ? `-${fraction}` : fraction;
  }

  function complexLatex(value) {
    const z = complex(value.real, value.imaginary);
    const realZero = isZeroRational(z.real);
    const imaginaryZero = isZeroRational(z.imaginary);
    if (realZero && imaginaryZero) return "0";

    const realPart = realZero ? "" : rationalLatex(z.real);
    if (imaginaryZero) return realPart;

    const negative = z.imaginary.numerator < 0;
    const magnitude = absRational(z.imaginary);
    const coefficient = magnitude.numerator === magnitude.denominator ? "" : rationalLatex(magnitude);
    const imaginaryPart = `${coefficient}i`;
    if (realZero) return `${negative ? "-" : ""}${imaginaryPart}`;
    return `${realPart}${negative ? "-" : "+"}${imaginaryPart}`;
  }

  function answer(value) {
    return { latex: complexLatex(value), key: complexKey(value), value };
  }

  function parenthesize(value) {
    return `\\left(${complexLatex(value)}\\right)`;
  }

  function randomNonZeroInt(h, min, max) {
    let value = 0;
    while (value === 0) value = h.randInt(min, max);
    return value;
  }

  function randomComplex(h, min, max, options = {}) {
    const { requireReal = false, requireImaginary = false, nonZero = true } = options;
    let real;
    let imaginary;
    do {
      real = requireReal ? randomNonZeroInt(h, min, max) : h.randInt(min, max);
      imaginary = requireImaginary ? randomNonZeroInt(h, min, max) : h.randInt(min, max);
    } while (nonZero && real === 0 && imaginary === 0);
    return complex(real, imaginary);
  }

  function tag(type, builder) {
    builder.__type = type;
    return builder;
  }

  const text = {
    en: {
      toolBadge: "Algebra II · Precalculus",
      title: "Complex Number Operations Practice",
      subtitle: "Add, subtract, multiply, and divide complex numbers using exact simplified answers.",
      note: "Every answer is written in standard form a + bi. Division answers remain exact fractions and are fully simplified.",
      questionTitle: "Choose the equivalent complex number in standard form.",
      promptAdd: "Add and simplify.",
      promptSubtract: "Subtract and simplify.",
      promptMultiply: "Multiply and simplify using i² = -1.",
      promptDivide: "Divide by multiplying by the conjugate, then simplify.",
      promptMixed: "Use the order of operations and simplify.",
      difficultyOptions: {
        easy: "Easy: one-step addition and subtraction",
        medium: "Medium: multiplication and i² = -1",
        hard: "Hard: exact division using conjugates",
        expert: "Expert: multi-step mixed operations",
        mixed: "Mixed: balanced practice from all four levels"
      },
      suggestions: {
        add: "Combine the real parts together and the imaginary parts together.",
        subtract: "Check that the minus sign acts on both parts of the second complex number.",
        multiply: "Expand every product and remember that i² = -1, not 1.",
        divide: "Multiply both numerator and denominator by the conjugate of the denominator.",
        mixed: "Respect the parentheses and complete multiplication or division before the final addition or subtraction."
      },
      notes: {
        given: "given expression",
        realImaginary: "combine real and imaginary parts",
        distributeMinus: "distribute the subtraction sign",
        expand: "expand the product",
        replaceI2: "use i² = -1",
        conjugate: "multiply by the conjugate",
        modulus: "the denominator is the modulus squared",
        simplify: "simplify to standard form",
        inner: "simplify inside the parentheses",
        order: "follow the order of operations"
      }
    },
    zh: {
      toolBadge: "代数 II · 预备微积分",
      title: "复数四则运算专项练习",
      subtitle: "练习复数的加、减、乘、除，并始终使用精确的最简答案。",
      note: "所有答案统一写成 a + bi 的标准形式；除法保留精确分数并自动约分。",
      questionTitle: "选择与题目等价、且已写成标准形式的复数。",
      promptAdd: "计算并化简复数加法。",
      promptSubtract: "计算并化简复数减法。",
      promptMultiply: "利用 i² = -1 计算并化简。",
      promptDivide: "分子分母同乘共轭复数，再化简。",
      promptMixed: "按照运算顺序计算并化简。",
      difficultyOptions: {
        easy: "简单：一步复数加减法",
        medium: "中等：复数乘法与 i² = -1",
        hard: "困难：使用共轭完成精确除法",
        expert: "专家：多步骤混合运算",
        mixed: "混合：均衡覆盖四档难度"
      },
      suggestions: {
        add: "分别合并实部与虚部，不要把两类项混在一起。",
        subtract: "检查减号是否同时作用于第二个复数的实部和虚部。",
        multiply: "逐项展开，并记住 i² = -1，而不是 1。",
        divide: "分子和分母都要乘以除数的共轭复数。",
        mixed: "先处理括号，并在最后的加减之前完成乘法或除法。"
      },
      notes: {
        given: "原表达式",
        realImaginary: "分别合并实部与虚部",
        distributeMinus: "把减号分配到第二个复数",
        expand: "展开乘积",
        replaceI2: "使用 i² = -1",
        conjugate: "分子分母同乘共轭",
        modulus: "分母化为模的平方",
        simplify: "化为标准形式",
        inner: "先化简括号内的复数",
        order: "按照运算顺序计算"
      }
    }
  };

  function activeText() {
    return text[localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en"];
  }

  function uniqueComplex(values, correct) {
    const seen = new Map();
    const correctKey = complexKey(correct);
    values.filter(Boolean).forEach(value => {
      const key = complexKey(value);
      if (key !== correctKey && !seen.has(key)) seen.set(key, answer(value));
    });
    return [...seen.values()];
  }

  function nearbyDistractors(correct) {
    const one = rational(1);
    return [
      negateComplex(correct),
      conjugateComplex(correct),
      complex(correct.imaginary, correct.real),
      complex(addRational(correct.real, one), correct.imaginary),
      complex(subtractRational(correct.real, one), correct.imaginary),
      complex(correct.real, addRational(correct.imaginary, one)),
      complex(correct.real, subtractRational(correct.imaginary, one)),
      complex(multiplyRational(correct.real, rational(2)), correct.imaginary),
      complex(correct.real, multiplyRational(correct.imaginary, rational(2)))
    ];
  }

  function distractorsFor(operation, operands, correct, extra = []) {
    const [z, w] = operands;
    const mistakes = [...extra];
    if (operation === "add") {
      mistakes.push(
        complex(addRational(z.real, w.real), z.imaginary),
        complex(addRational(z.real, w.real), subtractRational(z.imaginary, w.imaginary)),
        addComplex(z, conjugateComplex(w))
      );
    } else if (operation === "subtract") {
      mistakes.push(
        addComplex(z, w),
        complex(subtractRational(z.real, w.real), addRational(z.imaginary, w.imaginary)),
        subtractComplex(w, z)
      );
    } else if (operation === "multiply") {
      const ac = multiplyRational(z.real, w.real);
      const bd = multiplyRational(z.imaginary, w.imaginary);
      const ad = multiplyRational(z.real, w.imaginary);
      const bc = multiplyRational(z.imaginary, w.real);
      mistakes.push(
        complex(addRational(ac, bd), addRational(ad, bc)),
        complex(ac, bd),
        complex(subtractRational(ac, bd), ad),
        complex(subtractRational(ac, bd), bc)
      );
    } else if (operation === "divide") {
      const c2 = multiplyRational(w.real, w.real);
      const d2 = multiplyRational(w.imaginary, w.imaginary);
      const sum = addRational(c2, d2);
      const difference = subtractRational(c2, d2);
      if (!isZeroRational(w.real) && !isZeroRational(w.imaginary)) {
        mistakes.push(complex(divideRational(z.real, w.real), divideRational(z.imaginary, w.imaginary)));
      }
      if (!isZeroRational(difference)) {
        const numerator = multiplyComplex(z, conjugateComplex(w));
        mistakes.push(complex(divideRational(numerator.real, difference), divideRational(numerator.imaginary, difference)));
      }
      const wrongNumerator = multiplyComplex(z, w);
      mistakes.push(
        wrongNumerator,
        complex(divideRational(wrongNumerator.real, sum), divideRational(wrongNumerator.imaginary, sum)),
        conjugateComplex(correct)
      );
    }
    return uniqueComplex([...mistakes, ...nearbyDistractors(correct)], correct).slice(0, 12);
  }

  function makeQuestion(type, promptKey, main, correct, distractors, lines, suggestion) {
    return {
      type,
      promptKey,
      main,
      plain: main,
      answer: answer(correct),
      distractors,
      lines,
      suggestion
    };
  }

  function additionQuestion(h, subtract = false) {
    const t = activeText();
    const z = randomComplex(h, -10, 10);
    const w = randomComplex(h, -10, 10);
    const correct = subtract ? subtractComplex(z, w) : addComplex(z, w);
    const operation = subtract ? "subtract" : "add";
    const symbol = subtract ? "-" : "+";
    const main = `${parenthesize(z)}${symbol}${parenthesize(w)}`;
    const grouped = subtract
      ? `\\left(${rationalLatex(z.real)}\\right)-\\left(${rationalLatex(w.real)}\\right)+\\left[\\left(${rationalLatex(z.imaginary)}\\right)-\\left(${rationalLatex(w.imaginary)}\\right)\\right]i`
      : `\\left(${rationalLatex(z.real)}\\right)+\\left(${rationalLatex(w.real)}\\right)+\\left[\\left(${rationalLatex(z.imaginary)}\\right)+\\left(${rationalLatex(w.imaginary)}\\right)\\right]i`;
    return makeQuestion(
      subtract ? "complex-subtract" : "complex-add",
      subtract ? "promptSubtract" : "promptAdd",
      main,
      correct,
      distractorsFor(operation, [z, w], correct),
      [
        { line: main, note: t.notes.given },
        { line: grouped, note: subtract ? t.notes.distributeMinus : t.notes.realImaginary },
        { line: complexLatex(correct), note: t.notes.simplify }
      ],
      t.suggestions[operation]
    );
  }

  function multiplicationQuestion(h, variant = "standard") {
    const t = activeText();
    let z = randomComplex(h, -8, 8, { requireImaginary: true });
    let w = randomComplex(h, -8, 8, { requireImaginary: true });
    if (variant === "pure-imaginary") z = complex(0, randomNonZeroInt(h, -8, 8));
    const correct = multiplyComplex(z, w);
    const main = `${parenthesize(z)}${parenthesize(w)}`;
    const a = rationalLatex(z.real);
    const b = rationalLatex(z.imaginary);
    const c = rationalLatex(w.real);
    const d = rationalLatex(w.imaginary);
    const expanded = `${a}\\cdot${c}+${a}\\cdot${d}i+${b}i\\cdot${c}+${b}\\cdot${d}i^2`.replace(/\+\-/g, "-");
    return makeQuestion(
      "complex-multiply",
      "promptMultiply",
      main,
      correct,
      distractorsFor("multiply", [z, w], correct),
      [
        { line: main, note: t.notes.given },
        { line: expanded, note: t.notes.expand },
        { line: complexLatex(correct), note: t.notes.replaceI2 }
      ],
      t.suggestions.multiply
    );
  }

  function multiplicationWithOffset(h) {
    const t = activeText();
    const z = randomComplex(h, -6, 6, { requireImaginary: true });
    const w = randomComplex(h, -6, 6, { requireImaginary: true });
    const offset = randomComplex(h, -7, 7);
    const product = multiplyComplex(z, w);
    const correct = h.choice([true, false]) ? addComplex(product, offset) : subtractComplex(product, offset);
    const symbol = complexKey(correct) === complexKey(addComplex(product, offset)) ? "+" : "-";
    const main = `${parenthesize(z)}${parenthesize(w)}${symbol}${parenthesize(offset)}`;
    const wrongOrder = multiplyComplex(z, symbol === "+" ? addComplex(w, offset) : subtractComplex(w, offset));
    return makeQuestion(
      "complex-mixed-product",
      "promptMixed",
      main,
      correct,
      distractorsFor("multiply", [z, w], correct, [product, wrongOrder, symbol === "+" ? subtractComplex(product, offset) : addComplex(product, offset)]),
      [
        { line: `${parenthesize(z)}${parenthesize(w)}=${complexLatex(product)}`, note: t.notes.expand },
        { line: `${parenthesize(product)}${symbol}${parenthesize(offset)}`, note: t.notes.order },
        { line: complexLatex(correct), note: t.notes.simplify }
      ],
      t.suggestions.mixed
    );
  }

  function smallDivisor(h, requireBoth = true) {
    const candidates = [];
    for (let real = -4; real <= 4; real++) {
      for (let imaginary = -4; imaginary <= 4; imaginary++) {
        if ((!real && !imaginary) || (requireBoth && (!real || !imaginary))) continue;
        const modulus = real * real + imaginary * imaginary;
        if (modulus <= 25) candidates.push(complex(real, imaginary));
      }
    }
    return h.choice(candidates);
  }

  function divisionQuestion(h, options = {}) {
    const t = activeText();
    let numerator;
    let denominator;
    let correct;
    for (let attempt = 0; attempt < 60; attempt++) {
      numerator = randomComplex(h, -9, 9);
      denominator = options.pureImaginary
        ? complex(0, randomNonZeroInt(h, -5, 5))
        : smallDivisor(h, true);
      correct = divideComplex(numerator, denominator);
      const hasFraction = correct.real.denominator > 1 || correct.imaginary.denominator > 1;
      if ((!options.requireFraction || hasFraction) && Math.max(correct.real.denominator, correct.imaginary.denominator) <= 25) break;
    }
    const main = `\\frac{${parenthesize(numerator)}}{${parenthesize(denominator)}}`;
    const conjugate = conjugateComplex(denominator);
    const multiplied = multiplyComplex(numerator, conjugate);
    const modulus = addRational(multiplyRational(denominator.real, denominator.real), multiplyRational(denominator.imaginary, denominator.imaginary));
    return makeQuestion(
      "complex-divide",
      "promptDivide",
      main,
      correct,
      distractorsFor("divide", [numerator, denominator], correct),
      [
        { line: main, note: t.notes.given },
        { line: `\\frac{${parenthesize(numerator)}${parenthesize(conjugate)}}{${parenthesize(denominator)}${parenthesize(conjugate)}}`, note: t.notes.conjugate },
        { line: `\\frac{${complexLatex(multiplied)}}{${rationalLatex(modulus)}}`, note: t.notes.modulus },
        { line: complexLatex(correct), note: t.notes.simplify }
      ],
      t.suggestions.divide
    );
  }

  function acceptableExpert(value) {
    const parts = [value.real, value.imaginary];
    return parts.every(part => part.denominator <= 36 && Math.abs(part.numerator / part.denominator) <= 50)
      && complexKey(value) !== complexKey(complex(0, 0));
  }

  function expertQuestion(h, variant) {
    const t = activeText();
    for (let attempt = 0; attempt < 80; attempt++) {
      const z1 = randomComplex(h, -5, 5);
      const z2 = randomComplex(h, -5, 5);
      const z3 = randomComplex(h, -5, 5);
      const z4 = randomComplex(h, -4, 4);
      let main;
      let correct;
      let intermediateA;
      let intermediateB;
      let extras;

      if (variant === "product-of-groups") {
        intermediateA = addComplex(z1, z2);
        intermediateB = subtractComplex(z3, z4);
        correct = multiplyComplex(intermediateA, intermediateB);
        main = `\\left[${parenthesize(z1)}+${parenthesize(z2)}\\right]\\left[${parenthesize(z3)}-${parenthesize(z4)}\\right]`;
        extras = [multiplyComplex(z1, z3), addComplex(intermediateA, intermediateB)];
      } else if (variant === "quotient-plus") {
        const divisor = smallDivisor(h, true);
        intermediateA = divideComplex(z1, divisor);
        intermediateB = z3;
        correct = addComplex(intermediateA, intermediateB);
        main = `\\frac{${parenthesize(z1)}}{${parenthesize(divisor)}}+${parenthesize(z3)}`;
        const wrongDivisor = addComplex(divisor, z3);
        extras = [
          intermediateA,
          complexKey(wrongDivisor) === complexKey(complex(0, 0)) ? subtractComplex(intermediateA, z3) : divideComplex(z1, wrongDivisor)
        ];
      } else {
        intermediateA = subtractComplex(z1, z2);
        intermediateB = addComplex(z3, z4);
        if (complexKey(intermediateB) === complexKey(complex(0, 0))) continue;
        correct = divideComplex(intermediateA, intermediateB);
        main = `\\frac{${parenthesize(z1)}-${parenthesize(z2)}}{${parenthesize(z3)}+${parenthesize(z4)}}`;
        extras = [divideComplex(z1, z3), divideComplex(addComplex(z1, z2), intermediateB)];
      }

      if (!acceptableExpert(correct)) continue;
      const operation = variant === "product-of-groups" ? "multiply" : "divide";
      return makeQuestion(
        variant === "product-of-groups" ? "complex-mixed-product" : "complex-mixed-quotient",
        "promptMixed",
        main,
        correct,
        distractorsFor(operation, [intermediateA, intermediateB], correct, extras),
        [
          { line: main, note: t.notes.given },
          { line: variant === "quotient-plus" ? `${complexLatex(intermediateA)}+${parenthesize(intermediateB)}` : `${parenthesize(intermediateA)}${variant === "product-of-groups" ? parenthesize(intermediateB) : `\\div${parenthesize(intermediateB)}`}`, note: t.notes.inner },
          { line: complexLatex(correct), note: t.notes.order }
        ],
        t.suggestions.mixed
      );
    }
    return divisionQuestion(h, { requireFraction: true });
  }

  const builders = {
    easy: [
      tag("complex-add", h => additionQuestion(h, false)),
      tag("complex-subtract", h => additionQuestion(h, true))
    ],
    medium: [
      tag("complex-multiply", h => multiplicationQuestion(h, "standard")),
      tag("complex-multiply", h => multiplicationQuestion(h, "pure-imaginary")),
      tag("complex-mixed-product", h => multiplicationWithOffset(h))
    ],
    hard: [
      tag("complex-divide", h => divisionQuestion(h, { requireFraction: true })),
      tag("complex-divide", h => divisionQuestion(h, { pureImaginary: true })),
      tag("complex-divide", h => divisionQuestion(h, { requireFraction: false }))
    ],
    expert: [
      tag("complex-mixed-product", h => expertQuestion(h, "product-of-groups")),
      tag("complex-mixed-quotient", h => expertQuestion(h, "quotient-plus")),
      tag("complex-mixed-quotient", h => expertQuestion(h, "quotient-of-groups"))
    ]
  };

  window.MCLComplexMath = {
    rational,
    complex,
    addComplex,
    subtractComplex,
    multiplyComplex,
    divideComplex,
    conjugateComplex,
    complexKey,
    complexLatex,
    builders
  };

  window.MCLQuizTool = {
    gameId: "complex-number-operations",
    course: "algebra-2",
    text,
    builders,
    balancedMixed: true,
    avoidConsecutiveTypes: true
  };
})();
