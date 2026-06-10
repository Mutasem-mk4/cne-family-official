import { layout } from "./layout.js";
import { state } from "../state.js";
import { MAJORS, PLAN_HOTSPOTS, SUBJECT_NAME_MAP, PLAN_IMAGE_SIZE } from "../config.js";

export async function renderSubjects() {
  return layout(
    `
      <section class="subject-page reveal">
        ${renderPlansStage()}
      </section>
    `
  );
}

export function renderPlansStage() {
  return `
    <section class="plans-stage reveal" aria-label="الخطط الشجرية">
      ${Object.entries(MAJORS)
        .filter(([key]) => key !== "common")
        .map(([key, major]) => {
          return `
            <article class="plan-showcase tone-${major.tone}">
              <div class="plan-showcase-copy">
                <div class="plan-actions">
                  <button class="btn btn-primary" data-major-lightbox="${key}">تكبير الخطة</button>
                  <a class="btn btn-secondary" href="${major.image}" download="${key}-study-plan">تحميل الخطة</a>
                </div>
              </div>
              ${renderClickablePlanImage(key, major)}
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderClickablePlanImage(majorKey, major) {
  const subjectsByName = new Map(state.subjects.map((subject) => [subject.name, subject]));
  const hotspots = (PLAN_HOTSPOTS[majorKey] || [])
    .map(([name, x, y, width, height]) => {
      const mappedName = SUBJECT_NAME_MAP[name] || name;
      const subject = subjectsByName.get(mappedName);
      const hasLink = subject?.link && subject.link !== "#";
      return { name: subject?.name || name, link: hasLink ? subject.link : null, x, y, width, height };
    });
  return `
    <div class="plan-image-map" aria-label="خطة ${major.label} - اضغط على اسم المادة لفتح ملفاتها">
      <div class="plan-viewport">
        <img src="${major.image}" alt="${major.label}" class="plan-showcase-image" />
        ${hotspots.map(renderPlanHotspot).join("")}
      </div>
    </div>
  `;
}

function renderPlanHotspot({ name, link, x, y, width, height }) {
  const left = (x / PLAN_IMAGE_SIZE.width) * 100;
  const top = (y / PLAN_IMAGE_SIZE.height) * 100;
  const boxWidth = (width / PLAN_IMAGE_SIZE.width) * 100;
  const boxHeight = (height / PLAN_IMAGE_SIZE.height) * 100;
  const style = `left:${left.toFixed(3)}%;top:${top.toFixed(3)}%;width:${boxWidth.toFixed(3)}%;height:${boxHeight.toFixed(3)}%;`;

  if (link) {
    return `
      <a
        href="${link}"
        target="_blank"
        rel="noopener"
        class="plan-hotspot"
        style="${style}"
        aria-label="افتح ملفات ${name}"
        title="${name}"
      ></a>
    `;
  } else {
    return `
      <div
        class="plan-hotspot plan-hotspot-missing"
        style="${style}"
        title="${name} — لا يوجد محتوى بعد"
        aria-label="${name} — لا يوجد محتوى بعد"
      ></div>
    `;
  }
}

export function initLightbox() {
  document.querySelectorAll("[data-major-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      const majorKey = button.dataset.majorLightbox;
      openInteractiveLightbox(majorKey);
    });
  });
}

function openInteractiveLightbox(majorKey) {
  const major = MAJORS[majorKey];
  if (!major) return;

  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-inner reveal is-visible">
      <button class="lightbox-close material-symbols-outlined" type="button" aria-label="إغلاق">close</button>
      <div class="lightbox-content">
        ${renderClickablePlanImage(majorKey, major)}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const close = () => {
    overlay.remove();
    document.body.style.overflow = "";
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest(".lightbox-close")) {
      close();
    }
  });

  const onKey = (e) => {
    if (e.key === "Escape") {
      close();
      window.removeEventListener("keydown", onKey);
    }
  };
  window.addEventListener("keydown", onKey);
}

export function initSubjectExplorer() {
  const search = document.getElementById("subject-search");
  const chips = [...document.querySelectorAll("[data-major-filter]")];
  if (!search && !chips.length) return;

  let activeMajor = "all";

  const apply = () => {
    const query = (search?.value || "").trim().toLowerCase();
    document.querySelectorAll(".subject-card").forEach((card) => {
      const matchesQuery = !query || card.dataset.name.includes(query);
      const matchesMajor = activeMajor === "all" || card.dataset.major === activeMajor;
      card.hidden = !(matchesQuery && matchesMajor);
    });

    document.querySelectorAll("[data-year-group]").forEach((group) => {
      const anyVisible = [...group.querySelectorAll(".subject-card")].some((card) => !card.hidden);
      group.hidden = !anyVisible;
    });
  };

  search?.addEventListener("input", apply);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeMajor = chip.dataset.majorFilter;
      chips.forEach((item) => item.classList.toggle("is-active", item === chip));
      apply();
    });
  });

  const yearChips = [...document.querySelectorAll("[data-year-jump]")];
  yearChips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const year = btn.dataset.yearJump;
      const target = document.querySelector(`[data-year-group="${year}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (yearChips.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const year = entry.target.dataset.yearGroup;
            yearChips.forEach((btn) =>
              btn.classList.toggle("is-active", btn.dataset.yearJump === year)
            );
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    document.querySelectorAll("[data-year-group]").forEach((el) => observer.observe(el));
  }
}

