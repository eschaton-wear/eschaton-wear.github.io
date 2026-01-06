-- Create custom types
create type public.tier_type as enum ('base', 'ultra');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade not null,
  tier public.tier_type not null default 'base',
  tokens_left bigint not null default 1500000,
  is_portal_enabled boolean not null default false,
  created_at extensions.timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at extensions.timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update unique profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup (optional trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, tier, tokens_left)
  values (new.id, 'base', 1500000);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC for atomic token decrement
create or replace function public.decrement_tokens(amount int, row_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set tokens_left = tokens_left - amount
  where id = row_id;
end;
$$;
