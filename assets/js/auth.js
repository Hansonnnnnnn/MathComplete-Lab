/* MathComplete Lab - centralized authentication state and account API. */
(function () {
  "use strict";

  window.MCL = window.MCL || {};

  const listeners = new Set();
  const callbackReturnKey = "mcl_auth_return_to";
  const recentReauthKey = "mcl_recent_reauth_at";
  const minimumPasswordLength = Number(window.MCL.appConfig?.minimumPasswordLength || 12);
  let initialization = null;
  let recoveryEventSeen = false;
  let state = Object.freeze({
    status: "loading",
    session: null,
    user: null,
    profile: null,
    entitlement: null,
    error: null
  });

  const client = () => window.MCL.supabaseClient;

  function isConfigured() {
    return Boolean(window.MCL.supabaseConfig?.isConfigured && client());
  }

  function currentLanguage() {
    return localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  }

  function publicBaseUrl() {
    return typeof window.MCL.publicBaseUrl === "function"
      ? window.MCL.publicBaseUrl()
      : `${location.origin}${location.pathname.slice(0, location.pathname.lastIndexOf("/") + 1)}`;
  }

  function pageUrl(page) {
    return new URL(String(page || ""), publicBaseUrl()).href;
  }

  function safeReturnTo(value, fallback = "practice.html") {
    const raw = String(value || "").trim();
    if (!raw) return fallback;

    try {
      const base = new URL(publicBaseUrl());
      const target = new URL(raw, base);
      if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) return fallback;
      return `${target.pathname.slice(base.pathname.length)}${target.search}${target.hash}` || fallback;
    } catch {
      return fallback;
    }
  }

  function rememberReturnTo(value) {
    sessionStorage.setItem(callbackReturnKey, safeReturnTo(value));
  }

  function consumeReturnTo(fallback = "practice.html") {
    const value = sessionStorage.getItem(callbackReturnKey);
    sessionStorage.removeItem(callbackReturnKey);
    return safeReturnTo(value, fallback);
  }

  function setState(next) {
    state = Object.freeze({ ...state, ...next });
    const snapshot = state;
    listeners.forEach(listener => {
      try { listener(snapshot); } catch (error) { console.error(error); }
    });
    window.dispatchEvent(new CustomEvent("mcl:authchange", { detail: snapshot }));
  }

  function getState() {
    return state;
  }

  function subscribe(listener, options = {}) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    if (options.immediate !== false) listener(state);
    return () => listeners.delete(listener);
  }

  function withTimeout(promise, ms, code = "network_timeout") {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error(code), { code })), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function errorCode(error) {
    return String(error?.code || error?.name || "").toLowerCase();
  }

  function formatError(error, lang = currentLanguage()) {
    const raw = String(error?.message || error || "").toLowerCase();
    const code = errorCode(error);
    const zh = lang === "zh";

    if (code.includes("network") || code.includes("timeout") || raw.includes("fetch") || raw.includes("timed out")) {
      return zh ? "网络连接超时，请检查网络后重试。" : "The connection timed out. Check your network and try again.";
    }
    if (raw.includes("invalid login") || raw.includes("invalid credentials")) {
      return zh ? "邮箱或密码不正确。" : "The email or password is incorrect.";
    }
    if (raw.includes("email not confirmed")) {
      return zh ? "请先完成邮箱验证，再登录。" : "Verify your email before signing in.";
    }
    if (raw.includes("password") && (raw.includes("short") || raw.includes("characters"))) {
      return zh ? `密码至少需要 ${minimumPasswordLength} 位。` : `Use at least ${minimumPasswordLength} characters for your password.`;
    }
    if (raw.includes("already registered") || raw.includes("user already exists")) {
      return zh ? "无法完成注册，请检查邮箱或尝试登录。" : "We could not complete sign-up. Check the email or try signing in.";
    }
    if (raw.includes("rate limit") || raw.includes("too many")) {
      return zh ? "尝试次数过多，请稍后再试。" : "Too many attempts. Please wait and try again.";
    }
    if (raw.includes("captcha")) {
      return zh ? "安全验证未完成，请重试。" : "The security check was not completed. Try again.";
    }
    if (raw.includes("mfa") || raw.includes("factor") || raw.includes("verification code")) {
      return zh ? "验证码无效或已过期，请重新输入。" : "The verification code is invalid or expired.";
    }
    if (raw.includes("same password")) {
      return zh ? "新密码不能与当前密码相同。" : "Choose a password different from the current password.";
    }
    return zh ? "操作未完成，请稍后重试。" : "We could not complete that action. Please try again.";
  }

  function validatePassword(password) {
    const value = String(password || "");
    if (value.length < minimumPasswordLength) {
      const error = new Error(`Password must be at least ${minimumPasswordLength} characters.`);
      error.code = "weak_password";
      throw error;
    }
    return value;
  }

  async function loadAccountData(user) {
    if (!user?.id) return { profile: null, entitlement: null };
    const [profileResult, entitlementResult] = await Promise.all([
      client().from("profiles").select("id,email,display_name,created_at,updated_at").eq("id", user.id).maybeSingle(),
      client().from("account_entitlements").select("plan,role,updated_at").eq("user_id", user.id).maybeSingle()
    ]);

    if (profileResult.error) {
      console.warn("[MathComplete Lab] Profile read failed.", profileResult.error);
    }
    if (entitlementResult.error) {
      console.warn("[MathComplete Lab] Entitlement read failed.", entitlementResult.error);
    }
    return {
      profile: profileResult.data || null,
      entitlement: entitlementResult.data || { plan: "free", role: "user" }
    };
  }

  async function resolveAuthenticatedState(session, event = "") {
    if (!session?.access_token) {
      setState({ status: "anonymous", session: null, user: null, profile: null, entitlement: null, error: null });
      return state;
    }

    let user;
    try {
      const result = await withTimeout(client().auth.getUser(session.access_token), 8000);
      if (result.error) throw result.error;
      user = result.data?.user;
    } catch (error) {
      setState({ status: "error", session: null, user: null, profile: null, entitlement: null, error });
      return state;
    }

    if (!user) {
      setState({ status: "anonymous", session: null, user: null, profile: null, entitlement: null, error: null });
      return state;
    }

    let status = event === "PASSWORD_RECOVERY" || recoveryEventSeen ? "recovery" : "authenticated";
    try {
      const [{ data: factors }, { data: assurance }] = await Promise.all([
        client().auth.mfa.listFactors(),
        client().auth.mfa.getAuthenticatorAssuranceLevel()
      ]);
      const hasVerifiedFactor = (factors?.totp || []).some(factor => factor.status === "verified");
      if (status !== "recovery" && hasVerifiedFactor && assurance?.currentLevel !== "aal2") status = "mfa-required";
    } catch (error) {
      console.warn("[MathComplete Lab] MFA state check failed.", error);
    }

    const account = await loadAccountData(user).catch(() => ({ profile: null, entitlement: null }));
    setState({ status, session: { ...session, user }, user, ...account, error: null });
    return state;
  }

  async function initialize(force = false) {
    if (!isConfigured()) {
      setState({ status: "error", error: new Error("Supabase is not configured.") });
      return state;
    }
    if (initialization && !force) return initialization;

    initialization = (async () => {
      if (window.MCL.isRememberedSessionExpired?.()) window.MCL.clearAuthStorage?.();
      try {
        const { data, error } = await withTimeout(client().auth.getSession(), 8000);
        if (error) throw error;
        return await resolveAuthenticatedState(data?.session || null);
      } catch (error) {
        setState({ status: "error", session: null, user: null, profile: null, entitlement: null, error });
        return state;
      }
    })().finally(() => { initialization = null; });

    return initialization;
  }

  async function getSession() {
    if (state.status === "loading") await initialize();
    return { session: state.session, error: state.status === "error" ? state.error : null };
  }

  async function getUser() {
    if (state.status === "loading") await initialize();
    return { user: state.user, error: state.status === "error" ? state.error : null };
  }

  async function signInWithPassword(email, password, options = {}) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    window.MCL.setAuthPersistence(options.remember ? "local" : "session");
    const { data, error } = await withTimeout(client().auth.signInWithPassword({
      email: String(email || "").trim(),
      password: String(password || ""),
      options: options.captchaToken ? { captchaToken: options.captchaToken } : undefined
    }), 12000);
    if (error) throw error;
    await resolveAuthenticatedState(data?.session || null, "SIGNED_IN");
    return data;
  }

  async function signInWithGoogle(options = {}) {
    window.MCL.setAuthPersistence(options.remember ? "local" : "session");
    rememberReturnTo(options.returnTo || "practice.html");
    const redirectTo = `${pageUrl("auth-callback.html")}?mode=oauth`;
    const { data, error } = await client().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: options.prompt || "select_account" } }
    });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password, displayName = "", options = {}) {
    validatePassword(password);
    window.MCL.setAuthPersistence("session");
    const acceptedAt = new Date().toISOString();
    const metadata = {
      display_name: String(displayName || "").trim(),
      age_confirmed: Boolean(options.ageConfirmed),
      terms_version: window.MCL.appConfig?.termsVersion,
      privacy_version: window.MCL.appConfig?.privacyVersion,
      consent_accepted_at: acceptedAt
    };
    const { data, error } = await withTimeout(client().auth.signUp({
      email: String(email || "").trim(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${pageUrl("auth-callback.html")}?mode=verify`,
        ...(options.captchaToken ? { captchaToken: options.captchaToken } : {})
      }
    }), 12000);
    if (error) throw error;
    if (data?.session) await resolveAuthenticatedState(data.session, "SIGNED_IN");
    return data;
  }

  async function resendConfirmation(email, captchaToken = "") {
    const { data, error } = await client().auth.resend({
      type: "signup",
      email: String(email || "").trim(),
      options: {
        emailRedirectTo: `${pageUrl("auth-callback.html")}?mode=verify`,
        ...(captchaToken ? { captchaToken } : {})
      }
    });
    if (error) throw error;
    return data;
  }

  async function requestPasswordReset(email, captchaToken = "") {
    const { data, error } = await client().auth.resetPasswordForEmail(String(email || "").trim(), {
      redirectTo: `${pageUrl("auth-callback.html")}?mode=recovery`,
      ...(captchaToken ? { captchaToken } : {})
    });
    if (error) throw error;
    return data;
  }

  async function completeAuthCallback(url = location.href) {
    const callbackUrl = new URL(url);
    const code = callbackUrl.searchParams.get("code");
    const mode = callbackUrl.searchParams.get("mode") || "oauth";
    if (!code) throw Object.assign(new Error("The authentication link is invalid or expired."), { code: "missing_auth_code" });
    const { data, error } = await client().auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (mode === "recovery") recoveryEventSeen = true;
    await resolveAuthenticatedState(data?.session || null, mode === "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN");
    return { ...data, mode, state };
  }

  async function updatePassword(newPassword) {
    validatePassword(newPassword);
    const { data, error } = await client().auth.updateUser({ password: newPassword });
    if (error) throw error;
    recoveryEventSeen = false;
    await initialize(true);
    return data;
  }

  async function updateEmail(email) {
    const { data, error } = await client().auth.updateUser({ email: String(email || "").trim() });
    if (error) throw error;
    return data;
  }

  async function updateProfile(displayName) {
    if (!state.user?.id) throw new Error("You must be signed in.");
    const { data, error } = await client().from("profiles")
      .update({ display_name: String(displayName || "").trim() })
      .eq("id", state.user.id)
      .select("id,email,display_name,created_at,updated_at")
      .single();
    if (error) throw error;
    setState({ profile: data });
    return data;
  }

  async function getConsent() {
    if (!state.user?.id) return null;
    const { data, error } = await client().from("user_consents")
      .select("terms_version,privacy_version,age_confirmed,accepted_at")
      .eq("user_id", state.user.id)
      .maybeSingle();
    if (error && !String(error.message || "").includes("user_consents")) throw error;
    return data || null;
  }

  async function acceptConsents() {
    if (!state.user?.id) throw new Error("You must be signed in.");
    const { data, error } = await client().rpc("accept_current_consents", {
      p_terms_version: window.MCL.appConfig?.termsVersion,
      p_privacy_version: window.MCL.appConfig?.privacyVersion,
      p_age_confirmed: true
    });
    if (error) throw error;
    return data;
  }

  async function getOwnProfile() {
    if (state.status === "loading") await initialize();
    return { profile: state.profile, entitlement: state.entitlement, error: state.error };
  }

  async function listFactors() {
    const { data, error } = await client().auth.mfa.listFactors();
    if (error) throw error;
    return data;
  }

  async function enrollTotp(friendlyName = "MathComplete Lab") {
    const { data, error } = await client().auth.mfa.enroll({ factorType: "totp", friendlyName, issuer: "MathComplete Lab" });
    if (error) throw error;
    return data;
  }

  async function verifyTotp(factorId, code) {
    const { data, error } = await client().auth.mfa.challengeAndVerify({ factorId, code: String(code || "").trim() });
    if (error) throw error;
    await initialize(true);
    return data;
  }

  async function unenrollFactor(factorId) {
    const { data, error } = await client().auth.mfa.unenroll({ factorId });
    if (error) throw error;
    await initialize(true);
    return data;
  }

  async function verifyMfaChallenge(code, factorId = "") {
    const factors = await listFactors();
    const factor = factorId
      ? (factors?.totp || []).find(item => item.id === factorId)
      : (factors?.totp || []).find(item => item.status === "verified");
    if (!factor) throw new Error("No verified authenticator was found.");
    return verifyTotp(factor.id, code);
  }

  async function linkGoogleIdentity() {
    rememberReturnTo("account.html?linked=google");
    const { data, error } = await client().auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${pageUrl("auth-callback.html")}?mode=oauth` }
    });
    if (error) throw error;
    return data;
  }

  async function unlinkIdentity(identity) {
    const { data, error } = await client().auth.unlinkIdentity(identity);
    if (error) throw error;
    await initialize(true);
    return data;
  }

  async function reauthenticateWithPassword(password) {
    if (!state.user?.email) throw new Error("Email sign-in is not available for this account.");
    const data = await signInWithPassword(state.user.email, password, {
      remember: window.MCL.getAuthPersistence?.() === "local"
    });
    sessionStorage.setItem(recentReauthKey, String(Date.now()));
    return data;
  }

  async function reauthenticateWithGoogle(returnTo = "account.html?action=delete") {
    sessionStorage.setItem(recentReauthKey, String(Date.now()));
    return signInWithGoogle({
      remember: window.MCL.getAuthPersistence?.() === "local",
      returnTo,
      prompt: "select_account"
    });
  }

  function hasRecentReauthentication(maxAgeMs = 10 * 60 * 1000) {
    return Date.now() - Number(sessionStorage.getItem(recentReauthKey) || 0) <= maxAgeMs;
  }

  async function invokeAccountSecurity(action, payload = {}) {
    const { data, error } = await client().functions.invoke("account-security", {
      body: { action, ...payload }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }

  async function signOut(scope = "local") {
    if (!isConfigured()) return;
    const safeScope = ["local", "global", "others"].includes(scope) ? scope : "local";
    const { error } = await withTimeout(client().auth.signOut({ scope: safeScope }), 8000);
    if (error) throw error;
    if (safeScope !== "others") {
      window.MCL.clearAuthStorage?.();
      setState({ status: "anonymous", session: null, user: null, profile: null, entitlement: null, error: null });
    }
  }

  function onAuthStateChange(callback) {
    if (!isConfigured()) return { data: { subscription: { unsubscribe() {} } } };
    return client().auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") recoveryEventSeen = true;
      window.setTimeout(() => {
        resolveAuthenticatedState(session, event).catch(error => {
          setState({ status: "error", error });
        });
      }, 0);
      callback?.(event, session);
    });
  }

  window.MCLAuth = {
    isConfigured,
    publicBaseUrl,
    pageUrl,
    safeReturnTo,
    rememberReturnTo,
    consumeReturnTo,
    getState,
    subscribe,
    initialize,
    getSession,
    getUser,
    getCachedSession: () => state.session,
    signInWithPassword,
    signIn: signInWithPassword,
    signInWithGoogle,
    signUp,
    resendConfirmation,
    requestPasswordReset,
    sendPasswordReset: requestPasswordReset,
    completeAuthCallback,
    updatePassword,
    updateEmail,
    updateProfile,
    getConsent,
    acceptConsents,
    getOwnProfile,
    ensureOwnProfile: async () => getOwnProfile(),
    upsertOwnProfile: async profile => updateProfile(profile?.display_name || ""),
    listFactors,
    enrollTotp,
    verifyTotp,
    verifyMfaChallenge,
    unenrollFactor,
    linkGoogleIdentity,
    unlinkIdentity,
    reauthenticateWithPassword,
    reauthenticateWithGoogle,
    hasRecentReauthentication,
    invokeAccountSecurity,
    signOut,
    onAuthStateChange,
    formatError,
    validatePassword,
    minimumPasswordLength
  };

  onAuthStateChange();
  initialize();
})();
