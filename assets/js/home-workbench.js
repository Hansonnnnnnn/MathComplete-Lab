(function () {
  function lang() { return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en"; }
  function esc(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  const copy = {
    en: {
      badge: "Your math workspace",
      title: "What would you like to practice today?",
      lead: "Choose a course, continue where you stopped, or review a skill that needs another try.",
      continue: "Continue practicing",
      start: "Start here",
      open: "Open practice",
      courses: "Browse by course",
      coursesLead: "Move from foundations to advanced topics without digging through a long tool list.",
      tools: n => `${n} practice tools`,
      recent: "Recently added",
      recentLead: "Fresh practice sets ready to try.",
      accuracy: "Recent accuracy",
      answered: "Questions answered",
      mistakes: "To review",
      nextStep: "Recommended next",
      reviewTitle: "Clear a few saved mistakes first",
      reviewLead: "A short review round will be more useful than starting another unrelated set.",
      reviewAction: "Review mistakes",
      strengthenTitle: "Strengthen your most recent skill",
      strengthenLead: "Continue in Learn Mode and use the worked solution after each question.",
      challengeTitle: "You are ready for a harder round",
      challengeLead: "Raise the difficulty or turn on timing when you start your next practice set.",
      continueTitle: "Keep your current practice rhythm",
      continueLead: "Return to your latest skill and complete one focused set before switching topics.",
      firstTitle: "Start with one focused practice set",
      firstLead: "Choose a comfortable difficulty first; the workspace will adapt after your results are saved.",
      continueAction: "Continue practice",
      about: "Focused practice, clear feedback.",
      aboutLead: "MathComplete Lab creates replayable math questions with worked solutions, flexible practice modes, and downloadable reports.",
      library: "View the full library"
    },
    zh: {
      badge: "你的数学学习工作台",
      title: "今天想练习什么？",
      lead: "选择一门课程、继续上次的练习，或者再挑战一次需要巩固的知识点。",
      continue: "继续练习",
      start: "从这里开始",
      open: "打开练习",
      courses: "按课程浏览",
      coursesLead: "从基础到进阶，快速找到合适的专项练习。",
      tools: n => `${n} 个练习工具`,
      recent: "最近新增",
      recentLead: "这些新练习已经可以开始使用。",
      accuracy: "近期正确率",
      answered: "已答题数",
      mistakes: "待复习错题",
      nextStep: "下一步建议",
      reviewTitle: "先完成一小组错题复习",
      reviewLead: "先处理已经暴露的问题，比立即开始一个无关的新练习更有效。",
      reviewAction: "复习错题",
      strengthenTitle: "继续巩固最近练习的知识点",
      strengthenLead: "建议使用学习模式，并在每题后认真查看完整解答。",
      challengeTitle: "可以尝试更高难度了",
      challengeLead: "下一轮可以提高难度，或者开启计时模式挑战熟练度。",
      continueTitle: "保持现在的练习节奏",
      continueLead: "先回到最近的知识点完成一组专注练习，再切换到其他主题。",
      firstTitle: "从一组专注练习开始",
      firstLead: "先选择舒适的难度；保存首轮成绩后，工作台会给出更合适的建议。",
      continueAction: "继续练习",
      about: "专注练习，清晰反馈。",
      aboutLead: "MathComplete Lab 提供可重复练习的随机数学题、逐步解答、灵活模式和可下载成绩报告。",
      library: "查看完整练习库"
    }
  };

  function toolCard(tool, isNew) {
    const title = tool.title[lang()] || tool.title.en;
    const description = tool.description[lang()] || tool.description.en;
    const course = window.MCLToolCatalog.courses.find(item => item.id === tool.primaryCourse);
    const visual = window.MCLMathVisuals?.render(tool.id, "mcl-math-visual--compact") || "";
    return `<article class="mcl-tool-card" data-course-accent="${esc(tool.primaryCourse)}" data-mcl-reveal>
      <div class="mcl-tool-card__meta">
        ${isNew ? `<span class="tag new-tool-tag">${lang() === "zh" ? "新工具" : "New"}</span>` : ""}
        <span class="tag">${esc(course?.label?.[lang()] || course?.label?.en || "")}</span>
      </div>
      <h3>${esc(title)}</h3>
      <p>${esc(description)}</p>
      <div class="mcl-tool-card__footer"><span class="mcl-tool-card__visual">${visual}</span><a class="button ghost" href="${esc(tool.href)}">${copy[lang()].open}</a></div>
    </article>`;
  }

  function recommendationMarkup(summary, continueTool) {
    const t = copy[lang()];
    const total = Number(summary?.total || 0);
    const accuracy = Number(summary?.accuracy || 0);
    const activeMistakes = Number(summary?.activeMistakes || 0);
    let title = t.firstTitle;
    let lead = t.firstLead;
    let action = t.continueAction;
    let href = continueTool.href;

    if (activeMistakes > 0) {
      title = t.reviewTitle;
      lead = t.reviewLead;
      action = t.reviewAction;
      href = "mistakes.html";
    } else if (total > 0 && accuracy < 70) {
      title = t.strengthenTitle;
      lead = t.strengthenLead;
    } else if (total > 0 && accuracy >= 85) {
      title = t.challengeTitle;
      lead = t.challengeLead;
    } else if (total > 0) {
      title = t.continueTitle;
      lead = t.continueLead;
    }

    return `<div class="mcl-next-step" aria-label="${t.nextStep}">
      <div class="mcl-next-step__copy">
        <span>${t.nextStep}</span>
        <strong>${title}</strong>
        <p>${lead}</p>
      </div>
      <a class="button ghost" href="${esc(href)}">${action}</a>
    </div>`;
  }

  function render(summary) {
    const catalog = window.MCLToolCatalog;
    const main = document.querySelector("main.container");
    if (!catalog || !main) return;
    const t = copy[lang()];
    const recentAttempt = summary?.recentAttempts?.find(item => catalog.byId(item.game_id));
    const continueTool = catalog.byId(recentAttempt?.game_id) || catalog.byId("algebra-expression") || catalog.tools[0];
    const latest = [...catalog.tools].sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt)).slice(0, 4);
    const continueTitle = continueTool.title[lang()] || continueTool.title.en;
    const displayTitle = lang() === "zh"
      ? `今天想练习 <span class="mcl-title-accent">什么？</span>`
      : `What would you like to practice <span class="mcl-title-accent">today?</span>`;
    const continueVisual = window.MCLMathVisuals?.render(continueTool.id) || "";

    main.className = "container mcl-workbench";
    main.innerHTML = `<section class="mcl-workbench__welcome" data-mcl-reveal>
      <div class="mcl-welcome-copy">
        <div class="eyebrow"><span class="dot"></span><span>${t.badge}</span></div>
        <h1 class="mcl-display-title">${displayTitle}</h1>
        <p>${t.lead}</p>
        ${recommendationMarkup(summary, continueTool)}
      </div>
      <aside class="mcl-continue-panel" data-course-accent="${esc(continueTool.primaryCourse)}">
        <div class="mcl-continue-panel__visual">${continueVisual}</div>
        <div class="mcl-continue-panel__label">${recentAttempt ? t.continue : t.start}</div>
        <h2>${esc(continueTitle)}</h2>
        <p>${esc(continueTool.description[lang()] || continueTool.description.en)}</p>
        <div class="actions"><a class="button primary" href="${esc(continueTool.href)}">${t.open}</a></div>
      </aside>
    </section>

    <section class="mcl-section" aria-labelledby="mclCoursesTitle" data-mcl-reveal>
      <div class="mcl-section__head"><div><h2 id="mclCoursesTitle">${t.courses}</h2><p>${t.coursesLead}</p></div><a href="practice.html">${t.library}</a></div>
      <div class="mcl-course-grid">
        ${catalog.courses.map(course => {
          const count = catalog.tools.filter(tool => tool.courses.includes(course.id)).length;
          const visual = window.MCLMathVisuals?.render(course.id) || "";
          return `<a class="mcl-course-card" data-course-accent="${esc(course.id)}" href="practice.html?course=${encodeURIComponent(course.id)}"><span class="mcl-course-card__visual">${visual}</span><span class="mcl-course-card__copy"><strong>${esc(course.label[lang()] || course.label.en)}</strong><small>${t.tools(count)}</small></span></a>`;
        }).join("")}
      </div>
    </section>

    <section class="mcl-section" aria-labelledby="mclRecentTitle" data-mcl-reveal>
      <div class="mcl-section__head"><div><h2 id="mclRecentTitle">${t.recent}</h2><p>${t.recentLead}</p></div></div>
      <div class="mcl-tool-grid">${latest.map(tool => toolCard(tool, true)).join("")}</div>
    </section>

    <section class="mcl-section mcl-about-band" data-mcl-reveal>
      <div><h2>${t.about}</h2><p>${t.aboutLead}</p></div>
      <a class="button ghost" href="practice.html">${t.library}</a>
    </section>`;
    document.title = lang() === "zh" ? "MathComplete Lab | 数学学习工作台" : "MathComplete Lab | Math Practice Workspace";
  }

  async function init() {
    if (!window.MCLToolCatalog || !document.querySelector("main.container")) return;
    const local = window.MCLProgress?.getLocalDashboardSummary?.() || null;
    render(local);
    if (!window.MCLAuth?.isConfigured?.()) return;
    try {
      const { session } = await window.MCLAuth.getSession();
      if (!session?.user) return;
      const summary = await window.MCLProgress.getDashboardSummary();
      render(summary);
    } catch (error) {
      console.warn("[MathComplete Lab] Home summary unavailable.", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
