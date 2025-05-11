// Payment method types and utilities

export type PaymentMethod =
  | 'card'
  | 'qr-code'
  | 'momo'
  | 'zalopay'
  | 'vnpay';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Payment method information
export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodInfo> = {
  'card': {
    id: 'card',
    name: 'Credit Card',
    description: 'Pay with credit or debit card',
    icon: 'credit-card',
    color: '#0f172a'
  },
  'qr-code': {
    id: 'qr-code',
    name: 'QR Code',
    description: 'Scan QR code to pay',
    icon: 'qr-code',
    color: '#0f172a'
  },
  'momo': {
    id: 'momo',
    name: 'Momo',
    description: 'Pay with Momo e-wallet',
    icon: 'wallet',
    color: '#ae2070'
  },
  'zalopay': {
    id: 'zalopay',
    name: 'ZaloPay',
    description: 'Pay with ZaloPay e-wallet',
    icon: 'wallet',
    color: '#0068ff'
  },
  'vnpay': {
    id: 'vnpay',
    name: 'VNPAY',
    description: 'Pay with VNPAY',
    icon: 'credit-card',
    color: '#0068ff'
  }
};

// Generate a mock payment link for QR code
export const generatePaymentLink = (orderId: string, amount: number): string => {
  // In a real implementation, this would generate a proper payment link
  // For this demo, we'll create a mock link with the order details
  return `https://payment.example.com/pay?order=${orderId}&amount=${amount.toFixed(2)}`;
};

// Generate a mock transaction ID
export const generateTransactionId = (): string => {
  return `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// Mock function to simulate payment processing
// This function is only called when the user manually verifies payment
// No automatic payment processing is performed
export const processPayment = async (
  method: PaymentMethod,
  amount: number
): Promise<{ success: boolean; transactionId: string }> => {
  // In a real implementation, this would call a payment gateway API to verify the payment
  // using the method and amount parameters
  console.log(`Manual payment verification requested for ${method} payment of $${amount.toFixed(2)}`);

  // For this demo, we'll simulate a successful payment after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: generateTransactionId()
      });
    }, 1500);
  });
};
