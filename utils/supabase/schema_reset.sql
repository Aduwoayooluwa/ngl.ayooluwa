-- DANGER: This drops existing tables to ensure a clean slate.
-- Only run this if you are okay with losing current test data.

-- 1. Drop existing objects to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.messages;
drop table if exists public.subscriptions;
drop table if exists public.profiles;

-- 2. Create Profiles Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 3. Create Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 4. Create Subscriptions Table
create table public.subscriptions (
  user_id uuid references auth.users not null primary key,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- 5. Enable RLS
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;

-- 6. Policies

-- Profiles: Public read, owner update
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

-- Messages: Owner read, public write (send)
create policy "Users can view their own inbox" 
  on messages for select using (auth.uid() = user_id);

create policy "Anyone can send a message" 
  on messages for insert with check (true);

-- Subscriptions: Owner manage
create policy "Users can manage their own subscriptions" 
  on subscriptions for all using (auth.uid() = user_id);

-- 7. Trigger for New Users (The Critical Part)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id, 
    -- Fallback to email part if username meta is missing (safety net)
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
