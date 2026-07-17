(function () {
  const STORAGE_KEY = "mcl_library_course";
  function lang() { return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en"; }
  function esc(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  const copy = {
    en: {
      badge: "Practice Library",
      title: "Find the right skill and start practicing.",
      lead: "Choose a course, browse by topic, or search all available practice tools.",
      courses: "Courses",
      all: "All tools",
      search: "Search practice tools",
      placeholder: "Search skills, topics, or tool names...",
      open: "Open practice",
      new: "New",
      empty: "No practice tools match these filters.",
      chooseCourse: "Choose a course"
    },
    zh: {
      badge: "练习库",
      title: "找到合适的知识点，开始练习。",
      lead: "选择课程、按主题浏览，或者搜索全部专项练习工具。",
      courses: "课程",
      all: "全部工具",
      search: "搜索练习工具",
      placeholder: "搜索知识点、主题或工具名称...",
      open: "打开练习",
      new: "新工具",
      empty: "没有符合当前条件的练习工具。",
      chooseCourse: "选择课程"
    }
  };

  let activeCourse = "all";
  let cards = new Map();
  let groupRoot = null;
  let searchInput = null;
  let emptyState = null;

  function courseById(id) {
    return window.MCLToolCatalog.courses.find(course => course.id === id);
  }

  function cardMarkup(tool, isNew) {
    const title = tool.title[lang()] || tool.title.en;
    const description = tool.description[lang()] || tool.description.en;
    const primary = courseById(tool.primaryCourse);
    const visual = window.MCLMathVisuals?.render(tool.id, "mcl-math-visual--compact") || "";
    return `<article class="card tool-card mcl-tool-card" data-course-accent="${esc(tool.primaryCourse)}" data-primary-course="${esc(tool.primaryCourse)}" data-mcl-reveal data-added-at="${esc(tool.addedAt)}" data-game-id="${esc(tool.id)}" data-courses="${esc(tool.courses.join(" "))}" data-search-keys="${esc(tool.search)}">
      <button class="favorite-button mcl-hidden" type="button" data-auth-show="logged-in" data-favorite-button data-game-id="${esc(tool.id)}" aria-label="Favorite ${esc(title)}" title="Favorite">☆</button>
      <div class="mcl-tool-card__meta">
        ${isNew ? `<span class="tag new-tool-tag">${copy[lang()].new}</span>` : ""}
        <span class="tag course-tag" data-course-label="${esc(tool.primaryCourse)}">${esc(primary?.label?.[lang()] || primary?.label?.en || "")}</span>
      </div>
      <h3>${esc(title)}</h3>
      <p>${esc(description)}</p>
      <div class="mcl-tool-card__footer"><span class="mcl-tool-card__visual">${visual}</span><a class="button primary" href="${esc(tool.href)}">${copy[lang()].open}</a></div>
    </article>`;
  }

  function buildCards() {
    const latestIds = new Set([...window.MCLToolCatalog.tools]
      .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt))
      .slice(0, 3)
      .map(tool => tool.id));
    const holder = document.createElement("div");
    holder.innerHTML = window.MCLToolCatalog.tools.map(tool => cardMarkup(tool, latestIds.has(tool.id))).join("");
    cards = new Map([...holder.children].map(card => [card.dataset.gameId, card]));
  }

  function topicFor(tool, courseId) {
    return tool.topics[courseId] || tool.topics[tool.primaryCourse] || "other";
  }

  function topicTitle(topicId) {
    const value = window.MCLToolCatalog.topics[topicId] || window.MCLToolCatalog.topics.other;
    return value[lang()] || value.en;
  }

  function syncCardCourse(card, courseId) {
    const course = courseById(courseId);
    const label = course?.label?.[lang()] || course?.label?.en || "";
    card.dataset.courseAccent = courseId;
    const tag = card.querySelector(".course-tag");
    if (tag) {
      tag.dataset.courseLabel = courseId;
      tag.textContent = label;
    }
  }

  function renderGroups() {
    if (!groupRoot) return;
    const catalog = window.MCLToolCatalog;
    const eligible = catalog.tools.filter(tool => activeCourse === "all" ? true : tool.courses.includes(activeCourse));
    const groups = new Map();
    eligible.forEach(tool => {
      const courseId = activeCourse === "all" ? tool.primaryCourse : activeCourse;
      const topicId = topicFor(tool, courseId);
      const key = `${courseId}::${topicId}`;
      if (!groups.has(key)) groups.set(key, { courseId, topicId, tools: [] });
      groups.get(key).tools.push(tool);
    });

    groupRoot.innerHTML = "";
    groups.forEach(group => {
      const course = courseById(group.courseId);
      const section = document.createElement("section");
      section.className = "mcl-topic-section";
      section.dataset.mclReveal = "";
      section.dataset.courseAccent = group.courseId;
      section.dataset.course = group.courseId;
      section.dataset.topic = group.topicId;
      const heading = activeCourse === "all"
        ? `${course?.label?.[lang()] || course?.label?.en || ""} · ${topicTitle(group.topicId)}`
        : topicTitle(group.topicId);
      section.innerHTML = `<div class="mcl-topic-section__head"><h2>${esc(heading)}</h2><span>${group.tools.length}</span></div><div class="mcl-tool-grid"></div>`;
      const grid = section.querySelector(".mcl-tool-grid");
      group.tools.forEach(tool => {
        const card = cards.get(tool.id);
        syncCardCourse(card, group.courseId);
        grid.appendChild(card);
      });
      groupRoot.appendChild(section);
    });
    applySearch();
    window.MCLAuthUI?.refresh?.();
  }

  function applySearch() {
    const query = String(searchInput?.value || "").trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach(card => {
      if (!card.isConnected) return;
      const text = `${card.dataset.searchKeys || ""} ${card.textContent || ""}`.toLocaleLowerCase();
      const show = !query || text.includes(query);
      card.classList.toggle("hidden-by-filter", !show);
      if (show) visible++;
    });
    groupRoot?.querySelectorAll(".mcl-topic-section").forEach(section => {
      const hasVisible = [...section.querySelectorAll(".tool-card")].some(card => !card.classList.contains("hidden-by-filter"));
      section.classList.toggle("is-empty", !hasVisible);
    });
    if (emptyState) {
      emptyState.textContent = copy[lang()].empty;
      emptyState.classList.toggle("visible", visible === 0);
    }
  }

  function setCourse(courseId, persist) {
    const valid = courseId === "all" || window.MCLToolCatalog.courses.some(course => course.id === courseId);
    activeCourse = valid ? courseId : "all";
    if (persist) localStorage.setItem(STORAGE_KEY, activeCourse);
    document.querySelectorAll("[data-mcl-course]").forEach(button => {
      const active = button.dataset.mclCourse === activeCourse;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const mobileSelect = document.getElementById("mclMobileCourse");
    if (mobileSelect) mobileSelect.value = activeCourse;
    renderGroups();
  }

  function init() {
    const catalog = window.MCLToolCatalog;
    const main = document.querySelector("main.container");
    const oldHeading = main?.querySelector(":scope > section:first-child");
    const filterPanel = document.querySelector(".filter-panel");
    const favorites = document.getElementById("favoritesPanel");
    const oldGrid = document.getElementById("toolsGrid");
    emptyState = document.getElementById("libraryEmpty");
    if (!catalog || !main || !oldHeading || !filterPanel || !oldGrid) return;

    document.body.classList.add("mcl-library-page");
    buildCards();
    oldHeading.className = "mcl-library-heading";
    const titleMarkup = lang() === "zh"
      ? `找到合适的知识点，<span class="mcl-title-accent">开始练习。</span>`
      : `Find the right skill and <span class="mcl-title-accent">start practicing.</span>`;
    oldHeading.dataset.mclReveal = "";
    oldHeading.innerHTML = `<div class="eyebrow"><span class="dot"></span><span>${copy[lang()].badge}</span></div><h1 class="mcl-display-title">${titleMarkup}</h1><p class="lead">${copy[lang()].lead}</p>`;

    searchInput = document.getElementById("librarySearch");
    if (searchInput) searchInput.placeholder = copy[lang()].placeholder;
    const searchControl = filterPanel.querySelector(".search-control");
    filterPanel.remove();
    oldGrid.innerHTML = "";
    oldGrid.className = "mcl-library-groups";
    groupRoot = oldGrid;

    const layout = document.createElement("div");
    layout.className = "mcl-library-layout";
    const aside = document.createElement("aside");
    aside.className = "mcl-course-sidebar";
    const counts = Object.fromEntries(catalog.courses.map(course => [course.id, catalog.tools.filter(tool => tool.courses.includes(course.id)).length]));
    aside.innerHTML = `<h2>${copy[lang()].courses}</h2><div class="mcl-course-nav">
      <button type="button" data-mcl-course="all"><span style="margin-left:0">${copy[lang()].all}</span><span>${catalog.tools.length}</span></button>
      ${catalog.courses.map(course => `<button type="button" data-mcl-course="${course.id}" data-course-accent="${course.id}"><span class="mcl-course-nav__name"><i aria-hidden="true"></i>${esc(course.label[lang()] || course.label.en)}</span><span>${counts[course.id]}</span></button>`).join("")}
    </div>
    <label class="mcl-mobile-course-select" for="mclMobileCourse"><span>${copy[lang()].chooseCourse}</span><select id="mclMobileCourse"><option value="all">${copy[lang()].all} (${catalog.tools.length})</option>${catalog.courses.map(course => `<option value="${course.id}">${esc(course.label[lang()] || course.label.en)} (${counts[course.id]})</option>`).join("")}</select></label>`;

    const content = document.createElement("div");
    content.className = "mcl-library-content";
    const toolbar = document.createElement("div");
    toolbar.className = "mcl-library-toolbar";
    if (searchControl) {
      searchControl.querySelector("label")?.replaceChildren(copy[lang()].search);
      toolbar.appendChild(searchControl);
    }
    content.appendChild(toolbar);
    if (favorites) content.appendChild(favorites);
    content.appendChild(oldGrid);
    if (emptyState) content.appendChild(emptyState);
    layout.append(aside, content);
    oldHeading.after(layout);

    document.querySelectorAll("[data-mcl-course]").forEach(button => button.addEventListener("click", () => setCourse(button.dataset.mclCourse, true)));
    document.getElementById("mclMobileCourse")?.addEventListener("change", event => setCourse(event.target.value, true));
    searchInput?.addEventListener("input", () => requestAnimationFrame(applySearch));

    const requested = new URLSearchParams(location.search).get("course");
    setCourse(requested || localStorage.getItem(STORAGE_KEY) || "all", false);
  }

  window.MCLLibraryWorkspace = { setCourse, applySearch };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
