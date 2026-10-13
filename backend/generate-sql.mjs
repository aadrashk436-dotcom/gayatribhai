import fs from 'fs';
import path from 'path';

const productsPath = './src/data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

let sql = `-- ==============================================================================
-- Gayatri Bhai E-Commerce Platform — Supabase Full Database Setup
-- 1-Click Execution for Supabase SQL Editor (https://supabase.com/dashboard)
-- Creates all tables, columns, constraints, and inserts all 23 products & data!
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
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
  weight NUMERIC(6, 3) DEFAULT 0.350,
  length NUMERIC(6, 2) DEFAULT 30.00,
  breadth NUMERIC(6, 2) DEFAULT 25.00,
  height NUMERIC(6, 2) DEFAULT 4.00,
  is_visible BOOLEAN DEFAULT true,
  is_in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  password_hash TEXT DEFAULT '',
  tier TEXT DEFAULT 'Silver',
  points INTEGER DEFAULT 250,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  shipping INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'ONLINE',
  payment_status TEXT DEFAULT 'PENDING',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  awb_code TEXT,
  courier_name TEXT,
  status TEXT DEFAULT 'PROCESSING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'PERCENTAGE',
  value INTEGER NOT NULL,
  min_order_value INTEGER DEFAULT 0,
  max_discount INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 1000,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link TEXT DEFAULT '/shop',
  cta_text TEXT DEFAULT 'Shop Collection',
  position INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security so Public API / Service Role can access smoothly
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- INSERT ALL 23 LUXURY SHIRTS WITH DETAILED IMAGES, PRICING & INVENTORY
-- ==============================================================================
`;

function esc(str) {
  if (str === null || str === undefined) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

for (const p of products) {
  const imagesArr = "ARRAY[" + (p.images || []).map(img => esc(img)).join(', ') + "]::text[]";
  const sizesArr = "ARRAY[" + (p.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(s => esc(s)).join(', ') + "]::text[]";
  const stockJson = esc(JSON.stringify(p.stock || { S: 10, M: 10, L: 10, XL: 10, XXL: 10 }));

  sql += `INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  ${esc(p.id)}, ${esc(p.slug)}, ${esc(p.name)}, ${esc(p.description)}, ${p.price}, ${p.mrp}, ${p.discount || 0},
  ${esc(p.category)}, ${esc(p.sub_category || p.category)}, ${esc(p.sku)}, ${esc(p.color)}, ${esc(p.fabric)},
  ${esc(p.occasion)}, ${p.rating || 4.5}, ${p.reviews_count || 20}, ${esc(p.badge || '')}, ${sizesArr},
  ${stockJson}::jsonb, ${imagesArr}, 0.35, 30.0, 25.0, 4.0, true, true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  discount = EXCLUDED.discount,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  color = EXCLUDED.color,
  fabric = EXCLUDED.fabric,
  occasion = EXCLUDED.occasion,
  sizes = EXCLUDED.sizes,
  stock = EXCLUDED.stock,
  images = EXCLUDED.images,
  updated_at = NOW();

`;
}

sql += `
-- ==============================================================================
-- INSERT DEFAULT COUPONS
-- ==============================================================================
INSERT INTO public.coupons (id, code, type, value, min_order_value, max_discount, is_active)
VALUES
  ('cpn_welcome10', 'WELCOME10', 'PERCENTAGE', 10, 0, 50000, true),
  ('cpn_gayatri20', 'GAYATRI20', 'FLAT', 20000, 149900, 20000, true),
  ('cpn_first10', 'FIRST10', 'PERCENTAGE', 10, 0, 30000, true)
ON CONFLICT (code) DO UPDATE SET
  value = EXCLUDED.value,
  is_active = true;

-- ==============================================================================
-- INSERT DEFAULT LUXURY BANNERS
-- ==============================================================================
INSERT INTO public.banners (id, title, subtitle, image_url, link, cta_text, position, is_active)
VALUES
  ('bnr_hero_1', 'The Summer Atelier', 'Handcrafted pure French linen with botanical threadwork', '/assets/banners/hero-linen-atelier.png', '/shop', 'Explore Collection', 1, true),
  ('bnr_hero_2', 'Resort Dressing 2026', 'Cuban collars and relaxed fits engineered for coastal living', '/assets/banners/hero-resort-linen.png', '/shop?category=Resort', 'View Resort Edits', 2, true),
  ('bnr_hero_3', 'Terracotta & Sky', 'Subtle earthy hues crafted from 100% natural organic flax', '/assets/banners/hero-terracotta-linen.png', '/shop?category=Classic', 'Shop The Drop', 3, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url;

-- ==============================================================================
-- INSERT STORE ADMIN USER
-- ==============================================================================
INSERT INTO public.admin_users (id, email, password_hash, name, role, is_active)
VALUES (
  'admin_super_1',
  'gayatripuri634@gmail.com',
  '$2a$10$NQKlq5vwJ0AzCudcnEZDZeWS5fDwtlWuGKrEe4haxUH7al9vAGcze',
  'Gayatri Puri',
  'super_admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;
`;

fs.writeFileSync('supabase_setup_all.sql', sql);
fs.writeFileSync('../supabase_setup_all.sql', sql);
console.log('Successfully generated supabase_setup_all.sql! Total chars:', sql.length);
