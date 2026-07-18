#!/usr/bin/env python3
"""Build the generated desktop SVG with aligned interactive raster groups."""

from __future__ import annotations

import argparse
import base64
import io
from pathlib import Path

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit(
        "Pillow is required. Install it with: python3 -m pip install Pillow"
    ) from error


SCREEN_BOX = (450, 85, 1045, 545)
BOOKS_BOX = (1060, 395, 1360, 575)

# These paths follow the generated monitor and book silhouettes in source pixels.
SCREEN_PATH = (
    "M 478,98 H 1010 Q 1027,98 1027,115 V 448 "
    "Q 1027,472 1003,472 H 802 L 810,510 Q 812,519 824,524 "
    "L 837,530 H 654 L 668,524 Q 680,519 682,510 L 692,472 H 486 "
    "Q 462,472 462,448 V 115 Q 462,98 478,98 Z"
)
BOOKS_PATH = (
    "M 1114,412 Q 1195,406 1268,414 L 1338,420 L 1332,432 "
    "Q 1327,439 1308,440 L 1325,455 Q 1337,462 1342,472 "
    "L 1337,480 Q 1330,485 1313,485 L 1328,500 Q 1340,509 1346,521 "
    "L 1341,530 Q 1335,536 1317,535 L 1333,549 Q 1340,554 1340,560 "
    "Q 1262,570 1178,563 L 1082,548 Q 1075,537 1082,521 "
    "Q 1086,510 1100,502 Q 1082,493 1087,477 Q 1090,465 1107,458 "
    "Q 1094,448 1099,434 Q 1103,421 1114,412 Z"
)


def webp_data_uri(image: Image.Image, quality: int = 82) -> str:
    output = io.BytesIO()
    image.save(output, "WEBP", quality=quality, method=6, exact=True)
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:image/webp;base64,{encoded}"


def build_svg(source: Path, destination: Path) -> None:
    with Image.open(source) as opened:
        image = opened.convert("RGB")

    width, height = image.size
    if (width, height) != (1536, 1024):
        raise SystemExit(
            f"Expected a 1536x1024 generated source, got {width}x{height}: {source}"
        )

    background = webp_data_uri(image)
    screen = webp_data_uri(image.crop(SCREEN_BOX), quality=88)
    books = webp_data_uri(image.crop(BOOKS_BOX), quality=88)

    screen_x, screen_y, screen_right, screen_bottom = SCREEN_BOX
    books_x, books_y, books_right, books_bottom = BOOKS_BOX
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
  version="1.1"
  id="desktop_scene"
  width="{width}"
  height="{height}"
  viewBox="0 0 {width} {height}"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="screen_clip" clipPathUnits="userSpaceOnUse">
      <path d="{SCREEN_PATH}" />
    </clipPath>
    <clipPath id="books_clip" clipPathUnits="userSpaceOnUse">
      <path d="{BOOKS_PATH}" />
    </clipPath>
  </defs>
  <g id="background">
    <image
      id="desktop_background_image"
      x="0"
      y="0"
      width="{width}"
      height="{height}"
      preserveAspectRatio="none"
      xlink:href="{background}" />
  </g>
  <g id="screen_x5F_group">
    <image
      id="screen_x5F_image"
      x="{screen_x}"
      y="{screen_y}"
      width="{screen_right - screen_x}"
      height="{screen_bottom - screen_y}"
      preserveAspectRatio="none"
      clip-path="url(#screen_clip)"
      xlink:href="{screen}" />
    <path
      id="screen_x5F_path"
      d="{SCREEN_PATH}"
      fill="none" />
  </g>
  <g id="books_x5F_group">
    <image
      id="books_x5F_image"
      x="{books_x}"
      y="{books_y}"
      width="{books_right - books_x}"
      height="{books_bottom - books_y}"
      preserveAspectRatio="none"
      clip-path="url(#books_clip)"
      xlink:href="{books}" />
    <path
      id="books_x5F_path"
      d="{BOOKS_PATH}"
      fill="none" />
  </g>
</svg>
'''

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(svg, encoding="utf-8")
    print(f"Created {destination} ({destination.stat().st_size / 1024:.0f} KiB)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Generated 1536x1024 scene image")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/images/Generated desktop scene.svg"),
    )
    args = parser.parse_args()
    build_svg(args.source, args.output)


if __name__ == "__main__":
    main()
