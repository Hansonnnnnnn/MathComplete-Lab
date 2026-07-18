(function () {
  "use strict";

  const copy = {
    en: {
      title: "Account settings", lead: "Manage your profile, sign-in methods, security, and personal data.", profile: "Profile", profileLead: "Choose how your name appears and manage your verified email.", displayName: "Display name", saveName: "Save display name", email: "Email address", changeEmail: "Change email", plan: "Account plan", planLead: "Entitlements are managed securely by MathComplete Lab.",
      security: "Security", securityLead: "Use a strong password and optionally protect your account with an authenticator app.", newPassword: "New password", confirmPassword: "Confirm new password", updatePassword: "Update password", google: "Google sign-in", linked: "Linked", notLinked: "Not linked", linkGoogle: "Link Google", unlinkGoogle: "Unlink Google", mfa: "Authenticator app", mfaOn: "Enabled", mfaOff: "Not enabled", enableMfa: "Enable authenticator", disableMfa: "Disable", mfaInstructions: "Scan this QR code with an authenticator app, then enter the six-digit code.", verificationCode: "Verification code", verifyEnable: "Verify and enable", saveCodes: "Save these recovery codes now. Each code can be used once.", downloadCodes: "Download codes",
      sessions: "Sessions", sessionsLead: "Control where your account remains signed in.", otherDevices: "Other devices", otherDevicesLead: "Keep this device signed in and revoke other sessions.", signOutOthers: "Sign out other devices", allDevices: "All devices", allDevicesLead: "End every session, including this one.", signOutAll: "Sign out everywhere",
      data: "Your data", dataLead: "Download a JSON copy of your profile, attempts, mistakes, favorites, and consent record.", export: "Download my data", deleteTitle: "Delete account", deleteLead: "This immediately and permanently removes your account and cloud learning records.", currentPassword: "Current password", reauthPassword: "Verify with password", reauthGoogle: "Verify with Google", typeDelete: "Type DELETE to confirm", deleteButton: "Permanently delete account", loading: "Loading account...",
      saved: "Saved.", emailSent: "Check both the current and new email addresses to confirm the change.", passwordUpdated: "Password updated.", mismatch: "The passwords do not match.", mfaEnabled: "Authenticator protection is enabled.", mfaDisabled: "Authenticator protection is disabled.", sessionsCleared: "Other device sessions have been revoked.", exported: "Your data export has downloaded.", reauthenticated: "Identity verified. Complete the confirmation below within 10 minutes.", reauthNeeded: "Verify your identity again before deleting the account.", typeDeleteError: "Type DELETE exactly to confirm.", deleted: "Your account has been deleted.", functionMissing: "The secure account function is not deployed yet. Follow the Supabase deployment instructions.", operationFailed: "The action could not be completed."
    },
    zh: {
      title: "账户设置", lead: "管理个人资料、登录方式、安全设置和个人数据。", profile: "个人资料", profileLead: "设置名称的显示方式并管理已验证邮箱。", displayName: "显示名称", saveName: "保存显示名称", email: "邮箱地址", changeEmail: "更换邮箱", plan: "账户方案", planLead: "账户权限由 MathComplete Lab 安全管理。",
      security: "安全设置", securityLead: "使用强密码，并可选择使用验证器应用保护账户。", newPassword: "新密码", confirmPassword: "确认新密码", updatePassword: "更新密码", google: "Google 登录", linked: "已关联", notLinked: "未关联", linkGoogle: "关联 Google", unlinkGoogle: "解除 Google", mfa: "验证器应用", mfaOn: "已开启", mfaOff: "未开启", enableMfa: "开启验证器", disableMfa: "关闭", mfaInstructions: "使用验证器应用扫描二维码，然后输入六位验证码。", verificationCode: "验证码", verifyEnable: "验证并开启", saveCodes: "请立即保存这些恢复码，每个恢复码只能使用一次。", downloadCodes: "下载恢复码",
      sessions: "登录会话", sessionsLead: "管理账户保持登录的位置。", otherDevices: "其他设备", otherDevicesLead: "保留当前设备登录并撤销其他会话。", signOutOthers: "退出其他设备", allDevices: "全部设备", allDevicesLead: "结束包括当前设备在内的全部会话。", signOutAll: "退出所有设备",
      data: "你的数据", dataLead: "下载包含个人资料、答题、错题、收藏和同意记录的 JSON 文件。", export: "下载我的数据", deleteTitle: "删除账户", deleteLead: "此操作会立即且永久删除账户和云端学习记录。", currentPassword: "当前密码", reauthPassword: "使用密码验证", reauthGoogle: "使用 Google 验证", typeDelete: "输入 DELETE 进行确认", deleteButton: "永久删除账户", loading: "正在加载账户……",
      saved: "已保存。", emailSent: "请检查当前邮箱和新邮箱，完成地址变更确认。", passwordUpdated: "密码已更新。", mismatch: "两次输入的密码不一致。", mfaEnabled: "验证器保护已开启。", mfaDisabled: "验证器保护已关闭。", sessionsCleared: "其他设备上的会话已撤销。", exported: "账户数据已下载。", reauthenticated: "身份验证完成，请在 10 分钟内完成下方确认。", reauthNeeded: "删除账户前请重新验证身份。", typeDeleteError: "请准确输入 DELETE。", deleted: "账户已经删除。", functionMissing: "安全账户函数尚未部署，请按照 Supabase 部署说明完成配置。", operationFailed: "操作未完成。"
    }
  };

  const lang = localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  const tr = key => copy[lang][key] || copy.en[key] || key;
  let snapshot = null;
  let pendingFactor = null;
  let recoveryCodes = [];

  function message(id, text, type = "success") {
    const node = document.getElementById(id);
    node.textContent = text;
    node.className = `auth-message ${type}`;
    node.hidden = false;
  }
  function errorMessage(error) {
    const raw = String(error?.message || "");
    if (raw.includes("account-security") || raw.includes("FunctionsHttpError") || raw.includes("Failed to send")) return tr("functionMissing");
    return window.MCLAuth.formatError(error) || tr("operationFailed");
  }
  function applyLanguage() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-copy]").forEach(node => { node.textContent = tr(node.dataset.copy); });
  }
  function download(name, text, type = "application/json") {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function renderIdentities() {
    const identities = snapshot.user?.identities || [];
    const google = identities.find(identity => identity.provider === "google");
    const email = identities.find(identity => identity.provider === "email");
    document.getElementById("googleIdentityStatus").textContent = google ? tr("linked") : tr("notLinked");
    document.getElementById("linkGoogleButton").hidden = Boolean(google);
    document.getElementById("unlinkGoogleButton").hidden = !google || identities.length < 2;
    document.getElementById("unlinkGoogleButton").onclick = google ? async () => {
      try { await window.MCLAuth.unlinkIdentity(google); location.reload(); } catch (error) { message("securityMessage", errorMessage(error), "error"); }
    } : null;
    document.getElementById("reauthPasswordField").hidden = !email;
    document.getElementById("reauthPasswordButton").hidden = !email;
    document.getElementById("reauthGoogleButton").hidden = !google;
  }

  async function renderMfa() {
    const factors = await window.MCLAuth.listFactors();
    const verified = (factors?.totp || []).filter(factor => factor.status === "verified");
    const status = document.getElementById("mfaStatus");
    const button = document.getElementById("enrollMfaButton");
    status.textContent = verified.length ? tr("mfaOn") : tr("mfaOff");
    button.textContent = verified.length ? tr("disableMfa") : tr("enableMfa");
    button.onclick = verified.length ? async () => {
      try { await window.MCLAuth.unenrollFactor(verified[0].id); message("securityMessage", tr("mfaDisabled")); await renderMfa(); }
      catch (error) { message("securityMessage", errorMessage(error), "error"); }
    } : startMfaEnrollment;
  }

  async function startMfaEnrollment() {
    try {
      pendingFactor = await window.MCLAuth.enrollTotp(`MathComplete Lab ${new Date().toLocaleDateString()}`);
      const qr = pendingFactor?.totp?.qr_code || pendingFactor?.totp?.qrCode || "";
      if (String(qr).startsWith("data:image/")) document.getElementById("mfaQr").src = qr;
      document.getElementById("mfaSecret").textContent = pendingFactor?.totp?.secret || "";
      document.getElementById("mfaEnrollPanel").hidden = false;
    } catch (error) { message("securityMessage", errorMessage(error), "error"); }
  }

  document.getElementById("verifyMfaButton").addEventListener("click", async () => {
    try {
      await window.MCLAuth.verifyTotp(pendingFactor.id, document.getElementById("mfaEnrollCode").value);
      message("securityMessage", tr("mfaEnabled"));
      document.getElementById("mfaEnrollPanel").hidden = true;
      try {
        const data = await window.MCLAuth.invokeAccountSecurity("generate-recovery-codes");
        recoveryCodes = data.codes || [];
        document.getElementById("recoveryCodes").innerHTML = "";
        recoveryCodes.forEach(code => { const span = document.createElement("span"); span.textContent = code; document.getElementById("recoveryCodes").append(span); });
        document.getElementById("recoveryCodesPanel").hidden = recoveryCodes.length === 0;
      } catch (error) { message("securityMessage", `${tr("mfaEnabled")} ${tr("functionMissing")}`, "warning"); }
      await renderMfa();
    } catch (error) { message("securityMessage", errorMessage(error), "error"); }
  });

  document.getElementById("downloadCodesButton").addEventListener("click", () => download("mathcomplete-lab-recovery-codes.txt", recoveryCodes.join("\n"), "text/plain"));
  document.getElementById("linkGoogleButton").addEventListener("click", () => window.MCLAuth.linkGoogleIdentity().catch(error => message("securityMessage", errorMessage(error), "error")));

  document.getElementById("profileForm").addEventListener("submit", async event => {
    event.preventDefault();
    try { await window.MCLAuth.updateProfile(document.getElementById("displayName").value); message("profileMessage", tr("saved")); }
    catch (error) { message("profileMessage", errorMessage(error), "error"); }
  });
  document.getElementById("emailForm").addEventListener("submit", async event => {
    event.preventDefault();
    try { await window.MCLAuth.updateEmail(document.getElementById("newEmail").value); message("emailMessage", tr("emailSent")); }
    catch (error) { message("emailMessage", errorMessage(error), "error"); }
  });
  document.getElementById("passwordForm").addEventListener("submit", async event => {
    event.preventDefault();
    const password = document.getElementById("accountPassword").value;
    if (password !== document.getElementById("accountPasswordConfirm").value) return message("passwordMessage", tr("mismatch"), "error");
    try { await window.MCLAuth.updatePassword(password); message("passwordMessage", tr("passwordUpdated")); event.target.reset(); }
    catch (error) { message("passwordMessage", errorMessage(error), "error"); }
  });

  document.getElementById("signOutOthersButton").addEventListener("click", async () => {
    try { await window.MCLAuth.signOut("others"); message("sessionMessage", tr("sessionsCleared")); }
    catch (error) { message("sessionMessage", errorMessage(error), "error"); }
  });
  document.getElementById("signOutAllButton").addEventListener("click", async () => {
    try { await window.MCLAuth.signOut("global"); location.replace(window.MCLAuth.pageUrl("index.html")); }
    catch (error) { message("sessionMessage", errorMessage(error), "error"); }
  });

  document.getElementById("exportButton").addEventListener("click", async () => {
    try {
      const db = window.MCL.supabaseClient;
      const tables = ["profiles", "account_entitlements", "attempts", "mistakes", "favorite_tools", "user_consents"];
      const results = await Promise.all(tables.map(table => db.from(table).select("*")));
      const failed = results.find(result => result.error);
      if (failed?.error) throw failed.error;
      const payload = {
        exported_at: new Date().toISOString(),
        user_id: snapshot.user.id,
        local_data: window.MCLProgress?.getLocalExportData?.(snapshot.user.id) || null
      };
      tables.forEach((table, index) => { payload[table] = results[index].data || []; });
      download(`mathcomplete-lab-data-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
      message("dataMessage", tr("exported"));
    } catch (error) { message("dataMessage", errorMessage(error), "error"); }
  });

  document.getElementById("reauthPasswordButton").addEventListener("click", async () => {
    try { await window.MCLAuth.reauthenticateWithPassword(document.getElementById("reauthPassword").value); message("deleteMessage", tr("reauthenticated")); }
    catch (error) { message("deleteMessage", errorMessage(error), "error"); }
  });
  document.getElementById("reauthGoogleButton").addEventListener("click", () => window.MCLAuth.reauthenticateWithGoogle("account.html?action=delete"));
  document.getElementById("deleteAccountButton").addEventListener("click", async () => {
    if (!window.MCLAuth.hasRecentReauthentication()) return message("deleteMessage", tr("reauthNeeded"), "error");
    if (document.getElementById("deleteConfirmation").value !== "DELETE") return message("deleteMessage", tr("typeDeleteError"), "error");
    try {
      await window.MCLAuth.invokeAccountSecurity("delete-account", { confirmation: "DELETE" });
      window.MCLProgress?.clearAccountLocalData?.(snapshot.user.id);
      window.MCL.clearAuthStorage?.();
      message("deleteMessage", tr("deleted"));
      setTimeout(() => location.replace(window.MCLAuth.pageUrl("index.html")), 800);
    } catch (error) { message("deleteMessage", errorMessage(error), "error"); }
  });

  async function initialize() {
    applyLanguage();
    const current = await window.MCLAuth.initialize();
    if (!current.user) {
      location.replace(window.MCLAuth.pageUrl("login.html?returnTo=account.html"));
      return;
    }
    if (current.status === "mfa-required") {
      location.replace(window.MCLAuth.pageUrl("login.html?mfa=1&returnTo=account.html"));
      return;
    }
    snapshot = current;
    document.getElementById("displayName").value = current.profile?.display_name || "";
    document.getElementById("currentEmail").textContent = current.user.email || "";
    document.getElementById("newEmail").value = current.user.email || "";
    document.getElementById("accountPlan").textContent = current.entitlement?.plan === "plus" ? "Plus" : "Free";
    await Promise.all([renderIdentities(), renderMfa()]);
    document.getElementById("accountLoading").hidden = true;
    document.getElementById("accountPage").hidden = false;
    if (new URLSearchParams(location.search).get("action") === "delete") document.getElementById("delete").scrollIntoView();
    window.addEventListener("load", () => window.lucide?.createIcons?.(), { once: true });
  }
  initialize().catch(error => {
    document.getElementById("accountLoading").querySelector("p").textContent = errorMessage(error);
  });
})();
