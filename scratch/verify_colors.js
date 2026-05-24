import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Let's get the hotspots from main.js or hardcode them from main.js
const COMMON_PLAN_HOTSPOTS = [
  ["الكيمياء العامة 1", 388, 180, 260, 178],
  ["مختبر الكيمياء العامة", 390, 438, 260, 168],
  ["مهارات الحاسوب", 708, 180, 260, 178],
  ["البرمجة للمهندسين (C++)", 708, 438, 260, 178],
  ["المشغل الهندسي", 1336, 178, 260, 178],
  ["مختبر الفيزياء العامة 1", 1336, 436, 260, 170],
  ["الفيزياء العامة 1", 1652, 180, 260, 178],
  ["الفيزياء العامة 2", 1652, 438, 260, 178],
  ["التفاضل والتكامل 1", 1968, 180, 260, 178],
  ["التفاضل والتكامل 2", 1968, 438, 260, 178],
  ["الإحصاء والاحتمالات للمهندسين", 2286, 180, 260, 178],
  ["الذكاء الاصطناعي وتعلم الآلة", 2286, 438, 260, 178],
  ["الجبر الخطي", 2604, 692, 260, 178],
  ["المعادلات التفاضلية العادية", 1968, 692, 260, 178],
  ["التقنيات العددية", 2286, 692, 260, 178],
  ["الدوائر الكهربائية 1", 1652, 692, 260, 178],
  ["الدوائر الكهربائية 2", 1652, 940, 260, 178],
  ["مختبر الدوائر الكهربائية", 1652, 1438, 260, 168],
  ["الإلكترونيات 1", 1968, 940, 260, 178],
  ["مختبر الإلكترونيات", 1968, 1680, 260, 168],
  ["اتصالات وتراسل البيانات", 2604, 940, 260, 178],
  ["الأنظمة والإشارات", 2286, 940, 260, 178],
  ["أساسيات الأمن السيبراني", 2286, 1680, 260, 178],
  ["شبكات الحاسوب 1", 2604, 1438, 260, 178],
  ["بروتوكولات الشبكات", 2604, 1680, 260, 178],
  ["اللغة العربية التطبيقية", 2916, 480, 260, 178],
  ["اللغة الإنجليزية 1", 3232, 480, 260, 178],
  ["التربية الوطنية", 2916, 730, 260, 178],
  ["اللغة الإنجليزية 2", 3232, 730, 260, 178],
  ["الريادة والابتكار", 2916, 970, 260, 178],
  ["الكتابة التقنية والمهارات الحيايتة", 3232, 970, 260, 178],
  ["العلوم العسكرية", 2916, 1214, 260, 178],
  ["الاقتصاد الهندسي", 3232, 1214, 260, 178],
  ["تصميم المنطق الرقمي", 708, 690, 260, 178],
  ["مختبر تصميم المنطق الرقمي", 390, 690, 260, 168],
  ["أنظمة المعالجات الدقيقة", 708, 940, 260, 178],
  ["مختبر أنظمة المعالجات الدقيقة", 390, 940, 260, 168],
  ["بنية ومعمارية الحاسوب", 708, 1188, 260, 178],
  ["مختبر بنية الحاسوب", 390, 1188, 260, 168],
  ["بنية الحاسوب المتقدمة", 708, 1438, 260, 178],
  ["تراكيب البيانات والخوارزميات", 1024, 690, 260, 178],
  ["مختبر تراكيب البيانات والخوارزميات", 1340, 690, 260, 168],
  ["أنظمة قواعد البيانات", 1024, 940, 260, 178],
  ["مختبر قواعد البيانات", 1340, 940, 260, 168],
  ["أنظمة التشغيل", 1024, 1188, 260, 178],
  ["البرمجة كينونية التوجه", 1024, 1438, 260, 178],
  ["الإسلام والحياة", 3232, 1454, 260, 178],
  ["إنترنت الأشياء", 60, 1450, 260, 178]
];

async function checkColors() {
  const image = sharp('public/computer-plan.webp');
  const metadata = await image.metadata();
  console.log('Image size:', metadata.width, 'x', metadata.height);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  console.log('\n--- Analyzing Common Hotspots on computer-plan.webp ---');
  let coloredMatches = 0;
  let darkMatches = 0;

  for (const [name, x, y, w, h] of COMMON_PLAN_HOTSPOTS) {
    // Check if coordinates are within bounds
    if (x < 0 || y < 0 || x + w > metadata.width || y + h > metadata.height) {
      console.log(`❌ OUT OF BOUNDS: "${name}" at [${x}, ${y}, ${w}, ${h}]`);
      continue;
    }

    // Let's sample the pixels in the center area of this hotspot
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

    // Classify
    let colorType = 'unknown';
    if (avgR > 130 && avgG < 80 && avgB < 80) colorType = 'red (elective)';
    else if (avgR < 100 && avgG > 110 && avgB < 100) colorType = 'green (science)';
    else if (avgR < 100 && avgG > 100 && avgB > 130) colorType = 'blue (core)';
    else if (avgR > 150 && avgG > 90 && avgB < 60) colorType = 'orange (univ)';
    else if (avgR < 50 && avgG < 50 && avgB < 50) colorType = 'dark/background';

    console.log(`"${name.padEnd(35)}": rgb=(${String(avgR).padStart(3)}, ${String(avgG).padStart(3)}, ${String(avgB).padStart(3)}) => ${colorType}`);
    
    if (colorType !== 'dark/background' && colorType !== 'unknown') {
      coloredMatches++;
    } else if (colorType === 'dark/background') {
      darkMatches++;
    }
  }

  console.log(`\nResults: Colored Matches = ${coloredMatches}/${COMMON_PLAN_HOTSPOTS.length}, Dark Matches = ${darkMatches}/${COMMON_PLAN_HOTSPOTS.length}`);
}

checkColors().catch(console.error);
