import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCookie, deleteCookie } from "@tanstack/react-start/server";
import { DISCORD_SCOPES, hasManageGuild, discordAvatarUrl } from "@/lib/discord";

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string | null;
  avatar?: string | null;
  email?: string | null;
  verified?: boolean;
};

type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

function fail(reason: string): never {
  throw redirect({ href: `/auth?error=${encodeURIComponent(reason)}` });
}

// GET /auth/discord/redirect — Discord OAuth callback. Exchanges code,
// upserts profile + user_guilds via admin client, then hands the browser
// a Supabase magic-link token so the SDK can establish a session.
export const Route = createFileRoute("/auth/discord/redirect")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        const redirectUri = process.env.DISCORD_REDIRECT_URI;
        if (!clientId || !clientSecret || !redirectUri) return fail("discord_not_configured");

        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");
        if (errorParam) return fail(errorParam);
        if (!code || !state) return fail("missing_code");

        const cookieState = getCookie("discord_oauth_state");
        const next = getCookie("discord_oauth_next") ?? "/dashboard";
        deleteCookie("discord_oauth_state", { path: "/" });
        deleteCookie("discord_oauth_next", { path: "/" });
        if (!cookieState || cookieState !== state) return fail("state_mismatch");

        // 1) Exchange code for access token
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            scope: DISCORD_SCOPES.join(" "),
          }),
        });
        if (!tokenRes.ok) {
          console.error("[discord] token exchange failed", tokenRes.status, await tokenRes.text());
          return fail("token_exchange_failed");
        }
        const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };

        // 2) Fetch user + guilds in parallel
        const [userRes, guildsRes] = await Promise.all([
          fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch("https://discord.com/api/users/@me/guilds", { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);
        if (!userRes.ok) return fail("user_fetch_failed");
        const discordUser = (await userRes.json()) as DiscordUser;
        const guilds: DiscordGuild[] = guildsRes.ok ? ((await guildsRes.json()) as DiscordGuild[]) : [];

        const email = discordUser.email ?? `${discordUser.id}@discord.rolonbot.local`;
        const displayName = discordUser.global_name || discordUser.username;
        const avatarUrl = discordAvatarUrl(discordUser.id, discordUser.avatar ?? null, 256);

        // 3) Find or create the Supabase user via admin client
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let userId: string | undefined;
        // Try listUsers filtered by email (supabase-js v2 admin)
        const { data: existing, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        if (listErr) {
          console.error("[discord] listUsers failed", listErr);
          return fail("supabase_list_failed");
        }
        const match = existing.users.find(
          (u) => u.email === email || u.user_metadata?.discord_id === discordUser.id,
        );
        userId = match?.id;

        if (!userId) {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              provider: "discord",
              discord_id: discordUser.id,
              username: discordUser.username,
              global_name: displayName,
              avatar_url: avatarUrl,
              discriminator: discordUser.discriminator ?? "0",
            },
          });
          if (createErr || !created.user) {
            console.error("[discord] createUser failed", createErr);
            return fail("supabase_create_failed");
          }
          userId = created.user.id;
        } else {
          // Update metadata so subsequent logins refresh avatar/name
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              provider: "discord",
              discord_id: discordUser.id,
              username: discordUser.username,
              global_name: displayName,
              avatar_url: avatarUrl,
              discriminator: discordUser.discriminator ?? "0",
            },
          });
        }

        // 4) Upsert profile row
        await supabaseAdmin.from("profiles").upsert(
          {
            id: userId,
            username: discordUser.username,
            global_name: displayName,
            discord_id: discordUser.id,
            avatar_url: avatarUrl,
            discriminator: discordUser.discriminator ?? "0",
            email: discordUser.email ?? null,
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

        // 5) Sync user_guilds (replace all)
        await supabaseAdmin.from("user_guilds").delete().eq("user_id", userId);
        if (guilds.length) {
          const rows = guilds.map((g) => ({
            user_id: userId!,
            guild_id: g.id,
            name: g.name,
            icon: g.icon,
            owner: !!g.owner,
            permissions: String(g.permissions ?? "0"),
            can_manage: g.owner || hasManageGuild(g.permissions ?? "0"),
            updated_at: new Date().toISOString(),
          }));
          // Insert in chunks of 500 (Discord caps at 200 guilds anyway)
          await supabaseAdmin.from("user_guilds").insert(rows);
        }

        // 6) Generate magic link, redirect browser to /auth/discord/complete with token_hash
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email,
        });
        if (linkErr || !linkData?.properties?.hashed_token) {
          console.error("[discord] generateLink failed", linkErr);
          return fail("supabase_link_failed");
        }

        const complete = new URL("/auth/discord/complete", url.origin);
        complete.searchParams.set("token_hash", linkData.properties.hashed_token);
        complete.searchParams.set("type", "magiclink");
        complete.searchParams.set("next", next);

        throw redirect({ href: complete.toString() });
      },
    },
  },
});
