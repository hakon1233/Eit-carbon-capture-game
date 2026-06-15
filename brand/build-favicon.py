#!/usr/bin/env python3
"""Assemble favicon.ico (+ apple-touch-icon) from the natively-rendered app-icon PNGs.
Run AFTER `node brand/build-brand.mjs`.  Requires Pillow.
    python3 brand/build-favicon.py
"""
import os
from PIL import Image

ICON_DIR = os.path.join(os.path.dirname(__file__), "icon")
sizes = [16, 32, 48, 64, 128, 256]
imgs = [Image.open(os.path.join(ICON_DIR, f"app-icon-{s}.png")).convert("RGBA") for s in sizes]
# multi-resolution ICO built from crisp native renders (not a single downscale)
imgs[-1].save(
    os.path.join(ICON_DIR, "favicon.ico"),
    format="ICO",
    sizes=[(s, s) for s in sizes],
    append_images=imgs[:-1],
)
# apple-touch-icon: 180px, flattened (no alpha)
Image.open(os.path.join(ICON_DIR, "app-icon-180.png")).convert("RGB").save(
    os.path.join(ICON_DIR, "apple-touch-icon.png")
)
print("wrote favicon.ico (16-256) + apple-touch-icon.png")
