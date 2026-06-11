import { Link } from "@tanstack/react-router";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent2 grid place-items-center shadow-lg shadow-primary/30">
            <Music2 className="size-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">RolonBot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/commands" className="text-muted-foreground hover:text-foreground transition">Commands</Link>
          <Link to="/trending" className="text-muted-foreground hover:text-foreground transition">Trending</Link>
          <Link to="/premium" className="text-muted-foreground hover:text-foreground transition">Premium</Link>
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent2 text-primary-foreground border-0">
            <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener">Add to Discord</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-to-br from-primary to-accent2" />
          <span>© {new Date().getFullYear()} RolonBot — Premium Discord Music</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/commands" className="hover:text-foreground">Commands</Link>
          <Link to="/premium" className="hover:text-foreground">Premium</Link>
          <a href="https://discord.com" target="_blank" rel="noopener" className="hover:text-foreground">Support</a>
        </div>
      </div>
    </footer>
  );
}
