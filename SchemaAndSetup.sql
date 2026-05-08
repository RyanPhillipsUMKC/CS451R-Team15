-- create all public tables

create table public."Profiles" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  first_name text null,
  last_name text null,
  starting_funds numeric null,
  constraint Profiles_pkey primary key (id),
  constraint Profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public."Stocks" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  ticker text null,
  company_name text null,
  constraint Stocks_pkey primary key (id),
  constraint Stocks_ticker_key unique (ticker)
) TABLESPACE pg_default;

create table public."Transactions" (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  stock_id uuid null default gen_random_uuid (),
  quantity numeric null,
  price numeric null,
  type character varying null,
  user_id uuid null default gen_random_uuid (),
  constraint Transactions_pkey primary key (id),
  constraint Transactions_stock_id_fkey foreign KEY (stock_id) references "Stocks" (id),
  constraint Transactions_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

-- Auto create user profiles when signed up with supabase authentication
-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public."Profiles" (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;
-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();