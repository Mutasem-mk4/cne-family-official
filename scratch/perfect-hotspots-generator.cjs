const fs = require('fs');

const cols = [64, 388, 700, 1012, 1320, 1632, 1940, 2252, 2564, 2876, 3192];

// Maps col number (1-11) to coordinate
function getColX(col) {
  return cols[col - 1];
}

// Common subjects (across both plans)
// Format: [name, col, row, splitType]
const commonMapping = [
  // COL 11 (Far Right)
  ["إنجليزي تطبيقي 1", 11, 1],
  ["إنجليزي تطبيقي 2", 11, 2],
  ["الكتابة التقنية والأخلاقيات المهنية", 11, 4],
  ["الاقتصاد الهندسي", 11, 5],
  ["تدريب ميداني", 11, 6],
  ["الإسلام والحياة", 11, 7],

  // COL 10 (Orange/National)
  ["اللغة العربية التطبيقية", 10, 2],
  ["التربية الوطنية", 10, 3],
  ["الريادة والابتكار", 10, 4],
  ["العلوم العسكرية", 10, 5],

  // COL 9 (Prob/Linear/Projects)
  ["إحصاء واحتمالات للهندسة", 9, 1],
  ["الجبر الخطي", 9, 3],
  ["إتصالات وتراسل بيانات", 9, 4],
  ["مشروع تخرج 1", 9, 6],
  ["مشروع تخرج 2", 9, 7],

  // COL 8 (Calc)
  ["تفاضل وتكامل 1", 8, 1],
  ["تفاضل وتكامل 2", 8, 2],
  ["تقنيات عددية", 8, 3],
  ["أنظمة وإشارات", 8, 4],

  // COL 7 (Phys/Circuits)
  ["الفيزياء العامة 1", 7, 1],
  ["الفيزياء العامة 2", 7, 2],
  ["المعادلات التفاضلية العادية", 7, 3],
  ["إلكترونيات 1", 7, 4],
  ["مختبر إلكترونيات 1", 7, 6],

  // COL 6 (Workshop/Circuits)
  ["المشغل الهندسي", 6, 1],
  ["مختبر الفيزياء العامة", 6, 2],
  ["دوائر كهربائية 1", 6, 3],
  ["دوائر كهربائية 2", 6, 4],
  ["مختبر دوائر كهربائية", 6, 6],

  // COL 5 (Drawing/Database)
  ["الرسم الهندسي", 5, 1],
  ["البرمجة بلغة الكينونة", 5, 2],
  ["تراكيب البيانات والخوارزميات", 5, 3, 'right'],
  ["مختبر تراكيب البيانات والخوارزميات", 5, 3, 'left'],
  ["أنظمة قواعد البيانات", 5, 4, 'right'],
  ["مختبر أنظمة قواعد البيانات", 5, 4, 'left'],

  // COL 4 (CompSkills/Arch)
  ["مهارات الحاسوب", 4, 1],
  ["البرمجة للمهندسين", 4, 2],
  ["تصميم المنطق الرقمي", 4, 3, 'right'],
  ["مختبر تصميم المنطق الرقمي", 4, 3, 'left'],
  ["أنظمة المعالجات الدقيقة", 4, 4, 'right'],
  ["مختبر أنظمة المعالجات الدقيقة", 4, 4, 'left'],
  ["معمارية الحاسوب وتنظيمه", 4, 5, 'right'],
  ["مختبر معمارية الحاسوب وتنظيمه", 4, 5, 'left'],

  // COL 3 (Chemistry)
  ["الكيمياء العامة 1", 3, 1],

  // COL 2 (Chemistry Lab)
  ["مختبر الكيمياء العامة", 2, 2],
];

// Computer plan specific subjects
const computerMapping = [
  // COL 9 Y=432 (AI split)
  ["الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'right'],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'left'],

  // COL 9 Y=1168 (Computer Networks 1)
  ["أساسيات شبكات الحاسوب", 9, 5],

  // COL 8 (Control/Cyber)
  ["أنظمة التحكم", 8, 5],
  ["مختبر أنظمة التحكم", 8, 6],
  ["أساسيات الأمن السيبراني", 8, 7],

  // COL 7
  ["إلكترونيات رقمية", 7, 5],
  ["مختبر شبكات الحاسوب", 7, 7],

  // COL 6
  ["الآلات كهربائية", 6, 5],

  // COL 5
  ["نظم التشغيل", 5, 5],
  ["برمجة متقدمة", 5, 6],

  // COL 4
  ["معمارية الحواسيب المتقدمة", 4, 6],

  // COL 3
  ["الأنظمة المضمنة", 3, 5, 'right'],
  ["مختبر الأنظمة المضمنة", 3, 5, 'left'],

  // COL 2
  ["مختبر أنظمة المعالجات المتوازية", 2, 6],

  // ELECTIVES (Col 1)
  ["موضوعات خاصة", 1, 1],
  ["المنطق المشوش", 1, 2],
  ["تصميم رقمي متقدم", 1, 3],
  ["تقييم أداء الحاسوب", 1, 4],
  ["الحوسبة السحابية", 1, 5],
  ["إنترنت الأشياء", 1, 6],
  ["معالجة الصور الرقمية", 1, 7]
];

// Network plan specific subjects
const networkMapping = [
  // COL 9
  ["الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'right'],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'left'],
  ["أساسيات شبكات الحاسوب", 9, 5, 'right'],
  ["مختبر شبكات الحاسوب", 9, 5, 'left'],
  ["بروتوكولات الشبكات", 9, 6],
  ["برمجة الشبكات", 9, 7],

  // COL 8
  ["أنظمة التحكم", 8, 5],
  ["مختبر شبكات الحاسوب", 8, 6], // wait, in Network Plan, Row 6 is Computer Networks Lab
  ["أساسيات الأمن السيبراني", 8, 7],

  // COL 7
  ["الآلات كهربائية", 7, 5], // wait, in Network Plan, is Electrical Machines on Col 7 Row 5?
  // Let's verify by checking the y=1168 (Row 5) in Col 7
  ["تشفير وأمن أنظمة الشبكات", 7, 7],

  // COL 6
  ["إلكترونيات رقمية", 6, 5],
  ["مختبر أمن الشبكات والإنترنت", 6, 7],

  // COL 5
  ["نظم التشغيل", 5, 5],
  ["مختبر بروتوكولات الشبكة", 5, 7],

  // COL 4
  ["برمجة الشبكات", 4, 6], // wait, is this correct? Let's check matching: "مختبر التحقيقات الرقمية" is Col 4 Row 7!
  ["أنظمة التحقيقات والأدلة الرقمية", 4, 6],
  ["مختبر التحقيقات الرقمية", 4, 7],

  // COL 3
  ["الأنظمة المضمنة", 3, 5, 'right'],
  ["مختبر الأنظمة المضمنة", 3, 5, 'left'],

  // COL 2
  ["مختبر أنظمة المعالجات المتوازية", 2, 6],

  // ELECTIVES (Col 1)
  ["النمذجة والمحاكاة", 1, 2],
  ["الشبكات اللاسلكية", 1, 5],
];

// Helper to match a specific list of rects
function buildHotspots(rects, mapping) {
  const result = [];
  const unmatched = [...rects];

  for (const [name, col, row, split] of mapping) {
    const expX = getColX(col);
    const expY = 180 + (row - 1) * 248;

    // Filter Candidates by Column X
    const candidates = unmatched.filter(r => Math.abs(r.x - expX) < 80);

    // Find candidate closest to Row Y
    let best = null;
    let minDist = Infinity;
    for (const c of candidates) {
      const dist = Math.abs(c.y - expY);
      if (dist < minDist) {
        minDist = dist;
        best = c;
      }
    }

    if (best) {
      if (split) {
        const wSplit = Math.round(best.width / 2) - 7;
        const hSplit = best.height;
        if (split === 'left') {
          result.push([name, best.x, best.y, wSplit, hSplit]);
        } else {
          result.push([name, best.x + wSplit + 14, best.y, wSplit, hSplit]);
          // Only remove once both splits are processed, or just don't remove for splits
        }
      } else {
        result.push([name, best.x, best.y, best.width, best.height]);
        const idx = unmatched.indexOf(best);
        if (idx > -1) unmatched.splice(idx, 1);
      }
    }
  }

  return result;
}

async function run() {
  const compRects = JSON.parse(fs.readFileSync('scratch/computer_rects.json', 'utf8')).filter(r => r.y < 2000);
  const netRects = JSON.parse(fs.readFileSync('scratch/networking_rects.json', 'utf8')).filter(r => r.y < 2000);

  const commonHotspots = buildHotspots(compRects, commonMapping);
  const computerHotspots = buildHotspots(compRects, computerMapping);
  const networkHotspots = buildHotspots(netRects, networkMapping);

  console.log(`Common: ${commonHotspots.length} subjects`);
  console.log(`Computer: ${computerHotspots.length} subjects`);
  console.log(`Network: ${networkHotspots.length} subjects`);

  // Write them to a JSON or js file for easy inclusion
  const output = {
    COMMON_PLAN_HOTSPOTS: commonHotspots,
    COMPUTER_PLAN_HOTSPOTS: computerHotspots,
    NETWORK_PLAN_HOTSPOTS: networkHotspots
  };

  fs.writeFileSync('scratch/perfect_hotspots.json', JSON.stringify(output, null, 2));
  console.log("Saved all perfect hotspots to scratch/perfect_hotspots.json");
}

run().catch(console.error);
