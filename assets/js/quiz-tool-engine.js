(function () {
  const config = window.MCLQuizTool;
  if (!config) return;

  const OPTION_COUNTS = [4, 5, 6];
  const TIMER_DURATIONS = { timer_easy: 120, timer_medium: 60, timer_hard: 30, timer_expert: 15 };
  const DIFFICULTIES = ["easy", "medium", "hard", "expert"];
  const ALL_DIFFICULTIES = [...DIFFICULTIES, "mixed"];
  const $ = id => document.getElementById(id);

  let lang = readGlobalLanguage();
  let quiz = [];
  let currentIndex = 0;
  let correctCount = 0;
  let wrongAnswers = [];
  let answered = false;
  let lastDifficulty = "medium";
  let timerId = null;
  let timeLeft = 0;

  const elements = {
    setupCard: $("setupCard"),
    quizCard: $("quizCard"),
    resultCard: $("resultCard"),
    difficulty: $("difficulty"),
    questionCount: $("questionCount"),
    optionCount: $("optionCount"),
    timedMode: $("timedMode"),
    timerLevel: $("timerLevel"),
    startBtn: $("startBtn"),
    sampleBtn: $("sampleBtn"),
    quitBtn: $("quitBtn"),
    nextBtn: $("nextBtn"),
    restartBtn: $("restartBtn"),
    reviewWrongBtn: $("reviewWrongBtn"),
    sampleBox: $("sampleBox"),
    noteBox: $("noteBox"),
    progressText: $("progressText"),
    difficultyText: $("difficultyText"),
    timerDisplay: $("timerDisplay"),
    progressBar: $("progressBar"),
    qTitle: $("questionTitle"),
    qExtra: $("questionExtra"),
    qMain: $("questionMain"),
    options: $("options"),
    feedback: $("feedback"),
    solutionBox: $("solutionBox"),
    scoreNum: $("scoreNum"),
    accuracyNum: $("accuracyNum"),
    wrongNum: $("wrongNum"),
    wrongList: $("wrongList")
  };

  function readGlobalLanguage() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function tr() {
    return {
      ...defaultText()[lang],
      ...(config.text?.[lang] || {})
    };
  }

  function defaultText() {
    return {
      en: {
        htmlLang: "en",
        navPractice: "Practice Library",
        navHome: "Home",
        setupTitle: "Start Practice",
        difficultyLabel: "Difficulty",
        questionCountLabel: "Number of Questions",
        optionCountLabel: "Number of Choices",
        timedModeText: "Enable Timed Mode",
        timedModeHint: "Off means no countdown. On means each question has its own timer.",
        timerLevelLabel: "Timer Level",
        startBtn: "Start",
        sampleBtn: "Generate Sample Question",
        quitBtn: "End This Round",
        nextBtn: "Next Question",
        resultBtn: "See Results",
        questionTitle: "Read the question and choose the correct answer.",
        correctFeedback: "Correct!",
        incorrectPrefix: "Not quite. The correct answer is",
        timeUpPrefix: "Time is up. The correct answer is",
        solutionTitle: "Correct Solution",
        solutionFinal: "Answer:",
        resultTitle: "Practice Results",
        scoreLabel: "Correct Answers",
        accuracyLabel: "Accuracy",
        wrongLabel: "Wrong Answers",
        wrongReviewTitle: "Wrong Answer Review",
        restartBtn: "Practice Again",
        reviewWrongBtn: "Practice Similar Wrong Types",
        noWrong: "No wrong answers this round.",
        noWrongTip: "Great job. Try a harder level next.",
        yourAnswer: "Your answer",
        correctAnswer: "Correct answer",
        timeUpAnswer: "No answer: time is up",
        sampleTitle: "Sample Question",
        sampleQuestion: "Question",
        sampleAnswer: "Correct answer",
        sampleOptions: "Sample choices",
        progress: (a, b) => `Question ${a} / ${b}`,
        optionCount: n => `${n} choices`,
        timerDisplay: s => `Time left: ${formatTime(s)}`,
        difficulties: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert", mixed: "Mixed" },
        difficultyOptions: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert", mixed: "Mixed" },
        timerOptions: {
          timer_easy: "Easy: 2 minutes per question",
          timer_medium: "Medium: 1 minute per question",
          timer_hard: "Hard: 30 seconds per question",
          timer_expert: "Expert: 15 seconds per question"
        },
        notes: { final: "final result" }
      },
      zh: {
        htmlLang: "zh-CN",
        navPractice: "练习库",
        navHome: "主页",
        setupTitle: "开始练习",
        difficultyLabel: "难度",
        questionCountLabel: "题目数量",
        optionCountLabel: "选项数量",
        timedModeText: "开启计时模式",
        timedModeHint: "关闭后不会倒计时；开启后每题单独计时。",
        timerLevelLabel: "计时难度",
        startBtn: "开始",
        sampleBtn: "生成一道样题",
        quitBtn: "结束本轮",
        nextBtn: "下一题",
        resultBtn: "查看结果",
        questionTitle: "请阅读题干，并选择正确答案。",
        correctFeedback: "正确！",
        incorrectPrefix: "不正确。正确答案是",
        timeUpPrefix: "时间到。正确答案是",
        solutionTitle: "正确解法",
        solutionFinal: "答案：",
        resultTitle: "练习结果",
        scoreLabel: "正确题数",
        accuracyLabel: "正确率",
        wrongLabel: "错题数量",
        wrongReviewTitle: "错题整理",
        restartBtn: "再练一轮",
        reviewWrongBtn: "只练错题同类型",
        noWrong: "本轮没有错题。",
        noWrongTip: "非常好，可以尝试更高难度。",
        yourAnswer: "你的答案",
        correctAnswer: "正确答案",
        timeUpAnswer: "未作答（时间到）",
        sampleTitle: "样题",
        sampleQuestion: "题目",
        sampleAnswer: "正确答案",
        sampleOptions: "选项示例",
        progress: (a, b) => `第 ${a} / ${b} 题`,
        optionCount: n => `${n} 个选项`,
        timerDisplay: s => `剩余时间：${formatTime(s)}`,
        difficulties: { easy: "简单", medium: "中等", hard: "困难", expert: "专家", mixed: "混合" },
        difficultyOptions: { easy: "简单", medium: "中等", hard: "困难", expert: "专家", mixed: "混合" },
        timerOptions: {
          timer_easy: "简单：每题 2 分钟",
          timer_medium: "中等：每题 1 分钟",
          timer_hard: "困难：每题 30 秒",
          timer_expert: "专家：每题 15 秒"
        },
        notes: { final: "最终结果" }
      }
    };
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function escapeLatexText(text) {
    return String(text ?? "").replaceAll("\\", "\\textbackslash{}").replaceAll("&", "\\&").replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll("$", "\\$").replaceAll("{", "\\{").replaceAll("}", "\\}");
  }

  function textLatex(text) {
    return `\\text{${escapeLatexText(text)}}`;
  }

  function mathSpan(latex, cls = "") {
    return `<span${cls ? ` class="${cls}"` : ""} data-latex="${escapeHtml(latex)}"></span>`;
  }

  function renderLatex(el, latex, displayMode = false) {
    el.classList.add("math-render");
    el.innerHTML = "";
    try {
      katex.render(String(latex ?? ""), el, { throwOnError: false, displayMode });
    } catch {
      el.textContent = String(latex ?? "");
    }
  }

  function renderTaggedMath(root) {
    root.querySelectorAll("[data-latex]").forEach(el => renderLatex(el, el.getAttribute("data-latex") || ""));
  }

  function formatTime(s) {
    const safe = Math.max(0, Math.round(Number(s) || 0));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
  }

  function normalizeAnswer(value) {
    if (value && typeof value === "object") return { latex: String(value.latex ?? value.text ?? ""), key: value.key ? String(value.key) : null };
    return { latex: String(value ?? ""), key: null };
  }

  function answerToString(value) {
    return normalizeAnswer(value).latex;
  }

  function answerKey(value) {
    const item = normalizeAnswer(value);
    return String(item.key || item.latex)
      .replace(/\s+/g, "")
      .replaceAll("\\left", "")
      .replaceAll("\\right", "")
      .replaceAll("\\cdot", "*")
      .replaceAll("\\operatorname", "")
      .toLowerCase();
  }

  function isSameAnswer(a, b) {
    return answerKey(a) === answerKey(b);
  }

  function makeOptions(question, count) {
    const answer = normalizeAnswer(question.answer);
    const seen = new Map();
    const add = value => {
      const item = normalizeAnswer(value);
      const key = answerKey(item);
      if (!key || key === answerKey(answer)) return;
      if (!seen.has(key)) seen.set(key, item);
    };
    (question.distractors || []).forEach(add);
    const numeric = /^-?\d+$/.test(answer.latex) ? Number(answer.latex) : null;
    if (Number.isFinite(numeric)) {
      [numeric + 1, numeric - 1, numeric * 2, Math.floor(numeric / 2), numeric + 2, -numeric]
        .filter(n => Number.isFinite(n))
        .forEach(n => add(String(n)));
    }
    return shuffle([answer, ...shuffle([...seen.values()]).slice(0, Math.max(0, count - 1))]);
  }

  function finalizeQuestion(question) {
    const q = {
      difficulty: question.difficulty,
      type: question.type,
      promptKey: question.promptKey || "",
      prompt: question.prompt || "",
      main: question.main,
      plain: question.plain || question.main,
      answer: normalizeAnswer(question.answer),
      lines: question.lines || [],
      distractors: question.distractors || []
    };
    q.options = makeOptions(q, Number(elements.optionCount.value || 4));
    return q;
  }

  function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function choice(items) {
    return items[randInt(0, items.length - 1)];
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function simplifyFraction(n, d = 1) {
    if (d === 0) return { n, d };
    let num = Number(n);
    let den = Number(d);
    if (den < 0) { num = -num; den = -den; }
    const g = gcd(num, den);
    return { n: num / g, d: den / g };
  }

  function fracLatex(n, d = 1) {
    const f = simplifyFraction(n, d);
    if (f.d === 1) return `${f.n}`;
    if (f.n < 0) return `-\\frac{${Math.abs(f.n)}}{${f.d}}`;
    return `\\frac{${f.n}}{${f.d}}`;
  }

  function signed(n) {
    return n < 0 ? `${n}` : `+${n}`;
  }

  function signedTerm(n) {
    return n === 0 ? "" : signed(n);
  }

  function textAnswer(en, zh, key = null) {
    return { latex: textLatex(lang === "zh" ? zh : en), key: key || en.toLowerCase().replace(/\s+/g, "-") };
  }

  const helpers = {
    get lang() { return lang; },
    tr,
    randInt,
    choice,
    shuffle,
    gcd,
    simplifyFraction,
    fracLatex,
    signed,
    signedTerm,
    textLatex,
    textAnswer,
    answerKey,
    answerToString
  };

  function pickDifficulty(diff) {
    return diff === "mixed" ? choice(DIFFICULTIES) : diff;
  }

  function generateQuestion(diff, forcedType = null) {
    const real = pickDifficulty(diff);
    const builders = config.builders?.[real] || config.builders?.medium || [];
    const candidates = forcedType ? builders.filter(fn => fn.__type === forcedType) : builders;
    const pool = candidates.length ? candidates : builders;
    for (let i = 0; i < 80; i++) {
      const q = finalizeQuestion(choice(pool)(helpers));
      if (!forcedType || q.type === forcedType) return q;
    }
    return finalizeQuestion(pool[0](helpers));
  }

  function isTextQuestion(latex) {
    return /^\\text\{[\s\S]*\}$/.test(String(latex || ""));
  }

  function isLongQuestion(latex) {
    const text = String(latex || "");
    return text.length > 58 || isTextQuestion(text) || /begin\{gathered\}|begin\{cases\}/.test(text);
  }

  function clearTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function updateTimerControls() {
    elements.timerLevel.disabled = !elements.timedMode.checked;
  }

  function updateTimerDisplay() {
    if (!elements.timedMode.checked || elements.quizCard.classList.contains("hidden")) {
      elements.timerDisplay.classList.add("hidden");
      return;
    }
    elements.timerDisplay.classList.remove("hidden");
    elements.timerDisplay.textContent = tr().timerDisplay(timeLeft);
    elements.timerDisplay.classList.toggle("timer-danger", timeLeft <= 10);
  }

  function startTimerForQuestion() {
    clearTimer();
    if (!elements.timedMode.checked) {
      elements.timerDisplay.classList.add("hidden");
      return;
    }
    timeLeft = TIMER_DURATIONS[elements.timerLevel.value] || 60;
    updateTimerDisplay();
    timerId = setInterval(() => {
      timeLeft -= 1;
      updateTimerDisplay();
      if (timeLeft <= 0) handleTimeUp();
    }, 1000);
  }

  function applyLanguage() {
    lang = readGlobalLanguage();
    const t = tr();
    document.documentElement.lang = t.htmlLang;
    document.title = t.title;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) el.textContent = t[key];
    });
    $("toolBadge").textContent = t.toolBadge;
    $("pageTitle").textContent = t.title;
    $("pageSubtitle").textContent = t.subtitle;
    $("setupTitle").textContent = t.setupTitle;
    $("difficultyLabel").textContent = t.difficultyLabel;
    $("questionCountLabel").textContent = t.questionCountLabel;
    $("optionCountLabel").textContent = t.optionCountLabel;
    $("timedModeText").textContent = t.timedModeText;
    $("timedModeHint").textContent = t.timedModeHint;
    $("timerLevelLabel").textContent = t.timerLevelLabel;
    elements.startBtn.textContent = t.startBtn;
    elements.sampleBtn.textContent = t.sampleBtn;
    elements.quitBtn.textContent = t.quitBtn;
    elements.nextBtn.textContent = answered && currentIndex === quiz.length - 1 ? t.resultBtn : t.nextBtn;
    $("resultTitle").textContent = t.resultTitle;
    $("scoreLabel").textContent = t.scoreLabel;
    $("accuracyLabel").textContent = t.accuracyLabel;
    $("wrongLabel").textContent = t.wrongLabel;
    $("wrongReviewTitle").textContent = t.wrongReviewTitle;
    elements.restartBtn.textContent = t.restartBtn;
    elements.reviewWrongBtn.textContent = t.reviewWrongBtn;
    elements.noteBox.textContent = t.note || "";

    const selectedDifficulty = elements.difficulty.value || "medium";
    elements.difficulty.innerHTML = ALL_DIFFICULTIES.map(key => `<option value="${key}">${t.difficultyOptions[key] || t.difficulties[key] || key}</option>`).join("");
    elements.difficulty.value = ALL_DIFFICULTIES.includes(selectedDifficulty) ? selectedDifficulty : "medium";

    const selectedOptionCount = elements.optionCount.value || "4";
    elements.optionCount.innerHTML = OPTION_COUNTS.map(n => `<option value="${n}">${t.optionCount(n)}</option>`).join("");
    elements.optionCount.value = OPTION_COUNTS.includes(Number(selectedOptionCount)) ? selectedOptionCount : "4";

    const selectedTimer = elements.timerLevel.value || "timer_medium";
    elements.timerLevel.innerHTML = Object.entries(t.timerOptions).map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
    elements.timerLevel.value = TIMER_DURATIONS[selectedTimer] ? selectedTimer : "timer_medium";
    updateTimerControls();
    if (!elements.quizCard.classList.contains("hidden") && quiz.length) renderQuestion(false);
    if (!elements.resultCard.classList.contains("hidden")) renderResultBody();
  }

  function renderQuestion(resetState = true) {
    const q = quiz[currentIndex];
    if (resetState) answered = false;
    elements.qTitle.textContent = tr().questionTitle;
    elements.qExtra.textContent = q.prompt || tr()[q.promptKey] || "";
    elements.qMain.classList.toggle("long-question", isLongQuestion(q.main));
    elements.qMain.classList.toggle("text-question", isTextQuestion(q.main));
    renderLatex(elements.qMain, q.main, true);
    if (resetState) {
      elements.options.innerHTML = "";
      elements.feedback.textContent = "";
      elements.feedback.className = "feedback";
      elements.solutionBox.classList.add("hidden");
      elements.solutionBox.innerHTML = "";
      q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option";
        btn.dataset.answerKey = answerKey(option);
        renderLatex(btn, answerToString(option));
        btn.addEventListener("click", () => chooseOption(btn, option));
        elements.options.appendChild(btn);
      });
      elements.nextBtn.disabled = true;
    }
    elements.progressText.textContent = tr().progress(currentIndex + 1, quiz.length);
    elements.difficultyText.textContent = tr().difficulties[q.difficulty] || q.difficulty;
    elements.progressBar.style.width = `${(currentIndex / quiz.length) * 100}%`;
    elements.nextBtn.textContent = currentIndex === quiz.length - 1 ? tr().resultBtn : tr().nextBtn;
    if (resetState) startTimerForQuestion();
    else updateTimerDisplay();
  }

  function renderFeedback(isCorrect, correctDisplay, timeUp) {
    elements.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
    if (isCorrect) {
      elements.feedback.textContent = tr().correctFeedback;
    } else {
      elements.feedback.innerHTML = `${timeUp ? tr().timeUpPrefix : tr().incorrectPrefix} ${mathSpan(correctDisplay, "feedback-math")}.`;
      renderTaggedMath(elements.feedback);
    }
  }

  function renderSolutionBox() {
    const q = quiz[currentIndex];
    const correct = answerToString(q.answer);
    elements.solutionBox.classList.remove("hidden");
    elements.solutionBox.innerHTML = `<h4>${tr().solutionTitle}</h4><div class="solution-chain">${q.lines.map(step => `<div class="chain-line">${mathSpan(step.line, "chain-math")}<span class="chain-note">${escapeHtml(step.note || "")}</span></div>`).join("")}</div><div class="solution-answer">${tr().solutionFinal} ${mathSpan(correct, "answer-math")}</div>`;
    renderTaggedMath(elements.solutionBox);
  }

  function optionPayload(q, selected = null) {
    const correctKey = answerKey(q.answer);
    const selectedKey = selected ? answerKey(selected) : "";
    return q.options.map((option, index) => {
      const key = answerKey(option);
      return {
        label: String.fromCharCode(65 + index),
        latex: answerToString(option),
        key,
        isCorrect: key === correctKey,
        isSelected: Boolean(selectedKey && key === selectedKey)
      };
    });
  }

  function optionLabelFrom(q, answer) {
    const key = answer ? answerKey(answer) : "";
    const index = q.options.findIndex(option => answerKey(option) === key);
    return index >= 0 ? String.fromCharCode(65 + index) : "";
  }

  function recordAttempt(q, correctDisplay, selectedDisplay, isCorrect, timeUp = false, selected = null) {
    void window.MCLProgress?.recordGameAttempt?.({
      gameId: config.gameId,
      question: { plain: q.plain, type: q.type, difficulty: q.difficulty },
      course: config.course,
      topic: q.type,
      correctAnswer: correctDisplay,
      selectedAnswer: selectedDisplay,
      options: optionPayload(q, selected),
      correctOptionLabel: optionLabelFrom(q, q.answer),
      selectedOptionLabel: selected ? optionLabelFrom(q, selected) : "",
      isCorrect,
      timeUp
    });
  }

  function chooseOption(button, selected) {
    if (answered) return;
    answered = true;
    clearTimer();
    const q = quiz[currentIndex];
    const correct = q.answer;
    const correctDisplay = answerToString(correct);
    const selectedDisplay = answerToString(selected);
    const isCorrect = isSameAnswer(selected, correct);
    [...elements.options.querySelectorAll(".option")].forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answerKey === answerKey(correct)) btn.classList.add("correct");
    });
    if (isCorrect) {
      correctCount += 1;
      renderFeedback(true, correctDisplay, false);
    } else {
      button.classList.add("wrong");
      renderFeedback(false, correctDisplay, false);
      wrongAnswers.push({ main: q.plain, answer: correctDisplay, selected: selectedDisplay, type: q.type, difficulty: q.difficulty });
    }
    recordAttempt(q, correctDisplay, selectedDisplay, isCorrect, false, selected);
    renderSolutionBox();
    elements.nextBtn.disabled = false;
    elements.progressBar.style.width = `${((currentIndex + 1) / quiz.length) * 100}%`;
  }

  function handleTimeUp() {
    if (answered) return;
    clearTimer();
    answered = true;
    const q = quiz[currentIndex];
    const correctDisplay = answerToString(q.answer);
    [...elements.options.querySelectorAll(".option")].forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answerKey === answerKey(q.answer)) btn.classList.add("correct");
    });
    renderFeedback(false, correctDisplay, true);
    wrongAnswers.push({ main: q.plain, answer: correctDisplay, selected: null, timeUp: true, type: q.type, difficulty: q.difficulty });
    recordAttempt(q, correctDisplay, "", false, true, null);
    renderSolutionBox();
    elements.nextBtn.disabled = false;
    elements.progressBar.style.width = `${((currentIndex + 1) / quiz.length) * 100}%`;
  }

  function nextQuestion() {
    if (!answered) return;
    if (currentIndex < quiz.length - 1) {
      currentIndex += 1;
      renderQuestion(true);
    } else {
      showResult();
    }
  }

  function showResult() {
    clearTimer();
    elements.quizCard.classList.add("hidden");
    elements.resultCard.classList.remove("hidden");
    renderResultBody();
  }

  function renderResultBody() {
    const total = quiz.length;
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    elements.scoreNum.textContent = `${correctCount}/${total}`;
    elements.accuracyNum.textContent = `${accuracy}%`;
    elements.wrongNum.textContent = String(wrongAnswers.length);
    elements.wrongList.innerHTML = "";
    elements.reviewWrongBtn.disabled = wrongAnswers.length === 0;
    if (!wrongAnswers.length) {
      elements.wrongList.innerHTML = `<div class="wrong-item"><div class="expr">${escapeHtml(tr().noWrong)}</div><p>${escapeHtml(tr().noWrongTip)}</p></div>`;
      return;
    }
    wrongAnswers.forEach((w, index) => {
      const item = document.createElement("div");
      item.className = "wrong-item";
      item.innerHTML = `<div class="expr">${index + 1}. ${mathSpan(w.main, "wrong-math")}</div><p><span class="tag-bad">${escapeHtml(tr().yourAnswer)}:</span> ${w.timeUp ? escapeHtml(tr().timeUpAnswer) : mathSpan(w.selected, "wrong-math")}</p><p><span class="tag-good">${escapeHtml(tr().correctAnswer)}:</span> ${mathSpan(w.answer, "wrong-math")}</p>`;
      elements.wrongList.appendChild(item);
      renderTaggedMath(item);
    });
  }

  function buildQuiz() {
    const count = Math.max(1, Math.min(100, Number(elements.questionCount.value || 10)));
    elements.questionCount.value = count;
    lastDifficulty = elements.difficulty.value || "medium";
    quiz = Array.from({ length: count }, () => generateQuestion(lastDifficulty));
    currentIndex = 0;
    correctCount = 0;
    wrongAnswers = [];
    elements.setupCard.classList.add("hidden");
    elements.resultCard.classList.add("hidden");
    elements.quizCard.classList.remove("hidden");
    elements.sampleBox.classList.add("hidden");
    renderQuestion(true);
  }

  function buildWrongTypeQuiz() {
    if (!wrongAnswers.length) return;
    const count = Math.max(1, Math.min(100, Number(elements.questionCount.value || wrongAnswers.length)));
    const pool = shuffle(wrongAnswers);
    quiz = [];
    while (quiz.length < count) {
      const w = pool[quiz.length % pool.length];
      quiz.push(generateQuestion(w.difficulty || pickDifficulty(lastDifficulty), w.type));
    }
    currentIndex = 0;
    correctCount = 0;
    wrongAnswers = [];
    elements.setupCard.classList.add("hidden");
    elements.resultCard.classList.add("hidden");
    elements.quizCard.classList.remove("hidden");
    renderQuestion(true);
  }

  function resetToSetup() {
    clearTimer();
    elements.setupCard.classList.remove("hidden");
    elements.quizCard.classList.add("hidden");
    elements.resultCard.classList.add("hidden");
    elements.progressBar.style.width = "0%";
    elements.sampleBox.classList.add("hidden");
    elements.sampleBox.innerHTML = "";
    elements.solutionBox.classList.add("hidden");
    elements.solutionBox.innerHTML = "";
  }

  function quitQuiz() {
    if (answered || currentIndex > 0) showResult();
    else resetToSetup();
  }

  function showSample() {
    const q = generateQuestion(elements.difficulty.value || "medium");
    const correct = answerToString(q.answer);
    elements.sampleBox.classList.remove("hidden");
    elements.sampleBox.innerHTML = `<strong>${tr().sampleTitle}:</strong><br>${tr().sampleQuestion}: ${mathSpan(q.plain, "sample-math")}<br>${q.prompt || tr()[q.promptKey] || ""}<br>${tr().sampleAnswer}: ${mathSpan(correct, "sample-math")}<br>${tr().sampleOptions}: ${q.options.map(item => mathSpan(answerToString(item), "sample-math")).join(" ")}`;
    renderTaggedMath(elements.sampleBox);
  }

  elements.timedMode.addEventListener("change", updateTimerControls);
  elements.startBtn.addEventListener("click", buildQuiz);
  elements.sampleBtn.addEventListener("click", showSample);
  elements.nextBtn.addEventListener("click", nextQuestion);
  elements.quitBtn.addEventListener("click", quitQuiz);
  elements.restartBtn.addEventListener("click", resetToSetup);
  elements.reviewWrongBtn.addEventListener("click", buildWrongTypeQuiz);
  window.addEventListener("storage", event => {
    if (event.key === "mathcomplete_lang") applyLanguage();
  });
  applyLanguage();

  window.MCLQuizToolEngine = {
    generateQuestion: (difficulty, forcedType = null) => generateQuestion(difficulty, forcedType),
    helpers,
    renderQuestion,
    buildQuiz
  };
})();
