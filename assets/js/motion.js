(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const panelVisibility = new WeakMap();
  let revealObserver = null;

  function motionAllowed() {
    return !reducedMotion.matches;
  }

  function reveal(node) {
    if (!(node instanceof Element) || node.dataset.mclMotionObserved === "true") return;
    node.dataset.mclMotionObserved = "true";
    node.classList.add("mcl-reveal");
    if (!motionAllowed() || !revealObserver) {
      node.classList.add("is-visible");
      return;
    }
    revealObserver.observe(node);
  }

  function collect(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    const selector = "[data-mcl-reveal], .mcl-topic-section, .mcl-tool-card, .graph-card, .expression-card";
    if (root instanceof Element && root.matches(selector)) reveal(root);
    root.querySelectorAll(selector).forEach(reveal);
  }

  function replayClass(node, className) {
    if (!motionAllowed() || !(node instanceof Element)) return;
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
  }

  function isVisible(node) {
    if (!(node instanceof HTMLElement)) return false;
    return !node.hidden && !node.classList.contains("hidden") && getComputedStyle(node).display !== "none";
  }

  function handleStateChange(node) {
    if (!(node instanceof Element)) return;
    const feedbackTarget = node.matches(".option, .expression-card, .graph-card");
    const feedbackState = node.classList.contains("correct") ? "correct" : node.classList.contains("wrong") ? "wrong" : "";
    if (feedbackTarget && feedbackState && node.dataset.mclFeedbackState !== feedbackState) {
      node.dataset.mclFeedbackState = feedbackState;
      replayClass(node, "mcl-answer-feedback");
    } else if (feedbackTarget && !feedbackState) {
      delete node.dataset.mclFeedbackState;
    }
    if (node.matches("#quizCard, #resultCard, .solution-box, .solution-card")) {
      const visible = isVisible(node);
      const wasVisible = panelVisibility.get(node);
      panelVisibility.set(node, visible);
      if (visible && wasVisible === false) replayClass(node, "mcl-panel-enter");
    }
  }

  function setupPointerTrail() {
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (page !== "index.html" && page !== "practice.html") return;
    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
    if (!motionAllowed() || !finePointer.matches || window.innerWidth < 768) return;

    const canvas = document.createElement("canvas");
    canvas.className = "mcl-pointer-trail";
    canvas.setAttribute("aria-hidden", "true");
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    document.body.appendChild(canvas);

    let width = 0;
    let height = 0;
    let ratio = 1;
    let lastPoint = null;
    let segments = [];
    let animationFrame = 0;
    let disposed = false;
    let segmentIndex = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      segments = [];
      lastPoint = null;
    }

    function scheduleDraw() {
      if (!animationFrame && !disposed) animationFrame = requestAnimationFrame(draw);
    }

    function draw(timestamp) {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      const dark = document.documentElement.dataset.theme === "dark";
      const baseOpacity = dark ? 0.78 : 0.62;

      segments.forEach(segment => {
        const hueWave = (Math.sin(timestamp * 0.00125 + segment.phase) + 1) / 2;
        const hue = 174 + hueWave * 164;
        const color = `hsl(${hue} ${dark ? 92 : 84}% ${dark ? 68 : 46}%)`;
        context.beginPath();
        context.moveTo(segment.x1, segment.y1);
        context.quadraticCurveTo(segment.cx, segment.cy, segment.x2, segment.y2);
        context.strokeStyle = color;
        context.globalAlpha = segment.life * baseOpacity;
        context.lineWidth = segment.width * (0.65 + segment.life * 0.35);
        context.lineCap = "round";
        context.shadowColor = color;
        context.shadowBlur = dark ? 7 : 5;
        context.stroke();
        segment.life -= 0.035;
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      segments = segments.filter(segment => segment.life > 0);
      if (segments.length) scheduleDraw();
    }

    function onPointerMove(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const point = { x: event.clientX, y: event.clientY };
      if (!lastPoint) {
        lastPoint = point;
        return;
      }

      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 5) return;
      if (distance > 90) {
        lastPoint = point;
        return;
      }

      const steps = Math.min(3, Math.ceil(distance / 13));
      for (let step = 1; step <= steps; step++) {
        const startRatio = (step - 1) / steps;
        const endRatio = step / steps;
        const x1 = lastPoint.x + dx * startRatio;
        const y1 = lastPoint.y + dy * startRatio;
        const x2 = lastPoint.x + dx * endRatio;
        const y2 = lastPoint.y + dy * endRatio;
        const curve = Math.min(1.8, distance * 0.025) * (segmentIndex % 2 ? 1 : -1);
        segments.push({
          x1,
          y1,
          x2,
          y2,
          cx: (x1 + x2) / 2 + (-dy / distance) * curve,
          cy: (y1 + y2) / 2 + (dx / distance) * curve,
          width: Math.min(2.35, 1.15 + distance / 58),
          phase: segmentIndex * 0.24,
          life: 1
        });
        segmentIndex++;
      }

      if (segments.length > 28) segments.splice(0, segments.length - 28);
      lastPoint = point;
      scheduleDraw();
    }

    function resetPointer() {
      lastPoint = null;
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", resetPointer);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", resetPointer);
      canvas.remove();
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("blur", resetPointer);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", resetPointer);
    reducedMotion.addEventListener("change", event => { if (event.matches) dispose(); }, { once: true });
    finePointer.addEventListener("change", event => { if (!event.matches) dispose(); }, { once: true });
  }

  function init() {
    document.documentElement.classList.add("mcl-motion-ready");
    revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.05 }) : null;

    collect(document);
    document.querySelectorAll("#quizCard, #resultCard, .solution-box, .solution-card").forEach(node => {
      panelVisibility.set(node, isVisible(node));
    });
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(collect);
        if (mutation.type === "attributes") handleStateChange(mutation.target);
      });
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "hidden", "style"] });
    setupPointerTrail();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
