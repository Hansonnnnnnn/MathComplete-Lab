(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;
  const tx=F.text,sg=n=>n<0?String(n):`+${n}`,cf=n=>n===1?"":n===-1?"-":String(n);
  const vertex=(a,h,k)=>`${cf(a)}(x${sg(-h)})^2${sg(k)}`;
  const standard=(a,b,c)=>`${cf(a)}x^2${sg(b)}x${sg(c)}`;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  const local=(lang,en,zh)=>lang==="zh"?zh:en;
  function build({conceptId,taskForm,rng,lang}){
    const a=rng.choice([-3,-2,-1,1,2,3]),h=rng.int(-6,6),k=rng.int(-8,8),r=rng.int(1,6),b=-2*a*h,c=a*h*h+k,v=vertex(a,h,k),s=standard(a,b,c);
    const prompt=local(lang,"Analyze the quadratic and choose the correct answer.","分析二次函数并选择正确答案。");
    const note=local(lang,"Use the indicated quadratic representation and verify the result.","使用对应的二次函数表示并验证结果。");
    if(conceptId==="quadratic-forms"){
      if(taskForm==="direct")return q(s,v,[vertex(a,-h,k),vertex(-a,h,k),vertex(a,h,-k),vertex(a,h+1,k),vertex(a,h,k+1)],prompt,note,{a,h,k});
      if(taskForm==="inverse")return q(`${cf(a)}(x-\\Box)^2${sg(k)}=${s}`,String(h),[-h,k,a,b,c,h+1],prompt,note,{a,h,k});
      if(taskForm==="interpret")return q(v,tx(local(lang,`vertex (${h},${k})`,`顶点 (${h},${k})`)),[tx(local(lang,`vertex (${-h},${k})`,`顶点 (${-h},${k})`)),tx(local(lang,`vertex (${h},${-k})`,`顶点 (${h},${-k})`)),tx(local(lang,"linear function","线性函数")),tx(local(lang,"no vertex","没有顶点")),tx(local(lang,"axis y=k","对称轴 y=k"))],prompt,note,{a,h,k});
      if(taskForm==="translate")return q(v,s,[standard(-a,b,c),standard(a,-b,c),standard(a,b,-c),standard(a,b,c+1),standard(a,b+1,c)],prompt,note,{a,h,k});
      return q(`${s}=${vertex(a,-h,k)}`,tx(local(lang,"horizontal-shift sign error","水平位移符号错误")),[tx(local(lang,"correct conversion","转换正确")),tx(local(lang,"remove the quadratic term","删除二次项")),tx(local(lang,"constant must be zero","常数项必须为零")),tx(local(lang,"swap vertex coordinates","交换顶点坐标")),tx(local(lang,"vertex form is impossible","不能写成顶点式"))],prompt,note,{a,h,k});
    }
    if(conceptId==="graph-features"){
      if(taskForm==="direct")return q(v,`(${h},${k})`,[`(${-h},${k})`,`(${h},${-k})`,`(${k},${h})`,`(${a},${k})`,`(${h+1},${k})`],prompt,note,{a,h,k});
      if(taskForm==="inverse")return q(`${v},\\quad \\text{axis }x=\\Box`,String(h),[-h,k,a,h+1,h-1,0],prompt,note,{a,h,k});
      if(taskForm==="interpret")return q(v,tx(local(lang,a>0?`minimum ${k}`:`maximum ${k}`,a>0?`最小值 ${k}`:`最大值 ${k}`)),[tx(local(lang,a>0?`maximum ${k}`:`minimum ${k}`,a>0?`最大值 ${k}`:`最小值 ${k}`)),tx(local(lang,`extreme value ${h}`,`极值 ${h}`)),tx(local(lang,"no extremum","没有极值")),tx(local(lang,"axis y=h","对称轴 y=h")),tx(local(lang,"linear graph","线性图像"))],prompt,note,{a,h,k});
      if(taskForm==="translate")return q(tx(local(lang,`vertex (${h},${k}), opening ${a>0?"up":"down"}`,`顶点 (${h},${k})，开口${a>0?"向上":"向下"}`)),v,[vertex(-a,h,k),vertex(a,-h,k),vertex(a,h,-k),vertex(1,k,h),vertex(a,h+1,k)],prompt,note,{a,h,k});
      return q(`${v},\\quad \\text{axis }x=${-h}`,tx(local(lang,"axis-sign error","对称轴符号错误")),[tx(local(lang,"correct","正确")),tx(local(lang,"opening error","开口方向错误")),tx(local(lang,"no axis","没有对称轴")),tx(local(lang,"axis y=k","对称轴 y=k")),tx(local(lang,"vertex at origin","顶点在原点"))],prompt,note,{a,h,k});
    }
    if(conceptId==="roots-intercepts"){
      const roots=`x=${h-r}\\text{ or }x=${h+r}`,factored=`(x${sg(-(h-r))})(x${sg(-(h+r))})=0`;
      if(taskForm==="direct")return q(factored,roots,[`x=${h-r}`,`x=${h+r}`,`x=${-h-r}\\text{ or }x=${-h+r}`,`x=${h-r*r}\\text{ or }x=${h+r*r}`,`x=${h}`],prompt,note,{h,r});
      if(taskForm==="inverse")return q(`(x${sg(-(h-r))})(x-\\Box)=0`,String(h+r),[h-r,h,r,-h-r,h+r+1,h+r-1],prompt,note,{h,r});
      if(taskForm==="interpret")return q(factored,tx(local(lang,"each factor gives one zero","每个因式给出一个零点")),[tx(local(lang,"only the first factor matters","只看第一个因式")),tx(local(lang,"add the factors","相加两个因式")),tx(local(lang,"no real zeros","没有实数零点")),tx(local(lang,"one repeated zero","一个重根")),tx(local(lang,"zeros are coefficients","零点等于系数"))],prompt,note,{h,r});
      if(taskForm==="translate")return q(roots,factored,[`(x${sg(h-r)})(x${sg(h+r)})=0`,`(x${sg(-(h-r))})^2=0`,`(x${sg(-(h+r))})^2=0`,`x^2${sg(-2*h)}=0`,`(x${sg(-h)})(x${sg(-r)})=0`],prompt,note,{h,r});
      return q(`${factored}\\Rightarrow x=${h-r}`,tx(local(lang,"one zero was omitted","遗漏了一个零点")),[tx(local(lang,"complete solution","解集完整")),tx(local(lang,"both invalid","两个解都无效")),tx(local(lang,"multiply roots","相乘两个根")),tx(local(lang,"no real roots","没有实根")),tx(local(lang,"use logarithms","使用对数"))],prompt,note,{h,r});
    }
    if(conceptId==="transformations"){
      if(taskForm==="direct")return q(v,tx(local(lang,`shift right ${h}; vertical shift ${k}`,`右移 ${h}；竖直平移 ${k}`)),[tx(local(lang,`shift left ${h}`,`左移 ${h}`)),tx(local(lang,`horizontal shift ${k}`,`水平平移 ${k}`)),tx(local(lang,"reflection only","仅反射")),tx(local(lang,"no transformation","无变换")),tx(local(lang,"linear transformation","线性变换"))],prompt,note,{a,h,k});
      if(taskForm==="inverse")return q(`${cf(a)}(x-\\Box)^2${sg(k)}`,String(h),[-h,k,a,h+1,h-1,0],prompt,note,{a,h,k});
      if(taskForm==="interpret")return q(vertex(-Math.abs(a),h,k),tx(local(lang,"reflection across x-axis","关于 x 轴反射")),[tx(local(lang,"opens upward","开口向上")),tx(local(lang,"reflection across y-axis","关于 y 轴反射")),tx(local(lang,"becomes linear","变成直线")),tx(local(lang,"no vertex","没有顶点")),tx(local(lang,"horizontal stretch only","仅水平拉伸"))],prompt,note,{a,h,k});
      if(taskForm==="translate")return q(tx(local(lang,`shift y=x^2 right ${h} and up ${k}`,`将 y=x^2 右移 ${h}、上移 ${k}`)),vertex(1,h,k),[vertex(1,-h,k),vertex(1,h,-k),vertex(-1,h,k),vertex(1,k,h),vertex(1,h+1,k)],prompt,note,{h,k});
      return q(`${v}\\Rightarrow \\text{shift left }${h}`,tx(local(lang,"horizontal direction reversed","水平位移方向反了")),[tx(local(lang,"correct","正确")),tx(local(lang,"vertical direction error","竖直方向错误")),tx(local(lang,"a must be zero","a 必须为零")),tx(local(lang,"quadratics cannot shift","二次函数不能平移")),tx(local(lang,"h is vertical shift","h 是竖直位移"))],prompt,note,{a,h,k});
    }
    const x=rng.int(1,9),y=a*(x-h)*(x-h)+k;
    if(taskForm==="direct")return q(`${v},\\quad f(${x})=?`,String(y),[y+a,y-a,y+h,y+k,-y,y+1],prompt,note,{a,h,k,x});
    if(taskForm==="inverse")return q(`${cf(a)}(x${sg(-h)})^2+\\Box,\\quad f(${h})=${k}`,String(k),[-k,h,a,k+1,k-1,0],prompt,note,{a,h,k});
    if(taskForm==="interpret")return q(v,tx(local(lang,`extremum ${k} at x=${h}`,`在 x=${h} 处取得极值 ${k}`)),[tx(local(lang,`extremum at x=${k}`,`极值点 x=${k}`)),tx(local(lang,`extreme value ${h}`,`极值 ${h}`)),tx(local(lang,"no extremum","没有极值")),tx(local(lang,"linear model","线性模型")),tx(local(lang,"extremum equals a","极值等于 a"))],prompt,note,{a,h,k});
    if(taskForm==="translate")return q(tx(local(lang,`extremum ${k} at input ${h}`,`输入 ${h} 时极值为 ${k}`)),v,[vertex(-a,h,k),vertex(a,-h,k),vertex(a,h,-k),vertex(1,k,h),vertex(a,h+1,k)],prompt,note,{a,h,k});
    return q(`${v}\\Rightarrow \\text{extremum }(${k},${h})`,tx(local(lang,"vertex coordinates swapped","顶点坐标交换了")),[tx(local(lang,"correct","正确")),tx(local(lang,"opening error","开口错误")),tx(local(lang,"no extremum","没有极值")),tx(local(lang,"extremum equals a","极值等于 a")),tx(local(lang,"vertex at origin","顶点在原点"))],prompt,note,{a,h,k});
  }
  F.register({toolId:"quadratic-functions",course:"algebra-1",concepts:["quadratic-forms","graph-features","roots-intercepts","transformations","modeling-comparison"],build});
})(typeof window!=="undefined"?window:globalThis);
