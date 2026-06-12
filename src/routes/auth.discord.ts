import { createFileRoute, redirect } from "@tanstack/react-router";
import { setCookie } from "@tanstack/react-start/server";
import { DISCORD_SCOPES } from "@/lib/discord";

// GET /auth/discord — kick off Discord OAuth2 authorization-code flow.
export const Route = createFileRoute("/auth/discord")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const redirectUri = process.env.DISCORD_REDIRECT_URI;
        if (!clientId || !redirectUri) {
          return new Response("Discord OAuth is not configured. Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI.", { status: 500 });
        }

        // CSRF state + optional ?next= passthrough
        const url = new URL(request.url);
        const next = url.searchParams.get("next") ?? "/dashboard";
        const state = crypto.randomUUID();

        setCookie("discord_oauth_state", state, {
          httpOnly: true,
          secure: url.protocol === "https:",
          sameSite: "lax",
          path: "/",
          maxAge: 600,
        });
        setCookie("discord_oauth_next", next, {
          httpOnly: true,
          secure: url.protocol === "https:",
          sameSite: "lax",
          path: "/",
          maxAge: 600,
        });

        const authorizeUrl = new URL("https://discord.com/oauth2/authorize");
        authorizeUrl.searchParams.set("client_id", clientId);
        authorizeUrl.searchParams.set("redirect_uri", redirectUri);
        authorizeUrl.searchParams.set("response_type", "code");
        authorizeUrl.searchParams.set("scope", DISCORD_SCOPES.join(" "));
        authorizeUrl.searchParams.set("state", state);
        authorizeUrl.searchParams.set("prompt", "consent");

        throw redirect({ href: authorizeUrl.toString() });
      },
    },
  },
});
