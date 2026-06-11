import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

export async function syncGuild(guild) {
  const row = {
    id: guild.id,
    name: guild.name,
    icon_url: guild.iconURL({ size: 256 }) ?? null,
    owner_id: guild.ownerId,
    member_count: guild.memberCount,
  };
  const { data } = await supabase.from("guilds").upsert(row, { onConflict: "id" }).select().maybeSingle();
  return data;
}

export async function incrementSongsPlayed(guildId) {
  await supabase.rpc("exec_sql_noop", {}).catch(() => {});
  const { data } = await supabase.from("guilds").select("songs_played").eq("id", guildId).maybeSingle();
  if (data) await supabase.from("guilds").update({ songs_played: (data.songs_played ?? 0) + 1 }).eq("id", guildId);
}

export async function logPlay(guildId, track) {
  await supabase.from("play_history").insert({
    guild_id: guildId,
    title: track.title,
    author: track.author ?? null,
    url: track.uri,
    thumbnail: track.thumbnail ?? null,
    source: track.sourceName ?? null,
    requester_id: track.requester?.id ?? null,
  });
}

export async function upsertBotStats(stats) {
  await supabase.from("bot_stats").upsert({ key: "global", updated_at: new Date().toISOString(), ...stats }, { onConflict: "key" });
}
