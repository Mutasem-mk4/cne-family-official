import sharp from 'sharp';

async function findBlueButtons(imagePath, label) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const columns = [
    { col: 1, x: 60 },
    { col: 2, x: 390 },
    { col: 3, x: 708 },
    { col: 4, x: 1024 },
    { col: 5, x: 1336 },
    { col: 6, x: 1652 },
    { col: 7, x: 1968 },
    { col: 8, x: 2286 },
    { col: 9, x: 2604 },
    { col: 10, x: 2916 },
    { col: 11, x: 3232 }
  ];

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

  console.log(`\n--- Blue Buttons on ${label} ---`);
  for (const r of rows) {
    for (const c of columns) {
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      const size = 15;
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const px = c.x + dx;
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

      if (avgR < 115 && avgG > 100 && avgB > 130) {
        console.log(`Row ${r.row}, Col ${c.col} (X=${c.x}, Y=${r.y}): rgb=(${avgR}, ${avgG}, ${avgB})`);
      }
    }
  }
}

async function run() {
  await findBlueButtons('public/networking-plan.webp', 'Networking Plan');
}

run().catch(console.error);
