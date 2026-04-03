(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function s(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(t){if(t.ep)return;t.ep=!0;const n=s(t);fetch(t.href,n)}})();function k(){if(!document.querySelector(".noise-overlay")){const t=document.createElement("div");t.className="noise-overlay",document.body.appendChild(t)}let a=document.querySelector(".custom-cursor-dot"),e=document.querySelector(".custom-cursor-ring");if(window.matchMedia("(pointer: fine)").matches){a||(a=document.createElement("div"),a.className="custom-cursor-dot",document.body.appendChild(a)),e||(e=document.createElement("div"),e.className="custom-cursor-ring",document.body.appendChild(e));let t=window.innerWidth/2,n=window.innerHeight/2,r=t,o=n;window.addEventListener("mousemove",c=>{t=c.clientX,n=c.clientY,a.style.transform=`translate(calc(${t}px - 50%), calc(${n}px - 50%))`});const l=()=>{r+=(t-r)*.15,o+=(n-o)*.15,e.style.transform=`translate(calc(${r}px - 50%), calc(${o}px - 50%))`,requestAnimationFrame(l)};requestAnimationFrame(l),document.querySelectorAll("a, button, .btn, .bento-card, .subject-card, .qa-item").forEach(c=>{c.addEventListener("mouseenter",()=>e.classList.add("hovered")),c.addEventListener("mouseleave",()=>e.classList.remove("hovered"))})}document.querySelectorAll(".btn").forEach(t=>{t.classList.add("magnetic"),t.addEventListener("mousemove",n=>{const r=t.getBoundingClientRect(),o=r.width/2,l=n.clientX-r.left-o,u=n.clientY-r.top-r.height/2;t.style.transform=`translate(${l*.2}px, ${u*.2}px)`}),t.addEventListener("mouseleave",()=>{t.style.transform="translate(0px, 0px)"})}),document.querySelectorAll(".bento-card").forEach(t=>{if(!t.querySelector(".bento-glow")){const n=document.createElement("div");n.className="bento-glow",t.insertBefore(n,t.firstChild)}t.addEventListener("mousemove",n=>{const r=t.getBoundingClientRect(),o=n.clientX-r.left,l=n.clientY-r.top;t.style.setProperty("--mouse-x",`${o}px`),t.style.setProperty("--mouse-y",`${l}px`)})})}async function x(a){a.preventDefault();const e=a.target,s=e.querySelector("button"),i=s.innerHTML;s.disabled=!0,s.innerHTML='<span class="loader"></span> جاري الإرسال...';const t=new FormData(e);try{if((await fetch("https://formspree.io/f/xoqgkyyv",{method:"POST",body:t,headers:{Accept:"application/json"}})).ok)e.innerHTML=`
        <div class="reveal visible" style="text-align:center; padding: 2rem 0;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
          <h3 class="card-title">تم استلام طلبك بنجاح!</h3>
          <p class="card-desc">شكراً لاهتمامك بالانضمام لعائلة CNE. سنتواصل معك عبر البريد الإلكتروني أو رقم الهاتف قريباً.</p>
          <button class="btn btn-outline" style="margin-top:1.5rem" onclick="location.reload()">إرسال طلب آخر</button>
        </div>
      `;else throw new Error("فشل الإرسال")}catch{alert("عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً."),s.disabled=!1,s.innerHTML=i}}const d={};async function b(a,e){if(d[a])return d[a];try{const s=await fetch(e);if(!s.ok)throw new Error;d[a]=await s.json()}catch{d[a]=[]}return d[a]}const j={"/":f,"/subjects":T,"/plans":M,"/activities":O,"/join":H};function C(a){window.history.pushState({},"",a),g(a)}async function g(a){const e=document.getElementById("page"),i=await(j[a]||f)();e.innerHTML=i,e.classList.remove("page-enter"),e.offsetWidth,e.classList.add("page-enter"),E(a),setTimeout(()=>{q(),L(),a==="/plans"&&S(),k()},100)}window.addEventListener("popstate",()=>g(window.location.pathname));document.addEventListener("click",a=>{const e=a.target.closest("[data-link]");e&&(a.preventDefault(),C(e.getAttribute("href")))});window.addEventListener("scroll",()=>{document.getElementById("navbar").classList.toggle("scrolled",window.scrollY>20)},{passive:!0});function E(a){document.querySelectorAll(".nav-link").forEach(e=>{e.classList.toggle("active",e.getAttribute("href")===a)})}function q(){const a=document.querySelectorAll(".reveal");if(!a.length)return;const e=new IntersectionObserver(s=>{s.forEach((i,t)=>{i.isIntersecting&&(setTimeout(()=>i.target.classList.add("visible"),t*80),e.unobserve(i.target))})},{threshold:.1});a.forEach(s=>e.observe(s))}function L(){const a=document.querySelectorAll("[data-count]");if(!a.length)return;const e=new IntersectionObserver(s=>{s.forEach(i=>{if(!i.isIntersecting)return;const t=i.target,n=parseInt(t.dataset.count),r=t.dataset.suffix||"";let o=0;const l=2e3,u=performance.now(),c=y=>{const m=Math.min((y-u)/l,1),w=1-Math.pow(2,-10*m);o=Math.floor(w*n),t.textContent=o+r,m<1&&requestAnimationFrame(c)};requestAnimationFrame(c),e.unobserve(t)})},{threshold:.5});a.forEach(s=>e.observe(s))}function S(){document.querySelectorAll(".plan-card .btn").forEach(e=>{e.addEventListener("click",s=>{const i=e.getAttribute("href");(i.endsWith(".jpg")||i.endsWith(".png"))&&(s.preventDefault(),$(i))})})}function $(a){const e=document.createElement("div");e.style=`
    position: fixed; inset: 0; background: rgba(0,0,0,0.9); 
    display: flex; align-items: center; justify-content: center; 
    z-index: 1000; backdrop-filter: blur(8px); cursor: zoom-out;
    opacity: 0; transition: opacity 0.3s var(--ease);
  `,e.innerHTML=`
    <div style="position:relative; max-width: 90%; max-height: 90%;">
      <img src="${a}" style="max-width:100%; max-height:90vh; border-radius: 8px; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
      <button style="position:absolute; top:-40px; right:0; color:white; background:none; font-size:2rem;">&times;</button>
    </div>
  `,document.body.appendChild(e),setTimeout(()=>e.style.opacity="1",10),e.onclick=()=>{e.style.opacity="0",setTimeout(()=>e.remove(),300)}}function A(){document.querySelectorAll(".tab-btn").forEach(a=>{a.addEventListener("click",()=>{a.closest(".tab-bar").querySelectorAll(".tab-btn").forEach(i=>i.classList.remove("active")),a.classList.add("active");const s=a.dataset.tab;document.querySelectorAll(".tab-content").forEach(i=>{i.style.display=i.dataset.content===s?"grid":"none"})})})}function B(a,e){const s=document.getElementById(a);s&&s.addEventListener("input",()=>{const i=s.value.trim().toLowerCase();document.querySelectorAll(e).forEach(t=>{const n=t.textContent.toLowerCase();t.style.display=n.includes(i)?"":"none"})})}const h={1:{bg:"rgba(53,116,200,.1)",color:"var(--blue)"},2:{bg:"rgba(76,175,80,.1)",color:"var(--green)"},3:{bg:"rgba(242,111,33,.1)",color:"var(--orange)"},4:{bg:"rgba(221,59,63,.1)",color:"var(--red)"}},F={أكاديمي:"tag-green",تقني:"tag-blue",اجتماعي:"tag-red",ريادة:"tag-yellow",ترفيهي:"tag-orange"};function p(a){return!a||a.length===0?'<div style="text-align:center;padding:3rem;color:var(--text-muted)">لا توجد مواد بعد — قم بإضافتها من لوحة التحكم</div>':a.map(e=>{const s=e.file&&e.file!==""?e.file:e.link||"#",i=parseInt(e.year)||1;return`
    <a href="${s}" target="_blank" rel="noopener" class="subject-card">
      <div class="subject-card-left">
        <div class="subject-year" style="background:${h[i].bg}; color:${h[i].color}">
          ${i}
        </div>
        <span class="subject-name">${e.name}</span>
      </div>
      <svg class="subject-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </a>
  `}).join("")}function f(){return`
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
    ${v()}
  `}async function T(){const a=await b("subjects","/data/subjects.json"),e=a.filter(t=>t.major==="computer"),s=a.filter(t=>t.major==="network"),i=a.filter(t=>t.major==="common");return setTimeout(A,0),setTimeout(()=>B("subjectSearch",".subject-card"),0),`
    <div class="page-header">
      <div class="breadcrumb reveal">
        <a href="/" data-link>الرئيسية</a>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        المواد الدراسية
      </div>
      <h1 class="section-title reveal">المواد الدراسية</h1>
      <p class="section-subtitle reveal">اختر تخصصك للوصول إلى الملخصات والنماذج لكل مادة.</p>

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:1.5rem;">
        <div class="tab-bar reveal">
          <button class="tab-btn active" data-tab="computer">هندسة حاسوب</button>
          <button class="tab-btn" data-tab="network">هندسة شبكات</button>
          <button class="tab-btn" data-tab="common">مشترك</button>
        </div>
        <div class="search-wrap reveal">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="subjectSearch" placeholder="ابحث عن مادة..." style="background:var(--glass-bg); backdrop-filter:blur(8px);">
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:4rem">
      <div class="subject-grid tab-content" data-content="computer">
        ${p(e)}
      </div>
      <div class="subject-grid tab-content" data-content="network" style="display:none">
        ${p(s)}
      </div>
      <div class="subject-grid tab-content" data-content="common" style="display:none">
        ${p(i)}
      </div>
    </div>
    ${v()}
  `}function M(){return`
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
    ${v()}
  `}async function O(){const a=await b("activities","/data/activities.json");return`
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
        ${a.length===0?'<div style="text-align:center;padding:4rem;color:var(--text-muted)">لا توجد أنشطة بعد — قم بإضافتها من لوحة التحكم</div>':a.map(s=>{const i=F[s.tag]||"tag-blue",t=s.image?`<img src="${s.image}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;">`:`<span style="font-size:3rem">${s.emoji||"🚀"}</span>`;return`
          <div class="activity-card reveal">
            <div class="activity-img" style="background:${s.bg_gradient||s.bg||"linear-gradient(135deg,#DBEAFE,#BFDBFE)"}">${t}</div>
            <div class="activity-body">
              <div class="activity-meta">
                <span class="card-tag ${i}" style="margin:0">${s.tag}</span>
                <span class="activity-date">${s.date}</span>
              </div>
              <h3 class="activity-title">${s.title}</h3>
              <p class="activity-desc">${s.description||s.desc||""}</p>
            </div>
          </div>
        `}).join("")}
      </div>
    </div>
    ${v()}
  `}function H(){return window.handleJoinSubmit=x,`
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
    ${v()}
  `}function v(){return`
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
  `}g(window.location.pathname);
