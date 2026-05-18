-- OráculoAI v3 — Rich profile for personalized prompts
-- Run AFTER migration-v2.sql

-- Expanded profile fields for deep personalization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties_other TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_colors TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_goals TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
