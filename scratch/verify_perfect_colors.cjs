const fs = require('fs');
const sharp = require('sharp');

async function verifyPlan(planPath, hotspots, planName) {
  const image = sharp(planPath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  console.log(`\n===========================================`);
  console.log(`Verifying ${planName} (${metadata.width}x${metadata.height})`);
  console.log(`===========================================`);

  let successCount = 0;
  let failCount = 0;

  for (const [name, x, y, w, h] of hotspots) {
    if (x < 0 || y < 0 || x + w > metadata.width || y + h > metadata.height) {
      console.log(`❌ OUT OF BOUNDS: "${name}" at [${x}, ${y}, ${w}, ${h}]`);
      failCount++;
      continue;
    }

    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    const paddingX = Math.round(w * 0.15);
    const paddingY = Math.round(h * 0.15);

    for (let py = y + paddingY; py < y + h - paddingY; py++) {
      for (let px = x + paddingX; px < x + w - paddingX; px++) {
        const idx = (py * metadata.width + px) * info.channels;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        count++;
      }
    }

    const avgR = Math.round(sumR / count);
    const avgG = Math.round(sumG / count);
    const avgB = Math.round(sumB / count);

    // Classification based on colors in study plan
    let colorType = 'unknown';
    // Blue / Core
    if (avgB > 130 && avgR < 120 && avgG > 80) colorType = 'blue (core/shared)';
    else if (avgB > 120 && avgR < 80 && avgG < 130) colorType = 'blue (core)';
    // Green / Science or Dept requirements
    else if (avgG > 120 && avgR < 130 && avgB < 120) colorType = 'green (science)';
    // Orange / University requirements
    else if (avgR > 180 && avgG > 100 && avgB < 110) colorType = 'orange (univ)';
    // Red / Elective
    else if (avgR > 150 && avgG < 100 && avgB < 100) colorType = 'red (elective)';
    // Grey / Connections / Line layout background or empty
    else if (avgR > 180 && avgG > 180 && avgB > 180) colorType = 'light-grey (no-box/layout)';
    else if (avgR < 80 && avgG < 80 && avgB < 80) colorType = 'dark/background';

    const isLayoutOrBackground = colorType === 'dark/background' || colorType === 'light-grey (no-box/layout)';
    
    if (isLayoutOrBackground) {
      console.log(`❌ FAILED: "${name.padEnd(35)}" : rgb=(${avgR}, ${avgG}, ${avgB}) => ${colorType}`);
      failCount++;
    } else {
      console.log(`✅ PASSED: "${name.padEnd(35)}" : rgb=(${avgR}, ${avgG}, ${avgB}) => ${colorType}`);
      successCount++;
    }
  }

  console.log(`\nSummary for ${planName}: Passed = ${successCount}, Failed = ${failCount}`);
  return { successCount, failCount };
}

async function run() {
  const perfect = JSON.parse(fs.readFileSync('scratch/perfect_hotspots.json', 'utf8'));

  // Computer Plan includes COMMON_PLAN_HOTSPOTS and COMPUTER_PLAN_HOTSPOTS
  const computerHotspots = [
    ...perfect.COMMON_PLAN_HOTSPOTS,
    ...perfect.COMPUTER_PLAN_HOTSPOTS
  ];

  // Network Plan includes COMMON_PLAN_HOTSPOTS and NETWORK_PLAN_HOTSPOTS
  const networkHotspots = [
    ...perfect.COMMON_PLAN_HOTSPOTS,
    ...perfect.NETWORK_PLAN_HOTSPOTS
  ];

  await verifyPlan('public/computer-plan.webp', computerHotspots, 'Computer Plan');
  await verifyPlan('public/networking-plan.webp', networkHotspots, 'Networking Plan');
}

run().catch(console.error);
