import sharp from 'sharp';

async function scanCol(imagePath, label, colIndex, colX) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const rows = [
    { row: 1, y: 180 },
    { row: 2, y: 438 },
    { row: 3, y: 690 },
    { row: 4, y: 940 },
    { row: 5, y: 1188 },
    { row: 6, y: 1438 },
    { row: 7, y: 1680 },
    { row: 8, y: 1928 }
  ];

  console.log(`\nScan Column ${colIndex} (X=${colX}) on ${label}:`);
  for (const r of rows) {
    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    const size = 15;
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const px = colX + dx;
        const py = r.y + dy;
        if (px >= 0 && px < metadata.width && py >= 0 && py < metadata.height) {
          const idx = (py * metadata.width + px) * info.channels;
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
          count++;
        }
      }
    }
    const avgR = Math.round(sumR / count);
    const avgG = Math.round(sumG / count);
    const avgB = Math.round(sumB / count);
    console.log(`Row ${r.row} (Y=${r.y}): rgb=(${avgR}, ${avgG}, ${avgB})`);
  }
}

async function run() {
  await scanCol('public/computer-plan.webp', 'Computer Plan', 9, 2604);
  await scanCol('public/networking-plan.webp', 'Networking Plan', 9, 2604);
}

run().catch(console.error);
