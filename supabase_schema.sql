-- Supabase Schema for Architecture Photographer App

-- 1. Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  location text not null,
  main_img text not null,
  tag text not null,
  description text,
  detail_images text[] default '{}',
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Messages Table (from Contact Form)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  inquiry_type text not null,
  message text not null,
  status text default 'unread'::text, -- 'unread', 'read', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Settings Table (for Site Config)
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;


-- Policies for Projects
create policy "Public projects are viewable by everyone" on public.projects
  for select using (true);

create policy "Authenticated users can create projects" on public.projects
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update projects" on public.projects
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete projects" on public.projects
  for delete using (auth.role() = 'authenticated');


-- Policies for Messages
create policy "Anyone can insert messages" on public.messages
  for insert with check (true);

create policy "Authenticated users can view messages" on public.messages
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can update messages" on public.messages
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete messages" on public.messages
  for delete using (auth.role() = 'authenticated');


-- Policies for Settings
create policy "Anyone can view settings" on public.settings
  for select using (true);

create policy "Authenticated users can manage settings" on public.settings
  for all using (auth.role() = 'authenticated');


-- Function to automatically update 'updated_at' timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_settings_updated_at
  before update on public.settings
  for each row
  execute procedure public.handle_updated_at();
