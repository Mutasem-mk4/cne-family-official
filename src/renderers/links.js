import { layout } from "./layout.js";
import { state } from "../state.js";

export function renderLinks() {
  const quickLinks = state.siteConfig?.quickLinks || [];

  return layout(
    `
      <section class="links-page reveal">
        <section class="links-intro">
          <span class="eyebrow">الروابط الأساسية</span>
          <h2>اختر المنصة التي تريد فتحها</h2>
          <p>روابط مباشرة إلى أهم المنصات الرسمية التي يحتاجها الطالب يومياً.</p>
        </section>

        <section class="links-board">
        ${quickLinks.map(
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
