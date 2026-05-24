import sharp from 'sharp';

async function mapGrid() {
  const image = sharp('public/computer-plan.webp');
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

  console.log('--- Visual Grid Color Map (3508 x 2480) ---');
  console.log('Columns: 1 to 11 (Left to Right)');
  console.log('Rows: 1 to 8 (Top to Bottom)\n');

  for (const r of rows) {
    let rowStr = `Row ${r.row} (Y=${String(r.y).padStart(4)}): `;
    for (const c of columns) {
      // Check color around (x, y) with a 20x20 sample
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

      let symbol = '.';
      if (avgR > 130 && avgG < 80 && avgB < 80) symbol = 'R'; // Red
      else if (avgR < 135 && avgG > 135 && avgB < 135) symbol = 'G'; // Green
      else if (avgR < 115 && avgG > 110 && avgB > 140) symbol = 'B'; // Blue
      else if (avgR > 160 && avgG > 110 && avgB < 100) symbol = 'O'; // Orange
      else if (avgR < 50 && avgG < 50 && avgB < 50) symbol = ' '; // Empty/Dark

      rowStr += `[Col${c.col}:${symbol}] `;
    }
    console.log(rowStr);
  }
}

mapGrid().catch(console.error);
