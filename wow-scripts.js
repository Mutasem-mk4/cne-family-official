export function initWowEffects() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Skip registering layout-thrashing pointer listeners on mobile screens
  if (window.matchMedia("(max-width: 767px)").matches) return;

  document.querySelectorAll(".ribbon-card, .resource-card, .subject-card, .tracker-course").forEach((card) => {
    if (card.dataset.wowBound === "true") return;
    card.dataset.wowBound = "true";

    let rect = null;

    card.addEventListener("pointerenter", () => {
      rect = card.getBoundingClientRect();
    });

    card.addEventListener("pointermove", (event) => {
      if (!rect) {
        rect = card.getBoundingClientRect();
      }
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });

    card.addEventListener("pointerleave", () => {
      rect = null;
    });
  });
}

