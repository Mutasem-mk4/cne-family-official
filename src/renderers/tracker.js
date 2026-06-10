import { layout } from "./layout.js";
import { state } from "../state.js";
import { groupBy } from "../../utils.js";

export async function renderTracker() {
  const visibleCourses = state.curriculum.filter(
    (course) => course.major === "common" || course.major === state.major,
  );
  const totalHours = visibleCourses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const completed = new Set(getCompletedCourses());
  const doneHours = visibleCourses
    .filter((course) => completed.has(course.id))
    .reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const years = groupBy(visibleCourses, "year");
  const percent = Math.round((doneHours / totalHours) * 100);
  const remainingHours = Math.max(totalHours - doneHours, 0);
  const doneCourses = visibleCourses.filter((course) => completed.has(course.id)).length;
  const totalCourses = visibleCourses.length;
  const currentMajorLabel = state.major === "computer" ? "هندسة الحاسوب" : "هندسة الشبكات";

  return layout(
    `
      <section class="tracker-dashboard reveal">
        <section class="tracker-overview">
          <div class="tracker-overview-main">
            <span class="eyebrow">التقدم الأكاديمي</span>
            <h2>${percent}%</h2>
            <p>أنجزت ${doneHours} ساعة من أصل ${totalHours} ساعة في مسار ${currentMajorLabel}.</p>
            <div class="tracker-progress"><span style="width:${percent}%"></span></div>
          </div>
          <div class="tracker-overview-stats">
            <article class="tracker-stat-card">
              <strong>${doneHours}</strong>
              <span>ساعات منجزة</span>
            </article>
            <article class="tracker-stat-card">
              <strong>${remainingHours}</strong>
              <span>ساعات متبقية</span>
            </article>
            <article class="tracker-stat-card">
              <strong>${doneCourses}/${totalCourses}</strong>
              <span>مواد مكتملة</span>
            </article>
          </div>
        </section>

        <section class="tracker-toolbar">
          <div class="tracker-toolbar-copy">
            <h3>اختر التخصص</h3>
            <p>اختر المسار أولاً، ثم علّم المواد التي أنجزتها.</p>
          </div>
          <div class="major-switches">
            <button class="major-switch ${state.major === "computer" ? "is-current" : ""}" data-major-switch="computer">هندسة الحاسوب</button>
            <button class="major-switch ${state.major === "network" ? "is-current" : ""}" data-major-switch="network">هندسة الشبكات</button>
          </div>
        </section>

        <div class="tracker-years">
          ${Object.keys(years)
            .sort((a, b) => Number(a) - Number(b))
            .map((year) => {
              const courses = years[year];
              const completedInYear = courses.filter((course) => completed.has(course.id)).length;
              return `
                <section class="tracker-year-section">
                  <div class="tracker-year-head">
                    <div>
                      <span class="tracker-year-title">السنة ${year}</span>
                      <p>أنجزت ${completedInYear} من ${courses.length} مواد</p>
                    </div>
                    <strong>${courses.length} مادة</strong>
                  </div>
                  <div class="tracker-course-list">
                    ${courses.map((course) => renderTrackerCourse(course, completed)).join("")}
                  </div>
                </section>
              `;
            })
            .join("")}
        </div>
      </section>
    `,
    {
      heroBanner: {
        label: "متتبع الخطة",
        title: "اعرف ما أنجزته وما تبقى عليك",
        copy: "اختر التخصص ثم علّم المواد المنجزة لمتابعة تقدمك.",
      },
    },
  );
}

export function renderTrackerCourse(course, completed) {
  const prerequisiteLabels = getCoursePrerequisiteLabels(course);
  const subject = findSubjectForCourse(course);
  const subjectAction =
    subject && subject.link && subject.link !== "#"
      ? `<a href="${subject.link}" target="_blank" rel="noopener" class="btn btn-secondary btn-small tracker-course-link">افتح المادة</a>`
      : "";

  return `
    <article class="tracker-course ${completed.has(course.id) ? "is-done" : ""}">
      <label class="tracker-course-main">
        <input type="checkbox" data-course-toggle="${course.id}" ${completed.has(course.id) ? "checked" : ""} />
        <div class="tracker-course-copy">
          <strong>${course.name}</strong>
          <small>${course.credits} ساعة${prerequisiteLabels.length ? ` • سابق: ${prerequisiteLabels.join("، ")}` : ""}</small>
        </div>
      </label>
      ${subjectAction}
    </article>
  `;
}

export function getCompletedCourses() {
  try {
    return JSON.parse(localStorage.getItem("completed_courses") || "[]");
  } catch {
    return [];
  }
}

function getCoursePrerequisiteLabels(course) {
  return (course.pre || []).map((id) => findCourseById(id)?.name || id);
}

export function initTrackerControls() {
  document.querySelectorAll("[data-major-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      state.major = button.dataset.majorSwitch;
      localStorage.setItem("study_major", state.major);

      document.querySelectorAll("[data-major-switch]").forEach((btn) =>
        btn.classList.toggle("is-current", btn === button)
      );

      const completed = new Set(getCompletedCourses());
      const visibleCourses = state.curriculum.filter(
        (c) => c.major === "common" || c.major === state.major,
      );
      const years = groupBy(visibleCourses, "year");
      const container = document.querySelector(".tracker-years");
      if (container) {
        container.innerHTML = Object.keys(years)
          .sort((a, b) => Number(a) - Number(b))
          .map((year) => {
            const courses = years[year];
            const doneInYear = courses.filter((c) => completed.has(c.id)).length;
            return `
              <section class="tracker-year-section">
                <div class="tracker-year-head">
                  <div>
                    <span class="tracker-year-title">السنة ${year}</span>
                    <p>أنجزت ${doneInYear} من ${courses.length} مواد</p>
                  </div>
                  <strong>${courses.length} مادة</strong>
                </div>
                <div class="tracker-course-list">
                  ${courses.map((course) => renderTrackerCourse(course, completed)).join("")}
                </div>
              </section>
            `;
          })
          .join("");
        bindNewCheckboxes();
      }

      updateTrackerStats(completed);
    });
  });

  bindNewCheckboxes();
}

export function bindNewCheckboxes() {
  document.querySelectorAll("[data-course-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const completed = new Set(getCompletedCourses());
      const id = checkbox.dataset.courseToggle;
      if (checkbox.checked) completed.add(id);
      else completed.delete(id);
      localStorage.setItem("completed_courses", JSON.stringify([...completed]));
      const article = checkbox.closest(".tracker-course");
      if (article) article.classList.toggle("is-done", checkbox.checked);
      updateTrackerStats(completed);
    });
  });
}

export function updateTrackerStats(completed) {
  const visibleCourses = state.curriculum.filter(
    (course) => course.major === "common" || course.major === state.major,
  );
  const totalHours = visibleCourses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  const doneHours = visibleCourses
    .filter((c) => completed.has(c.id))
    .reduce((sum, c) => sum + Number(c.credits || 0), 0);
  const doneCourses = visibleCourses.filter((c) => completed.has(c.id)).length;
  const totalCourses = visibleCourses.length;
  const percent = Math.round((doneHours / totalHours) * 100) || 0;
  const remaining = Math.max(totalHours - doneHours, 0);
  const majorLabel = state.major === "computer" ? "\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u062d\u0627\u0633\u0648\u0628" : "\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0634\u0628\u0643\u0627\u062a";

  const bar = document.querySelector(".tracker-progress span");
  if (bar) bar.style.width = `${percent}%`;

  const h2 = document.querySelector(".tracker-overview-main h2");
  if (h2) h2.textContent = `${percent}%`;

  const desc = document.querySelector(".tracker-overview-main > p");
  if (desc) desc.textContent = `\u0623\u0646\u062c\u0632\u062a ${doneHours} \u0633\u0627\u0639\u0629 \u0645\u0646 \u0623\u0635\u0644 ${totalHours} \u0633\u0627\u0639\u0629 \u0641\u064a \u0645\u0633\u0627\u0631 ${majorLabel}.`;

  const cards = document.querySelectorAll(".tracker-stat-card strong");
  if (cards[0]) cards[0].textContent = doneHours;
  if (cards[1]) cards[1].textContent = remaining;
  if (cards[2]) cards[2].textContent = `${doneCourses}/${totalCourses}`;

  document.querySelectorAll(".tracker-year-section").forEach((section) => {
    const allCbs = section.querySelectorAll("[data-course-toggle]");
    const doneInYear = [...allCbs].filter((cb) => cb.checked).length;
    const p = section.querySelector(".tracker-year-head p");
    if (p) p.textContent = `\u0623\u0646\u062c\u0632\u062a ${doneInYear} \u0645\u0646 ${allCbs.length} \u0645\u0648\u0627\u062f`;
  });
}

function findCourseById(id) {
  return state.curriculum.find((course) => course.id === id);
}

function findSubjectForCourse(course) {
  return state.subjects.find((subject) => subject.name === course.name);
}

