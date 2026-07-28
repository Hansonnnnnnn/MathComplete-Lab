(function (root) {
  "use strict";
  const registry=root.MCLQuestionTemplates,model=root.MCLLineAngleModel;
  if(!registry||!root.MCLQuizTool||!model)return;

  const concepts=["basic-angle-relations","parallel-transversal-relations","algebra-angle-equations","parallel-line-converses","multi-step-proof-diagnosis"];
  const names={
    "basic-angle-relations":["vertical-identification","linear-pair-identification","adjacent-angle-identification","supplement-from-measure","complement-from-measure","vertical-measure","linear-pair-measure","right-angle-partition","unknown-relation","marked-vs-appearance","multi-angle-vertex","straight-line-equation","right-angle-equation","vertical-converse","linear-pair-language","angle-name-reading","intersection-table","missing-mark","student-vertical-error","student-supplement-error","basic-capstone"],
    "parallel-transversal-relations":["corresponding-identification","alternate-interior-identification","alternate-exterior-identification","same-side-interior-identification","same-side-exterior-identification","corresponding-measure","alternate-interior-measure","alternate-exterior-measure","same-side-interior-measure","same-side-exterior-measure","select-corresponding","select-alternate-interior","select-alternate-exterior","select-same-side-interior","select-same-side-exterior","three-parallel-transfer","double-transversal-comparison","triangle-parallel-segment","trapezoid-angle-chain","parallelogram-diagonal","transversal-capstone"],
    "algebra-angle-equations":["vertical-one-step","linear-one-step","corresponding-one-step","alternate-interior-one-step","same-side-interior-one-step","vertical-two-step","linear-distributive","corresponding-negative-constant","alternate-exterior-fraction-context","same-side-exterior-two-step","solve-x-then-angle","two-intersection-equation","three-parallel-equation","triangle-interior-equation","trapezoid-equation","parallelogram-equation","choose-correct-equation","diagnose-x-as-angle","diagnose-equal-vs-supplement","missing-expression","algebra-capstone"],
    "parallel-line-converses":["corresponding-converse","alternate-interior-converse","alternate-exterior-converse","same-side-interior-converse","same-side-exterior-converse","vertical-not-converse","linear-pair-not-converse","equal-adjacent-not-converse","unmarked-appearance","insufficient-angle-pair","choose-proof-angle","choose-supplement-condition","missing-measure-corresponding","missing-measure-same-side","two-transversals-converse","three-lines-converse","triangle-segment-converse","trapezoid-converse","repair-converse-proof","student-converse-error","converse-capstone"],
    "multi-step-proof-diagnosis":["vertical-then-corresponding","linear-then-alternate","corresponding-then-linear","three-parallel-chain","double-transversal-chain","triangle-parallel-chain","trapezoid-chain","parallelogram-chain","two-equation-chain","find-final-angle","proof-step-reason","proof-step-order","missing-prerequisite","invalid-appearance-step","invalid-converse-step","wrong-intersection-angle","wrong-supplement-direction","proof-repair","compare-two-solutions","multi-select-congruent-class","proof-capstone"]
  };
  concepts.forEach(concept=>{names[concept]=names[concept].map(name=>`${concept}-${name}`);});
  const topologies=["single-intersection","single-transversal","double-transversal","three-parallel-lines","triangle-interior-parallel","trapezoid","parallelogram"];
  const relationOrder=["corresponding","alternateInterior","alternateExterior","sameSideInterior","sameSideExterior"];
  const tasks=registry.TASK_FORMS;
  const txt=(en,zh)=>root.localStorage?.getItem?.("mathcomplete_lang")==="zh"?zh:en;
  const escapeText=value=>String(value).replaceAll("\\","\\textbackslash{}").replaceAll("&","\\&").replaceAll("%","\\%").replaceAll("_","\\_").replaceAll("{","\\{").replaceAll("}","\\}");
  const text=value=>`\\text{${escapeText(value)}}`;
  const unique=values=>[...new Set(values.map(String))];
  const point=(x,y,label,extra={})=>({x:Math.round(x),y:Math.round(y),label,...extra});
  const polar=(center,degrees,radius)=>{const angle=degrees*Math.PI/180;return{x:center.x+Math.cos(angle)*radius,y:center.y-Math.sin(angle)*radius};};
  const relationLabel=key=>({
    corresponding:txt("corresponding angles","同位角"),alternateInterior:txt("alternate interior angles","内错角"),alternateExterior:txt("alternate exterior angles","外错角"),sameSideInterior:txt("same-side interior angles","同旁内角"),sameSideExterior:txt("same-side exterior angles","同旁外角"),vertical:txt("vertical angles","对顶角"),linear:txt("a linear pair","线性对角"),adjacent:txt("adjacent angles","邻角"),unrelated:txt("no justified special relationship","没有可推出的特殊关系")
  }[key]||key);
  const relationRule=key=>key==="sameSideInterior"||key==="sameSideExterior"?"supplementary":"congruent";
  const relationPair=(key,variant=0)=>model.relationPairs[key][variant%model.relationPairs[key].length];
  const angleId=(level,index)=>`${level}${index}`;
  const angleNumber=id=>{if(id.startsWith("I"))return Number(id.slice(1))+1;if(id.startsWith("J"))return Number(id.slice(1))+5;return Number(id.slice(1))+1;};
  const angleLatex=id=>`\\angle ${angleNumber(id)}`;
  const anglePlain=id=>`∠${angleNumber(id)}`;
  const measure=(theta,id)=>model.angleMeasure(theta,Number(id.slice(1)));
  const equationText=(id,expression)=>`m${anglePlain(id)} = ${expression}°`;
  const algebraExpression=(coefficient,constant)=>`${coefficient===1?"":coefficient}x${constant===0?"":constant>0?` + ${constant}`:` - ${Math.abs(constant)}`}`;
  const makeScene=(points,segments,extra={})=>({version:2,viewBox:[0,0,720,420],points,segments,ariaLabel:txt("Line and angle diagram","直线与角关系图"),...extra});

  function rotatePoint(value,center,degrees){const angle=degrees*Math.PI/180,dx=value.x-center.x,dy=value.y-center.y;return{x:center.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:center.y+dx*Math.sin(angle)+dy*Math.cos(angle)};}
  function addAngleRegions(scene,vertexId,prefix,theta,rotation,labels){
    const starts=[rotation,rotation+theta,rotation+180,rotation+180+theta];
    const ends=[rotation+theta,rotation+180,rotation+180+theta,rotation+360];
    for(let index=0;index<4;index+=1){
      const id=`${prefix}${index}`;scene.angleRegions.push({id,vertex:vertexId,start:starts[index],end:ends[index],radius:68,arcRadius:29+(index%2)*7,group:4,interactive:true,arc:false});
      const center=scene.points[vertexId],position=polar(center,(starts[index]+ends[index])/2,50);
      scene.annotations.push({x:position.x-5,y:position.y+6,text:String(labels[index])});
    }
  }
  function lineScene(topology,theta,markedParallel=true,rotation=0){
    const points={},segments=[],polygons=[],marks=[],angleRegions=[],annotations=[],facts=[];
    if(topology==="single-intersection"){
      points.O=point(360,210,"O");points.L=point(90,210,"",{hidden:true});points.R=point(630,210,"",{hidden:true});
      const a=polar(points.O,theta,285),b=polar(points.O,theta+180,285);points.U=point(a.x,a.y,"",{hidden:true});points.V=point(b.x,b.y,"",{hidden:true});
      segments.push({id:"line-a",a:"L",b:"R"},{id:"line-b",a:"U",b:"V"});
      const scene=makeScene(points,segments,{marks,angleRegions,annotations,facts,topology,parallelMarked:false});addAngleRegions(scene,"O","O",theta,0,[1,2,3,4]);return{scene,angleIds:["O0","O1","O2","O3"],theta};
    }
    const I={x:430,y:130},J={x:430-160/Math.tan(theta*Math.PI/180),y:290},center={x:360,y:210};
    const raw={
      I,J,P1:{x:90,y:130},P2:{x:630,y:130},Q1:{x:90,y:290},Q2:{x:630,y:290},
      T1:polar(I,theta,125),T2:polar(J,theta+180,125)
    };
    Object.entries(raw).forEach(([id,value])=>{const rotated=rotation?rotatePoint(value,center,rotation):value;points[id]=point(rotated.x,rotated.y,id==="I"?"U":id==="J"?"V":"",{hidden:!(["I","J"].includes(id))});});
    const addSegment=(id,a,b,extra={})=>segments.push({id,a,b,...extra});
    addSegment("top-line","P1","P2");addSegment("bottom-line","Q1","Q2");addSegment("transversal","T1","T2");
    if(topology==="double-transversal"){
      points.K1=point(555,55,"",{hidden:true});points.K2=point(320,370,"",{hidden:true});addSegment("second-transversal","K1","K2",{helper:true});
    }
    if(topology==="three-parallel-lines"){
      const left=rotation?rotatePoint({x:90,y:210},center,rotation):{x:90,y:210},right=rotation?rotatePoint({x:630,y:210},center,rotation):{x:630,y:210};points.M1=point(left.x,left.y,"",{hidden:true});points.M2=point(right.x,right.y,"",{hidden:true});addSegment("middle-line","M1","M2");if(markedParallel)marks.push({type:"parallel",a:"M1",b:"M2",count:1,group:1});
    }
    if(topology==="triangle-interior-parallel"){
      points.I.hidden=true;points.J.hidden=true;points.A={...points.J,label:"A",hidden:false};points.D={...points.I,label:"D",hidden:false};
      const c=polar(points.I,theta,115);points.C=point(c.x,c.y,"C");points.B=point(630,290,"B");
      const ratio=(points.I.y-points.C.y)/(points.B.y-points.C.y);points.E=point(points.C.x+(points.B.x-points.C.x)*ratio,points.I.y,"E");polygons.push({points:["A","C","B"]});segments.splice(0,3,{id:"DE",a:"D",b:"E"},{id:"AB",a:"A",b:"B"},{id:"AC",a:"A",b:"C"});
    }
    if(topology==="trapezoid"||topology==="parallelogram"){
      points.I.hidden=true;points.J.hidden=true;points.A={...points.J,label:"A",hidden:false};points.D={...points.I,label:"D",hidden:false};points.B=point(625,290,"B");points.C=topology==="parallelogram"?point(625+(points.I.x-points.J.x),130,"C"):point(555,130,"C");polygons.push({points:["A","D","C","B"]});segments.splice(0,3,{id:"DC",a:"D",b:"C"},{id:"AB",a:"A",b:"B"},{id:"AD",a:"A",b:"D"});
    }
    const topSegment=segments.find(item=>item.id==="top-line"||item.id==="DE"||item.id==="DC")||segments[0],bottomSegment=segments.find(item=>item.id==="bottom-line"||item.id==="AB")||segments[1];
    if(markedParallel){marks.push({type:"parallel",a:topSegment.a,b:topSegment.b,count:1,group:1},{type:"parallel",a:bottomSegment.a,b:bottomSegment.b,count:1,group:1});}
    const scene=makeScene(points,segments,{marks,angleRegions,annotations,facts,polygons,topology,parallelMarked:markedParallel,theta,rotation});
    addAngleRegions(scene,"I","I",theta,rotation,[1,2,3,4]);addAngleRegions(scene,"J","J",theta,rotation,[5,6,7,8]);
    return{scene,angleIds:["I0","I1","I2","I3","J0","J1","J2","J3"],theta};
  }

  function allTargets(data){return data.angleIds.map(id=>({key:id,label:anglePlain(id)}));}
  function promptFor(index){return[
    txt("Use the stated relationship directly.","直接使用题目给出的角关系。"),txt("Work backward from the required angle or line relationship.","从所需的角或直线关系倒推。"),txt("Interpret only the explicit markings and facts.","只解读明确标出的图形标记与条件。"),txt("Translate the diagram into an exact equation or theorem.","把图形转化为精确方程或定理。"),txt("Diagnose the tempting but invalid step.","诊断看似合理但无效的步骤。")
  ][index%5];}
  function topologyPrompt(topology,markedParallel=true){
    if(!markedParallel&&topology!=="single-intersection")return txt("No parallel arrows are shown. Decide whether the stated angle condition is sufficient to prove parallel lines.","图中没有平行箭头。请判断给出的角关系是否足以证明直线平行。");
    return({
    "single-intersection":txt("The diagram contains one intersection.","图中包含一个交点。"),"single-transversal":txt("Two marked parallel lines are cut by one transversal.","两条带平行标记的直线被一条截线所截。"),"double-transversal":txt("Track the named angles across two transversals.","在两条截线之间追踪被命名的角。"),"three-parallel-lines":txt("Three marked parallel lines share a transversal.","三条带平行标记的直线共用一条截线。"),"triangle-interior-parallel":txt("A segment inside the triangle is marked parallel to the base.","三角形内部线段与底边带有平行标记。"),trapezoid:txt("Use the marked parallel bases of the trapezoid.","使用梯形中带标记的两条平行底边。"),parallelogram:txt("Use only the marked parallel sides of the parallelogram.","只使用平行四边形中带标记的平行边。")
  }[topology]);}
  function finish({main,answer,distractors,prompt,solution,scene,parameters,interaction,lines}){
    const extras=[text(txt("Cannot be determined","无法确定")),text(txt("The angles only look equal","这些角只是看起来相等")),text(txt("The lines are not proven parallel","无法证明两条直线平行")),"90","180","0"];
    const cleaned=unique([...(distractors||[]),...extras]).filter(value=>String(value)!==String(answer));
    return{main,plain:main,answer:String(answer),distractors:cleaned.slice(0,10),prompt,lines:lines||[{line:main,note:txt("identify the named lines and angles","确认被命名的直线与角")},{line:String(answer),note:solution}],suggestion:solution,visual:scene,parameters,interaction:interaction||null};
  }
  function makeMatchingRows(data,conceptIndex){
    const optionSet=[
      {key:"corresponding",label:relationLabel("corresponding")},{key:"alternateInterior",label:relationLabel("alternateInterior")},{key:"alternateExterior",label:relationLabel("alternateExterior")},{key:"sameSideInterior",label:relationLabel("sameSideInterior")},{key:"vertical",label:relationLabel("vertical")},{key:"linear",label:relationLabel("linear")},{key:"valid",label:txt("proves the lines parallel","可以证明直线平行")},{key:"invalid",label:txt("does not prove the lines parallel","不能证明直线平行")}
    ];
    if(conceptIndex===0){const prefix=data.angleIds[0].charAt(0);return[{id:"r1",label:`${anglePlain(`${prefix}0`)} & ${anglePlain(`${prefix}2`)}`,correct:"vertical",options:optionSet},{id:"r2",label:`${anglePlain(`${prefix}0`)} & ${anglePlain(`${prefix}1`)}`,correct:"linear",options:optionSet}];}
    if(conceptIndex===3)return[{id:"r1",label:txt("Corresponding angles are congruent","同位角全等"),correct:"valid",options:optionSet},{id:"r2",label:txt("Vertical angles are congruent","对顶角全等"),correct:"invalid",options:optionSet},{id:"r3",label:txt("Same-side interior angles are supplementary","同旁内角互补"),correct:"valid",options:optionSet}];
    return[{id:"r1",label:`${anglePlain("I0")} & ${anglePlain("J0")}`,correct:"corresponding",options:optionSet},{id:"r2",label:`${anglePlain("I2")} & ${anglePlain("J0")}`,correct:"alternateInterior",options:optionSet},{id:"r3",label:`${anglePlain("I0")} & ${anglePlain("J2")}`,correct:"alternateExterior",options:optionSet}];
  }
  function makeOrder(conceptIndex,rng){
    const sets=[
      [txt("Identify the common vertex.","确认共同顶点。"),txt("Classify the angle pair.","判断角对关系。"),txt("Apply equality or a 180° sum.","应用相等关系或 180° 和。"),txt("Compute the requested angle.","计算所求角。")],
      [txt("Confirm the parallel markings.","确认平行标记。"),txt("Locate the transversal.","找出截线。"),txt("Classify the two angle positions.","判断两个角的位置关系。"),txt("Apply the matching theorem.","应用对应定理。")],
      [txt("Classify the angle relationship.","判断角关系。"),txt("Write the equality or supplementary equation.","写出相等或互补方程。"),txt("Solve for x.","求出 x。"),txt("Substitute x into the requested angle.","把 x 代入所求角。")],
      [txt("Identify the given angle relationship.","确认已知角关系。"),txt("Check that the angles belong to two lines and one transversal.","检查这些角是否来自两条直线和一条截线。"),txt("Apply the correct converse theorem.","应用正确的逆定理。"),txt("Conclude that the two lines are parallel.","得出两条直线平行。")],
      [txt("List the explicit markings and givens.","列出明确标记与已知条件。"),txt("Establish the first angle relationship.","建立第一个角关系。"),txt("Transfer the measure to the second intersection.","把角度传递到第二个交点。"),txt("Check the final conclusion against the named target.","对照被命名的目标检查最终结论。")]
    ];
    const tokens=sets[conceptIndex].map((label,index)=>({id:`s${index+1}`,label}));return{tokens:rng.shuffle(tokens),correctOrder:tokens.map(token=>token.id)};
  }

  function semantic(conceptIndex,scenario,rng,topology,interactionKind){
    const theta=rng.int(35,75),fixedTopology=["triangle-interior-parallel","trapezoid","parallelogram"].includes(topology),rotation=topology==="single-intersection"||fixedTopology?0:rng.int(-8,8),markedParallel=conceptIndex!==3;
    const effectiveTopology=conceptIndex===0&&scenario%3===0?"single-intersection":topology==="single-intersection"?"single-transversal":topology;
    const data=lineScene(effectiveTopology,theta,markedParallel,rotation);
    const scene=data.scene,relation=relationOrder[scenario%relationOrder.length],variant=scenario%2;
    let main,answer,distractors=[],solution,targetKeys=[],targetPrompt=null,numericAnswer=null,numericPrompt=null,matchingRows=null,orderSpec=null,parameters={theta,topology:scene.topology,relation,markedParallel};
    if(conceptIndex===0){
      const base=data.angleIds[0],vertical=data.angleIds[2],adjacent=data.angleIds[1],mode=scenario%4;
      if(mode===0){main=text(txt(`What is the relationship between ${anglePlain(base)} and ${anglePlain(vertical)}?`,`$${anglePlain(base)}$ 与 $${anglePlain(vertical)}$ 是什么关系？`));answer=text(relationLabel("vertical"));distractors=[text(relationLabel("linear")),text(relationLabel("adjacent")),text(relationLabel("corresponding")),text(relationLabel("unrelated"))];solution=txt("Opposite angles formed by two intersecting lines are vertical angles.","两条相交直线形成的相对角是对顶角。");targetKeys=[vertical];}
      else if(mode===1){main=`m${angleLatex(base)}=${theta}^{\\circ},\\quad m${angleLatex(vertical)}=?`;answer=String(theta);numericAnswer=theta;distractors=[String(180-theta),String(theta+10),String(90-theta),String(2*theta)];solution=txt("Vertical angles are congruent.","对顶角全等。");targetKeys=[vertical];}
      else if(mode===2){main=`m${angleLatex(base)}=${theta}^{\\circ},\\quad m${angleLatex(adjacent)}=?`;answer=String(180-theta);numericAnswer=180-theta;distractors=[String(theta),String(90-theta),String(2*theta),String(180)];solution=txt("A linear pair is supplementary, so subtract the known angle from 180°.","线性对角互补，因此用 180° 减去已知角。");targetKeys=[adjacent];}
      else{main=text(txt("Which conclusion is justified by the intersection markings?","根据交点标记可以推出哪个结论？"));answer=text(txt("The vertical angles are congruent","对顶角全等"));distractors=[text(txt("Every adjacent pair is congruent","所有邻角都全等")),text(txt("The two lines are parallel","两条直线平行")),text(txt("Every angle is 90°","所有角都是 90°")),text(txt("The drawing proves equal lengths","图形可以证明线段等长"))];solution=txt("Only vertical-angle and linear-pair relationships follow from an unmarked intersection.","未标记的交点只能推出对顶角和线性对角关系。");targetKeys=[vertical];}
      numericAnswer=numericAnswer??theta;numericPrompt=text(txt(`Enter the measure of ${anglePlain(targetKeys[0])} when ${anglePlain(base)} measures ${theta}°.`,`当 ${anglePlain(base)} 为 ${theta}° 时，输入 ${anglePlain(targetKeys[0])} 的度数。`));targetPrompt=text(txt(`Select the angle vertically opposite ${anglePlain(base)}.`,`选择与 ${anglePlain(base)} 互为对顶角的角。`));matchingRows=makeMatchingRows(data,conceptIndex);orderSpec=makeOrder(conceptIndex,rng);
    }
    if(conceptIndex===1){
      const pair=relationPair(relation,variant),first=angleId("I",pair[0]),second=angleId("J",pair[1]),rule=relationRule(relation),targetMeasure=measure(theta,second);
      if(scenario%3===0){main=text(txt(`Classify ${anglePlain(first)} and ${anglePlain(second)}.`,`判断 ${anglePlain(first)} 与 ${anglePlain(second)} 的关系。`));answer=text(relationLabel(relation));distractors=relationOrder.filter(key=>key!==relation).map(key=>text(relationLabel(key)));solution=txt(`Their positions make them ${relationLabel(relation)}.`,`根据位置可知它们是${relationLabel(relation)}。`);}
      else{main=`m${angleLatex(first)}=${measure(theta,first)}^{\\circ},\\quad m${angleLatex(second)}=?`;answer=String(targetMeasure);numericAnswer=targetMeasure;distractors=[String(180-targetMeasure),String(theta+10),String(Math.abs(90-targetMeasure)),String(2*theta)];solution=rule==="congruent"?txt("The marked parallel lines make this angle pair congruent.","平行线标记说明这组角全等。"):txt("Same-side angles are supplementary, so their measures total 180°.","同旁角互补，因此角度和为 180°。");}
      numericAnswer=numericAnswer??targetMeasure;numericPrompt=text(txt(`Enter the measure of ${anglePlain(second)} when ${anglePlain(first)} measures ${measure(theta,first)}°.`,`当 ${anglePlain(first)} 为 ${measure(theta,first)}° 时，输入 ${anglePlain(second)} 的度数。`));targetPrompt=text(txt(`Select the angle that is ${relationLabel(relation)} with ${anglePlain(first)}.`,`选择与 ${anglePlain(first)} 构成${relationLabel(relation)}的角。`));targetKeys=[second];matchingRows=makeMatchingRows(data,conceptIndex);orderSpec=makeOrder(conceptIndex,rng);parameters.pair=[first,second];
    }
    if(conceptIndex===2){
      const pair=relationPair(relation,variant),first=angleId("I",pair[0]),second=angleId("J",pair[1]),rule=relationRule(relation),x=rng.int(3,11),a=rng.int(2,5),rawC=rng.int(2,5)+(scenario%2),c=rule==="congruent"&&rawC===a?(a===5?2:a+1):rawC,m1=measure(theta,first),m2=rule==="congruent"?m1:180-m1,b=m1-a*x,d=m2-c*x,expr1=algebraExpression(a,b),expr2=algebraExpression(c,d);
      scene.facts=[equationText(first,expr1),equationText(second,expr2)];
      main=text(txt(`Use the ${relationLabel(relation)} relationship to find x.`,`利用${relationLabel(relation)}关系求 x。`));answer=String(x);numericAnswer=x;numericPrompt=main;distractors=[String(x+1),String(x-1),String(theta),String(180-theta),String(Math.abs(b-d)),String(a+c)];solution=rule==="congruent"?txt("Set the two angle expressions equal, solve for x, and then check the angle measures.","令两个角的表达式相等，求出 x 后检查角度。 "):txt("Set the two expressions to sum to 180°, solve for x, and verify both angles.","令两个表达式之和为 180°，求出 x 后验证两个角。");targetPrompt=text(txt(`Select both angle regions used to build the equation for x.`,`选择用于建立 x 方程的两个角区。`));targetKeys=[first,second];matchingRows=makeMatchingRows(data,1);orderSpec=makeOrder(conceptIndex,rng);parameters={...parameters,x,coefficients:[a,b,c,d],pair:[first,second],equationRule:rule,solutionAngles:[m1,m2]};
    }
    if(conceptIndex===3){
      const converseCases=[
        {relation:"corresponding",rule:"congruent",valid:true},{relation:"alternateInterior",rule:"congruent",valid:true},{relation:"alternateExterior",rule:"congruent",valid:true},{relation:"sameSideInterior",rule:"supplementary",valid:true},{relation:"sameSideExterior",rule:"supplementary",valid:true},{relation:"vertical",rule:"congruent",valid:false},{relation:"linear",rule:"supplementary",valid:false},{relation:"adjacent",rule:"congruent",valid:false}
      ],caseItem=converseCases[scenario%converseCases.length];let first="I2",second="J0";
      if(caseItem.relation==="vertical"){first="I0";second="I2";}else if(caseItem.relation==="linear"){first="I0";second="I1";}else if(caseItem.relation==="adjacent"){first="I1";second="I2";}else{const pair=relationPair(caseItem.relation,variant);first=angleId("I",pair[0]);second=angleId("J",pair[1]);}
      const fact=caseItem.rule==="congruent"?`${anglePlain(first)} ≅ ${anglePlain(second)}`:`m${anglePlain(first)} + m${anglePlain(second)} = 180°`;scene.facts=[fact];
      main=text(txt(`Does the stated ${relationLabel(caseItem.relation)} condition prove the two lines parallel?`,`给出的${relationLabel(caseItem.relation)}条件能否证明两条直线平行？`));answer=text(caseItem.valid?txt(`Yes, by the ${relationLabel(caseItem.relation)} converse`,`可以，使用${relationLabel(caseItem.relation)}的逆定理`):txt("No; the condition does not connect the two lines through a valid converse","不能；该条件没有通过有效逆定理联系两条直线"));distractors=[text(txt("Yes, because the lines look parallel","可以，因为两条直线看起来平行")),text(txt("Yes, by the vertical angles theorem","可以，使用对顶角定理")),text(txt("No, because converse theorems never prove parallel lines","不能，因为逆定理不能证明平行")),text(txt("The condition proves the transversal is parallel","该条件证明截线平行"))];solution=caseItem.valid?txt("The named angles occupy the required positions, so the matching converse theorem proves the lines parallel.","这些角处于逆定理要求的位置，因此可以证明两条直线平行。"):txt("Vertical, adjacent, or merely equal-looking angles at one intersection cannot prove two separate lines parallel.","同一交点的对顶角、邻角或仅凭外观看起来相等的角不能证明两条直线平行。");targetKeys=[second];numericAnswer=caseItem.rule==="congruent"?theta:180-theta;numericPrompt=text(txt(`Enter the measure ${anglePlain(second)} must have to satisfy the stated angle condition. This value alone may or may not prove parallel lines.`,`输入 ${anglePlain(second)} 为满足所述角关系应有的度数。仅有该数值未必能证明直线平行。`));targetPrompt=text(caseItem.valid?txt(`Select the angle at the other intersection used by this valid ${relationLabel(caseItem.relation)} converse.`,`选择这个有效${relationLabel(caseItem.relation)}逆定理在另一个交点使用的角。`):txt(`Select the second angle used in the invalid converse claim.`,`选择无效逆定理主张中使用的第二个角。`));matchingRows=makeMatchingRows(data,conceptIndex);orderSpec=makeOrder(conceptIndex,rng);parameters={...parameters,caseRelation:caseItem.relation,converseValid:caseItem.valid,pair:[first,second]};
    }
    if(conceptIndex===4){
      const start="I0",vertical="I2",corresponding="J0",otherVertical="J2",target=scenario%2?otherVertical:corresponding,targetMeasure=measure(theta,target);scene.facts=[`m${anglePlain(start)} = ${theta}°`];
      if(scenario%3===0){main=text(txt(`Select every angle, other than ${anglePlain(start)}, that must be congruent to it.`,`选择除 ${anglePlain(start)} 外所有必与它全等的角。`));answer=[vertical,corresponding,otherVertical].sort().join("|");targetKeys=[vertical,corresponding,otherVertical];distractors=["I1","I3","J1","J3","I1|J1"];solution=txt("Use a vertical-angle step at the first intersection and corresponding plus vertical-angle steps at the second.","先在第一个交点使用对顶角关系，再在第二个交点使用同位角和对顶角关系。");}
      else{main=`m${angleLatex(start)}=${theta}^{\\circ},\\quad m${angleLatex(target)}=?`;answer=String(targetMeasure);numericAnswer=targetMeasure;distractors=[String(180-targetMeasure),String(theta+15),String(2*theta),String(Math.abs(90-theta))];solution=txt("Transfer the measure through the justified vertical and corresponding-angle steps only.","只通过有依据的对顶角与同位角步骤传递角度。");targetKeys=[target];}
      numericAnswer=numericAnswer??targetMeasure;numericPrompt=text(txt(`Enter the final measure of ${anglePlain(target)} after following the justified angle chain.`,`沿有依据的角关系链推理后，输入 ${anglePlain(target)} 的最终度数。`));targetPrompt=text(txt(`Select every angle that must be congruent to ${anglePlain(start)}.`,`选择所有必与 ${anglePlain(start)} 全等的角。`));matchingRows=[{id:"r1",label:txt("At the first intersection","在第一个交点"),correct:"vertical",options:[{key:"vertical",label:relationLabel("vertical")},{key:"corresponding",label:relationLabel("corresponding")},{key:"linear",label:relationLabel("linear")}]},{id:"r2",label:txt("Between the two intersections","在两个交点之间"),correct:"corresponding",options:[{key:"vertical",label:relationLabel("vertical")},{key:"corresponding",label:relationLabel("corresponding")},{key:"linear",label:relationLabel("linear")}]}];orderSpec=makeOrder(conceptIndex,rng);parameters={...parameters,chain:[start,vertical,corresponding,otherVertical]};
    }
    return{data,scene,main,answer,distractors,solution,targetKeys,targetPrompt,numericAnswer,numericPrompt,matchingRows,orderSpec,parameters};
  }

  function buildQuestion(conceptIndex,scenario,globalIndex,interactionKind,rng,topology){
    const info=semantic(conceptIndex,scenario,rng,topology,interactionKind);let main=info.main,answer=info.answer,distractors=info.distractors,interaction=null,prompt=`${topologyPrompt(info.scene.topology,info.parameters.markedParallel)} ${promptFor(scenario)}`,solution=info.solution;
    if(interactionKind==="target"){
      const multiple=info.targetKeys.length>1,correctKeys=multiple?info.targetKeys:[info.targetKeys[0]];interaction={kind:multiple?"target-set":"target",instruction:multiple?txt("Select every required angle, then submit.","选择所有符合条件的角后提交。"):txt("Select the requested angle in the diagram.","选择图中要求的角。"),correctKey:correctKeys.slice().sort().join("|"),targets:allTargets(info.data)};answer=interaction.correctKey;main=info.targetPrompt||info.main;
    }
    if(interactionKind==="numeric"){
      const numeric=info.numericAnswer;interaction={kind:"numeric",correctKey:String(numeric),label:txt("Enter the exact value. Do not include the degree symbol.","输入精确数值，不要输入度数符号。")};answer=String(numeric);main=info.numericPrompt||info.main;
    }
    if(interactionKind==="matching"){
      const rows=info.matchingRows,correctKey=rows.map(row=>`${row.id}=${row.correct}`).join("|");interaction={kind:"matching",instruction:txt("Match each angle pair or proof condition to its exact relationship.","把每组角或证明条件与精确关系配对。"),rows,correctKey};answer=correctKey;main=text(txt("Complete the relationship matching table.","完成角关系配对表。"));
    }
    if(interactionKind==="order"){
      const spec=info.orderSpec,correctKey=spec.correctOrder.join(">");interaction={kind:"order",instruction:txt("Build the reasoning chain in a valid order.","按有效顺序构建推理链。"),tokens:spec.tokens,correctOrder:spec.correctOrder,correctKey};answer=correctKey;main=text(txt("Order the steps needed to justify the conclusion.","排列证明结论所需的步骤。"));
    }
    return finish({main,answer,distractors,prompt,solution,scene:info.scene,parameters:{...info.parameters,geometrySchemaId:names[concepts[conceptIndex]][scenario],interactionKind,scenarioIndex:scenario,topology:info.scene.topology},interaction,lines:[{line:main,note:txt("identify the exact named angle or line pair","确认被精确命名的角或直线对")},{line:text(info.parameters.relation?relationLabel(info.parameters.relation):txt("Use the marked relationship","使用带标记的关系")),note:txt("choose congruent, supplementary, or a valid converse","选择全等、互补或有效逆定理")},{line:String(answer),note:solution}]});
  }

  const interactionPool=[...Array(45).fill("choice"),...Array(20).fill("target"),...Array(15).fill("numeric"),...Array(15).fill("matching"),...Array(10).fill("order")];
  const interactionFor=index=>interactionPool[(index*13)%105];
  const validate=question=>{
    const p=question.parameters||{},answer=String(question.answer||"");if(!p.geometrySchemaId||!question.visual||!answer)return false;
    if(unique(question.distractors||[]).filter(value=>value!==answer).length<5)return false;
    if(p.theta<25||p.theta>155||Math.abs(p.theta-90)<5)return false;
    if(p.markedParallel===false&&(question.visual.marks||[]).some(mark=>mark.type==="parallel"))return false;
    if(p.solutionAngles&&p.solutionAngles.some(value=>value<=0||value>=180))return false;
    if(p.x!==undefined&&(!Number.isInteger(p.x)||p.x<=0))return false;
    if(question.interaction?.kind==="target"||question.interaction?.kind==="target-set"){
      const keys=model.canonicalSet(question.interaction.correctKey).split("|").filter(Boolean),available=new Set(question.interaction.targets.map(target=>target.key));if(!keys.length||keys.some(key=>!available.has(key)))return false;
    }
    return true;
  };
  const templates=[];
  for(let scenario=0;scenario<21;scenario+=1){
    const difficulty=scenario<5?"easy":scenario<11?"medium":scenario<16?"hard":"expert";
    concepts.forEach((concept,conceptIndex)=>{
      const globalIndex=scenario*5+conceptIndex,interactionKind=interactionFor(globalIndex),taskForm=tasks[scenario%5],schema=names[concept][scenario],topology=topologies[(scenario+conceptIndex)%topologies.length];
      templates.push({id:schema,familyId:`${concept}-${taskForm}`,conceptId:concept,difficulty,taskForm,inputRepresentation:`${topology}-${interactionKind}-scene-${scenario+1}`,outputKind:`${interactionKind}-${concept}-response-${scenario+1}`,reasoningPattern:`${concept}:${schema}:${taskForm}`,constraintPattern:`${schema}:${topology}:exact-angle-model`,parameterPolicy:{geometrySchemaId:schema,topology,interactionKind,exact:true,excludes:["appearance-only-parallelism","ambiguous-angle-set","duplicate-options","invalid-angle-measure"]},build:({rng})=>buildQuestion(conceptIndex,scenario,globalIndex,interactionKind,rng,topology),validate});
    });
  }
  registry.registerTool({toolId:"parallel-lines-angle-relationships",version:"1",concepts:concepts.map(id=>({id})),templates});
  root.MCLParallelLinesAngleRelationshipsBank={templates,audit:()=>registry.auditTool("parallel-lines-angle-relationships"),auditGeneration:samples=>registry.auditGeneration("parallel-lines-angle-relationships",{samplesPerTemplate:samples||20})};
})(typeof window!=="undefined"?window:globalThis);
