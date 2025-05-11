#!/usr/bin/env bun
/**
 * Database Initialization Script
 *
 * This script initializes the PostgreSQL database for the Nexus Checkout System.
 * It creates the database if it doesn't exist.
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
 * Create the database if it doesn't exist
 */
async function createDatabase() {
  try {
    console.log(`Checking if database ${PG_DATABASE} exists...`);

    // Check if the database exists
    const checkDbCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -lqt | cut -d \\| -f 1 | grep -qw ${PG_DATABASE}`;

    try {
      await execAsync(checkDbCmd);
      console.log(`Database ${PG_DATABASE} already exists.`);
    } catch (error) {
      console.log(`Database ${PG_DATABASE} does not exist. Creating...`);

      // Create the database
      const createDbCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -c "CREATE DATABASE ${PG_DATABASE};"`;
      await execAsync(createDbCmd);

      console.log(`Database ${PG_DATABASE} created successfully.`);
    }

    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
}

/**
 * Create extensions
 */
async function createExtensions() {
  try {
    console.log('Creating extensions...');

    // Create a temporary file with the create extensions command
    const extensionsSQL = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `;
    const tempFile = path.join(__dirname, 'temp_create_extensions.sql');
    fs.writeFileSync(tempFile, extensionsSQL);

    // Run the create extensions command
    const extensionsCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
    const { stdout, stderr } = await execAsync(extensionsCmd);

    // Remove the temporary file
    fs.unlinkSync(tempFile);

    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error('Error creating extensions:', stderr);
      return false;
    }

    console.log('Extensions created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating extensions:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Initializing database...');

  // Create the database
  const dbCreated = await createDatabase();

  if (!dbCreated) {
    console.error('Database initialization failed.');
    process.exit(1);
  }

  // Create extensions
  const extensionsCreated = await createExtensions();

  if (!extensionsCreated) {
    console.error('Failed to create extensions.');
    process.exit(1);
  }

  console.log('Database initialization completed successfully.');
  console.log('You can now run "bun run db:migrate" to apply migrations.');
}

// Run the main function
main();
