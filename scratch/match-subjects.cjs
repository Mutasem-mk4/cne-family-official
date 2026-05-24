const fs = require('fs');

const cols = [64, 388, 700, 1012, 1320, 1632, 1940, 2252, 2564, 2876, 3192];
// col index 1-based: cols[col-1] is the expected x-coordinate

// We can define the mapping of subjects from generate-coords.cjs
// Subject name, Column (1-11), Row (1-7), split (null, 'left', 'right')
const commonMapping = [
  // COL 11 (Far Right)
  ["إنجليزي تطبيقي 1", 11, 1],
  ["إنجليزي تطبيقي 2", 11, 2],
  ["الكتابة التقنية والأخلاقيات المهنية", 11, 4],
  ["الاقتصاد الهندسي", 11, 5],
  ["تدريب ميداني", 11, 6],
  ["الإسلام والحياة", 11, 7], // wait, Islam and Life is at Col 11 Row 7? Let's check main.js: ["الإسلام والحياة", 3217, 1928, 252, 170] -> yes!

  // COL 10 (Orange/National)
  ["اللغة العربية التطبيقية", 10, 2],
  ["التربية الوطنية", 10, 3],
  ["الريادة والابتكار", 10, 4],
  ["العلوم العسكرية", 10, 5],

  // COL 9 (Prob/Linear/Projects)
  ["إحصاء واحتمالات للهندسة", 9, 1],
  ["الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'right'],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 9, 2, 'left'],
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

const computerMapping = [
  // COL 9 Y=1180 (Computer Networks 1)
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

const networkMapping = [
  // COL 9 (Computer Networks 1 & Lab split in Network Plan)
  ["أساسيات شبكات الحاسوب", 9, 5, 'right'],
  ["مختبر شبكات الحاسوب", 9, 5, 'left'],

  // COL 8 (Protocols / Network Programming split)
  ["بروتوكولات الشبكات", 9, 6], // wait, in networking plan, where are these?
  // Let's look at the mapping from generate-coords.cjs and main.js:
  // "النمذجة والمحاكاة", 1, 1
  // "الشبكات اللاسلكية", 1, 5
  // "مختبر شبكات الحاسوب", 2286, 1438 (Wait! x=2286, y=1438, this is Col 8, Row 6!)
  // "تشفير وأمن أنظمة الشبكات", 1968, 1680 (Col 7, Row 7!)
  // "مختبر أمن الشبكات والإنترنت", 1652, 1680 (Col 6, Row 7!)
  // "مختبر بروتوكولات الشبكة", 1652, 1928 (Col 6, Row 7 split / bottom?)
  // "برمجة الشبكات", 2604, 1928 (Col 9, Row 7?)
  // Let's write a flexible matching system that matches the closest detected rectangles to the subjects based on approximate x, y!
];

// Let's match computer plan subjects first
function matchRectangles(rects, mapping) {
  const matched = [];
  const unmatchedRects = [...rects];

  for (const [name, col, row, split] of mapping) {
    // Find expected X: cols[col-1]
    const expX = cols[col - 1];
    
    // Find rectangles in this column
    const candidates = unmatchedRects.filter(r => {
      // Column X range: cols[col-1] - 40 to cols[col-1] + 120 (for split or slight offset)
      const xDiff = Math.abs(r.x - expX);
      return xDiff < 80;
    });

    if (candidates.length === 0) {
      console.log(`No candidates found for: ${name} (col=${col}, row=${row})`);
      continue;
    }

    // Sort candidates by Y to match the rows (since row=1 is top, row=7 is bottom)
    candidates.sort((a, b) => a.y - b.y);

    // Filter by Row Y
    // Approximate row Y: row=1 -> 180, row=2 -> 432, row=3 -> 680, row=4 -> 924, row=5 -> 1168, row=6 -> 1412, row=7 -> 1660
    // Let's find the candidate closest to the expected row Y
    const expY = 180 + (row - 1) * 248; // linear approximation
    
    // If it's a split, check if we want left or right candidate
    let best = null;
    if (split) {
      // Split left has smaller x, split right has larger x
      const splits = candidates.filter(c => Math.abs(c.y - expY) < 150);
      splits.sort((a, b) => a.x - b.x); // left to right
      if (split === 'left' && splits.length > 0) {
        best = splits[0];
      } else if (split === 'right' && splits.length > 1) {
        best = splits[1];
      } else if (splits.length > 0) {
        best = splits[0]; // fallback
      }
    } else {
      let minDist = Infinity;
      for (const c of candidates) {
        const dist = Math.abs(c.y - expY);
        if (dist < minDist) {
          minDist = dist;
          best = c;
        }
      }
    }

    if (best) {
      matched.push([name, best.x, best.y, best.width, best.height]);
      // Remove from unmatched
      const idx = unmatchedRects.indexOf(best);
      if (idx > -1) unmatchedRects.splice(idx, 1);
    } else {
      console.log(`Failed to match: ${name} (col=${col}, row=${row}, split=${split})`);
    }
  }

  return { matched, unmatchedRects };
}

async function main() {
  const compRects = JSON.parse(fs.readFileSync('scratch/computer_rects.json', 'utf8')).filter(r => r.y < 2000);
  
  const allCompMapping = [...commonMapping, ...computerMapping];
  const { matched, unmatchedRects } = matchRectangles(compRects, allCompMapping);

  console.log(`\nSuccessfully matched ${matched.length} of ${allCompMapping.length} computer plan subjects!`);
  console.log(`Unmatched rectangles left: ${unmatchedRects.length}`);

  // Let's print the generated COMMON_PLAN_HOTSPOTS and COMPUTER_PLAN_HOTSPOTS
  const commonMatched = matched.filter(([name]) => commonMapping.some(m => m[0] === name));
  const computerMatched = matched.filter(([name]) => computerMapping.some(m => m[0] === name));

  console.log('\n=== Generated COMMON_PLAN_HOTSPOTS ===');
  console.log(commonMatched.map(([name, x, y, w, h]) => `  ["${name}", ${x}, ${y}, ${w}, ${h}],`).join('\n'));

  console.log('\n=== Generated COMPUTER_PLAN_HOTSPOTS ===');
  console.log(computerMatched.map(([name, x, y, w, h]) => `  ["${name}", ${x}, ${y}, ${w}, ${h}],`).join('\n'));
}

main().catch(console.error);
