/**
 * Order Query Hooks
 * 
 * This file provides React Query hooks for order-related operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderApi from '@/api/orderApi';
import { Order, OrderFilters, OrderItem } from '@/types';
import { toast } from 'sonner';

/**
 * Query keys for orders
 */
export const orderQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...orderQueryKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderQueryKeys.lists(), filters] as const,
  details: () => [...orderQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderQueryKeys.details(), id] as const,
  items: (id: string) => [...orderQueryKeys.detail(id), 'items'] as const,
};

/**
 * Hook to fetch all orders
 * @param {OrderFilters} filters - Optional filters
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useOrders = (filters: OrderFilters = {}, options = {}) => {
  return useQuery<Order[], Error>({
    queryKey: orderQueryKeys.list(filters),
    queryFn: () => orderApi.getOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single order by ID
 * @param {string} id - Order ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useOrder = (id: string, options = {}) => {
  return useQuery<Order, Error>({
    queryKey: orderQueryKeys.detail(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch order items
 * @param {string} orderId - Order ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useOrderItems = (orderId: string, options = {}) => {
  return useQuery<OrderItem[], Error>({
    queryKey: orderQueryKeys.items(orderId),
    queryFn: () => orderApi.getOrderItems(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create an order
 * @returns {Object} React Query mutation result
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Order, Error, Partial<Order>>({
    mutationFn: orderApi.createOrder,
    onSuccess: (newOrder) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Order #${newOrder.id.slice(0, 8)} created successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
};

/**
 * Hook to update an order
 * @returns {Object} React Query mutation result
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Order, Error, { id: string; data: Partial<Order> }>({
    mutationFn: ({ id, data }) => orderApi.updateOrder(id, data),
    onSuccess: (updatedOrder) => {
      // Invalidate orders list and the specific order
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(updatedOrder.id) });
      
      // Show success toast
      toast.success(`Order #${updatedOrder.id.slice(0, 8)} updated successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to update order: ${error.message}`);
    },
  });
};

/**
 * Hook to update order status
 * @returns {Object} React Query mutation result
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Order, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => orderApi.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      // Invalidate orders list and the specific order
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(updatedOrder.id) });
      
      // Show success toast
      toast.success(`Order #${updatedOrder.id.slice(0, 8)} status updated to ${updatedOrder.status}`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
};

/**
 * Hook to delete an order
 * @returns {Object} React Query mutation result
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Order, Error, string>({
    mutationFn: orderApi.deleteOrder,
    onSuccess: (deletedOrder) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Order #${deletedOrder.id.slice(0, 8)} deleted successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to delete order: ${error.message}`);
    },
  });
};

/**
 * Hook to add an item to an order
 * @returns {Object} React Query mutation result
 */
export const useAddOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation<OrderItem, Error, { orderId: string; itemData: Partial<OrderItem> }>({
    mutationFn: ({ orderId, itemData }) => orderApi.addOrderItem(orderId, itemData),
    onSuccess: (newItem, { orderId }) => {
      // Invalidate order and order items
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.items(orderId) });
      
      // Show success toast
      toast.success('Item added to order successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to add item to order: ${error.message}`);
    },
  });
};

/**
 * Hook to remove an item from an order
 * @returns {Object} React Query mutation result
 */
export const useRemoveOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation<OrderItem, Error, { orderId: string; itemId: string }>({
    mutationFn: ({ orderId, itemId }) => orderApi.removeOrderItem(orderId, itemId),
    onSuccess: (removedItem, { orderId }) => {
      // Invalidate order and order items
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.items(orderId) });
      
      // Show success toast
      toast.success('Item removed from order successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to remove item from order: ${error.message}`);
    },
  });
};
