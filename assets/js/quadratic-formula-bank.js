(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;const tx=F.text,sg=n=>n<0?String(n):`+${n}`,L=(lang,en,zh)=>lang==="zh"?zh:en;
  const pair=(u,v)=>u===v?`x=${u}`:`x=${Math.min(u,v)}\\text{ or }x=${Math.max(u,v)}`;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  function build({conceptId,taskForm,rng,lang}){
    const r=rng.int(1,7),s=rng.int(-7,-1),A=rng.int(1,4),B=-A*(r+s),C=A*r*s,D=B*B-4*A*C,roots=pair(r,s),eq=`${A}x^2${sg(B)}x${sg(C)}=0`,prompt=L(lang,"Use the discriminant or quadratic formula.","使用判别式或二次公式。"),note=L(lang,"Verify signs, both branches, and any contextual restrictions.","核对符号、两个分支和情境限制。");
    if(conceptId==="discriminant"){
      if(taskForm==="direct")return q(eq,String(D),[B*B+4*A*C,B-4*A*C,4*A*C,D+1,-D],prompt,note,{A,B,C,D});
      if(taskForm==="inverse")return q(`D=${B}^2-4(${A})(\\Box)=${D}`,String(C),[-C,A,B,C+1,C-1,D],prompt,note,{A,B,C,D});
      if(taskForm==="interpret")return q(`D=${D}`,tx(L(lang,"two distinct real roots","两个不同实根")),[tx(L(lang,"one repeated root","一个重根")),tx(L(lang,"two nonreal roots","两个非实根")),tx(L(lang,"no solutions","无解")),tx(L(lang,"three real roots","三个实根")),tx(L(lang,"cannot classify","无法判断"))],prompt,note,{D});
      if(taskForm==="translate")return q(tx(L(lang,"definition of the discriminant","判别式定义")),`D=b^2-4ac`,[`D=b^2+4ac`,`D=b-4ac`,`D=(b-4a)c`,`D=2b-4ac`,`D=b^2-2ac`],prompt,note,{});
      return q(`D=${B}^2+4(${A})(${C})`,tx(L(lang,"sign before 4ac must be negative","4ac 前应为负号")),[tx(L(lang,"correct","正确")),tx(L(lang,"do not square b","b 不应平方")),tx(L(lang,"do not multiply a and c","a 与 c 不应相乘")),tx(L(lang,"D is always zero","D 恒为零")),tx(L(lang,"divide by a first","先除以 a"))],prompt,note,{A,B,C});
    }
    if(conceptId==="exact-real-roots"){
      if(taskForm==="direct")return q(eq,roots,[`x=${r}`,`x=${s}`,pair(-r,-s),`x=${r+s}`,`x=${r*s}`],prompt,note,{A,B,C,r,s});
      if(taskForm==="inverse")return q(`${A}(x-${r})(x-${s})=0`,roots,[pair(-r,-s),`x=${r+s}`,`x=${r*s}`,`x=${r}`,`x=${s}`],prompt,note,{r,s});
      if(taskForm==="interpret")return q(eq,tx(L(lang,`root sum ${r+s}; product ${r*s}`,`根的和 ${r+s}；积 ${r*s}`)),[tx(L(lang,`sum ${r*s}`,`和 ${r*s}`)),tx(L(lang,`product ${r+s}`,`积 ${r+s}`)),tx(L(lang,"opposite roots","互为相反数")),tx(L(lang,"one root","一个根")),tx(L(lang,"no real roots","没有实根"))],prompt,note,{r,s});
      if(taskForm==="translate")return q(roots,`(x-${r})(x-${s})=0`,[`(x+${r})(x+${s})=0`,`(x-${r})^2=0`,`(x-${s})^2=0`,`x^2-${r*s}=0`,`(x-${r+s})(x-1)=0`],prompt,note,{r,s});
      return q(`${eq}\\Rightarrow x=\\frac{${B}\\pm\\sqrt{${D}}}{2${A}}`,tx(L(lang,"quadratic formula begins with -b","二次公式分子应从 -b 开始")),[tx(L(lang,"correct","正确")),tx(L(lang,"denominator a","分母为 a")),tx(L(lang,"use b²+4ac","使用 b²+4ac")),tx(L(lang,"omit plus-minus","删除正负号")),tx(L(lang,"square result","把结果平方"))],prompt,note,{A,B,D});
    }
    const p=rng.int(1,6),imag=rng.int(1,6),complex=`x=${p}+${imag}i\\text{ or }x=${p}-${imag}i`,complexEq=`x^2-${2*p}x+${p*p+imag*imag}=0`;
    if(conceptId==="complex-roots"){
      if(taskForm==="direct")return q(complexEq,complex,[`x=${p}+${imag}\\text{ or }x=${p}-${imag}`,`x=${-p}+${imag}i\\text{ or }x=${-p}-${imag}i`,`x=${p}i\\text{ or }x=${imag}i`,`x=${p}`,tx(L(lang,"no solution","无解"))],prompt,note,{p,imag});
      if(taskForm==="inverse")return q(`x=${p}\\pm \\Box i`,String(imag),[-imag,p,p+imag,imag+1,imag-1,0],prompt,note,{p,imag});
      if(taskForm==="interpret")return q(complexEq,tx(L(lang,"nonreal roots are conjugates","非实根互为共轭")),[tx(L(lang,"roots are opposites","根互为相反数")),tx(L(lang,"one real root","一个实根")),tx(L(lang,"no complex roots","没有复根")),tx(L(lang,"identical roots","两个根相同")),tx(L(lang,"same imaginary sign","虚部同号"))],prompt,note,{p,imag});
      if(taskForm==="translate")return q(complex,`(x-${p}-${imag}i)(x-${p}+${imag}i)=0`,[`(x+${p}-${imag}i)(x+${p}+${imag}i)=0`,`(x-${p}-${imag}i)^2=0`,`(x-${p}+${imag}i)^2=0`,`(x-${p})(x-${imag})=0`,`x^2+${p*p+imag*imag}=0`],prompt,note,{p,imag});
      return q(`D<0\\Rightarrow \\text{no solutions}`,tx(L(lang,"there are no real roots, but complex roots remain","没有实根，但仍有复数根")),[tx(L(lang,"correct over complex numbers","在复数范围正确")),tx(L(lang,"two real roots","两个实根")),tx(L(lang,"repeated root","重根")),tx(L(lang,"D cannot be negative","D 不能为负")),tx(L(lang,"remove i","删除 i"))],prompt,note,{});
    }
    const m=rng.int(1,8);
    if(conceptId==="parameter-analysis"){
      if(taskForm==="direct")return q(`x^2+${2*m}x+k=0\\ \\text{has one real root}`,`k=${m*m}`,[`k=${2*m}`,`k=${-m*m}`,`k=${m}`,`k=${m*m+1}`,`k=0`],prompt,note,{m});
      if(taskForm==="inverse")return q(`D=(${2*m})^2-4k=0`,String(m*m),[2*m,-m*m,m,m*m+1,m*m-1],prompt,note,{m});
      if(taskForm==="interpret")return q(`D=0`,tx(L(lang,"parabola is tangent to x-axis","抛物线与 x 轴相切")),[tx(L(lang,"crosses twice","与 x 轴交两点")),tx(L(lang,"no x-intercept","没有 x 截距")),tx(L(lang,"line","直线")),tx(L(lang,"two complex intercepts","两个复截距")),tx(L(lang,"opening determined by D","D 决定开口"))],prompt,note,{});
      if(taskForm==="translate")return q(tx(L(lang,"exactly one real solution","恰有一个实数解")),`b^2-4ac=0`,[`b^2-4ac>0`,`b^2-4ac<0`,`b^2+4ac=0`,`b-4ac=0`,`a+b+c=0`],prompt,note,{});
      return q(`D=0\\Rightarrow \\text{two distinct real roots}`,tx(L(lang,"D=0 gives one repeated root","D=0 产生一个重根")),[tx(L(lang,"correct","正确")),tx(L(lang,"no roots","没有根")),tx(L(lang,"complex roots","复根")),tx(L(lang,"D unrelated","D 与根数无关")),tx(L(lang,"need D<0","需要 D<0"))],prompt,note,{});
    }
    const time=rng.int(1,8),height=-time*time+6*time+7;
    if(taskForm==="direct")return q(`h(t)=-t^2+6t+7,\\quad h(${time})=?`,String(height),[-height,height+time,height-time,-time*time+13,time*time+6*time+7],prompt,note,{time});
    if(taskForm==="inverse")return q(`-t^2+6t+7=0`,pair(-1,7),[`x=1\\text{ or }x=-7`,`x=7`,`x=-1`,`x=1\\text{ or }x=7`,`x=-7`],prompt,note,{});
    if(taskForm==="interpret")return q(`h(t)=-t^2+6t+7`,tx(L(lang,"retain nonnegative time solutions in context","情境中只保留非负时间解")),[tx(L(lang,"retain all negatives","保留所有负根")),tx(L(lang,"keep negative only","只保留负根")),tx(L(lang,"no domain","没有定义域")),tx(L(lang,"D does not apply","判别式不适用")),tx(L(lang,"height always positive","高度始终为正"))],prompt,note,{});
    if(taskForm==="translate")return q(tx(L(lang,"height equals zero at landing","落地时高度为零")),`-t^2+6t+7=0`,[`-t^2+6t+7=t`,`-t^2+6t=7`,`t^2+6t+7=0`,`-t^2+6t-7=0`,`6t+7=0`],prompt,note,{});
    return q(lang==="zh"?`t=-1\\ \\text{被作为落地时间}`:`t=-1\\ \\text{is the landing time}`,tx(L(lang,"negative time is invalid in context","负时间不符合实际情境")),[tx(L(lang,"correct","正确")),tx(L(lang,"both are landing times","两个根都是落地时间")),tx(L(lang,"positive root invalid","正根无效")),tx(L(lang,"time may be negative","时间可以为负")),tx(L(lang,"ignore units","忽略单位"))],prompt,note,{});
  }
  F.register({toolId:"quadratic-formula",course:"algebra-2",concepts:["discriminant","exact-real-roots","complex-roots","parameter-analysis","modeling-verification"],build});
})(typeof window!=="undefined"?window:globalThis);
