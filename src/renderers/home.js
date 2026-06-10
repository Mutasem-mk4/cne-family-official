import { state } from "../state.js";
import { DEFAULT_TECH_TITANS } from "../config.js";
import { layout } from "./layout.js";

export async function renderHome() {
  const techTitans = [...(state.techTitans?.length ? state.techTitans : DEFAULT_TECH_TITANS)].sort(
    (left, right) => Number(right.score || 0) - Number(left.score || 0),
  );
  const quickLinks = state.siteConfig?.quickLinks || [];

  return layout(`
    <section class="home-command reveal">
      <div class="hero-command-board hero-premium">
        <div class="hero-command-background">
          <img src="/assets/images/hero-cne.webp" alt="CNE Family Group" class="hero-image-full">
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
              <strong>${quickLinks.length}</strong>
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
          ${quickLinks.map(
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

function renderTitanFeaturedCard(titan, rank) {
  if (!titan) return "";
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


export function initLeaderboardScale() {
  const board = document.querySelector(".titans-board");
  if (!board) return;

  const updateScale = () => {
    const board = document.querySelector(".titans-board");
    if (!board) return;
    const parent = board.parentElement;
    if (parent && window.innerWidth < 768) {
      const viewportWidth = document.documentElement.clientWidth;
      const scale = Math.min(1, (viewportWidth - 72) / 760);
      board.style.transform = `scale(${scale})`;
      board.style.transformOrigin = "top center";
      parent.style.height = `${board.offsetHeight * scale}px`;
    } else {
      board.style.transform = "";
      board.style.transformOrigin = "";
      if (parent) parent.style.height = "";
    }
  };

  updateScale();
  window.removeEventListener("resize", updateScale);
  window.addEventListener("resize", updateScale);
}

export function initHeroScale() {
  const hero = document.querySelector(".hero-command-board.hero-premium");
  if (!hero) return;

  const updateScale = () => {
    const hero = document.querySelector(".hero-command-board.hero-premium");
    if (!hero) return;
    const parent = hero.parentElement;
    if (parent && window.innerWidth < 768) {
      const viewportWidth = document.documentElement.clientWidth;
      const scale = Math.min(1, (viewportWidth - 64) / 1160);
      hero.style.transform = `scale(${scale})`;
      hero.style.transformOrigin = "top center";
      parent.style.height = `${hero.offsetHeight * scale}px`;
    } else {
      hero.style.transform = "";
      hero.style.transformOrigin = "";
      if (parent) parent.style.height = "";
    }
  };

  updateScale();
  window.removeEventListener("resize", updateScale);
  window.addEventListener("resize", updateScale);
}

