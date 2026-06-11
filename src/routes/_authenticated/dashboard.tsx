import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Music2, Server, Settings, ListMusic, BarChart3, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Equalizer } from "@/components/Equalizer";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { guildId?: string };
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const guilds = useQuery({
    queryKey: ["guilds"],
    queryFn: async () => {
      const { data } = await supabase.from("guilds").select("*").order("member_count", { ascending: false });
      return data ?? [];
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 border-r border-border bg-card/40 backdrop-blur p-4 hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent2 grid place-items-center">
            <Music2 className="size-5 text-primary-foreground" />
          </div>
          <span className="font-bold">RolonBot</span>
        </Link>

        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Server className="size-3" /> Your Servers
        </div>
        <div className="space-y-1 overflow-y-auto flex-1 -mx-2 px-2">
          {guilds.isLoading && <div className="text-sm text-muted-foreground p-2">Loading…</div>}
          {!guilds.isLoading && (guilds.data?.length ?? 0) === 0 && (
            <Card className="p-3 text-xs text-muted-foreground bg-card/60">
              No servers yet. Invite RolonBot, then refresh.
            </Card>
          )}
          {guilds.data?.map((g) => (
            <Link
              key={g.id}
              to="/dashboard/$guildId"
              params={{ guildId: g.id }}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent/40 transition ${params.guildId === g.id ? "bg-accent/60" : ""}`}
            >
              <div className="size-7 rounded-md bg-gradient-to-br from-primary/40 to-accent2/40 grid place-items-center overflow-hidden shrink-0">
                {g.icon_url ? <img src={g.icon_url} alt="" className="size-full object-cover" /> : <span className="text-[10px] font-bold">{g.name.slice(0, 2).toUpperCase()}</span>}
              </div>
              <span className="truncate flex-1">{g.name}</span>
              {g.premium && <Crown className="size-3 text-primary" />}
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground truncate mb-2">{email}</div>
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}


