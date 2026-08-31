const fs = require("node:fs");
const path = require("node:path");

const files = [
  "index.html",
  "practice.html",
  "dashboard.html",
  "mistakes.html",
  "games/advanced-equation-solving.html",
  "games/algebra-expression.html",
  "games/algebra-simplification.html",
  "games/arithmetic-within-10.html",
  "games/arithmetic-within-100.html",
  "games/arithmetic-within-1000.html",
  "games/completing-the-square.html",
  "games/derivative-practice.html",
  "games/determinant-practice.html",
  "games/exponent-laws.html",
  "games/exponential-functions.html",
  "games/factoring-practice.html",
  "games/fraction-percent.html",
  "games/function-evaluation.html",
  "games/gcd-lcm.html",
  "games/geometry-formula.html",
  "games/linear-equation.html",
  "games/logarithmic-functions.html",
  "games/matrix-multiplication.html",
  "games/polynomial-multiplication.html",
  "games/powers-roots.html",
  "games/radical-functions.html",
  "games/set-theory-basics.html",
  "games/slope-from-two-points.html",
  "games/special-products.html",
  "games/vector-operations.html"
];

for (const relative of files) {
  const file = path.join(process.cwd(), relative);
  const source = fs.readFileSync(file, "utf8");
  const next = source.replace(/\s*<style\b[^>]*>[\s\S]*?<\/style>\s*/i, "\n");
  if (next === source) throw new Error(`No inline style block found in ${relative}`);
  fs.writeFileSync(file, next, "utf8");
  console.log(`migrated ${relative}`);
}
