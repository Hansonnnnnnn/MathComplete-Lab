/*
  MathComplete Lab - Progress + Mistake Tracking

  Requires:
  1. Supabase CDN script
  2. assets/js/supabase-client.js
  3. assets/js/auth.js

  Main function for games:
  await MCLProgress.recordAttempt({
    gameId: "special-products",
    course: "algebra-1",
    topic: q.type,
    difficulty: q.difficulty,
    questionLatex: q.main,
    questionText: q.plain,
    correctAnswerLatex: correctDisplay,
    selectedAnswerLatex: answerToString(selected),
    isCorrect: true/false,
    timeSpentSeconds: 18
  });
*/

(function () {
  window.MCL = window.MCL || {};

  const GUEST_ATTEMPTS_KEY = "mcl_guest_attempts_v1";
  const LOCAL_ATTEMPTS_KEY = "mcl_recent_attempts_v1";
  const GAME_COURSES = {
    "arithmetic-within-10": "pre-algebra",
    "arithmetic-within-100": "pre-algebra",
    "arithmetic-within-1000": "pre-algebra",
    "set-theory-basics": "pre-algebra",
    "gcd-lcm": "pre-algebra",
    "fraction-percent": "pre-algebra",
    "algebra-expression": "algebra-1",
    "algebra-simplification": "algebra-1",
    "linear-equation": "algebra-1",
    "slope-from-two-points": "algebra-1",
    "function-evaluation": "algebra-1",
    "factoring-practice": "algebra-1",
    "special-products": "algebra-1",
    "completing-the-square": "algebra-2",
    "exponential-functions": "algebra-2",
    "logarithmic-functions": "algebra-2",
    "radical-functions": "algebra-2",
    "advanced-equation-solving": "precalculus",
    "geometry-formula": "geometry-1",
    "derivative-practice": "single-variable-calculus",
    "vector-operations": "linear-algebra",
    "matrix-multiplication": "linear-algebra",
    "determinant-practice": "linear-algebra"
  };

  function client() {
    return window.MCL.supabaseClient;
  }

  function isConfigured() {
    return Boolean(window.MCLAuth?.isConfigured?.() && client());
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safeString(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function withTimeout(promise, ms, message) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
  }

  function hashString(input) {
    const str = safeString(input);
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;

    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return combined.toString(36);
  }

  function makeQuestionKey(attempt) {
    if (attempt.questionKey) return safeString(attempt.questionKey);
    return hashString([
      attempt.gameId,
      attempt.topic,
      attempt.difficulty,
      attempt.questionLatex || attempt.questionText,
      attempt.correctAnswerLatex
    ].join("|"));
  }

  function normalizeAttempt(payload, userId = null) {
    const gameId = safeString(payload.gameId || payload.game_id || "unknown-game");
    const attempt = {
      user_id: userId,
      game_id: gameId,
      course: safeString(payload.course || GAME_COURSES[gameId] || ""),
      topic: safeString(payload.topic || ""),
      difficulty: safeString(payload.difficulty || ""),
      question_key: "",
      question_latex: safeString(payload.questionLatex || payload.question_latex || ""),
      question_text: safeString(payload.questionText || payload.question_text || ""),
      correct_answer_latex: safeString(payload.correctAnswerLatex || payload.correct_answer_latex || ""),
      selected_answer_latex: safeString(payload.selectedAnswerLatex || payload.selected_answer_latex || ""),
      is_correct: Boolean(payload.isCorrect ?? payload.is_correct),
      time_spent_seconds: Number.isFinite(Number(payload.timeSpentSeconds ?? payload.time_spent_seconds))
        ? Math.max(0, Math.round(Number(payload.timeSpentSeconds ?? payload.time_spent_seconds)))
        : null,
      created_at: payload.createdAt || payload.created_at || nowIso()
    };

    attempt.question_key = makeQuestionKey({
      gameId: attempt.game_id,
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      questionKey: payload.questionKey || payload.question_key,
      questionLatex: attempt.question_latex,
      questionText: attempt.question_text,
      correctAnswerLatex: attempt.correct_answer_latex
    });

    return attempt;
  }

  function getGuestAttempts() {
    try {
      const raw = localStorage.getItem(GUEST_ATTEMPTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setGuestAttempts(attempts) {
    localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  function clearGuestAttempts() {
    localStorage.removeItem(GUEST_ATTEMPTS_KEY);
  }

  function getLocalAttempts() {
    try {
      const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setLocalAttempts(attempts) {
    localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts.slice(-500)));
  }

  function attemptFingerprint(attempt) {
    return [
      safeString(attempt.game_id),
      safeString(attempt.question_key),
      safeString(attempt.selected_answer_latex),
      safeString(attempt.correct_answer_latex),
      safeString(attempt.created_at)
    ].join("|");
  }

  function saveLocalAttempt(attempt) {
    const normalized = normalizeAttempt(attempt, attempt.user_id || null);
    const attempts = getLocalAttempts();
    const key = attemptFingerprint(normalized);
    const withoutDuplicate = attempts.filter(item => attemptFingerprint(item) !== key);
    withoutDuplicate.push({
      ...normalized,
      local_only: true
    });
    setLocalAttempts(withoutDuplicate);
    return normalized;
  }

  function mergeAttempts(cloudAttempts, localAttempts) {
    const map = new Map();
    [...localAttempts, ...cloudAttempts].forEach(item => {
      const key = attemptFingerprint(item);
      map.set(key, item);
    });
    return [...map.values()].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  function sortAttempts(attempts) {
    return [...attempts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  function mistakeFingerprint(item) {
    return [
      safeString(item.game_id),
      safeString(item.question_key)
    ].join("|");
  }

  function localMistakesFromAttempts(attempts) {
    const map = new Map();
    attempts
      .filter(item => !item.is_correct)
      .forEach(item => {
        const key = mistakeFingerprint(item);
        const existing = map.get(key);
        const updatedAt = item.created_at || nowIso();
        if (existing) {
          existing.mistake_count += 1;
          if (new Date(updatedAt) > new Date(existing.updated_at || 0)) {
            existing.updated_at = updatedAt;
            existing.last_selected_answer_latex = item.selected_answer_latex;
          }
          return;
        }
        map.set(key, {
          id: `local:${key}`,
          user_id: item.user_id || null,
          game_id: item.game_id,
          course: item.course,
          topic: item.topic,
          difficulty: item.difficulty,
          question_key: item.question_key,
          question_latex: item.question_latex,
          question_text: item.question_text,
          correct_answer_latex: item.correct_answer_latex,
          last_selected_answer_latex: item.selected_answer_latex,
          mistake_count: 1,
          review_success_count: 0,
          status: "active",
          created_at: item.created_at,
          updated_at: updatedAt,
          local_only: true
        });
      });
    return [...map.values()].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }

  function mergeMistakes(cloudMistakes, localMistakes) {
    const map = new Map();
    [...localMistakes, ...cloudMistakes].forEach(item => {
      map.set(mistakeFingerprint(item), item);
    });
    return [...map.values()].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }

  function filterMistakes(mistakes, options = {}) {
    const status = options.status || "active";
    return mistakes.filter(item => {
      if (status !== "all" && item.status !== status) return false;
      if (options.gameId && options.gameId !== "all" && item.game_id !== options.gameId) return false;
      if (options.course && options.course !== "all" && item.course !== options.course) return false;
      if (options.difficulty && options.difficulty !== "all" && item.difficulty !== options.difficulty) return false;
      return true;
    });
  }

  function saveGuestAttempt(payload) {
    const attempts = getGuestAttempts();
    const attempt = normalizeAttempt(payload, null);
    attempts.push(attempt);
    setGuestAttempts(attempts.slice(-500));
    saveLocalAttempt(attempt);
    return { savedLocally: true };
  }

  async function currentUserId() {
    if (!isConfigured()) return null;
    const { session } = await window.MCLAuth.getSession();
    return session?.user?.id || null;
  }

  async function upsertMistake(attempt) {
    const supabase = client();

    const baseFilter = query => query
      .eq("user_id", attempt.user_id)
      .eq("game_id", attempt.game_id)
      .eq("question_key", attempt.question_key);

    const { data: existing, error: readError } = await baseFilter(
      supabase
        .from("mistakes")
        .select("id,mistake_count")
        .maybeSingle()
    );

    if (readError) throw readError;

    if (existing?.id) {
      const { data, error } = await supabase
        .from("mistakes")
        .update({
          course: attempt.course,
          topic: attempt.topic,
          difficulty: attempt.difficulty,
          question_latex: attempt.question_latex,
          question_text: attempt.question_text,
          correct_answer_latex: attempt.correct_answer_latex,
          last_selected_answer_latex: attempt.selected_answer_latex,
          mistake_count: Number(existing.mistake_count || 0) + 1,
          review_success_count: 0,
          status: "active",
          updated_at: nowIso()
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("mistakes")
      .insert({
        user_id: attempt.user_id,
        game_id: attempt.game_id,
        course: attempt.course,
        topic: attempt.topic,
        difficulty: attempt.difficulty,
        question_key: attempt.question_key,
        question_latex: attempt.question_latex,
        question_text: attempt.question_text,
        correct_answer_latex: attempt.correct_answer_latex,
        last_selected_answer_latex: attempt.selected_answer_latex,
        mistake_count: 1,
        review_success_count: 0,
        status: "active"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function recordCloudAttempt(payload) {
    const userId = await currentUserId();

    if (!userId) {
      return saveGuestAttempt(payload);
    }

    const attempt = normalizeAttempt(payload, userId);
    const supabase = client();

    const { data, error } = await supabase
      .from("attempts")
      .insert(attempt)
      .select()
      .single();

    if (error) throw error;

    let mistake = null;
    if (!attempt.is_correct) {
      mistake = await upsertMistake(attempt);
    }

    return { attempt: data, mistake, savedLocally: false };
  }

  async function recordAttempt(payload) {
    const localAttempt = saveLocalAttempt(normalizeAttempt(payload, null));

    if (!isConfigured()) {
      return saveGuestAttempt(localAttempt);
    }

    try {
      return await recordCloudAttempt(localAttempt);
    } catch (err) {
      console.warn("[MathComplete Lab] Cloud save failed; saved attempt locally.", err);
      return saveGuestAttempt(localAttempt);
    }
  }

  function gameIdFromPath() {
    const file = window.location.pathname.split("/").pop() || "unknown-game.html";
    return file.replace(/\.html$/i, "") || "unknown-game";
  }

  function stripHtml(value) {
    const text = safeString(value);
    return text.replace(/<[^>]*>/g, "");
  }

  function questionTextFrom(question) {
    return safeString(
      question?.plain ||
      question?.equationText ||
      question?.expression ||
      question?.rawExpression ||
      stripHtml(question?.main || question?.displayExpression || "")
    );
  }

  function questionLatexFrom(question) {
    return safeString(
      question?.main ||
      question?.displayExpression ||
      question?.latex ||
      question?.equationText ||
      question?.plain ||
      question?.expression ||
      ""
    );
  }

  function topicFrom(question) {
    return safeString(question?.type || question?.templateId || question?.action || question?.topic || "");
  }

  function recordGameAttempt(payload) {
    const question = payload?.question || {};
    const gameId = payload?.gameId || gameIdFromPath();
    const fallbackCourse = GAME_COURSES[gameId] || "math";
    const selectedAnswer = payload?.timeUp
      ? ""
      : (payload?.selectedAnswer ?? payload?.selectedAnswerLatex ?? payload?.selected_answer_latex ?? "");

    return recordAttempt({
      gameId,
      course: payload?.course || fallbackCourse,
      topic: payload?.topic || topicFrom(question),
      difficulty: payload?.difficulty || question?.difficulty || "",
      questionLatex: payload?.questionLatex || questionLatexFrom(question),
      questionText: payload?.questionText || questionTextFrom(question),
      correctAnswerLatex: safeString(payload?.correctAnswer ?? payload?.correctAnswerLatex ?? payload?.correct_answer_latex),
      selectedAnswerLatex: safeString(selectedAnswer),
      isCorrect: Boolean(payload?.isCorrect),
      timeSpentSeconds: payload?.timeSpentSeconds
    });
  }

  async function syncGuestAttempts() {
    if (!isConfigured()) {
      throw new Error("Supabase is not configured.");
    }

    const userId = await currentUserId();
    if (!userId) {
      throw new Error("You must be signed in before syncing guest attempts.");
    }

    const guestAttempts = getGuestAttempts();
    const results = [];
    const remaining = [];

    for (const attempt of guestAttempts) {
      try {
        results.push(await withTimeout(
          recordCloudAttempt(attempt),
          10000,
          "Sync timed out. Your local records were kept."
        ));
      } catch (err) {
        console.warn("[MathComplete Lab] Guest attempt sync failed; kept locally.", err);
        remaining.push(attempt);
      }
    }

    if (remaining.length) setGuestAttempts(remaining);
    else clearGuestAttempts();

    return {
      synced: results.length,
      failed: remaining.length,
      results
    };
  }

  async function getRecentAttempts(limit = 20) {
    const local = getLocalAttempts();
    if (!isConfigured()) return sortAttempts(local).slice(0, limit);

    const userId = await currentUserId();
    if (!userId) return sortAttempts(local).slice(0, limit);

    const { data, error } = await client()
      .from("attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return mergeAttempts(data || [], local).slice(0, limit);
  }

  async function getActiveMistakes(limit = 50) {
    if (!isConfigured()) return localMistakesFromAttempts(getLocalAttempts()).slice(0, limit);

    const userId = await currentUserId();
    if (!userId) return localMistakesFromAttempts(getLocalAttempts()).slice(0, limit);

    const { data, error } = await client()
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return mergeMistakes(data || [], localMistakesFromAttempts(getLocalAttempts())).slice(0, limit);
  }

  async function getMistakes(options = {}) {
    const localMistakes = localMistakesFromAttempts(getLocalAttempts());
    if (!isConfigured()) return filterMistakes(localMistakes, options);

    const userId = await currentUserId();
    if (!userId) return filterMistakes(localMistakes, options);

    const limit = Math.max(1, Math.min(500, Number(options.limit || 100)));
    let query = client()
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (options.status && options.status !== "all") query = query.eq("status", options.status);
    else if (!options.status) query = query.eq("status", "active");

    if (options.gameId && options.gameId !== "all") query = query.eq("game_id", options.gameId);
    if (options.course && options.course !== "all") query = query.eq("course", options.course);
    if (options.difficulty && options.difficulty !== "all") query = query.eq("difficulty", options.difficulty);

    const { data, error } = await query;
    if (error) throw error;
    return filterMistakes(mergeMistakes(data || [], localMistakes), options).slice(0, limit);
  }

  async function getMistakeFilterOptions() {
    const mistakes = await getMistakes({ status: "all", limit: 500 });
    const unique = key => [...new Set(mistakes.map(item => item[key]).filter(Boolean))].sort();
    return {
      games: unique("game_id"),
      courses: unique("course"),
      difficulties: unique("difficulty")
    };
  }

  function getLocalMistakes(options = {}) {
    return filterMistakes(localMistakesFromAttempts(getLocalAttempts()), options);
  }

  function getLocalMistakeFilterOptions() {
    const mistakes = getLocalMistakes({ status: "all" });
    const unique = key => [...new Set(mistakes.map(item => item[key]).filter(Boolean))].sort();
    return {
      games: unique("game_id"),
      courses: unique("course"),
      difficulties: unique("difficulty")
    };
  }

  async function markMistakeMastered(mistakeId) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");

    const userId = await currentUserId();
    if (!userId) throw new Error("You must be signed in.");

    const { data, error } = await client()
      .from("mistakes")
      .update({
        status: "mastered",
        updated_at: nowIso()
      })
      .eq("id", mistakeId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  function makeDashboardSummary(attempts, mistakes) {
    const total = attempts.length;
    const correct = attempts.filter(x => x.is_correct).length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    const byGame = {};
    for (const item of attempts) {
      const id = item.game_id || "unknown-game";
      if (!byGame[id]) byGame[id] = { gameId: id, total: 0, correct: 0, accuracy: 0 };
      byGame[id].total++;
      if (item.is_correct) byGame[id].correct++;
    }

    Object.values(byGame).forEach(row => {
      row.accuracy = row.total ? Math.round((row.correct / row.total) * 100) : 0;
    });

    return {
      total,
      correct,
      accuracy,
      activeMistakes: mistakes.length,
      byGame: Object.values(byGame).sort((a, b) => b.total - a.total),
      recentAttempts: attempts.slice(0, 12),
      mistakes: mistakes.slice(0, 30),
      guestAttempts: getGuestAttempts()
    };
  }

  function getLocalDashboardSummary() {
    const attempts = sortAttempts(getLocalAttempts());
    const mistakes = localMistakesFromAttempts(attempts);
    return makeDashboardSummary(attempts, mistakes);
  }

  async function getDashboardSummary() {
    const attempts = await getRecentAttempts(1000);
    const mistakes = await getActiveMistakes(1000);
    return makeDashboardSummary(attempts, mistakes);
  }

  window.MCLProgress = {
    recordAttempt,
    recordGameAttempt,
    syncGuestAttempts,
    getGuestAttempts,
    clearGuestAttempts,
    getRecentAttempts,
    getActiveMistakes,
    getMistakes,
    getMistakeFilterOptions,
    getLocalMistakes,
    getLocalMistakeFilterOptions,
    markMistakeMastered,
    getLocalDashboardSummary,
    getDashboardSummary,
    makeQuestionKey,
    normalizeAttempt
  };
})();
