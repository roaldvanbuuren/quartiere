// Copies the finished static site into dist/ for Vercel, leaving out source-only folders,
// then adds search and sharing basics to every page:
//   canonical URL, Open Graph + Twitter card tags, favicon links, sitemap.xml and robots.txt.
// Set SITE_URL in Vercel once the custom domain is live (default: https://quartiere.vercel.app).
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const DIST = path.join(ROOT, "dist");
const SITE = (process.env.SITE_URL || "https://quartiere.vercel.app").replace(/\/$/, "");
const SKIP = new Set(["dist", "node_modules", ".git", ".github", ".vercel", "content", "scripts", "api", "package.json", "package-lock.json", "vercel.json", ".gitignore", ".gitattributes", "README.txt", "sales"]);
const NOINDEX = ["admin/"];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
for (const entry of fs.readdirSync(ROOT)) {
  if (SKIP.has(entry)) continue;
  fs.cpSync(path.join(ROOT, entry), path.join(DIST, entry), { recursive: true });
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : d.name === "index.html" ? [path.join(dir, d.name)] : []);

const attr = (s = "") => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const pages = [];

for (const file of walk(DIST)) {
  const rel = path.relative(DIST, file).replace(/\\/g, "/");
  const urlPath = "/" + rel.replace(/index\.html$/, "");
  if (NOINDEX.some((p) => urlPath.startsWith("/" + p))) continue;
  let html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "QUARTIERE";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  // Share image: the page's hero image if it has a matching OG crop, otherwise the default.
  const hero = (html.match(/(?:hs-media|hero-art)"><img[^>]*src="[^"]*?([a-z0-9-]+)\.webp"/) || [])[1];
  const ogName = hero && fs.existsSync(path.join(DIST, "assets/og", hero + ".jpg")) ? hero : "default";
  const hasCanonical = /<link rel="canonical"/.test(html);
  const tags = [
    hasCanonical ? "" : `<link rel="canonical" href="${SITE}${urlPath}">`,
    `<meta property="og:type" content="${urlPath.startsWith("/insights/") && urlPath !== "/insights/" ? "article" : "website"}">`,
    `<meta property="og:site_name" content="Quartiere">`,
    `<meta property="og:title" content="${attr(title.replace(/^QUARTIERE \| /, ""))}">`,
    desc && `<meta property="og:description" content="${desc}">`,
    `<meta property="og:url" content="${SITE}${urlPath}">`,
    `<meta property="og:image" content="${SITE}/assets/og/${ogName}.jpg">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">`,
  ].filter(Boolean).join("\n");
  html = html.replace("</head>", tags + "\n</head>");
  fs.writeFileSync(file, html);
  // Pages whose canonical points elsewhere (copied articles) stay out of the sitemap.
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (canonical === SITE + urlPath) pages.push(urlPath);
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.sort().map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Site packaged into dist/ (${pages.length} pages in sitemap, SITE_URL=${SITE})`);
