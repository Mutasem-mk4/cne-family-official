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
  const activities = await fetchData('activities', '/data/activities.json');
  const recentActivities = activities.slice(0, 3);

  setTimeout(() => initGlobalSearch(subjects, activities), 0);

  const tagColorMap = {
    'ورشة': { bg: 'var(--blue)', txt: 'white' },
    'محاضرة': { bg: '#006b1b', txt: '#d1ffc8' },
    'رحلة': { bg: 'var(--orange)', txt: 'white' },
    'مسابقة': { bg: '#8b5cf6', txt: 'white' },
    'أخرى': { bg: 'var(--grey)', txt: 'white' }
  };

  const activityCards = recentActivities.map(a => {
    const tag = tagColorMap[a.type] || tagColorMap['أخرى'];
    return `
      <div class="new-event-card">
        <div class="new-event-img" style="background: ${a.bg_gradient || 'linear-gradient(135deg,#3574C8,#1E40AF)'}">
          <span style="font-size:3rem">${a.emoji || '🚀'}</span>
          <div class="new-event-tag" style="background:${tag.bg};color:${tag.txt}">${a.type || 'فعالية'}</div>
        </div>
        <div class="new-event-body">
          <div class="new-event-date">
            <span class="material-symbols-outlined" style="font-size:1rem">calendar_today</span>
            ${a.date || ''}
          </div>
          <h3>${a.title}</h3>
          <p>${a.desc || a.description || ''}</p>
          <div class="new-event-footer">
            <a href="/activities" class="new-event-link" data-link>
              اعرف أكثر
              <span class="material-symbols-outlined" style="font-size:1rem">arrow_back</span>
            </a>
            <span class="new-event-location">${a.location || ''}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- NEW HERO -->
    <section class="new-hero reveal">
      <div class="new-hero-inner">
        <div class="new-hero-bg">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80" alt="University" loading="lazy">
          <div class="new-hero-overlay"></div>
        </div>
        <div class="new-hero-content">
          <span class="new-hero-eyebrow">المستقبل يبدأ هنا</span>
          <h1>منصة <span class="text-blue">CNE Family</span> المتكاملة لطلاب الهندسة</h1>
          <p>اكتشف الأدوات التعليمية، خطط الدراسة، والمجتمع الهندسي في مكان واحد.</p>
          <div class="new-hero-search">
            <div class="new-search-inner">
              <div class="new-search-icon-btn">
                <span class="material-symbols-outlined">search</span>
              </div>
              <input type="text" id="global-search" placeholder="ابحث عن الكورسات، الأدوات، أو الفعاليات..." autocomplete="off">
              <div id="search-results" class="search-results-dropdown" style="display:none"></div>
            </div>
          </div>
          <div class="new-hero-chips">
            <a href="/calculator" class="hero-chip" data-link>
              <span class="material-symbols-outlined">calculate</span>
              احسب المعدل GPA
            </a>
            <a href="/tracker" class="hero-chip hero-chip-red" data-link>
              <span class="material-symbols-outlined">timer</span>
              تتبع الساعات
            </a>
            <a href="/plans" class="hero-chip hero-chip-green" data-link>
              <span class="material-symbols-outlined">download</span>
              خطة الدراسة
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SMART TOOLS -->
    <section class="new-section">
      <div class="new-section-header reveal">
        <div>
          <h2>أدواتنا الذكية</h2>
          <p>كل ما تحتاجه لتسهيل حياتك الجامعية في متناول يدك</p>
        </div>
        <div class="color-dots">
          <span style="background:var(--blue)"></span>
          <span style="background:var(--red)"></span>
          <span style="background:#006b1b"></span>
        </div>
      </div>

      <div class="new-bento reveal">
        <a href="/calculator" class="nb-card nb-blue nb-tall" data-link>
          <div class="nb-bg-icon"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">calculate</span></div>
          <div class="nb-top">
            <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1">calculate</span>
            <div class="nb-arrow"><span class="material-symbols-outlined">north_east</span></div>
          </div>
          <div class="nb-bottom">
            <h3>حاسبة المعدل</h3>
            <p>احسب معدلك الفصلي والتراكمي بدقة وسهولة</p>
          </div>
        </a>

        <a href="/plans" class="nb-card nb-green" data-link>
          <div class="nb-bg-icon"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">menu_book</span></div>
          <div class="nb-top">
            <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1">menu_book</span>
            <div class="nb-arrow"><span class="material-symbols-outlined">north_east</span></div>
          </div>
          <div class="nb-bottom">
            <h3>الخطة الدراسية</h3>
            <p>نظم مسارك الأكاديمي مع خططنا الدراسية المحدثة</p>
          </div>
        </a>

        <a href="/activities" class="nb-card nb-red nb-span-rows" data-link>
          <div class="nb-event-img">
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70" alt="Events" loading="lazy">
            <div class="nb-event-gradient"></div>
          </div>
          <div class="nb-top">
            <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1">event</span>
            <div class="nb-arrow"><span class="material-symbols-outlined">north_east</span></div>
          </div>
          <div class="nb-bottom">
            <div class="nb-live-badge">مباشر الآن</div>
            <h3>الفعاليات والمؤتمرات</h3>
            <p>شارك في ورش العمل واللقاءات الطلابية الأسبوعية</p>
          </div>
        </a>

        <a href="/tracker" class="nb-card nb-yellow" data-link>
          <div class="nb-bg-icon"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">timer</span></div>
          <div class="nb-top">
            <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1">timer</span>
            <div class="nb-arrow nb-arrow-dark"><span class="material-symbols-outlined">north_east</span></div>
          </div>
          <div class="nb-bottom nb-bottom-dark">
            <h3>تتبع الساعات</h3>
            <p>راقب عدد الساعات المنجزة والمتبقية في تخصصك</p>
          </div>
        </a>

        <a href="/subjects" class="nb-card nb-neutral" data-link>
          <div class="nb-bg-icon"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">folder_open</span></div>
          <div class="nb-top">
            <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1;color:var(--blue)">folder_open</span>
            <div class="nb-arrow nb-arrow-neutral"><span class="material-symbols-outlined">north_east</span></div>
          </div>
          <div class="nb-bottom nb-bottom-dark">
            <h3>المصادر التعليمية</h3>
            <p>مكتبة شاملة من الملخصات والامتحانات السابقة</p>
          </div>
        </a>
      </div>
    </section>

    <!-- EVENTS SECTION -->
    <section class="new-events-section reveal">
      <div class="new-events-inner">
        <div class="new-events-header">
          <div>
            <h2>آخر الفعاليات واللقاءات</h2>
            <p>لا تفوت فرصة التعلم والتواصل مع زملائك في القسم</p>
          </div>
          <a href="/activities" class="btn-see-all" data-link>شاهد الكل</a>
        </div>
        <div class="new-events-grid">
          ${activityCards}
        </div>
      </div>
    </section>

    <!-- JOIN SECTION -->
    <section class="new-join-section reveal">
      <div class="new-join-inner">
        <div class="new-join-glow new-join-glow-1"></div>
        <div class="new-join-glow new-join-glow-2"></div>
        <div class="new-join-content">
          <h2>انضم إلى عائلة CNE</h2>
          <p>احصل على آخر التحديثات، المذكرات، والفعاليات مباشرة على تليغرام.</p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdD38YSdj9_m5Kiqc8h2oU6i1c22yeUtL2tqgSo-9Xagxrd0A/viewform?usp=header" target="_blank" class="new-join-btn">
            اشترك الآن
          </a>
        </div>
        <div class="new-join-icons">
          <div class="ji-box ji-blue"><span class="material-symbols-outlined">group</span></div>
          <div class="ji-box ji-red"><span class="material-symbols-outlined">favorite</span></div>
          <div class="ji-box ji-green"><span class="material-symbols-outlined">school</span></div>
          <div class="ji-box ji-yellow"><span class="material-symbols-outlined">lightbulb</span></div>
        </div>
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
