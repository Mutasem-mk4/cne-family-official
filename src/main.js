import { loadData } from "./state.js";
import { initTheme, toggleTheme, toggleMobileMenu, closeMobileMenu, unregisterLegacyServiceWorkers } from "./dom-utils.js";
import { render, navigate, ROUTES } from "./router.js";

async function bootstrap() {
  await loadData();
  initTheme();
  bindGlobalEvents();
  await render(window.location.pathname);
  unregisterLegacyServiceWorkers();
}

function bindGlobalEvents() {
  window.addEventListener("popstate", () => render(window.location.pathname));

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-link]");
    if (!link) return;
    event.preventDefault();
    closeMobileMenu();
    navigate(link.getAttribute("href"));
  });

  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("mobile-menu-btn")?.addEventListener("click", toggleMobileMenu);

  window.addEventListener(
    "scroll",
    () => {
      document.getElementById("navbar")?.classList.toggle("is-scrolled", window.scrollY > 16);
    },
    { passive: true },
  );
}

bootstrap().catch((error) => {
  console.error(error);
  const page = document.getElementById("page");
  if (page) {
    page.innerHTML = `
      <section class="error-state">
        <h1>تعذر تحميل الواجهة</h1>
        <p>حدث خطأ أثناء جلب البيانات الأساسية للموقع.</p>
      </section>
    `;
  }
});
