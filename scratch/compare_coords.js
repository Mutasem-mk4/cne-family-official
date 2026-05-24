import fs from 'fs';

const mainJs = fs.readFileSync('main.js', 'utf8');
const perfectHotspots = JSON.parse(fs.readFileSync('scratch/perfect_hotspots.json', 'utf8'));

function parseCoords(arrayName) {
  const startIdx = mainJs.indexOf(`const ${arrayName} = [`);
  if (startIdx === -1) return {};
  const endIdx = mainJs.indexOf('];', startIdx);
  const content = mainJs.substring(startIdx, endIdx + 2);
  const coords = {};
  const regex = /\[\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    coords[match[1]] = [Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5])];
  }
  return coords;
}

const mainCommon = parseCoords('COMMON_PLAN_HOTSPOTS');
const mainComp = parseCoords('COMPUTER_PLAN_HOTSPOTS');
const mainNet = parseCoords('NETWORK_PLAN_HOTSPOTS');

function compare(mainMap, perfList, label) {
  console.log(`\n=== Comparing Coordinates for ${label} ===`);
  perfList.forEach(([name, px, py, pw, ph]) => {
    const mainCoord = mainMap[name];
    if (!mainCoord) {
      console.log(`NEW: ${name} -> Perfect: [${px}, ${py}, ${pw}, ${ph}]`);
    } else {
      const [mx, my, mw, mh] = mainCoord;
      const dx = px - mx;
      const dy = py - my;
      const dw = pw - mw;
      const dh = ph - mh;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10 || Math.abs(dw) > 10 || Math.abs(dh) > 10) {
        console.log(`⚠️ SIGNIFICANT SHIFT: ${name}`);
        console.log(`   Main:    [${mx}, ${my}, ${mw}, ${mh}]`);
        console.log(`   Perfect: [${px}, ${py}, ${pw}, ${ph}] (diff: dx=${dx}, dy=${dy}, dw=${dw}, dh=${dh})`);
      } else {
        console.log(`✅ OK: ${name} (diff: dx=${dx}, dy=${dy})`);
      }
    }
  });

  // Check if any in main is not in perfect
  const perfNames = perfList.map(x => x[0]);
  Object.keys(mainMap).forEach(name => {
    if (!perfNames.includes(name)) {
      console.log(`❌ REMOVED from perfect: ${name} -> Main had: [${mainMap[name].join(', ')}]`);
    }
  });
}

compare(mainCommon, perfectHotspots.COMMON_PLAN_HOTSPOTS, 'Common');
compare(mainComp, perfectHotspots.COMPUTER_PLAN_HOTSPOTS, 'Computer');
compare(mainNet, perfectHotspots.NETWORK_PLAN_HOTSPOTS, 'Network');
