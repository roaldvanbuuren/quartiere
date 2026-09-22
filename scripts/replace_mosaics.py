#!/usr/bin/env python3
"""Decode mosaic JPEGs into assets/ and point non-hero slots at them."""
from __future__ import annotations

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
B64_DIR = ROOT / "scripts" / "mosaic-b64"

MOSAICS = {
    "mosaic-network.jpg": "mosaic-network.jpg.b64",
    "mosaic-laptops.jpg": "mosaic-laptops.jpg.b64",
    "mosaic-table.jpg": "mosaic-table.jpg.b64",
    "mosaic-service.jpg": "mosaic-service.jpg.b64",
    "mosaic-enable.jpg": "mosaic-enable.jpg.b64",
}

IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)


def decode_assets() -> None:
    ASSETS.mkdir(exist_ok=True)
    for dest_name, src_name in MOSAICS.items():
        raw = (B64_DIR / src_name).read_text().strip()
        data = base64.b64decode(raw)
        out = ASSETS / dest_name
        out.write_bytes(data)
        print(f"wrote {out.relative_to(ROOT)} ({len(data)} bytes)")


def replace_img_src(html: str, new_src: str, *, alt: str | None = None, cls: str | None = None, new_alt: str | None = None) -> tuple[str, int]:
    count = 0

    def sub(m: re.Match) -> str:
        nonlocal count
        tag = m.group(0)
        if alt is not None and f'alt="{alt}"' not in tag and f"alt='{alt}'" not in tag:
            return tag
        if cls is not None and f'class="{cls}"' not in tag and f"class='{cls}'" not in tag:
            return tag
        if "data:" not in tag and "src=" in tag:
            updated = re.sub(r'src="[^"]+"', f'src="{new_src}"', tag, count=1)
            updated = re.sub(r"src='[^']+'", f"src='{new_src}'", updated, count=1)
        else:
            updated = re.sub(r'src="data:[^"]+"', f'src="{new_src}"', tag, count=1)
            updated = re.sub(r"src='data:[^']+'", f"src='{new_src}'", updated, count=1)
        if new_alt:
            updated = re.sub(r'alt="[^"]*"', f'alt="{new_alt}"', updated, count=1)
            updated = re.sub(r"alt='[^']*'", f"alt='{new_alt}'", updated, count=1)
        if updated != tag:
            count += 1
        return updated

    return IMG_TAG.sub(sub, html), count


def replace_data_url_after(html: str, anchor: str, new_url: str) -> tuple[str, bool]:
    i = html.find(anchor)
    if i < 0:
        return html, False
    window = html[i : i + 900_000]
    m = re.search(r"url\((['\"]?)data:image[^)]+\)", window)
    if not m:
        m2 = re.search(r"url\((['\"]?)([^)'\"]+)(['\"]?)\)", window)
        if m2 and "mosaic-" in m2.group(2):
            return html, True
        return html, False
    start, end = i + m.start(), i + m.end()
    quote = m.group(1) or '"'
    return html[:start] + f"url({quote}{new_url}{quote})" + html[end:], True


def patch_home(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html, n1 = replace_img_src(
        html,
        "assets/mosaic-network.jpg",
        alt="Fragmented network mosaic",
        new_alt="Mosaic of figures beneath a constellation of connected nodes",
    )
    html, n2 = replace_img_src(
        html,
        "assets/mosaic-laptops.jpg",
        alt="Person working at a desk",
        new_alt="Mosaic of figures working together at laptops",
    )
    html, n3 = replace_img_src(
        html,
        "assets/mosaic-table.jpg",
        cls="history-image",
        new_alt="Mosaic of four figures in discussion around a table",
    )
    html, ok_s = replace_data_url_after(html, ".q-service-image{", "assets/mosaic-service.jpg")
    html, ok_a = replace_data_url_after(html, 'class="q-archive-image"', "assets/mosaic-enable.jpg")
    path.write_text(html, encoding="utf-8")
    print(
        f"{path}: network={n1} laptops={n2} table={n3} "
        f"service_bg={ok_s} archive_bg={ok_a} size={path.stat().st_size}"
    )


def patch_wwd(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html, n = replace_img_src(
        html,
        "../assets/mosaic-laptops.jpg",
        alt="Ancient mosaic depicting people gathered around a screen-like object",
        new_alt="Mosaic of figures working together at laptops",
    )
    path.write_text(html, encoding="utf-8")
    print(f"{path}: laptops={n} size={path.stat().st_size}")


def patch_company(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    html, n1 = replace_img_src(
        html,
        "../assets/mosaic-table.jpg",
        alt="Ancient mosaic with a geometric network at its centre",
        new_alt="Mosaic of four figures in discussion around a table",
    )
    html, n2 = replace_img_src(
        html,
        "../assets/mosaic-network.jpg",
        alt="Person working with technology in a considered environment",
        new_alt="Mosaic of figures beneath a constellation of connected nodes",
    )
    path.write_text(html, encoding="utf-8")
    print(f"{path}: table={n1} network={n2} size={path.stat().st_size}")


def main() -> None:
    decode_assets()
    patch_home(ROOT / "index.html")
    patch_wwd(ROOT / "what-we-do" / "index.html")
    patch_company(ROOT / "company" / "index.html")


if __name__ == "__main__":
    main()
