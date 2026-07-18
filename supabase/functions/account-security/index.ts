import { createClient } from "npm:@supabase/supabase-js@2.106.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RECOVERY_PEPPER = Deno.env.get("MFA_RECOVERY_PEPPER") ?? "";
const configuredOrigins = (Deno.env.get("MCL_ALLOWED_ORIGINS") ?? "https://hansonnnnnnn.github.io,http://localhost:8000,http://127.0.0.1:8000")
  .split(",").map(value => value.trim()).filter(Boolean);

function corsHeaders(origin: string | null) {
  const allowed = origin && configuredOrigins.includes(origin) ? origin : configuredOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(origin: string | null, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function decodeJwt(token: string) {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("invalid_token");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
  return JSON.parse(atob(normalized));
}

function randomRecoveryCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const value = Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
  return `MCL-${value.slice(0, 5)}-${value.slice(5)}`;
}

async function hashRecoveryCode(userId: string, code: string) {
  if (!RECOVERY_PEPPER) throw new Error("recovery_pepper_not_configured");
  const bytes = new TextEncoder().encode(`${userId}:${code.trim().toUpperCase()}:${RECOVERY_PEPPER}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async request => {
  const origin = request.headers.get("Origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (request.method !== "POST") return json(origin, { error: "method_not_allowed" }, 405);
  if (origin && !configuredOrigins.includes(origin)) return json(origin, { error: "origin_not_allowed" }, 403);

  try {
    const authorization = request.headers.get("Authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) return json(origin, { error: "authentication_required" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) return json(origin, { error: "authentication_required" }, 401);
    const user = userData.user;
    const claims = decodeJwt(token);
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "generate-recovery-codes") {
      if (claims.aal !== "aal2") return json(origin, { error: "mfa_verification_required" }, 403);
      const codes = Array.from({ length: 8 }, randomRecoveryCode);
      const rows = await Promise.all(codes.map(async code => ({ user_id: user.id, code_hash: await hashRecoveryCode(user.id, code) })));
      const { error: clearError } = await admin.from("mfa_recovery_codes").delete().eq("user_id", user.id);
      if (clearError) throw clearError;
      const { error: insertError } = await admin.from("mfa_recovery_codes").insert(rows);
      if (insertError) throw insertError;
      return json(origin, { codes });
    }

    if (action === "consume-recovery-code") {
      const suppliedHash = await hashRecoveryCode(user.id, String(body.code || ""));
      const { data: rows, error: readError } = await admin.from("mfa_recovery_codes")
        .select("id,code_hash").eq("user_id", user.id).is("used_at", null);
      if (readError) throw readError;
      const match = rows?.find(row => row.code_hash === suppliedHash);
      if (!match) return json(origin, { error: "invalid_recovery_code" }, 400);

      const { data: usedRows, error: useError } = await admin.from("mfa_recovery_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("id", match.id)
        .is("used_at", null)
        .select("id");
      if (useError) throw useError;
      if (!usedRows?.length) return json(origin, { error: "invalid_recovery_code" }, 400);
      const { data: factors, error: factorError } = await admin.auth.admin.mfa.listFactors({ userId: user.id });
      if (factorError) throw factorError;
      for (const factor of factors?.factors ?? []) {
        if (factor.factor_type === "totp" && factor.status === "verified") {
          const { error } = await admin.auth.admin.mfa.deleteFactor({ userId: user.id, id: factor.id });
          if (error) throw error;
        }
      }
      return json(origin, { recovered: true, signInRequired: true });
    }

    if (action === "delete-account") {
      if (body.confirmation !== "DELETE") return json(origin, { error: "confirmation_required" }, 400);
      const issuedAt = Number(claims.iat || 0) * 1000;
      if (!issuedAt || Date.now() - issuedAt > 10 * 60 * 1000) return json(origin, { error: "recent_reauthentication_required" }, 403);

      const { data: factors, error: factorError } = await admin.auth.admin.mfa.listFactors({ userId: user.id });
      if (factorError) throw factorError;
      const hasVerifiedFactor = (factors?.factors ?? []).some(factor => factor.status === "verified");
      if (hasVerifiedFactor && claims.aal !== "aal2") return json(origin, { error: "mfa_verification_required" }, 403);

      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id, false);
      if (deleteError) throw deleteError;
      return json(origin, { deleted: true });
    }

    return json(origin, { error: "unknown_action" }, 400);
  } catch (error) {
    console.error(error);
    return json(origin, { error: error instanceof Error ? error.message : "internal_error" }, 500);
  }
});
