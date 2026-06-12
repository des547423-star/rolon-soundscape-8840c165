import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    error: typeof s.error === "string" ? s.error : undefined,
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in with Discord — RolonBot" },
      { name: "description", content: "Sign in with your Discord account to manage RolonBot in your servers." },
    ],
  }),
  component: AuthPage,
});

const ERROR_LABELS: Record<string, string> = {
  access_denied: "You cancelled the Discord authorization.",
  state_mismatch: "Security check failed. Please try again.",
  missing_code: "Discord did not return an authorization code.",
  token_exchange_failed: "Could not exchange the Discord authorization code.",
  user_fetch_failed: "Could not load your Discord profile.",
  discord_not_configured: "Discord OAuth is not configured on the server.",
  supabase_create_failed: "Could not create your RolonBot account.",
  supabase_list_failed: "Could not check your existing account.",
  supabase_link_failed: "Could not create a sign-in session.",
};

function AuthPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate({ to: search.next?.startsWith("/") ? search.next : "/dashboard", replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate, search.next]);

  if (checking) return null;

  const errorLabel = search.error ? (ERROR_LABELS[search.error] ?? `Sign-in failed: ${search.error}`) : null;
  const nextParam = search.next ? `?next=${encodeURIComponent(search.next)}` : "";

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.15)]">
        <div className="flex items-center justify-center mb-6">
          <BrandLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-center">Welcome to RolonBot</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Sign in with Discord to control music in your servers.
        </p>

        {errorLabel && (
          <div className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 shrink-0 text-destructive" />
            <div className="text-destructive">{errorLabel}</div>
          </div>
        )}

        <Button
          asChild
          size="lg"
          className="w-full mt-6 bg-[#5865F2] hover:bg-[#4752c4] text-white border-0 shadow-[0_0_30px_rgba(88,101,242,0.45)]"
        >
          <a href={`/auth/discord${nextParam}`}>
            <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.074.035c-.211.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.075-.035 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.121.099.247.197.373.291a.077.077 0 0 1-.006.128 12.298 12.298 0 0 1-1.873.891.077.077 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.673-3.548-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z"/></svg>
            Continue with Discord
          </a>
        </Button>

        <p className="mt-5 text-[11px] text-center text-muted-foreground leading-relaxed">
          We request <span className="text-foreground">identify</span>, <span className="text-foreground">email</span>, and{" "}
          <span className="text-foreground">guilds</span> scopes so you can pick which server to manage.
          You can revoke access anytime in your Discord settings.
        </p>

        <button
          type="button"
          onClick={() => router.history.back()}
          className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
      </Card>
    </div>
  );
}
