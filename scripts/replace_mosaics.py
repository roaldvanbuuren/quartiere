#!/usr/bin/env python3
"""Put mosaic JPEGs in assets/ and point non-hero slots at them."""
from __future__ import annotations

import base64
import re
import urllib.request
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

# Transfer-only sources; files are copied into assets/ and served from the repo.
MOSAIC_URLS = {
    "mosaic-network.jpg": "https://i.imgur.com/gcpXbSJ.jpeg",
    "mosaic-laptops.jpg": "https://i.imgur.com/4GY7bCv.jpeg",
    "mosaic-table.jpg": "https://i.imgur.com/OQE29td.jpeg",
    "mosaic-service.jpg": "https://i.imgur.com/6rv07xs.jpeg",
    "mosaic-enable.jpg": "https://i.imgur.com/qdBqKus.jpeg",
}

IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)


def _load_b64(src_name: str) -> str | None:
    whole = B64_DIR / src_name
    if whole.exists():
        return "".join(whole.read_text().split())
    parts = sorted(B64_DIR.glob(src_name + ".p*"))
    if not parts:
        return None
    return "".join(p.read_text().strip() for p in parts)


def _download(url: str, dest: Path) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "QuartiereMosaicBot/1.0",
            "Referer": "https://imgur.com/",
            "Accept": "image/jpeg,image/*;q=0.8,*/*;q=0.5",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    if not data.startswith(b"\xff\xd8"):
        raise RuntimeError(f"not a jpeg from {url}: {data[:40]!r}")
    dest.write_bytes(data)
    return data


def decode_assets() -> None:
    ASSETS.mkdir(exist_ok=True)
    B64_DIR.mkdir(parents=True, exist_ok=True)
    for dest_name, src_name in MOSAICS.items():
        out = ASSETS / dest_name
        raw = _load_b64(src_name)
        if raw:
            data = base64.b64decode(raw)
            out.write_bytes(data)
            print(f"wrote {out.relative_to(ROOT)} from b64 ({len(data)} bytes)")
            continue
        data = _download(MOSAIC_URLS[dest_name], out)
        print(f"wrote {out.relative_to(ROOT)} from url ({len(data)} bytes)")


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
        "../assets/mosaic-network.jpg",
        alt="Ancient mosaic with a geometric network at its centre",
        new_alt="Mosaic of figures beneath a constellation of connected nodes",
    )
    html, n2 = replace_img_src(
        html,
        "../assets/mosaic-service.jpg",
        alt="Person working with technology in a considered environment",
        new_alt="Mosaic of figures gathered at a service counter",
    )
    path.write_text(html, encoding="utf-8")
    print(f"{path}: network={n1} service={n2} size={path.stat().st_size}")


def main() -> None:
    decode_assets()
    patch_home(ROOT / "index.html")
    patch_wwd(ROOT / "what-we-do" / "index.html")
    patch_company(ROOT / "company" / "index.html")


if __name__ == "__main__":
    main()
