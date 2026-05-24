const sharp = require('sharp');

async function run() {
  const img = sharp('public/computer-plan.webp');
  const metadata = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;
  const channels = info.channels;

  console.log("Analyzing Column 9 Row 5 area (x=2540 to 2640, y=1140 to 1200):");
  
  let blueCount = 0;
  let redCount = 0;
  let greenCount = 0;
  let orangeCount = 0;
  let otherCount = 0;

  for (let y = 1140; y < 1200; y++) {
    for (let x = 2540; x < 2640; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Red
      if (r > 150 && g < 100 && b < 100) redCount++;
      // Green
      else if (r < 120 && g > 130 && b < 120) greenCount++;
      // Blue
      else if (r < 120 && g > 80 && b > 130) blueCount++;
      // Orange
      else if (r > 180 && g > 90 && b < 100) orangeCount++;
      else otherCount++;
    }
  }

  console.log(`Results: Red=${redCount}, Green=${greenCount}, Blue=${blueCount}, Orange=${orangeCount}, Other=${otherCount}`);
}

run().catch(console.error);
