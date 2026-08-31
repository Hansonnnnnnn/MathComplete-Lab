const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const version = process.argv[2] || "20260827.1";

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(target);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

    const source = fs.readFileSync(target, "utf8");
    const updated = source
      .replace(
        /href=(['"])((?:\.\.\/|\.\/)?assets\/css\/[^?'"\s]+\.css)(?:\?v=[^'"\s]+)?\1/g,
        (_match, quote, assetPath) => `href=${quote}${assetPath}?v=${version}${quote}`
      )
      .replace(
        /src=(['"])((?:\.\.\/|\.\/)?assets\/js\/motion\.js)(?:\?v=[^'"\s]+)?\1/g,
        (_match, quote, assetPath) => `src=${quote}${assetPath}?v=${version}${quote}`
      );

    if (updated !== source) fs.writeFileSync(target, updated, "utf8");
  }
}

visit(root);
