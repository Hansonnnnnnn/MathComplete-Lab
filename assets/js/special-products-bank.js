(function(root){
  "use strict";
  const F=root.MCLSemanticBankFactory;if(!F)return;
  const tx=F.text,local=(lang,en,zh)=>lang==="zh"?zh:en;
  const q=(main,answer,distractors,prompt,note,parameters)=>({main,plain:main,answer,distractors,prompt,suggestion:note,parameters,lines:[{line:main,note},{line:answer,note:"result"}]});
  function build({conceptId,taskForm,variant,rng,lang}){
    const a=rng.int(2,8),b=rng.int(1,7),x=variant%2?"y":"x",pm=variant%2?"-":"+",prompt=local(lang,"Use a special-product identity.","使用特殊乘法恒等式。"),note=local(lang,"Identify the structure before expanding or factoring.","展开或因式分解前先识别结构。");
    let left,answer,wrong,reverse,label;
    if(conceptId==="perfect-square-binomials"){
      left=`(${a}${x}${pm}${b})^2`;answer=`${a*a}${x}^2${pm}${2*a*b}${x}+${b*b}`;label=local(lang,"perfect-square binomial","完全平方二项式");
      wrong=[`${a*a}${x}^2+${b*b}`,`${a*a}${x}^2${pm==="+"?"-":"+"}${2*a*b}${x}+${b*b}`,`${a}${x}^2${pm}${2*a*b}${x}+${b*b}`,`${a*a}${x}^2${pm}${a*b}${x}+${b*b}`,`${a*a}${x}^2${pm}${2*a*b}${x}-${b*b}`];
      reverse=[`(${a}${x}${pm==="+"?"-":"+"}${b})^2`,`(${a+1}${x}${pm}${b})^2`,`(${a}${x}${pm}${b+1})^2`,`(${a}${x}+${b})(${a}${x}-${b})`,`(${a}${x}${pm}${b})^3`];
    }else if(conceptId==="difference-of-squares"){
      left=`(${a}${x}+${b})(${a}${x}-${b})`;answer=`${a*a}${x}^2-${b*b}`;label=local(lang,"difference of squares","平方差");
      wrong=[`${a*a}${x}^2+${b*b}`,`${a}${x}^2-${b*b}`,`${a*a}${x}^2-${b}`,`${a*a}${x}^2-${2*a*b}${x}-${b*b}`,`${a*a}${x}^2+${2*a*b}${x}-${b*b}`];
      reverse=[`(${a}${x}+${b})^2`,`(${a}${x}-${b})^2`,`(${a+1}${x}+${b})(${a+1}${x}-${b})`,`(${a}${x}+${b+1})(${a}${x}-${b+1})`,`(${a}${x}+${b})(${a}${x}+${b})`];
    }else if(conceptId==="sum-difference-cubes"){
      left=`(${a}${x})^3${pm}${b*b*b}`;answer=pm==="+"?`(${a}${x}+${b})(${a*a}${x}^2-${a*b}${x}+${b*b})`:`(${a}${x}-${b})(${a*a}${x}^2+${a*b}${x}+${b*b})`;label=local(lang,"sum or difference of cubes","立方和或立方差");
      wrong=[`(${a}${x}${pm}${b})^3`,`(${a}${x}${pm}${b})(${a*a}${x}^2+${b*b})`,`(${a}${x}${pm==="+"?"-":"+"}${b})(${a*a}${x}^2-${a*b}${x}+${b*b})`,`(${a}${x}${pm}${b})(${a*a}${x}^2-${b*b})`,`(${a}${x}${pm}${b})(${a*a}${x}^2+${a*b}${x}-${b*b})`];
      reverse=[`(${a}${x})^3${pm==="+"?"-":"+"}${b*b*b}`,`(${a}${x})^3${pm}${b*b}`,`(${a}${x})^2${pm}${b*b*b}`,`(${a+1}${x})^3${pm}${b*b*b}`,`(${a}${x})^3${pm}${(b+1)**3}`];
    }else if(conceptId==="multivariable-identities"){
      left=`(${a}x+${b}y)^2`;answer=`${a*a}x^2+${2*a*b}xy+${b*b}y^2`;label=local(lang,"multivariable square identity","多变量平方恒等式");
      wrong=[`${a*a}x^2+${b*b}y^2`,`${a*a}x^2+${a*b}xy+${b*b}y^2`,`${a}x^2+${2*a*b}xy+${b}y^2`,`${a*a}x^2-${2*a*b}xy+${b*b}y^2`,`${a*a}x^2+${2*a*b}xy-${b*b}y^2`];
      reverse=[`(${a}x-${b}y)^2`,`(${a+1}x+${b}y)^2`,`(${a}x+${b+1}y)^2`,`(${a}x+${b}y)(${a}x-${b}y)`,`(${a}x+${b}y)^3`];
    }else{
      left=`[(${a}${x}+${b})+(${a}${x}-${b})][(${a}${x}+${b})-(${a}${x}-${b})]`;answer=`${4*a*b}${x}`;label=local(lang,"nested sum-and-difference structure","嵌套和差结构");
      wrong=[`${2*a*b}${x}`,`${4*a*a}${x}^2`,`${4*b*b}`,`${2*a}${x}+${2*b}`,`${4*a*b}${x}^2`];
      reverse=[`[(${a}${x}+${b})+(${a}${x}-${b})]^2`,`[(${a}${x}+${b})-(${a}${x}-${b})]^2`,`(${2*a}${x})(${2*b+1})`,`(${2*a+1}${x})(${2*b})`,`(${a}${x}+${b})(${a}${x}-${b})`];
    }
    if(taskForm==="direct")return q(left,answer,wrong,prompt,note,{a,b,variant});
    if(taskForm==="inverse")return q(`${left}=\\Box`,answer,wrong,prompt,note,{a,b,variant});
    if(taskForm==="interpret")return q(left,tx(label),[tx(local(lang,"linear equation","线性方程")),tx(local(lang,"long division","长除法")),tx(local(lang,"exponential decay","指数衰减")),tx(local(lang,"no identity applies","无可用恒等式")),tx(local(lang,"completing the square","配方法"))],prompt,note,{a,b,variant});
    if(taskForm==="translate")return q(answer,left,reverse,prompt,note,{a,b,variant});
    return q(`${left}=${wrong[0]}`,tx(local(lang,"cross-term or sign error","交叉项或符号错误")),[tx(local(lang,"identity is correct","恒等式正确")),tx(local(lang,"set variables to zero","令变量为零")),tx(local(lang,"constants cannot square","常数不能平方")),tx(local(lang,"reorder factors only","仅调换因式顺序")),tx(local(lang,"cannot expand","不能展开"))],prompt,note,{a,b,variant});
  }
  F.register({toolId:"special-products",course:"algebra-1",concepts:["perfect-square-binomials","difference-of-squares","sum-difference-cubes","multivariable-identities","nested-applications"],build});
})(typeof window!=="undefined"?window:globalThis);
