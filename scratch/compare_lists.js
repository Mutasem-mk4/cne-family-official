import fs from 'fs';

const mainJs = fs.readFileSync('main.js', 'utf8');
const perfectHotspots = JSON.parse(fs.readFileSync('scratch/perfect_hotspots.json', 'utf8'));

// Extract subject names from main.js arrays using regex
function extractNames(arrayName) {
  const startIdx = mainJs.indexOf(`const ${arrayName} = [`);
  if (startIdx === -1) return [];
  const endIdx = mainJs.indexOf('];', startIdx);
  const content = mainJs.substring(startIdx, endIdx + 2);
  const names = [];
  const regex = /\[\s*"([^"]+)"|\[\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    names.push(match[1] || match[2]);
  }
  return names;
}

const mainCommon = extractNames('COMMON_PLAN_HOTSPOTS');
const mainComp = extractNames('COMPUTER_PLAN_HOTSPOTS');
const mainNet = extractNames('NETWORK_PLAN_HOTSPOTS');

const perfCommon = perfectHotspots.COMMON_PLAN_HOTSPOTS.map(x => x[0]);
const perfComp = perfectHotspots.COMPUTER_PLAN_HOTSPOTS.map(x => x[0]);
const perfNet = perfectHotspots.NETWORK_PLAN_HOTSPOTS.map(x => x[0]);

console.log('--- COMMON ---');
console.log('Main:', mainCommon.length, 'Perfect:', perfCommon.length);
console.log('Missing from Perfect:', mainCommon.filter(n => !perfCommon.includes(n)));
console.log('Extra in Perfect:', perfCommon.filter(n => !mainCommon.includes(n)));

console.log('\n--- COMPUTER ---');
console.log('Main:', mainComp.length, 'Perfect:', perfComp.length);
console.log('Missing from Perfect:', mainComp.filter(n => !perfComp.includes(n)));
console.log('Extra in Perfect:', perfComp.filter(n => !mainComp.includes(n)));

console.log('\n--- NETWORK ---');
console.log('Main:', mainNet.length, 'Perfect:', perfNet.length);
console.log('Missing from Perfect:', mainNet.filter(n => !perfNet.includes(n)));
console.log('Extra in Perfect:', perfNet.filter(n => !mainNet.includes(n)));
