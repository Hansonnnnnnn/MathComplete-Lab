(function () {
  "use strict";

  const registry = window.MCLQuestionTemplates;
  if (!registry || !window.MCLQuizTool) return;

  const forms = registry.TASK_FORMS;
  const variants = ["number-sentence", "missing-box", "word-model", "reasoning-check"];
  const definitions = {
    "arithmetic-within-10": {
      course: "pre-algebra",
      limit: 10,
      concepts: ["addition", "subtraction", "multiplication", "division", "mixed-equality"]
    },
    "arithmetic-within-100": {
      course: "pre-algebra",
      limit: 100,
      concepts: ["mental-add-subtract", "multiply-divide", "place-value", "estimate-compare", "two-step-models"]
    },
    "arithmetic-within-1000": {
      course: "pre-algebra",
      limit: 1000,
      concepts: ["multi-digit-add-subtract", "multiplication", "division-remainders", "place-value-estimation", "multi-step-models"]
    }
  };

  const key = value => registry.answerKey(value);
  const text = value => `\\text{${String(value)}}`;
  const unique = values => [...new Map(values.map(value => [key(value), String(value)])).values()];
  const opNames = {
    en: { addition: "addition", subtraction: "subtraction", multiplication: "multiplication", division: "division" },
    zh: { addition: "\u52a0\u6cd5", subtraction: "\u51cf\u6cd5", multiplication: "\u4e58\u6cd5", division: "\u9664\u6cd5" }
  };

  function copy(lang) {
    return lang === "zh" ? {
      calculate: "\u8ba1\u7b97\u3002", missing: "\u6c42\u65b9\u6846\u4e2d\u7684\u6570\u3002", chooseOperation: "\u9009\u62e9\u6b63\u786e\u7684\u8fd0\u7b97\u3002",
      chooseEquation: "\u9009\u62e9\u4e0e\u60c5\u5883\u76f8\u7b26\u7684\u7b97\u5f0f\u3002", diagnose: "\u9009\u62e9\u6b63\u786e\u7684\u5224\u65ad\u3002", compare: "\u6bd4\u8f83\u4e24\u8fb9\u3002",
      operations: opNames.zh, comparisonOperation: "\u6bd4\u8f83", noOperation: "\u65e0\u9700\u8fd0\u7b97",
      ones: "\u4e2a", tens: "\u5341", hundreds: "\u767e", remainder: "\u4f59\u6570", trueLabel: "\u7b49\u5f0f\u6210\u7acb", falseLabel: "\u7b49\u5f0f\u4e0d\u6210\u7acb",
      addStory: (a,b) => `\u76d2\u5b50\u91cc\u6709 ${a} \u652f\u94c5\u7b14\uff0c\u53c8\u653e\u5165 ${b} \u652f\u3002\u73b0\u5728\u6709\u591a\u5c11\u652f\uff1f`,
      subtractStory: (a,b) => `\u6709 ${a} \u679a\u5fbd\u7ae0\uff0c\u9001\u51fa ${b} \u679a\u3002\u8fd8\u5269\u591a\u5c11\u679a\uff1f`,
      groupsStory: (a,b) => `\u6709 ${a} \u7ec4\uff0c\u6bcf\u7ec4 ${b} \u4e2a\u3002\u4e00\u5171\u6709\u591a\u5c11\u4e2a\uff1f`,
      shareStory: (a,b) => `\u628a ${a*b} \u4e2a\u7269\u54c1\u5e73\u5747\u5206\u7ed9 ${a} \u4eba\u3002\u6bcf\u4eba\u5f97\u5230\u591a\u5c11\u4e2a\uff1f`,
      explain: "\u6309\u4f4d\u503c\u3001\u8fd0\u7b97\u987a\u5e8f\u548c\u9006\u8fd0\u7b97\u68c0\u67e5\u3002"
    } : {
      calculate: "Calculate.", missing: "Find the number in the box.", chooseOperation: "Choose the operation that models the situation.",
      chooseEquation: "Choose the equation that matches the situation.", diagnose: "Choose the correct conclusion.", compare: "Compare the two sides.",
      operations: opNames.en, comparisonOperation: "comparison", noOperation: "no operation is needed",
      ones: "ones", tens: "tens", hundreds: "hundreds", remainder: "remainder", trueLabel: "the equation is true", falseLabel: "the equation is false",
      addStory: (a,b) => `A box has ${a} pencils and ${b} more are added. How many pencils are there now?`,
      subtractStory: (a,b) => `A collection has ${a} badges and ${b} are given away. How many remain?`,
      groupsStory: (a,b) => `There are ${a} groups with ${b} objects in each group. How many objects are there?`,
      shareStory: (a,b) => `${a*b} objects are shared equally among ${a} people. How many does each person receive?`,
      explain: "Check place value, operation order, and inverse operations."
    };
  }

  function numericDistractors(answer, extras, min, max) {
    const values = [...(extras || [])];
    const offsets = [1,-1,2,-2,5,-5,10,-10,20,-20,100,-100];
    offsets.forEach(offset => values.push(answer + offset));
    values.push(answer * 2, Math.floor(answer / 2), Math.abs(answer));
    for (let distance = 1; distance <= max - min && values.length < 40; distance += 1) {
      if (answer - distance >= min && answer - distance <= max) values.push(answer - distance);
      if (answer + distance >= min && answer + distance <= max) values.push(answer + distance);
    }
    return unique(values.filter(Number.isFinite).filter(value => Number.isInteger(value) && value >= min && value <= max).map(String))
      .filter(value => key(value) !== key(String(answer))).slice(0, 10);
  }

  function sameTypeDistractors(answer, candidates, fallbacks) {
    const values = [...(candidates || []), ...(fallbacks || [])];
    return unique(values).filter(value => key(value) !== key(answer)).slice(0, 10);
  }

  function make(main, answer, distractors, meta) {
    const numeric = /^-?\d+$/.test(String(answer).trim());
    const completed = numeric
      ? numericDistractors(Number(answer), distractors, meta.min ?? -1000, meta.max ?? 2000)
      : sameTypeDistractors(answer, distractors, meta.fallbackDistractors);
    return {
      main, plain: meta.plain || main, answer: String(answer), distractors: completed,
      prompt: meta.prompt, lines: meta.lines || [{ line: main, note: meta.note }, { line: String(answer), note: meta.final || "answer" }],
      suggestion: meta.suggestion, parameters: meta.parameters || null
    };
  }

  function basicOperation(op, task, rng, t, max, variant) {
    let a, b, answer, symbol, inverse;
    if (op === "addition") { a=rng.int(0,Math.max(2,Math.floor(max*.7))); b=rng.int(0,max-a); answer=a+b; symbol="+"; inverse=answer-a; }
    if (op === "subtraction") { a=rng.int(2,max); b=rng.int(0,a); answer=a-b; symbol="-"; inverse=a-answer; }
    if (op === "multiplication") { a=rng.int(1,Math.min(12,Math.max(2,Math.floor(Math.sqrt(max))))); b=rng.int(1,Math.max(2,Math.floor(max/a))); answer=a*b; symbol="\\times"; inverse=b; }
    if (op === "division") { b=rng.int(1,Math.min(12,Math.max(2,Math.floor(Math.sqrt(max))))); answer=rng.int(1,Math.max(2,Math.floor(max/b))); a=b*answer; symbol="\\div"; inverse=answer; }
    const names=t.operations;
    if(task==="direct") return make(`${a}${symbol}${b}`,answer,[a+b,a-b,a*b,b?Math.floor(a/b):a],{prompt:t.calculate,note:names[op],min:0,max,suggestion:t.explain,parameters:{a,b,op,variant}});
    if(task==="inverse") {
      const main=op==="addition"?`${a}+\\Box=${answer}`:op==="subtraction"?`${a}-\\Box=${answer}`:op==="multiplication"?`${a}\\times\\Box=${answer}`:`${a}\\div\\Box=${answer}`;
      const missing=op==="division"?b:inverse;
      return make(main,missing,[a,b,answer,Math.abs(a-b)],{prompt:t.missing,note:"inverse operation",min:0,max,suggestion:t.explain,parameters:{a,b,op,variant}});
    }
    const story=op==="addition"?t.addStory(a,b):op==="subtraction"?t.subtractStory(a,b):op==="multiplication"?t.groupsStory(a,b):t.shareStory(b,answer);
    if(task==="interpret") return make(text(story),text(names[op]),Object.keys(names).filter(x=>x!==op).map(x=>text(names[x])),{prompt:t.chooseOperation,note:"identify the operation",suggestion:t.explain,fallbackDistractors:[text(t.comparisonOperation),text(t.noOperation)],parameters:{a,b,op,variant}});
    const equation=`${a}${symbol}${b}=${answer}`;
    if(task==="translate") return make(text(story),equation,[`${a}+${b}=${answer}`,`${a}-${b}=${answer}`,`${a}\\times${b}=${answer}`,`${a}\\div${b}=${answer}`],{prompt:t.chooseEquation,note:"translate the situation",suggestion:t.explain,fallbackDistractors:[`${a}${symbol}${b}=${answer+1}`,`${a}${symbol}${b}=${answer-1}`],parameters:{a,b,op,variant}});
    const trueEquation=variant%2===0;
    const shown=trueEquation?equation:`${a}${symbol}${b}=${answer+1}`;
    const conclusion=text(trueEquation?t.trueLabel:t.falseLabel);
    return make(shown,conclusion,[text(trueEquation?t.falseLabel:t.trueLabel),text("use a different operation"),text("there is not enough information"),text("both sides are always equal"),text("the result must be negative")],{prompt:t.diagnose,note:"verify both sides",suggestion:t.explain,parameters:{a,b,op,variant}});
  }

  function placeValue(task, rng, t, max, variant, estimation) {
    const lower=max===100?10:100;
    const n=rng.int(lower,max-1);
    const digits={ones:n%10,tens:Math.floor(n/10)%10,hundreds:Math.floor(n/100)%10};
    const places=max===100?["ones","tens"]:["ones","tens","hundreds"];
    const place=places[variant%places.length];
    const value=place==="ones"?digits.ones:place==="tens"?digits.tens*10:digits.hundreds*100;
    if(estimation && task==="direct") { const unit=variant%2?10:100; const rounded=Math.round(n/unit)*unit; return make(text(`Round ${n} to the nearest ${unit}.`),rounded,[Math.floor(n/unit)*unit,Math.ceil(n/unit)*unit,n,n%unit],{prompt:t.calculate,note:"round by place value",min:0,max:max+100,suggestion:t.explain,parameters:{n,unit}}); }
    if(task==="direct") return make(text(`What is the value of the ${place} digit in ${n}?`),value,Object.values(digits),{prompt:t.calculate,note:"read the selected place",min:0,max,suggestion:t.explain,parameters:{n,place}});
    if(task==="inverse") { const rebuilt=n-value+rng.int(1,Math.max(1,place==="hundreds"?9:9))*(place==="hundreds"?100:place==="tens"?10:1); return make(text(`Which number has ${value} in the ${place} place?`),rebuilt,[n,n+10,n+100,Math.abs(n-10),Math.abs(n-100)],{prompt:t.missing,note:"construct the number",min:0,max:1100,suggestion:t.explain,parameters:{n,place}}); }
    if(task==="interpret") return make(text(`${n}=${digits.hundreds?digits.hundreds+" hundreds + ":""}${digits.tens} tens + ${digits.ones} ones`),text(t.trueLabel),[text(t.falseLabel),text(t.ones),text(t.tens),text(t.hundreds),text(t.remainder)],{prompt:t.diagnose,note:"expanded form",suggestion:t.explain,parameters:{n}});
    if(task==="translate") return make(String(n),`${digits.hundreds?digits.hundreds*100+"+":""}${digits.tens*10}+${digits.ones}`,[`${digits.ones*100}+${digits.tens*10}+${digits.hundreds}`,`${digits.tens*100}+${digits.ones*10}`,`${n}+10`,`${n}-1`,`${digits.hundreds+digits.tens+digits.ones}`],{prompt:t.chooseEquation,note:"expanded form",suggestion:t.explain,fallbackDistractors:[`${n+1}+0`,`${n-1}+0`,`${n-10}+0`],parameters:{n}});
    const claim=value===0?`${n} has no ${place}.`:`The ${place} value in ${n} is ${value}.`;
    return make(text(claim),text(t.trueLabel),[text(t.falseLabel),text("the digit and its value are the same"),text("rounding is required"),text("the places should be reversed"),text("the number is undefined")],{prompt:t.diagnose,note:"check the named place",suggestion:t.explain,parameters:{n,place}});
  }

  function comparison(task, rng, t, max, variant) {
    const a=rng.int(Math.floor(max*.2),max), b=rng.int(Math.floor(max*.2),max);
    const left=variant%2?Math.round(a/10)*10:a, right=variant%2?Math.round(b/10)*10:b;
    const relation=left>right?">":left<right?"<":"=";
    if(task==="direct"||task==="interpret") return make(`${left}\\;\\Box\\;${right}`,relation,[">","<","=","\\le","\\ge","\\ne"],{prompt:t.compare,note:"compare place values",suggestion:t.explain,parameters:{left,right}});
    if(task==="inverse") { const target=Math.min(max,left+rng.int(1,9)); return make(`${left}<\\Box\\le ${target}`,target,[left,left-1,target+1,0,max],{prompt:t.missing,note:"respect both bounds",min:0,max:max+10,suggestion:t.explain,parameters:{left,target}}); }
    if(task==="translate") return make(text(`Choose the statement represented by ${left} ${relation} ${right}.`),text(relation==">"?"the first value is greater":relation==="<"?"the first value is less":"the values are equal"),[text("the first value is greater"),text("the first value is less"),text("the values are equal"),text("the values cannot be compared"),text("both values round to zero")],{prompt:t.chooseEquation,note:"translate the comparison",suggestion:t.explain,fallbackDistractors:[text("the first value differs from the second by one")],parameters:{left,right}});
    return make(`${left}${relation}${right}`,text(t.trueLabel),[text(t.falseLabel),text("reverse both values"),text("compare only the ones digits"),text("rounding changes the exact relation"),text("there is no relation")],{prompt:t.diagnose,note:"verify the comparison",suggestion:t.explain,parameters:{left,right}});
  }

  function divisionRemainder(task, rng, t, max, variant) {
    const divisor=rng.int(2,12), quotient=rng.int(2,Math.max(3,Math.floor(max/divisor)-1)), remainder=rng.int(1,divisor-1), dividend=divisor*quotient+remainder;
    if(task==="direct") return make(`${dividend}\\div${divisor}`,`${quotient}\\text{ R }${remainder}`,[`${quotient}\\text{ R }${remainder+1}`,`${quotient+1}\\text{ R }${remainder}`,`${quotient}`,`${remainder}\\text{ R }${quotient}`,`${quotient-1}\\text{ R }${remainder}`],{prompt:t.calculate,note:"quotient and remainder",suggestion:t.explain,fallbackDistractors:[`${quotient+1}\\text{ R }${remainder+1}`,`${Math.max(0,quotient-1)}\\text{ R }${remainder+1}`,`${quotient+2}\\text{ R }${remainder}`],parameters:{dividend,divisor,quotient,remainder}});
    if(task==="inverse") return make(`${divisor}\\times${quotient}+${remainder}=\\Box`,dividend,[divisor*quotient,dividend+divisor,dividend-remainder,quotient+remainder,divisor+quotient+remainder],{prompt:t.missing,note:"division algorithm",min:0,max,suggestion:t.explain,parameters:{dividend,divisor,quotient,remainder}});
    if(task==="interpret") return make(text(`${dividend} objects are packed in groups of ${divisor}.`),text(`${quotient} full groups and ${remainder} left over`),[text(`${quotient+1} full groups`),text(`${remainder} groups and ${quotient} left over`),text(`${quotient} full groups and none left over`),text(`${divisor} groups and ${remainder} left over`),text(`${quotient-1} groups and ${remainder} left over`)],{prompt:t.chooseOperation,note:"interpret quotient and remainder",suggestion:t.explain,parameters:{dividend,divisor}});
    if(task==="translate") return make(text(`${dividend} divided by ${divisor} leaves remainder ${remainder}.`),`${dividend}=${divisor}\\times${quotient}+${remainder}`,[`${dividend}=${divisor}+${quotient}+${remainder}`,`${dividend}=${divisor}\\times(${quotient}+${remainder})`,`${dividend}=${quotient}\\times${remainder}+${divisor}`,`${dividend}-${remainder}=${quotient}`,`${dividend}+${remainder}=${divisor}\\times${quotient}`],{prompt:t.chooseEquation,note:"division algorithm",suggestion:t.explain,parameters:{dividend,divisor}});
    return make(`${dividend}=${divisor}\\times${quotient}+${remainder}`,text(t.trueLabel),[text(t.falseLabel),text("the remainder must equal the divisor"),text("the quotient and remainder are reversed"),text("the remainder must be zero"),text("the dividend is too large")],{prompt:t.diagnose,note:"multiply and add the remainder",suggestion:t.explain,parameters:{dividend,divisor}});
  }

  function twoStep(task, rng, t, max, variant) {
    const a=rng.int(2,Math.max(4,Math.floor(max*.45))), b=rng.int(1,Math.max(2,Math.floor(max*.25))), c=rng.int(1,Math.max(2,Math.floor(max*.2)));
    const plus=variant%2===0, answer=plus?a+b-c:a-b+c;
    const main=plus?`${a}+${b}-${c}`:`${a}-${b}+${c}`;
    if(task==="direct") return make(main,answer,[a+b+c,a-b-c,a+(b-c),Math.abs(answer),a],{prompt:t.calculate,note:"work left to right",min:0,max,suggestion:t.explain,parameters:{a,b,c}});
    if(task==="inverse") return make(`${a}+\\Box-${c}=${answer}`,b,[c,answer,a,Math.abs(answer-a),b+1],{prompt:t.missing,note:"undo in reverse order",min:0,max,suggestion:t.explain,parameters:{a,b,c}});
    const story=text(`A student starts with ${a}, gains ${b}, then uses ${c}.`);
    if(task==="interpret") return make(story,answer,[a+b+c,a-b-c,b+c,a+c,a],{prompt:t.calculate,note:"model changes in order",min:0,max,suggestion:t.explain,parameters:{a,b,c}});
    if(task==="translate") return make(story,`${a}+${b}-${c}`,[`${a}-${b}+${c}`,`${a}+${b}+${c}`,`${a}-${b}-${c}`,`${a}\\times${b}-${c}`,`${a}+${b}\\times${c}`],{prompt:t.chooseEquation,note:"translate each change",suggestion:t.explain,parameters:{a,b,c}});
    return make(`${a}+${b}-${c}=${answer}`,text(t.trueLabel),[text(t.falseLabel),text("addition must always be last"),text("subtraction must be done first"),text("the middle number is ignored"),text("the result must be larger than the start")],{prompt:t.diagnose,note:"evaluate from left to right",suggestion:t.explain,parameters:{a,b,c}});
  }

  function build(toolId, concept, task, variant, rng, lang) {
    const t=copy(lang), max=definitions[toolId].limit;
    if(toolId==="arithmetic-within-10") {
      if(concept==="mixed-equality") return comparison(task,rng,t,max,variant);
      return basicOperation(concept,task,rng,t,max,variant);
    }
    if(toolId==="arithmetic-within-100") {
      if(concept==="mental-add-subtract") return basicOperation(variant%2?"subtraction":"addition",task,rng,t,max,variant);
      if(concept==="multiply-divide") return basicOperation(variant%2?"division":"multiplication",task,rng,t,max,variant);
      if(concept==="place-value") return placeValue(task,rng,t,max,variant,false);
      if(concept==="estimate-compare") return comparison(task,rng,t,max,variant);
      return twoStep(task,rng,t,max,variant);
    }
    if(concept==="multi-digit-add-subtract") return basicOperation(variant%2?"subtraction":"addition",task,rng,t,max,variant);
    if(concept==="multiplication") return basicOperation("multiplication",task,rng,t,max,variant);
    if(concept==="division-remainders") return divisionRemainder(task,rng,t,max,variant);
    if(concept==="place-value-estimation") return placeValue(task,rng,t,max,variant,true);
    return twoStep(task,rng,t,max,variant);
  }

  function register(toolId, definition) {
    const concepts=definition.concepts.map(id=>({id}));
    const templates=[]; let index=0;
    variants.forEach((representation,variant)=>concepts.forEach(concept=>forms.forEach(task=>{
      const current=index++;
      templates.push({
        id:`${concept.id}-${task}-${representation}`, familyId:`${concept.id}-${task}`, conceptId:concept.id,
        difficulty:current<25?"easy":current<55?"medium":current<80?"hard":"expert", taskForm:task,
        inputRepresentation:representation, outputKind:task==="interpret"?"interpreted-model":task==="translate"?"mathematical-model":task==="diagnose"?"verified-conclusion":"exact-value",
        reasoningPattern:`${concept.id}:${task}`, constraintPattern:`${representation}:${variant+1}`,
        parameterPolicy:{integerBounds:[0,definition.limit],excludes:["ambiguous-wording","duplicate-options","out-of-range-core-result"]},
        build:({rng,lang})=>build(toolId,concept.id,task,variant,rng,lang),
        validate:q=>Boolean(q.main&&key(q.answer)&&unique(q.distractors||[]).filter(value=>key(value)!==key(q.answer)).length>=5&&q.lines?.length)
      });
    })));
    concepts.forEach((concept,i)=>templates.push({
      id:`${concept.id}-capstone`,familyId:`${concept.id}-diagnose`,conceptId:concept.id,difficulty:"expert",taskForm:"diagnose",
      inputRepresentation:"multi-representation-capstone",outputKind:"verified-conclusion",reasoningPattern:`${concept.id}:multi-step-verification`,constraintPattern:`capstone:${i+1}`,
      parameterPolicy:{integerBounds:[0,definition.limit],minimumReasoningSteps:2},build:({rng,lang})=>build(toolId,concept.id,"diagnose",3,rng,lang),
      validate:q=>Boolean(q.main&&key(q.answer)&&unique(q.distractors||[]).filter(value=>key(value)!==key(q.answer)).length>=5&&q.lines?.length)
    }));
    registry.registerTool({toolId,version:"2",concepts,templates});
  }

  Object.entries(definitions).forEach(([toolId,definition])=>register(toolId,definition));
  window.MCLArithmeticBanks={
    audit:toolId=>registry.auditTool(toolId),
    auditGeneration:(toolId,samples)=>registry.auditGeneration(toolId,{samplesPerTemplate:samples||20})
  };
})();
