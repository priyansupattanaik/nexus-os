-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tasks Table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  status text default 'todo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.tasks enable row level security;
create policy "Users can only access their own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Habits Table
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  streak integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.habits enable row level security;
create policy "Users can only access their own habits" on public.habits for all using (auth.uid() = user_id);

-- Transactions Table (Finance)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  type text not null, -- 'income' or 'expense'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;
create policy "Users can only access their own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Settings Table
create table if not exists public.settings (
  user_id uuid references auth.users primary key,
  theme_accent text,
  wallpaper_id text,
  sound_volume numeric default 1.0,
  notifications boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.settings enable row level security;
create policy "Users can only access their own settings" on public.settings for all using (auth.uid() = user_id);

-- Journal Entries Table
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  mood text default 'neutral',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.journal_entries enable row level security;
create policy "Users can only access their own journal entries" on public.journal_entries for all using (auth.uid() = user_id);

-- Files Table (Explorer)
create table if not exists public.files (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  parent_id uuid references public.files,
  name text not null,
  type text not null, -- 'file' or 'folder'
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.files enable row level security;
create policy "Users can only access their own files" on public.files for all using (auth.uid() = user_id);
