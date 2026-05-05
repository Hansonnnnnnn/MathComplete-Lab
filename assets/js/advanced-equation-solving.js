const GAME_TEXT = {
  en: {
    toolBadge: "Algebra II + Precalculus",
    title: "Advanced Equation Solving",
    subtitle: "Solve randomized equation templates across Algebra II and Precalculus, including rational, radical, exponential, logarithmic, absolute-value, polynomial, and trigonometric equations.",
    note: "Every question is generated from a template with changing parameters. The expert level includes multi-step equations, domain checks, extraneous roots, and complete solution sets.",
    questionTitle: "Read the equation and choose the complete solution set.",
    promptLinear: "Solve the multi-step linear equation.",
    promptQuadratic: "Solve the quadratic equation.",
    promptAbsolute: "Solve the absolute-value equation.",
    promptRational: "Solve the rational equation and exclude any invalid values.",
    promptRadical: "Solve the radical equation and check for extraneous solutions.",
    promptExponential: "Solve the exponential equation.",
    promptLogarithmic: "Solve the logarithmic equation and check the domain.",
    promptPolynomial: "Use substitution or factoring to solve the polynomial equation.",
    promptTrigonometric: "Solve the trigonometric equation on the given interval.",
    promptMixed: "Solve the equation and justify the allowed solutions.",
    difficultyOptions: {
      easy: "Easy: linear, simple quadratic, and absolute-value equations",
      medium: "Medium: quadratic formula, rational, radical, exponential, and logarithmic equations",
      hard: "Hard: substitutions, trigonometric equations, and restricted domains",
      expert: "Expert: mixed equations with complete solution-set reasoning",
      mixed: "Mixed: balanced practice from all difficulty levels"
    },
    suggestion: "Suggestion: solve algebraically, then check restrictions such as zero denominators, logarithm domains, square-root domains, and the requested interval.",
    notes: {
      distribute: "distribute and combine like terms",
      isolate: "isolate the variable expression",
      divide: "divide both sides",
      factor: "factor the equation",
      zeroProduct: "use the zero-product property",
      formula: "use the quadratic formula",
      splitAbs: "split into two cases",
      exclude: "exclude values that make a denominator zero",
      square: "square both sides",
      check: "check in the original equation",
      sameBase: "rewrite with the same base",
      logDomain: "check that each logarithm input is positive",
      substitution: "substitute to reduce the equation",
      trigUnit: "use unit-circle values",
      interval: "keep only solutions in the required interval",
      final: "final solution set"
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
    noWrongTip: "Strong work. Try expert mode next.",
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
    toolBadge: "\u4ee3\u6570 II + \u9884\u5907\u5fae\u79ef\u5206",
    title: "\u9ad8\u7ea7\u89e3\u65b9\u7a0b\u4e13\u9879\u7ec3\u4e60",
    subtitle: "\u7528\u968f\u673a\u6a21\u677f\u7ec3\u4e60\u4ee3\u6570 II \u548c\u9884\u5907\u5fae\u79ef\u5206\u4e2d\u7684\u65b9\u7a0b\uff0c\u5305\u542b\u6709\u7406\u65b9\u7a0b\u3001\u6839\u5f0f\u65b9\u7a0b\u3001\u6307\u6570\u65b9\u7a0b\u3001\u5bf9\u6570\u65b9\u7a0b\u3001\u7edd\u5bf9\u503c\u65b9\u7a0b\u3001\u591a\u9879\u5f0f\u65b9\u7a0b\u548c\u4e09\u89d2\u65b9\u7a0b\u3002",
    note: "\u6bcf\u9053\u9898\u90fd\u7531\u56fa\u5b9a\u6a21\u677f\u548c\u968f\u673a\u53c2\u6570\u751f\u6210\u3002\u4e13\u5bb6\u96be\u5ea6\u4f1a\u5305\u542b\u591a\u6b65\u53d8\u5f62\u3001\u5b9a\u4e49\u57df\u68c0\u67e5\u3001\u589e\u6839\u6392\u9664\u548c\u5b8c\u6574\u89e3\u96c6\u5224\u65ad\u3002",
    questionTitle: "\u8bf7\u9605\u8bfb\u65b9\u7a0b\uff0c\u5e76\u9009\u62e9\u5b8c\u6574\u7684\u89e3\u96c6\u3002",
    promptLinear: "\u8bf7\u89e3\u591a\u6b65\u4e00\u6b21\u65b9\u7a0b\u3002",
    promptQuadratic: "\u8bf7\u89e3\u4e8c\u6b21\u65b9\u7a0b\u3002",
    promptAbsolute: "\u8bf7\u89e3\u7edd\u5bf9\u503c\u65b9\u7a0b\u3002",
    promptRational: "\u8bf7\u89e3\u6709\u7406\u65b9\u7a0b\uff0c\u5e76\u6392\u9664\u65e0\u6548\u53d6\u503c\u3002",
    promptRadical: "\u8bf7\u89e3\u6839\u5f0f\u65b9\u7a0b\uff0c\u5e76\u68c0\u9a8c\u662f\u5426\u6709\u589e\u6839\u3002",
    promptExponential: "\u8bf7\u89e3\u6307\u6570\u65b9\u7a0b\u3002",
    promptLogarithmic: "\u8bf7\u89e3\u5bf9\u6570\u65b9\u7a0b\uff0c\u5e76\u68c0\u67e5\u5b9a\u4e49\u57df\u3002",
    promptPolynomial: "\u8bf7\u7528\u4ee3\u6362\u6216\u56e0\u5f0f\u5206\u89e3\u89e3\u591a\u9879\u5f0f\u65b9\u7a0b\u3002",
    promptTrigonometric: "\u8bf7\u5728\u7ed9\u5b9a\u533a\u95f4\u5185\u89e3\u4e09\u89d2\u65b9\u7a0b\u3002",
    promptMixed: "\u8bf7\u89e3\u65b9\u7a0b\uff0c\u5e76\u8bf4\u660e\u54ea\u4e9b\u89e3\u662f\u6709\u6548\u7684\u3002",
    difficultyOptions: {
      easy: "\u7b80\u5355\uff1a\u4e00\u6b21\u65b9\u7a0b\u3001\u7b80\u5355\u4e8c\u6b21\u65b9\u7a0b\u548c\u7edd\u5bf9\u503c\u65b9\u7a0b",
      medium: "\u4e2d\u7b49\uff1a\u516c\u5f0f\u6cd5\u3001\u6709\u7406\u65b9\u7a0b\u3001\u6839\u5f0f\u65b9\u7a0b\u3001\u6307\u6570\u548c\u5bf9\u6570\u65b9\u7a0b",
      hard: "\u56f0\u96be\uff1a\u4ee3\u6362\u6cd5\u3001\u4e09\u89d2\u65b9\u7a0b\u548c\u9650\u5236\u6761\u4ef6",
      expert: "\u4e13\u5bb6\uff1a\u6df7\u5408\u65b9\u7a0b\u548c\u5b8c\u6574\u89e3\u96c6\u63a8\u7406",
      mixed: "\u6df7\u5408\uff1a\u4ece\u6240\u6709\u96be\u5ea6\u4e2d\u5747\u8861\u51fa\u9898"
    },
    suggestion: "\u5efa\u8bae\uff1a\u5148\u4ee3\u6570\u6c42\u89e3\uff0c\u518d\u68c0\u67e5\u5206\u6bcd\u4e0d\u4e3a 0\u3001\u5bf9\u6570\u771f\u6570\u5927\u4e8e 0\u3001\u6839\u53f7\u5185\u975e\u8d1f\u548c\u9898\u76ee\u8981\u6c42\u7684\u533a\u95f4\u3002",
    notes: {
      distribute: "\u5c55\u5f00\u5e76\u5408\u5e76\u540c\u7c7b\u9879",
      isolate: "\u9694\u79bb\u542b\u672a\u77e5\u6570\u7684\u8868\u8fbe\u5f0f",
      divide: "\u4e24\u8fb9\u540c\u9664",
      factor: "\u56e0\u5f0f\u5206\u89e3",
      zeroProduct: "\u4f7f\u7528\u96f6\u4e58\u79ef\u6027\u8d28",
      formula: "\u4f7f\u7528\u4e8c\u6b21\u516c\u5f0f",
      splitAbs: "\u5206\u4e24\u79cd\u60c5\u51b5",
      exclude: "\u6392\u9664\u4f7f\u5206\u6bcd\u4e3a 0 \u7684\u503c",
      square: "\u4e24\u8fb9\u5e73\u65b9",
      check: "\u4ee3\u56de\u539f\u65b9\u7a0b\u68c0\u9a8c",
      sameBase: "\u5316\u4e3a\u76f8\u540c\u5e95\u6570",
      logDomain: "\u68c0\u67e5\u6bcf\u4e2a\u5bf9\u6570\u771f\u6570\u4e3a\u6b63",
      substitution: "\u7528\u4ee3\u6362\u964d\u4f4e\u65b9\u7a0b\u96be\u5ea6",
      trigUnit: "\u4f7f\u7528\u5355\u4f4d\u5706\u89d2\u503c",
      interval: "\u53ea\u4fdd\u7559\u6307\u5b9a\u533a\u95f4\u5185\u7684\u89e3",
      final: "\u6700\u7ec8\u89e3\u96c6"
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
    noWrongTip: "\u5f88\u597d\u3002\u53ef\u4ee5\u5c1d\u8bd5\u4e13\u5bb6\u96be\u5ea6\u3002",
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
function nonZero(min, max) {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
}
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  n /= g; d /= g;
  return { n, d };
}
function texFrac(n, d) {
  const f = frac(n, d);
  if (f.d === 1) return `${f.n}`;
  return `${f.n < 0 ? "-" : ""}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}
function signed(n) { return n < 0 ? `${n}` : `+${n}`; }
function signedTerm(n) { return n === 0 ? "" : signed(n); }
function coef(n, variable = "x") {
  if (n === 1) return variable;
  if (n === -1) return `-${variable}`;
  return `${n}${variable}`;
}
function polyTerm(n, term) {
  if (n === 0) return "";
  if (n === 1) return term;
  if (n === -1) return `-${term}`;
  return `${n}${term}`;
}
function joinTerms(terms) {
  const filtered = terms.filter(Boolean);
  if (!filtered.length) return "0";
  return filtered.join("+").replace(/\+\-/g, "-");
}
function setAns(values) {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (!sorted.length) return noSolution();
  return sorted.length === 1 ? `x=${sorted[0]}` : `x=${sorted.join(", ")}`;
}
function texSet(values) {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (!sorted.length) return noSolution();
  return `\\{${sorted.join(", ")}\\}`;
}
function noSolution() { return lang === "zh" ? "\u65e0\u89e3" : "No solution"; }
function piTex(k, denom = 1) {
  if (k === 0) return "0";
  if (denom === 1) return k === 1 ? "\\pi" : `${k}\\pi`;
  if (k === 1) return `\\frac{\\pi}{${denom}}`;
  return `\\frac{${k}\\pi}{${denom}}`;
}
function addUnique(arr, value) {
  if (value && !arr.some(item => answerKey(item) === answerKey(value))) arr.push(value);
}
function buildOptions(answer, distractors, count) {
  const options = [answer];
  shuffle(distractors).forEach(d => addUnique(options, d));
  let guard = 0;
  while (options.length < count && guard < 60) {
    guard += 1;
    addUnique(options, choice([
      noSolution(),
      "x=0",
      "x=1",
      "x=-1",
      "x=2",
      "x=-2",
      "\\{0, 1\\}",
      "\\{-1, 1\\}"
    ]));
  }
  return shuffle(options.slice(0, count));
}
function makeQuestion({ difficulty, type, promptKey, main, plain, answer, distractors, lines, builder }) {
  const count = Number(optionCountEl?.value || 4);
  return {
    difficulty,
    type,
    promptKey,
    main,
    plain: plain || main,
    answer,
    options: buildOptions(answer, distractors, count),
    lines,
    builder
  };
}
function line(lineText, noteKey) {
  return { line: lineText, note: tr().notes[noteKey] || noteKey || "" };
}

function qLinear() {
  const x = nonZero(-8, 8);
  const a = nonZero(2, 8);
  const b = randInt(-12, 12);
  const c = nonZero(2, 6);
  const d = randInt(-10, 10);
  const leftConst = a * (x + b);
  const right = c * x + d;
  const rhsConst = leftConst - c * x + d;
  const main = `${a}(x${signedTerm(b)})=${coef(c)}${signedTerm(rhsConst)}`;
  return makeQuestion({
    difficulty: "easy",
    type: "linear-multi-step",
    promptKey: "promptLinear",
    main,
    answer: `x=${x}`,
    distractors: [`x=${-x}`, `x=${x + 1}`, `x=${x - 1}`, noSolution()],
    lines: [
      line(`${coef(a)}${signedTerm(a * b)}=${coef(c)}${signedTerm(rhsConst)}`, "distribute"),
      line(`${coef(a - c)}=${rhsConst - a * b}`, "isolate"),
      line(`x=${x}`, "divide")
    ],
    builder: qLinear
  });
}
function qQuadraticFactor() {
  const r1 = nonZero(-8, 6);
  let r2 = nonZero(-6, 8);
  if (r2 === r1) r2 += 1;
  const b = -(r1 + r2);
  const c = r1 * r2;
  const main = `x^2${signedTerm(b)}x${signedTerm(c)}=0`;
  return makeQuestion({
    difficulty: "easy",
    type: "quadratic-factor",
    promptKey: "promptQuadratic",
    main,
    answer: setAns([r1, r2]),
    distractors: [setAns([-r1, -r2]), setAns([r1]), setAns([r2]), setAns([r1 + r2])],
    lines: [
      line(`(x${signedTerm(-r1)})(x${signedTerm(-r2)})=0`, "factor"),
      line(`x=${r1}\\quad \\text{or}\\quad x=${r2}`, "zeroProduct"),
      line(setAns([r1, r2]), "final")
    ],
    builder: qQuadraticFactor
  });
}
function qAbsoluteSimple() {
  const h = randInt(-7, 7);
  const k = randInt(2, 10);
  const a = choice([1, -1]);
  const b = -a * h;
  const main = `\\left|${coef(a)}${signedTerm(b)}\\right|=${k}`;
  const roots = [h + k / Math.abs(a), h - k / Math.abs(a)].filter(Number.isInteger);
  const rootA = (k - b) / a;
  const rootB = (-k - b) / a;
  return makeQuestion({
    difficulty: "easy",
    type: "absolute-value",
    promptKey: "promptAbsolute",
    main,
    answer: setAns([rootA, rootB]),
    distractors: [setAns([rootA]), setAns([rootB]), setAns(roots), noSolution()],
    lines: [
      line(`${coef(a)}${signedTerm(b)}=${k}\\quad \\text{or}\\quad ${coef(a)}${signedTerm(b)}=-${k}`, "splitAbs"),
      line(`x=${rootA}\\quad \\text{or}\\quad x=${rootB}`, "isolate"),
      line(setAns([rootA, rootB]), "final")
    ],
    builder: qAbsoluteSimple
  });
}
function qQuadraticFormula() {
  const a = choice([1, 2, 3]);
  const p = randInt(1, 5);
  const q = randInt(1, 5);
  const b = -2 * a * p;
  const c = a * (p * p - q);
  const answer = `x=${p}\\pm\\sqrt{${q}}`;
  const main = `${polyTerm(a, "x^2")}${signedTerm(b)}x${signedTerm(c)}=0`;
  return makeQuestion({
    difficulty: "medium",
    type: "quadratic-formula",
    promptKey: "promptQuadratic",
    main,
    answer,
    distractors: [`x=${-p}\\pm\\sqrt{${q}}`, `x=${p}\\pm ${q}`, `x=${p}\\pm\\sqrt{${q + 1}}`, noSolution()],
    lines: [
      line(`x=\\frac{-(${b})\\pm\\sqrt{${b}^2-4(${a})(${c})}}{2(${a})}`, "formula"),
      line(`x=${p}\\pm\\sqrt{${q}}`, "final")
    ],
    builder: qQuadraticFormula
  });
}
function qRationalLinear() {
  const bad = randInt(-5, 5);
  const sol = bad + choice([-4, -3, -2, 2, 3, 4]);
  const k = nonZero(2, 7);
  const n = k * (sol - bad);
  const main = `\\frac{${n}}{x${signedTerm(-bad)}}=${k}`;
  return makeQuestion({
    difficulty: "medium",
    type: "rational-equation",
    promptKey: "promptRational",
    main,
    answer: `x=${sol}`,
    distractors: [`x=${bad}`, `x=${sol + bad}`, `x=${sol - 1}`, noSolution()],
    lines: [
      line(`x\\ne ${bad}`, "exclude"),
      line(`${n}=${k}(x${signedTerm(-bad)})`, "isolate"),
      line(`x=${sol}`, "divide")
    ],
    builder: qRationalLinear
  });
}
function qRadicalEquation() {
  const sol = randInt(0, 10);
  const shift = randInt(-5, 5);
  const root = randInt(2, 7);
  const c = root * root - sol - shift;
  const main = `\\sqrt{x${signedTerm(shift + c)}}=${root}`;
  return makeQuestion({
    difficulty: "medium",
    type: "radical-equation",
    promptKey: "promptRadical",
    main,
    answer: `x=${sol}`,
    distractors: [`x=${root - shift - c}`, `x=${root * root}`, `x=${-sol}`, noSolution()],
    lines: [
      line(`x${signedTerm(shift + c)}=${root * root}`, "square"),
      line(`x=${sol}`, "isolate"),
      line(`${sol}${signedTerm(shift + c)}=${root * root}`, "check")
    ],
    builder: qRadicalEquation
  });
}
function qExponentialSameBase() {
  const base = choice([2, 3, 5]);
  const sol = randInt(-4, 6);
  const a = nonZero(2, 4);
  const b = randInt(-5, 5);
  const exp = a * sol + b;
  const main = `${base}^{${coef(a)}${signedTerm(b)}}=${base}^{${exp}}`;
  return makeQuestion({
    difficulty: "medium",
    type: "exponential-same-base",
    promptKey: "promptExponential",
    main,
    answer: `x=${sol}`,
    distractors: [`x=${exp}`, `x=${sol + 1}`, `x=${-sol}`, noSolution()],
    lines: [
      line(`${coef(a)}${signedTerm(b)}=${exp}`, "sameBase"),
      line(`${coef(a)}=${exp - b}`, "isolate"),
      line(`x=${sol}`, "divide")
    ],
    builder: qExponentialSameBase
  });
}
function qLogEquation() {
  const base = choice([2, 3, 5, 10]);
  const sol = randInt(2, 12);
  const c = randInt(-4, 4);
  const value = sol + c;
  const power = Math.max(1, Math.min(4, randInt(1, 3)));
  const main = `\\log_{${base}}(x${signedTerm(c)})=${power}`;
  const answer = `x=${base ** power - c}`;
  const correct = base ** power - c;
  return makeQuestion({
    difficulty: "medium",
    type: "logarithmic-equation",
    promptKey: "promptLogarithmic",
    main,
    answer,
    distractors: [`x=${power - c}`, `x=${base * power - c}`, `x=${-correct}`, noSolution()],
    lines: [
      line(`x${signedTerm(c)}>0`, "logDomain"),
      line(`x${signedTerm(c)}=${base}^{${power}}`, "isolate"),
      line(`x=${correct}`, "final")
    ],
    builder: qLogEquation
  });
}
function qQuarticSubstitution() {
  const r1 = randInt(1, 5);
  let r2 = randInt(1, 6);
  if (r2 === r1) r2 += 1;
  const b = -(r1 + r2);
  const c = r1 * r2;
  const roots = [Math.sqrt(r1), -Math.sqrt(r1), Math.sqrt(r2), -Math.sqrt(r2)].filter(Number.isInteger);
  const main = `x^4${signedTerm(b)}x^2${signedTerm(c)}=0`;
  return makeQuestion({
    difficulty: "hard",
    type: "quartic-substitution",
    promptKey: "promptPolynomial",
    main,
    answer: roots.length ? setAns(roots) : `x=\\pm\\sqrt{${r1}},\\ \\pm\\sqrt{${r2}}`,
    distractors: [setAns([r1, r2]), `x=\\pm ${r1},\\ \\pm ${r2}`, noSolution(), `x=\\pm\\sqrt{${r1 + r2}}`],
    lines: [
      line(`u=x^2\\Rightarrow u^2${signedTerm(b)}u${signedTerm(c)}=0`, "substitution"),
      line(`(u${signedTerm(-r1)})(u${signedTerm(-r2)})=0`, "factor"),
      line(`x^2=${r1}\\quad \\text{or}\\quad x^2=${r2}`, "zeroProduct"),
      line(roots.length ? setAns(roots) : `x=\\pm\\sqrt{${r1}},\\ \\pm\\sqrt{${r2}}`, "final")
    ],
    builder: qQuarticSubstitution
  });
}
function qTrigSine() {
  const templates = [
    { val: "\\frac{1}{2}", sols: [1, 5], denom: 6, eq: "2\\sin x-1=0" },
    { val: "-\\frac{1}{2}", sols: [7, 11], denom: 6, eq: "2\\sin x+1=0" },
    { val: "\\frac{\\sqrt{2}}{2}", sols: [1, 3], denom: 4, eq: "\\sqrt{2}\\sin x-1=0" },
    { val: "\\frac{\\sqrt{3}}{2}", sols: [1, 2], denom: 3, eq: "2\\sin x-\\sqrt{3}=0" }
  ];
  const t = choice(templates);
  const answer = `x=${t.sols.map(k => piTex(k, t.denom)).join(", ")}`;
  return makeQuestion({
    difficulty: "hard",
    type: "trigonometric-equation",
    promptKey: "promptTrigonometric",
    main: `${t.eq},\\quad 0\\le x<2\\pi`,
    answer,
    distractors: [
      `x=${piTex(t.sols[0], t.denom)}`,
      `x=${piTex(2, t.denom)}, ${piTex(4, t.denom)}`,
      `x=${piTex(t.sols[0], t.denom)}, ${piTex(t.sols[1] + 1, t.denom)}`,
      noSolution()
    ],
    lines: [
      line(`\\sin x=${t.val}`, "isolate"),
      line(`x=${t.sols.map(k => piTex(k, t.denom)).join(", ")}`, "trigUnit"),
      line(`0\\le x<2\\pi`, "interval")
    ],
    builder: qTrigSine
  });
}
function qLogProduct() {
  const r1 = randInt(2, 7);
  const r2 = randInt(2, 8);
  const product = r1 * r2;
  const sum = r1 + r2;
  const main = `\\log_2(x-${r1})+\\log_2(x-${r2})=\\log_2(${product})`;
  const root1 = sum;
  const root2 = 0;
  return makeQuestion({
    difficulty: "hard",
    type: "log-product-domain",
    promptKey: "promptLogarithmic",
    main,
    answer: `x=${root1}`,
    distractors: [`x=${root2}`, setAns([root1, root2]), `x=${product}`, noSolution()],
    lines: [
      line(`x>${Math.max(r1, r2)}`, "logDomain"),
      line(`(x-${r1})(x-${r2})=${product}`, "isolate"),
      line(`x^2-${sum}x=0`, "factor"),
      line(`x=0\\ \\text{or}\\ x=${root1};\\quad x=${root1}\\ \\text{is valid}`, "check")
    ],
    builder: qLogProduct
  });
}
function qRationalExcludedRoot() {
  const bad = randInt(-4, 4);
  const valid = bad + choice([2, 3, 4, -2, -3, -4]);
  const sum = bad + valid;
  const product = bad * valid;
  const main = `\\frac{x^2${signedTerm(-sum)}x${signedTerm(product)}}{x${signedTerm(-bad)}}=0`;
  return makeQuestion({
    difficulty: "hard",
    type: "rational-excluded-root",
    promptKey: "promptRational",
    main,
    answer: `x=${valid}`,
    distractors: [setAns([bad, valid]), `x=${bad}`, noSolution(), `x=${sum}`],
    lines: [
      line(`x\\ne ${bad}`, "exclude"),
      line(`(x${signedTerm(-bad)})(x${signedTerm(-valid)})=0`, "factor"),
      line(`x=${bad}\\ \\text{or}\\ x=${valid}`, "zeroProduct"),
      line(`x=${bad}\\ \\text{is invalid, so}\\ x=${valid}`, "check")
    ],
    builder: qRationalExcludedRoot
  });
}
function qRadicalExtraneous() {
  const sol = randInt(1, 8);
  const k = randInt(1, 5);
  const c = sol * sol + 2 * k * sol + k * k - sol;
  const main = `\\sqrt{x+${c}}=x+${k}`;
  return makeQuestion({
    difficulty: "expert",
    type: "radical-extraneous-check",
    promptKey: "promptRadical",
    main,
    answer: `x=${sol}`,
    distractors: [`x=${-k - sol}`, setAns([sol, -k - sol]), noSolution(), `x=${c}`],
    lines: [
      line(`x+${c}=(x+${k})^2`, "square"),
      line(`x^2+${2 * k - 1}x${signedTerm(k * k - c)}=0`, "factor"),
      line(`\\text{solve the quadratic and check each candidate}`, "check"),
      line(`x=${sol}`, "final")
    ],
    builder: qRadicalExtraneous
  });
}
function qExponentialSubstitution() {
  const u1 = choice([2, 3, 4]);
  let u2 = choice([2, 3, 4, 5]);
  if (u2 === u1) u2 += 1;
  const b = -(u1 + u2);
  const c = u1 * u2;
  const valid = [u1, u2].filter(u => Math.log2(u) % 1 === 0).map(u => Math.log2(u));
  const main = `4^x${signedTerm(b)}2^x${signedTerm(c)}=0`;
  const answer = valid.length ? setAns(valid) : noSolution();
  return makeQuestion({
    difficulty: "expert",
    type: "exponential-substitution",
    promptKey: "promptExponential",
    main,
    answer,
    distractors: [setAns([u1, u2]), `x=${u1 + u2}`, `x=${Math.round(Math.log2(u1 + u2))}`, noSolution()].filter(d => d !== answer),
    lines: [
      line(`u=2^x\\Rightarrow u^2${signedTerm(b)}u${signedTerm(c)}=0`, "substitution"),
      line(`(u-${u1})(u-${u2})=0`, "factor"),
      line(`2^x=${u1}\\quad \\text{or}\\quad 2^x=${u2}`, "sameBase"),
      line(answer, "final")
    ],
    builder: qExponentialSubstitution
  });
}
function qTrigIdentity() {
  const main = `2\\cos^2 x-1=0,\\quad 0\\le x<2\\pi`;
  const answer = `x=${piTex(1, 4)}, ${piTex(3, 4)}, ${piTex(5, 4)}, ${piTex(7, 4)}`;
  return makeQuestion({
    difficulty: "expert",
    type: "trig-identity",
    promptKey: "promptTrigonometric",
    main,
    answer,
    distractors: [
      `x=${piTex(1, 4)}, ${piTex(7, 4)}`,
      `x=${piTex(1, 4)}, ${piTex(3, 4)}`,
      `x=${piTex(1, 2)}, ${piTex(3, 2)}`,
      noSolution()
    ],
    lines: [
      line(`\\cos^2 x=\\frac{1}{2}`, "isolate"),
      line(`\\cos x=\\pm\\frac{\\sqrt{2}}{2}`, "trigUnit"),
      line(answer, "interval")
    ],
    builder: qTrigIdentity
  });
}
function qAbsoluteQuadratic() {
  const r = randInt(1, 5);
  const k = randInt(2, 8);
  const main = `\\left|x^2-${r * r}\\right|=${k}`;
  const plus = r * r + k;
  const minus = r * r - k;
  const roots = [];
  if (Math.sqrt(plus) % 1 === 0) roots.push(Math.sqrt(plus), -Math.sqrt(plus));
  if (minus >= 0 && Math.sqrt(minus) % 1 === 0) roots.push(Math.sqrt(minus), -Math.sqrt(minus));
  const answer = roots.length ? setAns(roots) : `x=\\pm\\sqrt{${plus}}${minus > 0 ? `,\\ \\pm\\sqrt{${minus}}` : ""}`;
  return makeQuestion({
    difficulty: "expert",
    type: "absolute-quadratic",
    promptKey: "promptMixed",
    main,
    answer,
    distractors: [`x=\\pm ${r}`, `x=\\pm\\sqrt{${plus}}`, noSolution(), setAns([r, -r])],
    lines: [
      line(`x^2-${r * r}=${k}\\quad \\text{or}\\quad x^2-${r * r}=-${k}`, "splitAbs"),
      line(`x^2=${plus}${minus >= 0 ? `\\quad \\text{or}\\quad x^2=${minus}` : ""}`, "isolate"),
      line(answer, "final")
    ],
    builder: qAbsoluteQuadratic
  });
}

const BUILDERS = {
  easy: [qLinear, qQuadraticFactor, qAbsoluteSimple],
  medium: [qQuadraticFormula, qRationalLinear, qRadicalEquation, qExponentialSameBase, qLogEquation],
  hard: [qQuarticSubstitution, qTrigSine, qLogProduct, qRationalExcludedRoot],
  expert: [qRadicalExtraneous, qExponentialSubstitution, qTrigIdentity, qAbsoluteQuadratic]
};

function buildersForDifficulty(difficulty) {
  if (difficulty === "mixed") return [...BUILDERS.easy, ...BUILDERS.medium, ...BUILDERS.hard, ...BUILDERS.expert];
  return BUILDERS[difficulty] || BUILDERS.medium;
}
function generateQuestion(builders, difficulty) {
  let q = null;
  let signature = "";
  for (let attempt = 0; attempt < 40; attempt++) {
    const builder = choice(builders);
    q = builder();
    q.difficulty = difficulty === "mixed" ? q.difficulty : difficulty;
    signature = `${q.type}|${q.main}|${q.answer}`;
    if (signature !== lastQuestionSignature) break;
  }
  lastQuestionSignature = signature;
  return q;
}
function buildQuiz(forcedBuilders = null) {
  const count = Math.max(1, Math.min(100, Number(questionCountEl.value) || 10));
  lastDifficulty = difficultyEl.value || "medium";
  const builders = forcedBuilders || buildersForDifficulty(lastDifficulty);
  quiz = Array.from({ length: count }, () => generateQuestion(builders, lastDifficulty));
  currentIndex = 0;
  correctCount = 0;
  wrongAnswers = [];
  answered = false;
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
function answerKey(value) {
  return String(value).replace(/\s+/g, "").replace(/\\left|\\right/g, "").toLowerCase();
}
function isSameAnswer(a, b) { return answerKey(a) === answerKey(b); }
function answerToString(option) { return String(option); }
function isTextOnly(value) {
  return value === noSolution() || /^[A-Za-z\u4e00-\u9fff ,.;:!?-]+$/.test(String(value));
}
function isLongOption(value) {
  const text = String(value);
  return text.length > 34 || text.includes("\\text") || text.includes(",");
}
function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function renderLatex(el, latex, displayMode = false) {
  el.textContent = "";
  el.classList.add("math-render");
  try {
    katex.render(latex, el, { throwOnError: false, displayMode });
  } catch {
    el.textContent = latex;
  }
}
function renderOptionContent(btn, option) {
  btn.textContent = "";
  btn.classList.toggle("text-option", isTextOnly(option));
  btn.classList.toggle("long-text-option", isLongOption(option));
  if (isTextOnly(option)) {
    btn.textContent = option;
    return;
  }
  renderLatex(btn, option, false);
}
function mathSpan(latex, className = "") {
  return `<span class="math-render ${className}" data-latex="${htmlEscape(latex)}">${htmlEscape(latex)}</span>`;
}
function renderTaggedMath(root) {
  root.querySelectorAll("[data-latex]").forEach(el => renderLatex(el, el.dataset.latex, false));
}

function applyStaticText() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
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
  restartBtn.textContent = tr().restartBtn;
  reviewWrongBtn.textContent = tr().reviewWrongBtn;
  $("scoreLabel").textContent = tr().scoreLabel;
  $("accuracyLabel").textContent = tr().accuracyLabel;
  $("wrongLabel").textContent = tr().wrongLabel;
  $("resultTitle").textContent = tr().resultTitle;
  $("wrongReviewTitle").textContent = tr().wrongReviewTitle;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const value = tr()[el.dataset.i18n];
    if (typeof value === "string") el.textContent = value;
  });
  noteBox.textContent = tr().note;
}
function populateControls() {
  difficultyEl.innerHTML = DIFFICULTIES.map(key => `<option value="${key}">${tr().difficultyOptions[key]}</option>`).join("");
  difficultyEl.value = "medium";
  optionCountEl.innerHTML = OPTION_COUNTS.map(n => `<option value="${n}">${tr().optionCount(n)}</option>`).join("");
  optionCountEl.value = "4";
  timerLevelEl.innerHTML = Object.entries(tr().timerOptions).map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
  timerLevelEl.value = "timer_medium";
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
    gameId: "advanced-equation-solving",
    question: q,
    course: "precalculus",
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
    gameId: "advanced-equation-solving",
    question: q,
    course: "precalculus",
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
  const total = quiz.length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  scoreNum.textContent = `${correctCount}/${total}`;
  accuracyNum.textContent = `${accuracy}%`;
  wrongNum.textContent = `${wrongAnswers.length}`;
  wrongList.innerHTML = "";
  if (!wrongAnswers.length) {
    wrongList.innerHTML = `<div class="wrong-item"><div class="expr">${tr().noWrong}</div><p class="tag-good">${tr().noWrongTip}</p></div>`;
    return;
  }
  wrongAnswers.forEach(item => {
    const div = document.createElement("div");
    div.className = "wrong-item";
    div.innerHTML = `<div class="expr">${mathSpan(item.main, "wrong-math")}</div><p><strong>${tr().yourAnswer}:</strong> ${htmlEscape(item.timeUp ? tr().timeUpAnswer : item.selected)}</p><p><strong>${tr().correctAnswer}:</strong> ${mathSpan(item.answer, "wrong-math")}</p>`;
    wrongList.appendChild(div);
  });
  renderTaggedMath(wrongList);
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
  if (!timedModeEl.checked) return;
  timerDisplay.textContent = tr().timerDisplay(Math.max(0, timeLeft));
  timerDisplay.classList.toggle("timer-danger", timeLeft <= 10);
}
function clearTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}
function showSample() {
  const q = generateQuestion(buildersForDifficulty(difficultyEl.value || "medium"), difficultyEl.value || "medium");
  sampleBox.classList.remove("hidden");
  sampleBox.innerHTML = `<h3>${tr().sampleTitle}</h3><p><strong>${tr().sampleQuestion}:</strong></p><div class="sample-math">${mathSpan(q.main, "sample-math")}</div><p><strong>${tr().sampleAnswer}:</strong> ${mathSpan(q.answer, "sample-math")}</p><p><strong>${tr().sampleOptions}:</strong> ${q.options.map(item => isTextOnly(item) ? htmlEscape(item) : mathSpan(item, "sample-math")).join(" &nbsp; ")}</p>`;
  renderTaggedMath(sampleBox);
}
function quitRound() { showResult(); }
function restart() {
  clearTimer();
  resultCard.classList.add("hidden");
  quizCard.classList.add("hidden");
  setupCard.classList.remove("hidden");
}

applyStaticText();
populateControls();
startBtn.addEventListener("click", () => buildQuiz());
sampleBtn.addEventListener("click", showSample);
quitBtn.addEventListener("click", quitRound);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restart);
reviewWrongBtn.addEventListener("click", buildWrongTypeQuiz);

window.MCLAdvancedEquationSolving = { buildersForDifficulty, generateQuestion, BUILDERS };
