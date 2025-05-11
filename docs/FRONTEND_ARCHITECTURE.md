# Frontend Architecture

This document outlines the architecture, patterns, and best practices for the frontend of the Nexus Checkout System.

## Overview

The frontend is built with React, TypeScript, and follows a modern architecture with a clear separation of concerns:

1. **API Layer**: Direct HTTP requests to the backend
2. **Data Fetching Layer**: React Query hooks for data fetching, caching, and mutations
3. **UI Layer**: React components that consume the data fetching layer

This architecture provides several benefits:
- Clear separation of concerns
- Efficient data fetching and caching
- Consistent error handling
- Optimistic updates
- Automatic refetching and invalidation

## Directory Structure

```
src/
├── api/               # API client functions
├── components/        # React components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── i18n/              # Internationalization
├── lib/               # Utility libraries
├── mocks/             # Mock data for development
├── pages/             # Page components
├── queries/           # React Query hooks
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## API Layer (`src/api/`)

The API layer contains functions that make direct HTTP requests to the backend. Each file is organized by domain (e.g., `productApi.ts`, `customerApi.ts`).

### Best Practices:

1. **Direct HTTP Requests**: API functions should make direct HTTP requests to the backend.
2. **Return Promises**: API functions should return Promises with typed data.
3. **Error Handling**: API functions should handle HTTP errors and throw meaningful error objects.
4. **Domain Organization**: API functions should be organized by domain.

### Example:

```typescript
// src/api/productApi.ts
import { Product, ProductFilters } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
    throw new Error(errorData.error?.message || 'Failed to fetch products');
  }
  
  const result = await response.json();
  return result.data;
};
```

## Data Fetching Layer (`src/queries/`)

The data fetching layer contains React Query hooks that use the API client functions. Each file is organized by domain (e.g., `useProducts.ts`, `useCustomers.ts`).

### Best Practices:

1. **Use React Query**: All data fetching should use React Query hooks.
2. **Query Keys**: Use consistent patterns for query keys.
3. **Caching**: Configure appropriate stale times and cache times.
4. **Error Handling**: Handle errors consistently, typically with toast notifications.
5. **Optimistic Updates**: Use optimistic updates for mutations when appropriate.
6. **Invalidation**: Invalidate related queries after mutations.

### Example:

```typescript
// src/queries/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productApi from '@/api/productApi';
import { Product, ProductFilters } from '@/types';
import { toast } from 'sonner';

export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
};

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery<Product[], Error>({
    queryKey: productQueryKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, Partial<Product>>({
    mutationFn: productApi.createProduct,
    onSuccess: (newProduct) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Product "${newProduct.name}" created successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
};
```

## UI Layer (Components)

Components should use the React Query hooks for data fetching and mutations. They should not make direct API calls.

### Best Practices:

1. **Use React Query Hooks**: Components should use React Query hooks for data fetching and mutations.
2. **Handle Loading States**: Components should handle loading states from React Query.
3. **Handle Error States**: Components should handle error states from React Query.
4. **Optimistic UI**: Components should use optimistic UI updates when appropriate.

### Example:

```tsx
// src/pages/ProductsPage.tsx
import React from 'react';
import { useProducts, useCreateProduct } from '@/queries/useProducts';

const ProductsPage: React.FC = () => {
  const { data: products, isLoading, error } = useProducts();
  const createProductMutation = useCreateProduct();

  const handleCreateProduct = async (productData) => {
    try {
      await createProductMutation.mutateAsync(productData);
      // Success is handled by the mutation hook
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products?.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <button onClick={() => handleCreateProduct({ name: 'New Product' })}>
        Create Product
      </button>
    </div>
  );
};
```

## Common Patterns

### 1. Query Keys

Query keys should follow a consistent pattern:

```typescript
const entityQueryKeys = {
  all: ['entity'] as const,
  lists: () => [...entityQueryKeys.all, 'list'] as const,
  list: (filters) => [...entityQueryKeys.lists(), filters] as const,
  details: () => [...entityQueryKeys.all, 'detail'] as const,
  detail: (id) => [...entityQueryKeys.details(), id] as const,
};
```

### 2. Error Handling

Error handling should be consistent:

```typescript
const useMutation = () => {
  return useMutation({
    mutationFn: api.mutateEntity,
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: entityQueryKeys.lists() });
      
      // Show success toast
      toast.success('Entity created successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to create entity: ${error.message}`);
    },
  });
};
```

### 3. Loading States

Loading states should be handled consistently:

```tsx
const Component = () => {
  const { data, isLoading, error } = useQuery();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <DataDisplay data={data} />;
};
```

## Conclusion

This architecture provides a clean separation of concerns and efficient data management. By following these patterns and best practices, we can maintain a consistent and maintainable codebase.
