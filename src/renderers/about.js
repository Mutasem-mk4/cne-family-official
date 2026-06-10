import { layout } from "./layout.js";
import { state } from "../state.js";

export async function renderAbout() {
  const team = state.team;

  return layout(
    `
      <div class="about-desktop-wrapper">
        <section class="team-structure reveal">
          <div class="org-chart">
            ${team.map(group => `
              <div class="org-group">
                <h3 class="org-role-title">${group.role}</h3>
                <div class="org-members-grid-v3">
                  ${group.members.map(member => `
                    <div class="org-member-card-v3">
                      <div class="member-avatar">
                        <img src="${member.image}" alt="${member.name}" onerror="this.src='/assets/logos/cne-icon.png'">
                      </div>
                      <div class="member-info">
                        <strong>${member.name}</strong>
                        <span>${member.title}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="about-scene reveal">
          <article class="about-panel">
            <span class="material-symbols-outlined icon-large">rocket_launch</span>
            <h3>الرسالة</h3>
            <p>تقديم محتوى أكاديمي واضح وسهل الوصول لكل طالب.</p>
          </article>
          <article class="about-panel">
            <span class="material-symbols-outlined icon-large">visibility</span>
            <h3>الرؤية</h3>
            <p>منصة طلابية موثوقة وسريعة وسهلة الاستخدام عالمياً.</p>
          </article>
          <article class="about-panel">
            <span class="material-symbols-outlined icon-large">verified_user</span>
            <h3>القيمة</h3>
            <p>تنظيم أفضل ووقت أقل ضائع لضمان تميز الطالب.</p>
          </article>
        </section>
      </div>
    `
  );
}
