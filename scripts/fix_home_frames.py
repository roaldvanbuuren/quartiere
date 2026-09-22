import re
from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

replacements = [
    (
        ".hero-art:before{content:\"\";position:absolute;inset:18px 18px 18px 0;border:1px solid rgba(238,229,212,.42);z-index:2;pointer-events:none}",
        ".hero-art:before,.hero-art::before{content:none!important;display:none!important;border:0!important;inset:auto!important}",
    ),
    (
        ".hero-art{min-height:720px;position:relative;overflow:hidden;border-left:1px solid var(--line)}",
        ".hero-art{min-height:720px;position:relative;overflow:hidden;border:0}",
    ),
    (
        ".hero{min-height:720px;display:grid;grid-template-columns:43% 57%;border-left:1px solid var(--line);border-right:1px solid var(--line)}",
        ".hero{min-height:720px;display:grid;grid-template-columns:43% 57%;border:0}",
    ),
    (
        ".q-service-image:after{content:\"\";position:absolute;inset:32px;border:1px solid rgba(238,229,212,.35)}",
        ".q-service-image:after,.q-service-image::after{content:none!important;display:none!important;border:0!important}",
    ),
    (
        ".q-image-rule{position:absolute;left:32px;right:32px;bottom:32px;border-top:1px solid rgba(238,229,212,.35)}",
        ".q-image-rule{display:none!important}",
    ),
]

for old, new in replacements:
    count = text.count(old)
    print("match", count, old[:60])
    if count:
        text = text.replace(old, new)

TAIL = '<style id="quartiere-home-frame-kill-tail">.hero-art:before,.hero-art::before{content:none!important;display:none!important;border:none!important}</style>'
if "quartiere-home-frame-kill-tail" not in text:
    text = text.replace("</body>", TAIL + "</body>", 1)

path.write_text(text, encoding="utf-8")
print("wrote", path.stat().st_size)
