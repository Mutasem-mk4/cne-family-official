import { layout } from "./layout.js";
import { state } from "../state.js";
import { GRADE_POINTS } from "../config.js";

export function renderCalculator() {
  return layout(
    `
      <section class="calculator-layout reveal">
        <article class="calculator-intro">
          <span class="eyebrow">حاسبة المعدل</span>
          <h2>حاسبة معدل بسيطة وواضحة.</h2>
          <p>أضف المواد والساعات والدرجة ثم احسب المعدل مباشرة.</p>
          <div class="calculator-result-box">
            <span>المعدل الحالي</span>
            <strong id="gpa-value">0.00</strong>
            <p id="gpa-summary">أدخل المواد ثم اضغط احسب المعدل.</p>
          </div>
        </article>

        <article class="calculator-card">
          <div class="calculator-head">
            <h3>المواد</h3>
            <button type="button" id="add-grade-row" class="btn btn-secondary btn-small">إضافة مادة</button>
          </div>
          <div id="grade-rows" class="grade-rows"></div>
          <button type="button" id="calculate-gpa" class="btn btn-primary calculator-submit">احسب المعدل</button>
        </article>
      </section>
    `,
    {
      heroBanner: {
        label: "حاسبة المعدل",
        title: "أداة سريعة لحساب المعدل",
        copy: "واجهة بسيطة تركز على الحساب فقط.",
      },
    },
  );
}

export function initCalculator() {
  const host = document.getElementById("grade-rows");
  if (!host) return;

  if (!host.children.length) {
    for (let i = 0; i < 4; i += 1) addGradeRow();
  }

  document.getElementById("add-grade-row")?.addEventListener("click", addGradeRow);
  document.getElementById("calculate-gpa")?.addEventListener("click", calculateGpa);
}

export function calculateGpa() {
  const rows = [...document.querySelectorAll(".grade-row")];
  let totalHours = 0;
  let totalPoints = 0;

  rows.forEach((row) => {
    const hours = Number(row.querySelector(".grade-hours")?.value || 0);
    const points = Number(row.querySelector(".grade-letter")?.value || 0);
    if (hours > 0) {
      totalHours += hours;
      totalPoints += hours * points;
    }
  });

  const gpa = totalHours ? (totalPoints / totalHours).toFixed(2) : "0.00";
  document.getElementById("gpa-value").textContent = gpa;
  document.getElementById("gpa-summary").textContent = totalHours
    ? `تم الحساب على ${totalHours} ساعة معتمدة.`
    : "أدخل ساعات فعلية لحساب المعدل.";
}

