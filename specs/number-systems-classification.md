# Number Systems Classification Practice Specification

## 1. Product identity

- Tool ID: `number-systems-classification`
- English title: **Number Systems Classification Practice**
- Chinese title: **数系分类专项练习**
- Primary course: Algebra II
- Secondary course: Precalculus
- Tool kind: standard multiple-choice practice tool
- Core tasks: find the unique member, find the unique counterexample, or identify the most specific number system after exact simplification

The tool must support the site's standard Learn, Practice, and Exam modes; Easy, Medium, Hard, Expert, and Mixed difficulty; 4, 5, or 6 choices; per-question timing; early completion; mistake review; PDF score reports; and Assignment Builder integration.

## 2. Learning objective

Each question must provide the practice value of a short classification set. A student must simplify and classify every displayed expression to reliably identify the one outsider.

The tool covers:

1. Natural numbers
2. Whole numbers
3. Integers
4. Rational numbers
5. Irrational numbers
6. Real numbers
7. Pure imaginary numbers
8. Non-real complex numbers

The classifications are intentionally overlapping. In particular:

```text
Natural ⊂ Whole ⊂ Integer ⊂ Rational ⊂ Real
Pure imaginary ⊂ Non-real complex
```

## 3. Mathematical definitions

- Natural: positive integers. The generator must never use zero in a question whose correctness depends on whether zero is natural.
- Whole: nonnegative integers.
- Integer: rational values with denominator one.
- Rational: exact quotients of integers with nonzero denominator.
- Irrational: real values that are not rational.
- Real: rational or irrational real values.
- Pure imaginary: `bi`, where `b` is real and nonzero and the real component is zero.
- Non-real complex: `a + bi`, where `b` is real and nonzero. This includes pure imaginary values.

Zero must not be used as a boundary distractor in Natural, Pure imaginary, or Non-real complex questions. Undefined expressions are prohibited.

Classification is always based on the exact simplified value, never the expression's appearance.

## 4. Question contract

Every question must use one of three scored contracts:

1. **Find a member:** one expression belongs to the named system and every distractor does not.
2. **Find an outsider/counterexample:** one expression does not belong and every distractor does.
3. **Most specific system:** one expression is simplified, then the student chooses its smallest applicable named number system.

Every contract must:

- contain exactly the configured 4, 5, or 6 options;
- contain exactly one mathematically correct option;
- avoid `All of the above` and `None of the above`;
- use a canonical exact value key to reject mathematically equivalent duplicate options;
- balance visual forms so that an answer is not exposed by being the only fraction, radical, negative value, or complex expression;
- include at least three expression families in member/outsider questions when the selected option count permits it;
- place the correct answer independently and approximately uniformly across all positions.

Ambiguous infinite-decimal ellipses are prohibited. Repeating decimals must use an explicit repeating bar.

## 5. Difficulty model

### Easy

- Natural, Whole, Integer, and Rational targets
- direct integers, fractions, and finite decimals
- little or no simplification

### Medium

- adds Irrational and Real targets
- radicals, repeating decimals, `pi`, `e`, and one-step simplification
- at least one candidate whose classification is clearer only after simplification

### Hard

- adds Pure imaginary and Non-real complex targets
- powers of `i`, principal square roots of negative real numbers, and standard-form complex values
- at least two disguised candidates per question

### Expert

- all eight targets
- one- or two-step exact simplification
- deliberately misleading surface notation without excessive arithmetic
- at least two disguised candidates per question

### Mixed

- balanced blocks across the four core difficulties
- no consecutive repeated target system when another valid target is available
- no repeated expression recipe within the preceding three questions when another recipe is available

## 6. Random generation limits

- integers: primarily `-200` through `200`
- rational denominators: at most `24`, always reduced and positive
- radicands: at most `400`
- ordinary exponents: `0` through `12`
- powers of `i`: may use exponents through `40`
- complex real and imaginary coefficients: primarily `-12` through `12`
- expert questions: no more than two principal simplification steps
- no calculator approximations

Randomness must be controlled. Target systems and expression recipes are selected through a shuffled constrained deck, while coefficients, signs, exact forms, and option position remain independently random.

## 7. Template architecture

The bank must register exactly:

- 5 core concepts
- 25 semantic families
- 105 structurally distinct templates
- 25 Easy, 30 Medium, 25 Hard, and 25 Expert templates

The five concepts are:

1. direct real-number hierarchy
2. rational representations
3. radicals, constants, and real-number classification
4. imaginary and non-real complex classification
5. mixed simplified expressions

The five task forms are `direct`, `inverse`, `interpret`, `translate`, and `diagnose`:

- `direct`: find the unique member;
- `inverse`: find the unique non-member;
- `interpret`: classify one simplified value into its most specific system;
- `translate`: identify the expression whose simplified value belongs to the target;
- `diagnose`: select the counterexample to an incorrect all-members claim.

Consecutive questions must avoid repeating the same prompt style when another valid template is available.

Changing only numbers, signs, labels, order, rotation, or answer position does not create a new template.

## 8. Expression families

The generator must support exact, validated variants of at least:

- positive and negative integer literals
- reduced and reducible fractions
- finite decimals
- explicit repeating decimals
- perfect square and cube roots
- non-perfect square and cube roots
- signed powers and powers of rational bases
- exact rational arithmetic
- nonzero rational multiples and shifts of `pi` and `e`
- radicals that simplify to integers or rational values
- radicals that remain irrational
- powers of `i` across all four residues modulo four
- principal square roots of negative numbers
- pure imaginary rational and radical coefficients
- standard-form non-real complex numbers
- simple complex sums, differences, and products
- cancellation expressions whose surface form differs from the simplified classification

Every expression object must retain its LaTeX, canonical value, simplified LaTeX, exact memberships, expression family, and bilingual explanation.

## 9. Feedback and modes

Learn and Practice explanations must analyze every displayed candidate or classification choice:

- original expression;
- exact simplified result;
- all applicable named number systems;
- whether it belongs to the current target system;
- why the answer is the unique member, counterexample, or most specific set.

Practice mode may continue to follow the site's normal auto-advance behavior for correct answers. Incorrect answers must expose the full candidate analysis before continuing. Learn mode must expose it after every answer. Exam mode must hide feedback and explanations until the round is graded.

No number-system hierarchy diagram is displayed on the question page.

## 10. Catalog, assignment, and reporting

- The tool appears once under Algebra II in the all-tools view.
- It also appears when Precalculus is selected.
- The tool card uses a unique nested number-set visual, but the practice page remains uncluttered.
- Assignment Builder exposes all three modes, all five difficulty settings, 1–100 questions, 4/5/6 choices, and all standard timer levels.
- Score reports show every choice, the selected choice, the correct answer, the task contract, and an optional per-choice classification analysis table.
- Report analysis must be driven by structured `parameters.optionAnalysis`, not parsed from rendered KaTeX text.
- No database migration is required.

## 11. Validation and acceptance

Automated audits must prove:

- exactly 105 templates, 25 semantic families, and the required difficulty distribution;
- deterministic output for the same seed;
- at least 2,000 generated questions per difficulty;
- exact simplification and classification of every candidate;
- exactly one correct option under each of the three task contracts;
- all five prompt styles and all three task contracts appear in generation audits;
- 4, 5, and 6 choice modes always reach the requested count;
- no duplicate or mathematically equivalent option values;
- no prohibited zero-boundary, undefined, or ambiguous-decimal cases;
- correct-answer position and target-system distributions are not materially biased;
- Medium, Hard, and Expert disguised-expression requirements are met;
- bilingual prompts, explanations, and membership names remain semantically aligned.

Browser acceptance covers:

- `1440x900`, `1024x768`, and `390x844`;
- English and Chinese;
- light and dark themes;
- Learn, Practice, and Exam;
- 4, 5, and 6 choices;
- timed and untimed rounds;
- normal completion and early completion;
- score report PDF generation;
- Assignment Builder discovery and configuration;
- no horizontal overflow, clipped formulas, low-contrast text, or layout shift.
