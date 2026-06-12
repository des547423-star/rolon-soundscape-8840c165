# Discord OAuth Setup

RolonBot uses Discord OAuth2 to sign users in and pull the list of servers
they can manage. Follow these steps once per environment (dev + prod).

## 1. Create / open the Discord application

1. Go to <https://discord.com/developers/applications>
2. Open your bot's application (or click **New Application** if you don't have one).
3. Copy the **Application ID** — this is your `DISCORD_CLIENT_ID`.
4. Open **OAuth2 → General**, click **Reset Secret**, copy the value — this is `DISCORD_CLIENT_SECRET`.

## 2. Register every redirect URL you will use

Under **OAuth2 → Redirects**, add the exact callback URL for each environment.
RolonBot's callback path is always `/auth/discord/redirect`.

| Environment      | Redirect URL                                                  |
| ---------------- | ------------------------------------------------------------- |
| Local dev        | `http://localhost:2000/auth/discord/redirect`                  |
| Lovable preview  | `https://<your-preview>.lovable.app/auth/discord/redirect`     |
| Production       | `https://rolon-soundscape.lovable.app/auth/discord/redirect`   |
| Custom domain    | `https://rolonbot.yourdomain.com/auth/discord/redirect`        |

The URL you save in the `DISCORD_REDIRECT_URI` secret **must match one of
these exactly** (scheme, host, port, path — no trailing slash).

Click **Save Changes**.

## 3. Set the secrets in Lovable Cloud

Already set via the Lovable secrets tool — verify they exist in your project:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`

Optional (front-end "Add to your server" quick-invite links):

- `VITE_DISCORD_CLIENT_ID` (set this in `.env` to the same value as `DISCORD_CLIENT_ID`)

## 4. Scopes RolonBot requests

| Scope      | Why                                                          |
| ---------- | ------------------------------------------------------------ |
| `identify` | Read your Discord user ID, username, avatar, discriminator   |
| `email`    | Used to link the same Discord account to one RolonBot account |
| `guilds`   | List your servers + permissions so the dashboard can show the ones you can manage |

If a user denies `email` you still sign in fine — we synthesise an internal
account email and never display it.

## 5. Add the bot to a server

The bot itself uses a separate invite link (not the OAuth login flow).
Generate it from the same Discord app under **OAuth2 → URL Generator**:

- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Read Message History`, `Use Slash Commands`

## How the flow works

```
User clicks "Login with Discord"
      ↓
GET  /auth/discord                  (sets CSRF cookie, 302 → discord.com)
      ↓
Discord consent screen
      ↓
GET  /auth/discord/redirect?code=…  (exchange code, fetch user+guilds,
                                     upsert profile + user_guilds,
                                     mint Supabase magic-link)
      ↓
GET  /auth/discord/complete?token_hash=…  (client verifies, session set)
      ↓
/dashboard
```

## Troubleshooting

- **"Invalid redirect_uri"** — the URL you set in `DISCORD_REDIRECT_URI`
  is not in the Redirects list on the Discord app. They must match byte-for-byte.
- **`state_mismatch`** on the auth page — the CSRF cookie was lost (private
  browsing or cross-site cookie blocking). Try again in a normal window.
- **No servers in the dashboard sidebar** — you don't have the *Manage Server*
  permission on any of your guilds, or you signed in before adding the bot
  to that guild. Sign out and back in to refresh the guild list.
