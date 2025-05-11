#!/usr/bin/env bun
/**
 * Database Test Script
 * 
 * This script tests the connection to the PostgreSQL database for the Nexus Checkout System.
 * It performs a simple query to verify that the database is accessible.
 */

import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

// PostgreSQL configuration
const PG_HOST = process.env.VITE_PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.VITE_PG_PORT || '5432');
const PG_DATABASE = process.env.VITE_PG_DATABASE || 'nexus_checkout';
const PG_USER = process.env.VITE_PG_USER || 'postgres';
const PG_PASSWORD = process.env.VITE_PG_PASSWORD || 'postgres';

// Create a connection pool
const pool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
  max: 1, // Only need one client for testing
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test the database connection
 */
async function testConnection() {
  try {
    console.log(`Testing connection to PostgreSQL at ${PG_HOST}:${PG_PORT}/${PG_DATABASE}...`);
    
    // Test query
    const result = await pool.query('SELECT NOW() as current_time');
    
    console.log('Connection successful!');
    console.log(`Server time: ${result.rows[0].current_time}`);
    
    // Test table existence
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (tablesResult.rows.length > 0) {
        console.log('\nAvailable tables:');
        tablesResult.rows.forEach((row, index) => {
          console.log(`${index + 1}. ${row.table_name}`);
        });
      } else {
        console.log('\nNo tables found in the database.');
        console.log('Run "bun run db:migrate" to create tables.');
      }
    } catch (error) {
      console.error('Error checking tables:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  } finally {
    // Close the pool
    await pool.end();
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting database connection test...');
  
  // Test the connection
  const connectionSuccessful = await testConnection();
  
  if (connectionSuccessful) {
    console.log('\nDatabase connection test completed successfully.');
  } else {
    console.error('\nDatabase connection test failed.');
    process.exit(1);
  }
}

// Run the main function
main();
