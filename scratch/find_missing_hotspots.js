import fs from 'fs';
import path from 'path';

// Read main.js content to parse COMMON_PLAN_HOTSPOTS, COMPUTER_PLAN_HOTSPOTS, NETWORK_PLAN_HOTSPOTS
const mainJs = fs.readFileSync('C:/Users/User/cne-family-official/main.js', 'utf8');

// Simple regex or substring extraction
function extractHotspots(arrayName) {
  const startIdx = mainJs.indexOf(`const ${arrayName} = [`);
  if (startIdx === -1) return [];
  const endIdx = mainJs.indexOf('];', startIdx);
  const content = mainJs.substring(startIdx, endIdx + 2);
  
  // Evaluate the array safely or parse using regex
  const regex = /\["([^"]+)",\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/g;
  const list = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    list.push({
      name: match[1],
      x: parseInt(match[2]),
      y: parseInt(match[3]),
      w: parseInt(match[4]),
      h: parseInt(match[5])
    });
  }
  return list;
}

const commonHotspots = extractHotspots('COMMON_PLAN_HOTSPOTS');
const computerHotspots = extractHotspots('COMPUTER_PLAN_HOTSPOTS');
const networkHotspots = extractHotspots('NETWORK_PLAN_HOTSPOTS');

console.log(`Loaded from main.js:`);
console.log(`- Common: ${commonHotspots.length} hotspots`);
console.log(`- Computer: ${computerHotspots.length} hotspots`);
console.log(`- Network: ${networkHotspots.length} hotspots`);

// Load subjects.json
const subjectsData = JSON.parse(fs.readFileSync('C:/Users/User/cne-family-official/public/data/subjects.json', 'utf8'));
const subjects = subjectsData.subjects;

// Load SUBJECT_NAME_MAP from main.js
const mapStart = mainJs.indexOf('const SUBJECT_NAME_MAP = {');
const mapEnd = mainJs.indexOf('};', mapStart);
const mapContent = mainJs.substring(mapStart, mapEnd + 2);

const SUBJECT_NAME_MAP = {};
const mapRegex = /"([^"]+)":\s*"([^"]+)"/g;
let m;
while ((m = mapRegex.exec(mapContent)) !== null) {
  SUBJECT_NAME_MAP[m[1]] = m[2];
}

console.log(`Loaded SUBJECT_NAME_MAP with ${Object.keys(SUBJECT_NAME_MAP).length} entries.`);

// For each hotspot, check if it maps to a valid subject in subjects.json
const checkHotspots = (list, label) => {
  console.log(`\n--- Verifying ${label} ---`);
  let missingCount = 0;
  list.forEach(h => {
    const mapped = SUBJECT_NAME_MAP[h.name] || h.name;
    const found = subjects.find(s => s.name === mapped);
    if (!found) {
      console.log(`⚠️ MISSING SUBJECT: "${h.name}" (mapped: "${mapped}") in subjects.json`);
      missingCount++;
    } else if (!found.link || found.link === '#') {
      console.log(`ℹ️ NO LINK: "${h.name}" (mapped: "${mapped}") has no active link ("${found.link}")`);
    }
  });
  console.log(`Verified ${list.length} hotspots. Missing: ${missingCount}`);
};

checkHotspots(commonHotspots, 'Common');
checkHotspots(computerHotspots, 'Computer');
checkHotspots(networkHotspots, 'Network');

// Now let's see which subjects in subjects.json are NOT present in any hotspot!
console.log(`\n--- Subjects in subjects.json NOT mapped in hotspots ---`);
const allHotspotNames = new Set([
  ...commonHotspots.map(h => SUBJECT_NAME_MAP[h.name] || h.name),
  ...computerHotspots.map(h => SUBJECT_NAME_MAP[h.name] || h.name),
  ...networkHotspots.map(h => SUBJECT_NAME_MAP[h.name] || h.name)
]);

let unmappedCount = 0;
subjects.forEach(s => {
  if (!allHotspotNames.has(s.name)) {
    console.log(`❌ UNMAPPED SUBJECT: "${s.name}" (${s.major}, Year ${s.year})`);
    unmappedCount++;
  }
});
console.log(`Total unmapped subjects: ${unmappedCount}`);
