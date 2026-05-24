const fs = require('fs');

const original = [
  ["النمذجة والمحاكاة", 60, 404],
  ["الشبكات اللاسلكية", 60, 1180],
  ["مختبر شبكات الحاسوب", 2286, 1438],
  ["أنظمة التحقيقات والأدلة الرقمية", 1338, 1680],
  ["مختبر التحقيقات الرقمية", 1338, 1928],
  ["مختبر أمن الشبكات والإنترنت", 1652, 1680],
  ["مختبر بروتوكولات الشبكة", 1652, 1928],
  ["تشفير وأمن أنظمة الشبكات", 1968, 1680],
  ["برمجة الشبكات", 2604, 1928],
  ["أساسيات الأمن السيبراني", 2286, 1680],
  ["بروتوكولات الشبكات", 2604, 1680],
];

const rects = JSON.parse(fs.readFileSync('scratch/networking_rects.json', 'utf8'));

console.log("Matching original network hotspots to detected rectangles:");
for (const [name, ox, oy] of original) {
  let best = null;
  let minDist = Infinity;
  for (const r of rects) {
    // Distance between center of original box (w~252, h~170) and detected rectangle
    const dx = Math.abs((ox + 126) - (r.x + r.width / 2));
    const dy = Math.abs((oy + 85) - (r.y + r.height / 2));
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      best = r;
    }
  }

  if (best && minDist < 200) {
    console.log(`- "${name}": original=[${ox}, ${oy}] -> detected=[${best.x}, ${best.y}, ${best.width}, ${best.height}] type=${best.type} dist=${minDist.toFixed(1)}`);
  } else {
    console.log(`- "${name}": original=[${ox}, ${oy}] -> NO MATCH! (minDist=${minDist.toFixed(1)})`);
  }
}
