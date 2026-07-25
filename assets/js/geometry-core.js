(function (root) {
  "use strict";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  const point = (scene, id) => scene.points?.[id] || { x: 0, y: 0 };
  const polar = (center, degrees, radius) => {
    const angle = degrees * Math.PI / 180;
    return { x: center.x + Math.cos(angle) * radius, y: center.y - Math.sin(angle) * radius };
  };

  function anglePath(center, startDegrees, endDegrees, radius, close) {
    const start = polar(center, startDegrees, radius);
    const end = polar(center, endDegrees, radius);
    let sweep = endDegrees - startDegrees;
    while (sweep < 0) sweep += 360;
    const large = sweep > 180 ? 1 : 0;
    const arc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 0 ${end.x} ${end.y}`;
    return close ? `M ${center.x} ${center.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 0 ${end.x} ${end.y} Z` : arc;
  }

  function segmentTicks(a, b, count, group) {
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
    const ux = dx / length, uy = dy / length, nx = -uy, ny = ux;
    let output = "";
    for (let index = 0; index < count; index += 1) {
      const shift = (index - (count - 1) / 2) * 7;
      const cx = (a.x + b.x) / 2 + ux * shift, cy = (a.y + b.y) / 2 + uy * shift;
      output += `<line class="mcl-geo-mark mcl-geo-group-${group || 1}" x1="${cx - nx * 8}" y1="${cy - ny * 8}" x2="${cx + nx * 8}" y2="${cy + ny * 8}"/>`;
    }
    return output;
  }

  function render(container, scene, context = {}) {
    if (!container || !scene) return null;
    const width = scene.viewBox?.[2] || 720, height = scene.viewBox?.[3] || 420;
    const parts = [`<svg class="mcl-geometry-scene" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(scene.ariaLabel || "Geometry diagram")}">`];
    (scene.polygons || []).forEach(polygon => {
      const vertices=(polygon.points || []).map(id=>{const value=point(scene,id);return `${value.x},${value.y}`;}).join(" ");
      parts.push(`<polygon class="mcl-geo-polygon${polygon.helper ? " is-helper" : ""}" points="${vertices}"/>`);
    });
    (scene.circles || []).forEach(circle => {
      const center=typeof circle.center==="string"?point(scene,circle.center):circle.center;
      parts.push(`<circle class="mcl-geo-circle${circle.helper ? " is-helper" : ""}" cx="${center.x}" cy="${center.y}" r="${circle.radius}"/>`);
    });
    (scene.angleRegions || []).forEach(region => {
      const vertex = point(scene, region.vertex);
      parts.push(`<path class="mcl-geo-angle-region${region.interactive ? " is-interactive" : ""}" data-geometry-target="${esc(region.id)}" d="${anglePath(vertex, region.start, region.end, region.radius || 76, true)}"/>`);
      if (region.arc !== false) parts.push(`<path class="mcl-geo-angle-arc mcl-geo-group-${region.group || 1}" d="${anglePath(vertex, region.start, region.end, region.arcRadius || 36, false)}"/>`);
    });
    (scene.segments || []).forEach(segment => {
      const a = point(scene, segment.a), b = point(scene, segment.b);
      parts.push(`<line class="mcl-geo-segment${segment.helper ? " is-helper" : ""}${segment.interactive ? " is-interactive" : ""}" data-geometry-target="${esc(segment.id || `${segment.a}${segment.b}`)}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`);
    });
    (scene.rays || []).forEach(ray => {
      const a = point(scene, ray.vertex), b = point(scene, ray.through);
      parts.push(`<line class="mcl-geo-ray${ray.interactive ? " is-interactive" : ""}" data-geometry-target="${esc(ray.id || `${ray.vertex}${ray.through}`)}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`);
    });
    (scene.marks || []).forEach(mark => {
      if (mark.type === "tick") parts.push(segmentTicks(point(scene, mark.a), point(scene, mark.b), mark.count || 1, mark.group));
      if (mark.type === "right") {
        const v = point(scene, mark.vertex), a = point(scene, mark.a), b = point(scene, mark.b);
        const ua = { x:(a.x-v.x)/(Math.hypot(a.x-v.x,a.y-v.y)||1), y:(a.y-v.y)/(Math.hypot(a.x-v.x,a.y-v.y)||1) };
        const ub = { x:(b.x-v.x)/(Math.hypot(b.x-v.x,b.y-v.y)||1), y:(b.y-v.y)/(Math.hypot(b.x-v.x,b.y-v.y)||1) };
        const size=18,p1={x:v.x+ua.x*size,y:v.y+ua.y*size},p2={x:p1.x+ub.x*size,y:p1.y+ub.y*size},p3={x:v.x+ub.x*size,y:v.y+ub.y*size};
        parts.push(`<path class="mcl-geo-mark mcl-geo-group-${mark.group || 3}" d="M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}"/>`);
      }
    });
    Object.entries(scene.points || {}).forEach(([id, p]) => {
      if (p.hidden) return;
      parts.push(`<circle class="mcl-geo-point${p.interactive ? " is-interactive" : ""}" data-geometry-target="${esc(p.targetId || id)}" cx="${p.x}" cy="${p.y}" r="4"/>`);
      const offset = p.labelOffset || { x: p.x < width/2 ? -20 : 10, y: p.y < height/2 ? -12 : 24 };
      parts.push(`<text class="mcl-geo-label" x="${p.x + offset.x}" y="${p.y + offset.y}">${esc(p.label || id)}</text>`);
    });
    const annotations = scene.annotations || [];
    const measurementFacts = [
      ...(scene.facts || []).map(item => typeof item === "string" ? item : item.text),
      ...annotations.filter(item => String(item.text || "").includes("=")).map(item => item.text)
    ].filter(Boolean);
    annotations.filter(item => !String(item.text || "").includes("=")).forEach(item => parts.push(`<text class="mcl-geo-annotation" x="${item.x}" y="${item.y}">${esc(item.text)}</text>`));
    if (measurementFacts.length) {
      const shownFacts=measurementFacts.slice(0,4),rowHeight=23,panelWidth=Math.min(250,width-48),panelHeight=18+shownFacts.length*rowHeight,panelX=24,panelY=height-panelHeight-18;
      const factsLabel = localStorage.getItem("mathcomplete_lang") === "zh" ? "已知条件" : "Given information";
      parts.push(`<g class="mcl-geo-facts" aria-label="${factsLabel}"><rect x="${panelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="6"/>`);
      shownFacts.forEach((fact,index)=>parts.push(`<text class="mcl-geo-fact" x="${panelX+14}" y="${panelY+24+index*rowHeight}">${esc(fact)}</text>`));
      parts.push("</g>");
    }
    parts.push("</svg>");
    container.innerHTML = parts.join("");
    const svg = container.querySelector("svg");
    if (context.selectedKey) svg?.querySelectorAll(`[data-geometry-target="${CSS.escape(String(context.selectedKey))}"]`).forEach(node => node.classList.add("is-selected"));
    if (context.correctKey) svg?.querySelectorAll(`[data-geometry-target="${CSS.escape(String(context.correctKey))}"]`).forEach(node => node.classList.add("is-correct"));
    return svg;
  }

  function renderStatic(scene, context = {}) {
    const host = document.createElement("div");
    render(host, scene, context);
    return host.innerHTML;
  }

  const labels = () => localStorage.getItem("mathcomplete_lang") === "zh"
    ? { choose:"请选择图中的几何对象。", enter:"输入答案", submit:"提交答案", required:"请先完成作答。" }
    : { choose:"Select the requested object in the diagram.", enter:"Enter your answer", submit:"Submit answer", required:"Complete your response first." };

  const GeometryInteractions = {
    mount(container, question, context) {
      const spec = question.interaction || {}, copy = labels();
      let response = null, locked = false;
      container.innerHTML = `<div class="mcl-geometry-response"><p class="mcl-geometry-instruction">${esc(spec.instruction || (spec.kind === "numeric" ? copy.enter : copy.choose))}</p><div class="mcl-geometry-controls"></div><p class="mcl-geometry-required" hidden>${esc(copy.required)}</p></div>`;
      const controls = container.querySelector(".mcl-geometry-controls"), required = container.querySelector(".mcl-geometry-required");
      const select = (key, display) => {
        if (locked) return;
        response = { key:String(key), display:String(display ?? key) };
        container.querySelectorAll("[data-response-key]").forEach(node => node.classList.toggle("is-selected", node.dataset.responseKey === response.key));
        context.visualContainer?.querySelectorAll("[data-geometry-target]").forEach(node => node.classList.toggle("is-selected", node.dataset.geometryTarget === response.key));
        required.hidden = true;
      };
      if (spec.kind === "numeric") {
        controls.innerHTML = `<label class="mcl-geometry-input-label"><span>${esc(copy.enter)}</span><input class="mcl-geometry-input" inputmode="decimal" autocomplete="off"></label><button type="button" class="mcl-geometry-submit">${esc(copy.submit)}</button>`;
        controls.querySelector(".mcl-geometry-submit").addEventListener("click", () => { const value=controls.querySelector("input").value.trim(); if(value) response={key:value,display:value}; context.submit(); });
      } else {
        (spec.targets || []).forEach(target => {
          const button=document.createElement("button");button.type="button";button.className="mcl-geometry-target-button";button.dataset.responseKey=target.key;button.textContent=target.label;button.addEventListener("click",()=>select(target.key,target.label));controls.appendChild(button);
        });
        context.visualContainer?.querySelectorAll(".is-interactive[data-geometry-target]").forEach(node => { node.setAttribute("tabindex","0");node.setAttribute("role","button");node.addEventListener("click",()=>select(node.dataset.geometryTarget,spec.targets?.find(item=>item.key===node.dataset.geometryTarget)?.label));node.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();node.dispatchEvent(new MouseEvent("click"));}}); });
        const submit=document.createElement("button");submit.type="button";submit.className="mcl-geometry-submit";submit.textContent=copy.submit;submit.addEventListener("click",context.submit);controls.appendChild(submit);
      }
      return {
        readResponse:()=>response,
        showRequired:()=>{required.hidden=false;},
        lock:()=>{locked=true;container.querySelectorAll("button,input").forEach(node=>node.disabled=true);},
        reveal:correctKey=>{container.querySelectorAll(`[data-response-key="${CSS.escape(String(correctKey))}"]`).forEach(node=>node.classList.add("is-correct"));context.visualContainer?.querySelectorAll(`[data-geometry-target="${CSS.escape(String(correctKey))}"]`).forEach(node=>node.classList.add("is-correct"));}
      };
    },
    isCorrect(response, question) { return String(response?.key) === String(question.interaction?.correctKey); },
    reportOptions(question, response) { return (question.interaction?.targets || []).map((target,index)=>({label:String.fromCharCode(65+index),latex:target.label,key:target.key,isCorrect:String(target.key)===String(question.interaction.correctKey),isSelected:String(target.key)===String(response?.key)})); }
  };

  root.MCLGeometryRenderer = Object.freeze({ render, renderStatic });
  root.MCLGeometryInteractions = Object.freeze(GeometryInteractions);
})(typeof window !== "undefined" ? window : globalThis);
