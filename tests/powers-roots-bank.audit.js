const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = { console, globalThis: {}, Math, Date };
context.window = context.globalThis;
context.window.MCLQuizTool = {};
vm.createContext(context);

for (const file of ["question-template-registry.js", "powers-roots-bank.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "assets", "js", file), "utf8"), context, { filename: file });
}

const registry = context.window.MCLQuestionTemplates;
const audit = registry.auditTool("powers-roots");
if (!audit.valid) throw new Error(audit.errors.join("\n"));

for (const template of registry.getTool("powers-roots").templates) {
  for (let sample = 0; sample < 40; sample += 1) {
    const question = registry.build("powers-roots", template.id, { seed: `${template.id}:${sample}`, lang: sample % 2 ? "zh" : "en" });
    const answer = registry.answerKey(question.answer);
    const distractors = new Set(question.distractors.map(registry.answerKey).filter(key => key && key !== answer));
    if (distractors.size < 5) throw new Error(`${template.id} sample ${sample} has only ${distractors.size} distractors.`);
  }
}

const generation = registry.auditGeneration("powers-roots", { samplesPerTemplate: 10, maxFailures: 20 });
if (!generation.valid) throw new Error(JSON.stringify(generation.failures.slice(0, 5), null, 2));
console.log(`Powers & Roots audit passed: ${105 * 40 + generation.generated} generated questions.`, audit.counts);
