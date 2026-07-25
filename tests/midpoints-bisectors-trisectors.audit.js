const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = { console, globalThis: {}, Math, Date };
context.window = context.globalThis;
context.window.MCLQuizTool = {};
context.window.localStorage = { getItem: () => null };
vm.createContext(context);

for (const file of ["question-template-registry.js", "midpoints-bisectors-trisectors-bank.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "assets", "js", file), "utf8"), context, { filename: file });
}

const registry = context.window.MCLQuestionTemplates;
const tool = registry.getTool("midpoints-bisectors-trisectors");
const expectedTopologies = new Set(["segment", "triangle", "rectangle", "square", "parallelogram", "trapezoid", "circle"]);
if (!tool || tool.templates.length !== 105) throw new Error("Expected exactly 105 geometry templates.");

const byConcept = new Map();
const polygonArea = (polygon, points) => Math.abs(polygon.reduce((sum, id, index) => {
  const a = points[id], b = points[polygon[(index + 1) % polygon.length]];
  return sum + a.x * b.y - b.x * a.y;
}, 0) / 2);

for (const template of tool.templates) {
  if (!byConcept.has(template.conceptId)) byConcept.set(template.conceptId, new Set());
  for (let sample = 0; sample < 20; sample += 1) {
    const question = registry.build(tool.toolId, template.id, { seed: `${template.id}:${sample}` });
    const scene = question.visual;
    const topology = question.parameters?.topology;
    if (!expectedTopologies.has(topology) || scene.topology !== topology) throw new Error(`${template.id} has invalid topology metadata.`);
    if (template.conceptId === "segment-bisectors" && question.interaction?.kind === "target") {
      const targetKeys=question.interaction.targets.map(target=>target.key);
      if (targetKeys.length < 4 || targetKeys.includes("AB")) throw new Error(`${template.id} has a trivial bisector target set.`);
      const midpoint=scene.points.M;
      for (const key of targetKeys) {
        const segment=scene.segments.find(item=>item.id===key);
        if (!segment) throw new Error(`${template.id} target ${key} is not drawn.`);
        const first=scene.points[segment.a],second=scene.points[segment.b];
        const distance=Math.abs((second.x-first.x)*(first.y-midpoint.y)-(first.x-midpoint.x)*(second.y-first.y))/(Math.hypot(second.x-first.x,second.y-first.y)||1);
        if (key === question.interaction.correctKey && distance > 1) throw new Error(`${template.id} correct candidate misses the midpoint.`);
        if (key !== question.interaction.correctKey && distance < 8) throw new Error(`${template.id} distractor ${key} also passes through the midpoint.`);
      }
    }
    for (const option of question.distractors || []) {
      if (/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(String(option))) throw new Error(`${template.id} contains an unformatted prose option: ${option}`);
    }
    byConcept.get(template.conceptId).add(topology);
    for (const [id, point] of Object.entries(scene.points || {})) {
      if (point.x < 0 || point.x > 720 || point.y < 0 || point.y > 420) throw new Error(`${template.id} point ${id} is outside the viewBox.`);
    }
    for (const polygon of scene.polygons || []) {
      if (new Set(polygon.points).size !== polygon.points.length || polygonArea(polygon.points, scene.points) < 1000) throw new Error(`${template.id} has a degenerate polygon.`);
    }
    for (const circle of scene.circles || []) {
      const center = typeof circle.center === "string" ? scene.points[circle.center] : circle.center;
      if (!center || circle.radius <= 0 || center.x-circle.radius < 0 || center.x+circle.radius > 720 || center.y-circle.radius < 0 || center.y+circle.radius > 420) throw new Error(`${template.id} has a clipped circle.`);
    }
    for (const mark of (scene.marks || []).filter(item => item.type === "right")) {
      const v=scene.points[mark.vertex],a=scene.points[mark.a],b=scene.points[mark.b];
      const ax=a.x-v.x,ay=a.y-v.y,bx=b.x-v.x,by=b.y-v.y;
      const cosine=Math.abs(ax*bx+ay*by)/((Math.hypot(ax,ay)||1)*(Math.hypot(bx,by)||1));
      if (cosine > 0.01) throw new Error(`${template.id} displays a non-right right-angle mark.`);
    }
  }
}

for (const [concept, topologies] of byConcept) {
  if (topologies.size !== expectedTopologies.size) throw new Error(`${concept} covers only ${topologies.size} topologies.`);
}

const generation = registry.auditGeneration(tool.toolId, { samplesPerTemplate: 20, maxFailures: 20 });
if (!generation.valid) throw new Error(JSON.stringify(generation.failures.slice(0, 5), null, 2));
console.log(`Geometry topology audit passed: ${tool.templates.length * 20 + generation.generated} generated questions across 7 topologies.`);
