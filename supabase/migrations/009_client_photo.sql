-- Add photo_url column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS photo_url text;
