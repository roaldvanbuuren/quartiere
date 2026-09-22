from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

old = """.hero-art:before, .hero-art::before,
.hero-art:after, .hero-art::after,
.hero:before, .hero::before {
  content: none !important;
  display: none !important;
  border: 0 !important;
}"""

new = """.hero-art:before, .hero-art::before,
.hero:before, .hero::before {
  content: none !important;
  display: none !important;
  border: 0 !important;
}"""

if old in text:
    text = text.replace(old, new)
    print("stripped after-kill")
else:
    print("after-kill block not found exactly")
    # fallback: stop hiding after
    text = text.replace(".hero-art:after, .hero-art::after,", "")
    print("fallback applied")

SCRIM = '''<style id="quartiere-home-text-scrim">
.hero.q-hero-preserved .hero-art::after,
.hero.q-hero-preserved .hero-art:after {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  width: auto !important;
  height: auto !important;
  border: 0 !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: none !important;
  z-index: 1 !important;
  background:
    linear-gradient(90deg, rgba(18,29,25,.88) 0%, rgba(18,29,25,.68) 25%, rgba(18,29,25,.28) 48%, rgba(18,29,25,0) 72%),
    linear-gradient(0deg, rgba(18,29,25,.32), transparent 42%) !important;
}
.hero.q-hero-preserved .hero-copy { position: relative; z-index: 3; }
</style>'''

if "quartiere-home-text-scrim" not in text:
    text = text.replace("</body>", SCRIM + "</body>", 1)
    print("added scrim")

path.write_text(text, encoding="utf-8")
print("wrote", path.stat().st_size)
