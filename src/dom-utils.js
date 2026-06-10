export function initTheme() {
  const saved = localStorage.getItem("theme");
  const theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

export function toggleMobileMenu() {
  document.getElementById("nav-links")?.classList.toggle("is-open");
}

export function closeMobileMenu() {
  document.getElementById("nav-links")?.classList.remove("is-open");
}

export function unregisterLegacyServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  });
}

export function revealPage() {
  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.setProperty("--delay", `${Math.min(index * 70, 350)}ms`);
    requestAnimationFrame(() => element.classList.add("is-visible"));
  });
}
