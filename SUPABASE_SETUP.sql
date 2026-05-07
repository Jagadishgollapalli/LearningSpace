-- =============================================
-- Jagadish's LS — Supabase Setup SQL
-- Run this in Supabase > SQL Editor
-- =============================================

-- 1. Folders table
create table if not exists folders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default 'green',
  created_at  timestamptz default now()
);

-- 2. Notes table
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'untitled',
  content     text not null default '',
  folder_id   uuid references folders(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 3. Full-text search vector column
alter table notes
  add column if not exists search_vector tsvector
    generated always as (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) stored;

create index if not exists notes_search_idx on notes using gin(search_vector);

-- 4. Note files table
create table if not exists note_files (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid references notes(id) on delete cascade,
  name        text not null,
  path        text not null,
  url         text not null,
  size        bigint,
  mime        text,
  created_at  timestamptz default now()
);

-- 5. Row Level Security (RLS) — open for your personal use (no auth)
--    If you add auth later, update these policies.
alter table folders enable row level security;
alter table notes enable row level security;
alter table note_files enable row level security;

create policy "allow all on folders"   on folders   for all using (true) with check (true);
create policy "allow all on notes"     on notes     for all using (true) with check (true);
create policy "allow all on note_files" on note_files for all using (true) with check (true);

-- 6. Storage bucket
--    Go to: Storage > New Bucket
--    Name: note-files
--    Public: YES (so file URLs work directly)
--
--    Or run this if you have storage permissions:
-- insert into storage.buckets (id, name, public) values ('note-files', 'note-files', true)
-- on conflict do nothing;
