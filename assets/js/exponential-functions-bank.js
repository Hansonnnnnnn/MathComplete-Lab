(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;const tx=F.text,sg=n=>n<0?String(n):`+${n}`,L=(lang,en,zh)=>lang==="zh"?zh:en;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  function build({conceptId,taskForm,rng,lang}){
    const base=rng.int(2,5),n=rng.int(2,5),a=rng.int(2,7),h=rng.int(-4,4),k=rng.int(-5,5),value=a*base**n,p=5*rng.int(1,8),factor=(1+p/100).toFixed(2),decay=(1-p/100).toFixed(2);
    const prompt=L(lang,"Analyze the exponential function.","分析指数函数。"),note=L(lang,"Track the initial value, multiplicative factor, exponent, and transformations.","关注初始值、倍乘因子、指数和图像变换。");
    if(conceptId==="values-representations"){
      if(taskForm==="direct")return q(`f(x)=${a}\\cdot${base}^x,\\quad f(${n})=?`,String(value),[a*base*n,a+base**n,base**n,value+base,value-base],prompt,note,{a,base,n});
      if(taskForm==="inverse")return q(`${a}\\cdot${base}^{\\Box}=${value}`,String(n),[n-1,n+1,base,a,value,0],prompt,note,{a,base,n});
      if(taskForm==="interpret")return q(`f(x)=${a}\\cdot${base}^x`,tx(L(lang,`initial value ${a}; multiply by ${base} per unit`,`初始值 ${a}；每增加 1 倍乘 ${base}`)),[tx(L(lang,`initial value ${base}`,`初始值 ${base}`)),tx(L(lang,`add ${base} per unit`,`每次增加 ${base}`)),tx(L(lang,"linear function","线性函数")),tx(L(lang,`initial value ${a*base}`,`初始值 ${a*base}`)),tx(L(lang,"constant function","常数函数"))],prompt,note,{a,base});
      if(taskForm==="translate")return q(tx(L(lang,`initial value ${a}, multiplied by ${base} each step`,`初始值 ${a}，每步乘 ${base}`)),`f(x)=${a}\\cdot${base}^x`,[`f(x)=${base}\\cdot${a}^x`,`f(x)=${a}+${base}x`,`f(x)=${a}x^{${base}}`,`f(x)=${a}\\cdot${base+1}^x`,`f(x)=${a+1}\\cdot${base}^x`],prompt,note,{a,base});
      return q(`f(0)=${a*base}\\ \\text{for}\\ f(x)=${a}\\cdot${base}^x`,tx(L(lang,"f(1) was mistaken for the initial value","把 f(1) 误当成初始值")),[tx(L(lang,"correct","正确")),tx(L(lang,"base must be zero","底数必须为零")),tx(L(lang,"no initial value","没有初始值")),tx(L(lang,"coefficient is the rate","系数就是变化率")),tx(L(lang,"initial value is the exponent","初始值等于指数"))],prompt,note,{a,base});
    }
    if(conceptId==="growth-decay"){
      if(taskForm==="direct")return q(tx(L(lang,`multiplier for ${p}% growth`,`增长 ${p}% 的倍乘因子`)),factor,[(1+p).toFixed(2),(p/100).toFixed(2),decay,(2+p/100).toFixed(2),(1-p).toFixed(2)],prompt,note,{p});
      if(taskForm==="inverse")return q(`A(t)=${a}(${factor})^t`,`${p}%`,[`${100+p}%`,`${100-p}%`,`${p/10}%`,`${p+5}%`,`${p-5}%`],prompt,note,{a,p});
      if(taskForm==="interpret")return q(`P(t)=${a}(${decay})^t`,tx(L(lang,`decreases ${p}% each period`,`每期减少 ${p}%`)),[tx(L(lang,`increases ${p}% each period`,`每期增加 ${p}%`)),tx(L(lang,`decreases ${100-p}% each period`,`每期减少 ${100-p}%`)),tx(L(lang,"fixed decrease","固定数量减少")),tx(L(lang,"stays constant","保持不变")),tx(L(lang,`initial value ${decay}`,`初始值 ${decay}`))],prompt,note,{a,p});
      if(taskForm==="translate")return q(tx(L(lang,`initial amount ${a}; decrease ${p}% per period`,`初始量 ${a}；每期减少 ${p}%`)),`A(t)=${a}(${decay})^t`,[`A(t)=${a}(${factor})^t`,`A(t)=${a}-${p}t`,`A(t)=${decay}(${a})^t`,`A(t)=${a}(1-${p})^t`,`A(t)=(${a-p})^t`],prompt,note,{a,p});
      return q(`${p}%\\ \\text{decay}\\Rightarrow (1+${p/100})^t`,tx(L(lang,"decay requires 1-r, not 1+r","衰减因子应为 1-r，而不是 1+r")),[tx(L(lang,"correct","正确")),tx(L(lang,"remove exponent","删除指数")),tx(L(lang,"initial value must be one","初始值必须为 1")),tx(L(lang,"percent cannot be decimal","百分数不能写成小数")),tx(L(lang,"decay must be linear","衰减必须是线性的"))],prompt,note,{p});
    }
    if(conceptId==="transformations"){
      const f=`y=${base}^{x${sg(-h)}}${sg(k)}`;
      if(taskForm==="direct")return q(f,`y=${k}`,[`x=${k}`,`y=${h}`,`x=${h}`,`y=${-k}`,`y=0`],prompt,note,{base,h,k});
      if(taskForm==="inverse")return q(`y=${base}^{x-\\Box}${sg(k)},\\quad \\text{right }${h}`,String(h),[-h,k,base,h+1,h-1,0],prompt,note,{base,h,k});
      if(taskForm==="interpret")return q(f,tx(L(lang,`right ${h}; vertical shift ${k}`,`右移 ${h}；竖直平移 ${k}`)),[tx(L(lang,`left ${h}`,`左移 ${h}`)),tx(L(lang,`horizontal shift ${k}`,`水平平移 ${k}`)),tx(L(lang,"reflect across y-axis","关于 y 轴反射")),tx(L(lang,"no asymptote","没有渐近线")),tx(L(lang,"quadratic graph","二次函数图像"))],prompt,note,{base,h,k});
      if(taskForm==="translate")return q(tx(L(lang,`shift y=${base}^x right ${h} and up ${k}`,`将 y=${base}^x 右移 ${h}、上移 ${k}`)),f,[`y=${base}^{x${sg(h)}}${sg(k)}`,`y=${base}^{x${sg(-h)}}${sg(-k)}`,`y=${base+h}^x${sg(k)}`,`y=${base}^{x}${sg(h+k)}`,`y=-${base}^{x${sg(-h)}}${sg(k)}`],prompt,note,{base,h,k});
      return q(`${f}\\Rightarrow \\text{asymptote }x=${k}`,tx(L(lang,"horizontal asymptote written as a vertical line","把水平渐近线误写成竖直线")),[tx(L(lang,"correct","正确")),tx(L(lang,"no asymptote","没有渐近线")),tx(L(lang,"asymptote x=h","渐近线 x=h")),tx(L(lang,"base is asymptote","底数是渐近线")),tx(L(lang,"asymptote y=h","渐近线 y=h"))],prompt,note,{base,h,k});
    }
    if(conceptId==="equations-inverses"){
      if(taskForm==="direct")return q(`${base}^{x${sg(h)}}=${base}^{n}`,`x=${n-h}`,[`x=${n+h}`,`x=${n}`,`x=${h-n}`,`x=${base*n}`,`x=${n-h+1}`],prompt,note,{base,h,n});
      if(taskForm==="inverse")return q(`${base}^{x}=\\Box,\\quad x=${n}`,String(base**n),[base*n,base+n,n**base,base**(n-1),base**n+1],prompt,note,{base,n});
      if(taskForm==="interpret")return q(`y=${base}^x`,tx(`y=\\log_{${base}}x`),[tx(`y=x^{${base}}`),tx(`y=${base}x`),tx(`y=1/${base}^x`),tx(`y=\\ln(${base}x)`),tx(L(lang,"no inverse","没有反函数"))],prompt,note,{base});
      if(taskForm==="translate")return q(`x=${base}^y`,`y=\\log_{${base}}x`,[`y=\\log_x${base}`,`y=${base}\\log x`,`y=x^{${base}}`,`y=\\frac1{${base}^x}`,`y=\\ln(${base}x)`],prompt,note,{base});
      return q(`${base}^x=${base}^n\\Rightarrow x=${base*n}`,tx(L(lang,"equate exponents; do not multiply by the base","应令指数相等，不能把底数乘入指数")),[tx(L(lang,"correct","正确")),tx(L(lang,"bases must differ","底数必须不同")),tx(L(lang,"take square roots","两边开平方")),tx(L(lang,"no solution","无解")),tx(L(lang,"x equals base","x 等于底数"))],prompt,note,{base,n});
    }
    const t=rng.int(2,6),initial=rng.int(20,80),future=initial*base**t;
    if(taskForm==="direct")return q(`A(t)=${initial}\\cdot${base}^t,\\quad A(${t})=?`,String(future),[initial*base*t,initial+base**t,future+initial,future-base,base**t,future+1],prompt,note,{initial,base,t});
    if(taskForm==="inverse")return q(`${initial}\\cdot${base}^{\\Box}=${future}`,String(t),[t-1,t+1,base,initial,base*t,0],prompt,note,{initial,base,t});
    if(taskForm==="interpret")return q(`A(t)=${initial}\\cdot${base}^t`,tx(L(lang,`multiply by ${base} each period`,`每期乘 ${base}`)),[tx(L(lang,`add ${base} each period`,`每期增加 ${base}`)),tx(L(lang,`initial amount ${base}`,`初始量 ${base}`)),tx(L(lang,"linear change","线性变化")),tx(L(lang,"halves each period","每期减半")),tx(L(lang,"no initial value","没有初始值"))],prompt,note,{initial,base});
    if(taskForm==="translate")return q(tx(L(lang,`start ${initial}; multiply by ${base} per period`,`从 ${initial} 开始；每期乘 ${base}`)),`A(t)=${initial}\\cdot${base}^t`,[`A(t)=${initial}+${base}t`,`A(t)=${base}\\cdot${initial}^t`,`A(t)=${initial}t^{${base}}`,`A(t)=${initial}\\cdot${base+1}^t`,`A(t)=(${initial+base})^t`],prompt,note,{initial,base});
    return q(`${initial}\\cdot${base}^t=${initial+base*t}`,tx(L(lang,"repeated multiplication was treated as repeated addition","把重复倍乘误当成重复加法")),[tx(L(lang,"correct","正确")),tx(L(lang,"must be linear","必须是线性的")),tx(L(lang,"remove initial amount","删除初始量")),tx(L(lang,"base must be zero","底数必须为零")),tx(L(lang,"time must be zero","时间必须为零"))],prompt,note,{initial,base,t});
  }
  F.register({toolId:"exponential-functions",course:"algebra-2",concepts:["values-representations","growth-decay","transformations","equations-inverses","models-comparison"],build});
})(typeof window!=="undefined"?window:globalThis);
