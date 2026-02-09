-- ============================================================
-- 005 – Inventory table, storage bucket, FK links
-- ============================================================

-- Inventory table
create table public.inventory (
  id            uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title         text not null,
  artist        text,
  medium        text,
  dimensions    text,
  year          integer,
  image_path    text,
  asking_price  numeric(12,2),
  reserve_price numeric(12,2),
  status        text not null default 'available'
                check (status in ('available','reserved','sold','not_for_sale')),
  source        text not null default 'owned'
                check (source in ('owned','consignment')),
  consignor     text,
  notes         text,
  is_deleted    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index idx_inventory_org_id on public.inventory(organization_id);
create index idx_inventory_status on public.inventory(organization_id, status);
create index idx_inventory_artist on public.inventory using gin (artist gin_trgm_ops);

-- RLS
alter table public.inventory enable row level security;

create policy "Users can view own org inventory"
  on public.inventory for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
    and is_deleted = false
  );

create policy "Users can insert inventory in own org"
  on public.inventory for insert
  with check (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can update own org inventory"
  on public.inventory for update
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- updated_at trigger function (create if not exists)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_inventory_updated_at
  before update on public.inventory
  for each row execute function update_updated_at_column();

-- Optional FK on sales and enquiries
alter table public.sales
  add column inventory_item_id uuid references public.inventory(id) on delete set null;

alter table public.enquiries
  add column inventory_item_id uuid references public.inventory(id) on delete set null;

-- Storage bucket for inventory images
insert into storage.buckets (id, name, public)
values ('inventory-images', 'inventory-images', false);

-- Storage RLS: org members can upload to their org folder
create policy "Org members can upload inventory images"
  on storage.objects for insert
  with check (
    bucket_id = 'inventory-images'
    and (storage.foldername(name))[1] in (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );

create policy "Org members can view inventory images"
  on storage.objects for select
  using (
    bucket_id = 'inventory-images'
    and (storage.foldername(name))[1] in (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );

create policy "Org members can delete inventory images"
  on storage.objects for delete
  using (
    bucket_id = 'inventory-images'
    and (storage.foldername(name))[1] in (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );
