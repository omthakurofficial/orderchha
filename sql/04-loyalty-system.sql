-- 04-loyalty-system.sql
-- Purpose: Create loyalty settings, loyalty wallet, and loyalty ledger tables.
-- Safe to run after users table exists.

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

create table if not exists loyalty_settings (
  id varchar(50) primary key default 'default',
  points_per_npr_ratio numeric(10,4) not null default 0.05,
  min_redemption_threshold integer not null default 50,
  points_expiry_days integer not null default 365,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_loyalty (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  user_mobile_number varchar(20) not null,
  current_balance numeric(12,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id),
  unique(user_mobile_number)
);

create table if not exists loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  user_mobile_number varchar(20) not null,
  transaction_id uuid,
  points_earned numeric(12,2) not null default 0,
  points_redeemed numeric(12,2) not null default 0,
  npr_discount numeric(12,2) not null default 0,
  source varchar(20) not null default 'In-house',
  payment_method varchar(20),
  bill_amount numeric(12,2) not null default 0,
  notes text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_user_loyalty_mobile on user_loyalty(user_mobile_number);
create index if not exists idx_loyalty_ledger_user on loyalty_ledger(user_id);
create index if not exists idx_loyalty_ledger_mobile on loyalty_ledger(user_mobile_number);
create index if not exists idx_loyalty_ledger_transaction on loyalty_ledger(transaction_id);

-- Keep updated_at in sync.
drop trigger if exists update_loyalty_settings_updated_at on loyalty_settings;
create trigger update_loyalty_settings_updated_at
before update on loyalty_settings
for each row execute function update_updated_at_column();

drop trigger if exists update_user_loyalty_updated_at on user_loyalty;
create trigger update_user_loyalty_updated_at
before update on user_loyalty
for each row execute function update_updated_at_column();

-- Default loyalty rule row used by app settings screen.
insert into loyalty_settings (id, points_per_npr_ratio, min_redemption_threshold, points_expiry_days)
values ('default', 0.05, 50, 365)
on conflict (id) do nothing;
