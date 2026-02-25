-- ============================================================
-- Anonymous Chat Feature Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Chat Sessions Table
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  receiver_id uuid references auth.users not null,
  secret_token text unique not null default gen_random_uuid()::text,
  name text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '48 hours'),
  is_deleted boolean default false,
  sender_push_subscription jsonb
);

-- 2. Chat Messages Table
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions on delete cascade not null,
  sender_type text not null check (sender_type in ('anonymous', 'owner')),
  content text not null,
  created_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- 4. RLS Policies

-- Receiver can see their own active (non-deleted) sessions
create policy "Owner can view their sessions"
  on chat_sessions for select
  using (auth.uid() = receiver_id and is_deleted = false);

-- Anyone can create a session (anonymous sender)
create policy "Anyone can start a chat"
  on chat_sessions for insert
  with check (true);

-- Messages: anyone can read (token validation is done server-side in API)
create policy "Anyone can read messages"
  on chat_messages for select
  using (true);

-- Messages: anyone can insert
create policy "Anyone can insert messages"
  on chat_messages for insert
  with check (true);

-- 5. Index for performance
create index chat_sessions_receiver_id_idx on public.chat_sessions(receiver_id);
create index chat_sessions_secret_token_idx on public.chat_sessions(secret_token);
create index chat_messages_session_id_idx on public.chat_messages(session_id);

-- 6. Auto-expire function (mark is_deleted = true after 48h)
-- Call this from a pg_cron job or Supabase Edge Function cron:
-- SELECT expire_old_chat_sessions();
create or replace function public.expire_old_chat_sessions()
returns void as $$
begin
  update public.chat_sessions
  set is_deleted = true
  where expires_at < now() and is_deleted = false;
end;
$$ language plpgsql security definer;
