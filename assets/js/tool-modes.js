(function () {
  const STORAGE_KEY = "mcl_tool_mode";
  const MODES = ["practice", "learn", "exam"];
  const AUTO_NEXT_MS = 800;
  let queuedExamAttempts = [];
  let queuedExamRawAttempts = [];
  let originalRecordGameAttempt = null;
  let originalRecordAttempt = null;
  let autoNextTimer = null;
  let lastExamSelectedOption = null;
  let presentationSyncTimer = null;

  function lang() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function copy() {
    return lang() === "zh"
      ? {
          label: "\u7b54\u9898\u6a21\u5f0f",
          practice: "\u7ec3\u4e60\u6a21\u5f0f",
          learn: "\u5b66\u4e60\u6a21\u5f0f",
          exam: "\u8003\u8bd5\u6a21\u5f0f",
          practiceHint: "\u7b54\u5bf9\u540e\u81ea\u52a8\u8fdb\u5165\u4e0b\u4e00\u9898\uff1b\u7b54\u9519\u65f6\u663e\u793a\u89e3\u6790\uff0c\u9700\u8981\u624b\u52a8\u8fdb\u5165\u4e0b\u4e00\u9898\u3002",
          learnHint: "\u6bcf\u9898\u7b54\u5b8c\u90fd\u663e\u793a\u5bf9\u9519\u548c\u89e3\u6790\uff0c\u7136\u540e\u624b\u52a8\u8fdb\u5165\u4e0b\u4e00\u9898\u3002",
          examHint: "\u7b54\u9898\u65f6\u4e0d\u663e\u793a\u5bf9\u9519\u548c\u89e3\u6790\uff1b\u672c\u8f6e\u7ed3\u675f\u540e\u7edf\u4e00\u6279\u6539\u3002",
          examQueued: "\u8003\u8bd5\u6a21\u5f0f\uff1a\u672c\u8f6e\u7ed3\u675f\u540e\u7edf\u4e00\u5199\u5165\u5b66\u4e60\u8bb0\u5f55\u3002"
        }
      : {
          label: "Practice mode",
          practice: "Practice Mode",
          learn: "Learn Mode",
          exam: "Exam Mode",
          practiceHint: "Correct answers advance automatically; wrong answers show the solution and wait for you.",
          learnHint: "Every answer shows feedback and the solution, then you move on manually.",
          examHint: "No feedback while answering; grading and explanations appear at the end.",
          examQueued: "Exam mode: records are saved after the round is graded."
        };
  }

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : "learn";
  }

  function setMode(mode) {
    const next = MODES.includes(mode) ? mode : "learn";
    localStorage.setItem(STORAGE_KEY, next);
    const select = document.getElementById("toolMode");
    if (select && select.value !== next) select.value = next;
    applyModeClass(next);
    updateHint();
    syncModePresentation();
  }

  function applyModeClass(mode = getMode()) {
    document.body.classList.toggle("mcl-tool-practice", mode === "practice");
    document.body.classList.toggle("mcl-tool-learn", mode === "learn");
    document.body.classList.toggle("mcl-tool-exam", mode === "exam");
  }

  function updateHint() {
    const hint = document.getElementById("mclToolModeHint");
    if (!hint) return;
    const t = copy();
    const select = document.getElementById("toolMode");
    const mode = MODES.includes(select?.value) ? select.value : getMode();
    hint.textContent = mode === "practice" ? t.practiceHint : mode === "exam" ? t.examHint : t.learnHint;
  }

  function injectStyles() {
    if (document.getElementById("mclToolModeStyles")) return;
    const style = document.createElement("style");
    style.id = "mclToolModeStyles";
    style.textContent = `
      .mcl-tool-mode-field label {
        display: block;
        font-weight: 900;
        margin-bottom: 8px;
      }
      .mcl-tool-mode-field select {
        width: 100%;
        min-height: 46px;
        padding: 12px 14px;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 14px;
        font: inherit;
        background: #fff;
        color: var(--text, #0f172a);
      }
      .mcl-tool-mode-hint {
        margin: 6px 0 0;
        color: var(--muted, #64748b);
        font-size: 13px;
        line-height: 1.45;
        font-weight: 750;
      }
      body.mcl-tool-exam #feedback,
      body.mcl-tool-exam #solutionBox {
        display: none !important;
      }
      body.mcl-tool-exam .option.correct,
      body.mcl-tool-exam .option.wrong {
        border-color: var(--border, #e5e7eb) !important;
        background: #fff !important;
        color: var(--text, #0f172a) !important;
      }
      body.mcl-tool-exam .option.mcl-exam-selected {
        border-color: var(--accent, #2563eb) !important;
        background: #eff6ff !important;
        color: var(--text, #0f172a) !important;
      }
      body.mcl-tool-exam .option.correct .katex,
      body.mcl-tool-exam .option.wrong .katex {
        color: var(--text, #0f172a) !important;
      }
      .mcl-exam-review {
        margin-top: 22px;
        padding: 18px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 18px;
        background: #fff;
      }
      .mcl-exam-review h3 {
        margin: 0 0 12px;
      }
      .mcl-exam-row {
        padding: 12px 0;
        border-top: 1px solid rgba(148, 163, 184, 0.22);
        color: var(--muted, #64748b);
        font-weight: 800;
        line-height: 1.55;
      }
      .mcl-exam-row:first-of-type {
        border-top: 0;
      }
      .mcl-exam-correct { color: #16a34a; font-weight: 950; }
      .mcl-exam-wrong { color: #dc2626; font-weight: 950; }
    `;
    document.head.appendChild(style);
  }

  function bindModeControl() {
    const select = document.getElementById("toolMode");
    if (!select) return false;
    select.value = getMode();
    if (!select.dataset.mclToolModeBound) {
      select.addEventListener("change", () => setMode(select.value));
      select.dataset.mclToolModeBound = "true";
    }
    refreshLanguage();
    updateHint();
    return true;
  }

  function injectModeControl() {
    if (bindModeControl()) return;
    const setupGrid = document.querySelector("#setupCard .setup-grid, .setup-grid");
    if (!setupGrid) return;

    const t = copy();
    const field = document.createElement("div");
    field.className = "mcl-tool-mode-field";
    field.innerHTML = '\n      <label id="toolModeLabel" for="toolMode">' + t.label + '</label>\n      <select id="toolMode">\n        <option value="practice">' + t.practice + '</option>\n        <option value="learn">' + t.learn + '</option>\n        <option value="exam">' + t.exam + '</option>\n      </select>\n      <p class="mcl-tool-mode-hint" id="mclToolModeHint"></p>\n    ';

    const difficulty = document.getElementById("difficulty");
    const anchor = difficulty?.closest("div");
    if (anchor?.parentElement === setupGrid) anchor.after(field);
    else setupGrid.prepend(field);

    bindModeControl();
  }

  function isVisible(el) {
    return Boolean(el && !el.classList.contains("hidden") && !el.classList.contains("mcl-hidden"));
  }

  function feedbackIsCorrect() {
    const feedback = document.getElementById("feedback");
    return Boolean(feedback && feedback.classList.contains("good"));
  }

  function syncModePresentation() {
    const mode = getMode();
    if (mode !== "practice") window.clearTimeout(autoNextTimer);
    if (mode !== "exam") return;

    const feedback = document.getElementById("feedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }

    const solutionBox = document.getElementById("solutionBox");
    if (solutionBox) {
      solutionBox.classList.add("hidden");
      solutionBox.innerHTML = "";
    }

    document.querySelectorAll(".option").forEach(option => {
      option.classList.remove("correct", "wrong");
      option.classList.toggle("mcl-exam-selected", option === lastExamSelectedOption);
    });
  }

  function schedulePresentationSync() {
    window.clearTimeout(presentationSyncTimer);
    presentationSyncTimer = window.setTimeout(syncModePresentation, 0);
  }

  function suppressPracticeCorrectSolution() {
    if (getMode() !== "practice" || !feedbackIsCorrect()) return;
    const solutionBox = document.getElementById("solutionBox");
    solutionBox?.classList.add("hidden");
  }

  function maybeAutoAdvance() {
    if (getMode() !== "practice" || !feedbackIsCorrect()) return;
    const nextBtn = document.getElementById("nextBtn");
    if (!nextBtn || nextBtn.disabled) return;
    window.clearTimeout(autoNextTimer);
    autoNextTimer = window.setTimeout(() => {
      if (getMode() === "practice" && isVisible(document.getElementById("quizCard")) && !nextBtn.disabled) {
        nextBtn.click();
      }
    }, AUTO_NEXT_MS);
  }

  function attachAnswerObserver() {
    document.addEventListener("click", event => {
      if (event.target.closest("#startBtn, #restartBtn, #reviewWrongBtn")) {
        document.getElementById("mclExamReview")?.remove();
        lastExamSelectedOption = null;
      }
      if (event.target.closest("#nextBtn, #quitBtn")) {
        lastExamSelectedOption = null;
        schedulePresentationSync();
      }
      const option = event.target.closest(".option");
      if (!option) return;
      if (getMode() === "exam") lastExamSelectedOption = option;
      window.setTimeout(() => {
        syncModePresentation();
        suppressPracticeCorrectSolution();
        maybeAutoAdvance();
      }, 0);
    }, true);
  }

  function observeAnswerUi() {
    const targets = ["feedback", "solutionBox", "options"]
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;
    const observer = new MutationObserver(() => schedulePresentationSync());
    targets.forEach(target => observer.observe(target, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["class", "style", "disabled"]
    }));
  }

  function patchProgressForExam() {
    const progress = window.MCLProgress;
    if (!progress?.recordGameAttempt || progress.recordGameAttempt.__mclToolModesPatched) return;
    originalRecordGameAttempt = progress.recordGameAttempt.bind(progress);
    originalRecordAttempt = typeof progress.recordAttempt === "function" ? progress.recordAttempt.bind(progress) : null;
    const patched = function (payload) {
      if (getMode() === "exam") {
        queuedExamAttempts.push({
          ...payload,
          answeredAt: new Date().toISOString(),
          questionSnapshot: payload?.question || null
        });
        return Promise.resolve({ queuedExam: true });
      }
      return originalRecordGameAttempt(payload);
    };
    patched.__mclToolModesPatched = true;
    progress.recordGameAttempt = patched;
    if (typeof progress.recordAttempt === "function" && !progress.recordAttempt.__mclToolModesPatched) {
      const patchedRecordAttempt = function (payload) {
        if (getMode() === "exam") {
          queuedExamRawAttempts.push({
            ...payload,
            answeredAt: new Date().toISOString(),
            questionSnapshot: payload?.question || null
          });
          return Promise.resolve({ queuedExam: true });
        }
        return originalRecordAttempt(payload);
      };
      patchedRecordAttempt.__mclToolModesPatched = true;
      progress.recordAttempt = patchedRecordAttempt;
    }
  }

  async function flushExamAttempts() {
    if ((!queuedExamAttempts.length || !originalRecordGameAttempt) && (!queuedExamRawAttempts.length || !originalRecordAttempt)) return;
    const attempts = queuedExamAttempts;
    const rawAttempts = queuedExamRawAttempts;
    queuedExamAttempts = [];
    queuedExamRawAttempts = [];
    for (const attempt of attempts) {
      try {
        await originalRecordGameAttempt(attempt);
      } catch (err) {
        console.warn("[MathComplete Lab] Exam attempt save failed.", err);
      }
    }
    for (const attempt of rawAttempts) {
      try {
        await originalRecordAttempt(attempt);
      } catch (err) {
        console.warn("[MathComplete Lab] Exam raw attempt save failed.", err);
      }
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function attemptQuestionText(attempt) {
    const q = attempt?.question || attempt?.questionSnapshot || {};
    return q.main || q.displayExpression || q.latex || q.equationText || q.plain || q.expression || attempt?.questionLatex || attempt?.prompt || "";
  }

  function attemptCorrectText(attempt) {
    return attempt?.correctAnswer ?? attempt?.correctAnswerLatex ?? attempt?.correct_answer_latex ?? attempt?.correct_answer ?? "";
  }

  function attemptSelectedText(attempt) {
    return attempt?.selectedAnswer ?? attempt?.selectedAnswerLatex ?? attempt?.selected_answer_latex ?? attempt?.selected_answer ?? "";
  }

  function syncPracticeResultStats(attempts) {
    if (!Array.isArray(attempts) || !attempts.length) return;
    const scoreNum = document.getElementById("scoreNum");
    const accuracyNum = document.getElementById("accuracyNum");
    const wrongNum = document.getElementById("wrongNum");
    if (!scoreNum && !accuracyNum && !wrongNum) return;

    const total = attempts.length;
    const correct = attempts.filter(attempt => Boolean(attempt.isCorrect ?? attempt.is_correct)).length;
    const wrong = total - correct;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    const scoreText = `${correct}/${total}`;
    const accuracyText = `${accuracy}%`;
    const wrongText = String(wrong);
    if (scoreNum && scoreNum.textContent !== scoreText) scoreNum.textContent = scoreText;
    if (accuracyNum && accuracyNum.textContent !== accuracyText) accuracyNum.textContent = accuracyText;
    if (wrongNum && wrongNum.textContent !== wrongText) wrongNum.textContent = wrongText;
  }

  function renderExamReview(attempts) {
    const resultCard = document.getElementById("resultCard");
    if (!resultCard || !attempts.length) return;
    syncPracticeResultStats(attempts);
    if (document.getElementById("mclExamReview")) return;
    const t = lang() === "zh"
      ? { title: "\u8003\u8bd5\u6279\u6539", correct: "\u6b63\u786e", incorrect: "\u9519\u8bef", your: "\u4f60\u7684\u7b54\u6848", answer: "\u6b63\u786e\u7b54\u6848", blank: "\u672a\u4f5c\u7b54" }
      : { title: "Exam Review", correct: "Correct", incorrect: "Incorrect", your: "Your answer", answer: "Correct answer", blank: "No answer" };
    const panel = document.createElement("section");
    panel.id = "mclExamReview";
    panel.className = "mcl-exam-review";
    panel.innerHTML = `
      <h3>${t.title}</h3>
      ${attempts.map((attempt, index) => {
        const ok = Boolean(attempt.isCorrect ?? attempt.is_correct);
        return `
          <div class="mcl-exam-row">
            <div><strong>${index + 1}.</strong> ${escapeHtml(attemptQuestionText(attempt))}</div>
            <div class="${ok ? "mcl-exam-correct" : "mcl-exam-wrong"}">${ok ? t.correct : t.incorrect}</div>
            <div>${t.your}: ${escapeHtml(attemptSelectedText(attempt) || t.blank)}</div>
            <div>${t.answer}: ${escapeHtml(attemptCorrectText(attempt))}</div>
          </div>
        `;
      }).join("")}
    `;
    resultCard.appendChild(panel);
  }

  function observeResultCard() {
    const resultCard = document.getElementById("resultCard");
    if (!resultCard) return;
    const observer = new MutationObserver(() => {
      if (isVisible(resultCard)) {
        renderExamReview([...queuedExamAttempts, ...queuedExamRawAttempts]);
        void flushExamAttempts();
      }
    });
    observer.observe(resultCard, { attributes: true, attributeFilter: ["class"] });
  }

  function refreshLanguage() {
    const t = copy();
    const label = document.getElementById("toolModeLabel");
    const select = document.getElementById("toolMode");
    if (label) label.textContent = t.label;
    if (select) {
      const selected = select.value;
      select.innerHTML = `
        <option value="practice">${t.practice}</option>
        <option value="learn">${t.learn}</option>
        <option value="exam">${t.exam}</option>
      `;
      select.value = selected;
    }
    updateHint();
  }

  function init() {
    injectStyles();
    injectModeControl();
    applyModeClass();
    syncModePresentation();
    attachAnswerObserver();
    observeAnswerUi();
    patchProgressForExam();
    observeResultCard();
    window.addEventListener("storage", refreshLanguage);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.MCLToolModes = {
    getMode,
    setMode,
    flushExamAttempts,
    refreshLanguage
  };
})();
