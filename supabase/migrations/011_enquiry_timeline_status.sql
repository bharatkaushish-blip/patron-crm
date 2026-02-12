alter table public.enquiries
  add column timeline_status text default null
  check (timeline_status is null or timeline_status in ('pending', 'done'));

-- Backfill: any existing enquiry with a timeline date gets 'pending'
update public.enquiries set timeline_status = 'pending' where timeline is not null;

-- Index for Today page queries
create index idx_enquiries_timeline_status on public.enquiries(organization_id, timeline_status, timeline);
