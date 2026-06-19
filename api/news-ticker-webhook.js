export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const botToken = process.env.NEWS_BOT_TOKEN;
    const sourceChatId = process.env.TELEGRAM_SOURCE_CHAT_ID;
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const githubToken = process.env.GITHUB_REPO_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY || "Mutasem-mk4/cne-family-official";
    const tag = (process.env.NEWS_TICKER_TAG || "#news").trim().toLowerCase();

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
      return res.status(200).json({ ok: true, ignored: "Message from different chat" });
    }

    const body = `${message.text || ""}\n${message.caption || ""}`.trim();
    if (!body.toLowerCase().includes(tag)) {
      return res.status(200).json({ ok: true, ignored: "Missing news tag" });
    }

    const newsItems = extractNewsItems(body, tag);
    if (!newsItems) {
      await telegram(botToken, "sendMessage", {
        chat_id: sourceChatId,
        text: `⚠️ لم يتم العثور على أي أخبار صالحة. يرجى كتابة قائمة الأخبار بوضع كل خبر في سطر جديد ومسبوقاً بنقطة (مثل - أو *).`,
        reply_to_message_id: message.message_id
      }).catch(() => {});
      return res.status(200).json({ ok: false, error: "Could not parse news items" });
    }

    await writeRepoFile(
      repository,
      githubToken,
      "public/data/news-ticker.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          source: "telegram-webhook-news",
          items: newsItems,
        },
        null,
        2,
      ) + "\n",
      "Sync News Ticker from Telegram webhook",
    );

    await telegram(botToken, "sendMessage", {
      chat_id: sourceChatId,
      text: `✅ تم تحديث شريط الأخبار بنجاح بـ ${newsItems.length} خبر/أخبار.\n\nالتحديثات الآن في طريقها للموقع! 🚀`,
      reply_to_message_id: message.message_id
    }).catch(() => {});

    return res.status(200).json({
      ok: true,
      updated: "news-ticker",
      count: newsItems.length,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export function extractNewsItems(body, tag) {
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
