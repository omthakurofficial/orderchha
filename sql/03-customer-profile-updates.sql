-- 03-customer-profile-updates.sql
-- Purpose: Add only customer-profile related updates to existing users table.
-- Safe to run on an existing database (uses IF NOT EXISTS guards).

-- Ensure helper function exists for updated_at triggers.
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add customer profile fields used in payment flow.
alter table if exists users
  add column if not exists mobile varchar(20),
  add column if not exists address text,
  add column if not exists is_customer boolean default false,
  add column if not exists credit_balance numeric(10,2) default 0,
  add column if not exists updated_at timestamptz default now();

-- Helpful indexes for lookup by mobile and filtering customers.
create index if not exists idx_users_mobile on users(mobile);
create index if not exists idx_users_is_customer on users(is_customer);

-- Keep updated_at in sync.
drop trigger if exists update_users_updated_at on users;
create trigger update_users_updated_at
before update on users
for each row execute function update_updated_at_column();
