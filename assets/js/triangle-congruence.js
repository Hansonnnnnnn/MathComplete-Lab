(function () {
  const GAME_ID = "triangle-congruence";
  const COURSE = "geometry-1";
  const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];
  const THEOREMS = ["SSS", "SAS", "ASA", "AAS", "HL"];
  const TIMER_SECONDS = { relaxed: 180, standard: 120, challenge: 75 };
  const $ = id => document.getElementById(id);

  let lang = readLang();
  let quiz = [];
  let current = 0;
  let correct = 0;
  let wrong = [];
  let selectedTheorem = "";
  let answered = false;
  let roundStart = 0;
  let questionStart = 0;
  let timerId = null;
  let timeLeft = 0;

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
    diagram: $("diagram"),
    givenList: $("givenList"),
    targetBox: $("targetBox"),
    theoremGrid: $("theoremGrid"),
    proofTableBody: $("proofTableBody"),
    feedback: $("feedback"),
    solutionBox: $("solutionBox"),
    submitBtn: $("submitBtn"),
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
      badge: "Geometry I",
      title: "Triangle Congruence Proofs",
      subtitle: "Practice proving triangle congruence with exact diagrams, valid randomized givens, and step-by-step proof tables.",
      setupTitle: "Build a Proof Practice Round",
      difficultyLabel: "Difficulty",
      questionCountLabel: "Number of Proofs",
      timedModeText: "Enable Timed Mode",
      timedModeHint: "Timed mode gives each proof its own countdown.",
      timerLevelLabel: "Timer Level",
      startBtn: "Start",
      sampleBtn: "Generate Sample Proof",
      note: "Each diagram is generated from a verified proof template. Complete the theorem and proof table before submitting.",
      prompt: "Use the diagram and givens to prove the target statement.",
      givens: "Givens",
      target: "Prove",
      theoremTitle: "Congruence Theorem",
      proofTitle: "Proof Table",
      statement: "Statement",
      reason: "Reason",
      chooseTheorem: "Choose theorem",
      chooseStatement: "Choose statement",
      chooseReason: "Choose reason",
      submitBtn: "Check Proof",
      nextBtn: "Next Proof",
      resultBtn: "See Results",
      quitBtn: "End This Round",
      correct: "Correct proof.",
      incorrect: "This proof still needs work.",
      timeUp: "Time is up.",
      missingTheorem: "Choose a congruence theorem before submitting.",
      solutionTitle: "Verified Proof",
      resultTitle: "Practice Results",
      scoreLabel: "Correct Proofs",
      accuracyLabel: "Accuracy",
      wrongLabel: "Proofs to Review",
      wrongReviewTitle: "Proof Review",
      restartBtn: "Practice Again",
      reviewWrongBtn: "Practice Similar Types",
      noWrong: "No proof errors this round.",
      noWrongTip: "Try a harder level next.",
      yourAnswer: "Your theorem",
      correctAnswer: "Correct theorem",
      sampleTitle: "Sample Proof",
      progress: (a, b) => `Proof ${a} / ${b}`,
      timerDisplay: s => `Time left: ${formatTime(s)}`,
      timerOptions: {
        relaxed: "Relaxed: 3 minutes per proof",
        standard: "Standard: 2 minutes per proof",
        challenge: "Challenge: 75 seconds per proof"
      },
      difficulties: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        mixed: "Mixed"
      },
      difficultyOptions: {
        easy: "Easy: direct SSS, SAS, ASA proofs",
        medium: "Medium: shared sides, vertical angles, and parallel-line angle facts",
        hard: "Hard: HL and two-step derived givens",
        mixed: "Mixed: balanced proof practice"
      },
      reasons: {
        given: "Given",
        reflexive: "Reflexive Property",
        vertical: "Vertical Angles Theorem",
        parallel: "Parallel lines imply congruent alternate interior angles",
        midpoint: "Definition of midpoint",
        perpendicular: "Perpendicular lines form right angles",
        rightTriangles: "Both triangles are right triangles",
        sss: "SSS Congruence",
        sas: "SAS Congruence",
        asa: "ASA Congruence",
        aas: "AAS Congruence",
        hl: "HL Congruence"
      }
    },
    zh: {
      htmlLang: "zh-CN",
      navPractice: "\u7ec3\u4e60\u5e93",
      navHome: "\u4e3b\u9875",
      badge: "\u51e0\u4f55 I",
      title: "\u4e09\u89d2\u5f62\u5168\u7b49\u8bc1\u660e",
      subtitle: "\u7528\u7cbe\u786e\u51e0\u4f55\u56fe\u3001\u53ef\u9a8c\u8bc1\u7684\u968f\u673a\u5df2\u77e5\u6761\u4ef6\u548c\u9010\u6b65\u8bc1\u660e\u8868\u7ec3\u4e60\u4e09\u89d2\u5f62\u5168\u7b49\u3002",
      setupTitle: "\u5f00\u59cb\u8bc1\u660e\u7ec3\u4e60",
      difficultyLabel: "\u96be\u5ea6",
      questionCountLabel: "\u8bc1\u660e\u9898\u6570\u91cf",
      timedModeText: "\u5f00\u542f\u8ba1\u65f6\u6a21\u5f0f",
      timedModeHint: "\u8ba1\u65f6\u6a21\u5f0f\u4f1a\u7ed9\u6bcf\u9053\u8bc1\u660e\u9898\u5355\u72ec\u5012\u8ba1\u65f6\u3002",
      timerLevelLabel: "\u8ba1\u65f6\u7b49\u7ea7",
      startBtn: "\u5f00\u59cb",
      sampleBtn: "\u751f\u6210\u4e00\u9053\u6837\u9898",
      note: "\u6bcf\u5f20\u56fe\u90fd\u6765\u81ea\u5df2\u9a8c\u8bc1\u7684\u8bc1\u660e\u6a21\u677f\u3002\u5148\u9009\u62e9\u5168\u7b49\u5224\u5b9a\uff0c\u518d\u8865\u5168\u8bc1\u660e\u8868\u3002",
      prompt: "\u6839\u636e\u56fe\u5f62\u548c\u5df2\u77e5\u6761\u4ef6\uff0c\u8bc1\u660e\u76ee\u6807\u7ed3\u8bba\u3002",
      givens: "\u5df2\u77e5",
      target: "\u6c42\u8bc1",
      theoremTitle: "\u5168\u7b49\u5224\u5b9a",
      proofTitle: "\u8bc1\u660e\u8868",
      statement: "\u7ed3\u8bba",
      reason: "\u7406\u7531",
      chooseTheorem: "\u9009\u62e9\u5b9a\u7406",
      chooseStatement: "\u9009\u62e9\u7ed3\u8bba",
      chooseReason: "\u9009\u62e9\u7406\u7531",
      submitBtn: "\u68c0\u67e5\u8bc1\u660e",
      nextBtn: "\u4e0b\u4e00\u9898",
      resultBtn: "\u67e5\u770b\u7ed3\u679c",
      quitBtn: "\u7ed3\u675f\u672c\u8f6e",
      correct: "\u8bc1\u660e\u6b63\u786e\u3002",
      incorrect: "\u8fd9\u4e2a\u8bc1\u660e\u8fd8\u9700\u8981\u4fee\u6b63\u3002",
      timeUp: "\u65f6\u95f4\u5230\u3002",
      missingTheorem: "\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u5168\u7b49\u5224\u5b9a\u3002",
      solutionTitle: "\u6807\u51c6\u8bc1\u660e",
      resultTitle: "\u7ec3\u4e60\u7ed3\u679c",
      scoreLabel: "\u6b63\u786e\u8bc1\u660e\u6570",
      accuracyLabel: "\u6b63\u786e\u7387",
      wrongLabel: "\u9700\u8981\u590d\u4e60",
      wrongReviewTitle: "\u8bc1\u660e\u590d\u76d8",
      restartBtn: "\u518d\u7ec3\u4e00\u8f6e",
      reviewWrongBtn: "\u7ec3\u4e60\u540c\u7c7b\u9898",
      noWrong: "\u672c\u8f6e\u6ca1\u6709\u8bc1\u660e\u9519\u8bef\u3002",
      noWrongTip: "\u53ef\u4ee5\u5c1d\u8bd5\u66f4\u9ad8\u96be\u5ea6\u3002",
      yourAnswer: "\u4f60\u9009\u7684\u5b9a\u7406",
      correctAnswer: "\u6b63\u786e\u5b9a\u7406",
      sampleTitle: "\u6837\u9898",
      progress: (a, b) => `\u7b2c ${a} / ${b} \u9898`,
      timerDisplay: s => `\u5269\u4f59\u65f6\u95f4\uff1a${formatTime(s)}`,
      timerOptions: {
        relaxed: "\u5bbd\u677e\uff1a\u6bcf\u9898 3 \u5206\u949f",
        standard: "\u6807\u51c6\uff1a\u6bcf\u9898 2 \u5206\u949f",
        challenge: "\u6311\u6218\uff1a\u6bcf\u9898 75 \u79d2"
      },
      difficulties: {
        easy: "\u7b80\u5355",
        medium: "\u4e2d\u7b49",
        hard: "\u56f0\u96be",
        mixed: "\u6df7\u5408"
      },
      difficultyOptions: {
        easy: "\u7b80\u5355\uff1a\u76f4\u63a5\u7684 SSS\u3001SAS\u3001ASA \u8bc1\u660e",
        medium: "\u4e2d\u7b49\uff1a\u5171\u8fb9\u3001\u5bf9\u9876\u89d2\u548c\u5e73\u884c\u7ebf\u89d2\u5173\u7cfb",
        hard: "\u56f0\u96be\uff1aHL \u548c\u9700\u8981\u5148\u63a8\u51fa\u5c0f\u7ed3\u8bba\u7684\u9898",
        mixed: "\u6df7\u5408\uff1a\u7efc\u5408\u8bc1\u660e\u7ec3\u4e60"
      },
      reasons: {
        given: "\u5df2\u77e5",
        reflexive: "\u53cd\u8eab\u6027",
        vertical: "\u5bf9\u9876\u89d2\u76f8\u7b49",
        parallel: "\u5e73\u884c\u7ebf\u5185\u9519\u89d2\u76f8\u7b49",
        midpoint: "\u4e2d\u70b9\u5b9a\u4e49",
        perpendicular: "\u5782\u7ebf\u5f62\u6210\u76f4\u89d2",
        rightTriangles: "\u4e24\u4e2a\u4e09\u89d2\u5f62\u90fd\u662f\u76f4\u89d2\u4e09\u89d2\u5f62",
        sss: "SSS \u5168\u7b49",
        sas: "SAS \u5168\u7b49",
        asa: "ASA \u5168\u7b49",
        aas: "AAS \u5168\u7b49",
        hl: "HL \u5168\u7b49"
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

  function formatTime(s) {
    const safe = Math.max(0, Math.round(Number(s) || 0));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
  }

  function seg(a, b) {
    return `${a}${b}`;
  }

  function tri(a, b, c) {
    return `\u25b3${a}${b}${c}`;
  }

  function angle(a, b, c) {
    return `\u2220${a}${b}${c}`;
  }

  function congruent(a, b) {
    return `${a} \u2245 ${b}`;
  }

  function parallel(a, b) {
    return `${a} \u2225 ${b}`;
  }

  function perpendicular(a, b) {
    return `${a} \u22a5 ${b}`;
  }

  function midpointText(point, segment) {
    return lang === "zh" ? `${point} \u662f ${segment} \u7684\u4e2d\u70b9` : `${point} is the midpoint of ${segment}`;
  }

  function rightAnglesText(first, second) {
    return lang === "zh" ? `${first} \u548c ${second} \u662f\u76f4\u89d2` : `${first} and ${second} are right angles`;
  }

  function rightTrianglesText(first, second) {
    return lang === "zh" ? `${first} \u548c ${second} \u90fd\u662f\u76f4\u89d2\u4e09\u89d2\u5f62` : `${first} and ${second} are right triangles`;
  }

  function statement(id, text) {
    return { id, text };
  }

  function step(id, text, reason) {
    return { id, text, reason };
  }

  function baseStatements(q) {
    const statements = q.steps.map(s => statement(s.id, s.text));
    const extras = q.extraStatements || [];
    return shuffle([...statements, ...extras]);
  }

  function reasonOptions(q) {
    const ids = new Set(q.steps.map(s => s.reason));
    ["given", "reflexive", "vertical", "parallel", "midpoint", "perpendicular", "rightTriangles", "sss", "sas", "asa", "aas", "hl"].forEach(id => ids.add(id));
    return Array.from(ids).map(id => ({ id, text: tr().reasons[id] || id }));
  }

  function transform(points) {
    const scale = 0.92 + Math.random() * 0.12;
    const dx = randInt(-10, 10);
    const dy = randInt(-10, 10);
    return Object.fromEntries(Object.entries(points).map(([k, p]) => [k, { x: Math.round(p.x * scale + dx), y: Math.round(p.y * scale + dy) }]));
  }

  function directTriangle(theorem) {
    const names = choice([
      ["A", "B", "C", "D", "E", "F"],
      ["P", "Q", "R", "X", "Y", "Z"],
      ["J", "K", "L", "M", "N", "O"]
    ]);
    const [a, b, c, d, e, f] = names;
    const points = transform({
      [a]: { x: 95, y: 250 },
      [b]: { x: 190, y: 95 },
      [c]: { x: 310, y: 270 },
      [d]: { x: 440, y: 250 },
      [e]: { x: 535, y: 95 },
      [f]: { x: 655, y: 270 }
    });
    const t1 = tri(a, b, c);
    const t2 = tri(d, e, f);
    const target = congruent(t1, t2);
    const base = {
      difficulty: "easy",
      type: `direct-${theorem.toLowerCase()}`,
      theorem,
      points,
      triangles: [[a, b, c], [d, e, f]],
      lines: [[a, b], [b, c], [c, a], [d, e], [e, f], [f, d]],
      labels: Object.keys(points),
      target,
      marks: [],
      extraStatements: [
        statement("x1", congruent(seg(a, c), seg(d, e))),
        statement("x2", congruent(angle(a, c, b), angle(d, e, f))),
        statement("x3", congruent(tri(a, c, b), tri(d, e, f)))
      ]
    };

    if (theorem === "SSS") {
      base.givens = [congruent(seg(a, b), seg(d, e)), congruent(seg(b, c), seg(e, f)), congruent(seg(a, c), seg(d, f))];
      base.steps = [
        step("s1", base.givens[0], "given"),
        step("s2", base.givens[1], "given"),
        step("s3", base.givens[2], "given"),
        step("s4", target, "sss")
      ];
      base.marks = [
        { type: "side", pair: [a, b], group: 1 }, { type: "side", pair: [d, e], group: 1 },
        { type: "side", pair: [b, c], group: 2 }, { type: "side", pair: [e, f], group: 2 },
        { type: "side", pair: [a, c], group: 3 }, { type: "side", pair: [d, f], group: 3 }
      ];
    } else if (theorem === "SAS") {
      base.givens = [congruent(seg(a, b), seg(d, e)), congruent(angle(b, a, c), angle(e, d, f)), congruent(seg(a, c), seg(d, f))];
      base.steps = [
        step("s1", base.givens[0], "given"),
        step("s2", base.givens[1], "given"),
        step("s3", base.givens[2], "given"),
        step("s4", target, "sas")
      ];
      base.marks = [
        { type: "side", pair: [a, b], group: 1 }, { type: "side", pair: [d, e], group: 1 },
        { type: "side", pair: [a, c], group: 2 }, { type: "side", pair: [d, f], group: 2 },
        { type: "angle", triple: [b, a, c], group: 1 }, { type: "angle", triple: [e, d, f], group: 1 }
      ];
    } else if (theorem === "ASA") {
      base.givens = [congruent(angle(a, b, c), angle(d, e, f)), congruent(seg(b, c), seg(e, f)), congruent(angle(b, c, a), angle(e, f, d))];
      base.steps = [
        step("s1", base.givens[0], "given"),
        step("s2", base.givens[1], "given"),
        step("s3", base.givens[2], "given"),
        step("s4", target, "asa")
      ];
      base.marks = [
        { type: "angle", triple: [a, b, c], group: 1 }, { type: "angle", triple: [d, e, f], group: 1 },
        { type: "side", pair: [b, c], group: 1 }, { type: "side", pair: [e, f], group: 1 },
        { type: "angle", triple: [b, c, a], group: 2 }, { type: "angle", triple: [e, f, d], group: 2 }
      ];
    } else {
      base.givens = [congruent(angle(b, a, c), angle(e, d, f)), congruent(angle(a, b, c), angle(d, e, f)), congruent(seg(b, c), seg(e, f))];
      base.steps = [
        step("s1", base.givens[0], "given"),
        step("s2", base.givens[1], "given"),
        step("s3", base.givens[2], "given"),
        step("s4", target, "aas")
      ];
      base.marks = [
        { type: "angle", triple: [b, a, c], group: 1 }, { type: "angle", triple: [e, d, f], group: 1 },
        { type: "angle", triple: [a, b, c], group: 2 }, { type: "angle", triple: [d, e, f], group: 2 },
        { type: "side", pair: [b, c], group: 1 }, { type: "side", pair: [e, f], group: 1 }
      ];
    }
    return verifyQuestion(base);
  }

  function sharedSide() {
    const names = choice([["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"]]);
    const [a, b, c, d] = names;
    const points = transform({
      [a]: { x: 145, y: 185 },
      [b]: { x: 355, y: 85 },
      [c]: { x: 565, y: 185 },
      [d]: { x: 355, y: 315 }
    });
    const target = congruent(tri(a, b, d), tri(c, b, d));
    return verifyQuestion({
      difficulty: "medium",
      type: "shared-side-sss",
      theorem: "SSS",
      points,
      triangles: [[a, b, d], [c, b, d]],
      lines: [[a, b], [b, c], [c, d], [d, a], [b, d]],
      labels: Object.keys(points),
      givens: [congruent(seg(a, b), seg(c, b)), congruent(seg(a, d), seg(c, d))],
      target,
      steps: [
        step("s1", congruent(seg(a, b), seg(c, b)), "given"),
        step("s2", congruent(seg(a, d), seg(c, d)), "given"),
        step("s3", congruent(seg(b, d), seg(b, d)), "reflexive"),
        step("s4", target, "sss")
      ],
      marks: [
        { type: "side", pair: [a, b], group: 1 }, { type: "side", pair: [c, b], group: 1 },
        { type: "side", pair: [a, d], group: 2 }, { type: "side", pair: [c, d], group: 2 },
        { type: "side", pair: [b, d], group: 3 }
      ],
      extraStatements: [
        statement("x1", congruent(angle(a, b, d), angle(c, d, b))),
        statement("x2", congruent(seg(a, c), seg(b, d))),
        statement("x3", congruent(tri(a, d, b), tri(c, b, d)))
      ]
    });
  }

  function verticalAngles() {
    const names = choice([["A", "B", "C", "D", "E"], ["P", "Q", "R", "S", "T"], ["J", "K", "L", "M", "N"]]);
    const [a, b, c, d, x] = names;
    const points = transform({
      [a]: { x: 110, y: 95 },
      [b]: { x: 120, y: 300 },
      [x]: { x: 350, y: 195 },
      [c]: { x: 590, y: 300 },
      [d]: { x: 600, y: 95 }
    });
    const target = congruent(tri(a, x, b), tri(c, x, d));
    return verifyQuestion({
      difficulty: "medium",
      type: "vertical-sas",
      theorem: "SAS",
      points,
      triangles: [[a, x, b], [c, x, d]],
      lines: [[a, x], [x, c], [b, x], [x, d], [a, b], [c, d]],
      labels: Object.keys(points),
      givens: [congruent(seg(a, x), seg(c, x)), congruent(seg(b, x), seg(d, x))],
      target,
      steps: [
        step("s1", congruent(seg(a, x), seg(c, x)), "given"),
        step("s2", congruent(angle(a, x, b), angle(c, x, d)), "vertical"),
        step("s3", congruent(seg(b, x), seg(d, x)), "given"),
        step("s4", target, "sas")
      ],
      marks: [
        { type: "side", pair: [a, x], group: 1 }, { type: "side", pair: [c, x], group: 1 },
        { type: "side", pair: [b, x], group: 2 }, { type: "side", pair: [d, x], group: 2 },
        { type: "angle", triple: [a, x, b], group: 1 }, { type: "angle", triple: [c, x, d], group: 1 }
      ],
      extraStatements: [
        statement("x1", congruent(angle(a, b, x), angle(c, d, x))),
        statement("x2", congruent(seg(a, b), seg(c, d))),
        statement("x3", parallel(seg(a, b), seg(c, d)))
      ]
    });
  }

  function parallelAsa() {
    const names = choice([["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"]]);
    const [a, b, c, d] = names;
    const points = transform({
      [a]: { x: 135, y: 120 },
      [b]: { x: 555, y: 120 },
      [c]: { x: 190, y: 290 },
      [d]: { x: 610, y: 290 }
    });
    const target = congruent(tri(a, b, c), tri(d, c, b));
    return verifyQuestion({
      difficulty: "medium",
      type: "parallel-asa",
      theorem: "ASA",
      points,
      triangles: [[a, b, c], [d, c, b]],
      lines: [[a, b], [c, d], [a, c], [b, d], [b, c]],
      labels: Object.keys(points),
      givens: [parallel(seg(a, b), seg(c, d)), parallel(seg(a, c), seg(d, b))],
      target,
      steps: [
        step("s1", parallel(seg(a, b), seg(c, d)), "given"),
        step("s2", congruent(angle(a, b, c), angle(d, c, b)), "parallel"),
        step("s3", parallel(seg(a, c), seg(d, b)), "given"),
        step("s4", congruent(angle(a, c, b), angle(d, b, c)), "parallel"),
        step("s5", congruent(seg(b, c), seg(c, b)), "reflexive"),
        step("s6", target, "asa")
      ],
      marks: [
        { type: "parallel", pair: [a, b], group: 1 }, { type: "parallel", pair: [c, d], group: 1 },
        { type: "parallel", pair: [a, c], group: 2 }, { type: "parallel", pair: [d, b], group: 2 },
        { type: "side", pair: [b, c], group: 2 },
        { type: "angle", triple: [a, b, c], group: 1 }, { type: "angle", triple: [d, c, b], group: 1 },
        { type: "angle", triple: [a, c, b], group: 2 }, { type: "angle", triple: [d, b, c], group: 2 }
      ],
      extraStatements: [
        statement("x1", congruent(seg(a, c), seg(d, b))),
        statement("x2", perpendicular(seg(a, b), seg(b, d))),
        statement("x3", congruent(tri(a, c, b), tri(d, c, b)))
      ]
    });
  }

  function rightTriangleHl() {
    const names = choice([["A", "B", "C", "D"], ["P", "Q", "R", "S"], ["J", "K", "L", "M"]]);
    const [a, b, c, d] = names;
    const points = transform({
      [a]: { x: 130, y: 300 },
      [b]: { x: 350, y: 300 },
      [c]: { x: 570, y: 300 },
      [d]: { x: 350, y: 85 }
    });
    const target = congruent(tri(a, b, d), tri(c, b, d));
    return verifyQuestion({
      difficulty: "hard",
      type: "right-triangle-hl",
      theorem: "HL",
      points,
      triangles: [[a, b, d], [c, b, d]],
      lines: [[a, b], [b, c], [b, d], [a, d], [c, d]],
      labels: Object.keys(points),
      givens: [perpendicular(seg(a, c), seg(b, d)), congruent(seg(a, d), seg(c, d))],
      target,
      steps: [
        step("s1", perpendicular(seg(a, c), seg(b, d)), "given"),
        step("s2", rightAnglesText(angle(a, b, d), angle(c, b, d)), "perpendicular"),
        step("s3", rightTrianglesText(tri(a, b, d), tri(c, b, d)), "rightTriangles"),
        step("s4", congruent(seg(a, d), seg(c, d)), "given"),
        step("s5", congruent(seg(b, d), seg(b, d)), "reflexive"),
        step("s6", target, "hl")
      ],
      marks: [
        { type: "right", triple: [a, b, d], group: 1 }, { type: "right", triple: [c, b, d], group: 1 },
        { type: "side", pair: [a, d], group: 1 }, { type: "side", pair: [c, d], group: 1 },
        { type: "side", pair: [b, d], group: 2 }
      ],
      extraStatements: [
        statement("x1", congruent(seg(a, b), seg(c, b))),
        statement("x2", parallel(seg(a, d), seg(c, d))),
        statement("x3", congruent(angle(a, d, b), angle(c, d, b)))
      ]
    });
  }

  function midpointSas() {
    const names = choice([["A", "B", "C", "D", "M"], ["P", "Q", "R", "S", "T"], ["J", "K", "L", "N", "M"]]);
    const [a, b, c, d, m] = names;
    const points = transform({
      [a]: { x: 115, y: 105 },
      [b]: { x: 590, y: 105 },
      [c]: { x: 350, y: 205 },
      [d]: { x: 350, y: 330 },
      [m]: { x: 350, y: 105 }
    });
    const target = congruent(tri(a, m, c), tri(b, m, c));
    return verifyQuestion({
      difficulty: "hard",
      type: "midpoint-sas",
      theorem: "SAS",
      points,
      triangles: [[a, m, c], [b, m, c]],
      lines: [[a, b], [c, d], [a, c], [b, c], [m, c]],
      helperLines: [[c, d]],
      labels: Object.keys(points),
      givens: [midpointText(m, seg(a, b)), perpendicular(seg(a, b), seg(c, d))],
      target,
      steps: [
        step("s1", congruent(seg(a, m), seg(b, m)), "midpoint"),
        step("s2", perpendicular(seg(a, b), seg(c, d)), "given"),
        step("s3", congruent(angle(a, m, c), angle(b, m, c)), "perpendicular"),
        step("s4", congruent(seg(m, c), seg(m, c)), "reflexive"),
        step("s5", target, "sas")
      ],
      marks: [
        { type: "side", pair: [a, m], group: 1 }, { type: "side", pair: [b, m], group: 1 },
        { type: "right", triple: [a, m, c], group: 1 }, { type: "right", triple: [b, m, c], group: 1 },
        { type: "side", pair: [m, c], group: 2 }
      ],
      extraStatements: [
        statement("x1", congruent(seg(a, c), seg(b, c))),
        statement("x2", parallel(seg(a, c), seg(b, c))),
        statement("x3", congruent(angle(a, c, m), angle(b, c, m)))
      ]
    });
  }

  function verifyQuestion(q) {
    if (!q || !THEOREMS.includes(q.theorem)) throw new Error("Invalid theorem");
    if (!q.steps?.length || q.steps[q.steps.length - 1].text !== q.target) throw new Error("Missing target proof step");
    const finalStep = q.steps[q.steps.length - 1];
    const finalReason = finalStep.reason.toUpperCase();
    if (finalReason !== q.theorem) throw new Error("Theorem does not match proof");
    q.statementOptions = baseStatements(q);
    q.reasonOptions = reasonOptions(q);
    q.questionKey = `${q.type}|${q.target}|${q.givens.join("|")}`;
    return q;
  }

  function buildQuestion(difficulty) {
    const level = difficulty === "mixed" ? choice(["easy", "medium", "hard"]) : difficulty;
    const builders = {
      easy: [() => directTriangle("SSS"), () => directTriangle("SAS"), () => directTriangle("ASA"), () => directTriangle("AAS")],
      medium: [sharedSide, verticalAngles, parallelAsa],
      hard: [rightTriangleHl, midpointSas]
    };
    return choice(builders[level] || builders.medium)();
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
    els.submitBtn.textContent = tr().submitBtn;
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
    const count = Math.max(1, Math.min(50, Number(els.questionCount.value) || 10));
    const difficulty = els.difficulty.value || "medium";
    quiz = [];
    for (let i = 0; i < count; i++) {
      let q = buildQuestion(difficulty);
      if (typesOnly?.length) {
        for (let guard = 0; guard < 30 && !typesOnly.includes(q.type); guard++) q = buildQuestion("mixed");
      }
      quiz.push(q);
    }
    current = 0;
    correct = 0;
    wrong = [];
    roundStart = Date.now();
    els.setupCard.classList.add("hidden");
    els.resultCard.classList.add("hidden");
    els.quizCard.classList.remove("hidden");
    renderQuestion();
  }

  function renderQuestion() {
    stopTimer();
    answered = false;
    selectedTheorem = "";
    questionStart = Date.now();
    const q = quiz[current];
    els.progressText.textContent = tr().progress(current + 1, quiz.length);
    els.difficultyText.textContent = tr().difficulties[q.difficulty] || q.difficulty;
    els.progressBar.style.width = `${(current / quiz.length) * 100}%`;
    els.promptText.textContent = tr().prompt;
    els.givenList.innerHTML = `<h3>${escapeHtml(tr().givens)}</h3>` + q.givens.map(g => `<div class="given-item">${escapeHtml(g)}</div>`).join("");
    els.targetBox.innerHTML = `<strong>${escapeHtml(tr().target)}:</strong> ${escapeHtml(q.target)}`;
    renderSvg(q);
    renderTheorems();
    renderProofTable(q);
    els.feedback.className = "feedback";
    els.feedback.textContent = "";
    els.solutionBox.classList.add("hidden");
    els.solutionBox.innerHTML = "";
    els.submitBtn.disabled = false;
    els.nextBtn.disabled = true;
    els.nextBtn.textContent = current === quiz.length - 1 ? tr().resultBtn : tr().nextBtn;
    if (els.timedMode.checked) startTimer();
  }

  function renderTheorems() {
    els.theoremGrid.innerHTML = THEOREMS.map(t => `<button class="theorem-option" type="button" data-theorem="${t}" aria-pressed="false">${t}</button>`).join("");
    els.theoremGrid.querySelectorAll("[data-theorem]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (answered) return;
        selectedTheorem = btn.dataset.theorem;
        els.theoremGrid.querySelectorAll("[data-theorem]").forEach(item => {
          item.classList.toggle("selected", item === btn);
          item.setAttribute("aria-pressed", item === btn ? "true" : "false");
        });
      });
    });
  }

  function renderProofTable(q) {
    els.proofTableBody.innerHTML = q.steps.map((_, index) => {
      const statementOptions = [`<option value="">${escapeHtml(tr().chooseStatement)}</option>`]
        .concat(q.statementOptions.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.text)}</option>`));
      const reasonOptions = [`<option value="">${escapeHtml(tr().chooseReason)}</option>`]
        .concat(q.reasonOptions.map(r => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.text)}</option>`));
      return `<tr class="proof-row" data-row="${index}">
        <td class="proof-row-number">${index + 1}</td>
        <td><select class="proof-select" data-statement-row="${index}">${statementOptions.join("")}</select></td>
        <td><select class="proof-select" data-reason-row="${index}">${reasonOptions.join("")}</select></td>
      </tr>`;
    }).join("");
  }

  function answerState(q) {
    const requiredPairs = q.steps.map(stepItem => `${stepItem.id}|${stepItem.reason}`);
    const unusedRequired = new Map();
    requiredPairs.forEach(pair => unusedRequired.set(pair, (unusedRequired.get(pair) || 0) + 1));

    const rows = q.steps.map((_, index) => {
      const statementValue = els.proofTableBody.querySelector(`[data-statement-row="${index}"]`)?.value || "";
      const reasonValue = els.proofTableBody.querySelector(`[data-reason-row="${index}"]`)?.value || "";
      const pair = `${statementValue}|${reasonValue}`;
      const pairOk = Boolean(unusedRequired.get(pair));
      if (pairOk) unusedRequired.set(pair, unusedRequired.get(pair) - 1);
      return {
        pairOk,
        statementValue,
        reasonValue
      };
    });

    const allRequiredUsed = Array.from(unusedRequired.values()).every(count => count === 0);

    return {
      theoremOk: selectedTheorem === q.theorem,
      rows,
      isCorrect: selectedTheorem === q.theorem && allRequiredUsed && rows.every(r => r.pairOk)
    };
  }

  function submitAnswer(forceTimeUp = false) {
    if (answered) return;
    const q = quiz[current];
    if (!forceTimeUp && !selectedTheorem) {
      els.feedback.className = "feedback bad";
      els.feedback.textContent = tr().missingTheorem;
      return;
    }
    stopTimer();
    answered = true;
    const state = forceTimeUp ? { theoremOk: false, rows: q.steps.map(() => ({ pairOk: false })), isCorrect: false } : answerState(q);
    if (state.isCorrect) correct += 1;
    els.feedback.className = `feedback ${state.isCorrect ? "good" : "bad"}`;
    els.feedback.innerHTML = `${escapeHtml(forceTimeUp ? tr().timeUp : state.isCorrect ? tr().correct : tr().incorrect)}${state.isCorrect ? "" : `<div class="geo-feedback-detail">${escapeHtml(tr().correctAnswer)}: ${escapeHtml(q.theorem)}</div>`}`;
    els.proofTableBody.querySelectorAll(".proof-row").forEach((row, index) => {
      const ok = state.rows[index]?.pairOk;
      row.classList.add(ok ? "correct" : "wrong");
    });
    showSolution(q);
    els.submitBtn.disabled = true;
    els.nextBtn.disabled = false;
    if (!state.isCorrect) {
      wrong.push({ q, selectedTheorem: selectedTheorem || "-", forceTimeUp });
    }
    recordAttempt(q, state.isCorrect, forceTimeUp);
  }

  async function recordAttempt(q, isCorrect, forceTimeUp) {
    const timeSpentSeconds = Math.max(0, Math.round((Date.now() - questionStart) / 1000));
    try {
      await window.MCLProgress?.recordAttempt?.({
        gameId: GAME_ID,
        course: COURSE,
        topic: q.type,
        difficulty: q.difficulty,
        questionKey: q.questionKey,
        questionText: `${tr().givens}: ${q.givens.join("; ")} | ${tr().target}: ${q.target}`,
        questionLatex: "",
        correctAnswerLatex: q.theorem,
        selectedAnswerLatex: forceTimeUp ? "Time up" : selectedTheorem || "",
        options: THEOREMS.map(theorem => ({
          label: theorem,
          latex: theorem,
          isCorrect: theorem === q.theorem,
          isSelected: theorem === selectedTheorem
        })),
        correctOptionLabel: q.theorem,
        selectedOptionLabel: selectedTheorem || "",
        isCorrect,
        timeSpentSeconds
      });
    } catch (err) {
      console.warn("Could not record triangle congruence attempt", err);
    }
  }

  function showSolution(q) {
    els.solutionBox.classList.remove("hidden");
    els.solutionBox.innerHTML = `<h4>${escapeHtml(tr().solutionTitle)}</h4><div class="solution-proof">${q.steps.map((s, index) => `
      <div class="solution-step">
        <strong>${index + 1}. ${escapeHtml(s.text)}</strong>
        <span>${escapeHtml(tr().reasons[s.reason] || s.reason)}</span>
      </div>`).join("")}</div>`;
  }

  function nextQuestion() {
    if (current >= quiz.length - 1) {
      showResults();
      return;
    }
    current += 1;
    renderQuestion();
  }

  function showResults() {
    stopTimer();
    els.quizCard.classList.add("hidden");
    els.resultCard.classList.remove("hidden");
    els.progressBar.style.width = "100%";
    const total = quiz.length || 1;
    els.scoreNum.textContent = `${correct}/${total}`;
    els.accuracyNum.textContent = `${Math.round((correct / total) * 100)}%`;
    els.wrongNum.textContent = String(wrong.length);
    if (!wrong.length) {
      els.wrongList.innerHTML = `<div class="wrong-item"><strong>${escapeHtml(tr().noWrong)}</strong><p>${escapeHtml(tr().noWrongTip)}</p></div>`;
      return;
    }
    els.wrongList.innerHTML = wrong.map((item, index) => `
      <div class="wrong-item">
        <div class="expr">${index + 1}. ${escapeHtml(item.q.target)}</div>
        <p><strong>${escapeHtml(tr().givens)}:</strong> ${escapeHtml(item.q.givens.join("; "))}</p>
        <p><strong>${escapeHtml(tr().yourAnswer)}:</strong> <span class="tag-bad">${escapeHtml(item.forceTimeUp ? tr().timeUp : item.selectedTheorem)}</span></p>
        <p><strong>${escapeHtml(tr().correctAnswer)}:</strong> <span class="tag-good">${escapeHtml(item.q.theorem)}</span></p>
      </div>`).join("");
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

  function sampleQuestion() {
    const q = buildQuestion(els.difficulty.value || "medium");
    els.sampleBox.classList.remove("hidden");
    els.sampleBox.innerHTML = `<h3>${escapeHtml(tr().sampleTitle)}</h3>
      <p><strong>${escapeHtml(tr().givens)}:</strong> ${escapeHtml(q.givens.join("; "))}</p>
      <p><strong>${escapeHtml(tr().target)}:</strong> ${escapeHtml(q.target)}</p>
      <p><strong>${escapeHtml(tr().correctAnswer)}:</strong> ${escapeHtml(q.theorem)}</p>`;
  }

  function renderSvg(q) {
    const svg = els.diagram;
    svg.innerHTML = "";
    const add = markup => svg.insertAdjacentHTML("beforeend", markup);
    const p = id => q.points[id];
    const lineClass = pair => q.helperLines?.some(h => h[0] === pair[0] && h[1] === pair[1]) ? "geo-helper" : "geo-line";
    q.lines.forEach(pair => add(`<line class="${lineClass(pair)}" x1="${p(pair[0]).x}" y1="${p(pair[0]).y}" x2="${p(pair[1]).x}" y2="${p(pair[1]).y}"></line>`));
    q.marks.forEach(mark => {
      if (mark.type === "side") drawSideTick(svg, p(mark.pair[0]), p(mark.pair[1]), mark.group);
      if (mark.type === "angle") drawAngleArc(svg, p(mark.triple[0]), p(mark.triple[1]), p(mark.triple[2]), mark.group);
      if (mark.type === "right") drawRightMark(svg, p(mark.triple[0]), p(mark.triple[1]), p(mark.triple[2]));
      if (mark.type === "parallel") drawParallelMark(svg, p(mark.pair[0]), p(mark.pair[1]), mark.group);
    });
    q.labels.forEach(id => {
      const pt = p(id);
      const offset = labelOffset(id, q.points);
      add(`<circle class="geo-point" cx="${pt.x}" cy="${pt.y}" r="4"></circle>`);
      add(`<text class="geo-label" x="${pt.x + offset.x}" y="${pt.y + offset.y}">${escapeHtml(id)}</text>`);
    });
  }

  function labelOffset(id, points) {
    const pt = points[id];
    const center = { x: 360, y: 205 };
    const dx = pt.x < center.x ? -22 : 10;
    const dy = pt.y < center.y ? -12 : 24;
    return { x: dx, y: dy };
  }

  function colorClass(group) {
    return ["geo-mark-blue", "geo-mark-amber", "geo-mark-green", "geo-mark-rose"][(group - 1) % 4] || "geo-mark-blue";
  }

  function drawSideTick(svg, a, b, group) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const count = Math.min(3, group);
    const gap = 8;
    for (let i = 0; i < count; i++) {
      const shift = (i - (count - 1) / 2) * gap;
      const cx = mx + (dx / len) * shift;
      const cy = my + (dy / len) * shift;
      svg.insertAdjacentHTML("beforeend", `<line class="geo-mark ${colorClass(group)}" x1="${cx - nx * 8}" y1="${cy - ny * 8}" x2="${cx + nx * 8}" y2="${cy + ny * 8}"></line>`);
    }
  }

  function drawParallelMark(svg, a, b, group) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    svg.insertAdjacentHTML("beforeend", `<path class="geo-mark ${colorClass(group)}" d="M ${mx - ux * 10 - nx * 7} ${my - uy * 10 - ny * 7} L ${mx - nx * 2} ${my - ny * 2} L ${mx + ux * 10 - nx * 7} ${my + uy * 10 - ny * 7}"></path>`);
  }

  function unitFrom(vertex, point) {
    const dx = point.x - vertex.x;
    const dy = point.y - vertex.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function drawRightMark(svg, a, v, c) {
    const u1 = unitFrom(v, a);
    const u2 = unitFrom(v, c);
    const size = 22;
    const p1 = { x: v.x + u1.x * size, y: v.y + u1.y * size };
    const p2 = { x: p1.x + u2.x * size, y: p1.y + u2.y * size };
    const p3 = { x: v.x + u2.x * size, y: v.y + u2.y * size };
    svg.insertAdjacentHTML("beforeend", `<path class="geo-mark geo-mark-green" d="M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}"></path>`);
  }

  function drawAngleArc(svg, a, v, c, group) {
    const r = 22 + (group - 1) * 8;
    const a1 = Math.atan2(a.y - v.y, a.x - v.x);
    const a2 = Math.atan2(c.y - v.y, c.x - v.x);
    let start = a1;
    let end = a2;
    let diff = end - start;
    while (diff <= -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    end = start + diff;
    const large = Math.abs(diff) > Math.PI ? 1 : 0;
    const sweep = diff > 0 ? 1 : 0;
    const sx = v.x + Math.cos(start) * r;
    const sy = v.y + Math.sin(start) * r;
    const ex = v.x + Math.cos(end) * r;
    const ey = v.y + Math.sin(end) * r;
    svg.insertAdjacentHTML("beforeend", `<path class="geo-mark ${colorClass(group)}" d="M ${sx} ${sy} A ${r} ${r} 0 ${large} ${sweep} ${ex} ${ey}"></path>`);
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", () => startRound());
    els.sampleBtn.addEventListener("click", sampleQuestion);
    els.submitBtn.addEventListener("click", () => submitAnswer(false));
    els.nextBtn.addEventListener("click", nextQuestion);
    els.quitBtn.addEventListener("click", showResults);
    els.restartBtn.addEventListener("click", () => {
      els.resultCard.classList.add("hidden");
      els.setupCard.classList.remove("hidden");
    });
    els.reviewWrongBtn.addEventListener("click", () => {
      if (!wrong.length) {
        els.resultCard.classList.add("hidden");
        els.setupCard.classList.remove("hidden");
        return;
      }
      startRound(wrong.map(item => item.q.type));
    });
    window.addEventListener("storage", e => {
      if (e.key === "mathcomplete_lang") setText();
    });
  }

  function init() {
    setText();
    bindEvents();
  }

  init();
})();
