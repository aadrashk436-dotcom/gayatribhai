-- ==============================================================================
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
INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69ba28a30b819d3f52ce23a2', 'azure-leaf-hand-embroidered-shirt', 'Azure Leaf Hand-Embroidered Shirt', 'A breezy sky-blue shirt adorned with intricate, oversized leaf embroidery, capturing the essence of nature in elegant threads. Perfect for adding a fresh, artistic touch to your wardrobe.', 210000, 239000, 12,
  'Contemporary', 'Contemporary', 'M26/SS/CON/CS/23', 'Sky Blue', 'Premium cotton-linen blend',
  'Casual outings, garden parties, beach brunches, or daytime events where you want a relaxed yet stylish look.', 4.3, 24, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":4,"S":3,"M":3,"L":3,"XL":4,"XXL":5,"XXXL":6}'::jsonb, ARRAY['/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg', '/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_view_1.jpg', '/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_view_2.jpg', '/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_view_3.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b945bd07dee5c7ea02d951', 'deep-sea-coco-hand-embroidered-shirt', 'Deep Sea Coco Hand Embroidered Shirt', 'A rich sea blue shirt featuring elegant coconut tree hand embroidery. The deep tone combined with tropical detailing creates a calm yet striking look, perfect for effortless style with a coastal touch.', 239900, 249900, 4,
  'BeachSide', 'BeachSide', 'M26/SS/Beach/SF/22', 'Deep Sea Mint', 'Premium cotton-linen blend',
  'Vacations, beach days, resort wear, casual outings, and relaxed evening styling.', 4.4, 41, 'Bestseller', ARRAY['S', 'M', 'L', 'XXL', 'XL']::text[],
  '{"XS":7,"S":6,"M":6,"L":6,"XL":7,"XXL":8,"XXXL":9}'::jsonb, ARRAY['/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_main.jpg', '/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_view_1.jpg', '/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_view_2.jpg', '/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_view_3.jpg', '/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_view_4.jpg', '/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_view_5.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9439007dee5c7ea02d8fd', 'true-red-havana-beach-embroidered-shirt', 'True Red Havana Beach Embroidered Shirt', 'A bold true red shirt featuring elegant coconut tree embroidery, inspired by tropical Havana vibes. The striking color paired with minimal beach-inspired detailing creates a perfect balance of statement and sophistication.', 189900, 229900, 17,
  'BeachSide', 'BeachSide', 'M26/SS/Beach/SF/21', 'True Red', 'Premium cotton-linen blend',
  'Vacations, beach outings, resort wear, evening get-togethers, and standout casual styling.', 4.5, 58, 'Limited', ARRAY['S', 'M', 'L', 'XXL', 'XL']::text[],
  '{"XS":10,"S":9,"M":9,"L":9,"XL":10,"XXL":11,"XXXL":12}'::jsonb, ARRAY['/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_main.jpg', '/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_view_1.jpg', '/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_view_2.jpg', '/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_view_3.jpg', '/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_view_4.jpg', '/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_view_5.jpg', '/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b941d407dee5c7ea02d8ac', 'coco-flamingo-beach-shirt', 'Coco Flamingo Beach Shirt', 'An off-white shirt featuring beautiful coconut tree embroidery on the front and back. The tropical-inspired design adds a breezy, beachy charm, making it a perfect blend of minimal style and vacation vibes.', 279900, 299900, 7,
  'BeachSide', 'BeachSide', 'M26/SS/Beach/CS/20', 'Off White', 'Premium cotton-linen blend',
  'Beach days, vacations, resort wear, casual outings, and relaxed summer styling.', 4.6, 75, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":13,"S":12,"M":12,"L":12,"XL":13,"XXL":2,"XXXL":3}'::jsonb, ARRAY['/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_main.jpg', '/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_view_1.jpg', '/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_view_2.jpg', '/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_view_3.jpg', '/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_view_4.jpg', '/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_view_5.jpg', '/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9401907dee5c7ea02d82c', 'costal-king-hand-embroidered-shirt', 'Costal King Hand Embroidered Shirt', 'A pristine snow white shirt brought to life with intricate hand embroidery inspired by the sea. Featuring charming motifs like fish, sun, bottle, bird, and boat, each element adds a playful yet artistic touch, capturing the essence of coastal living in a unique and stylish way.', 219900, 239000, 8,
  'BeachSide', 'BeachSide', 'M26/SS/Beach/SF/19', 'Snow White', 'Premium cotton-linen blend',
  'Vacations, beach days, casual outings, resort wear, and relaxed day styling.', 4.7, 92, 'Bestseller', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":4,"S":3,"M":3,"L":3,"XL":4,"XXL":5,"XXXL":6}'::jsonb, ARRAY['/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_main.jpg', '/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_view_1.jpg', '/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_view_2.jpg', '/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_view_3.jpg', '/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_view_4.jpg', '/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_view_5.jpg', '/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b93e1e07dee5c7ea02d7b1', 'pearl-white-red-spotted-shirt', 'Pearl White Red Spotted Shirt', 'A crisp pearl white shirt accented with delicate red embroidered lines, creating a subtle spotted effect. The fine detailing adds a touch of elegance while keeping the look clean and versatile—perfect for effortless styling.', 139900, 159900, 13,
  'Contemporary', 'Contemporary', 'M26/SS/CON/CS/18', 'Pearl White', 'Premium cotton-linen blend',
  'Workwear, casual outings, brunch dates, and minimal everyday styling.', 4.8, 109, 'Limited', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":7,"S":6,"M":6,"L":6,"XL":7,"XXL":8,"XXXL":0}'::jsonb, ARRAY['/assets/products/Pearl_White_Red_Spotted_Shirt/Pearl_White_Red_Spotted_Shirt_main.jpg', '/assets/products/Pearl_White_Red_Spotted_Shirt/Pearl_White_Red_Spotted_Shirt_view_1.jpg', '/assets/products/Pearl_White_Red_Spotted_Shirt/Pearl_White_Red_Spotted_Shirt_view_2.jpg', '/assets/products/Pearl_White_Red_Spotted_Shirt/Pearl_White_Red_Spotted_Shirt_view_3.jpg', '/assets/products/Pearl_White_Red_Spotted_Shirt/Pearl_White_Red_Spotted_Shirt_view_4.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b93c7907dee5c7ea02d769', 'sea-shore-leaf-shirt', 'Sea Shore Leaf Shirt', 'A soothing sky blue full-sleeve shirt with sea green tones, featuring delicate leaf embroidery above the pocket. The minimal yet refreshing design captures a calm, coastal vibe, making it effortlessly stylish and easy to wear.', 169900, 199900, 15,
  'Contemporary', 'Contemporary', 'M26/SS/CON/SF/12', 'Sea Green', 'Premium cotton-linen blend',
  'Casual outings, beach days, vacations, day wear, and relaxed everyday styling.', 4.3, 126, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":10,"S":9,"M":9,"L":9,"XL":10,"XXL":0,"XXXL":12}'::jsonb, ARRAY['/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_main.jpg', '/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_view_1.jpg', '/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_view_2.jpg', '/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_view_3.jpg', '/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_view_4.jpg', '/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_view_5.jpg', '/assets/products/Sea_Shore_Leaf_Shirt/Sea_Shore_Leaf_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b93ac507dee5c7ea02d6f8', 'matcha-green-artistic-shirt', 'Matcha Green Artistic Shirt', 'A refreshing matcha green shirt featuring unique hand embroidery of a scooter, coconut trees, and chairs. The artistic, travel-inspired design brings a relaxed and playful vibe, making it a standout piece with a story to tell.', 189900, 229900, 17,
  'Contemporary', 'Contemporary', 'M26/SS/CON/SF/16', 'Matcha Green', 'Premium cotton-linen blend',
  'Vacations, casual outings, brunch dates, day trips, and laid-back everyday styling.', 4.4, 143, 'Bestseller', ARRAY['S', 'M', 'XL', 'XXL', 'L']::text[],
  '{"XS":0,"S":12,"M":12,"L":12,"XL":0,"XXL":2,"XXXL":3}'::jsonb, ARRAY['/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_main.jpg', '/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_view_1.jpg', '/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_view_2.jpg', '/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_view_3.jpg', '/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_view_4.jpg', '/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_view_5.jpg', '/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b938bc07dee5c7ea02d68c', 'salmon-pink-hand-embroidered-shirt', 'Salmon Pink Hand Embroidered Shirt', 'A soft salmon pink full-sleeve shirt beautifully adorned with hand embroidery featuring sun, floral, pot, and bird motifs. The playful yet artistic detailing adds a lively charm, making it a standout piece with a touch of nature-inspired elegance.', 189900, 229900, 17,
  'Contemporary', 'Contemporary', 'M26/SS/CON/SF/15', 'Pink', 'Premium cotton-linen blend',
  'Casual outings, brunch dates, day events, vacations, and creative everyday styling.', 4.5, 160, 'Limited', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":4,"S":0,"M":0,"L":0,"XL":4,"XXL":5,"XXXL":6}'::jsonb, ARRAY['/assets/products/Salmon_Pink_Hand_Embroidered_Shirt/Salmon_Pink_Hand_Embroidered_Shirt_main.jpg', '/assets/products/Salmon_Pink_Hand_Embroidered_Shirt/Salmon_Pink_Hand_Embroidered_Shirt_view_1.jpg', '/assets/products/Salmon_Pink_Hand_Embroidered_Shirt/Salmon_Pink_Hand_Embroidered_Shirt_view_2.jpg', '/assets/products/Salmon_Pink_Hand_Embroidered_Shirt/Salmon_Pink_Hand_Embroidered_Shirt_view_3.jpg', '/assets/products/Salmon_Pink_Hand_Embroidered_Shirt/Salmon_Pink_Hand_Embroidered_Shirt_view_4.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9376907dee5c7ea02d625', 'maroon-handcrafted-arro-shirt', 'Maroon Handcrafted Arro Shirt', 'A rich maroon handcrafted shirt featuring subtle arrow-inspired embroidery. The fine detailing adds a unique geometric charm while keeping the look minimal and versatile. Perfect for those who appreciate understated craftsmanship with a modern touch.', 139900, 159900, 13,
  'Contemporary', 'Contemporary', 'M26/SS/CON/SS/14', 'Maroon', 'Premium cotton-linen blend',
  'Casual outings, workwear, evening meet-ups, and smart everyday styling.', 4.6, 177, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":7,"S":6,"M":6,"L":6,"XL":7,"XXL":8,"XXXL":9}'::jsonb, ARRAY['/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_main.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_1.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_2.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_3.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_4.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_5.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_6.jpg', '/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_view_7.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b935a907dee5c7ea02d5c3', 'the-bract-hand-embroidered-rust-cotton-linen-shirt', 'The Bract Hand Embroidered Rust Cotton Linen Shirt', 'A beautifully handcrafted rust cotton linen shirt adorned with two statement leaf embroideries. The bold yet minimal design adds a natural, earthy charm, making it a perfect blend of elegance and comfort for everyday wear.', 169900, 199900, 15,
  'Nature', 'Nature', 'M26/SS/NATURE/SF/13', 'Rust Color', 'Premium cotton-linen blend',
  'Ideal for workdays, casual meet-ups, brunches, and understated festive styling.', 4.7, 194, 'Bestseller', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":10,"S":9,"M":9,"L":9,"XL":10,"XXL":11,"XXXL":12}'::jsonb, ARRAY['/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_main.jpg', '/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_view_1.jpg', '/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_view_2.jpg', '/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_view_3.jpg', '/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_view_4.jpg', '/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_view_5.jpg', '/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b92ba507dee5c7ea02d213', 'flying-in-the-air-handcrafted-shirt', 'Flying In The Air Handcrafted Shirt', 'The design follows the journey of a bird in flight. On the chest, a hand-embroidered bird takes off, while at the bottom corner, a second motif grounded in intricate Kantha work adds a touch of playful asymmetry. The true soul of the piece lies on the back yoke, where the hand-stitched words "Flying in the Air" serve as a quiet reminder to embrace the breeze and the beauty of the present moment.', 179900, 199900, 10,
  'Nature', 'Nature', 'M26/SS/NATURE/SF/12', 'White', 'A premium blend of cotton and linen in an earthy, unbleached natural white—breathable, soft, and perfect for any climate.',
  'Casual outings, brunch dates, festive gatherings, and everyday elegance.', 4.8, 31, 'Limited', ARRAY['S', 'M', 'XL', 'XXL', 'L']::text[],
  '{"XS":13,"S":12,"M":12,"L":12,"XL":13,"XXL":2,"XXXL":3}'::jsonb, ARRAY['/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_main.jpg', '/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_view_1.jpg', '/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_view_2.jpg', '/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_view_3.jpg', '/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_view_4.jpg', '/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_view_5.jpg', '/assets/products/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT/FLYING_IN_THE_AIR_HANDCRAFTED_SHIRT_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9298e07dee5c7ea02d1c0', 'french-knotted-leaves-shirt', 'French Knotted Leaves Shirt', 'Elegant red handmade shirt featuring delicate French knot leaf embroidery. Each tiny leaf is intricately crafted, giving the piece a subtle textured charm. Perfect for adding a touch of artisanal beauty to your everyday style.', 169900, 199900, 15,
  'Nature', 'Nature', 'M26/SS/NATURE/CS/11', 'Red', 'Premium cotton-linen blend',
  'Perfect for brunches, casual meet-ups, small festive occasions, and effortless daily wear.', 4.3, 48, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":4,"S":3,"M":3,"L":3,"XL":4,"XXL":5,"XXXL":6}'::jsonb, ARRAY['/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_main.jpg', '/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_view_1.jpg', '/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_view_2.jpg', '/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_view_3.jpg', '/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_view_4.jpg', '/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_view_5.jpg', '/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b927a207dee5c7ea02d173', 'the-life-tree-cotton-shirt', 'The Life Tree Cotton Shirt', 'Trees give peace to the souls of men to stay somewhere long.
This exquisite hand-embroidered shirt features two deeply rooted trees—one delicately stitched onto the front patch pocket, and its companion gracing the back. Like steadfast friends who have chosen their perfect place, these embroidered motifs work together to balance the garment, creating a beautiful and lasting sense of harmony.', 279900, 309900, 10,
  'Nature', 'Nature', 'M26/SS/NATURE/CS/10', 'Rust', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.4, 65, 'Bestseller', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":7,"S":6,"M":6,"L":6,"XL":7,"XXL":8,"XXXL":9}'::jsonb, ARRAY['/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_main.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_1.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_2.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_3.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_4.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_5.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_6.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_7.jpg', '/assets/products/The_life_tree_cotton_shirt/The_life_tree_cotton_shirt_view_8.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b924c107dee5c7ea02d0c3', 'the-solstice-hand-embroidered-artisan-shirt', 'The Solstice Hand Embroidered Artisan Shirt', 'Embrace effortless summer style with this Handcrafted Short-Sleeve Button-Down. Meticulously designed for the modern individual who appreciates artisanal detail, this shirt features a unique hand-embroidered sunburst motif on the chest, rendered in contrasting teal and white threads.

The charm lies in the craftsmanship: visible kantha-style pick stitching runs along the placket, adding a rugged, bespoke texture that sets it apart from mass-produced apparel. Cut from a breathable, lightweight fabric with a natural matte finish, it’s designed to keep you cool while looking polished.', 189900, 229900, 17,
  'Nature', 'Nature', 'M26/SS/NATURE/SF/09', 'SALMON PINK', 'Premium cotton-linen blend',
  'Perfect for golden hour gatherings, beachside brunches, or elevated daily wear.', 4.5, 82, 'Limited', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":10,"S":9,"M":9,"L":9,"XL":10,"XXL":11,"XXXL":0}'::jsonb, ARRAY['/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_main.jpg', '/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_view_1.jpg', '/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_view_2.jpg', '/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_view_3.jpg', '/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_view_4.jpg', '/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_view_5.jpg', '/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_view_6.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9236307dee5c7ea02d09d', 'the-solar-sol-shirt', 'The Solar Sol Shirt', 'Capture the essence of a warm Mediterranean sunset with this striking brown cotton-linen shirt. Designed for the man who appreciates artisanal detail, this piece features a hand-embroidered sun motif on the chest, radiating a relaxed, soulful energy. The Cuban collar and half-sleeves provide a classic, airy silhouette, while the intricate zigzag embroidery along the placket and hem adds a unique, handcrafted touch that sets it apart from the ordinary.', 179900, 199900, 10,
  'Nature', 'Nature', 'M26/SS/NATURE/CS/08', 'Brown', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.6, 99, 'New', ARRAY['S', 'M', 'L', 'XXL', 'XL']::text[],
  '{"XS":13,"S":12,"M":12,"L":12,"XL":13,"XXL":0,"XXXL":3}'::jsonb, ARRAY['/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_main.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_1.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_2.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_3.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_4.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_5.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_6.jpg', '/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_view_7.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b91f8e07dee5c7ea02cf5d', 'floral-pocket-shirt', 'Floral Pocket Shirt', 'The french knotted embellished floral motif on a patch pocket.
Featuring cuban collar half sleeve off white colored loose fit casual wear shirt.
Comfortable and breathable natural fabric for your breezy summers.', 139900, 159900, 13,
  'Floral', 'Floral', 'M26/SS/FLORAL/CS/07', 'White', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.7, 116, 'Bestseller', ARRAY['S', 'M', 'L', 'XXL', 'XL']::text[],
  '{"XS":0,"S":3,"M":3,"L":3,"XL":0,"XXL":5,"XXXL":6}'::jsonb, ARRAY['/assets/products/FLORAL_POCKET_SHIRT/FLORAL_POCKET_SHIRT_main.jpg', '/assets/products/FLORAL_POCKET_SHIRT/FLORAL_POCKET_SHIRT_view_1.jpg', '/assets/products/FLORAL_POCKET_SHIRT/FLORAL_POCKET_SHIRT_view_2.jpg', '/assets/products/FLORAL_POCKET_SHIRT/FLORAL_POCKET_SHIRT_view_3.jpg', '/assets/products/FLORAL_POCKET_SHIRT/FLORAL_POCKET_SHIRT_view_4.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b91c7107dee5c7ea02ce85', 'the-aether-sky-blue-hand-stitched-artisan-shirt', 'The "Aether" Sky Blue Hand-Stitched Artisan Shirt', 'A Breath of Artisanal Air

Inspired by the clear, expansive skies of a summer morning, this handcrafted sustainable cotton shirt is designed for the man who values both style and substance. Every inch of the garment tells a story of "slow fashion," where traditional techniques are repurposed for a modern, breezy silhouette.

The shirt features a delicate dance of textures: all-over French knot "butties" in a contrasting navy thread are hand-stitched across the body, creating a subtle 3D effect that catches the light. To ground the design, Kantha-work parallel stripes run vertically alongside the front placket, extending to the collar and back yoke. These rhythmic, hand-run stitches provide a structural elegance that highlights the shirt’s bespoke nature. Finished with natural wooden buttons, this piece isn''t just a shirt—it''s a wearable piece of art that keeps you cool while making a conscious statement.
', 189900, 229900, 17,
  'Floral', 'Floral', 'M26/SS/NATURE/CS/06', 'Sky Blue', 'Premium, breathable sustainable cotton in a vibrant Pastel Sky Blue.',
  'Ideal for beach weddings, garden parties, or elevated weekend brunches.', 4.8, 133, 'Limited', ARRAY['S', 'M', 'L', 'XXL', 'XL']::text[],
  '{"XS":7,"S":0,"M":0,"L":0,"XL":7,"XXL":8,"XXXL":9}'::jsonb, ARRAY['/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_main.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_1.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_2.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_3.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_4.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_5.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_6.jpg', '/assets/products/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt/The_Aether_Sky_Blue_Hand-Stitched_Artisan_Shirt_view_7.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b91a3607dee5c7ea02ce5b', 'mustard-floral-shirt', 'Mustard Floral Shirt', '', 209900, 229900, 9,
  'Floral', 'Floral', 'M26/SS/FLORAL/CS/05', 'Brown', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.3, 150, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":10,"S":9,"M":9,"L":9,"XL":10,"XXL":11,"XXXL":12}'::jsonb, ARRAY['/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_main.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_1.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_2.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_3.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_4.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_5.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_6.jpg', '/assets/products/Mustard_Floral_Shirt/Mustard_Floral_Shirt_view_7.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9184807dee5c7ea02ce0b', 'maroon-handcrafted-shirt', 'Maroon Handcrafted Shirt', 'Regular fit shirt made from a cotton and linen blend fabric. Featuring a hand embroidered motif at the above side of your beautiful heart. Patterns include shirt collar and long sleeves with buttoned cuffs', 139900, 159900, 13,
  'Floral', 'Floral', 'M26/SS/FLORAL/CS/04', 'MAROON', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.4, 167, 'Bestseller', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":13,"S":12,"M":12,"L":12,"XL":13,"XXL":2,"XXXL":3}'::jsonb, ARRAY['/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_main.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_1.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_2.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_3.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_4.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_5.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_6.jpg', '/assets/products/MAROON_HANDCRAFTED_SHIRT/MAROON_HANDCRAFTED_SHIRT_view_7.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b916a807dee5c7ea02cddb', 'coffee-brown-floral-shirt', ' Coffee Brown Floral Shirt', 'The cuban collar relaxed fit shirt with loose fit short sleeves for more moments to enjoy your casual moments at work or at the vacation. Spotted beautiful and elegant contrast  hand embroidered floral vel pattern motif. ', 129900, 159900, 19,
  'Floral', 'Floral', 'M26/SS/FLORAL/CS/06', 'COFFEE BROWN', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.5, 184, 'Limited', ARRAY['S', 'M', 'L', 'XXL', 'XL']::text[],
  '{"XS":4,"S":3,"M":3,"L":3,"XL":4,"XXL":5,"XXXL":6}'::jsonb, ARRAY['/assets/products/COFFEE_BROWN_FLORAL_SHIRT/COFFEE_BROWN_FLORAL_SHIRT_main.jpg', '/assets/products/COFFEE_BROWN_FLORAL_SHIRT/COFFEE_BROWN_FLORAL_SHIRT_view_1.jpg', '/assets/products/COFFEE_BROWN_FLORAL_SHIRT/COFFEE_BROWN_FLORAL_SHIRT_view_2.jpg', '/assets/products/COFFEE_BROWN_FLORAL_SHIRT/COFFEE_BROWN_FLORAL_SHIRT_view_3.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b914be07dee5c7ea02cd8d', 'floral-embroidered-sketch-shirt', ' Floral Embroidered Sketch Shirt', ' Peach pink handcrafted mens shirt featuring sketch inspired intricate hand embroidered detailing, loose fit pattern to allow fluid movement and a subtle visual flow. Natural cotton fabric is durable and breathable, amplified with  A structured, relaxed fit and easily stiffed  for ample room for statement view.', 189900, 199900, 5,
  'Floral', 'Floral', 'M26/SS/FLORAL/CS/02', 'PEACH PINK', 'Premium cotton-linen blend',
  'Elevated everyday wear', 4.6, 201, 'New', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":7,"S":6,"M":6,"L":6,"XL":7,"XXL":8,"XXXL":9}'::jsonb, ARRAY['/assets/products/FLORAL_EMBROIDERED_SKETCH_SHIRT/FLORAL_EMBROIDERED_SKETCH_SHIRT_main.jpg', '/assets/products/FLORAL_EMBROIDERED_SKETCH_SHIRT/FLORAL_EMBROIDERED_SKETCH_SHIRT_view_1.jpg', '/assets/products/FLORAL_EMBROIDERED_SKETCH_SHIRT/FLORAL_EMBROIDERED_SKETCH_SHIRT_view_2.jpg', '/assets/products/FLORAL_EMBROIDERED_SKETCH_SHIRT/FLORAL_EMBROIDERED_SKETCH_SHIRT_view_3.jpg', '/assets/products/FLORAL_EMBROIDERED_SKETCH_SHIRT/FLORAL_EMBROIDERED_SKETCH_SHIRT_view_4.jpg', '/assets/products/FLORAL_EMBROIDERED_SKETCH_SHIRT/FLORAL_EMBROIDERED_SKETCH_SHIRT_view_5.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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

INSERT INTO public.products (
  id, slug, name, description, price, mrp, discount, category, sub_category, sku,
  color, fabric, occasion, rating, reviews_count, badge, sizes, stock, images,
  weight, length, breadth, height, is_visible, is_in_stock
) VALUES (
  '69b9118607dee5c7ea02cd18', 'hand-embroidered-floral-shirt', 'Hand Embroidered Floral Shirt', 'Cuban collar relax fit half sleeve shirt made from a linen and cotton blend fabric. Featuring a front side symmetrical dedicated handworked floral motif inspired from the Indian historical arts.', 279900, 299900, 7,
  'Floral', 'Floral', 'M26/SS/FLORAL/CS/01', 'Off White', 'Cotton 80% and Linen 20%, 100% Natural fabric',
  'Elevated everyday wear', 4.7, 38, 'Bestseller', ARRAY['S', 'M', 'L', 'XL', 'XXL']::text[],
  '{"XS":10,"S":9,"M":9,"L":9,"XL":10,"XXL":11,"XXXL":12}'::jsonb, ARRAY['/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_main.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_1.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_2.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_3.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_4.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_5.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_6.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_7.jpg', '/assets/products/HAND_EMBROIDERED_FLORAL_SHIRT/HAND_EMBROIDERED_FLORAL_SHIRT_view_8.jpg']::text[], 0.35, 30.0, 25.0, 4.0, true, true
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
