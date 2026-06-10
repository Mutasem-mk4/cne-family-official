import { layout } from "./layout.js";
import { state } from "../state.js";

export function renderJoin() {
  return layout(
    `
      <section class="join-layout reveal">
        <article class="join-copy">
          <span class="eyebrow">الانضمام</span>
          <h2>اترك بياناتك وسنتواصل معك.</h2>
          <p>إذا كنت تريد المشاركة أو الاستفسار، أرسل بياناتك عبر هذا النموذج.</p>
        </article>
        <form id="join-form" class="join-form">
          <label>
            <span>الاسم الكامل</span>
            <input name="name" required placeholder="اكتب اسمك الكامل" />
          </label>
          <label>
            <span>الرقم الجامعي</span>
            <input name="student_id" required placeholder="مثال: 32019..." />
          </label>
          <label>
            <span>وسيلة التواصل</span>
            <input name="contact" required placeholder="بريد إلكتروني أو رقم هاتف" />
          </label>
          <button class="btn btn-primary" type="submit">إرسال الطلب</button>
        </form>
      </section>
    `,
    {
      heroBanner: {
        label: "التواصل والانضمام",
        title: "نموذج بسيط للانضمام والتواصل",
        copy: "التركيز هنا على الإجراء الأساسي فقط.",
      },
    },
  );
}

export function initJoinForm() {
  const form = document.getElementById("join-form");
  if (!form) return;
  const joinEndpoint = state.siteConfig?.joinEndpoint;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "جارٍ الإرسال...";

    try {
      if (!joinEndpoint) throw new Error("missing join endpoint");
      const response = await fetch(joinEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("submit failed");
      form.innerHTML = `
        <div class="form-success">
          <span class="material-symbols-outlined">verified</span>
          <h3>تم إرسال طلبك</h3>
          <p>سيتم التواصل معك قريباً عبر البيانات التي أدخلتها.</p>
        </div>
      `;
    } catch {
      button.disabled = false;
      button.textContent = originalText;
      alert("تعذر إرسال الطلب حالياً. حاول لاحقاً.");
    }
  });
}
