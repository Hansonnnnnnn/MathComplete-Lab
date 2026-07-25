(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;const tx=F.text,L=(lang,en,zh)=>lang==="zh"?zh:en,cf=n=>n===1?"":n===-1?"-":String(n);
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  function build({conceptId,taskForm,rng,lang}){
    const r=rng.int(2,10),h=rng.int(-6,6),k=rng.int(-5,5),a=rng.choice([-2,-1,1,2]),prompt=L(lang,"Analyze the radical function.","分析根式函数。"),note=L(lang,"Check the radicand, endpoint, transformation, and original equation domain.","检查根号内表达式、端点、变换和原方程定义域。");
    if(conceptId==="evaluation-domain"){
      if(taskForm==="direct")return q(`\\sqrt{${r*r}}`,String(r),[-r,r*r,r+1,r-1,2*r,0],prompt,note,{r});
      if(taskForm==="inverse")return q(`\\sqrt{\\Box}=${r}`,String(r*r),[r,2*r,r*r+1,r*r-1,-r*r,r**3],prompt,note,{r});
      if(taskForm==="interpret")return q(`f(x)=\\sqrt{x-${h}}`,tx(L(lang,`domain x\\ge ${h}`,`定义域 x\\ge ${h}`)),[tx(L(lang,`domain x\\le ${h}`,`定义域 x\\le ${h}`)),tx(L(lang,"domain all reals","定义域为所有实数")),tx(L(lang,`domain x>${-h}`,`定义域 x>${-h}`)),tx(L(lang,`range x\\ge ${h}`,`值域 x\\ge ${h}`)),tx(L(lang,"no domain","没有定义域"))],prompt,note,{h});
      if(taskForm==="translate")return q(tx(L(lang,`square-root domain begins at x=${h}`,`平方根函数定义域从 x=${h} 开始`)),`f(x)=\\sqrt{x-${h}}`,[`f(x)=\\sqrt{x+${h}}`,`f(x)=\\sqrt{x}-${h}`,`f(x)=\\sqrt{${h}-x}`,`f(x)=x^2-${h}`,`f(x)=\\sqrt{x-${h+1}}`],prompt,note,{h});
      return q(`\\sqrt{${r*r}}=-${r}`,tx(L(lang,"principal square root cannot be negative","主平方根不能为负")),[tx(L(lang,"correct","正确")),tx(L(lang,"always use plus or minus","总要使用正负号")),tx(L(lang,"radicand must be negative","根号内必须为负")),tx(L(lang,"answer is the square","答案是平方")),tx(L(lang,"undefined over reals","实数范围无定义"))],prompt,note,{r});
    }
    if(conceptId==="transformations"){
      const f=`y=${cf(a)}\\sqrt{x-${h}}${k<0?k:`+${k}`}`;
      if(taskForm==="direct")return q(f,`(${h},${k})`,[`(${-h},${k})`,`(${h},${-k})`,`(${k},${h})`,`(${a},${k})`,`(${h+1},${k})`],prompt,note,{a,h,k});
      if(taskForm==="inverse")return q(`y=\\sqrt{x-\\Box}${k<0?k:`+${k}`},\\quad \\text{start }(${h},${k})`,String(h),[-h,k,a,h+1,h-1,0],prompt,note,{h,k});
      if(taskForm==="interpret")return q(f,tx(L(lang,a<0?"extends downward":"extends upward",a<0?"图像向下延伸":"图像向上延伸")),[tx(L(lang,a<0?"extends upward":"extends downward",a<0?"图像向上延伸":"图像向下延伸")),tx(L(lang,"parabola","抛物线")),tx(L(lang,"vertical asymptote","竖直渐近线")),tx(L(lang,"no endpoint","没有端点")),tx(L(lang,"a changes horizontal shift","a 改变水平位移"))],prompt,note,{a,h,k});
      if(taskForm==="translate")return q(tx(L(lang,`shift sqrt(x) right ${h} and up ${k}`,`将平方根函数右移 ${h}、上移 ${k}`)),`y=\\sqrt{x-${h}}${k<0?k:`+${k}`}`,[`y=\\sqrt{x+${h}}${k<0?k:`+${k}`}`,`y=\\sqrt{x-${h}}${-k<0?-k:`+${-k}`}`,`y=\\sqrt{x}+${h+k}`,`y=-\\sqrt{x-${h}}${k<0?k:`+${k}`}`,`y=\\sqrt{x-${k}}+${h}`],prompt,note,{h,k});
      return q(`${f}\\Rightarrow \\text{start }(${-h},${k})`,tx(L(lang,"horizontal-shift sign reversed","水平位移符号读反了")),[tx(L(lang,"correct","正确")),tx(L(lang,"vertical-shift sign error","竖直位移符号错误")),tx(L(lang,"no endpoint","没有端点")),tx(L(lang,"endpoint at origin","端点在原点")),tx(L(lang,"swap coordinates","交换坐标"))],prompt,note,{a,h,k});
    }
    if(conceptId==="equations-extraneous"){
      const solution=h+r*r;
      if(taskForm==="direct")return q(`\\sqrt{x-${h}}=${r}`,`x=${solution}`,[`x=${h+r}`,`x=${r*r-h}`,`x=${r}`,`x=${-solution}`,`x=${solution+1}`],prompt,note,{r,h});
      if(taskForm==="inverse")return q(`\\sqrt{\\Box-${h}}=${r}`,String(solution),[r+h,r*r-h,r,solution+1,solution-1],prompt,note,{r,h});
      if(taskForm==="interpret")return q(`\\sqrt{x+${r}}=x-${h}`,tx(L(lang,"check every squared-equation candidate in the original","平方后每个候选解都要代回原式")),[tx(L(lang,"all candidates are valid","所有候选解自动有效")),tx(L(lang,"check only negative roots","只检查负根")),tx(L(lang,"cannot solve radicals","根式方程不能求解")),tx(L(lang,"replace by absolute value","改成绝对值")),tx(L(lang,"no domain restriction","无定义域限制"))],prompt,note,{r,h});
      if(taskForm==="translate")return q(`x-${h}=${r*r}`,`\\sqrt{x-${h}}=${r}`,[`\\sqrt{x+${h}}=${r}`,`\\sqrt{x-${h}}=-${r}`,`x-${h}=\\sqrt{${r}}`,`\\sqrt{x}-${h}=${r}`,`\\sqrt{x-${r}}=${h}`],prompt,note,{r,h});
      return q(`\\sqrt{x-${h}}=${r}\\Rightarrow x=${h+r}`,tx(L(lang,"r was not squared","平方时遗漏了 r^2")),[tx(L(lang,"correct","正确")),tx(L(lang,"add r","两边加 r")),tx(L(lang,"no solution","无解")),tx(L(lang,"x must be negative","x 必须为负")),tx(L(lang,"remove radical without squaring","直接删除根号"))],prompt,note,{r,h});
    }
    if(conceptId==="inverse-functions"){
      if(taskForm==="direct")return q(`f(x)=\\sqrt{x-${h}}`,`f^{-1}(x)=x^2+${h}`,[`f^{-1}(x)=\\sqrt{x+${h}}`,`f^{-1}(x)=x^2-${h}`,`f^{-1}(x)=\\pm x^2+${h}`,`f^{-1}(x)=1/\\sqrt{x-${h}}`,`f^{-1}(x)=x+${h}`],prompt,note,{h});
      if(taskForm==="inverse")return q(`f^{-1}(x)=x^2+${h},\\quad x\\ge0`,`f(x)=\\sqrt{x-${h}}`,[`f(x)=\\sqrt{x+${h}}`,`f(x)=x^2-${h}`,`f(x)=-\\sqrt{x-${h}}`,`f(x)=\\sqrt{${h}-x}`,`f(x)=1/(x^2+${h})`],prompt,note,{h});
      if(taskForm==="interpret")return q(`f(x)=\\sqrt{x-${h}}`,tx(L(lang,"range x>=0 becomes inverse domain","值域 x≥0 成为反函数定义域")),[tx(L(lang,"inverse domain all reals","反函数定义域为所有实数")),tx(L(lang,"no restriction needed","无需限制")),tx(L(lang,"original domain stays domain","原定义域仍是定义域")),tx(L(lang,"square is automatically one-to-one","平方函数天然一一对应")),tx(L(lang,"no inverse","没有反函数"))],prompt,note,{h});
      if(taskForm==="translate")return q(`y=\\sqrt{x-${h}}`,`x=y^2+${h}`,[`x=\\sqrt{y+${h}}`,`x=y^2-${h}`,`x=\\pm y^2+${h}`,`x=y+${h}`,`x=1/y^2+${h}`],prompt,note,{h});
      return q(`f^{-1}(x)=\\pm x^2+${h}`,tx(L(lang,"inverse uses a restricted branch, not plus-or-minus","反函数使用受限分支，不使用正负号")),[tx(L(lang,"correct","正确")),tx(L(lang,"keep negative branch only","只保留负分支")),tx(L(lang,"do not swap variables","无需交换变量")),tx(L(lang,"no inverse","没有反函数")),tx(L(lang,"remove constant","删除常数"))],prompt,note,{h});
    }
    const input=r*r+h,output=a*r+k,model=`M(x)=${cf(a)}\\sqrt{x-${h}}${k<0?k:`+${k}`}`;
    if(taskForm==="direct")return q(`${model},\\quad M(${input})=?`,String(output),[a*r-k,a*r,output+a,output-1,-output,output+r],prompt,note,{a,h,k,r,input});
    if(taskForm==="inverse")return q(`M(${input})=${a}\\sqrt{${input}-${h}}+\\Box=${output}`,String(k),[-k,h,a,k+1,k-1,0],prompt,note,{a,h,k,r});
    if(taskForm==="interpret")return q(model,tx(L(lang,`starts at input ${h}, output ${k}`,`从输入 ${h}、输出 ${k} 开始`)),[tx(L(lang,`starts at input ${-h}`,`从输入 ${-h} 开始`)),tx(L(lang,`initial output ${a}`,`初始输出 ${a}`)),tx(L(lang,"all real inputs","所有实数输入")),tx(L(lang,"linear model","线性模型")),tx(L(lang,"horizontal asymptote","水平渐近线"))],prompt,note,{a,h,k});
    if(taskForm==="translate")return q(tx(L(lang,`endpoint (${h},${k}) with square-root growth`,`端点 (${h},${k})，按平方根增长`)),`M(x)=\\sqrt{x-${h}}${k<0?k:`+${k}`}`,[`M(x)=\\sqrt{x+${h}}${k<0?k:`+${k}`}`,`M(x)=\\sqrt{x-${h}}${-k<0?-k:`+${-k}`}`,`M(x)=x^2-${h}${k<0?k:`+${k}`}`,`M(x)=\\sqrt{${h}-x}${k<0?k:`+${k}`}`,`M(x)=\\sqrt{x}-${h+k}`],prompt,note,{h,k});
    return q(`M(x)=\\sqrt{x-${h}}\\ \\text{ valid for }x<${h}`,tx(L(lang,"domain inequality points the wrong way","定义域不等号方向错误")),[tx(L(lang,"correct","正确")),tx(L(lang,"all real inputs","所有实数")),tx(L(lang,"exclude only endpoint","只排除端点")),tx(L(lang,"domain depends on output","定义域取决于输出")),tx(L(lang,"no domain","没有定义域"))],prompt,note,{h});
  }
  F.register({toolId:"radical-functions",course:"algebra-2",concepts:["evaluation-domain","transformations","equations-extraneous","inverse-functions","radical-models"],build});
})(typeof window!=="undefined"?window:globalThis);
