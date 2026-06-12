import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/discord/complete")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    token_hash: typeof s.token_hash === "string" ? s.token_hash : "",
    type: typeof s.type === "string" ? s.type : "magiclink",
    next: typeof s.next === "string" ? s.next : "/dashboard",
  }),
  component: CompletePage,
});

function CompletePage() {
  const { token_hash, next } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token_hash) {
      setError("Missing token. Please try signing in again.");
      return;
    }
    (async () => {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" });
      if (error) {
        setError(error.message);
        return;
      }
      navigate({ to: next.startsWith("/") ? next : "/dashboard", replace: true });
    })();
  }, [token_hash, next, navigate]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold mb-2">Sign-in failed</h1>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <a href="/auth" className="text-primary underline">Try again</a>
          </>
        ) : (
          <>
            <Loader2 className="size-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Finishing Discord sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
