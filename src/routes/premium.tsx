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
    name: "Free",
    price: "$0",
    cta: "Add to Discord",
    features: ["30+ commands", "Multi-source playback", "Vote-skip & DJ role", "Real-time dashboard (read)", "Community support"],
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/mo",
    featured: true,
    cta: "Go Pro",
    features: ["Everything in Free", "24/7 voice mode", "Premium audio filters (8D, Nightcore, EQ)", "Personal saved playlists", "Synced lyrics", "Priority support"],
  },
  {
    name: "Studio",
    price: "$14.99",
    period: "/mo",
    cta: "Go Studio",
    features: ["Everything in Pro", "Unlimited servers", "Custom bot avatar/name", "Lossless audio bitrate", "Web player control + uploads", "Direct dev support"],
  },
];

function Premium() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto max-w-6xl px-4 py-16 text-center">
        <Crown className="size-10 text-primary mx-auto" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mt-4">Premium music, premium control.</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Cancel anytime. Premium activates instantly across every server you're an admin in.</p>

        <div className="mt-12 grid md:grid-cols-3 gap-4 text-left">
          {TIERS.map((t) => (
            <Card key={t.name} className={`p-6 bg-card/70 relative ${t.featured ? "border-primary shadow-2xl shadow-primary/20 scale-[1.02]" : ""}`}>
              {t.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent2 border-0">
                  <Sparkles className="size-3 mr-1" /> Most Popular
                </Badge>
              )}
              <h3 className="text-2xl font-bold">{t.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t.price}</span>
                {t.period && <span className="text-muted-foreground">{t.period}</span>}
              </div>
              <Button className={`w-full mt-5 ${t.featured ? "bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0" : ""}`} variant={t.featured ? "default" : "outline"}>
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
