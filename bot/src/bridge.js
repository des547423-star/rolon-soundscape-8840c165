import express from "express";
import { syncQueue } from "./index.js";

export function startBridge(client, kazagumo) {
  const app = express();
  app.use(express.json());

  // Optional shared-secret auth
  app.use((req, res, next) => {
    const secret = process.env.BRIDGE_SECRET;
    if (!secret) return next();
    if (req.headers["x-bridge-secret"] === secret || req.path === "/health") return next();
    return res.status(401).json({ error: "unauthorized" });
  });

  // CORS so the dashboard can call us
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Bridge-Secret");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get("/health", (_, res) => res.json({ ok: true, guilds: client.guilds.cache.size, players: kazagumo.players.size }));

  const need = (req, res) => {
    const p = kazagumo.players.get(req.body.guildId);
    if (!p) { res.status(404).json({ error: "no_player" }); return null; }
    return p;
  };

  app.post("/api/play", async (req, res) => {
    const { guildId, query, userId } = req.body;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: "no_guild" });
    let player = kazagumo.players.get(guildId);
    if (!player) {
      const member = userId ? await guild.members.fetch(userId).catch(() => null) : null;
      const vc = member?.voice?.channel;
      if (!vc) return res.status(400).json({ error: "user_not_in_voice" });
      player = await kazagumo.createPlayer({ guildId, textId: vc.id, voiceId: vc.id, volume: 80 });
    }
    const result = await kazagumo.search(query, { requester: { id: userId ?? "dashboard", username: "Dashboard" } });
    if (!result.tracks.length) return res.status(404).json({ error: "no_results" });
    for (const t of (result.type === "PLAYLIST" ? result.tracks : [result.tracks[0]])) player.queue.add(t);
    if (!player.playing && !player.paused) player.play();
    await syncQueue(player);
    res.json({ ok: true, added: result.type === "PLAYLIST" ? result.tracks.length : 1 });
  });

  app.post("/api/pause", (req, res) => { const p = need(req, res); if (!p) return; p.pause(true); res.json({ ok: true }); });
  app.post("/api/resume", (req, res) => { const p = need(req, res); if (!p) return; p.pause(false); res.json({ ok: true }); });
  app.post("/api/skip", (req, res) => { const p = need(req, res); if (!p) return; p.skip(); res.json({ ok: true }); });
  app.post("/api/stop", (req, res) => { const p = need(req, res); if (!p) return; p.destroy(); res.json({ ok: true }); });
  app.post("/api/shuffle", async (req, res) => { const p = need(req, res); if (!p) return; p.queue.shuffle(); await syncQueue(p); res.json({ ok: true }); });
  app.post("/api/loop", (req, res) => {
    const p = need(req, res); if (!p) return;
    const modes = ["none", "track", "queue"]; const cur = p.loop ?? "none";
    p.setLoop(modes[(modes.indexOf(cur) + 1) % modes.length]); res.json({ ok: true, loop: p.loop });
  });
  app.post("/api/volume", (req, res) => { const p = need(req, res); if (!p) return; p.setVolume(req.body.volume); res.json({ ok: true }); });
  app.post("/api/clear", async (req, res) => { const p = need(req, res); if (!p) return; p.queue.clear(); await syncQueue(p); res.json({ ok: true }); });
  app.post("/api/remove", async (req, res) => {
    const p = need(req, res); if (!p) return;
    const { trackId } = req.body;
    const idx = p.queue.findIndex((t) => t.identifier === trackId || t.uri === trackId);
    if (idx >= 0) p.queue.remove(idx);
    await syncQueue(p); res.json({ ok: true });
  });

  const port = Number(process.env.BRIDGE_PORT ?? 8787);
  app.listen(port, () => console.log(`[Bridge] HTTP API on :${port}`));
}
