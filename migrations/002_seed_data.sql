-- Seed data for Nexus Checkout System

-- Products
INSERT INTO products (id, name, price, description, image_url, barcode, stock, sku, category, brand, tags)
VALUES
  (uuid_generate_v4(), 'Smartphone X', 799.99, 'Latest smartphone with advanced features', 'https://example.com/smartphone.jpg', '123456789012', 50, 'PHONE-001', 'Electronics', 'TechBrand', ARRAY['smartphone', 'tech', 'mobile']),
  (uuid_generate_v4(), 'Laptop Pro', 1299.99, 'Professional laptop for work and gaming', 'https://example.com/laptop.jpg', '223456789012', 30, 'LAPTOP-001', 'Electronics', 'TechBrand', ARRAY['laptop', 'computer', 'tech']),
  (uuid_generate_v4(), 'Wireless Headphones', 149.99, 'Noise-cancelling wireless headphones', 'https://example.com/headphones.jpg', '323456789012', 100, 'AUDIO-001', 'Electronics', 'SoundMaster', ARRAY['audio', 'headphones', 'wireless']),
  (uuid_generate_v4(), 'Smart Watch', 249.99, 'Fitness and health tracking smart watch', 'https://example.com/smartwatch.jpg', '423456789012', 75, 'WATCH-001', 'Electronics', 'FitTech', ARRAY['wearable', 'watch', 'fitness']),
  (uuid_generate_v4(), 'Coffee Maker', 89.99, 'Automatic coffee maker with timer', 'https://example.com/coffeemaker.jpg', '523456789012', 40, 'HOME-001', 'Home Appliances', 'HomeBrew', ARRAY['kitchen', 'coffee', 'appliance']),
  (uuid_generate_v4(), 'Blender', 69.99, 'High-speed blender for smoothies and more', 'https://example.com/blender.jpg', '623456789012', 60, 'HOME-002', 'Home Appliances', 'KitchenPro', ARRAY['kitchen', 'blender', 'appliance']),
  (uuid_generate_v4(), 'Desk Lamp', 39.99, 'Adjustable LED desk lamp', 'https://example.com/lamp.jpg', '723456789012', 120, 'HOME-003', 'Home Appliances', 'LightMaster', ARRAY['lighting', 'lamp', 'desk']),
  (uuid_generate_v4(), 'Backpack', 59.99, 'Durable backpack with laptop compartment', 'https://example.com/backpack.jpg', '823456789012', 90, 'BAG-001', 'Accessories', 'TravelGear', ARRAY['bag', 'travel', 'accessory']),
  (uuid_generate_v4(), 'Water Bottle', 24.99, 'Insulated stainless steel water bottle', 'https://example.com/waterbottle.jpg', '923456789012', 150, 'ACC-001', 'Accessories', 'HydroLife', ARRAY['bottle', 'hydration', 'accessory']),
  (uuid_generate_v4(), 'Wireless Mouse', 29.99, 'Ergonomic wireless mouse', 'https://example.com/mouse.jpg', '023456789012', 80, 'COMP-001', 'Computer Accessories', 'TechGear', ARRAY['mouse', 'computer', 'wireless']);

-- Customers
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, postal_code, country, loyalty_points)
VALUES
  (uuid_generate_v4(), 'John', 'Doe', 'john.doe@example.com', '123-456-7890', '123 Main St', 'Anytown', '12345', 'USA', 100),
  (uuid_generate_v4(), 'Jane', 'Smith', 'jane.smith@example.com', '234-567-8901', '456 Oak Ave', 'Somewhere', '23456', 'USA', 150),
  (uuid_generate_v4(), 'Bob', 'Johnson', 'bob.johnson@example.com', '345-678-9012', '789 Pine Rd', 'Nowhere', '34567', 'USA', 75),
  (uuid_generate_v4(), 'Alice', 'Williams', 'alice.williams@example.com', '456-789-0123', '321 Elm St', 'Anywhere', '45678', 'USA', 200),
  (uuid_generate_v4(), 'Charlie', 'Brown', 'charlie.brown@example.com', '567-890-1234', '654 Maple Dr', 'Everywhere', '56789', 'USA', 50);

-- Create a function to generate a random order ID
CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Orders (using customer emails for simplicity)
DO $$
DECLARE
  customer_id UUID;
  product_id UUID;
  order_id TEXT;
  order_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get a customer ID
  SELECT id INTO customer_id FROM customers WHERE email = 'john.doe@example.com';
  
  -- Create an order for John Doe
  order_id := generate_order_id();
  order_date := NOW() - INTERVAL '2 days';
  
  INSERT INTO orders (id, customer_id, customer_email, customer_name, total, status, payment_method, created_at)
  VALUES (order_id, customer_id, 'john.doe@example.com', 'John Doe', 849.98, 'completed', 'credit_card', order_date);
  
  -- Add items to the order
  SELECT id INTO product_id FROM products WHERE name = 'Smartphone X';
  INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
  VALUES (order_id, product_id, 1, 799.99, order_date);
  
  SELECT id INTO product_id FROM products WHERE name = 'Water Bottle';
  INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
  VALUES (order_id, product_id, 2, 24.99, order_date);
  
  -- Get another customer ID
  SELECT id INTO customer_id FROM customers WHERE email = 'jane.smith@example.com';
  
  -- Create an order for Jane Smith
  order_id := generate_order_id();
  order_date := NOW() - INTERVAL '1 day';
  
  INSERT INTO orders (id, customer_id, customer_email, customer_name, total, status, payment_method, created_at)
  VALUES (order_id, customer_id, 'jane.smith@example.com', 'Jane Smith', 1349.98, 'completed', 'paypal', order_date);
  
  -- Add items to the order
  SELECT id INTO product_id FROM products WHERE name = 'Laptop Pro';
  INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
  VALUES (order_id, product_id, 1, 1299.99, order_date);
  
  SELECT id INTO product_id FROM products WHERE name = 'Wireless Mouse';
  INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
  VALUES (order_id, product_id, 1, 29.99, order_date);
  
  SELECT id INTO product_id FROM products WHERE name = 'Backpack';
  INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
  VALUES (order_id, product_id, 1, 59.99, order_date);
END $$;

-- Create a default user for testing
INSERT INTO users (id, email, password, name)
VALUES (uuid_generate_v4(), 'admin@example.com', 'password123', 'Admin User');

-- Create a profile for the default user
INSERT INTO profiles (id, name, avatar_url)
SELECT id, name, 'https://example.com/avatar.jpg' FROM users WHERE email = 'admin@example.com';
