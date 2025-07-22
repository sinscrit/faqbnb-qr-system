-- QR Item Display System Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  qr_code_url TEXT,
  qr_code_uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Links table
CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  link_type VARCHAR(50) NOT NULL CHECK (link_type IN ('youtube', 'pdf', 'image', 'text')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_items_public_id ON items(public_id);
CREATE INDEX idx_item_links_item_id ON item_links(item_id);
CREATE INDEX idx_item_links_order ON item_links(item_id, display_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON COLUMN items.qr_code_url IS 'URL to QR code image for this item';
COMMENT ON COLUMN items.qr_code_uploaded_at IS 'Timestamp when QR code URL was last updated';

-- Admin users table (integrates with Supabase Auth)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mailing list subscribers table
CREATE TABLE mailing_list_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- Indexes for performance
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_mailing_list_email ON mailing_list_subscribers(email);

-- Comments for new tables
COMMENT ON TABLE admin_users IS 'Admin users linked to Supabase Auth system';
COMMENT ON TABLE mailing_list_subscribers IS 'Email subscriptions for product launch notifications';
COMMENT ON COLUMN admin_users.role IS 'User role (admin, superadmin, etc.)';
COMMENT ON COLUMN mailing_list_subscribers.status IS 'Subscription status (active, unsubscribed)';

-- Row Level Security (RLS) policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailing_list_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to items and links
CREATE POLICY "Allow public read access on items" ON items
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on item_links" ON item_links
    FOR SELECT USING (true);

-- Admin-only policies for items management
CREATE POLICY "Allow admin users to manage items" ON items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role = 'admin'
        )
    );

CREATE POLICY "Allow admin users to manage item_links" ON item_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role = 'admin'
        )
    );

-- Admin users policies
CREATE POLICY "Admin users can read own data" ON admin_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin users can update own data" ON admin_users
    FOR UPDATE USING (auth.uid() = id);

-- Mailing list policies
CREATE POLICY "Public can insert subscriptions" ON mailing_list_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage mailing list" ON mailing_list_subscribers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role = 'admin'
        )
    );

