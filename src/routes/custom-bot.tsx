import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Sparkles, Upload, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/custom-bot")({
  head: () => ({
    meta: [
      { title: "Custom Bot — RolonBot Premium Branding" },
      { name: "description", content: "Run RolonBot under your own name, avatar, and status. Premium custom branding for your community." },
    ],
  }),
  component: CustomBot,
});

function CustomBot() {
  const [name, setName] = useState("RolonBot");
  const [status, setStatus] = useState("Listening to music");
  const [activity, setActivity] = useState<"Listening" | "Playing" | "Watching">("Listening");
  const [avatar, setAvatar] = useState<string>("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatar(url);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">NEW</Badge>
          <span className="text-xs uppercase tracking-widest text-primary">Premium feature</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your community, your bot.</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Customize RolonBot's name, avatar, and presence. Run a fully branded music bot dedicated to your server.</p>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <Card className="p-6 space-y-5 bg-card/70 backdrop-blur">
            <div>
              <Label>Bot name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} className="mt-2" />
            </div>
            <div>
              <Label>Avatar</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="size-16 rounded-2xl bg-muted overflow-hidden grid place-items-center">
                  {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : <Bot className="size-7 text-muted-foreground" />}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-accent/40">
                    <Upload className="size-4" /> Upload image
                  </span>
                </label>
              </div>
            </div>
            <div>
              <Label>Activity type</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v as typeof activity)}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Listening">Listening to</SelectItem>
                  <SelectItem value="Playing">Playing</SelectItem>
                  <SelectItem value="Watching">Watching</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status text</Label>
              <Input value={status} onChange={(e) => setStatus(e.target.value)} maxLength={128} className="mt-2" />
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">
              <Crown className="size-4" /> Upgrade to apply branding
            </Button>
          </Card>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</div>
            <Card className="p-5 bg-[#2b2d31] border-white/5">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-full bg-muted overflow-hidden grid place-items-center shrink-0">
                  {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : <Bot className="size-6 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{name || "RolonBot"}</span>
                    <span className="text-[10px] bg-[#5865f2] px-1.5 py-0.5 rounded text-white font-bold">APP</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Sparkles className="size-3 text-primary" />
                    {activity} <span className="text-zinc-200">{status}</span>
                  </div>
                  <div className="mt-3 text-sm text-zinc-300">🎧 Now playing in <span className="text-primary">#music</span></div>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card/70">
              <h3 className="font-semibold mb-1">What's included</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Custom name and avatar across every server</li>
                <li>• Custom rotating status & activity</li>
                <li>• Dedicated bot instance — no shared queue limits</li>
                <li>• Priority Lavalink nodes for crystal audio</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
