(function () {
  "use strict";

  const registry = window.MCLQuestionTemplates;
  if (!registry || !window.MCLQuizTool) return;

  const concepts = [
    { id: "factors-multiples" },
    { id: "prime-factorization" },
    { id: "greatest-common-factor" },
    { id: "least-common-multiple" },
    { id: "relations-applications" }
  ];
  const forms = registry.TASK_FORMS;
  const variants = ["symbolic", "table", "condition", "context"];

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function divisors(n) {
    const result = [];
    for (let value = 1; value <= Math.sqrt(n); value += 1) {
      if (n % value !== 0) continue;
      result.push(value);
      if (value * value !== n) result.push(n / value);
    }
    return result.sort((a, b) => a - b);
  }

  function factorMap(n) {
    let rest = n;
    const factors = new Map();
    for (let prime = 2; prime * prime <= rest; prime += 1) {
      while (rest % prime === 0) {
        factors.set(prime, (factors.get(prime) || 0) + 1);
        rest /= prime;
      }
    }
    if (rest > 1) factors.set(rest, (factors.get(rest) || 0) + 1);
    return factors;
  }

  function leastPositiveLcmPartner(known, target) {
    if (known <= 0 || target <= 0 || target % known !== 0) return null;
    const knownFactors = factorMap(known);
    let result = 1;
    factorMap(target).forEach((targetExponent, prime) => {
      if (targetExponent > (knownFactors.get(prime) || 0)) result *= prime ** targetExponent;
    });
    return result;
  }

  function factorLatex(n) {
    return [...factorMap(n)].map(([prime, exponent]) => exponent === 1 ? `${prime}` : `${prime}^{${exponent}}`).join("\\cdot");
  }

  function setLatex(values) {
    return `\\{${values.join(",")}\\}`;
  }

  function textLatex(value) {
    const escaped = String(value).replaceAll("\\", "\\textbackslash{}").replaceAll("{", "\\{").replaceAll("}", "\\}");
    return `\\text{${escaped}}`;
  }

  function answerKey(value) {
    return registry.answerKey(value);
  }

  function unique(values) {
    return [...new Map(values.map(value => [answerKey(value), String(value)])).values()];
  }

  function numericDistractors(answer, extras = []) {
    const step = Math.max(2, Math.min(12, Math.round(Math.abs(answer) / 4)));
    const candidates = [
      ...extras, answer + 1, answer - 1, answer + 2, answer - 2,
      answer + step, answer - step, answer * 2, answer * 3,
      Math.max(1, Math.floor(answer / 2)), Math.max(1, answer - 2 * step)
    ];
    for (let offset = 1; candidates.length < 30; offset += 1) {
      candidates.push(answer + offset, Math.max(0, answer - offset));
    }
    return unique(candidates.filter(value => Number.isFinite(value) && value >= 0).map(String))
      .filter(value => answerKey(value) !== answerKey(String(answer))).slice(0, 8);
  }

  function make(main, answer, distractors, meta = {}) {
    return {
      main,
      plain: main,
      answer: String(answer),
      distractors: unique(distractors).filter(value => answerKey(value) !== answerKey(String(answer))).slice(0, 8),
      prompt: meta.prompt || "",
      lines: meta.lines || [{ line: main, note: meta.note || "" }, { line: String(answer), note: meta.final || "" }],
      suggestion: meta.suggestion || "",
      parameters: meta.parameters || null
    };
  }

  function numberQuestion(main, answer, extras, meta) {
    return make(main, answer, numericDistractors(answer, extras), meta);
  }

  function pairWithGcd(rng, variant) {
    const common = rng.int(variant < 2 ? 2 : 4, variant < 2 ? 10 : 18);
    const coprimePairs = [[2, 3], [3, 4], [3, 5], [4, 5], [5, 6], [5, 7], [7, 8], [7, 9], [8, 9], [9, 10], [11, 12]];
    const [m, n] = rng.choice(coprimePairs.slice(0, variant < 2 ? 7 : coprimePairs.length));
    return { a: common * m, b: common * n, common, m, n };
  }

  function factorsFamily(task, variant, rng, t) {
    const n = rng.int(variant < 2 ? 4 : 7, variant < 2 ? 12 : 20) * rng.int(2, variant < 2 ? 6 : 9);
    const list = divisors(n);
    if (task === "direct") {
      return numberQuestion(`${n}\\text{ has how many positive factors?}`, list.length, [list.length + 2, n, Math.floor(n / 2)], {
        prompt: t.countFactors, lines: [{ line: setLatex(list), note: t.listFactors }, { line: String(list.length), note: t.final }], parameters: { n, list }
      });
    }
    if (task === "inverse") {
      const multiplier = rng.int(2, variant < 2 ? 8 : 14);
      const product = n * multiplier;
      return numberQuestion(`${n}\\cdot\\Box=${product}`, multiplier, [n, product, product - n], {
        prompt: t.missingMultiplier, lines: [{ line: `${product}\\div${n}=${multiplier}`, note: t.divide }, { line: String(multiplier), note: t.final }], parameters: { n, multiplier, product }
      });
    }
    if (task === "interpret") {
      const answer = rng.choice(list.filter(value => value > 1 && value < n));
      const nonFactors = [];
      for (let value = 2; nonFactors.length < 8; value += 1) if (n % value !== 0) nonFactors.push(value);
      return make(`${textLatex(t.whichFactor)}\\;${n}?`, answer, nonFactors, {
        prompt: t.testDivisibility, lines: [{ line: `${n}\\div${answer}=${n / answer}`, note: t.wholeNumber }, { line: String(answer), note: t.final }], parameters: { n, answer }
      });
    }
    if (task === "translate") {
      const answer = setLatex(list);
      const trimmed = list.slice(0, -1);
      const shifted = list.map((value, index) => index === list.length - 1 ? value + 1 : value);
      return make(`${textLatex(t.factorSetOf)}\\;${n}`, answer, [
        setLatex(trimmed), setLatex(shifted), setLatex([1, n]), setLatex(list.filter(value => value % 2 === 0)),
        setLatex([...list, n + 1]), setLatex(list.filter(value => value !== 1)), setLatex(divisors(n + 1))
      ], { prompt: t.chooseCompleteSet, lines: [{ line: answer, note: t.listFactors }], parameters: { n, list } });
    }
    const factor = rng.choice(list.filter(value => value > 1));
    const trueStatement = `${factor}\\mid ${n}`;
    const falseValues = [];
    for (let value = 2; falseValues.length < 8; value += 1) if (n % value !== 0) falseValues.push(`${value}\\mid ${n}`);
    return make(textLatex(t.chooseTrueDivisibility), trueStatement, falseValues, {
      prompt: t.diagnose, lines: [{ line: `${n}=${factor}\\cdot${n / factor}`, note: t.verify }], parameters: { n, factor }
    });
  }

  function primeFamily(task, variant, rng, t) {
    const primes = [2, 3, 5, 7];
    const p = primes[variant % primes.length];
    const q = rng.choice(primes.filter(value => value !== p));
    const e = rng.int(variant < 2 ? 1 : 2, variant < 2 ? 3 : 4);
    const f = rng.int(1, variant < 2 ? 2 : 3);
    const n = (p ** e) * (q ** f);
    const factorization = factorLatex(n);
    if (task === "direct") {
      return make(String(n), factorization, [
        `${p}^{${e + 1}}\\cdot${q}^{${f}}`, `${p}^{${e}}\\cdot${q}^{${f + 1}}`, `${p * q}^{${e + f}}`,
        `${p}^{${Math.max(1, e - 1)}}\\cdot${q}^{${f}}`, `${p}^{${e}}+${q}^{${f}}`, `${p * e}\\cdot${q * f}`
      ], { prompt: t.primeFactorize, lines: [{ line: `${n}=${factorization}`, note: t.primeFactors }], parameters: { n, p, q, e, f } });
    }
    if (task === "inverse") {
      return numberQuestion(factorization, n, [p * e + q * f, (p ** f) * (q ** e), p * q, n / p], {
        prompt: t.reconstruct, lines: [{ line: `${factorization}=${n}`, note: t.multiply }], parameters: { n, p, q, e, f }
      });
    }
    if (task === "interpret") {
      return numberQuestion(`${textLatex(t.exponentOf)}\\;${p}\\;${textLatex(t.inFactorizationOf)}\\;${n}`, e, [f, p, q, e + f], {
        prompt: t.readFactorization, lines: [{ line: `${n}=${factorization}`, note: t.primeFactors }, { line: String(e), note: t.exponent }], parameters: { n, p, q, e, f }
      });
    }
    if (task === "translate") {
      const known = n / p;
      return numberQuestion(`${known}\\cdot\\Box=${n},\\quad ${textLatex(t.boxPrime)}`, p, [q, e, f, p * p], {
        prompt: t.missingPrime, lines: [{ line: `${n}\\div${known}=${p}`, note: t.divide }, { line: String(p), note: t.final }], parameters: { n, known, p }
      });
    }
    const correct = `${n}=${factorization}`;
    return make(textLatex(t.chooseCorrectFactorization), correct, [
      `${n}=${p}^{${e + 1}}\\cdot${q}^{${f}}`, `${n}=${p}^{${e}}\\cdot${q}^{${f + 1}}`,
      `${n}=${p * q}^{${e + f}}`, `${n}=${p * e}\\cdot${q * f}`, `${n}=${p}^{${e}}+${q}^{${f}}`,
      `${n}=${q}^{${e}}\\cdot${p}^{${f + 1}}`
    ], { prompt: t.diagnose, lines: [{ line: correct, note: t.verify }], parameters: { n, p, q, e, f } });
  }

  function gcdFamily(task, variant, rng, t) {
    const data = pairWithGcd(rng, variant);
    const { a, b, common } = data;
    if (task === "direct") {
      const third = variant >= 2 ? common * rng.choice([5, 7, 11]) : null;
      const values = third ? [a, b, third] : [a, b];
      const answer = values.reduce(gcd);
      return numberQuestion(`\\gcd(${values.join(",")})`, answer, [lcm(a, b), Math.min(...values), common * 2, Math.abs(a - b)], {
        prompt: t.findGcd, lines: values.map(value => ({ line: `${value}=${factorLatex(value)}`, note: t.primeFactors })).concat([{ line: `\\gcd=${answer}`, note: t.commonPowers }]), parameters: { values, answer }
      });
    }
    if (task === "inverse") {
      const candidates = [5, 7, 11, 13, 17, 19, 23, 29].map(value => common * value);
      const answer = candidates.find(value => gcd(a, value) === common);
      const wrong = [];
      for (let value = 1; wrong.length < 8; value += 1) {
        const candidate = common * value;
        if (candidate !== answer && gcd(a, candidate) !== common) wrong.push(candidate);
      }
      return make(`\\gcd(${a},\\Box)=${common}`, answer, wrong, {
        prompt: t.findMissingGcdValue, lines: [{ line: `${a}=${factorLatex(a)}`, note: t.primeFactors }, { line: `\\gcd(${a},${answer})=${common}`, note: t.verify }], parameters: { a, common, answer }
      });
    }
    if (task === "interpret") {
      const count = divisors(common).length;
      return numberQuestion(`${textLatex(t.howManyCommonFactors)}\\;${a}\\;${textLatex(t.and)}\\;${b}?`, count, [divisors(a).length, divisors(b).length, common, count + 2], {
        prompt: t.interpretCommonFactors, lines: [{ line: `\\gcd(${a},${b})=${common}`, note: t.findGcd }, { line: setLatex(divisors(common)), note: t.commonFactors }, { line: String(count), note: t.final }], parameters: { a, b, common, count }
      });
    }
    if (task === "translate") {
      const answer = factorLatex(common);
      return make(`\\begin{gathered}${a}=${factorLatex(a)}\\\\${b}=${factorLatex(b)}\\end{gathered}`, answer, [
        factorLatex(lcm(a, b)), factorLatex(a), factorLatex(b), String(common * 2), String(Math.min(a, b)), `${common}^{2}`,
        `${common}\\cdot2`, `${common}\\cdot3`, `${common}+1`, `${common}-1`
      ], { prompt: t.chooseGcdPrimeProduct, lines: [{ line: `\\gcd(${a},${b})=${answer}=${common}`, note: t.commonPowers }], parameters: { a, b, common } });
    }
    const correct = `${a}\\cdot${b}=${common}\\cdot${lcm(a, b)}`;
    return make(textLatex(t.chooseCorrectGcdCheck), correct, [
      `${a}+${b}=${common}+${lcm(a, b)}`, `${a}\\cdot${b}=${common}+${lcm(a, b)}`,
      `${a}\\cdot${b}=${common}\\cdot${Math.max(a, b)}`, `\\gcd(${a},${b})=${Math.min(a, b)}`,
      `\\gcd(${a},${b})=${lcm(a, b)}`, `${a}\\div${b}=${common}`
    ], { prompt: t.diagnose, lines: [{ line: `\\gcd(${a},${b})=${common}`, note: t.findGcd }, { line: correct, note: t.productIdentity }], parameters: { a, b, common } });
  }

  function lcmFamily(task, variant, rng, t) {
    const { a, b, common } = pairWithGcd(rng, variant);
    const answer = lcm(a, b);
    if (task === "direct") {
      const values = variant >= 2 ? [a, b, common * rng.choice([5, 7, 11])] : [a, b];
      const result = values.reduce(lcm);
      return numberQuestion(`\\operatorname{lcm}(${values.join(",")})`, result, [values.reduce(gcd), a * b, Math.max(...values), result - common], {
        prompt: t.findLcm, lines: values.map(value => ({ line: `${value}=${factorLatex(value)}`, note: t.primeFactors })).concat([{ line: `\\operatorname{lcm}=${result}`, note: t.allPowers }]), parameters: { values, result }
      });
    }
    if (task === "inverse") {
      const leastMissing = leastPositiveLcmPartner(a, answer);
      return numberQuestion(`\\operatorname{lcm}(${a},\\Box)=${answer}`, leastMissing, [b, common, a, answer, b + common], {
        prompt: t.findMissingLcmValue,
        lines: [
          { line: `${a}=${factorLatex(a)}`, note: t.primeFactors },
          { line: `${answer}=${factorLatex(answer)}`, note: t.primeFactors },
          { line: `\\Box=${factorLatex(leastMissing)}=${leastMissing}`, note: t.allPowers },
          { line: `\\operatorname{lcm}(${a},${leastMissing})=${answer}`, note: t.verify }
        ],
        parameters: { a, originalPartner: b, target: answer, leastMissing, inverseKind: "least-lcm" }
      });
    }
    if (task === "interpret") {
      const bound = answer * rng.int(variant < 2 ? 3 : 5, variant < 2 ? 7 : 10);
      const count = Math.floor(bound / answer);
      return numberQuestion(`${textLatex(t.commonMultiplesAtMost)}\\;${bound}\\;${textLatex(t.forNumbers)}\\;${a}\\;${textLatex(t.and)}\\;${b}`, count, [Math.floor(bound / a), Math.floor(bound / b), answer, count + 1], {
        prompt: t.interpretCommonMultiples, lines: [{ line: `\\operatorname{lcm}(${a},${b})=${answer}`, note: t.findLcm }, { line: `${answer},${2 * answer},\\ldots,${count * answer}`, note: t.listMultiples }, { line: String(count), note: t.final }], parameters: { a, b, answer, bound, count }
      });
    }
    if (task === "translate") {
      const correct = `\\{${answer},${2 * answer},${3 * answer}\\}`;
      return make(`${textLatex(t.firstThreeCommonMultiples)}\\;${a}\\;${textLatex(t.and)}\\;${b}`, correct, [
        `\\{${a},${2 * a},${3 * a}\\}`, `\\{${b},${2 * b},${3 * b}\\}`, `\\{${common},${2 * common},${3 * common}\\}`,
        `\\{${answer},${2 * answer},${4 * answer}\\}`, `\\{${answer},${3 * answer},${4 * answer}\\}`, `\\{${2 * answer},${3 * answer},${4 * answer}\\}`
      ], { prompt: t.chooseCommonMultiples, lines: [{ line: `\\operatorname{lcm}=${answer}`, note: t.findLcm }, { line: correct, note: t.listMultiples }], parameters: { a, b, answer } });
    }
    const correct = `\\operatorname{lcm}(${a},${b})=${answer}`;
    return make(textLatex(t.chooseCorrectLcmStatement), correct, [
      `\\operatorname{lcm}(${a},${b})=${common}`, `\\operatorname{lcm}(${a},${b})=${a * b}`,
      `\\operatorname{lcm}(${a},${b})=${Math.max(a, b)}`, `\\operatorname{lcm}(${a},${b})=${answer + common}`,
      `\\operatorname{lcm}(${a},${b})=${answer - common}`, `\\operatorname{lcm}(${a},${b})=${a + b}`
    ], { prompt: t.diagnose, lines: [{ line: `${a}=${factorLatex(a)},\\;${b}=${factorLatex(b)}`, note: t.primeFactors }, { line: correct, note: t.allPowers }], parameters: { a, b, answer } });
  }

  function applicationFamily(task, variant, rng, t) {
    const { a, b, common } = pairWithGcd(rng, variant);
    const cycle = lcm(a, b);
    if (task === "direct") {
      return numberQuestion(textLatex(t.groupingQuestion(a, b)), common, [cycle, Math.min(a, b), a + b, common * 2], {
        prompt: t.modelGcd, lines: [{ line: `\\gcd(${a},${b})=${common}`, note: t.equalGroups }, { line: String(common), note: t.itemsPerGroup }], parameters: { a, b, common, model: "group-size" }
      });
    }
    if (task === "inverse") {
      return numberQuestion(textLatex(t.cycleQuestion(a, b)), cycle, [common, a + b, a * b, Math.max(a, b)], {
        prompt: t.modelLcm, lines: [{ line: `\\operatorname{lcm}(${a},${b})=${cycle}`, note: t.firstTogether }, { line: String(cycle), note: t.minutes }], parameters: { a, b, cycle, model: "cycles" }
      });
    }
    if (task === "interpret") {
      const answer = textLatex(t.useGcd);
      return make(textLatex(t.chooseModelQuestion(a, b)), answer, [
        textLatex(t.useLcm), textLatex(t.useSum), textLatex(t.useDifference), textLatex(t.useProduct), textLatex(t.useAverage), textLatex(t.notEnough)
      ], { prompt: t.chooseModel, lines: [{ line: `\\gcd(${a},${b})`, note: t.equalGroups }], parameters: { a, b, model: "classification" } });
    }
    if (task === "translate") {
      const product = a * b;
      const answer = product / common;
      return numberQuestion(`a=${a},\\;b=${b},\\;\\gcd(a,b)=${common},\\quad \\operatorname{lcm}(a,b)=?`, answer, [common, product, a + b, product - common], {
        prompt: t.useProductRelation, lines: [{ line: `a b=\\gcd(a,b)\\operatorname{lcm}(a,b)`, note: t.productIdentity }, { line: `\\operatorname{lcm}=\\frac{${product}}{${common}}=${answer}`, note: t.divide }], parameters: { a, b, common, answer }
      });
    }
    const coprime = gcd(a / common, b / common) === 1;
    const correct = textLatex(coprime ? t.reducedCoprime : t.reducedNotCoprime);
    return make(`${a}=${common}\\cdot${a / common},\\quad ${b}=${common}\\cdot${b / common}`, correct, [
      textLatex(t.originalCoprime), textLatex(t.gcdIsOne), textLatex(t.lcmIsCommon), textLatex(t.reducedEqual), textLatex(t.noCommonFactorRemoved), textLatex(t.productFalse)
    ], { prompt: t.diagnoseRelation, lines: [{ line: `\\gcd(${a / common},${b / common})=1`, note: t.verify }, { line: correct, note: t.final }], parameters: { a, b, common, coprime } });
  }

  function translations(lang) {
    const zh = lang === "zh";
    const result = zh ? {
      countFactors: "求正因数的数量。", listFactors: "列出全部正因数", final: "最终答案", missingMultiplier: "求缺少的倍数因子。", divide: "用除法求缺少的数",
      whichFactor: "下面哪个数是因数，目标数为", testDivisibility: "检查整除关系。", wholeNumber: "商是整数", factorSetOf: "选择完整的正因数集合，目标数为", chooseCompleteSet: "选择完整且没有多余元素的集合。", chooseTrueDivisibility: "选择正确的整除关系。", diagnose: "选择计算或陈述正确的一项。", verify: "代入验证",
      primeFactorize: "写出标准质因数分解。", primeFactors: "质因数分解", reconstruct: "根据质因数分解还原原数。", multiply: "计算各质因数幂的乘积", exponentOf: "在", inFactorizationOf: "的质因数分解中，质因数的指数是", readFactorization: "读取质因数分解中的指数。", exponent: "对应指数", boxPrime: "方框内为质数", missingPrime: "求缺少的质因数。", chooseCorrectFactorization: "选择正确的质因数分解。",
      findGcd: "求最大公因数。", commonPowers: "取共同质因数的较小指数", findMissingGcdValue: "选择使等式成立的数。", howManyCommonFactors: "这两个数共有多少个正公因数：", and: "和", interpretCommonFactors: "先求 GCD，再统计它的因数。", commonFactors: "全部公因数", chooseGcdPrimeProduct: "根据分解式选择 GCD 的质因数乘积。", chooseCorrectGcdCheck: "选择正确的 GCD 验证关系。", productIdentity: "使用 GCD 与 LCM 的乘积关系",
      findLcm: "求最小公倍数。", allPowers: "取所有质因数的较大指数", findMissingLcmValue: "根据给定 LCM 求缺少的数。", commonMultiplesAtMost: "不超过", forNumbers: "的正公倍数有多少个，两个数为", interpretCommonMultiples: "先求 LCM，再统计其倍数。", listMultiples: "列出公倍数", firstThreeCommonMultiples: "选择前三个正公倍数，两个数为", chooseCommonMultiples: "选择完整的公倍数序列。", chooseCorrectLcmStatement: "选择正确的 LCM 陈述。",
      groupingQuestion: (x, y) => `有 ${x} 支蓝笔和 ${y} 支黑笔。要装成若干完全相同且没有剩余的文具包，每包最多放多少支同色笔？`, modelGcd: "等量分组且没有剩余时使用 GCD。", equalGroups: "最大相同分组量使用 GCD", itemsPerGroup: "每包中每种物品的最大公因数量", cycleQuestion: (x, y) => `两项提醒分别每 ${x} 分钟和 ${y} 分钟出现一次。若现在同时出现，最早多少分钟后再次同时出现？`, modelLcm: "求周期首次重合时使用 LCM。", firstTogether: "最早再次同时发生", minutes: "分钟", chooseModelQuestion: (x, y) => `把 ${x} 个红色物品和 ${y} 个蓝色物品平均装入尽可能多的相同套装且没有剩余，应使用哪种运算？`, chooseModel: "判断情境应使用 GCD 还是 LCM。", useGcd: "使用最大公因数", useLcm: "使用最小公倍数", useSum: "使用两数之和", useDifference: "使用两数之差", useProduct: "直接使用乘积", useAverage: "使用平均数", notEnough: "条件不足", useProductRelation: "使用乘积关系求 LCM。", reducedCoprime: "除去 GCD 后的两个数互质", reducedNotCoprime: "除去给定因数后仍有公因数", originalCoprime: "原来的两个数互质", gcdIsOne: "原数的 GCD 是 1", lcmIsCommon: "LCM 等于被除去的因数", reducedEqual: "约简后的两个数相等", noCommonFactorRemoved: "没有除去任何公因数", productFalse: "两数乘积等于 GCD", diagnoseRelation: "判断约简后的互质关系。"
    } : {
      countFactors: "Count the positive factors.", listFactors: "list every positive factor", final: "final answer", missingMultiplier: "Find the missing multiplier.", divide: "divide to find the missing value",
      whichFactor: "Which number is a factor of", testDivisibility: "Test the divisibility relation.", wholeNumber: "the quotient is a whole number", factorSetOf: "Choose the complete positive factor set of", chooseCompleteSet: "Choose the complete set with no missing or extra values.", chooseTrueDivisibility: "Choose the true divisibility statement.", diagnose: "Choose the correct calculation or statement.", verify: "verify by substitution",
      primeFactorize: "Write the standard prime factorization.", primeFactors: "prime factorization", reconstruct: "Reconstruct the number from its prime factorization.", multiply: "multiply the prime powers", exponentOf: "The exponent of", inFactorizationOf: "in the prime factorization of", readFactorization: "Read an exponent from the prime factorization.", exponent: "required exponent", boxPrime: "the box is a prime number", missingPrime: "Find the missing prime factor.", chooseCorrectFactorization: "Choose the correct prime factorization.",
      findGcd: "Find the greatest common factor.", commonPowers: "take the smaller exponent of each shared prime", findMissingGcdValue: "Choose the value that makes the equation true.", howManyCommonFactors: "How many positive common factors do", and: "and", interpretCommonFactors: "Find the GCD, then count its factors.", commonFactors: "all common factors", chooseGcdPrimeProduct: "Use the factorizations to choose the prime product for the GCD.", chooseCorrectGcdCheck: "Choose the correct relation that verifies the GCD.", productIdentity: "use the GCD-LCM product identity",
      findLcm: "Find the least common multiple.", allPowers: "take the larger exponent of every prime", findMissingLcmValue: "Use the given LCM to find the missing number.", commonMultiplesAtMost: "How many positive common multiples at most", forNumbers: "are there for", interpretCommonMultiples: "Find the LCM, then count its multiples.", listMultiples: "list common multiples", firstThreeCommonMultiples: "Choose the first three positive common multiples of", chooseCommonMultiples: "Choose the complete common-multiple sequence.", chooseCorrectLcmStatement: "Choose the correct LCM statement.",
      groupingQuestion: (x, y) => `There are ${x} blue pens and ${y} black pens. They are packed into identical kits with nothing left over. What is the greatest possible number of each color in one kit?`, modelGcd: "Use the GCD for equal groups with no leftovers.", equalGroups: "greatest equal grouping uses the GCD", itemsPerGroup: "greatest common quantity per kit", cycleQuestion: (x, y) => `Two reminders repeat every ${x} minutes and ${y} minutes. If they occur together now, after how many minutes will they first occur together again?`, modelLcm: "Use the LCM for the first overlap of repeating cycles.", firstTogether: "first repeated overlap", minutes: "minutes", chooseModelQuestion: (x, y) => `${x} red items and ${y} blue items are split among the greatest possible number of identical sets with nothing left over. Which operation should be used?`, chooseModel: "Decide whether the situation requires GCD or LCM.", useGcd: "use the greatest common factor", useLcm: "use the least common multiple", useSum: "add the two numbers", useDifference: "subtract the two numbers", useProduct: "use the product directly", useAverage: "use the average", notEnough: "there is not enough information", useProductRelation: "Use the product identity to find the LCM.", reducedCoprime: "the two quotients are relatively prime", reducedNotCoprime: "the two quotients still share a factor", originalCoprime: "the original numbers are relatively prime", gcdIsOne: "the original GCD is 1", lcmIsCommon: "the LCM equals the removed factor", reducedEqual: "the reduced numbers are equal", noCommonFactorRemoved: "no common factor was removed", productFalse: "the product equals the GCD", diagnoseRelation: "Determine the coprime relation after removing the GCD."
    };
    result.findMissingLcmValue = zh
      ? "\u6c42使 LCM 等式成立的最小正整数。"
      : "Find the least positive integer that makes the LCM equation true.";
    return result;
  }

  function buildQuestion(conceptId, taskForm, variant, rng, lang) {
    const t = translations(lang);
    if (conceptId === "factors-multiples") return factorsFamily(taskForm, variant, rng, t);
    if (conceptId === "prime-factorization") return primeFamily(taskForm, variant, rng, t);
    if (conceptId === "greatest-common-factor") return gcdFamily(taskForm, variant, rng, t);
    if (conceptId === "least-common-multiple") return lcmFamily(taskForm, variant, rng, t);
    return applicationFamily(taskForm, variant, rng, t);
  }

  function difficultyAt(index) {
    if (index < 25) return "easy";
    if (index < 55) return "medium";
    if (index < 80) return "hard";
    return "expert";
  }

  function validateQuestion(question) {
    if (!question.main || question.answer === undefined || question.answer === null) return false;
    const correct = answerKey(question.answer);
    const distractors = unique(question.distractors || []).filter(value => answerKey(value) !== correct);
    if (question.parameters?.inverseKind === "least-lcm") {
      const { a, target } = question.parameters;
      const expected = leastPositiveLcmPartner(a, target);
      const choices = [question.answer, ...distractors].map(Number);
      if (expected === null || Number(question.answer) !== expected || lcm(a, expected) !== target) return false;
      if (choices.some(value => !Number.isInteger(value) || value <= 0)) return false;
    }
    return distractors.length >= 5 && Array.isArray(question.lines) && question.lines.length > 0;
  }

  const templates = [];
  let index = 0;
  variants.forEach((representation, variant) => {
    concepts.forEach(concept => {
      forms.forEach(taskForm => {
        const currentIndex = index++;
        templates.push({
          id: `${concept.id}-${taskForm}-${representation}`,
          familyId: `${concept.id}-${taskForm}`,
          conceptId: concept.id,
          difficulty: difficultyAt(currentIndex),
          taskForm,
          inputRepresentation: representation,
          outputKind: taskForm === "translate" || taskForm === "diagnose" ? "verified-relationship" : "exact-value",
          reasoningPattern: `${concept.id}:${taskForm}`,
          constraintPattern: `${representation}:${variant + 1}`,
          parameterPolicy: { integerBounds: variant < 2 ? [2, 90] : [2, 240], excludes: ["zero", "ambiguous-application", "trivial-equal-pair"] },
          build: ({ rng, lang }) => buildQuestion(concept.id, taskForm, variant, rng, lang),
          validate: validateQuestion
        });
      });
    });
  });

  concepts.forEach((concept, capstoneIndex) => {
    templates.push({
      id: `${concept.id}-capstone`,
      familyId: `${concept.id}-diagnose`,
      conceptId: concept.id,
      difficulty: "expert",
      taskForm: "diagnose",
      inputRepresentation: "multi-representation-capstone",
      outputKind: "verified-conclusion",
      reasoningPattern: `${concept.id}:multi-step-verification`,
      constraintPattern: `capstone:${capstoneIndex + 1}`,
      parameterPolicy: { integerBounds: [12, 240], minimumReasoningSteps: 2, excludes: ["ambiguous-model"] },
      build: ({ rng, lang }) => buildQuestion(concept.id, "diagnose", 3, rng, lang),
      validate: validateQuestion
    });
  });

  registry.registerTool({ toolId: "gcd-lcm", version: "2", concepts, templates });
  window.MCLQuizTool.gameId = "gcd-lcm";
  window.MCLQuizTool.course = "pre-algebra";
  window.MCLGcdLcmBank = {
    templates,
    audit: () => registry.auditTool("gcd-lcm"),
    auditGeneration: samplesPerTemplate => registry.auditGeneration("gcd-lcm", { samplesPerTemplate: samplesPerTemplate || 20 })
  };
})();
