from PIL import Image
import os

files = [
    "cne-logo.png",
    "cne-icon.png",
    "cne-logo-dark.png",
    "cne-icon-black.png",
    "cne-social.png"
]

for f in files:
    path = os.path.join(r"C:\Users\User\.gemini\antigravity\scratch\cne-family-redesign\public\assets\logos", f)
    if not os.path.exists(path):
        print(f"Missing {f}")
        continue
    img = Image.open(path)
    img = img.convert('RGBA')
    # get colors
    colors = img.getcolors(maxcolors=100000)
    # print number of unique colors
    print(f"{f}: size={img.size}, unique colors={len(colors) if colors else '>100000'}")
    
