"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bankFiles = {
  "arithmetic-within-10":"assets/js/arithmetic-banks.js","arithmetic-within-100":"assets/js/arithmetic-banks.js","arithmetic-within-1000":"assets/js/arithmetic-banks.js",
  "powers-roots":"assets/js/powers-roots-bank.js","gcd-lcm":"assets/js/gcd-lcm-bank.js","set-theory-basics":"assets/js/set-theory-basics-bank.js","fraction-percent":"assets/js/fraction-percent-bank.js","exponent-laws":"assets/js/exponent-laws-bank.js",
  "algebra-expression":"assets/js/algebra-expression-bank.js","algebra-simplification":"assets/js/algebra-simplification-bank.js","linear-equation":"assets/js/linear-equation-bank.js","linear-inequalities":"assets/js/linear-inequalities-bank.js",
  "systems-linear-equations":"assets/js/systems-linear-equations-bank.js","slope-from-two-points":"assets/js/slope-from-two-points-bank.js","function-evaluation":"assets/js/function-evaluation-bank.js","factoring-practice":"assets/js/factoring-practice-bank.js",
  "polynomial-multiplication":"assets/js/polynomial-multiplication-bank.js","completing-the-square":"assets/js/completing-the-square-bank.js","quadratic-functions":"assets/js/quadratic-functions-bank.js","special-products":"assets/js/special-products-bank.js",
  "exponential-functions":"assets/js/exponential-functions-bank.js","logarithmic-functions":"assets/js/logarithmic-functions-bank.js","radical-functions":"assets/js/radical-functions-bank.js","advanced-equation-solving":"assets/js/advanced-equation-solving-bank.js",
  "quadratic-formula":"assets/js/quadratic-formula-bank.js","complex-number-operations":"assets/js/complex-number-operations-bank.js","function-graph-matching":"assets/js/function-graph-matching-bank.js","unit-circle-trigonometry":"assets/js/unit-circle-trigonometry-bank.js",
  "geometry-formula":"assets/js/geometry-formula-bank.js","midpoints-bisectors-trisectors":"assets/js/midpoints-bisectors-trisectors-bank.js","triangle-congruence":"assets/js/triangle-congruence-bank.js","limits-practice":"assets/js/limits-practice-bank.js","derivative-practice":"assets/js/derivative-practice-bank.js","integration-practice":"assets/js/integration-practice-bank.js",
  "vector-operations":"assets/js/linear-algebra-question-banks.js","matrix-multiplication":"assets/js/linear-algebra-question-banks.js","determinant-practice":"assets/js/linear-algebra-question-banks.js"
};

function load(file){vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});}
function semanticShape(value){
  return String(value||"")
    .toLowerCase()
    .replace(/\\text\{([^}]*)\}/g,"$1")
    .replace(/-?\d+(?:\.\d+)?/g,"#")
    .replace(/[a-z]\d+/g,match=>match[0])
    .replace(/\s+/g,"")
    .replace(/[{}]/g,"")
    .slice(0,500);
}
function dominantCount(items){const counts=new Map();items.forEach(x=>counts.set(x,(counts.get(x)||0)+1));return Math.max(0,...counts.values());}

global.window=global;
global.MCLQuizTool={};
load("assets/js/question-bank-specs.js");
load("assets/js/question-template-registry.js");
load("assets/js/semantic-bank-factory.js");

const rows=[];
let failed=false;
for(const spec of MCLQuestionBankSpecs.all()){
  global.MCLQuizTool={};
  if(spec.toolId==="complex-number-operations"&&!global.MCLComplexMath)load("assets/js/complex-number-operations.js");
  if(spec.toolId==="unit-circle-trigonometry"&&!global.MCLUnitCircleMath){global.localStorage={getItem:()=>null};global.document={documentElement:{dataset:{}}};load("assets/js/unit-circle-trigonometry.js");}
  if(!MCLQuestionTemplates.getTool(spec.toolId))load(bankFiles[spec.toolId]);
  const tool=MCLQuestionTemplates.getTool(spec.toolId);
  const families=new Map();
  tool.templates.forEach(template=>{if(!families.has(template.familyId))families.set(template.familyId,template);});
  const fingerprints=[],generatorIds=[],fallbackArtifacts=[],fingerprintFamilies=new Map();
  for(const [familyId,template] of families){
    const question=MCLQuestionTemplates.build(spec.toolId,template.id,{seed:`semantic:${spec.toolId}:${familyId}`,audit:true,lang:"en"});
    const generatorId=question.audit?.generatorId||"";
    if(generatorId)generatorIds.push(generatorId);
    const solutionShape=(question.lines||[]).map(item=>`${item.note||item.noteKey||""}:${item.line||""}`).join("|");
    const fingerprint=generatorId?`generator:${generatorId}`:semanticShape(`${question.prompt||""}|${question.main||question.plain||""}|answer:${keyForAudit(question.answer)}|${solutionShape}`);
    fingerprints.push(fingerprint);
    if(!fingerprintFamilies.has(fingerprint))fingerprintFamilies.set(fingerprint,[]);
    fingerprintFamilies.get(fingerprint).push(familyId);
    if(/alternative\s+\d|^[a-z0-9-]+:\s*(direct|inverse|interpret|translate|diagnose)$/i.test(String(question.prompt||"")))fallbackArtifacts.push(familyId);
  }
  const uniqueFingerprints=new Set(fingerprints).size;
  const uniqueGeneratorIds=new Set(generatorIds).size;
  const dominant=dominantCount(fingerprints);
  const errors=[];
  if(families.size!==25)errors.push(`expected 25 families, found ${families.size}`);
  if(uniqueFingerprints<20)errors.push(`only ${uniqueFingerprints} semantic fingerprints`);
  if(dominant>2){
    const collisions=[...fingerprintFamilies.values()].filter(group=>group.length>2).map(group=>group.join(", "));
    errors.push(`one semantic fingerprint is shared by ${dominant} families: ${collisions.join(" | ")}`);
  }
  if(generatorIds.length&&uniqueGeneratorIds!==generatorIds.length)errors.push(`duplicate explicit generator IDs (${uniqueGeneratorIds}/${generatorIds.length})`);
  if(fallbackArtifacts.length)errors.push(`adapter/fallback prompts remain in ${fallbackArtifacts.join(", ")}`);
  const status=errors.length?"failed":"ready";
  rows.push({toolId:spec.toolId,status,families:families.size,semanticShapes:uniqueFingerprints,explicitIds:`${uniqueGeneratorIds}/${generatorIds.length}`,dominant});
  if(errors.length){failed=true;console.error(`\n${spec.toolId}:\n- ${errors.join("\n- ")}`);}
}
console.table(rows);
console.log(`\nSemantic diversity coverage: ${rows.filter(r=>r.status==="ready").length}/${rows.length} tools ready.`);
if(failed)process.exitCode=1;

function keyForAudit(value){
  if(value&&typeof value==="object")return value.key||value.latex||value.text||"";
  return value;
}
