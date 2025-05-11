# React Query Hooks

This directory contains React Query hooks for data fetching and mutations. These hooks provide a clean and consistent way to interact with the API.

## Usage

### Basic Query Hook Usage

```tsx
import { useProducts } from '@/queries/useProducts';

const ProductsList = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {products?.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
};
```

### Query with Filters

```tsx
import { useProducts } from '@/queries/useProducts';

const ProductsList = () => {
  const { data: products, isLoading, error } = useProducts({ 
    category_id: 'some-category-id',
    in_stock: true
  });

  // ...
};
```

### Query by ID

```tsx
import { useProduct } from '@/queries/useProducts';

const ProductDetail = ({ productId }) => {
  const { data: product, isLoading, error } = useProduct(productId);

  // ...
};
```

### Mutation Hook Usage

```tsx
import { useCreateProduct } from '@/queries/useProducts';

const CreateProductForm = () => {
  const createProductMutation = useCreateProduct();

  const handleSubmit = async (formData) => {
    try {
      await createProductMutation.mutateAsync(formData);
      // Success is handled by the mutation hook
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createProductMutation.isPending}
      >
        {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
};
```

### Update Mutation

```tsx
import { useUpdateProduct } from '@/queries/useProducts';

const EditProductForm = ({ productId, initialData }) => {
  const updateProductMutation = useUpdateProduct();

  const handleSubmit = async (formData) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: formData
      });
      // Success is handled by the mutation hook
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // ...
};
```

### Delete Mutation

```tsx
import { useDeleteProduct } from '@/queries/useProducts';

const DeleteProductButton = ({ productId }) => {
  const deleteProductMutation = useDeleteProduct();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation.mutateAsync(productId);
        // Success is handled by the mutation hook
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={deleteProductMutation.isPending}
    >
      {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
    </button>
  );
};
```

## Available Hooks

### Product Hooks

- `useProducts(filters?)` - Fetch all products with optional filters
- `useProduct(id)` - Fetch a single product by ID
- `useProductByBarcode(barcode)` - Fetch a product by barcode
- `useProductsByCategory(categoryId)` - Fetch products by category
- `useSearchProducts(query)` - Search products
- `useCreateProduct()` - Create a new product
- `useUpdateProduct()` - Update an existing product
- `useDeleteProduct()` - Delete a product

### Customer Hooks

- `useCustomers(filters?)` - Fetch all customers with optional filters
- `useCustomer(id)` - Fetch a single customer by ID
- `useCustomerOrders(customerId)` - Fetch orders for a customer
- `useSearchCustomers(query)` - Search customers
- `useCreateCustomer()` - Create a new customer
- `useUpdateCustomer()` - Update an existing customer
- `useDeleteCustomer()` - Delete a customer

### Order Hooks

- `useOrders(filters?)` - Fetch all orders with optional filters
- `useOrder(id)` - Fetch a single order by ID
- `useOrderItems(orderId)` - Fetch items for an order
- `useCreateOrder()` - Create a new order
- `useUpdateOrder()` - Update an existing order
- `useUpdateOrderStatus()` - Update order status
- `useDeleteOrder()` - Delete an order
- `useAddOrderItem()` - Add an item to an order
- `useRemoveOrderItem()` - Remove an item from an order

### Analytics Hooks

- `useSalesData(options?)` - Fetch sales data
- `useRevenueData(options?)` - Fetch revenue data
- `useProductPerformance(options?)` - Fetch product performance data
- `useCustomerInsights(options?)` - Fetch customer insights data
- `useDashboardSummary()` - Fetch dashboard summary data

### Auth Hooks

- `useCurrentUser()` - Fetch the current user
- `useLogin()` - Login a user
- `useRegister()` - Register a new user
- `useLogout()` - Logout a user
- `useUpdateProfile()` - Update user profile
- `useChangePassword()` - Change user password

## Best Practices

1. **Always handle loading and error states**
2. **Use the mutation hooks for data mutations**
3. **Don't make direct API calls in components**
4. **Use the query hooks for data fetching**
5. **Pass filters to query hooks when needed**
6. **Use the mutation hooks' isPending state to disable buttons during mutations**
7. **Let the mutation hooks handle success and error toasts**
