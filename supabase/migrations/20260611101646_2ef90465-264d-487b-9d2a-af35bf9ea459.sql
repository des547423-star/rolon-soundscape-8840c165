
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_upsert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Guilds (Discord servers)
CREATE TABLE public.guilds (
  id TEXT PRIMARY KEY,                       -- discord guild id
  name TEXT NOT NULL,
  icon_url TEXT,
  owner_id TEXT,
  member_count INT NOT NULL DEFAULT 0,
  prefix TEXT NOT NULL DEFAULT '!',
  dj_role_id TEXT,
  default_volume INT NOT NULL DEFAULT 80,
  premium BOOLEAN NOT NULL DEFAULT false,
  auto_leave BOOLEAN NOT NULL DEFAULT true,
  vote_skip BOOLEAN NOT NULL DEFAULT true,
  songs_played INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guilds TO authenticated, anon;
GRANT ALL ON public.guilds TO service_role;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guilds_public_read" ON public.guilds FOR SELECT USING (true);

-- Queue tracks (live state)
CREATE TABLE public.queue_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT,
  duration_ms BIGINT NOT NULL DEFAULT 0,
  requester_id TEXT,
  requester_name TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'youtube',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX queue_tracks_guild_pos ON public.queue_tracks(guild_id, position);
GRANT SELECT ON public.queue_tracks TO authenticated, anon;
GRANT ALL ON public.queue_tracks TO service_role;
ALTER TABLE public.queue_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queue_public_read" ON public.queue_tracks FOR SELECT USING (true);

-- Play history
CREATE TABLE public.play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  url TEXT,
  thumbnail TEXT,
  source TEXT,
  requester_id TEXT,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX play_history_played_at ON public.play_history(played_at DESC);
CREATE INDEX play_history_guild ON public.play_history(guild_id);
GRANT SELECT ON public.play_history TO authenticated, anon;
GRANT ALL ON public.play_history TO service_role;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_public_read" ON public.play_history FOR SELECT USING (true);

-- Premium subscriptions
CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_subscriptions TO authenticated;
GRANT ALL ON public.premium_subscriptions TO service_role;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub_own_read" ON public.premium_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Bot stats (single rolling row, key=global)
CREATE TABLE public.bot_stats (
  key TEXT PRIMARY KEY,
  servers INT NOT NULL DEFAULT 0,
  users INT NOT NULL DEFAULT 0,
  songs_played BIGINT NOT NULL DEFAULT 0,
  active_players INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.bot_stats(key) VALUES ('global');
GRANT SELECT ON public.bot_stats TO authenticated, anon;
GRANT ALL ON public.bot_stats TO service_role;
ALTER TABLE public.bot_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_public_read" ON public.bot_stats FOR SELECT USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_guilds_updated BEFORE UPDATE ON public.guilds
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, discord_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'provider_id'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guilds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_stats;
