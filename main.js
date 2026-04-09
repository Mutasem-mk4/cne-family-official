import { initWowEffects } from "./wow-scripts.js";

const state = {
  subjects: [],
  activities: [],
  curriculum: [],
  major: localStorage.getItem("study_major") || "computer",
};

const ROUTES = {
  "/": renderHome,
  "/about": renderAbout,
  "/subjects": renderSubjects,
  "/plans": renderPlans,
  "/activities": renderActivities,
  "/calculator": renderCalculator,
  "/tracker": renderTracker,
  "/links": renderLinks,
  "/join": renderJoin,
};

const QUICK_LINKS = [
  {
    title: "البوابة الطلابية",
    desc: "الدخول إلى التسجيل والعلامات والساعات المعتمدة.",
    href: "http://appserver.fet.edu.jo:7778/reg_new/index.jsp",
    icon: "school",
    tone: "blue",
  },
  {
    title: "التعلم الإلكتروني",
    desc: "الوصول إلى Moodle والواجبات والامتحانات.",
    href: "https://s3.ebalqa.courses/fet/login/index.php",
    icon: "laptop_chromebook",
    tone: "green",
  },
  {
    title: "جريدة المواد",
    desc: "عرض الشعب المطروحة وأوقات المحاضرات.",
    href: "http://appserver.fet.edu.jo:7778/courses/index.jsp",
    icon: "library_books",
    tone: "orange",
  },
];

const TECH_TITANS = [
  {
    name: "Titan Nova",
    title: "AI Systems Lead",
    score: 980,
    streak: "12 wins",
    badge: "01",
    tone: "blue",
  },
  {
    name: "Cipher Queen",
    title: "Cybersecurity Captain",
    score: 955,
    streak: "9 wins",
    badge: "02",
    tone: "orange",
  },
  {
    name: "Packet Rider",
    title: "Network Architect",
    score: 930,
    streak: "7 wins",
    badge: "03",
    tone: "green",
  },
  {
    name: "Kernel Pulse",
    title: "Systems Builder",
    score: 905,
    streak: "5 wins",
    badge: "04",
    tone: "sand",
  },
];

const MAJORS = {
  computer: {
    label: "هندسة الحاسوب",
    accent: "مسار البرمجة والأنظمة",
    image: "/computer-plan.webp",
    tone: "blue",
  },
  network: {
    label: "هندسة الشبكات",
    accent: "مسار الشبكات والأمن",
    image: "/networking-plan.webp",
    tone: "green",
  },
  common: {
    label: "مشترك",
    accent: "متطلبات كلية وقسم",
    image: "/computer-plan.jpg",
    tone: "sand",
  },
};

const GRADE_POINTS = {
  A: 4,
  "A-": 3.75,
  "B+": 3.5,
  B: 3,
  "B-": 2.75,
  "C+": 2.5,
  C: 2,
  "C-": 1.75,
  "D+": 1.5,
  D: 1,
  F: 0,
};

async function bootstrap() {
  await loadData();
  initTheme();
  bindGlobalEvents();
  await render(window.location.pathname);
  unregisterLegacyServiceWorkers();
}

async function loadData() {
  const [subjectsPayload, activitiesPayload, curriculumPayload] = await Promise.all([
    fetchJSON("/data/subjects.json"),
    fetchJSON("/data/activities.json"),
    fetchJSON("/data/curriculum.json"),
  ]);

  state.subjects = subjectsPayload.subjects || [];
  state.activities = activitiesPayload || [];
  state.curriculum = curriculumPayload.curriculum || [];
}

async function fetchJSON(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function bindGlobalEvents() {
  window.addEventListener("popstate", () => render(window.location.pathname));

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-link]");
    if (!link) return;
    event.preventDefault();
    closeMobileMenu();
    navigate(link.getAttribute("href"));
  });

  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("mobile-menu-btn")?.addEventListener("click", toggleMobileMenu);

  window.addEventListener(
    "scroll",
    () => {
      document.getElementById("navbar")?.classList.toggle("is-scrolled", window.scrollY > 16);
    },
    { passive: true },
  );
}

function navigate(path) {
  const target = ROUTES[path] ? path : "/";
  window.history.pushState({}, "", target);
  render(target);
}

async function render(pathname) {
  const page = document.getElementById("page");
  const renderer = ROUTES[pathname] || renderHome;
  page.innerHTML = await renderer();
  updateActiveLinks(pathname);
  bindPageEvents();
  revealPage();
  initWowEffects();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateActiveLinks(pathname) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === pathname);
  });
}

function bindPageEvents() {
  initLightbox();
  initSubjectExplorer();
  initTrackerControls();
  initCalculator();
  initJoinForm();
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

function toggleMobileMenu() {
  document.getElementById("nav-links")?.classList.toggle("is-open");
}

function closeMobileMenu() {
  document.getElementById("nav-links")?.classList.remove("is-open");
}

function unregisterLegacyServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  });
}

function layout(content, options = {}) {
  return `
    ${options.heroBanner ? renderTopBanner(options.heroBanner) : ""}
    ${content}
    ${renderFooter()}
  `;
}

function renderTopBanner({ label, title, copy, actionHref, actionLabel }) {
  return `
    <section class="top-banner reveal">
      <div class="top-banner-copy">
        <span class="eyebrow eyebrow-solid">${label}</span>
        <h1>${title}</h1>
        <p>${copy}</p>
      </div>
      ${
        actionHref && actionLabel
          ? `<a href="${actionHref}" data-link class="btn btn-primary">${actionLabel}</a>`
          : ""
      }
    </section>
  `;
}

async function renderHome() {
  return layout(`
    <section class="home-command reveal">
      <div class="home-command-copy">
        <span class="eyebrow">CNE Family</span>
        <h1>كل ما يحتاجه الطالب في مسار واحد واضح.</h1>
        <p>
          ابدأ من المهمة التي تريدها الآن: مادة، خطة، متتبع، أو رابط رسمي. الواجهة الرئيسية
          صارت أقرب إلى لوحة قيادة بدل تكديس أقسام متشابهة.
        </p>
        <div class="home-command-actions">
          <a href="/subjects" data-link class="btn btn-primary">ابدأ من المواد</a>
          <a href="/plans" data-link class="btn btn-secondary">راجع الخطط</a>
        </div>
      </div>
      <div class="home-command-panel">
        <article class="home-command-highlight">
          <span class="home-command-kicker">البدء السريع</span>
          <strong>${state.subjects.length} مادة</strong>
          <p>مكتبة واحدة تجمع مواد القسم مع انتقال مباشر إلى الملفات الأساسية.</p>
        </article>
        <div class="home-command-metrics">
          <div class="home-metric-card">
            <strong>4</strong>
            <span>مسارات رئيسية</span>
          </div>
          <div class="home-metric-card">
            <strong>${QUICK_LINKS.length}</strong>
            <span>روابط يومية</span>
          </div>
          <div class="home-metric-card">
            <strong>${TECH_TITANS.length}</strong>
            <span>أسماء في اللوحة</span>
          </div>
        </div>
      </div>
    </section>

    <section class="home-route-grid reveal">
      ${renderHomeActionCard("المواد الدراسية", "ابحث عن المادة وافتح ملفاتها مباشرة.", "/subjects", "folder_open")}
      ${renderHomeActionCard("الخطط الشجرية", "راجع الخطة المناسبة لكل مسار.", "/plans", "schema")}
      ${renderHomeActionCard("متتبع الخطة", "اعرف ما أنجزته وما تبقى عليك.", "/tracker", "target")}
      ${renderHomeActionCard("الروابط الأساسية", "ادخل إلى البوابة وجريدة المواد والتعلم الإلكتروني.", "/links", "link")}
    </section>

    <section class="home-spotlight reveal">
      <section class="titans-board">
        <div class="titans-board-head">
          <div>
            <span class="eyebrow">Tech Titans</span>
            <h2>Leaderboard</h2>
          </div>
          <p>التركيز هنا على الاسم الأول ثم بقية الترتيب ضمن مساحة مضغوطة وأوضح.</p>
        </div>
        <div class="titans-featured">
          ${renderTitanFeaturedCard(TECH_TITANS[0], 1)}
          <div class="titans-list">
            ${TECH_TITANS.slice(1).map((titan, index) => renderTitanListCard(titan, index + 2)).join("")}
          </div>
        </div>
      </section>

      <section class="home-quick-links">
        <div class="home-quick-links-head">
          <span class="eyebrow">روابط سريعة</span>
          <a href="/links" data-link class="text-cta">كل الروابط</a>
        </div>
        <div class="home-quick-links-grid">
          ${QUICK_LINKS.map(
            (link) => `
              <a href="${link.href}" target="_blank" rel="noopener" class="home-quick-link-card">
                <span class="material-symbols-outlined">${link.icon}</span>
                <div>
                  <strong>${link.title}</strong>
                  <p>${link.desc}</p>
                </div>
              </a>
            `,
          ).join("")}
        </div>
      </section>
    </section>
  `);
}

function renderRibbonCard(title, desc, href, icon, tone) {
  return `
    <a href="${href}" data-link class="ribbon-card tone-${tone}">
      <span class="material-symbols-outlined">${icon}</span>
      <div>
        <strong>${title}</strong>
        <p>${desc}</p>
      </div>
    </a>
  `;
}

function renderHomeActionCard(title, desc, href, icon) {
  return `
    <a href="${href}" data-link class="home-action-card">
      <div class="home-action-icon-wrap">
        <span class="material-symbols-outlined home-action-icon">${icon}</span>
      </div>
      <div class="home-action-copy">
        <strong>${title}</strong>
        <p>${desc}</p>
      </div>
      <span class="material-symbols-outlined home-action-arrow">arrow_outward</span>
    </a>
  `;
}

async function renderSubjects() {
  const years = groupBy(state.subjects, "year");
  const counts = {
    all: state.subjects.length,
    computer: state.subjects.filter((subject) => subject.major === "computer").length,
    network: state.subjects.filter((subject) => subject.major === "network").length,
    common: state.subjects.filter((subject) => subject.major === "common").length,
  };

  return layout(
    `
      <section class="subject-page reveal">
        <section class="subject-toolbar">
          <div class="subject-toolbar-copy">
            <span class="eyebrow">المواد الدراسية</span>
            <h2>ابحث عن المادة ثم افتحها مباشرة</h2>
            <p>اكتب اسم المادة أو اختر التخصص لتقليل النتائج بسرعة.</p>
          </div>
          <div class="subject-toolbar-controls">
            <div class="subject-search">
              <label for="subject-search">ابحث باسم المادة</label>
              <input id="subject-search" type="search" placeholder="مثال: شبكات الحاسوب 1" />
            </div>
            <div class="filter-stack">
              <button class="filter-chip is-active" data-major-filter="all">الكل ${counts.all}</button>
              <button class="filter-chip" data-major-filter="common">مشترك ${counts.common}</button>
              <button class="filter-chip" data-major-filter="computer">حاسوب ${counts.computer}</button>
              <button class="filter-chip" data-major-filter="network">شبكات ${counts.network}</button>
            </div>
          </div>
        </section>

        <div class="subject-content">
          ${Object.keys(years)
            .sort((a, b) => Number(a) - Number(b))
            .map((year) => renderSubjectYear(year, years[year]))
            .join("")}
        </div>
      </section>
    `,
    {
      heroBanner: {
        label: "المواد الدراسية",
        title: "الوصول السريع إلى مواد القسم",
        copy: "ابحث عن المادة المطلوبة ثم افتح ملفاتها مباشرة.",
      },
    },
  );
}

function renderSubjectYear(year, subjects) {
  return `
    <section class="subject-year reveal" data-year-group="${year}">
      <div class="subject-year-head">
        <span class="subject-year-label">السنة ${year}</span>
        <strong>${subjects.length} مادة</strong>
      </div>
      <div class="subject-grid">
        ${subjects.map(renderSubjectCard).join("")}
      </div>
    </section>
  `;
}

function renderSubjectCard(subject) {
  return `
    <article
      class="subject-card"
      data-major="${subject.major}"
      data-name="${subject.name.toLowerCase()}"
    >
      <div class="subject-card-top">
        <span class="major-tag major-tag-${subject.major}">${MAJORS[subject.major]?.label || subject.major}</span>
        <span class="subject-year-mini">سنة ${subject.year}</span>
      </div>
      <h3>${subject.name}</h3>
      <a href="${subject.link}" target="_blank" rel="noopener" class="btn btn-secondary btn-small">افتح المادة</a>
    </article>
  `;
}

async function renderAbout() {
  return layout(
    `
      <section class="about-scene reveal">
        <article class="about-panel about-panel-wide">
          <span class="eyebrow">من نحن</span>
          <h2>CNE Family مساحة أكاديمية لخدمة الطلبة.</h2>
          <p>
            الهدف هو توفير مكان واضح وعملي يجمع المواد والخطط والأدوات الأساسية
            لطلبة هندسة الحاسوب والشبكات.
          </p>
        </article>
        <article class="about-panel">
          <h3>الرسالة</h3>
          <p>تقديم محتوى أكاديمي واضح وسهل الوصول.</p>
        </article>
        <article class="about-panel">
          <h3>الرؤية</h3>
          <p>منصة طلابية موثوقة وسريعة وسهلة الاستخدام.</p>
        </article>
        <article class="about-panel">
          <h3>القيمة</h3>
          <p>تنظيم أفضل ووقت أقل ضائع على الطالب.</p>
        </article>
      </section>
    `,
    {
      heroBanner: {
        label: "عن CNE Family",
        title: "تعريف مختصر بالمنصة ودورها",
        copy: "صفحة مباشرة تشرح الفكرة بدون تفاصيل زائدة.",
      },
    },
  );
}

function renderPlans() {
  return layout(
    `
      <section class="plans-stage reveal">
        ${Object.entries(MAJORS)
          .filter(([key]) => key !== "common")
          .map(([key, major]) => {
            return `
              <article class="plan-showcase tone-${major.tone}">
                <div class="plan-showcase-copy">
                  <span class="eyebrow eyebrow-ghost">${major.label}</span>
                  <h2>${major.accent}</h2>
                  <p>عرض واضح للخطة الشجرية مع إمكانية التكبير.</p>
                  <button class="btn btn-primary" data-lightbox="${major.image}">تكبير الخطة</button>
                </div>
                <img src="${major.image}" alt="${major.label}" class="plan-showcase-image" />
              </article>
            `;
          })
          .join("")}
      </section>
    `,
    {
      heroBanner: {
        label: "الخطط الدراسية",
        title: "الخطط الشجرية لكل مسار",
        copy: "عرض أوضح وأسهل للقراءة مع تكبير مباشر.",
      },
    },
  );
}

async function renderActivities() {
  return layout(
    `
      <section class="activity-wall reveal">
        ${state.activities.map(renderActivityCard).join("")}
      </section>
    `,
    {
      heroBanner: {
        label: "الأنشطة",
        title: "أنشطة وفعاليات المجتمع الطلابي",
        copy: "عرض أبسط للفعاليات مع تركيز على العنوان والمحتوى.",
      },
    },
  );
}

function renderActivityCard(activity) {
  return `
    <article class="activity-card">
      <div class="activity-cover" style="background:${activity.bg_gradient || "linear-gradient(135deg,#1f5eff,#10203c)"}">
        <span>${activity.emoji || "✨"}</span>
      </div>
      <div class="activity-body">
        <div class="activity-meta">
          <span>${activity.date || ""}</span>
          <span>${activity.tag || activity.type || "فعالية"}</span>
        </div>
        <h3>${activity.title}</h3>
        <p>${activity.description || activity.desc || ""}</p>
      </div>
    </article>
  `;
}

function renderCalculator() {
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

async function renderTracker() {
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

function renderTrackerCourse(course, completed) {
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

function renderTitanFeaturedCard(titan, rank) {
  return `
    <article class="titan-featured-card tone-${titan.tone}">
      <span class="titan-rank-badge">#${rank}</span>
      <div class="titan-featured-copy">
        <strong>${titan.name}</strong>
        <p>${titan.title}</p>
      </div>
      <div class="titan-score-box">
        <span>${titan.score}</span>
        <small>${titan.streak}</small>
      </div>
    </article>
  `;
}

function renderTitanListCard(titan, rank) {
  return `
    <article class="titan-list-card">
      <div class="titan-list-rank tone-${titan.tone}">
        <span>#${rank}</span>
        <small>${titan.badge}</small>
      </div>
      <div class="titan-list-copy">
        <strong>${titan.name}</strong>
        <p>${titan.title}</p>
      </div>
      <div class="titan-list-score">
        <strong>${titan.score}</strong>
        <span>${titan.streak}</span>
      </div>
    </article>
  `;
}

function getCoursePrerequisiteLabels(course) {
  return (course.pre || []).map((id) => findCourseById(id)?.name || id);
}

function findCourseById(id) {
  return state.curriculum.find((course) => course.id === id);
}

function findSubjectForCourse(course) {
  return state.subjects.find((subject) => subject.name === course.name);
}

function renderLinks() {
  return layout(
    `
      <section class="links-page reveal">
        <section class="links-intro">
          <span class="eyebrow">الروابط الأساسية</span>
          <h2>اختر المنصة التي تريد فتحها</h2>
          <p>روابط مباشرة إلى أهم المنصات الرسمية التي يحتاجها الطالب يومياً.</p>
        </section>

        <section class="links-board">
        ${QUICK_LINKS.map(
          (link) => `
            <a href="${link.href}" target="_blank" rel="noopener" class="resource-card tone-${link.tone}">
              <span class="material-symbols-outlined">${link.icon}</span>
              <h3>${link.title}</h3>
              <p>${link.desc}</p>
              <span class="text-cta">افتح الرابط</span>
            </a>
          `,
        ).join("")}
        </section>
      </section>
    `,
    {
      heroBanner: {
        label: "الروابط الأساسية",
        title: "وصول مباشر إلى أهم المنصات الرسمية",
        copy: "البوابة الطلابية، جريدة المواد، والتعلم الإلكتروني في صفحة واحدة.",
      },
    },
  );
}

function renderJoin() {
  return layout(
    `
      <section class="join-layout reveal">
        <article class="join-copy">
          <span class="eyebrow">الانضمام</span>
          <h2>اترك بياناتك وسنتواصل معك.</h2>
          <p>إذا كنت تريد المشاركة أو الاستفسار، أرسل بياناتك عبر هذا النموذج.</p>
        </article>
        <form id="join-form" class="join-form">
          <label>
            <span>الاسم الكامل</span>
            <input name="name" required placeholder="اكتب اسمك الكامل" />
          </label>
          <label>
            <span>الرقم الجامعي</span>
            <input name="student_id" required placeholder="مثال: 32019..." />
          </label>
          <label>
            <span>وسيلة التواصل</span>
            <input name="contact" required placeholder="بريد إلكتروني أو رقم هاتف" />
          </label>
          <button class="btn btn-primary" type="submit">إرسال الطلب</button>
        </form>
      </section>
    `,
    {
      heroBanner: {
        label: "التواصل والانضمام",
        title: "نموذج بسيط للانضمام والتواصل",
        copy: "التركيز هنا على الإجراء الأساسي فقط.",
      },
    },
  );
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-brand">
        <img src="/assets/logos/cne-icon.png" alt="CNE logo" />
        <div>
          <strong> CNE Family </strong>
          <p>منصة أكاديمية مخصصة لطلبة هندسة الحاسوب والشبكات في جامعة البلقاء التطبيقية.</p>
        </div>
      </div>
      <div class="footer-nav">
        <a href="/" data-link>الرئيسية</a>
        <a href="/subjects" data-link>المواد</a>
        <a href="/plans" data-link>الخطط</a>
        <a href="/tracker" data-link>المتتبع</a>
      </div>
      <div class="footer-social">
        <a href="https://www.instagram.com/cne.fet" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.facebook.com/cne.fet" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.youtube.com/@CNEteamCNE_FAMILY" target="_blank" rel="noopener">YouTube</a>
      </div>
    </footer>
  `;
}

function initLightbox() {
  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(button.dataset.lightbox);
    });
  });
}

function openLightbox(src) {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-inner">
      <button class="lightbox-close material-symbols-outlined" type="button">close</button>
      <img src="${src}" alt="plan preview" />
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest(".lightbox-close")) {
      overlay.remove();
    }
  });
}

function initSubjectExplorer() {
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
}

function initTrackerControls() {
  document.querySelectorAll("[data-major-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      state.major = button.dataset.majorSwitch;
      localStorage.setItem("study_major", state.major);
      render("/tracker");
    });
  });

  document.querySelectorAll("[data-course-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const completed = new Set(getCompletedCourses());
      const id = checkbox.dataset.courseToggle;
      if (checkbox.checked) completed.add(id);
      else completed.delete(id);
      localStorage.setItem("completed_courses", JSON.stringify([...completed]));
      render("/tracker");
    });
  });
}

function getCompletedCourses() {
  try {
    return JSON.parse(localStorage.getItem("completed_courses") || "[]");
  } catch {
    return [];
  }
}

function initCalculator() {
  const host = document.getElementById("grade-rows");
  if (!host) return;

  if (!host.children.length) {
    for (let i = 0; i < 4; i += 1) addGradeRow();
  }

  document.getElementById("add-grade-row")?.addEventListener("click", addGradeRow);
  document.getElementById("calculate-gpa")?.addEventListener("click", calculateGpa);
}

function addGradeRow() {
  const host = document.getElementById("grade-rows");
  if (!host) return;

  const row = document.createElement("div");
  row.className = "grade-row";
  row.innerHTML = `
    <input class="grade-input grade-name" type="text" placeholder="اسم المادة" />
    <input class="grade-input grade-hours" type="number" min="0" max="6" step="1" placeholder="الساعات" />
    <select class="grade-input grade-letter">
      ${Object.keys(GRADE_POINTS)
        .map((grade) => `<option value="${GRADE_POINTS[grade]}">${grade}</option>`)
        .join("")}
    </select>
    <button type="button" class="grade-remove material-symbols-outlined" aria-label="حذف المادة">close</button>
  `;
  host.appendChild(row);
  row.querySelector(".grade-remove")?.addEventListener("click", () => {
    row.remove();
    if (!host.children.length) addGradeRow();
  });
}

function calculateGpa() {
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

function initJoinForm() {
  const form = document.getElementById("join-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "جارٍ الإرسال...";

    try {
      const response = await fetch("https://formspree.io/f/xoqgkyyv", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("submit failed");
      form.innerHTML = `
        <div class="form-success">
          <span class="material-symbols-outlined">verified</span>
          <h3>تم إرسال طلبك</h3>
          <p>سيتم التواصل معك قريباً عبر البيانات التي أدخلتها.</p>
        </div>
      `;
    } catch {
      button.disabled = false;
      button.textContent = originalText;
      alert("تعذر إرسال الطلب حالياً. حاول لاحقاً.");
    }
  });
}

function revealPage() {
  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.setProperty("--delay", `${Math.min(index * 70, 350)}ms`);
    requestAnimationFrame(() => element.classList.add("is-visible"));
  });
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] ??= [];
    acc[value].push(item);
    return acc;
  }, {});
}

bootstrap().catch((error) => {
  console.error(error);
  document.getElementById("page").innerHTML = `
    <section class="error-state">
      <h1>تعذر تحميل الواجهة</h1>
      <p>حدث خطأ أثناء جلب البيانات الأساسية للموقع.</p>
    </section>
  `;
});
