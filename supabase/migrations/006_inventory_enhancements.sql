-- Get distinct artist names used in this org's inventory
create or replace function get_org_artists(org_id uuid)
returns table(artist text, usage_count bigint) as $$
  select artist, count(*) as usage_count
  from public.inventory
  where organization_id = org_id and is_deleted = false and artist is not null and artist != ''
  group by artist
  order by usage_count desc;
$$ language sql security invoker;

-- Get distinct mediums used in this org's inventory
create or replace function get_org_mediums(org_id uuid)
returns table(medium text, usage_count bigint) as $$
  select medium, count(*) as usage_count
  from public.inventory
  where organization_id = org_id and is_deleted = false and medium is not null and medium != ''
  group by medium
  order by usage_count desc;
$$ language sql security invoker;

-- Add currency column to organizations (default INR for existing users)
alter table public.organizations
  add column if not exists currency text not null default 'INR';
