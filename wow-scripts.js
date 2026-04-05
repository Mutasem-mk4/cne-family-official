export function initWowEffects() {
  document.querySelectorAll(".feature-card, .spotlight-card, .quick-link-card").forEach((card) => {
    if (card.dataset.wowBound === "true") return;
    card.dataset.wowBound = "true";

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
}
