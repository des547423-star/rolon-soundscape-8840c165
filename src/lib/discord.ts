// Shared Discord constants — safe for client and server.
export const DISCORD_SCOPES = ["identify", "email", "guilds"] as const;
export const MANAGE_GUILD = 0x20n; // 32

export function hasManageGuild(permissions: string | bigint): boolean {
  try {
    return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

export function discordAvatarUrl(userId: string, avatar: string | null | undefined, size = 128): string {
  if (!avatar) {
    const idx = Number(BigInt(userId) >> 22n) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}?size=${size}`;
}

export function discordGuildIconUrl(guildId: string, icon: string | null | undefined, size = 128): string | null {
  if (!icon) return null;
  const ext = icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=${size}`;
}
