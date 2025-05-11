-- Analytics optimization for Nexus Checkout System

-- Add composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_status_customer_id ON orders(status, customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at_total ON orders(status, created_at, total);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id_price_quantity ON order_items(product_id, price, quantity);

-- Create immutable functions for date calculations
CREATE OR REPLACE FUNCTION immutable_date_trunc(text, timestamp with time zone)
RETURNS timestamp with time zone AS $$
BEGIN
    RETURN date_trunc($1, $2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION immutable_now()
RETURNS timestamp with time zone AS $$
BEGIN
    RETURN NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add partial indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_recent_completed ON orders(created_at, total)
WHERE status = 'completed';

-- Create regular indexes instead of partial indexes with date functions
CREATE INDEX IF NOT EXISTS idx_orders_created_at_total ON orders(created_at, total);

-- Create a function to get monthly sales data
CREATE OR REPLACE FUNCTION get_monthly_sales(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  month INTEGER,
  sales NUMERIC
) AS $$
BEGIN
  IF category_filter IS NULL OR category_filter = 'all' THEN
    RETURN QUERY
    SELECT
      EXTRACT(MONTH FROM o.created_at)::INTEGER as month,
      SUM(o.total) as sales
    FROM orders o
    WHERE o.status = 'completed'
      AND o.created_at >= start_date
      AND o.created_at <= end_date
    GROUP BY month
    ORDER BY month;
  ELSE
    RETURN QUERY
    SELECT
      EXTRACT(MONTH FROM o.created_at)::INTEGER as month,
      SUM(o.total) as sales
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status = 'completed'
      AND o.created_at >= start_date
      AND o.created_at <= end_date
      AND p.category = category_filter
    GROUP BY month
    ORDER BY month;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get category sales data
CREATE OR REPLACE FUNCTION get_category_sales(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  name TEXT,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.category as name,
    SUM(oi.price * oi.quantity) as value
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status = 'completed'
    AND o.created_at >= start_date
    AND o.created_at <= end_date
  GROUP BY p.category
  ORDER BY value DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get top products
CREATE OR REPLACE FUNCTION get_top_products(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sales NUMERIC,
  quantity BIGINT
) AS $$
BEGIN
  IF category_filter IS NULL OR category_filter = 'all' THEN
    RETURN QUERY
    SELECT
      p.id,
      p.name,
      SUM(oi.price * oi.quantity) as sales,
      SUM(oi.quantity) as quantity
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
      AND o.created_at >= start_date
      AND o.created_at <= end_date
    GROUP BY p.id, p.name
    ORDER BY sales DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT
      p.id,
      p.name,
      SUM(oi.price * oi.quantity) as sales,
      SUM(oi.quantity) as quantity
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
      AND o.created_at >= start_date
      AND o.created_at <= end_date
      AND p.category = category_filter
    GROUP BY p.id, p.name
    ORDER BY sales DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get customer statistics
CREATE OR REPLACE FUNCTION get_customer_statistics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  active_customers BIGINT,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT customer_id) as active_customers,
    AVG(total) as avg_order_value
  FROM orders
  WHERE status = 'completed'
    AND created_at >= start_date
    AND created_at <= end_date
    AND customer_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
