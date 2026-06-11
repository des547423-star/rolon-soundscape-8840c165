import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Server, Music2, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const guilds = useQuery({
    queryKey: ["guilds"],
    queryFn: async () => (await supabase.from("guilds").select("*").order("member_count", { ascending: false })).data ?? [],
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Your servers</h1>
      <p className="text-muted-foreground mt-1">Manage music, queues and settings for every server you've added RolonBot to.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guilds.data?.map((g) => (
          <Link key={g.id} to="/dashboard/$guildId" params={{ guildId: g.id }}>
            <Card className="p-5 bg-card/70 hover:border-primary/50 transition h-full">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-gradient-to-br from-primary/40 to-accent2/40 grid place-items-center overflow-hidden">
                  {g.icon_url ? <img src={g.icon_url} alt="" className="size-full object-cover" /> : <span className="font-bold">{g.name.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate flex items-center gap-2">{g.name} {g.premium && <Crown className="size-4 text-primary" />}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(g.member_count)} members</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Music2 className="size-4" /> {formatNumber(g.songs_played)} plays</span>
                <span>Vol {g.default_volume}%</span>
              </div>
            </Card>
          </Link>
        ))}
        {!guilds.isLoading && (guilds.data?.length ?? 0) === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3 p-10 text-center bg-card/60">
            <Server className="size-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">No servers yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add RolonBot to a Discord server to manage it here.</p>
            <Button asChild className="mt-4 bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">
              <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener">Add to Discord</a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
