-- Migration: Normalize product categories and implement ENUM types
-- This migration normalizes the product categories and implements ENUM types for status fields

-- Start transaction
BEGIN;

-- Part 1: Normalize Product Categories

-- 1. Ensure the categories table exists
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_categories_updated_at();

-- 3. Populate categories table with unique categories from products table
INSERT INTO categories (name)
SELECT DISTINCT category FROM products
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (name) DO NOTHING;

-- 4. Add category_id column to products table
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 5. Update products table to set category_id based on category name
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category = c.name;

-- 6. Create index on category_id
CREATE INDEX idx_products_category_id ON products(category_id);

-- Part 2: Implement ENUM Types for Status Fields

-- 1. Create ENUM types
CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status_enum AS ENUM (
  'unpaid',
  'paid',
  'pending',
  'failed',
  'refunded'
);

CREATE TYPE user_role_enum AS ENUM (
  'user',
  'staff',
  'manager',
  'admin'
);

-- 2. Add temporary columns for the transition
ALTER TABLE orders ADD COLUMN status_enum order_status_enum;
ALTER TABLE orders ADD COLUMN payment_status_enum payment_status_enum;
ALTER TABLE users ADD COLUMN role_enum user_role_enum;

-- 3. Update the temporary columns with values from the existing columns
UPDATE orders SET status_enum = status::order_status_enum WHERE status IS NOT NULL;

-- Check if payment_status column exists before updating
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        UPDATE orders SET payment_status_enum = payment_status::payment_status_enum WHERE payment_status IS NOT NULL;
    END IF;
END $$;

-- Check if role column exists before updating
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        UPDATE users SET role_enum = role::user_role_enum WHERE role IS NOT NULL;
    END IF;
END $$;

-- 4. Drop the old columns and rename the new ones
-- Drop dependent materialized views first
DROP MATERIALIZED VIEW IF EXISTS sales_statistics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS product_statistics CASCADE;

-- Now drop the column
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE orders RENAME COLUMN status_enum TO status;

-- Check if payment_status column exists before dropping
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE orders DROP COLUMN payment_status;
        ALTER TABLE orders RENAME COLUMN payment_status_enum TO payment_status;
    ELSE
        ALTER TABLE orders RENAME COLUMN payment_status_enum TO payment_status;
    END IF;
END $$;

-- Check if role column exists before dropping
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users DROP COLUMN role;
        ALTER TABLE users RENAME COLUMN role_enum TO role;
    ELSE
        ALTER TABLE users RENAME COLUMN role_enum TO role;
    END IF;
END $$;

-- 5. Set default values for the ENUM columns
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'unpaid';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- 6. Create or update the product_sales view to use category_id
DO $$
BEGIN
    -- Drop the view if it exists
    DROP VIEW IF EXISTS product_sales;

    -- Create the view
    CREATE VIEW product_sales AS
    SELECT
      p.id,
      p.name,
      c.name as category,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.quantity * oi.price) as total_sales
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE o.status = 'completed'
    GROUP BY p.id, p.name, c.name;
END $$;

-- Commit transaction
COMMIT;
