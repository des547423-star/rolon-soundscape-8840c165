import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

const builders = [
  new SlashCommandBuilder().setName("play").setDescription("Play a song")
    .addStringOption((o) => o.setName("query").setDescription("URL or search").setRequired(true)),
  new SlashCommandBuilder().setName("pause").setDescription("Pause"),
  new SlashCommandBuilder().setName("resume").setDescription("Resume"),
  new SlashCommandBuilder().setName("skip").setDescription("Skip current track"),
  new SlashCommandBuilder().setName("stop").setDescription("Stop and clear"),
  new SlashCommandBuilder().setName("queue").setDescription("Show the queue"),
  new SlashCommandBuilder().setName("nowplaying").setDescription("Show current track"),
  new SlashCommandBuilder().setName("volume").setDescription("Set volume 0-200")
    .addIntegerOption((o) => o.setName("level").setDescription("0-200").setRequired(true).setMinValue(0).setMaxValue(200)),
  new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the queue"),
  new SlashCommandBuilder().setName("loop").setDescription("Toggle loop")
    .addStringOption((o) => o.setName("mode").setDescription("off|track|queue").addChoices(
      { name: "off", value: "none" }, { name: "track", value: "track" }, { name: "queue", value: "queue" })),
  new SlashCommandBuilder().setName("seek").setDescription("Seek to seconds")
    .addIntegerOption((o) => o.setName("seconds").setDescription("Seconds").setRequired(true).setMinValue(0)),
  new SlashCommandBuilder().setName("clear").setDescription("Clear queue"),
  new SlashCommandBuilder().setName("ping").setDescription("Latency"),
  new SlashCommandBuilder().setName("invite").setDescription("Invite link"),
  new SlashCommandBuilder().setName("ai").setDescription("Ask RolonBot AI")
    .addStringOption((o) => o.setName("prompt").setDescription("Your question").setRequired(true)),
];

export const commandJSON = builders.map((b) => b.toJSON());

export async function handleInteraction(i, kazagumo) {
  if (!i.isChatInputCommand()) return;
  try {
    switch (i.commandName) {
      case "ping": return i.reply({ content: `Pong! ${i.client.ws.ping}ms`, ephemeral: true });
      case "invite": return i.reply({ content: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=274881367040&scope=bot+applications.commands`, ephemeral: true });
      case "ai": return cmdAI(i);
      case "play": return cmdPlay(i, kazagumo);
      case "pause": return withPlayer(i, kazagumo, (p) => { p.pause(true); i.reply("⏸ Paused"); });
      case "resume": return withPlayer(i, kazagumo, (p) => { p.pause(false); i.reply("▶️ Resumed"); });
      case "skip": return withPlayer(i, kazagumo, (p) => { p.skip(); i.reply("⏭ Skipped"); });
      case "stop": return withPlayer(i, kazagumo, (p) => { p.destroy(); i.reply("⏹ Stopped"); });
      case "volume": {
        const v = i.options.getInteger("level", true);
        return withPlayer(i, kazagumo, (p) => { p.setVolume(v); i.reply(`🔊 Volume ${v}%`); });
      }
      case "shuffle": return withPlayer(i, kazagumo, (p) => { p.queue.shuffle(); i.reply("🔀 Shuffled"); });
      case "loop": {
        const mode = i.options.getString("mode") ?? "track";
        return withPlayer(i, kazagumo, (p) => { p.setLoop(mode); i.reply(`🔁 Loop: ${mode}`); });
      }
      case "seek": {
        const s = i.options.getInteger("seconds", true);
        return withPlayer(i, kazagumo, (p) => { p.seek(s * 1000); i.reply(`⏩ Seeked to ${s}s`); });
      }
      case "clear": return withPlayer(i, kazagumo, (p) => { p.queue.clear(); i.reply("🗑 Queue cleared"); });
      case "nowplaying": return cmdNowPlaying(i, kazagumo);
      case "queue": return cmdQueue(i, kazagumo);
    }
  } catch (e) {
    console.error(e);
    if (!i.replied) i.reply({ content: `Error: ${e.message}`, ephemeral: true }).catch(() => {});
  }
}

function withPlayer(i, kazagumo, fn) {
  const p = kazagumo.players.get(i.guildId);
  if (!p) return i.reply({ content: "Nothing playing.", ephemeral: true });
  return fn(p);
}

async function cmdPlay(i, kazagumo) {
  const query = i.options.getString("query", true);
  const member = await i.guild.members.fetch(i.user.id);
  const vc = member.voice.channel;
  if (!vc) return i.reply({ content: "Join a voice channel first.", ephemeral: true });

  await i.deferReply();
  const result = await kazagumo.search(query, { requester: i.user });
  if (!result.tracks.length) return i.editReply("No results.");

  let player = kazagumo.players.get(i.guildId);
  if (!player) {
    player = await kazagumo.createPlayer({
      guildId: i.guildId,
      textId: i.channelId,
      voiceId: vc.id,
      volume: 80,
    });
  }

  if (result.type === "PLAYLIST") {
    for (const t of result.tracks) player.queue.add(t);
    await i.editReply(`📥 Queued **${result.tracks.length}** tracks from playlist`);
  } else {
    player.queue.add(result.tracks[0]);
    await i.editReply(`📥 Queued **${result.tracks[0].title}**`);
  }
  if (!player.playing && !player.paused) player.play();
}

function cmdNowPlaying(i, kazagumo) {
  const p = kazagumo.players.get(i.guildId);
  const t = p?.queue.current;
  if (!t) return i.reply({ content: "Nothing playing.", ephemeral: true });
  const embed = new EmbedBuilder().setTitle(t.title).setURL(t.uri).setAuthor({ name: t.author ?? "" })
    .setThumbnail(t.thumbnail ?? null).setColor(0xa855f7)
    .setFooter({ text: `Requested by ${t.requester?.username ?? "—"}` });
  return i.reply({ embeds: [embed] });
}

function cmdQueue(i, kazagumo) {
  const p = kazagumo.players.get(i.guildId);
  if (!p) return i.reply({ content: "Nothing playing.", ephemeral: true });
  const lines = p.queue.slice(0, 10).map((t, idx) => `**${idx + 1}.** ${t.title}`);
  const embed = new EmbedBuilder().setTitle("Queue").setDescription(lines.join("\n") || "Empty").setColor(0xa855f7);
  return i.reply({ embeds: [embed] });
}
