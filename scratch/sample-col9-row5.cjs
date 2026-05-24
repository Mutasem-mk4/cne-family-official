const sharp = require('sharp');

async function run() {
  const img = sharp('public/computer-plan.webp');
  const metadata = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;
  const channels = info.channels;

  console.log("Sampling Column 9 Row 5 in computer-plan.webp (around x=2564, y=1168):");
  for (let y = 1140; y < 1200; y += 10) {
    for (let x = 2540; x < 2600; x += 10) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      console.log(`  x=${x}, y=${y} -> rgb(${r}, ${g}, ${b})`);
    }
  }
}

run().catch(console.error);
