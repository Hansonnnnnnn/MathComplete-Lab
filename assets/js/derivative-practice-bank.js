(function(root){
  "use strict";
  const factory=root.MCLSemanticBankFactory;
  if(!factory||root.MCLQuestionTemplates?.getTool("derivative-practice"))return;
  const concepts=["basic-rules","product-quotient","chain-rule","trig-exponential-log","tangent-rate-applications"];
  const tx=(l,en,zh)=>l==="zh"?zh:en,signed=n=>n<0?String(n):`+${n}`,txt=v=>`\\text{${v}}`;
  function q(main,answer,distractors,lines,parameters,type,prompt){return{main,plain:main,prompt,answer:String(answer),distractors:distractors.map(String),lines,parameters,audit:{generatorId:type}};}
  function basic(form,r,l){
    const a=r.int(2,8),n=r.int(2,6),b=r.int(-7,7),x=r.int(-3,4),der=a*n;
    if(form==="direct")return q(`\\frac{d}{dx}(${a}x^${n}${signed(b)})`,`${der}x^${n-1}`,[`${a}x^${n-1}`,`${der}x^${n}`,`${n}x^${n-1}`,`${der}x^${n-1}${signed(b)}`,"0"],[{line:`(ax^n)'=anx^{n-1}`,note:"power rule"},{line:`${der}x^${n-1}`,note:"simplify"}],{a,n,b},"derivative-power-rule",tx(l,"Differentiate using the power rule.","用幂法则求导。"));
    if(form==="inverse"){const target=der*x**(n-1);return q(`f(x)=kx^${n},\\quad f'(${x})=${target}`,`k=${a}`,[`k=${der}`,`k=${n}`,`k=${target}`,`k=${a+1}`,`k=${-a}`],[{line:`f'(x)=${n}kx^${n-1}`,note:"differentiate"},{line:`${n}k(${x})^${n-1}=${target}`,note:"substitute"},{line:`k=${a}`,note:"solve"}],{a,n,x,target},"derivative-inverse-coefficient",tx(l,"Recover a coefficient from a derivative value.","由导数值反求系数。"));}
    if(form==="interpret")return q(`f(x)=${a}x${signed(b)}`,txt(tx(l,"constant slope","斜率恒定")),[txt(tx(l,"increasing slope","斜率递增")),txt(tx(l,"decreasing slope","斜率递减")),txt(tx(l,"zero slope everywhere","处处斜率为零")),txt(tx(l,"not differentiable","不可导")),txt(tx(l,"periodic slope","斜率周期变化"))],[{line:`f'(x)=${a}`,note:"interpret the derivative"}],{a,b},"derivative-linear-interpretation",tx(l,"Interpret the derivative of a linear function.","解释线性函数的导数。"));
    if(form==="translate"){const slope=der*x**(n-1);return q(`f(x)=${a}x^${n},\\quad x=${x}`,String(slope),[String(der),String(a*x**n),String(slope+1),String(-slope),"0"],[{line:`f'(x)=${der}x^${n-1}`,note:"differentiate"},{line:`f'(${x})=${slope}`,note:"evaluate slope"}],{a,n,x,slope},"derivative-tangent-slope",tx(l,"Translate the derivative into a tangent slope.","把导数转化为切线斜率。"));}
    return q(`\\frac{d}{dx}(${a}x^${n})`,`${der}x^${n-1}`,[`${a}x^${n-1}`,`${der}x^${n}`,`${n}x^${n-1}`,`${a*n-1}x^${n-1}`,"0"],[{line:tx(l,"Multiply by the old exponent, then subtract one from the exponent.","先乘原指数，再把指数减一。"),note:"diagnose"},{line:`${der}x^${n-1}`,note:"correct derivative"}],{a,n},"derivative-diagnose-power",tx(l,"Correct a power-rule error.","纠正幂法则错误。"));
  }
  function product(form,r,l){
    const a=r.int(2,6),b=r.int(1,5),c=r.int(1,5),x=r.int(1,4);
    const expandedDer=`${3*a}x^2${signed(2*a*b)}x${signed(c)}`;
    if(form==="interpret")return q(
      `h(x)=f(x)g(x)`,
      `(fg)'=f'g+fg'`,
      [`(fg)'=f'g'`,`(fg)'=fg'`,`(fg)'=f'g`,`(fg)'=\\frac{f'}{g'}`,`(fg)'=f'+g'`],
      [{line:"(fg)'=f'g+fg'",note:"product rule has two terms"}],
      {rule:"product"},
      "derivative-product-identity",
      tx(l,"Choose the correct product rule.","\u9009\u62e9\u6b63\u786e\u7684\u4e58\u6cd5\u6cd5\u5219\u3002")
    );
    if(form==="direct")return q(`\\frac{d}{dx}\\left[x^${a>3?3:2}(${b}x${signed(c)})\\right]`,a>3?`${3*b}x^3${signed(3*c)}x^2`:`${3*b}x^2${signed(2*c)}x`,[`${b}x^2${signed(c)}`,`${2*b}x^2${signed(c)}x`,`${3*b}x^2`,`${b}x^3${signed(c)}x^2`,"0"],[{line:"(uv)'=u'v+uv'",note:"product rule"},{line:a>3?`${3*b}x^3${signed(3*c)}x^2`:`${3*b}x^2${signed(2*c)}x`,note:"expand"}],{a,b,c},"derivative-product-rule",tx(l,"Differentiate a product.","使用乘法法则求导。"));
    if(form==="inverse"){const k=r.int(2,7),target=2*x+k;return q(`f(x)=x^2+kx,\\quad f'(${x})=${target}`,`k=${k}`,[`k=${target}`,`k=${2*x}`,`k=${k+1}`,`k=${-k}`,"k=0"],[{line:"f'(x)=2x+k",note:"differentiate"},{line:`${2*x}+k=${target}`,note:"evaluate"},{line:`k=${k}`,note:"solve"}],{k,x,target},"derivative-product-parameter",tx(l,"Find a parameter from a derivative condition.","由导数条件反求参数。"));}
    if(form==="interpret")return q(`h(x)=f(x)g(x)`,txt("(fg)'=f'g+fg'"),[txt("(fg)'=f'g'"),txt("(fg)'=fg'"),txt("(fg)'=f'g"),txt("(fg)'=f'/g'"),txt("(fg)'=f'+g'")],[{line:"(fg)'=f'g+fg'",note:"product rule has two terms"}],{a},"derivative-product-identity",tx(l,"Choose the correct product rule.","选择正确的乘法法则。"));
    if(form==="translate"){const num=2*x*(x+c)-(x*x+b),den=(x+c)**2,ans=`\\frac{${num}}{${den}}`;return q(`f(x)=\\frac{x^2+${b}}{x+${c}},\\quad f'(${x})`,ans,[`\\frac{${2*x}}{${x+c}}`,`\\frac{${num}}{${x+c}}`,`\\frac{${-num}}{${den}}`,`\\frac{${2*x*(x+c)+(x*x+b)}}{${den}}`,String(num)],[{line:"f'=(u'v-uv')/v^2",note:"quotient rule"},{line:`f'(${x})=${ans}`,note:"evaluate"}],{b,c,x,num,den},"derivative-quotient-at-point",tx(l,"Evaluate a quotient derivative at a point.","计算某点的商函数导数。"));}
    return q(`\\frac{d}{dx}[x^2(${b}x${signed(c)})]`,`${3*b}x^2${signed(2*c)}x`,[`${2*b}x^2${signed(2*c)}x`,`${3*b}x^2`,`${b}x^3${signed(c)}x^2`,`${2*b}x${signed(c)}`,"0"],[{line:"u'v+uv'",note:"include both product-rule terms"},{line:`${3*b}x^2${signed(2*c)}x`,note:"combine"}],{b,c},"derivative-diagnose-product",tx(l,"Correct the omitted product-rule term.","纠正乘法法则漏项。"));
  }
  function chain(form,r,l){
    const a=r.int(2,6),b=r.int(-5,5),n=r.int(2,5),coef=a*n;
    if(form==="direct")return q(`\\frac{d}{dx}(${a}x${signed(b)})^${n}`,`${coef}(${a}x${signed(b)})^${n-1}`,[`${n}(${a}x${signed(b)})^${n-1}`,`${a}(${a}x${signed(b)})^${n-1}`,`${coef}(${a}x${signed(b)})^${n}`,`${coef}x^${n-1}`,"0"],[{line:`u=${a}x${signed(b)},\\ u'=${a}`,note:"inner function"},{line:`${n}u^${n-1}u'=${coef}(${a}x${signed(b)})^${n-1}`,note:"chain rule"}],{a,b,n},"derivative-chain-power",tx(l,"Apply the chain rule to a power.","对复合幂函数使用链式法则。"));
    if(form==="inverse"){const outer=r.int(2,5),target=outer*a;return q(`f(x)=(${a}x+1)^${outer},\\quad\\text{coefficient of }(${a}x+1)^${outer-1}\\text{ in }f'(x)`,String(target),[String(outer),String(a),String(target+1),String(a+outer),String(outer*a*a)],[{line:`f'=${outer}(${a}x+1)^${outer-1}\\cdot${a}`,note:"chain rule"},{line:String(target),note:"coefficient"}],{a,outer},"derivative-chain-inverse-factor",tx(l,"Recover the chain-rule multiplier.","识别链式法则的乘数。"));}
    if(form==="interpret")return q(`f(x)=\\sin(${a}x${signed(b)})`,txt(tx(l,`${a}x${signed(b)} is the inner function`,`${a}x${signed(b)} 是内层函数`)),[txt(tx(l,"sin x is the inner function","sin x 是内层函数")),txt(tx(l,"x is the outer function","x 是外层函数")),txt(tx(l,"there is no composition","不存在复合")),txt(tx(l,"the product rule is required","需要乘法法则")),txt(tx(l,"the quotient rule is required","需要除法法则"))],[{line:`u=${a}x${signed(b)}`,note:"identify composition"}],{a,b},"derivative-chain-structure",tx(l,"Identify the inner function.","识别复合函数的内层函数。"));
    if(form==="translate"){const x=r.int(0,3),inner=a*x+b,ans=coef*inner**(n-1);return q(`f(x)=(${a}x${signed(b)})^${n},\\quad f'(${x})`,String(ans),[String(n*inner**(n-1)),String(a*inner**(n-1)),String(ans+1),String(-ans),String(inner**n)],[{line:`f'(x)=${coef}(${a}x${signed(b)})^${n-1}`,note:"chain rule"},{line:`f'(${x})=${ans}`,note:"evaluate"}],{a,b,n,x,inner},"derivative-chain-at-point",tx(l,"Evaluate a composite derivative.","计算复合函数在某点的导数。"));}
    return q(`\\frac{d}{dx}\\sin(${a}x${signed(b)})`,`${a}\\cos(${a}x${signed(b)})`,[`\\cos(${a}x${signed(b)})`,`${a}\\sin(${a}x${signed(b)})`,`-${a}\\cos(${a}x${signed(b)})`,`\\sin(${a}x${signed(b)})`,"0"],[{line:"(\\sin u)'=\\cos u\\cdot u'",note:"include inner derivative"},{line:`${a}\\cos(${a}x${signed(b)})`,note:"correct"}],{a,b},"derivative-diagnose-chain-factor",tx(l,"Correct the missing inner derivative.","纠正遗漏内层导数。"));
  }
  function common(form,r,l){
    const a=r.int(2,7),b=r.int(1,6);
    if(form==="interpret")return q(
      `f(x)=e^x`,
      `f'(x)=e^x`,
      [`f'(x)=0`,`f'(x)=\\frac{1}{x}`,`f'(x)=\\ln x`,`f'(x)=-e^x`,`f'(x)=1`],
      [{line:"(e^x)'=e^x",note:tx(l,"the derivative equals the original function","\u5bfc\u6570\u7b49\u4e8e\u539f\u51fd\u6570")}],
      {function:"exponential"},
      "derivative-exponential-interpretation",
      tx(l,"Choose the correct derivative statement.","\u9009\u62e9\u6b63\u786e\u7684\u5bfc\u6570\u7ed3\u8bba\u3002")
    );
    if(form==="direct")return q(`\\frac{d}{dx}[${a}\\sin x-${b}\\cos x]`,`${a}\\cos x+${b}\\sin x`,[`${a}\\cos x-${b}\\sin x`,`${a}\\sin x+${b}\\cos x`,`${a}\\cos x+${b}\\cos x`,`-${a}\\sin x-${b}\\cos x`,"0"],[{line:"(\\sin x)'=\\cos x,\\ (\\cos x)'=-\\sin x",note:"trig derivatives"},{line:`${a}\\cos x+${b}\\sin x`,note:"simplify"}],{a,b},"derivative-trig-combination",tx(l,"Differentiate a trigonometric combination.","求三角函数组合的导数。"));
    if(form==="inverse"){const target=a*b;return q(`f(x)=e^{kx},\\quad f'(0)=${target}`,`k=${target}`,[`k=${a}`,`k=${b}`,`k=${a+b}`,`k=${-target}`,"k=0"],[{line:"f'(x)=ke^{kx}",note:"exponential chain rule"},{line:"f'(0)=k",note:"evaluate at zero"},{line:`k=${target}`,note:"match"}],{a,b,target},"derivative-exponential-parameter",tx(l,"Find an exponential rate parameter.","反求指数函数的增长参数。"));}
    if(form==="interpret")return q(`f(x)=e^x`,txt(tx(l,"the derivative equals the function","导数等于函数本身")),[txt(tx(l,"the derivative is zero","导数为零")),txt(tx(l,"the derivative is 1/x","导数为 1/x")),txt(tx(l,"the derivative is ln x","导数为 ln x")),txt(tx(l,"the derivative is -e^x","导数为 -e^x")),txt(tx(l,"the function is not differentiable","函数不可导"))],[{line:"(e^x)'=e^x",note:"interpret self-derivative"}],{a},"derivative-exponential-interpretation",tx(l,"Interpret the derivative of e^x.","解释 e^x 的导数。"));
    if(form==="translate")return q(`\\frac{d}{dx}\\ln(${a}x${signed(b)})`,`\\frac{${a}}{${a}x${signed(b)}}`,[`\\frac{1}{${a}x${signed(b)}}`,`\\frac{${a}}{x}`,`\\ln(${a}x${signed(b)})`,`\\frac{${a}x${signed(b)}}{${a}}`,"0"],[{line:"(\\ln u)'=u'/u",note:"log chain rule"},{line:`\\frac{${a}}{${a}x${signed(b)}}`,note:"substitute"}],{a,b},"derivative-log-chain",tx(l,"Differentiate a logarithmic composition.","求对数复合函数的导数。"));
    return q(`\\frac{d}{dx}[${a}\\cos x]`,`-${a}\\sin x`,[`${a}\\sin x`,`${a}\\cos x`,`-${a}\\cos x`,`${a}\\sec^2x`,"0"],[{line:"(\\cos x)'=-\\sin x",note:"retain the negative sign"},{line:`-${a}\\sin x`,note:"correct derivative"}],{a},"derivative-diagnose-trig-sign",tx(l,"Correct the cosine sign error.","纠正余弦求导的符号错误。"));
  }
  function applications(form,r,l){
    const a=r.int(1,5),b=r.int(-6,6),t=r.int(1,5);
    if(form==="interpret"){
      const x=r.int(1,4),slope=2*a*x+b;
      const atPoint=tx(l,`at x=${x}`,`\u5728 x=${x} \u5904`);
      const answer=slope>0
        ? tx(l,`the tangent line ${atPoint} has positive slope`,`${atPoint}\u7684\u5207\u7ebf\u659c\u7387\u4e3a\u6b63`)
        : slope<0
          ? tx(l,`the tangent line ${atPoint} has negative slope`,`${atPoint}\u7684\u5207\u7ebf\u659c\u7387\u4e3a\u8d1f`)
          : tx(l,`the tangent line ${atPoint} is horizontal`,`${atPoint}\u7684\u5207\u7ebf\u662f\u6c34\u5e73\u7684`);
      const opposite=slope>0
        ? tx(l,`the tangent line ${atPoint} has negative slope`,`${atPoint}\u7684\u5207\u7ebf\u659c\u7387\u4e3a\u8d1f`)
        : tx(l,`the tangent line ${atPoint} has positive slope`,`${atPoint}\u7684\u5207\u7ebf\u659c\u7387\u4e3a\u6b63`);
      const distractors=slope===0
        ? [
            tx(l,"f is constant everywhere","f \u5728\u6574\u4e2a\u5b9a\u4e49\u57df\u4e0a\u662f\u5e38\u51fd\u6570"),
            tx(l,`f has a local maximum ${atPoint}`,`f ${atPoint}\u6709\u5c40\u90e8\u6781\u5927\u503c`),
            tx(l,`f has a local minimum ${atPoint}`,`f ${atPoint}\u6709\u5c40\u90e8\u6781\u5c0f\u503c`),
            tx(l,`f has a vertical tangent ${atPoint}`,`f ${atPoint}\u6709\u7ad6\u76f4\u5207\u7ebf`),
            tx(l,`f is discontinuous ${atPoint}`,`f ${atPoint}\u4e0d\u8fde\u7eed`)
          ]
        : [
            opposite,
            tx(l,`the tangent line ${atPoint} is horizontal`,`${atPoint}\u7684\u5207\u7ebf\u662f\u6c34\u5e73\u7684`),
            tx(l,"f is constant everywhere","f \u5728\u6574\u4e2a\u5b9a\u4e49\u57df\u4e0a\u662f\u5e38\u51fd\u6570"),
            tx(l,`f has a vertical tangent ${atPoint}`,`f ${atPoint}\u6709\u7ad6\u76f4\u5207\u7ebf`),
            tx(l,`f is not differentiable ${atPoint}`,`f ${atPoint}\u4e0d\u53ef\u5bfc`)
          ];
      const note=slope===0
        ? tx(l,"A zero derivative gives a horizontal tangent; it does not by itself prove a maximum, minimum, or constant function.","\u5bfc\u6570\u4e3a\u96f6\u53ea\u80fd\u8bf4\u660e\u8be5\u70b9\u5207\u7ebf\u6c34\u5e73\uff0c\u4e0d\u80fd\u5355\u72ec\u63a8\u51fa\u6781\u5927\u503c\u3001\u6781\u5c0f\u503c\u6216\u5e38\u51fd\u6570\u3002")
        : tx(l,"The derivative value is the slope of the tangent line at that point.","\u5bfc\u6570\u503c\u5c31\u662f\u51fd\u6570\u5728\u8be5\u70b9\u7684\u5207\u7ebf\u659c\u7387\u3002");
      return q(`f'(${x})=${slope}`,txt(answer),distractors.map(txt),[{line:`f'(${x})=${slope}`,note}],{x,slope},"derivative-monotonicity",tx(l,"What does this derivative value tell us?","\u8fd9\u4e2a\u5bfc\u6570\u503c\u80fd\u544a\u8bc9\u6211\u4eec\u4ec0\u4e48\uff1f"));
    }
    if(form==="direct"){const ans=2*a*t+b;return q(`s(t)=${a}t^2${signed(b)}t,\\quad v(${t})`,String(ans),[String(a*t*t+b*t),String(2*a),String(ans+1),String(-ans),String(2*a*t)],[{line:`v(t)=s'(t)=${2*a}t${signed(b)}`,note:"velocity is derivative of position"},{line:`v(${t})=${ans}`,note:"evaluate"}],{a,b,t},"derivative-instantaneous-velocity",tx(l,"Find instantaneous velocity.","求瞬时速度。"));}
    if(form==="inverse"){const target=2*a*t+b;return q(`s(t)=${a}t^2${signed(b)}t,\\quad v(t)=${target}`,`t=${t}`,[`t=${target}`,`t=${a}`,`t=${b}`,`t=${t+1}`,`t=${-t}`],[{line:`v(t)=${2*a}t${signed(b)}`,note:"differentiate position"},{line:`${2*a}t${signed(b)}=${target}`,note:"set target velocity"},{line:`t=${t}`,note:"solve"}],{a,b,t,target},"derivative-time-from-velocity",tx(l,"Find when a target velocity occurs.","反求达到目标速度的时间。"));}
    if(form==="interpret"){const x=r.int(1,4),slope=2*a*x+b;return q(`f'(${x})=${slope}`,txt(slope>0?tx(l,"f is increasing","f 在递增"):tx(l,"f is decreasing","f 在递减")),[txt(tx(l,"f is constant","f 保持常数")),txt(slope>0?tx(l,"f is decreasing","f 在递减"):tx(l,"f is increasing","f 在递增")),txt(tx(l,"f has a vertical asymptote","f 有竖直渐近线")),txt(tx(l,"f is discontinuous","f 不连续")),txt(tx(l,"no conclusion is possible","无法判断"))],[{line:`f'(${x})=${slope}`,note:"sign of derivative"}],{x,slope},"derivative-monotonicity",tx(l,"Interpret the sign of a derivative.","解释导数符号。"));}
    if(form==="translate"){const acc=2*a;return q(`s(t)=${a}t^2${signed(b)}t+3`,String(acc),[String(2*a*t+b),String(a),String(acc+1),String(-acc),"0"],[{line:`v(t)=${2*a}t${signed(b)}`,note:"first derivative"},{line:`a(t)=${acc}`,note:"second derivative"}],{a,b},"derivative-acceleration",tx(l,"Translate position into acceleration.","由位移函数求加速度。"));}
    const average=a*2+b,instant=2*a*2+b;
    return q(`s(t)=${a}t^2${signed(b)}t,\\quad t=2`,String(instant),[String(average),String(a*4+2*b),String(2*a),String(instant+1),String(-instant)],[{line:"instantaneous rate = s'(2)",note:"do not use an interval average"},{line:`s'(2)=${instant}`,note:"evaluate derivative"}],{a,b,average,instant},"derivative-diagnose-average-rate",tx(l,"Correct confusion between average and instantaneous rate.","纠正平均变化率与瞬时变化率混淆。"));
  }
  const builders={"basic-rules":basic,"product-quotient":product,"chain-rule":chain,"trig-exponential-log":common,"tangent-rate-applications":applications};
  factory.register({toolId:"derivative-practice",course:"single-variable-calculus",concepts,integerBounds:[-20,50],build:c=>builders[c.conceptId](c.taskForm,c.rng,c.lang==="zh"?"zh":"en")});
})(typeof window!=="undefined"?window:globalThis);
