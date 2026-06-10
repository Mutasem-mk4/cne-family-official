import { renderHome, initLeaderboardScale, initHeroScale } from "./renderers/home.js";
import { renderAbout } from "./renderers/about.js";
import { renderSubjects, initLightbox, initSubjectExplorer } from "./renderers/subjects.js";
import { renderActivities } from "./renderers/activities.js";
import { renderCalculator, initCalculator } from "./renderers/calculator.js";
import { renderTracker, initTrackerControls } from "./renderers/tracker.js";
import { renderLinks } from "./renderers/links.js";
import { renderJoin, initJoinForm } from "./renderers/join.js";
import { renderMap } from "./renderers/map.js";
import { closeMobileMenu, revealPage } from "./dom-utils.js";
import { initWowEffects } from "../wow-scripts.js";

export const ROUTES = {
  "/": renderHome,
  "/about": renderAbout,
  "/subjects": renderSubjects,
  "/plans": renderSubjects,
  "/activities": renderActivities,
  "/calculator": renderCalculator,
  "/tracker": renderTracker,
  "/links": renderLinks,
  "/join": renderJoin,
  "/map": renderMap,
};

export function navigate(path) {
  const target = ROUTES[path] ? path : "/";
  window.history.pushState({}, "", target);
  render(target);
}

export async function render(pathname) {
  const page = document.getElementById("page");
  const renderer = ROUTES[pathname] || renderHome;
  page.innerHTML = await renderer();
  updateActiveLinks(pathname);
  bindPageEvents();
  revealPage();
  initWowEffects();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateActiveLinks(pathname) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === pathname);
  });
}

function bindPageEvents() {
  initLightbox();
  initSubjectExplorer();
  initTrackerControls();
  initCalculator();
  initJoinForm();
  initLeaderboardScale();
  initHeroScale();
}
