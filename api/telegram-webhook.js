const ALLOWED_TONES = new Set(["blue", "green", "orange", "red", "sand", "pink", "purple", "teal", "yellow", "indigo"]);
const DEFAULT_IMAGE = "/assets/logos/cne-icon.png";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const sourceChatId = process.env.TELEGRAM_SOURCE_CHAT_ID;
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const githubToken = process.env.GITHUB_REPO_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY || "Mutasem-mk4/cne-family-official";
    const tag = (process.env.TECH_TITANS_TAG || "#techtitans").trim().toLowerCase();

    if (!botToken || !sourceChatId || !secretToken || !githubToken) {
      return res.status(500).json({ ok: false, error: "Missing required environment variables" });
    }

    const incomingSecret = req.headers["x-telegram-bot-api-secret-token"];
    if (incomingSecret !== secretToken) {
      return res.status(401).json({ ok: false, error: "Invalid webhook secret" });
    }

    const update = req.body || {};
    const message = update.message || update.channel_post;
    if (!message) return res.status(200).json({ ok: true, ignored: "No message payload" });
    if (String(message.chat?.id) !== String(sourceChatId)) {
      await telegram(botToken, "sendMessage", {
        chat_id: message.chat.id,
        text: `⚠️ عذراً، المشكلة هنا! هذا الجروب/المحادثة تملك الآيدي: ${message.chat.id}\nلكن في إعدادات Vercel تم وضع الآيدي: ${sourceChatId}`
      }).catch(() => {});
      return res.status(200).json({ ok: true, ignored: "Message from different chat" });
    }

    const body = `${message.text || ""}\n${message.caption || ""}`.trim();
    if (!body.toLowerCase().includes(tag)) {
      await telegram(botToken, "sendMessage", {
        chat_id: message.chat.id,
        text: `⚠️ البوت قرأ رسالتك، ولكنه لم يجد الهاشتاج المطلوب (${tag}).\n\nنص الرسالة الذي قرأه البوت هو:\n${body}`
      }).catch(() => {});
      return res.status(200).json({ ok: true, ignored: "Missing Tech Titans tag" });
    }

    const metadata = extractTitanMetadata(body);
    if (!metadata) {
      await telegram(botToken, "sendMessage", {
        chat_id: sourceChatId,
        text: "⚠️ لم أتمكن من قراءة البيانات. تأكد من كتابة المفاتيح (name, title) باللغة الإنجليزية وبشكل صحيح.",
        reply_to_message_id: message.message_id
      }).catch(() => {});
      return res.status(400).json({ ok: false, error: "Could not parse titan metadata" });
    }

    const current = await readRepoJson(repository, githubToken, "public/data/tech-titans.json", {
      generatedAt: new Date().toISOString(),
      source: "telegram-webhook",
      titans: [],
    });

    const titanKey = slugify(metadata.name);
    const image = await downloadMessagePhoto(message, metadata.name, titanKey, repository, githubToken, botToken);

    const nextTitan = {
      name: metadata.name,
      title: metadata.title,
      score: Number(metadata.score || 0),
      streak: metadata.streak || "",
      tone: ALLOWED_TONES.has(metadata.tone) ? metadata.tone : "blue",
      image: image || findExistingTitan(current.titans, titanKey)?.image || DEFAULT_IMAGE,
    };

    const merged = mergeTitan(current.titans, nextTitan);
    const sortedTitans = merged
      .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))
      .slice(0, 5)
      .map((titan, index) => ({
        ...titan,
        badge: String(index + 1).padStart(2, "0"),
      }));

    await writeRepoFile(
      repository,
      githubToken,
      "public/data/tech-titans.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          source: "telegram-webhook",
          titans: sortedTitans,
        },
        null,
        2,
      ) + "\n",
      "Sync Tech Titans from Telegram webhook",
    );

    const rankIndex = sortedTitans.findIndex(t => t.name === nextTitan.name) + 1;
    await telegram(botToken, "sendMessage", {
      chat_id: sourceChatId,
      text: `✅ تم إضافة/تحديث البطل: ${nextTitan.name} في المركز #${rankIndex}\n\nالتحديثات الآن في طريقها للموقع! 🚀`,
      reply_to_message_id: message.message_id
    }).catch(() => {});

    return res.status(200).json({
      ok: true,
      updated: nextTitan.name,
      titans: sortedTitans.length,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function extractTitanMetadata(body) {
  return parseJsonMetadata(body) || parseLineMetadata(body);
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

function mergeTitan(titans, nextTitan) {
  const key = slugify(nextTitan.name);
  const remaining = titans.filter((titan) => slugify(titan.name) !== key);
  return [...remaining, nextTitan];
}

function findExistingTitan(titans, key) {
  return titans.find((titan) => slugify(titan.name) === key);
}

async function downloadMessagePhoto(message, name, titanKey, repository, githubToken, botToken) {
  const photos = [...(message.photo || [])];
  if (!photos.length) return "";

  const bestPhoto = photos.sort((left, right) => (right.file_size || 0) - (left.file_size || 0))[0];
  const fileInfo = await telegram(botToken, "getFile", { file_id: bestPhoto.file_id });
  const ext = extensionFromPath(fileInfo.file_path);
  const webPath = `/assets/tech-titans/${titanKey}${ext}`;

  const response = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`);
  if (!response.ok) throw new Error("Failed to download Telegram image");

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeRepoFile(
    repository,
    githubToken,
    `public/assets/tech-titans/${titanKey}${ext}`,
    bytes,
    `Update Tech Titan image for ${name}`,
  );

  return webPath;
}

async function telegram(botToken, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const jsonPayload = await response.json();
  if (!response.ok || !jsonPayload.ok) {
    throw new Error(`Telegram ${method} failed`);
  }
  return jsonPayload.result;
}

async function readRepoJson(repository, token, repoPath, fallback) {
  const file = await getRepoFile(repository, token, repoPath);
  if (!file) return fallback;
  return JSON.parse(decodeBase64(file.content));
}

async function writeRepoFile(repository, token, repoPath, content, message) {
  const existing = await getRepoFile(repository, token, repoPath);
  const encoded = encodeContent(content);
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${repoPath}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: encoded,
      sha: existing?.sha,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`GitHub write failed for ${repoPath}: ${payload}`);
  }
}

async function getRepoFile(repository, token, repoPath) {
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${repoPath}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub read failed for ${repoPath}`);
  }
  return response.json();
}

function encodeContent(content) {
  if (typeof content === "string") {
    return Buffer.from(content, "utf8").toString("base64");
  }
  return Buffer.from(content).toString("base64");
}

function decodeBase64(value) {
  return Buffer.from(String(value).replace(/\n/g, ""), "base64").toString("utf8");
}

function extensionFromPath(filePath = "") {
  const match = String(filePath).match(/\.[a-zA-Z0-9]+$/);
  return match ? match[0].toLowerCase() : ".jpg";
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
