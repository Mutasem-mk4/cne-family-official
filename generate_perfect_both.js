import fs from 'fs';
import sharp from 'sharp';

const cols = [64, 388, 700, 1012, 1320, 1632, 1940, 2252, 2564, 2876, 3192];

function getColX(col) {
  return cols[col - 1];
}

// Sidebar mapping shared by both plans
const sidebarMapping = [
  ["اللغة العربية التطبيقية", 10, 2],
  ["التربية الوطنية", 10, 3],
  ["الريادة والابتكار", 10, 4],
  ["العلوم العسكرية", 10, 5],
  ["مشروع تخرج 1", 10, 6],
  ["مشروع تخرج 2", 10, 7],

  ["إنجليزي تطبيقي 1", 11, 2],
  ["إنجليزي تطبيقي 2", 11, 3],
  ["الكتابة التقنية والأخلاقيات المهنية", 11, 4],
  ["الاقتصاد الهندسي", 11, 5],
  ["تدريب ميداني", 11, 6],
  ["الإسلام والحياة", 11, 7]
];

// Computer plan specific subjects and columns
const computerMapping = [
  ...sidebarMapping,

  // Row 1
  ["الكيمياء العامة 1", 2, 1],
  ["مهارات الحاسوب", 3, 1],
  ["الرسم الهندسي", 4, 1],
  ["المشغل الهندسي", 5, 1],
  ["الفيزياء العامة 1", 6, 1],
  ["تفاضل وتكامل 1", 7, 1],
  ["إحصاء واحتمالات للهندسة", 8, 1],

  // Row 2
  ["مختبر الكيمياء العامة", 2, 2],
  ["البرمجة للمهندسين", 3, 2],
  ["البرمجة بلغة الكينونة", 4, 2],
  ["مختبر الفيزياء العامة", 5, 2],
  ["الفيزياء العامة 2", 6, 2],
  ["تفاضل وتكامل 2", 7, 2],
  ["الذكاء الاصطناعي وتعلم الآلة", 8, 2],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 9, 2],

  // Row 3
  ["مختبر تصميم المنطق الرقمي", 2, 3],
  ["تصميم المنطق الرقمي", 3, 3],
  ["تراكيب البيانات والخوارزميات", 4, 3],
  ["مختبر تراكيب البيانات والخوارزميات", 5, 3],
  ["دوائر كهربائية 1", 6, 3],
  ["المعادلات التفاضلية العادية", 7, 3],
  ["التقنيات العددية", 8, 3],
  ["الجبر الخطي", 9, 3],

  // Row 4
  ["مختبر أنظمة المعالجات الدقيقة", 2, 4],
  ["أنظمة المعالجات الدقيقة", 3, 4],
  ["أنظمة قواعد البيانات", 4, 4],
  ["مختبر أنظمة قواعد البيانات", 5, 4],
  ["دوائر كهربائية 2", 6, 4],
  ["إلكترونيات 1", 7, 4],
  ["أنظمة وإشارات", 8, 4],
  ["إتصالات وتراسل بيانات", 9, 4],

  // Row 5
  ["مختبر معمارية الحاسوب وتنظيمه", 2, 5],
  ["معمارية الحاسوب وتنظيمه", 3, 5],
  ["نظم التشغيل", 4, 5],
  ["الأنظمة المضمنة", 5, 5],
  ["الآلات كهربائية", 6, 5],
  ["إلكترونيات رقمية", 7, 5],
  ["أنظمة التحكم", 8, 5],

  // Row 6
  ["أنظمة المعالجات المتوازية", 2, 6],
  ["معمارية الحواسيب المتقدمة", 3, 6],
  ["برمجة متقدمة", 4, 6],
  ["مختبر الأنظمة المضمنة", 5, 6],
  ["مختبر دوائر كهربائية", 6, 6],
  ["مختبر إلكترونيات 1", 7, 6],
  ["مختبر أنظمة التحكم", 8, 6],
  ["أساسيات شبكات الحاسوب", 9, 6],

  // Row 7
  ["مختبر أنظمة المعالجات المتوازية", 2, 7],
  ["مختبر شبكات الحاسوب", 7, 7],
  ["أساسيات الأمن السيبراني", 8, 7],
  ["بروتوكولات الشبكات", 9, 7],

  // Electives (Col 1)
  ["موضوعات خاصة", 1, 1],
  ["المنطق المشوش", 1, 2],
  ["تصميم رقمي متقدم", 1, 3],
  ["تقييم أداء الحاسوب", 1, 4],
  ["الحوسبة السحابية", 1, 5],
  ["إنترنت الأشياء", 1, 6],
  ["معالجة الصور الرقمية", 1, 7]
];

// Network plan specific subjects and columns
const networkMapping = [
  ...sidebarMapping,

  // Row 1
  ["الكيمياء العامة 1", 2, 1],
  ["مهارات الحاسوب", 3, 1],
  ["الرسم الهندسي", 4, 1],
  ["المشغل الهندسي", 5, 1],
  ["الفيزياء العامة 1", 6, 1],
  ["التفاضل والتكامل 1", 7, 1],
  ["إحصاء واحتمالات للهندسة", 8, 1],

  // Row 2
  ["مختبر الكيمياء العامة", 2, 2],
  ["البرمجة للمهندسين", 3, 2],
  ["البرمجة بلغة الكينونة", 4, 2],
  ["مختبر الفيزياء العامة", 5, 2],
  ["الفيزياء العامة 2", 6, 2],
  ["التفاضل والتكامل 2", 7, 2],
  ["الذكاء الاصطناعي وتعلم الآلة", 8, 2],

  // Row 3
  ["مختبر تصميم المنطق الرقمي", 2, 3],
  ["تصميم المنطق الرقمي", 3, 3],
  ["تراكيب البيانات والخوارزميات", 4, 3],
  ["مختبر تراكيب البيانات والخوارزميات", 5, 3],
  ["دوائر كهربائية 1", 6, 3],
  ["المعادلات التفاضلية العادية", 7, 3],
  ["تقنيات عددية", 8, 3],
  ["الجبر الخطي", 9, 3],

  // Row 4
  ["مختبر أنظمة المعالجات الدقيقة", 2, 4],
  ["أنظمة المعالجات الدقيقة", 3, 4],
  ["أنظمة قواعد البيانات", 4, 4],
  ["مختبر أنظمة قواعد البيانات", 5, 4],
  ["دوائر كهربائية 2", 6, 4],
  ["إلكترونيات 1", 7, 4],
  ["أنظمة وإشارات", 8, 4],
  ["إتصالات وتراسل بيانات", 9, 4],

  // Row 5
  ["مختبر معمارية الحاسوب وتنظيمه", 2, 5],
  ["معمارية الحاسوب وتنظيمه", 3, 5],
  ["نظم التشغيل", 4, 5],
  ["مختبر دوائر كهربائية", 5, 5],
  ["إلكترونيات رقمية", 6, 5],
  ["الآلات كهربائية", 7, 5],
  ["أنظمة التحكم", 8, 5],

  // Row 6
  ["مختبر إلكترونيات 1", 7, 6],
  ["مختبر شبكات الحاسوب", 8, 6],
  ["أساسيات شبكات الحاسوب", 9, 6],

  // Row 7
  ["أنظمة التحقيقات والأدلة الرقمية", 5, 7],
  ["مختبر أمن الشبكات والإنترنت", 6, 7],
  ["تشفير وأمن أنظمة الشبكات", 7, 7],
  ["أساسيات الأمن السيبراني", 8, 7],
  ["بروتوكولات الشبكات", 9, 7],

  // Row 8
  ["مختبر التحقيقات الرقمية", 5, 8],
  ["مختبر بروتوكولات الشبكة", 6, 8],
  ["الحوسبة السحابية", 7, 8],
  ["الشبكات اللاسلكية", 8, 8],
  ["برمجة الشبكات", 9, 8],

  // Electives (Col 1)
  ["موضوعات خاصة في هندسة الشبكات", 1, 1],
  ["النمذجة والمحاكاة", 1, 2],
  ["مقدمة إلى لينكس", 1, 3],
  ["القرصنة الأخلاقية", 1, 4],
  ["أمن الشبكات اللاسلكية", 1, 5],
  ["شبكات الاستشعار اللاسلكية", 1, 6],
  ["إنترنت الأشياء", 1, 7]
];

async function getRects(imagePath) {
  const img = sharp(imagePath);
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();
  const channels = 3;

  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      if (chroma > 35 && max > 50) {
        mask[y * width + x] = 1;
      }
    }
  }

  const visited = new Uint8Array(width * height);
  const rects = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1 && visited[y * width + x] === 0) {
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        visited[y * width + x] = 1;

        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (mask[nIdx] === 1 && visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
        const rectW = maxX - minX + 1;
        const rectH = maxY - minY + 1;
        if (rectW >= 150 && rectW <= 350 && rectH >= 100 && rectH <= 250) {
          rects.push({ x: minX, y: minY, width: rectW, height: rectH });
        }
      }
    }
  }
  rects.sort((a, b) => a.y - b.y || a.x - b.x);
  return rects;
}

function buildHotspots(rects, mapping) {
  const result = [];
  const unmatched = [...rects];

  for (const [name, col, row, split] of mapping) {
    const expX = getColX(col);
    const expY = 180 + (row - 1) * 248;

    // Filter Candidates by Column X
    const candidates = unmatched.filter(r => Math.abs(r.x - expX) < 110);

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
        }
      } else {
        result.push([name, best.x, best.y, best.width, best.height]);
        const idx = unmatched.indexOf(best);
        if (idx > -1) unmatched.splice(idx, 1);
      }
    } else {
      console.log(`Warning: Failed to match subject "${name}" in col ${col}, row ${row}`);
    }
  }

  return result;
}

async function verifyPlan(planPath, hotspots, planName) {
  const image = sharp(planPath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  let successCount = 0;
  let failCount = 0;

  for (const [name, x, y, w, h] of hotspots) {
    if (x < 0 || y < 0 || x + w > metadata.width || y + h > metadata.height) {
      console.log(`❌ OUT OF BOUNDS: "${name}"`);
      failCount++;
      continue;
    }

    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    const paddingX = Math.round(w * 0.15);
    const paddingY = Math.round(h * 0.15);

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

    // Classification
    let colorType = 'unknown';
    if (avgR > 130 && avgG < 80 && avgB < 80) colorType = 'red';
    else if (avgR < 135 && avgG > 120 && avgB < 135) colorType = 'green';
    else if (avgR < 120 && avgG > 100 && avgB > 130) colorType = 'blue';
    else if (avgR > 150 && avgG > 100 && avgB < 100) colorType = 'orange';
    else if (avgR < 60 && avgG < 60 && avgB < 60) colorType = 'dark/background';

    if (colorType === 'dark/background') {
      console.log(`❌ FAILED: "${name}" at rgb=(${avgR}, ${avgG}, ${avgB}) => ${colorType}`);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`Verification for ${planName}: Success = ${successCount}, Failed = ${failCount}`);
  return failCount === 0;
}

async function run() {
  console.log("Analyzing Computer Plan boxes...");
  const compRects = await getRects('./public/computer-plan.webp');
  const compHotspots = buildHotspots(compRects, computerMapping);

  console.log("Analyzing Network Plan boxes...");
  const netRects = await getRects('./public/networking-plan.webp');
  const netHotspots = buildHotspots(netRects, networkMapping);

  console.log("\nVerifying computer plan hotspots...");
  const compOk = await verifyPlan('./public/computer-plan.webp', compHotspots, 'Computer Plan');

  console.log("\nVerifying network plan hotspots...");
  const netOk = await verifyPlan('./public/networking-plan.webp', netHotspots, 'Networking Plan');

  if (compOk && netOk) {
    console.log("\n🎉 Both plans verified successfully with 0 failures!");
    console.log("\nCOMPUTER PLAN HOTSPOTS ARRAY (length " + compHotspots.length + "):");
    console.log(JSON.stringify(compHotspots));

    console.log("\nNETWORK PLAN HOTSPOTS ARRAY (length " + netHotspots.length + "):");
    console.log(JSON.stringify(netHotspots));
  } else {
    console.log("\n❌ Verification failed.");
  }
}

run().catch(console.error);
