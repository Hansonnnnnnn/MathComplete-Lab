(function () {
  "use strict";

  const copy = {
    en: {
      badge: "Student account", heading: "Keep your math progress in one place.", intro: "Sign in to sync practice history, revisit mistakes, and continue on another device.",
      benefitSync: "Private cloud progress", benefitMistakes: "Mistake review across tools", benefitSecurity: "Optional authenticator protection",
      signInTab: "Sign in", signUpTab: "Create account", signInTitle: "Welcome back", signInLead: "Use your account to continue learning.",
      signUpTitle: "Create your account", signUpLead: "Practice as a guest anytime, or create an account for private cloud sync.", google: "Continue with Google", or: "or",
      displayName: "Display name", email: "Email", password: "Password", confirmPassword: "Confirm password", passwordHint: "Use at least 12 characters.",
      remember: "Remember me on this device for up to 30 days", acceptTerms: "I agree to the", terms: "Terms of Service", acceptPrivacy: "I have read the", privacy: "Privacy Policy", age: "I confirm that I am at least 13 years old.",
      signInButton: "Sign in", signUpButton: "Create account", forgot: "Forgot password?", signingIn: "Signing in...", signingUp: "Creating account...",
      checkEmail: "Check your email", verificationSent: "We sent a verification link to", resend: "Resend verification email", backToLogin: "Back to sign in", resent: "A new verification email has been sent.",
      passwordMismatch: "The passwords do not match.", consentRequired: "Accept the Terms, Privacy Policy, and confirm that you are at least 13.", resetSent: "If the address can receive account email, a reset link has been sent.", enterEmail: "Enter your email first.",
      mfaTitle: "Authenticator verification", mfaLead: "Enter the six-digit code from your authenticator app.", mfaCode: "Verification code", verify: "Verify", verifying: "Verifying...", verified: "Email verified. You can continue.", useRecoveryCode: "Use a recovery code", recoveryCode: "Recovery code", recoverAccount: "Recover account", recoveryComplete: "Authenticator protection was removed. Sign in again to continue.",
      showPassword: "Show password", hidePassword: "Hide password", fileMode: "This page was opened as a local file. Sign-in will return to the published site; use a local web server to test local callbacks."
    },
    zh: {
      badge: "学生账户", heading: "把数学学习进度整理在同一个地方。", intro: "登录后可同步练习记录、回顾错题，并在其他设备上继续学习。",
      benefitSync: "私密云端进度", benefitMistakes: "跨工具错题复盘", benefitSecurity: "可选验证器保护",
      signInTab: "登录", signUpTab: "创建账户", signInTitle: "欢迎回来", signInLead: "使用账户继续学习。",
      signUpTitle: "创建你的账户", signUpLead: "你可以随时以访客身份练习，也可以创建账户进行私密云端同步。", google: "使用 Google 继续", or: "或者",
      displayName: "显示名称", email: "邮箱", password: "密码", confirmPassword: "确认密码", passwordHint: "请使用至少 12 位密码。",
      remember: "在此设备上记住我，最长 30 天", acceptTerms: "我同意", terms: "服务条款", acceptPrivacy: "我已阅读", privacy: "隐私政策", age: "我确认本人已年满 13 岁。",
      signInButton: "登录", signUpButton: "创建账户", forgot: "忘记密码？", signingIn: "正在登录...", signingUp: "正在创建账户...",
      checkEmail: "请检查邮箱", verificationSent: "验证链接已发送至", resend: "重新发送验证邮件", backToLogin: "返回登录", resent: "新的验证邮件已经发送。",
      passwordMismatch: "两次输入的密码不一致。", consentRequired: "请同意服务条款、隐私政策，并确认本人已年满 13 岁。", resetSent: "如果该邮箱可以接收账户邮件，重置链接已经发送。", enterEmail: "请先输入邮箱。",
      mfaTitle: "验证器确认", mfaLead: "请输入验证器应用中的六位验证码。", mfaCode: "验证码", verify: "验证", verifying: "正在验证...", verified: "邮箱验证成功，可以继续。", useRecoveryCode: "使用恢复码", recoveryCode: "恢复码", recoverAccount: "恢复账户", recoveryComplete: "验证器保护已移除，请重新登录后继续。",
      showPassword: "显示密码", hidePassword: "隐藏密码", fileMode: "当前页面以本地文件方式打开。登录后会返回正式网站；如需测试本地回调，请使用本地 Web 服务器。"
    }
  };

  const language = () => localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  const tr = key => copy[language()][key] || copy.en[key] || key;
  const params = new URLSearchParams(location.search);
  const returnTo = window.MCLAuth.safeReturnTo(params.get("returnTo"), "practice.html");
  let mode = params.get("mode") === "signup" ? "signup" : "signin";
  let turnstileId = null;
  let captchaToken = "";
  let resendSeconds = 0;

  const mainPanel = document.getElementById("authMainPanel");
  const verificationPanel = document.getElementById("verificationPanel");
  const mfaPanel = document.getElementById("mfaPanel");
  const form = document.getElementById("authForm");
  const signInTab = document.getElementById("signInTab");
  const signUpTab = document.getElementById("signUpTab");
  const submitButton = document.getElementById("submitButton");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const authMessage = document.getElementById("authMessage");

  function showMessage(element, message, type = "") {
    element.textContent = message;
    element.className = `auth-message ${type}`.trim();
    element.hidden = false;
  }

  function clearMessage(element) {
    element.textContent = "";
    element.hidden = true;
  }

  function refreshIcons() {
    window.lucide?.createIcons?.({ attrs: { "aria-hidden": "true" } });
  }

  function applyLanguage() {
    document.documentElement.lang = language() === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-copy]").forEach(node => { node.textContent = tr(node.dataset.copy); });
    document.querySelectorAll("[data-password-toggle]").forEach(button => button.setAttribute("aria-label", tr("showPassword")));
    setMode(mode);
  }

  function setMode(next) {
    mode = next === "signup" ? "signup" : "signin";
    signInTab.classList.toggle("active", mode === "signin");
    signUpTab.classList.toggle("active", mode === "signup");
    signInTab.setAttribute("aria-selected", String(mode === "signin"));
    signUpTab.setAttribute("aria-selected", String(mode === "signup"));
    document.getElementById("nameField").hidden = mode !== "signup";
    document.getElementById("confirmField").hidden = mode !== "signup";
    document.getElementById("consentFields").hidden = mode !== "signup";
    document.getElementById("passwordStrengthWrap").hidden = mode !== "signup";
    document.getElementById("rememberField").hidden = mode !== "signin";
    document.getElementById("forgotButton").hidden = mode !== "signin";
    document.getElementById("formTitle").textContent = tr(mode === "signin" ? "signInTitle" : "signUpTitle");
    document.getElementById("formLead").textContent = tr(mode === "signin" ? "signInLead" : "signUpLead");
    submitButton.querySelector("span").textContent = tr(mode === "signin" ? "signInButton" : "signUpButton");
    password.autocomplete = mode === "signin" ? "current-password" : "new-password";
    clearMessage(authMessage);
    resetTurnstile();
  }

  function passwordScore(value) {
    if (!value) return 0;
    let score = value.length >= 12 ? 1 : 0;
    if (value.length >= 16) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(4, score);
  }

  function setupPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach(button => button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-label", tr(show ? "hidePassword" : "showPassword"));
      button.innerHTML = `<i data-lucide="${show ? "eye-off" : "eye"}"></i>`;
      refreshIcons();
    }));
  }

  function renderTurnstile() {
    if (!window.MCL.appConfig?.hasTurnstile) return;
    const wrap = document.getElementById("turnstileWrap");
    wrap.hidden = false;
    if (!window.turnstile || turnstileId !== null) return;
    turnstileId = window.turnstile.render("#turnstileWidget", {
      sitekey: window.MCL.appConfig.turnstileSiteKey,
      theme: window.MCLTheme?.get() === "dark" ? "dark" : "light",
      callback: token => { captchaToken = token; },
      "expired-callback": () => { captchaToken = ""; },
      "error-callback": () => { captchaToken = ""; }
    });
  }

  function resetTurnstile() {
    captchaToken = "";
    if (turnstileId !== null && window.turnstile) window.turnstile.reset(turnstileId);
  }

  function redirectAfterAuth() {
    location.href = window.MCLAuth.pageUrl(returnTo);
  }

  function showMfa() {
    mainPanel.hidden = true;
    verificationPanel.hidden = true;
    mfaPanel.hidden = false;
    document.getElementById("mfaCode").focus();
  }

  function showVerification(email) {
    mainPanel.hidden = true;
    mfaPanel.hidden = true;
    verificationPanel.hidden = false;
    document.getElementById("verificationEmail").textContent = email;
    startResendCountdown();
    refreshIcons();
  }

  function startResendCountdown() {
    resendSeconds = 60;
    const button = document.getElementById("resendButton");
    const timer = setInterval(() => {
      button.disabled = resendSeconds > 0;
      button.textContent = resendSeconds > 0 ? `${tr("resend")} (${resendSeconds}s)` : tr("resend");
      resendSeconds--;
      if (resendSeconds < 0) clearInterval(timer);
    }, 1000);
  }

  signInTab.addEventListener("click", () => setMode("signin"));
  signUpTab.addEventListener("click", () => setMode("signup"));
  password.addEventListener("input", () => { document.getElementById("passwordStrength").dataset.score = String(passwordScore(password.value)); });
  setupPasswordToggles();

  document.getElementById("googleButton").addEventListener("click", async () => {
    clearMessage(authMessage);
    if (mode === "signup") {
      if (!["termsConsent", "privacyConsent", "ageConsent"].every(id => document.getElementById(id).checked)) {
        return showMessage(authMessage, tr("consentRequired"), "error");
      }
      sessionStorage.setItem("mcl_pending_oauth_consent", "1");
    }
    try {
      await window.MCLAuth.signInWithGoogle({ remember: document.getElementById("rememberMe").checked, returnTo });
    } catch (error) {
      showMessage(authMessage, window.MCLAuth.formatError(error), "error");
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage(authMessage);
    const email = document.getElementById("email").value.trim();

    if (mode === "signup") {
      if (password.value !== confirmPassword.value) return showMessage(authMessage, tr("passwordMismatch"), "error");
      if (!["termsConsent", "privacyConsent", "ageConsent"].every(id => document.getElementById(id).checked)) return showMessage(authMessage, tr("consentRequired"), "error");
    }

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = tr(mode === "signin" ? "signingIn" : "signingUp");
    try {
      if (mode === "signin") {
        await window.MCLAuth.signInWithPassword(email, password.value, { remember: document.getElementById("rememberMe").checked, captchaToken });
        if (window.MCLAuth.getState().status === "mfa-required") showMfa();
        else redirectAfterAuth();
      } else {
        const result = await window.MCLAuth.signUp(email, password.value, document.getElementById("displayName").value, { ageConfirmed: true, captchaToken });
        if (result?.session) redirectAfterAuth();
        else showVerification(email);
      }
    } catch (error) {
      showMessage(authMessage, window.MCLAuth.formatError(error), "error");
      resetTurnstile();
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = tr(mode === "signin" ? "signInButton" : "signUpButton");
    }
  });

  document.getElementById("forgotButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    if (!email) return showMessage(authMessage, tr("enterEmail"), "error");
    try {
      await window.MCLAuth.requestPasswordReset(email, captchaToken);
      showMessage(authMessage, tr("resetSent"), "success");
      resetTurnstile();
    } catch (error) {
      showMessage(authMessage, window.MCLAuth.formatError(error), "error");
    }
  });

  document.getElementById("resendButton").addEventListener("click", async () => {
    const message = document.getElementById("verificationMessage");
    try {
      await window.MCLAuth.resendConfirmation(document.getElementById("verificationEmail").textContent);
      showMessage(message, tr("resent"), "success");
      startResendCountdown();
    } catch (error) {
      showMessage(message, window.MCLAuth.formatError(error), "error");
    }
  });

  document.getElementById("backToLoginButton").addEventListener("click", () => {
    verificationPanel.hidden = true;
    mainPanel.hidden = false;
    setMode("signin");
  });

  document.getElementById("mfaForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = document.getElementById("mfaButton");
    const message = document.getElementById("mfaMessage");
    button.disabled = true;
    button.textContent = tr("verifying");
    try {
      await window.MCLAuth.verifyMfaChallenge(document.getElementById("mfaCode").value);
      redirectAfterAuth();
    } catch (error) {
      showMessage(message, window.MCLAuth.formatError(error), "error");
    } finally {
      button.disabled = false;
      button.textContent = tr("verify");
    }
  });

  document.getElementById("recoveryCodeToggle").addEventListener("click", () => {
    const recoveryForm = document.getElementById("recoveryCodeForm");
    recoveryForm.hidden = !recoveryForm.hidden;
    if (!recoveryForm.hidden) document.getElementById("recoveryCode").focus();
  });

  document.getElementById("recoveryCodeForm").addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.getElementById("recoveryCodeMessage");
    try {
      await window.MCLAuth.invokeAccountSecurity("consume-recovery-code", { code: document.getElementById("recoveryCode").value });
      window.MCL.clearAuthStorage?.();
      showMessage(message, tr("recoveryComplete"), "success");
      setTimeout(() => location.replace(window.MCLAuth.pageUrl("login.html")), 900);
    } catch (error) {
      showMessage(message, window.MCLAuth.formatError(error), "error");
    }
  });

  async function initialize() {
    applyLanguage();
    refreshIcons();
    if (location.protocol === "file:") showMessage(authMessage, tr("fileMode"), "warning");
    const turnstileTimer = setInterval(() => {
      renderTurnstile();
      if (turnstileId !== null || !window.MCL.appConfig?.hasTurnstile) clearInterval(turnstileTimer);
    }, 250);

    const snapshot = await window.MCLAuth.initialize();
    if (snapshot.status === "mfa-required") return showMfa();
    if (snapshot.status === "authenticated" && params.get("stay") !== "1") return redirectAfterAuth();
    if (params.get("verified") === "1") showMessage(authMessage, tr("verified"), "success");
  }

  initialize();
})();
