-- Fix cross-tenant data leak: get_org_tags was SECURITY DEFINER which
-- bypasses RLS, allowing callers to enumerate tags for any org by
-- passing an arbitrary org_id. Switch to SECURITY INVOKER so the
-- existing RLS policies on public.clients are enforced.

create or replace function get_org_tags(org_id uuid)
returns table(tag text, usage_count bigint) as $$
  select unnest(tags) as tag, count(*) as usage_count
  from public.clients
  where organization_id = org_id and is_deleted = false
  group by tag
  order by usage_count desc;
$$ language sql security invoker;

-- Revoke execute from anon/public so only authenticated users can call it
revoke execute on function get_org_tags(uuid) from anon, public;
grant execute on function get_org_tags(uuid) to authenticated;
