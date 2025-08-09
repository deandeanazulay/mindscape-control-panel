
-- 1) roadmaps: per-user goals/initiatives
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  color text,
  status text not null default 'paused', -- 'active' | 'paused' (free text for now)
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roadmaps enable row level security;

-- RLS: owner-only access
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmaps' and policyname = 'roadmaps_select_own') then
    create policy "roadmaps_select_own" on public.roadmaps
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmaps' and policyname = 'roadmaps_insert_own') then
    create policy "roadmaps_insert_own" on public.roadmaps
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmaps' and policyname = 'roadmaps_update_own') then
    create policy "roadmaps_update_own" on public.roadmaps
      for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'roadmaps' and policyname = 'roadmaps_delete_own') then
    create policy "roadmaps_delete_own" on public.roadmaps
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- Unique: only one active roadmap per user
create unique index if not exists unique_active_roadmap_per_user
  on public.roadmaps (user_id)
  where status = 'active';

-- updated_at maintenance
drop trigger if exists set_timestamp_roadmaps on public.roadmaps;
create trigger set_timestamp_roadmaps
before update on public.roadmaps
for each row execute function public.update_updated_at_column();


-- 2) tasks: actionable steps under a roadmap
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  status text not null default 'todo', -- 'todo' | 'doing' | 'done' (free text for now)
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

-- RLS: owner-only; also ensure link to own roadmap on insert/update
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_select_own') then
    create policy "tasks_select_own" on public.tasks
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_insert_own_and_roadmap') then
    create policy "tasks_insert_own_and_roadmap" on public.tasks
      for insert with check (
        auth.uid() = user_id
        and exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.user_id = auth.uid())
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_update_own_and_roadmap') then
    create policy "tasks_update_own_and_roadmap" on public.tasks
      for update using (auth.uid() = user_id)
      with check (
        auth.uid() = user_id
        and exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.user_id = auth.uid())
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_delete_own') then
    create policy "tasks_delete_own" on public.tasks
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- helpful indexes for Live mode queries
create index if not exists tasks_by_user_roadmap_status_position
  on public.tasks (user_id, roadmap_id, status, position nulls last, created_at);
create index if not exists tasks_roadmap_status_position
  on public.tasks (roadmap_id, status, position nulls last, created_at);

-- updated_at maintenance
drop trigger if exists set_timestamp_tasks on public.tasks;
create trigger set_timestamp_tasks
before update on public.tasks
for each row execute function public.update_updated_at_column();


-- 3) current_focus: single row per user to track active task
create table if not exists public.current_focus (
  user_id uuid primary key,
  task_id uuid references public.tasks (id) on delete set null,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.current_focus enable row level security;

-- RLS: owner-only; ensure task (if provided) belongs to user
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'current_focus' and policyname = 'current_focus_select_own') then
    create policy "current_focus_select_own" on public.current_focus
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'current_focus' and policyname = 'current_focus_insert_own_with_task_check') then
    create policy "current_focus_insert_own_with_task_check" on public.current_focus
      for insert with check (
        auth.uid() = user_id
        and (
          task_id is null
          or exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'current_focus' and policyname = 'current_focus_update_own_with_task_check') then
    create policy "current_focus_update_own_with_task_check" on public.current_focus
      for update using (auth.uid() = user_id)
      with check (
        auth.uid() = user_id
        and (
          task_id is null
          or exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'current_focus' and policyname = 'current_focus_delete_own') then
    create policy "current_focus_delete_own" on public.current_focus
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- updated_at maintenance
drop trigger if exists set_timestamp_current_focus on public.current_focus;
create trigger set_timestamp_current_focus
before update on public.current_focus
for each row execute function public.update_updated_at_column();


-- 4) user_audio_settings: persist background ambience selection
create table if not exists public.user_audio_settings (
  user_id uuid primary key,
  background_sound_id uuid references public.sounds (id) on delete set null,
  is_playing boolean not null default false,
  loop boolean not null default true,
  volume real not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_audio_settings enable row level security;

-- RLS: owner-only
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_audio_settings' and policyname = 'user_audio_settings_select_own') then
    create policy "user_audio_settings_select_own" on public.user_audio_settings
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_audio_settings' and policyname = 'user_audio_settings_insert_own') then
    create policy "user_audio_settings_insert_own" on public.user_audio_settings
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_audio_settings' and policyname = 'user_audio_settings_update_own') then
    create policy "user_audio_settings_update_own" on public.user_audio_settings
      for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_audio_settings' and policyname = 'user_audio_settings_delete_own') then
    create policy "user_audio_settings_delete_own" on public.user_audio_settings
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- updated_at maintenance
drop trigger if exists set_timestamp_user_audio_settings on public.user_audio_settings;
create trigger set_timestamp_user_audio_settings
before update on public.user_audio_settings
for each row execute function public.update_updated_at_column();
