// Grid calibration and matching script to generate perfect coordinates
const fs = require('fs');
const path = require('path');

// We have the exact detected hotspot boundaries from detect-hotspots.cjs:
const detected = [
  { type: 'red', x: 28, y: 68, w: 108, h: 73 },
  { type: 'red', x: 28, y: 176, w: 110, h: 73 },
  { type: 'red', x: 28, y: 281, w: 110, h: 73 },
  { type: 'red', x: 28, y: 386, w: 110, h: 73 },
  { type: 'red', x: 28, y: 490, w: 110, h: 91 },
  { type: 'red', x: 28, y: 616, w: 108, h: 91 },
  { type: 'red', x: 28, y: 742, w: 110, h: 91 },
  { type: 'green', x: 167, y: 79, w: 112, h: 75 },
  { type: 'green', x: 169, y: 192, w: 108, h: 70 },
  { type: 'blue', x: 169, y: 295, w: 652, h: 75 },
  { type: 'blue', x: 169, y: 403, w: 1059, h: 75 },
  { type: 'blue', x: 169, y: 510, w: 923, h: 75 },
  { type: 'blue', x: 169, y: 616, w: 1195, h: 246 },
  { type: 'orange', x: 305, y: 79, w: 110, h: 73 },
  { type: 'blue', x: 305, y: 188, w: 246, h: 75 },
  { type: 'green', x: 441, y: 79, w: 515, h: 75 },
  { type: 'green', x: 576, y: 188, w: 380, h: 75 },
  { type: 'green', x: 846, y: 297, w: 112, h: 73 },
  { type: 'orange', x: 864, y: 901, w: 386, h: 162 },
  { type: 'blue', x: 864, y: 969, w: 213, h: 26 },
  { type: 'green', x: 864, y: 1003, w: 342, h: 26 },
  { type: 'red', x: 865, y: 934, w: 276, h: 40 },
  { type: 'blue', x: 982, y: 79, w: 110, h: 75 },
  { type: 'blue', x: 982, y: 188, w: 246, h: 75 },
  { type: 'blue', x: 982, y: 297, w: 246, h: 73 },
  { type: 'blue', x: 1162, y: 955, w: 44, h: 44 },
  { type: 'orange', x: 1254, y: 208, w: 110, h: 73 },
  { type: 'orange', x: 1254, y: 312, w: 110, h: 73 },
  { type: 'orange', x: 1254, y: 417, w: 110, h: 73 },
  { type: 'orange', x: 1254, y: 522, w: 110, h: 89 },
  { type: 'orange', x: 1392, y: 208, w: 110, h: 206 },
  { type: 'green', x: 1392, y: 417, w: 110, h: 73 },
  { type: 'green', x: 1392, y: 522, w: 110, h: 94 },
  { type: 'blue', x: 1392, y: 649, w: 110, h: 94 },
  { type: 'orange', x: 1392, y: 789, w: 108, h: 73 }
];

// Let's define the actual columns and rows in the grid
// Column width: 110px, spacing: ~137.5px
// Row height: 74px, spacing: ~110px

const getColX = (col) => 28 + (col - 1) * 137.5;
const getRowY = (row) => 75 + (row - 1) * 110;

// Split column positions:
// Left split: getColX(col)
// Right split: getColX(col) + 58
// Split width: 52

// Special Y coords for Col 10 and 11 (due to "حاسوب" title):
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

// Map subjects by grid coordinates:
// Subject, Column (1-11), Row (1-7), isSplit (null, 'left', 'right')
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
  ["مشروع تخرج 1", 9, 6], // Column 9, Row 6
  ["مشروع تخرج 2", 9, 7], // Column 9, Row 7

  // COL 9 (Prob/AI/Linear)
  ["إحصاء واحتمالات للهندسة", 9, 1],
  ["الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'right'],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'left'],
  ["الجبر الخطي", 9, 3],
  ["إتصالات وتراسل بيانات", 9, 4],
  ["أساسيات شبكات الحاسوب", 9, 5],
  ["بروتوكولات الشبكات", 9, 6],
  ["أساسيات الأمن السيبراني", 8, 7], // Column 8, Row 7

  // COL 8 (Calc/Control)
  ["تفاضل وتكامل 1", 8, 1],
  ["تفاضل وتكامل 2", 8, 2],
  ["تقنيات عددية", 8, 3],
  ["أنظمة وإشارات", 8, 4],
  ["أنظمة التحكم", 8, 5],
  ["مختبر أنظمة التحكم", 8, 6],
  ["مختبر شبكات الحاسوب", 7, 7], // Column 7, Row 7

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
  ["مختبر الكيمياء العامة", 2, 2], // Column 2 Row 2 (Labs)
  ["الأنظمة المضمنة", 3, 5, 'right'],
  ["مختبر الأنظمة المضمنة", 3, 5, 'left'],
  ["مختبر أنظمة المعالجات المتوازية", 2, 6] // Column 2 Row 6
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
  ["مختبر أمن الشبكات والإنترنت", 5, 7], // Column 5, Row 7
  ["تشفير وأمن أنظمة الشبكات", 6, 7], // Column 6, Row 7
  ["برمجة الشبكات", 8, 7] // Column 8, Row 7
];

function generateHotspotCode(mapping) {
  return mapping.map(([name, col, row, split]) => {
    let x, y, w, h;
    
    // Width and Height
    if (split) {
      w = 52;
      h = 74;
      x = split === 'left' ? getColX(col) : getColX(col) + 58;
    } else {
      w = 110;
      h = 74;
      x = getColX(col);
    }
    
    // Y position
    if (col === 10) {
      y = getSpecialCol10Y(row);
    } else if (col === 11) {
      y = getSpecialCol11Y(row);
    } else {
      y = getRowY(row);
    }
    
    // Round for cleaner output
    x = Math.round(x);
    y = Math.round(y);
    
    return `  ["${name}", ${x}, ${y}, ${w}, ${h}],`;
  }).join('\n');
}

console.log('=== COMMON_PLAN_HOTSPOTS ===');
console.log(generateHotspotCode(commonMapping));

console.log('\n=== COMPUTER_PLAN_HOTSPOTS ===');
console.log(generateHotspotCode(computerMapping));

console.log('\n=== NETWORK_PLAN_HOTSPOTS ===');
console.log(generateHotspotCode(networkMapping));
