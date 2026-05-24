import sharp from 'sharp';

// Exact scaled grid coordinates for the Networking Plan
const NETWORK_PLAN_COORDS = [
  // COL 11 (Far Right)
  ["إنجليزي تطبيقي 1", 3217, 172, 252, 170],
  ["إنجليزي تطبيقي 2", 3217, 477, 252, 170],
  ["الكتابة التقنية والأخلاقيات المهنية", 3217, 956, 252, 170],
  ["الاقتصاد الهندسي", 3217, 1196, 252, 170],
  ["الإسلام والحياة", 3217, 1928, 252, 170], // Y=1928 Col 11 is Islam & Life!

  // COL 10 (Orange/National)
  ["اللغة العربية التطبيقية", 2902, 477, 252, 170],
  ["التربية الوطنية", 2902, 717, 252, 170],
  ["الريادة والابتكار", 2902, 958, 252, 170],
  ["العلوم العسكرية", 2902, 1199, 252, 170],

  // COL 9 (Prob/AI/Linear)
  ["إحصاء واحتمالات للهندسة", 2586, 172, 252, 170],
  ["الذكاء الاصطناعي وتعلم الآلة", 2719, 424, 119, 170],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 2586, 424, 119, 170],
  ["الجبر الخطي", 2586, 676, 252, 170],
  ["إتصالات وتراسل بيانات", 2586, 928, 252, 170],
  ["مختبر شبكات الحاسوب", 2586, 1433, 252, 170], // Col 9 Row 6 is Lab of Networks!
  ["بروتوكولات الشبكات", 2586, 1685, 252, 170], // Col 9 Row 7 is Protocols!
  ["برمجة الشبكات", 2586, 1928, 252, 170], // Col 9 Row 8 is Network Programming!

  // COL 8 (Calc/Control)
  ["تفاضل وتكامل 1", 2271, 172, 252, 170],
  ["تفاضل وتكامل 2", 2271, 424, 252, 170],
  ["تقنيات عددية", 2271, 676, 252, 170],
  ["أنظمة وإشارات", 2271, 928, 252, 170],
  ["أنظمة التحكم", 2271, 1180, 252, 170],
  ["أساسيات الأمن السيبراني", 2271, 1685, 252, 170], // Col 8 Row 7 is Cybersecurity!
  ["مختبر بروتوكولات الشبكة", 2271, 1928, 252, 170], // Col 8 Row 8 is Lab of Protocols!

  // COL 7 (Phys/Circuits)
  ["الفيزياء العامة 1", 1956, 172, 252, 170],
  ["الفيزياء العامة 2", 1956, 424, 252, 170],
  ["المعادلات التفاضلية العادية", 1956, 676, 252, 170],
  ["إلكترونيات 1", 1956, 928, 252, 170],
  ["تشفير وأمن أنظمة الشبكات", 1956, 1685, 252, 170], // Col 7 Row 7 is Cryptography!

  // COL 6 (Workshop/Circuits)
  ["المشغل الهندسي", 1641, 172, 252, 170],
  ["مختبر الفيزياء العامة", 1641, 424, 252, 170],
  ["دوائر كهربائية 1", 1641, 676, 252, 170],
  ["دوائر كهربائية 2", 1641, 928, 252, 170],
  ["نظم التشغيل", 1641, 1180, 252, 170], // Col 6 Row 5 is OS!

  // COL 5 (Drawing/OS)
  ["الرسم الهندسي", 1325, 172, 252, 170],
  ["البرمجة بلغة الكينونة", 1325, 424, 252, 170],
  ["تراكيب البيانات والخوارزميات", 1458, 676, 119, 170],
  ["مختبر تراكيب البيانات والخوارزميات", 1325, 676, 119, 170],
  ["أنظمة قواعد البيانات", 1458, 928, 119, 170],
  ["مختبر أنظمة قواعد البيانات", 1325, 928, 119, 170],
  ["أنظمة التحقيقات والأدلة الرقمية", 1325, 1685, 252, 170], // Col 5 Row 7 is Forensics!
  ["مختبر التحقيقات الرقمية", 1325, 1928, 252, 170], // Col 5 Row 8 is Lab of Forensics!

  // COL 4 (CompSkills/Arch)
  ["مهارات الحاسوب", 1010, 172, 252, 170],
  ["البرمجة للمهندسين", 1010, 424, 252, 170],
  ["تصميم المنطق الرقمي", 1143, 676, 119, 170],
  ["مختبر تصميم المنطق الرقمي", 1010, 676, 119, 170],
  ["أنظمة المعالجات الدقيقة", 1143, 928, 119, 170],
  ["مختبر أنظمة المعالجات الدقيقة", 1010, 928, 119, 170],
  ["معمارية الحاسوب وتنظيمه", 1143, 1180, 119, 170], // Col 4 Row 5 split right
  ["مختبر معمارية الحاسوب وتنظيمه", 1010, 1180, 119, 170], // Col 4 Row 5 split left

  // COL 3 (Chem/Embedded)
  ["الكيمياء العامة 1", 695, 172, 252, 170],
  ["مختبر الكيمياء العامة", 379, 424, 252, 170],

  // ELECTIVES (Col 1)
  ["النمذجة والمحاكاة", 64, 172, 252, 170], // Col 1 Row 1
  ["موضوعات خاصة في هندسة الشبكات", 64, 676, 252, 170], // Col 1 Row 3
  ["الشبكات اللاسلكية", 64, 1180, 252, 170] // Col 1 Row 5
];

async function verifyNetworking() {
  const image = sharp('public/networking-plan.webp');
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  console.log(`Analyzing proposed coordinates on networking-plan.webp:`);
  let successCount = 0;
  let failCount = 0;

  for (const [name, x, y, w, h] of NETWORK_PLAN_COORDS) {
    if (x < 0 || y < 0 || x + w > metadata.width || y + h > metadata.height) {
      console.log(`❌ OUT OF BOUNDS: "${name}" at [${x}, ${y}, ${w}, ${h}]`);
      failCount++;
      continue;
    }

    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    const paddingX = Math.round(w * 0.2);
    const paddingY = Math.round(h * 0.2);

    for (let py = y + paddingY; py < y + h - paddingY; py++) {
      for (let px = x + paddingX; px < x + w - paddingX; px++) {
        const idx = (py * metadata.width + px) * info.channels;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        count++;
      }
    }

    const avgR = Math.round(sumR / count);
    const avgG = Math.round(sumG / count);
    const avgB = Math.round(sumB / count);

    let colorType = 'unknown';
    if (avgR > 130 && avgG < 80 && avgB < 80) colorType = 'red (elective)';
    else if (avgR < 135 && avgG > 135 && avgB < 135) colorType = 'green (science)';
    else if (avgR < 115 && avgG > 100 && avgB > 130) colorType = 'blue (core)';
    else if (avgR > 150 && avgG > 100 && avgB < 100) colorType = 'orange (univ)';
    else if (avgR < 60 && avgG < 60 && avgB < 60) colorType = 'dark/background';

    console.log(`"${name.padEnd(35)}": rgb=(${String(avgR).padStart(3)}, ${String(avgG).padStart(3)}, ${String(avgB).padStart(3)}) => ${colorType}`);

    if (colorType === 'dark/background') {
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\nNetworking Verification Results: Success (Colored) = ${successCount}, Failed (Dark) = ${failCount}`);
}

verifyNetworking().catch(console.error);
