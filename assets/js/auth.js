/*
  MathComplete Lab - Auth Helpers
  Requires:
  1. Supabase CDN script
  2. assets/js/supabase-client.js
*/

(function () {
  window.MCL = window.MCL || {};

  const client = () => window.MCL.supabaseClient;

  function isConfigured() {
    return Boolean(window.MCL.supabaseConfig?.isConfigured && client());
  }

  function withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
      })
    ]);
  }

  function storageKey() {
    return window.MCL.supabaseConfig?.storageKey || "sb-hcrxxfcvmrjahnjlbjur-auth-token";
  }

  function normalizeSession(payload) {
    const expiresIn = Number(payload.expires_in || 3600);
    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      token_type: payload.token_type || "bearer",
      expires_in: expiresIn,
      expires_at: payload.expires_at || Math.floor(Date.now() / 1000) + expiresIn,
      user: payload.user || null
    };
  }

  function saveStoredSession(session) {
    localStorage.setItem(storageKey(), JSON.stringify(session));
  }

  function readStoredSession() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return null;

      const session = JSON.parse(raw);
      if (!session?.access_token || !session?.refresh_token) return null;

      return session;
    } catch {
      return null;
    }
  }

  function clearStoredSession() {
    localStorage.removeItem(storageKey());
  }

  function publicBaseUrl() {
    const origin = window.location.origin;
    const path = window.location.pathname;

    if (path.includes("/games/")) {
      return origin + path.split("/games/")[0] + "/";
    }

    const parts = path.split("/");
    parts.pop();
    return origin + parts.join("/") + "/";
  }

  async function getSession() {
    if (!isConfigured()) return { session: null, error: new Error("Supabase is not configured.") };

    try {
      const { data, error } = await withTimeout(
        client().auth.getSession(),
        3000,
        "Session read timed out."
      );
      return { session: data?.session || readStoredSession(), error };
    } catch (err) {
      console.warn("[MathComplete Lab] Falling back to stored session.", err);
      return { session: readStoredSession(), error: null };
    }
  }

  async function getUser() {
    if (!isConfigured()) return { user: null, error: new Error("Supabase is not configured.") };

    try {
      const { data, error } = await withTimeout(
        client().auth.getUser(),
        3000,
        "User read timed out."
      );
      return { user: data?.user || readStoredSession()?.user || null, error };
    } catch (err) {
      console.warn("[MathComplete Lab] Falling back to stored user.", err);
      return { user: readStoredSession()?.user || null, error: null };
    }
  }

  async function signIn(email, password) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    let data;
    let error;

    try {
      const result = await withTimeout(
        client().auth.signInWithPassword({ email, password }),
        10000,
        "Sign in timed out."
      );
      data = result.data;
      error = result.error;
    } catch (err) {
      if (!/timed out/i.test(err.message || "")) throw err;
      data = await signInWithPasswordRest(email, password);
    }

    if (error) throw error;

    if (data?.user) {
      ensureOwnProfile(data.user).catch(err => {
        console.warn("[MathComplete Lab] Could not ensure profile after sign in.", err);
      });
    }

    return data;
  }

  async function signInWithPasswordRest(email, password) {
    const response = await withTimeout(
      fetch(`${window.MCL.supabaseConfig.url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: window.MCL.supabaseConfig.key,
          Authorization: `Bearer ${window.MCL.supabaseConfig.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          gotrue_meta_security: {}
        })
      }),
      10000,
      "Sign in timed out. Check your network and Supabase settings."
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.msg || payload.message || "Could not sign in.");
    }

    if (!payload.access_token || !payload.refresh_token) {
      throw new Error("Sign in succeeded, but Supabase did not return a session.");
    }

    const session = normalizeSession(payload);

    try {
      const { data, error } = await withTimeout(
        client().auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        }),
        3000,
        "SDK session store timed out."
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("[MathComplete Lab] Supabase SDK could not store session; using local storage fallback.", err);
      saveStoredSession(session);
      return { session, user: session.user };
    }
  }

  async function signUp(email, password, displayName = "") {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    const { data, error } = await withTimeout(
      client().auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          },
          emailRedirectTo: publicBaseUrl() + "login.html"
        }
      }),
      10000,
      "Sign up timed out. Check your network and Supabase settings."
    );
    if (error) throw error;

    if (data?.user && data?.session) {
      await upsertOwnProfile({
        id: data.user.id,
        email: data.user.email,
        display_name: displayName || data.user.email?.split("@")[0] || "",
        plan: "free"
      });
    }

    return data;
  }

  async function signOut() {
    if (!isConfigured()) return;
    clearStoredSession();

    const { error } = await withTimeout(
      client().auth.signOut({ scope: "local" }),
      5000,
      "Sign out timed out."
    );

    if (error) throw error;
  }

  async function sendPasswordReset(email) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    const { data, error } = await client().auth.resetPasswordForEmail(email, {
      redirectTo: publicBaseUrl() + "login.html"
    });
    if (error) throw error;
    return data;
  }

  async function updatePassword(newPassword) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    const { data, error } = await client().auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  }

  async function getOwnProfile() {
    if (!isConfigured()) return { profile: null, error: new Error("Supabase is not configured.") };

    const { user, error: userError } = await getUser();
    if (userError || !user) return { profile: null, error: userError || null };

    const { data, error } = await client()
      .from("profiles")
      .select("id,email,display_name,plan,created_at,updated_at")
      .eq("id", user.id)
      .maybeSingle();

    return { profile: data || null, error };
  }

  async function ensureOwnProfile(user) {
    if (!isConfigured() || !user?.id) return { profile: null, error: null };

    const { data: existing, error: readError } = await client()
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (readError) throw readError;
    if (existing?.id) return { profile: existing, error: null };

    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "";
    return upsertOwnProfile({
      id: user.id,
      email: user.email,
      display_name: displayName,
      plan: "free"
    });
  }

  async function upsertOwnProfile(profile) {
    if (!isConfigured()) return { profile: null, error: new Error("Supabase is not configured.") };
    const { data, error } = await client()
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  }

  function onAuthStateChange(callback) {
    if (!isConfigured()) return { data: { subscription: { unsubscribe() {} } } };
    return client().auth.onAuthStateChange(callback);
  }

  window.MCLAuth = {
    isConfigured,
    publicBaseUrl,
    getCachedSession: readStoredSession,
    getSession,
    getUser,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    getOwnProfile,
    ensureOwnProfile,
    upsertOwnProfile,
    onAuthStateChange
  };
})();
