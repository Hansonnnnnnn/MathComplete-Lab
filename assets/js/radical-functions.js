const GAME_TEXT = {
  en: {
    toolBadge: "Algebra II",
    title: "Radical Function Practice",
    subtitle: "Practice square-root and cube-root functions with randomized templates for domain, range, transformations, equations, inverses, and models.",
    note: "Every question is generated from a template with changing parameters. The tool does not use a fixed list of prewritten questions.",
    questionTitle: "Choose the correct answer.",
    promptEvaluate: "Evaluate the radical function.",
    promptIdentify: "Identify the radical function or graph feature.",
    promptDomain: "Choose the domain of the radical function.",
    promptRange: "Choose the range of the radical function.",
    promptTransform: "Identify the transformation from the parent radical function.",
    promptBuildFunction: "Choose the radical function that matches the description.",
    promptCubeRoot: "Use the cube-root function to answer the question.",
    promptEquation: "Solve the radical equation and check for extraneous solutions.",
    promptInverse: "Find the inverse function with the correct restriction.",
    promptCompare: "Compare the two radical functions at the given input.",
    promptModel: "Use the radical model to find the requested value.",
    difficultyOptions: {
      easy: "Easy: evaluate, identify, starting point, and domain",
      medium: "Medium: range, transformations, descriptions, and cube roots",
      hard: "Hard: radical equations and solution restrictions",
      expert: "Expert: inverses, complex transformations, comparison, and models",
      mixed: "Mixed: balanced practice from all difficulty levels"
    },
    suggestion: "Suggestion: track the starting point, domain restriction, and whether the coefficient reflects the graph.",
    notes: {
      substitute: "substitute the input",
      radicand: "make the radicand nonnegative",
      square: "square both sides",
      check: "check in the original equation",
      start: "starting point",
      range: "range depends on the sign of a",
      transform: "compare with the parent function",
      inverse: "swap x and y, then solve for y",
      cube: "cube-root functions allow all real inputs",
      model: "use the model formula",
      compare: "evaluate both functions",
      final: "final result"
    },
    correctFeedback: "Correct!",
    resultTitle: "Practice Results",
    scoreLabel: "Correct Answers",
    accuracyLabel: "Accuracy",
    wrongLabel: "Wrong Answers",
    wrongReviewTitle: "Wrong Answer Review",
    startBtn: "Start",
    sampleBtn: "Generate Sample Question",
    quitBtn: "End This Round",
    nextBtn: "Next Question",
    resultBtn: "See Results",
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
    solutionTitle: "Correct Solution",
    solutionFinal: "Answer:",
    incorrectPrefix: "Incorrect. The correct answer is",
    timeUpPrefix: "Time is up. The correct answer is",
    setupTitle: "Start Practice",
    difficultyLabel: "Difficulty",
    questionCountLabel: "Number of Questions",
    optionCountLabel: "Number of Choices",
    timedModeText: "Enable Timed Mode",
    timedModeHint: "Off means no countdown. On means each question has its own timer.",
    timerLevelLabel: "Timer Level",
    navPractice: "Practice Library",
    navHome: "Home",
    difficulties: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert", mixed: "Mixed" },
    optionCount: n => `${n} choices`,
    progress: (a, b) => `Question ${a} / ${b}`,
    timerDisplay: s => `Time left: ${formatTime(s)}`,
    timerOptions: {
      timer_easy: "Easy: 2 minutes per question",
      timer_medium: "Medium: 1 minute per question",
      timer_hard: "Hard: 30 seconds per question",
      timer_expert: "Expert: 15 seconds per question"
    }
  },
  zh: {
    toolBadge: "\u4ee3\u6570 II",
    title: "\u6839\u5f0f\u51fd\u6570\u4e13\u9879\u7ec3\u4e60",
    subtitle: "\u7528\u968f\u673a\u6a21\u677f\u7ec3\u4e60\u5e73\u65b9\u6839\u51fd\u6570\u548c\u7acb\u65b9\u6839\u51fd\u6570\uff0c\u5305\u542b\u5b9a\u4e49\u57df\u3001\u503c\u57df\u3001\u56fe\u50cf\u53d8\u6362\u3001\u6839\u5f0f\u65b9\u7a0b\u3001\u53cd\u51fd\u6570\u548c\u6a21\u578b\u3002",
    note: "\u6bcf\u9053\u9898\u90fd\u7531\u56fa\u5b9a\u6a21\u677f\u548c\u968f\u673a\u53c2\u6570\u751f\u6210\uff0c\u4e0d\u4f7f\u7528\u56fa\u5b9a\u9898\u5e93\u3002",
    questionTitle: "\u8bf7\u9605\u8bfb\u9898\u5e72\uff0c\u5e76\u9009\u62e9\u6b63\u786e\u7b54\u6848\u3002",
    promptEvaluate: "\u8bf7\u8ba1\u7b97\u6839\u5f0f\u51fd\u6570\u7684\u503c\u3002",
    promptIdentify: "\u8bf7\u8bc6\u522b\u6839\u5f0f\u51fd\u6570\u6216\u56fe\u50cf\u7279\u5f81\u3002",
    promptDomain: "\u8bf7\u9009\u62e9\u6839\u5f0f\u51fd\u6570\u7684\u5b9a\u4e49\u57df\u3002",
    promptRange: "\u8bf7\u9009\u62e9\u6839\u5f0f\u51fd\u6570\u7684\u503c\u57df\u3002",
    promptTransform: "\u8bf7\u8bc6\u522b\u76f8\u5bf9\u4e8e\u6bcd\u51fd\u6570\u7684\u56fe\u50cf\u53d8\u6362\u3002",
    promptBuildFunction: "\u8bf7\u9009\u62e9\u4e0e\u63cf\u8ff0\u76f8\u7b26\u7684\u6839\u5f0f\u51fd\u6570\u3002",
    promptCubeRoot: "\u8bf7\u5229\u7528\u7acb\u65b9\u6839\u51fd\u6570\u56de\u7b54\u95ee\u9898\u3002",
    promptEquation: "\u8bf7\u89e3\u6839\u5f0f\u65b9\u7a0b\uff0c\u5e76\u68c0\u9a8c\u662f\u5426\u6709\u589e\u6839\u3002",
    promptInverse: "\u8bf7\u6c42\u53cd\u51fd\u6570\uff0c\u5e76\u9009\u62e9\u6b63\u786e\u7684\u9650\u5236\u6761\u4ef6\u3002",
    promptCompare: "\u8bf7\u5728\u7ed9\u5b9a\u8f93\u5165\u4e0b\u6bd4\u8f83\u4e24\u4e2a\u6839\u5f0f\u51fd\u6570\u3002",
    promptModel: "\u8bf7\u7528\u6839\u5f0f\u6a21\u578b\u6c42\u51fa\u8981\u6c42\u7684\u6570\u503c\u3002",
    difficultyOptions: {
      easy: "\u7b80\u5355\uff1a\u6c42\u503c\u3001\u8bc6\u522b\u3001\u8d77\u70b9\u548c\u5b9a\u4e49\u57df",
      medium: "\u4e2d\u7b49\uff1a\u503c\u57df\u3001\u56fe\u50cf\u53d8\u6362\u3001\u63cf\u8ff0\u9009\u51fd\u6570\u548c\u7acb\u65b9\u6839",
      hard: "\u56f0\u96be\uff1a\u6839\u5f0f\u65b9\u7a0b\u548c\u89e3\u7684\u9650\u5236",
      expert: "\u4e13\u5bb6\uff1a\u53cd\u51fd\u6570\u3001\u590d\u5408\u53d8\u6362\u3001\u6bd4\u8f83\u548c\u6a21\u578b",
      mixed: "\u6df7\u5408\uff1a\u4ece\u6240\u6709\u96be\u5ea6\u4e2d\u5747\u8861\u51fa\u9898"
    },
    suggestion: "\u5efa\u8bae\uff1a\u5148\u8ffd\u8e2a\u8d77\u70b9\u3001\u5b9a\u4e49\u57df\u9650\u5236\u548c\u7cfb\u6570\u5bf9\u56fe\u50cf\u7684\u5f71\u54cd\u3002",
    notes: {
      substitute: "\u4ee3\u5165\u8f93\u5165\u503c",
      radicand: "\u6839\u53f7\u5185\u9700\u8981\u975e\u8d1f",
      square: "\u4e24\u8fb9\u5e73\u65b9",
      check: "\u4ee3\u56de\u539f\u65b9\u7a0b\u68c0\u9a8c",
      start: "\u8d77\u70b9",
      range: "\u503c\u57df\u53d6\u51b3\u4e8e a \u7684\u7b26\u53f7",
      transform: "\u4e0e\u6bcd\u51fd\u6570\u6bd4\u8f83",
      inverse: "\u4ea4\u6362 x \u548c y\uff0c\u518d\u89e3\u51fa y",
      cube: "\u7acb\u65b9\u6839\u51fd\u6570\u5141\u8bb8\u6240\u6709\u5b9e\u6570\u8f93\u5165",
      model: "\u4f7f\u7528\u6a21\u578b\u516c\u5f0f",
      compare: "\u5206\u522b\u8ba1\u7b97\u4e24\u4e2a\u51fd\u6570\u503c",
      final: "\u6700\u7ec8\u7ed3\u679c"
    },
    correctFeedback: "\u6b63\u786e\uff01",
    resultTitle: "\u7ec3\u4e60\u7ed3\u679c",
    scoreLabel: "\u6b63\u786e\u9898\u6570",
    accuracyLabel: "\u6b63\u786e\u7387",
    wrongLabel: "\u9519\u9898\u6570",
    wrongReviewTitle: "\u9519\u9898\u56de\u987e",
    startBtn: "\u5f00\u59cb",
    sampleBtn: "\u751f\u6210\u793a\u4f8b\u9898",
    quitBtn: "\u7ed3\u675f\u672c\u8f6e",
    nextBtn: "\u4e0b\u4e00\u9898",
    resultBtn: "\u67e5\u770b\u7ed3\u679c",
    restartBtn: "\u91cd\u65b0\u7ec3\u4e60",
    reviewWrongBtn: "\u7ec3\u4e60\u76f8\u4f3c\u9519\u9898",
    noWrong: "\u672c\u8f6e\u6ca1\u6709\u9519\u9898\u3002",
    noWrongTip: "\u5f88\u597d\u3002\u53ef\u4ee5\u5c1d\u8bd5\u66f4\u9ad8\u96be\u5ea6\u3002",
    yourAnswer: "\u4f60\u7684\u7b54\u6848",
    correctAnswer: "\u6b63\u786e\u7b54\u6848",
    timeUpAnswer: "\u672a\u4f5c\u7b54\uff1a\u65f6\u95f4\u5230",
    sampleTitle: "\u793a\u4f8b\u9898",
    sampleQuestion: "\u9898\u76ee",
    sampleAnswer: "\u6b63\u786e\u7b54\u6848",
    sampleOptions: "\u793a\u4f8b\u9009\u9879",
    solutionTitle: "\u6b63\u786e\u89e3\u6cd5",
    solutionFinal: "\u7b54\u6848\uff1a",
    incorrectPrefix: "\u4e0d\u6b63\u786e\u3002\u6b63\u786e\u7b54\u6848\u662f",
    timeUpPrefix: "\u65f6\u95f4\u5230\u3002\u6b63\u786e\u7b54\u6848\u662f",
    setupTitle: "\u5f00\u59cb\u7ec3\u4e60",
    difficultyLabel: "\u96be\u5ea6",
    questionCountLabel: "\u9898\u76ee\u6570\u91cf",
    optionCountLabel: "\u9009\u9879\u6570\u91cf",
    timedModeText: "\u5f00\u542f\u8ba1\u65f6\u6a21\u5f0f",
    timedModeHint: "\u5173\u95ed\u65f6\u6ca1\u6709\u5012\u8ba1\u65f6\u3002\u5f00\u542f\u540e\u6bcf\u9898\u90fd\u6709\u72ec\u7acb\u8ba1\u65f6\u3002",
    timerLevelLabel: "\u8ba1\u65f6\u7b49\u7ea7",
    navPractice: "\u7ec3\u4e60\u5e93",
    navHome: "\u4e3b\u9875",
    difficulties: { easy: "\u7b80\u5355", medium: "\u4e2d\u7b49", hard: "\u56f0\u96be", expert: "\u4e13\u5bb6", mixed: "\u6df7\u5408" },
    optionCount: n => `${n} \u4e2a\u9009\u9879`,
    progress: (a, b) => `\u7b2c ${a} / ${b} \u9898`,
    timerDisplay: s => `\u5269\u4f59\u65f6\u95f4\uff1a${formatTime(s)}`,
    timerOptions: {
      timer_easy: "\u7b80\u5355\uff1a\u6bcf\u9898 2 \u5206\u949f",
      timer_medium: "\u4e2d\u7b49\uff1a\u6bcf\u9898 1 \u5206\u949f",
      timer_hard: "\u56f0\u96be\uff1a\u6bcf\u9898 30 \u79d2",
      timer_expert: "\u4e13\u5bb6\uff1a\u6bcf\u9898 15 \u79d2"
    }
  }
};

const TIMER_SECONDS = { timer_easy: 120, timer_medium: 60, timer_hard: 30, timer_expert: 15 };
const DIFFICULTIES = ["easy", "medium", "hard", "expert", "mixed"];
const OPTION_COUNTS = [4, 5, 6];
let lang = localStorage.getItem("mathcomplete_lang") || localStorage.getItem("mcl-lang") || localStorage.getItem("mathcomplete-lang") || "en";
if (!GAME_TEXT[lang]) lang = "en";
let quiz = [];
let currentIndex = 0;
let correctCount = 0;
let wrongAnswers = [];
let answered = false;
let lastDifficulty = "medium";
let timerId = null;
let timeLeft = 0;
let lastQuestionSignature = "";

const $ = id => document.getElementById(id);
const difficultyEl = $("difficulty");
const questionCountEl = $("questionCount");
const optionCountEl = $("optionCount");
const timedModeEl = $("timedMode");
const timerLevelEl = $("timerLevel");
const setupCard = $("setupCard");
const quizCard = $("quizCard");
const resultCard = $("resultCard");
const sampleBox = $("sampleBox");
const noteBox = $("noteBox");
const startBtn = $("startBtn");
const sampleBtn = $("sampleBtn");
const quitBtn = $("quitBtn");
const nextBtn = $("nextBtn");
const restartBtn = $("restartBtn");
const reviewWrongBtn = $("reviewWrongBtn");
const progressText = $("progressText");
const difficultyText = $("difficultyText");
const timerDisplay = $("timerDisplay");
const progressBar = $("progressBar");
const qTitle = $("questionTitle");
const qExtra = $("questionExtra");
const qMain = $("questionMain");
const optionsEl = $("options");
const feedbackEl = $("feedback");
const solutionBox = $("solutionBox");
const scoreNum = $("scoreNum");
const accuracyNum = $("accuracyNum");
const wrongNum = $("wrongNum");
const wrongList = $("wrongList");

function tr() { return GAME_TEXT[lang] || GAME_TEXT.en; }
function formatTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function choice(arr) { return arr[randInt(0, arr.length - 1)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function signed(n) { return n < 0 ? `${n}` : `+${n}`; }
function signedTerm(n) { return n === 0 ? "" : signed(n); }
function hInside(h) { return h === 0 ? "x" : h > 0 ? `x-${h}` : `x+${-h}`; }
function sqrtFunc(a, h, k) {
  const coef = a === 1 ? "" : a === -1 ? "-" : `${a}`;
  return `${coef}\\sqrt{${hInside(h)}}${signedTerm(k)}`;
}
function cbrtFunc(a, h, k) {
  const coef = a === 1 ? "" : a === -1 ? "-" : `${a}`;
  return `${coef}\\sqrt[3]{${hInside(h)}}${signedTerm(k)}`;
}
function point(x, y) { return `\\left(${x},${y}\\right)`; }
function allReals() { return `(-\\infty,\\infty)`; }
function textLatex(text) { return `\\text{${String(text).replace(/\\/g, "\\\\").replace(/_/g, "\\_")}}`; }
function noSolutionText() { return textLatex(lang === "zh" ? "\u65e0\u89e3" : "no solution"); }
function cannotDetermineText() { return textLatex(lang === "zh" ? "\u65e0\u6cd5\u786e\u5b9a" : "cannot be determined"); }
function textOnlyLatex(latex) {
  const match = /^\\text\{([\s\S]*)\}$/.exec(String(latex));
  if (!match) return null;
  return match[1].replace(/\\_/g, "_").replace(/\\\\/g, "\\");
}
function isLongOption(option) {
  const plain = textOnlyLatex(option) || answerToString(option);
  return plain.length > 18 || /[，,]/.test(plain);
}
function answerToString(v) { return String(v); }
function answerKey(v) { return answerToString(v).replace(/\s+/g, "").toLowerCase(); }
function isSameAnswer(a, b) { return answerKey(a) === answerKey(b); }
function line(value, noteKey) { return { line: value, note: tr().notes[noteKey] || noteKey || "" }; }
function htmlEscape(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}
function mathSpan(latex, cls = "math-render") {
  return `<span class="${cls}" data-latex="${htmlEscape(latex)}"></span>`;
}
function renderLatex(el, latex, block = false) {
  el.classList.toggle("math-render", block);
  el.innerHTML = "";
  try {
    katex.render(latex, el, { throwOnError: false, displayMode: block });
  } catch {
    el.textContent = latex;
  }
}
function renderOptionContent(el, option) {
  const plainText = textOnlyLatex(option);
  if (plainText) {
    el.classList.add("text-option");
    el.classList.toggle("long-text-option", isLongOption(option));
    el.textContent = plainText;
    return;
  }
  el.classList.remove("text-option");
  el.classList.remove("long-text-option");
  renderLatex(el, answerToString(option));
}
function renderTaggedMath(root) {
  root.querySelectorAll("[data-latex]").forEach(el => {
    try {
      katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: false });
    } catch {
      el.textContent = el.dataset.latex;
    }
  });
}

function makeQuestion({ difficulty, type, promptKey, main, answer, distractors, lines, builder }) {
  const q = { difficulty, type, promptKey, main, plain: main, answer, distractors, lines, builder };
  q.options = buildOptions(answer, distractors, Number(optionCountEl.value || 4));
  return q;
}
function buildOptions(answer, distractors, count) {
  const map = new Map();
  [answer, ...shuffle(distractors || [])].forEach(item => {
    const key = answerKey(item);
    if (key && !map.has(key)) map.set(key, item);
  });
  [noSolutionText(), "0", "1", "-1", "2", "-2", allReals()].forEach(item => {
    if (map.size < count) map.set(answerKey(item), item);
  });
  return shuffle([...map.values()].slice(0, count));
}

function qEvaluate() {
  const a = choice([-3, -2, -1, 1, 2, 3]);
  const h = randInt(-5, 5);
  const k = randInt(-6, 6);
  const r = randInt(0, 7);
  const x = h + r * r;
  const y = a * r + k;
  return makeQuestion({
    difficulty: "easy",
    type: "evaluate-square-root",
    builder: "qEvaluate",
    promptKey: "promptEvaluate",
    main: `f(x)=${sqrtFunc(a, h, k)},\\quad f(${x})=?`,
    answer: `${y}`,
    distractors: [`${a * (r + 1) + k}`, `${r + k}`, `${a * r - k}`, `${a * (x - h) + k}`, `${-y}`],
    lines: [
      line(`x-h=${x}-${h}=${x - h}`, "substitute"),
      line(`\\sqrt{${x - h}}=${r}`, "radicand"),
      line(`f(${x})=${a}\\cdot ${r}${signedTerm(k)}=${y}`, "final")
    ]
  });
}
function qIdentifyRadical() {
  const a = choice([-2, -1, 1, 2]);
  const h = randInt(-4, 4);
  const k = randInt(-3, 3);
  const answer = `y=${sqrtFunc(a, h, k)}`;
  return makeQuestion({
    difficulty: "easy",
    type: "identify-radical",
    builder: "qIdentifyRadical",
    promptKey: "promptIdentify",
    main: textLatex(lang === "zh" ? "\u54ea\u4e00\u4e2a\u662f\u6839\u5f0f\u51fd\u6570\uff1f" : "Which function is a radical function?"),
    answer,
    distractors: [`y=${a}x${signedTerm(k)}`, `y=${a}x^2${signedTerm(k)}`, `y=${a}\\cdot 2^x${signedTerm(k)}`, `y=\\frac{${a}}{${hInside(h)}}${signedTerm(k)}`],
    lines: [line(answer, "radicand"), line(textLatex(lang === "zh" ? "\u53d8\u91cf x \u51fa\u73b0\u5728\u6839\u53f7\u5185\u3002" : "The variable x appears inside a radical."), "final")]
  });
}
function qStartPoint() {
  const a = choice([-3, -2, -1, 1, 2, 3]);
  const h = randInt(-6, 6);
  const k = randInt(-6, 6);
  return makeQuestion({
    difficulty: "easy",
    type: "starting-point",
    builder: "qStartPoint",
    promptKey: "promptIdentify",
    main: `f(x)=${sqrtFunc(a, h, k)}.\\quad ${textLatex(lang === "zh" ? "\u56fe\u50cf\u8d77\u70b9\u662f\u4ec0\u4e48\uff1f" : "What is the starting point?")}`,
    answer: point(h, k),
    distractors: [point(-h, k), point(h, -k), point(-h, -k), point(k, h), point(h, k + a)],
    lines: [line(`${hInside(h)}=0\\Rightarrow x=${h}`, "start"), line(`f(${h})=${k}`, "start"), line(point(h, k), "final")]
  });
}
function qDomainBasic() {
  const h = randInt(-7, 7);
  if (Math.random() < 0.6) {
    return makeQuestion({
      difficulty: "easy",
      type: "domain-basic",
      builder: "qDomainBasic",
      promptKey: "promptDomain",
      main: `f(x)=\\sqrt{${hInside(h)}}`,
      answer: `x\\ge ${h}`,
      distractors: [`x\\le ${h}`, `x>${h}`, `x<${h}`, allReals(), `x\\ge ${-h}`],
      lines: [line(`${hInside(h)}\\ge 0`, "radicand"), line(`x\\ge ${h}`, "final")]
    });
  }
  const m = choice([2, 3, 4]);
  const bound = randInt(-5, 5);
  const b = -m * bound;
  return makeQuestion({
    difficulty: "easy",
    type: "domain-linear-radicand",
    builder: "qDomainBasic",
    promptKey: "promptDomain",
    main: `f(x)=\\sqrt{${m}x${signedTerm(b)}}`,
    answer: `x\\ge ${bound}`,
    distractors: [`x\\le ${bound}`, `x\\ge ${-bound}`, `x>${bound}`, allReals()],
    lines: [line(`${m}x${signedTerm(b)}\\ge 0`, "radicand"), line(`x\\ge ${bound}`, "final")]
  });
}
function qRange() {
  const a = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
  const h = randInt(-5, 5);
  const k = randInt(-6, 6);
  const answer = a > 0 ? `y\\ge ${k}` : `y\\le ${k}`;
  return makeQuestion({
    difficulty: "medium",
    type: "range-square-root",
    builder: "qRange",
    promptKey: "promptRange",
    main: `f(x)=${sqrtFunc(a, h, k)}`,
    answer,
    distractors: [a > 0 ? `y\\le ${k}` : `y\\ge ${k}`, `x\\ge ${h}`, `x\\le ${h}`, `y\\ge ${h}`, allReals()],
    lines: [line(`\\sqrt{${hInside(h)}}\\ge 0`, "range"), line(a > 0 ? `a>0\\Rightarrow y\\ge ${k}` : `a<0\\Rightarrow y\\le ${k}`, "range"), line(answer, "final")]
  });
}
function qTransform() {
  const a = choice([-3, -2, -1, 2, 3]);
  const h = randInt(-5, 5);
  const k = randInt(-5, 5);
  const parts = [];
  if (Math.abs(a) !== 1) parts.push(lang === "zh" ? `\u7ad6\u76f4\u62c9\u4f38 ${Math.abs(a)} \u500d` : `vertical stretch by ${Math.abs(a)}`);
  if (a < 0) parts.push(lang === "zh" ? "\u5173\u4e8e x \u8f74\u53cd\u5c04" : "reflect over the x-axis");
  if (h !== 0) parts.push(h > 0 ? (lang === "zh" ? `\u5411\u53f3\u5e73\u79fb ${h}` : `right ${h}`) : (lang === "zh" ? `\u5411\u5de6\u5e73\u79fb ${-h}` : `left ${-h}`));
  if (k !== 0) parts.push(k > 0 ? (lang === "zh" ? `\u5411\u4e0a\u5e73\u79fb ${k}` : `up ${k}`) : (lang === "zh" ? `\u5411\u4e0b\u5e73\u79fb ${-k}` : `down ${-k}`));
  const answer = textLatex(parts.join(lang === "zh" ? "\uff0c" : ", ") || (lang === "zh" ? "\u6ca1\u6709\u53d8\u6362" : "no transformation"));
  const wrongLeftRight = h > 0 ? (lang === "zh" ? `\u5411\u5de6\u5e73\u79fb ${h}` : `left ${h}`) : (lang === "zh" ? `\u5411\u53f3\u5e73\u79fb ${-h}` : `right ${-h}`);
  const wrongUpDown = k > 0 ? (lang === "zh" ? `\u5411\u4e0b\u5e73\u79fb ${k}` : `down ${k}`) : (lang === "zh" ? `\u5411\u4e0a\u5e73\u79fb ${-k}` : `up ${-k}`);
  const noReflection = textLatex(lang === "zh" ? `\u5411${h >= 0 ? "\u53f3" : "\u5de6"}\u5e73\u79fb ${Math.abs(h)}\uff0c\u5411${k >= 0 ? "\u4e0a" : "\u4e0b"}\u5e73\u79fb ${Math.abs(k)}` : `${h >= 0 ? "right" : "left"} ${Math.abs(h)}, ${k >= 0 ? "up" : "down"} ${Math.abs(k)}`);
  const oppositeReflection = textLatex(lang === "zh" ? `\u5173\u4e8e y \u8f74\u53cd\u5c04\uff0c\u5411${h >= 0 ? "\u53f3" : "\u5de6"}\u5e73\u79fb ${Math.abs(h)}` : `reflect over the y-axis, ${h >= 0 ? "right" : "left"} ${Math.abs(h)}`);
  return makeQuestion({
    difficulty: "medium",
    type: "transformation",
    builder: "qTransform",
    promptKey: "promptTransform",
    main: `y=${sqrtFunc(a, h, k)}`,
    answer,
    distractors: [
      textLatex(`${wrongLeftRight}${lang === "zh" ? "\uff0c" : ", "}${k >= 0 ? (lang === "zh" ? `\u5411\u4e0a\u5e73\u79fb ${k}` : `up ${k}`) : (lang === "zh" ? `\u5411\u4e0b\u5e73\u79fb ${-k}` : `down ${-k}`)}`),
      textLatex(`${h >= 0 ? (lang === "zh" ? `\u5411\u53f3\u5e73\u79fb ${h}` : `right ${h}`) : (lang === "zh" ? `\u5411\u5de6\u5e73\u79fb ${-h}` : `left ${-h}`)}${lang === "zh" ? "\uff0c" : ", "}${wrongUpDown}`),
      textLatex(lang === "zh" ? "\u5173\u4e8e y \u8f74\u53cd\u5c04" : "reflect over the y-axis"),
      textLatex(lang === "zh" ? `\u7ad6\u76f4\u538b\u7f29 ${Math.abs(a)} \u500d` : `vertical shrink by ${Math.abs(a)}`),
      noReflection,
      oppositeReflection
    ],
    lines: [line(`h=${h},\\quad k=${k},\\quad a=${a}`, "transform"), line(answer, "final")]
  });
}
function qBuildFunction() {
  const a = choice([-2, -1, 1, 2]);
  const h = randInt(-5, 5);
  const k = randInt(-5, 5);
  const answer = `y=${sqrtFunc(a, h, k)}`;
  const main = lang === "zh"
    ? `\\begin{gathered}${textLatex("\u4ece")}\\ y=\\sqrt{x}\\ ${textLatex("\u5f00\u59cb\u3002")}\\\\${textLatex("\u8d77\u70b9\u79fb\u5230")}\\ ${point(h, k)}\\text{\uff0c}\\ ${textLatex("\u7cfb\u6570\u4e3a")}\\ ${a}\\text{\u3002}\\end{gathered}`
    : `\\begin{gathered}\\text{Start from } y=\\sqrt{x}.\\\\\\text{Move the starting point to } ${point(h, k)}\\text{ and use coefficient } ${a}.\\end{gathered}`;
  return makeQuestion({
    difficulty: "medium",
    type: "build-function",
    builder: "qBuildFunction",
    promptKey: "promptBuildFunction",
    main,
    answer,
    distractors: [`y=${sqrtFunc(a, -h, k)}`, `y=${sqrtFunc(a, h, -k)}`, `y=${sqrtFunc(-a, h, k)}`, `y=${cbrtFunc(a, h, k)}`],
    lines: [line(point(h, k), "start"), line(answer, "final")]
  });
}
function qCubeRoot() {
  const a = choice([-3, -2, -1, 1, 2, 3]);
  const h = randInt(-4, 4);
  const k = randInt(-5, 5);
  const r = randInt(-4, 4);
  const x = h + r * r * r;
  const y = a * r + k;
  return makeQuestion({
    difficulty: "medium",
    type: "cube-root-evaluate",
    builder: "qCubeRoot",
    promptKey: "promptCubeRoot",
    main: `g(x)=${cbrtFunc(a, h, k)},\\quad g(${x})=?`,
    answer: `${y}`,
    distractors: [`${a * (r + 1) + k}`, `${r + k}`, `${a * r - k}`, `${-y}`, `${y + a}`],
    lines: [line(`${x}-${h}=${x - h}`, "substitute"), line(`\\sqrt[3]{${x - h}}=${r}`, "cube"), line(`g(${x})=${a}\\cdot ${r}${signedTerm(k)}=${y}`, "final")]
  });
}
function qSimpleEquation() {
  const c = randInt(1, 8);
  const b = randInt(-8, 8);
  const x = c * c - b;
  return makeQuestion({
    difficulty: "hard",
    type: "simple-radical-equation",
    builder: "qSimpleEquation",
    promptKey: "promptEquation",
    main: `\\sqrt{x${signedTerm(b)}}=${c}`,
    answer: `x=${x}`,
    distractors: [`x=${c - b}`, `x=${c * c + b}`, `x=${-x}`, noSolutionText(), `x=${c}`],
    lines: [line(`x${signedTerm(b)}=${c}^2`, "square"), line(`x=${x}`, "final"), line(`\\sqrt{${x}${signedTerm(b)}}=${c}`, "check")]
  });
}
function qVariableEquation() {
  const ans = randInt(2, 9);
  const c = randInt(0, ans - 1);
  const b = (ans - c) * (ans - c) - ans;
  return makeQuestion({
    difficulty: "hard",
    type: "variable-both-sides",
    builder: "qVariableEquation",
    promptKey: "promptEquation",
    main: `\\sqrt{x${signedTerm(b)}}=x${signedTerm(-c)}`,
    answer: `x=${ans}`,
    distractors: [`x=${c}`, `x=${b}`, `x=${ans + b}`, noSolutionText(), `x=${-ans}`],
    lines: [line(`x${signedTerm(b)}=(x${signedTerm(-c)})^2`, "square"), line(`x=${ans}`, "final"), line(`\\sqrt{${ans}${signedTerm(b)}}=${ans - c}`, "check")]
  });
}
function qShiftedEquation() {
  const a = choice([-3, -2, 2, 3]);
  const h = randInt(-5, 5);
  const k = randInt(-5, 5);
  const r = randInt(1, 6);
  const n = a * r + k;
  const x = h + r * r;
  return makeQuestion({
    difficulty: "hard",
    type: "shifted-equation",
    builder: "qShiftedEquation",
    promptKey: "promptEquation",
    main: `${sqrtFunc(a, h, k)}=${n}`,
    answer: `x=${x}`,
    distractors: [`x=${h + r}`, `x=${h - r * r}`, `x=${r * r}`, noSolutionText(), `x=${h}`],
    lines: [line(`${a}\\sqrt{${hInside(h)}}=${n - k}`, "square"), line(`\\sqrt{${hInside(h)}}=${r}`, "square"), line(`${hInside(h)}=${r * r}\\Rightarrow x=${x}`, "final"), line(`${sqrtFunc(a, h, k)}=${n}`, "check")]
  });
}
function qRestrictionNoSolution() {
  const b = randInt(1, 9);
  const c = randInt(1, 5);
  return makeQuestion({
    difficulty: "hard",
    type: "restriction-no-solution",
    builder: "qRestrictionNoSolution",
    promptKey: "promptEquation",
    main: `\\sqrt{x+${b}}=-${c}`,
    answer: noSolutionText(),
    distractors: [`x=${c * c - b}`, `x=${b - c * c}`, `x=${c - b}`, `x=${-b}`, `x=${c * c + b}`],
    lines: [line(`\\sqrt{x+${b}}\\ge 0`, "radicand"), line(textLatex(lang === "zh" ? "\u53f3\u8fb9\u662f\u8d1f\u6570\uff0c\u6240\u4ee5\u6ca1\u6709\u5b9e\u6570\u89e3\u3002" : "The right side is negative, so there is no real solution."), "check"), line(textLatex(lang === "zh" ? "\u65e0\u89e3" : "no solution"), "final")]
  });
}
function qInverse() {
  const h = randInt(-5, 5);
  const k = randInt(-5, 5);
  const answer = `f^{-1}(x)=(x${signedTerm(-k)})^2${signedTerm(h)},\\quad x\\ge ${k}`;
  return makeQuestion({
    difficulty: "expert",
    type: "inverse-square-root",
    builder: "qInverse",
    promptKey: "promptInverse",
    main: `f(x)=\\sqrt{${hInside(h)}}${signedTerm(k)}`,
    answer,
    distractors: [`f^{-1}(x)=x^2${signedTerm(h)},\\quad x\\ge 0`, `f^{-1}(x)=(x${signedTerm(k)})^2${signedTerm(h)}`, `f^{-1}(x)=\\sqrt{x${signedTerm(-k)}}${signedTerm(h)}`, `f^{-1}(x)=(x${signedTerm(-k)})^2${signedTerm(-h)}`],
    lines: [line(`y=\\sqrt{${hInside(h)}}${signedTerm(k)}`, "inverse"), line(`y${signedTerm(-k)}=\\sqrt{${hInside(h)}}`, "inverse"), line(`x=(y${signedTerm(-k)})^2${signedTerm(h)}`, "inverse"), line(answer, "final")]
  });
}
function qComplexTransform() {
  const a = choice([-3, -2, 2, 3]);
  const m = choice([2, 3]);
  const h = randInt(-4, 4);
  const k = randInt(-5, 5);
  const domain = `x\\ge ${h}`;
  const range = a > 0 ? `y\\ge ${k}` : `y\\le ${k}`;
  const answer = `${domain},\\quad ${range}`;
  return makeQuestion({
    difficulty: "expert",
    type: "complex-domain-range",
    builder: "qComplexTransform",
    promptKey: "promptDomain",
    main: `f(x)=${a}\\sqrt{${m}(x${signedTerm(-h)})}${signedTerm(k)}`,
    answer,
    distractors: [`x\\le ${h},\\quad ${range}`, `${domain},\\quad ${a > 0 ? `y\\le ${k}` : `y\\ge ${k}`}`, `x\\ge ${-h},\\quad ${range}`, allReals()],
    lines: [line(`${m}(x${signedTerm(-h)})\\ge 0`, "radicand"), line(domain, "radicand"), line(range, "range"), line(answer, "final")]
  });
}
function qCompare() {
  const x = randInt(10, 30);
  const r1 = randInt(1, 5);
  const r2 = randInt(1, 5);
  const h1 = x - r1 * r1;
  const h2 = x - r2 * r2;
  const k1 = randInt(-3, 3);
  const k2 = randInt(-3, 3);
  const f = r1 + k1;
  const g = r2 + k2;
  const answer = f > g ? "f(x)>g(x)" : f < g ? "f(x)<g(x)" : "f(x)=g(x)";
  return makeQuestion({
    difficulty: "expert",
    type: "compare-functions",
    builder: "qCompare",
    promptKey: "promptCompare",
    main: `f(x)=\\sqrt{${hInside(h1)}}${signedTerm(k1)},\\quad g(x)=\\sqrt{${hInside(h2)}}${signedTerm(k2)},\\quad x=${x}`,
    answer,
    distractors: ["f(x)>g(x)", "f(x)<g(x)", "f(x)=g(x)", cannotDetermineText()],
    lines: [line(`f(${x})=${f}`, "compare"), line(`g(${x})=${g}`, "compare"), line(answer, "final")]
  });
}
function qModel() {
  const k = choice([2, 3, 4, 5, 6]);
  const r = randInt(2, 9);
  const t = k * r * r;
  return makeQuestion({
    difficulty: "expert",
    type: "radical-model",
    builder: "qModel",
    promptKey: "promptModel",
    main: `d=\\sqrt{${k}t},\\quad t=${t},\\quad d=?`,
    answer: `${k * r}`,
    distractors: [`${r}`, `${k + r}`, `${k * r * r}`, `${t}`, `${k * r + 1}`],
    lines: [line(`d=\\sqrt{${k}\\cdot ${t}}`, "model"), line(`d=\\sqrt{${k * t}}=${k * r}`, "final")]
  });
}

const BUILDERS = {
  easy: [qEvaluate, qIdentifyRadical, qStartPoint, qDomainBasic],
  medium: [qRange, qTransform, qBuildFunction, qCubeRoot],
  hard: [qSimpleEquation, qVariableEquation, qShiftedEquation, qRestrictionNoSolution],
  expert: [qInverse, qComplexTransform, qCompare, qModel]
};

function pickDifficulty(diff) { return diff === "mixed" ? choice(["easy", "medium", "hard", "expert"]) : diff; }
function generateQuestion(diff, forcedBuilder = null) {
  for (let attempts = 0; attempts < 80; attempts++) {
    const realDiff = pickDifficulty(diff);
    const pool = BUILDERS[realDiff];
    const builder = forcedBuilder ? Object.values(BUILDERS).flat().find(fn => fn.name === forcedBuilder) || choice(pool) : choice(pool);
    const q = builder();
    const signature = `${q.type}|${q.main}|${q.answer}`;
    if (signature !== lastQuestionSignature) {
      lastQuestionSignature = signature;
      return q;
    }
  }
  return qEvaluate();
}

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = tr().title;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (tr()[key]) el.textContent = tr()[key];
  });
  $("toolBadge").textContent = tr().toolBadge;
  $("pageTitle").textContent = tr().title;
  $("pageSubtitle").textContent = tr().subtitle;
  $("setupTitle").textContent = tr().setupTitle;
  $("difficultyLabel").textContent = tr().difficultyLabel;
  $("questionCountLabel").textContent = tr().questionCountLabel;
  $("optionCountLabel").textContent = tr().optionCountLabel;
  $("timedModeText").textContent = tr().timedModeText;
  $("timedModeHint").textContent = tr().timedModeHint;
  $("timerLevelLabel").textContent = tr().timerLevelLabel;
  startBtn.textContent = tr().startBtn;
  sampleBtn.textContent = tr().sampleBtn;
  quitBtn.textContent = tr().quitBtn;
  nextBtn.textContent = tr().nextBtn;
  restartBtn.textContent = tr().restartBtn;
  reviewWrongBtn.textContent = tr().reviewWrongBtn;
  qTitle.textContent = tr().questionTitle;
  $("resultTitle").textContent = tr().resultTitle;
  $("scoreLabel").textContent = tr().scoreLabel;
  $("accuracyLabel").textContent = tr().accuracyLabel;
  $("wrongLabel").textContent = tr().wrongLabel;
  $("wrongReviewTitle").textContent = tr().wrongReviewTitle;
  noteBox.textContent = tr().note;
  rebuildSelects();
  updateTimerControls();
  if (quiz.length && !quizCard.classList.contains("hidden")) renderQuestion(false);
  if (!resultCard.classList.contains("hidden")) renderResultBody();
}
function rebuildSelects() {
  const oldDiff = difficultyEl.value || "medium";
  const oldOpt = optionCountEl.value || "4";
  const oldTimer = timerLevelEl.value || "timer_medium";
  difficultyEl.innerHTML = DIFFICULTIES.map(d => `<option value="${d}">${tr().difficultyOptions[d]}</option>`).join("");
  difficultyEl.value = DIFFICULTIES.includes(oldDiff) ? oldDiff : "medium";
  optionCountEl.innerHTML = OPTION_COUNTS.map(n => `<option value="${n}">${tr().optionCount(n)}</option>`).join("");
  optionCountEl.value = OPTION_COUNTS.includes(Number(oldOpt)) ? oldOpt : "4";
  timerLevelEl.innerHTML = Object.keys(TIMER_SECONDS).map(k => `<option value="${k}">${tr().timerOptions[k]}</option>`).join("");
  timerLevelEl.value = TIMER_SECONDS[oldTimer] ? oldTimer : "timer_medium";
}
function updateTimerControls() {
  timerLevelEl.disabled = !timedModeEl.checked;
  timerDisplay.classList.toggle("hidden", !timedModeEl.checked);
}
function clearTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}
function startTimerForQuestion() {
  clearTimer();
  if (!timedModeEl.checked) {
    timerDisplay.classList.add("hidden");
    return;
  }
  timeLeft = TIMER_SECONDS[timerLevelEl.value] || 60;
  timerDisplay.classList.remove("hidden");
  updateTimerDisplay();
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 0) handleTimeUp();
  }, 1000);
}
function updateTimerDisplay() {
  timerDisplay.textContent = tr().timerDisplay(Math.max(0, timeLeft));
  timerDisplay.classList.toggle("timer-danger", timeLeft <= 10 && timedModeEl.checked);
}
function buildQuiz(forcedBuilders = null) {
  clearTimer();
  const count = Math.max(1, Math.min(100, Number(questionCountEl.value) || 10));
  lastDifficulty = difficultyEl.value;
  quiz = Array.from({ length: count }, () => generateQuestion(lastDifficulty, forcedBuilders ? choice(forcedBuilders) : null));
  currentIndex = 0;
  correctCount = 0;
  wrongAnswers = [];
  setupCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
  sampleBox.classList.add("hidden");
  renderQuestion(true);
}
function buildWrongTypeQuiz() {
  const builders = wrongAnswers.map(w => w.builder).filter(Boolean);
  buildQuiz(builders.length ? builders : null);
}
function renderQuestion(resetOptions) {
  const q = quiz[currentIndex];
  if (resetOptions) {
    answered = false;
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    solutionBox.classList.add("hidden");
    solutionBox.innerHTML = "";
    nextBtn.disabled = true;
  }
  progressText.textContent = tr().progress(currentIndex + 1, quiz.length);
  difficultyText.textContent = lastDifficulty === "mixed" ? `${tr().difficulties.mixed} - ${tr().difficulties[q.difficulty]}` : tr().difficulties[q.difficulty];
  progressBar.style.width = `${(currentIndex / quiz.length) * 100}%`;
  qTitle.textContent = tr().questionTitle;
  qExtra.textContent = tr()[q.promptKey];
  renderLatex(qMain, q.main, true);
  if (resetOptions) {
    optionsEl.innerHTML = "";
    optionsEl.classList.toggle("long-options", q.options.some(isLongOption));
    q.options.forEach(option => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.dataset.answerKey = answerKey(option);
      btn.setAttribute("aria-label", answerToString(option));
      renderOptionContent(btn, option);
      btn.addEventListener("click", () => chooseOption(btn, option));
      optionsEl.appendChild(btn);
    });
  }
  nextBtn.textContent = currentIndex === quiz.length - 1 ? tr().resultBtn : tr().nextBtn;
  if (resetOptions) startTimerForQuestion();
  else updateTimerDisplay();
}
function renderFeedback(correct, answer, timeUp = false) {
  feedbackEl.className = "feedback";
  if (correct) {
    feedbackEl.textContent = tr().correctFeedback;
    feedbackEl.classList.add("good");
  } else {
    feedbackEl.innerHTML = `${timeUp ? tr().timeUpPrefix : tr().incorrectPrefix} ${mathSpan(answer, "feedback-math")}.`;
    renderTaggedMath(feedbackEl);
    feedbackEl.classList.add("bad");
  }
}
function renderSolutionBox() {
  const q = quiz[currentIndex];
  if (!q || !answered) return;
  solutionBox.classList.remove("hidden");
  solutionBox.innerHTML = `<h4>${tr().solutionTitle}</h4><div class="solution-chain">${q.lines.map(step => `<div class="chain-line">${mathSpan(step.line, "chain-math")}<span class="chain-note">${htmlEscape(step.note || "")}</span></div>`).join("")}</div><div class="solution-answer">${tr().solutionFinal} ${mathSpan(q.answer, "answer-math")}</div>`;
  renderTaggedMath(solutionBox);
}
function chooseOption(button, selected) {
  if (answered) return;
  answered = true;
  clearTimer();
  const q = quiz[currentIndex];
  const correct = q.answer;
  const isCorrect = isSameAnswer(selected, correct);
  [...optionsEl.querySelectorAll(".option")].forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.answerKey === answerKey(correct)) btn.classList.add("correct");
  });
  if (isCorrect) {
    correctCount += 1;
    renderFeedback(true, correct);
  } else {
    button.classList.add("wrong");
    renderFeedback(false, correct);
    wrongAnswers.push({ main: q.plain, answer: correct, selected: answerToString(selected), type: q.type, difficulty: q.difficulty, builder: q.builder });
  }
  void window.MCLProgress?.recordGameAttempt?.({
    question: q,
    course: "algebra-2",
    topic: q.type,
    correctAnswer: correct,
    selectedAnswer: answerToString(selected),
    isCorrect
  });
  renderSolutionBox();
  nextBtn.disabled = false;
  progressBar.style.width = `${((currentIndex + 1) / quiz.length) * 100}%`;
}
function handleTimeUp() {
  if (answered) return;
  answered = true;
  clearTimer();
  const q = quiz[currentIndex];
  [...optionsEl.querySelectorAll(".option")].forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.answerKey === answerKey(q.answer)) btn.classList.add("correct");
  });
  renderFeedback(false, q.answer, true);
  wrongAnswers.push({ main: q.plain, answer: q.answer, selected: null, timeUp: true, type: q.type, difficulty: q.difficulty, builder: q.builder });
  void window.MCLProgress?.recordGameAttempt?.({
    question: q,
    course: "algebra-2",
    topic: q.type,
    correctAnswer: q.answer,
    selectedAnswer: "",
    isCorrect: false,
    timeUp: true
  });
  renderSolutionBox();
  nextBtn.disabled = false;
  progressBar.style.width = `${((currentIndex + 1) / quiz.length) * 100}%`;
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
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  renderResultBody();
}
function renderResultBody() {
  const total = Math.min(quiz.length, currentIndex + (answered ? 1 : 0));
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  scoreNum.textContent = `${correctCount}/${total}`;
  accuracyNum.textContent = `${accuracy}%`;
  wrongNum.textContent = `${wrongAnswers.length}`;
  wrongList.innerHTML = "";
  if (!wrongAnswers.length) {
    wrongList.innerHTML = `<div class="wrong-item"><div class="expr">${tr().noWrong}</div><p class="tag-good">${tr().noWrongTip}</p></div>`;
    return;
  }
  wrongAnswers.forEach((wrong, index) => {
    const item = document.createElement("div");
    item.className = "wrong-item";
    item.innerHTML = `<div class="expr">${index + 1}. ${mathSpan(wrong.main, "wrong-math")}</div><p>${tr().yourAnswer}: <span class="tag-bad">${htmlEscape(wrong.timeUp ? tr().timeUpAnswer : wrong.selected)}</span></p><p>${tr().correctAnswer}: ${mathSpan(wrong.answer, "wrong-math")}</p><p>${tr().suggestion}</p>`;
    wrongList.appendChild(item);
    renderTaggedMath(item);
  });
}
function resetToSetup() {
  clearTimer();
  setupCard.classList.remove("hidden");
  quizCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  progressBar.style.width = "0%";
  sampleBox.classList.add("hidden");
  solutionBox.classList.add("hidden");
  solutionBox.innerHTML = "";
}
function quitQuiz() { if (answered || currentIndex > 0) showResult(); else resetToSetup(); }
function showSample() {
  const q = generateQuestion(pickDifficulty(difficultyEl.value));
  sampleBox.classList.remove("hidden");
  sampleBox.innerHTML = `<strong>${tr().sampleTitle}:</strong><br>${tr().sampleQuestion}: ${mathSpan(q.plain, "sample-math")}<br>${tr()[q.promptKey]}<br>${tr().sampleAnswer}: ${mathSpan(q.answer, "sample-math")}<br>${tr().sampleOptions}: ${q.options.map(item => mathSpan(item, "sample-math")).join(" ")}`;
  renderTaggedMath(sampleBox);
}

timedModeEl.addEventListener("change", updateTimerControls);
startBtn.addEventListener("click", () => buildQuiz());
sampleBtn.addEventListener("click", showSample);
quitBtn.addEventListener("click", quitQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", resetToSetup);
reviewWrongBtn.addEventListener("click", buildWrongTypeQuiz);
window.addEventListener("storage", event => {
  if (event.key === "mathcomplete_lang") {
    lang = localStorage.getItem("mathcomplete_lang") || "en";
    if (!GAME_TEXT[lang]) lang = "en";
    applyLanguage();
  }
});
applyLanguage();
