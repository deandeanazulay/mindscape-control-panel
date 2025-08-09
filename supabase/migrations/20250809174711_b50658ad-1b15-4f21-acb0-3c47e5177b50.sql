-- Create private bucket for voice notes
insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', false)
on conflict (id) do nothing;

-- RLS policies: users can manage their own files within the voice-notes bucket using folder convention `${userId}/...`
create policy "Users can list their own voice notes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'voice-notes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their own voice notes"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'voice-notes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own voice notes"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'voice-notes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own voice notes"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'voice-notes'
  and auth.uid()::text = (storage.foldername(name))[1]
);
