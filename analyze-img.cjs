// Image analyzer to find the exact button positions by color matching
const sharp = require('sharp');

async function analyze() {
  const image = sharp('public/computer-plan.webp');
  const metadata = await image.metadata();
  console.log('Image size:', metadata.width, 'x', metadata.height);

  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Let's sample pixels at regular intervals to see where the colors change
  // We want to find the columns.
  // Let's analyze a horizontal line across the middle of the image, e.g. at y = metadata.height / 4 (Row 2ish)
  const targetY = Math.round(metadata.height * 0.2); // Around 20% down
  console.log(`Sampling horizontal line at Y = ${targetY}`);

  const rowPixels = [];
  for (let x = 0; x < metadata.width; x++) {
    const idx = (targetY * metadata.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    rowPixels.push({ x, r, g, b });
  }

  // Print segments where we have non-dark colors (buttons)
  // Let's define a helper to classify colors:
  // - Red: R > 150, G < 50, B < 50
  // - Green: R < 100, G > 120, B < 100
  // - Blue: R < 50, G > 100, B > 150
  // - Orange: R > 180, G > 100, B < 50
  let currentButton = null;
  const buttons = [];

  for (let x = 0; x < metadata.width; x++) {
    const idx = (targetY * metadata.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    let color = null;
    if (r > 130 && g < 60 && b < 60) color = 'red';
    else if (r < 100 && g > 110 && b < 100) color = 'green';
    else if (r < 100 && g > 100 && b > 130) color = 'blue';
    else if (r > 160 && g > 90 && b < 60) color = 'orange';

    if (color) {
      if (!currentButton) {
        currentButton = { color, startX: x };
      }
    } else {
      if (currentButton) {
        currentButton.endX = x;
        currentButton.centerX = Math.round((currentButton.startX + currentButton.endX) / 2);
        currentButton.width = currentButton.endX - currentButton.startX;
        buttons.push(currentButton);
        currentButton = null;
      }
    }
  }

  console.log('\nDetected buttons along the sampled line:');
  buttons.forEach((btn, idx) => {
    // Convert coordinate to 1530 width scale for comparison
    const x1530 = (btn.centerX / metadata.width) * 1530;
    const w1530 = (btn.width / metadata.width) * 1530;
    console.log(`Button ${idx + 1}: color=${btn.color.padEnd(6)} startX=${String(btn.startX).padStart(4)} endX=${String(btn.endX).padStart(4)} centerX=${String(btn.centerX).padStart(4)} (on 1530 scale: x=${x1530.toFixed(1)} width=${w1530.toFixed(1)})`);
  });
}

analyze().catch(console.error);
