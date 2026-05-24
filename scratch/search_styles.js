import fs from 'fs';
const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('plan-hotspot') || line.includes('plan-viewport') || line.includes('plan-image-map')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
