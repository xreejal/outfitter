-- Outfitter App Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create fits table to store reusable fit definitions
CREATE TABLE IF NOT EXISTS public.fits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    total_price_cents INTEGER NOT NULL DEFAULT 0,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create published_battles table (renamed from polls)
CREATE TABLE IF NOT EXISTS public.published_battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fit_a_id UUID NOT NULL REFERENCES public.fits(id) ON DELETE CASCADE,
    fit_b_id UUID NOT NULL REFERENCES public.fits(id) ON DELETE CASCADE,
    author_id TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    votes_a INTEGER NOT NULL DEFAULT 0,
    votes_b INTEGER NOT NULL DEFAULT 0,
    total_votes INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_fits CHECK (fit_a_id != fit_b_id)
);

-- Create votes table to track individual votes
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES public.published_battles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Using text for now, can be UUID later
    chosen_fit_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, user_id) -- One vote per user per battle
);

-- Create fit_comments table for comments on each fit
CREATE TABLE IF NOT EXISTS public.fit_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fit_id UUID NOT NULL REFERENCES public.fits(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL, -- Using text for now, can be UUID later
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_published_battles_fit_a ON public.published_battles(fit_a_id);
CREATE INDEX IF NOT EXISTS idx_published_battles_fit_b ON public.published_battles(fit_b_id);
CREATE INDEX IF NOT EXISTS idx_published_battles_active ON public.published_battles(is_active);
CREATE INDEX IF NOT EXISTS idx_published_battles_status ON public.published_battles(status);
CREATE INDEX IF NOT EXISTS idx_published_battles_created ON public.published_battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_battle_user ON public.votes(battle_id, user_id);
CREATE INDEX IF NOT EXISTS idx_votes_chosen_fit ON public.votes(chosen_fit_id);
CREATE INDEX IF NOT EXISTS idx_fit_comments_fit ON public.fit_comments(fit_id);
CREATE INDEX IF NOT EXISTS idx_fit_comments_created ON public.fit_comments(created_at DESC);

-- Create trigger function to update vote counts
CREATE OR REPLACE FUNCTION update_battle_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment vote count for the chosen fit
        UPDATE public.published_battles 
        SET 
            votes_a = CASE 
                WHEN NEW.chosen_fit_id = fit_a_id THEN votes_a + 1 
                ELSE votes_a 
            END,
            votes_b = CASE 
                WHEN NEW.chosen_fit_id = fit_b_id THEN votes_b + 1 
                ELSE votes_b 
            END,
            total_votes = total_votes + 1,
            updated_at = NOW()
        WHERE id = NEW.battle_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement vote count for the chosen fit
        UPDATE public.published_battles 
        SET 
            votes_a = CASE 
                WHEN OLD.chosen_fit_id = fit_a_id THEN GREATEST(votes_a - 1, 0)
                ELSE votes_a 
            END,
            votes_b = CASE 
                WHEN OLD.chosen_fit_id = fit_b_id THEN GREATEST(votes_b - 1, 0)
                ELSE votes_b 
            END,
            total_votes = GREATEST(total_votes - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.battle_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_vote_counts ON public.votes;
CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR DELETE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_battle_vote_counts();

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS trigger_update_fits_updated_at ON public.fits;
CREATE TRIGGER trigger_update_fits_updated_at
    BEFORE UPDATE ON public.fits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_published_battles_updated_at ON public.published_battles;
CREATE TRIGGER trigger_update_published_battles_updated_at
    BEFORE UPDATE ON public.published_battles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_fit_comments_updated_at ON public.fit_comments;
CREATE TRIGGER trigger_update_fit_comments_updated_at
    BEFORE UPDATE ON public.fit_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable Row Level Security (RLS) for MVP development
ALTER TABLE public.fits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_battles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fit_comments DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.fits TO anon, authenticated;
GRANT ALL ON public.published_battles TO anon, authenticated;
GRANT ALL ON public.votes TO anon, authenticated;
GRANT ALL ON public.fit_comments TO anon, authenticated;

-- Grant usage on sequences (if any auto-increment columns are added later)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Optional: Insert some sample data for testing
-- Uncomment the lines below if you want to test with sample data

/*
INSERT INTO public.fits (name, description, total_price_cents, products) VALUES
('Casual Summer Look', 'A comfortable summer outfit perfect for casual outings', 8900, '[{"id": "product1", "name": "Summer T-Shirt", "price": 2900}, {"id": "product2", "name": "Denim Shorts", "price": 6000}]'),
('Business Casual', 'Professional yet comfortable office wear', 15000, '[{"id": "product3", "name": "Button-Up Shirt", "price": 4500}, {"id": "product4", "name": "Chino Pants", "price": 10500}]'),
('Weekend Warrior', 'Active wear for outdoor activities', 12000, '[{"id": "product5", "name": "Athletic Shirt", "price": 3500}, {"id": "product6", "name": "Hiking Pants", "price": 8500}]'),
('Evening Out', 'Stylish outfit for dinner and events', 18000, '[{"id": "product7", "name": "Dress Shirt", "price": 6000}, {"id": "product8", "name": "Dress Pants", "price": 12000}]');

INSERT INTO public.published_battles (fit_a_id, fit_b_id) VALUES
((SELECT id FROM public.fits WHERE name = 'Casual Summer Look'), (SELECT id FROM public.fits WHERE name = 'Business Casual')),
((SELECT id FROM public.fits WHERE name = 'Weekend Warrior'), (SELECT id FROM public.fits WHERE name = 'Evening Out'));
*/ 