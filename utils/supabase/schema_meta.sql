-- Add meta column to messages table for security info
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS meta jsonb;
