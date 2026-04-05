import { initWowEffects } from "./wow-scripts.js";

const appState = {
  subjects: [],
  activities: [],
  curriculum: [],
  selectedMajor: localStorage.getItem("study_major") || "computer",
};

const MAJOR_LABELS = {
  computer: "هندسة الحاسوب",
  network: "هندسة الشبكات",
  common: "مشترك",
};

const MAJOR_THEME = {
  computer: {
    title: "هندسة الحاسوب",
    accent: "المسار البرمجي والأنظمة المضمنة",
    image: "/computer-plan.webp",
  },
  network: {
    title: "هندسة الشبكات",
    accent: "المسار الشبكي والأمن السيبراني",
    image: "/networking-plan.webp",
  },
};

const QUICK_LINKS = [
  {
    title: "البوابة الطلابية",
    desc: "التسجيل، الساعات، والعلامات من مكان واحد.",
    href: "http://appserver.fet.edu.jo:7778/reg_new/index.jsp",
    icon: "school",
    style: "blue",
  },
  {
    title: "التعلم الإلكتروني",
    desc: "الوصول إلى Moodle والواجبات والامتحانات.",
    href: "https://s3.ebalqa.courses/fet/login/index.php",
    icon: "desktop_windows",
    style: "green",
  },
  {
    title: "جريدة المواد",
    desc: "استعراض الشعب المطروحة وأوقات المحاضرات.",
    href: "http://appserver.fet.edu.jo:7778/courses/index.jsp",
    icon: "library_books",
    style: "orange",
  },
];

const routes = {
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

async function bootstrap() {
  await loadData();
  initTheme();
  bindGlobalEvents();
  render(window.location.pathname);
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

async function loadData() {
  const [subjects, activities, curriculumWrap] = await Promise.all([
    fetchJSON("/data/subjects.json", "subjects"),
    fetchJSON("/data/activities.json"),
    fetchJSON("/data/curriculum.json", "curriculum"),
  ]);

  appState.subjects = subjects;
  appState.activities = activities;
  appState.curriculum = curriculumWrap;
}

async function fetchJSON(path, key) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  const data = await response.json();
  return key ? data[key] : data;
}

function navigate(path) {
  const nextPath = routes[path] ? path : "/";
  window.history.pushState({}, "", nextPath);
  render(nextPath);
}

async function render(pathname) {
  const page = document.getElementById("page");
  const route = routes[pathname] || renderHome;
  page.innerHTML = await route();
  updateActiveLinks(pathname);
  bindPageEvents();
  initReveal();
  initWowEffects();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateActiveLinks(pathname) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === pathname);
  });
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

  window.addEventListener(
    "scroll",
    () => {
      document.getElementById("navbar")?.classList.toggle("is-scrolled", window.scrollY > 12);
    },
    { passive: true },
  );

  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    document.getElementById("nav-links")?.classList.toggle("is-open");
  });
}

function bindPageEvents() {
  initSearchExperience();
  initSubjectFilters();
  initCalculator();
  initTracker();
  initJoinForm();
  initLightbox();
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

function closeMobileMenu() {
  document.getElementById("nav-links")?.classList.remove("is-open");
}

function renderShell(content) {
  return `${content}${renderFooter()}`;
}

async function renderHome() {
  const featuredActivities = appState.activities.slice(0, 3);
  const totals = getProgramStats();

  return renderShell(`
    <section class="hero-section reveal">
      <div class="hero-copy">
        <div class="eyebrow">CNE Family</div>
        <h1>واجهة أكاديمية حديثة لطلبة هندسة الحاسوب والشبكات</h1>
        <p>
          منصة واحدة تجمع المواد، الخطط، الفعاليات، أدوات التتبع، والروابط الرسمية
          في تجربة سريعة وواضحة ومصممة لتخدم الطالب فعلاً.
        </p>
        <div class="hero-actions">
          <a href="/subjects" data-link class="btn btn-primary">ابدأ بالمواد</a>
          <a href="/tracker" data-link class="btn btn-secondary">متتبع الخطة</a>
        </div>
        <div class="hero-metrics">
          <div class="metric-card">
            <strong>${totals.subjects}</strong>
            <span>مادة وأرشيف</span>
          </div>
          <div class="metric-card">
            <strong>${totals.activities}</strong>
            <span>فعالية موثقة</span>
          </div>
          <div class="metric-card">
            <strong>${totals.hours}</strong>
            <span>ساعة في الخطة</span>
          </div>
        </div>
      </div>
      <div class="hero-panel">
        <div class="hero-grid">
          <article class="spotlight-card spotlight-blue">
            <span class="material-symbols-outlined">auto_awesome</span>
            <h3>تصميم واضح</h3>
            <p>تنقل مباشر وتجربة مركزة على ما يحتاجه الطالب يومياً.</p>
          </article>
          <article class="spotlight-card spotlight-red">
            <span class="material-symbols-outlined">hub</span>
            <h3>خطة متكاملة</h3>
            <p>عرض بصري للمسارات الأكاديمية والمتطلبات السابقة.</p>
          </article>
          <article class="spotlight-card spotlight-green">
            <span class="material-symbols-outlined">calculate</span>
            <h3>أدوات عملية</h3>
            <p>حاسبة معدل، متتبع ساعات، وفلاتر ذكية للمواد.</p>
          </article>
          <article class="spotlight-card spotlight-neutral">
            <span class="material-symbols-outlined">event_available</span>
            <h3>مجتمع حي</h3>
            <p>أنشطة وروابط وفرص مشاركة ضمن واجهة واحدة.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block reveal">
      <div class="section-heading">
        <div>
          <div class="eyebrow">الأدوات الأساسية</div>
          <h2>ابدأ من أسرع طريق</h2>
        </div>
      </div>
      <div class="feature-grid">
        ${renderFeatureCard("materials", "المواد الدراسية", "أرشيف مرتب حسب السنة والتخصص مع وصول مباشر للملفات.", "/subjects", "folder_open", "blue")}
        ${renderFeatureCard("plans", "الخطط الدراسية", "استعراض بصري للخطة الشجرية مع تكبير واضح للصور.", "/plans", "schema", "green")}
        ${renderFeatureCard("tracker", "متتبع الساعات", "اعرف ما أنجزته وما تبقى للوصول إلى 162 ساعة.", "/tracker", "timeline", "orange")}
        ${renderFeatureCard("calculator", "حاسبة المعدل", "احسب المعدل الفصلي بسرعة وبدون تشتيت.", "/calculator", "calculate", "red")}
      </div>
    </section>

    <section class="section-block reveal">
      <div class="section-heading">
        <div>
          <div class="eyebrow">الوصول السريع</div>
          <h2>روابط يعتمد عليها الطالب</h2>
        </div>
        <a href="/links" data-link class="text-link">عرض كل الروابط</a>
      </div>
      <div class="quick-links-grid">
        ${QUICK_LINKS.map(renderQuickLink).join("")}
      </div>
    </section>

    <section class="section-block reveal">
      <div class="section-heading">
        <div>
          <div class="eyebrow">الفعاليات</div>
          <h2>أحدث ما في مجتمع CNE</h2>
        </div>
        <a href="/activities" data-link class="text-link">كل الأنشطة</a>
      </div>
      <div class="activity-grid">
        ${featuredActivities.map(renderActivityCard).join("")}
      </div>
    </section>
  `);
}

function renderFeatureCard(key, title, desc, href, icon, tone) {
  return `
    <a href="${href}" data-link class="feature-card tone-${tone}" data-card="${key}">
      <div class="feature-icon">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
      <div>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
      <span class="feature-arrow material-symbols-outlined">north_west</span>
    </a>
  `;
}

function renderQuickLink(link) {
  return `
    <a href="${link.href}" target="_blank" rel="noopener" class="quick-link-card tone-${link.style}">
      <div class="quick-link-icon">
        <span class="material-symbols-outlined">${link.icon}</span>
      </div>
      <h3>${link.title}</h3>
      <p>${link.desc}</p>
      <span class="text-link">افتح الرابط</span>
    </a>
  `;
}

async function renderSubjects() {
  const years = groupBy(appState.subjects, "year");
  const count = appState.subjects.length;

  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">المواد الدراسية</div>
        <h1>أرشيف منظم حسب السنة والتخصص</h1>
        <p>${count} مادة متاحة مع وصول مباشر إلى الملفات وروابط Google Drive.</p>
      </div>
      <div class="filters-shell">
        <div class="filter-field">
          <label for="subject-search">بحث</label>
          <input id="subject-search" type="search" placeholder="ابحث باسم المادة..." />
        </div>
        <div class="filter-field">
          <label for="subject-major">التخصص</label>
          <select id="subject-major">
            <option value="all">الكل</option>
            <option value="common">مشترك</option>
            <option value="computer">هندسة الحاسوب</option>
            <option value="network">هندسة الشبكات</option>
          </select>
        </div>
      </div>
    </section>

    <section class="subjects-layout">
      ${Object.keys(years)
        .sort((a, b) => Number(a) - Number(b))
        .map((year) => renderYearSection(year, years[year]))
        .join("")}
    </section>
  `);
}

function renderYearSection(year, subjects) {
  return `
    <section class="section-block reveal subject-year" data-year="${year}">
      <div class="section-heading">
        <div>
          <div class="eyebrow">السنة ${year}</div>
          <h2>مواد السنة ${year}</h2>
        </div>
      </div>
      <div class="subject-grid">
        ${subjects.map(renderSubjectCard).join("")}
      </div>
    </section>
  `;
}

function renderSubjectCard(subject) {
  return `
    <article class="subject-card" data-major="${subject.major}" data-name="${subject.name.toLowerCase()}">
      <div class="subject-top">
        <span class="subject-badge subject-${subject.major}">${MAJOR_LABELS[subject.major]}</span>
        <span class="subject-year-chip">سنة ${subject.year}</span>
      </div>
      <h3>${subject.name}</h3>
      <p>مواد وأرشيف ومراجع جاهزة للفتح المباشر.</p>
      <a href="${subject.link}" target="_blank" rel="noopener" class="btn btn-inline">فتح المادة</a>
    </article>
  `;
}

async function renderAbout() {
  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">من نحن</div>
        <h1>CNE Family كواجهة للمجتمع الأكاديمي</h1>
        <p>
          مساحة تجمع الطلبة حول المعرفة، التعاون، والهوية المشتركة داخل قسم هندسة الحاسوب والشبكات
          في جامعة البلقاء التطبيقية.
        </p>
      </div>
    </section>

    <section class="section-block reveal">
      <div class="about-grid">
        <article class="story-card">
          <h3>الرسالة</h3>
          <p>
            تقديم تجربة رقمية تحترم وقت الطالب، وتضع المواد والخطط والروابط والخدمات الأكاديمية
            في مسار واضح ومتماسك.
          </p>
        </article>
        <article class="story-card">
          <h3>الرؤية</h3>
          <p>
            أن تصبح المنصة نقطة الوصول الأولى لطلبة CNE، لا كأرشيف فقط، بل كواجهة عملية وموثوقة
            وممتعة بصرياً.
          </p>
        </article>
        <article class="story-card">
          <h3>القيمة</h3>
          <p>
            تنظيم أفضل، وصول أسرع، عرض أجمل، وأدوات تحل المشاكل الحقيقية التي يواجهها الطالب
            كل فصل.
          </p>
        </article>
      </div>
    </section>
  `);
}

function renderPlans() {
  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">الخطط الشجرية</div>
        <h1>خريطتان واضحتان لمساري الحاسوب والشبكات</h1>
        <p>افتح الصورة بالحجم الكامل وراجع الخطة بحسب تخصصك.</p>
      </div>
    </section>

    <section class="plans-grid reveal">
      ${Object.entries(MAJOR_THEME)
        .map(([major, info]) => {
          return `
            <article class="plan-card-hero">
              <div class="plan-copy">
                <span class="plan-pill">${info.accent}</span>
                <h2>${info.title}</h2>
                <p>الخطة الشجرية الكاملة مع عرض بصري واضح ومناسب للهواتف والشاشات الكبيرة.</p>
                <button class="btn btn-primary" data-lightbox="${info.image}">تكبير الخطة</button>
              </div>
              <img src="${info.image}" alt="${info.title}" class="plan-preview" />
            </article>
          `;
        })
        .join("")}
    </section>
  `);
}

async function renderActivities() {
  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">الأنشطة</div>
        <h1>فعاليات تحافظ على نبض المجتمع</h1>
        <p>معارض، ورش، لقاءات، وأيام طلابية موثقة ضمن نفس الواجهة.</p>
      </div>
    </section>
    <section class="activity-grid activity-grid-wide reveal">
      ${appState.activities.map(renderActivityCard).join("")}
    </section>
  `);
}

function renderActivityCard(activity) {
  return `
    <article class="activity-card">
      <div class="activity-banner" style="background:${activity.bg_gradient || "linear-gradient(135deg,#3574C8,#10203c)"}">
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
  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">حاسبة المعدل</div>
        <h1>أدخل المواد واحسب معدلك الفصلي فوراً</h1>
        <p>واجهة خفيفة وسريعة مع دعم إضافة عدد غير محدود من المواد.</p>
      </div>
    </section>

    <section class="section-block reveal">
      <div class="calculator-shell">
        <div class="calculator-panel">
          <div id="grade-rows" class="grade-rows"></div>
          <div class="calculator-actions">
            <button id="add-grade-row" class="btn btn-secondary" type="button">إضافة مادة</button>
            <button id="calculate-gpa" class="btn btn-primary" type="button">احسب المعدل</button>
          </div>
        </div>
        <div class="calculator-result" id="gpa-result-card">
          <div class="eyebrow">النتيجة</div>
          <strong id="gpa-value">0.00</strong>
          <p id="gpa-summary">أدخل المواد والساعات ثم اضغط على احسب المعدل.</p>
        </div>
      </div>
    </section>
  `);
}

async function renderTracker() {
  const visibleCourses = appState.curriculum.filter(
    (course) => course.major === "common" || course.major === appState.selectedMajor,
  );
  const coursesByYear = groupBy(visibleCourses, "year");
  const completedIds = getCompletedCourses();
  const completedHours = visibleCourses
    .filter((course) => completedIds.includes(course.id))
    .reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const totalHours = 162;
  const progress = Math.min(100, Math.round((completedHours / totalHours) * 100));

  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">متتبع الخطة</div>
        <h1>راقب تقدمك نحو التخرج</h1>
        <p>اختر التخصص، علّم المواد المنجزة، وتابع الساعات المتبقية بشكل مباشر.</p>
      </div>
      <div class="tracker-switcher">
        <button class="switch-chip ${appState.selectedMajor === "computer" ? "is-selected" : ""}" data-major-switch="computer">هندسة الحاسوب</button>
        <button class="switch-chip ${appState.selectedMajor === "network" ? "is-selected" : ""}" data-major-switch="network">هندسة الشبكات</button>
      </div>
    </section>

    <section class="tracker-shell reveal">
      <aside class="tracker-summary">
        <div class="eyebrow">التقدم الحالي</div>
        <strong>${progress}%</strong>
        <p>${completedHours} من ${totalHours} ساعة مكتملة حتى الآن.</p>
        <div class="progress-bar">
          <span style="width:${progress}%"></span>
        </div>
      </aside>

      <div class="tracker-courses">
        ${Object.keys(coursesByYear)
          .sort((a, b) => Number(a) - Number(b))
          .map((year) => {
            const courses = coursesByYear[year];
            return `
              <section class="tracker-year">
                <div class="tracker-year-head">
                  <h3>السنة ${year}</h3>
                  <span>${courses.length} مواد</span>
                </div>
                <div class="tracker-list">
                  ${courses.map((course) => renderTrackerItem(course, completedIds)).join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    </section>
  `);
}

function renderTrackerItem(course, completedIds) {
  const checked = completedIds.includes(course.id) ? "checked" : "";
  return `
    <label class="tracker-item ${checked ? "is-done" : ""}">
      <input type="checkbox" data-course-toggle="${course.id}" ${checked} />
      <span class="tracker-item-copy">
        <strong>${course.name}</strong>
        <small>${course.credits} ساعة${course.pre?.length ? ` • سابق: ${course.pre.join(", ")}` : ""}</small>
      </span>
    </label>
  `;
}

function renderLinks() {
  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">الروابط المهمة</div>
        <h1>وصول سريع إلى المنصات الرسمية</h1>
        <p>روابط مختصرة ومرتبة للمنصات التي يستخدمها الطالب باستمرار.</p>
      </div>
    </section>
    <section class="quick-links-grid reveal">
      ${QUICK_LINKS.map(renderQuickLink).join("")}
    </section>
  `);
}

function renderJoin() {
  return renderShell(`
    <section class="page-hero reveal">
      <div>
        <div class="eyebrow">انضم إلينا</div>
        <h1>سجّل اهتمامك بالمشاركة مع CNE Family</h1>
        <p>النموذج بسيط ومباشر، وسنستخدمه كبوابة تواصل أولية معك.</p>
      </div>
    </section>
    <section class="section-block reveal">
      <form id="join-form" class="join-card">
        <div class="form-field">
          <label for="join-name">الاسم الكامل</label>
          <input id="join-name" name="name" required placeholder="اكتب اسمك كما في الهوية الجامعية" />
        </div>
        <div class="form-field">
          <label for="join-id">الرقم الجامعي</label>
          <input id="join-id" name="student_id" required placeholder="مثال: 32019..." />
        </div>
        <div class="form-field">
          <label for="join-contact">وسيلة التواصل</label>
          <input id="join-contact" name="contact" required placeholder="بريد إلكتروني أو رقم هاتف" />
        </div>
        <button class="btn btn-primary" type="submit">إرسال الطلب</button>
      </form>
    </section>
  `);
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-brand">
        <img src="/assets/logos/cne-icon.png" alt="CNE logo" />
        <div>
          <strong>CNE Family</strong>
          <p>واجهة أكاديمية ومجتمعية لطلبة هندسة الحاسوب والشبكات.</p>
        </div>
      </div>
      <div class="footer-links">
        <a href="/" data-link>الرئيسية</a>
        <a href="/subjects" data-link>المواد</a>
        <a href="/plans" data-link>الخطط</a>
        <a href="/activities" data-link>الأنشطة</a>
        <a href="/links" data-link>الروابط</a>
      </div>
      <div class="footer-social">
        <a href="https://www.instagram.com/cne.fet" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.facebook.com/cne.fet" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.youtube.com/@CNEteamCNE_FAMILY" target="_blank" rel="noopener">YouTube</a>
      </div>
    </footer>
  `;
}

function initSearchExperience() {
  const subjectSearch = document.getElementById("subject-search");
  const majorSelect = document.getElementById("subject-major");
  if (!subjectSearch && !majorSelect) return;

  const applyFilters = () => {
    const query = (subjectSearch?.value || "").trim().toLowerCase();
    const major = majorSelect?.value || "all";
    document.querySelectorAll(".subject-card").forEach((card) => {
      const matchesQuery = !query || card.dataset.name.includes(query);
      const matchesMajor = major === "all" || card.dataset.major === major;
      card.hidden = !(matchesQuery && matchesMajor);
    });

    document.querySelectorAll(".subject-year").forEach((section) => {
      const visible = [...section.querySelectorAll(".subject-card")].some((card) => !card.hidden);
      section.hidden = !visible;
    });
  };

  subjectSearch?.addEventListener("input", applyFilters);
  majorSelect?.addEventListener("change", applyFilters);
}

function initSubjectFilters() {}

function initCalculator() {
  const rowsHost = document.getElementById("grade-rows");
  if (!rowsHost) return;

  if (!rowsHost.children.length) {
    addGradeRow();
    addGradeRow();
    addGradeRow();
  }

  document.getElementById("add-grade-row")?.addEventListener("click", addGradeRow);
  document.getElementById("calculate-gpa")?.addEventListener("click", calculateGpa);
}

function addGradeRow() {
  const rowsHost = document.getElementById("grade-rows");
  if (!rowsHost) return;

  const row = document.createElement("div");
  row.className = "grade-row";
  row.innerHTML = `
    <input type="text" placeholder="اسم المادة" class="grade-input grade-name" />
    <input type="number" min="0" max="6" step="1" placeholder="الساعات" class="grade-input grade-hours" />
    <select class="grade-input grade-letter">
      <option value="4">A</option>
      <option value="3.75">A-</option>
      <option value="3.5">B+</option>
      <option value="3">B</option>
      <option value="2.75">B-</option>
      <option value="2.5">C+</option>
      <option value="2">C</option>
      <option value="1.75">C-</option>
      <option value="1.5">D+</option>
      <option value="1">D</option>
      <option value="0">F</option>
    </select>
    <button type="button" class="row-remove material-symbols-outlined" aria-label="حذف">close</button>
  `;
  rowsHost.appendChild(row);

  row.querySelector(".row-remove")?.addEventListener("click", () => {
    row.remove();
    if (!rowsHost.children.length) addGradeRow();
  });
}

function calculateGpa() {
  const rows = [...document.querySelectorAll(".grade-row")];
  let totalPoints = 0;
  let totalHours = 0;

  rows.forEach((row) => {
    const hours = Number(row.querySelector(".grade-hours")?.value || 0);
    const grade = Number(row.querySelector(".grade-letter")?.value || 0);
    if (hours > 0) {
      totalPoints += hours * grade;
      totalHours += hours;
    }
  });

  const gpa = totalHours ? (totalPoints / totalHours).toFixed(2) : "0.00";
  document.getElementById("gpa-value").textContent = gpa;
  document.getElementById("gpa-summary").textContent = totalHours
    ? `تم حساب المعدل بناءً على ${totalHours} ساعة معتمدة.`
    : "أدخل ساعات فعلية لحساب المعدل.";
}

function initTracker() {
  document.querySelectorAll("[data-major-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedMajor = button.dataset.majorSwitch;
      localStorage.setItem("study_major", appState.selectedMajor);
      render("/tracker");
    });
  });

  document.querySelectorAll("[data-course-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const courseId = checkbox.dataset.courseToggle;
      const completed = new Set(getCompletedCourses());
      if (checkbox.checked) completed.add(courseId);
      else completed.delete(courseId);
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

function initJoinForm() {
  const form = document.getElementById("join-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const original = button.textContent;
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
        <div class="success-state">
          <span class="material-symbols-outlined">verified</span>
          <h3>تم إرسال طلبك بنجاح</h3>
          <p>سيتم التواصل معك قريباً عبر وسيلة التواصل التي أدخلتها.</p>
        </div>
      `;
    } catch {
      button.disabled = false;
      button.textContent = original;
      alert("تعذر إرسال الطلب حالياً. حاول مرة أخرى لاحقاً.");
    }
  });
}

function initLightbox() {
  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => openLightbox(button.dataset.lightbox));
  });
}

function openLightbox(src) {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-dialog">
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

function initReveal() {
  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.setProperty("--delay", `${Math.min(index * 80, 400)}ms`);
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

function getProgramStats() {
  return {
    subjects: appState.subjects.length,
    activities: appState.activities.length,
    hours: 162,
  };
}

bootstrap().catch((error) => {
  console.error(error);
  document.getElementById("page").innerHTML = `
    <section class="error-state">
      <h1>تعذر تحميل الواجهة</h1>
      <p>حدث خطأ أثناء تحميل البيانات الأساسية للموقع.</p>
    </section>
  `;
});
