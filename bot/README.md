# RolonBot — Discord Bot

The runtime Discord music bot. Runs Discord.js v14 + Kazagumo on top of a Lavalink audio node and exposes an HTTP bridge that the web dashboard calls.

> This folder cannot run inside the Lovable preview (Cloudflare Workers can't keep a persistent Discord gateway connection open). Deploy it to a VPS, Railway, Fly.io, or any Docker host.

## Quick start (Docker — recommended)

```bash
cd bot
cp .env.example .env
# fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
docker compose up -d --build
docker compose exec bot npm run register   # one-time: register slash commands
```

The bot will:
- connect to Discord
- connect to the bundled Lavalink node
- start the HTTP bridge on `:8787`
- sync every guild + queue change into Lovable Cloud in real time

## Manual (Node 20+)

```bash
cd bot
cp .env.example .env
npm install
# start a Lavalink 4 node separately, then:
npm run register
npm start
```

## Wire the dashboard to the bot

In the Lovable web project, set the env var:

```
VITE_BOT_API_URL=https://your-bot-host:8787
```

(and add `BRIDGE_SECRET` to the dashboard fetch calls if you turn auth on).

## Architecture

```
[Discord] ⇄ [Discord.js client]
                   ↓ uses
              [Kazagumo] ⇄ [Lavalink node]
                   ↓ writes
              [Lovable Cloud DB] ⇄ [Web dashboard]  (realtime)
                   ↑
              [Express bridge :8787] ← REST calls from dashboard
```

## Slash commands registered

play · pause · resume · skip · stop · queue · nowplaying · volume · shuffle · loop · seek · clear · ping · invite

## Where to get secrets

- `DISCORD_TOKEN` / `DISCORD_CLIENT_ID` — https://discord.com/developers/applications
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Lovable project Connectors → Lovable Cloud → Backend
