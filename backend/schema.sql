-- ==============================================================================
-- Gayatri Bhai E-Commerce Platform — Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in paise
  mrp INTEGER NOT NULL,   -- in paise
  discount INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  sub_category TEXT DEFAULT '',
  sku TEXT UNIQUE NOT NULL,
  color TEXT,
  fabric TEXT,
  occasion TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  badge TEXT DEFAULT '',
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  stock JSONB DEFAULT '{"S": 10, "M": 10, "L": 10, "XL": 10, "XXL": 10}'::jsonb,
  images TEXT[] DEFAULT ARRAY[]::text[],
  cover_image_index INTEGER DEFAULT 0,
  weight NUMERIC(6, 3) DEFAULT 0.35, -- in KG
  length NUMERIC(6, 2) DEFAULT 30.0, -- in CM
  breadth NUMERIC(6, 2) DEFAULT 25.0,-- in CM
  height NUMERIC(6, 2) DEFAULT 4.0,  -- in CM
  is_visible BOOLEAN DEFAULT true,
  is_in_stock BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  total_spent INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  area TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  type TEXT DEFAULT 'HOME',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  shipping_cost INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT,
  payment_method TEXT DEFAULT 'razorpay',
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded, failed
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  order_status TEXT DEFAULT 'new', -- new, confirmed, processing, shipped, delivered, cancelled, rto
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  awb_code TEXT,
  courier_name TEXT,
  tracking_url TEXT,
  label_url TEXT,
  invoice_url TEXT,
  pickup_scheduled_date TEXT,
  estimated_delivery TEXT,
  package_weight NUMERIC(6, 3),
  package_length NUMERIC(6, 2),
  package_breadth NUMERIC(6, 2),
  package_height NUMERIC(6, 2),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  refund_id TEXT,
  refund_amount INTEGER DEFAULT 0,
  refund_status TEXT DEFAULT 'none', -- none, initiated, processed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'percentage', -- percentage, fixed
  value INTEGER NOT NULL,
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACT_MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HOME_BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.home_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_desktop TEXT NOT NULL,
  image_mobile TEXT,
  link TEXT DEFAULT '/shop',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BLOG_POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  author_name TEXT DEFAULT 'Gayatri Bhai Atelier',
  author_role TEXT DEFAULT 'Creative Director',
  category TEXT DEFAULT 'Artisanal Craft',
  tags TEXT[] DEFAULT ARRAY['linen', 'heritage', 'luxury'],
  read_time TEXT DEFAULT '4 min read',
  is_published BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  related_product_ids TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REELS TABLE
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  caption TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  tag TEXT DEFAULT 'Lookbook',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADMIN_USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC: Increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Update customer stats
CREATE OR REPLACE FUNCTION public.update_customer_stats(cust_id UUID, order_total INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.customers
  SET total_spent = total_spent + order_total,
      total_orders = total_orders + 1,
      updated_at = NOW()
  WHERE id = cust_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEED: Super Admin User (Password: AdminPassword123!)
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES (
  'gayatripuri634@gmail.com',
  '$2a$10$xyokKzuEuKe.5SJgJm/c8e0XniBFVXNr0t5YVElgTKtR.w9kX/h7K',
  'Gayatri Puri',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- SEED: Initial Coupons
INSERT INTO public.coupons (code, description, type, value, min_order_amount, is_active)
VALUES 
  ('WELCOME10', '10% off on your inaugural order', 'percentage', 10, 150000, true),
  ('GAYATRI20', 'Flat ₹200 off on artisanal orders above ₹2000', 'fixed', 20000, 200000, true),
  ('SUMMER15', '15% off Summer Linen Collection', 'percentage', 15, 250000, true)
ON CONFLICT (code) DO NOTHING;

-- SEED: Initial Settings
INSERT INTO public.settings (key, value)
VALUES 
  ('brand_info', '{"name": "Gayatri Bhai", "tagline": "Pure Linen & Artisanal Couture", "email": "gayatripuri634@gmail.com", "phone": "+91 9876543210"}'::jsonb),
  ('shipping', '{"free_shipping_threshold": 300000, "default_shipping_fee": 15000, "pickup_pincode": "452001"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
