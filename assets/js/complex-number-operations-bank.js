(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory,C=root.MCLComplexMath;if(!F||!C)return;const tx=F.text,L=(lang,en,zh)=>lang==="zh"?zh:en;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  const z=(rng,nonzero=true)=>{let a,b;do{a=rng.int(-7,7);b=rng.int(-7,7)}while(nonzero&&a===0&&b===0);return C.complex(a,b)};
  const latex=C.complexLatex,add=C.addComplex,sub=C.subtractComplex,mul=C.multiplyComplex,div=C.divideComplex,conj=C.conjugateComplex;
  const near=value=>[add(value,C.complex(1,0)),add(value,C.complex(-1,0)),add(value,C.complex(0,1)),add(value,C.complex(0,-1)),C.complex(value.imaginary,value.real),C.complex(-value.real.numerator/value.real.denominator,value.imaginary)];
  const choices=value=>near(value).map(latex);
  function build({conceptId,taskForm,rng,lang}){
    const u=z(rng),v=z(rng),w=z(rng),prompt=L(lang,"Operate with exact complex numbers.","使用精确形式进行复数运算。"),note=L(lang,"Keep real and imaginary components separate and simplify to a+bi.","分别处理实部与虚部，并化为 a+bi。");
    if(conceptId==="components-representations"){
      if(taskForm==="direct")return q(`z=${latex(u)},\\quad \\operatorname{Re}(z)=?`,String(u.real.numerator/u.real.denominator),[u.imaginary.numerator/u.imaginary.denominator,-u.real.numerator/u.real.denominator,-u.imaginary.numerator/u.imaginary.denominator,0,1],prompt,note,{u:C.complexKey(u)});
      if(taskForm==="inverse")return q(`\\operatorname{Re}(z)=${u.real.numerator},\\quad \\operatorname{Im}(z)=${u.imaginary.numerator}`,latex(u),choices(u),prompt,note,{u:C.complexKey(u)});
      if(taskForm==="interpret")return q(`z=${latex(u)}`,latex(conj(u)),choices(conj(u)),prompt,L(lang,"The conjugate reverses only the imaginary sign.","共轭复数只改变虚部符号。"),{u:C.complexKey(u)});
      if(taskForm==="translate")return q(`(${u.real.numerator},${u.imaginary.numerator})`,latex(u),choices(u),prompt,L(lang,"An ordered pair (a,b) represents a+bi.","有序对 (a,b) 表示 a+bi。"),{u:C.complexKey(u)});
      return q(`${latex(u)}=${latex(C.complex(u.imaginary,u.real))}`,tx(L(lang,"real and imaginary components were swapped","实部与虚部交换了")),[tx(L(lang,"correct","正确")),tx(L(lang,"imaginary sign error","虚部符号错误")),tx(L(lang,"real sign error","实部符号错误")),tx(L(lang,"i should be squared","应把 i 平方")),tx(L(lang,"complex numbers have no components","复数没有分量"))],prompt,note,{u:C.complexKey(u)});
    }
    if(conceptId==="addition-subtraction"){
      const result=add(u,v);
      if(taskForm==="direct")return q(`(${latex(u)})+(${latex(v)})`,latex(result),choices(result),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
      if(taskForm==="inverse")return q(`(${latex(u)})+z=${latex(result)}`,latex(v),choices(v),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
      if(taskForm==="interpret")return q(`(${latex(u)})-(${latex(v)})`,tx(L(lang,"subtract both the real and imaginary components","实部和虚部都要相减")),[tx(L(lang,"subtract real parts only","只减实部")),tx(L(lang,"subtract imaginary parts only","只减虚部")),tx(L(lang,"multiply components","相乘分量")),tx(L(lang,"swap components","交换分量")),tx(L(lang,"change every sign","改变所有符号"))],prompt,note,{});
      if(taskForm==="translate")return q(`(${latex(u)})-(${latex(v)})`,latex(sub(u,v)),choices(sub(u,v)),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
      return q(`(${latex(u)})-(${latex(v)})=${latex(add(u,v))}`,tx(L(lang,"the subtraction sign was not distributed","减号没有作用到第二个复数的两个分量")),[tx(L(lang,"correct","正确")),tx(L(lang,"i² error","i² 错误")),tx(L(lang,"conjugate required","必须取共轭")),tx(L(lang,"divide components","分量相除")),tx(L(lang,"no simplification","不能化简"))],prompt,note,{});
    }
    if(conceptId==="multiplication-powers"){
      const result=mul(u,v),power=rng.int(5,20),icycle=[C.complex(1,0),C.complex(0,1),C.complex(-1,0),C.complex(0,-1)][power%4];
      if(taskForm==="direct")return q(`(${latex(u)})(${latex(v)})`,latex(result),choices(result),prompt,L(lang,"Expand and replace i² with -1.","展开并用 -1 替换 i²。"),{u:C.complexKey(u),v:C.complexKey(v)});
      if(taskForm==="inverse")return q(`i^{${power}}`,latex(icycle),choices(icycle),prompt,L(lang,"Powers of i repeat every four.","i 的幂每四次循环。"),{power});
      if(taskForm==="interpret")return q(`i^2`,tx(L(lang,"equals -1","等于 -1")),[tx("1"),tx("i"),tx("-i"),tx("0"),tx(L(lang,"undefined","无定义"))],prompt,note,{});
      if(taskForm==="translate")return q(`(${latex(u)})(${latex(v)})`,latex(result),choices(result),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
      return q(`i^2=1`,tx(L(lang,"i² equals -1, not 1","i² 等于 -1，不是 1")),[tx(L(lang,"correct","正确")),tx(L(lang,"i²=i","i²=i")),tx(L(lang,"i²=0","i²=0")),tx(L(lang,"i has no powers","i 没有幂")),tx(L(lang,"use absolute value","使用绝对值"))],prompt,note,{});
    }
    if(conceptId==="division-conjugates"){
      const result=div(u,v),norm=v.real.numerator*v.real.numerator+v.imaginary.numerator*v.imaginary.numerator;
      if(taskForm==="direct")return q(`\\frac{${latex(u)}}{${latex(v)}}`,latex(result),choices(result),prompt,L(lang,"Multiply numerator and denominator by the denominator's conjugate.","分子分母同乘除数的共轭。"),{u:C.complexKey(u),v:C.complexKey(v)});
      if(taskForm==="inverse")return q(`\\overline{${latex(v)}}`,latex(conj(v)),choices(conj(v)),prompt,note,{v:C.complexKey(v)});
      if(taskForm==="interpret")return q(`(${latex(v)})\\overline{(${latex(v)})}`,String(norm),[norm+1,norm-1,-norm,v.real.numerator*v.imaginary.numerator,0],prompt,L(lang,"A complex number times its conjugate is a²+b².","复数与其共轭的乘积是 a²+b²。"),{v:C.complexKey(v)});
      if(taskForm==="translate")return q(`\\frac{${latex(u)}}{${latex(v)}}`,latex(result),choices(result),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
      return q(`\\frac{a+bi}{c+di}=\\frac{a}{c}+\\frac{b}{d}i`,tx(L(lang,"components cannot be divided independently","实部和虚部不能分别相除")),[tx(L(lang,"correct","正确")),tx(L(lang,"use c²-d²","使用 c²-d²")),tx(L(lang,"conjugate numerator only","只给分子取共轭")),tx(L(lang,"remove i","删除 i")),tx(L(lang,"division undefined","除法无定义"))],prompt,note,{});
    }
    const product=mul(u,v),result=add(product,w);
    if(taskForm==="direct")return q(`(${latex(u)})(${latex(v)})+(${latex(w)})`,latex(result),choices(result),prompt,note,{u:C.complexKey(u),v:C.complexKey(v),w:C.complexKey(w)});
    if(taskForm==="inverse")return q(`z+(${latex(u)})=${latex(add(u,v))}`,latex(v),choices(v),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
    if(taskForm==="interpret")return q(`(${latex(u)})(${latex(v)})+(${latex(w)})`,tx(L(lang,"multiply first, then add component-wise","先做乘法，再按分量相加")),[tx(L(lang,"add first","先做加法")),tx(L(lang,"divide first","先做除法")),tx(L(lang,"ignore parentheses","忽略括号")),tx(L(lang,"combine only real parts","只合并实部")),tx(L(lang,"take every conjugate","全部取共轭"))],prompt,note,{});
    if(taskForm==="translate")return q(`z-(${latex(u)})=${latex(v)}`,latex(add(u,v)),choices(add(u,v)),prompt,note,{u:C.complexKey(u),v:C.complexKey(v)});
    return q(`(${latex(u)})(${latex(v)})+(${latex(w)})=${latex(add(u,add(v,w)))}`,tx(L(lang,"operation order was ignored","忽略了运算顺序")),[tx(L(lang,"correct","正确")),tx(L(lang,"conjugate required","需要共轭")),tx(L(lang,"imaginary parts vanish","虚部消失")),tx(L(lang,"all terms divide","所有项相除")),tx(L(lang,"no standard form","不能写成标准式"))],prompt,note,{});
  }
  F.register({toolId:"complex-number-operations",course:"algebra-2",concepts:["components-representations","addition-subtraction","multiplication-powers","division-conjugates","mixed-equations-applications"],build});
})(typeof window!=="undefined"?window:globalThis);
