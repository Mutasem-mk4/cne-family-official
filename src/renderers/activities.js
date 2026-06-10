import { layout } from "./layout.js";
import { state } from "../state.js";

export async function renderActivities() {
  return layout(
    `
      <section class="activity-wall reveal">
        ${state.activities.map(renderActivityCard).join("")}
      </section>
    `,
    {
      heroBanner: {
        label: "الأنشطة",
        title: "أنشطة وفعاليات المجتمع الطلابي",
        copy: "عرض أبسط للفعاليات مع تركيز على العنوان والمحتوى.",
      },
    },
  );
}

function renderActivityCard(activity) {
  return `
    <article class="activity-card">
      <div class="activity-cover" style="background:${activity.bg_gradient || "linear-gradient(135deg,#1f5eff,#10203c)"}">
        <span>${activity.emoji || "✨"}</span>
      </div>
      <div class="activity-body">
        <div class="activity-meta">
          <span>${activity.date || ""}</span>
          <span>${activity.tag || activity.type || "فعالية"}</span>
        </div>
        <h3>${activity.title}</h3>
        <p>${activity.description || activity.desc || ""}</p>
      </div>
    </article>
  `;
}
