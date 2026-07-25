(function (root) {
  "use strict";
  const factory = root.MCLSemanticBankFactory;
  if (!factory || root.MCLQuestionTemplates?.getTool("geometry-formula")) return;

  const concepts = ["perimeter-area", "circles-arcs", "surface-area-volume", "composite-units", "missing-measure-applications"];
  const pickText = (lang, en, zh) => lang === "zh" ? zh : en;
  const fmt = n => Number.isInteger(Number(n)) ? String(Number(n)) : String(Number(Number(n).toFixed(3)));
  const pi = n => Number(n) === 1 ? "π" : `${fmt(n)}π`;

  function question(main, answer, distractors, lines, parameters, type) {
    const value = String(answer);
    const numeric = Number(value);
    const fill = value.includes("π")
      ? [1, -1, 2, 4, 6, 10].map(delta => pi(Math.max(1, Number(value.replace("π", "")) + delta)))
      : Number.isFinite(numeric) ? [numeric + 1, numeric - 1, numeric * 2, numeric / 2, numeric + 5, Math.abs(numeric - 5)].map(fmt) : [];
    return {
      main, plain: main, prompt: "Choose the correct geometric measure.", answer: value,
      distractors: [...distractors.map(String), ...fill],
      lines, parameters, audit: { geometryType: type }
    };
  }

  function perimeterArea(form, rng, lang) {
    const l = rng.int(6, 16), w = rng.int(3, l - 1), b = rng.int(6, 18), h = rng.int(3, 12);
    if (form === "direct") {
      const answer = b * h / 2;
      return question(
        pickText(lang, `Find the area of a triangle with base ${b} and height ${h}.`, `求底为 ${b}、高为 ${h} 的三角形面积。`),
        answer, [b * h, b + h, 2 * (b + h), l * w],
        [{ line: "A = bh/2", note: "triangle area" }, { line: `A = ${b}(${h})/2 = ${fmt(answer)}`, note: "substitute" }],
        { b, h }, "triangle-area"
      );
    }
    if (form === "inverse") {
      const area = l * w;
      return question(
        pickText(lang, `A rectangle has area ${area} and width ${w}. Find its length.`, `一个长方形面积为 ${area}，宽为 ${w}。求长。`),
        l, [area - w, area + w, 2 * (l + w), w],
        [{ line: "A = lw", note: "area formula" }, { line: `l = ${area}/${w} = ${l}`, note: "isolate length" }],
        { area, w, l }, "missing-rectangle-length"
      );
    }
    if (form === "interpret") {
      const factor = rng.int(2, 4), answer = factor ** 2;
      return question(
        pickText(lang, `All side lengths of a similar figure are multiplied by ${factor}. By what factor does its area change?`, `一个相似图形的边长都扩大为 ${factor} 倍。面积变为多少倍？`),
        answer, [factor, factor * 2, factor ** 3, factor + 1],
        [{ line: `area factor = ${factor}^2`, note: "area is two-dimensional" }, { line: `${factor}^2 = ${answer}`, note: "evaluate" }],
        { factor }, "area-scale-factor"
      );
    }
    if (form === "translate") {
      const top = rng.int(4, 9), bottom = top + rng.int(2, 7), answer = (top + bottom) * h / 2;
      return question(
        pickText(lang, `A trapezoid has bases ${top} and ${bottom} and height ${h}. Find its area.`, `一个梯形的两底为 ${top} 和 ${bottom}，高为 ${h}。求面积。`),
        answer, [(top + bottom) * h, top * bottom * h / 2, top + bottom + h, (bottom - top) * h / 2],
        [{ line: "A = (b_1+b_2)h/2", note: "trapezoid formula" }, { line: `A = (${top}+${bottom})${h}/2 = ${fmt(answer)}`, note: "translate and simplify" }],
        { top, bottom, h }, "trapezoid-area"
      );
    }
    const claimed = l * w + l, answer = l * w;
    return question(
      pickText(lang, `A student claims a ${l} by ${w} rectangle has area ${claimed}. What is the correct area?`, `一名学生声称 ${l}×${w} 长方形面积为 ${claimed}。正确面积是多少？`),
      answer, [claimed, 2 * (l + w), l + w, l * l],
      [{ line: "A = lw", note: "multiply length by width" }, { line: `A = ${l}(${w}) = ${answer}`, note: "correct the error" }],
      { l, w, claimed }, "diagnose-area-error"
    );
  }

  function circlesArcs(form, rng, lang) {
    const r = rng.int(2, 10), d = 2 * r, angle = rng.choice([30, 45, 60, 90, 120, 180]);
    if (form === "direct") return question(
      pickText(lang, `Find the exact circumference of a circle with radius ${r}.`, `求半径为 ${r} 的圆的精确周长。`),
      pi(2 * r), [pi(r), pi(r * r), pi(4 * r), String(2 * r)],
      [{ line: "C = 2πr", note: "circumference formula" }, { line: `C = 2π(${r}) = ${pi(2 * r)}`, note: "substitute" }],
      { r }, "circle-circumference"
    );
    if (form === "inverse") return question(
      pickText(lang, `A circle has circumference ${pi(d)}. Find its radius.`, `一个圆的周长为 ${pi(d)}。求半径。`),
      r, [d, r * r, d * d, 2 * d],
      [{ line: `${pi(d)} = 2πr`, note: "use C = 2πr" }, { line: `r = ${r}`, note: "divide by 2π" }],
      { r, d }, "radius-from-circumference"
    );
    if (form === "interpret") {
      const answer = angle / 360;
      return question(
        pickText(lang, `A sector has central angle ${angle}°. What decimal fraction of the circle does it occupy?`, `一个扇形圆心角为 ${angle}°。它占整圆的小数比例是多少？`),
        fmt(answer), [fmt(360 / angle), fmt(angle / 180), fmt((360 - angle) / 360), fmt(angle / 100)],
        [{ line: `fraction = ${angle}/360`, note: "compare with a full turn" }, { line: `${angle}/360 = ${fmt(answer)}`, note: "simplify" }],
        { angle }, "sector-fraction"
      );
    }
    if (form === "translate") {
      const coefficient = 2 * r * angle / 360;
      return question(
        pickText(lang, `Find the exact arc length for a ${angle}° central angle in a circle of radius ${r}.`, `求半径为 ${r} 的圆中 ${angle}° 圆心角所对的精确弧长。`),
        pi(coefficient), [pi(r * angle / 360), pi(r * r * angle / 360), pi(2 * r), pi(coefficient * 2)],
        [{ line: "s = (θ/360)(2πr)", note: "arc-length formula" }, { line: `s = (${angle}/360)(2π·${r}) = ${pi(coefficient)}`, note: "substitute" }],
        { r, angle }, "arc-length"
      );
    }
    return question(
      pickText(lang, `A student uses A = 2πr for a circle of radius ${r}. What is the correct exact area?`, `学生用 A=2πr 计算半径为 ${r} 的圆面积。正确精确面积是多少？`),
      pi(r * r), [pi(2 * r), pi(r), pi(2 * r * r), String(r * r)],
      [{ line: "A = πr^2", note: "area squares the radius" }, { line: `A = π(${r})^2 = ${pi(r * r)}`, note: "correct the formula" }],
      { r }, "diagnose-circle-formula"
    );
  }

  function solids(form, rng, lang) {
    const l = rng.int(3, 9), w = rng.int(2, 7), h = rng.int(3, 10), r = rng.int(2, 6);
    if (form === "direct") return question(
      pickText(lang, `Find the volume of a ${l} by ${w} by ${h} rectangular prism.`, `求 ${l}×${w}×${h} 长方体的体积。`),
      l * w * h, [2 * (l * w + l * h + w * h), l + w + h, l * w, 2 * (l + w + h)],
      [{ line: "V = lwh", note: "prism volume" }, { line: `V = ${l}(${w})(${h}) = ${l * w * h}`, note: "substitute" }],
      { l, w, h }, "prism-volume"
    );
    if (form === "inverse") {
      const volume = l * w * h;
      return question(
        pickText(lang, `A prism has volume ${volume}, length ${l}, and width ${w}. Find its height.`, `长方体体积为 ${volume}，长为 ${l}，宽为 ${w}。求高。`),
        h, [volume / l, volume / w, l + w, volume - l * w],
        [{ line: "V = lwh", note: "volume formula" }, { line: `h = ${volume}/(${l}·${w}) = ${h}`, note: "isolate height" }],
        { volume, l, w, h }, "missing-prism-height"
      );
    }
    if (form === "interpret") {
      const factor = rng.int(2, 3), answer = factor ** 3;
      return question(
        pickText(lang, `Every dimension of a solid is multiplied by ${factor}. By what factor does volume change?`, `立体的每个尺寸都扩大为 ${factor} 倍。体积变为多少倍？`),
        answer, [factor, factor ** 2, factor * 3, factor ** 4],
        [{ line: `volume factor = ${factor}^3`, note: "volume is three-dimensional" }, { line: `${factor}^3 = ${answer}`, note: "evaluate" }],
        { factor }, "volume-scale-factor"
      );
    }
    if (form === "translate") return question(
      pickText(lang, `A cylinder has radius ${r} and height ${h}. Find its exact volume.`, `圆柱半径为 ${r}，高为 ${h}。求精确体积。`),
      pi(r * r * h), [pi(2 * r * h), pi(r * h), pi(2 * r * r * h), pi(r * r)],
      [{ line: "V = πr^2h", note: "cylinder volume" }, { line: `V = π(${r})^2(${h}) = ${pi(r * r * h)}`, note: "translate measurements" }],
      { r, h }, "cylinder-volume"
    );
    const wrong = 2 * (l + w + h), answer = 2 * (l * w + l * h + w * h);
    return question(
      pickText(lang, `A student gives ${wrong} as the surface area of a ${l} by ${w} by ${h} prism. Find the correct surface area.`, `学生认为 ${l}×${w}×${h} 长方体的表面积为 ${wrong}。求正确表面积。`),
      answer, [wrong, l * w * h, l * w + l * h + w * h, 4 * (l + w + h)],
      [{ line: "SA = 2(lw+lh+wh)", note: "include all six faces" }, { line: `SA = 2(${l * w}+${l * h}+${w * h}) = ${answer}`, note: "correct the error" }],
      { l, w, h, wrong }, "diagnose-surface-area"
    );
  }

  function composite(form, rng, lang) {
    const l = rng.int(9, 16), w = rng.int(6, 11), a = rng.int(2, 5), b = rng.int(2, 4);
    if (form === "direct") {
      const answer = l * w - a * b;
      return question(
        pickText(lang, `An L-shaped floor is a ${l} by ${w} rectangle with a ${a} by ${b} corner removed. Find its area.`, `L 形地面由 ${l}×${w} 长方形挖去 ${a}×${b} 的角组成。求面积。`),
        answer, [l * w + a * b, l * w, (l - a) * (w - b), 2 * (l + w)],
        [{ line: "A = A_large - A_cutout", note: "decompose" }, { line: `A = ${l * w} - ${a * b} = ${answer}`, note: "subtract" }],
        { l, w, a, b }, "composite-area"
      );
    }
    if (form === "inverse") {
      const cm = rng.choice([200, 300, 400, 500]), answer = cm / 100;
      return question(
        pickText(lang, `Convert ${cm} centimeters to meters.`, `把 ${cm} 厘米换算成米。`),
        answer, [cm * 100, cm / 10, cm / 1000, cm],
        [{ line: "100 cm = 1 m", note: "conversion factor" }, { line: `${cm}/100 = ${answer} m`, note: "convert" }],
        { cm }, "length-unit-conversion"
      );
    }
    if (form === "interpret") {
      const factor = rng.int(2, 5), answer = factor ** 2;
      return question(
        pickText(lang, `A map's linear scale is enlarged by ${factor}. By what factor are represented areas enlarged?`, `地图线性比例扩大 ${factor} 倍，对应面积扩大多少倍？`),
        answer, [factor, factor ** 3, factor * 2, factor + 1],
        [{ line: `area factor = ${factor}^2`, note: "square the linear scale" }, { line: `${factor}^2 = ${answer}`, note: "evaluate" }],
        { factor }, "map-area-scale"
      );
    }
    if (form === "translate") {
      const path = rng.int(1, 3), outerL = l + 2 * path, outerW = w + 2 * path, answer = outerL * outerW - l * w;
      return question(
        pickText(lang, `A ${path}-unit path surrounds a ${l} by ${w} garden. Find the path's area.`, `宽 ${path} 单位的小路环绕 ${l}×${w} 花园。求小路面积。`),
        answer, [2 * path * (l + w), outerL * outerW, l * w, 2 * (outerL + outerW)],
        [{ line: `outer = ${outerL} by ${outerW}`, note: "add path on both sides" }, { line: `A_path = ${outerL * outerW} - ${l * w} = ${answer}`, note: "subtract inner area" }],
        { path, l, w }, "border-area"
      );
    }
    const feet = rng.int(3, 10), claimed = feet * 10, answer = feet * 12;
    return question(
      pickText(lang, `A student converts ${feet} feet to ${claimed} inches. What is the correct result?`, `学生把 ${feet} 英尺换算为 ${claimed} 英寸。正确结果是多少？`),
      answer, [claimed, feet, feet * 3, feet * 36],
      [{ line: "1 ft = 12 in", note: "correct conversion" }, { line: `${feet}·12 = ${answer}`, note: "multiply" }],
      { feet, claimed }, "diagnose-unit-conversion"
    );
  }

  function applications(form, rng, lang) {
    const w = rng.int(3, 9), l = w + rng.int(2, 8), r = rng.int(2, 8);
    if (form === "direct") {
      const perimeter = 2 * (l + w), answer = l * w;
      return question(
        pickText(lang, `A rectangle has perimeter ${perimeter} and width ${w}. Find its area.`, `长方形周长为 ${perimeter}，宽为 ${w}。求面积。`),
        answer, [perimeter * w, l + w, 2 * l * w, perimeter],
        [{ line: `l+w = ${perimeter}/2`, note: "halve perimeter" }, { line: `l = ${perimeter / 2}-${w} = ${l}`, note: "find length" }, { line: `A = ${l}(${w}) = ${answer}`, note: "find area" }],
        { perimeter, w, l }, "area-from-perimeter"
      );
    }
    if (form === "inverse") return question(
      pickText(lang, `A circle has exact area ${pi(r * r)}. Find its diameter.`, `圆的精确面积为 ${pi(r * r)}。求直径。`),
      2 * r, [r, r * r, 4 * r, 2 * r * r],
      [{ line: `πr^2 = ${pi(r * r)}`, note: "compare coefficients" }, { line: `r = ${r}`, note: "positive square root" }, { line: `d = 2r = ${2 * r}`, note: "diameter" }],
      { r }, "diameter-from-area"
    );
    if (form === "interpret") return question(
      pickText(lang, `A ${l} by ${w} rectangle keeps its width while length increases by 1. How much does area increase?`, `${l}×${w} 长方形宽不变，长增加 1。面积增加多少？`),
      w, [1, l, l + w, 2 * w],
      [{ line: "(l+1)w-lw = w", note: "compare areas" }, { line: `increase = ${w}`, note: "interpret change" }],
      { l, w }, "area-change"
    );
    if (form === "translate") {
      const rate = rng.int(2, 6), area = l * w, answer = rate * area;
      return question(
        pickText(lang, `Flooring costs ${rate} per square unit for a ${l} by ${w} room. Find total cost.`, `${l}×${w} 房间铺地板，每平方单位费用 ${rate}。求总费用。`),
        answer, [rate * 2 * (l + w), area, rate + area, rate * (l + w)],
        [{ line: `A = ${l}(${w}) = ${area}`, note: "room area" }, { line: `cost = ${rate}(${area}) = ${answer}`, note: "apply unit rate" }],
        { rate, l, w }, "flooring-cost"
      );
    }
    const answer = l * w, wrong = 2 * (l + w);
    return question(
      pickText(lang, `A student uses perimeter ${wrong} as the area of a ${l} by ${w} garden. What area is correct?`, `学生把 ${l}×${w} 花园的周长 ${wrong} 当作面积。正确面积是多少？`),
      answer, [wrong, l + w, 2 * answer, l * l],
      [{ line: "A = lw", note: "identify area, not perimeter" }, { line: `A = ${l}(${w}) = ${answer}`, note: "correct measure" }],
      { l, w, wrong }, "diagnose-measure"
    );
  }

  const builders = {
    "perimeter-area": perimeterArea,
    "circles-arcs": circlesArcs,
    "surface-area-volume": solids,
    "composite-units": composite,
    "missing-measure-applications": applications
  };

  factory.register({
    toolId: "geometry-formula",
    course: "geometry-1",
    concepts,
    integerBounds: [1, 500],
    build(context) {
      return builders[context.conceptId](context.taskForm, context.rng, context.lang === "zh" ? "zh" : "en");
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
