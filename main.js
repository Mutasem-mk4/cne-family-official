import { initWowEffects } from "./wow-scripts.js";

const state = {
  subjects: [],
  activities: [],
  curriculum: [],
  techTitans: [],
  major: localStorage.getItem("study_major") || "computer",
};

const ROUTES = {
  "/": renderHome,
  "/about": renderAbout,
  "/subjects": renderSubjects,
  "/plans": renderSubjects,
  "/activities": renderActivities,
  "/calculator": renderCalculator,
  "/tracker": renderTracker,
  "/links": renderLinks,
  "/join": renderJoin,
  "/map": renderMap,
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

const DEFAULT_TECH_TITANS = [
  {
    name: "Titan Nova",
    title: "AI Systems Lead",
    score: 980,
    streak: "12 wins",
    badge: "01",
    tone: "blue",
    image: "/assets/logos/cne-icon.png",
  },
  {
    name: "Cipher Queen",
    title: "Cybersecurity Captain",
    score: 955,
    streak: "9 wins",
    badge: "02",
    tone: "orange",
    image: "/assets/logos/cne-icon.png",
  },
  {
    name: "Packet Rider",
    title: "Network Architect",
    score: 930,
    streak: "7 wins",
    badge: "03",
    tone: "green",
    image: "/assets/logos/cne-icon.png",
  },
  {
    name: "Kernel Pulse",
    title: "Systems Builder",
    score: 905,
    streak: "5 wins",
    badge: "04",
    tone: "sand",
    image: "/assets/logos/cne-icon.png",
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
  const [subjectsPayload, activitiesPayload, curriculumPayload, techTitansPayload] = await Promise.all([
    fetchJSON("/data/subjects.json"),
    fetchJSON("/data/activities.json"),
    fetchJSON("/data/curriculum.json"),
    fetchJSON("/data/tech-titans.json").catch(() => ({ titans: DEFAULT_TECH_TITANS })),
  ]);

  state.subjects = subjectsPayload.subjects || [];
  state.activities = activitiesPayload || [];
  state.curriculum = curriculumPayload.curriculum || [];
  state.techTitans = techTitansPayload.titans?.length ? techTitansPayload.titans : DEFAULT_TECH_TITANS;
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
  const techTitans = [...(state.techTitans?.length ? state.techTitans : DEFAULT_TECH_TITANS)].sort(
    (left, right) => Number(right.score || 0) - Number(left.score || 0),
  );

  return layout(`
    <section class="home-command reveal">
      <div class="hero-command-board hero-premium">
        <div class="hero-command-background">
          <img src="/assets/images/hero-cne.jpg" alt="CNE Family Group" class="hero-image-full">
          <div class="hero-image-mask"></div>
        </div>
        
        <div class="hero-command-content">
          <div class="hero-command-copy">
            <span class="hero-badge">CNE Family Official Platform</span>
            <h1>نقطة بداية واضحة لمستقبلك الهندسي.</h1>
            <p>
              المنصة الأكاديمية الشاملة لطلبة هندسة الحاسوب والشبكات: محتوى منظم،
              أدوات ذكية، ومجتمع تقني متكامل.
            </p>
          </div>

          <div class="hero-primary-actions">
            <a href="/subjects" data-link class="btn btn-primary btn-xl">
              <span class="material-symbols-outlined">folder_managed</span>
              تصفح المواد الدراسية
            </a>
            <a href="/tracker" data-link class="btn btn-secondary btn-glass btn-xl">
              <span class="material-symbols-outlined">analytics</span>
              تتبع تقدمك الأكاديمي
            </a>
          </div>

          <div class="hero-metrics">
            <div class="metric-item">
              <strong>${state.subjects.length}</strong>
              <span>مادة دراسية</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <strong>4</strong>
              <span>مسارات تخصص</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <strong>${QUICK_LINKS.length}</strong>
              <span>خدمات طلابية</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="home-spotlight reveal">
      <section class="titans-board">
        <div class="titans-board-head">
          <div>
            <span class="eyebrow">Tech Titans</span>
            <h2>Leaderboard</h2>
          </div>
        </div>
        <div class="titans-featured">
          ${renderTitanFeaturedCard(techTitans[0], 1)}
          <div class="titans-list">
            ${techTitans.slice(1).map((titan, index) => renderTitanListCard(titan, index + 2)).join("")}
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

function renderHeroCommand(index, title, desc, href, icon, primary = false) {
  return `
    <a href="${href}" data-link class="hero-command ${primary ? "is-primary" : ""}">
      <span class="hero-command-index">${index}</span>
      <span class="material-symbols-outlined hero-command-icon">${icon}</span>
      <span class="hero-command-text">
        <strong>${title}</strong>
        <small>${desc}</small>
      </span>
      <span class="material-symbols-outlined hero-command-arrow">arrow_back</span>
    </a>
  `;
}

async function renderSubjects() {
  const years = groupBy(state.subjects, "year");
  const sortedYears = Object.keys(years).sort((a, b) => Number(a) - Number(b));
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
          <nav class="subject-year-nav">
            ${sortedYears.map((year) => `
              <button class="year-nav-chip" data-year-jump="${year}">
                السنة ${year}
                <span>${years[year].length}</span>
              </button>
            `).join("")}
          </nav>
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

        ${renderPlansStage()}

        <div class="subject-content">
          ${sortedYears
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
    <a
      href="${subject.link}"
      target="_blank"
      rel="noopener"
      class="subject-card"
      data-major="${subject.major}"
      data-name="${subject.name.toLowerCase()}"
    >
      <div class="subject-card-top">
        <span class="major-tag major-tag-${subject.major}">${MAJORS[subject.major]?.label || subject.major}</span>
        <span class="subject-year-mini">سنة ${subject.year}</span>
      </div>
      <h3>${subject.name}</h3>
      <span class="btn btn-secondary btn-small">افتح المادة</span>
    </a>
  `;
}

async function renderAbout() {
  const team = [
    {
      role: "رئاسة",
      members: [
        { name: "فتحي", title: "ريس", image: "/assets/tech-titans/fathe.jpg" },
        { name: "رند", title: "ريسة", image: "/assets/tech-titans/rand.jpg" },
      ]
    },
    {
      role: "الإدارة",
      members: [
        { name: "أوس", title: "مسؤول الموارد البشرية", image: "/assets/tech-titans/aws_hr.jpg" },
        { name: "جود", title: "مسؤولة الموارد البشرية", image: "/assets/tech-titans/jood_hr.jpg" },
        { name: "بتول", title: "قائدة أكاديمية", image: "/assets/tech-titans/batool_academic.jpg" },
        { name: "معتصم", title: "قائد تقني", image: "/assets/tech-titans/mutasem_tech.jpg" },
        { name: "علي", title: "قائد الأنشطة", image: "/assets/tech-titans/ali_activities.jpg" },
        { name: "دانية", title: "قائدة الإعلام", image: "/assets/tech-titans/dania_media.jpg" },
        { name: "علا", title: "قائدة فريق الـ Core", image: "/assets/tech-titans/ola_core.jpg" },
        { name: "ميسم", title: "قائدة منصة إنستغرام", image: "/assets/tech-titans/maisam_instagram.png" },
      ]
    }
  ];

  return layout(
    `
      <section class="about-hero reveal">
        <article class="about-panel about-panel-wide">
          <span class="eyebrow">من نحن</span>
          <h2>CNE Family مساحة أكاديمية لخدمة الطلبة.</h2>
          <p>
            تأسست CNE Family لتكون المرجع الأول لطلبة هندسة الحاسوب والشبكات في جامعة البلقاء التطبيقية. 
            نحن فريق من الطلبة نهدف إلى تبسيط الرحلة الجامعية من خلال توفير المحتوى الأكاديمي المنظم والأدوات التقنية المساعدة.
          </p>
        </article>
      </section>

      <section class="team-structure reveal">
        <div class="team-head">
          <span class="eyebrow">الهيكل التنظيمي</span>
          <h2>الإدارة والقيادة</h2>
          <p>نخبة من الطلبة المتطوعين لخدمة زملائهم وتطوير المنصة.</p>
        </div>
        
        <div class="org-chart">
          ${team.map(group => `
            <div class="org-group">
              <h3 class="org-role-title">${group.role}</h3>
              <div class="org-members">
                ${group.members.map(member => `
                  <div class="org-member-card">
                    <div class="member-avatar">
                      <img src="${member.image}" alt="${member.name}" onerror="this.src='/assets/logos/cne-icon.png'">
                    </div>
                    <div class="member-info">
                      <strong>${member.name}</strong>
                      <span>${member.title}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="about-scene reveal">
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
        copy: "صفحة مباشرة تشرح الفكرة وتستعرض الفريق القائم عليها.",
      },
    },
  );
}

function renderPlans() {
  return layout(
    `
      ${renderPlansStage()}
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

function renderPlansStage() {
  return `
    <section class="plans-stage reveal" aria-label="الخطط الشجرية">
      ${Object.entries(MAJORS)
        .filter(([key]) => key !== "common")
        .map(([key, major]) => {
          return `
            <article class="plan-showcase tone-${major.tone}">
              <div class="plan-showcase-copy">
                <span class="eyebrow eyebrow-ghost">${major.label}</span>
                <h2>${major.accent}</h2>
                <p>اضغط على اسم المادة داخل الخطة لفتح ملفاتها مباشرة.</p>
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

const PLAN_IMAGE_SIZE = { width: 1530, height: 1082 };

const COMMON_PLAN_HOTSPOTS = [
  ["إنجليزي تطبيقي 1", 1403, 75, 110, 74],
  ["إنجليزي تطبيقي 2", 1403, 208, 110, 74],
  ["الكتابة التقنية والأخلاقيات المهنية", 1403, 417, 110, 74],
  ["الاقتصاد الهندسي", 1403, 522, 110, 74],
  ["تدريب ميداني", 1403, 649, 110, 74],
  ["اللغة العربية التطبيقية", 1266, 208, 110, 74],
  ["التربية الوطنية", 1266, 313, 110, 74],
  ["الريادة والابتكار", 1266, 418, 110, 74],
  ["العلوم العسكرية", 1266, 523, 110, 74],
  ["مشروع تخرج 1", 1128, 625, 110, 74],
  ["مشروع تخرج 2", 1128, 735, 110, 74],
  ["إحصاء واحتمالات للهندسة", 1128, 75, 110, 74],
  ["الذكاء الاصطناعي وتعلم الآلة", 1186, 185, 52, 74],
  ["مختبر الذكاء الاصطناعي وتعلم الآلة", 1128, 185, 52, 74],
  ["الجبر الخطي", 1128, 295, 110, 74],
  ["إتصالات وتراسل بيانات", 1128, 405, 110, 74],
  ["أساسيات شبكات الحاسوب", 1128, 515, 110, 74],
  ["بروتوكولات الشبكات", 1128, 625, 110, 74],
  ["أساسيات الأمن السيبراني", 991, 735, 110, 74],
  ["تفاضل وتكامل 1", 991, 75, 110, 74],
  ["تفاضل وتكامل 2", 991, 185, 110, 74],
  ["تقنيات عددية", 991, 295, 110, 74],
  ["أنظمة وإشارات", 991, 405, 110, 74],
  ["أنظمة التحكم", 991, 515, 110, 74],
  ["مختبر أنظمة التحكم", 991, 625, 110, 74],
  ["مختبر شبكات الحاسوب", 853, 735, 110, 74],
  ["الفيزياء العامة 1", 853, 75, 110, 74],
  ["الفيزياء العامة 2", 853, 185, 110, 74],
  ["المعادلات التفاضلية العادية", 853, 295, 110, 74],
  ["إلكترونيات 1", 853, 405, 110, 74],
  ["إلكترونيات رقمية", 853, 515, 110, 74],
  ["مختبر إلكترونيات 1", 853, 625, 110, 74],
  ["المشغل الهندسي", 716, 75, 110, 74],
  ["مختبر الفيزياء العامة", 716, 185, 110, 74],
  ["دوائر كهربائية 1", 716, 295, 110, 74],
  ["دوائر كهربائية 2", 716, 405, 110, 74],
  ["الآلات كهربائية", 716, 515, 110, 74],
  ["مختبر دوائر كهربائية", 716, 625, 110, 74],
  ["الرسم الهندسي", 578, 75, 110, 74],
  ["البرمجة بلغة الكينونة", 578, 185, 110, 74],
  ["تراكيب البيانات والخوارزميات", 636, 295, 52, 74],
  ["مختبر تراكيب البيانات والخوارزميات", 578, 295, 52, 74],
  ["أنظمة قواعد البيانات", 636, 405, 52, 74],
  ["مختبر أنظمة قواعد البيانات", 578, 405, 52, 74],
  ["نظم التشغيل", 578, 515, 110, 74],
  ["برمجة متقدمة", 578, 625, 110, 74],
  ["مهارات الحاسوب", 441, 75, 110, 74],
  ["البرمجة للمهندسين", 441, 185, 110, 74],
  ["تصميم المنطق الرقمي", 499, 295, 52, 74],
  ["مختبر تصميم المنطق الرقمي", 441, 295, 52, 74],
  ["أنظمة المعالجات الدقيقة", 499, 405, 52, 74],
  ["مختبر أنظمة المعالجات الدقيقة", 441, 405, 52, 74],
  ["معمارية الحاسوب وتنظيمه", 499, 515, 52, 74],
  ["مختبر معمارية الحاسوب وتنظيمه", 441, 515, 52, 74],
  ["معمارية الحواسيب المتقدمة", 441, 625, 110, 74],
  ["الكيمياء العامة 1", 303, 75, 110, 74],
  ["مختبر الكيمياء العامة", 166, 185, 110, 74],
  ["الأنظمة المضمنة", 361, 515, 52, 74],
  ["مختبر الأنظمة المضمنة", 303, 515, 52, 74],
  ["مختبر أنظمة المعالجات المتوازية", 166, 625, 110, 74],
];

const COMPUTER_PLAN_HOTSPOTS = [
  ["موضوعات خاصة", 28, 75, 110, 74],
  ["المنطق المشوش", 28, 185, 110, 74],
  ["تصميم رقمي متقدم", 28, 295, 110, 74],
  ["تقييم أداء الحاسوب", 28, 405, 110, 74],
  ["الحوسبة السحابية", 28, 515, 110, 74],
  ["إنترنت الأشياء", 28, 625, 110, 74],
  ["معالجة الصور الرقمية", 28, 735, 110, 74],
];

const NETWORK_PLAN_HOTSPOTS = [
  ["النمذجة والمحاكاة", 28, 75, 110, 74],
  ["الشبكات اللاسلكية", 28, 515, 110, 74],
  ["مختبر أمن الشبكات والإنترنت", 578, 735, 110, 74],
  ["تشفير وأمن أنظمة الشبكات", 716, 735, 110, 74],
  ["برمجة الشبكات", 991, 735, 110, 74],
];

const PLAN_HOTSPOTS = {
  computer: [...COMMON_PLAN_HOTSPOTS, ...COMPUTER_PLAN_HOTSPOTS],
  network: [...COMMON_PLAN_HOTSPOTS, ...NETWORK_PLAN_HOTSPOTS],
};

const SUBJECT_NAME_MAP = {
  "مختبر الذكاء الاصطناعي وتعلم الآلة": "الذكاء الاصطناعي وتعلم الآلة",
  "الآلات كهربائية": "آلات كهربائية",
};

function renderClickablePlanImage(majorKey, major) {
  const subjectsByName = new Map(state.subjects.map((subject) => [subject.name, subject]));
  const hotspots = (PLAN_HOTSPOTS[majorKey] || [])
    .map(([name, x, y, width, height]) => {
      const mappedName = SUBJECT_NAME_MAP[name] || name;
      return { subject: subjectsByName.get(mappedName), x, y, width, height };
    })
    .filter(({ subject }) => subject?.link && subject.link !== "#");
  return `
    <div class="plan-image-map" aria-label="خطة ${major.label} - اضغط على اسم المادة لفتح ملفاتها">
      <div class="plan-viewport">
        <img src="${major.image}" alt="${major.label}" class="plan-showcase-image" />
        ${hotspots.map(renderPlanHotspot).join("")}
      </div>
    </div>
  `;
}

function renderPlanHotspot({ subject, x, y, width, height }) {
  const left = (x / PLAN_IMAGE_SIZE.width) * 100;
  const top = (y / PLAN_IMAGE_SIZE.height) * 100;
  const boxWidth = (width / PLAN_IMAGE_SIZE.width) * 100;
  const boxHeight = (height / PLAN_IMAGE_SIZE.height) * 100;

  return `
    <a
      href="${subject.link}"
      target="_blank"
      rel="noopener"
      class="plan-hotspot"
      style="left:${left.toFixed(3)}%;top:${top.toFixed(3)}%;width:${boxWidth.toFixed(3)}%;height:${boxHeight.toFixed(3)}%;"
      aria-label="افتح ملفات ${subject.name}"
      title="${subject.name}"
    ></a>
  `;
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
      ${renderTitanImage(titan, "titan-featured-image")}
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
      ${renderTitanImage(titan, "titan-list-image")}
      <div class="titan-list-copy">
        <strong>${titan.name}</strong>
        <p>${titan.title}</p>
        <span class="titan-list-streak">${titan.streak}</span>
      </div>
      <div class="titan-list-meta">
        <div class="titan-list-rank tone-${titan.tone}">
          <span>#${rank}</span>
          <small>${titan.badge}</small>
        </div>
        <strong class="titan-list-score-num">${titan.score}</strong>
      </div>
    </article>
  `;
}

function renderTitanImage(titan, className) {
  const src = titan?.image || "/assets/logos/cne-icon.png";
  return `<img src="${src}" alt="${titan?.name || "Tech Titan"}" class="${className}" loading="lazy" />`;
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

async function renderMap() {
  return layout(
    `
      <section class="campus-location reveal">
        <div class="campus-head">
          <span class="eyebrow">المقر الرئيسي</span>
          <h2>كلية الهندسة التكنولوجية</h2>
          <p>جامعة البلقاء التطبيقية - عمان، الأردن.</p>
        </div>
        <div class="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.644444444444!2d35.98888888888889!3d31.96666666666666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151b600000000001%3A0x0!2zMzHCsDU4JzAwLjAiTiAzNcKwNTknMjAuMCJF!5e0!3m2!1sar!2sjo!4v1716390000000!5m2!1sar!2sjo" 
            width="100%" 
            height="550" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </section>
    `,
    {
      heroBanner: {
        label: "خريطة الكلية",
        title: "موقع كلية الهندسة التكنولوجية",
        copy: "تصفح الخريطة التفاعلية للوصول إلى الكلية بسهولة.",
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
        <a href="/about" data-link>عن المنصة</a>
        <a href="/subjects" data-link>المواد</a>
        <a href="/map" data-link>الخريطة</a>
        <a href="/tracker" data-link>المتتبع</a>
      </div>
      <div class="footer-social">
        <a href="https://www.instagram.com/direct/t/17845518497752784/?__pwa=1" target="_blank" rel="noopener" class="social-link social-chat">
          <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 3 3.8 10.1c-.9.4-.9 1.7.1 2l6.2 1.9 1.9 6.2c.3 1 1.6 1 2 .1L21 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="m10.2 13.8 4.4-4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>Contact us</span>
        </a>
        <a href="https://www.instagram.com/cne.fet" target="_blank" rel="noopener" class="social-link social-instagram">
          <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2" />
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
            <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
          </svg>
          <span>CNE.FET</span>
        </a>
        <a href="https://www.facebook.com/cne.fet" target="_blank" rel="noopener" class="social-link social-facebook">
          <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M14.2 8.2V6.7c0-.7.2-1.1 1.2-1.1h1.7V2.7c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.2H7.3v3.3h2.9v10h3.6v-10h2.9l.5-3.3h-3Z" />
          </svg>
          <span>CNE.FET</span>
        </a>
        <a href="https://www.youtube.com/@CNEteamCNE_FAMILY" target="_blank" rel="noopener" class="social-link social-youtube">
          <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 8.9 2 12 2 12s0 3.1.4 4.9A3 3 0 0 0 4.5 19c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.8.4-4.9.4-4.9s0-3.1-.4-4.9ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
          </svg>
          <span>CNE Family</span>
        </a>
      </div>
    </footer>
  `;
}

function initLightbox() {
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

  // Year jump buttons
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

  // Highlight active year chip on scroll
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

function initTrackerControls() {
  document.querySelectorAll("[data-major-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      state.major = button.dataset.majorSwitch;
      localStorage.setItem("study_major", state.major);

      // Update active button
      document.querySelectorAll("[data-major-switch]").forEach((btn) =>
        btn.classList.toggle("is-current", btn === button)
      );

      // Re-render courses list in-place — no scroll jump
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
        // Re-bind new checkboxes
        bindNewCheckboxes();
      }

      updateTrackerStats(completed);
    });
  });

  document.querySelectorAll("[data-course-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const completed = new Set(getCompletedCourses());
      const id = checkbox.dataset.courseToggle;
      if (checkbox.checked) completed.add(id);
      else completed.delete(id);
      localStorage.setItem("completed_courses", JSON.stringify([...completed]));

      // Update card class in-place — no scroll jump
      const article = checkbox.closest(".tracker-course");
      if (article) article.classList.toggle("is-done", checkbox.checked);

      updateTrackerStats(completed);
    });
  });
}

function bindNewCheckboxes() {
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

function updateTrackerStats(completed) {
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
