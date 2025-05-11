# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the Nexus Checkout System.

## Prerequisites

- PostgreSQL 15 or higher installed on your system
- Basic knowledge of PostgreSQL commands

## Installation

### macOS

Using Homebrew:

```sh
brew install postgresql@15
brew services start postgresql@15
```

### Windows

1. Download the installer from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the instructions
3. Remember the password you set for the `postgres` user

### Linux (Ubuntu/Debian)

```sh
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Database Setup

### 1. Create a Database

You can create the database manually or use our automated script:

#### Using the Automated Script

```sh
bun run db:init
```

#### Manual Setup

```sh
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE nexus_checkout;

# Connect to the new database
\c nexus_checkout

# Exit psql
\q
```

### 2. Apply Migrations

Apply the database schema migrations:

```sh
bun run db:migrate
```

This will create all necessary tables, views, and functions.

### 3. Seed the Database

Populate the database with sample data:

```sh
bun run db:seed
```

### 4. Test the Connection

Verify that the database is set up correctly:

```sh
bun run db:test
```

## Environment Configuration

Make sure your `.env` file contains the correct PostgreSQL connection details:

```
VITE_PG_HOST=localhost
VITE_PG_PORT=5432
VITE_PG_DATABASE=nexus_checkout
VITE_PG_USER=postgres
VITE_PG_PASSWORD=your_password
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify that PostgreSQL is running:
   ```sh
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   
   # Windows
   services.msc (check PostgreSQL service)
   ```

2. Check your PostgreSQL configuration:
   ```sh
   # Location of pg_hba.conf
   # macOS: /usr/local/var/postgres/pg_hba.conf
   # Linux: /etc/postgresql/15/main/pg_hba.conf
   # Windows: C:\Program Files\PostgreSQL\15\data\pg_hba.conf
   ```

3. Ensure your user has the correct permissions:
   ```sql
   -- Connect as postgres user
   psql -U postgres
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE nexus_checkout TO postgres;
   ```

### Reset Database

If you need to reset the database:

```sh
bun run db:reset
```

This will drop all tables and reapply migrations and seed data.

## Manual Database Operations

### Connect to the Database

```sh
psql -U postgres -d nexus_checkout
```

### Useful psql Commands

- `\dt`: List all tables
- `\d table_name`: Describe a table
- `\dv`: List all views
- `\df`: List all functions
- `\q`: Quit psql

## Next Steps

After setting up the database, you can start the application:

```sh
bun run dev
```
