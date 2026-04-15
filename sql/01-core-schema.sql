-- OrderChha canonical schema (idempotent)
-- Run this first on a new or existing Supabase project.

create extension if not exists pgcrypto;

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  icon varchar(50),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references menu_categories(id) on delete cascade,
  name varchar(200) not null,
  description text,
  price numeric(10,2) not null,
  image text,
  image_url text,
  image_hint varchar(100),
  in_stock boolean default true,
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table menu_items add column if not exists image_url text;
alter table menu_items add column if not exists available boolean default true;

create table if not exists tables (
  id serial primary key,
  name varchar(50) not null,
  location varchar(100),
  status varchar(20) default 'available' check (status in ('available', 'occupied', 'reserved', 'cleaning', 'billing')),
  capacity integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tables drop constraint if exists tables_status_check;
alter table tables add constraint tables_status_check check (status in ('available', 'occupied', 'reserved', 'cleaning', 'billing'));

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_id integer references tables(id),
  status varchar(20) default 'pending' check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount numeric(10,2) not null,
  customer_name varchar(100),
  phone varchar(20),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity integer not null,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  table_id integer references tables(id),
  order_id uuid references orders(id),
  amount numeric(10,2) not null,
  vat_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  method varchar(20) default 'cash' check (method in ('cash', 'online', 'card', 'qr')),
  status varchar(20) default 'completed' check (status in ('pending', 'completed', 'refunded')),
  customer_name varchar(100),
  phone varchar(20),
  invoice_number varchar(50) unique,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table transactions drop constraint if exists transactions_method_check;
alter table transactions add constraint transactions_method_check check (method in ('cash', 'online', 'card', 'qr'));

create table if not exists settings (
  id varchar(50) primary key default 'app-settings',
  cafe_name varchar(200) default 'OrderChha Restaurant',
  address text,
  phone varchar(20),
  logo text,
  currency varchar(10) default 'NPR',
  tax_rate numeric(4,2) default 0.13,
  service_charge numeric(4,2) default 0.10,
  receipt_note text,
  ai_suggestions_enabled boolean default true,
  online_ordering_enabled boolean default true,
  payment_qr_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  quantity integer default 0,
  unit varchar(20) default 'pcs',
  min_quantity integer default 10,
  max_quantity integer default 100,
  supplier varchar(200),
  cost_price numeric(10,2),
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  uid varchar(100) unique not null,
  name varchar(200) not null,
  email varchar(200) unique,
  role varchar(20) default 'staff' check (role in ('admin', 'staff', 'cashier', 'accountant', 'waiter', 'kitchen')),
  photo_url text,
  active boolean default true,
  mobile varchar(20),
  emergency_contact varchar(20),
  address text,
  date_of_birth date,
  blood_group varchar(10),
  marital_status varchar(20) check (marital_status in ('single', 'married', 'divorced', 'widowed')),
  religion varchar(50),
  country varchar(50) default 'Nepal',
  nationality varchar(50),
  languages_spoken text,
  designation varchar(100),
  employee_id varchar(50) unique,
  department varchar(100),
  salary numeric(10,2),
  joining_date timestamptz default now(),
  highest_education varchar(20) check (highest_education in ('primary', 'secondary', 'higher_secondary', 'bachelor', 'master', 'doctorate', 'diploma', 'certificate')),
  institute_name varchar(200),
  graduation_year varchar(4),
  specialization varchar(100),
  additional_certifications text,
  previous_experience text,
  skills text,
  bank_name varchar(100),
  account_number varchar(50),
  routing_number varchar(50),
  account_type varchar(20) check (account_type in ('savings', 'checking', 'current')),
  bank_branch varchar(100),
  national_id varchar(50),
  tax_id varchar(50),
  passport_number varchar(50),
  driving_license varchar(50),
  notes text,
  credit_balance numeric(10,2) default 0,
  is_customer boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_menu_items_available on menu_items(available);
create index if not exists idx_orders_table on orders(table_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_menu_item on order_items(menu_item_id);
create index if not exists idx_tables_status on tables(status);
create index if not exists idx_transactions_table_id on transactions(table_id);
create index if not exists idx_transactions_order_id on transactions(order_id);
create index if not exists idx_transactions_status on transactions(status);
create index if not exists idx_transactions_method on transactions(method);
create index if not exists idx_transactions_created_at on transactions(created_at);
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);
create index if not exists idx_users_country on users(country);
create index if not exists idx_users_employee_id on users(employee_id);
create index if not exists idx_users_active on users(active);
create index if not exists idx_users_auth_user_id on users(auth_user_id);
create index if not exists idx_user_loyalty_mobile on user_loyalty(user_mobile_number);
create index if not exists idx_loyalty_ledger_user on loyalty_ledger(user_id);
create index if not exists idx_loyalty_ledger_mobile on loyalty_ledger(user_mobile_number);
create index if not exists idx_loyalty_ledger_transaction on loyalty_ledger(transaction_id);

drop trigger if exists update_menu_items_updated_at on menu_items;
create trigger update_menu_items_updated_at before update on menu_items
    for each row execute function update_updated_at_column();

drop trigger if exists update_orders_updated_at on orders;
create trigger update_orders_updated_at before update on orders
    for each row execute function update_updated_at_column();

drop trigger if exists update_tables_updated_at on tables;
create trigger update_tables_updated_at before update on tables
    for each row execute function update_updated_at_column();

drop trigger if exists update_transactions_updated_at on transactions;
create trigger update_transactions_updated_at before update on transactions
    for each row execute function update_updated_at_column();

drop trigger if exists update_users_updated_at on users;
create trigger update_users_updated_at before update on users
    for each row execute function update_updated_at_column();

drop trigger if exists update_settings_updated_at on settings;
create trigger update_settings_updated_at before update on settings
    for each row execute function update_updated_at_column();

drop trigger if exists update_loyalty_settings_updated_at on loyalty_settings;
create trigger update_loyalty_settings_updated_at before update on loyalty_settings
  for each row execute function update_updated_at_column();

drop trigger if exists update_user_loyalty_updated_at on user_loyalty;
create trigger update_user_loyalty_updated_at before update on user_loyalty
  for each row execute function update_updated_at_column();

insert into loyalty_settings (id, points_per_npr_ratio, min_redemption_threshold, points_expiry_days)
values ('default', 0.05, 50, 365)
on conflict (id) do nothing;
