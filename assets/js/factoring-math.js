(function (root) {
  "use strict";

  function clonePowers(powers) {
    return Object.fromEntries(Object.entries(powers || {}).filter(([, exponent]) => Number(exponent) > 0).sort(([a], [b]) => a.localeCompare(b)));
  }

  function powerKey(powers) {
    return Object.entries(clonePowers(powers)).map(([variable, exponent]) => `${variable}:${exponent}`).join("|") || "1";
  }

  function powersFromKey(key) {
    if (!key || key === "1") return {};
    return Object.fromEntries(String(key).split("|").map(part => {
      const [variable, exponent] = part.split(":");
      return [variable, Number(exponent)];
    }));
  }

  function multiplyPowers(left, right) {
    const result = { ...clonePowers(left) };
    Object.entries(right || {}).forEach(([variable, exponent]) => {
      result[variable] = (result[variable] || 0) + Number(exponent || 0);
      if (!result[variable]) delete result[variable];
    });
    return clonePowers(result);
  }

  function normalizePolynomial(input) {
    const source = input instanceof Map ? [...input.entries()] : Array.isArray(input)
      ? input.map(term => Array.isArray(term) ? [term[0], Number(term[1])] : [powerKey(term.powers), Number(term.coefficient)])
      : Object.entries(input?.terms || input || {});
    const terms = new Map();
    source.forEach(([key, coefficient]) => {
      const value = Number(coefficient);
      if (!Number.isSafeInteger(value)) throw new Error("Polynomial coefficients must be safe integers.");
      if (value) terms.set(key, (terms.get(key) || 0) + value);
    });
    [...terms.entries()].forEach(([key, coefficient]) => { if (!coefficient) terms.delete(key); });
    return terms;
  }

  function polynomial(terms) {
    return normalizePolynomial(terms || []);
  }

  function monomial(coefficient, powers = {}) {
    return polynomial([{ coefficient, powers }]);
  }

  function addPolynomial(left, right) {
    return normalizePolynomial([...normalizePolynomial(left).entries(), ...normalizePolynomial(right).entries()]);
  }

  function scalePolynomial(source, scalar) {
    const value = Number(scalar);
    if (!Number.isSafeInteger(value)) throw new Error("Polynomial scalar must be an integer.");
    return normalizePolynomial([...normalizePolynomial(source).entries()].map(([key, coefficient]) => [key, coefficient * value]));
  }

  function multiplyPolynomial(left, right) {
    const result = [];
    normalizePolynomial(left).forEach((leftCoefficient, leftKey) => {
      normalizePolynomial(right).forEach((rightCoefficient, rightKey) => {
        result.push([
          powerKey(multiplyPowers(powersFromKey(leftKey), powersFromKey(rightKey))),
          leftCoefficient * rightCoefficient
        ]);
      });
    });
    return normalizePolynomial(result);
  }

  function powerPolynomial(source, exponent) {
    const count = Number(exponent);
    if (!Number.isInteger(count) || count < 0) throw new Error("Polynomial powers must be nonnegative integers.");
    let result = monomial(1);
    for (let index = 0; index < count; index += 1) result = multiplyPolynomial(result, source);
    return result;
  }

  function polynomialKey(source) {
    return [...normalizePolynomial(source).entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, coefficient]) => `${key}=${coefficient}`)
      .join(";") || "0";
  }

  function gcd(left, right) {
    let a = Math.abs(Number(left || 0));
    let b = Math.abs(Number(right || 0));
    while (b) [a, b] = [b, a % b];
    return a;
  }

  function contentGcd(source) {
    const coefficients = [...normalizePolynomial(source).values()];
    return coefficients.reduce((value, coefficient) => gcd(value, coefficient), 0);
  }

  function isPrimitiveFactor(source) {
    const normalized = normalizePolynomial(source);
    return normalized.size > 1 && contentGcd(normalized) === 1;
  }

  function hasCommonVariableFactor(source) {
    const terms = [...normalizePolynomial(source).keys()].map(powersFromKey);
    if (terms.length < 2) return false;
    const variables = [...new Set(terms.flatMap(item => Object.keys(item)))];
    return variables.some(variable => Math.min(...terms.map(item => item[variable] || 0)) > 0);
  }

  function compareTerms([leftKey], [rightKey]) {
    const left = powersFromKey(leftKey), right = powersFromKey(rightKey);
    const leftDegree = Object.values(left).reduce((sum, value) => sum + value, 0);
    const rightDegree = Object.values(right).reduce((sum, value) => sum + value, 0);
    if (leftDegree !== rightDegree) return rightDegree - leftDegree;
    const variables = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const variable of variables) {
      if ((left[variable] || 0) !== (right[variable] || 0)) return (right[variable] || 0) - (left[variable] || 0);
    }
    return leftKey.localeCompare(rightKey);
  }

  function monomialLatex(powers) {
    return Object.entries(clonePowers(powers)).map(([variable, exponent]) => exponent === 1 ? variable : `${variable}^{${exponent}}`).join("");
  }

  function polynomialLatex(source) {
    const entries = [...normalizePolynomial(source).entries()].sort(compareTerms);
    if (!entries.length) return "0";
    return entries.map(([key, coefficient], index) => {
      const variables = monomialLatex(powersFromKey(key));
      const absolute = Math.abs(coefficient);
      const body = variables ? `${absolute === 1 ? "" : absolute}${variables}` : String(absolute);
      if (!index) return coefficient < 0 ? `-${body}` : body;
      return coefficient < 0 ? `-${body}` : `+${body}`;
    }).join("");
  }

  function factorPolynomial(factor, values = null) {
    return polynomial((factor.terms || []).map(term => ({
      coefficient: values ? Number(values[term.slot]) : Number(term.coefficient),
      powers: term.powers || {}
    })));
  }

  function expandFactorStructure(schema, values = null) {
    let result = monomial(1);
    if (schema.outside) result = multiplyPolynomial(result, factorPolynomial(schema.outside, values));
    (schema.factors || []).forEach(factor => {
      result = multiplyPolynomial(result, powerPolynomial(factorPolynomial(factor, values), factor.exponent || 1));
    });
    return result;
  }

  function coefficientText(value, variables, first) {
    const coefficient = Number(value);
    if (!Number.isSafeInteger(coefficient)) return first ? "\\square" : "+\\square";
    const absolute = Math.abs(coefficient);
    const body = variables ? `${absolute === 1 ? "" : absolute}${variables}` : String(absolute);
    if (first) return coefficient < 0 ? `-${body}` : body;
    return coefficient < 0 ? `-${body}` : `+${body}`;
  }

  function factorLatex(factor, values = null) {
    const terms = factor.terms || [];
    const body = terms.map((term, index) => coefficientText(values ? values[term.slot] : term.coefficient, monomialLatex(term.powers), index === 0)).join("") || "0";
    const grouped = terms.length > 1 ? `(${body})` : body;
    return (factor.exponent || 1) > 1 ? `${grouped}^{${factor.exponent}}` : grouped;
  }

  function factorStructureLatex(schema, values = null) {
    return [schema.outside ? factorLatex(schema.outside, values) : "", ...(schema.factors || []).map(factor => factorLatex(factor, values))].filter(Boolean).join("");
  }

  function slotDefinitions(schema) {
    const definitions = [];
    const addFactor = (factor, factorIndex, outside = false) => (factor?.terms || []).forEach((term, termIndex) => definitions.push({
      id: term.slot,
      factorId: factor.id || (outside ? "outside" : `factor-${factorIndex + 1}`),
      factorIndex: outside ? -1 : factorIndex,
      termIndex,
      powers: clonePowers(term.powers),
      canonical: Number(term.coefficient),
      outside
    }));
    if (schema.outside) addFactor(schema.outside, -1, true);
    (schema.factors || []).forEach((factor, index) => addFactor(factor, index, false));
    return definitions;
  }

  function canonicalValues(schema) {
    return Object.fromEntries(slotDefinitions(schema).map(slot => [slot.id, slot.canonical]));
  }

  function factorsAreValid(schema, values) {
    const factors = [];
    if (schema.outside) factors.push({ factor: schema.outside, polynomial: factorPolynomial(schema.outside, values), outside: true });
    (schema.factors || []).forEach(factor => factors.push({ factor, polynomial: factorPolynomial(factor, values), outside: false }));
    if (factors.some(item => !normalizePolynomial(item.polynomial).size)) return { valid: false, reason: "zero-factor" };
    const nonPrimitive = factors.find(item => !item.outside && item.factor.primitive !== false && (!isPrimitiveFactor(item.polynomial) || hasCommonVariableFactor(item.polynomial)));
    if (nonPrimitive) return { valid: false, reason: "non-primitive-factor", factorId: nonPrimitive.factor.id };
    return { valid: true };
  }

  function integerValues(schema, rawValues) {
    const values = {};
    for (const slot of slotDefinitions(schema)) {
      const raw = String(rawValues?.[slot.id] ?? "").trim();
      if (!/^-?\d+$/.test(raw)) return { valid: false, reason: "invalid-integer", slotId: slot.id };
      const value = Number(raw);
      if (!Number.isSafeInteger(value)) return { valid: false, reason: "unsafe-integer", slotId: slot.id };
      if (value === 0) return { valid: false, reason: "zero-coefficient", slotId: slot.id };
      values[slot.id] = value;
    }
    return { valid: true, values };
  }

  function permutation(items) {
    if (items.length < 2) return [items];
    const result = [];
    items.forEach((item, index) => permutation(items.filter((_, position) => position !== index)).forEach(rest => result.push([item, ...rest])));
    return result;
  }

  function shapeKey(factor) {
    return `${factor.exponent || 1}:${(factor.terms || []).map(term => powerKey(term.powers)).join(",")}`;
  }

  function acceptedCanonicalVectors(schema) {
    const baseFactors = schema.factors || [];
    const groups = new Map();
    baseFactors.forEach((factor, index) => {
      const key = shapeKey(factor);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(index);
    });
    let arrangements = [baseFactors.map((_, index) => index)];
    groups.forEach(indices => {
      if (indices.length < 2 || indices.length > 6) return;
      const next = [];
      arrangements.forEach(arrangement => permutation(indices).forEach(order => {
        const copy = [...arrangement];
        indices.forEach((target, position) => { copy[target] = order[position]; });
        next.push(copy);
      }));
      arrangements = next;
    });

    const unitExponents = [...(schema.outside ? [1] : []), ...baseFactors.map(factor => factor.exponent || 1)];
    const units = unitExponents.length;
    const signMasks = [];
    for (let mask = 0; mask < (1 << Math.min(units, 12)); mask += 1) {
      let productParity = 0;
      for (let bit = 0; bit < units; bit += 1) if (mask & (1 << bit)) productParity += unitExponents[bit];
      if (productParity % 2 === 0) signMasks.push(mask);
    }

    const vectors = [];
    arrangements.forEach(arrangement => signMasks.forEach(mask => {
      const values = {};
      let unit = 0;
      if (schema.outside) {
        const sign = mask & (1 << unit) ? -1 : 1;
        schema.outside.terms.forEach(term => { values[term.slot] = term.coefficient * sign; });
        unit += 1;
      }
      baseFactors.forEach((targetFactor, targetIndex) => {
        const sourceFactor = baseFactors[arrangement[targetIndex]];
        const sign = mask & (1 << unit) ? -1 : 1;
        targetFactor.terms.forEach((term, termIndex) => { values[term.slot] = sourceFactor.terms[termIndex].coefficient * sign; });
        unit += 1;
      });
      vectors.push(values);
    }));
    return vectors;
  }

  function bestSlotAlignment(schema, submitted) {
    const slots = slotDefinitions(schema);
    let best = null;
    acceptedCanonicalVectors(schema).forEach(candidate => {
      const feedback = Object.fromEntries(slots.map(slot => [slot.id, Number(submitted[slot.id]) === Number(candidate[slot.id])]));
      const score = Object.values(feedback).filter(Boolean).length;
      if (!best || score > best.score) best = { score, feedback, candidate };
    });
    return best || { score: 0, feedback: Object.fromEntries(slots.map(slot => [slot.id, false])), candidate: canonicalValues(schema) };
  }

  function validateCoefficientResponse(question, response) {
    const schema = question?.interaction?.schema || question?.schema;
    if (!schema) return { valid: false, correct: false, reason: "missing-schema", slotFeedback: {} };
    const parsed = integerValues(schema, response?.values || response);
    if (!parsed.valid) return { ...parsed, correct: false, slotFeedback: {} };
    const factorCheck = factorsAreValid(schema, parsed.values);
    const expanded = expandFactorStructure(schema, parsed.values);
    const target = question?.parameters?.targetPolynomial || question?.targetPolynomial || expandFactorStructure(schema, canonicalValues(schema));
    const targetKey = question?.parameters?.targetPolynomialKey || polynomialKey(target);
    const expandedKey = polynomialKey(expanded);
    const alignment = bestSlotAlignment(schema, parsed.values);
    return {
      valid: true,
      correct: factorCheck.valid && expandedKey === targetKey,
      reason: factorCheck.valid ? (expandedKey === targetKey ? "accepted-by-expansion" : "product-mismatch") : factorCheck.reason,
      values: parsed.values,
      expanded,
      expandedKey,
      targetKey,
      factorCheck,
      slotFeedback: alignment.feedback,
      alignedCanonical: alignment.candidate,
      matchedSlots: alignment.score,
      studentFactorLatex: factorStructureLatex(schema, parsed.values)
    };
  }

  function makeSchema(outside, factors) {
    let slotIndex = 0;
    const assign = (factor, id) => ({
      id,
      exponent: factor.exponent || 1,
      primitive: factor.primitive !== false,
      terms: (factor.terms || factor).map(term => ({
        slot: `c${++slotIndex}`,
        coefficient: Number(term.coefficient),
        powers: clonePowers(term.powers)
      }))
    });
    return {
      outside: outside ? assign({ terms: outside.terms || outside, exponent: 1, primitive: false }, "outside") : null,
      factors: (factors || []).map((factor, index) => assign(factor, `factor-${index + 1}`))
    };
  }

  const api = Object.freeze({
    clonePowers,
    powerKey,
    powersFromKey,
    multiplyPowers,
    polynomial,
    monomial,
    normalizePolynomial,
    addPolynomial,
    scalePolynomial,
    multiplyPolynomial,
    powerPolynomial,
    polynomialKey,
    polynomialLatex,
    contentGcd,
    isPrimitiveFactor,
    hasCommonVariableFactor,
    factorPolynomial,
    expandFactorStructure,
    factorLatex,
    factorStructureLatex,
    slotDefinitions,
    canonicalValues,
    acceptedCanonicalVectors,
    bestSlotAlignment,
    validateCoefficientResponse,
    makeSchema,
    gcd
  });

  root.MCLFactoringMath = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
