import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { discordAvatarUrl } from "@/lib/discord";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span className={`font-extrabold tracking-tight ${cls} brand-shimmer`}>
      RolonBot
    </span>
  );
}

type SessionUser = {
  id: string;
  email: string | null;
  username: string;
  avatar: string;
  discordId: string | null;
};

function readMeta(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null } | null): SessionUser | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const discordId = meta.discord_id ?? null;
  const username = meta.global_name || meta.username || (user.email ? user.email.split("@")[0] : "User");
  const avatar = meta.avatar_url || (discordId ? discordAvatarUrl(discordId, null) : "");
  return { id: user.id, email: user.email ?? null, username, avatar, discordId };
}

export function SiteHeader() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(readMeta(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(readMeta(session?.user ?? null));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-white/10">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group hover:scale-[1.03] transition">
          <BrandLogo />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/commands" className="text-muted-foreground hover:text-foreground transition">Commands</Link>
          <Link to="/trending" className="text-muted-foreground hover:text-foreground transition">Trending</Link>
          <Link to="/custom-bot" className="text-muted-foreground hover:text-foreground transition flex items-center gap-1.5">
            Custom Bot
            <span className="text-[9px] font-bold bg-gradient-to-r from-primary to-accent2 text-primary-foreground px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(168,85,247,0.6)]">NEW</span>
          </Link>
          <Link to="/premium" className="text-muted-foreground hover:text-foreground transition">Premium</Link>
          {user && (
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link to="/dashboard"><LayoutDashboard className="size-4" /> Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-card/60 backdrop-blur border border-white/10 hover:border-primary/50 transition shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="size-7 rounded-full" />
                    ) : (
                      <div className="size-7 rounded-full bg-gradient-to-br from-primary to-accent2" />
                    )}
                    <span className="text-sm font-medium max-w-[120px] truncate">{user.username}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    {user.avatar && <img src={user.avatar} alt="" className="size-6 rounded-full" />}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{user.username}</div>
                      {user.discordId && <div className="text-[10px] text-muted-foreground">Discord ID {user.discordId}</div>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><LayoutDashboard className="size-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="bg-[#5865F2] hover:bg-[#4752c4] text-white border-0 shadow-[0_0_20px_rgba(88,101,242,0.4)]">
                <a href="/auth/discord">
                  <svg viewBox="0 0 24 24" className="size-4 fill-current"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.074.035c-.211.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.075-.035 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.121.099.247.197.373.291a.077.077 0 0 1-.006.128 12.298 12.298 0 0 1-1.873.891.077.077 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.673-3.548-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z"/></svg>
                  Login with Discord
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="container mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span>© {new Date().getFullYear()} — Premium Discord Music</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/commands" className="hover:text-foreground">Commands</Link>
          <Link to="/custom-bot" className="hover:text-foreground">Custom Bot</Link>
          <Link to="/premium" className="hover:text-foreground">Premium</Link>
          <a href="https://discord.com" target="_blank" rel="noopener" className="hover:text-foreground">Support</a>
        </div>
      </div>
    </footer>
  );
}
