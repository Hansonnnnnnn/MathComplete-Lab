(function (root) {
  "use strict";

  const math = root.MCLFactoringMath;
  if (!math) return;

  const copy = {
    en: {
      htmlLang: "en",
      title: "Factoring Practice",
      toolBadge: "Algebra I",
      subtitle: "Factor integer polynomials completely, complete structured factors, and diagnose the first error in a solution.",
      note: "Answers are factored over the integers. Coefficient-fill questions accept equivalent factor order and valid sign redistribution.",
      questionTitle: "Factor the expression completely.",
      difficultyOptions: {
        easy: "Easy: GCFs and monic trinomials",
        medium: "Medium: trinomials and special products",
        hard: "Hard: AC factoring, grouping, and cube identities",
        expert: "Expert: substitution and multi-step factorization",
        mixed: "Mixed: balanced factoring practice"
      }
    },
    zh: {
      htmlLang: "zh-CN",
      title: "\u56e0\u5f0f\u5206\u89e3\u4e13\u9879\u7ec3\u4e60",
      toolBadge: "\u4ee3\u6570 I",
      subtitle: "\u5728\u6574\u6570\u8303\u56f4\u5185\u5b8c\u5168\u56e0\u5f0f\u5206\u89e3\uff0c\u8865\u5168\u7ed3\u6784\u5316\u56e0\u5f0f\uff0c\u5e76\u627e\u51fa\u89e3\u9898\u8fc7\u7a0b\u4e2d\u7684\u7b2c\u4e00\u4e2a\u9519\u8bef\u3002",
      note: "\u7b54\u6848\u5728\u6574\u6570\u8303\u56f4\u5185\u5206\u89e3\u3002\u7cfb\u6570\u586b\u7a7a\u9898\u5141\u8bb8\u4ea4\u6362\u56e0\u5f0f\u987a\u5e8f\u4ee5\u53ca\u7b49\u4ef7\u7684\u8d1f\u53f7\u8f6c\u79fb\u3002",
      questionTitle: "\u5c06\u4ee3\u6570\u5f0f\u5b8c\u5168\u56e0\u5f0f\u5206\u89e3\u3002",
      difficultyOptions: {
        easy: "\u7b80\u5355\uff1a\u6700\u5927\u516c\u56e0\u5f0f\u4e0e\u9996\u4e00\u4e09\u9879\u5f0f",
        medium: "\u4e2d\u7b49\uff1a\u4e09\u9879\u5f0f\u4e0e\u7279\u6b8a\u4e58\u6cd5\u7ed3\u6784",
        hard: "\u56f0\u96be\uff1aAC \u6cd5\u3001\u5206\u7ec4\u4e0e\u7acb\u65b9\u516c\u5f0f",
        expert: "\u4e13\u5bb6\uff1a\u6362\u5143\u4e0e\u591a\u6b65\u5b8c\u5168\u5206\u89e3",
        mixed: "\u6df7\u5408\uff1a\u5747\u8861\u56e0\u5f0f\u5206\u89e3\u7ec3\u4e60"
      }
    }
  };

  function language() {
    return root.localStorage?.getItem?.("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function text() {
    return language() === "zh" ? {
      instruction: "\u5728\u6bcf\u4e2a\u7a7a\u683c\u4e2d\u8f93\u5165\u5e26\u7b26\u53f7\u7684\u6574\u6570\u7cfb\u6570\u3002\u7cfb\u6570 1 \u548c -1 \u4e5f\u5fc5\u987b\u8f93\u5165\u3002",
      preview: "\u89c4\u8303\u5316\u9884\u89c8",
      submit: "\u63d0\u4ea4\u7b54\u6848",
      required: "\u8bf7\u5148\u5728\u6bcf\u4e2a\u7a7a\u683c\u4e2d\u8f93\u5165\u975e\u96f6\u6574\u6570\u3002",
      slot: index => `\u7b2c ${index} \u4e2a\u7cfb\u6570`,
      yourTuple: "\u4f60\u8f93\u5165\u7684\u7cfb\u6570",
      canonical: "\u4e00\u4e2a\u89c4\u8303\u7b54\u6848"
    } : {
      instruction: "Enter a signed integer in every coefficient box. Coefficients 1 and -1 must be entered explicitly.",
      preview: "Normalized preview",
      submit: "Submit answer",
      required: "Enter a nonzero integer in every coefficient box first.",
      slot: index => `Coefficient ${index}`,
      yourTuple: "Your coefficient tuple",
      canonical: "One canonical answer"
    };
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character]));
  }

  function renderMath(element, latex, displayMode = false) {
    try {
      root.katex.render(String(latex || ""), element, { throwOnError: false, displayMode });
    } catch {
      element.textContent = String(latex || "");
    }
  }

  function variableHtml(powers) {
    return Object.entries(powers || {}).map(([variable, exponent]) => `${escapeHtml(variable)}${Number(exponent) === 1 ? "" : `<sup>${Number(exponent)}</sup>`}`).join("");
  }

  function factorEditorHtml(factor, slots, isOutside = false) {
    const terms = factor.terms || [];
    const content = terms.map((term, index) => {
      const slot = slots.find(item => item.id === term.slot);
      const operator = index ? `<span class="mcl-factor-slot-operator" data-operator-for="${escapeHtml(term.slot)}">+</span>` : "";
      return `${operator}<span class="mcl-factor-slot-wrap" data-factor-slot-wrap="${escapeHtml(term.slot)}"><input class="mcl-factor-slot" data-factor-slot="${escapeHtml(term.slot)}" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(text().slot(slot.index))}"><span class="mcl-factor-slot-variable">${variableHtml(term.powers)}</span></span>`;
    }).join("");
    const grouped = terms.length > 1 ? `<span class="mcl-factor-paren">(</span>${content}<span class="mcl-factor-paren">)</span>` : content;
    const power = (factor.exponent || 1) > 1 ? `<sup class="mcl-factor-fixed-power">${Number(factor.exponent)}</sup>` : "";
    return `<span class="mcl-factor-edit-group${isOutside ? " is-outside" : ""}" data-factor-id="${escapeHtml(factor.id)}">${grouped}${power}</span>`;
  }

  const interactions = {
    mount(container, question, context) {
      const schema = question.interaction.schema;
      const slots = math.slotDefinitions(schema).map((slot, index) => ({ ...slot, index: index + 1 }));
      const values = {};
      let locked = false;
      let lastValidation = null;
      const editor = [schema.outside ? factorEditorHtml(schema.outside, slots, true) : "", ...(schema.factors || []).map(factor => factorEditorHtml(factor, slots))].join("");
      container.innerHTML = `<div class="mcl-factor-fill" data-interaction-kind="coefficient-fill">
        <p class="mcl-factor-fill-instruction">${escapeHtml(text().instruction)}</p>
        <div class="mcl-factor-equation" role="group" aria-label="${escapeHtml(text().instruction)}"><span class="mcl-factor-editor">${editor}</span></div>
        <div class="mcl-factor-preview"><span>${escapeHtml(text().preview)}</span><div class="mcl-factor-preview-math"></div></div>
        <p class="mcl-factor-required" hidden>${escapeHtml(text().required)}</p>
        <button class="mcl-factor-submit" type="button" disabled>${escapeHtml(text().submit)}</button>
      </div>`;
      const preview = container.querySelector(".mcl-factor-preview-math");
      const submit = container.querySelector(".mcl-factor-submit");
      const required = container.querySelector(".mcl-factor-required");
      const response = () => {
        const complete = slots.every(slot => /^-?\d+$/.test(String(values[slot.id] ?? "")) && Number(values[slot.id]) !== 0);
        if (!complete) return null;
        lastValidation = math.validateCoefficientResponse(question, { values });
        const ordered = slots.map(slot => Number(values[slot.id]));
        return {
          key: lastValidation.expandedKey,
          display: lastValidation.studentFactorLatex,
          values: { ...lastValidation.values },
          tuple: ordered,
          validation: lastValidation,
          studentFactorLatex: lastValidation.studentFactorLatex
        };
      };

      const update = () => {
        slots.forEach(slot => {
          const input = container.querySelector(`[data-factor-slot="${slot.id}"]`);
          const operator = container.querySelector(`[data-operator-for="${slot.id}"]`);
          const raw = String(input.value || "").trim();
          values[slot.id] = raw;
          input.classList.toggle("is-invalid", Boolean(raw) && !/^-?\d+$/.test(raw));
          if (operator) operator.textContent = /^-\d+$/.test(raw) ? "" : "+";
        });
        const numericValues = Object.fromEntries(slots.map(slot => [slot.id, /^-?\d+$/.test(String(values[slot.id])) ? Number(values[slot.id]) : NaN]));
        renderMath(preview, math.factorStructureLatex(schema, numericValues));
        submit.disabled = !response();
        required.hidden = true;
      };

      container.querySelectorAll(".mcl-factor-slot").forEach(input => {
        input.addEventListener("input", update);
        input.addEventListener("keydown", event => {
          if (event.key === "Enter" && !submit.disabled) context.submit();
        });
      });
      submit.addEventListener("click", context.submit);
      update();

      return {
        readResponse: response,
        showRequired: () => { required.hidden = false; },
        lock: () => {
          locked = true;
          container.querySelectorAll("input,button").forEach(element => { element.disabled = true; });
        },
        reveal: () => {
          if (root.MCLToolModes?.getMode?.() === "exam" || document.body.classList.contains("mcl-tool-exam")) return;
          const validation = lastValidation || math.validateCoefficientResponse(question, { values });
          slots.forEach(slot => {
            const input = container.querySelector(`[data-factor-slot="${slot.id}"]`);
            input.classList.add(validation.slotFeedback?.[slot.id] ? "is-correct" : "is-wrong");
          });
        },
        snapshot: () => ({ values: { ...values }, validation: lastValidation, locked })
      };
    },
    isCorrect(response, question) {
      const validation = response?.validation || math.validateCoefficientResponse(question, response);
      return Boolean(validation.correct);
    },
    reportOptions() {
      return [];
    },
    reportData(question, response) {
      const validation = response?.validation || math.validateCoefficientResponse(question, response || {});
      const schema = question.interaction?.schema;
      return {
        parameters: {
          interactionKind: "coefficient-fill",
          slotDefinitions: math.slotDefinitions(schema),
          studentCoefficients: validation.values || response?.values || {},
          studentFactorLatex: validation.studentFactorLatex || response?.display || "",
          canonicalAnswerCoefficients: math.canonicalValues(schema),
          canonicalAnswerLatex: math.factorStructureLatex(schema),
          acceptedByExpansion: Boolean(validation.correct),
          slotFeedback: validation.slotFeedback || {},
          validationReason: validation.reason || ""
        }
      };
    }
  };

  root.MCLFactoringInteractions = Object.freeze(interactions);
  root.MCLQuizTool = {
    gameId: "factoring-practice",
    course: "algebra-1",
    balancedMixed: true,
    avoidConsecutiveTypes: true,
    builders: { easy: [], medium: [], hard: [], expert: [] },
    text: copy,
    interactionAdapter: interactions,
    validateSequenceCandidate(question, previous) {
      const recent = previous.slice(-3);
      if (recent.some(item => item.templateId && item.templateId === question.templateId)) return false;
      const last = recent.at(-1);
      if (last && last.parameters?.contentArea === question.parameters?.contentArea && last.parameters?.interactionKind === question.parameters?.interactionKind) return false;
      return true;
    },
    validateQuestion(question) {
      if (question.interaction?.kind === "coefficient-fill") return Boolean(question.interaction.schema && question.parameters?.targetPolynomialKey);
      return Array.isArray(question.options) && [4, 5, 6].includes(question.options.length);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
