
-- Extend profiles with discord fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS global_name text,
  ADD COLUMN IF NOT EXISTS discriminator text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;

-- Per-user discord guild membership cache
CREATE TABLE IF NOT EXISTS public.user_guilds (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guild_id text NOT NULL,
  name text NOT NULL,
  icon text,
  owner boolean NOT NULL DEFAULT false,
  permissions text NOT NULL DEFAULT '0',
  can_manage boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, guild_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_guilds TO authenticated;
GRANT ALL ON public.user_guilds TO service_role;

ALTER TABLE public.user_guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_guilds_own_read"
  ON public.user_guilds FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_guilds_user_idx ON public.user_guilds(user_id);
