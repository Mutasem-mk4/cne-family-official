import fs from 'fs';

// Grid calibration from generate-coords.cjs (designed for 1530 x 1082)
const PLAN_1530_SIZE = { width: 1530, height: 1082 };
const PLAN_3508_SIZE = { width: 3508, height: 2480 };

const scaleX = PLAN_3508_SIZE.width / PLAN_1530_SIZE.width;
const scaleY = PLAN_3508_SIZE.height / PLAN_1530_SIZE.height;

console.log(`Scale X: ${scaleX}, Scale Y: ${scaleY}`);

const getColX = (col) => 28 + (col - 1) * 137.5;
const getRowY = (row) => 75 + (row - 1) * 110;

const getSpecialCol10Y = (row) => {
  if (row === 1) return 75; // common top row
  return 208 + (row - 2) * 105;
};

const getSpecialCol11Y = (row) => {
  if (row === 1) return 75;
  if (row === 2) return 208;
  if (row === 3) return 312;
  if (row === 4) return 417;
  if (row === 5) return 522;
  if (row === 6) return 649;
  if (row === 7) return 789;
  return 789;
};

const commonMapping = [
  // COL 11 (Far Right)
  ["إنجليزي تطبيقي 1", 11, 1],
  ["إنجليزي تطبيقي 2", 11, 2],
  ["الكتابة التقنية والأخلاقيات المهنية", 11, 4],
  ["الاقتصاد الهندسي", 11, 5],
  ["تدريب ميداني", 11, 6],

  // COL 10 (Orange/National)
  ["اللغة العربية التطبيقية", 10, 2],
  ["التربية الوطنية", 10, 3],
  ["الريادة والابتكار", 10, 4],
  ["العلوم العسكرية", 10, 5],
  ["مشروع تخرج 1", 9, 6],
  ["مشروع تخرج 2", 9, 7],

  // COL 9 (Prob/AI/Linear)
  ["إحصاء واحتمالات للهندسة", 9, 1],
  ["الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'right'],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'left'],
  ["الجبر الخطي", 9, 3],
  ["إتصالات وتراسل بيانات", 9, 4],
  ["أساسيات شبكات الحاسوب", 9, 5],
  ["بروتوكولات الشبكات", 9, 6],
  ["أساسيات الأمن السيبراني", 8, 7],

  // COL 8 (Calc/Control)
  ["تفاضل وتكامل 1", 8, 1],
  ["تفاضل وتكامل 2", 8, 2],
  ["تقنيات عددية", 8, 3],
  ["أنظمة وإشارات", 8, 4],
  ["أنظمة التحكم", 8, 5],
  ["مختبر أنظمة التحكم", 8, 6],
  ["مختبر شبكات الحاسوب", 7, 7],

  // COL 7 (Phys/Circuits)
  ["الفيزياء العامة 1", 7, 1],
  ["الفيزياء العامة 2", 7, 2],
  ["المعادلات التفاضلية العادية", 7, 3],
  ["إلكترونيات 1", 7, 4],
  ["إلكترونيات رقمية", 7, 5],
  ["مختبر إلكترونيات 1", 7, 6],

  // COL 6 (Workshop/Circuits)
  ["المشغل الهندسي", 6, 1],
  ["مختبر الفيزياء العامة", 6, 2],
  ["دوائر كهربائية 1", 6, 3],
  ["دوائر كهربائية 2", 6, 4],
  ["الآلات كهربائية", 6, 5],
  ["مختبر دوائر كهربائية", 6, 6],

  // COL 5 (Drawing/OS)
  ["الرسم الهندسي", 5, 1],
  ["البرمجة بلغة الكينونة", 5, 2],
  ["تراكيب البيانات والخوارزميات", 5, 3, 'right'],
  ["مختبر تراكيب البيانات والخوارزميات", 5, 3, 'left'],
  ["أنظمة قواعد البيانات", 5, 4, 'right'],
  ["مختبر أنظمة قواعد البيانات", 5, 4, 'left'],
  ["نظم التشغيل", 5, 5],
  ["برمجة متقدمة", 5, 6],

  // COL 4 (CompSkills/Arch)
  ["مهارات الحاسوب", 4, 1],
  ["البرمجة للمهندسين", 4, 2],
  ["تصميم المنطق الرقمي", 4, 3, 'right'],
  ["مختبر تصميم المنطق الرقمي", 4, 3, 'left'],
  ["أنظمة المعالجات الدقيقة", 4, 4, 'right'],
  ["مختبر أنظمة المعالجات الدقيقة", 4, 4, 'left'],
  ["معمارية الحاسوب وتنظيمه", 4, 5, 'right'],
  ["مختبر معمارية الحاسوب وتنظيمه", 4, 5, 'left'],
  ["معمارية الحواسيب المتقدمة", 4, 6],

  // COL 3 (Chem/Embedded)
  ["الكيمياء العامة 1", 3, 1],
  ["مختبر الكيمياء العامة", 2, 2],
  ["الأنظمة المضمنة", 3, 5, 'right'],
  ["مختبر الأنظمة المضمنة", 3, 5, 'left'],
  ["مختبر أنظمة المعالجات المتوازية", 2, 6]
];

const computerMapping = [
  // ELECTIVES (Col 1)
  ["موضوعات خاصة", 1, 1],
  ["المنطق المشوش", 1, 2],
  ["تصميم رقمي متقدم", 1, 3],
  ["تقييم أداء الحاسوب", 1, 4],
  ["الحوسبة السحابية", 1, 5],
  ["إنترنت الأشياء", 1, 6],
  ["معالجة الصور الرقمية", 1, 7]
];

const networkMapping = [
  ["النمذجة والمحاكاة", 1, 1],
  ["الشبكات اللاسلكية", 1, 5],
  ["مختبر أمن الشبكات والإنترنت", 5, 7],
  ["تشفير وأمن أنظمة الشبكات", 6, 7],
  ["برمجة الشبكات", 8, 7]
];

function scaleMappingTo3508(mapping) {
  return mapping.map(([name, col, row, split]) => {
    let x1530, y1530, w1530, h1530;
    
    // Width and Height in 1530 scale
    if (split) {
      w1530 = 52;
      h1530 = 74;
      x1530 = split === 'left' ? getColX(col) : getColX(col) + 58;
    } else {
      w1530 = 110;
      h1530 = 74;
      x1530 = getColX(col);
    }
    
    // Y position in 1530 scale
    if (col === 10) {
      y1530 = getSpecialCol10Y(row);
    } else if (col === 11) {
      y1530 = getSpecialCol11Y(row);
    } else {
      y1530 = getRowY(row);
    }
    
    // Scale up to 3508 x 2480
    const x3508 = Math.round(x1530 * scaleX);
    const y3508 = Math.round(y1530 * scaleY);
    const w3508 = Math.round(w1530 * scaleX);
    const h3508 = Math.round(h1530 * scaleY);
    
    return [name, x3508, y3508, w3508, h3508];
  });
}

const scaledCommon = scaleMappingTo3508(commonMapping);
const scaledComputer = scaleMappingTo3508(computerMapping);
const scaledNetwork = scaleMappingTo3508(networkMapping);

console.log('\n--- Scaled Common Hotspots (Perfect 3508x2480) ---');
console.log(JSON.stringify(scaledCommon, null, 2));

console.log('\n--- Scaled Computer Hotspots (Perfect 3508x2480) ---');
console.log(JSON.stringify(scaledComputer, null, 2));

console.log('\n--- Scaled Network Hotspots (Perfect 3508x2480) ---');
console.log(JSON.stringify(scaledNetwork, null, 2));
