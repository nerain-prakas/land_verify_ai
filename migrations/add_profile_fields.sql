-- Add user profile fields and relations
-- Migration: Add profile fields and listing relationships

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add seller relation index to land_listings
CREATE INDEX IF NOT EXISTS idx_land_listings_seller_id ON land_listings(seller_id);

-- Add indexes to meeting_requests
CREATE INDEX IF NOT EXISTS idx_meeting_requests_buyer_id ON meeting_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_seller_id ON meeting_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_listing_id ON meeting_requests(listing_id);

-- Add message column to meeting_requests if not exists
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS message TEXT;
