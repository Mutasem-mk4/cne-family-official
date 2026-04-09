# Tech Titans Telegram Sync

Do not store the bot token in the repo. Add it as a GitHub Actions secret named `TELEGRAM_BOT_TOKEN`.

Add these GitHub Actions secrets:

- `TELEGRAM_BOT_TOKEN`: the rotated bot token
- `TELEGRAM_SOURCE_CHAT_ID`: the chat or channel id the bot should read from

Workflow:

- GitHub Action: `.github/workflows/tech-titans-sync.yml`
- Manual run: `workflow_dispatch`
- Weekly run: every Saturday at `09:00 UTC`

Message format:

1. Send one photo message per Titan from the configured Telegram chat.
2. Include `#techtitans` in the caption.
3. Include a JSON object in the caption.

Example caption:

```json
#techtitans
{"name":"Mutasem","title":"Frontend Lead","score":980,"streak":"12 wins","tone":"blue"}
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
