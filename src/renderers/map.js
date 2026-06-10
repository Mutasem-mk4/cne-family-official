import { layout } from "./layout.js";
import { state } from "../state.js";

export async function renderMap() {
  const mapEmbedUrl = state.siteConfig?.mapEmbedUrl;

  return layout(
    `
      <section class="campus-location reveal">
        <div class="campus-head">
          <span class="eyebrow">المقر الرئيسي</span>
          <h2>كلية الهندسة التكنولوجية</h2>
          <p>جامعة البلقاء التطبيقية - عمان، الأردن.</p>
        </div>
        <div class="map-container">
          <iframe 
            src="${mapEmbedUrl}" 
            width="100%" 
            height="550" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </section>
    `,
    {
      heroBanner: {
        label: "خريطة الكلية",
        title: "موقع كلية الهندسة التكنولوجية",
        copy: "تصفح الخريطة التفاعلية للوصول إلى الكلية بسهولة.",
      },
    },
  );
}
