// Precise button detector for computer-plan.webp
const sharp = require('sharp');

async function detect() {
  const image = sharp('public/computer-plan.webp');
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;

  // Let's find connected components of non-black/non-background pixels that represent buttons
  // Colors we care about:
  // - Red (Electives / topics)
  // - Green (General / Chemistry / Physics)
  // - Blue (Core engineering / CS)
  // - Orange (Language / University)
  
  // To keep it super simple and robust, let's divide the image into a grid of pixels (e.g. step of 5 pixels)
  // and identify all points that belong to a button. Then we can group them!
  const points = [];
  const step = 4;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let type = null;
      if (r > 130 && g < 60 && b < 60) type = 'red';
      else if (r < 100 && g > 110 && b < 100) type = 'green';
      else if (r < 100 && g > 100 && b > 130) type = 'blue';
      else if (r > 160 && g > 90 && b < 60) type = 'orange';

      if (type) {
        points.push({ x, y, type });
      }
    }
  }

  // Group points into buttons using a simple clustering algorithm (distance threshold)
  const clusters = [];
  const distThreshold = 60; // Max distance between points in the same button

  for (const pt of points) {
    let foundCluster = null;
    for (const c of clusters) {
      if (c.type === pt.type) {
        // Check distance to any point in the cluster, or cluster bounding box
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

  // Merge overlapping clusters of same type
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const c1 = clusters[i];
        const c2 = clusters[j];
        if (c1.type === c2.type) {
          // Check overlap
          if (c1.minX - distThreshold <= c2.maxX && c1.maxX + distThreshold >= c2.minX &&
              c1.minY - distThreshold <= c2.maxY && c1.maxY + distThreshold >= c2.minY) {
            // Merge c2 into c1
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

  console.log(`Detected ${clusters.length} buttons!`);
  
  // Format and output them in 1530 x 1082 coordinates
  const scaleX = 1530 / width;
  const scaleY = 1082 / height;

  const formatted = clusters.map((c, i) => {
    const w = c.maxX - c.minX;
    const h = c.maxY - c.minY;
    
    // Skip tiny noise clusters
    if (w < 40 || h < 25) return null;

    const x1530 = Math.round(c.minX * scaleX);
    const y1530 = Math.round(c.minY * scaleY);
    const w1530 = Math.round(w * scaleX);
    const h1530 = Math.round(h * scaleY);

    return {
      id: i + 1,
      type: c.type,
      x: x1530,
      y: y1530,
      width: w1530,
      height: h1530,
      orig: { minX: c.minX, minY: c.minY, w, h }
    };
  }).filter(Boolean);

  // Sort buttons by X, then by Y
  formatted.sort((a, b) => a.x - b.x || a.y - b.y);

  console.log('\nDetected Hotspots (in 1530x1082 scale):');
  formatted.forEach(btn => {
    console.log(`{ type: '${btn.type}', x: ${btn.x}, y: ${btn.y}, w: ${btn.width}, h: ${btn.height} },`);
  });
}

detect().catch(console.error);
