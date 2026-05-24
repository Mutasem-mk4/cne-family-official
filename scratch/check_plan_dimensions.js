import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
    "public/computer-plan.webp",
    "public/networking-plan.webp",
    "public/computer-plan.jpg",
    "public/networking-plan.jpg"
];

for (const f of files) {
    const fullPath = path.join("C:/Users/User/cne-family-official", f);
    if (!fs.existsSync(fullPath)) {
        console.log(`${f}: Missing`);
        continue;
    }
    try {
        const metadata = await sharp(fullPath).metadata();
        console.log(`${f}: width=${metadata.width}, height=${metadata.height}, format=${metadata.format}`);
    } catch (err) {
        console.error(`Error reading ${f}:`, err);
    }
}
