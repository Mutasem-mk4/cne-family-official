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
  '/about':      renderAbout,
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
          <span class="new-hero-eyebrow">مستقبلك يبدأ من هنا</span>
          <h1>CNE Family: المنصة الأكاديمية المتكاملة لطلبة هندسة الحاسوب والشبكات</h1>
          <p>اكتشف المصادر التعليمية والخطط الدراسية والمجتمع الهندسي الأكبر في مكان واحد.</p>
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
              حاسبة المعدل (GPA)
            </a>
            <a href="/tracker" class="hero-chip hero-chip-red" data-link>
              <span class="material-symbols-outlined">timer</span>
              تتبع الساعات
            </a>
            <a href="/plans" class="hero-chip hero-chip-green" data-link>
              <span class="material-symbols-outlined">download</span>
              الخطط الشجرية
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SMART TOOLS -->
    <section class="new-section">
      <div class="new-section-header reveal">
        <div>
          <h2>الأدوات الطلابية الذكية</h2>
          <p>كل ما يلزمك لتيسير مسيرتك الجامعية في متناول يدك</p>
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
            <h3>الخطط الشجرية</h3>
            <p>نظم مسيرتك الدراسية مع الخطط الأكاديمية المحدثة</p>
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
            <h2>أحدث الفعاليات واللقاءات</h2>
            <p>كن جزءاً من أنشطتنا وتفاعل مع زملائك في القسم</p>
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
          <p>احصل على أحدث التحديثات، الملخصات، والفعاليات مباشرة عبر تليجرام.</p>
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
// ── RENDER SUBJECTS (DIGITAL ACADEMY) ───────────────────────────
async function renderSubjects() {
  const allSubjects = await fetchData('subjects', '/data/subjects.json');
  
  setTimeout(() => {
    // Search logic for Academy
    const input = document.getElementById('academySearch');
    if (input) {
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        document.querySelectorAll('.academy-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }

    // Filter Chips logic
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const major = chip.dataset.major;
        document.querySelectorAll('.academy-card').forEach(card => {
          if (major === 'all' || card.dataset.major === major) card.style.display = '';
          else card.style.display = 'none';
        });
      });
    });
  }, 0);

  const majorLabel = { computer: 'هندسة الحاسوب', network: 'هندسة الشبكات', medical: 'الهندسة الطبية', common: 'متطلبات عامة' };
  const majorIcons = { computer: 'computer', network: 'router', medical: 'medical_services', common: 'box' };

  const cards = allSubjects.map(s => `
    <div class="academy-card reveal" data-major="${s.major}">
      <div class="academy-card-img">
        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80" alt="${s.name}" loading="lazy">
        <div class="academy-card-badge">سنة ${s.year}</div>
      </div>
      <div class="academy-card-body">
        <span class="academy-card-major">
          <span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle">${majorIcons[s.major] || 'school'}</span>
          ${majorLabel[s.major] || s.major}
        </span>
        <h3>${s.name}</h3>
        <div class="academy-card-meta">
          <span><span class="material-symbols-outlined" style="font-size:14px">menu_book</span> محتوى شامل</span>
          <span><span class="material-symbols-outlined" style="font-size:14px">verified</span> مصادر معتمدة</span>
        </div>
        <a href="${s.link || '#'}" target="_blank" class="academy-btn">تصفح المصادر التعليمية</a>
      </div>
    </div>
  `).join('');

  return `
    <section class="academy-hero reveal">
      <span class="new-hero-eyebrow">أكاديمية المهندسين الرقمية</span>
      <h1 class="section-title">استكشف مصادر المعرفة الهندسية</h1>
      <p class="section-subtitle" style="margin: 0 auto">مكتبة شاملة من الملخصات والملفات الأكاديمية لدعم مسيرتك الدراسية.</p>
    </section>

    <div class="academy-search-wrap reveal">
      <div class="academy-search-inner">
        <span class="material-symbols-outlined" style="color:var(--blue)">search</span>
        <input type="text" id="academySearch" placeholder="ما الذي ترغب في دراسته اليوم؟">
      </div>
      <button class="btn btn-primary" style="padding: 1rem 2rem; border-radius: var(--radius-lg)">بحث</button>
    </div>

    <div class="filter-chips reveal">
      <button class="filter-chip active" data-major="all">الكل</button>
      <button class="filter-chip" data-major="computer">هندسة الحاسبات</button>
      <button class="filter-chip" data-major="network">هندسة الشبكات</button>
      <button class="filter-chip" data-major="medical">الهندسة الطبية</button>
      <button class="filter-chip" data-major="common">مشترك</button>
    </div>

    <div class="academy-grid">
      ${cards}
    </div>

    ${renderFooter()}
  `;
}

// ── RENDER ABOUT US (EDITORIAL STORY) ───────────────────────────
async function renderAbout() {
  return `
    <div class="page-header reveal">
      <span class="new-hero-eyebrow">قصتنا تبدأ هنا</span>
      <h1 class="section-title">هندسة المستقبل بروح <span style="color:var(--blue)">العائلة الواحدة</span></h1>
      <p class="section-subtitle" style="margin:0 auto">بدأنا كمبادرة طلابية رائدة وتحولنا إلى أكبر مظلة أكاديمية لدعم طلبة هندسة الحاسوب والشبكات.</p>
    </div>

    <section class="new-section container reveal">
      <div class="row g-5 align-items-center">
        <div class="col-12 col-md-6">
          <div class="mosaic-img" style="aspect-ratio:1; border-radius:var(--radius-xl); box-shadow:var(--shadow-lg)">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Team Collaboration">
          </div>
        </div>
        <div class="col-12 col-md-6">
          <h2 style="font-weight:900; font-size:2.5rem; margin-bottom:1.5rem">كيف بدأت CNE Family؟</h2>
          <p style="font-size:1.1rem; line-height:1.8; color:var(--text-secondary)">
            ولدت فكرة CNE Family من قلب التحديات التي يواجهها طلاب الهندسة. كنا نلمس الفجوة بين المناهج الأكاديمية واحتياجات سوق العمل، وقررنا أن نكون الجسر الذي يربط بينهما لتأهيل جيل هندسي واعد.
          </p>
          <div style="display:flex; gap:1.5rem; margin-top:2rem">
            <div style="display:flex; align-items:center; gap:10px">
              <span class="material-symbols-outlined" style="color:var(--blue)">verified</span>
              <span style="font-weight:700">محتوى معتمد</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px">
              <span class="material-symbols-outlined" style="color:var(--blue)">groups</span>
              <span style="font-weight:700">مجتمع تفاعلي</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="about-stats container reveal">
      <div class="about-grid-stats">
        <div>
          <span class="about-stat-num" data-count="15000" data-suffix="+">0</span>
          <span style="opacity:0.8; font-weight:700">طالب مستفيد</span>
        </div>
        <div>
          <span class="about-stat-num" data-count="200" data-suffix="+">0</span>
          <span style="opacity:0.8; font-weight:700">كورس وملخص</span>
        </div>
        <div>
          <span class="about-stat-num" data-count="50" data-suffix="+">0</span>
          <span style="opacity:0.8; font-weight:700">عضو نشط</span>
        </div>
        <div>
          <span class="about-stat-num" data-count="24" data-suffix="/7">0</span>
          <span style="opacity:0.8; font-weight:700">دعم متواصل</span>
        </div>
      </div>
    </section>

    <section class="container reveal" style="padding-bottom:10rem">
      <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:3rem">
        <div>
          <h2 style="font-weight:900; font-size:2.5rem">فريق العمل</h2>
          <p style="color:var(--text-secondary)">العقول التي تقف خلف نجاح CNE Family</p>
        </div>
      </div>
      <div class="team-grid">
        <div class="team-card">
          <div class="team-img"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="Ahmed"></div>
          <h4>أحمد محمد</h4>
          <p>مؤسس ومدير تنفيذي</p>
        </div>
        <div class="team-card">
          <div class="team-img"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" alt="Sara"></div>
          <h4>سارة علي</h4>
          <p>مسؤولة المحتوى الدراسي</p>
        </div>
        <div class="team-card">
          <div class="team-img"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" alt="Yassin"></div>
          <h4>ياسين إبراهيم</h4>
          <p>المشرف التقني</p>
        </div>
        <div class="team-card">
          <div class="team-img"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" alt="Laila"></div>
          <h4>ليلى حسن</h4>
          <p>مديرة المجتمع والفعاليات</p>
        </div>
      </div>
    </section>

    ${renderFooter()}
  `;
}

// ── RENDER PLANS (STUDY TRACKS) ──────────────────────────────────
function renderPlans() {
  return `
    <div class="page-header reveal">
      <span class="new-hero-eyebrow">المسار الأكاديمي</span>
      <h1 class="section-title">الخطط الشجرية</h1>
      <p class="section-subtitle" style="margin:0 auto">دليل المسار الدراسي والتبعية للمواد لكل تخصص.</p>
    </div>

    <div class="container reveal" style="padding-bottom:10rem; margin-top:4rem">
      <div class="row g-4 justify-content-center">
        <div class="col-12 col-md-6">
          <div class="nb-card nb-blue" style="height:100%; padding:3rem">
            <div class="nb-top">
              <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1">terminal</span>
              <div class="nb-arrow"><span class="material-symbols-outlined">north_east</span></div>
            </div>
            <div class="nb-bottom">
              <h3 style="font-size:2rem">هندسة الحاسوب</h3>
              <p style="margin-bottom:2rem">الخطة الدراسية الكاملة مع توضيح المتطلبات السابقة لكل مادة.</p>
              <a href="/computer-plan.jpg" target="_blank" class="btn btn-primary" style="width:100%; justify-content:center">عرض الخطة الشجرية</a>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="nb-card nb-green" style="height:100%; padding:3rem">
            <div class="nb-top">
              <span class="material-symbols-outlined nb-icon" style="font-variation-settings:'FILL' 1">router</span>
              <div class="nb-arrow"><span class="material-symbols-outlined">north_east</span></div>
            </div>
            <div class="nb-bottom">
              <h3 style="font-size:2rem">هندسة الشبكات</h3>
              <p style="margin-bottom:2rem">خطة تخصص الشبكات والأمن السيبراني والمسار الأكاديمي المعتمد.</p>
              <a href="/networking-plan.jpg" target="_blank" class="btn btn-outline" style="width:100%; justify-content:center; border-color:var(--green); color:var(--green)">عرض الخطة الشجرية</a>
            </div>
          </div>
        </div>
      </div>

      <div class="reveal" style="margin-top:6rem; text-align:center; background:var(--surface); padding:4rem; border-radius:var(--radius-xl); border:1px solid var(--border)">
         <h2 style="font-weight:900; margin-bottom:1rem">هل تواجه مشكلة في فهم الخطة؟</h2>
         <p style="color:var(--text-secondary); max-width:600px; margin:0 auto 2rem">فريقنا الأكاديمي جاهز لمساعدتك في فهم المتطلبات واختيار المواد الأنسب لكل فصل.</p>
         <a href="/join" data-link class="btn btn-primary">تواصل مع مرشد أكاديمي</a>
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
      <p class="section-subtitle reveal">احسب معدلك الفصلي بنظام 4.0 بدقة متناهية.</p>
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

// ── RENDER TRACKER (STUDY TIMELINE) ─────────────────────────────
async function renderTracker() {
  const curriculum = await fetchData('curriculum', '/data/curriculum.json');
  const progress = JSON.parse(localStorage.getItem('study_progress') || '[]');
  const major = localStorage.getItem('study_major');

  if (!major) return renderMajorSelection();

  window.toggleSubject = (id) => {
    const idx = progress.indexOf(id);
    if (idx > -1) progress.splice(idx, 1); else progress.push(id);
    localStorage.setItem('study_progress', JSON.stringify(progress));
    render('/tracker');
  };

  window.resetMajor = () => {
    localStorage.removeItem('study_major');
    render('/tracker');
  };

  const filtered = curriculum.filter(s => s.major === 'common' || s.major === major);
  const totalCredits = 162;
  const completedCredits = filtered.filter(s => progress.includes(s.id)).reduce((a, b) => a + (b.credits || 0), 0);
  const percent = Math.min(Math.round((completedCredits / totalCredits) * 100), 100);

  const timelineItems = [1, 2, 3, 4, 5].map(y => {
    const yearSubs = filtered.filter(s => s.year === y);
    if (!yearSubs.length) return '';
    
    const items = yearSubs.map(s => `
      <div class="subject-mini-item">
        <div style="display:flex; align-items:center; gap:10px">
          <input type="checkbox" ${progress.includes(s.id) ? 'checked' : ''} onchange="toggleSubject('${s.id}')" style="accent-color:var(--blue)">
          <span style="${progress.includes(s.id) ? 'text-decoration:line-through;opacity:0.5' : ''}">${s.name}</span>
        </div>
        <span style="font-weight:800; font-size:0.75rem">${s.credits} س</span>
      </div>
    `).join('');

    const yearLabel = {1:'التأسيس', 2:'التعمق', 3:'التخصص', 4:'الاحتراف', 5:'التخرج'};

    return `
      <div class="timeline-item reveal">
        <div class="timeline-card">
          <span style="font-size:0.7rem; font-weight:800; color:var(--blue); text-transform:uppercase">المستوى ${y}: ${yearLabel[y]}</span>
          <h3>مواد السنة ${y}</h3>
          <div class="subject-mini-list">
            ${items}
          </div>
        </div>
        <div class="timeline-node">${y}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-header reveal">
      <span class="new-hero-eyebrow">مسارك التعليمي</span>
      <h1 class="section-title">مسارك التعليمي نحو التخرج</h1>
      <p class="section-subtitle" style="margin:0 auto">تتبع إنجازك في متطلبات خطة ${major === 'computer' ? 'هندسة الحاسوب' : 'هندسة الشبكات'} (162 ساعة).</p>
      
      <div class="container" style="margin-top:4rem; max-width:800px">
        <div style="background:var(--surface); padding:2.5rem; border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); border:1px solid var(--border)">
          <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:1rem">
            <div>
              <span style="font-weight:800; color:var(--text-secondary)">معدل الإنجاز الكلي</span>
              <div style="font-size:3rem; font-weight:900; color:var(--blue)">${percent}%</div>
            </div>
            <span style="font-size:0.9rem; color:var(--text-muted)">تم إكمال ${completedCredits} من أصل 162 ساعة</span>
          </div>
          <div style="height:12px; background:var(--bg); border-radius:6px; overflow:hidden">
            <div style="width:${percent}%; height:100%; background:var(--blue-gradient); transition:width 1s var(--ease-spring)"></div>
          </div>
          <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center">
             <a href="javascript:void(0)" onclick="resetMajor()" style="font-size:0.8rem; font-weight:700; color:var(--text-muted)">← تغيير التخصص</a>
             <div class="new-tracker-mosaic" style="margin:0; gap:10px">
                <div class="mosaic-box" style="width:30px;height:30px;background:var(--blue);border-radius:6px"></div>
                <div class="mosaic-box" style="width:30px;height:30px;background:var(--green);border-radius:6px"></div>
                <div class="mosaic-box" style="width:30px;height:30px;background:var(--red);border-radius:6px"></div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <div class="timeline-container">
      <div class="timeline-line"></div>
      ${timelineItems}
    </div>

    <section class="container reveal" style="padding-bottom:10rem">
       <div style="background:var(--surface-low); padding:4rem; border-radius:3rem; display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap">
          <div style="max-width:500px">
             <h2 style="font-weight:900; font-size:2.5rem">نصيحة ذكية لجدولك</h2>
             <p style="color:var(--text-secondary); margin-top:1rem">بناءً على تقدمك الحالي، ننصحك بالتركيز على المواد العلمية المشتركة في هذه المرحلة لفتح متطلبات التخصص القادمة.</p>
          </div>
          <a href="/links" data-link class="btn btn-primary" style="padding:1.25rem 2.5rem">الذهاب لجريدة المواد</a>
       </div>
    </section>

    ${renderFooter()}
  `;
}

function renderMajorSelection() {
  window.setMajor = (m) => { localStorage.setItem('study_major', m); render('/tracker'); };
  return `
    <div class="page-header reveal" style="text-align:center">
      <span class="new-hero-eyebrow">خطوة اختيار المسار</span>
      <h1 class="section-title">اختر تخصصك الأكاديمي</h1>
      <p class="section-subtitle" style="margin:0 auto">سنقوم بتخصيص متتبع الـ 162 ساعة بناءً على خطتك الدراسية.</p>
    </div>
    <div class="container" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem; padding-bottom:10rem; margin-top:4rem">
      <div class="nb-card nb-blue reveal" onclick="setMajor('computer')" style="cursor:pointer; padding:3rem">
        <div style="font-size:4rem; margin-bottom:1.5rem">💻</div>
        <h3 style="font-size:2rem">هندسة الحاسوب</h3>
        <p>تتبع مواد البرمجيات، الهاردوير، والأنظمة المضمنة.</p>
      </div>
      <div class="nb-card nb-green reveal" onclick="setMajor('network')" style="cursor:pointer; padding:3rem">
        <div style="font-size:4rem; margin-bottom:1.5rem">🌐</div>
        <h3 style="font-size:2rem">هندسة الشبكات</h3>
        <p>تتبع مواد الاتصالات، أمن الشبكات، والأنظمة السحابية.</p>
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
      <p class="section-subtitle reveal">كن جزءاً من مبادرتنا وساهم في خدمة زملائك.</p>
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
      <p class="section-subtitle reveal">أهم الروابط لمنصات الجامعة الرسمية لدعم مسيرتك الأكاديمية.</p>
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
          <p class="footer-tagline">بيتكم الأكاديمي والاجتماعي منذ عام 2011.</p>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="footer-col-title">روابط سريعة</div>
          <div class="footer-links">
            <a href="/" data-link>الرئيسية</a>
            <a href="/subjects" data-link>المواد</a>
            <a href="/activities" data-link>الأنشطة</a>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="footer-col-title">تواصل معنا</div>
          <div class="footer-links">
            <a href="https://www.instagram.com/cne.fet" target="_blank">إنستغرام</a>
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
