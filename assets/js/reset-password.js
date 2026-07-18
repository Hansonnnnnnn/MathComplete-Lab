(function () {
  "use strict";
  const copy = {
    en: { title: "Set a new password", lead: "Choose a password you have not used for this account before.", password: "New password", confirm: "Confirm new password", submit: "Update password", updating: "Updating...", mismatch: "The passwords do not match.", success: "Your password has been updated. Other devices have been signed out.", invalid: "This recovery session is missing or has expired.", back: "Request another reset link" },
    zh: { title: "设置新密码", lead: "请选择一个此前未用于此账户的密码。", password: "新密码", confirm: "确认新密码", submit: "更新密码", updating: "正在更新……", mismatch: "两次输入的密码不一致。", success: "密码已经更新，其他设备上的会话已退出。", invalid: "此恢复会话不存在或已经过期。", back: "重新申请重置链接" }
  };
  const lang = localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  const tr = key => copy[lang][key];
  const form = document.getElementById("resetForm");
  const message = document.getElementById("resetMessage");
  const button = document.getElementById("resetButton");
  const password = document.getElementById("newPassword");

  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-copy]").forEach(node => { node.textContent = tr(node.dataset.copy); });
  window.addEventListener("load", () => window.lucide?.createIcons?.(), { once: true });

  function show(text, type = "error") { message.textContent = text; message.className = `auth-message ${type}`; message.hidden = false; }
  function score(value) { return Math.min(4, (value.length >= 12 ? 1 : 0) + (value.length >= 16 ? 1 : 0) + (/[a-z]/.test(value) && /[A-Z]/.test(value) ? 1 : 0) + (/\d/.test(value) && /[^A-Za-z0-9]/.test(value) ? 1 : 0)); }
  password.addEventListener("input", () => { document.getElementById("resetStrength").dataset.score = String(score(password.value)); });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (password.value !== document.getElementById("confirmPassword").value) return show(tr("mismatch"));
    button.disabled = true;
    button.textContent = tr("updating");
    try {
      await window.MCLAuth.updatePassword(password.value);
      await window.MCLAuth.signOut("others").catch(() => {});
      sessionStorage.removeItem("mcl_recovery_session");
      show(tr("success"), "success");
      form.reset();
    } catch (error) {
      show(window.MCLAuth.formatError(error));
    } finally {
      button.disabled = false;
      button.textContent = tr("submit");
    }
  });

  window.MCLAuth.initialize().then(snapshot => {
    const allowed = sessionStorage.getItem("mcl_recovery_session") === "1" && Boolean(snapshot.user);
    if (!allowed) {
      form.hidden = true;
      document.getElementById("invalidLink").hidden = false;
      show(tr("invalid"));
    }
  });
})();
