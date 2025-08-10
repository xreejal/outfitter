-- Add saved_fits table for user-specific saved fits
-- Run this in your Supabase SQL Editor after the main database setup

-- Create saved_fits table to track which fits users have saved
CREATE TABLE IF NOT EXISTS public.saved_fits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    fit_id UUID NOT NULL REFERENCES public.fits(id) ON DELETE CASCADE,
    battle_id UUID REFERENCES public.published_battles(id) ON DELETE SET NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, fit_id) -- One save per user per fit
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_fits_user ON public.saved_fits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_fits_fit ON public.saved_fits(fit_id);
CREATE INDEX IF NOT EXISTS idx_saved_fits_saved_at ON public.saved_fits(saved_at DESC);

-- Disable Row Level Security (RLS) for MVP development
ALTER TABLE public.saved_fits DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.saved_fits TO anon, authenticated;