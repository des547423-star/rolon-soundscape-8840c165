import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span className={`font-extrabold tracking-tight ${cls} brand-shimmer`}>
      RolonBot
    </span>
  );
}

export function SiteHeader() {
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
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
            <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener">Add to Discord</a>
          </Button>
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
