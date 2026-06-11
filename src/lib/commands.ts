export type Command = {
  name: string;
  category: "Music" | "Queue" | "Filters" | "Settings" | "Premium" | "Utility";
  description: string;
  usage: string;
  premium?: boolean;
};

export const COMMANDS: Command[] = [
  { name: "play", category: "Music", description: "Play a song from YouTube, Spotify, SoundCloud, or Apple Music", usage: "/play <query | url>" },
  { name: "pause", category: "Music", description: "Pause the current track", usage: "/pause" },
  { name: "resume", category: "Music", description: "Resume the current track", usage: "/resume" },
  { name: "skip", category: "Music", description: "Skip the current track (vote-skip enabled by default)", usage: "/skip" },
  { name: "stop", category: "Music", description: "Stop playback and clear the queue", usage: "/stop" },
  { name: "nowplaying", category: "Music", description: "Show what's currently playing with progress", usage: "/nowplaying" },
  { name: "seek", category: "Music", description: "Seek to a position in the current track", usage: "/seek <mm:ss>" },
  { name: "volume", category: "Music", description: "Set playback volume (0–200%)", usage: "/volume <0-200>" },

  { name: "queue", category: "Queue", description: "Show the current queue", usage: "/queue [page]" },
  { name: "shuffle", category: "Queue", description: "Shuffle the queue", usage: "/shuffle" },
  { name: "loop", category: "Queue", description: "Toggle loop (off/track/queue)", usage: "/loop <mode>" },
  { name: "remove", category: "Queue", description: "Remove a track from the queue", usage: "/remove <position>" },
  { name: "move", category: "Queue", description: "Move a track to a new position", usage: "/move <from> <to>" },
  { name: "clear", category: "Queue", description: "Clear the queue", usage: "/clear" },
  { name: "save", category: "Queue", description: "DM yourself the current queue", usage: "/save" },

  { name: "bassboost", category: "Filters", description: "Apply bass boost filter", usage: "/bassboost <level>", premium: true },
  { name: "nightcore", category: "Filters", description: "Apply nightcore filter", usage: "/nightcore", premium: true },
  { name: "8d", category: "Filters", description: "Apply 8D audio filter", usage: "/8d", premium: true },
  { name: "vaporwave", category: "Filters", description: "Apply vaporwave filter", usage: "/vaporwave", premium: true },
  { name: "karaoke", category: "Filters", description: "Reduce vocals (karaoke mode)", usage: "/karaoke", premium: true },
  { name: "equalizer", category: "Filters", description: "Custom 15-band equalizer", usage: "/equalizer <preset>", premium: true },

  { name: "prefix", category: "Settings", description: "Change the server prefix", usage: "/prefix <new>" },
  { name: "djrole", category: "Settings", description: "Set the DJ role", usage: "/djrole <@role>" },
  { name: "autoleave", category: "Settings", description: "Toggle auto-leave on empty channel", usage: "/autoleave" },
  { name: "language", category: "Settings", description: "Set the bot language", usage: "/language <code>" },

  { name: "247", category: "Premium", description: "Keep the bot in voice channel 24/7", usage: "/247", premium: true },
  { name: "playlist", category: "Premium", description: "Save and load personal playlists", usage: "/playlist <save|load> <name>", premium: true },
  { name: "lyrics", category: "Premium", description: "Show synced lyrics", usage: "/lyrics", premium: true },

  { name: "ping", category: "Utility", description: "Show bot latency", usage: "/ping" },
  { name: "stats", category: "Utility", description: "Show global bot stats", usage: "/stats" },
  { name: "invite", category: "Utility", description: "Get the bot invite link", usage: "/invite" },
  { name: "help", category: "Utility", description: "Show command help", usage: "/help [command]" },
];
