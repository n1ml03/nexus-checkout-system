## Instruction File 1: Backend Service Layer Implementation

**Objective:** Refactor the backend API routes to introduce a dedicated service layer for business logic, improving separation of concerns and making route handlers thinner.

**Context:**
*   Refer to `BACKEND_API.md` for existing routes and structure.
*   Currently, route handlers in `server/routes/*.js` likely contain business logic and direct database interactions.

**Steps:**

1.  **Create Service Directory:**
    *   Create a new directory: `server/services/`.

2.  **Create Service Files:**
    *   For each existing route file in `server/routes/` (e.g., `products.js`, `customers.js`, `orders.js`), create a corresponding service file in `server/services/`.
        *   Example: `server/routes/products.js` -> `server/services/productService.js`
        *   Example: `server/routes/orders.js` -> `server/services/orderService.js`

3.  **Refactor Product Routes (`server/routes/products.js`) and `productService.js`:**

    *   **`productService.js`:**
        *   Import the database client (`db`) from your existing setup.
        *   Create functions for each product-related operation. These functions will contain the business logic and database queries previously in the route handlers.
        *   **Example `getAllProducts`:**
            ```javascript
            // server/services/productService.js
            const db = require('../path/to/your/db/client'); // Adjust path

            const getAllProducts = async () => {
              try {
                const result = await db.query('SELECT * FROM products ORDER BY name');
                return result.rows;
              } catch (error) {
                // Log error or handle specific DB errors if needed
                throw error; // Re-throw for the route handler to catch
              }
            };

            const getProductById = async (productId) => {
              // ... logic to fetch product by ID ...
            };

            const createProduct = async (productData) => {
              // ... logic to insert a new product, using productData ...
              // Remember to use parameterized queries
            };

            // ... other service methods for update, delete, getByBarcode, etc.

            module.exports = {
              getAllProducts,
              getProductById,
              createProduct,
              // ... export other methods
            };
            ```

    *   **`server/routes/products.js`:**
        *   Import the corresponding service (e.g., `productService`).
        *   Modify route handlers to call service methods.
        *   Route handlers should now primarily be responsible for:
            *   Extracting data from `req` (params, body, query).
            *   Calling the appropriate service method.
            *   Sending the response (`res.json()`, `res.status().json()`).
            *   Passing errors to the error handling middleware (`next(error)`).
        *   The Zod validation middleware (if used per route) should remain in the route file or be called before the service.
        *   **Example `GET /api/products`:**
            ```javascript
            // server/routes/products.js
            const express = require('express');
            const router = express.Router();
            const productService = require('../services/productService');
            // const { validateRequest, createProductSchema } = require('../middleware/validation'); // If you have it

            router.get('/', async (req, res, next) => {
              try {
                const products = await productService.getAllProducts();
                res.json(products);
              } catch (error) {
                next(error); // Pass to centralized error handler
              }
            });

            router.post('/', /* validateRequest(createProductSchema), */ async (req, res, next) => {
              try {
                const newProduct = await productService.createProduct(req.body);
                res.status(201).json(newProduct);
              } catch (error) {
                next(error);
              }
            });

            // ... refactor other product routes similarly ...

            module.exports = router;
            ```

4.  **Repeat for Other Entities:**
    *   Apply the same refactoring pattern to `customers.js`, `orders.js`, and `auth.js` (and their corresponding service files).
    *   For `server/routes/auth.js`, create `server/services/authService.js`. Logic for user registration, password hashing, JWT generation, etc., will go into `authService.js`.

5.  **Transaction Handling in Services:**
    *   If an operation requires a database transaction (like creating an order with items), the transaction logic (`db.transaction(async (client) => { ... })`) should reside within the service method (e.g., in `orderService.js`).

**Verification:**
*   All API endpoints should function as before.
*   Route handlers in `server/routes/*.js` should be significantly leaner.
*   Business logic and database interactions should be encapsulated within `server/services/*.js` files.
*   The centralized error handler (`server/middleware/error-handler.js`) should still catch and process errors.

---

## Instruction File 2: Database Schema and API Enhancements

**Objective:** Improve database integrity and API consistency by normalizing the product categories and implementing ENUM types for status fields.

**Context:**
*   Refer to `DATABASE_SCHEMA.md` for the current schema.
*   The `products` table uses `category VARCHAR(100)`.
*   Status fields (e.g., `orders.status`) use `VARCHAR`.

**Part 1: Normalize Product Categories**

1.  **Modify `categories` Table (if necessary):**
    *   Ensure the `categories` table has a `name VARCHAR(100) NOT NULL UNIQUE` column. The existing schema seems correct.

2.  **Modify `products` Table Schema:**
    *   Change the `category` column in `products` to `category_id`.
    *   **SQL Change:**
        ```sql
        -- First, add the new column (allow NULL initially for existing data)
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

        -- You would then need a migration script to populate category_id based on existing category strings
        -- For new code generation, assume we are designing from scratch or migration is handled:
        -- The final products table definition should look like:
        -- CREATE TABLE products (
        --   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        --   name VARCHAR(255) NOT NULL,
        --   description TEXT,
        --   price DECIMAL(10, 2) NOT NULL,
        --   cost_price DECIMAL(10, 2),
        --   barcode VARCHAR(100) UNIQUE,
        --   sku VARCHAR(100) UNIQUE,
        --   category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Changed line
        --   image_url TEXT,
        --   in_stock BOOLEAN DEFAULT TRUE,
        --   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        --   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        -- );
        ```
    *   **Note:** In a live system, you'd populate `category_id` for existing rows, then drop the old `category` column. For generation, focus on the target schema.

3.  **Update Backend API (`productService.js` and `server/routes/products.js`):**
    *   **Creating/Updating Products:**
        *   The API (`POST /api/products`, `PUT /api/products/:id`) should now expect `category_id` instead of a category name string in the request body.
        *   Update Zod validation schemas (`createProductSchema`) to reflect this change (`category: z.string()` -> `category_id: z.string().uuid()`).
        *   `productService.createProduct` and `productService.updateProduct` should use `category_id`.
    *   **Listing Products by Category (`GET /api/products/category/:category`):**
        *   This endpoint currently expects a category name. You have two options:
            1.  Change endpoint to `GET /api/products/category/:categoryId` and expect a UUID. (Recommended for consistency)
            2.  Keep `GET /api/products/category/:categoryName`, but in `productService`, first query the `categories` table to find the `id` for the given `categoryName`, then query products by that `id`.
        *   **If option 1 (recommended):**
            *   Endpoint: `GET /api/products/category/:categoryId`
            *   `productService.getProductsByCategoryId(categoryId)`
    *   **Fetching Product Details:**
        *   When fetching product details (`GET /api/products` or `GET /api/products/:id`), you might want to include the category name.
        *   Modify the SQL query in `productService` to `JOIN` with the `categories` table and select `categories.name AS category_name`.
            ```sql
            -- Example for getAllProducts in productService.js
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name;
            ```

4.  **Update Database View `product_sales`:**
    *   Modify the `product_sales` view to join with `categories` on `category_id` and use `categories.name`.
        ```sql
        CREATE OR REPLACE VIEW product_sales AS
        SELECT
          p.id,
          p.name,
          c.name as category, -- Use category name from categories table
          SUM(oi.quantity) as total_quantity,
          SUM(oi.quantity * oi.unit_price) as total_sales
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN categories c ON p.category_id = c.id -- Join with categories
        WHERE o.status = 'completed' -- Ensure o.status uses the new ENUM type after Part 2
        GROUP BY p.id, p.name, c.name;
        ```

**Part 2: Implement ENUM Types for Status Fields**

1.  **Define ENUM Types in SQL:**
    *   Identify fields that represent a fixed set of states (e.g., `orders.status`, `orders.payment_status`, `users.role`).
    *   Create ENUM types for them.
    *   **SQL Example for `orders.status`:**
        ```sql
        CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded');
        CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid', 'pending', 'failed', 'refunded');
        CREATE TYPE user_role_enum AS ENUM ('staff', 'manager', 'admin');
        -- etc. for other status fields
        ```

2.  **Alter Tables to Use ENUM Types:**
    *   Modify table definitions to use these new ENUM types.
    *   **SQL Example for `orders` table:**
        ```sql
        -- For a new table:
        -- CREATE TABLE orders (
        --   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        --   customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        --   total_amount DECIMAL(10, 2) NOT NULL,
        --   status order_status_enum NOT NULL DEFAULT 'pending',       -- Changed
        --   payment_method VARCHAR(50), -- Consider ENUM if fixed list
        --   payment_status payment_status_enum DEFAULT 'unpaid',   -- Changed
        --   notes TEXT,
        --   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        --   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        -- );

        -- If altering an existing table:
        ALTER TABLE orders
          ALTER COLUMN status TYPE order_status_enum USING status::order_status_enum,
          ALTER COLUMN payment_status TYPE payment_status_enum USING payment_status::payment_status_enum;
        -- Similar ALTER for users.role
        ```

3.  **Update Backend API and Zod Schemas:**
    *   Ensure API endpoints that accept or return these status fields handle the string values corresponding to the ENUMs.
    *   Update Zod schemas to use `z.enum()` for these fields.
    *   **Example Zod Schema for Order Update:**
        ```javascript
        // In your validation schemas
        const updateOrderStatusSchema = z.object({
          status: z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded']),
        });
        ```
    *   The database driver will handle the conversion between string values and the ENUM types.

4.  **Update Triggers and Functions:**
    *   Review `update_inventory_on_order_complete()` trigger. Ensure comparisons like `NEW.status = 'completed'` still work correctly with the ENUM type (they generally do, as PostgreSQL treats ENUMs like text in many contexts, but it's good to be aware).

**Verification:**
*   API endpoints for creating/updating products correctly handle `category_id` and return category names.
*   Listing products by category works with `categoryId` or correctly looks up the ID.
*   API endpoints involving status fields (e.g., updating order status) correctly validate against the defined ENUM values.
*   Database queries and views reflect these schema changes.

---

## Instruction File 3: Frontend API Client and React Query Enhancement

**Objective:** Refine the frontend data fetching layer by clearly defining the roles of `src/api` and `src/services` (if used), and standardizing the use of React Query for server state management.

**Context:**
*   `FRONTEND_STRUCTURE.md` mentions `src/api/`, `src/services/`, and React Query.
*   The goal is to ensure `src/api/` contains direct API call functions, and React Query hooks consume these. `src/services/` can be used for more complex frontend logic not directly tied to a single API call if needed, or can be minimized.

**Steps:**

1.  **Define Role of `src/api/`:**
    *   Ensure all files in `src/api/` (e.g., `src/api/productApi.ts`, `src/api/orderApi.ts`) strictly contain functions that make HTTP requests to the backend.
    *   These functions should:
        *   Use `fetch` or an HTTP client like `axios`.
        *   Take necessary parameters (IDs, filters, request bodies).
        *   Return a `Promise` that resolves with the parsed JSON response data or rejects with an error.
        *   Handle base URL configuration.
    *   **Example `src/api/productApi.ts`:**
        ```typescript
        // src/api/productApi.ts
        import { Product, ProductFilters } from '@/types'; // Assuming types are defined

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

        export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
          const queryParams = new URLSearchParams(filters as any).toString();
          const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
            throw new Error(errorData.message || 'Failed to fetch products');
          }
          return response.json();
        };

        export const getProductById = async (id: string): Promise<Product> => {
          const response = await fetch(`${API_BASE_URL}/products/${id}`);
          if (!response.ok) {
            // ... error handling ...
          }
          return response.json();
        };

        export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
          const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
          // ... error handling & response parsing ...
          return response.json();
        };
        // ... other API functions for products
        ```

2.  **Standardize React Query Hooks (`src/hooks/` or `src/queries/`):**
    *   Create a dedicated directory for React Query hooks if not already present (e.g., `src/queries/` or within `src/hooks/features/`).
    *   React Query hooks (`useQuery`, `useMutation`) should directly call functions from `src/api/`.
    *   **Example `src/queries/useProducts.ts`:**
        ```typescript
        // src/queries/useProducts.ts
        import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
        import * as productApi from '@/api/productApi'; // Import all from the API module
        import { Product, ProductFilters } from '@/types';

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

        export const useProduct = (id: string) => {
          return useQuery<Product, Error>({
            queryKey: productQueryKeys.detail(id),
            queryFn: () => productApi.getProductById(id),
            enabled: !!id, // Only run if id is available
          });
        };

        export const useCreateProduct = () => {
          const queryClient = useQueryClient();
          return useMutation<Product, Error, Partial<Product>>({
            mutationFn: productApi.createProduct,
            onSuccess: () => {
              // Invalidate and refetch products list after creation
              queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
            },
            // onError: (error) => { /* handle error, show toast */ }
          });
        };
        // ... other React Query hooks for products (update, delete)
        ```

3.  **Role of `src/services/` (Frontend):**
    *   If `src/services/` exists on the frontend, its role should be clearly defined:
        *   **Option A (Minimize/Remove):** If most logic can be handled by React Query (data transformation via `select` option, orchestrating mutations via `onSuccess` callbacks), then `src/services/` might become redundant or very thin.
        *   **Option B (Complex Client-Side Logic):** If there's complex client-side business logic that doesn't fit neatly into React Query hooks or involves multiple data sources/stores not solely from the backend API (e.g., complex calculations, interactions with browser APIs like localStorage AND API data), then services can encapsulate this.
    *   **Instruction:** Review existing frontend `src/services/`. If they are simple wrappers around API calls, refactor to use React Query hooks directly calling `src/api/` functions. If they contain significant client-side logic, ensure this logic is not just data fetching/caching, which React Query should handle.

4.  **Update Components to Use React Query Hooks:**
    *   Refactor page components (`src/pages/`) and feature components to use the new/standardized React Query hooks for data fetching and mutations.
    *   Remove any manual `useEffect` for fetching data that can be replaced by `useQuery`.
    *   **Example in `ProductsPage.tsx`:**
        ```tsx
        // src/pages/ProductsPage.tsx
        import React from 'react';
        import { useProducts, useCreateProduct } from '@/queries/useProducts'; // Adjust path
        // ... other imports

        const ProductsPage: React.FC = () => {
          const { data: products, isLoading, error } = useProducts({ /* initial filters */ });
          const createProductMutation = useCreateProduct();

          const handleCreateProduct = async (productData: /* type */) => {
            try {
              await createProductMutation.mutateAsync(productData);
              // Show success toast
            } catch (err) {
              // Show error toast
            }
          };

          if (isLoading) return <p>Loading products...</p>;
          if (error) return <p>Error fetching products: {error.message}</p>;

          return (
            <div>
              <h1>Products</h1>
              {/* Button to trigger form for handleCreateProduct */}
              <ul>
                {products?.map(product => <li key={product.id}>{product.name}</li>)}
              </ul>
            </div>
          );
        };

        export default ProductsPage;
        ```

**Verification:**
*   Data fetching is consistently handled by React Query hooks.
*   `src/api/` files contain only direct API call logic.
*   Frontend services (`src/services/`) have a clear, non-overlapping role or are minimized.
*   Components are cleaner, relying on hooks for server state.