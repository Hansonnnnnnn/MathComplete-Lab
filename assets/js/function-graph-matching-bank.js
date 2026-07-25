(function (root) {
  "use strict";

  const factory = root.MCLSemanticBankFactory;
  if (!factory || root.MCLQuestionTemplates?.getTool("function-graph-matching")) return;

  const concepts = [
    "linear-quadratic-absolute",
    "radical-rational",
    "exponential-logarithmic",
    "trigonometric",
    "piecewise-transformations-comparison"
  ];
  const pools = {
    "linear-quadratic-absolute": ["linear", "quadratic", "absolute", "cubic"],
    "radical-rational": ["sqrt", "reciprocal", "logarithmic", "absolute"],
    "exponential-logarithmic": ["exponential", "logarithmic", "reciprocal", "linear"],
    trigonometric: ["sine", "cosine", "tangent"],
    "piecewise-transformations-comparison": ["piecewise", "linear", "quadratic", "absolute", "sqrt", "exponential", "cubic"]
  };

  const L = (lang, en, zh) => lang === "zh" ? zh : en;
  const signed = n => n < 0 ? `-${Math.abs(n)}` : n > 0 ? `+${n}` : "";
  const shift = (x, h) => h ? `${x}${h > 0 ? "-" : "+"}${Math.abs(h)}` : x;
  const coeff = (a, body) => a === 1 ? body : a === -1 ? `-${body}` : `${a}${body}`;

  function createFunction(kind, index, rng, lang) {
    const id = `f${index}`;
    const integer = (min, max, excluded = []) => {
      let value;
      do value = rng.int(min, max); while (excluded.includes(value));
      return value;
    };
    const a = rng.choice([-2, -1, 1, 2]);
    const h = rng.int(-3, 3);
    const k = rng.int(-3, 3);
    const base = rng.choice([2, 3, 0.5]);
    const periodFactor = rng.choice([0.5, 1, 2]);
    const result = { id, kind };

    if (kind === "linear") {
      const m = rng.choice([-3, -2, -1, 1, 2, 3]);
      const b = rng.int(-3, 3);
      return { ...result, expression: `y=${coeff(m, "x")}${signed(b)}`, latex: `y=${coeff(m, "x")}${signed(b)}`, eval: x => m * x + b,
        features: L(lang, `Line: slope ${m}, y-intercept ${b}.`, `直线：斜率 ${m}，y 截距 ${b}。`) };
    }
    if (kind === "quadratic") return { ...result, expression: `y=${coeff(a, `(${shift("x", h)})^2`)}${signed(k)}`, latex: `y=${coeff(a, `\\left(${shift("x", h)}\\right)^2`)}${signed(k)}`, eval: x => a * (x - h) ** 2 + k,
      features: L(lang, `Parabola: vertex (${h}, ${k}), opens ${a > 0 ? "up" : "down"}.`, `抛物线：顶点 (${h}, ${k})，开口向${a > 0 ? "上" : "下"}。`) };
    if (kind === "absolute") return { ...result, expression: `y=${coeff(a, `|${shift("x", h)}|`)}${signed(k)}`, latex: `y=${coeff(a, `\\left|${shift("x", h)}\\right|`)}${signed(k)}`, eval: x => a * Math.abs(x - h) + k,
      features: L(lang, `Absolute-value graph: vertex (${h}, ${k}).`, `绝对值图像：顶点 (${h}, ${k})。`) };
    if (kind === "cubic") return { ...result, expression: `y=${coeff(a, `(${shift("x", h)})^3`)}${signed(k)}`, latex: `y=${coeff(a, `\\left(${shift("x", h)}\\right)^3`)}${signed(k)}`, eval: x => a * (x - h) ** 3 + k,
      features: L(lang, `Cubic graph with center of symmetry (${h}, ${k}).`, `三次函数图像：对称中心 (${h}, ${k})。`) };
    if (kind === "sqrt") return { ...result, expression: `y=${coeff(a, `sqrt(${shift("x", h)})`)}${signed(k)}`, latex: `y=${coeff(a, `\\sqrt{${shift("x", h)}}`)}${signed(k)}`, eval: x => x < h ? NaN : a * Math.sqrt(x - h) + k,
      features: L(lang, `Square-root graph begins at (${h}, ${k}).`, `平方根图像起点为 (${h}, ${k})。`) };
    if (kind === "reciprocal") {
      const numerator = rng.choice([-4, -3, -2, 2, 3, 4]);
      return { ...result, expression: `y=${numerator}/(${shift("x", h)})${signed(k)}`, latex: `y=\\frac{${numerator}}{${shift("x", h)}}${signed(k)}`, eval: x => Math.abs(x - h) < 0.05 ? NaN : numerator / (x - h) + k,
        asymptotes: [{ type: "vertical", value: h }, { type: "horizontal", value: k }],
        features: L(lang, `Reciprocal graph: asymptotes x=${h}, y=${k}.`, `反比例图像：渐近线 x=${h}、y=${k}。`) };
    }
    if (kind === "exponential") return { ...result, expression: `y=${coeff(a, `${base}^x`)}${signed(k)}`, latex: `y=${coeff(a, `${base === 0.5 ? "\\left(\\frac12\\right)" : base}^{x}`)}${signed(k)}`, eval: x => a * base ** x + k,
      asymptotes: [{ type: "horizontal", value: k }],
      features: L(lang, `Exponential graph: horizontal asymptote y=${k}.`, `指数图像：水平渐近线 y=${k}。`) };
    if (kind === "logarithmic") return { ...result, expression: `y=${coeff(a, `log2(${shift("x", h)})`)}${signed(k)}`, latex: `y=${coeff(a, `\\log_{2}\\left(${shift("x", h)}\\right)`)}${signed(k)}`, eval: x => x <= h ? NaN : a * Math.log2(x - h) + k,
      asymptotes: [{ type: "vertical", value: h }],
      features: L(lang, `Logarithmic graph: vertical asymptote x=${h}.`, `对数图像：垂直渐近线 x=${h}。`) };
    if (kind === "sine" || kind === "cosine") {
      const fn = kind === "sine" ? "sin" : "cos";
      return { ...result, expression: `y=${coeff(a, `${fn}(${periodFactor}x)`)}${signed(k)}`, latex: `y=${coeff(a, `\\${fn}\\left(${periodFactor === 1 ? "" : periodFactor}x\\right)`)}${signed(k)}`,
        eval: x => a * (fn === "sin" ? Math.sin(periodFactor * x) : Math.cos(periodFactor * x)) + k,
        features: L(lang, `${fn}: amplitude ${Math.abs(a)}, midline y=${k}, period ${2 / periodFactor}π.`, `${fn === "sin" ? "正弦" : "余弦"}：振幅 ${Math.abs(a)}，中线 y=${k}，周期 ${2 / periodFactor}π。`) };
    }
    if (kind === "tangent") return { ...result, expression: `y=${coeff(a, `tan(${periodFactor}x)`)}${signed(k)}`, latex: `y=${coeff(a, `\\tan\\left(${periodFactor === 1 ? "" : periodFactor}x\\right)`)}${signed(k)}`,
      eval: x => Math.abs(Math.cos(periodFactor * x)) < 0.07 ? NaN : a * Math.tan(periodFactor * x) + k,
      features: L(lang, `Tangent graph with midline y=${k} and repeating vertical asymptotes.`, `正切图像：中线 y=${k}，并有重复的垂直渐近线。`) };

    const leftSlope = integer(-3, 3, [0]);
    const rightSlope = integer(-3, 3, [0, leftSlope]);
    return { ...result, expression: `y={${leftSlope}x${signed(k)},x<0;${rightSlope}x${signed(h)},x>=0}`, latex: `y=\\begin{cases}${leftSlope}x${signed(k)},&x<0\\\\${rightSlope}x${signed(h)},&x\\ge0\\end{cases}`,
      eval: x => x < 0 ? leftSlope * x + k : rightSlope * x + h,
      features: L(lang, `Piecewise linear graph with a rule change at x=0.`, `分段线性图像：在 x=0 处更换规则。`) };
  }

  function countFor(difficulty) {
    return { easy: 3, medium: 4, hard: 5, expert: 6 }[difficulty] || 4;
  }

  function makeSet({ conceptId, taskForm, difficulty, rng, lang }) {
    const count = countFor(difficulty);
    let kindPool = [...pools[conceptId]];
    if (taskForm === "translate") kindPool = [...new Set([...kindPool, "linear", "quadratic", "sqrt"])];
    if (taskForm === "interpret") kindPool = [...new Set([...kindPool, "reciprocal", "exponential"])];
    const chosen = [];
    if (taskForm === "diagnose") {
      const nearKind = rng.choice(kindPool);
      while (chosen.length < count) chosen.push(nearKind);
    } else {
      while (chosen.length < count) {
        const cycle = rng.shuffle(kindPool);
        cycle.forEach(kind => { if (chosen.length < count) chosen.push(kind); });
      }
    }
    const functions = [];
    chosen.forEach((kind, index) => {
      let fn;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        fn = createFunction(kind, index + 1, rng, lang);
        if (!functions.some(item => item.latex === fn.latex)) break;
      }
      functions.push(fn);
    });
    const graphs = rng.shuffle(functions).map((fn, index) => ({ ...fn, label: String.fromCharCode(65 + index) }));
    return { difficulty, conceptId, taskForm, functions, graphs };
  }

  function build(context) {
    const difficulty = context.template?.difficulty || "medium";
    const set = makeSet({ ...context, difficulty });
    const answer = factory.text(L(context.lang, "all expressions matched to their corresponding graphs", "所有表达式均与对应图像正确匹配"));
    const distractors = [
      factory.text(L(context.lang, "one pair is reversed", "有一组配对颠倒")),
      factory.text(L(context.lang, "two graph labels are exchanged", "两个图像标签互换")),
      factory.text(L(context.lang, "vertical shifts are ignored", "忽略了竖直平移")),
      factory.text(L(context.lang, "horizontal shifts are reversed", "水平平移方向颠倒")),
      factory.text(L(context.lang, "parent functions only are matched", "只按母函数配对")),
      factory.text(L(context.lang, "asymptotes are treated as axes", "把渐近线误认为坐标轴"))
    ];
    return {
      main: set.functions.map(item => item.latex).join("\\quad"),
      plain: set.functions.map(item => item.expression).join("; "),
      answer,
      distractors,
      prompt: L(context.lang, "Match each expression to its exact graph.", "把每个表达式与其精确图像配对。"),
      suggestion: L(context.lang, "Compare defining features before using individual points.", "先比较决定性图像特征，再检查具体点。"),
      lines: [
        { line: set.functions.map(item => item.latex).join("\\quad"), note: L(context.lang, "identify each function family", "判断每个函数族") },
        { line: answer, note: L(context.lang, "verify transformations and graph features", "核对变换与图像特征") }
      ],
      audit: { matchingSet: set },
      parameters: { conceptId: context.conceptId, taskForm: context.taskForm, kinds: set.functions.map(item => item.kind) }
    };
  }

  factory.register({
    toolId: "function-graph-matching",
    course: "algebra-2",
    concepts,
    build
  });

  root.MCLFunctionGraphBank = Object.freeze({ createFunction, makeSet });
})(typeof window !== "undefined" ? window : globalThis);
