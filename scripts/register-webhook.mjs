import { argv } from "node:process";

const botToken = argv[2] || process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = argv[3];
const secretToken = argv[4] || process.env.TELEGRAM_WEBHOOK_SECRET;

if (!botToken || !webhookUrl) {
  console.log(`
Usage:
  node scripts/register-webhook.mjs <BOT_TOKEN> <WEBHOOK_URL> [SECRET_TOKEN]

Parameters:
  <BOT_TOKEN>      Your Telegram Bot Token (e.g. 8977379555:AAFEu...)
  <WEBHOOK_URL>    Your Vercel deployment webhook URL (e.g. https://cne-family-official.vercel.app/api/telegram-webhook)
  [SECRET_TOKEN]   Optional secret token to authenticate Telegram requests (headers['x-telegram-bot-api-secret-token'])

Alternative:
  Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in environment, then run:
  node scripts/register-webhook.mjs env <WEBHOOK_URL>
`);
  process.exit(1);
}

const resolvedBotToken = botToken === "env" ? process.env.TELEGRAM_BOT_TOKEN : botToken;

if (!resolvedBotToken) {
  console.error("Error: Bot token is missing.");
  process.exit(1);
}

const registerUrl = `https://api.telegram.org/bot${resolvedBotToken}/setWebhook`;
const payload = {
  url: webhookUrl,
  allowed_updates: ["message", "channel_post"],
};

if (secretToken) {
  payload.secret_token = secretToken;
}

console.log(`Registering webhook URL: ${webhookUrl} ...`);
try {
  const response = await fetch(registerUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.ok && data.ok) {
    console.log("✅ Webhook registered successfully!");
    console.log(JSON.stringify(data.result, null, 2));
  } else {
    console.error("❌ Failed to register webhook:");
    console.error(data.description || "Unknown error");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Network error connecting to Telegram API:", error.message);
  process.exit(1);
}
