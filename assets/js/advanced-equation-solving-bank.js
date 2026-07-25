(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;const tx=F.text,sg=n=>n<0?String(n):`+${n}`,L=(lang,en,zh)=>lang==="zh"?zh:en;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  function build({conceptId,taskForm,rng,lang}){
    const r=rng.int(2,7),s=rng.int(-6,-1),a=rng.int(1,6),d=rng.int(1,6),b=rng.int(2,5),n=rng.int(2,5),prompt=L(lang,"Solve and verify the equation.","求解并验证方程。"),note=L(lang,"Preserve domain restrictions and verify every candidate.","保留定义域限制并验证每个候选解。");
    if(conceptId==="polynomial-equations"){
      const roots=`x=${s}\\text{ or }x=${r}`,poly=`(x${sg(-s)})(x${sg(-r)})=0`;
      if(taskForm==="direct")return q(poly,roots,[`x=${s}`,`x=${r}`,`x=${-s}\\text{ or }x=${-r}`,`x=${s+r}`,`x=${s*r}`],prompt,note,{r,s});
      if(taskForm==="inverse")return q(`(x${sg(-s)})(x-\\Box)=0,\\quad ${roots}`,String(r),[-r,s,-s,r+1,r-1,0],prompt,note,{r,s});
      if(taskForm==="interpret")return q(poly,tx(L(lang,"set each linear factor equal to zero","令每个线性因式分别等于零")),[tx(L(lang,"use only first factor","只用第一个因式")),tx(L(lang,"add factors","相加因式")),tx(L(lang,"set x=0","令 x=0")),tx(L(lang,"no real solutions","没有实数解")),tx(L(lang,"multiply roots","相乘两个根"))],prompt,note,{r,s});
      if(taskForm==="translate")return q(roots,poly,[`(x${sg(s)})(x${sg(r)})=0`,`(x${sg(-s)})^2=0`,`(x${sg(-r)})^2=0`,`x^2${sg(-(s+r))}=0`,`(x${sg(-s*r)})(x-1)=0`],prompt,note,{r,s});
      return q(`${poly}\\Rightarrow x=${r}`,tx(L(lang,"one factor's solution was omitted","遗漏了另一个因式的解")),[tx(L(lang,"complete","完整")),tx(L(lang,"both invalid","两个都无效")),tx(L(lang,"multiply roots","相乘两个根")),tx(L(lang,"use logarithms","使用对数")),tx(L(lang,"cannot factor","不能因式分解"))],prompt,note,{r,s});
    }
    if(conceptId==="rational-equations"){
      const m=b*d,solution=a+d;
      if(taskForm==="direct")return q(`\\frac{${m}}{x-${a}}=${b}`,`x=${solution}`,[`x=${a-d}`,`x=${m/b}`,`x=${a+b}`,`x=${m+a}`,`x=${solution+1}`],prompt,note,{a,b,d,m});
      if(taskForm==="inverse")return q(`\\frac{\\Box}{x-${a}}=${b},\\quad x=${solution}`,String(m),[b*d+a,b+d,a*d,m+b,m-b,b],prompt,note,{a,b,d,m});
      if(taskForm==="interpret")return q(`\\frac{${m}}{x-${a}}=${b}`,tx(L(lang,`domain excludes x=${a}`,`定义域排除 x=${a}`)),[tx(L(lang,`exclude x=${solution}`,`排除 x=${solution}`)),tx(L(lang,"all reals","所有实数")),tx(L(lang,`x>${a}`,`x>${a}`)),tx(L(lang,"numerator nonzero","分子不能为零")),tx(L(lang,"no restriction","没有限制"))],prompt,note,{a});
      if(taskForm==="translate")return q(`\\frac{${m}}{x-${a}}=${b}`,`${m}=${b}(x-${a})`,[`${m}=${b}/(x-${a})`,`${m}(x-${a})=${b}`,`${m}x-${a}=${b}`,`${m}=${b}(x+${a})`,`x-${a}=${m*b}`],prompt,note,{a,b,m});
      return q(`\\frac{${m}}{x-${a}}=${b}\\Rightarrow ${m}x-${a}=${b}`,tx(L(lang,"the entire denominator was not cleared","没有把整个分母作为因子清除")),[tx(L(lang,"correct","正确")),tx(L(lang,"keep denominator","保留分母")),tx(L(lang,"set denominator zero","令分母为零")),tx(L(lang,"square both","两边平方")),tx(L(lang,"no solution","无解"))],prompt,note,{a,b,m});
    }
    if(conceptId==="radical-absolute-equations"){
      const solution=a+r*r;
      if(taskForm==="direct")return q(`\\sqrt{x-${a}}=${r}`,`x=${solution}`,[`x=${a+r}`,`x=${r*r-a}`,`x=${r}`,`x=${-solution}`,`x=${solution+1}`],prompt,note,{a,r});
      if(taskForm==="inverse")return q(`\\sqrt{x-${a}}=\\Box,\\quad x=${solution}`,String(r),[-r,r*r,a,r+1,r-1,0],prompt,note,{a,r});
      if(taskForm==="interpret")return q(`|x-${a}|=${r}`,tx(L(lang,`x-${a}=${r} or x-${a}=-${r}`,`x-${a}=${r} 或 x-${a}=-${r}`)),[tx(L(lang,"positive branch only","只有正分支")),tx(L(lang,`x-${a}=r^2`,`x-${a}=r^2`)),tx(L(lang,"no solution","无解")),tx(L(lang,"drop absolute value","直接去掉绝对值")),tx(`x=${a}`)],prompt,note,{a,r});
      if(taskForm==="translate")return q(`|x-${a}|\\le${r}`,`${a-r}\\le x\\le ${a+r}`,[`x\\le${a-r}\\text{ or }x\\ge${a+r}`,`${a+r}\\le x\\le${a-r}`,`x=${a+r}`,`x=${a-r}`,`${-a-r}\\le x\\le${-a+r}`],prompt,note,{a,r});
      return q(`\\sqrt{x-${a}}=${r}\\Rightarrow x=${a+r}`,tx(L(lang,"r was not squared","平方时遗漏了 r^2")),[tx(L(lang,"correct","正确")),tx(L(lang,"add plus-minus branch","添加正负分支")),tx(L(lang,"always no solution","总是无解")),tx(L(lang,"x<a","x<a")),tx(L(lang,"square a","把 a 平方"))],prompt,note,{a,r});
    }
    if(conceptId==="exponential-log-equations"){
      const solution=n-a;
      if(taskForm==="direct")return q(`${b}^{x${sg(a)}}=${b}^{n}`,`x=${solution}`,[`x=${n+a}`,`x=${n}`,`x=${a-n}`,`x=${b*n}`,`x=${solution+1}`],prompt,note,{a,b,n});
      if(taskForm==="inverse")return q(`${b}^{x${sg(a)}}=\\Box,\\quad x=${solution}`,String(b**n),[b*n,b+n,n**b,b**(n-1),b**n+1],prompt,note,{a,b,n});
      if(taskForm==="interpret")return q(`\\log_{${b}}x=${n}`,tx(`x=${b}^{${n}}`),[tx(`x=${b*n}`),tx(`x=${n}^{${b}}`),tx(L(lang,"no solution","无解")),tx(`x=${b}`),tx(L(lang,"negative argument","负真数"))],prompt,note,{b,n});
      if(taskForm==="translate")return q(`${b}^{n}=x`,`\\log_{${b}}x=${n}`,[`\\log_x${b}=${n}`,`\\log_{${n}}x=${b}`,`\\log_{${b}}${n}=x`,`\\log x=${b*n}`,`\\log_x${n}=${b}`],prompt,note,{b,n});
      return q(`${b}^{x}=${b}^{n}\\Rightarrow x=${b*n}`,tx(L(lang,"base was multiplied into the exponent","把底数乘进了指数")),[tx(L(lang,"correct","正确")),tx(L(lang,"bases differ","底数应不同")),tx(`x=${b}`),tx(L(lang,"no real solution","没有实数解")),tx(L(lang,"use quadratic formula","使用二次公式"))],prompt,note,{b,n});
    }
    const angles=["0","\\frac{\\pi}{6}","\\frac{\\pi}{4}","\\frac{\\pi}{3}","\\frac{\\pi}{2}"],values=["0","\\frac12","\\frac{\\sqrt2}{2}","\\frac{\\sqrt3}{2}","1"],index=rng.int(0,4),angle=angles[index],value=values[index],other=angles.filter(item=>item!==angle).concat(["\\pi"]);
    if(taskForm==="direct")return q(`\\sin x=${value},\\quad 0\\le x\\le\\frac\\pi2`,angle,other,prompt,note,{index});
    if(taskForm==="inverse")return q(`\\sin(\\Box)=${value}`,angle,other,prompt,note,{index});
    if(taskForm==="interpret")return q(`\\sin x=${value}`,tx(L(lang,"solutions depend on interval and periodicity","解集取决于区间和周期性")),[tx(L(lang,"always one solution","永远只有一个解")),tx(L(lang,"all reals","所有实数")),tx(L(lang,"period irrelevant","周期无关")),tx(L(lang,"no inverse relation","没有反向关系")),tx(L(lang,"decimal only","只能用小数"))],prompt,note,{index});
    if(taskForm==="translate")return q(tx(L(lang,`first-quadrant sine value ${value}`,`第一象限正弦值 ${value}`)),angle,other,prompt,note,{index});
    return q(`\\sin x=${value}\\Rightarrow x=${angles[(index+1)%5]}`,tx(L(lang,"wrong standard-angle pairing","标准角与精确值配对错误")),[tx(L(lang,"correct","正确")),tx(L(lang,"sine must be negative","正弦必须为负")),tx(L(lang,"no interval solution","区间内无解")),tx(L(lang,"swap sine and cosine","交换正弦余弦")),tx(L(lang,"degrees required","必须用角度"))],prompt,note,{index});
  }
  F.register({toolId:"advanced-equation-solving",course:"algebra-2",concepts:["polynomial-equations","rational-equations","radical-absolute-equations","exponential-log-equations","trigonometric-parameter-equations"],build});
})(typeof window!=="undefined"?window:globalThis);
