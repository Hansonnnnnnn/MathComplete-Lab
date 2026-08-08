(function (root) {
  "use strict";

  const CORE_DIFFICULTIES = ["easy", "medium", "hard", "expert"];
  const TASK_FORMS = ["direct", "inverse", "interpret", "translate", "diagnose"];
  const DIFFICULTY_QUOTAS = Object.freeze({ easy: 25, medium: 30, hard: 25, expert: 25 });
  const tools = new Map();

  function assert(condition, message) {
    if (!condition) throw new Error(`[MCLQuestionTemplates] ${message}`);
  }

  function stableString(value) {
    if (Array.isArray(value)) return `[${value.map(stableString).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map(key => `${key}:${stableString(value[key])}`).join(",")}}`;
    }
    return String(value ?? "");
  }

  function seedNumber(value) {
    const text = String(value ?? Date.now());
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0 || 1;
  }

  function createRng(seed) {
    let state = seedNumber(seed);
    function next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    }
    return Object.freeze({
      seed: seedNumber(seed),
      float: next,
      int(min, max) {
        const low = Math.ceil(Math.min(min, max));
        const high = Math.floor(Math.max(min, max));
        return low + Math.floor(next() * (high - low + 1));
      },
      bool(probability = 0.5) {
        return next() < probability;
      },
      choice(items) {
        assert(Array.isArray(items) && items.length, "Cannot choose from an empty list.");
        return items[Math.floor(next() * items.length)];
      },
      shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(next() * (index + 1));
          [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
      },
      fork(label) {
        return createRng(`${state}:${label}`);
      }
    });
  }

  function familySignature(template) {
    return `${template.conceptId}|${template.taskForm}`;
  }

  function templateSignature(template) {
    return [
      familySignature(template),
      template.inputRepresentation,
      template.outputKind,
      template.reasoningPattern,
      template.constraintPattern
    ].join("|");
  }

  function normalizeTemplate(raw, conceptIds) {
    const template = { ...raw };
    const requiredText = [
      "id", "familyId", "conceptId", "difficulty", "taskForm",
      "inputRepresentation", "outputKind", "reasoningPattern", "constraintPattern"
    ];
    requiredText.forEach(key => assert(typeof template[key] === "string" && template[key].trim(), `Template is missing ${key}.`));
    assert(conceptIds.has(template.conceptId), `Unknown concept ${template.conceptId} in ${template.id}.`);
    assert(CORE_DIFFICULTIES.includes(template.difficulty) || template.difficulty === "hell", `Invalid difficulty in ${template.id}.`);
    assert(TASK_FORMS.includes(template.taskForm), `Invalid task form in ${template.id}.`);
    assert(template.parameterPolicy && typeof template.parameterPolicy === "object", `Template ${template.id} needs a parameter policy.`);
    assert(typeof template.build === "function", `Template ${template.id} needs an executable build function.`);
    assert(typeof template.validate === "function", `Template ${template.id} needs an executable validator.`);
    template.familySignature = familySignature(template);
    template.templateSignature = templateSignature(template);
    return Object.freeze(template);
  }

  function registerTool(definition) {
    assert(definition && typeof definition === "object", "A tool definition is required.");
    assert(typeof definition.toolId === "string" && definition.toolId.trim(), "toolId is required.");
    assert(!tools.has(definition.toolId), `Tool ${definition.toolId} is already registered.`);
    assert(Array.isArray(definition.concepts) && definition.concepts.length === 5, `${definition.toolId} must define exactly five core concepts.`);

    const conceptIds = new Set();
    const concepts = definition.concepts.map(concept => {
      assert(concept && typeof concept.id === "string" && concept.id.trim(), `${definition.toolId} has an invalid concept.`);
      assert(!conceptIds.has(concept.id), `${definition.toolId} repeats concept ${concept.id}.`);
      conceptIds.add(concept.id);
      return Object.freeze({ ...concept });
    });

    const rawTemplates = [...(definition.templates || []), ...(definition.hellTemplates || [])];
    const templates = rawTemplates.map(item => normalizeTemplate(item, conceptIds));
    const ids = new Set();
    const signatures = new Set();
    templates.forEach(template => {
      assert(!ids.has(template.id), `${definition.toolId} repeats template id ${template.id}.`);
      assert(!signatures.has(template.templateSignature), `${definition.toolId} repeats structural template ${template.templateSignature}.`);
      ids.add(template.id);
      signatures.add(template.templateSignature);
    });

    const record = Object.freeze({
      toolId: definition.toolId,
      version: String(definition.version || "1"),
      concepts: Object.freeze(concepts),
      templates: Object.freeze(templates.filter(item => item.difficulty !== "hell")),
      hellTemplates: Object.freeze(templates.filter(item => item.difficulty === "hell")),
      byId: new Map(templates.map(template => [template.id, template]))
    });
    tools.set(record.toolId, record);
    return record;
  }

  function getTool(toolId) {
    return tools.get(toolId) || null;
  }

  function build(toolId, templateId, options = {}) {
    const tool = getTool(toolId);
    assert(tool, `Unknown tool ${toolId}.`);
    const template = tool.byId.get(templateId);
    assert(template, `Unknown template ${templateId} for ${toolId}.`);
    const seed = options.seed ?? `${toolId}:${templateId}:${Date.now()}:${Math.random()}`;
    const rng = createRng(seed);
    const context = Object.freeze({ ...options, seed: rng.seed, rng, template, tool });
    const question = template.build(context);
    assert(question && typeof question === "object", `${template.id} did not build a question object.`);
    const validation = template.validate(question, context);
    assert(validation === true || validation?.valid === true, `${template.id} generated an invalid question${validation?.reason ? `: ${validation.reason}` : "."}`);
    return {
      ...question,
      type: question.type || template.familyId,
      familyId: template.familyId,
      conceptId: template.conceptId,
      templateId: template.id,
      templateVersion: tool.version,
      seed: rng.seed,
      parameters: question.parameters || null
    };
  }

  function templatesFor(toolId, difficulty, forcedFamilyId = null) {
    const tool = getTool(toolId);
    if (!tool) return [];
    const source = difficulty === "hell" ? tool.hellTemplates : tool.templates;
    return source.filter(template => {
      const difficultyMatches = difficulty === "mixed" || template.difficulty === difficulty;
      const familyMatches = !forcedFamilyId || template.familyId === forcedFamilyId;
      return difficultyMatches && familyMatches;
    });
  }

  function answerKey(value) {
    const raw = value && typeof value === "object" ? (value.key || value.latex || value.text || "") : value;
    return String(raw ?? "")
      .replace(/\s+/g, "")
      .replaceAll("\\left", "")
      .replaceAll("\\right", "")
      .replaceAll("\\cdot", "*")
      .toLowerCase();
  }

  function findLeakedLatexCommand(question) {
    const fields = [
      question.main,
      question.answer,
      ...(question.distractors || []),
      ...(question.lines || []).map(item => item?.line)
    ];
    const leakedCommand = /(^|[^\\A-Za-z])(quad|qquad|cdot|dfrac|operatorname|mathcal|subseteq|nsubseteq|notin|langle|rangle|mathbf)(?=$|[^A-Za-z])/i;
    for (const field of fields) {
      const value = field && typeof field === "object"
        ? (field.latex || field.text || field.value || "")
        : String(field ?? "");
      const control = value.match(/[\u0008\u0009\u000b\u000c]/);
      if (control) return `control character U+${control[0].charCodeAt(0).toString(16).padStart(4, "0")}`;
      const match = value.match(leakedCommand);
      if (match) return `bare LaTeX command ${match[2]}`;
    }
    return "";
  }

  function auditGeneration(toolId, options = {}) {
    const tool = getTool(toolId);
    assert(tool, `Unknown tool ${toolId}.`);
    const samplesPerTemplate = Math.max(1, Number(options.samplesPerTemplate || 20));
    const includeHell = Boolean(options.includeHell);
    const templates = includeHell ? [...tool.templates, ...tool.hellTemplates] : tool.templates;
    const failures = [];
    let generated = 0;

    templates.forEach(template => {
      for (let sample = 0; sample < samplesPerTemplate; sample += 1) {
        const seed = `${toolId}:${template.id}:audit:${sample}`;
        try {
          const first = build(toolId, template.id, { seed, audit: true });
          const second = build(toolId, template.id, { seed, audit: true });
          generated += 1;
          if (!String(first.main ?? first.plain ?? "").trim()) throw new Error("missing question text");
          const leakedLatex = findLeakedLatexCommand(first);
          if (leakedLatex) throw new Error(leakedLatex);
          const correctKey = answerKey(first.answer);
          if (!correctKey) throw new Error("missing answer");
          const distractorKeys = (first.distractors || []).map(answerKey).filter(Boolean);
          const uniqueDistractors = new Set(distractorKeys.filter(key => key !== correctKey));
          if (!first.interaction && uniqueDistractors.size < 5) throw new Error(`only ${uniqueDistractors.size} unique distractors; 5 required for six-choice mode`);
          const snapshot = stableString({
            main: first.main,
            plain: first.plain,
            answer: first.answer,
            distractors: first.distractors,
            parameters: first.parameters
          });
          const repeated = stableString({
            main: second.main,
            plain: second.plain,
            answer: second.answer,
            distractors: second.distractors,
            parameters: second.parameters
          });
          if (snapshot !== repeated) throw new Error("same seed produced different output");
        } catch (error) {
          failures.push({ templateId: template.id, sample, seed, reason: String(error?.message || error) });
          if (failures.length >= Number(options.maxFailures || 100)) return;
        }
      }
    });

    return Object.freeze({
      toolId,
      valid: failures.length === 0,
      generated,
      samplesPerTemplate,
      failures: Object.freeze(failures)
    });
  }

  function auditTool(toolId) {
    const tool = getTool(toolId);
    assert(tool, `Unknown tool ${toolId}.`);
    const counts = Object.fromEntries(CORE_DIFFICULTIES.map(level => [level, 0]));
    const familySignatures = new Set();
    const families = new Map();
    const errors = [];

    tool.templates.forEach(template => {
      counts[template.difficulty] += 1;
      familySignatures.add(template.familySignature);
      if (!families.has(template.familyId)) families.set(template.familyId, new Set());
      families.get(template.familyId).add(template.familySignature);
    });
    Object.entries(DIFFICULTY_QUOTAS).forEach(([level, quota]) => {
      if (counts[level] < quota) errors.push(`${level} has ${counts[level]} templates; ${quota} required.`);
    });
    if (tool.templates.length < 105) errors.push(`Tool has ${tool.templates.length} core templates; 105 required.`);
    if (families.size < 25) errors.push(`Tool has ${families.size} family IDs; 25 required.`);
    if (familySignatures.size < 25) errors.push(`Tool has ${familySignatures.size} semantic families; 25 required.`);
    families.forEach((signatures, familyId) => {
      if (signatures.size !== 1) errors.push(`Family ${familyId} maps to multiple semantic signatures.`);
    });

    return Object.freeze({
      toolId,
      valid: errors.length === 0,
      errors: Object.freeze(errors),
      counts: Object.freeze(counts),
      templateCount: tool.templates.length,
      familyCount: families.size,
      semanticFamilyCount: familySignatures.size,
      hellTemplateCount: tool.hellTemplates.length
    });
  }

  root.MCLQuestionTemplates = Object.freeze({
    CORE_DIFFICULTIES: Object.freeze([...CORE_DIFFICULTIES]),
    TASK_FORMS: Object.freeze([...TASK_FORMS]),
    DIFFICULTY_QUOTAS,
    createRng,
    familySignature,
    templateSignature,
    registerTool,
    getTool,
    getTools: () => [...tools.values()],
    templatesFor,
    build,
    auditTool,
    auditGeneration,
    answerKey,
    stableString
  });
})(typeof window !== "undefined" ? window : globalThis);
