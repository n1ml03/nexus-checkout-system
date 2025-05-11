#!/usr/bin/env bun
/**
 * Database Reset Script
 * 
 * This script resets the PostgreSQL database for the Nexus Checkout System.
 * It drops all tables and reapplies migrations and seed data.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL configuration
const PG_HOST = process.env.VITE_PG_HOST || 'localhost';
const PG_PORT = process.env.VITE_PG_PORT || '5432';
const PG_DATABASE = process.env.VITE_PG_DATABASE || 'nexus_checkout';
const PG_USER = process.env.VITE_PG_USER || 'postgres';
const PG_PASSWORD = process.env.VITE_PG_PASSWORD || 'postgres';

// Promisify exec
const execAsync = promisify(exec);

/**
 * Reset the database
 */
async function resetDatabase() {
  try {
    console.log(`Resetting database ${PG_DATABASE}...`);
    
    // Drop all tables
    const dropTablesSQL = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;
    
    // Create a temporary file with the SQL
    const tempFile = path.join(__dirname, 'temp_drop_tables.sql');
    fs.writeFileSync(tempFile, dropTablesSQL);
    
    // Execute the SQL
    const dropTablesCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
    await execAsync(dropTablesCmd);
    
    // Remove the temporary file
    fs.unlinkSync(tempFile);
    
    console.log('All tables dropped successfully.');
    
    // Apply migrations
    console.log('Applying migrations...');
    await execAsync(`bun run db:migrate`);
    
    // Apply seed data
    console.log('Applying seed data...');
    await execAsync(`bun run db:seed`);
    
    console.log('Database reset completed successfully.');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting database reset...');
  
  // Reset the database
  const databaseReset = await resetDatabase();
  
  if (databaseReset) {
    console.log('Database reset completed successfully.');
  } else {
    console.error('Database reset failed.');
    process.exit(1);
  }
}

// Run the main function
main();
