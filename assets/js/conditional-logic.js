(function (root) {
  "use strict";

  const FORMS = Object.freeze(["conditional", "converse", "inverse", "contrapositive"]);
  const FORM_SYMBOLS = Object.freeze({
    conditional: "p\\to q",
    converse: "q\\to p",
    inverse: "\\neg p\\to\\neg q",
    contrapositive: "\\neg q\\to\\neg p"
  });

  const copy = {
    en: {
      htmlLang: "en",
      title: "Converse, Inverse & Contrapositive Practice",
      toolBadge: "Geometry I · Algebra I",
      subtitle: "Build precise conditional statements, transform them correctly, test truth, find counterexamples, and use necessary and sufficient conditions.",
      note: "Negations are generated from explicit mathematical meanings. The original statement is equivalent only to its contrapositive.",
      questionTitle: "Analyze the conditional statement and choose or build the correct response.",
      difficultyOptions: {
        easy: "Easy: hypotheses, conclusions, and direct transformations",
        medium: "Medium: converse, inverse, contrapositive, and precise negation",
        hard: "Hard: compound statements, counterexamples, and theorem direction",
        expert: "Expert: truth tables, quantifiers, biconditionals, and proof diagnosis",
        mixed: "Mixed: balanced conditional-logic practice"
      }
    },
    zh: {
      htmlLang: "zh-CN",
      title: "逆命题、否命题与逆否命题专项练习",
      toolBadge: "几何 I · 代数 I",
      subtitle: "练习精确表达条件命题，正确转换命题形式，判断真值、寻找反例，并理解充分条件与必要条件。",
      note: "所有否定均依据明确的数学含义生成。原命题只与它的逆否命题逻辑等价。",
      questionTitle: "分析条件命题，并选择或构建正确答案。",
      difficultyOptions: {
        easy: "简单：假设、结论与直接转换",
        medium: "中等：逆命题、否命题、逆否命题与精确否定",
        hard: "困难：复合命题、反例与定理方向",
        expert: "专家：真值表、量词、双条件与证明诊断",
        mixed: "混合：均衡条件命题逻辑练习"
      }
    }
  };

  function language() {
    return root.localStorage?.getItem?.("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function escapeLatexText(value) {
    return String(value ?? "")
      .replaceAll("\\", "\\textbackslash{}")
      .replaceAll("&", "\\&")
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_")
      .replaceAll("$", "\\$")
      .replaceAll("{", "\\{")
      .replaceAll("}", "\\}");
  }

  function makeClause(id, values) {
    return Object.freeze({
      id,
      domain: values.domain || "",
      positive: Object.freeze({ en: values.en, zh: values.zh, latex: values.latex || "" }),
      negative: Object.freeze({ en: values.notEn, zh: values.notZh, latex: values.notLatex || "" })
    });
  }

  function part(clause, negated = false, role = "") {
    return Object.freeze({ clause, negated: Boolean(negated), role });
  }

  function conditionalOf(p, q) { return Object.freeze({ form: "conditional", antecedent: part(p, false, "p"), consequent: part(q, false, "q") }); }
  function converseOf(p, q) { return Object.freeze({ form: "converse", antecedent: part(q, false, "q"), consequent: part(p, false, "p") }); }
  function inverseOf(p, q) { return Object.freeze({ form: "inverse", antecedent: part(p, true, "p"), consequent: part(q, true, "q") }); }
  function contrapositiveOf(p, q) { return Object.freeze({ form: "contrapositive", antecedent: part(q, true, "q"), consequent: part(p, true, "p") }); }
  function negateConditional(p, q) { return Object.freeze({ form: "negation", left: part(p, false, "p"), right: part(q, true, "q") }); }

  function formOf(name, p, q) {
    if (name === "converse") return converseOf(p, q);
    if (name === "inverse") return inverseOf(p, q);
    if (name === "contrapositive") return contrapositiveOf(p, q);
    return conditionalOf(p, q);
  }

  function partText(value, lang = language()) {
    const source = value.negated ? value.clause.negative : value.clause.positive;
    return source[lang] || source.en;
  }

  function partLatex(value, lang = language()) {
    const source = value.negated ? value.clause.negative : value.clause.positive;
    return source.latex || `\\text{${escapeLatexText(source[lang] || source.en)}}`;
  }

  function renderConditional(statement, lang = language()) {
    const ifWord = lang === "zh" ? "如果" : "If";
    const thenWord = lang === "zh" ? "那么" : "then";
    return `\\begin{gathered}\\text{${ifWord} }${partLatex(statement.antecedent, lang)}\\\\\\text{${thenWord} }${partLatex(statement.consequent, lang)}\\end{gathered}`;
  }

  function renderConditionalText(statement, lang = language()) {
    return lang === "zh"
      ? `如果${partText(statement.antecedent, lang)}，那么${partText(statement.consequent, lang)}。`
      : `If ${partText(statement.antecedent, lang)}, then ${partText(statement.consequent, lang)}.`;
  }

  function conditionalKey(statement) {
    if (statement.form === "negation") return `${statement.left.clause.id}:0&${statement.right.clause.id}:1`;
    return `${statement.antecedent.clause.id}:${statement.antecedent.negated ? 1 : 0}->${statement.consequent.clause.id}:${statement.consequent.negated ? 1 : 0}`;
  }

  function implication(a, b) { return !a || b; }
  function evaluateConditional(statement, pValue, qValue) {
    const read = item => {
      const raw = item.role === "p" ? pValue : item.role === "q" ? qValue : item.clause.id === "p" ? pValue : qValue;
      return item.negated ? !raw : Boolean(raw);
    };
    return implication(read(statement.antecedent), read(statement.consequent));
  }

  function truthOfForm(scenario, form) {
    return form === "conditional" || form === "contrapositive" ? Boolean(scenario.originalTruth) : Boolean(scenario.converseTruth);
  }

  const model = Object.freeze({
    FORMS,
    FORM_SYMBOLS,
    makeClause,
    conditionalOf,
    converseOf,
    inverseOf,
    contrapositiveOf,
    negateConditional,
    formOf,
    partText,
    partLatex,
    renderConditional,
    renderConditionalText,
    conditionalKey,
    evaluateConditional,
    truthOfForm,
    implication,
    escapeLatexText
  });

  const uiText = () => language() === "zh"
    ? { choose: "请完成所有部分。", select: "请选择", submit: "提交答案", clear: "清除", required: "请先完成所有部分。", sequenceEmpty: "按正确顺序点击下方内容", trueText: "真", falseText: "假", selected: "你的排列", correct: "正确排列" }
    : { choose: "Complete every part.", select: "Choose", submit: "Submit answer", clear: "Clear", required: "Complete every part first.", sequenceEmpty: "Select the parts below in the correct order", trueText: "True", falseText: "False", selected: "Your order", correct: "Correct order" };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  }

  function examMode() {
    return root.MCLToolModes?.getMode?.() === "exam" || document.body.classList.contains("mcl-tool-exam");
  }

  const interactions = {
    mount(container, question, context) {
      const spec = question.interaction || {}, text = uiText();
      let response = null;
      let locked = false;
      const values = {};
      const sequence = [];
      container.innerHTML = `<div class="mcl-logic-response"><p class="mcl-logic-instruction">${escapeHtml(spec.instruction || text.choose)}</p><div class="mcl-logic-grid"></div><p class="mcl-logic-required" hidden>${escapeHtml(text.required)}</p><div class="mcl-logic-actions"></div></div>`;
      const grid = container.querySelector(".mcl-logic-grid");
      const actions = container.querySelector(".mcl-logic-actions");
      const required = container.querySelector(".mcl-logic-required");

      const updateResponse = () => {
        if (spec.kind === "order") {
          response = sequence.length === (spec.tokens || []).length
            ? { key: sequence.join(">"), display: sequence.map(id => spec.tokens.find(token => token.id === id)?.label || id).join(" → "), sequence: [...sequence] }
            : null;
        } else if ((spec.rows || []).every(row => values[row.id] !== undefined && values[row.id] !== "")) {
          response = {
            key: (spec.rows || []).map(row => `${row.id}=${values[row.id]}`).join("|"),
            display: (spec.rows || []).map(row => `${row.label}: ${row.options?.find(option => option.key === values[row.id])?.label || values[row.id]}`).join("; "),
            values: { ...values }
          };
        } else response = null;
        required.hidden = true;
      };

      if (spec.kind === "order") {
        grid.innerHTML = `<div class="mcl-logic-sequence"><span class="mcl-logic-sequence-empty">${escapeHtml(text.sequenceEmpty)}</span></div><div class="mcl-logic-token-bank"></div>`;
        const sequenceRoot = grid.querySelector(".mcl-logic-sequence");
        const bank = grid.querySelector(".mcl-logic-token-bank");
        const renderSequence = () => {
          sequenceRoot.innerHTML = sequence.length
            ? sequence.map((id, index) => `<button type="button" class="mcl-logic-sequence-item" data-remove-index="${index}">${escapeHtml(spec.tokens.find(token => token.id === id)?.label || id)}</button>`).join("")
            : `<span class="mcl-logic-sequence-empty">${escapeHtml(text.sequenceEmpty)}</span>`;
          sequenceRoot.querySelectorAll("[data-remove-index]").forEach(button => button.addEventListener("click", () => {
            if (locked) return;
            sequence.splice(Number(button.dataset.removeIndex), 1);
            renderSequence();
            updateResponse();
          }));
          bank.querySelectorAll("[data-token-id]").forEach(button => button.classList.toggle("is-used", sequence.includes(button.dataset.tokenId)));
        };
        (spec.tokens || []).forEach(token => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "mcl-logic-token";
          button.dataset.tokenId = token.id;
          button.textContent = token.label;
          button.addEventListener("click", () => {
            if (locked || sequence.includes(token.id)) return;
            sequence.push(token.id);
            renderSequence();
            updateResponse();
          });
          bank.appendChild(button);
        });
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "mcl-logic-clear";
        clear.textContent = text.clear;
        clear.addEventListener("click", () => { if (!locked) { sequence.length = 0; renderSequence(); updateResponse(); } });
        actions.appendChild(clear);
      } else {
        (spec.rows || []).forEach(row => {
          const rowNode = document.createElement("div");
          rowNode.className = "mcl-logic-row";
          rowNode.dataset.logicRow = row.id;
          rowNode.innerHTML = `<span class="mcl-logic-row-label">${escapeHtml(row.label)}</span>`;
          if (spec.kind === "truth-table") {
            const controls = document.createElement("div");
            controls.className = "mcl-logic-truth-controls";
            [{ key:"T", label:text.trueText }, { key:"F", label:text.falseText }].forEach(option => {
              const button = document.createElement("button");
              button.type = "button";
              button.className = "mcl-logic-truth-button";
              button.dataset.truthValue = option.key;
              button.setAttribute("aria-pressed", "false");
              button.textContent = option.label;
              button.addEventListener("click", () => {
                if (locked) return;
                values[row.id] = option.key;
                controls.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
                updateResponse();
              });
              controls.appendChild(button);
            });
            rowNode.appendChild(controls);
          } else {
            const select = document.createElement("select");
            select.className = "mcl-logic-select";
            select.setAttribute("aria-label", row.label);
            select.innerHTML = `<option value="">${escapeHtml(text.select)}</option>${(row.options || []).map(option => `<option value="${escapeHtml(option.key)}">${escapeHtml(option.label)}</option>`).join("")}`;
            select.addEventListener("change", () => { if (!locked) { values[row.id] = select.value; updateResponse(); } });
            rowNode.appendChild(select);
          }
          grid.appendChild(rowNode);
        });
      }

      const submit = document.createElement("button");
      submit.type = "button";
      submit.className = "mcl-logic-submit";
      submit.textContent = text.submit;
      submit.addEventListener("click", context.submit);
      actions.appendChild(submit);

      return {
        readResponse: () => response,
        showRequired: () => { required.hidden = false; },
        lock: () => { locked = true; container.querySelectorAll("button,select").forEach(node => { node.disabled = true; }); },
        reveal: () => {
          if (examMode()) return;
          if (spec.kind === "order") return;
          (spec.rows || []).forEach(row => {
            const node = container.querySelector(`[data-logic-row="${CSS.escape(row.id)}"]`);
            node?.classList.add(values[row.id] === row.correct ? "is-correct" : "is-wrong");
          });
        },
        snapshot: () => ({ values: { ...values }, sequence: [...sequence] })
      };
    },
    isCorrect(response, question) {
      return String(response?.key || "") === String(question.interaction?.correctKey || "");
    },
    reportOptions(question, response) {
      const spec = question.interaction || {}, values = response?.values || {};
      if (spec.kind === "order") {
        const selected = response?.display || "";
        const correct = (spec.correctOrder || []).map(id => spec.tokens.find(token => token.id === id)?.label || id).join(" → ");
        return selected === correct
          ? [{ label:"1", latex:`\\text{${model.escapeLatexText(selected)}}`, key:selected, isCorrect:true, isSelected:true }]
          : [
              { label:"1", latex:`\\text{${model.escapeLatexText(selected)}}`, key:selected, isCorrect:false, isSelected:true },
              { label:"2", latex:`\\text{${model.escapeLatexText(correct)}}`, key:correct, isCorrect:true, isSelected:false }
            ];
      }
      return (spec.rows || []).map((row, index) => {
        const chosenKey = values[row.id] || "";
        const chosen = row.options?.find(option => option.key === chosenKey)?.label
          || (chosenKey === "T" ? uiText().trueText : chosenKey === "F" ? uiText().falseText : chosenKey || "-");
        const correct = row.options?.find(option => option.key === row.correct)?.label || (row.correct === "T" ? uiText().trueText : row.correct === "F" ? uiText().falseText : row.correct);
        return {
          label: String(index + 1),
          latex: `\\text{${model.escapeLatexText(`${row.label}: ${chosen}${chosenKey === row.correct ? "" : `; ${uiText().correct}: ${correct}`}`)}}`,
          key: `${row.id}=${chosen}`,
          isCorrect: chosenKey === row.correct,
          isSelected: true
        };
      });
    }
  };

  root.MCLConditionalLogic = model;
  root.MCLConditionalLogicInteractions = Object.freeze(interactions);
  root.MCLQuizTool = {
    gameId: "conditional-logic",
    course: "geometry-1",
    text: copy,
    builders: {},
    balancedMixed: true,
    avoidConsecutiveTypes: true,
    interactionAdapter: root.MCLConditionalLogicInteractions
  };
})(typeof window !== "undefined" ? window : globalThis);
