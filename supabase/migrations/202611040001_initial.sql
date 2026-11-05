create type public.module_key as enum ('recipes', 'city', 'expenses', 'budgets');
create type public.transaction_kind as enum ('income', 'expense');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  currency_code text not null default 'MXN' check (currency_code ~ '^[A-Z]{3}$'),
  locale text not null default 'es-MX' check (char_length(locale) between 2 and 20),
  created_at timestamptz not null default now()
);

create table public.module_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_key public.module_key not null,
  enabled boolean not null default true,
  primary key (user_id, module_key)
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  kind public.transaction_kind not null,
  unique (id, user_id, kind)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.transaction_kind not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  category_id uuid references public.expense_categories(id),
  occurred_on date not null,
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id),
  month date not null check (extract(day from month) = 1),
  limit_minor bigint not null check (limit_minor >= 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  unique (user_id, category_id, month)
);

create index transactions_user_date_idx on public.transactions(user_id, occurred_on desc);
create index budgets_user_month_idx on public.budgets(user_id, month);
create index expense_categories_user_idx on public.expense_categories(user_id);

alter table public.profiles enable row level security;
alter table public.module_preferences enable row level security;
alter table public.expense_categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy profiles_owner on public.profiles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy preferences_owner on public.module_preferences for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy categories_read on public.expense_categories for select to authenticated using (user_id is null or user_id = (select auth.uid()));
create policy categories_insert on public.expense_categories for insert to authenticated with check (user_id = (select auth.uid()));
create policy categories_update on public.expense_categories for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy categories_delete on public.expense_categories for delete to authenticated using (user_id = (select auth.uid()));
create policy transactions_owner on public.transactions for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy budgets_owner on public.budgets for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create or replace function public.enforce_finance_rules() returns trigger language plpgsql set search_path = '' as $$
declare category record; profile_currency text;
begin
  select currency_code into profile_currency from public.profiles where user_id = new.user_id;
  if profile_currency is null or new.currency_code <> profile_currency then
    raise exception 'Currency must match profile';
  end if;
  if new.category_id is not null then
    select user_id, kind into category from public.expense_categories where id = new.category_id;
    if not found or (category.user_id is not null and category.user_id <> new.user_id) then
      raise exception 'Category is not available to this user';
    end if;
    if tg_table_name = 'budgets' and category.kind <> 'expense' then
      raise exception 'Budgets require an expense category';
    end if;
    if tg_table_name = 'transactions' and category.kind <> new.kind then
      raise exception 'Category kind does not match transaction';
    end if;
  end if;
  return new;
end;
$$;

create trigger transactions_rules before insert or update on public.transactions for each row execute function public.enforce_finance_rules();
create trigger budgets_rules before insert or update on public.budgets for each row execute function public.enforce_finance_rules();
