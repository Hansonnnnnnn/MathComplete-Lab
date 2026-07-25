(function (root) {
  "use strict";
  const registry=root.MCLQuestionTemplates;if(!registry||!root.MCLQuizTool)return;
  const concepts=["midpoints-coordinate","segment-bisectors","segment-trisection","angle-bisectors","angle-trisection"];
  const names={
    "midpoints-coordinate":["tick-midpoint","definition-forward","definition-converse","half-from-whole","whole-from-half","linear-halves","two-step-halves","number-line-midpoint","number-line-endpoint","coordinate-integer","coordinate-fraction","coordinate-endpoint","coordinate-parameter","diagonal-midpoint","triangle-side-midpoint","multiple-candidates","overlapping-segments","midpoint-vs-center","noncollinear-counterexample","average-error-diagnosis","coordinate-capstone"],
    "segment-bisectors":["identify-bisected-point","identify-bisecting-line","object-taxonomy","crossing-not-bisecting","marked-bisector","perpendicular-bisector","perpendicular-not-bisector","bisector-not-perpendicular","piece-from-whole","whole-from-piece","linear-equal-pieces","coordinate-intersection","perpendicular-equation","endpoint-equidistance","locus-classification","two-bisectors","diagonal-bisector","composite-figure","missing-mark","student-error","bisector-capstone"],
    "segment-trisection":["identify-trisection-points","three-equal-parts","third-from-whole","whole-from-third","two-known-thirds","three-linear-expressions","number-line-trisectors","coordinate-integer","coordinate-fraction","missing-first-point","missing-second-point","point-order","midpoint-vs-trisector","visual-scale-independence","two-trisecting-lines","construct-locations","ratio-validation","reject-one-two","nested-midpoint","rounding-error","trisection-capstone"],
    "angle-bisectors":["arc-identify-ray","named-target-angle","identify-halves","half-from-whole","whole-from-half","linear-halves","variable-both-halves","exterior-neighbor-trap","multiple-interior-rays","neighbor-not-bisected","straight-line-context","vertical-angle-distractor","overlapping-angle-names","converse-equal-measures","no-marking-rejection","arc-only-reading","angle-name-order","measure-model","two-bisectors-one-vertex","student-neighbor-error","bisector-capstone"],
    "angle-trisection":["identify-two-rays","identify-three-parts","third-from-whole","whole-from-third","missing-third","linear-thirds","variable-all-thirds","one-ray-insufficient","bisector-vs-trisector","ray-order","exterior-neighbor","named-target","straight-angle","right-angle","mixed-bisect-trisect","shared-ray-targets","converse-three-equal","incomplete-markings","missing-ray-label","student-claim","trisection-capstone"]
  };
  concepts.forEach(concept=>{names[concept]=names[concept].map(name=>`${concept}-${name}`);});
  const tasks=registry.TASK_FORMS;
  const taskPrompt=index=>[
    txt("Read the stated definition directly.","直接使用题目给出的定义。"),
    txt("Work backward from the required relationship.","从要求的几何关系倒推。"),
    txt("Interpret only the explicit diagram markings.","只解读图中明确给出的标记。"),
    txt("Translate the diagram into a precise equality or object.","把图形转化为精确的等式或几何对象。"),
    txt("Diagnose the tempting but invalid conclusion.","识别看似合理但无效的结论。")
  ][index%5];
  const txt=(en,zh)=>root.localStorage?.getItem?.("mathcomplete_lang")==="zh"?zh:en;
  const text=value=>`\\text{${String(value).replace(/\\angle\s*([A-Z]+)/g,"}\\angle $1\\text{")}}`;
  const unique=values=>[...new Set(values.map(String))];
  const makeScene=(points,segments,extra={})=>({version:1,viewBox:[0,0,720,420],points,segments,ariaLabel:txt("Geometry diagram","几何图"),...extra});
  const p=(x,y,label)=>({x,y,label});
  const polar=(cx,cy,degrees,radius=155)=>{const a=degrees*Math.PI/180;return{x:Math.round(cx+Math.cos(a)*radius),y:Math.round(cy-Math.sin(a)*radius)}};
  const topologyNames=["segment","triangle","rectangle","square","parallelogram","trapezoid","circle"];
  const interpolate=(a,b,t)=>p(Math.round(a.x+(b.x-a.x)*t),Math.round(a.y+(b.y-a.y)*t));
  const topologyPrompt=topology=>({
    segment:txt("Use the marked standalone construction.","使用图中带标记的独立几何构造。"),
    triangle:txt("The marked relation appears in a triangle.","该标记关系位于三角形中。"),
    rectangle:txt("The marked relation appears in a rectangle.","该标记关系位于矩形中。"),
    square:txt("The marked relation appears in a square.","该标记关系位于正方形中。"),
    parallelogram:txt("The marked relation appears in a parallelogram.","该标记关系位于平行四边形中。"),
    trapezoid:txt("The marked relation appears in a trapezoid.","该标记关系位于梯形中。"),
    circle:txt("The marked relation appears in a circle.","该标记关系位于圆中。")
  }[topology]);
  function segmentScene(kind,index){
    const topology=topologyNames[index%topologyNames.length],points={},polygons=[],circles=[];
    if(topology==="segment"){const tilt=(index%5-2)*12;points.A=p(105,210-tilt);points.B=p(615,210+tilt);}
    if(topology==="triangle"){points.A=p(145,310);points.B=p(575,310);points.U=p(360,70,"T");polygons.push({points:["A","B","U"]});}
    if(topology==="rectangle"){points.A=p(160,320);points.B=p(560,90);points.U=p(160,90,"R");points.V=p(560,320,"S");polygons.push({points:["A","U","B","V"]});}
    if(topology==="square"){points.A=p(240,310);points.B=p(490,60);points.U=p(240,60,"R");points.V=p(490,310,"S");polygons.push({points:["A","U","B","V"]});}
    if(topology==="parallelogram"){points.A=p(145,310);points.B=p(570,90);points.U=p(245,90,"R");points.V=p(470,310,"S");polygons.push({points:["A","U","B","V"]});}
    if(topology==="trapezoid"){points.A=p(135,315);points.B=p(515,90);points.U=p(245,90,"R");points.V=p(605,315,"S");polygons.push({points:["A","U","B","V"]});}
    if(topology==="circle"){points.A=p(180,205);points.B=p(540,205);points.O={...p(360,205,"O"),hidden:true};circles.push({center:"O",radius:180});}
    points.M=interpolate(points.A,points.B,0.5);
    if(kind==="tri"){points.P=interpolate(points.A,points.B,1/3);points.Q=interpolate(points.A,points.B,2/3);}
    if(kind==="bisector"){
      const dx=points.B.x-points.A.x,dy=points.B.y-points.A.y,length=Math.hypot(dx,dy)||1;
      const base={x:-dy/length,y:dx/length};
      const angle=index%2===0?0:Math.PI/7;
      const direction={x:base.x*Math.cos(angle)-base.y*Math.sin(angle),y:base.x*Math.sin(angle)+base.y*Math.cos(angle)};
      const bisectorHalfLength=92;
      points.C=p(Math.round(points.M.x-direction.x*bisectorHalfLength),Math.round(points.M.y-direction.y*bisectorHalfLength));
      points.D=p(Math.round(points.M.x+direction.x*bisectorHalfLength),Math.round(points.M.y+direction.y*bisectorHalfLength));
    }
    const clean={...points};const segments=[{id:"AB",a:"A",b:"B",interactive:true}];
    if(kind==="bisector")segments.push({id:"CD",a:"C",b:"D",interactive:true});
    const marks=kind==="mid"||kind==="bisector"?[{type:"tick",a:"A",b:"M",group:1,count:1},{type:"tick",a:"M",b:"B",group:1,count:1}]:kind==="tri"?[{type:"tick",a:"A",b:"P",group:1,count:2},{type:"tick",a:"P",b:"Q",group:1,count:2},{type:"tick",a:"Q",b:"B",group:1,count:2}]:[];
    if(kind==="bisector"&&index%2===0)marks.push({type:"right",vertex:"M",a:"A",b:"C",group:3});
    return makeScene(clean,segments,{marks,polygons,circles,topology});
  }
  function angleScene(trisect,index){
    const topology=topologyNames[index%topologyNames.length],center={x:topology==="circle"?360:220,y:topology==="circle"?215:315};
    let start=topology==="rectangle"||topology==="square"?0:12+(index%3)*8;
    let part=topology==="rectangle"||topology==="square"?(trisect?30:45):(trisect?30+(index%3)*6:34+(index%4)*5);
    const end=start+part*(trisect?3:2),neighbor=23+(index%5)*7;
    const defs=trisect?[['A',start],['D',start+part],['E',start+2*part],['C',end],['F',end+neighbor]]:[['A',start],['D',start+part],['C',end],['E',end+neighbor]];
    const points={B:p(center.x,center.y)},polygons=[],circles=[];
    defs.forEach(([id,deg])=>points[id]={...polar(center.x,center.y,deg,topology==="circle"?160:185),label:id});
    if(topology==="triangle")polygons.push({points:["A","B","C"]});
    if(topology==="rectangle"){points.A=p(605,315,"A");points.C=p(220,85,"C");points.U=p(605,85,"R");polygons.push({points:["B","A","U","C"]});}
    if(topology==="square"){points.A=p(485,315,"A");points.C=p(220,50,"C");points.U=p(485,50,"R");polygons.push({points:["B","A","U","C"]});}
    if(topology==="parallelogram"){const a=points.A,c=points.C;points.U=p(a.x+c.x-center.x,a.y+c.y-center.y,"R");polygons.push({points:["B","A","U","C"]});}
    if(topology==="trapezoid"){points.U=p(570,300,"R");points.V=p(485,105,"S");polygons.push({points:["B","U","V","C"]});}
    if(topology==="circle")circles.push({center:"B",radius:160});
    const rays=defs.map(([id])=>({id:`B${id}`,vertex:"B",through:id,interactive:id!=="A"}));
    const regions=[];
    for(let i=0;i<defs.length-1;i++){const left=defs[i],right=defs[i+1];regions.push({id:`angle-${left[0]}B${right[0]}`,vertex:"B",start:left[1],end:right[1],group:i<(trisect?3:2)?1:2,interactive:true,radius:115,arcRadius:36+(i%3)*8});}
    return{scene:makeScene(points,[],{rays,angleRegions:regions,polygons,circles,topology}),part,total:part*(trisect?3:2),neighbor,regions};
  }
  function addBisectorCandidates(scene){
    const a=scene.points.A,b=scene.points.B,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
    const unit={x:dx/length,y:dy/length},normal={x:-dy/length,y:dx/length};
    const definitions=[
      {id:"EF",t:0.24,rotation:-0.42,span:72},
      {id:"GH",t:0.70,rotation:0.36,span:72},
      {id:"JK",t:0.84,rotation:-0.24,span:72}
    ];
    definitions.forEach(definition=>{
      const center={x:a.x+dx*definition.t,y:a.y+dy*definition.t};
      const direction={x:normal.x*Math.cos(definition.rotation)-normal.y*Math.sin(definition.rotation),y:normal.x*Math.sin(definition.rotation)+normal.y*Math.cos(definition.rotation)};
      const first=definition.id[0],second=definition.id[1];
      scene.points[first]=p(Math.round(center.x-direction.x*definition.span),Math.round(center.y-direction.y*definition.span));
      scene.points[second]=p(Math.round(center.x+direction.x*definition.span),Math.round(center.y+direction.y*definition.span));
      scene.segments.push({id:definition.id,a:first,b:second,interactive:true});
    });
  }
  function options(answer,extras=[]){const raw=String(answer),number=Number(raw);const values=extras.map(value=>{const phrase=String(value);if(phrase==="Cannot be determined")return text(txt("Cannot be determined","无法确定"));return /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(phrase)?text(phrase):value;});if(Number.isFinite(number))[number+1,number-1,number*2,Math.max(1,Math.round(number/2)),number+5,-number].forEach(value=>values.push(String(value)));else values.push(text(txt("Cannot be determined","无法确定")),text(txt("The neighboring angle","相邻角")),text(txt("The entire angle","整个角")),text(txt("The exterior ray","外部射线")),text(txt("No marked object","没有带标记的对象")),text(txt("Both adjacent angles","两个相邻角")));return unique(values).filter(value=>value!==raw).slice(0,8);}
  function finish(main,answer,distractors,prompt,solution,visual,parameters,interaction){return{main,plain:main,answer:String(answer),distractors:options(answer,distractors),prompt,lines:[{line:main,note:txt("identify the named target","确认被命名的目标")},{line:String(answer),note:solution}],suggestion:solution,visual,parameters,interaction};}
  function midpoint(index,rng){const total=2*rng.int(4,18),half=total/2,scene=segmentScene("mid",index),schema=names[concepts[0]][index],mode=index%4;scene.annotations=[{x:315,y:150,text:index%3===0?`AB = ${total}`:`AM = ${half}`}];if(mode===1)return finish(text(txt(`Enter the midpoint length when AB = ${total}.`,`当 AB = ${total} 时输入半段长度。`)),String(half),[],txt("Use the midpoint definition.","使用中点定义。"),txt("A midpoint creates two congruent segments.","中点把线段分成两条全等线段。"),scene,{geometrySchemaId:schema,total,half},{kind:"numeric",correctKey:String(half)});if(mode===2){scene.points.A.interactive=true;scene.points.M.interactive=true;scene.points.B.interactive=true;return finish(text(txt("Select the midpoint of segment AB.","选择线段 AB 的中点。")),"M",["A","B","AB","Cannot be determined","C"],txt("Click the marked midpoint.","点击有等长标记的中点。"),txt("AM and MB carry matching tick marks.","AM 与 MB 具有相同刻度标记。"),scene,{geometrySchemaId:schema},{kind:"target",correctKey:"M",targets:[{key:"A",label:"A"},{key:"M",label:"M"},{key:"B",label:"B"}]});}const answer=index%3===0?String(half):"AM \\cong MB";return finish(index%3===0?`AB=${total},\\quad AM=?`:text(txt("Which conclusion follows from M being the midpoint of AB?","M 是 AB 的中点，可以推出什么？")),answer,[String(total),String(total*2),"AM \\cong AB","MB \\cong AB","M \\notin AB"],txt("Apply the definition of midpoint.","应用中点定义。"),txt("M is collinear with A and B, and AM = MB.","M 与 A、B 共线，并且 AM = MB。"),scene,{geometrySchemaId:schema,total,half});}
  function bisector(index,rng){const scene=segmentScene("bisector",index),schema=names[concepts[1]][index],half=rng.int(4,16),mode=index%4;scene.annotations=[{x:300,y:145,text:`AM = MB = ${half}`}];if(mode===1)return finish(text(txt("Enter AB.","输入 AB。")),String(2*half),[],txt("Add the two congruent parts.","把两段相等部分相加。"),txt("AB = AM + MB.","AB = AM + MB。"),scene,{geometrySchemaId:schema,half},{kind:"numeric",correctKey:String(2*half)});if(mode===2){addBisectorCandidates(scene);return finish(text(txt("Which candidate segment intersects AB at its marked midpoint?","哪条候选线段经过 AB 中带标记的中点？")),"CD",["EF","GH","JK","AM","MB"],txt("Compare where each candidate intersects AB.","比较每条候选线段与 AB 的交点位置。"),txt("The matching tick marks establish M as the midpoint, and CD is the only candidate passing through M.","相同刻度说明 M 是中点，CD 是唯一经过 M 的候选线段。"),scene,{geometrySchemaId:schema,candidateSegments:["CD","EF","GH","JK"]},{kind:"target",correctKey:"CD",targets:[{key:"CD",label:"CD"},{key:"EF",label:"EF"},{key:"GH",label:"GH"},{key:"JK",label:"JK"}]});}const answer=index%2===0?text(txt("CD is a perpendicular bisector of AB","CD 是 AB 的垂直平分线")):text(txt("CD bisects AB but need not be perpendicular","CD 平分 AB，但不一定垂直"));return finish(text(txt("Classify CD using only the shown markings.","仅根据图中标记判断 CD。")),answer,[text(txt("CD only intersects AB","CD 只与 AB 相交")),text(txt("AB bisects CD","AB 平分 CD")),text(txt("CD cannot be a bisector","CD 不可能是平分线")),text(txt("M is not a midpoint","M 不是中点")),text(txt("The drawing alone proves every relation","仅凭外观可证明所有关系"))],txt("Use tick and right-angle marks, not appearance.","使用刻度和直角标记，不凭外观。"),txt("Matching ticks establish AM = MB; a right mark is additionally required for perpendicularity.","相同刻度说明 AM = MB；还需要直角标记才能推出垂直。"),scene,{geometrySchemaId:schema});}
  function trisection(index,rng){const scene=segmentScene("tri",index),schema=names[concepts[2]][index],third=rng.int(3,14),total=3*third,mode=index%4;scene.annotations=[{x:295,y:145,text:index%2?`AP = ${third}`:`AB = ${total}`}];if(mode===1)return finish(text(txt(`Enter one third of AB when AB = ${total}.`,`AB = ${total} 时输入每一段长度。`)),String(third),[],txt("Divide the whole segment by three.","把整条线段除以 3。"),txt("AP = PQ = QB = AB/3.","AP = PQ = QB = AB/3。"),scene,{geometrySchemaId:schema,total,third},{kind:"numeric",correctKey:String(third)});if(mode===2){scene.points.P.interactive=true;scene.points.Q.interactive=true;return finish(text(txt("Select the first trisection point from A.","选择从 A 出发的第一个三等分点。")),"P",["Q","A","B","AB","Cannot be determined"],txt("Read the point order A-P-Q-B.","读取点的顺序 A-P-Q-B。"),txt("P lies one third of the way from A to B.","P 位于从 A 到 B 的三分之一处。"),scene,{geometrySchemaId:schema},{kind:"target",correctKey:"P",targets:[{key:"P",label:"P"},{key:"Q",label:"Q"}]});}const answer=index%2?String(total):"AP=PQ=QB";return finish(index%2?`AP=${third},\\quad AB=?`:text(txt("Which equality proves that P and Q trisect AB?","哪个等式说明 P、Q 三等分 AB？")),answer,[String(2*third),String(4*third),"AP=PB","AQ=QB","AP+PQ=QB"],txt("A trisection creates three congruent consecutive parts.","三等分产生连续的三条全等线段。"),txt("The required relation is AP = PQ = QB.","必须满足 AP = PQ = QB。"),scene,{geometrySchemaId:schema,total,third});}
  function angleQuestion(index,rng,trisect){const data=angleScene(trisect,index),schema=names[concepts[trisect?4:3]][index],mode=index%4,target=trisect?"\\angle ABC":"\\angle ABC",ray=trisect?"BD \\text{ and } BE":"BD",part=data.part,total=data.total,nonTarget=data.regions.at(-1).id;data.scene.annotations=[{x:40,y:45,text:trisect?`m∠ABC = ${total}°`:`m∠ABC = ${total}°`}];const childNames=trisect?["\\angle ABD","\\angle DBE","\\angle EBC"]:["\\angle ABD","\\angle DBC"];
    if(mode===1)return finish(text(txt(`Enter the measure of each equal part of ${target}.`,`输入 ${target} 每个相等部分的度数。`)),String(part),[],txt("Use only the named target angle.","只使用被命名的目标角。"),txt(trisect?"Divide the named angle by three; the neighboring angle CBF is not included.":"Divide the named angle by two; the neighboring angle CBE is not included.",trisect?"把被命名的角除以 3；相邻角 CBF 不包含在内。":"把被命名的角除以 2；相邻角 CBE 不包含在内。"),data.scene,{geometrySchemaId:schema,total,part,neighbor:data.neighbor},{kind:"numeric",correctKey:String(part)});
    if(mode===2){const targets=data.regions.map(region=>({key:region.id,label:region.id.replace("angle-","∠")}));const correctLabel=targets.find(item=>item.key===nonTarget)?.label||nonTarget;return finish(text(txt(`Select the neighboring angle that is not part of ${target}.`,`选择不属于 ${target} 的相邻角。`)),correctLabel,childNames.concat([String(data.neighbor),String(total)]),txt("Use the two boundary rays named by the angle.","根据角名称中的两条边界射线判断。"),txt(`The middle letter B is the vertex. ${target} is bounded by BA and BC; the region beyond BC is not part of it.`,`中间字母 B 是顶点。${target} 的边界是 BA 与 BC；越过 BC 的区域不属于该角。`),data.scene,{geometrySchemaId:schema,total,part,neighbor:data.neighbor},{kind:"target",correctKey:nonTarget,correctLabel,targets});}
    const answer=mode===3?ray:childNames.join(" = ");return finish(mode===3?text(txt(`Which ray or rays divide ${target} into equal parts?`,`哪条射线把 ${target} 等分？`)):text(txt(`Which equality describes the marked parts of ${target}?`,`哪个等式描述了 ${target} 中有标记的相等部分？`)),answer,[trisect?"BD":"BE",trisect?"BE":"BC","BC","BA",`\\angle CBF=${part}^{\\circ}`,text(txt("Every angle at B is also divided","B 点的所有角都被等分"))],txt("Read the named angle and matching arc marks.","读取被命名的角和相同弧线标记。"),txt(`Only the regions inside ${target} with matching marks are equal.`,`只有 ${target} 内具有相同标记的区域相等。`),data.scene,{geometrySchemaId:schema,total,part,neighbor:data.neighbor});}
  function build(concept,index,rng){let question;if(concept===concepts[0])question=midpoint(index,rng);else if(concept===concepts[1])question=bisector(index,rng);else if(concept===concepts[2])question=trisection(index,rng);else question=angleQuestion(index,rng,concept===concepts[4]);const topology=question.visual?.topology||topologyNames[index%topologyNames.length];question.prompt=`${topologyPrompt(topology)} ${taskPrompt(index)} ${question.prompt}`;question.parameters={...(question.parameters||{}),taskForm:tasks[index%5],scenarioIndex:index,topology};question.audit={generatorId:question.parameters.geometrySchemaId,topology};return question;}
  const validate=(q,context)=>{
    const schema=q.parameters?.geometrySchemaId,correct=String(q.interaction?.correctKey??q.answer);
    if(!schema||!q.visual||!correct)return false;
    if(unique(q.distractors||[]).filter(value=>value!==String(q.answer)).length<5)return false;
    if(q.parameters?.part&&q.parameters.part<10)return false;
    const rightMark=(q.visual.marks||[]).find(mark=>mark.type==="right");
    if(rightMark){
      const vertex=q.visual.points[rightMark.vertex],a=q.visual.points[rightMark.a],b=q.visual.points[rightMark.b];
      const av={x:a.x-vertex.x,y:a.y-vertex.y},bv={x:b.x-vertex.x,y:b.y-vertex.y};
      const normalizedDot=Math.abs(av.x*bv.x+av.y*bv.y)/((Math.hypot(av.x,av.y)||1)*(Math.hypot(bv.x,bv.y)||1));
      if(normalizedDot>0.01)return false;
    }
    return true;
  };
  const templates=[];for(let scenario=0;scenario<21;scenario+=1){const difficulty=scenario<5?"easy":scenario<11?"medium":scenario<16?"hard":"expert";concepts.forEach((concept,conceptIndex)=>{const task=tasks[scenario%5],schema=names[concept][scenario],topology=topologyNames[scenario%topologyNames.length];templates.push({id:schema,familyId:`${concept}-${task}`,conceptId:concept,difficulty,taskForm:task,inputRepresentation:`geometry-${topology}-${scenario+1}`,outputKind:scenario%4===1?"exact-measure":scenario%4===2?"selected-geometry-object":"geometric-conclusion",reasoningPattern:`${concept}:${schema}:${topology}`,constraintPattern:`${schema}:topology-${topology}-${conceptIndex+1}`,parameterPolicy:{geometrySchemaId:schema,topology,exact:true,excludes:["ambiguous-neighbor-angle","accidental-equality","duplicate-options"]},build:({rng})=>build(concept,scenario,rng),validate})})}
  registry.registerTool({toolId:"midpoints-bisectors-trisectors",version:"2",concepts:concepts.map(id=>({id})),templates});
  root.MCLMidpointsBisectorsTrisectorsBank={templates,audit:()=>registry.auditTool("midpoints-bisectors-trisectors"),auditGeneration:s=>registry.auditGeneration("midpoints-bisectors-trisectors",{samplesPerTemplate:s||20})};
})(typeof window!=="undefined"?window:globalThis);
