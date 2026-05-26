const fs = require('fs');

const subjectsJson = JSON.parse(fs.readFileSync('public/data/subjects.json', 'utf8'));
const subjects = subjectsJson.subjects;
const subjectsByName = new Map(subjects.map(s => [s.name, s]));

const SUBJECT_NAME_MAP = {
  "البرمجة للمهندسين (C++)": "البرمجة للمهندسين",
  "مختبر الفيزياء العامة 1": "مختبر الفيزياء العامة",
  "التفاضل والتكامل 1": "تفاضل وتكامل 1",
  "التفاضل والتكامل 2": "تفاضل وتكامل 2",
  "الإحصاء والاحتمالات للمهندسين": "إحصاء واحتمالات للهندسة",
  "التقنيات العددية": "تقنيات عددية",
  "الدوائر الكهربائية 1": "دوائر كهربائية 1",
  "الدوائر الكهربائية 2": "دوائر كهربائية 2",
  "مختبر الدوائر الكهربائية": "مختبر دوائر كهربائية",
  "الإلكترونيات 1": "إلكترونيات 1",
  "مختبر الإلكترونيات": "مختبر إلكترونيات 1",
  "اتصالات وتراسل البيانات": "إتصالات وتراسل بيانات",
  "الأنظمة والإشارات": "أنظمة وإشارات",
  "شبكات الحاسوب 1": "أساسيات شبكات الحاسوب",
  "اللغة الإنجليزية 1": "إنجليزي تطبيقي 1",
  "اللغة الإنجليزية 2": "إنجليزي تطبيقي 2",
  "الكتابة التقنية والمهارات الحيايتة": "الكتابة التقنية والأخلاقيات المهنية",
  "بنية ومعمارية الحاسوب": "معمارية الحاسوب وتنظيمه",
  "مختبر بنية الحاسوب": "مختبر معمارية الحاسوب وتنظيمه",
  "بنية الحاسوب المتقدمة": "معمارية الحواسيب المتقدمة",
  "مختبر قواعد البيانات": "مختبر أنظمة قواعد البيانات",
  "أنظمة التشغيل": "نظم التشغيل",
  "البرمجة كينونية التوجه": "البرمجة بلغة الكينونة",
  "موضوعات خاصة في هندسة الحاسوب": "موضوعات خاصة",
  "الإلكترونيات الرقمية": "إلكترونيات رقمية",
  "أنظمة التحكم الآلي": "أنظمة التحكم",
  "الآلات الكهربائية": "آلات كهربائية",
  "الآلات كهربائية": "آلات كهربائية",
  "أنظمة معالجات متوازية": "مختبر أنظمة المعالجات المتوازية",
  "البرمجة المتقدمة": "برمجة متقدمة",
  "مختبر الذكاء الاصطناعي وتعلم الآلة": "الذكاء الاصطناعي وتعلم الآلة",
};

function resolveSubject(name) {
  const mappedName = SUBJECT_NAME_MAP[name] || name;
  return subjectsByName.get(mappedName);
}

// Parse hotspot arrays from main.js
const mainJs = fs.readFileSync('main.js', 'utf8');

function extractHotspots(arrayName) {
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

const compHotspots = extractHotspots('COMPUTER_PLAN_HOTSPOTS');
const netHotspots = extractHotspots('NETWORK_PLAN_HOTSPOTS');

console.log('=== COMPUTER PLAN AUDIT ===');
let compOk = 0, compFail = 0;
for (const hs of compHotspots) {
  const subject = resolveSubject(hs.name);
  if (!subject) {
    console.log(`❌ NOT FOUND: "${hs.name}"`);
    compFail++;
  } else if (!subject.link || subject.link === '#') {
    console.log(`⚠️  NO LINK: "${hs.name}" -> "${subject.name}" (link="${subject.link}")`);
    compFail++;
  } else {
    compOk++;
  }
}
console.log(`Result: ${compOk} OK, ${compFail} ISSUES\n`);

console.log('=== NETWORK PLAN AUDIT ===');
let netOk = 0, netFail = 0;
for (const hs of netHotspots) {
  const subject = resolveSubject(hs.name);
  if (!subject) {
    console.log(`❌ NOT FOUND: "${hs.name}"`);
    netFail++;
  } else if (!subject.link || subject.link === '#') {
    console.log(`⚠️  NO LINK: "${hs.name}" -> "${subject.name}" (link="${subject.link}")`);
    netFail++;
  } else {
    netOk++;
  }
}
console.log(`Result: ${netOk} OK, ${netFail} ISSUES\n`);

console.log('=== SUBJECTS WITH BAD LINKS IN subjects.json ===');
for (const s of subjects) {
  if (!s.link || s.link === '#' || s.link.includes('X_X_X')) {
    console.log(`  ⚠️  "${s.name}": "${s.link}"`);
  }
}
