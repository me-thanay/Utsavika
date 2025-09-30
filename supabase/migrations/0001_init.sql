-- Enable required extensions
create extension if not exists pgcrypto;

-- Profiles table mirrors auth.users with 1-1 relation
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Insert profile for self" on public.profiles
  for insert with check (auth.uid() = id);

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "Users can manage own addresses" on public.addresses
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  total_amount numeric(12,2) not null default 0,
  shipping_address_id uuid references public.addresses(id),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can create own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0)
);

alter table public.order_items enable row level security;

create policy "Users can view items of own orders" on public.order_items
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));

create policy "Users can insert items for own orders" on public.order_items
  for insert with check (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));

-- Helper function to upsert profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


