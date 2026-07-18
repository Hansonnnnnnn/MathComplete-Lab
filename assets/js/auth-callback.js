(async function () {
  "use strict";

  const zh = localStorage.getItem("mathcomplete_lang") === "zh";
  const title = document.getElementById("callbackTitle");
  const message = document.getElementById("callbackMessage");
  const fallback = document.getElementById("callbackFallback");
  const params = new URLSearchParams(location.search);

  document.documentElement.lang = zh ? "zh-CN" : "en";
  title.textContent = zh ? "正在完成登录" : "Completing sign in";
  message.textContent = zh ? "正在安全验证你的账户……" : "Securely verifying your account...";
  fallback.textContent = zh ? "返回登录" : "Return to sign in";
  window.addEventListener("load", () => window.lucide?.createIcons?.(), { once: true });

  try {
    const result = await window.MCLAuth.completeAuthCallback(location.href);
    const returnTo = window.MCLAuth.consumeReturnTo("practice.html");

    if (result.mode === "recovery") {
      sessionStorage.setItem("mcl_recovery_session", "1");
      location.replace(window.MCLAuth.pageUrl("reset-password.html"));
      return;
    }

    if (result.state.status === "mfa-required") {
      const next = encodeURIComponent(returnTo);
      location.replace(window.MCLAuth.pageUrl(`login.html?mfa=1&returnTo=${next}`));
      return;
    }

    let consent = null;
    if (sessionStorage.getItem("mcl_pending_oauth_consent") === "1") {
      sessionStorage.removeItem("mcl_pending_oauth_consent");
      await window.MCLAuth.acceptConsents();
      consent = { age_confirmed: true };
    } else {
      consent = await window.MCLAuth.getConsent();
    }

    if (!consent?.age_confirmed) {
      window.MCLAuth.rememberReturnTo(returnTo);
      location.replace(window.MCLAuth.pageUrl("consent.html"));
      return;
    }

    location.replace(window.MCLAuth.pageUrl(returnTo));
  } catch (error) {
    title.textContent = zh ? "链接无法使用" : "This link could not be used";
    message.textContent = window.MCLAuth.formatError(error);
    fallback.hidden = false;
  }
})();
