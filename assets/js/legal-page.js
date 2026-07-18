(function () {
  const lang = localStorage.getItem("mathcomplete_lang") === "zh" ? "zh" : "en";
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-legal-lang]").forEach(node => { node.hidden = node.dataset.legalLang !== lang; });
})();
