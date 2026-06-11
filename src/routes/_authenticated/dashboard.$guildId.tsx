import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, SkipForward, Square, Volume2, Shuffle, Repeat, Trash2, Music2, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDuration, formatNumber } from "@/lib/format";
import { Equalizer } from "@/components/Equalizer";

export const Route = createFileRoute("/_authenticated/dashboard/$guildId")({
  component: GuildDashboard,
});

const BOT_URL = (import.meta.env.VITE_BOT_API_URL as string) || "";

async function botCall(action: string, body: Record<string, unknown>) {
  if (!BOT_URL) {
    toast.message("Bot API not configured", { description: "Set VITE_BOT_API_URL to your /bot deployment URL." });
    return null;
  }
  try {
    const r = await fetch(`${BOT_URL}/api/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  } catch (e) {
    toast.error(`Bot call failed: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

function GuildDashboard() {
  const { guildId } = useParams({ from: "/_authenticated/dashboard/$guildId" });
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const guild = useQuery({
    queryKey: ["guild", guildId],
    queryFn: async () => (await supabase.from("guilds").select("*").eq("id", guildId).maybeSingle()).data,
  });

  const queue = useQuery({
    queryKey: ["queue", guildId],
    queryFn: async () => (await supabase.from("queue_tracks").select("*").eq("guild_id", guildId).order("position")).data ?? [],
  });

  // Realtime sync
  useEffect(() => {
    const ch = supabase
      .channel(`guild-${guildId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tracks", filter: `guild_id=eq.${guildId}` }, () => {
        qc.invalidateQueries({ queryKey: ["queue", guildId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "guilds", filter: `id=eq.${guildId}` }, () => {
        qc.invalidateQueries({ queryKey: ["guild", guildId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [guildId, qc]);

  if (!guild.data) {
    return <div className="p-10 text-muted-foreground">Loading server…</div>;
  }

  const current = queue.data?.find((t) => t.is_current);
  const upcoming = queue.data?.filter((t) => !t.is_current) ?? [];

  return (
    <div className="p-6 md:p-10 max-w-6xl space-y-6">
      <header className="flex items-center gap-4">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/40 to-accent2/40 grid place-items-center overflow-hidden">
          {guild.data.icon_url ? <img src={guild.data.icon_url} alt="" className="size-full object-cover" /> : <span className="font-bold text-xl">{guild.data.name.slice(0, 2).toUpperCase()}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate flex items-center gap-2">
            {guild.data.name}
            {guild.data.premium && <Crown className="size-5 text-primary" />}
          </h1>
          <p className="text-sm text-muted-foreground">{formatNumber(guild.data.member_count)} members · {formatNumber(guild.data.songs_played)} plays</p>
        </div>
      </header>

      {/* Now playing */}
      <Card className="p-5 bg-gradient-to-br from-primary/15 via-card to-accent2/10 border-primary/30">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-xl bg-muted overflow-hidden shrink-0">
            {current?.thumbnail ? <img src={current.thumbnail} alt="" className="size-full object-cover" /> : <div className="size-full grid place-items-center"><Music2 className="size-7 text-muted-foreground" /></div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-primary flex items-center gap-2">
              {current ? <><Equalizer /> Now Playing</> : "Idle"}
            </div>
            <div className="font-semibold text-lg truncate mt-1">{current?.title ?? "Nothing playing"}</div>
            <div className="text-sm text-muted-foreground truncate">{current?.author ?? "—"}</div>
            {current && <div className="text-xs text-muted-foreground mt-1">{formatDuration(current.duration_ms)} · Requested by {current.requester_name}</div>}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => botCall("pause", { guildId })}><Pause className="size-4" /></Button>
          <Button size="sm" onClick={() => botCall("resume", { guildId })}><Play className="size-4" /></Button>
          <Button size="sm" onClick={() => botCall("skip", { guildId })}><SkipForward className="size-4" /></Button>
          <Button size="sm" variant="destructive" onClick={() => botCall("stop", { guildId })}><Square className="size-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => botCall("shuffle", { guildId })}><Shuffle className="size-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => botCall("loop", { guildId })}><Repeat className="size-4" /></Button>
          <div className="flex items-center gap-2 ml-auto min-w-[180px]">
            <Volume2 className="size-4 text-muted-foreground" />
            <Slider
              defaultValue={[guild.data.default_volume]}
              max={200}
              step={1}
              onValueCommit={(v) => botCall("volume", { guildId, volume: v[0] })}
            />
          </div>
        </div>
      </Card>

      {/* Add track */}
      <Card className="p-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!searchQuery) return;
            const r = await botCall("play", { guildId, query: searchQuery });
            if (r) { toast.success("Added to queue"); setSearchQuery(""); }
          }}
          className="flex gap-2"
        >
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Paste a URL or search YouTube / Spotify…" />
          <Button type="submit" className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">Play</Button>
        </form>
      </Card>

      {/* Queue */}
      <Card className="bg-card/70">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Up next ({upcoming.length})</h2>
          {upcoming.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => botCall("clear", { guildId })}>
              <Trash2 className="size-4" /> Clear
            </Button>
          )}
        </div>
        <div className="divide-y divide-border">
          {upcoming.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Queue is empty.</div>}
          {upcoming.map((t) => (
            <div key={t.id} className="p-3 flex items-center gap-3 hover:bg-accent/20">
              <div className="text-sm tabular-nums text-muted-foreground w-6 text-center">{t.position}</div>
              <div className="size-10 rounded bg-muted overflow-hidden shrink-0">
                {t.thumbnail && <img src={t.thumbnail} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground truncate">{t.author} · {formatDuration(t.duration_ms)}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => botCall("remove", { guildId, trackId: t.id })}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-5">
        <h2 className="font-semibold mb-4">Server settings</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <SettingRow label="Auto-leave on empty channel">
            <Switch
              defaultChecked={guild.data.auto_leave}
              onCheckedChange={async (v) => {
                await supabase.from("guilds").update({ auto_leave: v }).eq("id", guildId);
                toast.success("Saved");
              }}
            />
          </SettingRow>
          <SettingRow label="Vote-skip enabled">
            <Switch
              defaultChecked={guild.data.vote_skip}
              onCheckedChange={async (v) => {
                await supabase.from("guilds").update({ vote_skip: v }).eq("id", guildId);
                toast.success("Saved");
              }}
            />
          </SettingRow>
          <SettingRow label="Command prefix">
            <Input
              defaultValue={guild.data.prefix}
              maxLength={3}
              className="max-w-[120px]"
              onBlur={async (e) => {
                await supabase.from("guilds").update({ prefix: e.target.value }).eq("id", guildId);
                toast.success("Saved");
              }}
            />
          </SettingRow>
          <SettingRow label="DJ role ID">
            <Input
              defaultValue={guild.data.dj_role_id ?? ""}
              placeholder="Role ID"
              onBlur={async (e) => {
                await supabase.from("guilds").update({ dj_role_id: e.target.value || null }).eq("id", guildId);
                toast.success("Saved");
              }}
            />
          </SettingRow>
        </div>
      </Card>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 border border-border">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
