-- AgentTrail Supabase schema
-- Run with: supabase db push (or psql) to provision required tables + storage

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.org_api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  last_four text,
  revoked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists org_api_keys_org_id_idx on public.org_api_keys (org_id);
create index if not exists org_api_keys_key_hash_idx on public.org_api_keys (key_hash);

create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id),
  run_id text not null,
  goal text not null,
  target_url text not null,
  screenshot_url text not null,
  streaming_url text,
  proof_path text not null,
  proof_url text not null,
  poa_hash text not null,
  poa_timestamp timestamptz,
  result_json jsonb not null,
  tx_hash text,
  anchor_error text,
  status text not null check (status in ('pending','completed','failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists executions_status_created_at_idx on public.executions (status, created_at desc);
create index if not exists executions_run_id_idx on public.executions (run_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.executions;
create trigger set_timestamp
before update on public.executions
for each row
execute function public.set_updated_at();

-- Create the receipts storage bucket if it doesn't exist yet
select
  storage.create_bucket(id => 'receipts', name => 'receipts', public => true)
where not exists (
  select 1 from storage.buckets where id = 'receipts'
);

-- Row Level Security
alter table public.executions enable row level security;

drop policy if exists "executions-service-role" on public.executions;
create policy "executions-service-role"
  on public.executions
  for all
  using (auth.role() = 'service_role')
  with check (true);

drop policy if exists "executions-read-public" on public.executions;
create policy "executions-read-public"
  on public.executions
  for select
  using (auth.role() in ('anon', 'authenticated'));
