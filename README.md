# Nexus Checkout System

![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

A modern checkout system with QR code payments, built with React, TypeScript, and PostgreSQL.

![Nexus Checkout System](public/favicon.svg)

## 🌟 Features

- **QR Code Payments**: Scan to pay functionality with multiple payment methods
- **Product Management**: Add, edit, and delete products with barcode scanning
- **Order Tracking**: Track orders and view order history
- **Analytics Dashboard**: View sales statistics and trends
- **Multi-language Support**: English and Vietnamese language options
- **Dark/Light Theme**: Toggle between dark and light modes
- **Mobile-optimized Interface**: Responsive design for all devices
- **Real-time Notifications**: WebSocket-based notification system

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: React Context API, TanStack Query
- **Routing**: React Router
- **Backend**: Express.js, PostgreSQL
- **Build Tool**: Vite
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun package manager - [install Bun](https://bun.sh/docs/installation)
- PostgreSQL (v15 or higher)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/nexus-checkout-system.git
   cd nexus-checkout-system
   ```

2. Install dependencies:
   ```sh
   bun install
   ```

3. Create a `.env` file in the root directory with your PostgreSQL credentials:
   ```
   VITE_PG_HOST=localhost
   VITE_PG_PORT=5432
   VITE_PG_DATABASE=nexus_checkout
   VITE_PG_USER=postgres
   VITE_PG_PASSWORD=postgres
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_APP_NAME=Nexus Checkout System
   VITE_APP_DESCRIPTION=A modern checkout system with QR code payments
   VITE_ENABLE_NOTIFICATIONS=true
   VITE_NOTIFICATION_REFRESH_INTERVAL=30000
   VITE_ENABLE_QR_PAYMENTS=true
   VITE_ENABLE_BARCODE_SCANNER=true
   ```

4. Set up the PostgreSQL database:
   ```sh
   # Initialize the database
   bun run db:init

   # Apply migrations
   bun run db:migrate

   # Import sample data
   bun run db:seed

   # Test the database connection
   bun run db:test
   ```

5. Start the API server and development server:
   ```sh
   # Start the API server
   bun run server

   # In a separate terminal, start the development server
   bun run dev

   # Or run both with a single command
   bun run dev:full
   ```

## 📱 Application Structure

- **Products**: Browse and manage products with barcode scanning
- **Cart**: Add products to cart and proceed to checkout
- **Checkout**: Complete orders with various payment methods
- **Scan to Pay**: QR code payment processing
- **Orders**: View and manage order history
- **Customers**: Customer management system
- **Analytics**: Sales statistics and trends

## 🗄️ Database Structure

The application uses PostgreSQL with the following structure:

- **Tables**:
  - `products`: Product information
  - `customers`: Customer information
  - `orders`: Order information
  - `order_items`: Items within orders
  - `users`: User authentication
  - `profiles`: User profiles

- **Views**:
  - `order_details`: Combined order items with product information
  - `customer_statistics`: Aggregated customer statistics

- **Functions**:
  - `get_server_time`: Current server time
  - `get_top_products`: Top-selling products
  - `update_updated_at_column`: Trigger function for timestamps

## 🌐 Deployment

### GitHub Pages

This project is configured to deploy to GitHub Pages using GitHub Actions:

1. In your GitHub repository, go to Settings > Pages
2. Set the source to "GitHub Actions"
3. Push to the main branch to trigger a deployment

### Environment Variables for Production

Make sure to set the following secrets in your GitHub repository:

- `VITE_PG_HOST`: Your PostgreSQL host
- `VITE_PG_PORT`: Your PostgreSQL port
- `VITE_PG_DATABASE`: Your PostgreSQL database name
- `VITE_PG_USER`: Your PostgreSQL username
- `VITE_PG_PASSWORD`: Your PostgreSQL password

### Manual Deployment

To build the project for production:

```sh
   bun run build
```

The built files will be in the `dist` directory, which you can deploy to any static hosting service.

## 📚 Documentation

Additional documentation is available in the `docs` directory:

- [PostgreSQL Setup Guide](docs/postgres-setup.md)
- [Database Schema](docs/database-schema.md)