import { DEFAULT_TECH_TITANS, DEFAULT_SITE_CONFIG } from "./config.js";

export const state = {
  subjects: [],
  activities: [],
  curriculum: [],
  techTitans: [],
  team: [],
  siteConfig: null,
  major: localStorage.getItem("study_major") || "computer",
};

export async function loadData() {
  const [subjectsPayload, activitiesPayload, curriculumPayload, techTitansPayload, teamPayload, siteConfigPayload] = await Promise.all([
    fetchJSON("/data/subjects.json"),
    fetchJSON("/data/activities.json"),
    fetchJSON("/data/curriculum.json"),
    fetchJSON("/data/tech-titans.json").catch(() => ({ titans: DEFAULT_TECH_TITANS })),
    fetchJSON("/data/team.json").catch(() => ({ groups: [] })),
    fetchJSON("/data/site-config.json").catch(() => DEFAULT_SITE_CONFIG),
  ]);

  state.subjects = subjectsPayload.subjects || [];
  state.activities = activitiesPayload || [];
  state.curriculum = curriculumPayload.curriculum || [];
  state.techTitans = techTitansPayload.titans?.length ? techTitansPayload.titans : DEFAULT_TECH_TITANS;
  state.team = teamPayload.groups || [];
  state.siteConfig = { ...DEFAULT_SITE_CONFIG, ...siteConfigPayload };
}

export async function fetchJSON(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}
