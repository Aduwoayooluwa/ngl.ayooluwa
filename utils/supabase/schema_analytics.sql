-- Add theme column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'default';

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL, -- The user whose profile is being viewed/interacted with
  event_type text NOT NULL, -- 'page_view', 'dice_roll'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics" 
  ON public.analytics FOR SELECT 
  USING (auth.uid() = user_id);

-- Analytics are inserted via API (Service Role) typically, but if we want client-side insert:
-- Actually, since we are likely using a Next.js API route for tracking to hide logic/clean data, we might use Service Role there.
-- But just in case, allow insert if user_id matches? No, the viewer is anonymous.
-- So we will stick to API Route insertion (Service Role).
