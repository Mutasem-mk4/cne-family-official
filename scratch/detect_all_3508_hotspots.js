import sharp from 'sharp';
import fs from 'fs';

async function detectButtons(imagePath) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;

  const points = [];
  const step = 6; // step to speed up scanning

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let type = null;
      // Classify color based on pixel values
      if (r > 150 && g < 100 && b < 100) {
        type = 'red';
      } else if (g > 140 && r < 145 && b < 145) {
        type = 'green';
      } else if (b > 135 && r < 125 && g > 100) {
        type = 'blue';
      } else if (r > 160 && g > 110 && b < 110) {
        type = 'orange';
      }

      if (type) {
        points.push({ x, y, type });
      }
    }
  }

  // Cluster points
  const clusters = [];
  const distThreshold = 150; // pixels in 3508x2480 space

  for (const pt of points) {
    let foundCluster = null;
    for (const c of clusters) {
      if (c.type === pt.type) {
        if (pt.x >= c.minX - distThreshold && pt.x <= c.maxX + distThreshold &&
            pt.y >= c.minY - distThreshold && pt.y <= c.maxY + distThreshold) {
          foundCluster = c;
          break;
        }
      }
    }

    if (foundCluster) {
      foundCluster.points.push(pt);
      foundCluster.minX = Math.min(foundCluster.minX, pt.x);
      foundCluster.maxX = Math.max(foundCluster.maxX, pt.x);
      foundCluster.minY = Math.min(foundCluster.minY, pt.y);
      foundCluster.maxY = Math.max(foundCluster.maxY, pt.y);
    } else {
      clusters.push({
        type: pt.type,
        minX: pt.x,
        maxX: pt.x,
        minY: pt.y,
        maxY: pt.y,
        points: [pt]
      });
    }
  }

  // Merge overlapping clusters of the same type
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const c1 = clusters[i];
        const c2 = clusters[j];
        if (c1.type === c2.type) {
          if (c1.minX - distThreshold <= c2.maxX && c1.maxX + distThreshold >= c2.minX &&
              c1.minY - distThreshold <= c2.maxY && c1.maxY + distThreshold >= c2.minY) {
            c1.minX = Math.min(c1.minX, c2.minX);
            c1.maxX = Math.max(c1.maxX, c2.maxX);
            c1.minY = Math.min(c1.minY, c2.minY);
            c1.maxY = Math.max(c1.maxY, c2.maxY);
            c1.points.push(...c2.points);
            clusters.splice(j, 1);
            merged = true;
            break;
          }
        }
      }
      if (merged) break;
    }
  }

  // Format clusters
  const formatted = clusters.map((c, i) => {
    const w = c.maxX - c.minX;
    const h = c.maxY - c.minY;

    // Filter out tiny noise clusters
    if (w < 80 || h < 60) return null;

    return {
      id: i + 1,
      type: c.type,
      x: c.minX,
      y: c.minY,
      w,
      h
    };
  }).filter(Boolean);

  // Sort by X, then by Y
  formatted.sort((a, b) => a.x - b.x || a.y - b.y);
  return formatted;
}

async function run() {
  console.log('Detecting buttons on computer-plan.webp...');
  const compButtons = await detectButtons('public/computer-plan.webp');
  console.log(`Found ${compButtons.length} buttons on computer-plan.webp.`);

  console.log('Detecting buttons on networking-plan.webp...');
  const netButtons = await detectButtons('public/networking-plan.webp');
  console.log(`Found ${netButtons.length} buttons on networking-plan.webp.`);

  fs.writeFileSync('scratch/detected_buttons.json', JSON.stringify({
    computer: compButtons,
    networking: netButtons
  }, null, 2));

  console.log('Saved detected buttons to scratch/detected_buttons.json');
}

run().catch(console.error);
