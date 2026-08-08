(function (root) {
  "use strict";

  const specs = {
    "arithmetic-within-10": ["addition", "subtraction", "multiplication", "division", "mixed-equality"],
    "arithmetic-within-100": ["mental-add-subtract", "multiply-divide", "place-value", "estimate-compare", "two-step-models"],
    "arithmetic-within-1000": ["multi-digit-add-subtract", "multiplication", "division-remainders", "place-value-estimation", "multi-step-models"],
    "powers-roots": ["integer-powers", "perfect-roots", "inverse-missing-value", "signed-fractional-bases", "mixed-applications"],
    "gcd-lcm": ["factors-multiples", "prime-factorization", "greatest-common-factor", "least-common-multiple", "relations-applications"],
    "set-theory-basics": ["membership-notation", "subsets-power-sets", "set-operations", "cardinality-venn", "intervals-language"],
    "fraction-percent": ["conversion", "proportion-percent-of", "percent-change", "discount-markup", "percent-applications"],
    "exponent-laws": ["product-quotient", "power-rules", "zero-negative-exponents", "multivariable-coefficients", "diagnosis-equivalence"],
    "algebra-expression": ["substitution", "order-of-operations", "multivariable-evaluation", "formula-evaluation", "expression-modeling"],
    "algebra-simplification": ["like-terms", "distribution", "nested-groups", "standard-form", "error-diagnosis"],
    "linear-equation": ["inverse-operations", "variables-both-sides", "parentheses-fractions", "identity-no-solution", "applications-formulas"],
    "linear-inequalities": ["one-step-sign-reversal", "multi-step", "compound", "absolute-value", "graphs-intervals-applications"],
    "systems-linear-equations": ["substitution", "elimination", "graph-classification", "word-models", "three-variable-parameter"],
    "slope-from-two-points": ["two-point-slope", "graph-table-rate", "line-equations", "parallel-perpendicular", "rate-applications"],
    "function-evaluation": ["function-notation", "tables-graphs", "piecewise-domain", "composition-inverse", "function-models"],
    "factoring-practice": ["gcf-trinomials", "special-products", "grouping", "higher-substitution", "complete-prime-diagnosis"],
    "polynomial-multiplication": ["monomial-products", "binomial-products", "polynomial-products", "multivariable-products", "identity-diagnosis"],
    "completing-the-square": ["vertex-form-conversion", "solve-by-completing", "graph-features", "parameter-missing-value", "optimization-modeling"],
    "quadratic-functions": ["quadratic-forms", "graph-features", "roots-intercepts", "transformations", "modeling-comparison"],
    "special-products": ["perfect-square-binomials", "difference-of-squares", "sum-difference-cubes", "multivariable-identities", "nested-applications"],
    "exponential-functions": ["values-representations", "growth-decay", "transformations", "equations-inverses", "models-comparison"],
    "logarithmic-functions": ["definition-evaluation", "log-properties", "log-equations", "graphs-inverses", "models-change-base"],
    "radical-functions": ["evaluation-domain", "transformations", "equations-extraneous", "inverse-functions", "radical-models"],
    "advanced-equation-solving": ["polynomial-equations", "rational-equations", "radical-absolute-equations", "exponential-log-equations", "trigonometric-parameter-equations"],
    "quadratic-formula": ["discriminant", "exact-real-roots", "complex-roots", "parameter-analysis", "modeling-verification"],
    "complex-number-operations": ["components-representations", "addition-subtraction", "multiplication-powers", "division-conjugates", "mixed-equations-applications"],
    "number-systems-classification": ["real-number-hierarchy", "rational-representations", "radicals-constants-real", "imaginary-complex", "mixed-simplified-values"],
    "function-graph-matching": ["linear-quadratic-absolute", "radical-rational", "exponential-logarithmic", "trigonometric", "piecewise-transformations-comparison"],
    "unit-circle-trigonometry": ["angle-measure-reference", "unit-circle-coordinates", "exact-trig-values", "inverse-angle-sets", "expressions-conditions"],
    "geometry-formula": ["perimeter-area", "circles-arcs", "surface-area-volume", "composite-units", "missing-measure-applications"],
    "midpoints-bisectors-trisectors": ["midpoints-coordinate", "segment-bisectors", "segment-trisection", "angle-bisectors", "angle-trisection"],
    "conditional-logic": ["conditional-structure", "converse-inverse-contrapositive", "negation-quantifiers", "truth-equivalence-counterexamples", "sufficient-necessary-biconditional"],
    "parallel-lines-angle-relationships": ["basic-angle-relations", "parallel-transversal-relations", "algebra-angle-equations", "parallel-line-converses", "multi-step-proof-diagnosis"],
    "triangle-congruence": ["criteria-correspondence", "direct-givens", "angle-facts", "hypotenuse-leg", "proof-validation-completion"],
    "limits-practice": ["direct-algebraic-limits", "one-sided-piecewise", "infinite-asymptotic", "trigonometric-special", "continuity-parameters"],
    "derivative-practice": ["basic-rules", "product-quotient", "chain-rule", "trig-exponential-log", "tangent-rate-applications"],
    "integration-practice": ["basic-antiderivatives", "definite-integrals-ftc", "substitution", "area-net-change", "mixed-applications"],
    "vector-operations": ["components-operations", "dot-angle-projection", "equations-span", "vector-geometry", "vector-applications"],
    "matrix-multiplication": ["compatibility", "entry-products", "matrix-vector-transformations", "properties-order", "chains-equations"],
    "determinant-practice": ["two-by-two-three-by-three", "row-operations", "determinant-properties", "invertibility", "geometry-parameters"]
  };

  const TASK_FORMS = ["direct", "inverse", "interpret", "translate", "diagnose"];
  const records = Object.fromEntries(Object.entries(specs).map(([toolId, concepts]) => [toolId, Object.freeze({
    toolId,
    concepts: Object.freeze(concepts.map(id => Object.freeze({ id }))),
    taskForms: Object.freeze([...TASK_FORMS]),
    requiredSemanticFamilies: concepts.length * TASK_FORMS.length,
    requiredCoreTemplates: 105,
    difficultyQuotas: Object.freeze({ easy: 25, medium: 30, hard: 25, expert: 25 })
  })]));

  root.MCLQuestionBankSpecs = Object.freeze({
    taskForms: Object.freeze([...TASK_FORMS]),
    tools: Object.freeze(records),
    get: toolId => records[toolId] || null,
    all: () => Object.values(records)
  });
})(typeof window !== "undefined" ? window : globalThis);
