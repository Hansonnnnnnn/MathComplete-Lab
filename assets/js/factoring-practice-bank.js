(function (root) {
  "use strict";

  const registry = root.MCLQuestionTemplates;
  const math = root.MCLFactoringMath;
  if (!registry || !math || !root.MCLQuizTool) return;

  const CUBE_REFERENCE = "\\begin{gathered}a^3+b^3=(a+b)(a^2-ab+b^2)\\\\a^3-b^3=(a-b)(a^2+ab+b^2)\\end{gathered}";
  const concepts = [
    { id: "gcf-trinomials" },
    { id: "special-products" },
    { id: "grouping" },
    { id: "higher-substitution" },
    { id: "complete-prime-diagnosis" }
  ];

  const AREA_PLAN = [
    { id: "gcf-negative-gcf", conceptId: "gcf-trinomials", counts: { easy: 10, medium: 5 } },
    { id: "monic-nonmonic-trinomials", conceptId: "gcf-trinomials", counts: { easy: 10, medium: 10, hard: 5 } },
    { id: "special-structures", conceptId: "special-products", counts: { easy: 5, medium: 8, hard: 7 } },
    { id: "grouping", conceptId: "grouping", counts: { medium: 4, hard: 8, expert: 3 } },
    { id: "higher-powers-substitution", conceptId: "higher-substitution", counts: { hard: 3, expert: 7 } },
    { id: "multi-step-complete", conceptId: "complete-prime-diagnosis", counts: { medium: 2, hard: 2, expert: 6 } },
    { id: "prime-error-structures", conceptId: "complete-prime-diagnosis", counts: { medium: 1, expert: 9 }, prime: true }
  ];

  const INTERACTION_QUOTAS = {
    easy: { choice: 15, fill: 7, diagnosis: 3 },
    medium: { choice: 16, fill: 10, diagnosis: 4 },
    hard: { choice: 14, fill: 7, diagnosis: 4 },
    expert: { choice: 13, fill: 8, diagnosis: 4 }
  };

  function languageText(lang) {
    return lang === "zh" ? {
      factorPrompt: "\u5c06\u591a\u9879\u5f0f\u5b8c\u5168\u56e0\u5f0f\u5206\u89e3\u3002",
      fillPrompt: "\u5728\u6bcf\u4e2a\u7a7a\u683c\u4e2d\u8f93\u5165\u5e26\u7b26\u53f7\u7684\u975e\u96f6\u6574\u6570\u7cfb\u6570\u3002",
      diagnosePrompt: "\u627e\u51fa\u8fd9\u4efd\u56e0\u5f0f\u5206\u89e3\u8fc7\u7a0b\u4e2d\u7684\u7b2c\u4e00\u4e2a\u9519\u8bef\u3002",
      prime: "\u5728\u6574\u6570\u8303\u56f4\u5185\u4e0d\u53ef\u7ea6",
      firstError: "\u7b2c\u4e00\u4e2a\u56e0\u5f0f\u4e2d\u7684\u7cfb\u6570\u4e0d\u80fd\u91cd\u65b0\u5c55\u5f00\u5f97\u5230\u539f\u591a\u9879\u5f0f\u3002",
      errors: [
        "\u7b2c\u4e00\u884c\u5df2\u7ecf\u6b63\u786e\uff0c\u6ca1\u6709\u9519\u8bef\u3002",
        "\u552f\u4e00\u7684\u95ee\u9898\u662f\u56e0\u5f0f\u7684\u987a\u5e8f\u3002",
        "\u5fc5\u987b\u628a\u6240\u6709\u56e0\u5f0f\u7684\u8d1f\u53f7\u5168\u90e8\u53bb\u6389\u3002",
        "\u539f\u591a\u9879\u5f0f\u7684\u6b21\u6570\u592a\u9ad8\uff0c\u4e0d\u80fd\u56e0\u5f0f\u5206\u89e3\u3002",
        "\u4e00\u65e6\u63d0\u53d6\u51fa\u4e00\u4e2a\u516c\u56e0\u5f0f\uff0c\u5c31\u5fc5\u987b\u7acb\u5373\u505c\u6b62\u3002"
      ],
      expand: "\u5c06\u56e0\u5f0f\u7cbe\u786e\u5c55\u5f00\uff0c\u68c0\u67e5\u662f\u5426\u56de\u5230\u539f\u591a\u9879\u5f0f",
      complete: "\u68c0\u67e5\u6bcf\u4e2a\u975e\u5355\u9879\u5f0f\u56e0\u5f0f\u662f\u5426\u672c\u539f\uff0c\u4e14\u4e0d\u80fd\u5728\u6574\u6570\u8303\u56f4\u7ee7\u7eed\u5206\u89e3",
      primeReason: "\u5224\u522b\u5f0f\u4e0d\u662f\u5b8c\u5168\u5e73\u65b9\u6570\uff0c\u6216\u8be5\u7ed3\u6784\u7531\u5df2\u9a8c\u8bc1\u7684\u6574\u6570\u4e0d\u53ef\u7ea6\u6784\u9020\u7ed9\u51fa",
      cubeNote: "\u4f7f\u7528\u9875\u9762\u4e0a\u7ed9\u51fa\u7684\u7acb\u65b9\u548c\u6216\u7acb\u65b9\u5dee\u516c\u5f0f",
      studentStops: "\u5b66\u751f\u58f0\u79f0\u5df2\u5b8c\u5168\u5206\u89e3"
    } : {
      factorPrompt: "Factor the polynomial completely.",
      fillPrompt: "Enter a signed nonzero integer in every coefficient box.",
      diagnosePrompt: "Identify the first incorrect step in the factoring attempt.",
      prime: "Prime over the integers",
      firstError: "A coefficient in the first proposed factorization does not expand back to the original polynomial.",
      errors: [
        "The first line is correct; there is no error.",
        "The only issue is the order of the factors.",
        "Every negative sign must be removed from the factors.",
        "The polynomial has too high a degree to be factored.",
        "Factoring must stop immediately after any common factor is removed."
      ],
      expand: "expand the factors exactly to check the original polynomial",
      complete: "verify that every non-monomial factor is primitive and irreducible over the integers",
      primeReason: "the discriminant is not a perfect square, or the expression uses a verified irreducible integer construction",
      cubeNote: "use the displayed sum- and difference-of-cubes identities",
      studentStops: "the student claims the expression is completely factored"
    };
  }

  const term = (coefficient, powers = {}) => ({ coefficient, powers });
  const factor = (terms, exponent = 1, primitive = true) => ({ terms, exponent, primitive });
  const outside = (coefficient, powers = {}) => ({ terms: [term(coefficient, powers)] });
  const nonzero = (rng, minimum, maximum) => {
    let value = 0;
    while (!value) value = rng.int(minimum, maximum);
    return value;
  };
  const signedChoice = (rng, values) => rng.choice(values) * (rng.bool() ? 1 : -1);
  const targetObject = target => Object.fromEntries(math.normalizePolynomial(target).entries());
  const maxCoefficient = target => Math.max(0, ...[...math.normalizePolynomial(target).values()].map(Math.abs));

  function primitivePair(rng, max = 7, forceMonic = false) {
    if (forceMonic) return [1, nonzero(rng, -max, max)];
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const a = rng.int(1, max), b = nonzero(rng, -max, max);
      if (math.gcd(a, b) === 1) return [a, b];
    }
    return [1, nonzero(rng, -max, max)];
  }

  const GCF_PATTERNS = [
    [{ x: 1 }, {}], [{ x: 2 }, { x: 1 }, {}], [{ x: 2 }, {}],
    [{ x: 3 }, { x: 1 }, {}], [{ x: 2 }, { y: 1 }], [{ x: 1, y: 1 }, { x: 1 }, { y: 1 }],
    [{ x: 2, y: 1 }, { x: 1, y: 1 }, {}], [{ a: 2 }, { a: 1 }, {}], [{ x: 1 }, { y: 1 }, {}],
    [{ x: 2 }, { y: 2 }], [{ x: 2, y: 1 }, { x: 1 }, { y: 2 }], [{ x: 3 }, { x: 2 }, {}],
    [{ x: 2, y: 1 }, { x: 1, y: 1 }, {}], [{ a: 2, b: 1 }, { a: 1 }, { b: 1 }], [{ x: 4 }, { x: 1 }, {}]
  ];

  function gcfDefinition(recipe, rng) {
    const pattern = GCF_PATTERNS[recipe.areaIndex % GCF_PATTERNS.length];
    const negative = [4, 9, 14].includes(recipe.areaIndex);
    const coefficient = (negative ? -1 : 1) * rng.int(2, recipe.difficulty === "easy" ? 6 : 9);
    const outsidePowers = recipe.areaIndex % 5 === 0 ? {} : recipe.areaIndex % 5 === 1 ? { x: 1 } : recipe.areaIndex % 5 === 2 ? { x: 2 } : recipe.areaIndex % 5 === 3 ? { x: 1, y: 1 } : { y: 1 };
    const coefficients = pattern.map((_, index) => index === 0 ? 1 : nonzero(rng, -7, 7));
    if (coefficients.length > 2) coefficients[coefficients.length - 1] = signedChoice(rng, [1, 2, 3, 5]);
    return {
      schema: math.makeSchema(outside(coefficient, outsidePowers), [factor(pattern.map((powers, index) => term(coefficients[index], powers)))]),
      reasoning: "gcf",
      minimumTerms: pattern.length
    };
  }

  function trinomialDefinition(recipe, rng) {
    const variant = recipe.areaIndex;
    const twoVariable = variant >= 15;
    const variable = variant % 3 === 0 ? "x" : variant % 3 === 1 ? "t" : "a";
    const max = recipe.difficulty === "hard" ? 8 : 7;
    const first = primitivePair(rng, max, variant < 10);
    const second = primitivePair(rng, max, variant < 10);
    if (variant % 4 === 0) second[1] = -Math.abs(second[1]);
    if (variant % 4 === 1) { first[1] = -Math.abs(first[1]); second[1] = -Math.abs(second[1]); }
    if (variant % 4 === 2) { first[1] = Math.abs(first[1]); second[1] = Math.abs(second[1]); }
    const firstTerms = twoVariable
      ? [term(first[0], { x: 1 }), term(first[1], { y: 1 })]
      : [term(first[0], { [variable]: 1 }), term(first[1], {})];
    const secondTerms = twoVariable
      ? [term(second[0], { x: 1 }), term(second[1], { y: 1 })]
      : [term(second[0], { [variable]: 1 }), term(second[1], {})];
    return { schema: math.makeSchema(null, [factor(firstTerms), factor(secondTerms)]), reasoning: variant < 10 ? "sum-product" : "ac-product", minimumTerms: 3 };
  }

  function specialDefinition(recipe, rng) {
    const variant = recipe.areaIndex;
    if (variant < 8) {
      if (variant === 5) return { schema: math.makeSchema(null, [
        factor([term(1, { x: 1 }), term(-1, { y: 1 })]),
        factor([term(1, { x: 1 }), term(1, { y: 1 })]),
        factor([term(1, { x: 2 }), term(1, { y: 2 })])
      ]), reasoning: "repeated-difference-squares", minimumTerms: 2 };
      if (variant === 6) return { schema: math.makeSchema(null, [
        factor([term(1, { x: 1 }), term(-1, { y: 1 })]),
        factor([term(1, { x: 1 }), term(1, { y: 1 })]),
        factor([term(1, { x: 2 }), term(1, { x: 1, y: 1 }), term(1, { y: 2 })]),
        factor([term(1, { x: 2 }), term(-1, { x: 1, y: 1 }), term(1, { y: 2 })])
      ]), reasoning: "difference-sixth-powers", minimumTerms: 2 };
      const variableA = variant % 3 === 0 ? { x: 1 } : variant % 3 === 1 ? { x: 1 } : { a: 1 };
      const variableB = variant % 3 === 0 ? {} : variant % 3 === 1 ? { y: 1 } : { b: 1 };
      const [a, b] = primitivePair(rng, 5, variant < 3);
      return { schema: math.makeSchema(null, [
        factor([term(a, variableA), term(-Math.abs(b), variableB)]),
        factor([term(a, variableA), term(Math.abs(b), variableB)])
      ]), reasoning: "difference-squares", minimumTerms: 2 };
    }
    if (variant < 14) {
      const twoVariable = variant >= 11;
      const [a, b] = primitivePair(rng, 6, variant < 11);
      const sign = variant % 2 ? -1 : 1;
      return { schema: math.makeSchema(null, [factor([
        term(a, twoVariable ? { x: 1 } : { x: 1 }),
        term(sign * Math.abs(b), twoVariable ? { y: 1 } : {})
      ], 2)]), reasoning: "perfect-square-trinomial", minimumTerms: 3 };
    }
    const sum = variant % 2 === 0;
    const twoVariable = variant >= 17;
    const [a, b] = primitivePair(rng, 4, variant < 17);
    const uPowers = twoVariable ? { x: 1 } : { x: 1 };
    const vPowers = twoVariable ? { y: 1 } : {};
    return {
      schema: math.makeSchema(null, [
        factor([term(a, uPowers), term(sum ? Math.abs(b) : -Math.abs(b), vPowers)]),
        factor([
          term(a * a, math.powersFromKey(math.powerKey(Object.fromEntries(Object.entries(uPowers).map(([key, value]) => [key, value * 2]))))),
          term(sum ? -a * Math.abs(b) : a * Math.abs(b), math.multiplyPowers ? math.multiplyPowers(uPowers, vPowers) : { ...(twoVariable ? { x: 1, y: 1 } : { x: 1 }) }),
          term(b * b, Object.fromEntries(Object.entries(vPowers).map(([key, value]) => [key, value * 2])))
        ])
      ]),
      reasoning: sum ? "sum-cubes" : "difference-cubes",
      minimumTerms: 2,
      cube: true
    };
  }

  function groupingDefinition(recipe, rng) {
    const variant = recipe.areaIndex;
    if (variant >= 10) {
      const sign = variant % 2 ? -1 : 1;
      return {
        schema: math.makeSchema(null, [
          factor([term(1, { x: 1 }), term(sign * nonzero(rng, 1, 5), {})]),
          factor([term(1, { x: 1 }), term(nonzero(rng, 1, 5), {})]),
          factor([term(1, { x: 1 }), term(-nonzero(rng, 1, 5), {})])
        ]),
        reasoning: "extended-grouping",
        minimumTerms: 4
      };
    }
    const variableLeft = variant % 3 === 0 ? { x: 2 } : variant % 3 === 1 ? { x: 1, y: 1 } : { a: 2 };
    const variableRight = variant % 3 === 0 ? {} : variant % 3 === 1 ? {} : { b: 1 };
    const first = primitivePair(rng, 6, variant < 4);
    const second = primitivePair(rng, 6, false);
    return {
      schema: math.makeSchema(null, [
        factor([term(first[0], variableLeft), term(first[1], variableRight)]),
        factor([term(second[0], { x: 1 }), term(second[1], {})])
      ]),
      reasoning: variant % 2 ? "group-reordered" : "group-common-binomial",
      minimumTerms: 4
    };
  }

  function higherDefinition(recipe, rng) {
    const variant = recipe.areaIndex;
    const degree = variant % 3 === 0 ? 2 : variant % 3 === 1 ? 3 : 4;
    const first = primitivePair(rng, 5, variant < 5);
    const second = primitivePair(rng, 5, variant < 5);
    if (variant % 2) second[1] = -Math.abs(second[1]);
    const twoVariable = variant >= 7;
    const powerA = twoVariable ? { x: degree } : { x: degree };
    const powerB = twoVariable ? { y: degree } : {};
    return {
      schema: math.makeSchema(null, [
        factor([term(first[0], powerA), term(first[1], powerB)]),
        factor([term(second[0], powerA), term(second[1], powerB)])
      ]),
      reasoning: degree === 2 ? "quadratic-form-substitution" : "higher-power-substitution",
      minimumTerms: 3
    };
  }

  function multiDefinition(recipe, rng) {
    const variant = recipe.areaIndex;
    const g = (variant % 3 === 2 ? -1 : 1) * rng.int(2, 6);
    const outsidePowers = variant % 3 === 0 ? { x: 1 } : variant % 3 === 1 ? { x: 1, y: 1 } : {};
    if (variant % 4 === 0) {
      const b = rng.int(2, 6);
      return { schema: math.makeSchema(outside(g, outsidePowers), [
        factor([term(1, { x: 1 }), term(-b, {})]),
        factor([term(1, { x: 1 }), term(b, {})])
      ]), reasoning: "gcf-then-difference-squares", minimumTerms: 2 };
    }
    if (variant % 4 === 1) {
      const b = rng.int(1, 5);
      return { schema: math.makeSchema(outside(g, outsidePowers), [factor([term(1, { x: 1 }), term(b, {})], 2)]), reasoning: "gcf-then-perfect-square", minimumTerms: 3 };
    }
    if (variant % 4 === 2) {
      const b = rng.int(1, 4);
      return { schema: math.makeSchema(outside(g, outsidePowers), [
        factor([term(1, { x: 1 }), term(-b, {})]),
        factor([term(1, { x: 2 }), term(b, { x: 1 }), term(b * b, {})])
      ]), reasoning: "gcf-then-difference-cubes", minimumTerms: 2, cube: true };
    }
    const first = primitivePair(rng, 5, true), second = primitivePair(rng, 5, true);
    return { schema: math.makeSchema(outside(g, outsidePowers), [
      factor([term(first[0], { x: 1 }), term(first[1], {})]),
      factor([term(second[0], { x: 1 }), term(second[1], {})])
    ]), reasoning: "gcf-then-trinomial", minimumTerms: 3 };
  }

  const PRIME_BUILDERS = [
    () => ({ target: math.polynomial([term(1, { x: 2 }), term(4, {})]), proof: "negative-discriminant" }),
    () => ({ target: math.polynomial([term(1, { x: 2 }), term(1, { x: 1 }), term(1, {})]), proof: "negative-discriminant" }),
    () => ({ target: math.polynomial([term(2, { x: 2 }), term(2, { x: 1 }), term(3, {})]), proof: "negative-discriminant" }),
    () => ({ target: math.polynomial([term(3, { x: 2 }), term(2, { x: 1 }), term(5, {})]), proof: "negative-discriminant" }),
    () => ({ target: math.polynomial([term(1, { x: 2 }), term(1, { x: 1, y: 1 }), term(1, { y: 2 })]), proof: "binary-negative-discriminant" }),
    () => ({ target: math.polynomial([term(2, { x: 2 }), term(3, { x: 1, y: 1 }), term(2, { y: 2 })]), proof: "binary-negative-discriminant" }),
    () => ({ target: math.polynomial([term(1, { x: 4 }), term(1, {})]), proof: "cyclotomic-fourth" }),
    () => ({ target: math.polynomial([term(1, { x: 4 }), term(1, { x: 3 }), term(1, { x: 2 }), term(1, { x: 1 }), term(1, {})]), proof: "cyclotomic-fifth" }),
    () => ({ target: math.polynomial([term(1, { x: 6 }), term(1, { x: 3 }), term(1, {})]), proof: "cyclotomic-ninth" }),
    () => ({ target: math.polynomial([term(1, { x: 5 }), term(2, { x: 1 }), term(2, {})]), proof: "eisenstein-two" })
  ];

  function primeDefinition(recipe) {
    return PRIME_BUILDERS[recipe.areaIndex % PRIME_BUILDERS.length]();
  }

  function buildDefinition(recipe, rng) {
    if (recipe.prime) return primeDefinition(recipe);
    if (recipe.area === "gcf-negative-gcf") return gcfDefinition(recipe, rng);
    if (recipe.area === "monic-nonmonic-trinomials") return trinomialDefinition(recipe, rng);
    if (recipe.area === "special-structures") return specialDefinition(recipe, rng);
    if (recipe.area === "grouping") return groupingDefinition(recipe, rng);
    if (recipe.area === "higher-powers-substitution") return higherDefinition(recipe, rng);
    return multiDefinition(recipe, rng);
  }

  function mutateValues(schema, canonical, slotId, mode) {
    const values = { ...canonical };
    const current = Number(values[slotId]);
    if (mode === "flip") values[slotId] = -current;
    else if (mode === "up") values[slotId] = current === -1 ? 1 : current + 1;
    else values[slotId] = current === 1 ? -1 : current - 1;
    if (!values[slotId]) values[slotId] = current > 0 ? 2 : -2;
    return values;
  }

  function choiceCandidates(schema, target) {
    const canonical = math.canonicalValues(schema);
    const slots = math.slotDefinitions(schema);
    const candidates = [];
    const add = (latex, expanded, complete, error) => {
      const expandedKey = math.polynomialKey(expanded);
      const key = `${complete ? "candidate" : "incomplete"}:${expandedKey}:${String(latex).replace(/\s+/g, "")}`;
      if (!candidates.some(item => item.key === key || item.latex === latex)) candidates.push({ latex, key, expandedKey, complete, error });
    };
    slots.forEach((slot, index) => {
      ["flip", "up", "down"].forEach(mode => {
        const values = mutateValues(schema, canonical, slot.id, mode);
        add(math.factorStructureLatex(schema, values), math.expandFactorStructure(schema, values), true, mode === "flip" ? "sign" : "coefficient");
      });
      if (index > 4) return;
    });
    add(math.polynomialLatex(target), target, false, "not-factored");
    if (schema.outside) {
      const withoutOutside = { ...schema, outside: null };
      add(math.factorStructureLatex(withoutOutside, canonical), math.expandFactorStructure(withoutOutside, canonical), true, "omitted-gcf");
    }
    return candidates.filter(candidate => !(candidate.complete && candidate.expandedKey === math.polynomialKey(target))).slice(0, 12);
  }

  function primeCandidates(recipe) {
    const variable = recipe.areaIndex >= 4 && recipe.areaIndex <= 5 ? "x" : "x";
    const values = [1, 2, 3, 4, 5, 6];
    return values.map((value, index) => ({
      latex: `(${variable}${index % 2 ? "+" : "-"}${value})(${variable}${index % 3 ? "+" : "-"}${value + 1})`,
      key: `invalid-prime-factorization-${recipe.areaIndex}-${index}`
    }));
  }

  function serializeSchema(schema) {
    return JSON.parse(JSON.stringify(schema));
  }

  function solutionLines(main, answer, definition, t) {
    const note = definition.cube ? t.cubeNote : definition.reasoning === "gcf" ? "extract the full numerical and variable GCF" : definition.reasoning?.replaceAll("-", " ") || t.expand;
    return [
      { line: main, note },
      { line: answer, note: t.complete },
      { line: main, note: t.expand }
    ];
  }

  function makePrimeQuestion(recipe, definition, lang) {
    const t = languageText(lang);
    const main = math.polynomialLatex(definition.target);
    const answer = { latex: `\\text{${t.prime}}`, key: `prime:${recipe.structureId}` };
    const distractors = primeCandidates(recipe);
    return {
      main,
      plain: main,
      prompt: t.factorPrompt,
      answer,
      distractors,
      lines: [{ line: main, note: t.primeReason }, { line: answer.latex, note: t.complete }],
      suggestion: t.primeReason,
      parameters: {
        structureId: recipe.structureId,
        contentArea: recipe.area,
        interactionKind: "complete-choice",
        isPrime: true,
        primeProof: definition.proof,
        targetPolynomial: targetObject(definition.target),
        targetPolynomialKey: math.polynomialKey(definition.target),
        choiceCandidates: distractors.map(item => ({ latex: item.latex, equivalent: false, complete: false }))
      }
    };
  }

  function makeFactorQuestion(recipe, definition, lang) {
    const t = languageText(lang);
    const schema = definition.schema;
    const target = math.expandFactorStructure(schema, math.canonicalValues(schema));
    const main = math.polynomialLatex(target);
    const answerLatex = math.factorStructureLatex(schema);
    const sharedParameters = {
      structureId: recipe.structureId,
      contentArea: recipe.area,
      interactionKind: recipe.interaction === "fill" ? "coefficient-fill" : recipe.interaction === "diagnosis" ? "first-error-diagnosis" : "complete-choice",
      isPrime: false,
      reasoning: definition.reasoning,
      targetPolynomial: targetObject(target),
      targetPolynomialKey: math.polynomialKey(target),
      factorSchema: serializeSchema(schema),
      canonicalAnswerCoefficients: math.canonicalValues(schema),
      canonicalAnswerLatex: answerLatex,
      formulaReference: definition.cube ? CUBE_REFERENCE : ""
    };
    const lines = solutionLines(main, answerLatex, definition, t);

    if (recipe.interaction === "fill") {
      return {
        main,
        plain: main,
        prompt: t.fillPrompt,
        answer: { latex: answerLatex, key: `complete:${math.polynomialKey(target)}` },
        distractors: [],
        interaction: { kind: "coefficient-fill", schema: serializeSchema(schema), correctKey: math.polynomialKey(target) },
        extraLatex: definition.cube ? CUBE_REFERENCE : "",
        lines,
        suggestion: t.expand,
        parameters: sharedParameters
      };
    }

    if (recipe.interaction === "diagnosis") {
      const canonical = math.canonicalValues(schema);
      const firstSlot = math.slotDefinitions(schema)[recipe.areaIndex % math.slotDefinitions(schema).length];
      const attempted = mutateValues(schema, canonical, firstSlot.id, recipe.areaIndex % 2 ? "flip" : "up");
      const attemptedLatex = math.factorStructureLatex(schema, attempted);
      const attemptDisplay = `\\begin{gathered}${main}\\\\=${attemptedLatex}\\\\\\text{${t.studentStops}}\\end{gathered}`;
      const answer = { latex: `\\text{${t.firstError}}`, key: `first-error:${recipe.structureId}` };
      const distractors = t.errors.map((value, index) => ({ latex: `\\text{${value}}`, key: `later-or-false-error:${recipe.structureId}:${index}` }));
      return {
        main: attemptDisplay,
        plain: `${main} = ${attemptedLatex}`,
        prompt: t.diagnosePrompt,
        answer,
        distractors,
        extraLatex: definition.cube ? CUBE_REFERENCE : "",
        lines,
        suggestion: t.expand,
        parameters: {
          ...sharedParameters,
          attemptLines: [main, attemptedLatex, t.studentStops],
          firstErrorSlot: firstSlot.id,
          attemptedCoefficients: attempted
        }
      };
    }

    const candidates = choiceCandidates(schema, target);
    return {
      main,
      plain: main,
      prompt: t.factorPrompt,
      answer: { latex: answerLatex, key: `complete:${math.polynomialKey(target)}` },
      distractors: candidates.map(candidate => ({ latex: candidate.latex, key: candidate.key })),
      extraLatex: definition.cube ? CUBE_REFERENCE : "",
      lines,
      suggestion: t.expand,
      parameters: {
        ...sharedParameters,
        choiceCandidates: candidates.map(candidate => ({
          latex: candidate.latex,
          expandedKey: candidate.expandedKey,
          complete: candidate.complete,
          equivalent: candidate.expandedKey === math.polynomialKey(target),
          error: candidate.error
        }))
      }
    };
  }

  function parameterLimit(difficulty) {
    return difficulty === "easy" ? 12 : difficulty === "medium" ? 80 : difficulty === "hard" ? 120 : 240;
  }

  function buildQuestion(recipe, context) {
    let definition;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      definition = buildDefinition(recipe, context.rng);
      if (recipe.prime) break;
      const target = math.expandFactorStructure(definition.schema, math.canonicalValues(definition.schema));
      if (target.size >= (definition.minimumTerms || 2) && maxCoefficient(target) <= parameterLimit(recipe.difficulty)) break;
    }
    const question = recipe.prime ? makePrimeQuestion(recipe, definition, context.lang) : makeFactorQuestion(recipe, definition, context.lang);
    question.audit = {
      contentArea: recipe.area,
      interaction: recipe.interaction,
      structureId: recipe.structureId,
      prime: Boolean(recipe.prime),
      formulaReference: question.parameters?.formulaReference || ""
    };
    return question;
  }

  function validateQuestion(question) {
    if (!question?.main || !question?.answer || !question?.parameters?.targetPolynomialKey) return { valid: false, reason: "missing core factoring data" };
    if (question.parameters.interactionKind === "coefficient-fill") {
      if (!question.interaction?.schema || (question.distractors || []).length) return { valid: false, reason: "coefficient fill must have a schema and no choices" };
      const canonical = math.validateCoefficientResponse(question, { values: question.parameters.canonicalAnswerCoefficients });
      return canonical.correct ? true : { valid: false, reason: canonical.reason };
    }
    const answerKey = registry.answerKey(question.answer);
    const unique = new Set((question.distractors || []).map(registry.answerKey).filter(key => key && key !== answerKey));
    return unique.size >= 5 ? true : { valid: false, reason: `only ${unique.size} unique distractors` };
  }

  function createRecipes() {
    const recipes = [];
    AREA_PLAN.forEach(area => {
      let areaIndex = 0;
      Object.entries(area.counts).forEach(([difficulty, count]) => {
        for (let index = 0; index < count; index += 1) {
          recipes.push({
            area: area.id,
            areaIndex,
            conceptId: area.conceptId,
            difficulty,
            prime: Boolean(area.prime),
            structureId: `${area.id}-${String(areaIndex + 1).padStart(2, "0")}`,
            interaction: "choice"
          });
          areaIndex += 1;
        }
      });
    });

    const conceptOrder = concepts.map(concept => concept.id);
    const assigned = new Set();
    const chooseSpread = (difficulty, kind, count) => {
      const pool = recipes.filter(recipe => recipe.difficulty === difficulty && !recipe.prime && !assigned.has(recipe.structureId));
      const chosen = [];
      conceptOrder.forEach(conceptId => {
        if (chosen.length >= count) return;
        const candidate = pool.find(recipe => recipe.conceptId === conceptId && !chosen.includes(recipe));
        if (candidate) chosen.push(candidate);
      });
      let cursor = 0;
      while (chosen.length < count && cursor < pool.length * 3) {
        const candidate = pool[(cursor * 3 + Math.floor(cursor / 2)) % pool.length];
        if (candidate && !chosen.includes(candidate)) chosen.push(candidate);
        cursor += 1;
      }
      chosen.slice(0, count).forEach(recipe => {
        recipe.interaction = kind;
        assigned.add(recipe.structureId);
      });
    };

    Object.entries(INTERACTION_QUOTAS).forEach(([difficulty, quotas]) => chooseSpread(difficulty, "diagnosis", quotas.diagnosis));
    Object.entries(INTERACTION_QUOTAS).forEach(([difficulty, quotas]) => chooseSpread(difficulty, "fill", quotas.fill));

    const formCounters = new Map();
    recipes.forEach(recipe => {
      const key = `${recipe.conceptId}:${recipe.interaction}`;
      const count = formCounters.get(key) || 0;
      formCounters.set(key, count + 1);
      recipe.taskForm = recipe.interaction === "diagnosis" ? "diagnose"
        : recipe.interaction === "fill" ? (count % 2 ? "translate" : "inverse")
          : ["direct", "interpret", "translate"][count % 3];
      recipe.familyId = `${recipe.conceptId}-${recipe.taskForm}`;
    });
    return recipes;
  }

  const recipes = createRecipes();
  const templates = recipes.map(recipe => ({
    id: recipe.structureId,
    familyId: recipe.familyId,
    conceptId: recipe.conceptId,
    difficulty: recipe.difficulty,
    taskForm: recipe.taskForm,
    inputRepresentation: `${recipe.area}:${recipe.structureId}`,
    outputKind: recipe.interaction === "fill" ? "coefficient-tuple" : recipe.interaction === "diagnosis" ? "first-error" : "complete-factorization",
    reasoningPattern: `${recipe.area}:${recipe.interaction}:${recipe.areaIndex + 1}`,
    constraintPattern: `topology:${recipe.structureId}`,
    parameterPolicy: {
      coefficients: "controlled-nonzero-integers",
      factorDomain: "integers",
      variables: recipe.difficulty === "hard" || recipe.difficulty === "expert" ? ["x", "y"] : ["x"],
      prohibits: ["story-context", "method-identification", "decimal-coefficients", "zero-slots"]
    },
    build: context => buildQuestion(recipe, context),
    validate: validateQuestion
  }));

  registry.registerTool({ toolId: "factoring-practice", version: "3", concepts, templates });
  root.MCLFactoringBank = Object.freeze({
    recipes: Object.freeze(recipes.map(recipe => Object.freeze({ ...recipe }))),
    templates: Object.freeze(templates),
    cubeReference: CUBE_REFERENCE,
    audit: () => registry.auditTool("factoring-practice"),
    auditGeneration: samples => registry.auditGeneration("factoring-practice", { samplesPerTemplate: samples || 20 }),
    counts() {
      const countBy = key => recipes.reduce((result, recipe) => ({ ...result, [recipe[key]]: (result[recipe[key]] || 0) + 1 }), {});
      return { difficulty: countBy("difficulty"), interaction: countBy("interaction"), content: countBy("area") };
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
