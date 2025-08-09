-- XP & Streak system: tables, RLS, functions

-- 1) user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id uuid PRIMARY KEY NOT NULL,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_count integer NOT NULL DEFAULT 0,
  last_active_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_stats
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'user_stats_select_own'
  ) THEN
    CREATE POLICY "user_stats_select_own"
    ON public.user_stats
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'user_stats_insert_own'
  ) THEN
    CREATE POLICY "user_stats_insert_own"
    ON public.user_stats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'user_stats_update_own'
  ) THEN
    CREATE POLICY "user_stats_update_own"
    ON public.user_stats
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'user_stats_delete_own'
  ) THEN
    CREATE POLICY "user_stats_delete_own"
    ON public.user_stats
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_stats_updated_at'
  ) THEN
    CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) xp_events table
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount integer NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_id_created_at ON public.xp_events (user_id, created_at DESC);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for xp_events
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'xp_events' AND policyname = 'xp_events_select_own'
  ) THEN
    CREATE POLICY "xp_events_select_own"
    ON public.xp_events
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'xp_events' AND policyname = 'xp_events_insert_own'
  ) THEN
    CREATE POLICY "xp_events_insert_own"
    ON public.xp_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'xp_events' AND policyname = 'xp_events_delete_own'
  ) THEN
    CREATE POLICY "xp_events_delete_own"
    ON public.xp_events
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Function to award XP and manage streaks + milestone bonuses
CREATE OR REPLACE FUNCTION public.award_xp(
  activity text,
  amount integer,
  metadata jsonb DEFAULT '{}'::jsonb
) RETURNS TABLE(total_xp integer, streak_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  today date := current_date;
  ydate date := (current_date - interval '1 day')::date;
  new_streak int;
  milestone_bonus int := 0;
  new_total int;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure user_stats row and update streak
  INSERT INTO public.user_stats (user_id, last_active_date, streak_count)
  VALUES (uid, today, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    streak_count = CASE
      WHEN public.user_stats.last_active_date = today THEN public.user_stats.streak_count
      WHEN public.user_stats.last_active_date = ydate THEN public.user_stats.streak_count + 1
      ELSE 1
    END,
    last_active_date = today,
    updated_at = now()
  RETURNING streak_count INTO new_streak;

  -- Milestone bonuses
  IF new_streak IN (3,7,30,100) THEN
    milestone_bonus := CASE new_streak
      WHEN 3 THEN 10
      WHEN 7 THEN 30
      WHEN 30 THEN 150
      WHEN 100 THEN 500
      ELSE 0
    END;

    INSERT INTO public.xp_events (user_id, type, amount, metadata)
    VALUES (uid, 'streak_milestone', milestone_bonus, jsonb_build_object('streak', new_streak));
  END IF;

  -- Base XP event
  IF amount > 0 THEN
    INSERT INTO public.xp_events (user_id, type, amount, metadata)
    VALUES (uid, activity, amount, metadata);
  END IF;

  -- Update total_xp
  UPDATE public.user_stats
  SET total_xp = COALESCE(total_xp,0) + GREATEST(amount,0) + milestone_bonus,
      updated_at = now()
  WHERE user_id = uid
  RETURNING total_xp INTO new_total;

  RETURN QUERY SELECT new_total, new_streak;
END;
$$;
