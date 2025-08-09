
-- 1) Daily quests per user per day
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null default current_date,
  quest_id text not null,
  completed_bool boolean not null default false,
  xp_awarded_int integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date, quest_id)
);

alter table public.quests enable row level security;

create policy "Quests: user can select own"
  on public.quests for select
  using (auth.uid() = user_id);

create policy "Quests: user can insert own"
  on public.quests for insert
  with check (auth.uid() = user_id);

create policy "Quests: user can update own"
  on public.quests for update
  using (auth.uid() = user_id);

create policy "Quests: user can delete own"
  on public.quests for delete
  using (auth.uid() = user_id);

create index if not exists quests_user_date_idx on public.quests (user_id, date);
create index if not exists quests_user_quest_idx on public.quests (user_id, quest_id);

drop trigger if exists set_timestamp_on_quests on public.quests;
create trigger set_timestamp_on_quests
  before update on public.quests
  for each row execute procedure public.update_updated_at_column();

-- 2) Sessions (to compute Daily Focus Minutes - DFM)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null, -- e.g., 'focus' | 'hypno' | 'sleep' | 'other'
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  mood_before text,
  mood_after text,
  quality_score integer,
  -- minutes computed from started_at/ended_at; null until ended
  minutes integer generated always as (
    case
      when ended_at is null then null
      else greatest(0, floor(extract(epoch from (ended_at - started_at)) / 60)::int)
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Sessions: user can select own"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Sessions: user can insert own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Sessions: user can update own"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Sessions: user can delete own"
  on public.sessions for delete
  using (auth.uid() = user_id);

create index if not exists sessions_user_started_idx on public.sessions (user_id, started_at desc);
create index if not exists sessions_user_minutes_idx on public.sessions (user_id, minutes);

drop trigger if exists set_timestamp_on_sessions on public.sessions;
create trigger set_timestamp_on_sessions
  before update on public.sessions
  for each row execute procedure public.update_updated_at_column();

-- 3) Lightweight analytics events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  ts timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Events: user can select own"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Events: user can insert own"
  on public.events for insert
  with check (auth.uid() = user_id);

-- updates/deletes are uncommon for events; allow only owner if needed
create policy "Events: user can update own"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Events: user can delete own"
  on public.events for delete
  using (auth.uid() = user_id);

create index if not exists events_user_ts_idx on public.events (user_id, ts desc);
create index if not exists events_type_idx on public.events (type);
