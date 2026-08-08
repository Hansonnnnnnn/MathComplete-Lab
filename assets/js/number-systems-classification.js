(function (root) {
  "use strict";

  const SYSTEMS = Object.freeze([
    "natural", "whole", "integer", "rational", "irrational", "real", "pure-imaginary", "nonreal-complex"
  ]);

  const LABELS = Object.freeze({
    en: {
      natural: "natural numbers", whole: "whole numbers", integer: "integers", rational: "rational numbers",
      irrational: "irrational numbers", real: "real numbers", "pure-imaginary": "pure imaginary numbers",
      "nonreal-complex": "non-real complex numbers"
    },
    zh: {
      natural: "自然数", whole: "非负整数", integer: "整数", rational: "有理数",
      irrational: "无理数", real: "实数", "pure-imaginary": "纯虚数", "nonreal-complex": "非实复数"
    }
  });

  const TARGET_SYMBOLS = Object.freeze({
    natural: "\\mathbb{N}",
    whole: "\\mathbb{Z}_{\\ge 0}",
    integer: "\\mathbb{Z}",
    rational: "\\mathbb{Q}",
    irrational: "\\mathbb{R}\\setminus\\mathbb{Q}",
    real: "\\mathbb{R}",
    "pure-imaginary": "bi,\\ b\\ne0",
    "nonreal-complex": "a+bi,\\ b\\ne0"
  });

  function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function rational(numerator, denominator = 1) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) throw new Error("Invalid rational value");
    let n = Math.trunc(numerator);
    let d = Math.trunc(denominator);
    if (d < 0) { n = -n; d = -d; }
    const factor = gcd(n, d);
    return Object.freeze({ kind: "rational", n: n / factor, d: d / factor });
  }

  function addRational(a, b) { return rational(a.n * b.d + b.n * a.d, a.d * b.d); }
  function multiplyRational(a, b) { return rational(a.n * b.n, a.d * b.d); }
  function negateRational(a) { return rational(-a.n, a.d); }
  function isZero(value) { return value?.kind === "rational" && value.n === 0; }

  function extractSquareFactor(number) {
    let remainder = Math.abs(number);
    let outside = 1;
    for (let factor = 2; factor * factor <= remainder; factor += 1) {
      while (remainder % (factor * factor) === 0) {
        outside *= factor;
        remainder /= factor * factor;
      }
    }
    return { outside, remainder };
  }

  function irrational(basis, coefficient = rational(1), offset = rational(0), radicand = null) {
    let coeff = coefficient;
    let inner = radicand;
    if (basis === "sqrt") {
      const reduced = extractSquareFactor(inner);
      coeff = multiplyRational(coeff, rational(reduced.outside));
      inner = reduced.remainder;
      if (inner === 1) return addRational(offset, coeff);
    }
    return Object.freeze({ kind: "irrational", basis, coefficient: coeff, offset, radicand: inner });
  }

  function complex(realPart, imaginaryPart) {
    const real = realPart || rational(0);
    const imaginary = imaginaryPart || rational(0);
    if (isZero(imaginary)) return real;
    return Object.freeze({ kind: "complex", real, imaginary });
  }

  function rationalKey(value) { return `${value.n}/${value.d}`; }
  function valueKey(value) {
    if (value.kind === "rational") return `q:${rationalKey(value)}`;
    if (value.kind === "irrational") return `u:${value.basis}:${value.radicand || ""}:${rationalKey(value.coefficient)}:${rationalKey(value.offset)}`;
    return `c:${valueKey(value.real)}:${valueKey(value.imaginary)}`;
  }

  function rationalLatex(value) {
    if (value.d === 1) return String(value.n);
    const body = `\\frac{${Math.abs(value.n)}}{${value.d}}`;
    return value.n < 0 ? `-${body}` : body;
  }

  function irrationalCoreLatex(value) {
    if (value.basis === "pi") return "\\pi";
    if (value.basis === "e") return "e";
    if (value.basis === "cuberoot") return `\\sqrt[3]{${value.radicand}}`;
    return `\\sqrt{${value.radicand}}`;
  }

  function irrationalLatex(value) {
    const coeff = value.coefficient;
    const abs = rational(Math.abs(coeff.n), coeff.d);
    const coefficient = abs.n === abs.d ? "" : rationalLatex(abs);
    const term = `${coefficient}${irrationalCoreLatex(value)}`;
    const signedTerm = coeff.n < 0 ? `-${term}` : term;
    if (isZero(value.offset)) return signedTerm;
    return `${rationalLatex(value.offset)}${coeff.n < 0 ? "" : "+"}${signedTerm}`;
  }

  function valueLatex(value) {
    if (value.kind === "rational") return rationalLatex(value);
    if (value.kind === "irrational") return irrationalLatex(value);
    const real = value.real;
    const imaginary = value.imaginary;
    const realText = isZero(real) ? "" : valueLatex(real);
    const imagNegative = imaginary.kind === "rational" && imaginary.n < 0;
    const imagAbs = imaginary.kind === "rational" ? rational(Math.abs(imaginary.n), imaginary.d) : imaginary;
    const coefficient = valueLatex(imagAbs);
    const imagText = `${coefficient === "1" ? "" : coefficient}i`;
    if (!realText) return `${imagNegative ? "-" : ""}${imagText}`;
    return `${realText}${imagNegative ? "-" : "+"}${imagText}`;
  }

  function memberships(value) {
    const result = new Set();
    if (value.kind === "rational") {
      result.add("rational");
      result.add("real");
      if (value.d === 1) {
        result.add("integer");
        if (value.n >= 0) result.add("whole");
        if (value.n > 0) result.add("natural");
      }
    } else if (value.kind === "irrational") {
      result.add("irrational");
      result.add("real");
    } else if (value.kind === "complex") {
      result.add("nonreal-complex");
      if (isZero(value.real)) result.add("pure-imaginary");
    }
    return result;
  }

  function belongs(value, system) { return memberships(value).has(system); }
  function mostSpecificSystem(value) {
    const sets = memberships(value);
    if (sets.has("natural")) return "natural";
    if (sets.has("whole")) return "whole";
    if (sets.has("integer")) return "integer";
    if (sets.has("rational")) return "rational";
    if (sets.has("irrational")) return "irrational";
    if (sets.has("pure-imaginary")) return "pure-imaginary";
    return "nonreal-complex";
  }
  function langOf(context) { return context?.lang === "zh" || root.localStorage?.getItem?.("mathcomplete_lang") === "zh" ? "zh" : "en"; }
  function L(lang, en, zh) { return lang === "zh" ? zh : en; }

  function explainExpression(expression, lang) {
    const names = [...memberships(expression.value)].map(id => LABELS[lang][id]);
    const category = names.join(lang === "zh" ? "、" : ", ");
    return L(
      lang,
      `${expression.reason.en} It belongs to: ${category}.`,
      `${expression.reason.zh} 它属于：${category}。`
    );
  }

  function expression(id, latex, value, surface, reasonEn, reasonZh) {
    return Object.freeze({ id, latex, value, surface, reason: { en: reasonEn, zh: reasonZh } });
  }

  function nonZeroInt(rng, min, max) {
    let value = 0;
    while (!value) value = rng.int(min, max);
    return value;
  }

  const NON_SQUARES = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 37, 41];
  const NON_CUBES = [2, 3, 4, 5, 6, 7, 10, 11, 12, 17, 20, 28];

  function makeFactories() {
    const factories = [];
    const add = (id, level, surface, build) => factories.push(Object.freeze({ id, level, surface, build }));
    const fracReason = { en: "A ratio of integers with a nonzero denominator is rational.", zh: "两个整数之比且分母不为 0，因此是有理数。" };

    add("positive-integer", "easy", "integer", rng => { const n = rng.int(1, 200); return expression("positive-integer", `${n}`, rational(n), "integer", "This is a positive integer.", "这是一个正整数。") });
    add("negative-integer", "easy", "integer", rng => { const n = rng.int(1, 200); return expression("negative-integer", `-${n}`, rational(-n), "integer", "This is a negative integer.", "这是一个负整数。") });
    add("zero", "easy", "integer", () => expression("zero", "0", rational(0), "integer", "Zero is a whole number and an integer, but this tool never uses it to test the disputed natural-number convention.", "0 是非负整数和整数；本工具不会用它考察有争议的自然数定义。"));
    add("proper-fraction", "easy", "fraction", rng => { const d = rng.int(2, 24); const n = rng.int(1, d - 1); return expression("proper-fraction", `\\frac{${n}}{${d}}`, rational(n, d), "fraction", fracReason.en, fracReason.zh) });
    add("negative-fraction", "easy", "fraction", rng => { const d = rng.int(2, 24); const n = rng.int(1, d * 2); return expression("negative-fraction", `-\\frac{${n}}{${d}}`, rational(-n, d), "fraction", fracReason.en, fracReason.zh) });
    add("improper-fraction", "easy", "fraction", rng => { const d = rng.int(2, 20); const n = rng.int(d + 1, d * 4); return expression("improper-fraction", `\\frac{${n}}{${d}}`, rational(n, d), "fraction", fracReason.en, fracReason.zh) });
    add("reducible-integer-fraction", "easy", "fraction", rng => { const d = rng.int(2, 12); const n = rng.int(1, 20); return expression("reducible-integer-fraction", `\\frac{${n * d}}{${d}}`, rational(n), "fraction", "The fraction reduces to an integer.", "这个分数约分后是整数。") });
    add("finite-decimal", "easy", "decimal", rng => { const places = rng.bool() ? 10 : 100; const n = nonZeroInt(rng, -199, 199); return expression("finite-decimal", (n / places).toFixed(places === 10 ? 1 : 2), rational(n, places), "decimal", "Every terminating decimal is rational.", "有限小数都可以写成分数，因此是有理数。") });
    add("perfect-square-root", "easy", "radical", rng => { const n = rng.int(2, 20); return expression("perfect-square-root", `\\sqrt{${n * n}}`, rational(n), "radical", "The radicand is a perfect square.", "被开方数是完全平方数。") });
    add("negative-perfect-root", "easy", "radical", rng => { const n = rng.int(2, 20); return expression("negative-perfect-root", `-\\sqrt{${n * n}}`, rational(-n), "radical", "The square root is an integer, then the outside minus sign makes it negative.", "平方根是整数，根号外的负号使结果为负整数。") });
    add("perfect-cube-root", "easy", "radical", rng => { const n = rng.int(2, 7); return expression("perfect-cube-root", `\\sqrt[3]{${n ** 3}}`, rational(n), "radical", "The radicand is a perfect cube.", "被开方数是完全立方数。") });
    add("integer-power", "easy", "power", rng => { const base = rng.int(2, 9); const exponent = rng.int(2, 5); return expression("integer-power", `${base}^{${exponent}}`, rational(base ** exponent), "power", "An integer raised to a nonnegative integer power remains an integer.", "整数的非负整数次幂仍是整数。") });
    add("negative-base-even-power", "easy", "power", rng => { const base = rng.int(2, 8); const exponent = rng.choice([2, 4]); return expression("negative-base-even-power", `(-${base})^{${exponent}}`, rational(base ** exponent), "power", "The negative base is inside parentheses and the exponent is even.", "负底数在括号内且指数为偶数，结果为正整数。") });
    add("integer-sum", "easy", "operation", rng => { const a = rng.int(-100, 100); const b = rng.int(-100, 100); return expression("integer-sum", `${a}${b < 0 ? "" : "+"}${b}`, rational(a + b), "operation", "Adding integers gives an integer.", "整数相加仍是整数。") });
    add("fraction-sum", "easy", "operation", rng => { const a = rng.int(1, 11); const b = rng.int(2, 12); const c = rng.int(1, 11); const d = rng.int(2, 12); return expression("fraction-sum", `\\frac{${a}}{${b}}+\\frac{${c}}{${d}}`, addRational(rational(a, b), rational(c, d)), "operation", "A sum of rational numbers is rational.", "有理数之和仍是有理数。") });

    add("repeating-decimal", "medium", "decimal", rng => { const digit = rng.int(1, 9); return expression("repeating-decimal", `0.\\overline{${digit}}`, rational(digit, 9), "decimal", "An explicitly repeating decimal is rational.", "明确循环的小数可以写成分数，因此是有理数。") });
    add("two-digit-repeating", "medium", "decimal", rng => { const n = rng.int(10, 98); return expression("two-digit-repeating", `0.\\overline{${n}}`, rational(n, 99), "decimal", "An explicitly repeating decimal is rational.", "明确循环的小数可以写成分数，因此是有理数。") });
    add("nonperfect-square-root", "medium", "radical", rng => { const n = rng.choice(NON_SQUARES); return expression("nonperfect-square-root", `\\sqrt{${n}}`, irrational("sqrt", rational(1), rational(0), n), "radical", "The square root of this non-square positive integer is irrational.", "正整数不是完全平方数，因此其平方根是无理数。") });
    add("negative-nonperfect-root", "medium", "radical", rng => { const n = rng.choice(NON_SQUARES); return expression("negative-nonperfect-root", `-\\sqrt{${n}}`, irrational("sqrt", rational(-1), rational(0), n), "radical", "Changing the sign of an irrational real number does not make it rational.", "无理实数变号后仍是无理数。") });
    add("coefficient-radical", "medium", "radical", rng => { const n = rng.choice(NON_SQUARES); const c = rng.int(2, 7); return expression("coefficient-radical", `${c}\\sqrt{${n}}`, irrational("sqrt", rational(c), rational(0), n), "radical", "A nonzero rational multiple of this irrational radical remains irrational.", "非零有理数乘无理根式后仍是无理数。") });
    add("integer-plus-radical", "medium", "operation", rng => { const n = rng.choice(NON_SQUARES); const a = nonZeroInt(rng, -12, 12); return expression("integer-plus-radical", `${a}+\\sqrt{${n}}`, irrational("sqrt", rational(1), rational(a), n), "operation", "Adding a rational integer to this irrational radical remains irrational.", "有理整数与无理根式相加仍是无理数。") });
    add("noncube-root", "medium", "radical", rng => { const n = rng.choice(NON_CUBES); return expression("noncube-root", `\\sqrt[3]{${n}}`, irrational("cuberoot", rational(1), rational(0), n), "radical", "This integer is not a perfect cube, so its cube root is irrational.", "该整数不是完全立方数，因此其立方根是无理数。") });
    add("pi-multiple", "medium", "constant", rng => { const c = nonZeroInt(rng, -8, 8); return expression("pi-multiple", `${c}\\pi`, irrational("pi", rational(c)), "constant", "A nonzero rational multiple of pi is irrational.", "π 的非零有理数倍仍是无理数。") });
    add("pi-shift", "medium", "operation", rng => { const a = nonZeroInt(rng, -10, 10); return expression("pi-shift", `${a}+\\pi`, irrational("pi", rational(1), rational(a)), "operation", "Adding a rational number to pi remains irrational.", "有理数与 π 相加仍是无理数。") });
    add("e-shift", "medium", "operation", rng => { const a = nonZeroInt(rng, -10, 10); return expression("e-shift", `e${a < 0 ? "" : "+"}${a}`, irrational("e", rational(1), rational(a)), "operation", "Adding a rational number to e remains irrational.", "有理数与 e 相加仍是无理数。") });
    add("radical-square", "medium", "power", rng => { const n = rng.choice(NON_SQUARES); return expression("radical-square", `(\\sqrt{${n}})^2`, rational(n), "power", "Squaring the principal square root returns the radicand.", "主平方根再平方等于被开方数。") });
    add("radical-product", "medium", "operation", rng => { const n = rng.choice(NON_SQUARES.slice(0, 10)); return expression("radical-product", `\\sqrt{${n}}\\cdot\\sqrt{${n}}`, rational(n), "operation", "The product is the radicand, an integer.", "相同正根式相乘等于被开方数，是整数。") });
    add("finite-plus-fraction", "medium", "operation", rng => { const n = rng.int(1, 99); const d = rng.int(2, 24); return expression("finite-plus-fraction", `${(n / 100).toFixed(2)}+\\frac{1}{${d}}`, addRational(rational(n, 100), rational(1, d)), "operation", "Both terms are rational, so their sum is rational.", "两项都是有理数，因此和仍是有理数。") });
    add("simple-imaginary", "medium", "complex", rng => { const b = nonZeroInt(rng, -9, 9); return expression("simple-imaginary", `${b === 1 ? "" : b === -1 ? "-" : b}i`, complex(rational(0), rational(b)), "complex", "The nonzero imaginary part makes this non-real; its real part is zero.", "虚部非零，所以它不是实数；实部为 0，所以是纯虚数。") });

    add("pure-imaginary", "hard", "complex", rng => { const b = nonZeroInt(rng, -12, 12); return expression("pure-imaginary", `${b === 1 ? "" : b === -1 ? "-" : b}i`, complex(rational(0), rational(b)), "complex", "Its real part is zero and its imaginary coefficient is nonzero.", "它的实部为 0，虚部系数非零。") });
    add("fractional-imaginary", "hard", "complex", rng => { const n = nonZeroInt(rng, -12, 12); const d = rng.int(2, 12); const value = complex(rational(0), rational(n, d)); return expression("fractional-imaginary", valueLatex(value), value, "complex", "Its real part is zero and its imaginary coefficient is a nonzero rational number.", "实部为 0，虚部系数是非零有理数。") });
    add("standard-complex", "hard", "complex", rng => { const a = nonZeroInt(rng, -12, 12); const b = nonZeroInt(rng, -12, 12); return expression("standard-complex", `${a}${b < 0 ? "" : "+"}${b === 1 ? "" : b === -1 ? "-" : b}i`, complex(rational(a), rational(b)), "complex", "A nonzero imaginary part makes the number non-real, and the nonzero real part means it is not pure imaginary.", "虚部非零使它成为非实复数；实部也非零，所以不是纯虚数。") });
    add("even-i-power", "hard", "power", rng => { const k = rng.int(1, 10); const exponent = 2 * k; const value = k % 2 ? -1 : 1; return expression("even-i-power", `i^{${exponent}}`, rational(value), "power", "Powers of i repeat every four; this even power is real.", "i 的幂以 4 为周期；这个偶数次幂是实数。") });
    add("odd-i-power", "hard", "power", rng => { const exponent = rng.int(0, 9) * 4 + rng.choice([1, 3]); const sign = exponent % 4 === 1 ? 1 : -1; return expression("odd-i-power", `i^{${exponent}}`, complex(rational(0), rational(sign)), "power", "Powers of i repeat every four; this odd power is pure imaginary.", "i 的幂以 4 为周期；这个奇数次幂是纯虚数。") });
    add("negative-perfect-radical", "hard", "radical", rng => { const n = rng.int(2, 12); return expression("negative-perfect-radical", `\\sqrt{-${n * n}}`, complex(rational(0), rational(n)), "radical", "The principal square root equals a positive multiple of i.", "负完全平方数的主平方根是 i 的正倍数。") });
    add("negative-nonsquare-radical", "hard", "radical", rng => { const n = rng.choice(NON_SQUARES); return expression("negative-nonsquare-radical", `\\sqrt{-${n}}`, complex(rational(0), irrational("sqrt", rational(1), rational(0), n)), "radical", "The square root has zero real part and a nonzero irrational imaginary part.", "该平方根实部为 0，虚部是非零无理数。") });
    add("conjugate-sum", "hard", "operation", rng => { const a = nonZeroInt(rng, -10, 10); const b = nonZeroInt(rng, -10, 10); return expression("conjugate-sum", `(${a}+${Math.abs(b)}i)+(${a}-${Math.abs(b)}i)`, rational(2 * a), "operation", "The imaginary parts cancel, leaving a real integer.", "虚部互相抵消，留下实整数。") });
    add("conjugate-difference", "hard", "operation", rng => { const a = nonZeroInt(rng, -10, 10); const b = rng.int(1, 10); return expression("conjugate-difference", `(${a}+${b}i)-(${a}-${b}i)`, complex(rational(0), rational(2 * b)), "operation", "The real parts cancel and the imaginary parts combine.", "实部抵消，虚部合并，结果为纯虚数。") });
    add("complex-sum", "hard", "operation", rng => { const a = nonZeroInt(rng, -8, 8); const b = nonZeroInt(rng, -8, 8); const c = nonZeroInt(rng, -8, 8); let d = 0; do d = nonZeroInt(rng, -8, 8); while (b + d === 0); return expression("complex-sum", `(${a}${b < 0 ? "" : "+"}${b}i)+(${c}${d < 0 ? "" : "+"}${d}i)`, complex(rational(a + c), rational(b + d)), "operation", "Combine real parts and imaginary parts separately.", "分别合并实部和虚部。") });
    add("i-square-shift", "hard", "operation", rng => { const a = rng.int(-20, 20); return expression("i-square-shift", `${a}+i^2`, rational(a - 1), "operation", "Because i squared is -1, the result is real.", "因为 i 的平方等于 -1，结果是实数。") });

    add("pi-cancellation", "expert", "operation", rng => { const a = rng.int(-20, 20); return expression("pi-cancellation", `(${a}+\\pi)-\\pi`, rational(a), "operation", "The two pi terms cancel exactly.", "两个 π 项完全抵消。") });
    add("radical-cancellation", "expert", "operation", rng => { const n = rng.choice(NON_SQUARES); const a = rng.int(-20, 20); return expression("radical-cancellation", `(${a}+\\sqrt{${n}})-\\sqrt{${n}}`, rational(a), "operation", "The equal radical terms cancel exactly.", "相同根式项完全抵消。") });
    add("conjugate-product", "expert", "operation", rng => { const a = nonZeroInt(rng, -9, 9); const b = nonZeroInt(rng, -9, 9); return expression("conjugate-product", `(${a}+${Math.abs(b)}i)(${a}-${Math.abs(b)}i)`, rational(a * a + b * b), "operation", "A complex number times its conjugate is the real number a squared plus b squared.", "复数与其共轭的乘积等于实数 a²+b²。") });
    add("complex-square", "expert", "operation", rng => { const a = nonZeroInt(rng, -6, 6); const b = nonZeroInt(rng, -6, 6); return expression("complex-square", `(${a}${b < 0 ? "" : "+"}${b}i)^2`, complex(rational(a * a - b * b), rational(2 * a * b)), "operation", "Expanding and using i squared equals -1 leaves a nonzero imaginary part.", "展开并使用 i²=-1 后，结果仍有非零虚部。") });
    add("i-power-plus", "expert", "operation", rng => { const exponent = rng.int(5, 40); const a = nonZeroInt(rng, -12, 12); const residue = exponent % 4; const value = residue === 0 ? rational(a + 1) : residue === 2 ? rational(a - 1) : complex(rational(a), rational(residue === 1 ? 1 : -1)); return expression("i-power-plus", `${a}+i^{${exponent}}`, value, "operation", "Reduce the power of i modulo four before classifying the result.", "先把 i 的指数按模 4 化简，再判断结果所属数系。") });
    add("negative-root-shift", "expert", "operation", rng => { const n = rng.int(2, 10); const a = nonZeroInt(rng, -10, 10); return expression("negative-root-shift", `${a}+\\sqrt{-${n * n}}`, complex(rational(a), rational(n)), "operation", "The negative square root contributes a nonzero imaginary part.", "负数平方根产生非零虚部。") });
    add("complex-cancellation-real", "expert", "operation", rng => { const a = nonZeroInt(rng, -10, 10); const b = nonZeroInt(rng, -10, 10); return expression("complex-cancellation-real", `(${a}+${Math.abs(b)}i)+(${a}-${Math.abs(b)}i)`, rational(2 * a), "operation", "Opposite imaginary parts cancel exactly.", "相反的虚部完全抵消。") });
    add("complex-cancellation-pure", "expert", "operation", rng => { const a = nonZeroInt(rng, -10, 10); const b = rng.int(1, 10); return expression("complex-cancellation-pure", `(${a}+${b}i)-(${a}-${b}i)`, complex(rational(0), rational(2 * b)), "operation", "Equal real parts cancel while the imaginary parts add.", "相同实部抵消，虚部相加。") });
    add("radical-quotient-integer", "expert", "fraction", rng => { const n = rng.int(2, 15); return expression("radical-quotient-integer", `\\frac{\\sqrt{${n * n * 4}}}{2}`, rational(n), "fraction", "The radical simplifies before division, giving an integer.", "先化简根式再除法，结果是整数。") });
    add("rational-power-negative", "expert", "power", rng => { const a = rng.int(2, 9); const b = rng.int(2, 9); const exponent = rng.int(1, 3); return expression("rational-power-negative", `(\\frac{${a}}{${b}})^{-${exponent}}`, rational(b ** exponent, a ** exponent), "power", "A negative exponent takes the reciprocal; the result remains rational.", "负指数表示取倒数，结果仍是有理数。") });
    add("mixed-radical-sum", "expert", "operation", rng => { const n = rng.choice(NON_SQUARES); return expression("mixed-radical-sum", `2\\sqrt{${n}}-\\sqrt{${n}}`, irrational("sqrt", rational(1), rational(0), n), "operation", "Like radical terms combine to one irrational radical.", "同类根式合并后仍是无理根式。") });
    add("nonreal-product", "expert", "operation", rng => { let a; let b; let c; let d; let imag; do { a = nonZeroInt(rng, -6, 6); b = nonZeroInt(rng, -6, 6); c = nonZeroInt(rng, -6, 6); d = nonZeroInt(rng, -6, 6); imag = a * d + b * c; } while (!imag); const real = a * c - b * d; return expression("nonreal-product", `(${a}${b < 0 ? "" : "+"}${b}i)(${c}${d < 0 ? "" : "+"}${d}i)`, complex(rational(real), rational(imag)), "operation", "Expand the product and use i squared equals -1; a nonzero imaginary part remains.", "展开并使用 i²=-1；结果仍有非零虚部。") });

    return Object.freeze(factories);
  }

  const FACTORIES = makeFactories();
  const LEVEL_ORDER = { easy: 0, medium: 1, hard: 2, expert: 3 };

  function eligibleFactories(difficulty) {
    const rank = LEVEL_ORDER[difficulty] ?? 3;
    return FACTORIES.filter(factory => LEVEL_ORDER[factory.level] <= rank);
  }

  const TARGETS = Object.freeze({
    easy: ["natural", "whole", "integer", "rational"],
    medium: ["natural", "whole", "integer", "rational", "irrational", "real"],
    hard: [...SYSTEMS],
    expert: [...SYSTEMS]
  });

  function answerObject(expressionValue) { return { latex: expressionValue.latex, key: valueKey(expressionValue.value) }; }

  function uniqueExpressions(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = valueKey(item.value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildPool(rng, difficulty, size = 180) {
    const factories = eligibleFactories(difficulty);
    const pool = [];
    for (let index = 0; index < size; index += 1) {
      const factory = factories[index % factories.length];
      try { pool.push(factory.build(rng.fork(`${factory.id}:${index}`))); } catch { /* retry with other expressions */ }
    }
    return uniqueExpressions(pool);
  }

  function supplementPool(pool, rng, factoryIds, size = 72) {
    const factories = FACTORIES.filter(factory => factoryIds.includes(factory.id));
    const supplemental = [];
    for (let index = 0; index < size; index += 1) {
      const factory = factories[index % factories.length];
      try { supplemental.push(factory.build(rng.fork(`supplement:${factory.id}:${index}`))); } catch { /* try the next controlled value */ }
    }
    return uniqueExpressions([...pool, ...supplemental]);
  }

  function chooseTarget(profile, rng) {
    const allowed = TARGETS[profile.difficulty] || TARGETS.expert;
    const preferred = profile.targets?.filter(target => allowed.includes(target)) || [];
    return rng.choice(preferred.length ? preferred : allowed);
  }

  function selectBalancedOptions(pool, target, rng, correctBelongs, preferredCorrectRecipes) {
    if (target === "natural") pool = pool.filter(item => valueKey(item.value) !== "q:0/1");
    let correctPool = pool.filter(item => belongs(item.value, target) === correctBelongs);
    const distractorPool = pool.filter(item => belongs(item.value, target) !== correctBelongs);
    if (preferredCorrectRecipes) {
      const preferred = correctPool.filter(item => preferredCorrectRecipes.includes(item.id));
      if (preferred.length) correctPool = preferred;
    }
    if (!correctPool.length || distractorPool.length < 5) return null;
    const answer = rng.choice(correctPool);
    const selected = [];
    const usedSurfaces = new Set([answer.surface]);
    for (const item of rng.shuffle(distractorPool)) {
      if (selected.length >= 5) break;
      if (selected.some(existing => valueKey(existing.value) === valueKey(item.value))) continue;
      if (usedSurfaces.size < 3 && usedSurfaces.has(item.surface) && distractorPool.some(candidate => !usedSurfaces.has(candidate.surface))) continue;
      selected.push(item);
      usedSurfaces.add(item.surface);
    }
    for (const item of rng.shuffle(distractorPool)) {
      if (selected.length >= 5) break;
      if (!selected.some(existing => valueKey(existing.value) === valueKey(item.value))) selected.push(item);
    }
    if (selected.length < 5 || new Set([answer, ...selected].map(item => item.surface)).size < 3) return null;
    return { answer, distractors: selected };
  }

  function promptFor(target, style, lang) {
    const prompts = {
      member: {
        en: `Which expression belongs to the ${LABELS.en[target]}?`,
        zh: `下列哪个表达式属于${LABELS.zh[target]}？`
      },
      outsider: {
        en: `Which expression is not a member of the ${LABELS.en[target]}?`,
        zh: `下列哪个表达式不属于${LABELS.zh[target]}？`
      },
      translate: {
        en: `Which expression simplifies to a value in the ${LABELS.en[target]}?`,
        zh: `化简后，哪个表达式的值属于${LABELS.zh[target]}？`
      },
      counterexample: {
        en: `A student classified every expression as a ${LABELS.en[target]} value. Which expression is a counterexample?`,
        zh: `一名学生认为所有表达式都属于${LABELS.zh[target]}。哪一项是反例？`
      }
    };
    return prompts[style]?.[lang] || prompts.outsider[lang];
  }

  function targetAdvice(target, lang) {
    return L(
      lang,
      `Simplify every expression exactly, then test the definition of ${LABELS.en[target]}. Do not classify from appearance alone.`,
      `先精确化简每个表达式，再根据${LABELS.zh[target]}的定义判断；不要只看表达式外形。`
    );
  }

  function systemAnswer(system, lang) {
    return { latex: `\\text{${LABELS[lang][system]}}`, key: `system:${system}` };
  }

  function specificSystemExplanation(expressionValue, optionSystem, correctSystem, lang) {
    if (optionSystem === correctSystem) {
      return L(lang, `This is the smallest named number system that contains the simplified value.`, `这是包含该化简结果的最具体数系。`);
    }
    if (belongs(expressionValue, optionSystem)) {
      return L(
        lang,
        `The value also belongs to the ${LABELS.en[optionSystem]}, but the ${LABELS.en[correctSystem]} are more specific.`,
        `该值也属于${LABELS.zh[optionSystem]}，但${LABELS.zh[correctSystem]}是更具体的分类。`
      );
    }
    return L(lang, `The simplified value does not belong to the ${LABELS.en[optionSystem]}.`, `该化简结果不属于${LABELS.zh[optionSystem]}。`);
  }

  function buildMostSpecificQuestion(profile, lang, local, pool) {
    let candidates = pool.filter(item => valueKey(item.value) !== "q:0/1");
    if (Array.isArray(profile.targets) && profile.targets.length) {
      candidates = candidates.filter(item => profile.targets.includes(mostSpecificSystem(item.value)));
    }
    if (profile.preferredAnswerRecipes) {
      const preferred = candidates.filter(item => profile.preferredAnswerRecipes.includes(item.id));
      if (preferred.length) candidates = preferred;
    }
    if (!candidates.length) return null;
    const source = local.choice(candidates);
    const correctSystem = mostSpecificSystem(source.value);
    const distractorSystems = local.shuffle(SYSTEMS.filter(system => system !== correctSystem)).slice(0, 5);
    if (distractorSystems.length < 5) return null;
    const optionSystems = [correctSystem, ...distractorSystems];
    const analysisByKey = Object.fromEntries(optionSystems.map(system => [`system:${system}`, {
      latex: systemAnswer(system, lang).latex,
      simplifiedLatex: valueLatex(source.value),
      analysisLatex: systemAnswer(system, lang).latex,
      belongs: belongs(source.value, system),
      isCorrect: system === correctSystem,
      explanation: {
        en: specificSystemExplanation(source.value, system, correctSystem, "en"),
        zh: specificSystemExplanation(source.value, system, correctSystem, "zh")
      },
      systems: [system]
    }]));
    const fullPrompt = L(
      lang,
      "After simplifying the expression, which is the most specific number system that contains its value?",
      "化简这个表达式后，包含其值的最具体数系是哪一个？"
    );
    return {
      type: correctSystem,
      main: `\\text{${L(lang, "Classify", "分类")}: }${source.latex}`,
      plain: `${fullPrompt} ${source.latex}`,
      prompt: fullPrompt,
      answer: systemAnswer(correctSystem, lang),
      distractors: distractorSystems.map(system => systemAnswer(system, lang)),
      suggestion: L(lang, "Simplify first, then choose the smallest named set in the number-system hierarchy.", "先精确化简，再选择数系包含关系中最具体的一个。"),
      lines: [{ line: `${source.latex}=${valueLatex(source.value)}`, note: specificSystemExplanation(source.value, correctSystem, correctSystem, lang) }],
      parameters: {
        targetSystem: correctSystem,
        targetLabel: LABELS[lang][correctSystem],
        taskKind: "most-specific",
        promptStyle: profile.promptStyle,
        recipeId: profile.recipeId,
        semanticFamily: profile.familyId,
        expressionRecipes: [source.id],
        sourceExpressionLatex: source.latex,
        sourceSimplifiedLatex: valueLatex(source.value),
        analysisByKey
      },
      audit: {
        target: correctSystem,
        taskKind: "most-specific",
        correctKey: `system:${correctSystem}`,
        optionValues: optionSystems.map(system => ({ key: `system:${system}`, memberships: [system], isCorrect: system === correctSystem, recipe: source.id, surface: "system-label" }))
      }
    };
  }

  function buildQuestion(profile, context) {
    const lang = langOf(context);
    const rng = context.rng;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const local = rng.fork(`question:${attempt}`);
      let pool = buildPool(local, profile.difficulty, 220);
      if (profile.difficulty === "medium" && profile.targets?.some(target => target === "pure-imaginary" || target === "nonreal-complex")) {
        pool = supplementPool(pool, local, [
          "odd-i-power", "negative-perfect-radical", "conjugate-difference", "standard-complex"
        ]);
      }
      if (profile.taskKind === "most-specific") {
        const classificationQuestion = buildMostSpecificQuestion(profile, lang, local, pool);
        if (classificationQuestion) return classificationQuestion;
        continue;
      }
      const target = chooseTarget(profile, local);
      const correctBelongs = profile.taskKind === "find-member";
      const picked = selectBalancedOptions(pool, target, local, correctBelongs, profile.preferredAnswerRecipes);
      if (!picked) continue;
      const all = [picked.answer, ...picked.distractors];
      const analysisByKey = Object.fromEntries(all.map(item => [valueKey(item.value), {
        latex: item.latex,
        simplifiedLatex: valueLatex(item.value),
        analysisLatex: `${item.latex}=${valueLatex(item.value)}`,
        belongs: belongs(item.value, target),
        isCorrect: belongs(item.value, target) === correctBelongs,
        explanation: { en: explainExpression(item, "en"), zh: explainExpression(item, "zh") },
        systems: [...memberships(item.value)]
      }]));
      const fullPrompt = promptFor(target, profile.promptStyle, lang);
      return {
        type: target,
        main: `\\text{${L(lang, "Target system", "目标数系")}: }${TARGET_SYMBOLS[target]}`,
        plain: fullPrompt,
        prompt: fullPrompt,
        answer: answerObject(picked.answer),
        distractors: picked.distractors.map(answerObject),
        suggestion: targetAdvice(target, lang),
        lines: [{ line: `${picked.answer.latex}=${valueLatex(picked.answer.value)}`, note: explainExpression(picked.answer, lang) }],
        parameters: {
          targetSystem: target,
          targetLabel: LABELS[lang][target],
          taskKind: profile.taskKind,
          promptStyle: profile.promptStyle,
          recipeId: profile.recipeId,
          semanticFamily: profile.familyId,
          expressionRecipes: all.map(item => item.id),
          analysisByKey
        },
        audit: {
          target,
          taskKind: profile.taskKind,
          correctKey: valueKey(picked.answer.value),
          optionValues: all.map(item => ({ key: valueKey(item.value), memberships: [...memberships(item.value)], isCorrect: belongs(item.value, target) === correctBelongs, recipe: item.id, surface: item.surface }))
        }
      };
    }
    throw new Error(`Unable to build a valid number-system question for ${profile.difficulty}.`);
  }

  function validateQuestion(question, helpers) {
    const parameters = question.parameters || {};
    const analysis = parameters.analysisByKey || {};
    const target = parameters.targetSystem;
    const options = question.options || [];
    const rows = options.map(option => analysis[option.key]).filter(Boolean);
    if (rows.length !== options.length) return false;
    if (rows.filter(row => row.isCorrect).length !== 1) return false;
    if (!rows.find(row => row.isCorrect) || rows.find(row => row.isCorrect) !== analysis[question.answer.key]) return false;
    if (new Set(rows.map(row => row.latex)).size !== rows.length) return false;
    if (new Set(rows.map(row => analysisKey(row))).size !== rows.length) return false;
    if (new Set(rows.map(row => row.systems.includes(target))).size < 2) return false;
    const lang = helpers.lang;
    question.lines = rows.map((row, index) => ({
      line: row.analysisLatex || `${row.latex}=${row.simplifiedLatex}`,
      note: `${String.fromCharCode(65 + index)}. ${row.explanation[lang]}`
    }));
    question.parameters = {
      ...parameters,
      optionAnalysis: rows.map((row, index) => ({
        label: String.fromCharCode(65 + index),
        latex: row.latex,
        simplifiedLatex: row.simplifiedLatex,
        analysisLatex: row.analysisLatex || `${row.latex}=${row.simplifiedLatex}`,
        belongs: row.belongs,
        isCorrect: row.isCorrect,
        explanation: row.explanation[lang]
      }))
    };
    return true;
  }

  function analysisKey(row) { return `${row.simplifiedLatex}|${row.belongs}`; }

  const text = {
    en: {
      toolBadge: "Algebra II · Precalculus",
      title: "Number Systems Classification Practice",
      subtitle: "Classify exact values across the real and complex number systems after simplifying each expression.",
      note: "Questions alternate between finding a member, finding a counterexample, and choosing the most specific number system. Every question has exactly one correct answer.",
      questionTitle: "Simplify exactly, then classify the value.",
      difficultyOptions: {
        easy: "Easy: natural, whole, integer, and rational numbers",
        medium: "Medium: radicals, constants, irrational and real numbers",
        hard: "Hard: imaginary values, complex numbers, and powers of i",
        expert: "Expert: misleading forms and multi-step exact simplification",
        mixed: "Mixed: balanced practice across all four levels"
      }
    },
    zh: {
      toolBadge: "代数 II · 预备微积分",
      title: "数系分类专项练习",
      subtitle: "先精确化简表达式，再在实数与复数体系中判断其所属类别。",
      note: "题目会交替要求找出成员、反例或最具体数系；每题都只有一个正确答案。",
      questionTitle: "精确化简后，再判断数系归属。",
      difficultyOptions: {
        easy: "简单：自然数、非负整数、整数与有理数",
        medium: "中等：根式、常数、无理数与实数",
        hard: "困难：虚数、复数与 i 的幂",
        expert: "专家：迷惑外形与多步精确化简",
        mixed: "混合：均衡覆盖四档难度"
      }
    }
  };

  root.MCLNumberSystems = Object.freeze({
    SYSTEMS, LABELS, rational, irrational, complex, valueKey, valueLatex, memberships, belongs,
    FACTORIES, TARGETS, buildQuestion, validateQuestion, explainExpression
  });

  root.MCLQuizTool = {
    gameId: "number-systems-classification",
    course: "algebra-2",
    text,
    builders: { easy: [], medium: [], hard: [], expert: [] },
    balancedMixed: true,
    avoidConsecutiveTypes: true,
    validateQuestion,
    validateSequenceCandidate(question, previousQuestions) {
      const recent = previousQuestions.slice(-3);
      if (recent.at(-1)?.type === question.type) return false;
      if (recent.at(-1)?.parameters?.promptStyle === question.parameters?.promptStyle) return false;
      return !recent.some(item => item.parameters?.recipeId === question.parameters?.recipeId);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
