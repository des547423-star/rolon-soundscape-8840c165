import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Premium — RolonBot" },
      { name: "description", content: "Unlock 24/7 mode, premium filters, playlists, and lossless audio." },
      { property: "og:title", content: "RolonBot Premium" },
      { property: "og:description", content: "Power up your Discord music experience." },
    ],
  }),
  component: Premium,
});

const TIERS = [
  {
    name: "Bronze",
    price: "$0",
    accent: "from-amber-700/40 to-amber-900/20",
    ring: "border-amber-700/40",
    cta: "Add to Discord",
    features: ["30+ commands", "YouTube + SoundCloud", "Real-time dashboard", "Community support"],
  },
  {
    name: "Silver",
    price: "$3.99",
    period: "/mo",
    accent: "from-slate-300/30 to-slate-500/10",
    ring: "border-slate-400/40",
    cta: "Go Silver",
    features: ["Everything in Bronze", "Spotify imports", "Saved playlists", "Synced lyrics", "Faster Lavalink nodes"],
  },
  {
    name: "Gold",
    price: "$7.99",
    period: "/mo",
    featured: true,
    accent: "from-primary/40 to-accent2/30",
    ring: "border-primary",
    cta: "Go Gold",
    features: ["Everything in Silver", "24/7 voice mode", "Premium filters (8D, Nightcore, EQ)", "Vote-skip overrides", "Priority support"],
  },
  {
    name: "Diamond",
    price: "$14.99",
    period: "/mo",
    accent: "from-cyan-300/30 to-blue-500/20",
    ring: "border-cyan-400/50",
    cta: "Go Diamond",
    features: ["Everything in Gold", "Custom bot name + avatar", "Lossless 320kbps", "Web player uploads", "Dedicated instance"],
  },
];

function Premium() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <Crown className="size-10 text-primary mx-auto" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mt-4">
          Premium music, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent2">premium control</span>.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Cancel anytime. Premium activates instantly across every server you're an admin in.</p>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {TIERS.map((t) => (
            <Card
              key={t.name}
              className={`p-6 relative bg-gradient-to-br ${t.accent} backdrop-blur-xl border ${t.ring} hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 ${t.featured ? "shadow-2xl shadow-primary/30 lg:scale-[1.03]" : ""}`}
            >
              {t.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent2 border-0 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                  <Sparkles className="size-3 mr-1" /> Most Popular
                </Badge>
              )}
              <h3 className="text-2xl font-bold">{t.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t.price}</span>
                {t.period && <span className="text-muted-foreground">{t.period}</span>}
              </div>
              <Button
                className={`w-full mt-5 ${t.featured ? "bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0 shadow-[0_0_20px_rgba(168,85,247,0.4)]" : ""}`}
                variant={t.featured ? "default" : "outline"}
              >
                {t.cta}
              </Button>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
