(function () {
  "use strict";
  const registry = window.MCLQuestionTemplates;
  if (!registry || !window.MCLQuizTool) return;
  const concepts = [
    { id:"product-quotient" }, { id:"power-rules" }, { id:"zero-negative-exponents" },
    { id:"multivariable-coefficients" }, { id:"diagnosis-equivalence" }
  ];
  const forms = registry.TASK_FORMS;
  const variants = ["single-variable", "expanded", "multivariable", "equation"];
  const key = value => registry.answerKey(value);
  const unique = values => [...new Map(values.map(value => [key(value), String(value)])).values()];
  const text = value => `\\text{${String(value)}}`;
  function power(variable, exponent) { if (exponent === 0) return "1"; if (exponent === 1) return variable; return `${variable}^{${exponent}}`; }
  function reciprocal(variable, exponent) { return `\\frac{1}{${power(variable, exponent)}}`; }
  function monomial(coefficient, x = 0, y = 0) {
    if (coefficient === 0) return "0";
    const variables = `${power("x", x) === "1" ? "" : power("x", x)}${power("y", y) === "1" ? "" : power("y", y)}`;
    if (!variables) return String(coefficient);
    if (coefficient === 1) return variables;
    if (coefficient === -1) return `-${variables}`;
    return `${coefficient}${variables}`;
  }
  function completeDistractors(answer, distractors) {
    const raw = String(answer);
    const values = [...distractors];
    const numberMatch = raw.match(/^-?\d+$/);
    const powerMatch = raw.match(/^x\^\{(-?\d+)\}$/);
    const reciprocalMatch = raw.match(/^\\frac\{1\}\{x\^\{(\d+)\}\}$/);
    if (numberMatch) {
      const value = Number(raw);
      for (let i = 1; values.length < 14; i += 1) values.push(String(value + (i % 2 ? i : -i)));
    } else if (powerMatch) {
      const exponent = Number(powerMatch[1]);
      for (let i = 1; values.length < 14; i += 1) values.push(power("x", Math.max(0, exponent + (i % 2 ? i : -i))));
    } else if (reciprocalMatch) {
      const exponent = Number(reciprocalMatch[1]);
      for (let i = 1; values.length < 14; i += 1) values.push(reciprocal("x", Math.max(1, exponent + (i % 2 ? i : -i))));
    } else if (raw.includes("=") && !raw.startsWith("\\text")) {
      const split = raw.lastIndexOf("=");
      const left = raw.slice(0, split + 1);
      const right = raw.slice(split + 1);
      for (let i = 1; values.length < 14; i += 1) values.push(`${left}\\left(${right}\\right)+${i}`);
    } else if (!raw.startsWith("\\text")) {
      for (let i = 1; values.length < 14; i += 1) values.push(`${raw}x^{${i}}`);
    }
    return unique(values).filter(value => key(value) !== key(raw)).slice(0, 8);
  }
  function make(main, answer, distractors, meta = {}) {
    return { main, plain:main, answer:String(answer), distractors:completeDistractors(answer,distractors), prompt:meta.prompt || "", lines:meta.lines || [{line:main,note:meta.note||""},{line:String(answer),note:meta.final||""}], suggestion:meta.suggestion||"", parameters:meta.parameters||null };
  }
  function productFamily(task, variant, rng, t) {
    const a=rng.int(2,variant<2?7:12), b=rng.int(2,variant<2?7:12), sum=a+b, diff=Math.max(1,a-b);
    if(task==="direct") return make(`${power("x",a)}\\cdot${power("x",b)}`,power("x",sum),[power("x",a*b),power("x",Math.abs(a-b)),`${a+b}x`,power("x",sum+1),power("x",sum-1),`${power("x",a)}+${power("x",b)}`],{prompt:t.productRule,lines:[{line:`x^{${a}}x^{${b}}=x^{${a}+${b}}=x^{${sum}}`,note:t.addExponents}],parameters:{a,b,sum}});
    if(task==="inverse") return make(`${power("x",a)}\\cdot x^{\\Box}=x^{${sum}}`,String(b),[String(a),String(sum),String(a*b),String(sum+1),String(Math.abs(a-b)),String(b+1)],{prompt:t.missingExponent,lines:[{line:`a+\\Box=${sum}`,note:t.matchExponent},{line:`\\Box=${b}`,note:t.final}],parameters:{a,b,sum}});
    if(task==="interpret") return make(`\\frac{x^{${a+b}}}{x^{${a}}}`,power("x",b),[power("x",a),power("x",a+b),power("x",a*b),power("x",Math.abs(a-b)),`${b}x`,reciprocal("x",b)],{prompt:t.quotientRule,lines:[{line:`x^{${a+b}-${a}}=x^{${b}}`,note:t.subtractExponents}],parameters:{a,b}});
    if(task==="translate") return make(`${Array(b).fill(power("x",a)).join("\\cdot")}`,power("x",a*b),[power("x",a+b),power("x",a**b),power("x",b**a),`${b}${power("x",a)}`,power("x",a*b+1),power("x",Math.max(1,a*b-b))],{prompt:t.repeatedProduct,lines:[{line:`(x^{${a}})^{${b}}=x^{${a*b}}`,note:t.multiplyExponents}],parameters:{a,b}});
    const correct=`\\frac{x^{${a+b}}}{x^{${a}}}=x^{${b}}`;
    return make(text(t.chooseCorrectLaw),correct,[`\\frac{x^{${a+b}}}{x^{${a}}}=x^{${a+sum}}`,`\\frac{x^{${a+b}}}{x^{${a}}}=x^{${a}}`,`x^{${a}}x^{${b}}=x^{${a*b}}`,`x^{${a}}+x^{${b}}=x^{${sum}}`,`\\frac{x^{${a}}}{x^{${a+b}}}=x^{${b}}`,`x^{${a}}x^{${b}}=${sum}x`],{prompt:t.diagnose,lines:[{line:correct,note:t.subtractExponents}],parameters:{a,b}});
  }
  function powerFamily(task, variant, rng, t) {
    const a=rng.int(2,variant<2?6:10), b=rng.int(2,variant<2?5:8), product=a*b;
    if(task==="direct") return make(`\\left(x^{${a}}\\right)^{${b}}`,power("x",product),[power("x",a+b),power("x",a**b),power("x",b**a),power("x",product+1),`${b}${power("x",a)}`,power("x",Math.abs(a-b))],{prompt:t.powerOfPower,lines:[{line:`(x^{${a}})^{${b}}=x^{${a}\\cdot${b}}=x^{${product}}`,note:t.multiplyExponents}],parameters:{a,b,product}});
    if(task==="inverse") return make(`\\left(x^{${a}}\\right)^{\\Box}=x^{${product}}`,String(b),[String(a),String(product),String(a+b),String(product-a),String(b+1),String(Math.max(1,b-1))],{prompt:t.missingOuterExponent,lines:[{line:`${a}\\Box=${product}`,note:t.matchExponent},{line:`\\Box=${b}`,note:t.final}],parameters:{a,b,product}});
    if(task==="interpret") return make(`\\left(${rng.int(2,5)}x\\right)^{${b}}`,text(t.powerAppliesBoth),[t.powerOnlyVariable,t.powerOnlyCoefficient,t.addExponentCoefficient,t.distributeByAddition,t.leaveUnchanged,t.undefined].map(text),{prompt:t.interpretPowerProduct,lines:[{line:`(cx)^n=c^nx^n`,note:t.powerEveryFactor}],parameters:{b}});
    if(task==="translate") {
      const c=rng.int(2,5), coefficient=c**b;
      return make(`(${c}x)^{${b}}`,`${coefficient}${power("x",b)}`,[`${c}${power("x",b)}`,`${c*b}${power("x",b)}`,`${coefficient}${power("x",b+1)}`,`${power("x",b)}`,`${c+b}${power("x",b)}`,`${coefficient}x`],{prompt:t.powerOfProduct,lines:[{line:`(${c}x)^{${b}}=${c}^{${b}}x^{${b}}=${coefficient}x^{${b}}`,note:t.powerEveryFactor}],parameters:{c,b,coefficient}});
    }
    const correct=`(x^a)^b=x^{ab}`;
    return make(text(t.choosePowerIdentity),correct,[`(x^a)^b=x^{a+b}`,`(x^a)^b=x^{a^b}`,`(x+y)^b=x^b+y^b`,`(xy)^b=xy^b`,`(x/y)^b=x^b/y`,`x^{ab}=x^a+x^b`],{prompt:t.diagnose,lines:[{line:correct,note:t.multiplyExponents}],parameters:{identity:"power-of-power"}});
  }
  function negativeFamily(task, variant, rng, t) {
    const a=rng.int(2,variant<2?6:10), b=rng.int(2,variant<2?5:8);
    if(task==="direct") return make(`x^{-${a}}`,reciprocal("x",a),[power("x",a),`-${power("x",a)}`,`\\frac{-1}{${power("x",a)}}`,`\\frac{1}{${a}x}`,`\\frac{1}{x^{${a+1}}}`,`x-${a}`],{prompt:t.negativeExponent,lines:[{line:`x^{-n}=\\frac1{x^n}`,note:t.reciprocal},{line:`x^{-${a}}=${reciprocal("x",a)}`,note:t.final}],parameters:{a}});
    if(task==="inverse") return make(`x^{\\Box}=${reciprocal("x",a)}`,String(-a),[String(a),String(0),String(1-a),String(-a-1),String(a+1),String(-1)],{prompt:t.findNegativeExponent,lines:[{line:`${reciprocal("x",a)}=x^{-${a}}`,note:t.reciprocal}],parameters:{a}});
    if(task==="interpret") return make(`x^0,\\quad x\\ne0`,"1",["0","x","-1",power("x",b),String(b),text(t.undefined)],{prompt:t.zeroExponent,lines:[{line:`x^0=1`,note:t.nonzeroBase}],parameters:{b}});
    if(task==="translate") return make(`\\frac{x^{${a}}}{x^{${a+b}}}`,reciprocal("x",b),[power("x",b),reciprocal("x",a),`\\frac1{x^{${a+b}}}`,`\\frac1{x^{${a}}}`,"1",`x^{-${a-b}}`],{prompt:t.positiveExponentForm,lines:[{line:`x^{${a}-${a+b}}=x^{-${b}}=${reciprocal("x",b)}`,note:t.subtractThenReciprocal}],parameters:{a,b}});
    const correct=`x^{-a}=\\frac1{x^a}`;
    return make(text(t.chooseNegativeIdentity),correct,[`x^{-a}=-x^a`,`x^{-a}=\\frac{-1}{x^a}`,`x^0=0`,`x^{-a}=x^a`,`x^{-a}=\\frac1{ax}`,`x^0=x`],{prompt:t.diagnose,lines:[{line:correct,note:t.reciprocal}],parameters:{identity:"negative-exponent"}});
  }
  function multiFamily(task, variant, rng, t) {
    const c=rng.int(2,6), d=rng.int(2,6), a=rng.int(1,6), b=rng.int(1,6), e=rng.int(1,5), f=rng.int(1,5);
    if(task==="direct") return make(`${monomial(c,a,b)}\\cdot${monomial(d,e,f)}`,monomial(c*d,a+e,b+f),[monomial(c+d,a+e,b+f),monomial(c*d,a*e,b*f),monomial(c*d,a+e,Math.abs(b-f)),monomial(c*d,Math.abs(a-e),b+f),monomial(c*d,a+e+1,b+f),monomial(c*d+1,a+e,b+f)],{prompt:t.multiplyMonomials,lines:[{line:`(${c})(${d})x^{${a}+${e}}y^{${b}+${f}}=${monomial(c*d,a+e,b+f)}`,note:t.coefficientsAndExponents}],parameters:{c,d,a,b,e,f}});
    if(task==="inverse") return make(`\\Box\\cdot${monomial(d,e,f)}=${monomial(c*d,a+e,b+f)}`,monomial(c,a,b),[monomial(d,a,b),monomial(c,e,f),monomial(c*d,a,b),monomial(c,a+e,b+f),monomial(c,a+1,b),monomial(c,a,b+1)],{prompt:t.missingMonomial,lines:[{line:`\\Box=${monomial(c*d,a+e,b+f)}\\div${monomial(d,e,f)}=${monomial(c,a,b)}`,note:t.divideCoefficientsSubtract}],parameters:{c,d,a,b,e,f}});
    if(task==="interpret") return make(`\\frac{${monomial(c*d,a+e,b+f)}}{${monomial(d,e,f)}}`,monomial(c,a,b),[monomial(c*d,a,b),monomial(c,a+e,b+f),monomial(c,Math.abs(a-e),Math.abs(b-f)),monomial(d,a,b),monomial(c+ d,a,b),monomial(c,a+1,b+1)],{prompt:t.divideMonomials,lines:[{line:`\\frac{${c*d}}{${d}}x^{${a+e}-${e}}y^{${b+f}-${f}}=${monomial(c,a,b)}`,note:t.divideCoefficientsSubtract}],parameters:{c,d,a,b,e,f}});
    if(task==="translate") return make(`(${monomial(c,a,b)})^{${e}}`,monomial(c**e,a*e,b*e),[monomial(c*e,a*e,b*e),monomial(c**e,a+e,b+e),monomial(c,a*e,b*e),monomial(c**e,a*e,b),monomial(c**e,a,b*e),monomial(c**e,a*e+1,b*e)],{prompt:t.powerMonomial,lines:[{line:`${c}^{${e}}x^{${a}\\cdot${e}}y^{${b}\\cdot${e}}=${monomial(c**e,a*e,b*e)}`,note:t.powerEveryFactor}],parameters:{c,a,b,e}});
    const correct=`(${monomial(c,a,b)})^2=${monomial(c*c,2*a,2*b)}`;
    return make(text(t.chooseMonomialCheck),correct,[`(${monomial(c,a,b)})^2=${monomial(2*c,2*a,2*b)}`,`(${monomial(c,a,b)})^2=${monomial(c*c,a+2,b+2)}`,`(${monomial(c,a,b)})^2=${monomial(c*c,2*a,b)}`,`(${monomial(c,a,b)})^2=${monomial(c,2*a,2*b)}`,`(${monomial(c,a,b)})^2=${monomial(c*c,a,b)}`,`(${monomial(c,a,b)})^2=${monomial(c*c,a*2,b+2)}`],{prompt:t.diagnose,lines:[{line:correct,note:t.powerEveryFactor}],parameters:{c,a,b}});
  }
  function diagnosisFamily(task, variant, rng, t) {
    const a=rng.int(2,8), b=rng.int(2,7), c=rng.int(2,5);
    if(task==="direct") return make(`\\frac{(x^{${a}})^{${c}}x^{${b}}}{x^{${a}}}`,power("x",a*c+b-a),[power("x",a*c+b),power("x",a+c+b-a),power("x",a*c-b-a),power("x",a+b-a),power("x",a*c+b+a),power("x",Math.max(1,a*c-a))],{prompt:t.simplifyMultiRule,lines:[{line:`x^{${a*c}+${b}-${a}}=x^{${a*c+b-a}}`,note:t.applyInOrder}],parameters:{a,b,c}});
    if(task==="inverse") return make(`x^{${a}}\\cdot\\Box=x^{${a+b}}`,power("x",b),[power("x",a),power("x",a+b),power("x",a*b),power("x",Math.abs(a-b)),`${b}x`,reciprocal("x",b)],{prompt:t.missingFactor,lines:[{line:`\\Box=x^{${a+b}-${a}}=x^{${b}}`,note:t.subtractExponents}],parameters:{a,b}});
    if(task==="interpret") return make(`x^{${a}}x^{${b}}=x^{${a*b}}`,text(t.multipliedInsteadOfAdded),[t.addedInsteadOfMultiplied,t.forgotCoefficient,t.wrongReciprocal,t.zeroExponentError,t.noError,t.distributedExponent].map(text),{prompt:t.identifyError,lines:[{line:`x^{${a}}x^{${b}}=x^{${a+b}}`,note:t.addExponents}],parameters:{a,b}});
    if(task==="translate") return make(`\\frac{x^{${a}}y^{${b}}}{x^{${a-c}}y^{${b-c}}}`,`${power("x",c)}${power("y",c)}`,[power("x",c),power("y",c),`${power("x",a-c)}${power("y",b-c)}`,`${power("x",a+c)}${power("y",b+c)}`,`${power("x",c+1)}${power("y",c)}`,`${power("x",c)}${power("y",c+1)}`],{prompt:t.simplifyQuotient,lines:[{line:`x^{${c}}y^{${c}}`,note:t.subtractEachVariable}],parameters:{a,b,c}});
    const correct=`\\frac{(xy)^a}{x^a}=y^a`;
    return make(text(t.chooseEquivalentStatement),correct,[`\\frac{(xy)^a}{x^a}=y`,`\\frac{(xy)^a}{x^a}=x^ay^a`,`(x+y)^a=x^a+y^a`,`x^ax^b=x^{ab}`,`(x^a)^b=x^{a+b}`,`x^{-a}=-x^a`],{prompt:t.diagnose,lines:[{line:`\\frac{x^ay^a}{x^a}=y^a`,note:t.cancelCommonFactor}],parameters:{identity:"combined"}});
  }
  function translations(lang){const zh=lang==="zh";return zh?{
    productRule:"使用同底数幂的乘法法则。",addExponents:"同底数相乘时指数相加",missingExponent:"求缺少的指数。",matchExponent:"比较等式两边的指数",final:"最终答案",quotientRule:"使用同底数幂的除法法则。",subtractExponents:"同底数相除时指数相减",repeatedProduct:"把重复乘法化为一个幂。",multiplyExponents:"幂的幂要把指数相乘",chooseCorrectLaw:"选择正确的指数法则",diagnose:"选择化简正确的一项。",
    powerOfPower:"化简幂的幂。",missingOuterExponent:"求外层指数。",powerAppliesBoth:"指数同时作用于系数和变量",powerOnlyVariable:"指数只作用于变量",powerOnlyCoefficient:"指数只作用于系数",addExponentCoefficient:"把指数加到系数",distributeByAddition:"把乘法改成加法",leaveUnchanged:"表达式不变",undefined:"表达式未定义",interpretPowerProduct:"解释积的乘方法则。",powerEveryFactor:"指数作用于括号内每个因子",powerOfProduct:"化简积的乘方。",choosePowerIdentity:"选择正确的幂运算恒等式",
    negativeExponent:"把负指数写成正指数形式。",reciprocal:"负指数表示对应幂的倒数",findNegativeExponent:"求缺少的负指数。",zeroExponent:"使用零指数法则。",nonzeroBase:"非零底数的零次幂等于 1",positiveExponentForm:"化为只含正指数的形式。",subtractThenReciprocal:"先相减指数，再取倒数",chooseNegativeIdentity:"选择正确的零指数或负指数法则",
    multiplyMonomials:"相乘两个多变量单项式。",coefficientsAndExponents:"系数相乘，同变量指数相加",missingMonomial:"反推缺少的单项式。",divideCoefficientsSubtract:"系数相除，同变量指数相减",divideMonomials:"化简单项式商。",powerMonomial:"计算单项式的幂。",chooseMonomialCheck:"选择正确的单项式幂计算",
    simplifyMultiRule:"按顺序使用多个指数法则。",applyInOrder:"先处理幂的幂，再处理乘除",missingFactor:"求缺少的指数因子。",multipliedInsteadOfAdded:"同底数相乘时错误地把指数相乘",addedInsteadOfMultiplied:"幂的幂错误地把指数相加",forgotCoefficient:"遗漏了系数",wrongReciprocal:"倒数处理错误",zeroExponentError:"错误使用零指数",noError:"计算没有错误",distributedExponent:"错误分配指数",identifyError:"识别错误使用的指数法则。",simplifyQuotient:"化简多变量指数商。",subtractEachVariable:"分别对每个变量相减指数",chooseEquivalentStatement:"选择恒等的指数式",cancelCommonFactor:"展开积的乘方后约去公因子"
  }:{
    productRule:"Apply the product rule for like bases.",addExponents:"add exponents when multiplying like bases",missingExponent:"Find the missing exponent.",matchExponent:"match the exponents on both sides",final:"final answer",quotientRule:"Apply the quotient rule for like bases.",subtractExponents:"subtract exponents when dividing like bases",repeatedProduct:"Write the repeated product as one power.",multiplyExponents:"multiply exponents in a power of a power",chooseCorrectLaw:"Choose the correctly applied exponent law",diagnose:"Choose the correctly simplified expression.",
    powerOfPower:"Simplify the power of a power.",missingOuterExponent:"Find the outer exponent.",powerAppliesBoth:"the exponent applies to the coefficient and variable",powerOnlyVariable:"the exponent applies only to the variable",powerOnlyCoefficient:"the exponent applies only to the coefficient",addExponentCoefficient:"add the exponent to the coefficient",distributeByAddition:"replace multiplication with addition",leaveUnchanged:"leave the expression unchanged",undefined:"the expression is undefined",interpretPowerProduct:"Interpret the power-of-a-product rule.",powerEveryFactor:"raise every factor inside the parentheses",powerOfProduct:"Simplify the power of a product.",choosePowerIdentity:"Choose the correct power identity",
    negativeExponent:"Rewrite with positive exponents.",reciprocal:"a negative exponent means the reciprocal of the corresponding power",findNegativeExponent:"Find the missing negative exponent.",zeroExponent:"Apply the zero-exponent rule.",nonzeroBase:"a nonzero base to the zero power equals 1",positiveExponentForm:"Write the expression using positive exponents only.",subtractThenReciprocal:"subtract exponents, then write the reciprocal",chooseNegativeIdentity:"Choose the correct zero- or negative-exponent identity",
    multiplyMonomials:"Multiply the multivariable monomials.",coefficientsAndExponents:"multiply coefficients and add exponents of like variables",missingMonomial:"Find the missing monomial factor.",divideCoefficientsSubtract:"divide coefficients and subtract exponents of like variables",divideMonomials:"Simplify the monomial quotient.",powerMonomial:"Raise the monomial to a power.",chooseMonomialCheck:"Choose the correct monomial-power calculation",
    simplifyMultiRule:"Apply several exponent rules in order.",applyInOrder:"handle the power first, then multiplication and division",missingFactor:"Find the missing exponential factor.",multipliedInsteadOfAdded:"the exponents were multiplied instead of added for like-base products",addedInsteadOfMultiplied:"the exponents were added instead of multiplied in a power of a power",forgotCoefficient:"the coefficient was omitted",wrongReciprocal:"the reciprocal was handled incorrectly",zeroExponentError:"the zero exponent rule was misused",noError:"there is no error",distributedExponent:"the exponent was distributed incorrectly",identifyError:"Identify the exponent-law error.",simplifyQuotient:"Simplify the multivariable quotient.",subtractEachVariable:"subtract exponents separately for each variable",chooseEquivalentStatement:"Choose the equivalent exponential statement",cancelCommonFactor:"expand the power of a product and cancel the common factor"
  }}
  function buildQuestion(concept,task,variant,rng,lang){const t=translations(lang);if(concept==="product-quotient")return productFamily(task,variant,rng,t);if(concept==="power-rules")return powerFamily(task,variant,rng,t);if(concept==="zero-negative-exponents")return negativeFamily(task,variant,rng,t);if(concept==="multivariable-coefficients")return multiFamily(task,variant,rng,t);return diagnosisFamily(task,variant,rng,t)}
  const difficultyAt=i=>i<25?"easy":i<55?"medium":i<80?"hard":"expert";
  const validate=q=>Boolean(q.main&&key(q.answer)&&unique(q.distractors||[]).filter(value=>key(value)!==key(q.answer)).length>=5&&q.lines?.length);
  const templates=[];let index=0;
  variants.forEach((representation,variant)=>concepts.forEach(concept=>forms.forEach(task=>{const current=index++;templates.push({id:`${concept.id}-${task}-${representation}`,familyId:`${concept.id}-${task}`,conceptId:concept.id,difficulty:difficultyAt(current),taskForm:task,inputRepresentation:representation,outputKind:task==="interpret"?"rule-meaning":task==="diagnose"?"verified-equivalence":"simplified-expression",reasoningPattern:`${concept.id}:${task}`,constraintPattern:`${representation}:${variant+1}`,parameterPolicy:{integerBounds:variant<2?[1,12]:[1,20],excludes:["zero-denominator","equivalent-duplicate-options"]},build:({rng,lang})=>buildQuestion(concept.id,task,variant,rng,lang),validate})})));
  concepts.forEach((concept,i)=>templates.push({id:`${concept.id}-capstone`,familyId:`${concept.id}-diagnose`,conceptId:concept.id,difficulty:"expert",taskForm:"diagnose",inputRepresentation:"multi-representation-capstone",outputKind:"verified-conclusion",reasoningPattern:`${concept.id}:multi-step-verification`,constraintPattern:`capstone:${i+1}`,parameterPolicy:{integerBounds:[1,20],minimumReasoningSteps:2},build:({rng,lang})=>buildQuestion(concept.id,"diagnose",3,rng,lang),validate}));
  registry.registerTool({toolId:"exponent-laws",version:"2",concepts,templates});window.MCLQuizTool.gameId="exponent-laws";window.MCLQuizTool.course="pre-algebra";window.MCLExponentLawsBank={templates,audit:()=>registry.auditTool("exponent-laws"),auditGeneration:s=>registry.auditGeneration("exponent-laws",{samplesPerTemplate:s||20})};
})();
