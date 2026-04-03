import { initWowEffects } from './wow-scripts.js';

// ── CONFIGURATION & LINKS ─────────────────────────────────────────
const DRIVE_LINKS = {
  main:    'https://drive.google.com/drive/folders/YOUR_MAIN_FOLDER_ID',
  computer:'https://drive.google.com/drive/folders/YOUR_COMPUTER_FOLDER_ID',
  network: 'https://drive.google.com/drive/folders/YOUR_NETWORK_FOLDER_ID',
  common:  'https://drive.google.com/drive/folders/YOUR_COMMON_FOLDER_ID',
};

// ── FORM HANDLER (Formspree) ───────────────────────────────────
async function handleJoinSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const btnText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<span class="loader"></span> جاري الإرسال...';

  const formData = new FormData(form);
  
  try {
    const response = await fetch('https://formspree.io/f/xoqgkyyv', { // Replace with YOUR ID
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
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    dataCache[key] = await res.json();
  } catch {
    dataCache[key] = [];
  }
  return dataCache[key];
}

// ── ROUTER ────────────────────────────────────────────────────────
const routes = {
  '/':           renderHome,
  '/subjects':   renderSubjects,
  '/plans':      renderPlans,
  '/activities': renderActivities,
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
  page.classList.remove('page-enter');
  void page.offsetWidth; // force reflow
  page.classList.add('page-enter');
  updateActiveLink(path);
  
  // Staggered Reveal Initializer
  setTimeout(() => {
    initReveal();
    initCounters();
    if (path === '/plans') initLightbox();
    initWowEffects();
  }, 100);
}

window.addEventListener('popstate', () => render(window.location.pathname));

document.addEventListener('click', e => {
  const link = e.target.closest('[data-link]');
  if (!link) return;
  e.preventDefault();
  navigate(link.getAttribute('href'));
});

// ── NAVBAR SCROLL ────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── ACTIVE LINK ──────────────────────────────────────────────────
function updateActiveLink(path) {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

// ── INTERSECTION OBSERVER (Reveal Animations) ────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ── COUNTER ANIMATION ────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const duration = 2000; // 2 seconds
      const start = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        current = Math.floor(easeOutExpo * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ── LIGHTBOX ─────────────────────────────────────────────────────
function initLightbox() {
  const links = document.querySelectorAll('.plan-card .btn');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.endsWith('.jpg') || href.endsWith('.png')) {
        e.preventDefault();
        showLightbox(href);
      }
    });
  });
}

function showLightbox(src) {
  const overlay = document.createElement('div');
  overlay.style = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.9); 
    display: flex; align-items: center; justify-content: center; 
    z-index: 1000; backdrop-filter: blur(8px); cursor: zoom-out;
    opacity: 0; transition: opacity 0.3s var(--ease);
  `;
  overlay.innerHTML = `
    <div style="position:relative; max-width: 90%; max-height: 90%;">
      <img src="${src}" style="max-width:100%; max-height:90vh; border-radius: 8px; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
      <button style="position:absolute; top:-40px; right:0; color:white; background:none; font-size:2rem;">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = '1', 10);
  overlay.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  };
}

// ── TAB SWITCHER ─────────────────────────────────────────────────
function initTabs() {
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
}

// ── SEARCH ───────────────────────────────────────────────────────
function initSearch(inputId, cards) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(cards).forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

// ── YEAR COLORS ───────────────────────────────────────────────────
const yearColors = {
  1: { bg: 'rgba(53,116,200,.1)', color: 'var(--blue)' },
  2: { bg: 'rgba(76,175,80,.1)',  color: 'var(--green)' },
  3: { bg: 'rgba(242,111,33,.1)', color: 'var(--orange)' },
  4: { bg: 'rgba(221,59,63,.1)',  color: 'var(--red)' },
};

const tagClasses = {
  'أكاديمي': 'tag-green',
  'تقني':    'tag-blue',
  'اجتماعي': 'tag-red',
  'ريادة':   'tag-yellow',
  'ترفيهي':  'tag-orange',
};

function renderSubjectList(list) {
  if (!list || list.length === 0) {
    return `<div style="text-align:center;padding:3rem;color:var(--text-muted)">لا توجد مواد بعد — قم بإضافتها من لوحة التحكم</div>`;
  }
  return list.map(s => {
    const dest = (s.file && s.file !== '') ? s.file : (s.link || '#');
    const yr = parseInt(s.year) || 1;
    return `
    <a href="${dest}" target="_blank" rel="noopener" class="subject-card">
      <div class="subject-card-left">
        <div class="subject-year" style="background:${yearColors[yr].bg}; color:${yearColors[yr].color}">
          ${yr}
        </div>
        <span class="subject-name">${s.name}</span>
      </div>
      <svg class="subject-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </a>
  `;
  }).join('');
}

// ── PAGE RENDERS ─────────────────────────────────────────────────

function renderHome() {
  return `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-illustration">
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#grid)" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5" />
          <circle cx="800" cy="800" r="200" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" />
          <path d="M 0 500 Q 250 250 500 500 T 1000 500" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2" />
        </svg>
      </div>
      <div class="hero-badge reveal">
        <span></span>
        اتحاد هندسة الحاسوب والشبكات · جامعة البلقاء التطبيقية
      </div>
      <h1 class="reveal">بيتك الأكاديمي في عالم <span class="highlight">الهندسة التقنية</span></h1>
      <p class="reveal">مجتمع طلابي يوفر الملخصات، المصادر الدراسية، ويُنظّم الفعاليات التي تبني مهاراتك وتصنع ذكرياتك.</p>
      <div class="hero-actions reveal">
        <a href="/subjects" class="btn btn-primary" data-link>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          استكشف المواد الدراسية
        </a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdD38YSdj9_m5Kiqc8h2oU6i1c22yeUtL2tqgSo-9Xagxrd0A/viewform?usp=header" target="_blank" rel="noopener" class="btn btn-outline">
          انضم للعائلة
        </a>
      </div>
    </section>

    <!-- STATS BAR -->
    <div class="stats-bar reveal">
      <div class="stat-item">
        <span class="stat-number" data-count="80" data-suffix="+">0+</span>
        <span class="stat-label">مادة دراسية</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" data-count="15" data-suffix="+">0+</span>
        <span class="stat-label">فعالية سنوياً</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" data-count="500" data-suffix="+">0+</span>
        <span class="stat-label">طالب مستفيد</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" data-count="4" data-suffix="">0</span>
        <span class="stat-label">سنوات خبرة</span>
      </div>
    </div>

    <!-- BENTO GRID -->
    <section class="section">
      <div class="section-label reveal">ماذا نقدم</div>
      <h2 class="section-title reveal">كل ما تحتاجه في مكان واحد</h2>
      <p class="section-subtitle reveal">من الملخصات والنماذج إلى الفعاليات والخطط الدراسية — صممنا كل شيء ليخدمك.</p>

      <div class="bento-grid">

        <!-- Card 1: Academic — Big -->
        <div class="bento-card col-4 accent-blue reveal">
          <div class="card-icon icon-blue">📚</div>
          <div class="card-tag tag-blue">أكاديميا</div>
          <h3 class="card-title">ملخصات ونماذج لكل المواد</h3>
          <p class="card-desc">مجلدات منظمة على Google Drive لكل المواد في هندسة الحاسوب والشبكات. محدّثة باستمرار من طلاب متميزين.</p>
          <a href="/subjects" class="card-link" data-link>
            تصفح المواد
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </a>
        </div>

        <!-- Card 2: Join — Tall -->
        <div class="bento-card col-2 row-2 accent-orange reveal">
          <div class="card-icon icon-orange">🤝</div>
          <div class="card-tag tag-orange">انضم</div>
          <h3 class="card-title">كن جزءاً من العائلة</h3>
          <p class="card-desc">نرحب بكل طالب يريد أن يُعطي ويستفيد. اختبار القبول مفتوح طوال العام.</p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdD38YSdj9_m5Kiqc8h2oU6i1c22yeUtL2tqgSo-9Xagxrd0A/viewform?usp=header" target="_blank" rel="noopener" class="card-link" style="margin-top: auto;">
            تقدّم الآن
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </a>
        </div>

        <!-- Card 3: Plans -->
        <div class="bento-card col-2 accent-red reveal">
          <div class="card-icon icon-red">🗺️</div>
          <div class="card-tag tag-red">تخطيط</div>
          <h3 class="card-title">الخطط الشجرية</h3>
          <p class="card-desc">تتبّع مسارك الدراسي وافهم المتطلبات السابقة لكل مادة.</p>
          <a href="/plans" class="card-link" data-link>
            اعرض الخطة
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </a>
        </div>

        <!-- Card 4: Activities -->
        <div class="bento-card col-2 accent-green reveal">
          <div class="card-icon icon-green">🚀</div>
          <div class="card-tag tag-green">فعاليات</div>
          <h3 class="card-title">أنشطة تصنع الفارق</h3>
          <p class="card-desc">ورش تقنية، رحلات، محاضرات — تجارب تبني شخصيتك المهنية.</p>
          <a href="/activities" class="card-link" data-link>
            تصفح الأنشطة
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </a>
        </div>

        <!-- Card 5: University Links -->
        <div class="bento-card col-2 accent-yellow reveal" style="background:linear-gradient(135deg,#FFFBEB,#FEF3C7)">
          <div class="card-tag tag-yellow">روابط سريعة</div>
          <h3 class="card-title">البوابة الجامعية</h3>
          <p class="card-desc">وصول مباشر للبوابة الطلابية والتعلم الإلكتروني.</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:1rem;">
            <a href="http://appserver.fet.edu.jo:7778/reg_new/index.jsp" target="_blank" class="card-link" style="font-size:.82rem">📎 البوابة الطلابية →</a>
            <a href="https://s3.ebalqa.courses/fet/login/index.php" target="_blank" class="card-link" style="font-size:.82rem">🎓 التعلم الإلكتروني →</a>
          </div>
        </div>

      </div>
    </section>

    <!-- QUICK ACCESS -->
    <section class="section" style="padding-top:0">
      <div class="quick-access reveal">
        <a href="/subjects" class="qa-item" data-link>
          <div class="qa-icon" style="background:rgba(53,116,200,.1)">📚</div>
          <div>
            <div class="qa-text-label">الوصول السريع</div>
            <div class="qa-text-title">المواد الدراسية</div>
          </div>
        </a>
        <a href="/plans" class="qa-item" data-link>
          <div class="qa-icon" style="background:rgba(221,59,63,.1)">🗺️</div>
          <div>
            <div class="qa-text-label">الوصول السريع</div>
            <div class="qa-text-title">الخطط الشجرية</div>
          </div>
        </a>
        <a href="/activities" class="qa-item" data-link>
          <div class="qa-icon" style="background:rgba(76,175,80,.1)">🚀</div>
          <div>
            <div class="qa-text-label">الوصول السريع</div>
            <div class="qa-text-title">الأنشطة والفعاليات</div>
          </div>
        </a>
      </div>
    </section>

    <!-- FOOTER -->
    ${renderFooter()}
  `;
}

async function renderSubjects() {
  const allSubjects = await fetchData('subjects', '/data/subjects.json');

  const year1 = allSubjects.filter(s => s.year === 1);
  const year2 = allSubjects.filter(s => s.year === 2);
  const year3 = allSubjects.filter(s => s.year === 3);
  const year4 = allSubjects.filter(s => s.year === 4);

  setTimeout(initTabs, 0);
  setTimeout(() => initSearch('subjectSearch', '.subject-card'), 0);

  const majorLabel = { computer: 'حاسوب', network: 'شبكات', common: 'مشترك' };
  const majorClass  = { computer: 'tag-blue', network: 'tag-green', common: 'tag-yellow' };

  function renderByYear(list) {
    if (!list || list.length === 0) return `<div style="text-align:center;padding:3rem;color:var(--text-muted)">لا توجد مواد بعد</div>`;
    return list.map(s => `
      <a href="${s.link || '#'}" target="_blank" rel="noopener" class="subject-card">
        <div class="subject-card-left">
          <span class="card-tag ${majorClass[s.major] || 'tag-blue'}" style="margin:0;flex-shrink:0">${majorLabel[s.major] || s.major}</span>
          <span class="subject-name">${s.name}</span>
        </div>
        <svg class="subject-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </a>`).join('');
  }

  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        المواد الدراسية
      </div>
      <h1 class="section-title reveal">المواد الدراسية</h1>
      <p class="section-subtitle reveal">اختر سنتك الدراسية للوصول إلى الملخصات والنماذج.</p>

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:1.5rem;">
        <div class="tab-bar reveal">
          <button class="tab-btn active" data-tab="y1">السنة الأولى <span style="opacity:.55;font-size:.8em">${year1.length}</span></button>
          <button class="tab-btn" data-tab="y2">السنة الثانية <span style="opacity:.55;font-size:.8em">${year2.length}</span></button>
          <button class="tab-btn" data-tab="y3">السنة الثالثة <span style="opacity:.55;font-size:.8em">${year3.length}</span></button>
          <button class="tab-btn" data-tab="y4">السنة الرابعة <span style="opacity:.55;font-size:.8em">${year4.length}</span></button>
        </div>
        <div class="search-wrap reveal">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="subjectSearch" placeholder="ابحث عن مادة..." style="background:var(--glass-bg); backdrop-filter:blur(8px);">
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:4rem">
      <div class="subject-grid tab-content" data-content="y1">${renderByYear(year1)}</div>
      <div class="subject-grid tab-content" data-content="y2" style="display:none">${renderByYear(year2)}</div>
      <div class="subject-grid tab-content" data-content="y3" style="display:none">${renderByYear(year3)}</div>
      <div class="subject-grid tab-content" data-content="y4" style="display:none">${renderByYear(year4)}</div>
    </div>
    ${renderFooter()}
  `;
}

function renderPlans() {
  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الخطط الشجرية
      </div>
      <h1 class="section-title reveal">الخطط الشجرية</h1>
      <p class="section-subtitle reveal">دليلك لاجتياز المسار الدراسي بنجاح — وافهم المتطلبات قبل التسجيل.</p>
    </div>
    <div class="container" style="padding-bottom:4rem">
      <div class="plans-grid">
        <div class="plan-card reveal">
          <div class="plan-icon" style="background:rgba(53,116,200,.1)">💻</div>
          <h3 class="card-title" style="font-size:1.3rem;margin-bottom:.5rem">هندسة الحاسوب</h3>
          <p class="card-desc" style="margin-bottom:1.5rem">الخطة الدراسية الكاملة مع المتطلبات السابقة والمواد الاختيارية.</p>
          <a href="/computer-plan.jpg" target="_blank" download="Computer-Plan.jpg" class="btn btn-primary" style="width:100%;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            تحميل الخطة
          </a>
        </div>
        <div class="plan-card reveal">
          <div class="plan-icon" style="background:rgba(76,175,80,.1)">🌐</div>
          <h3 class="card-title" style="font-size:1.3rem;margin-bottom:.5rem">هندسة الشبكات</h3>
          <p class="card-desc" style="margin-bottom:1.5rem">خطة تخصص الشبكات مع توضيح المسارات المتاحة والتخصصات الفرعية.</p>
          <a href="/networking-plan.jpg" target="_blank" download="Networking-Plan.jpg" class="btn" style="width:100%;justify-content:center;background:var(--green);color:white;box-shadow:0 8px 24px rgba(76,175,80,.25)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            تحميل الخطة
          </a>
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

async function renderActivities() {
  const activities = await fetchData('activities', '/data/activities.json');

  const activityCards = activities.length === 0
    ? `<div style="text-align:center;padding:4rem;color:var(--text-muted)">لا توجد أنشطة بعد — قم بإضافتها من لوحة التحكم</div>`
    : activities.map(a => {
        const tagClass = tagClasses[a.tag] || 'tag-blue';
        const imgContent = a.image
          ? `<img src="${a.image}" alt="${a.title}" style="width:100%;height:100%;object-fit:cover;">`
          : `<span style="font-size:3rem">${a.emoji || '🚀'}</span>`;
        return `
          <div class="activity-card reveal">
            <div class="activity-img" style="background:${a.bg_gradient || a.bg || 'linear-gradient(135deg,#DBEAFE,#BFDBFE)'}">${imgContent}</div>
            <div class="activity-body">
              <div class="activity-meta">
                <span class="card-tag ${tagClass}" style="margin:0">${a.tag}</span>
                <span class="activity-date">${a.date}</span>
              </div>
              <h3 class="activity-title">${a.title}</h3>
              <p class="activity-desc">${a.description || a.desc || ''}</p>
            </div>
          </div>
        `;
      }).join('');

  return `
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الأنشطة والفعاليات
      </div>
      <h1 class="section-title reveal">الأنشطة والفعاليات</h1>
      <p class="section-subtitle reveal">فعاليات تبني المهارات وتصنع الذكريات — نفخر بمجتمعنا النابض بالحياة.</p>
    </div>
    <div class="container" style="padding-bottom:4rem">
      <div class="activity-grid">
        ${activityCards}
      </div>
    </div>
    ${renderFooter()}
  `;
}

function renderJoin() {
  window.handleJoinSubmit = handleJoinSubmit; // Expose to global scope for inline onsubmit
  return `
    <div class="join-section">
      <div class="section-label reveal">انضم إلينا</div>
      <h1 class="section-title reveal" style="font-size:2.2rem;margin-bottom:.75rem">كن جزءاً من العائلة</h1>
      <p class="section-subtitle reveal" style="margin:0 auto 2rem">نرحب بكل طالب يريد أن يُعطي ويستفيد.</p>

      <form id="joinForm" class="form-card reveal" onsubmit="handleJoinSubmit(event)">
        <div class="form-group">
          <label>الاسم الكامل</label>
          <input class="form-input" name="name" type="text" placeholder="محمد أحمد..." required>
        </div>
        <div class="form-group">
          <label>الرقم الجامعي</label>
          <input class="form-input" name="student_id" type="text" placeholder="220XXXXX" required>
        </div>
        <div class="form-group">
          <label>التخصص</label>
          <select class="form-input" name="major" required>
            <option>هندسة حاسوب</option>
            <option>هندسة شبكات</option>
          </select>
        </div>
        <div class="form-group">
          <label>السنة الدراسية</label>
          <select class="form-input" name="year" required>
            <option>الأولى</option>
            <option>الثانية</option>
            <option>الثالثة</option>
            <option>الرابعة</option>
          </select>
        </div>
        <div class="form-group">
          <label>لماذا تريد الانضمام؟</label>
          <textarea class="form-input" name="reason" rows="3" placeholder="أخبرنا عن نفسك..." style="resize:vertical" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:.5rem">
          إرسال الطلب
        </button>
      </form>
    </div>
    ${renderFooter()}
  `;
}

function renderFooter() {
  return `
    <footer>
      <div class="footer-inner">
        <div>
          <div class="footer-logo-squares">
            <span style="background:#3574C8"></span>
            <span style="background:#DD3B3F"></span>
            <span style="background:#4CAF50"></span>
            <span style="background:#F7C948"></span>
          </div>
          <div class="footer-brand-name">CNE Family</div>
          <p class="footer-tagline">اتحاد هندسة الحاسوب والشبكات في جامعة البلقاء التطبيقية — بيتك الأكاديمي منذ 2021.</p>
        </div>
        <div>
          <div class="footer-col-title">روابط سريعة</div>
          <div class="footer-links">
            <a href="/" data-link>الرئيسية</a>
            <a href="/subjects" data-link>المواد الدراسية</a>
            <a href="/plans" data-link>الخطط الشجرية</a>
            <a href="/activities" data-link>الأنشطة</a>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdD38YSdj9_m5Kiqc8h2oU6i1c22yeUtL2tqgSo-9Xagxrd0A/viewform?usp=header" target="_blank" rel="noopener">انضم إلينا</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">تواصل معنا</div>
          <div class="footer-links">
            <a href="https://www.instagram.com/cne.fet/" target="_blank">Instagram</a>
            <a href="https://www.facebook.com/share/g/1CqePaqznf/" target="_blank">Facebook</a>
            <a href="http://appserver.fet.edu.jo:7778/reg_new/index.jsp" target="_blank">البوابة الجامعية</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 CNE Family — جامعة البلقاء التطبيقية</span>
        <span>جميع الحقوق محفوظة</span>
      </div>
    </footer>
  `;
}

// ── INIT ─────────────────────────────────────────────────────────
render(window.location.pathname);
