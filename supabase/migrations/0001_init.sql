-- Migration: Initial schema for Private APIs Companion
-- Generated for scaffolding; adjust as needed before applying.

create extension if not exists "uuid-ossp";

create type request_status as enum ('success', 'failure', 'error', 'timeout');
create type user_role as enum ('owner', 'guest');
create type parameter_type as enum ('string', 'number', 'boolean', 'select', 'multi-select');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'owner',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists api_categories (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  icon text,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists api_requests (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles (id) on delete cascade,
  category_id uuid references api_categories (id) on delete set null,
  name text not null,
  description text,
  method text not null,
  url text not null,
  headers jsonb,
  query_params jsonb,
  body_template jsonb,
  timeout_ms int default 10000,
  secret_bindings jsonb,
  requires_confirmation boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  archived_at timestamptz
);

create table if not exists request_parameters (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles (id) on delete cascade,
  request_id uuid not null references api_requests (id) on delete cascade,
  key text not null,
  type parameter_type not null default 'string',
  required boolean not null default false,
  default_value text,
  config jsonb
);

create table if not exists secret_metadata (
  alias text primary key,
  owner_id uuid not null references profiles (id) on delete cascade,
  description text,
  scopes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists request_executions (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references api_requests (id) on delete cascade,
  owner_id uuid not null references profiles (id) on delete cascade,
  status request_status not null,
  http_status int,
  duration_ms int,
  response_excerpt text,
  error_message text,
  executed_at timestamptz not null default now(),
  parameters_used jsonb,
  notes text,
  storage_path text
);

alter table api_categories add constraint api_categories_unique_per_owner unique (owner_id, name);

-- Row level security scaffolding (policies should be reviewed before production).

alter table profiles enable row level security;
alter table api_categories enable row level security;
alter table api_requests enable row level security;
alter table request_parameters enable row level security;
alter table secret_metadata enable row level security;
alter table request_executions enable row level security;

create policy "Owners can manage their profile" on profiles
  using (auth.uid() = id);

create policy "Owners manage categories" on api_categories
  using (auth.uid() = owner_id);

create policy "Owners manage requests" on api_requests
  using (auth.uid() = owner_id);

create policy "Owners manage request parameters" on request_parameters
  using (auth.uid() = owner_id);

create policy "Owners manage secret metadata" on secret_metadata
  using (auth.uid() = owner_id);

create policy "Owners manage request executions" on request_executions
  using (auth.uid() = owner_id);
