import json
from PIL import Image
import os

files = [
    "cne-logo.png",
    "cne-icon.png",
    "cne-logo-dark.png",
    "cne-icon-black.png",
    "cne-social.png"
]

results = {}
for f in files:
    path = os.path.join(r"C:\Users\User\.gemini\antigravity\scratch\cne-family-redesign\public\assets\logos", f)
    if not os.path.exists(path): continue
    
    img = Image.open(path).convert('RGBA')
    width, height = img.size
    
    # check for color
    has_color = False
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 10:
                # check saturation
                if abs(r - g) > 20 or abs(r - b) > 20 or abs(g - b) > 20:
                    has_color = True
                    break
        if has_color: break
            
    bbox = img.getbbox()
    aspect = (bbox[2]-bbox[0])/(bbox[3]-bbox[1]) if bbox else 0
    results[f] = {"has_color": has_color, "aspect": aspect}

with open(r"C:\Users\User\.gemini\antigravity\scratch\cne-family-redesign\out_colors.json", "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2)
