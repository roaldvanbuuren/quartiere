from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

# Stop the hero using the boxed container width.
text = text.replace(
    '<section class="hero container q-hero-preserved">',
    '<section class="hero q-hero-preserved">',
    1,
)

SNIP = '''<style id="quartiere-kill-hero-frame">
nav, .site-nav, .hero, .hero-art, .hero-copy {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}
.hero-art:before, .hero-art::before,
.hero-art:after, .hero-art::after,
.hero:before, .hero::before {
  content: none !important;
  display: none !important;
  border: 0 !important;
}
.hero.q-hero-preserved .hero-art img {
  object-fit: cover !important;
}
</style>
<script id="quartiere-kill-hero-frame-js">
(function () {
  var art = document.querySelector(".hero-art");
  if (art) {
    art.style.border = "0";
    art.style.outline = "none";
  }
  var hero = document.querySelector(".hero");
  if (hero) {
    hero.style.border = "0";
    hero.classList.remove("container");
  }
})();
</script>'''

if "quartiere-kill-hero-frame-js" not in text:
    text = text.replace("</body>", SNIP + "</body>", 1)

path.write_text(text, encoding="utf-8")
print("updated index.html")
