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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center gap-3">
          <TrendingUp className="size-7 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Trending this week</h1>
        </div>
        <p className="text-muted-foreground mt-2">Live aggregate of every RolonBot play in the last 7 days.</p>

        <div className="mt-8 space-y-2">
          {trending.isLoading && <div className="text-muted-foreground">Loading…</div>}
          {!trending.isLoading && (trending.data?.length ?? 0) === 0 && (
            <Card className="p-10 text-center text-muted-foreground bg-card/60">
              <Music2 className="size-10 mx-auto mb-3 opacity-50" />
              No plays yet. As servers use RolonBot, trending tracks will appear here in real time.
            </Card>
          )}
          {trending.data?.map((t, i) => (
            <Card key={`${t.title}-${i}`} className="p-3 flex items-center gap-4 bg-card/70 hover:border-primary/40 transition">
              <div className="text-2xl font-bold tabular-nums w-10 text-center text-muted-foreground">{i + 1}</div>
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
