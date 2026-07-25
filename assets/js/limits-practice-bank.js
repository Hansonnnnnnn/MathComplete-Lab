(function(root){
  "use strict";
  const factory=root.MCLSemanticBankFactory;
  if(!factory||root.MCLQuestionTemplates?.getTool("limits-practice"))return;
  const concepts=["direct-algebraic-limits","one-sided-piecewise","infinite-asymptotic","trigonometric-special","continuity-parameters"];
  const tx=(lang,en,zh)=>lang==="zh"?zh:en;
  const signed=n=>n<0?String(n):`+${n}`;
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
  const frac=(a,b)=>{if(b<0){a=-a;b=-b;}const d=gcd(a,b);a/=d;b/=d;return b===1?String(a):`\\frac{${a}}{${b}}`;};
  const text=value=>`\\text{${value}}`;
  function q(main,answer,distractors,lines,parameters,type,prompt){
    return {main,plain:main,prompt,answer:String(answer),distractors:distractors.map(String),lines,parameters,audit:{generatorId:type}};
  }
  function direct(form,rng,lang){
    const a=rng.choice([-3,-2,-1,1,2,3]),b=rng.int(-5,5),c=rng.int(-6,6),x=rng.int(-3,4),value=a*x*x+b*x+c;
    if(form==="direct")return q(`\\lim_{x\\to ${x}}(${a}x^2${signed(b)}x${signed(c)})`,value,[value+1,value-1,a*x+b+c,-value,0],[
      {line:`${a}(${x})^2${signed(b)}(${x})${signed(c)}`,note:"direct substitution"},{line:String(value),note:"simplify"}],{a,b,c,x},"limit-polynomial-substitution",tx(lang,"Evaluate by substitution.","直接代入求极限。"));
    if(form==="inverse"){
      const k=rng.int(-6,6),target=a*x+k;
      return q(`\\lim_{t\\to ${x}}(${a}t+p)=${target}`,`p=${k}`,[`p=${k+1}`,`p=${k-1}`,`p=${target}`,`p=${-k}`,`p=${a*x}`],[
        {line:`${a}(${x})+p=${target}`,note:"substitute the target"},{line:`p=${k}`,note:"solve the parameter"}],{a,x,k,target},"limit-linear-parameter",tx(lang,"Find the parameter from a stated limit.","根据极限值反求参数。"));
    }
    if(form==="interpret"){
      const den=rng.choice([2,3,4]),num=value*den;
      return q(`f(x)=\\frac{${a}x${signed(num-a*x)}}{${den}},\\quad x\\to ${x}`,text(tx(lang,"direct substitution applies","可直接代入")),[text(tx(lang,"factor cancellation is required","需要约去因式")),text(tx(lang,"rationalization is required","需要有理化")),text(tx(lang,"the limit does not exist","极限不存在")),text(tx(lang,"only a one-sided limit exists","只有单侧极限")),text(tx(lang,"leading coefficients are required","需要比较最高次项"))],[
        {line:tx(lang,"The denominator is nonzero and the function is continuous.","分母非零且函数在该点连续。"),note:"interpret structure"}],{a,den,x},"limit-method-selection",tx(lang,"Choose the valid evaluation method.","选择正确的求极限方法。"));
    }
    if(form==="translate"){
      const y1=value-1,y2=value,y3=value+1;
      return q(`\\begin{array}{c|ccc}x&${x-0.1}&${x-0.01}&${x+0.01}\\\\ f(x)&${y1}.9&${y2}.0&${y2}.0\\end{array}`,String(value),[value-1,value+1,x,text("DNE"),0],[
        {line:`f(x)\\to ${value}\\text{ from both sides}`,note:"read the table"},{line:`\\lim_{x\\to ${x}}f(x)=${value}`,note:"translate to a limit"}],{x,value,y1,y2,y3},"limit-table-to-symbol",tx(lang,"Estimate the limit from the table.","根据表格估计极限。"));
    }
    const wrong=value+a;
    return q(`\\lim_{x\\to ${x}}(${a}x^2${signed(b)}x${signed(c)})`,String(value),[wrong,value+1,value-1,-value,a*x+b+c],[
      {line:`x^2=(${x})^2`,note:"square the substituted value"},{line:`${a}(${x})^2${signed(b)}(${x})${signed(c)}=${value}`,note:"correct the arithmetic"}],{a,b,c,x,wrong},"limit-diagnose-substitution",tx(lang,`A student obtained ${wrong}. Find the correct limit.`,`学生得到 ${wrong}，求正确极限。`));
  }
  function oneSided(form,rng,lang){
    const x=rng.int(-3,3),left=rng.int(-5,2),right=left+rng.choice([1,2,3,4]),k=rng.int(-4,5);
    if(form==="direct")return q(`f(t)=\\begin{cases}${left},&t<${x}\\\\${right},&t\\ge ${x}\\end{cases},\\quad\\lim_{t\\to ${x}^-}f(t)`,left,[right,(left+right)/2,x,0,text("DNE")],[{line:`t<${x}\\Rightarrow f(t)=${left}`,note:"approach from the left"}],{x,left,right},"limit-left-hand-piecewise",tx(lang,"Evaluate the left-hand limit.","求左极限。"));
    if(form==="inverse")return q(`f(t)=\\begin{cases}${k}t,&t<${x}\\\\p,&t\\ge ${x}\\end{cases}`,`p=${k*x}`,[`p=${k}`,`p=${x}`,`p=${k+x}`,`p=${-k*x}`,`p=0`],[
      {line:`\\lim_{t\\to ${x}^-}f(t)=${k}(${x})=${k*x}`,note:"left-hand value"},{line:`p=${k*x}`,note:"match both sides"}],{x,k},"limit-piecewise-continuity-parameter",tx(lang,"Find p so the two-sided limit exists.","求使双侧极限存在的 p。"));
    if(form==="interpret")return q(`\\lim_{t\\to ${x}^-}f(t)=${left},\\quad\\lim_{t\\to ${x}^+}f(t)=${right}`,text("DNE"),[String(left),String(right),frac(left+right,2),String(right-left),text(tx(lang,"continuous","连续"))],[
      {line:`${left}\\ne ${right}`,note:"compare one-sided limits"},{line:text("DNE"),note:"the two-sided limit does not exist"}],{x,left,right},"limit-two-sided-existence",tx(lang,"Determine the two-sided limit.","判断双侧极限。"));
    if(form==="translate")return q(text(tx(lang,`The graph approaches y=${left} from the left and y=${right} from the right at x=${x}.`,`图像在 x=${x} 处左侧趋近 y=${left}，右侧趋近 y=${right}。`)),text("DNE"),[String(left),String(right),frac(left+right,2),String(x),text("\\infty")],[
      {line:`\\lim_{t\\to ${x}^-}f(t)=${left}`,note:"left behavior"},{line:`\\lim_{t\\to ${x}^+}f(t)=${right}`,note:"right behavior"},{line:text("DNE"),note:"unequal one-sided limits"}],{x,left,right},"limit-graph-description",tx(lang,"Translate the graph description into a limit.","把图像描述转化为极限结论。"));
    return q(`\\lim_{t\\to ${x}^-}f(t)=${left},\\quad\\lim_{t\\to ${x}^+}f(t)=${right}`,text("DNE"),[frac(left+right,2),String(left),String(right),String(right-left),String(0)],[
      {line:tx(lang,"A two-sided limit is not the average of unequal side limits.","双侧极限不是两个不相等单侧极限的平均数。"),note:"diagnose"},{line:text("DNE"),note:"correct conclusion"}],{x,left,right},"limit-diagnose-side-average",tx(lang,"Correct the student's averaging error.","纠正把左右极限取平均的错误。"));
  }
  function infinite(form,rng,lang){
    const a=rng.choice([-5,-4,-3,-2,2,3,4,5]),d=rng.choice([-4,-3,-2,2,3,4]),ratio=frac(a,d);
    if(form==="direct")return q(`\\lim_{x\\to\\infty}\\frac{${a}x^2${signed(rng.int(-5,5))}x+1}{${d}x^2${signed(rng.int(-5,5))}}`,ratio,[frac(d,a),"0","\\infty","-\\infty",frac(a+1,d)],[
      {line:`\\frac{${a}x^2}{${d}x^2}`,note:"keep leading terms"},{line:ratio,note:"ratio of leading coefficients"}],{a,d},"limit-infinity-leading-ratio",tx(lang,"Evaluate the limit at infinity.","求无穷远极限。"));
    if(form==="inverse"){
      const target=rng.choice([2,3,-2,-3]),lead=target*d;
      return q(`\\lim_{x\\to\\infty}\\frac{kx^2+1}{${d}x^2-4}=${target}`,`k=${lead}`,[`k=${target}`,`k=${d}`,`k=${target+d}`,`k=${-lead}`,`k=${frac(target,d)}`],[
        {line:`k/${d}=${target}`,note:"leading coefficient ratio"},{line:`k=${lead}`,note:"solve"}],{d,target,lead},"limit-infinity-coefficient",tx(lang,"Find the leading coefficient.","反求最高次项系数。"));
    }
    if(form==="interpret")return q(`\\lim_{x\\to\\infty}\\frac{${a}x+1}{${d}x^2+3}`,String(0),["\\infty","-\\infty",ratio,frac(d,a),text("DNE")],[
      {line:text(tx(lang,"denominator degree > numerator degree","分母次数大于分子次数")),note:"compare growth"},{line:"0",note:"limit"}],{a,d},"limit-degree-comparison",tx(lang,"Interpret relative polynomial growth.","解释多项式增长阶。"));
    if(form==="translate")return q(`f(x)=\\frac{${a}x^2+1}{${d}x^2-3}`,`y=${ratio}`,[`y=${frac(d,a)}`,"y=0",`x=${ratio}`,"y=\\infty","y=-\\infty"],[
      {line:`\\lim_{x\\to\\pm\\infty}f(x)=${ratio}`,note:"end behavior"},{line:`y=${ratio}`,note:"horizontal asymptote"}],{a,d},"limit-horizontal-asymptote",tx(lang,"Find the horizontal asymptote.","由极限求水平渐近线。"));
    return q(`\\lim_{x\\to\\infty}\\frac{${a}x^2+1}{${d}x^2-3}`,ratio,[frac(d,a),String(a-d),"0","\\infty","-\\infty"],[
      {line:tx(lang,"Use leading coefficients in numerator-over-denominator order.","按分子除以分母的顺序比较最高次项系数。"),note:"diagnose"},{line:ratio,note:"correct ratio"}],{a,d},"limit-diagnose-reciprocal-ratio",tx(lang,"Correct the reversed leading-coefficient ratio.","纠正最高次项系数比颠倒。"));
  }
  function trig(form,rng,lang){
    const k=rng.choice([2,3,4,5,-2,-3]),m=rng.choice([1,2,3,4]),ratio=frac(k,m);
    if(form==="direct")return q(`\\lim_{x\\to0}\\frac{\\sin(${k}x)}{${m===1?"":m}x}`,ratio,[frac(m,k),"0","1",String(k),String(m)],[{line:"\\lim_{u\\to0}\\frac{\\sin u}{u}=1",note:"basic trig limit"},{line:ratio,note:"adjust coefficients"}],{k,m},"limit-trig-sine",tx(lang,"Evaluate the sine limit.","求正弦基本极限。"));
    if(form==="inverse"){
      const target=rng.choice([2,3,4]),coef=target*m;
      return q(`\\lim_{x\\to0}\\frac{\\sin(kx)}{${m}x}=${target}`,`k=${coef}`,[`k=${target}`,`k=${m}`,`k=${target+m}`,`k=${-coef}`,`k=${frac(target,m)}`],[{line:`k/${m}=${target}`,note:"basic trig limit"},{line:`k=${coef}`,note:"solve"}],{m,target,coef},"limit-trig-parameter",tx(lang,"Find the frequency parameter.","反求三角极限中的参数。"));
    }
    if(form==="interpret")return q(`\\lim_{x\\to0}\\frac{\\tan(${k}x)}{${k}x}`,String(1),["0",String(k),String(-1),"\\infty",text("DNE")],[{line:"\\tan u/u\\to1",note:"recognize the standard form"}],{k},"limit-trig-standard-form",tx(lang,"Recognize the standard tangent limit.","识别正切基本极限。"));
    if(form==="translate"){
      const ans=frac(k*k,2);
      return q(`\\lim_{x\\to0}\\frac{1-\\cos(${k}x)}{x^2}`,ans,["0",String(k),String(k*k),frac(k,2),frac(2,k*k)],[{line:"1-\\cos u\\sim u^2/2",note:"cosine special limit"},{line:`(${k}x)^2/(2x^2)=${ans}`,note:"simplify"}],{k},"limit-trig-cosine-square",tx(lang,"Evaluate the cosine special limit.","求余弦特殊极限。"));
    }
    return q(`\\lim_{x\\to0}\\frac{\\sin(${k}x)}{x}`,String(k),["1","0",String(-k),frac(1,k),String(k*k)],[{line:`\\frac{\\sin(${k}x)}{x}=${k}\\frac{\\sin(${k}x)}{${k}x}`,note:"create the standard ratio"},{line:String(k),note:"radians-based limit"}],{k},"limit-diagnose-missing-factor",tx(lang,"Correct the missing inner-factor error.","纠正遗漏内层系数的错误。"));
  }
  function continuity(form,rng,lang){
    const a=rng.choice([-4,-3,-2,-1,1,2,3,4]),limit=2*a;
    if(form==="direct")return q(`f(x)=\\begin{cases}\\frac{x^2-${a*a}}{x${signed(-a)}},&x\\ne${a}\\\\${limit},&x=${a}\\end{cases}`,text(tx(lang,"continuous","连续")),[text(tx(lang,"jump discontinuity","跳跃间断")),text(tx(lang,"infinite discontinuity","无穷间断")),text(tx(lang,"removable discontinuity","可去间断")),text("DNE"),String(limit)],[{line:`\\lim_{x\\to${a}}f(x)=${limit}=f(${a})`,note:"three-part continuity test"}],{a,limit},"limit-continuity-test",tx(lang,"Determine whether f is continuous at the point.","判断函数在该点是否连续。"));
    if(form==="inverse")return q(`f(x)=\\begin{cases}\\frac{x^2-${a*a}}{x${signed(-a)}},&x\\ne${a}\\\\k,&x=${a}\\end{cases}`,`k=${limit}`,[`k=${a}`,`k=${-limit}`,"k=0",`k=${a*a}`,text("DNE")],[{line:`\\frac{x^2-${a*a}}{x${signed(-a)}}=x${signed(a)}`,note:"cancel the removable factor"},{line:`k=${limit}`,note:"match point value to limit"}],{a,limit},"limit-continuity-fill-hole",tx(lang,"Find k that makes f continuous.","求使函数连续的 k。"));
    if(form==="interpret")return q(`\\lim_{x\\to${a}}f(x)=${limit},\\quad f(${a})=${limit+1}`,text(tx(lang,"removable discontinuity","可去间断")),[text(tx(lang,"continuous","连续")),text(tx(lang,"jump discontinuity","跳跃间断")),text(tx(lang,"infinite discontinuity","无穷间断")),text("DNE"),text(tx(lang,"oscillatory discontinuity","振荡间断"))],[{line:`\\lim f=${limit}\\ne f(${a})`,note:"limit exists but point value differs"}],{a,limit},"limit-discontinuity-classification",tx(lang,"Classify the discontinuity.","判断间断类型。"));
    if(form==="translate"){
      const low=rng.int(-3,2),high=low+rng.int(2,6),target=rng.int(low+1,high-1);
      return q(text(tx(lang,`A continuous function has f(0)=${low} and f(2)=${high}. Which value is guaranteed between?`,`连续函数满足 f(0)=${low}、f(2)=${high}。哪一个值必定能取到？`)),String(target),[String(low-1),String(high+1),String(high+2),String(low-2),text("DNE")],[{line:`${low}<${target}<${high}`,note:"Intermediate Value Theorem"}],{low,high,target},"limit-ivt-translation",tx(lang,"Apply continuity to an interval statement.","把连续性转化为区间结论。"));
    }
    return q(`\\lim_{x\\to${a}}f(x)=${limit},\\quad f(${a})=${limit+1}`,text(tx(lang,"not continuous","不连续")),[text(tx(lang,"continuous","连续")),String(limit),String(limit+1),text(tx(lang,"limit does not exist","极限不存在")),text(tx(lang,"insufficient information","信息不足"))],[{line:tx(lang,"Continuity requires both existence and equality with the point value.","连续不仅要求极限存在，还要求极限等于函数值。"),note:"diagnose"},{line:`${limit}\\ne${limit+1}`,note:"compare"}],{a,limit},"limit-diagnose-existence-only",tx(lang,"Correct the incomplete continuity test.","纠正不完整的连续性判断。"));
  }
  const builders={"direct-algebraic-limits":direct,"one-sided-piecewise":oneSided,"infinite-asymptotic":infinite,"trigonometric-special":trig,"continuity-parameters":continuity};
  factory.register({toolId:"limits-practice",course:"single-variable-calculus",concepts,integerBounds:[-20,50],build:c=>builders[c.conceptId](c.taskForm,c.rng,c.lang==="zh"?"zh":"en")});
})(typeof window!=="undefined"?window:globalThis);
