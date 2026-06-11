export function registerEvents(client) {
  client.on("voiceStateUpdate", (oldState, newState) => {
    const player = client.kazagumo.players.get(oldState.guild.id);
    if (!player) return;
    const channel = oldState.guild.channels.cache.get(player.voiceId);
    if (!channel) return;
    const human = channel.members.filter((m) => !m.user.bot).size;
    if (human === 0) {
      setTimeout(() => {
        const ch = oldState.guild.channels.cache.get(player.voiceId);
        if (ch && ch.members.filter((m) => !m.user.bot).size === 0) player.destroy();
      }, 60_000);
    }
  });
}
