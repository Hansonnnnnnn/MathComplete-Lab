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
    const attempt = {
      user_id: userId,
      game_id: safeString(payload.gameId || payload.game_id || "unknown-game"),
      course: safeString(payload.course || ""),
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

  function saveGuestAttempt(payload) {
    const attempts = getGuestAttempts();
    attempts.push(normalizeAttempt(payload, null));
    setGuestAttempts(attempts.slice(-500));
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
    if (!isConfigured()) {
      return saveGuestAttempt(payload);
    }

    try {
      return await recordCloudAttempt(payload);
    } catch (err) {
      console.warn("[MathComplete Lab] Cloud save failed; saved attempt locally.", err);
      return saveGuestAttempt(payload);
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
    const selectedAnswer = payload?.timeUp ? "" : payload?.selectedAnswer;

    return recordAttempt({
      gameId: payload?.gameId || gameIdFromPath(),
      course: payload?.course || "math",
      topic: payload?.topic || topicFrom(question),
      difficulty: payload?.difficulty || question?.difficulty || "",
      questionLatex: payload?.questionLatex || questionLatexFrom(question),
      questionText: payload?.questionText || questionTextFrom(question),
      correctAnswerLatex: safeString(payload?.correctAnswer),
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

    for (const attempt of guestAttempts) {
      results.push(await recordCloudAttempt(attempt));
    }

    clearGuestAttempts();
    return { synced: results.length, results };
  }

  async function getRecentAttempts(limit = 20) {
    if (!isConfigured()) return [];

    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await client()
      .from("attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async function getActiveMistakes(limit = 50) {
    if (!isConfigured()) return [];

    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await client()
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
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

  async function getDashboardSummary() {
    const attempts = await getRecentAttempts(1000);
    const mistakes = await getActiveMistakes(1000);

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

  window.MCLProgress = {
    recordAttempt,
    recordGameAttempt,
    syncGuestAttempts,
    getGuestAttempts,
    clearGuestAttempts,
    getRecentAttempts,
    getActiveMistakes,
    markMistakeMastered,
    getDashboardSummary,
    makeQuestionKey,
    normalizeAttempt
  };
})();
