(function (root) {
  "use strict";

  const copy = {
    en: {
      htmlLang: "en",
      title: "Parallel Lines, Transversals & Angle Relationships Practice",
      toolBadge: "Geometry I · Algebra I",
      subtitle: "Reason from explicit line and angle markings, solve exact angle equations, and use valid converses to prove lines parallel.",
      note: "A drawing is not evidence. Parallelism, congruent angles, and supplementary angles must follow from markings or stated facts.",
      questionTitle: "Use only the stated facts and diagram markings.",
      difficultyOptions: {
        easy: "Easy: basic angle relationships and direct measures",
        medium: "Medium: transversals and one-step angle equations",
        hard: "Hard: converses, multi-step algebra, and insufficient information",
        expert: "Expert: multiple transversals, proof chains, and error diagnosis",
        mixed: "Mixed: balanced parallel-line and angle practice"
      }
    },
    zh: {
      htmlLang: "zh-CN",
      title: "平行线、截线与角关系专项练习",
      toolBadge: "几何 I · 代数 I",
      subtitle: "根据明确的直线与角标记推理，求解精确角度方程，并正确使用逆定理证明直线平行。",
      note: "图形外观不能作为依据。平行、角全等或互补都必须来自正式标记或题目给出的条件。",
      questionTitle: "仅使用题目条件和图中正式标记作答。",
      difficultyOptions: {
        easy: "简单：基础角关系与直接角度计算",
        medium: "中等：截线关系与一步角度方程",
        hard: "困难：逆定理、多步代数与信息不足判断",
        expert: "专家：多条截线、证明链与错误诊断",
        mixed: "混合：均衡的平行线与角关系练习"
      }
    }
  };

  const language = () => root.localStorage?.getItem?.("mathcomplete_lang") === "zh" ? "zh" : "en";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  const latexText = value => `\\text{${String(value ?? "").replaceAll("\\", "\\textbackslash{}").replaceAll("&", "\\&").replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll("{", "\\{").replaceAll("}", "\\}")}}`;
  const canonicalSet = value => String(value ?? "").split("|").map(item => item.trim()).filter(Boolean).sort().join("|");
  const canonicalNumber = value => {
    const raw = String(value ?? "").trim().replace(/°/g, "");
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) return String(Number(raw));
    const fraction = raw.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (!fraction || Number(fraction[2]) === 0) return raw.toLowerCase();
    const gcd = (a, b) => { a=Math.abs(a); b=Math.abs(b); while (b) [a,b]=[b,a%b]; return a || 1; };
    let numerator=Number(fraction[1]),denominator=Number(fraction[2]);
    if (denominator < 0) { numerator=-numerator; denominator=-denominator; }
    const divisor=gcd(numerator,denominator);
    return `${numerator/divisor}/${denominator/divisor}`;
  };
  const angleMeasure = (theta, index) => index % 2 === 0 ? theta : 180 - theta;
  const relationPairs = Object.freeze({
    corresponding: [[0,0],[1,1],[2,2],[3,3]],
    alternateInterior: [[2,0],[3,1]],
    alternateExterior: [[0,2],[1,3]],
    sameSideInterior: [[2,1],[3,0]],
    sameSideExterior: [[0,3],[1,2]]
  });
  const model = Object.freeze({
    angleMeasure,
    relationPairs,
    canonicalSet,
    canonicalNumber,
    isParallelDirections(a, b) { return Math.abs(a.x*b.y-a.y*b.x) < 1e-9; },
    areSupplementary(a, b) { return Math.abs(Number(a)+Number(b)-180) < 1e-9; },
    areCongruent(a, b) { return Math.abs(Number(a)-Number(b)) < 1e-9; },
    latexText
  });

  const ui = () => language() === "zh"
    ? { choose:"完成所有部分后提交。", submit:"提交答案", clear:"清除", required:"请先完成作答。", select:"请选择", sequence:"按正确顺序点击下方步骤", selected:"你的答案", correct:"正确答案" }
    : { choose:"Complete every required part, then submit.", submit:"Submit answer", clear:"Clear", required:"Complete the response first.", select:"Choose", sequence:"Select the steps below in the correct order", selected:"Your answer", correct:"Correct answer" };
  const examMode = () => root.MCLToolModes?.getMode?.() === "exam" || document.body.classList.contains("mcl-tool-exam");

  function markVisual(container, keys, className) {
    const wanted = new Set(keys);
    container?.querySelectorAll?.("[data-geometry-target]").forEach(node => node.classList.toggle(className, wanted.has(node.dataset.geometryTarget)));
  }

  const interactions = {
    mount(container, question, context) {
      const spec=question.interaction || {}, text=ui();
      let response=null,locked=false;
      const selected=new Set(),values={},sequence=[];
      container.innerHTML=`<div class="mcl-line-angle-response"><p class="mcl-line-angle-instruction">${esc(spec.instruction || text.choose)}</p><div class="mcl-line-angle-grid"></div><p class="mcl-line-angle-required" hidden>${esc(text.required)}</p><div class="mcl-line-angle-actions"></div></div>`;
      const grid=container.querySelector(".mcl-line-angle-grid"),actions=container.querySelector(".mcl-line-angle-actions"),required=container.querySelector(".mcl-line-angle-required");
      const updateTargetResponse=()=>{
        const keys=[...selected].sort();
        response=keys.length ? { key:keys.join("|"), display:keys.map(key=>spec.targets?.find(item=>item.key===key)?.label || key).join(", "), selectedKeys:keys } : null;
        container.querySelectorAll("[data-response-key]").forEach(node=>node.classList.toggle("is-selected",selected.has(node.dataset.responseKey)));
        markVisual(context.visualContainer,selected,"is-selected");
        required.hidden=true;
      };
      const toggleTarget=key=>{
        if(locked)return;
        if(spec.kind==="target")selected.clear();
        if(selected.has(key))selected.delete(key);else selected.add(key);
        updateTargetResponse();
      };
      const updateRows=()=>{
        if((spec.rows||[]).every(row=>values[row.id])){
          response={key:(spec.rows||[]).map(row=>`${row.id}=${values[row.id]}`).join("|"),display:(spec.rows||[]).map(row=>`${row.label}: ${row.options.find(option=>option.key===values[row.id])?.label || values[row.id]}`).join("; "),values:{...values}};
        }else response=null;
        required.hidden=true;
      };
      const updateSequence=()=>{
        response=sequence.length===(spec.tokens||[]).length?{key:sequence.join(">"),display:sequence.map(id=>spec.tokens.find(token=>token.id===id)?.label||id).join(" → "),sequence:[...sequence]}:null;
        required.hidden=true;
      };

      if(spec.kind==="numeric"){
        grid.innerHTML=`<label class="mcl-line-angle-row"><span class="mcl-line-angle-row-label">${esc(spec.label || (language()==="zh"?"输入精确角度":"Enter the exact angle measure"))}</span><input class="mcl-line-angle-input" inputmode="decimal" autocomplete="off"></label>`;
        grid.querySelector("input").addEventListener("input",event=>{const value=event.target.value.trim();response=value?{key:canonicalNumber(value),display:value}:null;required.hidden=true;});
      }else if(spec.kind==="target"||spec.kind==="target-set"){
        const targetRoot=document.createElement("div");targetRoot.className="mcl-line-angle-targets";
        (spec.targets||[]).forEach(target=>{const button=document.createElement("button");button.type="button";button.className="mcl-line-angle-target";button.dataset.responseKey=target.key;button.textContent=target.label;button.addEventListener("click",()=>toggleTarget(target.key));targetRoot.appendChild(button);});
        grid.appendChild(targetRoot);
        context.visualContainer?.querySelectorAll(".is-interactive[data-geometry-target]").forEach(node=>{node.setAttribute("tabindex","0");node.setAttribute("role","button");node.addEventListener("click",()=>toggleTarget(node.dataset.geometryTarget));node.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();toggleTarget(node.dataset.geometryTarget);}});});
      }else if(spec.kind==="matching"){
        (spec.rows||[]).forEach(row=>{const rowNode=document.createElement("div");rowNode.className="mcl-line-angle-row";rowNode.dataset.lineAngleRow=row.id;rowNode.innerHTML=`<span class="mcl-line-angle-row-label">${esc(row.label)}</span>`;const select=document.createElement("select");select.className="mcl-line-angle-select";select.setAttribute("aria-label",row.label);select.innerHTML=`<option value="">${esc(text.select)}</option>${row.options.map(option=>`<option value="${esc(option.key)}">${esc(option.label)}</option>`).join("")}`;select.addEventListener("change",()=>{values[row.id]=select.value;updateRows();});rowNode.appendChild(select);grid.appendChild(rowNode);});
      }else if(spec.kind==="order"){
        grid.innerHTML=`<div class="mcl-line-angle-sequence"><span class="mcl-line-angle-sequence-empty">${esc(text.sequence)}</span></div><div class="mcl-line-angle-token-bank"></div>`;
        const sequenceRoot=grid.querySelector(".mcl-line-angle-sequence"),bank=grid.querySelector(".mcl-line-angle-token-bank");
        const renderSequence=()=>{sequenceRoot.innerHTML=sequence.length?sequence.map((id,index)=>`<button type="button" class="mcl-line-angle-sequence-item" data-remove-index="${index}">${esc(spec.tokens.find(token=>token.id===id)?.label||id)}</button>`).join(""):`<span class="mcl-line-angle-sequence-empty">${esc(text.sequence)}</span>`;sequenceRoot.querySelectorAll("[data-remove-index]").forEach(button=>button.addEventListener("click",()=>{if(locked)return;sequence.splice(Number(button.dataset.removeIndex),1);renderSequence();updateSequence();}));bank.querySelectorAll("[data-token-id]").forEach(button=>button.classList.toggle("is-used",sequence.includes(button.dataset.tokenId)));};
        (spec.tokens||[]).forEach(token=>{const button=document.createElement("button");button.type="button";button.className="mcl-line-angle-token";button.dataset.tokenId=token.id;button.textContent=token.label;button.addEventListener("click",()=>{if(locked||sequence.includes(token.id))return;sequence.push(token.id);renderSequence();updateSequence();});bank.appendChild(button);});
        const clear=document.createElement("button");clear.type="button";clear.className="mcl-line-angle-clear";clear.textContent=text.clear;clear.addEventListener("click",()=>{if(!locked){sequence.length=0;renderSequence();updateSequence();}});actions.appendChild(clear);
      }
      const submit=document.createElement("button");submit.type="button";submit.className="mcl-line-angle-submit";submit.textContent=text.submit;submit.addEventListener("click",context.submit);actions.appendChild(submit);
      return{
        readResponse:()=>response,
        showRequired:()=>{required.hidden=false;},
        lock:()=>{locked=true;container.querySelectorAll("button,input,select").forEach(node=>{node.disabled=true;});},
        reveal:()=>{
          if(examMode())return;
          if(spec.kind==="target"||spec.kind==="target-set"){
            const correctKeys=canonicalSet(spec.correctKey).split("|").filter(Boolean);markVisual(context.visualContainer,correctKeys,"is-correct");
            container.querySelectorAll("[data-response-key]").forEach(node=>{const key=node.dataset.responseKey;if(correctKeys.includes(key))node.classList.add("is-correct");else if(selected.has(key))node.classList.add("is-wrong");});
          }
          if(spec.kind==="matching")(spec.rows||[]).forEach(row=>container.querySelector(`[data-line-angle-row="${CSS.escape(row.id)}"]`)?.classList.add(values[row.id]===row.correct?"is-correct":"is-wrong"));
        },
        snapshot:()=>({selectedKeys:[...selected],values:{...values},sequence:[...sequence]})
      };
    },
    isCorrect(response,question){const spec=question.interaction||{};if(spec.kind==="numeric")return canonicalNumber(response?.key)===canonicalNumber(spec.correctKey);if(spec.kind==="target-set")return canonicalSet(response?.key)===canonicalSet(spec.correctKey);return String(response?.key||"")===String(spec.correctKey||"");},
    reportOptions(question,response){
      const spec=question.interaction||{};
      if(spec.kind==="numeric")return[];
      if(spec.kind==="target"||spec.kind==="target-set"){const correct=new Set(canonicalSet(spec.correctKey).split("|").filter(Boolean)),chosen=new Set(response?.selectedKeys||canonicalSet(response?.key).split("|").filter(Boolean));return(spec.targets||[]).map((target,index)=>({label:String.fromCharCode(65+index),latex:target.label,key:target.key,isCorrect:correct.has(target.key),isSelected:chosen.has(target.key)}));}
      if(spec.kind==="matching"){const values=response?.values||{};return(spec.rows||[]).map((row,index)=>{const chosenKey=values[row.id]||"",chosen=row.options.find(option=>option.key===chosenKey)?.label||"-",correct=row.options.find(option=>option.key===row.correct)?.label||row.correct;return{label:String(index+1),latex:latexText(`${row.label}: ${chosen}${chosenKey===row.correct?"":`; ${ui().correct}: ${correct}`}`),key:`${row.id}=${chosenKey}`,isCorrect:chosenKey===row.correct,isSelected:true};});}
      if(spec.kind==="order"){const selected=response?.display||"",correct=(spec.correctOrder||[]).map(id=>spec.tokens.find(token=>token.id===id)?.label||id).join(" → ");return selected===correct?[{label:"1",latex:latexText(selected),key:selected,isCorrect:true,isSelected:true}]:[{label:"1",latex:latexText(selected||"-"),key:selected,isCorrect:false,isSelected:true},{label:"2",latex:latexText(correct),key:correct,isCorrect:true,isSelected:false}];}
      return[];
    }
  };

  root.MCLLineAngleModel=model;
  root.MCLParallelLinesInteractions=Object.freeze(interactions);
  root.MCLQuizTool={
    gameId:"parallel-lines-angle-relationships",
    course:"geometry-1",
    text:copy,
    builders:{},
    balancedMixed:true,
    avoidConsecutiveTypes:true,
    renderVisual(container,visual,context){root.MCLGeometryRenderer.render(container,visual,context);},
    renderReportVisual(visual,context){return root.MCLGeometryRenderer.renderStatic(visual,context);},
    interactionAdapter:root.MCLParallelLinesInteractions
  };
})(typeof window!=="undefined"?window:globalThis);
