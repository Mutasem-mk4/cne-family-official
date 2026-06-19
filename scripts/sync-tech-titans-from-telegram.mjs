import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const STATE_PATH = path.join(ROOT, ".github", "tech-titans-sync-state.json");
const OUTPUT_JSON_PATH = path.join(ROOT, "public", "data", "tech-titans.json");
const OUTPUT_ASSETS_DIR = path.join(ROOT, "public", "assets", "tech-titans");
const OUTPUT_WEB_DIR = "/assets/tech-titans";
const ALLOWED_TONES = new Set(["blue", "green", "orange", "red", "sand", "pink", "purple", "teal", "yellow", "indigo"]);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NEWS_BOT_TOKEN = process.env.NEWS_BOT_TOKEN;
const SOURCE_CHAT_ID = process.env.TELEGRAM_SOURCE_CHAT_ID;
const TITANS_TAG = (process.env.TECH_TITANS_TAG || "#techtitans").trim().toLowerCase();
const NEWS_TAG = (process.env.NEWS_TICKER_TAG || "#news").trim().toLowerCase();

if (!SOURCE_CHAT_ID) {
  throw new Error("Missing TELEGRAM_SOURCE_CHAT_ID");
}

await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
await fs.mkdir(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
await fs.mkdir(OUTPUT_ASSETS_DIR, { recursive: true });

// Read the unified state tracking offsets for both bots
const state = await readJson(STATE_PATH, { lastUpdateIdTitans: 0, lastUpdateIdNews: 0 });

// Helper to make API calls to Telegram with a specific token
async function telegram(token, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
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

// 1. Process Tech Titans Leaderboard (using TELEGRAM_BOT_TOKEN)
if (TELEGRAM_BOT_TOKEN) {
  console.log("Checking Tech Titans updates...");
  try {
    const webhookInfo = await telegram(TELEGRAM_BOT_TOKEN, "getWebhookInfo", {});
    if (webhookInfo.url) {
      console.warn(`[Titans] Webhook is active (${webhookInfo.url}). Skipping getUpdates for Titans.`);
    } else {
      const updates = await telegram(TELEGRAM_BOT_TOKEN, "getUpdates", {
        offset: Number(state.lastUpdateIdTitans || 0) + 1,
        limit: 100,
        allowed_updates: ["message", "channel_post"],
      });

      if (updates.length > 0) {
        const titanMessages = [];
        for (const update of updates) {
          const payload = update.message || update.channel_post;
          if (payload && String(payload.chat?.id) === String(SOURCE_CHAT_ID)) {
            const text = `${payload.text || ""}\n${payload.caption || ""}`.toLowerCase();
            if (text.includes(TITANS_TAG)) {
              titanMessages.push(payload);
            }
          }
        }

        if (titanMessages.length > 0) {
          const titans = [];
          for (const message of titanMessages) {
            const titan = await parseTitanMessage(message, TELEGRAM_BOT_TOKEN);
            if (titan) titans.push(titan);
          }

          if (titans.length > 0) {
            await clearDirectory(OUTPUT_ASSETS_DIR);
            const sortedTitans = titans
              .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))
              .slice(0, 5)
              .map((titan, index) => ({
                ...titan,
                badge: String(index + 1).padStart(2, "0"),
              }));

            await writeJson(OUTPUT_JSON_PATH, {
              generatedAt: new Date().toISOString(),
              source: "telegram-bot-titans",
              titans: sortedTitans,
            });
            console.log(`[Titans] Synced ${sortedTitans.length} Tech Titans.`);
          }
        }

        state.lastUpdateIdTitans = Math.max(...updates.map((u) => u.update_id));
        await writeJson(STATE_PATH, state);
      } else {
        console.log("[Titans] No new updates.");
      }
    }
  } catch (error) {
    console.error("[Titans] Error syncing:", error.message);
  }
} else {
  console.log("TELEGRAM_BOT_TOKEN not set, skipping Titans sync.");
}

// 2. Process News Ticker (using NEWS_BOT_TOKEN)
if (NEWS_BOT_TOKEN) {
  console.log("Checking News Ticker updates...");
  try {
    const webhookInfo = await telegram(NEWS_BOT_TOKEN, "getWebhookInfo", {});
    if (webhookInfo.url) {
      console.warn(`[News] Webhook is active (${webhookInfo.url}). Skipping getUpdates for News.`);
    } else {
      const updates = await telegram(NEWS_BOT_TOKEN, "getUpdates", {
        offset: Number(state.lastUpdateIdNews || 0) + 1,
        limit: 100,
        allowed_updates: ["message", "channel_post"],
      });

      if (updates.length > 0) {
        const newsMessages = [];
        for (const update of updates) {
          const payload = update.message || update.channel_post;
          if (payload && String(payload.chat?.id) === String(SOURCE_CHAT_ID)) {
            const text = `${payload.text || ""}\n${payload.caption || ""}`.toLowerCase();
            if (text.includes(NEWS_TAG)) {
              newsMessages.push(payload);
            }
          }
        }

        if (newsMessages.length > 0) {
          const latestNewsMsg = newsMessages[newsMessages.length - 1];
          const body = `${latestNewsMsg.text || ""}\n${latestNewsMsg.caption || ""}`.trim();
          const newsItems = extractNewsItems(body, NEWS_TAG);
          if (newsItems) {
            const tickerPath = path.join(ROOT, "public", "data", "news-ticker.json");
            await writeJson(tickerPath, {
              generatedAt: new Date().toISOString(),
              source: "telegram-bot-news",
              items: newsItems,
            });
            console.log(`[News] Synced ${newsItems.length} news items.`);
          }
        }

        state.lastUpdateIdNews = Math.max(...updates.map((u) => u.update_id));
        await writeJson(STATE_PATH, state);
      } else {
        console.log("[News] No new updates.");
      }
    }
  } catch (error) {
    console.error("[News] Error syncing:", error.message);
  }
} else {
  console.log("NEWS_BOT_TOKEN not set, skipping News sync.");
}

async function parseTitanMessage(message, token) {
  const metadata = extractTitanMetadata(message);
  if (!metadata) return null;

  const image = await downloadMessagePhoto(message, metadata.name, token);

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
  return parseJsonMetadata(body) || parseLineMetadata(body);
}

async function downloadMessagePhoto(message, name, token) {
  const photos = [...(message.photo || [])];
  if (!photos.length) return "";

  const bestPhoto = photos.sort((left, right) => (right.file_size || 0) - (left.file_size || 0))[0];
  const fileInfo = await telegram(token, "getFile", { file_id: bestPhoto.file_id });
  if (!fileInfo.file_path) return "";

  const ext = path.extname(fileInfo.file_path) || ".jpg";
  const safeName = slugify(name || "titan");
  const fileName = `${safeName}-${bestPhoto.file_unique_id}${ext}`;
  const outputPath = path.join(OUTPUT_ASSETS_DIR, fileName);
  const outputWebPath = `${OUTPUT_WEB_DIR}/${fileName}`;

  const response = await fetch(`https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`);
  if (!response.ok) {
    throw new Error(`Failed to download Telegram file: ${fileInfo.file_path}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
  return outputWebPath;
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

function parseJsonMetadata(body) {
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

function parseLineMetadata(body) {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));

  if (!lines.length) return null;

  const data = {};

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_]+)\s*:\s*(.+)$/);
    if (!match) continue;
    const [, key, value] = match;
    data[key.toLowerCase()] = value.trim();
  }

  if (!data.name || !data.title) return null;

  return {
    name: data.name,
    title: data.title,
    score: Number(data.score || 0),
    streak: data.streak || "",
    tone: data.tone || "blue",
  };
}

function extractNewsItems(body, tag) {
  const cleanBody = body.replace(new RegExp(tag, "gi"), "").trim();
  if (!cleanBody) return null;

  const lines = cleanBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];
  for (const line of lines) {
    const match = line.match(/^(?:[-–—_*•▪▫○●✓✔]|\d+[\.\)]?)\s*(.+)$/);
    if (match) {
      items.push(match[1].trim());
    } else {
      items.push(line);
    }
  }

  return items.length ? items : null;
}
