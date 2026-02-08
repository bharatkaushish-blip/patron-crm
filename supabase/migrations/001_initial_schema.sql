-- Patron: Initial Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ===================
-- EXTENSIONS
-- ===================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ===================
-- ORGANIZATIONS TABLE
-- ===================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- ===================
-- PROFILES TABLE
-- ===================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  full_name text,
  timezone text default 'Asia/Kolkata',
  reminder_time time default '09:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ===================
-- CLIENTS TABLE
-- ===================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  location text,
  age_range text,
  tags text[] default '{}',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

-- ===================
-- NOTES TABLE
-- ===================
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  content text not null,
  follow_up_date date,
  follow_up_status text default null
    check (follow_up_status is null or follow_up_status in ('pending', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

-- ===================
-- SALES TABLE
-- ===================
create table public.sales (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  artwork_name text,
  amount numeric(12, 2),
  sale_date date default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sales enable row level security;

-- ===================
-- RLS POLICIES: ORGANIZATIONS
-- ===================
create policy "Users can view own organization"
  on public.organizations for select
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own organization"
  on public.organizations for update
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

-- ===================
-- RLS POLICIES: PROFILES
-- ===================
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- ===================
-- RLS POLICIES: CLIENTS
-- ===================
create policy "Users can view own org clients"
  on public.clients for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
    and is_deleted = false
  );

create policy "Users can insert clients in own org"
  on public.clients for insert
  with check (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own org clients"
  on public.clients for update
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- ===================
-- RLS POLICIES: NOTES
-- ===================
create policy "Users can view own org notes"
  on public.notes for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert notes in own org"
  on public.notes for insert
  with check (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own org notes"
  on public.notes for update
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can delete own org notes"
  on public.notes for delete
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- ===================
-- RLS POLICIES: SALES
-- ===================
create policy "Users can view own org sales"
  on public.sales for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert sales in own org"
  on public.sales for insert
  with check (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own org sales"
  on public.sales for update
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can delete own org sales"
  on public.sales for delete
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- ===================
-- INDEXES
-- ===================
create index idx_clients_org_id on public.clients(organization_id);
create index idx_clients_name on public.clients using gin (name gin_trgm_ops);
create index idx_clients_tags on public.clients using gin (tags);
create index idx_clients_updated on public.clients(updated_at desc);
create index idx_notes_client on public.notes(client_id);
create index idx_notes_org_id on public.notes(organization_id);
create index idx_notes_follow_up on public.notes(follow_up_date)
  where follow_up_date is not null and follow_up_status = 'pending';
create index idx_sales_client on public.sales(client_id);
create index idx_sales_org_id on public.sales(organization_id);

-- ===================
-- FUNCTION: Get org tags for autocomplete
-- ===================
create or replace function get_org_tags(org_id uuid)
returns table(tag text, usage_count bigint) as $$
  select unnest(tags) as tag, count(*) as usage_count
  from public.clients
  where organization_id = org_id and is_deleted = false
  group by tag
  order by usage_count desc;
$$ language sql security definer;

-- ===================
-- TRIGGER: auto-update updated_at
-- ===================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.organizations
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.clients
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.notes
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.sales
  for each row execute function update_updated_at();

-- ===================
-- TRIGGER: auto-create profile on signup
-- ===================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
