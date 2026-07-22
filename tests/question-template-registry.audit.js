const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "question-template-registry.js"), "utf8");
const context = { console, globalThis: {} };
context.window = context.globalThis;
vm.createContext(context);
vm.runInContext(source, context);

const registry = context.globalThis.MCLQuestionTemplates;
if (!registry) throw new Error("Question template registry did not load.");

function expectThrow(fn, label) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(`Expected failure: ${label}`);
}

expectThrow(() => registry.registerTool({
  toolId: "metadata-only",
  concepts: [1, 2, 3, 4, 5].map(id => ({ id: `c${id}` })),
  templates: [{
    id: "fake", familyId: "fake", conceptId: "c1", difficulty: "easy", taskForm: "direct",
    inputRepresentation: "symbolic", outputKind: "number", reasoningPattern: "compute", constraintPattern: "basic",
    parameterPolicy: {}
  }]
}), "metadata-only template");

const concepts = [1, 2, 3, 4, 5].map(id => ({ id: `concept-${id}` }));
const difficulties = [
  ...Array(25).fill("easy"),
  ...Array(30).fill("medium"),
  ...Array(25).fill("hard"),
  ...Array(25).fill("expert")
];
const forms = registry.TASK_FORMS;
const templates = difficulties.map((difficulty, index) => {
  const familyIndex = index % 25;
  const conceptIndex = Math.floor(familyIndex / 5);
  const formIndex = familyIndex % 5;
  return {
    id: `template-${index + 1}`,
    familyId: `family-${familyIndex + 1}`,
    conceptId: concepts[conceptIndex].id,
    difficulty,
    taskForm: forms[formIndex],
    inputRepresentation: `representation-${Math.floor(index / 25)}`,
    outputKind: `output-${index % 7}`,
    reasoningPattern: `reasoning-${index % 11}`,
    constraintPattern: `constraint-${index}`,
    parameterPolicy: { integers: { min: -10, max: 10 }, exclude: [0] },
    build: ({ rng }) => ({ main: String(rng.int(1, 10)), answer: "1", distractors: ["2", "3", "4", "5", "6", "7"] }),
    validate: question => Boolean(question.main && question.answer)
  };
});

registry.registerTool({ toolId: "registry-fixture", version: "test", concepts, templates });
const audit = registry.auditTool("registry-fixture");
if (!audit.valid) throw new Error(audit.errors.join("\n"));
if (audit.templateCount !== 105 || audit.semanticFamilyCount !== 25) throw new Error("Registry counts are incorrect.");

const first = registry.build("registry-fixture", "template-1", { seed: "repeatable" });
const second = registry.build("registry-fixture", "template-1", { seed: "repeatable" });
if (first.main !== second.main || first.seed !== second.seed) throw new Error("Seeded generation is not deterministic.");
if (!first.templateId || !first.familyId || !first.conceptId) throw new Error("Question provenance is missing.");
const generationAudit = registry.auditGeneration("registry-fixture", { samplesPerTemplate: 2 });
if (!generationAudit.valid || generationAudit.generated !== 210) throw new Error("Generation audit failed.");

console.log("question-template-registry audit passed", audit, generationAudit.generated);
