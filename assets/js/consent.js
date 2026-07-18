(function () {
  "use strict";
  const copy = {
    en: { title: "Before you continue", lead: "Confirm the account requirements for MathComplete Lab.", acceptTerms: "I agree to the", terms: "Terms of Service", acceptPrivacy: "I have read the", privacy: "Privacy Policy", age: "I confirm that I am at least 13 years old.", continue: "Continue", required: "Complete all three confirmations to continue." },
    zh: { title: "继续之前", lead: "请确认 MathComplete Lab 的账户使用要求。", acceptTerms: "我同意", terms: "服务条款", acceptPrivacy: "我已阅读", privacy: "隐私政策", age: "我确认本人已年满 13 岁。", continue: "继续", required: "请完成全部三项确认后继续。" }
  };
  const lang = localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  const tr = key => copy[lang][key];
  const message = document.getElementById("consentMessage");
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-copy]").forEach(node => { node.textContent = tr(node.dataset.copy); });

  document.getElementById("consentForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!["termsConsent", "privacyConsent", "ageConsent"].every(id => document.getElementById(id).checked)) {
      message.textContent = tr("required"); message.className = "auth-message error"; message.hidden = false; return;
    }
    const button = document.getElementById("consentButton");
    button.disabled = true;
    try {
      await window.MCLAuth.acceptConsents();
      location.replace(window.MCLAuth.pageUrl(window.MCLAuth.consumeReturnTo("practice.html")));
    } catch (error) {
      message.textContent = window.MCLAuth.formatError(error); message.className = "auth-message error"; message.hidden = false;
      button.disabled = false;
    }
  });

  window.MCLAuth.initialize().then(snapshot => {
    if (!snapshot.user) location.replace(window.MCLAuth.pageUrl("login.html"));
  });
})();
