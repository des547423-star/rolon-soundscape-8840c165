import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Server, Crown, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { discordGuildIconUrl } from "@/lib/discord";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

type SessionUser = {
  id: string;
  username: string;
  avatar: string | null;
  discordId: string | null;
  email: string | null;
};

function DashboardLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { guildId?: string };
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const meta = (data.user.user_metadata ?? {}) as Record<string, string | undefined>;
      setUser({
        id: data.user.id,
        username: meta.global_name || meta.username || (data.user.email?.split("@")[0] ?? "User"),
        avatar: meta.avatar_url ?? null,
        discordId: meta.discord_id ?? null,
        email: data.user.email ?? null,
      });
    });
  }, []);

  // User's Discord guilds where they have MANAGE_GUILD perms
  const userGuilds = useQuery({
    queryKey: ["user-guilds", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_guilds")
        .select("guild_id, name, icon, owner, can_manage")
        .eq("can_manage", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Which of those guilds actually have RolonBot installed (joined the guilds table)
  const botGuildIds = useQuery({
    queryKey: ["bot-guilds-have"],
    queryFn: async () => {
      const { data } = await supabase.from("guilds").select("id");
      return new Set((data ?? []).map((g) => g.id));
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 border-r border-border bg-card/40 backdrop-blur p-4 hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-6 hover:scale-[1.03] transition">
          <span className="font-extrabold tracking-tight text-xl brand-shimmer">RolonBot</span>
        </Link>

        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Server className="size-3" /> Your Servers
        </div>
        <div className="space-y-1 overflow-y-auto flex-1 -mx-2 px-2">
          {userGuilds.isLoading && <div className="text-sm text-muted-foreground p-2">Loading…</div>}
          {!userGuilds.isLoading && (userGuilds.data?.length ?? 0) === 0 && (
            <Card className="p-3 text-xs text-muted-foreground bg-card/60">
              No servers where you have <strong>Manage Server</strong> permission. Sign back in to refresh your guilds.
            </Card>
          )}
          {userGuilds.data?.map((g) => {
            const installed = botGuildIds.data?.has(g.guild_id) ?? false;
            const iconUrl = discordGuildIconUrl(g.guild_id, g.icon);
            const content = (
              <>
                <div className="size-7 rounded-md bg-gradient-to-br from-primary/40 to-accent2/40 grid place-items-center overflow-hidden shrink-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold">{g.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="truncate flex-1">{g.name}</span>
                {g.owner && <Crown className="size-3 text-amber-400" />}
                {!installed && (
                  <span title="RolonBot not installed" className="text-[9px] uppercase font-bold text-muted-foreground/70">add</span>
                )}
              </>
            );
            return installed ? (
              <Link
                key={g.guild_id}
                to="/dashboard/$guildId"
                params={{ guildId: g.guild_id }}
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent/40 transition ${params.guildId === g.guild_id ? "bg-accent/60" : ""}`}
              >
                {content}
              </Link>
            ) : (
              <a
                key={g.guild_id}
                href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID ?? ""}&scope=bot+applications.commands&permissions=414501438016&guild_id=${g.guild_id}&disable_guild_select=true`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent/40 transition opacity-70"
              >
                {content}
              </a>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          {user && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-card/60">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="size-8 rounded-full" />
              ) : (
                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent2" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user.username}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {user.discordId ? (
                    <>Discord</>
                  ) : (
                    <><ShieldAlert className="size-3" /> No Discord linked</>
                  )}
                </div>
              </div>
            </div>
          )}
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
