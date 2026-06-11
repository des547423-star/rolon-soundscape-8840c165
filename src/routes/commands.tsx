import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { COMMANDS } from "@/lib/commands";

export const Route = createFileRoute("/commands")({
  head: () => ({
    meta: [
      { title: "Commands — RolonBot" },
      { name: "description", content: "All 30+ RolonBot slash commands: play, queue, filters, settings, premium." },
      { property: "og:title", content: "RolonBot Commands" },
      { property: "og:description", content: "Browse every command with usage and category." },
    ],
  }),
  component: CommandsPage,
});

const CATS = ["All", "Music", "Queue", "Filters", "Settings", "Premium", "Utility"] as const;

function CommandsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");

  const filtered = useMemo(() => {
    return COMMANDS.filter(
      (c) =>
        (cat === "All" || c.category === cat) &&
        (c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.description.toLowerCase().includes(q.toLowerCase())),
    );
  }, [q, cat]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Commands</h1>
        <p className="text-muted-foreground mt-2">{COMMANDS.length} slash commands — full music control from Discord.</p>

        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search commands…" className="pl-9 bg-card" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 text-sm rounded-md border transition ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <Card key={c.name} className="p-4 bg-card/70 hover:border-primary/40 transition">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <code className="text-base font-semibold text-primary">/{c.name}</code>
                  {c.premium && (
                    <Badge className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0 gap-1">
                      <Crown className="size-3" /> Premium
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">{c.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
              <code className="block mt-3 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1.5 font-mono">{c.usage}</code>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 text-center text-muted-foreground py-12">No commands match your search.</div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
