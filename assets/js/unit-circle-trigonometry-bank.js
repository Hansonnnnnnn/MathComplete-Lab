(function (root) {
  "use strict";

  const registry = root.MCLQuestionTemplates;
  const source = root.MCLUnitCircleMath;
  if (!registry || !source || registry.getTool("unit-circle-trigonometry")) return;

  const concepts = [
    "angle-measure-reference",
    "unit-circle-coordinates",
    "exact-trig-values",
    "inverse-angle-sets",
    "expressions-conditions"
  ];

  function classifyConcept(builder) {
    const type = builder.__type || "";
    const id = builder.__variant || "";

    if (type === "trig-exact-expression" || (type === "trig-coordinate-from-clue" && id.startsWith("expert"))) {
      return "expressions-conditions";
    }
    if (type === "trig-unit-circle-coordinate" || type === "trig-angle-from-coordinate" ||
        type === "trig-coordinate-from-clue" || type === "trig-tangent-from-components") {
      return "unit-circle-coordinates";
    }
    if (type.startsWith("trig-exact-") || type === "trig-coordinate-sine" ||
        type === "trig-coordinate-cosine" || (type === "trig-angle-set" && id.includes("sin"))) {
      return "exact-trig-values";
    }
    if (type === "trig-angle-from-value" && id.includes("visual") && !id.includes("condition")) {
      return "angle-measure-reference";
    }
    if (type === "trig-angle-set" || type === "trig-angle-from-value") {
      return "inverse-angle-sets";
    }
    return "angle-measure-reference";
  }

  function classifyTaskForm(builder, conceptId) {
    const type = builder.__type || "";
    const id = builder.__variant || "";
    const visual = id.includes("visual");

    if (conceptId === "angle-measure-reference") {
      if (type === "trig-quadrant") return visual ? "diagnose" : "interpret";
      if (type === "trig-reference-angle" || type === "trig-reference-angle-degrees") return visual ? "diagnose" : "direct";
      if (type === "trig-angle-from-value") return "inverse";
      return id.includes("to-degrees") ? "direct" : "translate";
    }
    if (conceptId === "unit-circle-coordinates") {
      if (type === "trig-angle-from-coordinate") return visual ? "diagnose" : "inverse";
      if (type === "trig-coordinate-from-clue") return visual ? "diagnose" : "translate";
      if (type === "trig-tangent-from-components") return visual ? "diagnose" : "interpret";
      if (type === "trig-unit-circle-coordinate") return visual ? "diagnose" : "direct";
      return "translate";
    }
    if (conceptId === "exact-trig-values") {
      if (type === "trig-angle-set") return "inverse";
      if (type === "trig-coordinate-sine" || type === "trig-coordinate-cosine") return visual ? "diagnose" : "translate";
      if (type === "trig-tangent-from-components") return visual ? "diagnose" : "interpret";
      if (visual) return "diagnose";
      if (id.includes("tan")) return "interpret";
      return "direct";
    }
    if (conceptId === "inverse-angle-sets") {
      if (type === "trig-angle-set") return id.includes("tan") ? "interpret" : "direct";
      if (id.includes("condition")) {
        if (visual) return "diagnose";
        return id.includes("opposite") || id.includes("all") ? "translate" : "inverse";
      }
      return "inverse";
    }
    if (type === "trig-coordinate-from-clue") return visual ? "diagnose" : "inverse";
    if (id.includes("condition")) return visual ? "diagnose" : "interpret";
    if (id.includes("cross")) return "translate";
    if (id.includes("three")) return "interpret";
    return visual ? "diagnose" : "direct";
  }

  function makeHelper(context) {
    return {
      choice: items => context.rng.choice(items),
      shuffle: items => context.rng.shuffle(items)
    };
  }

  const templates = [];
  Object.entries(source.builders).forEach(([difficulty, builders]) => {
    builders.forEach(builder => {
      const conceptId = classifyConcept(builder);
      const taskForm = classifyTaskForm(builder, conceptId);
      const sourceId = builder.__variant;
      templates.push({
        id: `unit-circle-${sourceId}`,
        familyId: `${conceptId}--${taskForm}`,
        conceptId,
        difficulty,
        taskForm,
        inputRepresentation: `${builder.__type}:${sourceId}`,
        outputKind: builder.__type,
        reasoningPattern: `unit-circle:${sourceId}`,
        constraintPattern: `${difficulty}:standard-angle:exact:${sourceId}`,
        parameterPolicy: {
          angleSet: "axis and 30-45-60 degree families",
          arithmetic: "exact rational-radical values only",
          visual: sourceId.includes("visual")
        },
        build(context) {
          const question = builder(makeHelper(context));
          return {
            ...question,
            parameters: {
              ...(question.parameters || {}),
              sourceTemplateId: sourceId,
              sourceType: builder.__type
            }
          };
        },
        validate(question) {
          const answerKey = registry.answerKey(question.answer);
          const distractors = new Set(
            (question.distractors || [])
              .map(registry.answerKey)
              .filter(key => key && key !== answerKey)
          );
          return Boolean(String(question.main || question.plain || "").trim()) &&
            Boolean(answerKey) &&
            distractors.size >= 5;
        }
      });
    });
  });

  registry.registerTool({
    toolId: "unit-circle-trigonometry",
    version: "2.0.0",
    concepts: concepts.map(id => ({ id })),
    templates
  });
})(typeof window !== "undefined" ? window : globalThis);
