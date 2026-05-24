const fs = require('fs');

const perfect = JSON.parse(fs.readFileSync('scratch/perfect_hotspots.json', 'utf8'));
const compRects = JSON.parse(fs.readFileSync('scratch/computer_rects.json', 'utf8')).filter(r => r.y < 2000);

const mappedRects = new Set();
for (const list of [perfect.COMMON_PLAN_HOTSPOTS, perfect.COMPUTER_PLAN_HOTSPOTS]) {
  for (const [name, x, y, w, h] of list) {
    mappedRects.add(`${x},${y}`);
  }
}

console.log("Unmapped Rectangles in computer-plan.webp:");
for (const r of compRects) {
  // Check if we have a mapped rect that matches this rect's coordinate within some tolerance
  let matched = false;
  for (const key of mappedRects) {
    const [mx, my] = key.split(',').map(Number);
    if (Math.abs(r.x - mx) < 10 && Math.abs(r.y - my) < 10) {
      matched = true;
      break;
    }
    // Also check splits
    if (Math.abs(r.x - mx) < 150 && Math.abs(r.y - my) < 10) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    console.log(`  - type=${r.type}, x=${r.x}, y=${r.y}, w=${r.width}, h=${r.height}, pixels=${r.pixelCount}`);
  }
}
