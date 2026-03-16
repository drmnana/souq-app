-- ============================================================
-- سوق سوريا — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For Arabic text search

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── LISTINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Core fields
  category TEXT NOT NULL,
  subcategory TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'SYP')),
  location TEXT NOT NULL,
  contact TEXT,
  images TEXT[] DEFAULT '{}',

  -- Real-estate specific
  area INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  listing_type TEXT DEFAULT 'بيع' CHECK (listing_type IN ('بيع', 'إيجار')),

  -- Car specific
  year INTEGER,
  mileage INTEGER,
  color TEXT,

  -- Meta
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'sold', 'expired')),
  featured BOOLEAN DEFAULT false,
  reject_reason TEXT,

  -- Search vector (Arabic full-text)
  search_vector TSVECTOR,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '90 days')
);

-- ─── SEARCH INDEX ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS listings_search_idx ON listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings(category);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_location_idx ON listings USING GIN(to_tsvector('arabic', location));
CREATE INDEX IF NOT EXISTS listings_created_idx ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('arabic',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.location, '') || ' ' ||
    COALESCE(NEW.subcategory, '')
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_search_vector_update
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ─── INCREMENT VIEWS (safe, no auth needed) ──────────────────
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings SET views = views + 1 WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── STATS VIEW ──────────────────────────────────────────────
CREATE OR REPLACE VIEW listing_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') as new_this_week,
  SUM(views) as total_views,
  AVG(price) FILTER (WHERE status = 'active') as avg_price
FROM listings;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, edit only their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings: anyone can read active, owners manage theirs, admins manage all
CREATE POLICY "Active listings are public"
  ON listings FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Admin override policy (set role in profiles)
CREATE POLICY "Admins can do anything"
  ON listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- ─── STORAGE BUCKET ──────────────────────────────────────────
-- Run in Supabase Storage dashboard or via API:
-- Create bucket named 'listing-images' with public access = true

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── MAKE YOURSELF ADMIN ─────────────────────────────────────
-- After creating your account, run this with your email:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- ─── SAMPLE DATA (optional, delete in production) ────────────
-- You can add test data here if needed
