import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const STATE_PATH = path.join(ROOT, ".github", "tech-titans-sync-state.json");
const OUTPUT_JSON_PATH = path.join(ROOT, "public", "data", "tech-titans.json");
const OUTPUT_ASSETS_DIR = path.join(ROOT, "public", "assets", "tech-titans");
const OUTPUT_WEB_DIR = "/assets/tech-titans";
const ALLOWED_TONES = new Set(["blue", "green", "orange", "red", "sand"]);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SOURCE_CHAT_ID = process.env.TELEGRAM_SOURCE_CHAT_ID;
const REQUIRED_TAG = (process.env.TECH_TITANS_TAG || "#techtitans").trim().toLowerCase();

if (!BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

if (!SOURCE_CHAT_ID) {
  throw new Error("Missing TELEGRAM_SOURCE_CHAT_ID");
}

await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
await fs.mkdir(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
await fs.mkdir(OUTPUT_ASSETS_DIR, { recursive: true });

const state = await readJson(STATE_PATH, { lastUpdateId: 0 });
const updates = await telegram("getUpdates", {
  offset: Number(state.lastUpdateId || 0) + 1,
  limit: 100,
  allowed_updates: ["message", "channel_post"],
});

if (!updates.length) {
  console.log("No new Telegram updates.");
  process.exit(0);
}

const titanMessages = updates
  .map((update) => ({
    updateId: update.update_id,
    payload: update.message || update.channel_post,
  }))
  .filter(({ payload }) => payload && String(payload.chat?.id) === String(SOURCE_CHAT_ID))
  .filter(({ payload }) => {
    const text = `${payload.text || ""}\n${payload.caption || ""}`.toLowerCase();
    return text.includes(REQUIRED_TAG);
  });

const nextState = {
  lastUpdateId: Math.max(...updates.map((update) => update.update_id)),
};

if (!titanMessages.length) {
  await writeJson(STATE_PATH, nextState);
  console.log("No matching Tech Titans updates found.");
  process.exit(0);
}

await clearDirectory(OUTPUT_ASSETS_DIR);

const titans = [];

for (const item of titanMessages) {
  const titan = await parseTitanMessage(item.payload);
  if (titan) titans.push(titan);
}

if (!titans.length) {
  await writeJson(STATE_PATH, nextState);
  console.log("Matching updates found, but none could be parsed.");
  process.exit(0);
}

const sortedTitans = titans
  .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))
  .map((titan, index) => ({
    ...titan,
    badge: String(index + 1).padStart(2, "0"),
  }));

await writeJson(OUTPUT_JSON_PATH, {
  generatedAt: new Date().toISOString(),
  source: "telegram-bot",
  titans: sortedTitans,
});

await writeJson(STATE_PATH, nextState);

console.log(`Synced ${sortedTitans.length} Tech Titans from Telegram.`);

async function parseTitanMessage(message) {
  const metadata = extractTitanMetadata(message);
  if (!metadata) return null;

  const image = await downloadMessagePhoto(message, metadata.name);

  return {
    name: metadata.name,
    title: metadata.title,
    score: Number(metadata.score || 0),
    streak: metadata.streak || "",
    tone: ALLOWED_TONES.has(metadata.tone) ? metadata.tone : "blue",
    image: image || "/assets/logos/cne-icon.png",
  };
}

function extractTitanMetadata(message) {
  const body = (message.caption || message.text || "").trim();
  const jsonMatch = body.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.name || !parsed.title) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function downloadMessagePhoto(message, name) {
  const photos = [...(message.photo || [])];
  if (!photos.length) return "";

  const bestPhoto = photos.sort((left, right) => (right.file_size || 0) - (left.file_size || 0))[0];
  const fileInfo = await telegram("getFile", { file_id: bestPhoto.file_id });
  if (!fileInfo.file_path) return "";

  const ext = path.extname(fileInfo.file_path) || ".jpg";
  const safeName = slugify(name || "titan");
  const fileName = `${safeName}-${bestPhoto.file_unique_id}${ext}`;
  const outputPath = path.join(OUTPUT_ASSETS_DIR, fileName);
  const outputWebPath = `${OUTPUT_WEB_DIR}/${fileName}`;

  const response = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`);
  if (!response.ok) {
    throw new Error(`Failed to download Telegram file: ${fileInfo.file_path}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
  return outputWebPath;
}

async function telegram(method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Telegram API ${method} failed with status ${response.status}`);
  }

  const json = await response.json();
  if (!json.ok) {
    throw new Error(`Telegram API ${method} failed: ${json.description}`);
  }

  return json.result;
}

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function clearDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => fs.rm(path.join(dirPath, entry.name), { force: true })),
  );
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "") || "titan";
}
