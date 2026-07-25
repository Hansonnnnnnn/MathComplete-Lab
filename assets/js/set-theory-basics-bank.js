(function () {
  "use strict";

  const registry = window.MCLQuestionTemplates;
  if (!registry || !window.MCLQuizTool) return;

  const concepts = [
    { id: "membership-notation" },
    { id: "subsets-power-sets" },
    { id: "set-operations" },
    { id: "cardinality-venn" },
    { id: "intervals-language" }
  ];
  const forms = registry.TASK_FORMS;
  const variants = ["roster", "set-builder", "relational", "context"];

  const sorted = values => [...new Set(values)].sort((a, b) => a - b);
  const union = (a, b) => sorted([...a, ...b]);
  const intersection = (a, b) => sorted(a.filter(value => b.includes(value)));
  const difference = (a, b) => sorted(a.filter(value => !b.includes(value)));
  const subset = (a, b) => a.every(value => b.includes(value));
  const setLatex = values => values.length ? `\\{${sorted(values).join(",")}\\}` : "\\varnothing";

  function textLatex(value) {
    return `\\text{${String(value).replaceAll("\\", "\\textbackslash{}").replaceAll("{", "\\{").replaceAll("}", "\\}")}}`;
  }

  function key(value) {
    return registry.answerKey(value);
  }

  function unique(values) {
    return [...new Map(values.map(value => [key(value), String(value)])).values()];
  }

  function numericDistractors(answer, extras = []) {
    const candidates = [...extras, answer + 1, answer - 1, answer + 2, answer - 2, answer * 2, answer + 3, Math.max(0, Math.floor(answer / 2))];
    for (let offset = 1; candidates.length < 24; offset += 1) candidates.push(answer + offset, Math.max(0, answer - offset));
    return unique(candidates.filter(value => Number.isFinite(value) && value >= 0).map(String)).filter(value => key(value) !== key(String(answer))).slice(0, 8);
  }

  function make(main, answer, distractors, meta = {}) {
    return {
      main,
      plain: main,
      answer: String(answer),
      distractors: unique(distractors).filter(value => key(value) !== key(String(answer))).slice(0, 8),
      prompt: meta.prompt || "",
      lines: meta.lines || [{ line: main, note: meta.note || "" }, { line: String(answer), note: meta.final || "" }],
      suggestion: meta.suggestion || "",
      parameters: meta.parameters || null
    };
  }

  function numberQuestion(main, answer, extras, meta) {
    return make(main, answer, numericDistractors(answer, extras), meta);
  }

  function boolOptions(answer, t) {
    const correct = answer ? textLatex(t.true) : textLatex(t.false);
    return make("", correct, [
      answer ? textLatex(t.false) : textLatex(t.true), textLatex(t.sometimes), textLatex(t.undefined),
      textLatex(t.empty), textLatex(t.notEnough), textLatex(t.both)
    ]);
  }

  function sampleSet(rng, size, min, max) {
    const result = new Set();
    while (result.size < size) result.add(rng.int(min, max));
    return sorted([...result]);
  }

  function alternateSets(answer, universe) {
    const result = [];
    const values = sorted(answer);
    result.push(values.slice(0, -1));
    result.push(sorted([...values, universe.find(value => !values.includes(value)) ?? (Math.max(...values, 0) + 1)]));
    if (values.length) result.push(values.slice(1));
    result.push(difference(universe, values));
    result.push(universe.slice(0, Math.max(1, values.length)));
    result.push([]);
    result.push(sorted(values.map(value => value + 1)));
    return result.map(setLatex);
  }

  function membershipFamily(task, variant, rng, t) {
    const universe = Array.from({ length: variant < 2 ? 12 : 18 }, (_, index) => index + 1);
    const A = sampleSet(rng, variant < 2 ? 4 : 6, 1, universe.length);
    if (task === "direct") {
      const belongs = rng.bool(0.55);
      const x = belongs ? rng.choice(A) : rng.choice(difference(universe, A));
      const result = boolOptions(belongs, t);
      return make(`A=${setLatex(A)},\\quad ${x}\\in A\\ ?`, result.answer, result.distractors, {
        prompt: t.membership, lines: [{ line: `A=${setLatex(A)}`, note: t.readRoster }, { line: `${x}${belongs ? "\\in" : "\\notin"}A`, note: t.final }], parameters: { A, x, belongs }
      });
    }
    if (task === "inverse") {
      const answer = rng.choice(A);
      return make(`A=${setLatex(A)},\\quad \\Box\\in A`, answer, difference(universe, A), {
        prompt: t.chooseElement, lines: [{ line: `${answer}\\in A`, note: t.appearsInRoster }], parameters: { A, answer }
      });
    }
    if (task === "interpret") {
      const answer = textLatex(t.isElementOf);
      return make(`x\\in A`, answer, [t.isSubsetOf, t.containsSet, t.notElement, t.equalSets, t.emptySet, t.disjoint].map(textLatex), {
        prompt: t.interpretSymbol, lines: [{ line: `x\\in A`, note: t.elementMeaning }], parameters: { symbol: "in" }
      });
    }
    if (task === "translate") {
      const parity = variant % 2 === 0 ? 0 : 1;
      const limit = variant < 2 ? 10 : 16;
      const answer = universe.slice(0, limit).filter(value => value % 2 === parity);
      const descriptor = parity === 0 ? t.evenFrom(limit) : t.oddFrom(limit);
      return make(textLatex(descriptor), setLatex(answer), alternateSets(answer, universe.slice(0, limit)), {
        prompt: t.translateRoster, lines: [{ line: setLatex(answer), note: t.listSatisfying }], parameters: { parity, limit, answer }
      });
    }
    const x = rng.choice(A);
    const correct = `${x}\\in A`;
    return make(`A=${setLatex(A)}`, correct, [
      `${x}\\notin A`, `${setLatex([x])}\\in A`, `${x}\\subseteq A`, `A\\in ${x}`,
      `A\\subseteq ${x}`, `${x}=A`, `${setLatex(A)}\\in A`
    ], { prompt: t.chooseNotation, lines: [{ line: correct, note: t.appearsInRoster }], parameters: { A, x } });
  }

  function subsetFamily(task, variant, rng, t) {
    const B = sampleSet(rng, variant < 2 ? 5 : 7, 1, variant < 2 ? 12 : 18);
    const A = sorted(rng.shuffle(B).slice(0, variant < 2 ? 3 : 4));
    if (task === "direct") {
      const yes = rng.bool(0.6);
      const candidate = yes ? A : sorted([...A.slice(0, -1), Math.max(...B) + 2]);
      const result = boolOptions(subset(candidate, B), t);
      return make(`A=${setLatex(candidate)},\\quad B=${setLatex(B)},\\quad A\\subseteq B\\ ?`, result.answer, result.distractors, {
        prompt: t.subsetCheck, lines: [{ line: `A${subset(candidate, B) ? "\\subseteq" : "\\nsubseteq"}B`, note: t.checkEveryElement }], parameters: { A: candidate, B }
      });
    }
    if (task === "inverse") {
      const answer = setLatex(A);
      const outsiders = [Math.max(...B) + 1, Math.max(...B) + 2];
      const wrong = [setLatex([...A, outsiders[0]]), setLatex(outsiders), setLatex([...B, outsiders[1]]), setLatex(difference(B, A)), setLatex([]), setLatex([...A, ...outsiders])];
      return make(`B=${setLatex(B)},\\quad \\Box\\subseteq B`, answer, wrong, {
        prompt: t.chooseSubset, lines: [{ line: `${answer}\\subseteq B`, note: t.checkEveryElement }], parameters: { A, B }
      });
    }
    if (task === "interpret") {
      const n = variant < 2 ? rng.int(2, 5) : rng.int(5, 8);
      const answer = 2 ** n;
      return numberQuestion(`|A|=${n},\\quad |\\mathcal P(A)|=?`, answer, [n * n, 2 * n, answer - 1, answer + n], {
        prompt: t.powerSetCount, lines: [{ line: `|\\mathcal P(A)|=2^{|A|}=2^{${n}}=${answer}`, note: t.powerSetRule }], parameters: { n, answer }
      });
    }
    if (task === "translate") {
      const base = A.slice(0, Math.min(3, A.length));
      const answer = textLatex(t.everyElementStatement);
      return make(`${setLatex(base)}\\subseteq ${setLatex(B)}`, answer, [t.oneElement, t.sameCardinality, t.properAlways, t.setIsElement, t.noCommon, t.equalMeaning].map(textLatex), {
        prompt: t.translateSubset, lines: [{ line: `${setLatex(base)}\\subseteq ${setLatex(B)}`, note: t.checkEveryElement }], parameters: { base, B }
      });
    }
    const correct = `A\\subseteq A`;
    return make(textLatex(t.chooseAlwaysTrue), correct, [
      `A\\in A`, `A\\subset A`, `\\varnothing\\in A`, `|\\mathcal P(A)|=|A|`,
      `A\\subseteq\\varnothing`, `\\mathcal P(A)\\subseteq A`, `A\\ne A`
    ], { prompt: t.diagnose, lines: [{ line: correct, note: t.reflexiveSubset }], parameters: { identity: "reflexive" } });
  }

  function operationFamily(task, variant, rng, t) {
    const max = variant < 2 ? 10 : 16;
    let A = sampleSet(rng, variant < 2 ? 4 : 6, 1, max);
    let B = sampleSet(rng, variant < 2 ? 4 : 6, 1, max);
    if (!intersection(A, B).length) B = sorted([...B.slice(1), A[0]]);
    const U = Array.from({ length: max }, (_, index) => index + 1);
    if (task === "direct") {
      const op = rng.choice(["union", "intersection", "difference"]);
      const answer = op === "union" ? union(A, B) : op === "intersection" ? intersection(A, B) : difference(A, B);
      const symbol = op === "union" ? "\\cup" : op === "intersection" ? "\\cap" : "-";
      return make(`A=${setLatex(A)},\\quad B=${setLatex(B)},\\quad A${symbol}B=?`, setLatex(answer), [setLatex(union(A, B)), setLatex(intersection(A, B)), setLatex(difference(A, B)), setLatex(difference(B, A)), setLatex(A), setLatex(B), setLatex([])], {
        prompt: t.computeOperation, lines: [{ line: `A${symbol}B=${setLatex(answer)}`, note: t[op] }], parameters: { A, B, op, answer }
      });
    }
    if (task === "inverse") {
      const extra = difference(B, A);
      const answer = setLatex(extra);
      return make(`A=${setLatex(A)},\\quad A\\cup\\Box=${setLatex(union(A, B))}`, answer, [setLatex(B), setLatex(A), setLatex(intersection(A, B)), setLatex(union(A, B)), setLatex(difference(A, B)), setLatex([])], {
        prompt: t.missingSet, lines: [{ line: `\\Box=${setLatex(extra)}`, note: t.addMissingElements }], parameters: { A, B, extra }
      });
    }
    if (task === "interpret") {
      const answer = textLatex(t.intersectionMeaning);
      return make(`A\\cap B`, answer, [t.unionMeaning, t.differenceMeaning, t.complementMeaning, t.subsetMeaning, t.disjointMeaning, t.cartesianMeaning].map(textLatex), {
        prompt: t.interpretOperation, lines: [{ line: `A\\cap B`, note: t.intersection }], parameters: { operation: "intersection" }
      });
    }
    if (task === "translate") {
      const answer = `A\\cup B`;
      return make(textLatex(t.inAOrB), answer, [`A\\cap B`, `A-B`, `B-A`, `A^c`, `A\\subseteq B`, `A\\times B`], {
        prompt: t.translateOperation, lines: [{ line: answer, note: t.union }], parameters: { operation: "union" }
      });
    }
    const useUnion = variant % 2 === 0;
    const correct = useUnion ? `(A\\cup B)^c=A^c\\cap B^c` : `(A\\cap B)^c=A^c\\cup B^c`;
    return make(textLatex(t.chooseIdentity), correct, [
      useUnion ? `(A\\cup B)^c=A^c\\cup B^c` : `(A\\cap B)^c=A^c\\cap B^c`,
      `(A\\cup B)^c=A\\cap B`, `(A\\cap B)^c=A\\cup B`, `A-A=A`,
      `A\\cup\\varnothing=\\varnothing`, `A\\cap\\varnothing=A`, `A\\cup A=A^c`
    ], { prompt: t.diagnose, lines: [{ line: correct, note: t.deMorgan }], parameters: { useUnion } });
  }

  function cardinalityFamily(task, variant, rng, t) {
    const sizeA = rng.int(variant < 2 ? 8 : 18, variant < 2 ? 18 : 35);
    const sizeB = rng.int(variant < 2 ? 7 : 15, variant < 2 ? 16 : 32);
    const overlap = rng.int(2, Math.min(sizeA, sizeB) - 2);
    const unionSize = sizeA + sizeB - overlap;
    if (task === "direct") {
      const base = sampleSet(rng, variant < 2 ? 3 : 5, 1, 12);
      const raw = rng.shuffle([...base, rng.choice(base), rng.choice(base)]);
      return numberQuestion(`A=${setLatex(raw)},\\quad |A|=?`, base.length, [raw.length, base.length + 1, base.length - 1], {
        prompt: t.cardinality, lines: [{ line: `A=${setLatex(base)}`, note: t.removeDuplicates }, { line: `|A|=${base.length}`, note: t.final }], parameters: { raw, base }
      });
    }
    if (task === "inverse") {
      return numberQuestion(`|A|=${sizeA},\\;|B|=${sizeB},\\;|A\\cup B|=${unionSize},\\quad |A\\cap B|=?`, overlap, [sizeA + sizeB, unionSize, Math.abs(sizeA - sizeB), overlap + 2], {
        prompt: t.missingOverlap, lines: [{ line: `|A\\cap B|=|A|+|B|-|A\\cup B|`, note: t.inclusionExclusion }, { line: `${sizeA}+${sizeB}-${unionSize}=${overlap}`, note: t.final }], parameters: { sizeA, sizeB, overlap, unionSize }
      });
    }
    if (task === "interpret") {
      const exactlyOne = sizeA + sizeB - 2 * overlap;
      return numberQuestion(`|A|=${sizeA},\\;|B|=${sizeB},\\;|A\\cap B|=${overlap},\\quad ${textLatex(t.exactlyOne)}=?`, exactlyOne, [unionSize, overlap, sizeA + sizeB, exactlyOne + overlap], {
        prompt: t.vennInterpret, lines: [{ line: `(|A|-|A\\cap B|)+(|B|-|A\\cap B|)`, note: t.exactlyOneRule }, { line: `${exactlyOne}`, note: t.final }], parameters: { sizeA, sizeB, overlap, exactlyOne }
      });
    }
    if (task === "translate") {
      const total = unionSize + rng.int(3, 10);
      const neither = total - unionSize;
      return numberQuestion(`${textLatex(t.totalSurvey)}=${total},\\quad |A\\cup B|=${unionSize},\\quad ${textLatex(t.neither)}=?`, neither, [unionSize, total, overlap, total - overlap], {
        prompt: t.neitherCount, lines: [{ line: `${total}-${unionSize}=${neither}`, note: t.outsideUnion }], parameters: { total, unionSize, neither }
      });
    }
    const correct = `|A\\cup B|=|A|+|B|-|A\\cap B|`;
    return make(textLatex(t.chooseCountingFormula), correct, [
      `|A\\cup B|=|A|+|B|`, `|A\\cup B|=|A|+|B|+|A\\cap B|`,
      `|A\\cap B|=|A|+|B|`, `|A-B|=|A|-|B|`, `|A\\cup B|=|A\\cap B|`,
      `|A|=|A\\cup B|+|B|`, `|A\\cap B|=|A|-|B|`
    ], { prompt: t.diagnose, lines: [{ line: correct, note: t.inclusionExclusion }], parameters: { formula: "two-set" } });
  }

  function interval(kind, a, b = null) {
    if (b === null) {
      if (kind === ">") return `(${a},\\infty)`;
      if (kind === ">=") return `[${a},\\infty)`;
      if (kind === "<") return `(-\\infty,${a})`;
      return `(-\\infty,${a}]`;
    }
    return `${kind[0]}${a},${b}${kind[1]}`;
  }

  function intervalsFamily(task, variant, rng, t) {
    const a = rng.int(-8, 5);
    const b = rng.int(a + 2, variant < 2 ? 10 : 18);
    const relation = rng.choice([">", ">=", "<", "<="]);
    if (task === "direct") {
      const answer = interval(relation, a);
      return make(`\\{x\\in\\mathbb R:x${relation === ">=" ? "\\ge" : relation === "<=" ? "\\le" : relation}${a}\\}`, answer, [interval(relation === ">" ? ">=" : ">", a), interval(relation === "<" ? "<=" : "<", a), interval(relation.includes(">") ? "<" : ">", a), interval(relation.includes(">") ? "<=" : ">=", a), `(${a},${b})`, `[${a},${b}]`], {
        prompt: t.inequalityToInterval, lines: [{ line: answer, note: t.endpointRule }], parameters: { relation, a, answer }
      });
    }
    if (task === "inverse") {
      const brackets = rng.choice(["()", "[)", "(]", "[]"]);
      const answer = `${brackets[0] === "[" ? a + "\\le x" : a + "<x"}${brackets[1] === "]" ? `\\le ${b}` : `<${b}`}`;
      return make(interval(brackets, a, b), answer, [
        `${a}\\le x\\le ${b}`, `${a}<x<${b}`, `${a}\\le x<${b}`, `${a}<x\\le ${b}`,
        `x<${a}\\text{ or }x>${b}`, `${a}>x>${b}`
      ], { prompt: t.intervalToInequality, lines: [{ line: answer, note: t.endpointRule }], parameters: { brackets, a, b, answer } });
    }
    if (task === "interpret") {
      const answer = textLatex(t.leftIncludedRightExcluded);
      return make(`[${a},${b})`, answer, [t.bothIncluded, t.bothExcluded, t.leftExcludedRightIncluded, t.outsideOnly, t.integerOnly, t.emptyInterval].map(textLatex), {
        prompt: t.interpretEndpoints, lines: [{ line: `[${a},${b})`, note: t.endpointRule }], parameters: { a, b }
      });
    }
    if (task === "translate") {
      const answer = `[${a},${b}]`;
      return make(textLatex(t.betweenInclusive(a, b)), answer, [`(${a},${b})`, `[${a},${b})`, `(${a},${b}]`, `(-\\infty,${a}]`, `[${b},\\infty)`, `(-\\infty,${a}]\\cup[${b},\\infty)`], {
        prompt: t.translateInterval, lines: [{ line: answer, note: t.bothEndpointsIncluded }], parameters: { a, b }
      });
    }
    const correct = `[${a},${b}]\\cap(${a},\\infty)=(${a},${b}]`;
    return make(textLatex(t.chooseIntervalStatement), correct, [
      `[${a},${b}]\\cap(${a},\\infty)=[${a},${b}]`, `[${a},${b}]\\cap(${a},\\infty)=(${a},${b})`,
      `[${a},${b}]\\cup(${a},\\infty)=[${a},${b}]`, `(${a},${b})=[${a},${b}]`,
      `[${a},${b})=(${a},${b}]`, `[${a},${b}]\\cap\\varnothing=[${a},${b}]`
    ], { prompt: t.diagnose, lines: [{ line: correct, note: t.intersectionKeepsCommon }], parameters: { a, b } });
  }

  function translations(lang) {
    const zh = lang === "zh";
    return zh ? {
      true: "正确", false: "错误", sometimes: "有时成立", undefined: "未定义", empty: "空集", notEnough: "条件不足", both: "两者都成立", final: "最终答案",
      membership: "判断元素是否属于集合。", readRoster: "读取花括号中的元素", chooseElement: "选择属于集合的元素。", appearsInRoster: "该元素出现在集合中", isElementOf: "x 是集合 A 的一个元素", isSubsetOf: "x 是 A 的子集", containsSet: "x 包含集合 A", notElement: "x 不属于 A", equalSets: "x 与 A 相等", emptySet: "A 是空集", disjoint: "x 与 A 不相交", interpretSymbol: "解释集合符号的含义。", elementMeaning: "属于符号连接元素与集合", evenFrom: n => `列出 1 到 ${n} 的所有偶数`, oddFrom: n => `列出 1 到 ${n} 的所有奇数`, translateRoster: "把文字条件写成列举法。", listSatisfying: "列出所有满足条件的元素", chooseNotation: "选择使用集合符号正确的一项。",
      subsetCheck: "判断子集关系。", checkEveryElement: "检查左侧集合的每个元素", chooseSubset: "选择满足子集条件的集合。", powerSetCount: "求幂集的元素数量。", powerSetRule: "含 n 个元素的集合有 2^n 个子集", everyElementStatement: "左侧集合的每个元素都属于右侧集合", oneElement: "左侧集合只有一个元素属于右侧", sameCardinality: "两个集合元素数量相同", properAlways: "两个集合必定相等", setIsElement: "左侧集合是右侧集合的一个元素", noCommon: "两个集合没有共同元素", equalMeaning: "两个集合完全相等", translateSubset: "解释子集陈述。", chooseAlwaysTrue: "选择恒成立的集合命题。", diagnose: "选择数学上正确的一项。", reflexiveSubset: "每个集合都是自身的子集",
      computeOperation: "计算集合运算。", union: "并集保留两个集合中的所有元素", intersection: "交集只保留共同元素", difference: "差集保留 A 中但不在 B 中的元素", missingSet: "反推使集合等式成立的缺失集合。", addMissingElements: "补入 A 中尚未出现的元素", intersectionMeaning: "同时属于 A 和 B 的元素集合", unionMeaning: "属于 A 或 B 的元素集合", differenceMeaning: "属于 A 但不属于 B 的元素集合", complementMeaning: "不属于 A 的所有对象", subsetMeaning: "A 的所有子集", disjointMeaning: "A 与 B 没有交集的陈述", cartesianMeaning: "A 与 B 的有序对集合", interpretOperation: "解释集合运算的含义。", inAOrB: "所有属于 A 或属于 B 的元素", translateOperation: "把文字描述翻译成集合运算。", chooseIdentity: "选择正确的集合恒等式。", deMorgan: "德摩根律会交换并集和交集并分别取补",
      cardinality: "计算集合中不同元素的数量。", removeDuplicates: "重复元素在集合中只计一次", missingOverlap: "使用容斥关系求缺失的交集数量。", inclusionExclusion: "并集等于两集合数量之和减去交集", exactlyOne: "只属于其中一个集合的人数", vennInterpret: "根据 Venn 区域计算指定人数。", exactlyOneRule: "分别减去两集合共同区域", totalSurvey: "调查总人数", neither: "两者都不选择的人数", neitherCount: "计算并集外部的人数。", outsideUnion: "总人数减去并集人数", chooseCountingFormula: "选择正确的两集合计数公式。",
      inequalityToInterval: "把不等式写成区间表示。", endpointRule: "严格不等式使用圆括号，包含端点使用方括号", intervalToInequality: "把区间写成不等式。", leftIncludedRightExcluded: "包含左端点但不包含右端点", bothIncluded: "包含两个端点", bothExcluded: "两个端点都不包含", leftExcludedRightIncluded: "不包含左端点但包含右端点", outsideOnly: "只表示区间外部", integerOnly: "只包含整数", emptyInterval: "表示空集", interpretEndpoints: "解释区间端点。", betweenInclusive: (a, b) => `所有介于 ${a} 与 ${b} 之间并包含两个端点的实数`, translateInterval: "把文字范围写成区间。", bothEndpointsIncluded: "两个端点均包含，所以使用方括号", chooseIntervalStatement: "选择正确的区间运算。", intersectionKeepsCommon: "交集只保留两个区间共同包含的点"
    } : {
      true: "true", false: "false", sometimes: "sometimes true", undefined: "undefined", empty: "the empty set", notEnough: "not enough information", both: "both statements", final: "final answer",
      membership: "Determine whether the element belongs to the set.", readRoster: "read the elements inside the braces", chooseElement: "Choose an element of the set.", appearsInRoster: "the element appears in the roster", isElementOf: "x is an element of A", isSubsetOf: "x is a subset of A", containsSet: "x contains set A", notElement: "x is not in A", equalSets: "x and A are equal", emptySet: "A is empty", disjoint: "x is disjoint from A", interpretSymbol: "Interpret the set symbol.", elementMeaning: "the membership symbol connects an element to a set", evenFrom: n => `List all even numbers from 1 through ${n}`, oddFrom: n => `List all odd numbers from 1 through ${n}`, translateRoster: "Translate the condition into roster form.", listSatisfying: "list every value that satisfies the condition", chooseNotation: "Choose the correctly written set statement.",
      subsetCheck: "Determine whether the subset relation is true.", checkEveryElement: "check every element of the left set", chooseSubset: "Choose a set that satisfies the subset condition.", powerSetCount: "Find the number of elements in the power set.", powerSetRule: "a set with n elements has 2^n subsets", everyElementStatement: "every element of the left set is in the right set", oneElement: "only one left-set element is in the right set", sameCardinality: "the sets have the same cardinality", properAlways: "the two sets must be equal", setIsElement: "the left set is an element of the right set", noCommon: "the sets share no elements", equalMeaning: "the sets are equal", translateSubset: "Interpret the subset statement.", chooseAlwaysTrue: "Choose the set statement that is always true.", diagnose: "Choose the mathematically correct statement.", reflexiveSubset: "every set is a subset of itself",
      computeOperation: "Compute the set operation.", union: "union keeps every element from either set", intersection: "intersection keeps only shared elements", difference: "difference keeps elements in A but not in B", missingSet: "Work backward to find a set that completes the equation.", addMissingElements: "add the elements not already supplied by A", intersectionMeaning: "the set of elements in both A and B", unionMeaning: "the set of elements in A or B", differenceMeaning: "the set of elements in A but not B", complementMeaning: "all objects outside A", subsetMeaning: "all subsets of A", disjointMeaning: "a statement that A and B do not overlap", cartesianMeaning: "the set of ordered pairs from A and B", interpretOperation: "Interpret the set operation.", inAOrB: "all elements that are in A or in B", translateOperation: "Translate the words into a set operation.", chooseIdentity: "Choose the correct set identity.", deMorgan: "De Morgan's law switches union and intersection and complements each set",
      cardinality: "Count the distinct elements in the set.", removeDuplicates: "repeated values count once in a set", missingOverlap: "Use inclusion-exclusion to find the missing overlap.", inclusionExclusion: "the union equals the sum of both counts minus the overlap", exactlyOne: "number in exactly one set", vennInterpret: "Use the Venn regions to find the requested count.", exactlyOneRule: "remove the shared region from each set", totalSurvey: "total surveyed", neither: "number in neither set", neitherCount: "Find the number outside the union.", outsideUnion: "subtract the union from the total", chooseCountingFormula: "Choose the correct two-set counting formula.",
      inequalityToInterval: "Write the inequality in interval notation.", endpointRule: "strict endpoints use parentheses; included endpoints use brackets", intervalToInequality: "Write the interval as an inequality.", leftIncludedRightExcluded: "the left endpoint is included and the right is excluded", bothIncluded: "both endpoints are included", bothExcluded: "both endpoints are excluded", leftExcludedRightIncluded: "the left endpoint is excluded and the right is included", outsideOnly: "only values outside the interval", integerOnly: "only integer values", emptyInterval: "the empty set", interpretEndpoints: "Interpret the interval endpoints.", betweenInclusive: (a, b) => `All real numbers from ${a} to ${b}, including both endpoints`, translateInterval: "Translate the verbal range into an interval.", bothEndpointsIncluded: "both endpoints are included, so use brackets", chooseIntervalStatement: "Choose the correct interval operation.", intersectionKeepsCommon: "intersection keeps only points shared by both intervals"
    };
  }

  function buildQuestion(conceptId, taskForm, variant, rng, lang) {
    const t = translations(lang);
    if (conceptId === "membership-notation") return membershipFamily(taskForm, variant, rng, t);
    if (conceptId === "subsets-power-sets") return subsetFamily(taskForm, variant, rng, t);
    if (conceptId === "set-operations") return operationFamily(taskForm, variant, rng, t);
    if (conceptId === "cardinality-venn") return cardinalityFamily(taskForm, variant, rng, t);
    return intervalsFamily(taskForm, variant, rng, t);
  }

  function difficultyAt(index) {
    if (index < 25) return "easy";
    if (index < 55) return "medium";
    if (index < 80) return "hard";
    return "expert";
  }

  function validate(question) {
    const answer = key(question.answer);
    const distractors = unique(question.distractors || []).filter(value => key(value) !== answer);
    return Boolean(question.main && answer && distractors.length >= 5 && question.lines?.length);
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
          outputKind: taskForm === "interpret" ? "meaning" : taskForm === "diagnose" ? "verified-statement" : "set-or-exact-value",
          reasoningPattern: `${concept.id}:${taskForm}`,
          constraintPattern: `${representation}:${variant + 1}`,
          parameterPolicy: { integerBounds: variant < 2 ? [-10, 20] : [-20, 40], excludes: ["ambiguous-set-description", "duplicate-equivalent-options"] },
          build: ({ rng, lang }) => buildQuestion(concept.id, taskForm, variant, rng, lang),
          validate
        });
      });
    });
  });

  concepts.forEach((concept, capstoneIndex) => templates.push({
    id: `${concept.id}-capstone`,
    familyId: `${concept.id}-diagnose`,
    conceptId: concept.id,
    difficulty: "expert",
    taskForm: "diagnose",
    inputRepresentation: "multi-representation-capstone",
    outputKind: "verified-conclusion",
    reasoningPattern: `${concept.id}:multi-step-verification`,
    constraintPattern: `capstone:${capstoneIndex + 1}`,
    parameterPolicy: { integerBounds: [-20, 50], minimumReasoningSteps: 2 },
    build: ({ rng, lang }) => buildQuestion(concept.id, "diagnose", 3, rng, lang),
    validate
  }));

  registry.registerTool({ toolId: "set-theory-basics", version: "2", concepts, templates });
  window.MCLQuizTool.gameId = "set-theory-basics";
  window.MCLQuizTool.course = "pre-algebra";
  window.MCLSetTheoryBank = {
    templates,
    audit: () => registry.auditTool("set-theory-basics"),
    auditGeneration: samples => registry.auditGeneration("set-theory-basics", { samplesPerTemplate: samples || 20 })
  };
})();
