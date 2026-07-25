(function () {
  "use strict";
  const registry = window.MCLQuestionTemplates;
  if (!registry || !window.MCLQuizTool) return;

  const concepts = [
    { id: "conversion" }, { id: "proportion-percent-of" }, { id: "percent-change" },
    { id: "discount-markup" }, { id: "percent-applications" }
  ];
  const forms = registry.TASK_FORMS;
  const variants = ["fraction", "percent", "equation", "context"];

  function gcd(a, b) { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; }
  function fraction(n, d) { const g = gcd(n, d); const a = n / g, b = d / g; return b === 1 ? String(a) : `\\frac{${a}}{${b}}`; }
  function money(value) { return `\\$${Number(value).toFixed(2)}`; }
  function text(value) { return `\\text{${String(value).replaceAll("%", "\\%").replaceAll("$", "\\$")}}`; }
  function key(value) { return registry.answerKey(value); }
  function unique(values) { return [...new Map(values.map(value => [key(value), String(value)])).values()]; }
  function numericDistractors(answer, extras = []) {
    const values = [...extras, answer + 1, answer - 1, answer + 5, answer - 5, answer * 2, answer / 2, answer + 10, Math.max(0, answer - 10)];
    for (let i = 1; values.length < 24; i += 1) values.push(answer + i, Math.max(0, answer - i));
    return unique(values.filter(Number.isFinite).map(value => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2))))).filter(value => key(value) !== key(String(answer))).slice(0, 8);
  }
  function completeDistractors(answer, candidates) {
    const values = [...candidates];
    const raw = String(answer);
    const moneyMatch = raw.match(/^\\\$(\d+(?:\.\d+)?)$/);
    const percentMatches = [...raw.matchAll(/(-?\d+(?:\.\d+)?)\\%/g)];
    const fractionMatch = raw.match(/^(-?)\\frac\{(\d+)\}\{(\d+)\}$/);
    const coefficientMatch = raw.match(/^(-?\d+(?:\.\d+)?)x$/);
    if (moneyMatch) {
      const amount = Number(moneyMatch[1]);
      for (let i = 1; values.length < 14; i += 1) values.push(money(Math.max(0, amount + (i % 2 ? i : -i))));
    } else if (percentMatches.length) {
      const target = percentMatches.at(-1);
      const amount = Number(target[1]);
      for (let i = 1; values.length < 14; i += 1) {
        const replacement = `${Math.max(0, Number((amount + (i % 2 ? i : -i)).toFixed(2)))}\\%`;
        values.push(raw.slice(0, target.index) + replacement + raw.slice(target.index + target[0].length));
      }
    } else if (fractionMatch) {
      const numerator = Number(fractionMatch[2]);
      const denominator = Number(fractionMatch[3]);
      for (let i = 1; values.length < 14; i += 1) values.push(fraction(numerator + i, denominator + (i % 3) + 1));
    } else if (coefficientMatch) {
      const coefficient = Number(coefficientMatch[1]);
      for (let i = 1; values.length < 14; i += 1) values.push(`${Number((coefficient + i / 10).toFixed(2))}x`);
    }
    return unique(values).filter(value => key(value) !== key(raw)).slice(0, 8);
  }
  function make(main, answer, distractors, meta = {}) {
    return { main, plain: main, answer: String(answer), distractors: completeDistractors(answer, distractors), prompt: meta.prompt || "", lines: meta.lines || [{ line: main, note: meta.note || "" }, { line: String(answer), note: meta.final || "" }], suggestion: meta.suggestion || "", parameters: meta.parameters || null };
  }
  function numberQuestion(main, answer, extras, meta) { return make(main, answer, numericDistractors(answer, extras), meta); }
  function percentOptions(answer, extras = []) { return unique([...extras, answer + 1, answer - 1, answer + 5, answer - 5, 100 - answer, answer * 2, answer / 2].filter(value => value >= 0).map(value => `${Number(value.toFixed(2))}\\%`)); }

  function conversionFamily(task, variant, rng, t) {
    const denominators = variant < 2 ? [2, 4, 5, 10, 20, 25] : [8, 16, 20, 25, 40, 50];
    const d = rng.choice(denominators), n = rng.int(1, d - 1), pct = n * 100 / d;
    if (task === "direct") return make(`${fraction(n, d)}=?`, `${pct}\\%`, percentOptions(pct, [n / d, pct / 100, d - n]), { prompt: t.fractionToPercent, lines: [{ line: `${fraction(n, d)}\\cdot100\\%=${pct}\\%`, note: t.multiply100 }], parameters: { n, d, pct } });
    if (task === "inverse") return make(`${pct}\\%`, fraction(n, d), [fraction(d - n, d), fraction(n, 100), fraction(d, n), fraction(n + 1, d), fraction(n, d + 1), fraction(Math.max(1, n - 1), d)], { prompt: t.percentToFraction, lines: [{ line: `${pct}\\%=${fraction(pct, 100)}=${fraction(n, d)}`, note: t.reduce }], parameters: { n, d, pct } });
    if (task === "interpret") {
      const values = rng.shuffle([15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]).slice(0, 4);
      const max = Math.max(...values);
      const lower = values.filter(value => value !== max);
      const distractors = [
        `${lower[0]}\\%`, fraction(lower[1], 100), String(lower[2] / 100),
        `${Math.max(0, max - 5)}\\%`, fraction(Math.max(1, max - 10), 100), String(Math.max(0, max - 15) / 100)
      ];
      return make(text(t.greatestValue), `${max}\\%`, distractors, { prompt: t.compareForms, lines: [{ line: `${max}\\%=${max / 100}`, note: t.compareDecimal }], parameters: { values, max } });
    }
    if (task === "translate") {
      const decimal = pct / 100;
      return make(String(decimal), `${pct}\\%`, percentOptions(pct, [decimal, n, d]), { prompt: t.decimalToPercent, lines: [{ line: `${decimal}\\cdot100\\%=${pct}\\%`, note: t.moveDecimal }], parameters: { decimal, pct } });
    }
    const correct = `${fraction(n, d)}=${n / d}=${pct}\\%`;
    return make(text(t.chooseEquivalentTriple), correct, [`${fraction(n, d)}=${pct}=${pct / 100}\\%`, `${fraction(n, d)}=${pct / 100}=${pct / 10}\\%`, `${fraction(d, n)}=${n / d}=${pct}\\%`, `${fraction(n, d)}=${n / d}=${100 - pct}\\%`, `${fraction(n, d)}=${pct}=${pct}\\%`, `${fraction(d - n, d)}=${n / d}=${pct}\\%`], { prompt: t.diagnose, lines: [{ line: correct, note: t.equivalentForms }], parameters: { n, d, pct } });
  }

  function proportionFamily(task, variant, rng, t) {
    const pct = rng.choice(variant < 2 ? [10, 20, 25, 40, 50, 60, 75] : [12, 15, 30, 35, 45, 65, 80]);
    const whole = rng.choice([40, 60, 80, 100, 120, 160, 200, 240]);
    const part = whole * pct / 100;
    if (task === "direct") return numberQuestion(`${pct}\\%\\text{ of }${whole}`, part, [whole - part, pct, whole * pct, part + whole], { prompt: t.findPart, lines: [{ line: `${pct / 100}\\cdot${whole}=${part}`, note: t.percentAsDecimal }], parameters: { pct, whole, part } });
    if (task === "inverse") return numberQuestion(`${pct}\\%\\text{ of }\\Box=${part}`, whole, [part, pct, whole - part, part * pct / 100], { prompt: t.findWhole, lines: [{ line: `\\Box=${part}\\div${pct / 100}=${whole}`, note: t.divideRate }], parameters: { pct, whole, part } });
    if (task === "interpret") return make(`${part}\\text{ is what percent of }${whole}?`, `${pct}\\%`, percentOptions(pct, [part, whole, 100 - pct]), { prompt: t.findRate, lines: [{ line: `\\frac{${part}}{${whole}}\\cdot100\\%=${pct}\\%`, note: t.partOverWhole }], parameters: { pct, whole, part } });
    if (task === "translate") {
      const correct = `\\frac{x}{${whole}}=\\frac{${pct}}{100}`;
      return make(text(t.equationForPercent(pct, whole)), correct, [`\\frac{${whole}}{x}=\\frac{${pct}}{100}`, `x=${whole}+${pct}`, `x=${whole}\\cdot${pct}`, `\\frac{x}{${pct}}=\\frac{${whole}}{100}`, `x=${whole}\\div${pct}`, `\\frac{x}{100}=\\frac{${whole}}{${pct}}`], { prompt: t.modelProportion, lines: [{ line: correct, note: t.partWholeRate }], parameters: { pct, whole } });
    }
    const correct = `${part}\\div${whole}=${pct / 100}`;
    return make(text(t.choosePercentCheck), correct, [`${whole}\\div${part}=${pct / 100}`, `${part}\\div${pct}=${whole}`, `${part}\\cdot${whole}=${pct}`, `${whole}-${part}=${pct}`, `${pct}\\div100=${whole}`, `${part}\\div100=${pct}`], { prompt: t.diagnose, lines: [{ line: correct, note: t.partOverWhole }], parameters: { pct, whole, part } });
  }

  function changeFamily(task, variant, rng, t) {
    const oldValue = rng.choice([40, 50, 60, 80, 100, 120, 160, 200]);
    const rate = rng.choice(variant < 2 ? [10, 20, 25, 50] : [5, 12.5, 15, 30, 40]);
    const increase = rng.bool();
    const change = oldValue * rate / 100;
    const newValue = increase ? oldValue + change : oldValue - change;
    if (task === "direct") return make(`${oldValue}\\to${newValue}`, `${rate}\\%`, percentOptions(rate, [change, 100 - rate, rate * 2]), { prompt: increase ? t.percentIncrease : t.percentDecrease, lines: [{ line: `\\frac{|${newValue}-${oldValue}|}{${oldValue}}\\cdot100\\%=${rate}\\%`, note: t.changeOverOriginal }], parameters: { oldValue, newValue, rate, increase } });
    if (task === "inverse") return numberQuestion(`\\Box\\cdot${increase ? 1 + rate / 100 : 1 - rate / 100}=${newValue}`, oldValue, [newValue, change, oldValue + change, oldValue - change], { prompt: t.findOriginal, lines: [{ line: `\\Box=${newValue}\\div${increase ? 1 + rate / 100 : 1 - rate / 100}=${oldValue}`, note: t.divideMultiplier }], parameters: { oldValue, newValue, rate, increase } });
    if (task === "interpret") return make(`${oldValue}\\to${newValue}`, text(increase ? t.increase : t.decrease), [t.noChange, increase ? t.decrease : t.increase, t.percentOfNew, t.notEnough, t.double, t.half].map(text), { prompt: t.classifyChange, lines: [{ line: `${newValue}${increase ? ">" : "<"}${oldValue}`, note: t.compareOldNew }], parameters: { oldValue, newValue, increase } });
    if (task === "translate") {
      const multiplier = increase ? 1 + rate / 100 : 1 - rate / 100;
      return make(text(increase ? t.increaseBy(rate) : t.decreaseBy(rate)), `${multiplier}x`, [`${rate / 100}x`, `${rate}x`, `${1 - multiplier}x`, `${1 + multiplier}x`, `x${increase ? "+" : "-"}${rate}`, `${100 - rate}x`], { prompt: t.writeMultiplier, lines: [{ line: `${multiplier}x`, note: t.onePlusOrMinusRate }], parameters: { rate, increase, multiplier } });
    }
    const correct = `\\frac{${change}}{${oldValue}}\\cdot100\\%=${rate}\\%`;
    return make(text(t.chooseChangeCalculation), correct, [`\\frac{${change}}{${newValue}}\\cdot100\\%=${rate}\\%`, `\\frac{${oldValue}}{${change}}\\cdot100\\%=${rate}\\%`, `\\frac{${newValue}}{${oldValue}}\\cdot100\\%=${rate}\\%`, `${newValue}-${oldValue}=${rate}\\%`, `\\frac{${oldValue}}{${newValue}}=${rate}\\%`, `${change}\\cdot${oldValue}=${rate}\\%`], { prompt: t.diagnose, lines: [{ line: correct, note: t.changeOverOriginal }], parameters: { oldValue, newValue, rate, change } });
  }

  function retailFamily(task, variant, rng, t, lang) {
    const price = rng.choice([40, 60, 80, 100, 120, 160, 200]);
    const ratePool = variant < 2 ? [10, 20, 25, 50] : [15, 30, 35, 40];
    // At 50% off, the discount amount equals the sale price. That makes a
    // "computed only the discount" distractor numerically indistinguishable.
    const rate = rng.choice(task === "diagnose" ? ratePool.filter(value => value !== 50) : ratePool);
    const discount = price * rate / 100, sale = price - discount;
    if (task === "direct") return make(`${money(price)}\\;${text(t.discountAt(rate))}`, money(sale), [money(discount), money(price + discount), money(price * rate / 10000), money(price - rate), money(price), money(sale + 5)], { prompt: t.salePrice, lines: [{ line: `${money(price)}(1-${rate / 100})=${money(sale)}`, note: t.discountMultiplier }], parameters: { price, rate, sale } });
    if (task === "inverse") return make(`${money(sale)}=${text(t.afterDiscount(rate))}`, money(price), [money(sale), money(discount), money(sale / (1 + rate / 100)), money(sale + rate), money(price + discount), money(price - discount)], { prompt: t.originalPrice, lines: [{ line: `${money(sale)}\\div${1 - rate / 100}=${money(price)}`, note: t.divideMultiplier }], parameters: { price, rate, sale } });
    if (task === "interpret") {
      const taxRate = rng.choice([5, 8, 10]);
      const final = sale * (1 + taxRate / 100);
      return make(`${money(price)}\\;${text(t.discountThenTax(rate, taxRate))}`, money(final), [money(price * (1 + taxRate / 100) * (1 - rate / 100)), money(sale), money(price - discount + price * taxRate / 100), money(price * (1 - (rate + taxRate) / 100)), money(discount), money(price)], { prompt: t.sequentialPercent, lines: [{ line: `${money(price)}(${1 - rate / 100})(${1 + taxRate / 100})=${money(final)}`, note: t.applySequentially }], parameters: { price, rate, taxRate, final } });
    }
    if (task === "translate") {
      const correct = `P(1-${rate / 100})`;
      return make(text(t.saleExpression(rate)), correct, [`P(${rate / 100})`, `P(1+${rate / 100})`, `P-${rate}`, `P\\div${rate}`, `P(${100 - rate})`, `P+${rate}`], { prompt: t.modelRetail, lines: [{ line: correct, note: t.discountMultiplier }], parameters: { rate } });
    }
    const correct = `${money(price)}-${money(discount)}=${money(sale)}`;
    const legacyScenario = lang === "zh"
      ? `\\begin{gathered}\\text{原价：}${money(price)}\\\\\\text{折扣：}${rate}\\%\\\\\\text{标示促销价：}${money(sale)}\\end{gathered}`
      : `\\begin{gathered}\\text{Original price: }${money(price)}\\\\\\text{Discount: }${rate}\\%\\\\\\text{Advertised sale price: }${money(sale)}\\end{gathered}`;
    const scenario = lang === "zh"
      ? `\\begin{gathered}\\text{\u539f\u4ef7\uff1a}${money(price)}\\\\\\text{\u6298\u6263\uff1a}${rate}\\%\\\\\\text{\u6807\u793a\u4fc3\u9500\u4ef7\uff1a}${money(sale)}\\end{gathered}`
      : legacyScenario;
    const legacyPrompt = lang === "zh"
      ? "哪一个算式正确计算出了标示的促销价？"
      : "Which calculation correctly computes the advertised sale price?";
    const prompt = lang === "zh"
      ? "\u54ea\u4e00\u4e2a\u7b97\u5f0f\u6b63\u786e\u8ba1\u7b97\u51fa\u4e86\u6807\u793a\u7684\u4fc3\u9500\u4ef7\uff1f"
      : legacyPrompt;
    const findDiscountNote = lang === "zh" ? "先求折扣金额" : "first find the discount amount";
    const subtractNote = lang === "zh" ? "再用原价减去折扣金额" : "then subtract the discount from the original price";
    return make(scenario, correct, [
      `${money(price)}+${money(discount)}=${money(price + discount)}`,
      `${money(price)}-${money(rate)}=${money(price - rate)}`,
      `${money(price)}\\cdot${rate / 100}=${money(discount)}`,
      `${money(price)}(1+${rate / 100})=${money(price + discount)}`,
      `${money(sale)}-${money(discount)}=${money(sale - discount)}`,
      `${money(price)}-${money(sale)}=${money(discount)}`,
      `${money(sale)}+${money(discount)}=${money(price)}`,
      `${money(sale)}\\div${1 - rate / 100}=${money(price)}`
    ], {
      prompt,
      lines: [
        { line: `${money(price)}\\cdot${rate / 100}=${money(discount)}`, note: lang === "zh" ? "\u5148\u6c42\u6298\u6263\u91d1\u989d" : findDiscountNote },
        { line: correct, note: lang === "zh" ? "\u518d\u7528\u539f\u4ef7\u51cf\u53bb\u6298\u6263\u91d1\u989d" : subtractNote }
      ],
      parameters: { price, rate, discount, sale, checkKind: "sale-price-forward" }
    });
  }

  function applicationFamily(task, variant, rng, t) {
    const amount = rng.choice([40, 50, 60, 80, 100, 120, 160, 200]);
    const rate = rng.choice(variant < 2 ? [10, 15, 20, 25] : [5, 8, 12, 18]);
    const value = amount * rate / 100;
    if (task === "direct") return make(text(t.tipQuestion(amount, rate)), money(value), [money(amount + value), money(amount - value), money(rate), money(amount * rate), money(value + 1), money(amount)], { prompt: t.tip, lines: [{ line: `${money(amount)}(${rate / 100})=${money(value)}`, note: t.rateTimesBase }], parameters: { amount, rate, value, application: "tip" } });
    if (task === "inverse") {
      const commission = value;
      return make(text(t.commissionQuestion(commission, rate)), money(amount), [money(commission), money(amount + commission), money(amount - commission), money(commission / rate), money(amount * rate), money(rate)], { prompt: t.commission, lines: [{ line: `${money(commission)}\\div${rate / 100}=${money(amount)}`, note: t.divideRate }], parameters: { amount, rate, commission, application: "commission" } });
    }
    if (task === "interpret") {
      const measured = amount + value;
      return make(text(t.percentErrorQuestion(amount, measured)), `${rate}\\%`, percentOptions(rate, [value, measured, 100 - rate]), { prompt: t.percentError, lines: [{ line: `\\frac{|${measured}-${amount}|}{${amount}}\\cdot100\\%=${rate}\\%`, note: t.errorOverAccepted }], parameters: { amount, rate, measured, application: "percent-error" } });
    }
    if (task === "translate") {
      const years = rng.int(2, variant < 2 ? 4 : 6);
      const interest = amount * rate / 100 * years;
      return make(text(t.simpleInterestQuestion(amount, rate, years)), money(interest), [money(amount + interest), money(value), money(amount * (1 + rate / 100) ** years - amount), money(rate * years), money(amount * years), money(interest + value)], { prompt: t.simpleInterest, lines: [{ line: `I=Prt=${amount}(${rate / 100})(${years})=${money(interest)}`, note: t.simpleInterestFormula }], parameters: { amount, rate, years, interest, application: "simple-interest" } });
    }
    const correct = `\\text{percent error}=\\frac{|\\text{measured}-\\text{accepted}|}{|\\text{accepted}|}\\cdot100\\%`;
    return make(text(t.chooseApplicationFormula), correct, [`\\text{percent error}=\\frac{|\\text{measured}-\\text{accepted}|}{|\\text{measured}|}\\cdot100\\%`, `I=P+r+t`, `I=Pr+t`, `\\text{tip}=\\text{bill}+\\text{rate}`, `\\text{commission}=\\text{sales}\\div\\text{rate}`, `\\text{part}=\\text{whole}+\\text{rate}`], { prompt: t.diagnose, lines: [{ line: correct, note: t.errorOverAccepted }], parameters: { application: "formula-diagnosis" } });
  }

  function translations(lang) {
    const zh = lang === "zh";
    return zh ? {
      fractionToPercent:"把分数转换成百分数。",multiply100:"乘以 100%",percentToFraction:"把百分数写成最简分数。",reduce:"写成分母为 100 的分数并约分",greatestValue:"选择数值最大的表示",compareForms:"统一表示后比较大小。",compareDecimal:"转换成小数进行比较",decimalToPercent:"把小数转换成百分数。",moveDecimal:"乘以 100",chooseEquivalentTriple:"选择三个表示完全等价的一项",diagnose:"选择计算正确的一项。",equivalentForms:"分数、小数和百分数表示同一个值",
      findPart:"求百分率对应的部分量。",percentAsDecimal:"把百分数写成小数后乘整体",findWhole:"根据部分量和百分率求整体。",divideRate:"用部分量除以小数形式的百分率",findRate:"求部分量占整体的百分比。",partOverWhole:"部分量除以整体",equationForPercent:(p,w)=>`用比例式表示“求 ${w} 的 ${p}%”`,modelProportion:"选择正确的百分比比例式。",partWholeRate:"部分/整体 = 百分率/100",choosePercentCheck:"选择验证百分率正确的等式",
      percentIncrease:"求百分比增加量。",percentDecrease:"求百分比减少量。",changeOverOriginal:"变化量除以原数",findOriginal:"根据变化后的数值反求原数。",divideMultiplier:"除以变化乘数",increase:"增加",decrease:"减少",noChange:"没有变化",percentOfNew:"相对于新数的变化",notEnough:"条件不足",double:"翻倍",half:"减半",classifyChange:"判断变化方向。",compareOldNew:"比较新值和原值",increaseBy:r=>`增加 ${r}% 对应的乘数`,decreaseBy:r=>`减少 ${r}% 对应的乘数`,writeMultiplier:"把百分比变化写成乘数。",onePlusOrMinusRate:"增加用 1+r，减少用 1-r",chooseChangeCalculation:"选择正确的百分比变化计算",
      discountAt:r=>`${r}% 折扣`,salePrice:"计算折后价格。",discountMultiplier:"原价乘以 1-折扣率",afterDiscount:r=>`打 ${r}% 折后的价格`,originalPrice:"根据折后价格反求原价。",discountThenTax:(d,t)=>`先打 ${d}% 折，再加 ${t}% 税`,sequentialPercent:"按顺序计算连续百分比变化。",applySequentially:"连续变化分别使用乘数",saleExpression:r=>`原价 P 打 ${r}% 折后的表达式`,modelRetail:"建立折扣表达式。",chooseSaleCheck:"选择正确的折扣核算",subtractDiscount:"原价减去折扣金额",
      tipQuestion:(a,r)=>`账单为 $${a}，小费率为 ${r}%，小费是多少？`,tip:"计算小费金额。",rateTimesBase:"百分率乘以基数",commissionQuestion:(c,r)=>`佣金为 $${c}，佣金率为 ${r}%，销售额是多少？`,commission:"根据佣金反求销售额。",percentErrorQuestion:(a,m)=>`标准值为 ${a}，测量值为 ${m}，百分误差是多少？`,percentError:"计算百分误差。",errorOverAccepted:"绝对误差除以标准值",simpleInterestQuestion:(p,r,y)=>`本金 $${p}，年利率 ${r}%，${y} 年的单利是多少？`,simpleInterest:"计算单利。",simpleInterestFormula:"使用 I=Prt",chooseApplicationFormula:"选择正确的百分比应用公式"
    } : {
      fractionToPercent:"Convert the fraction to a percent.",multiply100:"multiply by 100%",percentToFraction:"Write the percent as a reduced fraction.",reduce:"write over 100 and reduce",greatestValue:"Choose the representation with the greatest value",compareForms:"Compare equivalent numerical forms.",compareDecimal:"compare using decimal values",decimalToPercent:"Convert the decimal to a percent.",moveDecimal:"multiply by 100",chooseEquivalentTriple:"Choose the three equivalent representations",diagnose:"Choose the correct calculation.",equivalentForms:"fraction, decimal, and percent name the same value",
      findPart:"Find the part represented by the percent.",percentAsDecimal:"write the percent as a decimal and multiply the whole",findWhole:"Find the whole from the part and rate.",divideRate:"divide the part by the decimal rate",findRate:"Find what percent the part is of the whole.",partOverWhole:"divide the part by the whole",equationForPercent:(p,w)=>`Choose a proportion for finding ${p}% of ${w}`,modelProportion:"Choose the correct percent proportion.",partWholeRate:"part/whole = percent/100",choosePercentCheck:"Choose the equation that verifies the percent",
      percentIncrease:"Find the percent increase.",percentDecrease:"Find the percent decrease.",changeOverOriginal:"divide the change by the original value",findOriginal:"Work backward to find the original value.",divideMultiplier:"divide by the change multiplier",increase:"increase",decrease:"decrease",noChange:"no change",percentOfNew:"change relative to the new value",notEnough:"not enough information",double:"double",half:"half",classifyChange:"Classify the direction of change.",compareOldNew:"compare new and original values",increaseBy:r=>`the multiplier for an increase of ${r}%`,decreaseBy:r=>`the multiplier for a decrease of ${r}%`,writeMultiplier:"Write the percent change as a multiplier.",onePlusOrMinusRate:"use 1+r for increase and 1-r for decrease",chooseChangeCalculation:"Choose the correct percent-change calculation",
      discountAt:r=>`${r}% off`,salePrice:"Find the sale price.",discountMultiplier:"multiply the original price by 1-discount rate",afterDiscount:r=>`the price after a ${r}% discount`,originalPrice:"Work backward to find the original price.",discountThenTax:(d,t)=>`${d}% off, followed by ${t}% tax`,sequentialPercent:"Apply consecutive percent changes in order.",applySequentially:"use a separate multiplier for each change",saleExpression:r=>`an expression for price P after ${r}% off`,modelRetail:"Model the discount with an expression.",chooseSaleCheck:"Choose the correct sale-price check",subtractDiscount:"subtract the discount amount from the original price",
      tipQuestion:(a,r)=>`A bill is $${a}. What is a ${r}% tip?`,tip:"Find the tip amount.",rateTimesBase:"multiply the rate by the base amount",commissionQuestion:(c,r)=>`A ${r}% commission is $${c}. What were the sales?`,commission:"Find sales from commission and rate.",percentErrorQuestion:(a,m)=>`The accepted value is ${a} and the measured value is ${m}. Find percent error.`,percentError:"Find the percent error.",errorOverAccepted:"divide absolute error by the accepted value",simpleInterestQuestion:(p,r,y)=>`Find the simple interest on $${p} at ${r}% for ${y} years.`,simpleInterest:"Find simple interest.",simpleInterestFormula:"use I=Prt",chooseApplicationFormula:"Choose the correct percent-application formula"
    };
  }

  function buildQuestion(concept, task, variant, rng, lang) {
    const t = translations(lang);
    if (concept === "conversion") return conversionFamily(task, variant, rng, t);
    if (concept === "proportion-percent-of") return proportionFamily(task, variant, rng, t);
    if (concept === "percent-change") return changeFamily(task, variant, rng, t);
    if (concept === "discount-markup") return retailFamily(task, variant, rng, t, lang);
    return applicationFamily(task, variant, rng, t);
  }
  function difficultyAt(index) { return index < 25 ? "easy" : index < 55 ? "medium" : index < 80 ? "hard" : "expert"; }
  function validate(q) { const answer = key(q.answer); return Boolean(q.main && answer && unique(q.distractors || []).filter(value => key(value) !== answer).length >= 5 && q.lines?.length); }

  const templates = []; let index = 0;
  variants.forEach((representation, variant) => concepts.forEach(concept => forms.forEach(task => {
    const current = index++;
    templates.push({ id:`${concept.id}-${task}-${representation}`, familyId:`${concept.id}-${task}`, conceptId:concept.id, difficulty:difficultyAt(current), taskForm:task, inputRepresentation:representation, outputKind:task === "diagnose" ? "verified-calculation" : "exact-value", reasoningPattern:`${concept.id}:${task}`, constraintPattern:`${representation}:${variant + 1}`, parameterPolicy:{ numericBounds:variant < 2 ? [0,200] : [0,1000], excludes:["ambiguous-base", "premature-rounding", "duplicate-equivalent-options"] }, build:({rng,lang})=>buildQuestion(concept.id,task,variant,rng,lang), validate });
  })));
  concepts.forEach((concept, i) => templates.push({ id:`${concept.id}-capstone`, familyId:`${concept.id}-diagnose`, conceptId:concept.id, difficulty:"expert", taskForm:"diagnose", inputRepresentation:"multi-representation-capstone", outputKind:"verified-conclusion", reasoningPattern:`${concept.id}:multi-step-verification`, constraintPattern:`capstone:${i + 1}`, parameterPolicy:{ numericBounds:[0,2000], minimumReasoningSteps:2 }, build:({rng,lang})=>buildQuestion(concept.id,"diagnose",3,rng,lang), validate }));

  registry.registerTool({ toolId:"fraction-percent", version:"2", concepts, templates });
  window.MCLQuizTool.gameId = "fraction-percent"; window.MCLQuizTool.course = "pre-algebra";
  window.MCLFractionPercentBank = { templates, audit:()=>registry.auditTool("fraction-percent"), auditGeneration:s=>registry.auditGeneration("fraction-percent",{samplesPerTemplate:s||20}) };
})();
