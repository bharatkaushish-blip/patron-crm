-- Patron: Enquiries Table
-- Run after 001_initial_schema.sql

create table public.enquiries (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  size text,
  budget text,
  artist text,
  timeline text,
  work_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

-- RLS Policies
create policy "Users can view own org enquiries"
  on public.enquiries for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert enquiries in own org"
  on public.enquiries for insert
  with check (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own org enquiries"
  on public.enquiries for update
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can delete own org enquiries"
  on public.enquiries for delete
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- Indexes
create index idx_enquiries_client on public.enquiries(client_id);
create index idx_enquiries_org_id on public.enquiries(organization_id);
create index idx_enquiries_created on public.enquiries(created_at desc);

-- Auto-update trigger
create trigger set_updated_at before update on public.enquiries
  for each row execute function update_updated_at();
