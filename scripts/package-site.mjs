// Copies the finished static site into dist/ for Vercel, leaving out source-only folders.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const DIST = path.join(ROOT, "dist");
const SKIP = new Set(["dist", "node_modules", ".git", ".github", ".vercel", "content", "scripts", "api", "package.json", "package-lock.json", "vercel.json", ".gitignore", ".gitattributes", "README.txt"]);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
for (const entry of fs.readdirSync(ROOT)) {
  if (SKIP.has(entry)) continue;
  fs.cpSync(path.join(ROOT, entry), path.join(DIST, entry), { recursive: true });
}
console.log("Site packaged into dist/");
