(function () {
  const GAME_ID = "function-graph-matching";
  const COURSE = "algebra-2";
  const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];
  const TIMER_SECONDS = { relaxed: 240, standard: 150, challenge: 90 };
  const VIEW = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, width: 520, height: 400, pad: 34 };
  const $ = id => document.getElementById(id);

  let lang = readLang();
  let quiz = [];
  let current = 0;
  let correctGroups = 0;
  let wrongGroups = [];
  let selectedExprId = "";
  let matches = {};
  let answered = false;
  let timerId = null;
  let timeLeft = 0;
  let questionStart = 0;

  const els = {
    toolBadge: $("toolBadge"),
    pageTitle: $("pageTitle"),
    pageSubtitle: $("pageSubtitle"),
    setupCard: $("setupCard"),
    quizCard: $("quizCard"),
    resultCard: $("resultCard"),
    setupTitle: $("setupTitle"),
    difficultyLabel: $("difficultyLabel"),
    difficulty: $("difficulty"),
    questionCountLabel: $("questionCountLabel"),
    questionCount: $("questionCount"),
    timedMode: $("timedMode"),
    timedModeText: $("timedModeText"),
    timedModeHint: $("timedModeHint"),
    timerLevelLabel: $("timerLevelLabel"),
    timerLevel: $("timerLevel"),
    startBtn: $("startBtn"),
    sampleBtn: $("sampleBtn"),
    sampleBox: $("sampleBox"),
    noteBox: $("noteBox"),
    progressText: $("progressText"),
    difficultyText: $("difficultyText"),
    timerDisplay: $("timerDisplay"),
    progressBar: $("progressBar"),
    quitBtn: $("quitBtn"),
    promptText: $("promptText"),
    expressionList: $("expressionList"),
    graphGrid: $("graphGrid"),
    feedback: $("feedback"),
    solutionBox: $("solutionBox"),
    submitBtn: $("submitBtn"),
    clearBtn: $("clearBtn"),
    nextBtn: $("nextBtn"),
    resultTitle: $("resultTitle"),
    scoreLabel: $("scoreLabel"),
    accuracyLabel: $("accuracyLabel"),
    wrongLabel: $("wrongLabel"),
    wrongReviewTitle: $("wrongReviewTitle"),
    scoreNum: $("scoreNum"),
    accuracyNum: $("accuracyNum"),
    wrongNum: $("wrongNum"),
    wrongList: $("wrongList"),
    restartBtn: $("restartBtn"),
    reviewWrongBtn: $("reviewWrongBtn")
  };

  const TEXT = {
    en: {
      htmlLang: "en",
      navPractice: "Practice Library",
      navHome: "Home",
      badge: "Algebra II + Precalculus",
      title: "Function Graph Matching",
      subtitle: "Match function expressions to exact generated graphs, including parent functions, transformations, and trigonometric graphs.",
      setupTitle: "Start a Matching Round",
      difficultyLabel: "Difficulty",
      questionCountLabel: "Number of Sets",
      timedModeText: "Enable Timed Mode",
      timedModeHint: "Timed mode gives each matching set its own countdown.",
      timerLevelLabel: "Timer Level",
      startBtn: "Start",
      sampleBtn: "Generate Sample Set",
      note: "Click an expression, then click the graph that matches it. Submit after every graph has a match.",
      prompt: "Match each function expression with its graph.",
      submitBtn: "Check Matches",
      clearBtn: "Clear Matches",
      nextBtn: "Next Set",
      resultBtn: "See Results",
      quitBtn: "End This Round",
      correct: "All matches are correct.",
      incorrect: "Some matches need another look.",
      incomplete: "Match every expression before submitting.",
      timeUp: "Time is up.",
      solutionTitle: "Graph Features",
      resultTitle: "Practice Results",
      scoreLabel: "Correct Sets",
      accuracyLabel: "Accuracy",
      wrongLabel: "Sets to Review",
      wrongReviewTitle: "Review",
      restartBtn: "Practice Again",
      reviewWrongBtn: "Practice Similar Types",
      noWrong: "No wrong matching sets this round.",
      noWrongTip: "Try a harder level next.",
      progress: (a, b) => `Set ${a} / ${b}`,
      timerDisplay: s => `Time left: ${formatTime(s)}`,
      selected: "Selected",
      matchedTo: "Matched to",
      correctGraph: "Correct graph",
      yourMatch: "Your match",
      sampleTitle: "Sample Set",
      difficulties: { easy: "Easy", medium: "Medium", hard: "Hard", mixed: "Mixed" },
      difficultyOptions: {
        easy: "Easy: linear, quadratic, absolute value, square root",
        medium: "Medium: transformations, reciprocal, exponential, sine and cosine",
        hard: "Hard: 5-6 graphs with trig, tangent, asymptotes, and subtle shifts",
        mixed: "Mixed: balanced graph recognition"
      },
      timerOptions: {
        relaxed: "Relaxed: 4 minutes per set",
        standard: "Standard: 2.5 minutes per set",
        challenge: "Challenge: 90 seconds per set"
      }
    },
    zh: {
      htmlLang: "zh-CN",
      navPractice: "\u7ec3\u4e60\u5e93",
      navHome: "\u4e3b\u9875",
      badge: "\u4ee3\u6570 II + \u9884\u5907\u5fae\u79ef\u5206",
      title: "\u51fd\u6570\u56fe\u50cf\u5339\u914d",
      subtitle: "\u628a\u51fd\u6570\u8868\u8fbe\u5f0f\u548c\u7cbe\u786e\u751f\u6210\u7684\u56fe\u50cf\u914d\u5bf9\uff0c\u7ec3\u4e60\u6bcd\u51fd\u6570\u3001\u53d8\u6362\u548c\u4e09\u89d2\u51fd\u6570\u56fe\u50cf\u8bc6\u522b\u3002",
      setupTitle: "\u5f00\u59cb\u5339\u914d\u7ec3\u4e60",
      difficultyLabel: "\u96be\u5ea6",
      questionCountLabel: "\u9898\u7ec4\u6570\u91cf",
      timedModeText: "\u5f00\u542f\u8ba1\u65f6\u6a21\u5f0f",
      timedModeHint: "\u8ba1\u65f6\u6a21\u5f0f\u4f1a\u7ed9\u6bcf\u7ec4\u5339\u914d\u9898\u5355\u72ec\u5012\u8ba1\u65f6\u3002",
      timerLevelLabel: "\u8ba1\u65f6\u7b49\u7ea7",
      startBtn: "\u5f00\u59cb",
      sampleBtn: "\u751f\u6210\u4e00\u7ec4\u6837\u9898",
      note: "\u5148\u70b9\u4e00\u4e2a\u8868\u8fbe\u5f0f\uff0c\u518d\u70b9\u5bf9\u5e94\u56fe\u50cf\u3002\u6240\u6709\u56fe\u90fd\u914d\u597d\u540e\u7edf\u4e00\u63d0\u4ea4\u3002",
      prompt: "\u628a\u6bcf\u4e2a\u51fd\u6570\u8868\u8fbe\u5f0f\u4e0e\u5bf9\u5e94\u56fe\u50cf\u914d\u5bf9\u3002",
      submitBtn: "\u68c0\u67e5\u5339\u914d",
      clearBtn: "\u6e05\u9664\u5339\u914d",
      nextBtn: "\u4e0b\u4e00\u7ec4",
      resultBtn: "\u67e5\u770b\u7ed3\u679c",
      quitBtn: "\u7ed3\u675f\u672c\u8f6e",
      correct: "\u5168\u90e8\u5339\u914d\u6b63\u786e\u3002",
      incorrect: "\u6709\u4e9b\u5339\u914d\u9700\u8981\u518d\u770b\u770b\u3002",
      incomplete: "\u8bf7\u5148\u5b8c\u6210\u6240\u6709\u5339\u914d\u3002",
      timeUp: "\u65f6\u95f4\u5230\u3002",
      solutionTitle: "\u56fe\u50cf\u7279\u5f81",
      resultTitle: "\u7ec3\u4e60\u7ed3\u679c",
      scoreLabel: "\u6b63\u786e\u9898\u7ec4",
      accuracyLabel: "\u6b63\u786e\u7387",
      wrongLabel: "\u9700\u8981\u590d\u4e60",
      wrongReviewTitle: "\u590d\u76d8",
      restartBtn: "\u518d\u7ec3\u4e00\u8f6e",
      reviewWrongBtn: "\u7ec3\u4e60\u540c\u7c7b\u9898",
      noWrong: "\u672c\u8f6e\u6ca1\u6709\u9519\u8bef\u5339\u914d\u3002",
      noWrongTip: "\u53ef\u4ee5\u5c1d\u8bd5\u66f4\u9ad8\u96be\u5ea6\u3002",
      progress: (a, b) => `\u7b2c ${a} / ${b} \u7ec4`,
      timerDisplay: s => `\u5269\u4f59\u65f6\u95f4\uff1a${formatTime(s)}`,
      selected: "\u5df2\u9009\u62e9",
      matchedTo: "\u5df2\u5339\u914d",
      correctGraph: "\u6b63\u786e\u56fe\u50cf",
      yourMatch: "\u4f60\u7684\u5339\u914d",
      sampleTitle: "\u6837\u9898",
      difficulties: { easy: "\u7b80\u5355", medium: "\u4e2d\u7b49", hard: "\u56f0\u96be", mixed: "\u6df7\u5408" },
      difficultyOptions: {
        easy: "\u7b80\u5355\uff1a\u4e00\u6b21\u3001\u4e8c\u6b21\u3001\u7edd\u5bf9\u503c\u3001\u5e73\u65b9\u6839",
        medium: "\u4e2d\u7b49\uff1a\u56fe\u50cf\u53d8\u6362\u3001\u53cd\u6bd4\u4f8b\u3001\u6307\u6570\u3001\u6b63\u5f26\u548c\u4f59\u5f26",
        hard: "\u56f0\u96be\uff1a5-6 \u5f20\u56fe\uff0c\u542b\u4e09\u89d2\u51fd\u6570\u3001\u6b63\u5207\u3001\u6e10\u8fd1\u7ebf\u548c\u7ec6\u5fae\u5e73\u79fb",
        mixed: "\u6df7\u5408\uff1a\u7efc\u5408\u51fd\u6570\u56fe\u50cf\u8bc6\u522b"
      },
      timerOptions: {
        relaxed: "\u5bbd\u677e\uff1a\u6bcf\u7ec4 4 \u5206\u949f",
        standard: "\u6807\u51c6\uff1a\u6bcf\u7ec4 2.5 \u5206\u949f",
        challenge: "\u6311\u6218\uff1a\u6bcf\u7ec4 90 \u79d2"
      }
    }
  };

  function readLang() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function tr() {
    return TEXT[lang] || TEXT.en;
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function signed(n) {
    return n < 0 ? ` - ${Math.abs(n)}` : n > 0 ? ` + ${n}` : "";
  }

  function signedLatex(n) {
    return n < 0 ? ` - ${Math.abs(n)}` : n > 0 ? ` + ${n}` : "";
  }

  function formatCoeff(n, variable = "") {
    if (n === 1 && variable) return variable;
    if (n === -1 && variable) return `-${variable}`;
    return `${n}${variable}`;
  }

  function latexCoeff(n, body = "") {
    if (!body) return String(n);
    if (n === 1) return body;
    if (n === -1) return `-${body}`;
    return `${n}${body}`;
  }

  function formatShift(variable, h) {
    if (h === 0) return variable;
    return `${variable} ${h > 0 ? "-" : "+"} ${Math.abs(h)}`;
  }

  function latexShift(variable, h) {
    if (h === 0) return variable;
    return `${variable} ${h > 0 ? "-" : "+"} ${Math.abs(h)}`;
  }

  function baseLatex(base) {
    return base === 0.5 ? "\\left(\\frac{1}{2}\\right)" : String(base);
  }

  function mathHtml(latex) {
    return `<span class="match-math" data-latex="${escapeHtml(latex)}"></span>`;
  }

  function renderMath(root) {
    if (!window.katex) return;
    root.querySelectorAll("[data-latex]").forEach(el => {
      try {
        katex.render(el.getAttribute("data-latex") || "", el, { throwOnError: false });
      } catch {
        el.textContent = el.getAttribute("data-latex") || "";
      }
    });
  }

  function formatTime(s) {
    const safe = Math.max(0, Math.round(Number(s) || 0));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
  }

  function feature(en, zh) {
    return lang === "zh" ? zh : en;
  }

  function makeFunction(kind, index) {
    const id = `f${index}`;
    if (kind === "linear") {
      const m = choice([-3, -2, -1, 1, 2, 3]);
      const b = randInt(-3, 3);
      return {
        id, kind,
        expression: `y = ${formatCoeff(m, "x")}${signed(b)}`,
        latex: `y = ${latexCoeff(m, "x")}${signedLatex(b)}`,
        eval: x => m * x + b,
        features: feature(`Line with slope ${m} and y-intercept ${b}.`, `\u76f4\u7ebf\uff1a\u659c\u7387 ${m}\uff0cy \u622a\u8ddd ${b}\u3002`)
      };
    }
    if (kind === "quadratic") {
      const a = choice([-2, -1, 1, 2]);
      const h = randInt(-3, 3);
      const k = randInt(-3, 3);
      return {
        id, kind,
        expression: `y = ${formatCoeff(a)}(${formatShift("x", h)})^2${signed(k)}`,
        latex: `y = ${latexCoeff(a, `\\left(${latexShift("x", h)}\\right)^2`)}${signedLatex(k)}`,
        eval: x => a * Math.pow(x - h, 2) + k,
        features: feature(`Parabola with vertex (${h}, ${k}); opens ${a > 0 ? "up" : "down"}.`, `\u629b\u7269\u7ebf\uff1a\u9876\u70b9 (${h}, ${k})\uff0c\u5f00\u53e3\u5411${a > 0 ? "\u4e0a" : "\u4e0b"}\u3002`)
      };
    }
    if (kind === "absolute") {
      const a = choice([-2, -1, 1, 2]);
      const h = randInt(-3, 3);
      const k = randInt(-3, 3);
      return {
        id, kind,
        expression: `y = ${formatCoeff(a)}|${formatShift("x", h)}|${signed(k)}`,
        latex: `y = ${latexCoeff(a, `\\left|${latexShift("x", h)}\\right|`)}${signedLatex(k)}`,
        eval: x => a * Math.abs(x - h) + k,
        features: feature(`V-shape with vertex (${h}, ${k}); opens ${a > 0 ? "up" : "down"}.`, `V \u5f62\u56fe\u50cf\uff1a\u9876\u70b9 (${h}, ${k})\uff0c\u5f00\u53e3\u5411${a > 0 ? "\u4e0a" : "\u4e0b"}\u3002`)
      };
    }
    if (kind === "sqrt") {
      const a = choice([-2, -1, 1, 2]);
      const h = randInt(-4, 2);
      const k = randInt(-3, 3);
      return {
        id, kind,
        expression: `y = ${formatCoeff(a)}√(${formatShift("x", h)})${signed(k)}`,
        latex: `y = ${latexCoeff(a, `\\sqrt{${latexShift("x", h)}}`)}${signedLatex(k)}`,
        eval: x => x < h ? NaN : a * Math.sqrt(x - h) + k,
        features: feature(`Square-root graph starts at (${h}, ${k}) and has domain x >= ${h}.`, `\u5e73\u65b9\u6839\u56fe\u50cf\uff1a\u8d77\u70b9 (${h}, ${k})\uff0c\u5b9a\u4e49\u57df x \u2265 ${h}\u3002`)
      };
    }
    if (kind === "exponential") {
      const a = choice([1, 2, -1]);
      const base = choice([2, 3, 0.5]);
      const k = randInt(-3, 2);
      return {
        id, kind,
        expression: `y = ${formatCoeff(a)}·${base}^x${signed(k)}`,
        latex: `y = ${latexCoeff(a, `${baseLatex(base)}^x`)}${signedLatex(k)}`,
        eval: x => a * Math.pow(base, x) + k,
        asymptotes: [{ type: "horizontal", value: k }],
        features: feature(`Exponential graph with horizontal asymptote y = ${k}.`, `\u6307\u6570\u51fd\u6570\uff1a\u6c34\u5e73\u6e10\u8fd1\u7ebf y = ${k}\u3002`)
      };
    }
    if (kind === "reciprocal") {
      const a = choice([-4, -3, -2, 2, 3, 4]);
      const h = randInt(-3, 3);
      const k = randInt(-3, 3);
      return {
        id, kind,
        expression: `y = ${a}/(${formatShift("x", h)})${signed(k)}`,
        latex: `y = \\frac{${a}}{${latexShift("x", h)}}${signedLatex(k)}`,
        eval: x => Math.abs(x - h) < 0.06 ? NaN : a / (x - h) + k,
        asymptotes: [{ type: "vertical", value: h }, { type: "horizontal", value: k }],
        features: feature(`Reciprocal graph with asymptotes x = ${h} and y = ${k}.`, `\u53cd\u6bd4\u4f8b\u56fe\u50cf\uff1a\u6e10\u8fd1\u7ebf x = ${h}\u3001y = ${k}\u3002`)
      };
    }
    if (kind === "sine" || kind === "cosine") {
      const a = choice([-2, -1, 1, 2]);
      const b = choice([1, 2, 0.5]);
      const k = randInt(-2, 2);
      const fn = kind === "sine" ? "sin" : "cos";
      return {
        id, kind,
        expression: `y = ${formatCoeff(a)} ${fn}(${b === 1 ? "x" : `${b}x`})${signed(k)}`,
        latex: `y = ${latexCoeff(a, `\\${fn}\\left(${b === 1 ? "x" : `${b}x`}\\right)`)}${signedLatex(k)}`,
        eval: x => a * (kind === "sine" ? Math.sin(b * x) : Math.cos(b * x)) + k,
        features: feature(`${kind === "sine" ? "Sine" : "Cosine"} wave with amplitude ${Math.abs(a)}, midline y = ${k}, period ${b === 1 ? "2π" : `${2 / b}π`}.`, `${kind === "sine" ? "\u6b63\u5f26" : "\u4f59\u5f26"}\u56fe\u50cf\uff1a\u632f\u5e45 ${Math.abs(a)}\uff0c\u4e2d\u7ebf y = ${k}\uff0c\u5468\u671f ${b === 1 ? "2π" : `${2 / b}π`}\u3002`)
      };
    }
    const a = choice([-1, 1]);
    const b = choice([1, 0.5]);
    const k = randInt(-1, 1);
    return {
      id, kind: "tangent",
      expression: `y = ${formatCoeff(a)} tan(${b === 1 ? "x" : `${b}x`})${signed(k)}`,
      latex: `y = ${latexCoeff(a, `\\tan\\left(${b === 1 ? "x" : `${b}x`}\\right)`)}${signedLatex(k)}`,
      eval: x => {
        const c = Math.cos(b * x);
        return Math.abs(c) < 0.08 ? NaN : a * Math.tan(b * x) + k;
      },
      features: feature(`Tangent graph with repeating vertical asymptotes and midline y = ${k}.`, `\u6b63\u5207\u56fe\u50cf\uff1a\u6709\u91cd\u590d\u7684\u5782\u76f4\u6e10\u8fd1\u7ebf\uff0c\u4e2d\u7ebf y = ${k}\u3002`)
    };
  }

  function kindsFor(level) {
    if (level === "easy") return ["linear", "quadratic", "absolute", "sqrt"];
    if (level === "medium") return ["linear", "quadratic", "absolute", "sqrt", "exponential", "reciprocal", "sine", "cosine"];
    if (level === "hard") return ["quadratic", "absolute", "sqrt", "exponential", "reciprocal", "sine", "cosine", "tangent"];
    return kindsFor(choice(["easy", "medium", "hard"]));
  }

  function countFor(level) {
    if (level === "easy") return 3;
    if (level === "medium") return 4;
    if (level === "hard") return choice([5, 6]);
    return choice([4, 5]);
  }

  function buildSet(difficulty) {
    const level = difficulty === "mixed" ? choice(["easy", "medium", "hard"]) : difficulty;
    const count = countFor(level);
    const kinds = shuffle(kindsFor(level));
    while (kinds.length < count) kinds.push(choice(kindsFor(level)));
    const functions = kinds.slice(0, count).map((kind, index) => makeFunction(kind, index + 1));
    const graphs = shuffle(functions).map((fn, index) => ({ ...fn, label: String.fromCharCode(65 + index) }));
    return {
      difficulty: level,
      functions,
      graphs
    };
  }

  function setText() {
    lang = readLang();
    document.documentElement.lang = tr().htmlLang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (tr()[key]) el.textContent = tr()[key];
    });
    els.toolBadge.textContent = tr().badge;
    els.pageTitle.textContent = tr().title;
    els.pageSubtitle.textContent = tr().subtitle;
    els.setupTitle.textContent = tr().setupTitle;
    els.difficultyLabel.textContent = tr().difficultyLabel;
    els.questionCountLabel.textContent = tr().questionCountLabel;
    els.timedModeText.textContent = tr().timedModeText;
    els.timedModeHint.textContent = tr().timedModeHint;
    els.timerLevelLabel.textContent = tr().timerLevelLabel;
    els.startBtn.textContent = tr().startBtn;
    els.sampleBtn.textContent = tr().sampleBtn;
    els.noteBox.textContent = tr().note;
    els.quitBtn.textContent = tr().quitBtn;
    els.promptText.textContent = tr().prompt;
    els.submitBtn.textContent = tr().submitBtn;
    els.clearBtn.textContent = tr().clearBtn;
    els.restartBtn.textContent = tr().restartBtn;
    els.reviewWrongBtn.textContent = tr().reviewWrongBtn;
    els.resultTitle.textContent = tr().resultTitle;
    els.scoreLabel.textContent = tr().scoreLabel;
    els.accuracyLabel.textContent = tr().accuracyLabel;
    els.wrongLabel.textContent = tr().wrongLabel;
    els.wrongReviewTitle.textContent = tr().wrongReviewTitle;
    fillSelect(els.difficulty, DIFFICULTIES.map(id => ({ id, text: tr().difficultyOptions[id] })), els.difficulty.value || "medium");
    fillSelect(els.timerLevel, Object.keys(TIMER_SECONDS).map(id => ({ id, text: tr().timerOptions[id] })), els.timerLevel.value || "standard");
  }

  function fillSelect(select, options, currentValue) {
    select.innerHTML = options.map(opt => `<option value="${escapeHtml(opt.id)}">${escapeHtml(opt.text)}</option>`).join("");
    select.value = currentValue;
  }

  function startRound(typesOnly = null) {
    const count = Math.max(1, Math.min(30, Number(els.questionCount.value) || 5));
    const difficulty = els.difficulty.value || "medium";
    quiz = [];
    for (let i = 0; i < count; i++) {
      let set = buildSet(difficulty);
      if (typesOnly?.length) {
        for (let guard = 0; guard < 40 && !set.functions.some(fn => typesOnly.includes(fn.kind)); guard++) set = buildSet("mixed");
      }
      quiz.push(set);
    }
    current = 0;
    correctGroups = 0;
    wrongGroups = [];
    els.setupCard.classList.add("hidden");
    els.resultCard.classList.add("hidden");
    els.quizCard.classList.remove("hidden");
    renderSet();
  }

  function renderSet() {
    stopTimer();
    selectedExprId = "";
    matches = {};
    answered = false;
    questionStart = Date.now();
    const set = quiz[current];
    els.progressText.textContent = tr().progress(current + 1, quiz.length);
    els.difficultyText.textContent = tr().difficulties[set.difficulty] || set.difficulty;
    els.progressBar.style.width = `${(current / quiz.length) * 100}%`;
    els.feedback.className = "feedback";
    els.feedback.textContent = "";
    els.solutionBox.classList.add("hidden");
    els.solutionBox.innerHTML = "";
    els.submitBtn.disabled = false;
    els.nextBtn.disabled = true;
    els.nextBtn.textContent = current === quiz.length - 1 ? tr().resultBtn : tr().nextBtn;
    renderExpressions(set);
    renderGraphs(set);
    if (els.timedMode.checked) startTimer();
  }

  function renderExpressions(set) {
    els.expressionList.innerHTML = set.functions.map(fn => `
      <button class="expression-card" type="button" data-expr-id="${escapeHtml(fn.id)}">
        <span class="expr-main">${mathHtml(fn.latex || fn.expression)}</span>
        <span class="expr-match" data-expr-match="${escapeHtml(fn.id)}">-</span>
      </button>
    `).join("");
    renderMath(els.expressionList);
    els.expressionList.querySelectorAll("[data-expr-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (answered) return;
        selectedExprId = btn.dataset.exprId;
        syncSelection();
      });
    });
  }

  function renderGraphs(set) {
    els.graphGrid.innerHTML = set.graphs.map(graph => `
      <button class="graph-card" type="button" data-graph-id="${escapeHtml(graph.id)}" data-graph-label="${escapeHtml(graph.label)}">
        <span class="graph-label">${escapeHtml(graph.label)}</span>
        <span class="graph-match hidden" data-graph-match="${escapeHtml(graph.id)}"></span>
        ${graphSvg(graph)}
      </button>
    `).join("");
    els.graphGrid.querySelectorAll("[data-graph-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (answered || !selectedExprId) return;
        const graphId = btn.dataset.graphId;
        Object.keys(matches).forEach(exprId => {
          if (matches[exprId] === graphId) delete matches[exprId];
        });
        matches[selectedExprId] = graphId;
        selectedExprId = "";
        syncSelection();
      });
    });
  }

  function syncSelection() {
    const set = quiz[current];
    els.expressionList.querySelectorAll("[data-expr-id]").forEach(btn => {
      const exprId = btn.dataset.exprId;
      const graph = set.graphs.find(g => g.id === matches[exprId]);
      btn.classList.toggle("selected", exprId === selectedExprId);
      btn.classList.toggle("matched", Boolean(graph));
      const marker = btn.querySelector("[data-expr-match]");
      if (marker) marker.textContent = graph ? graph.label : "-";
    });
    els.graphGrid.querySelectorAll("[data-graph-id]").forEach(btn => {
      const graphId = btn.dataset.graphId;
      const expr = set.functions.find(fn => matches[fn.id] === graphId);
      btn.classList.toggle("selected", Boolean(expr && selectedExprId === expr.id));
      btn.classList.toggle("matched", Boolean(expr));
      const marker = btn.querySelector("[data-graph-match]");
      if (marker) {
        marker.classList.toggle("hidden", !expr);
        marker.innerHTML = expr ? mathHtml(expr.latex || expr.expression) : "";
        if (expr) renderMath(marker);
      }
    });
  }

  function graphSvg(fn) {
    const paths = buildPaths(fn);
    const grid = [];
    for (let x = -6; x <= 6; x += 2) grid.push(`<line class="graph-grid-line" x1="${sx(x)}" y1="${sy(-6)}" x2="${sx(x)}" y2="${sy(6)}"></line>`);
    for (let y = -6; y <= 6; y += 2) grid.push(`<line class="graph-grid-line" x1="${sx(-6)}" y1="${sy(y)}" x2="${sx(6)}" y2="${sy(y)}"></line>`);
    const asymptotes = (fn.asymptotes || []).map(a => {
      if (a.type === "vertical" && a.value > VIEW.xmin && a.value < VIEW.xmax) return `<line class="graph-asymptote" x1="${sx(a.value)}" y1="${sy(VIEW.ymin)}" x2="${sx(a.value)}" y2="${sy(VIEW.ymax)}"></line>`;
      if (a.type === "horizontal" && a.value > VIEW.ymin && a.value < VIEW.ymax) return `<line class="graph-asymptote" x1="${sx(VIEW.xmin)}" y1="${sy(a.value)}" x2="${sx(VIEW.xmax)}" y2="${sy(a.value)}"></line>`;
      return "";
    }).join("");
    return `<svg viewBox="0 0 ${VIEW.width} ${VIEW.height}" aria-hidden="true">
      <defs><linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs>
      ${grid.join("")}
      <line class="graph-axis" x1="${sx(VIEW.xmin)}" y1="${sy(0)}" x2="${sx(VIEW.xmax)}" y2="${sy(0)}"></line>
      <line class="graph-axis" x1="${sx(0)}" y1="${sy(VIEW.ymin)}" x2="${sx(0)}" y2="${sy(VIEW.ymax)}"></line>
      ${asymptotes}
      ${paths.map(d => `<path class="graph-curve" d="${d}"></path>`).join("")}
    </svg>`;
  }

  function sx(x) {
    return VIEW.pad + ((x - VIEW.xmin) / (VIEW.xmax - VIEW.xmin)) * (VIEW.width - VIEW.pad * 2);
  }

  function sy(y) {
    return VIEW.height - VIEW.pad - ((y - VIEW.ymin) / (VIEW.ymax - VIEW.ymin)) * (VIEW.height - VIEW.pad * 2);
  }

  function buildPaths(fn) {
    const paths = [];
    let currentPath = "";
    let last = null;
    const steps = 420;
    for (let i = 0; i <= steps; i++) {
      const x = VIEW.xmin + ((VIEW.xmax - VIEW.xmin) * i) / steps;
      const y = fn.eval(x);
      const valid = Number.isFinite(y) && y >= VIEW.ymin && y <= VIEW.ymax;
      if (!valid) {
        if (currentPath) paths.push(currentPath);
        currentPath = "";
        last = null;
        continue;
      }
      const px = sx(x);
      const py = sy(y);
      if (!last || Math.abs(py - last.py) > 160) {
        if (currentPath) paths.push(currentPath);
        currentPath = `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      } else {
        currentPath += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
      last = { px, py };
    }
    if (currentPath) paths.push(currentPath);
    return paths;
  }

  function submitAnswer(forceTimeUp = false) {
    if (answered) return;
    const set = quiz[current];
    if (!forceTimeUp && set.functions.some(fn => !matches[fn.id])) {
      els.feedback.className = "feedback bad";
      els.feedback.textContent = tr().incomplete;
      return;
    }
    stopTimer();
    answered = true;
    const isCorrect = !forceTimeUp && set.functions.every(fn => matches[fn.id] === fn.id);
    if (isCorrect) correctGroups += 1;
    els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
    els.feedback.textContent = forceTimeUp ? tr().timeUp : isCorrect ? tr().correct : tr().incorrect;
    markCards(set);
    showSolution(set);
    els.submitBtn.disabled = true;
    els.nextBtn.disabled = false;
    if (!isCorrect) wrongGroups.push({ set, matches: { ...matches }, forceTimeUp });
    recordAttempt(set, isCorrect, forceTimeUp);
  }

  function markCards(set) {
    set.functions.forEach(fn => {
      const expr = els.expressionList.querySelector(`[data-expr-id="${fn.id}"]`);
      expr?.classList.add(matches[fn.id] === fn.id ? "correct" : "wrong");
    });
    set.graphs.forEach(graph => {
      const expr = set.functions.find(fn => matches[fn.id] === graph.id);
      const card = els.graphGrid.querySelector(`[data-graph-id="${graph.id}"]`);
      card?.classList.add(expr?.id === graph.id ? "correct" : "wrong");
    });
  }

  function showSolution(set) {
    els.solutionBox.classList.remove("hidden");
    els.solutionBox.innerHTML = `<h4>${escapeHtml(tr().solutionTitle)}</h4><div class="solution-grid">${set.graphs.map(graph => `
      <div class="solution-card">
        <strong><span class="pair-chip">${escapeHtml(graph.label)}</span> ${mathHtml(graph.latex || graph.expression)}</strong>
        <p>${escapeHtml(graph.features)}</p>
      </div>`).join("")}</div>`;
    renderMath(els.solutionBox);
  }

  async function recordAttempt(set, isCorrect, forceTimeUp) {
    const correctText = set.graphs.map(g => `${g.expression} -> ${g.label}`).join("; ");
    const selectedText = set.functions.map(fn => {
      const graph = set.graphs.find(g => g.id === matches[fn.id]);
      return `${fn.expression} -> ${graph?.label || (forceTimeUp ? tr().timeUp : "?")}`;
    }).join("; ");
    try {
      await window.MCLProgress?.recordAttempt?.({
        gameId: GAME_ID,
        course: COURSE,
        topic: set.functions.map(fn => fn.kind).join(","),
        difficulty: set.difficulty,
        questionKey: set.functions.map(fn => fn.expression).join("|"),
        questionText: tr().prompt,
        questionLatex: "",
        correctAnswerLatex: correctText,
        selectedAnswerLatex: selectedText,
        isCorrect,
        timeSpentSeconds: Math.max(0, Math.round((Date.now() - questionStart) / 1000))
      });
    } catch (err) {
      console.warn("Could not record function graph matching attempt", err);
    }
  }

  function nextSet() {
    if (current >= quiz.length - 1) {
      showResults();
      return;
    }
    current += 1;
    renderSet();
  }

  function showResults() {
    stopTimer();
    els.quizCard.classList.add("hidden");
    els.resultCard.classList.remove("hidden");
    els.progressBar.style.width = "100%";
    const total = quiz.length || 1;
    els.scoreNum.textContent = `${correctGroups}/${total}`;
    els.accuracyNum.textContent = `${Math.round((correctGroups / total) * 100)}%`;
    els.wrongNum.textContent = String(wrongGroups.length);
    if (!wrongGroups.length) {
      els.wrongList.innerHTML = `<div class="wrong-item"><strong>${escapeHtml(tr().noWrong)}</strong><p>${escapeHtml(tr().noWrongTip)}</p></div>`;
      return;
    }
    els.wrongList.innerHTML = wrongGroups.map((item, index) => `
      <div class="wrong-item">
        <div class="expr">${index + 1}. ${escapeHtml(item.set.functions.map(fn => fn.expression).join(" | "))}</div>
        ${item.set.functions.map(fn => {
          const selectedGraph = item.set.graphs.find(g => g.id === item.matches[fn.id]);
          const correctGraph = item.set.graphs.find(g => g.id === fn.id);
          return `<p><strong>${escapeHtml(fn.expression)}</strong> ${escapeHtml(tr().yourMatch)}: <span class="tag-bad">${escapeHtml(selectedGraph?.label || "-")}</span>; ${escapeHtml(tr().correctGraph)}: <span class="tag-good">${escapeHtml(correctGraph?.label || "-")}</span></p>`;
        }).join("")}
      </div>`).join("");
  }

  function clearMatches() {
    if (answered) return;
    selectedExprId = "";
    matches = {};
    syncSelection();
  }

  function sampleSet() {
    const set = buildSet(els.difficulty.value || "medium");
    els.sampleBox.classList.remove("hidden");
    els.sampleBox.innerHTML = `<h3>${escapeHtml(tr().sampleTitle)}</h3><p>${escapeHtml(set.functions.map(fn => fn.expression).join("  |  "))}</p>`;
  }

  function startTimer() {
    timeLeft = TIMER_SECONDS[els.timerLevel.value] || TIMER_SECONDS.standard;
    els.timerDisplay.classList.remove("hidden", "timer-danger");
    els.timerDisplay.textContent = tr().timerDisplay(timeLeft);
    timerId = window.setInterval(() => {
      timeLeft -= 1;
      els.timerDisplay.textContent = tr().timerDisplay(timeLeft);
      els.timerDisplay.classList.toggle("timer-danger", timeLeft <= 15);
      if (timeLeft <= 0) submitAnswer(true);
    }, 1000);
  }

  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
    els.timerDisplay.classList.add("hidden");
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", () => startRound());
    els.sampleBtn.addEventListener("click", sampleSet);
    els.submitBtn.addEventListener("click", () => submitAnswer(false));
    els.clearBtn.addEventListener("click", clearMatches);
    els.nextBtn.addEventListener("click", nextSet);
    els.quitBtn.addEventListener("click", showResults);
    els.restartBtn.addEventListener("click", () => {
      els.resultCard.classList.add("hidden");
      els.setupCard.classList.remove("hidden");
    });
    els.reviewWrongBtn.addEventListener("click", () => {
      if (!wrongGroups.length) {
        els.resultCard.classList.add("hidden");
        els.setupCard.classList.remove("hidden");
        return;
      }
      startRound(wrongGroups.flatMap(item => item.set.functions.map(fn => fn.kind)));
    });
    window.addEventListener("storage", e => {
      if (e.key === "mathcomplete_lang") setText();
    });
  }

  setText();
  bindEvents();
})();
