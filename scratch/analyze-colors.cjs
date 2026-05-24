const sharp = require('sharp');

async function analyze() {
  const image = sharp('public/computer-plan.webp');
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;

  // Let's sample pixel colors in a grid to see what non-gray colors are present
  const colorCounts = {};
  const step = 8;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Skip gray/black/white
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      if (maxDiff > 30) {
        // Group similar colors to get a sense of the palette
        const rBucket = Math.round(r / 16) * 16;
        const gBucket = Math.round(g / 16) * 16;
        const bBucket = Math.round(b / 16) * 16;
        const key = `${rBucket},${gBucket},${bBucket}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }
    }
  }

  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  console.log("Top non-gray colors sampled in computer-plan.webp (R,G,B: count):");
  sortedColors.forEach(([color, count]) => {
    console.log(`  rgb(${color}): ${count}`);
  });
}

analyze().catch(console.error);
