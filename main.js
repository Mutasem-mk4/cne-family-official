import { initWowEffects } from './wow-scripts.js';

// ── CONFIGURATION & LINKS ─────────────────────────────────────────
const DRIVE_LINKS = {
  main:    'https://drive.google.com/drive/folders/YOUR_MAIN_FOLDER_ID',
  computer:'https://drive.google.com/drive/folders/YOUR_COMPUTER_FOLDER_ID',
  network: 'https://drive.google.com/drive/folders/YOUR_NETWORK_FOLDER_ID',
  common:  'https://drive.google.com/drive/folders/YOUR_COMMON_FOLDER_ID',
};

const tagClasses = {
  'ورشة': 'tag-blue',
  'محاضرة': 'tag-green',
  'رحلة': 'tag-orange',
  'أخرى': 'tag-yellow'
};

// ── FORM HANDLER ───────────────────────────────────────────────
async function handleJoinSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const btnText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<span class="loader"></span> جاري الإرسال...';

  const formData = new FormData(form);
  
  try {
    const response = await fetch('https://formspree.io/f/xoqgkyyv', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.innerHTML = `
        <div class="reveal visible" style="text-align:center; padding: 2rem 0;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
          <h3 class="card-title">تم استلام طلبك بنجاح!</h3>
          <p class="card-desc">شكراً لاهتمامك بالانضمام لعائلة CNE. سنتواصل معك عبر البريد الإلكتروني أو رقم الهاتف قريباً.</p>
          <button class="btn btn-outline" style="margin-top:1.5rem" onclick="location.reload()">إرسال طلب آخر</button>
        </div>
      `;
    } else {
      throw new Error('فشل الإرسال');
    }
  } catch (error) {
    alert('عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.');
    btn.disabled = false;
    btn.innerHTML = btnText;
  }
}

// ── DATA CACHE ───────────────────────────────────────────────────
const dataCache = {};

async function fetchData(key, path) {
  if (dataCache[key]) return dataCache[key];
  
  const stored = localStorage.getItem(`cache_${key}`);
  if (stored) {
    dataCache[key] = JSON.parse(stored);
    fetch(path).then(res => res.json()).then(newData => {
      const actualData = newData[key] || newData;
      localStorage.setItem(`cache_${key}`, JSON.stringify(actualData));
    }).catch(() => {});
    return dataCache[key];
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    const json = await res.json();
    dataCache[key] = json[key] || json;
    localStorage.setItem(`cache_${key}`, JSON.stringify(dataCache[key]));
  } catch {
    dataCache[key] = [];
  }
  return dataCache[key];
}

const routes = {
  '/':           renderHome,
  '/subjects':   renderSubjects,
  '/plans':      renderPlans,
  '/activities': renderActivities,
  '/calculator': renderCalculator,
  '/tracker':    renderTracker,
  '/links':      renderLinks,
  '/join':       renderJoin
};

function navigate(path) {
  window.history.pushState({}, '', path);
  render(path);
}

async function render(path) {
  const page = document.getElementById('page');
  const fn = routes[path] || renderHome;
  const html = await fn();
  page.innerHTML = html;
  
  // Page Transition Effect
  page.classList.remove('page-enter');
  void page.offsetWidth;
  page.classList.add('page-enter');
  
  updateActiveLink(path);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    initReveal();
    initCounters();
    if (path === '/') initBentoSpotlight();
    if (path === '/plans') initLightbox();
    initWowEffects();
  }, 100);
}

function updateActiveLink(path) {
  document.querySelectorAll('[data-link]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

window.addEventListener('popstate', () => render(window.location.pathname));

document.addEventListener('click', e => {
  const link = e.target.closest('[data-link]');
  // Also close mobile menu if a link is clicked
  if (link && document.querySelector('.nav-links').classList.contains('offcanvas-active')) {
    document.querySelector('.nav-links').classList.remove('offcanvas-active');
  }
  
  if (!link) return;
  e.preventDefault();
  navigate(link.getAttribute('href'));
});

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('offcanvas-active');
  });
}

// ── THEME & NAV ──────────────────────────────────────────────────
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const currentTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const updateLogo = (theme) => {
    const logo = document.getElementById('logo-img');
    if (logo) {
      logo.src = '/assets/logos/cne-icon.png';
    }
  };
  updateLogo(currentTheme);
  
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateLogo(next);
    });
  }
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── COUNTERS ──────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Lower threshold for more reliable trigger on all devices

  counters.forEach(el => observer.observe(el));
}

// ── LIGHTBOX ─────────────────────────────────────────────────────
function initLightbox() {
  document.querySelectorAll('.plan-card img').forEach(img => {
    img.addEventListener('click', () => showLightbox(img.src));
  });
}

function showLightbox(src) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-content">
      <img src="${src}" loading="lazy" class="lightbox-img">
      <button class="lightbox-close">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = '1', 10);
  overlay.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  };
}

// ── RENDER HOME ──────────────────────────────────────────────────
async function renderHome() {
  const subjects = await fetchData('subjects', '/data/subjects.json');
  const curriculum = await fetchData('curriculum', '/data/curriculum.json');
  const activities = await fetchData('activities', '/data/activities.json');
  const studentMajor = localStorage.getItem('study_major');
  const progress = JSON.parse(localStorage.getItem('study_progress') || '[]');

  const totalSubjects = curriculum.length;
  const recentActivities = activities.slice(0, 3);

  let dashboardHtml = '';
  if (studentMajor && studentMajor !== 'all') {
    const majorSubjects = curriculum.filter(s => s.major === 'common' || s.major === studentMajor);
    const totalCredits = 162;
    const completedCredits = majorSubjects.filter(s => progress.includes(s.id)).reduce((acc, s) => acc + s.credits, 0);
    const percent = Math.min(Math.round((completedCredits / totalCredits) * 100), 100);

    dashboardHtml = `
      <div class="container reveal">
        <div class="home-dashboard">
          <div class="dashboard-info">
            <span class="dashboard-label">أهلاً بك مجدداً • تخصصك: ${studentMajor === 'computer' ? 'هندسة حاسوب' : 'هندسة شبكات'}</span>
            <h2 class="dashboard-title">أنت أنجزت ${percent}% من رحلتك الأكاديمية</h2>
          </div>
          <div class="dashboard-progress">
             <div class="progress-ring">
               <svg viewBox="0 0 36 36" class="circular-chart">
                 <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 <path class="circle" stroke-dasharray="${percent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
               <div class="percentage">${percent}%</div>
             </div>
             <a href="/tracker" class="btn btn-primary" data-link>المتتبع الكامل ←</a>
          </div>
        </div>
      </div>
    `;
  }

  setTimeout(() => initGlobalSearch(subjects, activities), 0);

  return `
    <section class="hero main-hero">
      <div class="hero-illustration">
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" />
          <path d="M 0 500 Q 250 250 500 500 T 1000 500" fill="none" stroke="currentColor" stroke-width="1" opacity="0.1" />
        </svg>
      </div>
      <div class="hero-badge reveal">
        <span></span> هندسة الحاسوب والشبكات · جامعة البلقاء التطبيقية
      </div>
      <h1 class="reveal">بيتك الأكاديمي في عالم <span class="highlight">الهندسة التقنية</span></h1>
      <p class="reveal">المصدر الأول والأذكى لكل ما يحتاجه طالب الـ CNE في مسيرته الجامعية.</p>
      <div class="home-search-container reveal">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="global-search" placeholder="ابحث عن مادة، فعالية، أو مصدر تعليمي..." autocomplete="off">
          <div id="search-results" class="search-results-dropdown" style="display:none"></div>
        </div>
      </div>
      <div class="hero-actions reveal">
        <a href="/subjects" class="btn btn-primary" data-link>استكشف المواد</a>
        <a href="/tracker" class="btn btn-outline" data-link>متتبع الخطة</a>
      </div>
    </section>

    <div class="container" style="margin-top:-2rem;position:relative;z-index:2; margin-bottom: 3rem">
      <div class="stats-bar reveal row g-0">
        <div class="stat-item col-12 col-md-4">
          <span class="stat-number" data-count="999" data-suffix="+">0+</span>
          <span class="stat-label">طالب مستفيد</span>
        </div>
        <div class="stat-item col-12 col-md-4">
          <span class="stat-number" data-count="13" data-suffix="+">0+</span>
          <span class="stat-label">فعالية منظمة سنويا</span>
        </div>
        <div class="stat-item col-12 col-md-4">
          <span class="stat-number" data-count="15" data-suffix="+">0+</span>
          <span class="stat-label">سنة من الخبرة</span>
        </div>
      </div>
    </div>

    ${dashboardHtml}

    <section class="section">
      <div class="section-label reveal">الأدوات الأكاديمية</div>
      <h2 class="section-title reveal">أدوات ذكية لطلاب أذكياء</h2>
      <div class="bento-grid row g-3 g-md-4">
        <a href="/subjects" class="bento-card col-12 col-md-8 accent-blue reveal" data-link>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div class="card-content">
            <h3>المواد الدراسية</h3>
            <p>أكبر مكتبة منظمة من الملخصات، أسئلة السنوات، والمصادر لجميع المواد الدراسية.</p>
            <div class="card-footer-link">تصفح المصادر ←</div>
          </div>
        </a>
        <a href="/tracker" class="bento-card col-12 col-md-4 accent-red reveal" data-link>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          </div>
          <div class="card-content">
            <h3>متتبع الساعات</h3>
            <p>نظام ذكي لمتابعة تخرجك وفلترة المواد.</p>
            <div class="card-footer-link">ابدأ التتبع ←</div>
          </div>
        </a>
        <a href="/calculator" class="bento-card col-12 col-md-4 accent-green reveal" data-link>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="8" y1="10" x2="8" y2="10"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>
          </div>
          <div class="card-content">
            <h3>حاسبة المعدل</h3>
            <p>حساب دقيق لمعدلك التراكمي والفصلي.</p>
            <div class="card-footer-link">احسب الآن ←</div>
          </div>
        </a>
        <a href="/activities" class="bento-card col-12 col-md-8 accent-orange reveal" data-link>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-3"></path></svg>
          </div>
          <div class="card-content">
            <h3>الأنشطة والفعاليات</h3>
            <p>ورش تقنية، رحلات، ومحاضرات تبني شخصيتك المهنية.</p>
            <div class="card-footer-link">تصفح الأنشطة ←</div>
          </div>
        </a>
        <a href="/links" class="bento-card col-12 col-md-4 reveal" data-link style="background:rgba(247,201,72,0.05);border-color:rgba(247,201,72,0.2)">
          <div class="card-icon" style="color:var(--yellow);border-color:rgba(247,201,72,0.3)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </div>
          <div class="card-content">
            <h3>الروابط الهامة</h3>
            <p>وصول سريع لمنصات الجامعة وجريدة المواد.</p>
            <div class="card-footer-link" style="color:var(--yellow)">كل الروابط ←</div>
          </div>
        </a>
      </div>
    </section>

    <section class="section">
      <div class="section-label reveal">آخر الأحدث</div>
      <h2 class="section-title reveal">ماذا حدث مؤخراً في عائلتنا؟</h2>
      <div class="activity-row reveal">
        ${recentActivities.map(a => `
          <div class="activity-mini-card">
             <div class="mini-icon" style="background:${a.bg_gradient || 'var(--blue-gradient)'}">${a.emoji || '🚀'}</div>
             <div class="mini-body">
               <h4>${a.title}</h4>
               <span>${a.date}</span>
             </div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:2rem">
        <a href="/activities" class="btn btn-outline btn-sm" data-link>مشاهدة كل الفعاليات</a>
      </div>
    </section>
    ${renderFooter()}
  `;
}

// ── RENDER SUBJECTS ──────────────────────────────────────────────
async function renderSubjects() {
  const allSubjects = await fetchData('subjects', '/data/subjects.json');

  setTimeout(() => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bar = btn.closest('.tab-bar');
        bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(c => {
          c.style.display = c.dataset.content === target ? 'grid' : 'none';
        });
      });
    });
    initSearch('subjectSearch', '.subject-card');
  }, 0);

  const majorLabel = { computer: 'حاسوب', network: 'شبكات', common: 'مشترك' };
  const majorClass  = { computer: 'tag-blue', network: 'tag-green', common: 'tag-yellow' };

  function renderByYear(y) {
    const list = allSubjects.filter(s => s.year === y);
    if (!list.length) return `<div style="text-align:center;padding:3rem;color:var(--text-muted)">لا توجد مواد بعد</div>`;
    return list.map(s => `
      <a href="${s.link || '#'}" target="_blank" rel="noopener" class="subject-card">
        <div class="subject-card-left">
          <span class="card-tag ${majorClass[s.major] || 'tag-blue'}" style="margin:0;flex-shrink:0">${majorLabel[s.major] || s.major}</span>
          <span class="subject-name">${s.name}</span>
        </div>
        <svg class="subject-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </a>`).join('');
  }

  const years = [1, 2, 3, 4, 5];

  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        المواد الدراسية
      </div>
      <h1 class="section-title reveal">المواد الدراسية</h1>
      <p class="section-subtitle reveal">اختر سنتك الدراسية للوصول إلى الملخصات والنماذج.</p>
    </div>

    <div class="container reveal">
      <div class="tab-bar reveal" style="margin-bottom:2rem; justify-content:center">
        ${years.map(y => `<button class="tab-btn ${y === 1 ? 'active' : ''}" data-tab="${y}">السنة ${y}</button>`).join('')}
      </div>
      
      <div class="search-filter-row reveal" style="margin-bottom:2rem">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="subjectSearch" placeholder="ابحث عن مادة...">
        </div>
      </div>

      ${years.map(y => `
        <div class="subject-grid tab-content" data-content="${y}" style="display:${y === 1 ? 'grid' : 'none'}">
          ${renderByYear(y)}
        </div>
      `).join('')}
    </div>
    ${renderFooter()}
  `;
}

// ── RENDER PLANS ─────────────────────────────────────────────────
function renderPlans() {
  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الخطط الشجرية
      </div>
      <h1 class="section-title reveal">الخطط الشجرية</h1>
      <p class="section-subtitle reveal">دليل المسار الدراسي والتبعية للمواد.</p>
    </div>

    <div class="container" style="padding-bottom:4rem">
      <div class="plans-grid row g-4">
        <div class="plan-card reveal col-12 col-md-6">
          <div class="plan-icon" style="background:rgba(53,116,200,.1)">💻</div>
          <h3>هندسة الحاسوب</h3>
          <p>الخطة الدراسية الكاملة مع المتطلبات السابقة.</p>
          <a href="/computer-plan.jpg" target="_blank" class="btn btn-primary" style="width:100%; justify-content:center">عرض الخطة</a>
        </div>
        <div class="plan-card reveal col-12 col-md-6">
          <div class="plan-icon" style="background:rgba(76,175,80,.1)">🌐</div>
          <h3>هندسة الشبكات</h3>
          <p>خطة تخصص الشبكات والمسار الأكاديمي.</p>
          <a href="/networking-plan.jpg" target="_blank" class="btn btn-outline" style="width:100%; justify-content:center; border-color:var(--green); color:var(--green); --btn-bg-hover:rgba(76,175,80,0.1)">عرض الخطة</a>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ── RENDER ACTIVITIES ────────────────────────────────────────────
async function renderActivities() {
  const activities = await fetchData('activities', '/data/activities.json');
  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الأنشطة والفعاليات
      </div>
      <h1 class="section-title reveal">الأنشطة والفعاليات</h1>
      <p class="section-subtitle reveal">مجتمع CNE النابض بالحياة.</p>
    </div>

    <div class="container" style="padding-bottom:4rem">
      <div class="activity-grid row g-4">
        ${activities.map(a => `
          <div class="activity-card reveal col-12 col-md-6 col-lg-4">
            <div class="activity-img" style="background:${a.bg_gradient || 'linear-gradient(135deg,#f3f4f6,#e5e7eb)'}">
              ${a.image ? `<img src="${a.image}" alt="${a.title}">` : `<span>${a.emoji || '🚀'}</span>`}
            </div>
            <div class="activity-body">
              <div class="activity-meta">
                <span class="card-tag ${tagClasses[a.tag] || 'tag-blue'}">${a.tag}</span>
                <span class="activity-date">${a.date}</span>
              </div>
              <h3 class="activity-title">${a.title}</h3>
              <p class="activity-desc">${a.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ── RENDER GPA CALCULATOR ────────────────────────────────────────
function renderCalculator() {
  window.addSubjectRow = () => {
    const container = document.getElementById('subjects-container');
    const row = document.createElement('div');
    row.className = 'calc-row';
    row.innerHTML = `
      <input type="text" class="form-input" placeholder="اسم المادة">
      <input type="number" class="form-input credit-hours" value="3" min="1" max="6">
      <select class="form-input grade-select">
        <option value="4.0">A (4.0)</option>
        <option value="3.75">A- (3.75)</option>
        <option value="3.5">B+ (3.50)</option>
        <option value="3.0">B (3.00)</option>
        <option value="2.5">C+ (2.50)</option>
        <option value="2.0">C (2.00)</option>
        <option value="1.0">D (1.00)</option>
        <option value="0.0">F (0.00)</option>
      </select>
      <button onclick="this.parentElement.remove(); window.calculateGPA();" style="background:none; border:none; color:var(--red); cursor:pointer; padding:5px; font-size:1.5rem">&times;</button>
    `;
    container.appendChild(row);
    window.calculateGPA();
  };

  window.calculateGPA = () => {
    const hours = document.querySelectorAll('.credit-hours');
    const grades = document.querySelectorAll('.grade-select');
    let totalPoints = 0, totalHours = 0;
    hours.forEach((h, i) => {
      const hr = parseFloat(h.value) || 0;
      const gr = parseFloat(grades[i].value) || 0;
      totalPoints += hr * gr;
      totalHours += hr;
    });
    const result = totalHours > 0 ? (totalPoints / totalHours).toFixed(2) : '0.00';
    document.getElementById('gpa-result').textContent = result;
  };

  setTimeout(() => { for(let i=0;i<4;i++) window.addSubjectRow(); }, 0);

  return `
    <div class="page-header">
      <h1 class="section-title reveal">حاسبة المعدل</h1>
      <p class="section-subtitle reveal">احسب معدلك الفصلي بنظام الـ 4.0.</p>
    </div>
    <div class="container" style="padding-bottom:5rem">
      <div class="reveal">
        <div class="gpa-display">
          <div style="font-size:3.5rem; font-weight:800; color:var(--blue)" id="gpa-result">0.00</div>
          <div style="color:var(--text-secondary); font-weight:600">المعدل الفصلي الحالي</div>
        </div>
        <div id="subjects-container" style="display:flex; flex-direction:column; gap:10px"></div>
        <div style="margin-top:2rem; display:flex; gap:10px">
          <button class="btn btn-outline" onclick="window.addSubjectRow()">إضافة مادة</button>
          <button class="btn btn-primary" onclick="window.calculateGPA()">تحديث</button>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ── RENDER TRACKER ──────────────────────────────────────────────
async function renderTracker() {
  const subjects = await fetchData('curriculum', '/data/curriculum.json');
  const progress = JSON.parse(localStorage.getItem('study_progress') || '[]');
  const major = localStorage.getItem('study_major');

  if (!major) return renderMajorSelection();

  window.toggleSubject = (id) => {
    const idx = progress.indexOf(id);
    if (idx > -1) progress.splice(idx, 1); else progress.push(id);
    localStorage.setItem('study_progress', JSON.stringify(progress));
    navigate('/tracker');
  };

  window.resetMajor = () => {
    localStorage.removeItem('study_major');
    navigate('/tracker');
  };

  const filtered = subjects.filter(s => s.major === 'common' || s.major === major);
  const totalCredits = 162;
  const completedCredits = filtered.filter(s => progress.includes(s.id)).reduce((a, b) => a + b.credits, 0);
  const percent = Math.min(Math.round((completedCredits / totalCredits) * 100), 100);

  return `
    <div class="page-header">
      <h1 class="section-title reveal">متتبع الـ 162 ساعة</h1>
      <p class="section-subtitle reveal">تتبع تقدمك في خطة ${major === 'computer' ? 'هندسة الحاسوب' : 'هندسة الشبكات'}.</p>
      <div style="margin-top:1.5rem; max-width: 600px; margin-left: auto; margin-right: auto">
        <div style="background:var(--surface-2); height:12px; border-radius:6px; overflow:hidden; border:1px solid var(--border)">
          <div style="width:${percent}%; height:100%; background:var(--blue-gradient); transition:width 0.5s var(--ease-spring)"></div>
        </div>
        <div style="margin-top:10px; text-align:center; font-weight:700; color:var(--text-primary)">🚀 إنجازك: ${percent}% (${completedCredits}/162 ساعة)</div>
      </div>
      <a href="javascript:void(0)" onclick="resetMajor()" style="display:block; margin-top:1rem; font-size:0.8rem; color:var(--text-muted)">← تغيير التخصص</a>
    </div>

    <div class="container" style="padding-bottom:5rem">
      <div class="tracker-years">
        ${[1,2,3,4,5].map(y => {
          const yearSubs = filtered.filter(s => s.year === y);
          if (!yearSubs.length) return '';
          return `
            <div class="tracker-year reveal">
              <h3 style="margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:5px">السنة ${y}</h3>
              <div class="row g-3">
                ${yearSubs.map(s => `
                  <div class="tracker-item col-12 col-md-6 col-lg-4 ${progress.includes(s.id) ? 'completed' : ''}">
                    <input type="checkbox" ${progress.includes(s.id) ? 'checked' : ''} onchange="toggleSubject('${s.id}')" style="width:20px; height:20px; accent-color:var(--blue)">
                    <span style="flex:1">${s.name}</span>
                    <span style="font-size:0.85rem; font-weight:600; opacity:0.8">${s.credits} س</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    ${renderFooter()}
  `;
}

function renderMajorSelection() {
  window.setMajor = (m) => { localStorage.setItem('study_major', m); navigate('/tracker'); };
  return `
    <div class="page-header" style="text-align:center">
      <h1 class="section-title reveal">اختر تخصصك</h1>
    </div>
    <div class="container row g-4 justify-content-center" style="margin:0 auto; padding-bottom:10rem">
      <div class="selection-card reveal col-12 col-md-5" onclick="setMajor('computer')">
        <div style="font-size:3.5rem; margin-bottom:1.5rem">💻</div>
        <h3 style="font-size:1.5rem">هندسة الحاسوب</h3>
        <p style="color:var(--text-secondary); margin-top:0.5rem">Computer Engineering</p>
      </div>
      <div class="selection-card reveal col-12 col-md-5" onclick="setMajor('network')">
        <div style="font-size:3.5rem; margin-bottom:1.5rem">🌐</div>
        <h3 style="font-size:1.5rem">هندسة الشبكات</h3>
        <p style="color:var(--text-secondary); margin-top:0.5rem">Network Engineering</p>
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ── MISC RENDERS ────────────────────────────────────────────────
function renderJoin() {
  return `
    <div class="page-header">
      <h1 class="section-title reveal">انضم إلينا</h1>
      <p class="section-subtitle reveal">كن جزءاً من عائلة CNE Family.</p>
    </div>
    <div class="container" style="padding-bottom:5rem">
      <form class="form-card reveal" onsubmit="handleJoinSubmit(event)">
        <div class="form-group" style="margin-bottom:1.5rem">
          <label style="display:block; margin-bottom:0.5rem; font-weight:600">الاسم الكامل</label>
          <input class="form-input" name="name" placeholder="أدخل اسمك الثلاثي" required style="width:100%">
        </div>
        <div class="form-group" style="margin-bottom:2rem">
          <label style="display:block; margin-bottom:0.5rem; font-weight:600">الرقم الجامعي</label>
          <input class="form-input" name="id" placeholder="مثال: 32019..." required style="width:100%">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center">إرسال الطلب للانضمام</button>
      </form>
    </div>
    ${renderFooter()}
  `;
}

// ── RENDER LINKS ────────────────────────────────────────────────
function renderLinks() {
  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الروابط الهامة
      </div>
      <h1 class="section-title reveal">الروابط الهامة</h1>
      <p class="section-subtitle reveal">أهم الروابط لمنصات الجامعة لمساعدتك في مسيرتك الأكاديمية.</p>
    </div>

    <div class="container" style="padding-bottom:10rem">
      <div class="row g-4 justify-content-center" style="margin-top:2rem;">
        <a href="http://appserver.fet.edu.jo:7778/reg_new/index.jsp" target="_blank" class="plan-card reveal col-12 col-md-4" style="text-decoration:none">
          <div class="plan-icon" style="background:rgba(53,116,200,.1); border:1px solid rgba(53,116,200,.3)">🎓</div>
          <h3>البوابة الطلابية</h3>
          <p style="color:var(--text-secondary); margin-bottom:1rem;">تسجيل المواد، علاماتك، والجدول الدراسي.</p>
          <div class="btn btn-primary" style="width:100%; justify-content:center;">انتقال للبوابة</div>
        </a>
        <a href="https://s3.ebalqa.courses/fet/login/index.php" target="_blank" class="plan-card reveal col-12 col-md-4" style="text-decoration:none">
          <div class="plan-icon" style="background:rgba(76,175,80,.1); border:1px solid rgba(76,175,80,.3)">🖥️</div>
          <h3>التعلم الإلكتروني</h3>
          <p style="color:var(--text-secondary); margin-bottom:1rem;">منصة Moodle للواجبات والامتحانات.</p>
          <div class="btn btn-outline" style="width:100%; justify-content:center; border-color:var(--green); color:var(--green);">انتقال للمنصة</div>
        </a>
        <a href="http://appserver.fet.edu.jo:7778/courses/index.jsp" target="_blank" class="plan-card reveal col-12 col-md-4" style="text-decoration:none">
          <div class="plan-icon" style="background:rgba(242,111,33,.1); border:1px solid rgba(242,111,33,.3)">📄</div>
          <h3>جريدة المواد</h3>
          <p style="color:var(--text-secondary); margin-bottom:1rem;">البحث عن الشعب المطروحة وأوقات المحاضرات.</p>
          <div class="btn btn-outline" style="width:100%; justify-content:center; border-color:var(--orange); color:var(--orange);">انتقال للجريدة</div>
        </a>
      </div>
    </div>
    ${renderFooter()}
  `;
}

function renderFooter() {
  return `
    <footer>
      <div class="footer-inner row g-4">
        <div class="col-12 col-lg-5">
          <div class="footer-brand-name" style="display:flex; align-items:center; gap:12px; margin-bottom:1rem">
            <img src="/assets/logos/cne-icon.png" alt="CNE Logo" style="height:84px; border-radius:8px;">
          </div>
          <p class="footer-tagline">بيتك الأكاديمي منذ 2011.</p>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="footer-col-title">روابط أساسية</div>
          <div class="footer-links">
            <a href="/" data-link>الرئيسية</a>
            <a href="/subjects" data-link>المواد</a>
            <a href="/activities" data-link>الأنشطة</a>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="footer-col-title">تواصل معنا</div>
          <div class="footer-links">
            <a href="https://www.instagram.com/cne.fet" target="_blank">انستجرام</a>
            <a href="https://www.facebook.com/cne.fet" target="_blank">فيسبوك</a>
            <a href="https://www.youtube.com/@CNEteamCNE_FAMILY" target="_blank">يوتيوب</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">© 2026 CNE Family — جامعة البلقاء التطبيقية</div>
    </footer>
  `;
}

// ── UTILITIES & INIT ─────────────────────────────────────────────
function initSearch(inputId, cardsSelector) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(cardsSelector).forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

function initGlobalSearch(subjects, activities) {
  const input = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.style.display = 'none'; return; }
    const subMatches = subjects.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
    const actMatches = activities.filter(a => a.title.toLowerCase().includes(q)).slice(0, 3);
    if (!subMatches.length && !actMatches.length) {
      results.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">لا توجد نتائج...</div>';
    } else {
      results.innerHTML = subMatches.map(s => `<a href="/subjects" data-link class="search-result-item">📚 ${s.name}</a>`).join('') +
                          actMatches.map(a => `<a href="/activities" data-link class="search-result-item">🚀 ${a.title}</a>`).join('');
    }
    results.style.display = 'block';
  });
  document.addEventListener('click', e => { if(!input.contains(e.target)) results.style.display = 'none'; });
}

function initBentoSpotlight() {
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { 
    if (entry.isIntersecting) { 
      entry.target.classList.add('visible'); 
      observer.unobserve(entry.target); 
    } 
  });
}, { threshold: 0.05 }); // Lower threshold for more reliable trigger

function initReveal() { 
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
    // Safety fallback: if it's still hidden after 2 seconds, show it
    setTimeout(() => el.classList.add('visible'), 2000);
  }); 
}



// ── BOOTSTRAP ────────────────────────────────────────────────────
initTheme();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
render(window.location.pathname);

if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    fetchData('subjects', '/data/subjects.json');
    fetchData('curriculum', '/data/curriculum.json');
    fetchData('activities', '/data/activities.json');
  }, { timeout: 3000 });
}
