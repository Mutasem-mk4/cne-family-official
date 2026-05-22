// Quick debug: simulate the rendering and output one complete hotspot <a> tag
const fs = require('fs');
const path = require('path');

const subjectsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'data', 'subjects.json'), 'utf8'));
const subjects = subjectsData.subjects;
const subjectsByName = new Map(subjects.map(s => [s.name, s]));

const PLAN_IMAGE_SIZE = { width: 1530, height: 1082 };

const SUBJECT_NAME_MAP = {
  "مختبر الذكاء الاصطناعي وتعلم الآلة": "الذكاء الاصطناعي وتعلم الآلة",
  "الآلات كهربائية": "آلات كهربائية",
};

// Test with a few known subjects
const testHotspots = [
  ["تفاضل وتكامل 1", 1055, 115, 105, 70],
  ["الكيمياء العامة 1", 405, 115, 105, 70],
  ["موضوعات خاصة", 75, 115, 105, 70],
];

console.log("=== Testing individual hotspot rendering ===\n");

testHotspots.forEach(([name, x, y, width, height]) => {
  const mappedName = SUBJECT_NAME_MAP[name] || name;
  const subject = subjectsByName.get(mappedName);
  
  if (!subject) {
    console.log(`MISSING: "${name}" (mapped: "${mappedName}")`);
    return;
  }
  
  const left = (x / PLAN_IMAGE_SIZE.width) * 100;
  const top = (y / PLAN_IMAGE_SIZE.height) * 100;
  const boxWidth = (width / PLAN_IMAGE_SIZE.width) * 100;
  const boxHeight = (height / PLAN_IMAGE_SIZE.height) * 100;
  
  console.log(`Subject: ${name}`);
  console.log(`  Link: ${subject.link}`);
  console.log(`  Position: left=${left.toFixed(3)}% top=${top.toFixed(3)}%`);
  console.log(`  Size: width=${boxWidth.toFixed(3)}% height=${boxHeight.toFixed(3)}%`);
  console.log(`  HTML:`);
  console.log(`  <a href="${subject.link}" target="_blank" rel="noopener" class="plan-hotspot" style="left:${left.toFixed(3)}%;top:${top.toFixed(3)}%;width:${boxWidth.toFixed(3)}%;height:${boxHeight.toFixed(3)}%;" title="${subject.name}"></a>`);
  console.log();
});

// Count total hotspots that would render
const COMMON_PLAN_HOTSPOTS = [
  ["إنجليزي تطبيقي 1", 1430, 115, 105, 70],
  ["إنجليزي تطبيقي 2", 1430, 225, 105, 70],
  ["الكتابة التقنية والأخلاقيات المهنية", 1430, 335, 105, 70],
  ["الاقتصاد الهندسي", 1430, 445, 105, 70],
  ["تدريب ميداني", 1430, 555, 105, 70],
  ["مشروع تخرج 1", 1180, 645, 105, 70],
  ["مشروع تخرج 2", 1180, 755, 105, 70],
];

const COMPUTER_PLAN_HOTSPOTS = [
  ["موضوعات خاصة", 75, 115, 105, 70],
  ["المنطق المشوش", 75, 225, 105, 70],
  ["تصميم رقمي متقدم", 75, 335, 105, 70],
  ["تقييم أداء الحاسوب", 75, 445, 105, 70],
  ["الحوسبة السحابية", 75, 555, 105, 70],
  ["إنترنت الأشياء", 75, 645, 105, 70],
  ["معالجة الصور الرقمية", 75, 755, 105, 70],
];

const allComputerHotspots = [...COMMON_PLAN_HOTSPOTS, ...COMPUTER_PLAN_HOTSPOTS];
let rendered = 0;
let filtered = 0;

allComputerHotspots.forEach(([name]) => {
  const mappedName = SUBJECT_NAME_MAP[name] || name;
  const subject = subjectsByName.get(mappedName);
  if (subject && subject.link && subject.link !== "#") {
    rendered++;
  } else {
    filtered++;
    console.log(`FILTERED OUT: "${name}" -> subject=${subject ? 'found' : 'NOT FOUND'}, link=${subject?.link || 'N/A'}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total hotspots for computer: ${allComputerHotspots.length}`);
console.log(`Would render: ${rendered}`);
console.log(`Filtered out: ${filtered}`);
