import sys

file_path = r'C:\Users\User\.gemini\antigravity\scratch\cne-family-redesign\main.js'

new_render_home = """async function renderHome() {
  const subjects = await fetchData('curriculum', '/data/curriculum.json');
  const activities = await fetchData('activities', '/data/activities.json');
  const studentMajor = localStorage.getItem('study_major');
  const progress = JSON.parse(localStorage.getItem('study_progress') || '[]');
  
  // Real stats calculation
  const totalSubjects = subjects.length;
  const recentActivities = activities.slice(0, 3);
  
  let dashboardHtml = '';
  if (studentMajor && studentMajor !== 'all') {
    const majorSubjects = subjects.filter(s => s.major === 'common' || s.major === studentMajor);
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

  // Initialize Search listener after render
  setTimeout(() => initGlobalSearch(subjects, activities), 0);

  return `
    <!-- HERO -->
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

    <!-- STATS -->
    <div class="container" style="margin-top:-2rem;position:relative;z-index:2">
      <div class="stats-bar reveal">
        <div class="stat-item">
          <span class="stat-number" data-count="${totalSubjects}" data-suffix="+">0+</span>
          <span class="stat-label">مادة دراسية</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-count="${activities.length}" data-suffix="+">0+</span>
          <span class="stat-label">فعالية منظمة</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-count="370" data-suffix="+">0+</span>
          <span class="stat-label">مواد مشتركة</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-count="500" data-suffix="+">0+</span>
          <span class="stat-label">طالب مستفيد</span>
        </div>
      </div>
    </div>

    ${dashboardHtml}

    <!-- BENTO TOOLS -->
    <section class="section">
      <div class="section-label reveal">الأدوات الأكاديمية</div>
      <h2 class="section-title reveal">أدوات ذكية لطلاب أذكياء</h2>
      
      <div class="bento-grid">
        <div class="bento-card col-4 accent-blue reveal">
          <div class="card-icon icon-blue">📚</div>
          <div class="card-tag tag-blue">أكاديميا</div>
          <h3 class="card-title">المواد الدراسية</h3>
          <p class="card-desc">أكبر مكتبة منظمة من الملخصات، أسئلة السنوات، والمصادر لجميع المواد.</p>
          <a href="/subjects" class="card-link" data-link>تصفح المصادر ←</a>
        </div>

        <div class="bento-card col-2 accent-red reveal">
          <div class="card-icon icon-red">🗺️</div>
          <h3 class="card-title">متتبع 162 ساعة</h3>
          <p class="card-desc">نظام ذكي لمتابعة تخرجك وفلترة المواد حسب تخصصك.</p>
          <a href="/tracker" class="card-link" data-link>ابدأ التتبع ←</a>
        </div>

        <div class="bento-card col-2 accent-green reveal">
          <div class="card-icon icon-green">🧮</div>
          <h3 class="card-title">حاسبة المعدل</h3>
          <p class="card-desc">حاسبة متخصصة بنظام جامعة البلقاء (4.0/4.0).</p>
          <a href="/calculator" class="card-link" data-link>احسب معدلك ←</a>
        </div>

        <div class="bento-card col-4 accent-orange reveal">
          <div class="card-icon icon-orange">🚀</div>
          <h3 class="card-title">الأنشطة والفعاليات</h3>
          <p class="card-desc">ورش تقنية، رحلات، محاضرات — تجارب تبني شخصيتك المهنية.</p>
          <a href="/activities" class="card-link" data-link>تصفح الأنشطة ←</a>
        </div>
      </div>
    </section>

    <!-- LATEST ACTIVITIES -->
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

function initGlobalSearch(subjects, activities) {
  const input = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.style.display = 'none';
      return;
    }

    const subMatches = subjects.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
    const actMatches = activities.filter(a => a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q)).slice(0, 3);
    
    if (subMatches.length === 0 && actMatches.length === 0) {
      results.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">لا توجد نتائج مطابقة...</div>';
      results.style.display = 'block';
      return;
    }

    results.innerHTML = `
      ${subMatches.map(s => `
        <a href="${s.link || '/subjects'}" class="search-result-item" ${s.link ? 'target="_blank"' : 'data-link'}>
          <div class="search-result-icon" style="background:rgba(53,116,200,0.1)">📚</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.9rem">${s.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">مادة دراسية • السنة ${s.year}</div>
          </div>
        </a>
      `).join('')}
      ${actMatches.map(a => `
        <a href="/activities" class="search-result-item" data-link>
          <div class="search-result-icon" style="background:rgba(242,111,33,0.1)">🚀</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.9rem">${a.title}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">فعالية • ${a.tag}</div>
          </div>
        </a>
      `).join('')}
    `;
    results.style.display = 'block';
  });

  // Close search when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.style.display = 'none';
    }
  });
}"""

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Locate renderHome function
# We know it starts around line 258 and ends around 452 in the previously seen version
# But let's use a more robust regex-like replacement if possible or just string replacement if unique

import re
pattern = r"async function renderHome\(\) \{[\s\S]*?async function renderSubjects\(\)"
# Since I don't want to accidentally delete renderSubjects, I'll match until just before it.

match = re.search(r"async function renderHome\(\) \{[\s\S]*?\n\}", content)
if match:
    new_content = content[:match.start()] + new_render_home + content[match.end():]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated main.js")
else:
    print("Could not find renderHome function")
