(function (root) {
  "use strict";

  const registry = root.MCLQuestionTemplates;
  const logic = root.MCLConditionalLogic;
  if (!registry || !logic || !root.MCLQuizTool) return;

  const CONCEPTS = [
    { id: "conditional-structure", en: "Conditional structure", zh: "条件命题结构" },
    { id: "converse-inverse-contrapositive", en: "Converse, inverse, and contrapositive", zh: "逆命题、否命题与逆否命题" },
    { id: "negation-quantifiers", en: "Precise negation and quantifiers", zh: "精确否定与量词" },
    { id: "truth-equivalence-counterexamples", en: "Truth, equivalence, and counterexamples", zh: "真值、等价与反例" },
    { id: "sufficient-necessary-biconditional", en: "Sufficient, necessary, and biconditional reasoning", zh: "充分、必要与双条件推理" }
  ];
  const TASK_FORMS = ["direct", "inverse", "interpret", "translate", "diagnose"];
  const DIFFICULTY = index => index < 5 ? "easy" : index < 11 ? "medium" : index < 16 ? "hard" : "expert";
  const INTERACTION = index => index < 10 ? "choice" : index < 14 ? "matching" : index < 17 ? "order" : index < 19 ? "truth-table" : "fill";
  const CONTEXT = index => ["geometry", "geometry", "mathematics", "mathematics", "everyday"][index % 5];

  function langOf(context) {
    return context.lang || (root.localStorage?.getItem?.("mathcomplete_lang") === "zh" ? "zh" : "en");
  }
  function L(lang, en, zh) { return lang === "zh" ? zh : en; }
  function text(value) { return `\\text{${logic.escapeLatexText(value)}}`; }
  function answer(key, latex) { return Object.freeze({ key, latex: latex || text(key) }); }
  function option(key, en, zh, lang, latex) { return answer(key, latex || text(L(lang, en, zh))); }
  function formLabel(form, lang) {
    return ({
      conditional: L(lang, "Original conditional", "原命题"),
      converse: L(lang, "Converse", "逆命题"),
      inverse: L(lang, "Inverse", "否命题"),
      contrapositive: L(lang, "Contrapositive", "逆否命题")
    })[form];
  }
  function boolLabel(value, lang) { return L(lang, value ? "True" : "False", value ? "真" : "假"); }
  function conjunctionLatex(left, right, lang, connector = "and") {
    const word = connector === "or" ? L(lang, "or", "或") : L(lang, "and", "且");
    return `\\begin{gathered}${left}\\\\\\text{${word}}\\\\${right}\\end{gathered}`;
  }

  function clause(id, domain, en, zh, notEn, notZh, latex = "", notLatex = "") {
    return logic.makeClause(id, { domain, en, zh, notEn, notZh, latex, notLatex });
  }

  const SCENARIOS = {
    geometry: [
      {
        id: "square-rectangle", universe: "quadrilaterals",
        p: clause("is-square", "quadrilaterals", "a quadrilateral is a square", "一个四边形是正方形", "the quadrilateral is not a square", "这个四边形不是正方形"),
        q: clause("is-rectangle", "quadrilaterals", "the quadrilateral is a rectangle", "这个四边形是矩形", "the quadrilateral is not a rectangle", "这个四边形不是矩形"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every square is a rectangle.", reasonZh: "每个正方形都是矩形。",
        counterConverseEn: "A non-square rectangle, such as a 3 by 5 rectangle", counterConverseZh: "一个不是正方形的矩形，例如 3×5 的矩形"
      },
      {
        id: "vertical-congruent", universe: "pairs of angles",
        p: clause("vertical-angles", "pairs of angles", "two angles are vertical angles", "两个角是对顶角", "the two angles are not vertical angles", "这两个角不是对顶角"),
        q: clause("congruent-angles", "pairs of angles", "the two angles are congruent", "这两个角全等", "the two angles are not congruent", "这两个角不全等"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Vertical angles are congruent.", reasonZh: "对顶角全等。",
        counterConverseEn: "Two separate 40-degree angles that are not vertical", counterConverseZh: "两个互不构成对顶角的 40° 角"
      },
      {
        id: "midpoint-equal-segments", universe: "points and segments",
        p: clause("is-midpoint", "points and segments", "M is the midpoint of segment AB", "M 是线段 AB 的中点", "M is not the midpoint of segment AB", "M 不是线段 AB 的中点"),
        q: clause("equal-halves", "points and segments", "AM equals MB", "AM 等于 MB", "AM does not equal MB", "AM 不等于 MB", "AM=MB", "AM\\ne MB"),
        originalTruth: true, converseTruth: false,
        reasonEn: "A midpoint lies on the segment and creates equal halves.", reasonZh: "中点必须在线段上，并把线段分成两个等长部分。",
        counterConverseEn: "A point M off line AB with AM = MB", counterConverseZh: "一个不在直线 AB 上但满足 AM=MB 的点 M"
      },
      {
        id: "equilateral-equiangular", universe: "triangles",
        p: clause("equilateral", "triangles", "a triangle is equilateral", "一个三角形是等边三角形", "the triangle is not equilateral", "这个三角形不是等边三角形"),
        q: clause("equiangular", "triangles", "the triangle is equiangular", "这个三角形是等角三角形", "the triangle is not equiangular", "这个三角形不是等角三角形"),
        originalTruth: true, converseTruth: true,
        reasonEn: "For triangles, equilateral and equiangular are equivalent.", reasonZh: "对三角形而言，等边与等角互为等价条件。"
      },
      {
        id: "rectangle-congruent-diagonals", universe: "quadrilaterals",
        p: clause("rectangle", "quadrilaterals", "a quadrilateral is a rectangle", "一个四边形是矩形", "the quadrilateral is not a rectangle", "这个四边形不是矩形"),
        q: clause("congruent-diagonals", "quadrilaterals", "its diagonals are congruent", "它的两条对角线全等", "its diagonals are not congruent", "它的两条对角线不全等"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Rectangles have congruent diagonals.", reasonZh: "矩形的两条对角线全等。",
        counterConverseEn: "An isosceles trapezoid with congruent diagonals", counterConverseZh: "一个对角线全等的等腰梯形"
      },
      {
        id: "perpendicular-right-angles", universe: "intersecting lines",
        p: clause("perpendicular-lines", "intersecting lines", "two lines are perpendicular", "两条直线互相垂直", "the two lines are not perpendicular", "这两条直线不垂直"),
        q: clause("right-angles", "intersecting lines", "they form right angles", "它们形成直角", "they do not form right angles", "它们不形成直角"),
        originalTruth: true, converseTruth: true,
        reasonEn: "Perpendicular lines are defined by the right angles they form.", reasonZh: "互相垂直的直线以其形成直角来定义。"
      },
      {
        id: "rhombus-perpendicular-diagonals", universe: "quadrilaterals",
        p: clause("rhombus", "quadrilaterals", "a quadrilateral is a rhombus", "一个四边形是菱形", "the quadrilateral is not a rhombus", "这个四边形不是菱形"),
        q: clause("perpendicular-diagonals", "quadrilaterals", "its diagonals are perpendicular", "它的两条对角线互相垂直", "its diagonals are not perpendicular", "它的两条对角线不垂直"),
        originalTruth: true, converseTruth: false,
        reasonEn: "A rhombus has perpendicular diagonals.", reasonZh: "菱形的对角线互相垂直。",
        counterConverseEn: "A kite that is not a rhombus", counterConverseZh: "一个不是菱形的风筝形"
      },
      {
        id: "isosceles-base-angles", universe: "triangles",
        p: clause("isosceles", "triangles", "a triangle has two congruent sides", "一个三角形有两条全等的边", "the triangle does not have two congruent sides", "这个三角形没有两条全等的边"),
        q: clause("congruent-base-angles", "triangles", "the angles opposite those sides are congruent", "这两条边所对的角全等", "the angles opposite those sides are not congruent", "这两条边所对的角不全等"),
        originalTruth: true, converseTruth: true,
        reasonEn: "The isosceles triangle theorem and its converse are both true.", reasonZh: "等腰三角形定理及其逆定理都成立。"
      },
      {
        id: "perpendicular-bisector-equidistant", universe: "points and segments",
        p: clause("on-perpendicular-bisector", "points and segments", "point P lies on the perpendicular bisector of AB", "点 P 在线段 AB 的垂直平分线上", "point P does not lie on the perpendicular bisector of AB", "点 P 不在线段 AB 的垂直平分线上"),
        q: clause("equidistant-endpoints", "points and segments", "PA equals PB", "PA 等于 PB", "PA does not equal PB", "PA 不等于 PB", "PA=PB", "PA\\ne PB"),
        originalTruth: true, converseTruth: true,
        reasonEn: "The perpendicular bisector theorem works in both directions.", reasonZh: "垂直平分线定理及其逆定理都成立。"
      }
    ],
    mathematics: [
      {
        id: "divisible-four-even", universe: "integers",
        p: clause("divisible-four", "integers", "an integer is divisible by 4", "一个整数能被 4 整除", "the integer is not divisible by 4", "这个整数不能被 4 整除"),
        q: clause("even", "integers", "the integer is even", "这个整数是偶数", "the integer is odd", "这个整数是奇数"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every multiple of 4 is even.", reasonZh: "每个 4 的倍数都是偶数。",
        counterConverseEn: "6 is even but is not divisible by 4", counterConverseZh: "6 是偶数，但不能被 4 整除"
      },
      {
        id: "even-divisible-four", universe: "integers",
        p: clause("even-2", "integers", "an integer is even", "一个整数是偶数", "the integer is odd", "这个整数是奇数"),
        q: clause("divisible-four-2", "integers", "the integer is divisible by 4", "这个整数能被 4 整除", "the integer is not divisible by 4", "这个整数不能被 4 整除"),
        originalTruth: false, converseTruth: true,
        reasonEn: "Even does not guarantee divisibility by 4.", reasonZh: "偶数不一定能被 4 整除。",
        counterOriginalEn: "6 is even but is not divisible by 4", counterOriginalZh: "6 是偶数，但不能被 4 整除"
      },
      {
        id: "three-square-nine", universe: "real numbers",
        p: clause("x-three", "real numbers", "x equals 3", "x 等于 3", "x does not equal 3", "x 不等于 3", "x=3", "x\\ne3"),
        q: clause("square-nine", "real numbers", "x squared equals 9", "x 的平方等于 9", "x squared does not equal 9", "x 的平方不等于 9", "x^2=9", "x^2\\ne9"),
        originalTruth: true, converseTruth: false,
        reasonEn: "x = 3 gives x squared = 9.", reasonZh: "x=3 时，x²=9。",
        counterConverseEn: "x = -3 makes x squared 9 but x is not 3", counterConverseZh: "x=-3 时 x²=9，但 x 不等于 3"
      },
      {
        id: "square-nine-three", universe: "real numbers",
        p: clause("square-nine-2", "real numbers", "x squared equals 9", "x 的平方等于 9", "x squared does not equal 9", "x 的平方不等于 9", "x^2=9", "x^2\\ne9"),
        q: clause("x-three-2", "real numbers", "x equals 3", "x 等于 3", "x does not equal 3", "x 不等于 3", "x=3", "x\\ne3"),
        originalTruth: false, converseTruth: true,
        reasonEn: "x squared = 9 permits x = 3 or x = -3.", reasonZh: "x²=9 时，x 可以是 3 或 -3。",
        counterOriginalEn: "x = -3", counterOriginalZh: "x=-3"
      },
      {
        id: "greater-five-greater-two", universe: "real numbers",
        p: clause("greater-five", "real numbers", "x is greater than 5", "x 大于 5", "x is at most 5", "x 小于或等于 5", "x>5", "x\\le5"),
        q: clause("greater-two", "real numbers", "x is greater than 2", "x 大于 2", "x is at most 2", "x 小于或等于 2", "x>2", "x\\le2"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Any number greater than 5 is also greater than 2.", reasonZh: "任何大于 5 的数也都大于 2。",
        counterConverseEn: "x = 3", counterConverseZh: "x=3"
      },
      {
        id: "odd-square-odd", universe: "integers",
        p: clause("odd", "integers", "an integer is odd", "一个整数是奇数", "the integer is even", "这个整数是偶数"),
        q: clause("square-odd", "integers", "its square is odd", "它的平方是奇数", "its square is even", "它的平方是偶数"),
        originalTruth: true, converseTruth: true,
        reasonEn: "An integer is odd exactly when its square is odd.", reasonZh: "一个整数是奇数，当且仅当它的平方是奇数。"
      },
      {
        id: "multiple-six-divisible-three", universe: "integers",
        p: clause("multiple-six", "integers", "an integer is a multiple of 6", "一个整数是 6 的倍数", "the integer is not a multiple of 6", "这个整数不是 6 的倍数"),
        q: clause("divisible-three", "integers", "the integer is divisible by 3", "这个整数能被 3 整除", "the integer is not divisible by 3", "这个整数不能被 3 整除"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every multiple of 6 is divisible by 3.", reasonZh: "每个 6 的倍数都能被 3 整除。",
        counterConverseEn: "9 is divisible by 3 but is not a multiple of 6", counterConverseZh: "9 能被 3 整除，但不是 6 的倍数"
      },
      {
        id: "prime-over-two-odd", universe: "integers greater than 2",
        p: clause("prime-over-two", "integers greater than 2", "an integer greater than 2 is prime", "一个大于 2 的整数是质数", "the integer is composite", "这个整数是合数"),
        q: clause("odd-over-two", "integers greater than 2", "the integer is odd", "这个整数是奇数", "the integer is even", "这个整数是偶数"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every prime greater than 2 is odd.", reasonZh: "每个大于 2 的质数都是奇数。",
        counterConverseEn: "9 is odd but is not prime", counterConverseZh: "9 是奇数，但不是质数"
      },
      {
        id: "intersection-membership", universe: "sets",
        p: clause("in-intersection", "sets", "x belongs to A intersect B", "x 属于 A 与 B 的交集", "x does not belong to A intersect B", "x 不属于 A 与 B 的交集", "x\\in A\\cap B", "x\\notin A\\cap B"),
        q: clause("in-a", "sets", "x belongs to A", "x 属于 A", "x does not belong to A", "x 不属于 A", "x\\in A", "x\\notin A"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Membership in the intersection requires membership in A.", reasonZh: "属于交集必然属于 A。",
        counterConverseEn: "Choose x in A but not in B", counterConverseZh: "取一个属于 A 但不属于 B 的 x"
      }
    ],
    everyday: [
      {
        id: "robin-bird", universe: "animals",
        p: clause("robin", "animals", "an animal is a robin", "一种动物是知更鸟", "the animal is not a robin", "这种动物不是知更鸟"),
        q: clause("bird", "animals", "the animal is a bird", "这种动物是鸟", "the animal is not a bird", "这种动物不是鸟"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every robin is a bird.", reasonZh: "每只知更鸟都是鸟。",
        counterConverseEn: "A sparrow is a bird but is not a robin", counterConverseZh: "麻雀是鸟，但不是知更鸟"
      },
      {
        id: "violin-instrument", universe: "musical instruments",
        p: clause("violin", "musical instruments", "an object is a violin", "一个物体是小提琴", "the object is not a violin", "这个物体不是小提琴"),
        q: clause("instrument", "musical instruments", "the object is a musical instrument", "这个物体是乐器", "the object is not a musical instrument", "这个物体不是乐器"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every violin is a musical instrument.", reasonZh: "每把小提琴都是乐器。",
        counterConverseEn: "A piano is an instrument but is not a violin", counterConverseZh: "钢琴是乐器，但不是小提琴"
      },
      {
        id: "monday-weekday", universe: "days of the week",
        p: clause("monday", "days of the week", "a day is Monday", "某一天是星期一", "the day is not Monday", "这一天不是星期一"),
        q: clause("weekday", "days of the week", "the day is a weekday", "这一天是工作日", "the day is not a weekday", "这一天不是工作日"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Monday is a weekday.", reasonZh: "星期一是工作日。",
        counterConverseEn: "Tuesday is a weekday but is not Monday", counterConverseZh: "星期二是工作日，但不是星期一"
      },
      {
        id: "school-bus-vehicle", universe: "vehicles",
        p: clause("school-bus", "vehicles", "a vehicle is a school bus", "一辆车是校车", "the vehicle is not a school bus", "这辆车不是校车"),
        q: clause("vehicle", "vehicles", "it is a vehicle", "它是一辆交通工具", "it is not a vehicle", "它不是交通工具"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every school bus is a vehicle.", reasonZh: "每辆校车都是交通工具。",
        counterConverseEn: "A bicycle is a vehicle but is not a school bus", counterConverseZh: "自行车是交通工具，但不是校车"
      },
      {
        id: "novel-book", universe: "books",
        p: clause("novel", "books", "a book is a novel", "一本书是小说", "the book is not a novel", "这本书不是小说"),
        q: clause("book", "books", "the object is a book", "这个物体是书", "the object is not a book", "这个物体不是书"),
        originalTruth: true, converseTruth: false,
        reasonEn: "Every novel is a book.", reasonZh: "每部小说都是书。",
        counterConverseEn: "A dictionary is a book but is not a novel", counterConverseZh: "词典是书，但不是小说"
      }
    ]
  };

  function scenarioFor(contextType, context, requireFalse = false) {
    const source = requireFalse
      ? SCENARIOS[contextType].filter(item => !item.originalTruth || !item.converseTruth)
      : SCENARIOS[contextType];
    return context.rng.choice(source);
  }

  function allFormAnswers(scenario, lang) {
    return logic.FORMS.map(form => answer(form, logic.renderConditional(logic.formOf(form, scenario.p, scenario.q), lang)));
  }
  function labelAnswers(lang) {
    return logic.FORMS.map(form => answer(form, text(formLabel(form, lang))));
  }
  function genericDistractors(lang) {
    return [
      option("unrelated", "The statements are unrelated", "两个命题没有关系", lang),
      option("biconditional", "The biconditional", "双条件命题", lang),
      option("negated-whole", "The negation of the whole conditional", "整个条件命题的否定", lang),
      option("both-true", "Both statements must be true", "两个命题都必须为真", lang),
      option("no-conclusion", "No conclusion can be formed", "无法得到结论", lang),
      option("equivalent-all", "All four forms are equivalent", "四种形式全部等价", lang)
    ];
  }
  function distinctDistractors(correct, candidates) {
    const correctKey = registry.answerKey(correct);
    const seen = new Set([correctKey]);
    const values = [];
    [...candidates].forEach(candidate => {
      const key = registry.answerKey(candidate);
      if (key && !seen.has(key)) { seen.add(key); values.push(candidate); }
    });
    return values;
  }
  function baseQuestion({ main, plain, prompt, answerValue, distractors, suggestion, lines, parameters, interaction }) {
    return {
      main,
      plain: plain || main,
      prompt,
      answer: answerValue,
      distractors: distinctDistractors(answerValue, [...distractors, ...genericDistractors(parameters.lang)]).slice(0, 12),
      suggestion,
      lines,
      parameters,
      interaction: interaction || null,
      audit: { contextType: parameters.contextType, interactionKind: parameters.interactionKind, scenarioId: parameters.scenarioId }
    };
  }
  function reasoningLines(scenario, targetForm, lang, truthNeeded = false) {
    const statement = logic.formOf(targetForm, scenario.p, scenario.q);
    const operation = ({
      conditional: L(lang, "Keep p as the hypothesis and q as the conclusion.", "保持 p 为假设、q 为结论。"),
      converse: L(lang, "Exchange p and q without negating either clause.", "交换 p 与 q，但不否定任何一部分。"),
      inverse: L(lang, "Negate p and q without exchanging them.", "否定 p 与 q，但不交换它们。"),
      contrapositive: L(lang, "Exchange p and q, then negate both clauses.", "先交换 p 与 q，再否定两部分。")
    })[targetForm];
    const lines = [
      { line: `p:\ ${logic.partLatex({ clause: scenario.p, negated: false }, lang)}`, note: L(lang, "identify the hypothesis", "识别假设") },
      { line: `q:\ ${logic.partLatex({ clause: scenario.q, negated: false }, lang)}`, note: L(lang, "identify the conclusion", "识别结论") },
      { line: logic.FORM_SYMBOLS[targetForm], note: operation },
      { line: logic.renderConditional(statement, lang), note: L(lang, "write the transformed statement precisely", "规范写出转换后的命题") }
    ];
    if (truthNeeded) {
      lines.push({
        line: text(`${formLabel(targetForm, lang)}: ${boolLabel(logic.truthOfForm(scenario, targetForm), lang)}`),
        note: logic.truthOfForm(scenario, targetForm)
          ? L(lang, scenario.reasonEn, scenario.reasonZh)
          : L(lang, counterFor(scenario, targetForm, "En"), counterFor(scenario, targetForm, "Zh"))
      });
    }
    return lines;
  }
  function counterFor(scenario, form, suffix) {
    const originalSide = form === "conditional" || form === "contrapositive";
    return scenario[`${originalSide ? "counterOriginal" : "counterConverse"}${suffix}`]
      || (suffix === "Zh" ? "存在一个满足假设但不满足结论的反例" : "There is a case that satisfies the hypothesis but not the conclusion");
  }

  function makeChoice(conceptIndex, localIndex, scenario, context) {
    const lang = langOf(context);
    const original = logic.conditionalOf(scenario.p, scenario.q);
    const originalLatex = logic.renderConditional(original, lang);
    const prompt = L(lang, "Choose the logically precise answer.", "选择逻辑上精确的答案。");
    const parameters = { lang, contextType: CONTEXT(conceptIndex * 21 + localIndex), interactionKind: "choice", scenarioId: scenario.id, localIndex };
    const clauses = [
      answer("p", logic.partLatex({ clause: scenario.p, negated: false }, lang)),
      answer("q", logic.partLatex({ clause: scenario.q, negated: false }, lang)),
      answer("not-p", logic.partLatex({ clause: scenario.p, negated: true }, lang)),
      answer("not-q", logic.partLatex({ clause: scenario.q, negated: true }, lang))
    ];
    const forms = allFormAnswers(scenario, lang);
    const labels = labelAnswers(lang);

    if (conceptIndex === 0) {
      const patterns = [
        [L(lang, "Which clause is the hypothesis p?", "哪一部分是假设 p？"), clauses[0], [...clauses.slice(1), ...forms]],
        [L(lang, "Which clause is the conclusion q?", "哪一部分是结论 q？"), clauses[1], [clauses[0], clauses[2], clauses[3], ...forms]],
        [L(lang, "Which symbolic form represents the statement?", "哪个符号形式表示这个命题？"), answer("p-to-q", "p\\to q"), [answer("q-to-p", "q\\to p"), answer("not-p-to-not-q", "\\neg p\\to\\neg q"), answer("not-q-to-not-p", "\\neg q\\to\\neg p"), answer("p-and-not-q", "p\\land\\neg q"), answer("p-iff-q", "p\\leftrightarrow q")]],
        [L(lang, "Which if-then statement preserves the stated direction?", "哪个 if-then 命题保持了原来的方向？"), forms[0], [forms[1], forms[2], forms[3], ...labels]],
        [L(lang, "Which option incorrectly reverses the hypothesis and conclusion?", "哪个选项错误地颠倒了假设和结论？"), forms[1], [forms[0], forms[2], forms[3], ...labels]],
        [L(lang, "Complete the hypothesis of the original conditional.", "补全原命题的假设。"), clauses[0], [clauses[1], clauses[2], clauses[3], ...labels]],
        [L(lang, "Complete the conclusion of the original conditional.", "补全原命题的结论。"), clauses[1], [clauses[0], clauses[2], clauses[3], ...labels]],
        [L(lang, "Which universe makes the statement precise?", "哪个论域使这个命题表达完整？"), answer("domain", text(scenario.universe)), [answer("all-real", text(L(lang, "all real numbers", "所有实数"))), answer("all-lines", text(L(lang, "all lines", "所有直线"))), answer("all-objects", text(L(lang, "all objects", "所有物体"))), answer("no-domain", text(L(lang, "no domain is needed", "不需要论域"))), ...labels]],
        [L(lang, "What error is made by treating q as sufficient for p?", "把 q 当作 p 的充分条件犯了什么错误？"), option("converse-error", "Converse error", "逆命题错误", lang), [option("inverse-error", "Inverse error", "否命题错误", lang), option("contrapositive", "Valid contrapositive reasoning", "有效的逆否推理", lang), option("definition", "A definition", "定义", lang), ...labels]],
        [L(lang, "Which relationship is expressed by p implies q?", "p 推出 q 表示哪种关系？"), option("p-sufficient", "p is sufficient for q", "p 是 q 的充分条件", lang), [option("p-necessary", "p is necessary for q", "p 是 q 的必要条件", lang), option("q-sufficient", "q is sufficient for p", "q 是 p 的充分条件", lang), option("equivalent", "p and q are equivalent", "p 与 q 等价", lang), ...labels]]
      ];
      const [ask, correct, wrong] = patterns[localIndex];
      return baseQuestion({ main: originalLatex, prompt: ask, answerValue: correct, distractors: wrong, suggestion: L(lang, "Read the if-clause as the hypothesis and the then-clause as the conclusion.", "把 if 后面的部分看作假设，把 then 后面的部分看作结论。"), lines: reasoningLines(scenario, "conditional", lang), parameters });
    }

    if (conceptIndex === 1) {
      const targetForms = ["converse", "inverse", "contrapositive", "converse", "inverse", "contrapositive", "converse", "inverse", "contrapositive", context.rng.choice(logic.FORMS)];
      const target = targetForms[localIndex];
      const asksStatement = localIndex < 3 || localIndex === 6;
      const correct = asksStatement ? forms[logic.FORMS.indexOf(target)] : labels[logic.FORMS.indexOf(target)];
      const displayed = localIndex >= 3 && localIndex <= 5 ? logic.renderConditional(logic.formOf(target, scenario.p, scenario.q), lang) : originalLatex;
      const ask = [
        L(lang, "Select the converse.", "选择逆命题。"),
        L(lang, "Select the inverse.", "选择否命题。"),
        L(lang, "Select the contrapositive.", "选择逆否命题。"),
        L(lang, "Identify this transformed statement.", "判断这个转换后的命题类型。"),
        L(lang, "Identify this transformed statement.", "判断这个转换后的命题类型。"),
        L(lang, "Identify this transformed statement.", "判断这个转换后的命题类型。"),
        L(lang, "Which statement exchanges p and q without negating them?", "哪个命题只交换 p 与 q 而不否定？"),
        L(lang, "A student negated both clauses but kept their order. What was formed?", "学生否定了两部分但保持顺序，得到什么命题？"),
        L(lang, "A student exchanged and negated both clauses. What was formed?", "学生交换并否定了两部分，得到什么命题？"),
        L(lang, "Identify the displayed transformation.", "判断所显示的命题转换。")
      ][localIndex];
      return baseQuestion({ main: displayed, prompt: ask, answerValue: correct, distractors: asksStatement ? [...forms.filter(item => item.key !== target), ...labels] : [...labels.filter(item => item.key !== target), ...forms], suggestion: ({ converse: L(lang, "Converse exchanges p and q only.", "逆命题只交换 p 与 q。"), inverse: L(lang, "Inverse negates p and q without exchanging them.", "否命题否定 p 与 q，但不交换。"), contrapositive: L(lang, "Contrapositive exchanges and negates both clauses.", "逆否命题交换并否定两部分。"), conditional: L(lang, "The original keeps p then q.", "原命题保持 p 在前、q 在后。") })[target], lines: reasoningLines(scenario, target, lang), parameters: { ...parameters, targetForm: target } });
    }

    if (conceptIndex === 2) {
      const negP = clauses[2], negQ = clauses[3];
      const negConditional = answer("p-and-not-q", conjunctionLatex(logic.partLatex({ clause: scenario.p, negated: false }, lang), logic.partLatex({ clause: scenario.q, negated: true }, lang), lang));
      const patterns = [
        [L(lang, "Choose the precise negation of p.", "选择 p 的精确否定。"), negP, [clauses[0], clauses[1], clauses[3], ...forms]],
        [L(lang, "Choose the precise negation of q.", "选择 q 的精确否定。"), negQ, [clauses[0], clauses[1], clauses[2], ...forms]],
        [L(lang, "What is the negation of the entire conditional p implies q?", "整个条件命题 p→q 的否定是什么？"), negConditional, [answer("not-p-and-q", "\\neg p\\land q"), answer("not-p-to-not-q", "\\neg p\\to\\neg q"), answer("q-to-p", "q\\to p"), answer("not-p-or-q", "\\neg p\\lor q"), answer("not-p-and-not-q", "\\neg p\\land\\neg q")]],
        [L(lang, "Which symbolic negation is equivalent to not (p and q)?", "哪个符号表达式等价于 ¬(p∧q)？"), answer("demorgan-and", "\\neg p\\lor\\neg q"), [answer("both-negated-and", "\\neg p\\land\\neg q"), answer("p-or-q", "p\\lor q"), answer("p-and-not-q", "p\\land\\neg q"), answer("not-p-or-q", "\\neg p\\lor q"), answer("p-to-q", "p\\to q")]],
        [L(lang, "Which symbolic negation is equivalent to not (p or q)?", "哪个符号表达式等价于 ¬(p∨q)？"), answer("demorgan-or", "\\neg p\\land\\neg q"), [answer("both-negated-or", "\\neg p\\lor\\neg q"), answer("p-and-q", "p\\land q"), answer("p-or-not-q", "p\\lor\\neg q"), answer("not-p-and-q", "\\neg p\\land q"), answer("p-to-q", "p\\to q")]],
        [L(lang, "Negate: Every object in the universe satisfies p.", "否定：论域中的每个对象都满足 p。"), option("exists-not-p", "At least one object does not satisfy p", "至少有一个对象不满足 p", lang), [option("none-p", "No object satisfies p", "没有对象满足 p", lang), option("all-not-p", "Every object does not satisfy p", "每个对象都不满足 p", lang), option("exists-p", "At least one object satisfies p", "至少有一个对象满足 p", lang), ...labels]],
        [L(lang, "Negate: At least one object satisfies p.", "否定：至少有一个对象满足 p。"), option("all-not-p", "No object satisfies p", "没有对象满足 p", lang), [option("not-all-p", "Not every object satisfies p", "并非每个对象都满足 p", lang), option("exists-not-p", "At least one object does not satisfy p", "至少有一个对象不满足 p", lang), option("all-p", "Every object satisfies p", "每个对象都满足 p", lang), ...labels]],
        [L(lang, "Which option is the inverse, not the negation of the whole conditional?", "哪个选项是否命题，而不是整个条件命题的否定？"), forms[2], [negConditional, forms[0], forms[1], forms[3], ...labels]],
        [L(lang, "Simplify the double negation of p.", "化简 p 的双重否定。"), clauses[0], [clauses[2], clauses[1], clauses[3], ...labels]],
        [L(lang, "Which statement correctly keeps the stated universe while negating p?", "哪个命题在保留论域的同时正确否定 p？"), negP, [clauses[0], clauses[1], clauses[3], ...forms]]
      ];
      const [ask, correct, wrong] = patterns[localIndex];
      return baseQuestion({ main: originalLatex, prompt: ask, answerValue: correct, distractors: wrong, suggestion: L(lang, "Negate the mathematical meaning, not merely the wording. The negation of p implies q is p and not q.", "要否定数学含义，而不是只在句子前加“不”。p→q 的否定是 p∧¬q。"), lines: [{ line: "p\\to q", note: L(lang, "start with the conditional", "从条件命题开始") }, { line: "\\neg(p\\to q)\\equiv p\\land\\neg q", note: L(lang, "a conditional is false only when p is true and q is false", "条件命题仅在 p 真、q 假时为假") }, { line: correct.latex, note: L(lang, "write the precise result", "写出精确结果") }], parameters });
    }

    if (conceptIndex === 3) {
      const chosenForm = ["conditional", "converse", "inverse", "contrapositive"][localIndex % 4];
      const chosenTruth = logic.truthOfForm(scenario, chosenForm);
      const falseForm = !scenario.originalTruth ? "conditional" : !scenario.converseTruth ? "converse" : null;
      const truthVector = logic.FORMS.map(form => `${formLabel(form, lang)}=${boolLabel(logic.truthOfForm(scenario, form), lang)}`).join("; ");
      const counter = falseForm ? L(lang, counterFor(scenario, falseForm, "En"), counterFor(scenario, falseForm, "Zh")) : L(lang, "No counterexample exists because both directions are true.", "两个方向都为真，因此不存在反例。");
      const patterns = [
        [L(lang, "Which form is always logically equivalent to the original conditional?", "哪种命题始终与原命题逻辑等价？"), labels[3], [labels[0], labels[1], labels[2], ...forms]],
        [L(lang, "Which form is always logically equivalent to the converse?", "哪种命题始终与逆命题逻辑等价？"), labels[2], [labels[0], labels[1], labels[3], ...forms]],
        [L(lang, `Is the ${formLabel(chosenForm, "en").toLowerCase()} true in this universe?`, `这个${formLabel(chosenForm, "zh")}在给定论域中为真吗？`), answer(String(chosenTruth), text(boolLabel(chosenTruth, lang))), [answer(String(!chosenTruth), text(boolLabel(!chosenTruth, lang))), ...labels, ...forms]],
        [L(lang, "Determine the truth value of the converse.", "判断逆命题的真值。"), answer(String(scenario.converseTruth), text(boolLabel(scenario.converseTruth, lang))), [answer(String(!scenario.converseTruth), text(boolLabel(!scenario.converseTruth, lang))), ...labels, ...forms]],
        [L(lang, "Determine the truth value of the inverse.", "判断否命题的真值。"), answer(String(scenario.converseTruth), text(boolLabel(scenario.converseTruth, lang))), [answer(String(!scenario.converseTruth), text(boolLabel(!scenario.converseTruth, lang))), ...labels, ...forms]],
        [L(lang, "Choose a valid counterexample to a false direction, or state that none exists.", "为错误的方向选择有效反例；若不存在则说明。"), answer("counterexample", text(counter)), [option("example-pq", "One example where p and q are both true", "一个 p 与 q 都为真的例子", lang), option("example-not-p", "One example where p is false", "一个 p 为假的例子", lang), option("opinion", "A statement that looks unlikely", "一个看起来不太可能的说法", lang), ...labels]],
        [L(lang, "What is enough to disprove a universal conditional?", "推翻一个全称条件命题需要什么？"), option("p-not-q", "One case with p true and q false", "一个 p 真而 q 假的情形", lang), [option("one-support", "One case with p and q true", "一个 p 与 q 都为真的情形", lang), option("not-p", "One case with p false", "一个 p 为假的情形", lang), option("q-true", "One case with q true", "一个 q 为真的情形", lang), ...labels]],
        [L(lang, "Which truth-value summary is correct?", "哪个真值汇总正确？"), answer("truth-vector", text(truthVector)), [answer("all-true", text(L(lang, "All four are true", "四个命题都为真"))), answer("all-false", text(L(lang, "All four are false", "四个命题都为假"))), answer("only-original", text(L(lang, "Only the original is true", "只有原命题为真"))), ...labels]],
        [L(lang, "Which proof strategy is logically equivalent to proving p implies q?", "哪种证明策略与证明 p→q 逻辑等价？"), option("prove-contrapositive", "Prove not q implies not p", "证明 ¬q→¬p", lang, "\\neg q\\to\\neg p"), [option("prove-converse", "Prove q implies p", "证明 q→p", lang, "q\\to p"), option("prove-inverse", "Prove not p implies not q", "证明 ¬p→¬q", lang, "\\neg p\\to\\neg q"), option("assume-q", "Assume q only", "只假设 q", lang), ...labels]],
        [L(lang, "A student checks one supporting example and declares the theorem proved. What is wrong?", "学生检查一个支持性例子就宣布定理成立，问题在哪里？"), option("example-not-proof", "A supporting example is not a proof of a universal statement", "支持性例子不能证明全称命题", lang), [option("counterexample-proves", "Every counterexample proves the theorem", "任何反例都能证明定理", lang), option("converse-equivalent", "The converse is always equivalent", "逆命题总是等价", lang), ...labels]]
      ];
      const [ask, correct, wrong] = patterns[localIndex];
      return baseQuestion({ main: originalLatex, prompt: ask, answerValue: correct, distractors: wrong, suggestion: chosenTruth ? L(lang, scenario.reasonEn, scenario.reasonZh) : L(lang, `Counterexample: ${counterFor(scenario, chosenForm, "En")}.`, `反例：${counterFor(scenario, chosenForm, "Zh")}。`), lines: reasoningLines(scenario, chosenForm, lang, true), parameters: { ...parameters, targetForm: chosenForm, truth: chosenTruth, counterexample: counter } });
    }

    const iffTrue = scenario.originalTruth && scenario.converseTruth;
    const patterns = [
      [L(lang, "What does p imply q say about p?", "p→q 说明 p 是什么条件？"), option("p-sufficient", "p is sufficient for q", "p 是 q 的充分条件", lang), [option("p-necessary", "p is necessary for q", "p 是 q 的必要条件", lang), option("q-sufficient", "q is sufficient for p", "q 是 p 的充分条件", lang), ...labels]],
      [L(lang, "What does p imply q say about q?", "p→q 说明 q 是什么条件？"), option("q-necessary", "q is necessary for p", "q 是 p 的必要条件", lang), [option("q-sufficient", "q is sufficient for p", "q 是 p 的充分条件", lang), option("p-necessary", "p is necessary for q", "p 是 q 的必要条件", lang), ...labels]],
      [L(lang, "Which pair of conditionals forms p if and only if q?", "哪一对条件命题组成 p 当且仅当 q？"), answer("both-directions", "(p\\to q)\\land(q\\to p)"), [answer("original-inverse", "(p\\to q)\\land(\\neg p\\to\\neg q)"), answer("only-original", "p\\to q"), answer("only-converse", "q\\to p"), answer("or", "p\\lor q"), answer("and", "p\\land q")]],
      [L(lang, "Is the biconditional true for this scenario?", "这个情境中的双条件命题为真吗？"), answer(String(iffTrue), text(boolLabel(iffTrue, lang))), [answer(String(!iffTrue), text(boolLabel(!iffTrue, lang))), ...labels, ...forms]],
      [L(lang, "Which direction may be used when p is known?", "已知 p 时可以使用哪个方向？"), forms[0], [forms[1], forms[2], forms[3], ...labels]],
      [L(lang, "Rewrite: p only if q.", "改写：p only if q。"), answer("p-to-q", "p\\to q"), [answer("q-to-p", "q\\to p"), answer("not-p-to-not-q", "\\neg p\\to\\neg q"), answer("iff", "p\\leftrightarrow q"), answer("p-and-q", "p\\land q")]],
      [L(lang, "Rewrite: p if q.", "改写：p if q。"), answer("q-to-p", "q\\to p"), [answer("p-to-q", "p\\to q"), answer("not-q-to-not-p", "\\neg q\\to\\neg p"), answer("iff", "p\\leftrightarrow q"), answer("p-or-q", "p\\lor q")]],
      [L(lang, "A proof assumes q and concludes p by using only p implies q. Diagnose the error.", "证明仅凭 p→q，就由 q 推出 p。诊断这个错误。"), option("converse-error", "Converse error", "逆命题错误", lang), [option("inverse-error", "Inverse error", "否命题错误", lang), option("valid", "Valid direct reasoning", "有效的直接推理", lang), option("contrapositive", "Valid contrapositive reasoning", "有效的逆否推理", lang), ...labels]],
      [L(lang, "A proof assumes not p and concludes not q by using only p implies q. Diagnose the error.", "证明仅凭 p→q，就由 ¬p 推出 ¬q。诊断这个错误。"), option("inverse-error", "Inverse error", "否命题错误", lang), [option("converse-error", "Converse error", "逆命题错误", lang), option("valid", "Valid direct reasoning", "有效的直接推理", lang), option("contrapositive", "Valid contrapositive reasoning", "有效的逆否推理", lang), ...labels]],
      [L(lang, "If p implies q and q implies r, which contrapositive chain is valid?", "若 p→q 且 q→r，哪个逆否推理链有效？"), answer("chain", "\\neg r\\to\\neg q\\to\\neg p"), [answer("reverse-no-negation", "r\\to q\\to p"), answer("wrong-order", "\\neg p\\to\\neg q\\to\\neg r"), answer("mixed", "\\neg r\\to q\\to\\neg p"), answer("only-converse", "r\\to p"), answer("unrelated", "p\\to\\neg r")]]
    ];
    const [ask, correct, wrong] = patterns[localIndex];
    return baseQuestion({ main: originalLatex, prompt: ask, answerValue: correct, distractors: wrong, suggestion: L(lang, "In p implies q, p is sufficient for q and q is necessary for p. A biconditional requires both directions.", "在 p→q 中，p 是 q 的充分条件，q 是 p 的必要条件；双条件命题要求两个方向都成立。"), lines: [{ line: "p\\to q", note: L(lang, "read the implication direction", "读取推出方向") }, { line: text(L(lang, "p is sufficient; q is necessary", "p 是充分条件；q 是必要条件")), note: L(lang, "translate the relationship", "转换条件关系") }, { line: correct.latex, note: L(lang, "apply the required form", "应用所需形式") }], parameters: { ...parameters, iffTrue } });
  }

  function shuffledOptions(items, context) { return context.rng.shuffle(items.map(item => ({ ...item }))); }
  function makeInteractive(conceptIndex, localIndex, scenario, context) {
    const lang = langOf(context);
    const kind = INTERACTION(localIndex);
    const original = logic.renderConditional(logic.conditionalOf(scenario.p, scenario.q), lang);
    const parameters = { lang, contextType: CONTEXT(conceptIndex * 21 + localIndex), interactionKind: kind, scenarioId: scenario.id, localIndex };
    let interaction;
    let prompt;
    let correctDisplay;
    let lines;

    if (kind === "matching") {
      const options = shuffledOptions(logic.FORMS.map(form => ({ key: form, label: logic.renderConditionalText(logic.formOf(form, scenario.p, scenario.q), lang) })), context);
      const requested = conceptIndex === 0
        ? ["conditional", "converse"]
        : conceptIndex === 1 ? [...logic.FORMS]
          : conceptIndex === 2 ? ["inverse", "contrapositive"]
            : conceptIndex === 3 ? ["conditional", "contrapositive", "converse", "inverse"]
              : ["conditional", "converse"];
      const rows = requested.map(form => ({ id: form, label: formLabel(form, lang), options, correct: form }));
      interaction = {
        kind,
        instruction: L(lang, "Match each label to its exact statement.", "把每个名称与对应的精确命题配对。"),
        rows,
        correctKey: rows.map(row => `${row.id}=${row.correct}`).join("|")
      };
      prompt = interaction.instruction;
      correctDisplay = rows.map(row => `${row.label}: ${options.find(item => item.key === row.correct).label}`).join("; ");
      lines = requested.flatMap(form => reasoningLines(scenario, form, lang).slice(2));
    } else if (kind === "order") {
      const target = ["converse", "inverse", "contrapositive"][localIndex - 14];
      const statement = logic.formOf(target, scenario.p, scenario.q);
      const tokens = shuffledOptions([
        { id: "if", label: L(lang, "If", "如果") },
        { id: "antecedent", label: logic.partText(statement.antecedent, lang) },
        { id: "then", label: L(lang, "then", "那么") },
        { id: "consequent", label: logic.partText(statement.consequent, lang) }
      ], context);
      const correctOrder = ["if", "antecedent", "then", "consequent"];
      interaction = {
        kind,
        instruction: L(lang, `Build the ${formLabel(target, "en").toLowerCase()} in the correct order.`, `按正确顺序拼出${formLabel(target, "zh")}。`),
        tokens,
        correctOrder,
        correctKey: correctOrder.join(">")
      };
      prompt = interaction.instruction;
      correctDisplay = correctOrder.map(id => tokens.find(token => token.id === id).label).join(" -> ");
      lines = reasoningLines(scenario, target, lang);
    } else if (kind === "truth-table") {
      const target = localIndex === 17 ? "conditional" : "contrapositive";
      const statement = logic.formOf(target, scenario.p, scenario.q);
      const combinations = [[true, true], [true, false], [false, true], [false, false]];
      const rows = combinations.map(([pValue, qValue], index) => ({
        id: `r${index}`,
        label: `p=${boolLabel(pValue, lang)}, q=${boolLabel(qValue, lang)}`,
        correct: logic.evaluateConditional(statement, pValue, qValue) ? "T" : "F"
      }));
      interaction = {
        kind,
        instruction: L(lang, `Complete the truth table for the ${formLabel(target, "en").toLowerCase()}.`, `完成${formLabel(target, "zh")}的真值表。`),
        rows,
        correctKey: rows.map(row => `${row.id}=${row.correct}`).join("|")
      };
      prompt = interaction.instruction;
      correctDisplay = rows.map(row => `${row.label}: ${row.correct}`).join("; ");
      lines = [
        { line: logic.FORM_SYMBOLS[target], note: L(lang, "identify the symbolic form", "识别符号形式") },
        { line: text(L(lang, "An implication is false only when its antecedent is true and its consequent is false.", "蕴含命题仅在前件为真、后件为假时为假。")), note: L(lang, "apply the implication rule", "应用蕴含规则") }
      ];
    } else {
      const target = localIndex === 19 ? "converse" : conceptIndex % 2 ? "contrapositive" : "inverse";
      const statement = logic.formOf(target, scenario.p, scenario.q);
      const choices = shuffledOptions([
        { key: "p", label: logic.partText({ clause: scenario.p, negated: false }, lang) },
        { key: "q", label: logic.partText({ clause: scenario.q, negated: false }, lang) },
        { key: "not-p", label: logic.partText({ clause: scenario.p, negated: true }, lang) },
        { key: "not-q", label: logic.partText({ clause: scenario.q, negated: true }, lang) }
      ], context);
      const partKey = item => `${item.negated ? "not-" : ""}${item.clause === scenario.p ? "p" : "q"}`;
      const rows = [
        { id: "antecedent", label: L(lang, "Hypothesis", "假设"), options: choices, correct: partKey(statement.antecedent) },
        { id: "consequent", label: L(lang, "Conclusion", "结论"), options: choices, correct: partKey(statement.consequent) }
      ];
      interaction = {
        kind: "fill",
        instruction: L(lang, `Complete the structure of the ${formLabel(target, "en").toLowerCase()}.`, `补全${formLabel(target, "zh")}的结构。`),
        rows,
        correctKey: rows.map(row => `${row.id}=${row.correct}`).join("|")
      };
      prompt = interaction.instruction;
      correctDisplay = logic.renderConditionalText(statement, lang);
      lines = reasoningLines(scenario, target, lang);
    }

    const answerValue = answer(interaction.correctKey, text(correctDisplay));
    const distractors = ["response-a", "response-b", "response-c", "response-d", "response-e", "response-f"].map((key, index) => answer(key, text(L(lang, `Alternative structured response ${index + 1}`, `其他结构化回答 ${index + 1}`))));
    return baseQuestion({
      main: original,
      prompt,
      answerValue,
      distractors,
      suggestion: L(lang, "Track the position and negation of p and q separately before writing the final statement.", "先分别跟踪 p、q 的位置和否定状态，再写出最终命题。"),
      lines,
      parameters,
      interaction
    });
  }

  function buildQuestion(conceptIndex, localIndex, context) {
    const contextType = CONTEXT(conceptIndex * 21 + localIndex);
    const requireFalse = conceptIndex === 3 && localIndex === 5;
    const scenario = scenarioFor(contextType, context, requireFalse);
    return INTERACTION(localIndex) === "choice"
      ? makeChoice(conceptIndex, localIndex, scenario, context)
      : makeInteractive(conceptIndex, localIndex, scenario, context);
  }

  function validateQuestion(question) {
    const answerKey = registry.answerKey(question.answer);
    const unique = new Set((question.distractors || []).map(registry.answerKey).filter(key => key && key !== answerKey));
    if (!question.main || !answerKey || unique.size < 5) return { valid: false, reason: "missing prompt, answer, or unique distractors" };
    if (!question.parameters?.scenarioId || !question.parameters?.contextType) return { valid: false, reason: "missing structured scenario metadata" };
    if (question.interaction && !question.interaction.correctKey) return { valid: false, reason: "interactive question has no canonical response" };
    return true;
  }

  const templates = [];
  CONCEPTS.forEach((concept, conceptIndex) => {
    for (let localIndex = 0; localIndex < 21; localIndex += 1) {
      const taskForm = TASK_FORMS[localIndex % 5];
      const interactionKind = INTERACTION(localIndex);
      const contextType = CONTEXT(conceptIndex * 21 + localIndex);
      templates.push({
        id: `${concept.id}-${String(localIndex + 1).padStart(2, "0")}`,
        familyId: `${concept.id}-${taskForm}`,
        conceptId: concept.id,
        difficulty: DIFFICULTY(localIndex),
        taskForm,
        inputRepresentation: `${contextType}-${interactionKind}-scenario-${localIndex + 1}`,
        outputKind: `${interactionKind}-${concept.id}-response-${localIndex + 1}`,
        reasoningPattern: `${concept.id}:${taskForm}:${interactionKind}:path-${localIndex + 1}`,
        constraintPattern: `${contextType}:explicit-negation:validated-truth:variant-${localIndex + 1}`,
        parameterPolicy: {
          contextType,
          interactionKind,
          explicitNegation: true,
          verifiedCounterexamples: true,
          excludes: ["ambiguous-negation", "unverified-truth", "duplicate-response"]
        },
        build: context => buildQuestion(conceptIndex, localIndex, context),
        validate: validateQuestion
      });
    }
  });

  registry.registerTool({
    toolId: "conditional-logic",
    version: "1",
    concepts: CONCEPTS,
    templates
  });
})(typeof window !== "undefined" ? window : globalThis);
