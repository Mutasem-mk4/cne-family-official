const sharp = require('sharp');

async function run() {
  const img = sharp('public/computer-plan.webp');
  const metadata = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;
  const channels = info.channels;

  // Let's sample colors in Column 11 (x around 3200-3400) and Row 1 (y around 150-350)
  console.log("Sampling Column 11 Row 1 in computer-plan.webp:");
  for (let y = 160; y < 350; y += 40) {
    for (let x = 3200; x < 3400; x += 50) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      console.log(`  x=${x}, y=${y} -> rgb(${r}, ${g}, ${b})`);
    }
  }
}

run().catch(console.error);
