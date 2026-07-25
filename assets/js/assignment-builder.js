(function () {
  "use strict";

  const MAX_TASKS = 20;
  const PDF_WIDTH = 794;
  const PDF_HEIGHT = 1123;
  const scriptUrl = document.currentScript?.src || new URL("assets/js/assignment-builder.js", document.baseURI).href;
  const assetsUrl = new URL("../", scriptUrl);
  const dependencies = {
    html2canvas: new URL("vendor/html2canvas/1.4.1/html2canvas.min.js", assetsUrl).href,
    jspdf: new URL("vendor/jspdf/4.2.1/jspdf.umd.min.js", assetsUrl).href
  };
  const draft = {
    assignmentId: makeAssignmentId(),
    studentName: "",
    assignmentTitle: "",
    teacherName: "",
    releaseDate: "",
    dueDate: "",
    dueNextClass: false,
    generalNotes: "",
    tasks: []
  };
  let pdfTask = null;

  const COPY = {
    en: {
      eyebrow: "Teacher workspace", title: "Assignment Builder", lead: "Create a clear, student-ready practice assignment and download it as a PDF.",
      checkingAccount: "Preparing the assignment builder...", detailsTitle: "Assignment details", detailsLead: "Identify the student and set the schedule shown on the handout.",
      studentName: "Student name", assignmentTitle: "Assignment title", defaultTitle: "Math Practice Assignment", teacherName: "Teacher name (optional)", releaseDate: "Release date", dueDate: "Due date", dueNextClass: "Due next class", nextClass: "Next class", generalNotes: "General notes",
      tasksTitle: "Practice tasks", tasksAdded: "tasks added", courseFilter: "Course", allCourses: "All courses", searchTools: "Search tools", practiceTool: "Practice tool", addTask: "Add task",
      emptyTitle: "No tasks added yet", emptyLead: "Choose a tool above to build the student's assignment.", privacyTitle: "Generated on this device", privacyLead: "Student and assignment details are not uploaded or saved.",
      downloadPdf: "Download assignment PDF", generating: (a, b) => `Generating PDF ${a}/${b}...`, duplicate: "Duplicate task", moveUp: "Move task up", moveDown: "Move task down", remove: "Remove task",
      mode: "Mode", difficulty: "Difficulty", questions: "Questions", timed: "Timed", timerLevel: "Timer level", taskNotes: "Task notes", timerOff: "Untimed",
      modes: { practice: "Practice Mode", learn: "Learn Mode", exam: "Exam Mode" },
      difficulties: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert", mixed: "Mixed" },
      timerLevels: { timer_easy: "2 minutes per question", timer_medium: "1 minute per question", timer_hard: "30 seconds per question", timer_expert: "15 seconds per question" },
      validationStudent: "Enter the student's name.", validationTitle: "Enter an assignment title.", validationTasks: "Add at least one practice task.", validationDates: "The due date cannot be earlier than the release date.",
      validationTask: number => `Task ${number} contains an unsupported or invalid setting.`, maxTasks: "An assignment can contain at most 20 tasks.", noTools: "No compatible tools match this search.", pdfFailed: "The PDF could not be generated. Your assignment is still here; please try again.",
      pdfTitle: "Homework Assignment", assignmentId: "Assignment ID", generated: "Generated", student: "Student", teacher: "Teacher", schedule: "Schedule", released: "Released", due: "Due", notSet: "Not set",
      taskCount: "Tasks", totalQuestions: "Total questions", notes: "Notes", assignmentTasks: "Assigned Practice", reportReminder: "Complete every task separately. Download one score report after each task and send every report to your teacher.",
      openTool: "Open practice tool", toolLink: "Tool link", task: "Task", steps: ["Open the practice tool using the link above.", "Set the mode, difficulty, question count, and timer exactly as listed.", "Complete the full round.", "On the results screen, select Download PDF.", "Save the score report and send it to your teacher."],
      localNotice: "Created locally by MathComplete Lab. Assignment data was not uploaded.", page: (a, b) => `Page ${a} of ${b}`
    },
    zh: {
      eyebrow: "\u6559\u5e08\u5de5\u4f5c\u533a", title: "\u4f5c\u4e1a\u7f16\u6392\u5668", lead: "\u7ec4\u5408\u6e05\u6670\u7684\u5b66\u751f\u7ec3\u4e60\u8981\u6c42\uff0c\u5e76\u76f4\u63a5\u4e0b\u8f7d PDF\u3002",
      checkingAccount: "\u6b63\u5728\u51c6\u5907\u4f5c\u4e1a\u7f16\u6392\u5668\u2026\u2026", detailsTitle: "\u4f5c\u4e1a\u4fe1\u606f", detailsLead: "\u586b\u5199\u5b66\u751f\u4fe1\u606f\u548c\u4f5c\u4e1a\u65f6\u95f4\u3002",
      studentName: "\u5b66\u751f\u59d3\u540d", assignmentTitle: "\u4f5c\u4e1a\u6807\u9898", defaultTitle: "\u6570\u5b66\u7ec3\u4e60\u4f5c\u4e1a", teacherName: "\u6559\u5e08\u59d3\u540d\uff08\u53ef\u9009\uff09", releaseDate: "\u53d1\u5e03\u65e5\u671f", dueDate: "\u622a\u6b62\u65e5\u671f", dueNextClass: "\u4e0b\u8282\u8bfe\u622a\u6b62", nextClass: "\u4e0b\u8282\u8bfe", generalNotes: "\u603b\u4f53\u5907\u6ce8",
      tasksTitle: "\u7ec3\u4e60\u4efb\u52a1", tasksAdded: "\u4e2a\u4efb\u52a1", courseFilter: "\u8bfe\u7a0b", allCourses: "\u5168\u90e8\u8bfe\u7a0b", searchTools: "\u641c\u7d22\u5de5\u5177", practiceTool: "\u7ec3\u4e60\u5de5\u5177", addTask: "\u6dfb\u52a0\u4efb\u52a1",
      emptyTitle: "\u8fd8\u6ca1\u6709\u4efb\u52a1", emptyLead: "\u5728\u4e0a\u65b9\u9009\u62e9\u5de5\u5177\u5f00\u59cb\u7f16\u6392\u4f5c\u4e1a\u3002", privacyTitle: "\u4ec5\u5728\u672c\u673a\u751f\u6210", privacyLead: "\u5b66\u751f\u548c\u4f5c\u4e1a\u4fe1\u606f\u4e0d\u4f1a\u4e0a\u4f20\u6216\u4fdd\u5b58\u3002",
      downloadPdf: "\u4e0b\u8f7d\u4f5c\u4e1a PDF", generating: (a, b) => `\u6b63\u5728\u751f\u6210 PDF ${a}/${b}\u2026\u2026`, duplicate: "\u590d\u5236\u4efb\u52a1", moveUp: "\u4e0a\u79fb\u4efb\u52a1", moveDown: "\u4e0b\u79fb\u4efb\u52a1", remove: "\u5220\u9664\u4efb\u52a1",
      mode: "\u6a21\u5f0f", difficulty: "\u96be\u5ea6", questions: "\u9898\u6570", timed: "\u8ba1\u65f6", timerLevel: "\u8ba1\u65f6\u7b49\u7ea7", taskNotes: "\u4efb\u52a1\u5907\u6ce8", timerOff: "\u4e0d\u8ba1\u65f6",
      modes: { practice: "\u7ec3\u4e60\u6a21\u5f0f", learn: "\u5b66\u4e60\u6a21\u5f0f", exam: "\u8003\u8bd5\u6a21\u5f0f" }, difficulties: { easy: "\u7b80\u5355", medium: "\u4e2d\u7b49", hard: "\u56f0\u96be", expert: "\u4e13\u5bb6", mixed: "\u6df7\u5408" },
      timerLevels: { timer_easy: "\u6bcf\u9898 2 \u5206\u949f", timer_medium: "\u6bcf\u9898 1 \u5206\u949f", timer_hard: "\u6bcf\u9898 30 \u79d2", timer_expert: "\u6bcf\u9898 15 \u79d2" },
      validationStudent: "\u8bf7\u586b\u5199\u5b66\u751f\u59d3\u540d\u3002", validationTitle: "\u8bf7\u586b\u5199\u4f5c\u4e1a\u6807\u9898\u3002", validationTasks: "\u8bf7\u81f3\u5c11\u6dfb\u52a0\u4e00\u4e2a\u7ec3\u4e60\u4efb\u52a1\u3002", validationDates: "\u622a\u6b62\u65e5\u671f\u4e0d\u80fd\u65e9\u4e8e\u53d1\u5e03\u65e5\u671f\u3002",
      validationTask: number => `\u7b2c ${number} \u4e2a\u4efb\u52a1\u5305\u542b\u4e0d\u652f\u6301\u6216\u65e0\u6548\u7684\u8bbe\u7f6e\u3002`, maxTasks: "\u4e00\u4efd\u4f5c\u4e1a\u6700\u591a\u53ef\u4ee5\u5305\u542b 20 \u4e2a\u4efb\u52a1\u3002", noTools: "\u6ca1\u6709\u5339\u914d\u7684\u517c\u5bb9\u5de5\u5177\u3002", pdfFailed: "PDF \u751f\u6210\u5931\u8d25\u3002\u5f53\u524d\u4f5c\u4e1a\u5185\u5bb9\u4ecd\u7136\u4fdd\u7559\uff0c\u8bf7\u91cd\u8bd5\u3002",
      pdfTitle: "\u5b66\u4e60\u4f5c\u4e1a", assignmentId: "\u4f5c\u4e1a\u7f16\u53f7", generated: "\u751f\u6210\u65f6\u95f4", student: "\u5b66\u751f", teacher: "\u6559\u5e08", schedule: "\u65f6\u95f4\u5b89\u6392", released: "\u53d1\u5e03", due: "\u622a\u6b62", notSet: "\u672a\u8bbe\u7f6e",
      taskCount: "\u4efb\u52a1\u6570", totalQuestions: "\u603b\u9898\u6570", notes: "\u5907\u6ce8", assignmentTasks: "\u7ec3\u4e60\u4efb\u52a1", reportReminder: "\u8bf7\u5206\u522b\u5b8c\u6210\u6bcf\u4e2a\u4efb\u52a1\u3002\u6bcf\u5b8c\u6210\u4e00\u9879\u90fd\u8981\u4e0b\u8f7d\u4e00\u4efd\u6210\u7ee9\u62a5\u544a\uff0c\u5e76\u5c06\u5168\u90e8\u62a5\u544a\u53d1\u7ed9\u8001\u5e08\u3002",
      openTool: "\u6253\u5f00\u7ec3\u4e60\u5de5\u5177", toolLink: "\u5de5\u5177\u94fe\u63a5", task: "\u4efb\u52a1", steps: ["\u4f7f\u7528\u4e0a\u65b9\u94fe\u63a5\u6253\u5f00\u7ec3\u4e60\u5de5\u5177\u3002", "\u5b8c\u5168\u6309\u7167\u4e0a\u65b9\u8981\u6c42\u8bbe\u7f6e\u6a21\u5f0f\u3001\u96be\u5ea6\u3001\u9898\u6570\u548c\u8ba1\u65f6\u3002", "\u5b8c\u6210\u6574\u8f6e\u7ec3\u4e60\u3002", "\u5728\u6210\u7ee9\u9875\u9762\u70b9\u51fb\u201c\u4e0b\u8f7d PDF\u201d\u3002", "\u4fdd\u5b58\u6210\u7ee9\u62a5\u544a\u5e76\u53d1\u7ed9\u8001\u5e08\u3002"],
      localNotice: "\u7531 MathComplete Lab \u5728\u672c\u673a\u751f\u6210\uff0c\u4f5c\u4e1a\u6570\u636e\u672a\u4e0a\u4f20\u3002", page: (a, b) => `\u7b2c ${a} / ${b} \u9875`
    }
  };

  function language() { return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en"; }
  function tr() { return COPY[language()]; }
  function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function cleanText(value, max) { return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
  function cleanMultiline(value, max) { return String(value ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max); }
  function makeAssignmentId() { const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", ""); const token = Math.random().toString(36).slice(2, 8).toUpperCase(); return `MCL-HW-${stamp}-${token}`; }
  function makeTaskId() { return globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  function catalog() { return window.MCLToolCatalog; }
  function eligibleTools() { return (catalog()?.tools || []).filter(tool => tool.assignment?.enabled); }
  function toolById(id) { const tool = catalog()?.byId?.(id); return tool?.assignment?.enabled ? tool : null; }
  function label(value) { return value?.[language()] || value?.en || ""; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function formatDate(value) { if (!value) return tr().notSet; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? tr().notSet : new Intl.DateTimeFormat(language() === "zh" ? "zh-CN" : "en-US", { dateStyle: "medium" }).format(date); }
  function productionToolUrl(tool) { const cleanHref = String(tool.href || "").split("?")[0].split("#")[0]; return new URL(cleanHref, window.MCL?.appConfig?.productionBaseUrl || "https://hansonnnnnnn.github.io/MathComplete-Lab/").href; }

  function syncMetadata() {
    draft.studentName = cleanText(document.getElementById("studentName")?.value, 80);
    draft.assignmentTitle = cleanText(document.getElementById("assignmentTitle")?.value, 120);
    draft.teacherName = cleanText(document.getElementById("teacherName")?.value, 80);
    draft.releaseDate = document.getElementById("releaseDate")?.value || "";
    draft.dueNextClass = Boolean(document.getElementById("dueNextClass")?.checked);
    draft.dueDate = draft.dueNextClass ? "" : (document.getElementById("dueDate")?.value || "");
    draft.generalNotes = cleanMultiline(document.getElementById("generalNotes")?.value, 1000);
  }

  function getDraft() { syncMetadata(); return JSON.parse(JSON.stringify(draft)); }

  function newTask(tool, source = null) {
    const config = tool.assignment;
    return {
      id: makeTaskId(), toolId: tool.id,
      mode: source?.mode && config.modes.includes(source.mode) ? source.mode : (config.modes.includes("practice") ? "practice" : config.modes[0]),
      difficulty: source?.difficulty && config.difficulties.includes(source.difficulty) ? source.difficulty : (config.difficulties.includes("medium") ? "medium" : config.difficulties[0]),
      questionCount: Number(source?.questionCount) || config.questionCount.default,
      timed: Boolean(source?.timed),
      timerLevel: config.timerLevels.some(level => level.id === source?.timerLevel) ? source.timerLevel : (config.timerLevels[1]?.id || config.timerLevels[0]?.id || ""),
      notes: cleanMultiline(source?.notes, 500)
    };
  }

  function addTask(toolId, source = null) {
    if (draft.tasks.length >= MAX_TASKS) { showMessage(tr().maxTasks); return null; }
    const tool = toolById(toolId);
    if (!tool) return null;
    const task = newTask(tool, source);
    draft.tasks.push(task);
    renderTasks();
    return { ...task };
  }

  function updateTask(taskId, patch = {}) {
    const task = draft.tasks.find(item => item.id === taskId);
    const tool = task && toolById(task.toolId);
    if (!task || !tool) return false;
    const config = tool.assignment;
    if (patch.mode !== undefined && config.modes.includes(patch.mode)) task.mode = patch.mode;
    if (patch.difficulty !== undefined && config.difficulties.includes(patch.difficulty)) task.difficulty = patch.difficulty;
    if (patch.questionCount !== undefined) task.questionCount = Math.max(config.questionCount.min, Math.min(config.questionCount.max, Math.round(Number(patch.questionCount) || config.questionCount.default)));
    if (patch.timed !== undefined) task.timed = Boolean(patch.timed);
    if (patch.timerLevel !== undefined && config.timerLevels.some(level => level.id === patch.timerLevel)) task.timerLevel = patch.timerLevel;
    if (patch.notes !== undefined) task.notes = cleanMultiline(patch.notes, 500);
    return true;
  }

  function removeTask(taskId) { const index = draft.tasks.findIndex(item => item.id === taskId); if (index < 0) return false; draft.tasks.splice(index, 1); renderTasks(); return true; }
  function moveTask(taskId, direction) { const index = draft.tasks.findIndex(item => item.id === taskId); const next = direction === "up" ? index - 1 : index + 1; if (index < 0 || next < 0 || next >= draft.tasks.length) return false; [draft.tasks[index], draft.tasks[next]] = [draft.tasks[next], draft.tasks[index]]; renderTasks(); return true; }

  function validate() {
    syncMetadata();
    const errors = [];
    if (!draft.studentName) errors.push(tr().validationStudent);
    if (!draft.assignmentTitle) errors.push(tr().validationTitle);
    if (!draft.tasks.length) errors.push(tr().validationTasks);
    if (!draft.dueNextClass && draft.releaseDate && draft.dueDate && draft.dueDate < draft.releaseDate) errors.push(tr().validationDates);
    draft.tasks.forEach((task, index) => {
      const tool = toolById(task.toolId); const config = tool?.assignment;
      const valid = config && config.modes.includes(task.mode) && config.difficulties.includes(task.difficulty)
        && Number.isInteger(task.questionCount) && task.questionCount >= config.questionCount.min && task.questionCount <= config.questionCount.max
        && (!task.timed || config.timerLevels.some(level => level.id === task.timerLevel));
      if (!valid) errors.push(tr().validationTask(index + 1));
    });
    return { valid: errors.length === 0, errors };
  }

  function optionList(values, labels, current) { return values.map(value => `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(labels[value] || value)}</option>`).join(""); }
  function taskIcon(name, fallback) { return `<i data-lucide="${name}" aria-hidden="true"></i><span class="mcl-assignment-icon-fallback" aria-hidden="true">${fallback}</span>`; }
  function refreshIcons() {
    if (!window.lucide?.createIcons) return;
    window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    document.querySelectorAll(".mcl-assignment-icon-fallback").forEach(node => node.remove());
  }

  function renderTasks() {
    const list = document.getElementById("taskList");
    const t = tr();
    list.innerHTML = draft.tasks.map((task, index) => {
      const tool = toolById(task.toolId); const config = tool.assignment; const course = catalog().courses.find(item => item.id === tool.primaryCourse);
      const timers = config.timerLevels.map(level => level.id);
      return `<article class="mcl-task-card" data-task-id="${escapeHtml(task.id)}">
        <header class="mcl-task-card__header">
          <div class="mcl-task-card__identity"><span class="mcl-task-number">${index + 1}</span><span><strong>${escapeHtml(label(tool.title))}</strong><small>${escapeHtml(label(course?.label))}</small></span></div>
          <div class="mcl-task-card__tools">
            <button class="mcl-icon-action" type="button" data-task-action="up" title="${escapeHtml(t.moveUp)}" aria-label="${escapeHtml(t.moveUp)}"${index === 0 ? " disabled" : ""}>${taskIcon("arrow-up", "UP")}</button>
            <button class="mcl-icon-action" type="button" data-task-action="down" title="${escapeHtml(t.moveDown)}" aria-label="${escapeHtml(t.moveDown)}"${index === draft.tasks.length - 1 ? " disabled" : ""}>${taskIcon("arrow-down", "DN")}</button>
            <button class="mcl-icon-action" type="button" data-task-action="duplicate" title="${escapeHtml(t.duplicate)}" aria-label="${escapeHtml(t.duplicate)}"${draft.tasks.length >= MAX_TASKS ? " disabled" : ""}>${taskIcon("copy", "CP")}</button>
            <button class="mcl-icon-action mcl-icon-action--danger" type="button" data-task-action="remove" title="${escapeHtml(t.remove)}" aria-label="${escapeHtml(t.remove)}">${taskIcon("trash-2", "X")}</button>
          </div>
        </header>
        <div class="mcl-task-card__body">
          <label class="mcl-field"><span>${escapeHtml(t.mode)}</span><select data-task-field="mode">${optionList(config.modes, t.modes, task.mode)}</select></label>
          <label class="mcl-field"><span>${escapeHtml(t.difficulty)}</span><select data-task-field="difficulty">${optionList(config.difficulties, t.difficulties, task.difficulty)}</select></label>
          <label class="mcl-field"><span>${escapeHtml(t.questions)}</span><input data-task-field="questionCount" type="number" min="${config.questionCount.min}" max="${config.questionCount.max}" value="${task.questionCount}" /></label>
          <div class="mcl-timer-control">
            <label class="mcl-check"><input data-task-field="timed" type="checkbox"${task.timed ? " checked" : ""} /><span>${escapeHtml(t.timed)}</span></label>
            <label class="mcl-field"><span>${escapeHtml(t.timerLevel)}</span><select data-task-field="timerLevel"${task.timed ? "" : " disabled"}>${optionList(timers, t.timerLevels, task.timerLevel)}</select></label>
          </div>
          <label class="mcl-field mcl-task-note"><span>${escapeHtml(t.taskNotes)}</span><textarea data-task-field="notes" maxlength="500" rows="2">${escapeHtml(task.notes)}</textarea></label>
        </div>
      </article>`;
    }).join("");
    document.getElementById("taskEmpty").hidden = draft.tasks.length > 0;
    document.getElementById("taskCount").textContent = draft.tasks.length;
    document.getElementById("addTaskButton").disabled = draft.tasks.length >= MAX_TASKS || !document.getElementById("toolPicker").value;
    refreshIcons();
  }

  function filteredTools() {
    const course = document.getElementById("courseFilter").value;
    const query = cleanText(document.getElementById("toolSearch").value, 80).toLowerCase();
    return eligibleTools().filter(tool => (!course || tool.courses.includes(course)) && (!query || `${label(tool.title)} ${label(tool.description)} ${tool.search || ""}`.toLowerCase().includes(query)));
  }

  function renderToolPicker() {
    const select = document.getElementById("toolPicker"); const previous = select.value; const tools = filteredTools();
    select.innerHTML = tools.length ? tools.map(tool => `<option value="${escapeHtml(tool.id)}">${escapeHtml(label(tool.title))}</option>`).join("") : `<option value="">${escapeHtml(tr().noTools)}</option>`;
    if (tools.some(tool => tool.id === previous)) select.value = previous;
    document.getElementById("addTaskButton").disabled = draft.tasks.length >= MAX_TASKS || !select.value;
  }

  function renderStaticCopy() {
    const t = tr();
    document.documentElement.lang = language() === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-copy]").forEach(node => { const value = t[node.dataset.copy]; if (typeof value === "string") node.textContent = value; });
    const courseSelect = document.getElementById("courseFilter");
    courseSelect.innerHTML = `<option value="">${escapeHtml(t.allCourses)}</option>${catalog().courses.map(course => `<option value="${escapeHtml(course.id)}">${escapeHtml(label(course.label))}</option>`).join("")}`;
    renderToolPicker(); renderTasks();
  }

  function showMessage(message, type = "error") { const node = document.getElementById("assignmentMessage"); node.textContent = message; node.hidden = !message; node.dataset.type = type; }

  function updateDueDateState() {
    const checkbox = document.getElementById("dueNextClass");
    const input = document.getElementById("dueDate");
    const wrapper = checkbox.closest(".mcl-due-field");
    input.disabled = checkbox.checked;
    wrapper.dataset.nextClass = String(checkbox.checked);
    if (checkbox.checked) input.value = "";
    syncMetadata();
  }

  function bindEvents() {
    document.querySelectorAll("#assignmentForm input, #assignmentForm textarea").forEach(node => node.addEventListener("input", () => { if (!node.closest(".mcl-task-card")) syncMetadata(); showMessage(""); }));
    document.getElementById("courseFilter").addEventListener("change", renderToolPicker);
    document.getElementById("toolSearch").addEventListener("input", renderToolPicker);
    document.getElementById("toolPicker").addEventListener("change", () => renderTasks());
    document.getElementById("dueNextClass").addEventListener("change", updateDueDateState);
    document.getElementById("addTaskButton").addEventListener("click", () => addTask(document.getElementById("toolPicker").value));
    document.getElementById("taskList").addEventListener("click", event => {
      const card = event.target.closest("[data-task-id]"); const action = event.target.closest("[data-task-action]")?.dataset.taskAction; if (!card || !action) return;
      const task = draft.tasks.find(item => item.id === card.dataset.taskId); if (!task) return;
      if (action === "remove") removeTask(task.id); else if (action === "duplicate") addTask(task.toolId, task); else moveTask(task.id, action);
    });
    document.getElementById("taskList").addEventListener("change", event => {
      const card = event.target.closest("[data-task-id]"); const field = event.target.dataset.taskField; if (!card || !field) return;
      const value = field === "timed" ? event.target.checked : field === "questionCount" ? Number(event.target.value) : event.target.value;
      updateTask(card.dataset.taskId, { [field]: value });
      if (field === "questionCount") {
        const task = draft.tasks.find(item => item.id === card.dataset.taskId);
        if (task) event.target.value = task.questionCount;
      }
      if (field === "timed") renderTasks();
    });
    document.getElementById("taskList").addEventListener("input", event => {
      if (event.target.dataset.taskField === "notes") updateTask(event.target.closest("[data-task-id]").dataset.taskId, { notes: event.target.value });
    });
    document.getElementById("assignmentForm").addEventListener("submit", event => { event.preventDefault(); downloadPdfReport(); });
  }

  function infoCell(name, value) { return `<div><span class="mcl-assignment-pdf-label">${escapeHtml(name)}</span><span class="mcl-assignment-pdf-value">${escapeHtml(value)}</span></div>`; }
  function settingCell(name, value) { return `<div><span class="mcl-assignment-pdf-label">${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong></div>`; }

  function taskPdfNode(task, index) {
    const t = tr(); const tool = toolById(task.toolId); const url = productionToolUrl(tool);
    const article = document.createElement("article"); article.className = "mcl-assignment-pdf-task";
    article.innerHTML = `<div class="mcl-assignment-pdf-task-head"><h3><span class="mcl-assignment-pdf-task-number">${escapeHtml(t.task)} ${index + 1}.</span> ${escapeHtml(label(tool.title))}</h3></div>
      <div class="mcl-assignment-pdf-url"><span>${escapeHtml(t.toolLink)}:</span><a class="mcl-assignment-pdf-link" data-pdf-link href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>
      <div class="mcl-assignment-pdf-settings">${settingCell(t.mode, t.modes[task.mode])}${settingCell(t.difficulty, t.difficulties[task.difficulty])}${settingCell(t.questions, task.questionCount)}${settingCell(t.timed, task.timed ? t.timerLevels[task.timerLevel] : t.timerOff)}</div>
      ${task.notes ? `<div class="mcl-assignment-pdf-task-note"><strong>${escapeHtml(t.notes)}:</strong> ${escapeHtml(task.notes)}</div>` : ""}
      <ol class="mcl-assignment-pdf-steps">${t.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
    return article;
  }

  function makePdfPage(continuation = false) {
    const t = tr(); const page = document.createElement("section"); page.className = "mcl-assignment-pdf-page";
    page.innerHTML = `<div class="mcl-assignment-pdf-brand">MathComplete Lab</div><div class="mcl-assignment-pdf-document-id">${escapeHtml(t.assignmentId)}: ${escapeHtml(draft.assignmentId)}<br>${escapeHtml(t.generated)}: ${escapeHtml(new Intl.DateTimeFormat(language() === "zh" ? "zh-CN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date()))}</div>
      ${continuation ? `<h2 class="mcl-assignment-pdf-section-title">${escapeHtml(t.assignmentTasks)}</h2>` : ""}<div class="mcl-assignment-pdf-content"></div><div class="mcl-assignment-pdf-footer"><span>${escapeHtml(t.localNotice)}</span><span data-pdf-page-number></span></div>`;
    return page;
  }

  function buildPdfPages() {
    syncMetadata(); const t = tr(); const host = document.createElement("div"); host.className = "mcl-assignment-pdf-host"; host.setAttribute("aria-hidden", "true"); document.body.appendChild(host);
    let page = makePdfPage(); host.appendChild(page); let content = page.querySelector(".mcl-assignment-pdf-content");
    const totalQuestions = draft.tasks.reduce((sum, task) => sum + task.questionCount, 0);
    const dueValue = draft.dueNextClass ? t.nextClass : formatDate(draft.dueDate);
    const teacherCell = draft.teacherName ? infoCell(t.teacher, draft.teacherName) : "";
    content.innerHTML = `<h1 class="mcl-assignment-pdf-title">${escapeHtml(t.pdfTitle)}</h1><p class="mcl-assignment-pdf-subtitle">${escapeHtml(draft.assignmentTitle)}</p>
      <div class="mcl-assignment-pdf-info${teacherCell ? "" : " mcl-assignment-pdf-info--no-teacher"}">${infoCell(t.student, draft.studentName)}${teacherCell}${infoCell(t.schedule, `${t.released}: ${formatDate(draft.releaseDate)}  |  ${t.due}: ${dueValue}`)}${infoCell(`${t.taskCount} / ${t.totalQuestions}`, `${draft.tasks.length} / ${totalQuestions}`)}</div>
      ${draft.generalNotes ? `<div class="mcl-assignment-pdf-notes"><strong>${escapeHtml(t.notes)}:</strong> ${escapeHtml(draft.generalNotes)}</div>` : ""}
      <h2 class="mcl-assignment-pdf-section-title">${escapeHtml(t.assignmentTasks)}</h2><p class="mcl-assignment-pdf-reminder">${escapeHtml(t.reportReminder)}</p>`;
    draft.tasks.forEach((task, index) => {
      const node = taskPdfNode(task, index); content.appendChild(node);
      const pageRect = page.getBoundingClientRect(); const nodeRect = node.getBoundingClientRect();
      if (nodeRect.bottom - pageRect.top > 1045) {
        page = makePdfPage(true); host.appendChild(page); content = page.querySelector(".mcl-assignment-pdf-content"); content.appendChild(node);
      }
    });
    const pages = [...host.querySelectorAll(".mcl-assignment-pdf-page")];
    pages.forEach((item, index) => { item.querySelector("[data-pdf-page-number]").textContent = t.page(index + 1, pages.length); });
    return { host, pages };
  }

  function loadScriptOnce(src, ready) {
    if (ready()) return Promise.resolve();
    const existing = [...document.scripts].find(script => script.src === src);
    return new Promise((resolve, reject) => {
      const script = existing || document.createElement("script");
      const done = () => ready() ? resolve() : reject(new Error("dependency_unavailable"));
      script.addEventListener("load", done, { once: true }); script.addEventListener("error", () => reject(new Error("dependency_failed")), { once: true });
      if (!existing) { script.src = src; document.head.appendChild(script); }
    });
  }

  async function ensurePdfDependencies() {
    await loadScriptOnce(dependencies.html2canvas, () => typeof window.html2canvas === "function");
    await loadScriptOnce(dependencies.jspdf, () => typeof window.jspdf?.jsPDF === "function");
  }

  function filename() { const safe = `${draft.studentName}-${draft.assignmentTitle}-${today()}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim().slice(0, 150); return `${safe || "MathComplete-Lab-assignment"}.pdf`; }

  async function renderPdfPages(result, onProgress) {
    await ensurePdfDependencies(); await document.fonts?.ready;
    const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: draft.assignmentTitle, subject: `${tr().pdfTitle} - ${draft.studentName}`, author: "MathComplete Lab", creator: "MathComplete Lab Assignment Builder" });
    for (let index = 0; index < result.pages.length; index += 1) {
      onProgress?.(index + 1, result.pages.length);
      const page = result.pages[index];
      const canvas = await window.html2canvas(page, { scale: 2.5, backgroundColor: "#ffffff", useCORS: true, logging: false, width: PDF_WIDTH, height: PDF_HEIGHT, windowWidth: PDF_WIDTH, windowHeight: PDF_HEIGHT });
      if (index) pdf.addPage("a4", "portrait");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297, undefined, "FAST");
      const pageRect = page.getBoundingClientRect();
      page.querySelectorAll("[data-pdf-link]").forEach(link => {
        const rect = link.getBoundingClientRect();
        pdf.link((rect.left - pageRect.left) * 210 / PDF_WIDTH, (rect.top - pageRect.top) * 297 / PDF_HEIGHT, rect.width * 210 / PDF_WIDTH, rect.height * 297 / PDF_HEIGHT, { url: link.href });
      });
      canvas.width = 1; canvas.height = 1;
    }
    return pdf;
  }

  async function downloadPdfReport() {
    if (pdfTask) return pdfTask;
    const check = validate();
    if (!check.valid) { showMessage(check.errors[0]); return null; }
    showMessage(""); const button = document.getElementById("downloadAssignmentButton"); const text = button.querySelector("span"); const original = tr().downloadPdf; button.disabled = true;
    pdfTask = (async () => {
      let result;
      try {
        result = buildPdfPages();
        const pdf = await renderPdfPages(result, (a, b) => { text.textContent = tr().generating(a, b); });
        const blob = pdf.output("blob"); const signature = await blob.slice(0, 4).text();
        if (blob.type !== "application/pdf" || signature !== "%PDF") throw new Error("invalid_pdf");
        const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename(); document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
        return blob;
      } catch (error) {
        console.error("[MathComplete Lab] Assignment PDF generation failed.", error); showMessage(tr().pdfFailed); return null;
      } finally {
        result?.host?.remove(); button.disabled = false; text.textContent = original; pdfTask = null;
      }
    })();
    return pdfTask;
  }

  async function initialize() {
    renderStaticCopy();
    document.getElementById("assignmentTitle").value = tr().defaultTitle;
    draft.assignmentTitle = tr().defaultTitle;
    document.getElementById("releaseDate").value = today(); draft.releaseDate = today();
    document.getElementById("assignmentLoading").hidden = true; document.getElementById("assignmentForm").hidden = false;
    bindEvents(); refreshIcons();
    try {
      const snapshot = await window.MCLAuth?.initialize?.();
      const teacherName = cleanText(snapshot?.profile?.display_name || snapshot?.user?.user_metadata?.display_name || snapshot?.user?.email?.split("@")[0], 80);
      const field = document.getElementById("teacherName");
      if (teacherName && !field.value) {
        draft.teacherName = teacherName;
        field.value = teacherName;
      }
    } catch (error) {
      console.warn("[MathComplete Lab] Optional account name lookup failed.", error);
    }
  }

  window.MCLAssignmentBuilder = { getDraft, addTask, updateTask, removeTask, moveTask, validate, downloadPdf: downloadPdfReport, __test: Object.freeze({ filteredTools, productionToolUrl, buildPdfPages }) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize); else initialize();
})();
