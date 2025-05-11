# Database Schema

This document describes the database schema for the Nexus Checkout System.

## Tables

### products

Stores information about products.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| price | NUMERIC(10, 2) | Product price |
| description | TEXT | Product description |
| image_url | TEXT | URL to product image |
| barcode | TEXT | Product barcode |
| stock | INTEGER | Current stock level |
| sku | TEXT | Stock keeping unit |
| category | TEXT | Product category |
| tags | TEXT[] | Array of product tags |
| brand | TEXT | Product brand |
| weight | NUMERIC(10, 2) | Product weight |
| dimensions | TEXT | Product dimensions |
| expiry_date | DATE | Product expiry date |
| cost_price | NUMERIC(10, 2) | Product cost price |
| tax_rate | NUMERIC(5, 2) | Product tax rate |
| min_stock_level | INTEGER | Minimum stock level |
| supplier | TEXT | Product supplier |
| location | TEXT | Product storage location |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

### customers

Stores information about customers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | TEXT | Customer first name |
| last_name | TEXT | Customer last name |
| email | TEXT | Customer email (unique) |
| phone | TEXT | Customer phone number |
| address | TEXT | Customer address |
| city | TEXT | Customer city |
| postal_code | TEXT | Customer postal code |
| country | TEXT | Customer country |
| notes | TEXT | Customer notes |
| loyalty_points | INTEGER | Customer loyalty points |
| membership_level | TEXT | Customer membership level |
| birthday | DATE | Customer birthday |
| preferred_payment_method | TEXT | Preferred payment method |
| marketing_consent | BOOLEAN | Marketing consent flag |
| referral_code | TEXT | Customer referral code |
| referred_by | UUID | Reference to referring customer |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

### orders

Stores information about orders.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (order ID) |
| customer_id | UUID | Reference to customer |
| customer_email | TEXT | Customer email |
| customer_name | TEXT | Customer name |
| total | NUMERIC(10, 2) | Order total |
| status | TEXT | Order status (pending, completed, cancelled) |
| payment_method | TEXT | Payment method used |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

### order_items

Stores information about items in orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | TEXT | Reference to order |
| product_id | UUID | Reference to product |
| quantity | INTEGER | Item quantity |
| price | NUMERIC(10, 2) | Item price |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |

### users

Stores user authentication information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User email (unique) |
| password | TEXT | User password |
| name | TEXT | User name |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |

### profiles

Stores additional user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references users.id) |
| name | TEXT | Profile name |
| avatar_url | TEXT | Profile avatar URL |
| phone | TEXT | Profile phone number |
| address | TEXT | Profile address |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

## Views

### order_details

Combines order items with product information.

```sql
CREATE OR REPLACE VIEW order_details AS
SELECT
  oi.id,
  oi.order_id,
  oi.product_id,
  oi.quantity,
  oi.price,
  p.name AS product_name,
  p.image_url AS product_image,
  p.category AS product_category,
  (oi.price * oi.quantity) AS item_total
FROM
  order_items oi
JOIN
  products p ON oi.product_id = p.id;
```

### customer_statistics

Aggregates customer statistics.

```sql
CREATE OR REPLACE VIEW customer_statistics AS
SELECT
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.total), 0) AS total_spent,
  MAX(o.created_at) AS last_order_date
FROM
  customers c
LEFT JOIN
  orders o ON c.id = o.customer_id
GROUP BY
  c.id, c.email, c.first_name, c.last_name;
```

## Functions

### update_updated_at_column

Trigger function to update the `updated_at` column.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### get_server_time

Function to get the current server time.

```sql
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
AS $$
  SELECT NOW();
$$;
```

### get_top_products

Function to get top-selling products.

```sql
CREATE OR REPLACE FUNCTION get_top_products(
  status_filter TEXT DEFAULT 'completed',
  limit_count INTEGER DEFAULT 5,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  category TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  total_sales NUMERIC,
  total_quantity BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    SUM(oi.price * oi.quantity) AS total_sales,
    SUM(oi.quantity) AS total_quantity
  FROM
    products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
  WHERE
    (status_filter IS NULL OR o.status = status_filter)
    AND (start_date IS NULL OR o.created_at >= start_date)
    AND (end_date IS NULL OR o.created_at <= end_date)
    AND (category IS NULL OR p.category = category)
  GROUP BY
    p.id, p.name
  ORDER BY
    total_sales DESC
  LIMIT
    limit_count;
END;
$$;
```
