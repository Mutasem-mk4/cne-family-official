const sharp = require('sharp');

async function run() {
  const img = sharp('public/computer-plan.webp');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Let's sample a line horizontally at y = 1200, from x = 2500 to 2900
  console.log("Horizontal profile at y=1200:");
  for (let x = 2500; x < 2900; x += 10) {
    const idx = (1200 * width + x) * channels;
    console.log(`  x=${x} -> rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }

  // Let's sample a line vertically at x = 2690, from y = 1100 to 1300
  console.log("\nVertical profile at x=2690:");
  for (let y = 1100; y < 1300; y += 10) {
    const idx = (y * width + 2690) * channels;
    console.log(`  y=${y} -> rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }
}

run().catch(console.error);
