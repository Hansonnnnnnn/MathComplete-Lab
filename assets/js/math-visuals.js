(function () {
  const courseVisuals = {
    "pre-algebra": `
      <line x1="8" y1="34" x2="112" y2="34" />
      <path d="M8 34l7-5v10zM112 34l-7-5v10z" class="mcl-math-visual__fill" />
      <line x1="35" y1="27" x2="35" y2="41" />
      <line x1="60" y1="25" x2="60" y2="43" />
      <line x1="85" y1="27" x2="85" y2="41" />
      <circle cx="60" cy="34" r="5" class="mcl-math-visual__fill" />`,
    "algebra-1": `
      <line x1="12" y1="52" x2="110" y2="52" class="mcl-math-visual__axis" />
      <line x1="36" y1="60" x2="36" y2="10" class="mcl-math-visual__axis" />
      <path d="M16 55L99 16" />
      <circle cx="36" cy="46" r="3.5" class="mcl-math-visual__fill" />
      <circle cx="82" cy="24" r="3.5" class="mcl-math-visual__fill" />`,
    "algebra-2": `
      <line x1="10" y1="54" x2="112" y2="54" class="mcl-math-visual__axis" />
      <line x1="61" y1="61" x2="61" y2="8" class="mcl-math-visual__axis" />
      <path d="M20 16C35 16 39 51 61 51S87 16 102 16" />
      <circle cx="61" cy="51" r="3.5" class="mcl-math-visual__fill" />`,
    precalculus: `
      <line x1="8" y1="34" x2="112" y2="34" class="mcl-math-visual__axis" />
      <path d="M8 34C17 12 27 12 36 34S55 56 64 34 83 12 92 34 103 56 112 34" />`,
    "geometry-1": `
      <path d="M20 55L59 11l42 44z" />
      <path d="M36 38h8M79 38h8" />
      <path d="M56 51l5-5 5 5" class="mcl-math-visual__axis" />`,
    "single-variable-calculus": `
      <line x1="10" y1="55" x2="112" y2="55" class="mcl-math-visual__axis" />
      <line x1="28" y1="61" x2="28" y2="8" class="mcl-math-visual__axis" />
      <path d="M13 51C33 50 47 46 59 36S78 12 106 11" />
      <line x1="46" y1="48" x2="94" y2="10" class="mcl-math-visual__tangent" />
      <circle cx="68" cy="30" r="3.5" class="mcl-math-visual__fill" />`,
    "linear-algebra": `
      <path d="M18 13v45M43 13v45M68 13v45M93 13v45M8 23h104M8 43h104" class="mcl-math-visual__grid" />
      <path d="M22 50L61 18l-3 9M61 18l-10 1" />
      <path d="M22 50L92 39l-9-5M92 39l-7 8" class="mcl-math-visual__secondary" />`
  };

  const toolVisuals = {
    "arithmetic-within-10": `
      <line x1="10" y1="45" x2="110" y2="45" class="mcl-math-visual__axis" />
      <path d="M18 45v6M38 45v6M58 45v6M78 45v6M98 45v6" />
      <path d="M18 38C31 17 48 17 58 38" class="mcl-math-visual__secondary" />
      <path d="M53 34l5 4-7 2" class="mcl-math-visual__secondary" />
      <text x="15" y="63">0</text><text x="94" y="63">10</text>`,
    "arithmetic-within-100": `
      <rect x="24" y="8" width="58" height="52" rx="2" />
      <path d="M38.5 8v52M53 8v52M67.5 8v52M24 21h58M24 34h58M24 47h58" class="mcl-math-visual__grid" />
      <path d="M29 50L76 15" class="mcl-math-visual__secondary" />
      <circle cx="29" cy="50" r="3" class="mcl-math-visual__fill" /><circle cx="76" cy="15" r="3" class="mcl-math-visual__fill" />
      <text x="90" y="38" class="mcl-math-visual__label">100</text>`,
    "arithmetic-within-1000": `
      <rect x="10" y="15" width="42" height="42" class="mcl-math-visual__soft" />
      <path d="M24 15v42M38 15v42M10 29h42M10 43h42" class="mcl-math-visual__grid" />
      <rect x="67" y="13" width="11" height="44" />
      <path d="M67 24h11M67 35h11M67 46h11" class="mcl-math-visual__grid" />
      <rect x="94" y="45" width="12" height="12" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="15" y="12">100</text><text x="65" y="10">10</text><text x="96" y="41">1</text>`,
    "powers-roots": `
      <text x="12" y="37" class="mcl-math-visual__formula">x²</text>
      <path d="M45 33h25M64 27l7 6-7 6" class="mcl-math-visual__secondary" />
      <path d="M79 34l5 6 7-22h21" />
      <text x="92" y="38" class="mcl-math-visual__label">x</text>`,
    "gcd-lcm": `
      <circle cx="44" cy="34" r="23" /><circle cx="76" cy="34" r="23" />
      <path d="M60 13C70 23 70 45 60 55C50 45 50 23 60 13z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="29" y="38" class="mcl-math-visual__label">12</text><text x="69" y="38" class="mcl-math-visual__label">18</text>
      <text x="56" y="38" class="mcl-math-visual__label mcl-math-visual__secondary">6</text>`,
    "set-theory-basics": `
      <rect x="9" y="8" width="102" height="52" rx="5" class="mcl-math-visual__axis" />
      <circle cx="47" cy="34" r="20" /><circle cx="73" cy="34" r="20" />
      <path d="M60 18C70 25 70 43 60 50C50 43 50 25 60 18z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="18" y="20">U</text><text x="36" y="38">A</text><text x="78" y="38">B</text><text x="56" y="38" class="mcl-math-visual__secondary">∩</text>`,
    "exponent-laws": `
      <text x="8" y="39" class="mcl-math-visual__formula">xᵃ · xᵇ</text>
      <path d="M61 34h17M72 28l7 6-7 6" class="mcl-math-visual__secondary" />
      <text x="83" y="39" class="mcl-math-visual__formula">xᵃ⁺ᵇ</text>`,
    "exponential-functions": `
      <path d="M12 56h98M27 61V9" class="mcl-math-visual__axis" />
      <path d="M13 50C48 50 72 47 84 34S99 12 108 10" />
      <path d="M13 50h95" class="mcl-math-visual__secondary mcl-math-visual__dash" />`,
    "logarithmic-functions": `
      <path d="M12 55h98M31 61V8" class="mcl-math-visual__axis" />
      <path d="M34 57C35 29 47 18 61 14S90 10 108 9" />
      <path d="M31 8v52" class="mcl-math-visual__secondary mcl-math-visual__dash" />`,
    "radical-functions": `
      <path d="M12 56h98M25 61V9" class="mcl-math-visual__axis" />
      <path d="M39 53C45 35 56 25 70 19S96 12 108 10" />
      <circle cx="39" cy="53" r="4" class="mcl-math-visual__fill" />
      <path d="M82 49l5 6 7-19h16" class="mcl-math-visual__secondary" />`,
    "advanced-equation-solving": `
      <rect x="9" y="11" width="30" height="18" rx="3" class="mcl-math-visual__soft" />
      <rect x="45" y="25" width="30" height="18" rx="3" class="mcl-math-visual__soft" />
      <rect x="81" y="39" width="30" height="18" rx="3" class="mcl-math-visual__soft" />
      <path d="M39 20h13l-4-4M75 34h13l-4-4" class="mcl-math-visual__secondary" />
      <text x="18" y="24">x²</text><text x="54" y="38">√x</text><text x="89" y="52">x</text>`,
    "vector-operations": `
      <path d="M18 54L57 19l-3 10M57 19l-10 2" />
      <path d="M18 54L95 41l-9-5M95 41l-7 8" class="mcl-math-visual__secondary" />
      <path d="M57 19L95 41M18 54L95 6l-3 10M95 6l-10 2" class="mcl-math-visual__axis" />`,
    "matrix-multiplication": `
      <path d="M9 14h-4v40h4M35 14h4v40h-4M16 24h12M16 43h12" />
      <circle cx="50" cy="34" r="3" class="mcl-math-visual__fill" />
      <path d="M61 14h-4v40h4M87 14h4v40h-4M68 24h12M68 43h12" />
      <path d="M96 34h14M105 29l6 5-6 5" class="mcl-math-visual__secondary" />`,
    "determinant-practice": `
      <path d="M24 10h-5v48h5M88 10h5v48h-5" />
      <circle cx="38" cy="22" r="4" class="mcl-math-visual__fill" /><circle cx="74" cy="22" r="4" />
      <circle cx="38" cy="46" r="4" /><circle cx="74" cy="46" r="4" class="mcl-math-visual__fill" />
      <path d="M38 22l36 24M74 22L38 46" class="mcl-math-visual__secondary" />
      <text x="99" y="39" class="mcl-math-visual__label">det</text>`,
    "completing-the-square": `
      <rect x="17" y="10" width="44" height="44" class="mcl-math-visual__soft" />
      <rect x="61" y="10" width="22" height="44" />
      <rect x="17" y="54" width="44" height="9" />
      <rect x="61" y="54" width="22" height="9" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <path d="M91 35h18M103 29l6 6-6 6" class="mcl-math-visual__secondary" />`,
    "quadratic-functions": `
      <path d="M10 54h100M60 61V8" class="mcl-math-visual__axis" />
      <path d="M21 14C37 14 40 52 60 52S83 14 99 14" />
      <path d="M60 10v45" class="mcl-math-visual__secondary mcl-math-visual__dash" />
      <circle cx="60" cy="52" r="4" class="mcl-math-visual__fill" />`,
    "quadratic-formula": `
      <text x="8" y="40" class="mcl-math-visual__formula">−b ± √Δ</text>
      <line x1="8" y1="45" x2="83" y2="45" />
      <text x="34" y="59" class="mcl-math-visual__label">2a</text>
      <path d="M93 19l5 5 10-13M93 42l5 5 10-13" class="mcl-math-visual__secondary" />`,
    "function-graph-matching": `
      <rect x="7" y="12" width="40" height="44" rx="4" /><text x="14" y="38" class="mcl-math-visual__label">f(x)</text>
      <path d="M51 34h17M61 28l7 6-7 6" class="mcl-math-visual__secondary" />
      <rect x="73" y="12" width="40" height="44" rx="4" />
      <path d="M78 48h30M84 52V18" class="mcl-math-visual__axis" /><path d="M79 45C90 45 91 23 108 19" />`,
    "algebra-expression": `
      <rect x="9" y="10" width="43" height="20" rx="4" class="mcl-math-visual__soft" /><text x="17" y="24">x = 3</text>
      <rect x="9" y="39" width="43" height="20" rx="4" class="mcl-math-visual__soft" /><text x="17" y="53">y = 2</text>
      <path d="M57 34h15M66 28l7 6-7 6" class="mcl-math-visual__secondary" />
      <text x="79" y="29" class="mcl-math-visual__label">2x + y</text><text x="91" y="49" class="mcl-math-visual__formula">8</text>`,
    "algebra-simplification": `
      <text x="7" y="20" class="mcl-math-visual__label">3x + 2x − x</text>
      <path d="M24 27L50 43M92 27L70 43" class="mcl-math-visual__axis" />
      <path d="M48 43h24l-5 7H53z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="48" y="63" class="mcl-math-visual__formula">4x</text>`,
    "linear-equation": `
      <path d="M60 14v38M29 30h62M29 30l-9 18h18zM91 30l-9 18h18z" />
      <rect x="24" y="39" width="10" height="8" rx="2" class="mcl-math-visual__soft" />
      <circle cx="88" cy="43" r="4" class="mcl-math-visual__secondary mcl-math-visual__fill" />
      <text x="55" y="64">x = ?</text>`,
    "linear-inequalities": `
      <line x1="10" y1="36" x2="110" y2="36" />
      <path d="M10 36l7-5v10zM110 36l-7-5v10z" class="mcl-math-visual__fill" />
      <circle cx="55" cy="36" r="6" class="mcl-math-visual__hollow" />
      <path d="M62 36h38M94 30l7 6-7 6" class="mcl-math-visual__secondary" />
      <text x="49" y="58">3</text>`,
    "systems-linear-equations": `
      <path d="M11 55h99M29 61V8" class="mcl-math-visual__axis" />
      <path d="M16 54L99 13M15 16l91 38" />
      <circle cx="61" cy="32" r="5" class="mcl-math-visual__secondary mcl-math-visual__fill" />
      <path d="M66 28l18-14" class="mcl-math-visual__secondary" />`,
    "slope-from-two-points": `
      <path d="M11 55h99M25 61V8" class="mcl-math-visual__axis" />
      <path d="M20 53L99 15" />
      <circle cx="39" cy="44" r="4" class="mcl-math-visual__fill" /><circle cx="87" cy="21" r="4" class="mcl-math-visual__fill" />
      <path d="M39 44h48V21" class="mcl-math-visual__secondary mcl-math-visual__dash" />
      <text x="57" y="55">run</text><text x="90" y="35">rise</text>`,
    "function-evaluation": `
      <path d="M8 34h18M20 28l7 6-7 6" class="mcl-math-visual__secondary" />
      <rect x="29" y="15" width="55" height="38" rx="6" class="mcl-math-visual__soft" />
      <text x="42" y="39" class="mcl-math-visual__formula">f(x)</text>
      <path d="M87 34h24M104 28l7 6-7 6" class="mcl-math-visual__secondary" />
      <text x="7" y="26">2</text><text x="103" y="26">7</text>`,
    "factoring-practice": `
      <text x="9" y="20" class="mcl-math-visual__label">x² + 5x + 6</text>
      <path d="M59 25v11M59 36L28 50M59 36l31 14" class="mcl-math-visual__secondary" />
      <rect x="9" y="47" width="39" height="16" rx="3" class="mcl-math-visual__soft" /><rect x="70" y="47" width="41" height="16" rx="3" class="mcl-math-visual__soft" />
      <text x="14" y="59">(x + 2)</text><text x="75" y="59">(x + 3)</text>`,
    "polynomial-multiplication": `
      <rect x="18" y="10" width="68" height="48" />
      <path d="M50 10v48M18 34h68" />
      <path d="M50 10h36v24H50z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="29" y="28">x²</text><text x="60" y="28">3x</text><text x="28" y="50">2x</text><text x="63" y="50">6</text>
      <text x="93" y="38" class="mcl-math-visual__formula">∑</text>`,
    "complex-number-operations": `
      <path d="M10 34h100M60 61V7" class="mcl-math-visual__axis" />
      <path d="M105 30l5 4-5 4M56 12l4-5 4 5" class="mcl-math-visual__axis" />
      <path d="M60 34L91 17M60 34L91 51" class="mcl-math-visual__dash" />
      <path d="M91 17V51" class="mcl-math-visual__secondary mcl-math-visual__dash" />
      <circle cx="91" cy="17" r="4" class="mcl-math-visual__fill" />
      <circle cx="91" cy="51" r="4" class="mcl-math-visual__secondary mcl-math-visual__fill" />
      <text x="101" y="47">Re</text><text x="64" y="12">Im</text>
      <text x="96" y="17" class="mcl-math-visual__label">z</text><text x="96" y="58" class="mcl-math-visual__label mcl-math-visual__secondary">z̄</text>`,
    "number-systems-classification": `
      <ellipse cx="60" cy="34" rx="53" ry="27" />
      <ellipse cx="55" cy="34" rx="39" ry="21" class="mcl-math-visual__axis" />
      <ellipse cx="49" cy="34" rx="25" ry="15" class="mcl-math-visual__secondary" />
      <ellipse cx="44" cy="34" rx="12" ry="9" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="39" y="38" class="mcl-math-visual__label">Z</text>
      <text x="62" y="38" class="mcl-math-visual__label">Q</text>
      <text x="91" y="38" class="mcl-math-visual__label">R</text>
      <circle cx="104" cy="15" r="4" class="mcl-math-visual__secondary mcl-math-visual__fill" />`,
    "fraction-percent": `
      <circle cx="35" cy="34" r="24" />
      <path d="M35 34V10A24 24 0 0 1 59 34z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <path d="M35 34h24M35 34V10" />
      <path d="M68 34h13M75 28l7 6-7 6" class="mcl-math-visual__secondary" />
      <text x="87" y="39" class="mcl-math-visual__formula">25%</text>`,
    "geometry-formula": `
      <rect x="9" y="22" width="48" height="31" />
      <path d="M9 58h48M9 55v6M57 55v6" class="mcl-math-visual__secondary" />
      <text x="28" y="66">w</text>
      <circle cx="88" cy="34" r="22" /><line x1="88" y1="34" x2="109" y2="34" class="mcl-math-visual__secondary" /><text x="97" y="30">r</text>`,
    "midpoints-bisectors-trisectors": `
      <path d="M8 49h54M35 15v48" /><path d="M29 44v10M41 44v10" class="mcl-math-visual__secondary" />
      <path d="M72 56L91 13l24 43M91 13L95 56" /><path d="M83 31A15 15 0 0 1 93 29M93 29A15 15 0 0 1 102 34" class="mcl-math-visual__secondary" />`,
    "conditional-logic": `
      <circle cx="20" cy="18" r="10" /><circle cx="100" cy="18" r="10" />
      <circle cx="20" cy="52" r="10" /><circle cx="100" cy="52" r="10" />
      <text x="16" y="22">p</text><text x="96" y="22">q</text><text x="12" y="56">\u00acp</text><text x="92" y="56">\u00acq</text>
      <path d="M32 18h55m-7-5 7 5-7 5M88 52H33m7-5-7 5 7 5" class="mcl-math-visual__secondary" />
      <path d="M94 27L29 45m7-7-7 7 10 2" class="mcl-math-visual__axis" />`,
    "parallel-lines-angle-relationships": `
      <path d="M8 17h104M8 53h104M33 65L87 6" />
      <path d="M50 13l5 4-5 4M66 49l5 4-5 4" class="mcl-math-visual__secondary" />
      <path d="M42 17A13 13 0 0 1 48 27M72 43A13 13 0 0 1 78 53" class="mcl-math-visual__secondary" />
      <circle cx="43" cy="17" r="3" class="mcl-math-visual__fill" /><circle cx="76" cy="53" r="3" class="mcl-math-visual__fill" />`,
    "triangle-congruence": `
      <path d="M8 54L32 13l24 41zM65 54l23-41 24 41z" />
      <path d="M18 37l7 4M96 40l7-4M38 31h7M76 31h7" class="mcl-math-visual__secondary" />
      <path d="M54 28h12M61 23l6 5-6 5" class="mcl-math-visual__axis" />`,
    "derivative-practice": `
      <path d="M10 55h100M27 61V8" class="mcl-math-visual__axis" />
      <path d="M13 52C41 51 45 44 61 32S87 13 107 12" />
      <line x1="43" y1="49" x2="94" y2="10" class="mcl-math-visual__secondary" />
      <circle cx="67" cy="30" r="4" class="mcl-math-visual__fill" /><text x="88" y="53">f′(x)</text>`,
    "integration-practice": `
      <path d="M10 55h101M25 61V8" class="mcl-math-visual__axis" />
      <path d="M29 50C39 44 46 24 58 21S78 42 91 28S103 13 110 12" />
      <path d="M37 55V39C43 29 49 22 58 21S72 34 79 38V55z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <path d="M37 55V39M79 55V38" class="mcl-math-visual__secondary mcl-math-visual__dash" />
      <text x="5" y="27" class="mcl-math-visual__formula">∫</text><text x="46" y="64">a</text><text x="76" y="64">b</text>`,
    "unit-circle-trigonometry": `
      <circle cx="60" cy="34" r="25" />
      <path d="M28 34h64M60 6v56" class="mcl-math-visual__axis" />
      <path d="M60 34L78 16M78 16v18M60 16h18" class="mcl-math-visual__secondary mcl-math-visual__dash" />
      <circle cx="78" cy="16" r="4" class="mcl-math-visual__secondary mcl-math-visual__fill" />
      <text x="95" y="39">cos</text><text x="63" y="10">sin</text>`,
    "limits-practice": `
      <path d="M10 55h100M28 61V8" class="mcl-math-visual__axis" />
      <path d="M13 50C32 49 45 43 57 31M63 31C76 20 91 15 108 13" />
      <circle cx="60" cy="31" r="5" class="mcl-math-visual__hollow" />
      <path d="M43 39l10-5-4 9M77 24l-10 4 5-9" class="mcl-math-visual__secondary" />
      <text x="53" y="14">lim</text>`,
    "special-products": `
      <rect x="22" y="8" width="54" height="54" />
      <path d="M57 8v54M22 43h54" />
      <path d="M57 8h19v35H57zM22 43h35v19H22z" class="mcl-math-visual__secondary mcl-math-visual__soft" />
      <text x="33" y="29">a²</text><text x="62" y="29">ab</text><text x="34" y="57">ab</text><text x="61" y="57">b²</text>
      <text x="84" y="38" class="mcl-math-visual__formula">(a+b)²</text>`
  };

  function render(id, className) {
    const drawing = toolVisuals[id] || courseVisuals[id] || courseVisuals["algebra-1"];
    const classes = ["mcl-math-visual", className].filter(Boolean).join(" ");
    return `<svg class="${classes}" data-mcl-visual="${id}" viewBox="0 0 120 68" aria-hidden="true" focusable="false">${drawing}</svg>`;
  }

  window.MCLMathVisuals = { render, toolIds: Object.keys(toolVisuals) };
})();
