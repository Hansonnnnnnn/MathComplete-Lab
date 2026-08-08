# Factoring Practice Rebuild Specification

## 1. Product identity

- Tool ID: `factoring-practice`
- English title: **Factoring Practice**
- Chinese title: **因式分解专项练习**
- Primary course: Algebra I
- Mathematical domain: complete factorization over integer coefficients
- Template target: 105 structurally distinct templates
- Supported modes: Learn, Practice, Exam
- Supported difficulties: Easy, Medium, Hard, Expert, Mixed
- Supported choice counts: 4, 5, or 6 for choice-based tasks

The rebuild must preserve timing, early completion, mistake review, score PDF export, Assignment Builder compatibility, bilingual content, and light/dark themes.

## 2. Product goals

The tool must train students to factor algebraic expressions completely and to diagnose authentic factoring errors. It must not reward recognition of superficial wording or require students to identify the name of a factoring method without performing mathematical work.

The rebuild must:

1. remove all story, area, geometry-context, and other word-based application questions;
2. remove questions whose scored task is only to name a factoring method;
3. retain and deepen error-diagnosis questions;
4. add structured coefficient-fill questions;
5. expand the mathematical range while remaining appropriate for United States high-school algebra;
6. replace the current superficially varied bank with 105 genuinely distinct templates.

Changing only coefficients, signs, variable letters, factor order, or answer position does not create a new template.

## 3. Mathematical domain and conventions

All expressions are factored over the integers.

- The input polynomial belongs to `Z[x]` or, in selected Hard and Expert templates, `Z[x, y]` or an equivalent two-variable integer polynomial ring.
- Irrational, fractional, and complex factors are outside the scope of this tool.
- `Prime / 不可约` means irreducible over the integers, up to multiplication by the units `1` and `-1`.
- For example, `x^2 + 4` is prime for this tool even though it factors over the complex numbers.
- The zero polynomial, undefined expressions, and degenerate zero factors are prohibited.
- Canonical displayed answers use a positive outside GCF and primitive factors with positive leading coefficients.
- Student coefficient-fill answers may redistribute signs among factors when the total product remains unchanged.
- Every final answer must be completely factored. An expression such as `2x + 2` may not remain as a factor when it still has a non-unit integer GCF.

## 4. Removed content

The generator, template metadata, prompts, reports, and tests must contain no scored story contexts, including:

- rectangle or area-product stories;
- garden, tile, length, width, revenue, motion, or other applied narratives;
- verbal translation from a real-world situation into a polynomial.

The scored task must also never be only:

- "Which factoring method should be used?";
- "Identify the method";
- "Name the pattern" without requiring factoring, coefficient completion, or error analysis.

References such as `area-product` must be removed from active template metadata. Text remains permitted for instructions, explanations, and error-diagnosis choices.

## 5. Content architecture

The bank must contain exactly 105 core templates with the following content allocation:

| Content area | Templates |
| --- | ---: |
| Greatest common factor and negative GCF | 15 |
| Monic and non-monic trinomials | 25 |
| Difference of squares, perfect-square trinomials, sum/difference of cubes | 20 |
| Four-term and extended grouping | 15 |
| Higher powers and quadratic-form substitution | 10 |
| Multi-step complete factorization | 10 |
| Prime-polynomial decisions and error-focused structures | 10 |
| **Total** | **105** |

The bank must include at least:

- numeric and monomial GCF;
- negative GCF used to normalize a leading term;
- GCFs containing one or two variables;
- monic trinomials with positive, negative, and mixed-sign factors;
- non-monic trinomials requiring the AC method;
- difference of two squares;
- repeated difference-of-squares decomposition for higher even powers;
- positive and negative perfect-square trinomials;
- sum of cubes and difference of cubes;
- grouping with four terms;
- grouping followed by a special-product factorization;
- quadratic-form substitutions such as `x^4 + bx^2 + c`;
- two-variable homogeneous structures such as `x^2 - 9y^2` and `4a^2 + 12ab + 9b^2`;
- multi-step problems that require a GCF before another structure;
- prime polynomials whose irreducibility is validated over the integers.

Approximately 10 of the 105 templates must yield `Prime / 不可约` as the correct conclusion. Prime templates must not be visually distinguishable from factorable templates by length, sign pattern, or coefficient size alone.

## 6. Difficulty model

The template distribution must be:

- Easy: 25
- Medium: 30
- Hard: 25
- Expert: 25

### Easy

- numeric GCF;
- monomial GCF;
- simple monic trinomials;
- small positive and mixed-sign coefficients;
- no cubes, substitution, or multi-layer factoring.

### Medium

- monic trinomials with all sign patterns;
- basic difference of squares;
- perfect-square trinomials;
- a simple GCF followed by a familiar quadratic structure;
- selected prime quadratics.

### Hard

- non-monic trinomials using the AC structure;
- four-term grouping;
- sum and difference of cubes;
- two-variable special products;
- problems requiring at least two meaningful algebraic decisions.

### Expert

- GCF followed by a special identity or trinomial factorization;
- repeated difference of squares;
- quadratic-form substitution;
- extended grouping;
- two-variable and higher-degree expressions;
- multi-step complete factorization and subtle error diagnosis.

### Mixed

- use balanced blocks across all four difficulties;
- avoid consecutive repetition of the same content area and interaction contract when another valid template is available;
- avoid repeating the same structural template within the previous three questions.

## 7. Interaction distribution

The 105 templates must use these scored interactions:

| Interaction | Easy | Medium | Hard | Expert | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Complete-factorization choice | 15 | 16 | 14 | 13 | 58 |
| All-coefficient fill | 7 | 10 | 7 | 8 | 32 |
| First-error diagnosis | 3 | 4 | 4 | 4 | 15 |
| **Total** | **25** | **30** | **25** | **25** | **105** |

The user-selected 4, 5, or 6 choice count applies only to complete-factorization choice and error-diagnosis questions. Coefficient-fill questions must never generate placeholder or fake choices.

## 8. Complete-factorization choice contract

Each choice question must:

- show one polynomial or algebraic expression;
- ask the student to factor completely or identify `Prime`;
- contain exactly the configured 4, 5, or 6 choices;
- contain exactly one mathematically valid complete factorization;
- reject duplicate answers that differ only by factor order or sign redistribution;
- randomize the correct answer position independently.

Distractors must come from verified error paths, including:

- incomplete GCF extraction;
- incorrect factor signs;
- correct product but wrong middle-term sum;
- AC-product confusion;
- stopping after one difference-of-squares step;
- perfect-square and difference-of-squares confusion;
- incorrect cube-identity signs;
- incomplete grouping;
- declaring a factorable polynomial prime;
- introducing a factorization that does not expand to the original polynomial.

Every option must be expanded by the audit model. Any distractor that expands to the original polynomial and is completely factored is an unintended second answer and invalidates the generated question.

## 9. All-coefficient fill contract

A coefficient-fill question provides the complete factor topology, variables, exponents, and grouping, while every coefficient is blank.

Example:

```text
6x^2 - 13x - 5 = ([a]x + [b])([c]x + [d])
```

The student must enter all four signed integer coefficients. A standard correct entry is:

```text
a = 3, b = 1, c = 2, d = -5
```

Requirements:

- every visible coefficient slot is initially empty;
- coefficients `1` and `-1` must be entered explicitly;
- generated correct coefficients must be nonzero;
- inputs accept signed base-10 integers only;
- every slot has an accessible label and logical keyboard order;
- the interface renders a live normalized mathematical preview;
- negative entries display with subtraction, never as `+(-5)`;
- submission remains disabled until every required slot contains a valid integer;
- all slots must be correct for the question to count as correct.

The provided factor topology may include:

- an outside numeric or monomial GCF;
- two linear factors;
- a repeated factor shown with a fixed exponent;
- a linear factor and a fixed-degree quadratic factor for cube identities;
- two-variable factors;
- a substituted quadratic structure.

Exponents, variable names, and factor topology are not editable. Only coefficients are inputs.

## 10. Coefficient-fill equivalence and validation

Coefficient-fill grading must not compare display strings or store only one ordered tuple.

The validator must:

1. build structured factors from the submitted coefficient slots;
2. verify that every non-monomial factor is primitive;
3. expand the full submitted product exactly over integer coefficients;
4. compare the resulting canonical polynomial with the question polynomial;
5. confirm that the supplied factor topology represents a complete factorization;
6. accept the response if every condition is satisfied.

This accepts:

```text
(3x + 1)(2x - 5)
(2x - 5)(3x + 1)
(-3x - 1)(-2x + 5)
(-2x + 5)(-3x - 1)
```

It must also accept valid sign redistribution across three or more factors, such as moving a negative sign between an outside GCF and one primitive factor, provided the total expanded polynomial is unchanged.

It must reject:

- an equivalent product containing a non-primitive factor that should be factored further;
- a factor topology containing a zero factor;
- missing inputs, decimals, fractions, scientific notation, or non-numeric text;
- a product that matches only at sampled numeric values rather than symbolically;
- a partially factored result.

For Learn and Practice feedback, the UI must compare the response against all valid factor permutations and choose the alignment that maximizes correctly matched slots before highlighting individual fields. The score remains binary for the entire question.

## 11. Error-diagnosis contract

Every diagnosis question must show a student's 2-4 line factoring attempt and ask for the first incorrect step or the precise first error.

Allowed error families include:

- incomplete GCF extraction;
- failure to normalize a negative leading coefficient;
- incorrect sum/product pair;
- incorrect AC split;
- sign error when regrouping;
- difference-of-squares factors using equal signs instead of conjugate signs;
- perfect-square middle term mismatch;
- incorrect quadratic-factor sign in a cube identity;
- stopping before all factors are irreducible over the integers;
- omitting an original term during grouping;
- incorrectly declaring a polynomial prime.

The correct answer must identify the first error, not merely state that the final answer is wrong. Later lines must be treated as dependent on the first error. Distractors must describe plausible errors that are not the earliest actual failure.

Diagnosis tasks may use text choices and must respect the configured 4, 5, or 6 choice count.

## 12. Sum and difference of cubes reference

Every sum- or difference-of-cubes question must display this reference without revealing the substituted coefficients:

```text
a^3 + b^3 = (a + b)(a^2 - ab + b^2)
a^3 - b^3 = (a - b)(a^2 + ab + b^2)
```

The reference must appear in Learn, Practice, and Exam modes and in the score PDF. It is an allowed reference, not a hint, and must not alter the question between modes.

## 13. Mode behavior

Learn, Practice, and Exam must use the same templates, parameter ranges, question content, coefficient slots, and formula references.

- Learn mode must not prefill coefficients, reduce the number of blanks, expose factor structure beyond the standard question contract, or add pre-submission scaffolding.
- Practice mode must not reveal correctness before submission.
- Exam mode must not reveal hints, correctness, accepted alternatives, or worked solutions before the round is submitted.
- Differences among modes are limited to the site's standard feedback timing and solution visibility.

## 14. Controlled randomness

Random generation must use exact integer parameters and the following default limits:

- Easy generated coefficients: absolute value at most `12`;
- Medium factor coefficients: absolute value at most `12`;
- Hard linear-factor leading coefficients: absolute value at most `8`;
- Hard expanded coefficients: absolute value at most `120`;
- Expert expanded coefficients: normally at most `240`;
- generated coefficient slots: never zero;
- fractional and decimal coefficients: prohibited;
- three or more variables: prohibited;
- excessively large prime searches or arithmetic-only difficulty: prohibited.

Values `1` and `-1` must occur often enough to test implicit coefficients but must not dominate the bank. Variable changes and sign changes may vary a template but cannot substitute for structural diversity.

Every generated question must satisfy:

- nonzero leading coefficient;
- exact integer expansion;
- at least one valid canonical answer;
- no unintended second correct choice;
- no duplicate or equivalent choices;
- no accidental reduction to a lower difficulty through cancellation;
- reasonable rendered length at mobile width.

## 15. Structured mathematics model

The implementation must use structured polynomial data rather than parsing display strings.

Recommended interfaces:

```text
Monomial = {
  coefficient: Integer,
  powers: { variable: nonnegativeInteger }
}

Polynomial = {
  terms: Map<canonicalPowerKey, Integer>
}

FactorStructure = {
  factors,
  coefficientSlots,
  commutativeGroups,
  fixedExponents
}
```

Required operations:

```text
normalizePolynomial(polynomial)
addPolynomial(a, b)
multiplyPolynomial(a, b)
expandFactors(factors)
polynomialKey(polynomial)
contentGcd(polynomial)
isPrimitiveFactor(factor)
isCompleteIntegerFactorization(factors)
normalizeFactorDisplay(factors)
validateCoefficientResponse(question, response)
```

JavaScript `Number` is sufficient within the specified coefficient limits, but all operations must remain integral and exact. Floating-point sampling is not an acceptable proof of equivalence.

## 16. Feedback and solutions

Solutions must show the actual factoring path rather than only the final answer.

Depending on the template, the explanation should include:

- GCF extraction;
- sum and product conditions;
- AC product and middle-term split;
- grouping steps;
- special-product identity;
- cube identity substitution;
- quadratic-form substitution and restoration;
- a final expansion check;
- confirmation that every remaining factor is primitive and irreducible over the integers.

For coefficient-fill questions, post-submission feedback must show:

- the student's signed coefficient tuple;
- the student's normalized factor preview;
- per-slot correct/incorrect states after best permutation alignment;
- one canonical correct factorization;
- an explanation of any incomplete or non-primitive factor.

## 17. Reports and stored attempt data

Choice and diagnosis attempts must record all displayed choices. Coefficient-fill attempts must not record or display fake choices.

Coefficient-fill attempt data must include:

```text
interactionKind: "coefficient-fill"
slotDefinitions
studentCoefficients
studentFactorLatex
canonicalAnswerCoefficients
canonicalAnswerLatex
acceptedByExpansion
slotFeedback
```

The on-page results and score PDF must show:

- full question expression;
- interaction type;
- student response;
- normalized student factorization;
- canonical correct factorization;
- overall correctness;
- targeted review suggestion;
- cube formula reference when applicable.

The PDF must not include a `Choices` section for coefficient-fill questions.

## 18. Page and code migration

The active implementation must have one source of question truth.

- Rebuild `assets/js/factoring-practice-bank.js` around structured templates and exact polynomial operations.
- Add a factoring interaction adapter for multi-slot coefficient input, locking, reveal, serialization, report output, and keyboard handling.
- Remove the obsolete `legacy-factoring-practice-script` and old inline builder code from `games/factoring-practice.html`.
- Retain only page-specific styles and interaction markup that are not supplied by the shared practice system.
- Register the rebuilt bank with the central template registry, question-bank specifications, score exporter, catalog, and Assignment Builder.
- Do not add a database table or change the existing Supabase attempt schema.

## 19. Automated audits

The factoring audit must verify:

- exactly 105 templates;
- exactly 25 semantic families or more, with no family represented only by number changes;
- difficulty counts of `25/30/25/25`;
- interaction counts of `58/32/15`;
- content counts of `15/25/20/15/10/10/10`;
- approximately 10 validated Prime templates;
- no story or method-identification prompts or metadata;
- every choice question has exactly one correct mathematical answer;
- every distractor is non-equivalent to the source polynomial or is demonstrably incomplete;
- coefficient-fill factor permutations are accepted;
- valid even-parity sign redistribution is accepted;
- invalid odd-parity sign changes are rejected;
- non-primitive submitted factors are rejected;
- all cube questions contain both reference identities;
- identical seeds reproduce identical parameters, displays, answers, and option order.

At least 2,000 generated questions per difficulty must be audited. Independent expansion checks must validate every generated correct factorization.

## 20. Browser and visual acceptance

Regression coverage must include:

- `1440x900`, `1024x768`, and `390x844` viewports;
- English and Chinese;
- light and dark themes;
- Learn, Practice, and Exam;
- 4, 5, and 6 choice settings;
- complete-factorization choice, coefficient fill, and error diagnosis;
- keyboard-only coefficient entry and submission;
- live preview with positive, negative, `1`, and `-1` coefficients;
- factor swapping and sign redistribution;
- normal completion and early ending;
- mistake review and similar-question retry;
- score PDF and Assignment Builder assignment PDF.

Acceptance requires:

- no horizontal overflow;
- no raw LaTeX;
- no clipped inputs or overlapping coefficients;
- at least 44px touch targets;
- high-contrast input, preview, feedback, and formula text in both themes;
- stable layout while coefficients are entered;
- no false rejection caused by factor order;
- no choices displayed for coefficient-fill attempts in results or reports.

## 21. Out of scope

This rebuild does not include:

- free-form factor-expression parsing;
- factoring over irrational, real, or complex coefficients;
- calculator approximations;
- synthetic division or the Rational Root Theorem as a primary factoring workflow;
- arbitrary high-degree polynomial root finding;
- three-variable factoring;
- story-based factoring applications;
- scored memorization of factoring-method names;
- mode-specific easier questions or prefilled Learn-mode coefficients.

