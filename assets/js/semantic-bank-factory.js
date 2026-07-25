(function(root){
  "use strict";
  const registry=root.MCLQuestionTemplates;
  if(!registry)return;
  const representations=["symbolic","table-or-features","verbal-or-context","multi-representation"];
  const difficultyAt=index=>index<25?"easy":index<55?"medium":index<80?"hard":"expert";
  const key=value=>registry.answerKey(value);
  const unique=values=>[...new Map((values||[]).map(value=>[key(value),String(value)])).values()];
  function numericFill(answer,values){
    const result=[...(values||[])],raw=String(answer);
    if(/^-?\d+(?:\.\d+)?$/.test(raw)){
      const n=Number(raw);
      for(let step=1;step<=10;step+=1)result.push(String(n+step),String(n-step));
    }
    return result;
  }
  function structuralFill(answer,values){
    const raw=String(answer),answerKey=key(raw),result=unique(numericFill(answer,values)).filter(value=>key(value)!==answerKey),seen=new Set(result.map(key));
    const add=value=>{const normalized=String(value),valueKey=key(normalized);if(valueKey&&valueKey!==key(raw)&&!seen.has(valueKey)){seen.add(valueKey);result.push(normalized);}};
    const coordinate=raw.match(/^\((-?\d+),(-?\d+)\)$/);
    const vertex=raw.match(/^(-?\d*)\(x([+-]\d+)\)\^2([+-]\d+)$/);
    if(coordinate){const x=Number(coordinate[1]),y=Number(coordinate[2]);for(let step=1;result.length<5;step+=1){add(`(${x+step},${y})`);add(`(${x},${y-step})`);}}
    else if(vertex){const coefficient=vertex[1]===""?1:vertex[1]==="-"?-1:Number(vertex[1]),shift=Number(vertex[2]),constant=Number(vertex[3]);for(let step=1;result.length<5;step+=1){add(`${coefficient===1?"":coefficient===-1?"-":coefficient}(x${shift+step<0?shift+step:`+${shift+step}`})^2${constant<0?constant:`+${constant}`}`);add(`${coefficient===1?"":coefficient===-1?"-":coefficient}(x${shift<0?shift:`+${shift}`})^2${constant-step<0?constant-step:`+${constant-step}`}`);}}
    else if(!raw.startsWith("\\text")){for(let step=1;result.length<5;step+=1){add(`(${raw})+${step}`);add(`(${raw})-${step}`);}}
    else {for(let step=1;result.length<5;step+=1)add(`\\text{alternative interpretation ${step}}`);}
    return result;
  }
  function normalizeQuestion(raw){
    const question={...raw};
    question.main=String(question.main||question.plain||"");
    question.plain=String(question.plain||question.main);
    question.answer=String(question.answer??"");
    question.distractors=structuralFill(question.answer,question.distractors).filter(value=>key(value)!==key(question.answer)).slice(0,16);
    question.prompt=question.prompt||"Choose the correct answer.";
    question.lines=question.lines?.length?question.lines:[{line:question.main,note:question.suggestion||"set up the structure"},{line:question.answer,note:"result"}];
    question.parameters=question.parameters||{};
    return question;
  }
  function validate(question){
    return Boolean(question.main&&key(question.answer)&&new Set((question.distractors||[]).map(key).filter(value=>value&&value!==key(question.answer))).size>=5&&question.lines?.length);
  }
  function register(definition){
    const concepts=definition.concepts.map(id=>typeof id==="string"?{id}:id),forms=registry.TASK_FORMS;
    const templates=[];
    let index=0;
    representations.forEach((representation,variant)=>concepts.forEach(concept=>forms.forEach(taskForm=>{
      const current=index++;
      templates.push({
        id:`${concept.id}-${taskForm}-${representation}`,
        familyId:`${concept.id}-${taskForm}`,
        conceptId:concept.id,
        difficulty:difficultyAt(current),
        taskForm,
        inputRepresentation:representation,
        outputKind:`${concept.id}-${taskForm}-answer`,
        reasoningPattern:`${concept.id}:${taskForm}`,
        constraintPattern:`${representation}:${variant+1}`,
        parameterPolicy:{integerBounds:definition.integerBounds||[-20,50],excludes:definition.excludes||["duplicate-options","undefined-expression"]},
        build:context=>normalizeQuestion(definition.build({conceptId:concept.id,taskForm,variant,representation,...context})),
        validate
      });
    })));
    concepts.forEach((concept,variant)=>templates.push({
      id:`${concept.id}-expert-capstone`,familyId:`${concept.id}-diagnose`,conceptId:concept.id,difficulty:"expert",taskForm:"diagnose",
      inputRepresentation:"multi-step-capstone",outputKind:`${concept.id}-error-analysis`,reasoningPattern:`${concept.id}:multi-step-verification`,constraintPattern:`capstone:${variant+1}`,
      parameterPolicy:{integerBounds:definition.integerBounds||[-20,50],minimumReasoningSteps:2},
      build:context=>normalizeQuestion(definition.build({conceptId:concept.id,taskForm:"diagnose",variant:3,representation:"multi-step-capstone",capstone:true,...context})),validate
    }));
    registry.registerTool({toolId:definition.toolId,version:definition.version||"2",concepts,templates});
    if(root.MCLQuizTool){root.MCLQuizTool.gameId=definition.toolId;if(definition.course)root.MCLQuizTool.course=definition.course;}
    return templates;
  }
  root.MCLSemanticBankFactory=Object.freeze({register,normalizeQuestion,validate,key,unique,text:value=>`\\text{${String(value)}}`});
})(typeof window!=="undefined"?window:globalThis);
