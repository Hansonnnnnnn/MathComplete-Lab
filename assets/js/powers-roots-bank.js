(function () {
  "use strict";

  const registry = window.MCLQuestionTemplates;
  if (!registry || !window.MCLQuizTool) return;

  const concepts = [
    { id: "integer-powers" },
    { id: "perfect-roots" },
    { id: "inverse-missing-value" },
    { id: "signed-fractional-bases" },
    { id: "mixed-applications" }
  ];
  const forms = registry.TASK_FORMS;
  const variants = ["symbolic", "equation", "comparison", "context"];

  function unique(values) {
    return [...new Map(values.map(value => [key(value), value])).values()];
  }

  function key(value) {
    return registry.answerKey(value);
  }

  function numericDistractors(answer, extras = []) {
    const magnitude = Math.max(1, Math.abs(answer));
    const candidates = [
      ...extras,
      answer + 1,
      answer - 1,
      answer + 2,
      answer - 2,
      -answer,
      answer + Math.max(3, Math.round(magnitude / 2)),
      answer - Math.max(3, Math.round(magnitude / 2)),
      answer * 2,
      answer === 0 ? 3 : Math.trunc(answer / 2)
    ];
    return unique(candidates.filter(Number.isFinite).map(String).filter(value => key(value) !== key(String(answer)))).slice(0, 7);
  }

  function optionDistractors(answer, candidates) {
    return unique(candidates.filter(value => key(value) !== key(answer))).slice(0, 7);
  }

  function make(main, answer, distractors, meta = {}) {
    return {
      main,
      plain: main,
      answer: String(answer),
      distractors: optionDistractors(String(answer), distractors.map(String)),
      prompt: meta.prompt || "",
      lines: meta.lines || [{ line: main, note: meta.note || "" }, { line: String(answer), note: meta.final || "" }],
      suggestion: meta.suggestion || "",
      parameters: meta.parameters || null
    };
  }

  function numberQuestion(main, answer, extras, meta) {
    return make(main, answer, numericDistractors(answer, extras), meta);
  }

  function pow(base, exponent) {
    return base ** exponent;
  }

  function integerPowerFamily(task, variant, rng, text) {
    const base = rng.int(variant >= 2 ? 2 : 3, variant >= 2 ? 7 : 12);
    const exponent = rng.int(variant === 0 ? 2 : 3, variant >= 2 ? 5 : 4);
    const value = pow(base, exponent);
    if (task === "direct") {
      const main = variant === 1 ? `\\underbrace{${base}\\cdot${base}\\cdots${base}}_{${exponent}\\text{ factors}}` : `${base}^{${exponent}}`;
      return numberQuestion(main, value, [base * exponent, pow(base, exponent - 1), value + base], { prompt: text.evaluate, parameters: { base, exponent } });
    }
    if (task === "inverse") {
      return numberQuestion(`\\Box^{${exponent}}=${value}`, base, [exponent, value, base + exponent], { prompt: text.missingBase, parameters: { base, exponent, value } });
    }
    if (task === "interpret") {
      const expressions = unique([
        `${base}^{${exponent}}`, `${base + 1}^{${exponent}}`, `${base}^{${exponent + 1}}`,
        `${base + 2}^{${Math.max(2, exponent - 1)}}`, `${base - 1}^{${exponent + 1}}`, `${base + 3}^{2}`
      ]);
      const scored = expressions.map(latex => {
        const match = latex.match(/(\d+)\^\{(\d+)\}/);
        return { latex, value: pow(Number(match[1]), Number(match[2])) };
      }).sort((a, b) => b.value - a.value);
      return make(`\\text{Which power has the greatest value?}`, scored[0].latex, scored.slice(1).map(item => item.latex), { prompt: text.compare, parameters: { expressions } });
    }
    if (task === "translate") {
      const answer = `${base}^{${exponent}}`;
      return make(`${Array(exponent).fill(base).join("\\cdot")}`, answer, [
        `${base}\\cdot${exponent}`, `${exponent}^{${base}}`, `${base}^{${exponent - 1}}`,
        `${base + exponent}^{2}`, `${base}^{${exponent + 1}}`, `${base * exponent}`
      ], { prompt: text.writePower, parameters: { base, exponent } });
    }
    const answer = `${base}^{${exponent}}=${value}`;
    return make(`\\text{Choose the correct evaluation.}`, answer, [
      `${base}^{${exponent}}=${base * exponent}`, `${base}^{${exponent}}=${pow(base, exponent - 1)}`,
      `${base}^{${exponent}}=${value + base}`, `${base}^{${exponent}}=${value - base}`,
      `${exponent}^{${base}}=${value}`, `${base}^{${exponent + 1}}=${value}`,
      `${base}^{${exponent}}=${value + 1}`, `${base}^{${exponent}}=${value - 1}`
    ], { prompt: text.diagnose, parameters: { base, exponent } });
  }

  function perfectRootFamily(task, variant, rng, text) {
    const index = variant % 2 === 0 ? 2 : 3;
    const root = rng.int(2, index === 2 ? 18 : 9);
    const radicand = pow(root, index);
    const radical = index === 2 ? `\\sqrt{${radicand}}` : `\\sqrt[3]{${radicand}}`;
    if (task === "direct") return numberQuestion(radical, root, [radicand, pow(root, index - 1), root * index], { prompt: text.evaluate, parameters: { index, root, radicand } });
    if (task === "inverse") return numberQuestion(`\\sqrt[${index}]{\\Box}=${root}`, radicand, [root * index, pow(root, index - 1), radicand + root], { prompt: text.missingRadicand, parameters: { index, root } });
    if (task === "interpret") {
      const roots = [root, root + 1, root + 2, root + 3, root + 4, root + 5];
      const options = roots.map(value => index === 2 ? `\\sqrt{${value * value}}` : `\\sqrt[3]{${value ** 3}}`);
      const answer = options[roots.indexOf(Math.max(...roots))];
      return make(`\\text{Which radical has the greatest value?}`, answer, options, { prompt: text.compare, parameters: { index, roots } });
    }
    if (task === "translate") {
      const answer = index === 2 ? `\\sqrt{${radicand}}=${root}` : `\\sqrt[3]{${radicand}}=${root}`;
      return make(`${root}^{${index}}=${radicand}`, answer, [
        `\\sqrt{${root}}=${radicand}`, `\\sqrt[${index}]{${root}}=${radicand}`,
        `\\sqrt[${index}]{${radicand}}=${index}`, `\\sqrt[${root}]{${radicand}}=${index}`,
        `\\sqrt[${index + 1}]{${radicand}}=${root}`, `\\sqrt[${index}]{${radicand + root}}=${root}`,
        `\\sqrt[${index}]{${radicand}}=${root + 1}`, `\\sqrt[${index + 2}]{${radicand}}=${root}`
      ], { prompt: text.writeInverse, parameters: { index, root, radicand } });
    }
    const answer = `${radical}=${root}`;
    return make(`\\text{Choose the correct root statement.}`, answer, [
      `${radical}=${radicand}`, `${radical}=${root * index}`, `${radical}=${pow(root, index - 1)}`,
      `${radical}=${root + 1}`, `${radical}=${root - 1}`, `${radical}=-${root}`,
      `${radical}=${root + 2}`, `${radical}=${Math.max(0, root - 2)}`
    ], { prompt: text.diagnose, parameters: { index, root, radicand } });
  }

  function missingValueFamily(task, variant, rng, text) {
    const base = rng.int(2, 6);
    const exponent = rng.int(2, variant >= 2 ? 6 : 5);
    const value = pow(base, exponent);
    if (task === "direct") return numberQuestion(`${base}^{\\Box}=${value}`, exponent, [base, value, exponent + 1], { prompt: text.missingExponent, parameters: { base, exponent } });
    if (task === "inverse") return numberQuestion(`\\sqrt[\\Box]{${value}}=${base}`, exponent, [base, value, exponent - 1], { prompt: text.missingIndex, parameters: { base, exponent } });
    if (task === "interpret") {
      const candidates = [2, 3, 4, 5, 6, 7];
      const answer = `${base}^{${exponent}}`;
      return make(`\\text{Which expression equals }${value}\\text{?}`, answer, candidates.map(n => `${base}^{${n}}`).concat([`${exponent}^{${base}}`]), { prompt: text.matchValue, parameters: { base, exponent, value } });
    }
    if (task === "translate") {
      const answer = `\\sqrt[${exponent}]{${value}}=${base}`;
      return make(`${base}^{${exponent}}=${value}`, answer, [
        `\\sqrt[${base}]{${value}}=${exponent}`, `\\sqrt[${exponent}]{${base}}=${value}`,
        `\\sqrt[${exponent + 1}]{${value}}=${base}`, `\\sqrt{${value}}=${base}`,
        `\\sqrt[${exponent}]{${value + base}}=${base}`, `\\sqrt[${exponent}]{${value}}=${exponent}`,
        `\\sqrt[${exponent}]{${value}}=${base + 1}`, `\\sqrt[${exponent + 2}]{${value}}=${base}`
      ], { prompt: text.writeInverse, parameters: { base, exponent, value } });
    }
    const answer = `${base}^{${exponent}}=${value}`;
    return make(`\\text{Which equation verifies the missing value }${exponent}\\text{?}`, answer, [
      `${base}\\cdot${exponent}=${value}`, `${exponent}^{${base}}=${value}`, `${base}^{${exponent - 1}}=${value}`,
      `${base}^{${exponent + 1}}=${value}`, `${value}^{${exponent}}=${base}`, `${base}^{${exponent}}=${value + base}`
    ], { prompt: text.diagnose, parameters: { base, exponent, value } });
  }

  function signedFractionFamily(task, variant, rng, text) {
    const numerator = rng.int(2, 5);
    const denominator = rng.int(numerator + 1, 8);
    const exponent = rng.int(2, variant >= 2 ? 5 : 4);
    const sign = variant % 2 === 0 ? -1 : 1;
    const resultSign = sign < 0 && exponent % 2 ? "-" : "";
    const answer = `${resultSign}\\frac{${numerator ** exponent}}{${denominator ** exponent}}`;
    const baseLatex = `${sign < 0 ? "-" : ""}\\frac{${numerator}}{${denominator}}`;
    if (task === "direct") return make(`\\left(${baseLatex}\\right)^{${exponent}}`, answer, [
      `\\frac{${numerator * exponent}}{${denominator * exponent}}`, `-${answer.replace("-", "")}`,
      `\\frac{${numerator ** exponent}}{${denominator}}`, `\\frac{${numerator}}{${denominator ** exponent}}`,
      `\\frac{${denominator ** exponent}}{${numerator ** exponent}}`, `\\frac{${numerator + exponent}}{${denominator + exponent}}`
    ], { prompt: text.evaluate, parameters: { numerator, denominator, exponent, sign } });
    if (task === "inverse") {
      const positiveRoot = `\\frac{${numerator}}{${denominator}}`;
      return make(`\\sqrt[${exponent}]{\\frac{${numerator ** exponent}}{${denominator ** exponent}}}`, positiveRoot, [baseLatex, `\\frac{${denominator}}{${numerator}}`, `${numerator}`, `${denominator}`, `\\frac{${numerator ** exponent}}{${denominator ** exponent}}`, `\\frac{${numerator}}{${denominator ** exponent}}`], { prompt: text.evaluate, parameters: { numerator, denominator, exponent } });
    }
    if (task === "interpret") {
      const answerText = exponent % 2 === 0 ? text.positive : text.negative;
      return make(`\\text{The sign of }\\left(-\\frac{${numerator}}{${denominator}}\\right)^{${exponent}}\\text{ is}`, answerText, [text.zero, text.undefined, text.opposite, text.integer, text.irrational], { prompt: text.sign, parameters: { exponent } });
    }
    if (task === "translate") {
      const product = Array(exponent).fill(`\\left(${baseLatex}\\right)`).join("\\cdot");
      return make(product, `\\left(${baseLatex}\\right)^{${exponent}}`, [`\\left(${baseLatex}\\right)^{${exponent - 1}}`, `\\left(${baseLatex}\\right)^{${exponent + 1}}`, `\\frac{${numerator * exponent}}{${denominator}}`, `\\left(\\frac{${denominator}}{${numerator}}\\right)^{${exponent}}`, `${baseLatex}\\cdot${exponent}`, `\\left(-\\frac{${numerator}}{${denominator}}\\right)^{2}`], { prompt: text.writePower, parameters: { numerator, denominator, exponent, sign } });
    }
    const correct = `\\left(-${numerator}\\right)^{${exponent}}=${(-numerator) ** exponent}`;
    return make(`\\text{Choose the statement with correct sign handling.}`, correct, [
      `-${numerator}^{${exponent}}=${numerator ** exponent}`, `\\left(-${numerator}\\right)^{${exponent}}=-${numerator ** exponent}`,
      `\\left(-${numerator}\\right)^{${exponent}}=${-numerator * exponent}`, `-${numerator}^{${exponent}}=${numerator * exponent}`,
      `\\left(-${numerator}\\right)^{${exponent}}=${numerator + exponent}`, `\\left(-${numerator}\\right)^{${exponent}}=0`,
      `\\left(-${numerator}\\right)^{${exponent}}=${numerator ** exponent + 1}`,
      `\\left(-${numerator}\\right)^{${exponent}}=${numerator ** exponent - 1}`
    ], { prompt: text.diagnose, parameters: { numerator, exponent } });
  }

  function applicationFamily(task, variant, rng, text) {
    const side = rng.int(2, variant >= 2 ? 14 : 10);
    const area = side ** 2;
    const volume = side ** 3;
    if (task === "direct") return numberQuestion(`\\text{A square has area }${area}.\\ \\text{Find its side length.}`, side, [area, side * 2, Math.floor(area / 2)], { prompt: text.model, parameters: { side, area } });
    if (task === "inverse") return numberQuestion(`\\text{A cube has edge }${side}.\\ \\text{Find its volume.}`, volume, [area, side * 3, volume + side], { prompt: text.model, parameters: { side, volume } });
    if (task === "interpret") return numberQuestion(`\\text{A square's side is multiplied by }${variant + 2}.\\ \\text{Its area is multiplied by }`, (variant + 2) ** 2, [variant + 2, (variant + 2) ** 3, 2 * (variant + 2)], { prompt: text.scale, parameters: { factor: variant + 2 } });
    if (task === "translate") {
      const answerExpr = `\\sqrt[3]{${volume}}`;
      return make(`\\text{Expression for the edge of a cube with volume }${volume}`, answerExpr, [`\\sqrt{${volume}}`, `${volume}^{3}`, `${volume}\\div3`, `3\\sqrt{${volume}}`, `\\frac{${volume}}{3}`, `\\sqrt[4]{${volume}}`], { prompt: text.model, parameters: { side, volume } });
    }
    const answerLine = `\\sqrt{${area}}=${side}`;
    return make(`\\text{Choose the correct solution for a square of area }${area}.`, answerLine, [`${area}^{2}=${side}`, `\\sqrt[3]{${area}}=${side}`, `${area}\\div2=${side}`, `2\\sqrt{${area}}=${side}`, `\\sqrt{${area}}=${area}`, `\\sqrt{${side}}=${area}`], { prompt: text.diagnose, parameters: { side, area } });
  }

  function buildQuestion(conceptId, taskForm, variant, rng, lang) {
    const zh = lang === "zh";
    const text = {
      evaluate: zh ? "计算并选择精确值。" : "Evaluate and choose the exact value.",
      missingBase: zh ? "求正的底数。" : "Find the positive base.",
      compare: zh ? "比较各个幂或根式。" : "Compare the powers or radicals.",
      writePower: zh ? "把乘法写成幂。" : "Write the product as a power.",
      diagnose: zh ? "找出计算正确的一项。" : "Identify the correctly evaluated statement.",
      missingRadicand: zh ? "求被开方数。" : "Find the missing radicand.",
      writeInverse: zh ? "写出对应的逆运算关系。" : "Write the matching inverse relationship.",
      missingExponent: zh ? "求缺少的指数。" : "Find the missing exponent.",
      missingIndex: zh ? "求根指数。" : "Find the missing root index.",
      matchValue: zh ? "选择与目标值相等的式子。" : "Choose the expression equal to the target value.",
      sign: zh ? "判断结果的符号。" : "Determine the sign of the result.",
      positive: zh ? "正数" : "positive", negative: zh ? "负数" : "negative", zero: "0",
      undefined: zh ? "未定义" : "undefined", opposite: zh ? "与指数符号相反" : "opposite the exponent",
      integer: zh ? "一定是整数" : "always an integer", irrational: zh ? "一定是无理数" : "always irrational",
      model: zh ? "根据情境建立幂或根的关系。" : "Model the situation with a power or root.",
      scale: zh ? "判断幂次缩放关系。" : "Determine the power scaling relationship."
    };
    if (conceptId === "integer-powers") return integerPowerFamily(taskForm, variant, rng, text);
    if (conceptId === "perfect-roots") return perfectRootFamily(taskForm, variant, rng, text);
    if (conceptId === "inverse-missing-value") return missingValueFamily(taskForm, variant, rng, text);
    if (conceptId === "signed-fractional-bases") return signedFractionFamily(taskForm, variant, rng, text);
    return applicationFamily(taskForm, variant, rng, text);
  }

  function difficultyAt(index) {
    if (index < 25) return "easy";
    if (index < 55) return "medium";
    if (index < 80) return "hard";
    return "expert";
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
          outputKind: taskForm === "translate" || taskForm === "diagnose" ? "equivalent-expression" : "exact-value",
          reasoningPattern: `${concept.id}:${taskForm}`,
          constraintPattern: `${representation}:${variant + 1}`,
          parameterPolicy: { integerBounds: variant < 2 ? [2, 12] : [2, 18], excludes: ["undefined-even-root"] },
          build: ({ rng, lang }) => buildQuestion(concept.id, taskForm, variant, rng, lang),
          validate: question => Boolean(question.main && question.answer && unique(question.distractors || []).length >= 5)
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
      parameterPolicy: { integerBounds: [2, 12], minimumReasoningSteps: 2 },
      build: ({ rng, lang }) => buildQuestion(concept.id, "diagnose", 3, rng, lang),
      validate: question => Boolean(question.main && question.answer && unique(question.distractors || []).length >= 5)
    });
  });

  registry.registerTool({ toolId: "powers-roots", version: "2", concepts, templates });
  window.MCLQuizTool.gameId = "powers-roots";
  window.MCLQuizTool.course = "pre-algebra";
  window.MCLPowersRootsBank = { templates, audit: () => registry.auditTool("powers-roots") };
})();
