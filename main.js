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
  '/join':       renderJoin,
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
  initReveal();
  initCounters();
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
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
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
      <div class="hero-badge">
        <span></span>
        اتحاد هندسة الحاسوب والشبكات · جامعة البلقاء التطبيقية
      </div>
      <h1>بيتك الأكاديمي في عالم <span class="highlight">الهندسة التقنية</span></h1>
      <p>مجتمع طلابي يوفر الملخصات، المصادر الدراسية، ويُنظّم الفعاليات التي تبني مهاراتك وتصنع ذكرياتك.</p>
      <div class="hero-actions">
        <a href="/subjects" class="btn btn-primary" data-link>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          استكشف المواد الدراسية
        </a>
        <a href="/join" class="btn btn-outline" data-link>
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
      <div class="section-label">ماذا نقدم</div>
      <h2 class="section-title">كل ما تحتاجه في مكان واحد</h2>
      <p class="section-subtitle">من الملخصات والنماذج إلى الفعاليات والخطط الدراسية — صممنا كل شيء ليخدمك.</p>

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
          <a href="/join" class="card-link" data-link style="margin-top: auto;">
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
            <a href="https://elearning.bau.edu.jo" target="_blank" class="card-link" style="font-size:.82rem">🎓 التعلم الإلكتروني →</a>
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

  const computer = allSubjects.filter(s => s.major === 'computer');
  const network  = allSubjects.filter(s => s.major === 'network');
  const common   = allSubjects.filter(s => s.major === 'common');

  setTimeout(initTabs, 0);
  setTimeout(() => initSearch('subjectSearch', '.subject-card'), 0);

  return `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        المواد الدراسية
      </div>
      <h1 class="section-title">المواد الدراسية</h1>
      <p class="section-subtitle">اختر تخصصك للوصول إلى الملخصات والنماذج لكل مادة.</p>

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:1.5rem;">
        <div class="tab-bar">
          <button class="tab-btn active" data-tab="computer">هندسة حاسوب</button>
          <button class="tab-btn" data-tab="network">هندسة شبكات</button>
          <button class="tab-btn" data-tab="common">مشترك</button>
        </div>
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="subjectSearch" placeholder="ابحث عن مادة...">
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:4rem">
      <div class="subject-grid tab-content" data-content="computer">
        ${renderSubjectList(computer)}
      </div>
      <div class="subject-grid tab-content" data-content="network" style="display:none">
        ${renderSubjectList(network)}
      </div>
      <div class="subject-grid tab-content" data-content="common" style="display:none">
        ${renderSubjectList(common)}
      </div>
    </div>
    ${renderFooter()}
  `;
}

function renderPlans() {
  return `
    <div class="page-header">
      <div class="breadcrumb">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الخطط الشجرية
      </div>
      <h1 class="section-title">الخطط الشجرية</h1>
      <p class="section-subtitle">دليلك لاجتياز المسار الدراسي بنجاح — وافهم المتطلبات قبل التسجيل.</p>
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
      <div class="breadcrumb">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        الأنشطة والفعاليات
      </div>
      <h1 class="section-title">الأنشطة والفعاليات</h1>
      <p class="section-subtitle">فعاليات تبني المهارات وتصنع الذكريات — نفخر بمجتمعنا النابض بالحياة.</p>
    </div>
    <div class="container" style="padding-bottom:4rem">
      <div class="activity-grid">${activityCards}</div>
    </div>
    ${renderFooter()}
  `;
}

function renderJoin() {
  window.handleJoinSubmit = handleJoinSubmit; // Expose to global scope for inline onsubmit
  return `
    <div class="join-section">
      <div class="section-label">انضم إلينا</div>
      <h1 class="section-title" style="font-size:2.2rem;margin-bottom:.75rem">كن جزءاً من العائلة</h1>
      <p class="section-subtitle" style="margin:0 auto 2rem">نرحب بكل طالب يريد أن يُعطي ويستفيد.</p>

      <form id="joinForm" class="form-card" onsubmit="handleJoinSubmit(event)">
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
            <a href="/join" data-link>انضم إلينا</a>
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
