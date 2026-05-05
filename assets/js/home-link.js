/*
  MathComplete Lab - Back button
*/

(function () {
  if (/\/index\.html?$/.test(window.location.pathname) || window.location.pathname.endsWith("/")) return;

  function isGamePage() {
    return window.location.pathname.includes("/games/");
  }

  function targetHref() {
    return isGamePage() ? "../practice.html" : "index.html";
  }

  function label() {
    const isZh = localStorage.getItem("mathcomplete_lang") === "zh";
    if (isGamePage()) return isZh ? "< 练习库" : "< Practice";
    return isZh ? "< 主页" : "< Home";
  }

  function makeButton() {
    const link = document.createElement("a");
    link.href = targetHref();
    link.textContent = label();
    link.setAttribute("aria-label", label());
    link.style.position = "fixed";
    link.style.left = "14px";
    link.style.top = "14px";
    link.style.zIndex = "1000";
    link.style.display = "inline-flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "center";
    link.style.minHeight = "38px";
    link.style.padding = "8px 12px";
    link.style.borderRadius = "999px";
    link.style.border = "1px solid rgba(148, 163, 184, 0.32)";
    link.style.background = "rgba(255, 255, 255, 0.88)";
    link.style.backdropFilter = "blur(14px)";
    link.style.boxShadow = "0 12px 26px rgba(15, 23, 42, 0.12)";
    link.style.color = "#475569";
    link.style.font = "800 14px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif";
    link.style.textDecoration = "none";
    document.body.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeButton);
  } else {
    makeButton();
  }
})();
