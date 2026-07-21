/* MathComplete Lab - isolated guest/account progress with idempotent cloud sync. */
(function () {
  "use strict";

  const GUEST_KEY = "mcl_attempts_guest_v2";
  const ACCOUNT_CACHE_PREFIX = "mcl_attempts_account_v2:";
  const ACCOUNT_QUEUE_PREFIX = "mcl_attempt_queue_v2:";
  const MASTERED_PREFIX = "mcl_mastered_local_v2:";
  const MERGE_CHOICE_PREFIX = "mcl_guest_merge_choice_v2:";
  const LEGACY_KEYS = ["mcl_guest_attempts_v1", "mcl_recent_attempts_v1"];
  const MAX_LOCAL_ATTEMPTS = 500;
  const GAME_COURSES = {
    "arithmetic-within-10": "pre-algebra", "arithmetic-within-100": "pre-algebra", "arithmetic-within-1000": "pre-algebra",
    "set-theory-basics": "pre-algebra", "gcd-lcm": "pre-algebra", "fraction-percent": "pre-algebra", "powers-roots": "pre-algebra", "exponent-laws": "pre-algebra",
    "algebra-expression": "algebra-1", "algebra-simplification": "algebra-1", "linear-equation": "algebra-1", "linear-inequalities": "algebra-1",
    "systems-linear-equations": "algebra-1", "slope-from-two-points": "algebra-1", "function-evaluation": "algebra-1", "factoring-practice": "algebra-1", "special-products": "algebra-1", "polynomial-multiplication": "algebra-1",
    "quadratic-functions": "algebra-2", "quadratic-formula": "algebra-2", "function-graph-matching": "algebra-2", "completing-the-square": "algebra-2", "exponential-functions": "algebra-2", "logarithmic-functions": "algebra-2", "radical-functions": "algebra-2", "complex-number-operations": "algebra-2",
    "advanced-equation-solving": "precalculus", "unit-circle-trigonometry": "precalculus", "geometry-formula": "geometry-1", "triangle-congruence": "geometry-1",
    "derivative-practice": "single-variable-calculus", "limits-practice": "single-variable-calculus", "integration-practice": "single-variable-calculus",
    "vector-operations": "linear-algebra", "matrix-multiplication": "linear-algebra", "determinant-practice": "linear-algebra"
  };

  const client = () => window.MCL?.supabaseClient;
  const nowIso = () => new Date().toISOString();
  const safeString = value => value === null || value === undefined ? "" : String(value);

  function randomId() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, character => {
      const value = Math.random() * 16 | 0;
      return (character === "x" ? value : (value & 3 | 8)).toString(16);
    });
  }

  function readList(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeList(key, value, limit = MAX_LOCAL_ATTEMPTS) {
    localStorage.setItem(key, JSON.stringify(value.slice(-limit)));
  }

  function hashString(input) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    const text = safeString(input);
    for (let index = 0; index < text.length; index++) {
      const code = text.charCodeAt(index);
      h1 = Math.imul(h1 ^ code, 2654435761);
      h2 = Math.imul(h2 ^ code, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function makeQuestionKey(attempt) {
    if (attempt.questionKey || attempt.question_key) return safeString(attempt.questionKey || attempt.question_key);
    return hashString([attempt.gameId || attempt.game_id, attempt.topic, attempt.difficulty, attempt.questionLatex || attempt.question_latex || attempt.questionText || attempt.question_text, attempt.correctAnswerLatex || attempt.correct_answer_latex].join("|"));
  }

  function normalizeAttempt(payload, userId = null) {
    const gameId = safeString(payload.gameId || payload.game_id || "unknown-game");
    return {
      client_attempt_id: payload.clientAttemptId || payload.client_attempt_id || randomId(),
      user_id: userId,
      game_id: gameId,
      course: safeString(payload.course || GAME_COURSES[gameId] || ""),
      topic: safeString(payload.topic || ""),
      difficulty: safeString(payload.difficulty || ""),
      question_key: makeQuestionKey(payload),
      question_latex: safeString(payload.questionLatex || payload.question_latex || ""),
      question_text: safeString(payload.questionText || payload.question_text || ""),
      correct_answer_latex: safeString(payload.correctAnswerLatex || payload.correct_answer_latex || ""),
      selected_answer_latex: safeString(payload.selectedAnswerLatex || payload.selected_answer_latex || ""),
      is_correct: Boolean(payload.isCorrect ?? payload.is_correct),
      time_spent_seconds: Number.isFinite(Number(payload.timeSpentSeconds ?? payload.time_spent_seconds)) ? Math.max(0, Math.round(Number(payload.timeSpentSeconds ?? payload.time_spent_seconds))) : null,
      created_at: payload.createdAt || payload.created_at || nowIso()
    };
  }

  function dedupe(attempts) {
    const map = new Map();
    attempts.forEach(item => {
      const normalized = normalizeAttempt(item, item.user_id || null);
      map.set(normalized.client_attempt_id, normalized);
    });
    return [...map.values()].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  }

  function migrateLegacyData() {
    if (localStorage.getItem("mcl_progress_v2_migrated") === "1") return;
    const legacy = LEGACY_KEYS.flatMap(readList);
    const fingerprints = new Set();
    const uniqueLegacy = legacy.filter(item => {
      const fingerprint = JSON.stringify([
        item.gameId || item.game_id || "",
        item.questionKey || item.question_key || item.question || "",
        item.selectedAnswer ?? item.selected_answer ?? "",
        item.isCorrect ?? item.is_correct ?? item.correct ?? false,
        item.createdAt || item.created_at || ""
      ]);
      if (fingerprints.has(fingerprint)) return false;
      fingerprints.add(fingerprint);
      return true;
    });
    const existing = readList(GUEST_KEY);
    writeList(GUEST_KEY, dedupe([...existing, ...uniqueLegacy].map(item => ({ ...item, user_id: null }))));
    LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.setItem("mcl_progress_v2_migrated", "1");
  }

  const accountCacheKey = userId => `${ACCOUNT_CACHE_PREFIX}${userId}`;
  const accountQueueKey = userId => `${ACCOUNT_QUEUE_PREFIX}${userId}`;
  const masteredKey = namespace => `${MASTERED_PREFIX}${namespace}`;
  const currentSnapshot = () => window.MCLAuth?.getState?.() || { status: "anonymous", user: null };
  const activeUserId = () => currentSnapshot().user?.id || null;

  function getGuestAttempts() { return readList(GUEST_KEY); }
  function setGuestAttempts(attempts) { writeList(GUEST_KEY, dedupe(attempts)); }
  function clearGuestAttempts() { localStorage.removeItem(GUEST_KEY); }
  function getAccountCache(userId) { return userId ? readList(accountCacheKey(userId)) : []; }
  function setAccountCache(userId, attempts) { if (userId) writeList(accountCacheKey(userId), dedupe(attempts)); }
  function getPendingQueue(userId) { return userId ? readList(accountQueueKey(userId)) : []; }
  function setPendingQueue(userId, attempts) { if (userId) writeList(accountQueueKey(userId), dedupe(attempts)); }
  function getPendingSyncCount(userId = activeUserId()) { return getPendingQueue(userId).length; }

  function emitSyncChange(userId) {
    window.dispatchEvent(new CustomEvent("mcl:syncchange", { detail: { userId, pending: getPendingSyncCount(userId) } }));
  }

  function saveGuestAttempt(payload) {
    const attempt = normalizeAttempt(payload, null);
    setGuestAttempts([...getGuestAttempts(), attempt]);
    return attempt;
  }

  function queueAccountAttempt(payload, userId) {
    const attempt = normalizeAttempt(payload, userId);
    setAccountCache(userId, [...getAccountCache(userId), attempt]);
    setPendingQueue(userId, [...getPendingQueue(userId), attempt]);
    emitSyncChange(userId);
    return attempt;
  }

  async function recordCloudAttempt(attempt) {
    const { data, error } = await client().rpc("record_attempt", { p_attempt: {
      client_attempt_id: attempt.client_attempt_id,
      game_id: attempt.game_id,
      course: attempt.course,
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      question_key: attempt.question_key,
      question_latex: attempt.question_latex,
      question_text: attempt.question_text,
      correct_answer_latex: attempt.correct_answer_latex,
      selected_answer_latex: attempt.selected_answer_latex,
      is_correct: attempt.is_correct,
      time_spent_seconds: attempt.time_spent_seconds,
      created_at: attempt.created_at
    }});
    if (error) throw error;
    return data;
  }

  async function flushPendingAttempts(userId = activeUserId()) {
    if (!userId || !client()) return { synced: 0, failed: getPendingSyncCount(userId) };
    const queue = getPendingQueue(userId);
    const failed = [];
    let synced = 0;
    for (const attempt of queue) {
      try { await recordCloudAttempt({ ...attempt, user_id: userId }); synced++; }
      catch (error) { failed.push(attempt); console.warn("[MathComplete Lab] Attempt remains queued.", error); }
    }
    setPendingQueue(userId, failed);
    emitSyncChange(userId);
    return { synced, failed: failed.length };
  }

  async function recordAttempt(payload) {
    let snapshot = currentSnapshot();
    if (snapshot.status === "loading") {
      await window.MCLAuth?.initialize?.();
      snapshot = currentSnapshot();
    }
    const userId = snapshot.status === "authenticated" || snapshot.status === "recovery" ? snapshot.user?.id : null;
    if (!userId || !client()) return { attempt: saveGuestAttempt(payload), savedLocally: true, namespace: "guest" };

    const attempt = queueAccountAttempt(payload, userId);
    try {
      const result = await recordCloudAttempt(attempt);
      setPendingQueue(userId, getPendingQueue(userId).filter(item => item.client_attempt_id !== attempt.client_attempt_id));
      emitSyncChange(userId);
      return { ...result, savedLocally: false };
    } catch (error) {
      console.warn("[MathComplete Lab] Cloud save failed; attempt is queued for this account.", error);
      return { attempt, savedLocally: true, queued: true, namespace: userId };
    }
  }

  function gameIdFromPath() {
    return (location.pathname.split("/").pop() || "unknown-game.html").replace(/\.html$/i, "") || "unknown-game";
  }
  const stripHtml = value => safeString(value).replace(/<[^>]*>/g, "");
  const questionTextFrom = question => safeString(question?.plain || question?.equationText || question?.expression || question?.rawExpression || stripHtml(question?.main || question?.displayExpression || ""));
  const questionLatexFrom = question => safeString(question?.main || question?.displayExpression || question?.latex || question?.equationText || question?.plain || question?.expression || "");
  const topicFrom = question => safeString(question?.type || question?.templateId || question?.action || question?.topic || "");

  function recordGameAttempt(payload) {
    const question = payload?.question || {};
    const gameId = payload?.gameId || gameIdFromPath();
    const selected = payload?.timeUp ? "" : payload?.selectedAnswer ?? payload?.selectedAnswerLatex ?? payload?.selected_answer_latex ?? "";
    return recordAttempt({
      gameId, course: payload?.course || GAME_COURSES[gameId] || "math", topic: payload?.topic || topicFrom(question), difficulty: payload?.difficulty || question?.difficulty || "",
      questionLatex: payload?.questionLatex || questionLatexFrom(question), questionText: payload?.questionText || questionTextFrom(question),
      correctAnswerLatex: safeString(payload?.correctAnswer ?? payload?.correctAnswerLatex ?? payload?.correct_answer_latex), selectedAnswerLatex: safeString(selected),
      isCorrect: Boolean(payload?.isCorrect), timeSpentSeconds: payload?.timeSpentSeconds
    });
  }

  async function syncGuestAttempts() {
    const userId = activeUserId();
    if (!userId) throw new Error("You must be signed in before syncing guest attempts.");
    const guests = getGuestAttempts();
    const remaining = [];
    let synced = 0;
    for (const guest of guests) {
      const attempt = normalizeAttempt(guest, userId);
      setAccountCache(userId, [...getAccountCache(userId), attempt]);
      try { await recordCloudAttempt(attempt); synced++; }
      catch (error) {
        remaining.push(guest);
        setPendingQueue(userId, [...getPendingQueue(userId), attempt]);
        console.warn("[MathComplete Lab] Guest merge item remains local.", error);
      }
    }
    setGuestAttempts(remaining);
    emitSyncChange(userId);
    return { synced, failed: remaining.length };
  }

  function mergeAttempts(cloud, local) {
    const map = new Map();
    [...local, ...cloud].forEach(item => map.set(item.client_attempt_id || `cloud:${item.id}`, item));
    return [...map.values()].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  function namespaceAttempts() {
    const userId = activeUserId();
    return userId ? getAccountCache(userId) : getGuestAttempts();
  }

  async function getRecentAttempts(limit = 20) {
    const userId = activeUserId();
    if (!userId || !client()) return namespaceAttempts().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
    const { data, error } = await client().from("attempts").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return mergeAttempts(data || [], getAccountCache(userId)).slice(0, limit);
  }

  const mistakeFingerprint = item => `${safeString(item.game_id)}|${safeString(item.question_key)}`;
  function readMastered(namespace) { return new Set(readList(masteredKey(namespace))); }
  function localMistakesFromAttempts(attempts, namespace = "guest") {
    const map = new Map();
    const mastered = readMastered(namespace);
    attempts.filter(item => !item.is_correct).forEach(item => {
      const key = mistakeFingerprint(item);
      const existing = map.get(key);
      if (existing) {
        existing.mistake_count++;
        if (new Date(item.created_at) > new Date(existing.updated_at)) {
          existing.updated_at = item.created_at;
          existing.last_selected_answer_latex = item.selected_answer_latex;
        }
      } else {
        map.set(key, { id: `local:${key}`, user_id: item.user_id || null, game_id: item.game_id, course: item.course, topic: item.topic, difficulty: item.difficulty, question_key: item.question_key, question_latex: item.question_latex, question_text: item.question_text, correct_answer_latex: item.correct_answer_latex, last_selected_answer_latex: item.selected_answer_latex, mistake_count: 1, review_success_count: 0, status: mastered.has(key) ? "mastered" : "active", created_at: item.created_at, updated_at: item.created_at, local_only: true });
      }
    });
    return [...map.values()].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  function filterMistakes(mistakes, options = {}) {
    const status = options.status || "active";
    return mistakes.filter(item => (status === "all" || item.status === status) && (!options.gameId || options.gameId === "all" || item.game_id === options.gameId) && (!options.course || options.course === "all" || item.course === options.course) && (!options.difficulty || options.difficulty === "all" || item.difficulty === options.difficulty));
  }

  function localMistakes() {
    const userId = activeUserId();
    return localMistakesFromAttempts(namespaceAttempts(), userId || "guest");
  }

  function mergeMistakes(cloud, local) {
    const map = new Map();
    [...local, ...cloud].forEach(item => map.set(mistakeFingerprint(item), item));
    return [...map.values()].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }

  async function getMistakes(options = {}) {
    const userId = activeUserId();
    const local = localMistakes();
    if (!userId || !client()) return filterMistakes(local, options);
    const limit = Math.max(1, Math.min(500, Number(options.limit || 100)));
    let query = client().from("mistakes").select("*").order("updated_at", { ascending: false }).limit(limit);
    if (options.status && options.status !== "all") query = query.eq("status", options.status);
    else if (!options.status) query = query.eq("status", "active");
    if (options.gameId && options.gameId !== "all") query = query.eq("game_id", options.gameId);
    if (options.course && options.course !== "all") query = query.eq("course", options.course);
    if (options.difficulty && options.difficulty !== "all") query = query.eq("difficulty", options.difficulty);
    const { data, error } = await query;
    if (error) throw error;
    return filterMistakes(mergeMistakes(data || [], local), options).slice(0, limit);
  }

  async function getActiveMistakes(limit = 50) { return (await getMistakes({ status: "active", limit })).slice(0, limit); }
  function getLocalMistakes(options = {}) { return filterMistakes(localMistakes(), options); }
  function filterOptions(items) { const unique = key => [...new Set(items.map(item => item[key]).filter(Boolean))].sort(); return { games: unique("game_id"), courses: unique("course"), difficulties: unique("difficulty") }; }
  async function getMistakeFilterOptions() { return filterOptions(await getMistakes({ status: "all", limit: 500 })); }
  function getLocalMistakeFilterOptions() { return filterOptions(getLocalMistakes({ status: "all" })); }

  async function markMistakeMastered(mistakeId) {
    const userId = activeUserId();
    if (String(mistakeId).startsWith("local:")) {
      const key = String(mistakeId).slice(6);
      const namespace = userId || "guest";
      const mastered = readMastered(namespace);
      mastered.add(key);
      writeList(masteredKey(namespace), [...mastered], 1000);
      return { id: mistakeId, status: "mastered", local_only: true };
    }
    if (!userId) throw new Error("You must be signed in.");
    const { data, error } = await client().from("mistakes").update({ status: "mastered", updated_at: nowIso() }).eq("id", mistakeId).select().single();
    if (error) throw error;
    return data;
  }

  function makeDashboardSummary(attempts, mistakes) {
    const total = attempts.length;
    const correct = attempts.filter(item => item.is_correct).length;
    const byGame = {};
    attempts.forEach(item => {
      const id = item.game_id || "unknown-game";
      byGame[id] ||= { gameId: id, total: 0, correct: 0, accuracy: 0 };
      byGame[id].total++;
      if (item.is_correct) byGame[id].correct++;
    });
    Object.values(byGame).forEach(row => { row.accuracy = row.total ? Math.round(row.correct / row.total * 100) : 0; });
    return { total, correct, accuracy: total ? Math.round(correct / total * 100) : 0, activeMistakes: mistakes.filter(item => item.status === "active").length, byGame: Object.values(byGame).sort((a, b) => b.total - a.total), recentAttempts: attempts.slice(0, 12), mistakes: mistakes.slice(0, 30), guestAttempts: getGuestAttempts(), pendingSync: getPendingSyncCount() };
  }

  function getLocalDashboardSummary() { const attempts = [...namespaceAttempts()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); return makeDashboardSummary(attempts, localMistakes()); }
  async function getDashboardSummary() { return makeDashboardSummary(await getRecentAttempts(1000), await getActiveMistakes(1000)); }
  function getLocalExportData(userId = activeUserId()) {
    return {
      guest_attempts: getGuestAttempts(),
      account_cache: userId ? getAccountCache(userId) : [],
      pending_attempts: userId ? getPendingQueue(userId) : []
    };
  }
  function clearAccountLocalData(userId) {
    if (!userId) return;
    localStorage.removeItem(accountCacheKey(userId));
    localStorage.removeItem(accountQueueKey(userId));
    localStorage.removeItem(masteredKey(userId));
    localStorage.removeItem(`${MERGE_CHOICE_PREFIX}${userId}`);
    emitSyncChange(userId);
  }

  function mergeChoice(userId) { try { return JSON.parse(localStorage.getItem(`${MERGE_CHOICE_PREFIX}${userId}`) || "null"); } catch { return null; } }
  function setMergeChoice(userId, choice) { localStorage.setItem(`${MERGE_CHOICE_PREFIX}${userId}`, JSON.stringify({ choice, at: Date.now() })); }
  function shouldPromptMerge(userId) { const choice = mergeChoice(userId); return getGuestAttempts().length > 0 && (!choice || choice.choice === "later" && Date.now() - choice.at > 24 * 60 * 60 * 1000); }

  function showMergeDialog(userId) {
    if (!shouldPromptMerge(userId) || document.getElementById("mclGuestMergeDialog")) return;
    const zh = localStorage.getItem("mathcomplete_lang") === "zh";
    const dialog = document.createElement("dialog");
    dialog.className = "mcl-merge-dialog";
    dialog.id = "mclGuestMergeDialog";
    dialog.innerHTML = `<form method="dialog"><h2>${zh ? "合并本地练习记录？" : "Merge local practice?"}</h2><p>${zh ? `此设备上有 ${getGuestAttempts().length} 条访客记录。你可以把它们安全地合并到当前账户。` : `This device has ${getGuestAttempts().length} guest records. You can safely merge them into this account.`}</p><div class="mcl-merge-dialog__actions"><button value="merge" class="button primary">${zh ? "合并" : "Merge"}</button><button value="later" class="button secondary">${zh ? "稍后" : "Later"}</button><button value="decline" class="button secondary">${zh ? "不合并" : "Do not merge"}</button></div><p class="mcl-merge-dialog__status" aria-live="polite"></p></form>`;
    document.body.append(dialog);
    dialog.addEventListener("close", async () => {
      const choice = dialog.returnValue;
      if (choice === "merge") {
        dialog.querySelector(".mcl-merge-dialog__status").textContent = zh ? "正在同步……" : "Syncing...";
        const result = await syncGuestAttempts().catch(() => ({ synced: 0, failed: getGuestAttempts().length }));
        setMergeChoice(userId, result.failed ? "later" : "merged");
      } else if (choice === "decline") setMergeChoice(userId, "declined");
      else setMergeChoice(userId, "later");
      dialog.remove();
    });
    dialog.showModal();
  }

  let previousUserId = null;
  function handleAuth(snapshot) {
    const userId = snapshot?.status === "authenticated" ? snapshot.user?.id : null;
    if (!userId && previousUserId) localStorage.removeItem(accountCacheKey(previousUserId));
    previousUserId = userId || previousUserId;
    if (userId) {
      flushPendingAttempts(userId);
      const run = () => showMergeDialog(userId);
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true }); else run();
    }
  }

  migrateLegacyData();
  window.MCLAuth?.subscribe?.(handleAuth);

  window.MCLProgress = {
    recordAttempt, recordGameAttempt, syncGuestAttempts, flushPendingAttempts, getPendingSyncCount,
    getGuestAttempts, clearGuestAttempts, getRecentAttempts, getActiveMistakes, getMistakes, getMistakeFilterOptions,
    getLocalMistakes, getLocalMistakeFilterOptions, markMistakeMastered, getLocalDashboardSummary, getDashboardSummary, getLocalExportData, clearAccountLocalData,
    makeQuestionKey, normalizeAttempt
  };
})();
