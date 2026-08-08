(function (root) {
  "use strict";

  const registry = root.MCLQuestionTemplates;
  const numbers = root.MCLNumberSystems;
  if (!registry || !numbers || !root.MCLQuizTool) return;

  const CONCEPTS = [
    { id: "real-number-hierarchy", en: "Direct real-number hierarchy", zh: "实数范围内的包含关系" },
    { id: "rational-representations", en: "Rational representations", zh: "有理数的多种表示" },
    { id: "radicals-constants-real", en: "Radicals, constants, and real values", zh: "根式、常数与实数分类" },
    { id: "imaginary-complex", en: "Imaginary and non-real complex values", zh: "纯虚数与非实复数" },
    { id: "mixed-simplified-values", en: "Mixed exact simplification", zh: "混合精确化简与分类" }
  ];
  const TASK_FORMS = ["direct", "inverse", "interpret", "translate", "diagnose"];
  const TASK_CONTRACTS = {
    direct: { taskKind: "find-member", promptStyle: "member" },
    inverse: { taskKind: "find-outsider", promptStyle: "outsider" },
    interpret: { taskKind: "most-specific", promptStyle: "most-specific" },
    translate: { taskKind: "find-member", promptStyle: "translate" },
    diagnose: { taskKind: "find-outsider", promptStyle: "counterexample" }
  };
  const REPRESENTATIONS = ["literal", "fraction-decimal", "radical-power", "operation", "mixed-surface"];
  const DISTRIBUTION = [
    ["easy", 12], ["medium", 6], ["hard", 3],
    ["easy", 8], ["medium", 8], ["hard", 5],
    ["easy", 5], ["medium", 8], ["hard", 6], ["expert", 2],
    ["medium", 4], ["hard", 8], ["expert", 9],
    ["medium", 4], ["hard", 3], ["expert", 14]
  ];

  const CONCEPT_TARGETS = {
    "real-number-hierarchy": ["natural", "whole", "integer", "rational"],
    "rational-representations": ["natural", "whole", "integer", "rational", "real"],
    "radicals-constants-real": ["natural", "whole", "integer", "rational", "irrational", "real"],
    "imaginary-complex": ["pure-imaginary", "nonreal-complex", "real"],
    "mixed-simplified-values": [...numbers.SYSTEMS]
  };

  const OUTSIDER_RECIPES = {
    direct: null,
    inverse: ["reducible-integer-fraction", "radical-square", "even-i-power", "conjugate-sum", "pi-cancellation"],
    interpret: ["repeating-decimal", "nonperfect-square-root", "odd-i-power", "standard-complex", "mixed-radical-sum"],
    translate: ["finite-decimal", "coefficient-radical", "negative-perfect-radical", "complex-cancellation-real"],
    diagnose: ["negative-base-even-power", "radical-product", "i-square-shift", "complex-square", "i-power-plus"]
  };

  function expandDistribution() {
    const result = [];
    let conceptIndex = 0;
    let countForConcept = 0;
    DISTRIBUTION.forEach(([difficulty, count]) => {
      for (let index = 0; index < count; index += 1) {
        result.push({ conceptIndex, localIndex: countForConcept, difficulty });
        countForConcept += 1;
        if (countForConcept === 21) {
          conceptIndex += 1;
          countForConcept = 0;
        }
      }
    });
    return result;
  }

  function validateRaw(question) {
    if (!question?.main || !question.answer || !Array.isArray(question.distractors)) return false;
    const answerKey = registry.answerKey(question.answer);
    const distractorKeys = question.distractors.map(registry.answerKey).filter(key => key && key !== answerKey);
    if (new Set(distractorKeys).size < 5) return false;
    const audit = question.audit;
    if (!audit || audit.optionValues.length !== 6 || audit.correctKey !== answerKey) return false;
    return audit.optionValues.filter(item => item.isCorrect).length === 1;
  }

  const profiles = expandDistribution();
  const templates = profiles.map((profile, globalIndex) => {
    const concept = CONCEPTS[profile.conceptIndex];
    const taskForm = TASK_FORMS[profile.localIndex % TASK_FORMS.length];
    const taskContract = TASK_CONTRACTS[taskForm];
    const representation = REPRESENTATIONS[Math.floor(profile.localIndex / TASK_FORMS.length) % REPRESENTATIONS.length];
    const recipeId = `${concept.id}-${taskForm}-${representation}-${String(profile.localIndex + 1).padStart(2, "0")}`;
    const targets = CONCEPT_TARGETS[concept.id];
    return {
      id: recipeId,
      familyId: `${concept.id}-${taskForm}`,
      conceptId: concept.id,
      difficulty: profile.difficulty,
      taskForm,
      inputRepresentation: `${taskContract.taskKind}:${representation}:${profile.localIndex + 1}`,
      outputKind: `${taskContract.taskKind}:${concept.id}`,
      reasoningPattern: `${taskForm}:${taskContract.taskKind}:simplify-classify-compare:${concept.id}`,
      constraintPattern: `six-source-values:${profile.difficulty}:${globalIndex + 1}`,
      parameterPolicy: {
        integerBounds: [-200, 200],
        rationalDenominatorMax: 24,
        radicandMax: 400,
        exponentMax: profile.difficulty === "expert" ? 40 : 12,
        excludes: ["zero-natural-boundary", "ambiguous-ellipsis", "undefined-expression", "duplicate-values", "multiple-outsiders"]
      },
      build(context) {
        return numbers.buildQuestion({
          familyId: `${concept.id}-${taskForm}`,
          recipeId,
          difficulty: profile.difficulty,
          targets,
          taskKind: taskContract.taskKind,
          promptStyle: taskContract.promptStyle,
          preferredAnswerRecipes: OUTSIDER_RECIPES[taskForm]
        }, context);
      },
      validate: validateRaw
    };
  });

  registry.registerTool({
    toolId: "number-systems-classification",
    version: "2",
    concepts: CONCEPTS,
    templates
  });
})(typeof window !== "undefined" ? window : globalThis);
