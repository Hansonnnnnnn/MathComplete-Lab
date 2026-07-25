(function(root){
  "use strict";
  const factory=root.MCLSemanticBankFactory;
  if(!factory||root.MCLQuestionTemplates?.getTool("integration-practice"))return;
  const concepts=["basic-antiderivatives","definite-integrals-ftc","substitution","area-net-change","mixed-applications"];
  const tx=(l,en,zh)=>l==="zh"?zh:en,signed=n=>n<0?String(n):`+${n}`,txt=v=>`\\text{${v}}`;
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
  const frac=(a,b)=>{if(b<0){a=-a;b=-b;}const d=gcd(a,b);a/=d;b/=d;return b===1?String(a):`\\frac{${a}}{${b}}`;};
  function q(main,answer,distractors,lines,parameters,type,prompt){return{main,plain:main,prompt,answer:String(answer),distractors:distractors.map(String),lines,parameters,audit:{generatorId:type}};}
  function basic(form,r,l){
    const a=r.int(2,8),n=r.int(1,5),b=r.int(-6,6),den=n+1,coef=frac(a,den);
    if(form==="direct")return q(`\\int(${a}x^${n}${signed(b)})\\,dx`,`${coef}x^${den}${b===0?"":signed(b)+"x"}+C`,[`${a*n}x^${n-1}${b===0?"":signed(b)}+C`,`${a}x^${den}${b===0?"":signed(b)+"x"}+C`,`${coef}x^${n}${b===0?"":signed(b)+"x"}+C`,`${coef}x^${den}${b===0?"":signed(b)+"x"}`,`${a}x^${n}+C`],[{line:"\\int x^n dx=x^{n+1}/(n+1)",note:"power rule"},{line:`${coef}x^${den}${b===0?"":signed(b)+"x"}+C`,note:"integrate each term"}],{a,n,b},"integral-power-polynomial",tx(l,"Find the indefinite integral.","求不定积分。"));
    if(form==="inverse")return q(`F(x)=${a}x^${den}${signed(b)},\\quad F'(x)=?`,`${a*den}x^${n}`,[`${a}x^${n}`,`${a*den}x^${den}`,`${den}x^${n}`,`${a*den}x^${n}+C`,String(b)],[{line:`(x^${den})'=${den}x^${n}`,note:"differentiate the antiderivative"},{line:`F'(x)=${a*den}x^${n}`,note:"recover the integrand"}],{a,n,b},"integral-recover-integrand",tx(l,"Recover the integrand from an antiderivative.","由原函数反求被积函数。"));
    if(form==="interpret")return q(`\\int ${a}x^${n}\\,dx`,txt(tx(l,"a family of antiderivatives","一族原函数")),[txt(tx(l,"one unique function","唯一函数")),txt(tx(l,"a definite numerical area","一个确定数值面积")),txt(tx(l,"the derivative at one point","某点导数")),txt(tx(l,"an equation with no solutions","无解方程")),txt(tx(l,"a sequence","数列"))],[{line:txt("F(x)+C"),note:"different constants give the same derivative"}],{a,n},"integral-constant-meaning",tx(l,"Interpret the constant of integration.","解释积分常数的意义。"));
    if(form==="translate"){
      const x0=r.int(1,3),y0=r.int(-4,5),base=a*x0*x0/2+b*x0,c=y0-base,answer=`${frac(a,2)}x^2${b===0?"":signed(b)+"x"}${signed(c)}`;
      return q(`y'=${a}x${signed(b)},\\quad y(${x0})=${y0}`,answer,[`${frac(a,2)}x^2${b===0?"":signed(b)+"x"}+C`,`${a}x^2${b===0?"":signed(b)+"x"}${signed(c)}`,`${frac(a,2)}x^2${signed(c)}`,`${a}x${signed(b)}`,String(y0)],[{line:`y=${frac(a,2)}x^2${b===0?"":signed(b)+"x"}+C`,note:"integrate"},{line:`y(${x0})=${y0}\\Rightarrow C=${c}`,note:"use the initial value"},{line:answer,note:"particular solution"}],{a,b,x0,y0,c},"integral-initial-value",tx(l,"Solve an initial-value problem.","求解初值问题。"));
    }
    return q(`\\int ${a}x^${n}\\,dx`,`${coef}x^${den}+C`,[`${a*n}x^${n-1}+C`,`${a}x^${den}+C`,`${coef}x^${n}+C`,`${coef}x^${den}`,`${a}x^${n}+C`],[{line:tx(l,"Increase the exponent first, then divide by the new exponent.","先把指数加一，再除以新指数。"),note:"diagnose"},{line:`${coef}x^${den}+C`,note:"correct antiderivative"}],{a,n},"integral-diagnose-power",tx(l,"Correct a power-rule integration error.","纠正积分幂法则错误。"));
  }
  function definite(form,r,l){
    const a=r.int(1,5),low=r.int(0,3),high=low+r.int(1,4),value=a*(high*high-low*low);
    if(form==="direct")return q(`\\int_${low}^${high}${2*a}x\\,dx`,String(value),[String(a*(high-low)),String(a*high*high),String(-value),String(value+1),`${value}+C`],[{line:`F(x)=${a}x^2`,note:"antiderivative"},{line:`F(${high})-F(${low})=${value}`,note:"evaluate bounds"}],{a,low,high},"integral-definite-polynomial",tx(l,"Evaluate a definite integral.","计算定积分。"));
    if(form==="inverse"){
      const upper=r.int(2,6),target=upper*upper;
      return q(`\\int_0^b2x\\,dx=${target},\\quad b>0`,`b=${upper}`,[`b=${target}`,`b=${2*upper}`,`b=${-upper}`,`b=${upper+1}`,"b=0"],[{line:"\\int_0^b2x\\,dx=b^2",note:"FTC"},{line:`b^2=${target}`,note:"set target"},{line:`b=${upper}`,note:"positive bound"}],{upper,target},"integral-inverse-upper-bound",tx(l,"Find an unknown upper bound.","反求积分上限。"));
    }
    if(form==="interpret"){
      const negative=-r.int(2,8);
      return q(`\\int_${low}^${high}f(x)\\,dx=${negative}`,txt(tx(l,"net signed area is negative","净有向面积为负")),[txt(tx(l,"total geometric area is negative","几何总面积为负")),txt(tx(l,"f is negative everywhere","f 处处为负")),txt(tx(l,"f is decreasing everywhere","f 处处递减")),txt(tx(l,"the integral is undefined","积分无定义")),txt(tx(l,"the bounds are equal","上下限相等"))],[{line:txt(tx(l,"Definite integrals measure signed accumulation.","定积分表示有符号累积量。")),note:"interpret"}],{low,high,negative},"integral-signed-accumulation",tx(l,"Interpret a negative definite integral.","解释负的定积分。"));
    }
    if(form==="translate"){
      const m=r.int(2,5),b=r.int(-3,3),inner=`${m}x${signed(b)}`;
      return q(`\\frac{d}{dx}\\int_1^{${inner}}(t^2+${a})\\,dt`,`${m}[(${inner})^2+${a}]`,[`(${inner})^2+${a}`,`${2*m}(${inner})`,`${m}(x^2+${a})`,`-${m}[(${inner})^2+${a}]`,`(${inner})^2+${a}+C`],[{line:"d/dx\\int_a^{g(x)}f(t)dt=f(g(x))g'(x)",note:"FTC chain rule"},{line:`${m}[(${inner})^2+${a}]`,note:"substitute and multiply"}],{m,b,a},"integral-ftc-chain",tx(l,"Differentiate an integral with a composite upper bound.","求复合上限积分的导数。"));
    }
    return q(`\\int_${low}^${high}${2*a}x\\,dx`,String(value),[String(a*high*high),String(-value),String(a*low*low),`${value}+C`,String(value+high)],[{line:`F(${high})-F(${low})`,note:"upper minus lower"},{line:String(value),note:"correct result"}],{a,low,high},"integral-diagnose-bounds",tx(l,"Correct an F(b)-F(a) error.","纠正定积分上下限代入错误。"));
  }
  function substitution(form,r,l){
    const a=r.int(2,6),b=r.int(1,5),n=r.int(2,5),coef=r.int(2,5);
    if(form==="direct")return q(`\\int ${a*n}x^{${n-1}}(${a}x^${n}${signed(b)})^${coef}\\,dx`,`\\frac{1}{${coef+1}}(${a}x^${n}${signed(b)})^${coef+1}+C`,[`(${a}x^${n}${signed(b)})^${coef+1}+C`,`\\frac{1}{${coef}}(${a}x^${n}${signed(b)})^${coef}+C`,`\\frac{1}{${coef+1}}(${a}x^${n}${signed(b)})^${coef+1}`,`${a*n}x^${n-1}(${a}x^${n}${signed(b)})^${coef+1}+C`,"0"],[{line:`u=${a}x^${n}${signed(b)},\\ du=${a*n}x^${n-1}dx`,note:"substitute"},{line:`\\int u^${coef}du=u^${coef+1}/${coef+1}+C`,note:"integrate"},{line:`\\frac{1}{${coef+1}}(${a}x^${n}${signed(b)})^${coef+1}+C`,note:"back-substitute"}],{a,b,n,coef},"integral-u-power",tx(l,"Evaluate by u-substitution.","使用换元积分。"));
    if(form==="inverse")return q(`u=${a}x^${n}${signed(b)},\\quad du=?`,`${a*n}x^${n-1}dx`,[`${a}x^${n-1}dx`,`${n}x^${n-1}dx`,`${a*n}x^${n}dx`,`${a}x^${n}dx`,`${a*n}dx`],[{line:`du/dx=${a*n}x^${n-1}`,note:"differentiate u"},{line:`du=${a*n}x^${n-1}dx`,note:"write differential"}],{a,b,n},"integral-substitution-differential",tx(l,"Find the differential for a substitution.","求换元中的微分。"));
    if(form==="interpret")return q(`\\int ${a}\\cos(${a}x${signed(b)})\\,dx`,`u=${a}x${signed(b)}`,[`u=\\cos(${a}x${signed(b)})`,"u=x",`u=${a}\\cos x`,`u=\\sin x`,`u=${b}x${signed(a)}`],[{line:tx(l,"Choose the repeated inner expression.","选择反复出现的内层表达式。"),note:"identify u"}],{a,b},"integral-choose-substitution",tx(l,"Choose an efficient substitution.","选择合适的换元。"));
    if(form==="translate")return q(`\\int ${a}e^{${a}x${signed(b)}}\\,dx`,`e^{${a}x${signed(b)}}+C`,[`${a}e^{${a}x${signed(b)}}+C`,`\\frac{1}{${a}}e^{${a}x${signed(b)}}+C`,`e^{${a}x${signed(b)}}`,`(${a}x${signed(b)})e^x+C`,"0"],[{line:`u=${a}x${signed(b)},\\ du=${a}dx`,note:"linear substitution"},{line:"\\int e^u du=e^u+C",note:"integrate"},{line:`e^{${a}x${signed(b)}}+C`,note:"back-substitute"}],{a,b},"integral-exponential-substitution",tx(l,"Translate a linear inner function into u.","对指数函数作线性换元。"));
    return q(`\\int ${a}\\cos(${a}x${signed(b)})\\,dx`,`\\sin(${a}x${signed(b)})+C`,[`${a}\\sin(${a}x${signed(b)})+C`,`\\frac{1}{${a}}\\sin(${a}x${signed(b)})+C`,`\\sin(${a}x${signed(b)})`,`-\\sin(${a}x${signed(b)})+C`,`\\cos(${a}x${signed(b)})+C`],[{line:`du=${a}dx`,note:"the coefficient is already present"},{line:`\\sin(${a}x${signed(b)})+C`,note:"correct"}],{a,b},"integral-diagnose-inner-factor",tx(l,"Correct an extra or missing inner-factor adjustment.","纠正内层系数调整错误。"));
  }
  function area(form,r,l){
    const a=r.int(1,5),b=r.int(1,5),high=r.int(2,6),net=a*high*high/2+b*high;
    if(form==="direct")return q(`\\text{Area under }y=${a}x${signed(b)}\\text{ on }[0,${high}]`,String(net),[String(a*high+b),String(a*high*high+b),String(net+1),String(2*net),String(-net)],[{line:`\\int_0^${high}(${a}x${signed(b)})dx`,note:"area integral"},{line:String(net),note:"evaluate"}],{a,b,high},"integral-area-positive",tx(l,"Find area under a positive curve.","求正函数图像下方面积。"));
    if(form==="inverse"){const rate=r.int(2,6),time=r.int(2,6),change=rate*time;return q(`\\int_0^T${rate}\\,dt=${change}`,`T=${time}`,[`T=${change}`,`T=${rate}`,`T=${time+1}`,`T=${-time}`,"T=0"],[{line:`${rate}T=${change}`,note:"constant accumulation"},{line:`T=${time}`,note:"solve"}],{rate,time,change},"integral-inverse-accumulation-time",tx(l,"Find time from accumulated change.","由累积变化量反求时间。"));
    }
    if(form==="interpret")return q(`\\int_0^${high}v(t)\\,dt`,txt(tx(l,"net displacement","净位移")),[txt(tx(l,"total distance in every case","任何情况下的总路程")),txt(tx(l,"instantaneous velocity","瞬时速度")),txt(tx(l,"acceleration","加速度")),txt(tx(l,"average position","平均位置")),txt(tx(l,"maximum speed","最大速度"))],[{line:txt(tx(l,"Integrating velocity accumulates signed displacement.","速度积分得到有向位移。")),note:"interpret"}],{high},"integral-velocity-meaning",tx(l,"Interpret an integral of velocity.","解释速度的定积分。"));
    if(form==="translate")return q(`v(t)=${a}t${signed(b)},\\quad 0\\le t\\le${high}`,String(net),[String(a*high+b),String(a*high*high+b),String(-net),String(net+high),`${net}+C`],[{line:`\\Delta s=\\int_0^${high}v(t)dt`,note:"net-change theorem"},{line:String(net),note:"evaluate"}],{a,b,high},"integral-net-change",tx(l,"Translate a rate into net change.","把变化率转化为净变化量。"));
    const negative=-r.int(2,8);
    return q(`\\int_0^${high}f(x)dx=${negative}`,txt(tx(l,"geometric area requires splitting and absolute values","几何面积需分段并取绝对值")),[txt(tx(l,`geometric area is ${negative}`,`几何面积为 ${negative}`)),txt(tx(l,"geometric area is always the signed integral","几何面积总等于有向积分")),txt(tx(l,"the curve never crosses the axis","曲线从不穿过横轴")),txt(tx(l,"the integral is undefined","积分无定义")),txt(tx(l,"add C to obtain area","加 C 得到面积"))],[{line:txt(tx(l,"Signed accumulation and total geometric area are different.","有向累积与几何总面积不同。")),note:"diagnose"}],{high,negative},"integral-diagnose-area-vs-net",tx(l,"Correct confusion between area and net signed accumulation.","纠正几何面积与净有向面积混淆。"));
  }
  function mixed(form,r,l){
    const a=r.int(2,6),b=r.int(1,5),c=r.int(1,5);
    if(form==="direct")return q(`\\int(${a}x^2${signed(b)}e^x${signed(c)}\\sin x)dx`,`\\frac{${a}}{3}x^3${signed(b)}e^x-${c}\\cos x+C`,[`${2*a}x${signed(b)}e^x${signed(c)}\\cos x+C`,`\\frac{${a}}{3}x^3${signed(b)}e^x+${c}\\cos x+C`,`\\frac{${a}}{3}x^3${signed(b)}e^x-${c}\\cos x`,` ${a}x^2${signed(b)}e^x${signed(c)}\\sin x+C`,"0"],[{line:"integrate term by term",note:"linearity"},{line:`\\frac{${a}}{3}x^3${signed(b)}e^x-${c}\\cos x+C`,note:"combine"}],{a,b,c},"integral-mixed-functions",tx(l,"Integrate a mixed sum.","积分混合函数和。"));
    if(form==="inverse"){const target=a;return q(`\\int_0^1kx\\,dx=${frac(target,2)}`,`k=${target}`,[`k=${target*2}`,`k=${frac(target,2)}`,`k=${target+1}`,`k=${-target}`,"k=0"],[{line:"\\int_0^1kx dx=k/2",note:"evaluate"},{line:`k/2=${frac(target,2)}`,note:"match"},{line:`k=${target}`,note:"solve"}],{target},"integral-mixed-parameter",tx(l,"Find a parameter from a definite integral.","由定积分反求参数。"));
    }
    if(form==="interpret")return q(`F'(x)=f(x)`,txt(tx(l,"F(x)+C are all antiderivatives of f","F(x)+C 都是 f 的原函数")),[txt(tx(l,"only F is an antiderivative","只有 F 是原函数")),txt(tx(l,"F+C has a different derivative","F+C 的导数不同")),txt(tx(l,"f+C is an antiderivative","f+C 是原函数")),txt(tx(l,"F must be zero","F 必须为零")),txt(tx(l,"no antiderivative exists","不存在原函数"))],[{line:"(F+C)'=F'=f",note:"constant derivative is zero"}],{a},"integral-antiderivative-family",tx(l,"Interpret an antiderivative family.","解释原函数族。"));
    if(form==="translate"){const val=r.int(2,10);return q(`\\int_1^0 f(x)dx\\quad\\text{if}\\quad\\int_0^1f(x)dx=${val}`,String(-val),[String(val),"0",String(val+1),String(-val-1),`${-val}+C`],[{line:"\\int_b^a f=-\\int_a^b f",note:"reverse bounds"},{line:String(-val),note:"apply"}],{val},"integral-reverse-bounds",tx(l,"Translate reversed bounds.","处理反向积分上下限。"));}
    const low=0,high=2,value=2*a;
    return q(`\\int_${low}^${high}${a}\\,dx`,String(value),[`${value}+C`,String(a),String(-value),String(value+1),"0"],[{line:tx(l,"A definite integral is a number, so do not append +C.","定积分结果是数值，不加 +C。"),note:"diagnose"},{line:String(value),note:"correct result"}],{a,low,high},"integral-diagnose-definite-C",tx(l,"Correct the unnecessary +C in a definite integral.","纠正定积分误加 +C。"));
  }
  const builders={"basic-antiderivatives":basic,"definite-integrals-ftc":definite,"substitution":substitution,"area-net-change":area,"mixed-applications":mixed};
  factory.register({toolId:"integration-practice",course:"single-variable-calculus",concepts,integerBounds:[-20,60],build:c=>builders[c.conceptId](c.taskForm,c.rng,c.lang==="zh"?"zh":"en")});
})(typeof window!=="undefined"?window:globalThis);
