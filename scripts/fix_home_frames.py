import re
from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

# Hero should not be a boxed container.
text = text.replace(
    '<section class="hero container q-hero-preserved">',
    '<section class="hero q-hero-preserved">',
)

# Delete the actual source declarations instead of fighting them.
subs = [
    (r"nav\{height:86px;border-bottom:1px solid var\(--line\)", "nav{height:86px;border-bottom:0"),
    (r"nav\{height:70px;border-bottom:1px solid var\(--line\)", "nav{height:70px;border-bottom:0"),
    (r"\.site-nav\{height:80px;border-bottom:1px solid var\(--line\)", ".site-nav{height:80px;border-bottom:0"),
    (r"nav\.q-nav-architectural\{height:86px;border-bottom:1px solid var\(--line\)", "nav.q-nav-architectural{height:86px;border-bottom:0"),
    (r"\.hero-art:before\{content:\"\";position:absolute;inset:18px 18px 18px 0;border:1px solid rgba\(238,229,212,\.42\);z-index:2;pointer-events:none\}", ".hero-art:before,.hero-art::before{content:none!important;display:none!important;border:0!important}"),
    (r"object-fit:contain", "object-fit:cover"),
]
for pat, repl in subs:
    text, n = re.subn(pat, repl, text)
    print(pat[:50], n)

TAIL = '''<style id="quartiere-nav-border-kill">
nav, .site-nav, .site-nav.container, .hero, .hero-art, .hero-copy {
  border: 0 !important;
  border-bottom: 0 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}
.hero.q-hero-preserved .hero-art img {
  object-fit: cover !important;
  object-position: center center !important;
}
</style>'''

if "quartiere-nav-border-kill" not in text:
    text = text.replace("</body>", TAIL + "</body>", 1)

path.write_text(text, encoding="utf-8")
print("done", path.stat().st_size)
