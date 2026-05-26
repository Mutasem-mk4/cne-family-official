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
};

function resolveSubject(name) {
  const mappedName = SUBJECT_NAME_MAP[name] || name;
  return { subject: subjectsByName.get(mappedName), mappedName };
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

function audit(arrayName) {
  const hotspots = extractHotspots(arrayName);
  console.log(`\n=== ${arrayName} (${hotspots.length} hotspots) ===`);
  
  // Check for duplicate names in hotspot array
  const names = hotspots.map(h => h.name);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) console.log(`⚠️  DUPLICATE HOTSPOT NAMES: ${dupes.join(', ')}`);
  
  let ok = 0, missingLink = 0, notFound = 0;
  for (const hs of hotspots) {
    const { subject, mappedName } = resolveSubject(hs.name);
    if (!subject) {
      console.log(`❌ NOT IN subjects.json: "${hs.name}" (looking for "${mappedName}")`);
      notFound++;
    } else if (!subject.link || subject.link === '#') {
      console.log(`🔴 NO LINK (red hotspot): "${subject.name}"`);
      missingLink++;
    } else {
      ok++;
    }
  }
  console.log(`\nSummary: ✅ ${ok} with links  |  🔴 ${missingLink} red (no link)  |  ❌ ${notFound} not found`);
}

audit('COMPUTER_PLAN_HOTSPOTS');
audit('NETWORK_PLAN_HOTSPOTS');
