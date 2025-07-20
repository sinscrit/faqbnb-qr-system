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

-- Row Level Security (RLS) policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access to items and links
CREATE POLICY "Allow public read access on items" ON items
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on item_links" ON item_links
    FOR SELECT USING (true);

-- For admin operations, you may want to add authentication-based policies
-- These are placeholder policies - adjust based on your authentication setup
CREATE POLICY "Allow authenticated users to manage items" ON items
    FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to manage item_links" ON item_links
    FOR ALL USING (true);

