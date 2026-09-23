QUARTIERE static website

Vercel (settings come from vercel.json):
- Build command: npm run build   (builds Insights from Markdown, then packages the site into dist/)
- Output directory: dist
- Environment variables for the /admin editor: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

Pages:
- /                      Home
- /what-we-do/           The Q4 Method
- /industries/           Focus sectors
- /q4-labs/              Systems overview, plus /vigil/ /polysoma/ /altiera/ /lumen/
- /insights/             Articles (generated, see below)
- /trust/                Data handling
- /company/
- /contact/              Enquiry form

INSIGHTS
Write posts at https://<your-domain>/admin (sign in with GitHub). Saving commits a Markdown file
to content/insights/ and Vercel rebuilds the site; the post is live in about a minute.
You can also add a .md file to content/insights/ by hand (copy an existing one for the header fields).

Formatting tips inside a post:
- "## Heading" for a section heading, "### Heading" for a smaller one
- "###### 01 / Label" for the small blue label above a heading
- "> Text" for a large callout
- Markdown tables work and use the site table style

Do not edit insights/*/index.html directly: they are regenerated on every build.
To change the article or Insights page layout, edit content/templates/.
Local preview: npm install, then npm run insights (regenerates the pages in place).

Shared styles: assets/quartiere-nav.css (nav, buttons, mobile menu), assets/site-footer.css,
assets/hero-split.css (page heroes), assets/product.css (product, Trust and Insights pages).

Forms (home modal and /contact/) do not send anywhere yet: they only show a confirmation message.
