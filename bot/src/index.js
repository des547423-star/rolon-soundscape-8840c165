import "dotenv/config";
import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import { Kazagumo, Plugins } from "kazagumo";
import { Connectors } from "shoukaku";
import { startBridge } from "./bridge.js";
import { registerEvents } from "./events.js";
import { handleInteraction } from "./commands/index.js";
import { syncGuild, incrementSongsPlayed, logPlay, upsertBotStats } from "./db.js";

const required = ["DISCORD_TOKEN", "LAVALINK_HOST", "LAVALINK_PASSWORD", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const k of required) if (!process.env[k]) { console.error(`Missing env: ${k}`); process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const kazagumo = new Kazagumo(
  {
    defaultSearchEngine: "youtube",
    plugins: [],
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  [{
    name: "main",
    url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
    auth: process.env.LAVALINK_PASSWORD,
    secure: process.env.LAVALINK_SECURE === "true",
  }],
);

client.kazagumo = kazagumo;

kazagumo.shoukaku.on("ready", (name) => console.log(`[Lavalink] ${name} ready`));
kazagumo.shoukaku.on("error", (name, err) => console.error(`[Lavalink] ${name}`, err));

kazagumo.on("playerStart", async (player, track) => {
  await syncCurrentTrack(player, track);
  await logPlay(player.guildId, track);
  await incrementSongsPlayed(player.guildId);
});

kazagumo.on("playerEnd", async (player) => {
  await syncQueue(player);
});

kazagumo.on("playerEmpty", async (player) => {
  const guild = client.guilds.cache.get(player.guildId);
  const settings = guild ? await syncGuild(guild) : null;
  if (settings?.auto_leave !== false) {
    setTimeout(() => { if (!player.queue.current) player.destroy(); }, 60_000);
  }
});

client.on(Events.ClientReady, async () => {
  console.log(`[Discord] Logged in as ${client.user.tag}`);
  for (const [, g] of client.guilds.cache) await syncGuild(g);
  await refreshBotStats();
  setInterval(refreshBotStats, 60_000);
});

client.on(Events.GuildCreate, async (g) => { await syncGuild(g); await refreshBotStats(); });
client.on(Events.GuildDelete, async () => { await refreshBotStats(); });
client.on(Events.InteractionCreate, (i) => handleInteraction(i, kazagumo));

async function refreshBotStats() {
  const servers = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
  const active = [...kazagumo.players.values()].filter((p) => p.playing).length;
  await upsertBotStats({ servers, users, active_players: active });
}

async function syncCurrentTrack(player, track) {
  const { supabase } = await import("./db.js");
  await supabase.from("queue_tracks").delete().eq("guild_id", player.guildId).eq("is_current", true);
  await supabase.from("queue_tracks").insert({
    guild_id: player.guildId,
    position: 0,
    title: track.title,
    author: track.author ?? "",
    url: track.uri,
    thumbnail: track.thumbnail ?? null,
    duration_ms: track.length ?? 0,
    requester_id: track.requester?.id ?? null,
    requester_name: track.requester?.username ?? null,
    is_current: true,
    source: track.sourceName ?? "youtube",
  });
  await syncQueue(player);
}

export async function syncQueue(player) {
  const { supabase } = await import("./db.js");
  await supabase.from("queue_tracks").delete().eq("guild_id", player.guildId).eq("is_current", false);
  const rows = player.queue.map((t, i) => ({
    guild_id: player.guildId,
    position: i + 1,
    title: t.title,
    author: t.author ?? "",
    url: t.uri,
    thumbnail: t.thumbnail ?? null,
    duration_ms: t.length ?? 0,
    requester_id: t.requester?.id ?? null,
    requester_name: t.requester?.username ?? null,
    is_current: false,
    source: t.sourceName ?? "youtube",
  }));
  if (rows.length) await supabase.from("queue_tracks").insert(rows);
}

registerEvents(client);
startBridge(client, kazagumo);
client.login(process.env.DISCORD_TOKEN);
