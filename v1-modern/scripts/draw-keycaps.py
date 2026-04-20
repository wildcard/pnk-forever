#!/usr/bin/env python3
"""Draw keyboard button-prompt keycaps as clean PNGs.
Style matches the PNK Forever theme: dark warm slate with coral-orange accent.
Output: 96x96 PNG per key, drawn with soft rounded rectangles and crisp labels.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).resolve().parent.parent / "public" / "img" / "ui" / "button-prompts" / "keyboard"
SIZE = 96
BG = (0, 0, 0, 0)
CAP_OUTER = (26, 26, 26, 255)
CAP_INNER = (42, 24, 16, 255)
BORDER = (255, 107, 53, 230)
INNER_BORDER = (255, 107, 53, 90)
LABEL = (255, 248, 240, 255)
SHADOW = (0, 0, 0, 110)


def find_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def base_cap() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), BG)

    # Soft drop shadow under the key
    shadow = Image.new("RGBA", (SIZE, SIZE), BG)
    sd = ImageDraw.Draw(shadow)
    rounded_rect(sd, (10, 14, SIZE - 6, SIZE - 6), radius=18, fill=SHADOW)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=4))
    img.alpha_composite(shadow)

    draw = ImageDraw.Draw(img)
    # Outer cap
    rounded_rect(draw, (6, 6, SIZE - 10, SIZE - 14), radius=16,
                 fill=CAP_OUTER, outline=BORDER, width=3)
    # Inner bevel
    rounded_rect(draw, (12, 12, SIZE - 16, SIZE - 20), radius=12,
                 fill=CAP_INNER, outline=INNER_BORDER, width=2)
    # Top highlight
    hl = Image.new("RGBA", (SIZE, SIZE), BG)
    hd = ImageDraw.Draw(hl)
    rounded_rect(hd, (14, 14, SIZE - 18, 34), radius=10, fill=(255, 200, 160, 40))
    hl = hl.filter(ImageFilter.GaussianBlur(radius=2))
    img.alpha_composite(hl)

    return img


def draw_label(img: Image.Image, text: str, font_size: int = 36) -> None:
    draw = ImageDraw.Draw(img)
    font = find_font(font_size)
    # Measure and center
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (SIZE - tw) // 2 - bbox[0]
    y = (SIZE - 14 - th) // 2 - bbox[1]
    # Faint shadow under text
    draw.text((x + 1, y + 2), text, font=font, fill=(0, 0, 0, 140))
    draw.text((x, y), text, font=font, fill=LABEL)


def draw_arrow(img: Image.Image, direction: str) -> None:
    draw = ImageDraw.Draw(img)
    cx, cy = SIZE // 2, (SIZE - 14) // 2 + 7
    size = 22
    if direction == "up":
        pts = [(cx, cy - size), (cx - size, cy + size - 2), (cx + size, cy + size - 2)]
    elif direction == "down":
        pts = [(cx, cy + size), (cx - size, cy - size + 2), (cx + size, cy - size + 2)]
    elif direction == "left":
        pts = [(cx - size, cy), (cx + size - 2, cy - size), (cx + size - 2, cy + size)]
    elif direction == "right":
        pts = [(cx + size, cy), (cx - size + 2, cy - size), (cx - size + 2, cy + size)]
    else:
        return
    draw.polygon(pts, fill=LABEL)


def draw_arrows_cluster(img: Image.Image) -> None:
    # Four mini-arrows for the 'arrows' key
    draw = ImageDraw.Draw(img)
    cx, cy = SIZE // 2, (SIZE - 14) // 2 + 7
    r = 14
    s = 9
    triples = [
        ("up",    (cx, cy - r),         [(cx, cy - r - s), (cx - s, cy - r + s - 1), (cx + s, cy - r + s - 1)]),
        ("down",  (cx, cy + r),         [(cx, cy + r + s), (cx - s, cy + r - s + 1), (cx + s, cy + r - s + 1)]),
        ("left",  (cx - r, cy),         [(cx - r - s, cy), (cx - r + s - 1, cy - s), (cx - r + s - 1, cy + s)]),
        ("right", (cx + r, cy),         [(cx + r + s, cy), (cx + r - s + 1, cy - s), (cx + r - s + 1, cy + s)]),
    ]
    for _, _, pts in triples:
        draw.polygon(pts, fill=LABEL)


def make_key(filename: str, render) -> None:
    img = base_cap()
    render(img)
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / filename, "PNG")
    print(f"  wrote {filename}  ({(OUT / filename).stat().st_size // 1024} KB)")


def main() -> None:
    # Letter keys
    for c in "abnmstipuvo":
        make_key(f"key-{c}.png", lambda im, ch=c: draw_label(im, ch.upper(), 44))

    # Special keys
    make_key("key-enter.png",  lambda im: draw_label(im, "↵",  52))
    make_key("key-escape.png", lambda im: draw_label(im, "Esc", 26))
    make_key("key-space.png",  lambda im: draw_label(im, "␣",  48))
    make_key("key-plus.png",   lambda im: draw_label(im, "+",  50))
    make_key("key-minus.png",  lambda im: draw_label(im, "–",  50))

    # Arrow keys
    make_key("key-arrows.png", draw_arrows_cluster)
    make_key("arrow-up.png",    lambda im: draw_arrow(im, "up"))
    make_key("arrow-down.png",  lambda im: draw_arrow(im, "down"))
    make_key("arrow-left.png",  lambda im: draw_arrow(im, "left"))
    make_key("arrow-right.png", lambda im: draw_arrow(im, "right"))


if __name__ == "__main__":
    main()
