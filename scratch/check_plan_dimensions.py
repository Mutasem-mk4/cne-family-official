from PIL import Image
import os

files = [
    "public/computer-plan.webp",
    "public/networking-plan.webp",
    "public/computer-plan.jpg",
    "public/networking-plan.jpg"
]

for f in files:
    path = os.path.join(r"C:\Users\User\cne-family-official", f)
    if not os.path.exists(path):
        print(f"{f}: Missing")
        continue
    img = Image.open(path)
    print(f"{f}: size={img.size}, format={img.format}")
