-- Optimized schema for Nexus Checkout System

-- Add additional indexes for better performance
-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers(first_name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_points ON customers(loyalty_points);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_total ON orders(total);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_price ON order_items(price);
CREATE INDEX IF NOT EXISTS idx_order_items_quantity ON order_items(quantity);

-- Add partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_completed ON orders(created_at) 
WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(created_at) 
WHERE status = 'pending';

-- Add GIN index for product tags (array type)
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Add text search capabilities
-- Create a tsvector column for full-text search on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on insert or update
DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION products_search_vector_update();

-- Create an index on the search vector
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN(search_vector);

-- Update existing products to populate the search vector
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(brand, '')), 'C');

-- Create a function to generate order IDs
CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TEXT AS $$
DECLARE
  timestamp_part TEXT;
  random_part TEXT;
BEGIN
  -- Get the current timestamp in milliseconds (last 6 digits)
  timestamp_part := to_char(extract(epoch from now()) * 1000, 'FM000000');
  timestamp_part := right(timestamp_part, 6);
  
  -- Generate a random 4-digit number
  random_part := to_char(floor(random() * 10000), 'FM0000');
  
  -- Combine parts to create the order ID
  RETURN 'ORD-' || timestamp_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Create a function to search products
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  description TEXT,
  image_url TEXT,
  barcode TEXT,
  stock INTEGER,
  category TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.description,
    p.image_url,
    p.barcode,
    p.stock,
    p.category,
    ts_rank(p.search_vector, to_tsquery('english', search_term)) AS rank
  FROM 
    products p
  WHERE 
    p.search_vector @@ to_tsquery('english', search_term)
  ORDER BY 
    rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a materialized view for sales statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS sales_statistics AS
SELECT
  date_trunc('month', o.created_at) AS month,
  SUM(o.total) AS total_sales,
  COUNT(DISTINCT o.id) AS order_count,
  COUNT(DISTINCT o.customer_id) AS customer_count,
  AVG(o.total) AS average_order_value
FROM
  orders o
WHERE
  o.status = 'completed'
GROUP BY
  date_trunc('month', o.created_at)
ORDER BY
  month;

-- Create an index on the month column of the materialized view
CREATE INDEX IF NOT EXISTS idx_sales_statistics_month ON sales_statistics(month);

-- Create a function to refresh the sales statistics materialized view
CREATE OR REPLACE FUNCTION refresh_sales_statistics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW sales_statistics;
END;
$$ LANGUAGE plpgsql;

-- Create a materialized view for product statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS product_statistics AS
SELECT
  p.id,
  p.name,
  p.category,
  SUM(oi.quantity) AS total_quantity_sold,
  SUM(oi.price * oi.quantity) AS total_sales,
  COUNT(DISTINCT o.id) AS order_count
FROM
  products p
  JOIN order_items oi ON p.id = oi.product_id
  JOIN orders o ON oi.order_id = o.id
WHERE
  o.status = 'completed'
GROUP BY
  p.id, p.name, p.category
ORDER BY
  total_sales DESC;

-- Create indexes on the product statistics materialized view
CREATE INDEX IF NOT EXISTS idx_product_statistics_id ON product_statistics(id);
CREATE INDEX IF NOT EXISTS idx_product_statistics_category ON product_statistics(category);
CREATE INDEX IF NOT EXISTS idx_product_statistics_total_sales ON product_statistics(total_sales);

-- Create a function to refresh the product statistics materialized view
CREATE OR REPLACE FUNCTION refresh_product_statistics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW product_statistics;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh the materialized views when orders are updated
CREATE OR REPLACE FUNCTION refresh_statistics_on_order_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only refresh if the status changed to or from 'completed'
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
     (TG_OP = 'UPDATE' AND (OLD.status <> 'completed' AND NEW.status = 'completed' OR
                           OLD.status = 'completed' AND NEW.status <> 'completed')) THEN
    -- Schedule the refresh to happen after the transaction completes
    PERFORM pg_notify('refresh_statistics', '');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the orders table
DROP TRIGGER IF EXISTS refresh_statistics_trigger ON orders;
CREATE TRIGGER refresh_statistics_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION refresh_statistics_on_order_change();

-- Initial refresh of materialized views
SELECT refresh_sales_statistics();
SELECT refresh_product_statistics();
