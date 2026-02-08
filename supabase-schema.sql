-- ============================================
-- Finance App - Database Schema
-- ============================================
-- Execute this script in Supabase SQL Editor
-- Project: https://ksiownddstajjcajzcrc.supabase.co
-- ============================================

-- 1. TRANSACTIONS TABLE
-- ============================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date timestamp with time zone not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('Entrada', 'Saída')) not null,
  category text,
  source text,
  institution text,
  is_pending boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for better query performance
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_date_idx on public.transactions(date desc);
create index if not exists transactions_is_pending_idx on public.transactions(is_pending);

-- Enable Row Level Security
alter table public.transactions enable row level security;

-- RLS Policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ============================================
-- 2. CATEGORY RULES TABLE
-- ============================================
create table if not exists public.category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  term text not null,
  category text not null,
  match_type text check (match_type in ('exact', 'contains')) not null,
  institution text,
  type text check (type in ('Entrada', 'Saída')),
  auto_confirm boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index
create index if not exists category_rules_user_id_idx on public.category_rules(user_id);

-- Enable Row Level Security
alter table public.category_rules enable row level security;

-- RLS Policies for category_rules
create policy "Users can manage own rules"
  on public.category_rules for all
  using (auth.uid() = user_id);

-- ============================================
-- 3. USER CATEGORIES TABLE
-- ============================================
create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Create index
create index if not exists user_categories_user_id_idx on public.user_categories(user_id);

-- Enable Row Level Security
alter table public.user_categories enable row level security;

-- RLS Policies for user_categories
create policy "Users can manage own categories"
  on public.user_categories for all
  using (auth.uid() = user_id);

-- ============================================
-- 4. SEED DEFAULT CATEGORIES FUNCTION
-- ============================================
create or replace function public.seed_default_categories()
returns void
language plpgsql
security definer
as $$
declare
  default_categories text[] := ARRAY[
    'Assinatura', 'Bar/Restaurante', 'Carro Manutenção', 'Casa Manutenção',
    'Compras', 'Conta', 'Entrega', 'Estudos', 'Farmácia', 'Gasolina',
    'Mercado', 'Presentes', 'Rendimento', 'Salário', 'Suplementos', 'Transação',
    'Transporte', 'Viagens', 'Outros'
  ];
  category text;
begin
  foreach category in array default_categories
  loop
    insert into public.user_categories (user_id, name)
    values (auth.uid(), category)
    on conflict (user_id, name) do nothing;
  end loop;
end;
$$;

-- ============================================
-- 5. TRIGGER TO SEED CATEGORIES ON USER SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_categories (user_id, name)
  select new.id, unnest(ARRAY[
    'Assinatura', 'Bar/Restaurante', 'Carro Manutenção', 'Casa Manutenção',
    'Compras', 'Conta', 'Entrega', 'Estudos', 'Farmácia', 'Gasolina',
    'Mercado', 'Presentes', 'Rendimento', 'Salário', 'Suplementos', 'Transação',
    'Transporte', 'Viagens', 'Outros'
  ]);
  return new;
end;
$$;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
drop trigger if exists set_updated_at on public.transactions;
create trigger set_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.category_rules;
create trigger set_updated_at
  before update on public.category_rules
  for each row execute function public.handle_updated_at();

-- ============================================
-- DONE! Schema created successfully
-- ============================================
-- Next steps:
-- 1. Enable Email Auth in Authentication > Providers
-- 2. Configure email templates (optional)
-- 3. Add your app URL to redirect URLs
-- ============================================
