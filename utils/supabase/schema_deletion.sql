-- Allow users to delete their own messages
-- Run this in your Supabase SQL Editor

create policy "Users can delete their own inbox" 
  on messages for delete using (auth.uid() = user_id);
