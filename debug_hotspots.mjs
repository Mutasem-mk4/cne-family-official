/**
 * DEBUG SCRIPT: Draws all detected rects on the plan image with numbers,
 * then shows which subjects are assigned to which rect index.
 * Run with: node debug_hotspots.mjs
 */
import fs from 'fs';
import sharp from 'sharp';

const IMAGE_WIDTH = 3508;
const IMAGE_HEIGHT = 2480;

async function getRects(imagePath) {
  const img = sharp(imagePath);
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();
  const channels = 3;

  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = raw[idx], g = raw[idx + 1], b = raw[idx + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min > 35 && max > 50) mask[y * width + x] = 1;
    }
  }

  const visited = new Uint8Array(width * height);
  const rects = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1 && visited[y * width + x] === 0) {
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        visited[y * width + x] = 1;
        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
          for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (mask[nIdx] === 1 && visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
        const rectW = maxX - minX + 1, rectH = maxY - minY + 1;
        if (rectW >= 150 && rectW <= 350 && rectH >= 100 && rectH <= 250) {
          rects.push({ x: minX, y: minY, width: rectW, height: rectH });
        }
      }
    }
  }
  rects.sort((a, b) => a.y - b.y || a.x - b.x);
  return rects;
}

// Get average color of a rect center
async function getColor(raw, width, rect) {
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  const px = Math.round(rect.x + rect.width * 0.3);
  const py = Math.round(rect.y + rect.height * 0.3);
  const ex = Math.round(rect.x + rect.width * 0.7);
  const ey = Math.round(rect.y + rect.height * 0.7);
  for (let y = py; y < ey; y++) {
    for (let x = px; x < ex; x++) {
      const idx = (y * width + x) * 3;
      sumR += raw[idx]; sumG += raw[idx+1]; sumB += raw[idx+2];
      count++;
    }
  }
  return { r: Math.round(sumR/count), g: Math.round(sumG/count), b: Math.round(sumB/count) };
}

function colorName(r, g, b) {
  if (r > 130 && g < 80 && b < 80) return 'RED';
  if (r < 135 && g > 120 && b < 135) return 'GREEN';
  if (r < 120 && g > 100 && b > 130) return 'BLUE';
  if (r > 150 && g > 100 && b < 100) return 'ORANGE';
  if (r > 150 && g > 140 && b < 80) return 'YELLOW';
  return `rgb(${r},${g},${b})`;
}

async function analyze(imagePath, planName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PLAN: ${planName}`);
  console.log(`${'='.repeat(60)}`);

  const img = sharp(imagePath);
  const { width } = await img.metadata();
  const raw = await img.raw().toBuffer();

  const rects = await getRects(imagePath);
  
  console.log(`\nTotal detected boxes: ${rects.length}`);
  console.log(`\nAll detected boxes (sorted by Y then X):`);
  console.log(`${'Index'.padEnd(6)} ${'X'.padEnd(6)} ${'Y'.padEnd(6)} ${'W'.padEnd(6)} ${'H'.padEnd(6)} Color`);
  console.log('-'.repeat(50));
  
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    const col = await getColor(raw, width, r);
    const color = colorName(col.r, col.g, col.b);
    console.log(`${String(i+1).padEnd(6)} ${String(r.x).padEnd(6)} ${String(r.y).padEnd(6)} ${String(r.width).padEnd(6)} ${String(r.height).padEnd(6)} ${color}`);
  }
  
  return rects;
}

// Now match with current hotspots from main.js and find issues
function extractHotspots(mainJs, arrayName) {
  const startIdx = mainJs.indexOf(`const ${arrayName} = [`);
  if (startIdx === -1) return [];
  const endIdx = mainJs.indexOf('];', startIdx);
  const content = mainJs.substring(startIdx, endIdx + 2);
  const result = [];
  const regex = /\[\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    result.push({ name: match[1], x: +match[2], y: +match[3], w: +match[4], h: +match[5] });
  }
  return result;
}

function findContainingRect(rects, x, y, w, h) {
  // Find rect that overlaps with this hotspot center
  const cx = x + w/2, cy = y + h/2;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height) {
      return i;
    }
  }
  return -1;
}

async function crossCheck(rects, hotspots, planName) {
  console.log(`\n--- CROSS-CHECK: ${planName} ---`);
  
  // For each rect, find which hotspot(s) cover it
  const rectToHotspots = new Array(rects.length).fill(null).map(() => []);
  const hotspotToRect = new Array(hotspots.length).fill(-1);
  
  for (let hi = 0; hi < hotspots.length; hi++) {
    const hs = hotspots[hi];
    const ri = findContainingRect(rects, hs.x, hs.y, hs.w, hs.h);
    hotspotToRect[hi] = ri;
    if (ri >= 0) rectToHotspots[ri].push(hi);
  }
  
  // Report boxes with NO hotspot
  const emptyRects = [];
  for (let i = 0; i < rects.length; i++) {
    if (rectToHotspots[i].length === 0) emptyRects.push(i);
  }
  
  // Report boxes with 2+ hotspots (double)
  const doubleRects = [];
  for (let i = 0; i < rects.length; i++) {
    if (rectToHotspots[i].length >= 2) doubleRects.push(i);
  }
  
  // Report hotspots not in any rect
  const floatingHotspots = hotspots.filter((_, hi) => hotspotToRect[hi] === -1);
  
  if (emptyRects.length > 0) {
    console.log(`\n⚠️  BOXES WITH NO HOTSPOT (${emptyRects.length}):`);
    for (const ri of emptyRects) {
      const r = rects[ri];
      console.log(`  Box #${ri+1}: x=${r.x}, y=${r.y}, w=${r.width}, h=${r.height}`);
    }
  }
  
  if (doubleRects.length > 0) {
    console.log(`\n❌ BOXES WITH 2+ HOTSPOTS (${doubleRects.length}):`);
    for (const ri of doubleRects) {
      const r = rects[ri];
      const names = rectToHotspots[ri].map(hi => hotspots[hi].name);
      console.log(`  Box #${ri+1} (x=${r.x}, y=${r.y}): ${names.join(' + ')}`);
    }
  }
  
  if (floatingHotspots.length > 0) {
    console.log(`\n❌ HOTSPOTS NOT OVER ANY BOX (${floatingHotspots.length}):`);
    for (const hs of floatingHotspots) {
      console.log(`  "${hs.name}" at (${hs.x}, ${hs.y})`);
    }
  }
  
  if (emptyRects.length === 0 && doubleRects.length === 0 && floatingHotspots.length === 0) {
    console.log('✅ Perfect 1:1 mapping!');
  }
  
  return { emptyRects, doubleRects, floatingHotspots, rectToHotspots, hotspotToRect };
}

async function run() {
  const mainJs = fs.readFileSync('main.js', 'utf8');
  
  const compRects = await analyze('./public/computer-plan.webp', 'Computer Plan');
  const netRects = await analyze('./public/networking-plan.webp', 'Network Plan');
  
  const compHotspots = extractHotspots(mainJs, 'COMPUTER_PLAN_HOTSPOTS');
  const netHotspots = extractHotspots(mainJs, 'NETWORK_PLAN_HOTSPOTS');
  
  await crossCheck(compRects, compHotspots, 'Computer Plan');
  await crossCheck(netRects, netHotspots, 'Network Plan');
}

run().catch(console.error);
