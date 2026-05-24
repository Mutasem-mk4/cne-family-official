const sharp = require('sharp');
const fs = require('fs');

async function findRectangles() {
  const image = sharp('public/computer-plan.webp');
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;
  const channels = info.channels;

  // Let's classify each pixel:
  // Red: r > 150, g < 100, b < 100
  // Green: r < 120, g > 130, b < 120
  // Blue: r < 120, g > 80, b > 130
  // Orange: r > 180, g > 90, b < 100
  
  const classified = new Uint8Array(width * height);
  // 0: none, 1: red, 2: green, 3: blue, 4: orange

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let type = 0;
      if (r > 150 && g < 100 && b < 100) type = 1; // red
      else if (r < 120 && g > 130 && b < 120) type = 2; // green
      else if (r < 120 && g > 80 && b > 130) type = 3; // blue
      else if (r > 180 && g > 90 && b < 100) type = 4; // orange

      classified[y * width + x] = type;
    }
  }

  // Connected component labeling (simplified using a grid/distance scan)
  const components = [];
  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const idx = y * width + x;
      if (classified[idx] > 0 && !visited[idx]) {
        // Flood fill to find the extent
        const type = classified[idx];
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        visited[idx] = 1;

        let pixelCount = 0;

        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          pixelCount++;

          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);

          // Check 4 directions with a step of 4
          const steps = [[-4, 0], [4, 0], [0, -4], [0, 4]];
          for (const [dx, dy] of steps) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (classified[nidx] === type && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        const w = maxX - minX;
        const h = maxY - minY;

        // Filter out tiny components (noise) or huge ones
        if (w > 80 && h > 60 && w < 800 && h < 400) {
          components.push({
            type: ['none', 'red', 'green', 'blue', 'orange'][type],
            x: minX,
            y: minY,
            width: w,
            height: h,
            pixelCount
          });
        }
      }
    }
  }

  console.log(`Found ${components.length} colored rectangles!`);

  // Let's sort them from right-to-left (since the plan is RTL)
  // i.e., larger X first. Within same column, smaller Y first.
  components.sort((a, b) => b.x - a.x || a.y - b.y);

  components.forEach((c, idx) => {
    console.log(`Rectangle ${idx + 1}: type=${c.type}, x=${c.x}, y=${c.y}, w=${c.width}, h=${c.height} (pixels=${c.pixelCount})`);
  });

  fs.writeFileSync('scratch/computer_rects.json', JSON.stringify(components, null, 2));
  console.log("Saved rectangles to scratch/computer_rects.json");
}

findRectangles().catch(console.error);
