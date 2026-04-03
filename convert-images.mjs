import sharp from 'sharp';
import { readdir } from 'fs/promises';
import path from 'path';

const publicDir = './public';
const images = ['computer-plan.jpg', 'networking-plan.jpg'];

for (const img of images) {
  const input = path.join(publicDir, img);
  const outputWebP = path.join(publicDir, img.replace('.jpg', '.webp'));
  const outputJpg = path.join(publicDir, img.replace('.jpg', '-optimized.jpg'));

  // Convert to WebP (best compression)
  await sharp(input)
    .webp({ quality: 82, effort: 6 })
    .toFile(outputWebP);

  // Also optimize the original JPG as fallback
  await sharp(input)
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(outputJpg);

  const { size: origSize } = await import('fs').then(fs =>
    fs.promises.stat(input)
  );
  const { size: webpSize } = await import('fs').then(fs =>
    fs.promises.stat(outputWebP)
  );

  console.log(`\n${img}:`);
  console.log(`  Original:  ${(origSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  WebP:      ${(webpSize / 1024).toFixed(0)} KB  (${Math.round((1 - webpSize / origSize) * 100)}% savings)`);
}

console.log('\n✅ Done! WebP images ready in /public');
