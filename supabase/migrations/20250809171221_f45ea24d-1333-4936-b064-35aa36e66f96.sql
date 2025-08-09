`, the user needs to approve its execution. To keep things clear and avoid confusion, I’ll skip the quick reply in this message. However, I’ll include a lov-plan summarizing the key frontend tasks for the Live Mode, such as creating management screens, implementing a background sound service, and setting up the ChatGPT widget. 

I’ll present the SQL in a lov-sql block and provide a quick reply to implement the plan once the SQL is approved, along with useful links to the Supabase SQL Editor and storage buckets." duration="2.369957">
</lov-tool-use>
Great direction. For Live Mode we’ll add Roadmaps/Tasks and a per-user “current focus” and background sound setting, while reusing your existing sounds table (no duplicate “background_sound” library table).

What this migration does
- roadmaps: goals you can mark active (enforced: only one active per user)
- tasks: actionable steps under a roadmap
- current_focus: one row per user pointing at the current task, with a safety trigger to ensure the task belongs to the same user
- user_audio_settings: per-user background sound selection and state (reuses public.sounds)

Once this is applied, I’ll wire:
- Live Focus view (Current Focus card, Done -> next task)
- Quick Actions bar (Play Sound, Hypnosis, Analyze, Note)
- Background sound controller persisted to user_audio_settings
- Roadmaps and Tasks management screens
- Optional extras: Progress bar, Mood check, floating AI button (UI first)

Please review and run the SQL below.

<lov-sql>
-- 1) Roadmaps (big goals)
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  color text,
  status text not null default 'active', -- 'active' | 'paused' | 'archived' (free-form for flexibility)
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roadmaps enable row level security;

create policy if not exists "Users can view their own roadmaps"
  on public.roadmaps
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own roadmaps"
  on public.roadmaps
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own roadmaps"
  on public.roadmaps
  for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own roadmaps"
  on public.roadmaps
  for delete
  using (auth.uid() = user_id);

-- Only one 'active' roadmap per user
create unique index if not exists unique_active_roadmap_per_user
  on public.roadmaps(user_id)
  where (status = 'active');

-- keep updated_at fresh
drop trigger if exists set_roadmaps_updated_at on public.roadmaps;
create trigger set_roadmaps_updated_at
  before update on public.roadmaps
  for each row execute function public.update_updated_at_column();


-- 2) Tasks (actionable steps under a roadmap)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  status text not null default 'todo', -- 'todo' | 'doing' | 'done' (free-form)
  position integer,                    -- ordering within a roadmap
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy if not exists "Users can view their own tasks"
  on public.tasks
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own tasks"
  on public.tasks
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own tasks"
  on public.tasks
  for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own tasks"
  on public.tasks
  for delete
  using (auth.uid() = user_id);

-- helpful indexes
create index if not exists tasks_by_roadmap_position on public.tasks(roadmap_id, position nulls last);
create index if not exists tasks_by_user_status on public.tasks(user_id, status);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at_column();


-- 3) Current focus (one row per user; points to the current task)
create table if not exists public.current_focus (
  user_id uuid primary key,
  task_id uuid references public.tasks(id) on delete set null,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.current_focus enable row level security;

create policy if not exists "Users can view their current_focus"
  on public.current_focus
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their current_focus"
  on public.current_focus
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their current_focus"
  on public.current_focus
  for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their current_focus"
  on public.current_focus
  for delete
  using (auth.uid() = user_id);

drop trigger if exists set_current_focus_updated_at on public.current_focus;
create trigger set_current_focus_updated_at
  before update on public.current_focus
  for each row execute function public.update_updated_at_column();

-- Validate the focused task belongs to the same user
create or replace function public.current_focus_validate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t_user uuid;
begin
  if new.task_id is null then
    return new;
  end if;

  select user_id into t_user from public.tasks where id = new.task_id;

  if t_user is null or t_user <> new.user_id then
    raise exception 'Task % does not belong to user %', new.task_id, new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists current_focus_validate_trigger on public.current_focus;
create trigger current_focus_validate_trigger
  before insert or update on public.current_focus
  for each row execute procedure public.current_focus_validate();


-- 4) User audio settings (reuse public.sounds as the library)
create table if not exists public.user_audio_settings (
  user_id uuid primary key,
  background_sound_id uuid references public.sounds(id) on delete set null,
  is_playing boolean not null default false,
  loop boolean not null default true,
  volume numeric not null default 1.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_audio_settings enable row level security;

create policy if not exists "Users can view their own audio settings"
  on public.user_audio_settings
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own audio settings"
  on public.user_audio_settings
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own audio settings"
  on public.user_audio_settings
  for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own audio settings"
  on public.user_audio_settings
  for delete
  using (auth.uid() = user_id);

drop trigger if exists set_user_audio_settings_updated_at on public.user_audio_settings;
create trigger set_user_audio_settings_updated_at
  before update on public.user_audio_settings
  for each row execute function public.update_updated_at_column();
