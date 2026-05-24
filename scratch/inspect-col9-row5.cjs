const sharp = require('sharp');

async function run() {
  const img = sharp('public/computer-plan.webp');
  const metadata = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;
  const channels = info.channels;

  // Let's print out what colors we find in a grid of 20x20 in that region
  console.log("Detailed sampling of Column 9 Row 5 region (x=2550..2650, y=1150..1220):");
  for (let y = 1150; y < 1220; y += 10) {
    let line = `y=${y}: `;
    for (let x = 2550; x < 2650; x += 10) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      line += `(${r},${g},${b}) `;
    }
    console.log(line);
  }
}

run().catch(console.error);
