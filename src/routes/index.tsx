import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Music2, Headphones, Zap, Globe2, Sparkles, Shield, Radio, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Equalizer } from "@/components/Equalizer";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RolonBot — Premium Discord Music Bot with Real-Time Dashboard" },
      { name: "description", content: "High-quality 24/7 music for Discord. YouTube, Spotify, SoundCloud, filters, real-time web dashboard and live queue sync." },
      { property: "og:title", content: "RolonBot — Premium Discord Music" },
      { property: "og:description", content: "Real-time queue dashboard, lossless audio, 30+ commands, premium filters." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const stats = useQuery({
    queryKey: ["bot_stats"],
    queryFn: async () => {
      const { data } = await supabase.from("bot_stats").select("*").eq("key", "global").maybeSingle();
      return data;
    },
  });

  const features = [
    { icon: Radio, title: "Lossless Audio", body: "Powered by Lavalink with adaptive bitrate streaming." },
    { icon: Globe2, title: "Every Source", body: "YouTube, Spotify, SoundCloud, Apple Music, Deezer." },
    { icon: Zap, title: "Real-Time Dashboard", body: "Live queue sync — control from web or Discord." },
    { icon: Sparkles, title: "Premium Filters", body: "Bassboost, nightcore, 8D, karaoke, custom EQ." },
    { icon: Shield, title: "Rock Solid", body: "Auto-reconnect, vote-skip, DJ roles, 24/7 mode." },
    { icon: ListMusic, title: "Playlists & History", body: "Save personal playlists, replay your history." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="container mx-auto max-w-7xl px-4 pt-20 pb-24 text-center relative">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary mb-6">
          <Equalizer /> Now streaming on {formatNumber(stats.data?.servers ?? 0)} servers
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          The <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent2 to-primary">music bot</span>
          <br /> your Discord deserves.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Crystal-clear playback from every major source, a real-time web dashboard, and premium filters — all in one Discord bot.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">
            <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener">Add to Discord</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { label: "Servers", value: stats.data?.servers ?? 0 },
            { label: "Users", value: stats.data?.users ?? 0 },
            { label: "Songs Played", value: stats.data?.songs_played ?? 0 },
            { label: "Active Now", value: stats.data?.active_players ?? 0 },
          ].map((s) => (
            <Card key={s.label} className="p-4 bg-card/60 backdrop-blur border-border">
              <div className="text-2xl font-bold">{formatNumber(Number(s.value))}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Built for serious listening</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="p-6 bg-card/60 backdrop-blur hover:border-primary/40 transition">
              <div className="size-10 rounded-lg bg-primary/15 grid place-items-center mb-4">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 pb-24">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/20 via-card to-accent2/10 border-primary/30 text-center">
          <Headphones className="size-12 mx-auto text-primary mb-4" />
          <h2 className="text-3xl font-bold">Ready to upgrade your server?</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Add RolonBot in 30 seconds. Free forever, premium when you want more.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">
              <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener"><Music2 className="size-4" /> Add to Discord</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/premium">View Premium</Link>
            </Button>
          </div>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
