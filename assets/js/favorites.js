/*
  MathComplete Lab - Favorite practice tools
  Requires:
  1. assets/js/supabase-client.js
  2. assets/js/auth.js
*/

(function () {
  const TABLE = "favorite_tools";
  const LOCAL_KEY_PREFIX = "mcl_favorite_tools_v1:";

  function config() {
    return window.MCL?.supabaseConfig || {};
  }

  async function currentSession() {
    const { session } = await window.MCLAuth.getSession();
    return session || null;
  }

  function cachedSession() {
    return window.MCLAuth?.getCachedSession?.() || null;
  }

  function localKey(session) {
    const userId = session?.user?.id || session?.user?.email || "guest";
    return `${LOCAL_KEY_PREFIX}${userId}`;
  }

  function normalizeRows(gameIds) {
    return [...new Set(gameIds)].map(gameId => ({ game_id: gameId }));
  }

  function readLocalFavorites(session) {
    try {
      const raw = localStorage.getItem(localKey(session));
      const parsed = raw ? JSON.parse(raw) : [];
      return normalizeRows(Array.isArray(parsed) ? parsed : []);
    } catch {
      return [];
    }
  }

  function writeLocalFavorites(session, rows) {
    const ids = rows.map(item => item.game_id).filter(Boolean);
    localStorage.setItem(localKey(session), JSON.stringify([...new Set(ids)]));
  }

  function updateLocalFavorite(session, gameId, shouldFavorite) {
    const ids = new Set(readLocalFavorites(session).map(item => item.game_id));
    if (shouldFavorite) {
      ids.add(gameId);
    } else {
      ids.delete(gameId);
    }

    const rows = normalizeRows([...ids]);
    writeLocalFavorites(session, rows);
    return rows;
  }

  function mergeFavoriteRows(...rowGroups) {
    const ids = [];
    rowGroups.flat().forEach(item => {
      if (item?.game_id && !ids.includes(item.game_id)) ids.push(item.game_id);
    });
    return normalizeRows(ids);
  }

  function authHeaders(session) {
    return {
      apikey: config().key,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    };
  }

  async function fetchWithTimeout(url, options = {}, ms = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Favorites request timed out. Check Supabase table setup and network.");
      }

      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function request(path, options = {}) {
    if (!window.MCLAuth?.isConfigured?.()) throw new Error("Supabase is not configured.");

    const session = await currentSession();
    if (!session?.user?.id || !session?.access_token) {
      return { signedIn: false, data: [] };
    }

    const response = await fetchWithTimeout(`${config().url}/rest/v1/${path}`, {
      ...options,
      headers: {
        ...authHeaders(session),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message = payload.message || payload.msg || "Could not update favorites.";
      if (message.includes("favorite_tools") || message.includes("schema cache")) {
        throw new Error("Favorites table is not ready. Run supabase/schema.sql in Supabase SQL Editor.");
      }

      throw new Error(message);
    }

    const data = response.status === 204 ? [] : await response.json().catch(() => []);
    return { signedIn: true, userId: session.user.id, data };
  }

  async function getFavorites() {
    const session = await currentSession();
    if (!session?.user?.id) return [];

    const localRows = readLocalFavorites(session);

    try {
      const result = await request(`${TABLE}?select=game_id,created_at&order=created_at.desc`);
      if (result.signedIn) {
        const mergedRows = mergeFavoriteRows(localRows, result.data);
        writeLocalFavorites(session, mergedRows);
        return mergedRows;
      }
    } catch (err) {
      console.warn("[MathComplete Lab] Using local favorite cache.", err);
    }

    return localRows;
  }

  function getCachedFavorites() {
    const session = cachedSession();
    if (!session?.user?.id) return [];
    return readLocalFavorites(session);
  }

  function setCachedFavorite(gameId, shouldFavorite) {
    const session = cachedSession();
    if (!session?.user?.id) return null;
    return updateLocalFavorite(session, gameId, shouldFavorite);
  }

  async function addFavorite(gameId) {
    const session = await currentSession();
    if (!session?.user?.id) throw new Error("You must be signed in.");

    await request(TABLE, {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({
        user_id: session.user.id,
        game_id: gameId
      })
    });
  }

  async function removeFavorite(gameId) {
    await request(`${TABLE}?game_id=eq.${encodeURIComponent(gameId)}`, {
      method: "DELETE"
    });
  }

  async function toggleFavorite(gameId, shouldFavorite) {
    const session = cachedSession() || await currentSession();
    if (!session?.user?.id) throw new Error("You must be signed in.");

    const localRows = updateLocalFavorite(session, gameId, shouldFavorite);

    if (shouldFavorite) {
      addFavorite(gameId).catch(err => {
        console.warn("[MathComplete Lab] Favorite saved locally but not synced yet.", err);
      });
    } else {
      removeFavorite(gameId).catch(err => {
        console.warn("[MathComplete Lab] Favorite removed locally but not synced yet.", err);
      });
    }

    return localRows;
  }

  window.MCLFavorites = {
    getFavorites,
    getCachedFavorites,
    setCachedFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };
})();
