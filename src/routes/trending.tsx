import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Music2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending — RolonBot" },
      { name: "description", content: "Most played songs across all RolonBot servers this week." },
      { property: "og:title", content: "Trending on RolonBot" },
      { property: "og:description", content: "What the community is listening to right now." },
    ],
  }),
  component: Trending,
});

function Trending() {
  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("play_history")
        .select("title, author, url, thumbnail")
        .gte("played_at", since)
        .limit(1000);
      const map = new Map<string, { title: string; author: string | null; thumbnail: string | null; url: string; count: number }>();
      (data ?? []).forEach((r) => {
        const k = `${r.title}|${r.author ?? ""}`;
        const prev = map.get(k);
        if (prev) prev.count++;
        else map.set(k, { title: r.title, author: r.author, thumbnail: r.thumbnail, url: r.url ?? "#", count: 1 });
      });
      return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 50);
    },
    refetchInterval: 60_000,
  });

  const podium = (trending.data ?? []).slice(0, 3);
  const rest = (trending.data ?? []).slice(3);
  const order = [1, 0, 2]; // silver, gold, bronze visual order

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center gap-3">
          <TrendingUp className="size-7 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">What the world's listening to</h1>
        </div>
        <p className="text-muted-foreground mt-2">Live aggregate of every RolonBot play in the last 7 days.</p>

        {/* Podium */}
        <div className="mt-10 grid grid-cols-3 gap-3 items-end max-w-2xl mx-auto">
          {order.map((idx) => {
            const t = podium[idx];
            const heights = ["h-32", "h-44", "h-24"]; // silver / gold / bronze
            const colors = ["from-slate-300/30 to-slate-500/10 border-slate-400/40", "from-primary/40 to-accent2/30 border-primary shadow-2xl shadow-primary/30", "from-amber-600/30 to-amber-900/10 border-amber-600/40"];
            const ranks = ["2", "1", "3"];
            const i = order.indexOf(idx);
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="size-16 rounded-xl bg-muted overflow-hidden mb-2 border border-white/10">
                  {t?.thumbnail ? <img src={t.thumbnail} alt="" className="size-full object-cover" /> : <div className="size-full grid place-items-center"><Music2 className="size-6 text-muted-foreground" /></div>}
                </div>
                <div className="text-xs font-medium text-center truncate w-full px-1">{t?.title ?? "—"}</div>
                <div className="text-[10px] text-muted-foreground truncate w-full text-center px-1">{t?.author ?? "No plays yet"}</div>
                <div className={`mt-3 w-full ${heights[i]} rounded-t-xl bg-gradient-to-b ${colors[i]} border grid place-items-center text-3xl font-bold`}>
                  {ranks[i]}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 space-y-2">
          {trending.isLoading && <div className="text-muted-foreground text-center">Loading…</div>}
          {!trending.isLoading && podium.length === 0 && (
            <Card className="p-10 text-center text-muted-foreground bg-card/60 border-white/10">
              <Music2 className="size-10 mx-auto mb-3 opacity-50" />
              No plays yet — start playing music in Discord servers to appear here.
            </Card>
          )}
          {rest.map((t, i) => (
            <Card key={`${t.title}-${i}`} className="p-3 flex items-center gap-4 bg-card/70 border-white/10 hover:border-primary/40 transition">
              <div className="text-2xl font-bold tabular-nums w-10 text-center text-muted-foreground">{i + 4}</div>
              <div className="size-12 rounded-md bg-muted overflow-hidden shrink-0">
                {t.thumbnail ? (
                  <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full grid place-items-center"><Music2 className="size-5 text-muted-foreground" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <a href={t.url} target="_blank" rel="noopener" className="font-medium truncate block hover:text-primary">{t.title}</a>
                <div className="text-xs text-muted-foreground truncate">{t.author}</div>
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">{formatNumber(t.count)} plays</div>
            </Card>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
