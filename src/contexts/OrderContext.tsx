import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { createOrder } from '@/api/orderApi';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  items?: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
  payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'partially_refunded';
  payment_method_id?: string;
}

interface OrderContextType {
  currentOrder: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearOrder: () => void;
  itemCount: number;
  subtotal: number;
  completeOrder: (paymentMethod: string) => Promise<string>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  const addItem = useCallback((item: OrderItem) => {
    setCurrentOrder((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        toast.success(`Updated ${item.name} quantity`);
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      toast.success(`Added ${item.name} to order`);
      return [...prevItems, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCurrentOrder((prevItems) => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.name} from order`);
      }
      return prevItems.filter((item) => item.id !== id);
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setCurrentOrder((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [removeItem]);

  const clearOrder = useCallback(() => {
    setCurrentOrder([]);
    toast.info("Order cleared");
  }, []);

  // Memoize expensive calculations to prevent unnecessary recalculations
  const itemCount = useMemo(() =>
    currentOrder.reduce((total, item) => total + item.quantity, 0),
    [currentOrder]
  );

  const subtotal = useMemo(() =>
    currentOrder.reduce((total, item) => total + item.price * item.quantity, 0),
    [currentOrder]
  );

  const completeOrder = useCallback(async (paymentMethod: string): Promise<string> => {
    try {
      if (currentOrder.length === 0) {
        throw new Error("Cannot complete an empty order");
      }

      // Generate a more meaningful order ID with date prefix
      const date = new Date();
      const datePrefix = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderId = `ORD-${datePrefix}-${randomSuffix}`;

      // We would prepare order items here if the API required them
      // For now, we're just sending the order information

      // Create the order using the API
      await createOrder({
        id: orderId,
        total: subtotal,
        status: 'completed',
        payment_method_id: paymentMethod,
        payment_status: 'paid',
        // We're not passing items directly because the API expects a different format
        // The backend will handle creating the order items based on the order ID
      });

      // Clear the current order after successful creation
      clearOrder();

      toast.success("Order completed successfully!");
      return orderId;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete order");
      throw error;
    }
  }, [currentOrder, subtotal, clearOrder]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentOrder,
    addItem,
    removeItem,
    updateQuantity,
    clearOrder,
    itemCount,
    subtotal,
    completeOrder,
  }), [
    currentOrder,
    addItem,
    removeItem,
    updateQuantity,
    clearOrder,
    itemCount,
    subtotal,
    completeOrder
  ]);

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};
