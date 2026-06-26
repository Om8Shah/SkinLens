-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard → your project → SQL Editor

CREATE TABLE public.scans (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  results             JSONB NOT NULL,
  conditions_detected INTEGER DEFAULT 0,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON public.scans FOR DELETE
  USING (auth.uid() = user_id);
