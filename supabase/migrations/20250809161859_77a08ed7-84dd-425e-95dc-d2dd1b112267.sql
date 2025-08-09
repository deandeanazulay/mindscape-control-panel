
-- 1) Moments table for Live/Archive
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('photo','video','text','audio')),
  content text,                     -- for text moments (optional)
  storage_path text,                -- e.g. moments/{user_id}/{ts}-{name}
  state text,                       -- Focus / Calm / Confidence (optional)
  folder text,                      -- Skills / Memories / Achievements / Lessons / Relationships
  tags text[] not null default '{}'::text[],
  linked_goal_id uuid references public.goals(id) on delete set null,
  visibility text not null default 'private' check (visibility in ('private','circle','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.moments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='moments' and policyname='Users can view their own moments'
  ) then
    create policy "Users can view their own moments"
      on public.moments for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='moments' and policyname='Users can insert their own moments'
  ) then
    create policy "Users can insert their own moments"
      on public.moments for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='moments' and policyname='Users can update their own moments'
  ) then
    create policy "Users can update their own moments"
      on public.moments for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='moments' and policyname='Users can delete their own moments'
  ) then
    create policy "Users can delete their own moments"
      on public.moments for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Keep updated_at fresh
drop trigger if exists set_timestamp_on_moments on public.moments;
create trigger set_timestamp_on_moments
before update on public.moments
for each row execute procedure public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_moments_user_created on public.moments (user_id, created_at desc);
create index if not exists idx_moments_linked_goal on public.moments (linked_goal_id);

-- 2) Storage bucket for media (private by default)
insert into storage.buckets (id, name, public)
values ('moments', 'moments', false)
on conflict (id) do nothing;

-- 3) Storage policies: owner-only access for 'moments' bucket
-- RLS is enabled on storage.objects by default.

-- Read
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can view their own files in moments bucket'
  ) then
    create policy "Users can view their own files in moments bucket"
      on storage.objects for select
      to authenticated
      using (bucket_id = 'moments' and owner = auth.uid());
  end if;
end $$;

-- Insert
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can upload files to moments bucket'
  ) then
    create policy "Users can upload files to moments bucket"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'moments' and owner = auth.uid());
  end if;
end $$;

-- Update
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can update their own files in moments bucket'
  ) then
    create policy "Users can update their own files in moments bucket"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'moments' and owner = auth.uid());
  end if;
end $$;

-- Delete
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can delete their own files in moments bucket'
  ) then
    create policy "Users can delete their own files in moments bucket"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'moments' and owner = auth.uid());
  end if;
end $$;
