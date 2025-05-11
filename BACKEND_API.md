# Nexus Checkout System - Backend API

## Overview

The backend of the Nexus Checkout System is built with Express.js and provides a RESTful API for the frontend to interact with the PostgreSQL database. The API handles authentication, data operations, and business logic.

## Server Structure

```
server/
├── index.js              # Main server entry point
├── middleware/           # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── error-handler.js  # Error handling middleware
│   └── rate-limit.js     # Rate limiting middleware
└── routes/               # API route handlers
    ├── auth.js           # Authentication routes
    ├── products.js       # Product management routes
    ├── customers.js      # Customer management routes
    ├── orders.js         # Order management routes
    └── analytics.js      # Analytics and reporting routes
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user info |
| PUT | `/api/auth/me` | Update user profile |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/products/barcode/:code` | Get product by barcode |
| GET | `/api/products/category/:category` | List products by category |
| GET | `/api/products/search` | Search products |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get customer details |
| POST | `/api/customers` | Create a new customer |
| PUT | `/api/customers/:id` | Update a customer |
| DELETE | `/api/customers/:id` | Delete a customer |
| GET | `/api/customers/search` | Search customers |
| GET | `/api/customers/:id/orders` | Get customer orders |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders` | Create a new order |
| PUT | `/api/orders/:id` | Update an order |
| DELETE | `/api/orders/:id` | Delete an order |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/:id/items` | Get order items |
| POST | `/api/orders/:id/items` | Add item to order |
| DELETE | `/api/orders/:id/items/:itemId` | Remove item from order |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/sales` | Get sales data |
| GET | `/api/analytics/revenue` | Get revenue data |
| GET | `/api/analytics/products` | Get product performance |
| GET | `/api/analytics/customers` | Get customer insights |
| GET | `/api/analytics/dashboard` | Get dashboard summary |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Token Generation**: When a user logs in, the server generates a JWT containing the user's ID and role
2. **Token Storage**: The token is stored in an HTTP-only cookie for security
3. **Token Verification**: Protected routes verify the token using middleware
4. **Token Refresh**: Long-lived sessions use a refresh token mechanism

Example authentication middleware:

```javascript
// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

## Error Handling

The API uses a centralized error handling middleware:

```javascript
// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Structured error response
  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    }
  });
};
```

## Rate Limiting

To prevent abuse, the API implements rate limiting:

```javascript
// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});
```

## Data Validation

Request data is validated using Zod schemas:

```javascript
// Example validation schema for creating a product
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  category: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  image_url: z.string().url().optional(),
});

// Validation middleware
const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: {
        message: 'Validation error',
        details: error.errors
      }
    });
  }
};
```

## Database Access

The API interacts with the PostgreSQL database using a client with connection pooling:

```javascript
// Example database query in a route handler
app.get('/api/products', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});
```

## Transactions

For operations that require multiple database changes, the API uses transactions:

```javascript
// Example transaction for creating an order with items
app.post('/api/orders', async (req, res, next) => {
  try {
    const { customer_id, items } = req.body;
    
    const result = await db.transaction(async (client) => {
      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (customer_id, total_amount) VALUES ($1, $2) RETURNING *',
        [customer_id, calculateTotal(items)]
      );
      
      const order = orderResult.rows[0];
      
      // Add order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [order.id, item.product_id, item.quantity, item.price]
        );
      }
      
      return order;
    });
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
```

## WebSockets

For real-time features, the API uses WebSockets:

```javascript
// WebSocket setup for real-time notifications
const setupWebSockets = (server) => {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
      console.log('Received:', message);
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  // Broadcast to all clients
  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
  
  return wss;
};
```

## Environment Configuration

The API uses environment variables for configuration:

```javascript
// Environment configuration
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '1d',
  dbConfig: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }
};
```
