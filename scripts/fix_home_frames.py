from pathlib import Path

INLINE = (
    '<style id="quartiere-home-frame-kill">'
    ".hero-art,.hero.q-hero-preserved .hero-art{border:0!important;outline:0!important}"
    ".hero-art:before,.hero-art::before,"
    ".hero.q-hero-preserved .hero-art:before,.hero.q-hero-preserved .hero-art::before,"
    ".q-service-image:after,.q-service-image::after"
    "{content:none!important;display:none!important;border:0!important;opacity:0!important;visibility:hidden!important}"
    "</style>"
)

files = [
    "index.html",
    "what-we-do/index.html",
    "company/index.html",
    "contact/index.html",
]

for rel in files:
    path = Path(rel)
    text = path.read_text(encoding="utf-8")
    text = text.replace("assets/site-nav.css", "assets/quartiere-nav.css")
    if rel == "index.html" and "quartiere-home-frame-kill" not in text:
        if "</head>" not in text:
            raise SystemExit("no head in index.html")
        text = text.replace("</head>", INLINE + "</head>", 1)
    path.write_text(text, encoding="utf-8")
    print("patched", rel)
