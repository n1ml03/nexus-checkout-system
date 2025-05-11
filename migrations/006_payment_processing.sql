-- Payment Processing for Nexus Checkout System

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'card', 'qr', 'bank_transfer', 'credit', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  confirmation_message TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on payment method type
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON payment_methods(is_active);

-- Create payment_providers table for external payment gateways
CREATE TABLE IF NOT EXISTS payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('stripe', 'paypal', 'momo', 'zalopay', 'vnpay', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  api_key TEXT,
  api_secret TEXT,
  sandbox_mode BOOLEAN DEFAULT TRUE,
  webhook_url TEXT,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on payment provider type
CREATE INDEX IF NOT EXISTS idx_payment_providers_type ON payment_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_payment_providers_is_active ON payment_providers(is_active);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_provider_id UUID REFERENCES payment_providers(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  reference_id TEXT,
  provider_reference TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method_id ON payment_transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_provider_id ON payment_transactions(payment_provider_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_date ON payment_transactions(transaction_date);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  refund_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reference_id TEXT,
  provider_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for refunds
CREATE INDEX IF NOT EXISTS idx_refunds_payment_transaction_id ON refunds(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_refund_date ON refunds(refund_date);

-- Add trigger to update updated_at column
CREATE OR REPLACE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_payment_providers_updated_at
BEFORE UPDATE ON payment_providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_refunds_updated_at
BEFORE UPDATE ON refunds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment methods
INSERT INTO payment_methods (name, type, is_active, requires_confirmation, icon, sort_order)
VALUES 
  ('Cash', 'cash', TRUE, FALSE, 'cash', 1),
  ('Credit Card', 'card', TRUE, FALSE, 'credit-card', 2),
  ('QR Code', 'qr', TRUE, TRUE, 'qr-code', 3),
  ('Bank Transfer', 'bank_transfer', TRUE, TRUE, 'bank', 4)
ON CONFLICT DO NOTHING;

-- Modify orders table to support split payments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded', 'partially_refunded')) DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Create function to get payment transactions by order
CREATE OR REPLACE FUNCTION get_order_payments(order_id_param UUID)
RETURNS TABLE (
  id UUID,
  payment_method TEXT,
  payment_type TEXT,
  amount NUMERIC,
  status TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  reference_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pm.name as payment_method,
    pm.type as payment_type,
    pt.amount,
    pt.status,
    pt.transaction_date,
    pt.reference_id
  FROM 
    payment_transactions pt
  JOIN
    payment_methods pm ON pt.payment_method_id = pm.id
  WHERE 
    pt.order_id = order_id_param
  ORDER BY 
    pt.transaction_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get refunds by payment transaction
CREATE OR REPLACE FUNCTION get_transaction_refunds(transaction_id_param UUID)
RETURNS TABLE (
  id UUID,
  amount NUMERIC,
  reason TEXT,
  status TEXT,
  refund_date TIMESTAMP WITH TIME ZONE,
  processed_by_name TEXT,
  reference_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.amount,
    r.reason,
    r.status,
    r.refund_date,
    u.name as processed_by_name,
    r.reference_id
  FROM 
    refunds r
  LEFT JOIN
    users u ON r.processed_by = u.id
  WHERE 
    r.payment_transaction_id = transaction_id_param
  ORDER BY 
    r.refund_date DESC;
END;
$$ LANGUAGE plpgsql;
