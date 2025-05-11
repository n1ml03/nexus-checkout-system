/**
 * Customer Query Hooks
 * 
 * This file provides React Query hooks for customer-related operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as customerApi from '@/api/customerApi';
import { Customer, CustomerFilters } from '@/types';
import { toast } from 'sonner';

/**
 * Query keys for customers
 */
export const customerQueryKeys = {
  all: ['customers'] as const,
  lists: () => [...customerQueryKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerQueryKeys.lists(), filters] as const,
  details: () => [...customerQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerQueryKeys.details(), id] as const,
  orders: (id: string) => [...customerQueryKeys.detail(id), 'orders'] as const,
  search: (query: string) => [...customerQueryKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all customers
 * @param {CustomerFilters} filters - Optional filters
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useCustomers = (filters: CustomerFilters = {}, options = {}) => {
  return useQuery<Customer[], Error>({
    queryKey: customerQueryKeys.list(filters),
    queryFn: () => customerApi.getCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single customer by ID
 * @param {string} id - Customer ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useCustomer = (id: string, options = {}) => {
  return useQuery<Customer, Error>({
    queryKey: customerQueryKeys.detail(id),
    queryFn: () => customerApi.getCustomerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch customer orders
 * @param {string} customerId - Customer ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useCustomerOrders = (customerId: string, options = {}) => {
  return useQuery<any[], Error>({
    queryKey: customerQueryKeys.orders(customerId),
    queryFn: () => customerApi.getCustomerOrders(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to search customers
 * @param {string} query - Search query
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useSearchCustomers = (query: string, options = {}) => {
  return useQuery<Customer[], Error>({
    queryKey: customerQueryKeys.search(query),
    queryFn: () => customerApi.searchCustomers(query),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create a customer
 * @returns {Object} React Query mutation result
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, Partial<Customer>>({
    mutationFn: customerApi.createCustomer,
    onSuccess: (newCustomer) => {
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Customer "${newCustomer.name}" created successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });
};

/**
 * Hook to update a customer
 * @returns {Object} React Query mutation result
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, { id: string; data: Partial<Customer> }>({
    mutationFn: ({ id, data }) => customerApi.updateCustomer(id, data),
    onSuccess: (updatedCustomer) => {
      // Invalidate customers list and the specific customer
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.detail(updatedCustomer.id) });
      
      // Show success toast
      toast.success(`Customer "${updatedCustomer.name}" updated successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a customer
 * @returns {Object} React Query mutation result
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, string>({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: (deletedCustomer) => {
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Customer "${deletedCustomer.name}" deleted successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });
};
