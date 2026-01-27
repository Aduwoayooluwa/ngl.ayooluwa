-- Migration: Add is_pinned to messages table
-- Run this in Supabase SQL Editor

-- 1. Add is_pinned column
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

-- 2. Add RLS policy for users to update their own messages (for pinning)
CREATE POLICY "Users can update their own messages" 
  ON messages FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3. Add delete policy for users to delete their own messages
CREATE POLICY "Users can delete their own messages" 
  ON messages FOR DELETE 
  USING (auth.uid() = user_id);
