const fs = require('fs');

const netRects = JSON.parse(fs.readFileSync('scratch/networking_rects.json', 'utf8')).filter(r => r.y < 2000);

const mainNetHotspots = [
  ["النمذجة والمحاكاة", 60, 404, 260, 178],
  ["الشبكات اللاسلكية", 60, 1180, 260, 178],
  ["مختبر شبكات الحاسوب", 2286, 1438, 260, 168],
  ["أنظمة التحقيقات والأدلة الرقمية", 1338, 1680, 260, 178],
  ["مختبر التحقيقات الرقمية", 1338, 1928, 260, 168],
  ["مختبر أمن الشبكات والإنترنت", 1652, 1680, 260, 168],
  ["مختبر بروتوكولات الشبكة", 1652, 1928, 260, 168],
  ["تشفير وأمن أنظمة الشبكات", 1968, 1680, 260, 178],
  ["برمجة الشبكات", 2604, 1928, 260, 178],
  ["أساسيات الأمن السيبراني", 2286, 1680, 260, 178],
  ["بروتوكولات الشبكات", 2604, 1680, 260, 178],
];

console.log("=== Matching network plan specific subjects ===");
mainNetHotspots.forEach(([name, x, y, w, h]) => {
  // Find closest rectangle
  let best = null;
  let minDist = Infinity;

  netRects.forEach(r => {
    const dist = Math.sqrt(Math.pow(r.x - x, 2) + Math.pow(r.y - y, 2));
    if (dist < minDist) {
      minDist = dist;
      best = r;
    }
  });

  if (best && minDist < 200) {
    console.log(`Matched "${name}":`);
    console.log(`  Expected: x=${x}, y=${y}, w=${w}, h=${h}`);
    console.log(`  Detected: x=${best.x}, y=${best.y}, w=${best.width}, h=${best.height} (dist=${minDist.toFixed(1)})`);
  } else {
    console.log(`Failed to match "${name}" (closest dist=${minDist.toFixed(1)})`);
  }
});
