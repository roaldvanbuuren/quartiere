// Builds the Insights section from Markdown posts.
//
//   content/insights/*.md            one file per post (written by /admin or by hand)
//   content/templates/article.html   page shell for a single post
//   content/templates/insights-index.html   Insights page shell, list goes at <!--INSIGHTS-LIST-->
//
// Output: insights/<slug>/index.html for every post, and insights/index.html with all posts, newest first.
// Runs on every Vercel deploy (see vercel.json "buildCommand"); run locally with `npm run build`.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const POSTS = path.join(ROOT, "content", "insights");
const OUT = path.join(ROOT, "insights");
const articleTpl = fs.readFileSync(path.join(ROOT, "content/templates/article.html"), "utf8");
const indexTpl = fs.readFileSync(path.join(ROOT, "content/templates/insights-index.html"), "utf8");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const toDate = (d) => (d instanceof Date ? d : new Date(d));
const longDate = (d) => { const x = toDate(d); return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
const shortDate = (d) => { const x = toDate(d); return `${MONTHS[x.getUTCMonth()].slice(0, 3)} ${x.getUTCFullYear()}`; };

// Markdown conventions: "###### Label" renders as the small blue section label,
// "> quote" renders as a large callout, tables get the site table style.
marked.use({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 6) return `<span class="a-label">${text}</span>\n`;
      return `<h${depth}>${text}</h${depth}>\n`;
    },
    blockquote({ tokens }) {
      const inner = this.parser.parse(tokens).replace(/^<p>|<\/p>\s*$/g, "");
      return `<blockquote class="a-callout">${inner}</blockquote>\n`;
    },
    table(token) {
      const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join("");
      const rows = token.rows.map((r) => "<tr>" + r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("") + "</tr>").join("");
      return `<div class="a-table"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
    },
  },
});

const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const posts = fs.readdirSync(POSTS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(POSTS, f), "utf8"));
    if (data.draft) return null;
    const slug = data.slug ? slugify(data.slug) : f.replace(/\.md$/, "");
    return { slug, ...data, body: marked.parse(content) };
  })
  .filter(Boolean)
  .sort((a, b) => toDate(b.date) - toDate(a.date));

for (const p of posts) {
  const cover = p.cover ? `<figure class="a-cover"><img src="${esc(p.cover)}" alt="${esc(p.cover_alt || p.title)}"></figure>\n` : "";
  const html = articleTpl
    .replaceAll("{{title}}", esc(p.title))
    .replace("{{summary}}", esc(p.summary || ""))
    .replace("{{kind}}", esc(p.kind || "Insight"))
    .replace("{{subtitle}}", p.subtitle ? `<p class="p-lede">${esc(p.subtitle)}</p>` : "")
    .replace("{{author}}", esc(p.author || "Quartiere"))
    .replace("{{date}}", longDate(p.date))
    .replace("{{cover}}", cover)
    .replace("{{body}}", p.body)
    // Posts first published elsewhere point search engines at the original.
    .replace("</head>", p.canonical ? `<link rel="canonical" href="${esc(p.canonical)}">\n</head>` : "</head>");
  fs.mkdirSync(path.join(OUT, p.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, p.slug, "index.html"), html);
}

const list = posts.map((p, i) =>
  `<a class="i-item" href="${p.slug}/"><div class="i-num">${String(i + 1).padStart(2, "0")}</div>` +
  `<div><h3>${esc(p.title)}</h3><p>${esc(p.summary || "")}</p></div>` +
  `<div class="i-meta">${esc(p.kind || "Insight")} · ${shortDate(p.date)}<br><em class="i-read">Read →</em></div></a>`
).join("");
fs.writeFileSync(path.join(OUT, "index.html"), indexTpl.replace("<!--INSIGHTS-LIST-->", list));

console.log(`Insights: built ${posts.length} post(s): ${posts.map((p) => p.slug).join(", ")}`);
