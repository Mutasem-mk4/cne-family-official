import { state } from "../state.js";

export function layout(content, options = {}) {
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

export function renderFooter() {
  const socialLinks = state.siteConfig?.socialLinks || [];

  return `
    <footer class="site-footer">
      <div class="footer-brand">
        <img src="/assets/logos/cne-icon.png" alt="CNE logo" />
        <strong> CNE Family </strong>
      </div>
      <div class="footer-nav">
        <a href="/" data-link>الرئيسية</a>
        <a href="/about" data-link>عن المنصة</a>
        <a href="/subjects" data-link>المواد</a>
        <a href="/map" data-link>الخريطة</a>
        <a href="/tracker" data-link>المتتبع</a>
      </div>
      <div class="footer-social">
        ${socialLinks.map(renderSocialLink).join("")}
      </div>
    </footer>
  `;
}

function renderSocialLink(link) {
  return `
    <a href="${link.href}" target="_blank" rel="noopener" class="social-link social-${link.type}">
      ${renderSocialIcon(link.type)}
      <span>${link.label}</span>
    </a>
  `;
}

function renderSocialIcon(type) {
  const icons = {
    chat: `
      <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 3 3.8 10.1c-.9.4-.9 1.7.1 2l6.2 1.9 1.9 6.2c.3 1 1.6 1 2 .1L21 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <path d="m10.2 13.8 4.4-4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    `,
    instagram: `
      <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
      </svg>
    `,
    facebook: `
      <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M14.2 8.2V6.7c0-.7.2-1.1 1.2-1.1h1.7V2.7c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.2H7.3v3.3h2.9v10h3.6v-10h2.9l.5-3.3h-3Z" />
      </svg>
    `,
    youtube: `
      <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 8.9 2 12 2 12s0 3.1.4 4.9A3 3 0 0 0 4.5 19c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.8.4-4.9.4-4.9s0-3.1-.4-4.9ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
      </svg>
    `,
  };

  return icons[type] || icons.chat;
}
