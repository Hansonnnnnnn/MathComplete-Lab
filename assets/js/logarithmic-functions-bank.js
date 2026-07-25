(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;const tx=F.text,L=(lang,en,zh)=>lang==="zh"?zh:en;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  function build({conceptId,taskForm,rng,lang}){
    const b=rng.int(2,6),n=rng.int(2,5),power=b**n,c=rng.int(2,8),prompt=L(lang,"Analyze the logarithmic expression.","分析对数表达式。"),note=L(lang,"Use the definition, domain, inverse relationship, or logarithm properties as appropriate.","根据题型使用定义、定义域、反函数关系或对数性质。");
    if(conceptId==="definition-evaluation"){
      if(taskForm==="direct")return q(`\\log_{${b}}${power}`,String(n),[b,power,b*n,n-1,n+1,-n],prompt,note,{b,n});
      if(taskForm==="inverse")return q(`\\log_{${b}}\\Box=${n}`,String(power),[b*n,b+n,n**b,b**(n-1),power+1],prompt,note,{b,n});
      if(taskForm==="interpret")return q(`\\log_{${b}}${power}=${n}`,tx(`${b}^{${n}}=${power}`),[tx(`${n}^{${b}}=${power}`),tx(`${b}\\cdot${n}=${power}`),tx(`${power}^{${n}}=${b}`),tx(`${b}^{${power}}=${n}`),tx(`${power}/${b}=${n}`)],prompt,note,{b,n});
      if(taskForm==="translate")return q(`${b}^{${n}}=${power}`,`\\log_{${b}}${power}=${n}`,[`\\log_{${power}}${b}=${n}`,`\\log_{${n}}${power}=${b}`,`\\log_{${b}}${n}=${power}`,`\\log(${b}${power})=${n}`,`\\log_{${b}}${power}=${b*n}`],prompt,note,{b,n});
      return q(`\\log_{${b}}${power}=${b*n}`,tx(L(lang,"power relation was replaced by multiplication","把幂关系误写成了乘法关系")),[tx(L(lang,"correct","正确")),tx(L(lang,"argument must be negative","真数必须为负")),tx(L(lang,"base equals argument","底数等于真数")),tx(L(lang,"undefined","无定义")),tx(L(lang,"answer is the argument","答案是真数"))],prompt,note,{b,n});
    }
    if(conceptId==="log-properties"){
      if(taskForm==="direct")return q(`\\log_b x+\\log_b y`,`\\log_b(xy)`,[`\\log_b(x+y)`,`\\log_b(x/y)`,`2\\log_b(xy)`,`\\log_b x\\,\\log_b y`,`\\log_{2b}(xy)`],prompt,note,{});
      if(taskForm==="inverse")return q(`\\log_b(x^{${c}})`,`${c}\\log_b x`,[`${c}+\\log_b x`,`\\log_b(${c}x)`,`\\frac1${c}\\log_b x`,`\\log_{b^{${c}}}x`,`(\\log_b x)^{${c}}`],prompt,note,{c});
      if(taskForm==="interpret")return q(`\\log_b(x/y)`,tx(L(lang,"difference of logs with the same base","两个同底对数的差")),[tx(L(lang,"sum of logs","两个对数的和")),tx(L(lang,"quotient of log values","对数值的商")),tx(L(lang,"divide the bases","底数相除")),tx(L(lang,"squared logarithm","对数的平方")),tx(L(lang,"cannot expand","不能展开"))],prompt,note,{});
      if(taskForm==="translate")return q(`${c}\\log_b x`,`\\log_b(x^{${c}})`,[`\\log_b(${c}x)`,`\\log_b(x+${c})`,`\\log_{${c}b}x`,`(\\log_b x)^{${c}}`,`\\log_b(x/${c})`],prompt,note,{c});
      return q(`\\log_b x+\\log_b y=\\log_b(x+y)`,tx(L(lang,"product rule was written as addition of arguments","把乘积法则误写成了真数相加")),[tx(L(lang,"correct","正确")),tx(L(lang,"add bases","底数相加")),tx(L(lang,"divide terms","两项相除")),tx(L(lang,"cannot combine","不能合并")),tx(L(lang,"square arguments","真数平方"))],prompt,note,{});
    }
    if(conceptId==="log-equations"){
      if(taskForm==="direct")return q(`\\log_{${b}}x=${n}`,`x=${power}`,[`x=${b*n}`,`x=${b+n}`,`x=${n**b}`,`x=${b**(n-1)}`,`x=${-power}`],prompt,note,{b,n});
      if(taskForm==="inverse")return q(`\\log_{${b}}\\Box=${n}`,String(power),[b*n,b+n,n**b,power-b,power+b],prompt,note,{b,n});
      if(taskForm==="interpret")return q(`\\log_{${b}}(x-${c})=${n}`,tx(L(lang,`first set x-${c}=${power}`,`先得到 x-${c}=${power}`)),[tx(L(lang,`first set x-${c}=${b*n}`,`先得到 x-${c}=${b*n}`)),tx(L(lang,`set x-${c}=n^b`,`令 x-${c}=n^b`)),tx(L(lang,"delete the logarithm","直接删除对数")),tx(L(lang,"set argument to zero","令真数为零")),tx(L(lang,"no solution","无解"))],prompt,note,{b,n,c});
      if(taskForm==="translate")return q(`x-${c}=${power}`,`\\log_{${b}}(x-${c})=${n}`,[`\\log_{${power}}(x-${c})=${b}`,`\\log_{${b}}x-${c}=${n}`,`\\log_{${n}}(x-${c})=${b}`,`\\log_{${b}}(x+${c})=${n}`,`\\log_{${b}}(x-${c})=${power}`],prompt,note,{b,n,c});
      return q(`\\log_{${b}}x=${n}\\Rightarrow x=${b*n}`,tx(L(lang,"use b^n, not bn","应使用 b^n，而不是 bn")),[tx(L(lang,"correct","正确")),tx(L(lang,"x=n","x=n")),tx(L(lang,"no solution","无解")),tx(L(lang,"base must be one","底数必须为 1")),tx(L(lang,"argument negative","真数为负"))],prompt,note,{b,n});
    }
    if(conceptId==="graphs-inverses"){
      if(taskForm==="direct")return q(`f(x)=\\log_{${b}}x`,tx(L(lang,"domain x>0; vertical asymptote x=0","定义域 x>0；竖直渐近线 x=0")),[tx(L(lang,"domain all reals","定义域为所有实数")),tx(L(lang,"horizontal asymptote y=0","水平渐近线 y=0")),tx(L(lang,"domain x<0","定义域 x<0")),tx(L(lang,"vertical asymptote x=1","竖直渐近线 x=1")),tx(L(lang,"parabola","抛物线"))],prompt,note,{b});
      if(taskForm==="inverse")return q(`f(x)=${b}^x`,tx(`f^{-1}(x)=\\log_{${b}}x`),[tx(`f^{-1}(x)=x^{${b}}`),tx(`f^{-1}(x)=${b}x`),tx(`f^{-1}(x)=1/${b}^x`),tx(`f^{-1}(x)=\\ln(${b}x)`),tx(L(lang,"no inverse","没有反函数"))],prompt,note,{b});
      if(taskForm==="interpret")return q(`y=\\log_{${b}}(x-${c})`,tx(L(lang,`vertical asymptote x=${c}`,`竖直渐近线 x=${c}`)),[tx(`x=${-c}`),tx(`y=${c}`),tx("x=0"),tx("y=0"),tx(L(lang,"no asymptote","没有渐近线"))],prompt,note,{b,c});
      if(taskForm==="translate")return q(tx(L(lang,`shift log base ${b} right ${c}`,`将以 ${b} 为底的对数函数右移 ${c}`)),`y=\\log_{${b}}(x-${c})`,[`y=\\log_{${b}}(x+${c})`,`y=\\log_{${b}}x-${c}`,`y=\\log_{${b+c}}x`,`y=\\log_{${b}}(${c}x)`,`y=-\\log_{${b}}(x-${c})`],prompt,note,{b,c});
      return q(`\\log_{${b}}x\\ \\text{ has domain all real numbers}`,tx(L(lang,"positive-argument restriction was ignored","忽略了真数必须为正")),[tx(L(lang,"correct","正确")),tx(L(lang,"base negative","底数为负")),tx(L(lang,"range not real","值域不是实数")),tx(L(lang,"no inverse","没有反函数")),tx(L(lang,"asymptote y=0","渐近线 y=0"))],prompt,note,{b});
    }
    if(taskForm==="direct")return q(`\\frac{\\ln(${power})}{\\ln(${b})}`,String(n),[b,power,b*n,n-1,n+1,-n],prompt,note,{b,n});
    if(taskForm==="inverse")return q(`\\frac{\\ln(\\Box)}{\\ln(${b})}=${n}`,String(power),[b*n,b+n,n**b,b**(n-1),power+1],prompt,note,{b,n});
    if(taskForm==="interpret")return q(`\\log_{${b}}${power}`,tx(L(lang,"quotient of logs with any common valid base","可用任意共同合法底数的对数之商")),[tx(L(lang,"only natural logs work","只能使用自然对数")),tx(L(lang,"add the logs","两个对数相加")),tx(L(lang,"answer depends on new base","答案依赖新底数")),tx(L(lang,"changes the function","改变函数")),tx(L(lang,"cannot evaluate","不能计算"))],prompt,note,{b,n});
    if(taskForm==="translate")return q(`\\log_{${b}}${power}`,`\\frac{\\ln(${power})}{\\ln(${b})}`,[`\\frac{\\ln(${b})}{\\ln(${power})}`,`\\ln(${power}/${b})`,`\\ln(${power})-\\ln(${b})`,`\\frac{${power}}{${b}}`,`\\ln(${power}-${b})`],prompt,note,{b,n});
    return q(`\\log_{${b}}${power}=\\ln(${power})/\\ln(${n})`,tx(L(lang,"denominator must be log of the original base","分母应是原底数的对数")),[tx(L(lang,"correct","正确")),tx(L(lang,"add numerator and denominator","分子分母相加")),tx(L(lang,"cannot change base","不能换底")),tx(L(lang,"base belongs in numerator","原底数放在分子")),tx(L(lang,"base ten required","必须用底数 10"))],prompt,note,{b,n});
  }
  F.register({toolId:"logarithmic-functions",course:"algebra-2",concepts:["definition-evaluation","log-properties","log-equations","graphs-inverses","models-change-base"],build});
})(typeof window!=="undefined"?window:globalThis);
