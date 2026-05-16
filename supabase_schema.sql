-- Supabase Schema for Architecture Photographer App
-- NOTE: This file is idempotent - safe to re-run on an existing database.

-- 1. Projects Table
create table if not exists public.projects (
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
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  inquiry_type text not null,
  message text not null,
  status text default 'unread'::text, -- 'unread', 'read', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Settings Table (for Site Config)
create table if not exists public.settings (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Public projects are viewable by everyone') then
    create policy "Public projects are viewable by everyone" on public.projects for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Authenticated users can create projects') then
    create policy "Authenticated users can create projects" on public.projects for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Authenticated users can update projects') then
    create policy "Authenticated users can update projects" on public.projects for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Authenticated users can delete projects') then
    create policy "Authenticated users can delete projects" on public.projects for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- Policies for Messages
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Anyone can insert messages') then
    create policy "Anyone can insert messages" on public.messages for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Authenticated users can view messages') then
    create policy "Authenticated users can view messages" on public.messages for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Authenticated users can update messages') then
    create policy "Authenticated users can update messages" on public.messages for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Authenticated users can delete messages') then
    create policy "Authenticated users can delete messages" on public.messages for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- Policies for Settings
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'settings' and policyname = 'Anyone can view settings') then
    create policy "Anyone can view settings" on public.settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'settings' and policyname = 'Authenticated users can manage settings') then
    create policy "Authenticated users can manage settings" on public.settings for all using (auth.role() = 'authenticated');
  end if;
end $$;


-- Function to automatically update 'updated_at' timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_settings_updated_at on public.settings;
create trigger handle_settings_updated_at
  before update on public.settings
  for each row
  execute procedure public.handle_updated_at();

-- 4. Packages Table
create table if not exists public.packages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price text not null,
  duration text,
  description text,
  features text[] default '{}',
  popular boolean default false,
  category text,
  cover_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS addons text[] default '{}';

-- 5. Addons Table
create table if not exists public.addons (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Bookings Table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  whatsapp text not null,
  location text not null,
  event_category text not null,
  event_date text not null,
  package_name text,
  promo_code text,
  notes text,
  payment_proof_url text,
  status text default 'pending'::text, -- 'pending', 'confirmed', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.packages enable row level security;
alter table public.addons enable row level security;
alter table public.bookings enable row level security;

-- Policies for Packages
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'packages' and policyname = 'Public packages are viewable by everyone') then
    create policy "Public packages are viewable by everyone" on public.packages for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'packages' and policyname = 'Authenticated users can manage packages') then
    create policy "Authenticated users can manage packages" on public.packages for all using (auth.role() = 'authenticated');
  end if;
end $$;

-- Policies for Addons
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'addons' and policyname = 'Public addons are viewable by everyone') then
    create policy "Public addons are viewable by everyone" on public.addons for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'addons' and policyname = 'Authenticated users can manage addons') then
    create policy "Authenticated users can manage addons" on public.addons for all using (auth.role() = 'authenticated');
  end if;
end $$;

-- Policies for Bookings
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'bookings' and policyname = 'Anyone can insert bookings') then
    create policy "Anyone can insert bookings" on public.bookings for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'bookings' and policyname = 'Public can view bookings') then
    create policy "Public can view bookings" on public.bookings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'bookings' and policyname = 'Authenticated users can update bookings') then
    create policy "Authenticated users can update bookings" on public.bookings for update using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'bookings' and policyname = 'Authenticated users can delete bookings') then
    create policy "Authenticated users can delete bookings" on public.bookings for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- Add payment columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_price text default '0';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_amount text default '0';

-- ==========================================
-- ADVANCED VENDOR MANAGEMENT SCHEMA UPGRADE
-- ==========================================

-- 7. Clients Table (CRM)
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  whatsapp text not null unique,
  email text,
  address text,
  total_bookings integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Invoices Table
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  invoice_number text not null unique,
  amount numeric not null default 0,
  due_date date,
  status text default 'unpaid'::text, -- 'unpaid', 'partial', 'paid', 'overdue'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Payments Table (Transaction History)
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade,
  amount numeric not null,
  payment_method text, -- 'transfer', 'cash', 'qris'
  payment_proof_url text,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  verified boolean default false
);

-- 10. Activity Logs Table (Audit Trail)
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- who did the action (admin)
  entity_type text not null, -- 'booking', 'invoice', 'payment', 'client'
  entity_id uuid not null,
  action text not null, -- 'created', 'updated', 'deleted', 'status_changed'
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add NUMERIC columns to bookings for precise financial calculation 
-- (to safely replace the existing 'text' columns)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_price_numeric numeric default 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_amount_numeric numeric default 0;

-- Set up Row Level Security (RLS) for new tables
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- Admin only policies for new tables (Vendor Management is purely Admin)
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'clients' and policyname = 'Authenticated users can manage clients') then
    create policy "Authenticated users can manage clients" on public.clients for all using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'invoices' and policyname = 'Authenticated users can manage invoices') then
    create policy "Authenticated users can manage invoices" on public.invoices for all using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'payments' and policyname = 'Authenticated users can manage payments') then
    create policy "Authenticated users can manage payments" on public.payments for all using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'activity_logs' and policyname = 'Authenticated users can manage logs') then
    create policy "Authenticated users can manage logs" on public.activity_logs for all using (auth.role() = 'authenticated');
  end if;
end $$;
