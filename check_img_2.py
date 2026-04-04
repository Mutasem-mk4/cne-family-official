from PIL import Image
import os

files = [
    "cne-logo.png",
    "cne-icon.png",
    "cne-logo-dark.png",
    "cne-icon-black.png",
    "cne-social.png"
]

def analyze(path):
    if not os.path.exists(path): return "Missing"
    img = Image.open(path).convert('RGBA')
    width, height = img.size
    
    # find bounding box of non-transparent/non-white pixels
    bbox = img.getbbox()
    
    # check for color
    has_color = False
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                if abs(r - g) > 20 or abs(r - b) > 20 or abs(g - b) > 20:
                    has_color = True
                    break
        if has_color: break
            
    return f"bbox={bbox}, has_color={has_color}"

for f in files:
    path = os.path.join(r"C:\Users\User\.gemini\antigravity\scratch\cne-family-redesign\public\assets\logos", f)
    print(f"{f}: {analyze(path)}")
