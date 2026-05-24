const sharp = require('sharp');
const fs = require('fs');

function classifyPixel(r, g, b) {
  // Red: r > 150, g < 100, b < 100
  if (r > 150 && g < 100 && b < 100) return 1;
  // Green: r < 120, g > 130, b < 120
  if (r < 120 && g > 130 && b < 120) return 2;
  // Blue: r < 120, g > 80, b > 130
  if (r < 120 && g > 80 && b > 130) return 3;
  // Orange: r > 180, g > 90, b < 100
  if (r > 180 && g > 90 && b < 100) return 4;
  return 0;
}

async function findRectanglesFor(imagePath, jsonOutputPath) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const width = metadata.width;
  const height = metadata.height;
  const channels = info.channels;

  const classified = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      classified[y * width + x] = classifyPixel(r, g, b);
    }
  }

  const components = [];
  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const idx = y * width + x;
      if (classified[idx] > 0 && !visited[idx]) {
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

  // Sort: Right-to-Left, then Top-to-Bottom
  components.sort((a, b) => b.x - a.x || a.y - b.y);

  fs.writeFileSync(jsonOutputPath, JSON.stringify(components, null, 2));
  console.log(`Saved ${components.length} rectangles to ${jsonOutputPath}`);
  return components;
}

async function run() {
  await findRectanglesFor('public/computer-plan.webp', 'scratch/computer_rects.json');
  await findRectanglesFor('public/networking-plan.webp', 'scratch/networking_rects.json');
}

run().catch(console.error);
