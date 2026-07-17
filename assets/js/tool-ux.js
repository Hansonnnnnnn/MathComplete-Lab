(function () {
  function lang() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  const copy = {
    en: {
      practice: "Practice Library",
      more: "More settings",
      edit: "Change settings",
      editConfirm: "Change settings and restart this round?",
      answered: "Questions Answered",
      untimed: "Untimed"
    },
    zh: {
      practice: "练习库",
      more: "更多设置",
      edit: "修改设置",
      editConfirm: "要修改设置并重新开始本轮吗？",
      answered: "已答题数",
      untimed: "不计时"
    }
  };

  function directField(control) {
    if (!control) return null;
    let node = control.parentElement;
    while (node && node.parentElement && !node.parentElement.classList.contains("setup-grid")) node = node.parentElement;
    return node;
  }

  function addBreadcrumbs() {
    const pageHeader = document.querySelector("main.container > header");
    if (!pageHeader || pageHeader.querySelector(".mcl-breadcrumbs")) return;
    const root = location.pathname.includes("/games/") ? ".." : ".";
    const title = document.querySelector("#pageTitle, main h1")?.textContent?.trim() || document.title;
    const crumbs = document.createElement("nav");
    crumbs.className = "mcl-breadcrumbs";
    crumbs.setAttribute("aria-label", "Breadcrumb");
    crumbs.innerHTML = `<a href="${root}/practice.html">${copy[lang()].practice}</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span>`;
    pageHeader.prepend(crumbs);
  }

  function makeAdvancedSettings() {
    const setup = document.getElementById("setupCard");
    const grid = setup?.querySelector(".setup-grid");
    if (!setup || !grid || setup.querySelector(".mcl-more-settings")) return;

    const optionField = directField(document.getElementById("optionCount"));
    const timerField = directField(document.getElementById("timerLevel"));
    const advanced = [...new Set([optionField, timerField].filter(Boolean))];
    if (!advanced.length) return;

    const details = document.createElement("details");
    details.className = "mcl-more-settings";
    const summary = document.createElement("summary");
    summary.textContent = copy[lang()].more;
    const inner = document.createElement("div");
    inner.className = "mcl-more-grid";
    advanced.forEach(field => inner.appendChild(field));
    details.append(summary, inner);
    grid.after(details);

    if (timerField) timerField.classList.add("mcl-timer-setting");
    const timed = document.getElementById("timedMode");
    function updateTimerVisibility() {
      if (!timerField) return;
      timerField.classList.toggle("is-disabled", !timed?.checked);
    }
    timed?.addEventListener("change", updateTimerVisibility);
    updateTimerVisibility();
  }

  function sessionValues() {
    const values = [];
    const difficulty = document.getElementById("difficulty");
    const mode = document.getElementById("toolMode");
    const count = document.getElementById("questionCount");
    const timed = document.getElementById("timedMode");
    const timer = document.getElementById("timerLevel");
    if (difficulty) values.push(difficulty.selectedOptions?.[0]?.textContent || difficulty.value);
    if (mode) values.push(mode.selectedOptions?.[0]?.textContent || mode.value);
    if (count) values.push(`${count.value} ${lang() === "zh" ? "题" : "questions"}`);
    if (timed?.checked && timer) values.push(timer.selectedOptions?.[0]?.textContent || timer.value);
    else values.push(copy[lang()].untimed);
    return values.filter(Boolean).join(" · ");
  }

  function ensureSessionSummary() {
    const quiz = document.getElementById("quizCard");
    if (!quiz || quiz.querySelector(".mcl-session-summary")) return;
    const summary = document.createElement("div");
    summary.className = "mcl-session-summary";
    summary.innerHTML = `<span>${sessionValues()}</span><button class="ghost" type="button">${copy[lang()].edit}</button>`;
    summary.querySelector("button").addEventListener("click", () => {
      if (window.confirm(copy[lang()].editConfirm)) location.reload();
    });
    quiz.prepend(summary);
  }

  function addAnsweredStat() {
    const grid = document.querySelector("#resultCard .result-grid");
    const score = document.getElementById("scoreNum");
    if (!grid || !score || document.getElementById("mclAnsweredNum")) return;
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<div id="mclAnsweredNum" class="num">0</div><div class="label">${copy[lang()].answered}</div>`;
    grid.appendChild(stat);
    const answerNum = stat.querySelector(".num");
    function update() {
      const match = String(score.textContent || "").match(/\d+\s*\/\s*(\d+)/);
      answerNum.textContent = match ? match[1] : "0";
    }
    new MutationObserver(update).observe(score, { childList: true, characterData: true, subtree: true });
    update();
  }

  function init() {
    if (!location.pathname.includes("/games/")) return;
    document.body.classList.add("mcl-tool-page");
    addBreadcrumbs();
    makeAdvancedSettings();
    addAnsweredStat();
    document.getElementById("startBtn")?.addEventListener("click", () => setTimeout(ensureSessionSummary, 0));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
