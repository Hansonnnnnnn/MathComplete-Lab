(function () {
  "use strict";
  const registry=window.MCLQuestionTemplates;
  if(!registry||!window.MCLQuizTool)return;
  const concepts=[{id:"substitution"},{id:"order-of-operations"},{id:"multivariable-evaluation"},{id:"formula-evaluation"},{id:"expression-modeling"}];
  const forms=registry.TASK_FORMS,variants=["symbolic","table","context","verification"];
  const key=value=>registry.answerKey(value), text=value=>`\\text{${String(value)}}`;
  const unique=values=>[...new Map(values.map(value=>[key(value),String(value)])).values()];
  function tr(lang){return lang==="zh"?{
    evaluate:"\u4ee3\u5165\u5df2\u77e5\u503c\u5e76\u8ba1\u7b97\u3002",missing:"\u6c42\u7f3a\u5931\u7684\u53d8\u91cf\u503c\u3002",interpret:"\u9009\u62e9\u6b63\u786e\u7684\u89e3\u91ca\u3002",translate:"\u9009\u62e9\u6b63\u786e\u7684\u4ee3\u6570\u8868\u8fbe\u5f0f\u3002",diagnose:"\u68c0\u67e5\u8ba1\u7b97\u5e76\u9009\u62e9\u6b63\u786e\u7ed3\u8bba\u3002",substitute:"\u5148\u7528\u6570\u503c\u66ff\u6362\u53d8\u91cf",order:"\u6309\u8fd0\u7b97\u987a\u5e8f\u5904\u7406\u62ec\u53f7\u3001\u4e58\u9664\u548c\u52a0\u51cf",model:"\u5148\u5b9a\u4e49\u6570\u91cf\u518d\u5efa\u7acb\u8868\u8fbe\u5f0f",final:"\u6700\u7ec8\u7b54\u6848"
  }:{evaluate:"Substitute the given value and evaluate.",missing:"Find the missing variable value.",interpret:"Choose the correct interpretation.",translate:"Choose the correct algebraic expression.",diagnose:"Check the work and choose the correct conclusion.",substitute:"replace each variable with its given value",order:"apply parentheses, multiplication or division, then addition or subtraction",model:"define the quantities before building the expression",final:"final answer"}}
  function complete(answer,candidates){
    const values=[...(candidates||[])],raw=String(answer),numeric=/^-?\d+$/.test(raw);
    if(numeric){const n=Number(raw);[1,-1,2,-2,3,-3,5,-5,10,-10].forEach(d=>values.push(String(n+d)));values.push(String(-n),String(n*2));}
    else ["the substitution is correct","the substitution is incorrect","multiply first","add first","the variable is the input","the variable is the output","not enough information"].forEach(x=>values.push(text(x)));
    return unique(values).filter(value=>key(value)!==key(answer)).slice(0,10);
  }
  function make(main,answer,distractors,t,note,parameters,plain){return{main,plain:plain||main,answer:String(answer),distractors:complete(answer,distractors),prompt:t,lines:[{line:main,note},{line:String(answer),note:"final answer"}],suggestion:note,parameters}}
  function substitution(task,v,rng,t){
    const a=rng.int(2,9),b=rng.int(-9,9),x=rng.int(-8,8),value=a*x+b,expr=`${a}x${b<0?b:`+${b}`}`;
    if(task==="direct")return make(`${expr},\\quad x=${x}`,value,[a+x+b,a*x-b,a*(x+b),x+b],t.evaluate,t.substitute,{a,b,x});
    if(task==="inverse")return make(`${expr}=${value}`,`x=${x}`,[`x=${x+1}`,`x=${x-1}`,`x=${value-b}`,`x=${value/a}`,`x=${-x}`],t.missing,"undo addition, then division",{a,b,value});
    if(task==="interpret")return make(`${expr}\\big|_{x=${x}}`,text(`replace x with ${x}`),[text(`replace x with ${a}`),text(`multiply x by ${b}`),text(`solve x=${value}`),text("remove the variable"),text("differentiate the expression")],t.interpret,t.substitute,{a,b,x});
    if(task==="translate")return make(`${a} times a number, then ${b>=0?"add":"subtract"} ${Math.abs(b)}`,expr,[`${a+x}+${b}`,`${a}+${b}x`,`${a}(x${b<0?b:`+${b}`})`,`x^{${a}}${b<0?b:`+${b}`}`,`${a}x-${b}`],t.translate,t.model,{a,b});
    const shown=value+(v%2?1:0),correct=shown===value;
    return make(`${expr}\\big|_{x=${x}}=${shown}`,text(correct?"the substitution is correct":"the substitution is incorrect"),[text(correct?"the substitution is incorrect":"the substitution is correct"),text("the coefficient should be added"),text("the constant should be multiplied"),text("x cannot be negative"),text("the expression is undefined")],t.diagnose,t.substitute,{a,b,x,shown});
  }
  function order(task,v,rng,t){
    const a=rng.int(2,9),b=rng.int(2,8),c=rng.int(1,7),d=rng.int(1,5),value=v%2?a*(b-c)+d:(a+b)*c-d,expr=v%2?`${a}(${b}-${c})+${d}`:`(${a}+${b})${c}-${d}`;
    if(task==="direct")return make(expr,value,[(a*b)-c+d,a*(b-c+d),(a+b)*(c-d),a+b*c-d],t.evaluate,t.order,{a,b,c,d});
    if(task==="inverse")return make(`${a}(\\Box-${c})+${d}=${a*(b-c)+d}`,b,[b+1,b-1,c,d,a,b+c],t.missing,"reverse the outside operations",{a,b,c,d});
    if(task==="interpret")return make(expr,text("evaluate the parentheses first"),[text("multiply before the parentheses"),text("add every number first"),text("work strictly from right to left"),text("ignore the parentheses"),text("subtract the coefficient")],t.interpret,t.order,{a,b,c,d});
    if(task==="translate")return make(`Multiply ${a} by the difference of ${b} and ${c}, then add ${d}.`,`${a}(${b}-${c})+${d}`,[`${a}${b}-${c}+${d}`,`${a}(${b}+${c})-${d}`,`(${a}${b}-${c})+${d}`,`${a}+(${b}-${c})${d}`,`${a}(${b}-${c}+${d})`],t.translate,t.model,{a,b,c,d});
    const wrong=a*b-c+d;
    return make(`${expr}=${wrong}`,text("the parentheses were not evaluated first"),[text("the calculation is correct"),text("multiplication was omitted"),text("the final addition should be first"),text("the expression has no value"),text("the numbers should be reversed")],t.diagnose,t.order,{a,b,c,d});
  }
  function multivariable(task,v,rng,t){
    const a=rng.int(2,7),b=rng.int(-6,6)||3,x=rng.int(-5,6),y=rng.int(-5,6),value=a*x+b*y,expr=`${a}x${b<0?b:`+${b}`}y`;
    if(task==="direct")return make(`${expr},\\quad x=${x},\\ y=${y}`,value,[a+x+b+y,a*x+b+y,a*x-b*y,a*(x+b*y)],t.evaluate,"substitute both variables independently",{a,b,x,y});
    if(task==="inverse"){const total=a*x+b*y;return make(`${expr}=${total},\\quad x=${x}`,`y=${y}`,[`y=${y+1}`,`y=${y-1}`,`y=${total-a*x}`,`y=${Math.trunc((total-a*x)/(b||1))+1}`,`y=${x}`],t.missing,"isolate the term containing y",{a,b,x,total});}
    if(task==="interpret")return make(`${expr}`,text(`${a} is the coefficient of x`),[text(`${b} is the value of y`),text("x and y must be equal"),text(`${a} is a constant term`),text("the expression is a product only"),text("there is one variable")],t.interpret,"identify each coefficient and variable",{a,b});
    if(task==="translate")return make(`${a} times x plus ${b} times y`,expr,[`${a+b}xy`,`${a}y${b<0?b:`+${b}`}x`,`${a}(x${b<0?b:`+${b}`}y)`,`x^{${a}}+y^{${Math.abs(b)}}`,`${a+b}(x+y)`],t.translate,t.model,{a,b});
    return make(`${expr}\\big|_{x=${x},y=${y}}=${a*x+b+y}`,text("the coefficient of y was not multiplied by y"),[text("the evaluation is correct"),text("x and y were swapped"),text("the coefficient of x is missing"),text("the constant term was omitted"),text("the variables cannot be evaluated")],t.diagnose,"multiply each coefficient by its variable",{a,b,x,y});
  }
  function formula(task,v,rng,t){
    const l=rng.int(3,15),w=rng.int(2,12),area=l*w,perimeter=2*l+2*w;
    if(task==="direct")return make(`A=lw,\\quad l=${l},\\ w=${w}`,area,[l+w,2*l+2*w,l*l+w*w,2*l*w],t.evaluate,"substitute length and width",{l,w});
    if(task==="inverse")return make(`A=lw,\\quad A=${area},\\ l=${l}`,`w=${w}`,[`w=${w+1}`,`w=${area-l}`,`w=${area+l}`,`w=${l}`,`w=${2*w}`],t.missing,"divide area by the known dimension",{l,w,area});
    if(task==="interpret")return make(`P=2l+2w`,text("perimeter adds all four side lengths"),[text("perimeter multiplies length by width"),text("area adds all side lengths"),text("the formula finds a diagonal"),text("l and w must be equal"),text("the factor 2 can be ignored")],t.interpret,t.model,{l,w});
    if(task==="translate")return make("the perimeter of a rectangle with length l and width w",`2l+2w`,[`lw`,`l+w`,`2lw`,`l^2+w^2`,`4lw`],t.translate,t.model,{l,w});
    return make(`P=2(${l}+${w})=${perimeter}`,text("the formula evaluation is correct"),[text("the formula evaluation is incorrect"),text("area should be used"),text("only two sides were counted"),text("the dimensions must be squared"),text("the result has no units")],t.diagnose,"check the formula and substitution",{l,w,perimeter});
  }
  function modeling(task,v,rng,t){
    const fee=rng.int(2,12),rate=rng.int(2,9),n=rng.int(2,12),total=fee+rate*n,expr=`${fee}+${rate}n`;
    const situation=`A service charges a ${fee}-dollar fee plus ${rate} dollars per use.`;
    if(task==="direct")return make(`${expr},\\quad n=${n}`,total,[fee*n+rate,fee+rate+n,(fee+rate)*n,rate*n],t.evaluate,t.substitute,{fee,rate,n});
    if(task==="inverse")return make(`${expr}=${total}`,`n=${n}`,[`n=${n+1}`,`n=${n-1}`,`n=${total-fee}`,`n=${Math.trunc(total/rate)}`,`n=${fee}`],t.missing,"subtract the fixed fee, then divide by the rate",{fee,rate,total});
    if(task==="interpret")return make(situation,text("n is the number of uses"),[text("n is the fixed fee"),text("n is the price per use"),text("n is the total cost"),text("n must equal the rate"),text("n is a percentage")],t.interpret,t.model,{fee,rate});
    if(task==="translate")return make(situation,expr,[`${fee}n+${rate}`,`${fee+rate}n`,`${fee}${rate}n`,`${rate}n-${fee}`,`${fee}+n+${rate}`],t.translate,t.model,{fee,rate});
    return make(`The expression ${rate}+${fee}n correctly models the service.`,text("the fixed fee and per-use rate are reversed"),[text("the model is correct"),text("the variable should be squared"),text("the fixed fee should be multiplied twice"),text("the total must be constant"),text("there is not enough information")],t.diagnose,t.model,{fee,rate});
  }
  function build(concept,task,variant,rng,lang){const t=tr(lang);if(concept==="substitution")return substitution(task,variant,rng,t);if(concept==="order-of-operations")return order(task,variant,rng,t);if(concept==="multivariable-evaluation")return multivariable(task,variant,rng,t);if(concept==="formula-evaluation")return formula(task,variant,rng,t);return modeling(task,variant,rng,t)}
  const difficultyAt=i=>i<25?"easy":i<55?"medium":i<80?"hard":"expert";
  const validate=q=>Boolean(q.main&&key(q.answer)&&unique(q.distractors||[]).filter(value=>key(value)!==key(q.answer)).length>=5&&q.lines?.length);
  const templates=[];let index=0;
  variants.forEach((representation,variant)=>concepts.forEach(concept=>forms.forEach(task=>{const current=index++;templates.push({id:`${concept.id}-${task}-${representation}`,familyId:`${concept.id}-${task}`,conceptId:concept.id,difficulty:difficultyAt(current),taskForm:task,inputRepresentation:representation,outputKind:task==="interpret"?"interpretation":task==="translate"?"modeled-expression":task==="diagnose"?"error-analysis":"exact-value",reasoningPattern:`${concept.id}:${task}`,constraintPattern:`${representation}:${variant+1}`,parameterPolicy:{integerBounds:[-20,200],excludes:["division-by-zero","ambiguous-model","duplicate-options"]},build:({rng,lang})=>build(concept.id,task,variant,rng,lang),validate})})));
  concepts.forEach((concept,i)=>templates.push({id:`${concept.id}-capstone`,familyId:`${concept.id}-diagnose`,conceptId:concept.id,difficulty:"expert",taskForm:"diagnose",inputRepresentation:"multi-representation-capstone",outputKind:"verified-conclusion",reasoningPattern:`${concept.id}:multi-step-verification`,constraintPattern:`capstone:${i+1}`,parameterPolicy:{integerBounds:[-20,200],minimumReasoningSteps:2},build:({rng,lang})=>build(concept.id,"diagnose",3,rng,lang),validate}));
  registry.registerTool({toolId:"algebra-expression",version:"2",concepts,templates});
  window.MCLQuizTool.gameId="algebra-expression";window.MCLQuizTool.course="algebra-1";
  window.MCLAlgebraExpressionBank={templates,audit:()=>registry.auditTool("algebra-expression"),auditGeneration:s=>registry.auditGeneration("algebra-expression",{samplesPerTemplate:s||20})};
})();
