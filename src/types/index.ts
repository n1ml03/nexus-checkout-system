/**
 * User related types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  role?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

/**
 * Product related types
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  barcode: string;
  stock: number;
  sku: string;
  category: string;
  category_id?: string;
  supplier_id?: string;
  low_stock_threshold?: number;
  is_digital?: boolean;
  is_featured?: boolean;
  brand?: string;
  weight?: number;
  dimensions?: string;
  has_variants?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  category?: string;
  category_id?: string;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
}

/**
 * Supplier related types
 */
export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Product batch related types
 */
export interface ProductBatch {
  id: string;
  product_id: string;
  supplier_id?: string;
  batch_number?: string;
  quantity: number;
  cost_price?: number;
  manufacturing_date?: string;
  expiry_date?: string;
  received_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  supplier_name?: string;
  product_name?: string;
}

/**
 * Inventory adjustment related types
 */
export interface InventoryAdjustment {
  id: string;
  product_id: string;
  batch_id?: string;
  adjustment_type: 'count' | 'receive' | 'return' | 'damage' | 'loss' | 'transfer' | 'other';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  performed_by?: string;
  reference_number?: string;
  created_at: string;
  product_name?: string;
  batch_number?: string;
  performed_by_name?: string;
}

/**
 * Inventory count related types
 */
export interface InventoryCount {
  id: string;
  count_date: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_by?: string;
  completed_by?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  completed_by_name?: string;
  item_count?: number;
  counted_items?: number;
}

export interface InventoryCountItem {
  id: string;
  count_id: string;
  product_id: string;
  batch_id?: string;
  expected_quantity: number;
  counted_quantity?: number;
  discrepancy?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  product_name?: string;
  barcode?: string;
  sku?: string;
  batch_number?: string;
}

/**
 * Order related types
 */
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface DatabaseOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  created_at: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  items?: DatabaseOrderItem[];
  payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'partially_refunded';
  amount_paid?: number;
  payment_method_id?: string;
  payment_reference?: string;
  customer_id?: string;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Payment related types
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'qr' | 'bank_transfer' | 'credit' | 'other';
  is_active: boolean;
  requires_confirmation: boolean;
  confirmation_message?: string;
  icon?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  provider_type: 'stripe' | 'paypal' | 'momo' | 'zalopay' | 'vnpay' | 'other';
  is_active: boolean;
  api_key?: string;
  api_secret?: string;
  sandbox_mode: boolean;
  webhook_url?: string;
  config?: any;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  payment_method_id: string;
  payment_provider_id?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
  reference_id?: string;
  provider_reference?: string;
  transaction_date: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  payment_method?: string;
  payment_type?: string;
}

export interface Refund {
  id: string;
  payment_transaction_id: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'completed' | 'failed';
  refund_date: string;
  processed_by?: string;
  reference_id?: string;
  provider_reference?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  processed_by_name?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * Customer related types
 */
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  notes?: string;
  birthday?: string;
  gender?: string;
  preferences?: any;
  tags?: string[];
  last_activity_date?: string;
  marketing_consent?: boolean;
  email_consent?: boolean;
  sms_consent?: boolean;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  country?: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_by?: string;
  created_at: string;
  created_by_name?: string;
}



/**
 * Analytics related types
 */
export interface SalesDataPoint {
  month: string;
  sales: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
}

export interface RevenueDataPoint {
  name: string;
  [year: string]: string | number;
}

export interface ProductSalesDataPoint {
  id: string;
  name: string;
  sales: number;
  quantity: number;
}

export interface AnalyticsData {
  totalSales: number;
  salesGrowth: number;
  activeCustomers: number;
  customerGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  avgOrderValue: number;
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
  revenueData: RevenueDataPoint[];
  topProducts: ProductSalesDataPoint[];
}

export interface AnalyticsOptions {
  period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date?: string;
  end_date?: string;
  category?: string;
  limit?: number;
}

/**
 * Notification related types
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory =
  | 'order'       // Order-related notifications
  | 'product'     // Product-related notifications
  | 'system'      // System notifications
  | 'promotion'   // Promotional notifications
  | 'payment'     // Payment-related notifications
  | 'account'     // Account-related notifications
  | 'general';    // General notifications

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  timestamp: Date;
  link?: string;
  icon?: string;
  image?: string;
  actions?: NotificationAction[];
  autoDelete?: boolean;
  expiresAt?: Date;
  groupId?: string;
}

export interface NotificationAction {
  label: string;
  action: 'link' | 'function' | 'dismiss';
  url?: string;
  functionName?: string;
}
