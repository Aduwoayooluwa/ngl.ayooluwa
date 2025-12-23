-- 1. Create Profiles Table (Public Profile Data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Create Messages Table (Anonymous Messages)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 3. Create Subscriptions Table (For Push Notifications)
create table public.subscriptions (
  user_id uuid references auth.users not null primary key,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;

-- 5. RLS Policies

-- Profiles: Everyone can read profiles
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

-- Messages: Users can see their own inbox
create policy "Users can view their own inbox" 
  on messages for select using (auth.uid() = user_id);

create policy "Anyone can send a message" 
  on messages for insert with check (true);

-- Subscriptions: Users can manage their own subscriptions
create policy "Users can manage their own subscriptions" 
  on subscriptions for all using (auth.uid() = user_id);

-- 6. Trigger to AUTOMATICALLY create a profile when a user signs up
-- THIS IS THE PART THAT SAVES THE USERNAME
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
