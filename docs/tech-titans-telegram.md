# Tech Titans Telegram Sync

Do not store the bot token in the repo. Add it as a GitHub Actions secret named `TELEGRAM_BOT_TOKEN`.

Add these GitHub Actions secrets:

- `TELEGRAM_BOT_TOKEN`: the rotated bot token
- `TELEGRAM_SOURCE_CHAT_ID`: the chat or channel id the bot should read from

For instant updates in Vercel, add these environment variables:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_SOURCE_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`
- `GITHUB_REPO_TOKEN`
- `GITHUB_REPOSITORY`
- `TECH_TITANS_TAG`

Telegram setup checks:

- If this bot already uses a webhook anywhere else, `getUpdates` will not work. Remove the webhook first.
- If you use a group, disable privacy mode in BotFather or the bot may not receive normal messages.
- If you use a channel, add the bot to the channel and make it an admin.
- `TELEGRAM_SOURCE_CHAT_ID` must match the real numeric chat id exactly. Channel ids often start with `-100`.

Workflow:

- GitHub Action: `.github/workflows/tech-titans-sync.yml`
- Manual run: `workflow_dispatch`
- Weekly run: every Saturday at `09:00 UTC`

Instant webhook:

- Vercel function: `/api/telegram-webhook`
- Telegram should post directly to that endpoint
- Each valid message updates the repo immediately, which triggers a fresh deploy

Message format:

1. Send one photo message per Titan from the configured Telegram chat.
2. Include `#techtitans` in the caption.
3. Include a JSON object in the caption.

Example caption:

```json
#techtitans
{"name":"Mutasem","title":"Frontend Lead","score":980,"streak":"12 wins","tone":"blue"}
```

Alternative caption format:

```text
#techtitans
name: Mutasem
title: Frontend Lead
score: 980
streak: 12 wins
tone: blue
```

Supported JSON fields:

- `name`: required
- `title`: required
- `score`: optional numeric value, defaults to `0`
- `streak`: optional label shown under the score
- `tone`: optional, one of `blue`, `green`, `orange`, `red`, `sand`

What the sync updates:

- `public/data/tech-titans.json`
- `public/assets/tech-titans/*`
- `.github/tech-titans-sync-state.json`

Notes:

- The bot must be able to receive updates from that chat. If you use a channel, add the bot there.
- The workflow reads only new Telegram updates after the saved offset.
- If no photo is attached, the site falls back to the CNE icon.
- The sync script now prints chat ids, chat types, and tag detection info when it finds updates that do not match.

Recommended real-time setup:

1. Rotate the bot token in BotFather.
2. In Vercel, set the environment variables listed above.
3. Create a GitHub fine-grained token with contents write access to this repo and store it as `GITHUB_REPO_TOKEN`.
4. Register the Telegram webhook:

```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<your-vercel-domain>/api/telegram-webhook&secret_token=<YOUR_TELEGRAM_WEBHOOK_SECRET>
```

5. Send a photo message with `#techtitans` and the Titan metadata.

Result:

- Telegram calls the Vercel function immediately
- The function updates `public/data/tech-titans.json`
- The function uploads the image to `public/assets/tech-titans/`
- GitHub receives a commit
- Vercel deploys the updated site
